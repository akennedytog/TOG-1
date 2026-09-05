#!/usr/bin/env python3
"""
Family Assistant — Phase 4: Forward-email → Calendar

When you forward a school/event email to a specific Gmail address (or tag it
with the "📅 Assistant" label), this script extracts the event details
(title + date + time) from the email body and creates a Google Calendar event
on the primary calendar (akennedy@theonegroup.info), then removes the label
so the same email isn't processed twice.

HOW IT WORKS (setup, once):
  1. Create a Gmail label named "📅 Assistant" (or run --setup-label).
  2. In Gmail, create a Filter: From: anyone you want, OR just forward emails
     manually and apply the label. Optional: set a filter that auto-labels
     emails addressed to a dedicated address (e.g. assistant@theonegroup.info).
  3. Run this script on a schedule (cron every ~15 min):
        python3 agents/family_email_to_calendar.py
  4. It scans the label for unprocessed emails, parses each, creates a
     calendar event, sends an SMS confirmation, and unlabels the email.

Parsing is intentionally pragmatic (regex for common date/time formats) since
forwarded emails vary wildly. If a date can't be determined, the event is
skipped (not deleted) so you can handle it manually.

USAGE:
  python3 agents/family_email_to_calendar.py [--dry-run] [--setup-label] [--label NAME]

Requires: open-connector on localhost:3000 with gmail + googlecalendar + twilio.
"""
import json
import os
import re
import sys
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
CONNECTOR = "http://127.0.0.1:3000/v1/actions"

LABEL_NAME = "📅 Assistant"
OWNER_NUMBER = "+18472801393"   # Allison (wife) — family SMS target
ASSISTANT_NUMBER = "+17543509490"
TIMEZONE = "America/New_York"
DRY_RUN = "--dry-run" in sys.argv

# ---- Connector helper ------------------------------------------------------
def call_action(action_id, payload):
    body = {"input": payload}
    req = urllib.request.Request(
        CONNECTOR + "/" + action_id,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ---- Gmail label handling --------------------------------------------------
def get_label_id(name):
    """Find a Gmail label by name; return its ID or None."""
    try:
        res = call_action("gmail.list_labels", {})
        for lab in res.get("data", {}).get("labels", []):
            if lab.get("name") == name:
                return lab.get("id")
    except Exception as e:
        print(f"[gmail] list_labels error: {e}", file=sys.stderr)
    return None


def setup_label(name):
    """Create the label if it doesn't exist. Returns label ID."""
    existing = get_label_id(name)
    if existing:
        print(f"Label '{name}' already exists (id={existing})")
        return existing
    try:
        res = call_action("gmail.create_label", {"name": name})
        lid = res.get("data", {}).get("id")
        print(f"Created label '{name}' (id={lid})")
        return lid
    except Exception as e:
        print(f"[gmail] create_label error: {e}", file=sys.stderr)
        return None


def fetch_labeled_messages(label_id):
    """Return message summaries carrying the given label."""
    try:
        res = call_action("gmail.fetch_emails", {
            "labelIds": [label_id],
            "maxResults": 25,
            "detail": "summary",
        })
        return res.get("data", {}).get("messages", [])
    except Exception as e:
        print(f"[gmail] fetch_emails error: {e}", file=sys.stderr)
        return []


def fetch_message_full(message_id):
    """Fetch full message for a message id. Returns the connector data dict."""
    try:
        res = call_action("gmail.fetch_message_by_message_id", {
            "messageId": message_id,
            "format": "full",
        })
        return res.get("data", {})
    except Exception as e:
        print(f"[gmail] fetch_message error: {e}", file=sys.stderr)
        return {}


def remove_label(message_id, label_id):
    if DRY_RUN:
        return
    try:
        call_action("gmail.add_label_to_email", {
            "messageId": message_id,
            "removeLabelIds": [label_id],
        })
    except Exception as e:
        print(f"[gmail] remove_label error: {e}", file=sys.stderr)


# ---- Date/time parsing -----------------------------------------------------
MONTHS = {m: i + 1 for i, m in enumerate([
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
])}


def parse_date_time(text):
    """Best-effort extraction of (year, month, day, hour, minute) from text.
    Returns None if a date can't be determined. Time defaults to None (all-day)
    unless a time is found.
    """
    low = " " + text.lower() + " "
    now = datetime.now()
    year = now.year
    month = day = None
    hour = minute = None

    # Month name + day: e.g. "August 21", "aug 21st", "Sep 5, 2026"
    m = re.search(
        r"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+"
        r"(\d{1,2})(?:st|nd|rd|th)?(?:[,.\s]+(\d{4}))?",
        low,
    )
    if m:
        month = MONTHS[m.group(1)[:3]]
        day = int(m.group(2))
        if m.group(3):
            year = int(m.group(3))

    # Numeric date: e.g. "08/21/2026", "08-21", "8/21/26"
    if month is None:
        m = re.search(r"\b(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?\b", low)
        if m:
            a, b = int(m.group(1)), int(m.group(2))
            # Ambiguous; assume US MM/DD when first is 1-12
            if 1 <= a <= 12 and 1 <= b <= 31:
                month, day = a, b
                if m.group(3):
                    y = int(m.group(3))
                    year = 2000 + y if y < 100 else y

    if month is None or day is None:
        return None

    # Time: "7:00 PM", "7pm", "14:00", "3:30 pm"
    t = re.search(r"\b(\d{1,2}):(\d{2})\s*(am|pm|a\.m\.|p\.m\.)?", low)
    if t:
        hour = int(t.group(1))
        minute = int(t.group(2))
        ampm = (t.group(3) or "").lower().replace(".", "")
        if ampm:
            if "pm" in ampm and hour < 12:
                hour += 12
            if "am" in ampm and hour == 12:
                hour = 0
    else:
        t = re.search(r"\b(\d{1,2})\s*(am|pm|a\.m\.|p\.m\.)", low)
        if t:
            hour = int(t.group(1))
            minute = 0
            if "pm" in t.group(2).lower() and hour < 12:
                hour += 12
            if "am" in t.group(2).lower() and hour == 12:
                hour = 0

    return {"year": year, "month": month, "day": day,
            "hour": hour, "minute": minute}


def extract_title(subject, body):
    """Derive a clean event title from subject/body."""
    s = (subject or "").strip()
    # Strip common forward/re prefixes
    s = re.sub(r"^(fwd|fw|re|reply)\s*[:.]?\s*", "", s, flags=re.I).strip()
    if s:
        return s[:120]
    # Fall back to first non-empty body line
    for line in body.splitlines():
        line = line.strip()
        if line and not line.startswith(("On ", "--", "From:")):
            return line[:120]
    return "Forwarded event"


def plain_text_body(msg):
    """Extract plain-text body from a connector full-message dict.
    Prefers the connector's normalized messageText, then falls back to
    decoding the payload body (handles text/plain and nested parts).
    """
    if msg.get("messageText"):
        return msg["messageText"]
    payload = msg.get("payload", {})
    b64 = _find_plain_data(payload)
    if b64:
        return decode_b64(b64)
    return ""


def _find_plain_data(obj):
    """Recursively find the first text/plain body.data string."""
    if isinstance(obj, dict):
        if obj.get("mimeType") == "text/plain" and obj.get("body", {}).get("data"):
            return obj["body"]["data"]
        for v in obj.values():
            r = _find_plain_data(v)
            if r:
                return r
    elif isinstance(obj, list):
        for it in obj:
            r = _find_plain_data(it)
            if r:
                return r
    return None


def decode_b64(data):
    import base64
    try:
        padded = data + "=" * (-len(data) % 4)
        return base64.urlsafe_b64decode(padded).decode("utf-8", "ignore")
    except Exception:
        return ""


def subject_of(msg):
    if msg.get("subject"):
        return msg["subject"]
    for h in msg.get("payload", {}).get("headers", []):
        if h.get("name", "").lower() == "subject":
            return h.get("value", "")
    return ""


# ---- Calendar + SMS --------------------------------------------------------
def create_calendar_event(title, dt_info, body):
    """Create a calendar event. dt_info is dict from parse_date_time."""
    if dt_info.get("hour") is None:
        # All-day event
        start = {"date": f"{dt_info['year']:04d}-{dt_info['month']:02d}-{dt_info['day']:02d}"}
        end = {"date": f"{dt_info['year']:04d}-{dt_info['month']:02d}-{dt_info['day'] + 1:02d}"}
    else:
        start_dt = datetime(dt_info["year"], dt_info["month"], dt_info["day"],
                            dt_info["hour"], dt_info.get("minute") or 0)
        end_dt = start_dt + timedelta(hours=1)
        # Connector schema requires a timezone-aware RFC3339 dateTime string
        start = {"dateTime": start_dt.astimezone().isoformat(), "timeZone": TIMEZONE}
        end = {"dateTime": end_dt.astimezone().isoformat(), "timeZone": TIMEZONE}

    if DRY_RUN:
        print(f"  [dry-run] would create: {title} ({start})")
        return True, start

    payload = {
        "calendarId": "primary",
        "event": {
            "summary": title,
            "description": body[:1000],
            "start": start,
            "end": end,
        },
    }
    try:
        res = call_action("googlecalendar.create_event", payload)
        ok = res.get("success") or (res.get("data") is not None)
        eid = res.get("data", {}).get("id", "")
        print(f"  ✅ created event: {title} ({start}) id={eid}")
        return ok, start
    except Exception as e:
        print(f"  ❌ create_event error: {e}", file=sys.stderr)
        return False, start


def send_sms(body):
    if DRY_RUN:
        print("  [sms would send] " + body)
        return
    try:
        call_action("twilio.send_message", {
            "to": OWNER_NUMBER, "from": ASSISTANT_NUMBER, "body": body,
        })
    except Exception as e:
        print(f"[sms] error: {e}", file=sys.stderr)


# ---- Main ------------------------------------------------------------------
def main():
    if "--setup-label" in sys.argv:
        setup_label(LABEL_NAME)
        return

    label_id = get_label_id(LABEL_NAME)
    if not label_id:
        print(f"Label '{LABEL_NAME}' not found. Run with --setup-label first, "
              f"or create it in Gmail settings.")
        return

    msgs = fetch_labeled_messages(label_id)
    if not msgs:
        print("No labeled emails to process.")
        return

    print(f"Processing {len(msgs)} labeled email(s)...")
    created = 0
    skipped = 0
    for m in msgs:
        mid = m.get("messageId") or m.get("id")
        summary = m.get("subject", "")
        print(f"\n— {mid}: {summary}")
        full = fetch_message_full(mid)
        subject = subject_of(full) or summary
        body = plain_text_body(full)
        if not body:
            print("  (no readable plain-text body — skipping)")
            skipped += 1
            continue

        dt_info = parse_date_time(body)
        if not dt_info:
            print("  (couldn't parse a date — skipping, email left for manual review)")
            skipped += 1
            continue

        title = extract_title(subject, body)
        ok, start = create_calendar_event(title, dt_info, body)
        if ok:
            created += 1
            when = start.get("dateTime", start.get("date", ""))
            send_sms(f"📅 Added to calendar: \"{title}\" ({when})")
            remove_label(mid, label_id)

    print(f"\nDone: {created} created, {skipped} skipped" + (" (dry-run)" if DRY_RUN else ""))


if __name__ == "__main__":
    main()
