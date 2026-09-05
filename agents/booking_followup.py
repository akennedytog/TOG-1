#!/usr/bin/env python3
"""
Booking Follow-up Drafts — turns booking-intent leads into scheduled calls.

WHY: The reply scanner flags positive/booking replies into the booking queue
(data/booking_queue.json). This module turns each pending lead into a Gmail
DRAFT follow-up that (a) acknowledges their interest and (b) sends the right
scheduling link. It NEVER sends — Alec reviews every draft, matching Iris's
"drafts only" rule.

Flow:
  1. Read pending booking-intent leads from the queue.
  2. For each, build a short, on-brand follow-up reply with the booking link.
  3. Create a Gmail draft via the local open-connector.
  4. Mark the queue entry 'contacted' (so it isn't re-drafted).

Usage:
  python3 agents/booking_followup.py            # draft follow-ups for all pending
  python3 agents/booking_followup.py --dry-run  # show what would be drafted
  python3 agents/booking_followup.py --email x@y.com  # one specific lead

Requires: open-connector on localhost:3000 with gmail configured.
"""
import argparse, json, sys, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
QUEUE_FILE = WS / "data/booking_queue.json"
API = "http://127.0.0.1:3000/v1/actions/"

SIGNATURE = (
    "\n\n--\nAlec Kennedy | The One Group.AI\n"
    "Founder | CEO | (c) 502.403.7201 | akennedy@theonegroup.info"
)


def _load_queue():
    if QUEUE_FILE.exists():
        try:
            return json.load(open(QUEUE_FILE))
        except Exception:
            return {"queue": []}
    return {"queue": []}


def _save_queue(d):
    json.dump(d, open(QUEUE_FILE, "w"), indent=2)


def _first_name(name):
    return (name or "").strip().split()[0] if (name or "").strip() else "there"


def build_followup(entry):
    """Compose the follow-up reply body for a booking-intent lead."""
    name = _first_name(entry.get("name"))
    company = entry.get("company") or ""
    link = entry.get("booking_link") or "https://calendly.com/akennedy-theonegroup/ai-agent-workshop"
    biz = entry.get("business", "tog")

    if biz == "pitrow":
        body = (
            f"Hi {name}, thanks for reaching out{' at ' + company if company else ''} — "
            "glad the F1 sim caught your eye. We'd love to get you behind the wheel.\n\n"
            "You can see our setup and book a slot right here:\n"
            f"{link}\n\n"
            "We deliver, set up, and run it — you just bring the people. "
            "Happy to answer any questions or lock in a date."
        )
    else:
        body = (
            f"Hi {name}, thanks for the reply{' at ' + company if company else ''} — "
            "glad the AI angle landed. Let's get you on a quick call to see what's worth "
            "automating and what it'd save you.\n\n"
            "Grab a time that works here:\n"
            f"{link}\n\n"
            "No pitch, no pressure — just a straight read on whether AI makes sense for you."
        )
    return body + SIGNATURE


def create_draft(to, subject, body, attempts=3):
    payload = {"input": {"to": to, "subject": subject, "body": body}}
    req = urllib.request.Request(API + "gmail.create_draft",
                                 data=json.dumps(payload).encode(),
                                 headers={"content-type": "application/json"})
    for i in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                resp = json.load(r)
                if resp.get("success"):
                    return True
                print(f"  ❌ draft failed for {to}: {resp}")
                return False
        except Exception as e:
            if i < attempts - 1:
                wait = 2 ** i
                print(f"  ⚠️ retry {i+1}/{attempts} after {wait}s – {e}")
                time.sleep(wait)
            else:
                print(f"  ❌ final failure for {to}: {e}")
                return False
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--email", default="")
    args = ap.parse_args()

    d = _load_queue()
    pending = [e for e in d["queue"] if e.get("status") == "pending"]
    if args.email:
        pending = [e for e in pending if (e.get("email") or "").lower() == args.email.lower()]

    if not pending:
        print("No pending booking-intent leads to draft.")
        return

    print(f"Drafting follow-ups for {len(pending)} booking-intent lead(s)...")
    for e in pending:
        to = e.get("email", "")
        if not to:
            print(f"  ⚠️ skip {e.get('name')} — no email")
            continue
        subject = "Re: your note — let's get you on the calendar"
        body = build_followup(e)
        print(f"  ✉️ {e.get('name')} <{to}> ({e.get('business')})")
        if args.dry_run:
            print(f"     subject: {subject}")
            print(f"     link: {e.get('booking_link')}")
            continue
        ok = create_draft(to, subject, body)
        if ok:
            e["status"] = "contacted"
            e["contacted_at"] = datetime.now(timezone.utc).isoformat()
            print(f"     ✅ draft created -> {subject}")
        else:
            print(f"     ❌ could not create draft")

    if not args.dry_run:
        _save_queue(d)
        print("Queue updated.")


if __name__ == "__main__":
    main()
