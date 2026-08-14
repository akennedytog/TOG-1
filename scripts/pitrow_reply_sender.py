#!/usr/bin/env python3
"""
Pit Row Miami — Dealership Reply Sender
Sends a reply from info@pitrowmiami.com (via Resend) to a dealership that
replied to the outreach sequence.

This is the companion to pitrow_reply_scanner.py. When a dealership replies,
Alec approves the wording, then this script sends the response from the Pit Row
address so the whole thread stays consistent.

SAFETY: This script NEVER sends unless --send is passed. Default is DRY-RUN
(preview only). Set PITROW_SEND=1 or pass --send to actually send.

Usage:
  python3 scripts/pitrow_reply_sender.py --to <email> --body "<reply text>" [--subject "Re: ..."]
  python3 scripts/pitrow_reply_sender.py --to <email> --body "<reply text>" --send
  python3 scripts/pitrow_reply_sender.py --to <email> --body "<reply text>" --send --attach-sell-sheet
"""
import os, sys, json, argparse, datetime
from pathlib import Path

WORKSPACE = Path(os.path.expanduser("~/.openclaw/workspace"))
STATE_FILE = WORKSPACE / "data" / "pitrow_outreach_state.json"
REPLIES_FILE = WORKSPACE / "data" / "pitrow_replies.json"
SELL_SHEET = WORKSPACE / "out" / "pitrow-sell-sheet.pdf"

FROM_NAME = "Pit Row Miami"
FROM_EMAIL = "info@pitrowmiami.com"
SIGNATURE = "Alec Kennedy\nPit Row Miami | info@pitrowmiami.com | (954) 800-2162\npitrowmiami.com"

# Default reply subject (keeps thread together)
DEFAULT_SUBJECT = "Re: Turn your showroom into a race weekend"


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"leads": {}}


def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))


def load_replies():
    if REPLIES_FILE.exists():
        return json.loads(REPLIES_FILE.read_text())
    return {"replies": []}


def save_replies(data):
    REPLIES_FILE.write_text(json.dumps(data, indent=2))


def get_resend_key():
    key = os.environ.get("RESEND_API_KEY")
    if not key:
        env_file = Path(os.path.expanduser("~/.openclaw/.env"))
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.startswith("RESEND_API_KEY="):
                    key = line.split("=", 1)[1].strip()
    return key


def send_email(to, subject, body, attach=False):
    """Send via Resend. Returns (ok, id_or_error)."""
    key = get_resend_key()
    if not key:
        return False, "no RESEND_API_KEY"

    import urllib.request
    payload = {
        "from": f"{FROM_NAME} <{FROM_EMAIL}>",
        "to": [to],
        "subject": subject,
        "text": body,
    }
    if attach and SELL_SHEET.exists():
        import base64
        payload["attachments"] = [{
            "filename": "pitrow-sell-sheet.pdf",
            "content": base64.b64encode(SELL_SHEET.read_bytes()).decode(),
        }]

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            # Cloudflare blocks urllib's default UA (HTTP 403 / error 1010).
            # A browser-like UA is required for api.resend.com.
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            return True, data.get("id", "sent")
    except Exception as e:
        return False, str(e)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--to", required=True, help="Dealership reply-to email address")
    ap.add_argument("--body", required=True, help="Reply body text (plain text)")
    ap.add_argument("--subject", default=DEFAULT_SUBJECT, help="Reply subject line")
    ap.add_argument("--send", action="store_true", help="Actually send (default is dry-run preview)")
    ap.add_argument("--attach-sell-sheet", action="store_true", help="Attach the sell sheet PDF")
    args = ap.parse_args()

    to = args.to.lower()
    body = args.body.strip()
    if not body:
        print("Error: --body is empty.")
        return

    # Append signature if not already present
    if SIGNATURE.split("\n")[0] not in body:
        body = body.rstrip() + "\n\n" + SIGNATURE

    print("=== Pit Row Reply Sender (DRY-RUN unless --send) ===")
    print(f"  To:      {to}")
    print(f"  From:    {FROM_NAME} <{FROM_EMAIL}>")
    print(f"  Subject: {args.subject}")
    print(f"  Attach:  {'sell sheet' if args.attach_sell_sheet else 'none'}")
    print()
    print("--- BODY ---")
    print(body)
    print("--- END BODY ---")
    print()

    if not args.send:
        print("DRY-RUN: not sent. Re-run with --send to actually send.")
        return

    ok, result = send_email(to, args.subject, body, attach=args.attach_sell_sheet)
    if ok:
        print(f"✅ Sent to {to} (Resend id: {result})")
        # Record the reply-sent in replies file + mark lead replied
        state = load_state()
        if to in state["leads"]:
            state["leads"][to]["replied"] = True
            state["leads"][to]["reply_sent"] = True
            state["leads"][to]["reply_sent_date"] = datetime.date.today().isoformat()
            save_state(state)
        replies = load_replies()
        replies["replies"].append({
            "direction": "out",
            "to": to,
            "subject": args.subject,
            "body": body,
            "date": datetime.datetime.now().isoformat(),
            "resend_id": result,
        })
        save_replies(replies)
        print("Recorded in pipeline state + replies log.")
    else:
        print(f"❌ Send failed: {result}")


if __name__ == "__main__":
    main()
