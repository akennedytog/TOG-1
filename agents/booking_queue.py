#!/usr/bin/env python3
"""
Booking Queue — turns hot replies into booked calls.

WHY: The reply scanner classifies replies (reply/positive/booking) but nothing
acts on a positive/booking reply — the lead goes stale as 'replied' and the
revenue moment is lost. This module:
  1. Flags a lead with booking intent + the reply text.
  2. Appends it to a booking queue (data/booking_queue.json) that Alec/Iris can
     act on — the queue is the single source of truth for "who wants to talk."
  3. Attaches the right scheduling link (TOG -> Calendly, Pit Row -> site).

Called by scan_replies.py when a reply classifies as positive/booking.

Files:
  - data/booking_queue.json : pending booking-intent leads (newest first)
"""
import json
from datetime import datetime, timezone
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
QUEUE_FILE = WS / "data/booking_queue.json"

# Scheduling link per business. TOG uses Calendly; Pit Row directs to its site.
BOOKING_LINKS = {
    "tog": "https://calendly.com/akennedy-theonegroup/ai-agent-workshop",
    "pitrow": "https://pitrowmiami.com",
}


def _load():
    if QUEUE_FILE.exists():
        try:
            return json.load(open(QUEUE_FILE))
        except Exception:
            return {"queue": []}
    return {"queue": []}


def _save(d):
    json.dump(d, open(QUEUE_FILE, "w"), indent=2)


def _business_for(lead):
    """Pick the scheduling link based on the lead's context."""
    name = (lead.get("name") or "").lower()
    company = (lead.get("company") or "").lower()
    notes = (lead.get("notes") or "").lower()
    blob = f"{name} {company} {notes}"
    if "pit row" in blob or "pitrow" in blob:
        return "pitrow"
    return "tog"


def enqueue_booking(lead, outcome, detail=""):
    """Record a booking-intent lead. Returns the queue entry (or None if dup)."""
    d = _load()
    email = (lead.get("email") or "").lower()
    # dedupe: don't re-add the same lead+outcome
    for e in d["queue"]:
        if e.get("email", "").lower() == email and e.get("outcome") == outcome:
            return None
    biz = _business_for(lead)
    entry = {
        "email": email,
        "name": lead.get("name", ""),
        "company": lead.get("company", ""),
        "outcome": outcome,          # positive | booking
        "detail": detail[:300],      # the reply subject/text
        "booking_link": BOOKING_LINKS[biz],
        "business": biz,
        "flagged_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending",         # pending -> contacted -> booked
    }
    d["queue"].insert(0, entry)      # newest first
    _save(d)
    return entry


def pending_count():
    d = _load()
    return sum(1 for e in d["queue"] if e.get("status") == "pending")


def list_pending():
    d = _load()
    return [e for e in d["queue"] if e.get("status") == "pending"]


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        for e in list_pending():
            print(f"[{e['outcome']}] {e['name']} <{e['email']}> "
                  f"({e['business']}) -> {e['booking_link']}")
            if e.get("detail"):
                print(f"    reply: {e['detail']}")
        print(f"\n{len(list_pending())} pending booking-intent lead(s).")
