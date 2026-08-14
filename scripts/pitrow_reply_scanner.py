#!/usr/bin/env python3
"""
Pit Row Miami — Dealership Reply Scanner
Checks Gmail for replies to the dealership outreach emails and flags them.

Replies to info@pitrowmiami.com land in the Gmail inbox (akennedy@theonegroup.info)
since that's the account the sends come from. This scanner:
  1. Finds replies to dealership outreach emails
  2. Classifies them (positive / booking / question / opt-out / other)
  3. Marks the lead as replied in the pipeline state
  4. Outputs a summary for action

Usage:
  python3 scripts/pitrow_reply_scanner.py            # scan and report
  python3 scripts/pitrow_reply_scanner.py --mark     # scan + update pipeline state
"""
import os, sys, json, re, argparse, datetime
from pathlib import Path

WORKSPACE = Path(os.path.expanduser("~/.openclaw/workspace"))
STATE_FILE = WORKSPACE / "data" / "pitrow_outreach_state.json"
REPLIES_FILE = WORKSPACE / "data" / "pitrow_replies.json"

# Gmail query to find replies to dealership outreach
# We look for replies to our sent emails (from info@pitrowmiami.com)
GMAIL_QUERY = "in:inbox newer_than:7d (from:gmail.com OR from:autonation.com OR from:lithia.com OR from:holman.com OR from:thecollection.com OR from:loubachrodt.com OR from:ducatimiami.com OR from:headquarterauto.com OR from:czag.net OR from:vtpgo.com OR from:superstoreauto.com OR from:superstore.com OR from:advantagegolfcars.com OR from:volvocarsnorthmiami.com OR from:allroads.com OR from:browardmotorsports.com OR from:griecocars.com OR from:bomnin.com OR from:doralautogroup.com OR from:gmail.com)"

# Keywords for classification
POSITIVE = ["interested", "book", "quote", "pricing", "price", "available", "dates", "schedule", "let's talk", "lets talk", "call me", "send over", "yes", "sounds good", "great", "love to", "want to"]
BOOKING = ["book", "reserve", "reservation", "date", "calendar", "schedule", "confirm", "deposit", "contract"]
OPTOUT = ["unsubscribe", "not interested", "remove", "stop", "no thanks", "don't contact", "leave me alone", "opt out", "spam"]


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"leads": {}}


def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))


def load_replies():
    if REPLIES_FILE.exists():
        return json.loads(REPLIES_FILE.read_text())
    return {"replies": [], "last_scan": None}


def save_replies(data):
    REPLIES_FILE.write_text(json.dumps(data, indent=2))


def classify(subject, body):
    text = f"{subject} {body}".lower()
    if any(k in text for k in OPTOUT):
        return "opt_out"
    if any(k in text for k in BOOKING):
        return "booking"
    if any(k in text for k in POSITIVE):
        return "positive"
    return "other"


def fetch_gmail_replies():
    """Fetch replies via the open-connector Gmail action."""
    # This uses the open-connector gmail.fetch_emails action
    # Returns list of {id, from, subject, snippet, date}
    try:
        import urllib.request
        # The connector runs on localhost:3000
        req = urllib.request.Request(
            "http://localhost:3000/v1/actions/gmail.fetch_emails",
            data=json.dumps({"input": {"query": GMAIL_QUERY, "detail": "summary", "maxResults": 20}}).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            return data.get("output", {}).get("emails", []) or data.get("emails", [])
    except Exception as e:
        print(f"  ⚠️ Could not fetch Gmail: {e}")
        return []


def scan(mark=False):
    state = load_state()
    replies_data = load_replies()
    leads = state["leads"]

    print("=== Pit Row Dealership Reply Scanner ===")
    print(f"Leads tracked: {len(leads)}")
    print()

    emails = fetch_gmail_replies()
    if not emails:
        print("No replies found in the scan window.")
        return

    print(f"Found {len(emails)} candidate replies. Classifying...")
    print()

    new_replies = 0
    for em in emails:
        sender = em.get("from", "")
        subject = em.get("subject", "")
        snippet = em.get("snippet", "")
        msg_id = em.get("id", "")

        # Extract sender email
        m = re.search(r"[\w.+-]+@[\w-]+\.[\w.]+", sender)
        sender_email = m.group(0).lower() if m else sender.lower()

        # Check if this sender is in our leads
        if sender_email not in leads:
            continue

        # Check if we've already seen this reply
        if any(r.get("id") == msg_id for r in replies_data["replies"]):
            continue

        category = classify(subject, snippet)
        lead = leads[sender_email]

        reply = {
            "id": msg_id,
            "from": sender,
            "email": sender_email,
            "dealership": lead.get("name"),
            "subject": subject,
            "snippet": snippet,
            "category": category,
            "date": em.get("date", ""),
        }
        replies_data["replies"].append(reply)
        new_replies += 1

        if mark:
            lead["replied"] = True
            lead["reply_category"] = category

        print(f"  {'🔴' if category=='booking' else '🟢' if category=='positive' else '⚪'} [{category}] {lead.get('name','?')}")
        print(f"     From: {sender}")
        print(f"     Subject: {subject}")
        print(f"     Snippet: {snippet[:120]}")
        print()

    replies_data["last_scan"] = datetime.datetime.now().isoformat()
    save_replies(replies_data)
    if mark:
        save_state(state)

    print(f"New replies: {new_replies}")
    if new_replies:
        print("\nACTION NEEDED: Reply to these from info@pitrowmiami.com.")
        print("  - booking/positive: respond promptly, offer dates, send proposal")
        print("  - opt_out: mark as opted out, do not contact again")
        print("  - To send a reply: python3 scripts/pitrow_reply_sender.py --to <email> --body \"<text>\" --send")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--mark", action="store_true", help="Update pipeline state (mark leads as replied)")
    args = ap.parse_args()
    scan(mark=args.mark)
