#!/usr/bin/env python3
"""
Twitter Stall Guard — standalone check.
Reads state.json + twitter_post.log. If no tweet has been posted in the last
26 hours, sends a WhatsApp alert to Alec. Otherwise stays silent (prints NO_REPLY).

Replaces the old agentTurn cron job (which kept timing out on the model call).
"""
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
CONNECTOR = "http://127.0.0.1:3000/v1/actions"
OWNER_NUMBER = "+15024037201"  # Alec — business WhatsApp target
ASSISTANT_NUMBER = "+17543509490"
STALL_HOURS = 26

STATE_FILE = WS / "state.json"
POST_LOG = WS / "logs" / "twitter_post.log"


def call_action(action, payload):
    req = urllib.request.Request(
        f"{CONNECTOR}/{action}",
        data=json.dumps(payload).encode(),
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def send_whatsapp(body):
    payload = {"to": OWNER_NUMBER, "from": ASSISTANT_NUMBER, "body": body}
    try:
        result = call_action("twilio.send_message", payload)
        ok = result.get("success") or result.get("ok")
        print(f"[stall-guard] whatsapp sent: {ok}")
        return bool(ok)
    except Exception as e:
        print(f"[stall-guard] whatsapp error: {e}", file=sys.stderr)
        return False


def last_post_time():
    """Return the most recent postedAt from state.json postedLog, else None."""
    try:
        d = json.loads(STATE_FILE.read_text())
        log = d.get("postedLog") or []
        if not log:
            return None
        # postedAt is ISO; find the max
        times = []
        for entry in log:
            ts = entry.get("postedAt")
            if ts:
                try:
                    times.append(datetime.fromisoformat(ts))
                except ValueError:
                    pass
        return max(times) if times else None
    except Exception as e:
        print(f"[stall-guard] state read error: {e}", file=sys.stderr)
        return None


def main():
    dry_run = "--dry-run" in sys.argv
    last = last_post_time()
    now = datetime.now(timezone.utc)

    if last is None:
        print("[stall-guard] no postedLog entries found — cannot determine stall state")
        print("NO_REPLY")
        return

    # Normalize: if last is naive, assume UTC
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)

    hours = (now - last).total_seconds() / 3600
    print(f"[stall-guard] last post {last.isoformat()} ({hours:.1f}h ago)")

    if hours <= STALL_HOURS:
        print(f"twitter healthy, last post {last.isoformat()}")
        print("NO_REPLY")
        return

    # Stalled — alert
    msg = (
        f"⚠️ Twitter stall: no tweet posted in {STALL_HOURS}h "
        f"(last {last.strftime('%m-%d %H:%M')}Z). "
        f"Check the pipeline (queue empty, supercharged refill, or posting failure)."
    )
    print(msg)
    if not dry_run:
        send_whatsapp(msg)


if __name__ == "__main__":
    main()
