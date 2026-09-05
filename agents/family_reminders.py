#!/usr/bin/env python3
"""
Family Assistant — Reminder Engine

Checks the primary Google Calendar for events starting within the next N minutes
and sends an SMS reminder to the owner. Designed to run on a cron every 15 min.

NOTE: Google Tasks due dates are DATE-ONLY (midnight), not time-based, so tasks
are handled by the daily task digest in family_assistant.py (morning briefing),
not by this time-based reminder engine.

RUN:  python3 agents/family_reminders.py [--dry-run]
Cron: every 15 minutes (e.g. */15 * * * *)

Requires: open-connector on localhost:3000 with googlecalendar + twilio configured.
"""
import json
import sys
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
CONNECTOR = "http://127.0.0.1:3000/v1/actions"

ASSISTANT_NUMBER = "+17543509490"
OWNER_NUMBER = "+18472801393"   # Allison (wife) — family SMS target
LOOKAHEAD_MINUTES = 30   # remind about events starting within the next 30 min
STATE_FILE = WS / "data" / "family_reminders_state.json"

def call_action(action_id, payload):
    req = urllib.request.Request(
        CONNECTOR + "/" + action_id,
        data=json.dumps({"input": payload}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"sent": {}}

def save_state(state):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2))

def get_upcoming_events():
    """Fetch calendar events starting within the lookahead window."""
    now = datetime.now(timezone.utc)
    time_max = (now + timedelta(minutes=LOOKAHEAD_MINUTES)).isoformat()
    payload = {
        "calendarId": "primary",
        "timeMin": now.isoformat(),
        "timeMax": time_max,
        "singleEvents": True,
        "orderBy": "startTime",
        "maxResults": 20,
    }
    try:
        result = call_action("googlecalendar.list_events", payload)
        items = result.get("data", {}).get("items", [])
        events = []
        for it in items:
            summary = it.get("summary", "Untitled event")
            start = it.get("start", {}).get("dateTime") or it.get("start", {}).get("date", "")
            event_id = it.get("id", "")
            events.append({"title": summary, "start": start, "id": event_id})
        return events
    except Exception as e:
        print(f"[events] error: {e}", file=sys.stderr)
        return []

def send_sms(body, dry_run=False):
    if dry_run:
        print("=== DRY RUN — would send SMS ===")
        print(body)
        return True
    payload = {"to": OWNER_NUMBER, "from": ASSISTANT_NUMBER, "body": body}
    try:
        result = call_action("twilio.send_message", payload)
        ok = result.get("success") or result.get("ok")
        print(f"[sms] sent: {ok}")
        return bool(ok)
    except Exception as e:
        print(f"[sms] error: {e}", file=sys.stderr)
        return False

def main():
    dry_run = "--dry-run" in sys.argv
    state = load_state()
    events = get_upcoming_events()

    if not events:
        print("[reminders] no events starting in window")
        return

    # Only remind about events we haven't already pinged for.
    new_events = [e for e in events if e["id"] not in state["sent"]]
    if not new_events:
        print("[reminders] all upcoming events already reminded")
        return

    lines = ["⏰ Upcoming:"]
    for e in new_events:
        time_str = ""
        if e["start"]:
            try:
                dt = datetime.fromisoformat(e["start"].replace("Z", "+00:00"))
                time_str = " at " + dt.astimezone().strftime("%-I:%M %p")
            except Exception:
                pass
        lines.append(f"  • {e['title']}{time_str}")
    body = "\n".join(lines)

    if send_sms(body, dry_run=dry_run):
        for e in new_events:
            state["sent"][e["id"]] = datetime.now(timezone.utc).isoformat()
        save_state(state)
        print(f"[reminders] sent {len(new_events)} reminder(s)")

if __name__ == "__main__":
    main()
