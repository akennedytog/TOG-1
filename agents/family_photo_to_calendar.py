#!/usr/bin/env python3
"""
Family Assistant — Photo → Calendar Event

Takes a natural-language description of an event (extracted from a photo via the
OpenClaw vision tool, or typed directly), parses date/time/title, creates a
Google Calendar event on the PRIMARY calendar, and texts a confirmation.

This pairs with the `image` (vision) tool: when a photo arrives, the AI reads
the date/time/title out of it, then hands the resulting text description to this
script. You can also call it directly with a typed description.

USAGE:
  python3 family_photo_to_calendar.py --describe "Soccer practice Sat Aug 23 9:00 AM"
  python3 family_photo_to_calendar.py --describe "PTA Meeting Friday Aug 22 7:00 PM"
  python3 family_photo_to_calendar.py --dry-run --describe "..."   # no calendar/SMS

Accepts the same date/time formats as the email→calendar parser:
  "Fri Aug 22 7:00 PM", "Saturday 8/23 at 9am", "Aug 22", etc.
"""
import argparse
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from family_email_to_calendar import parse_date_time, create_calendar_event, send_sms


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--describe", required=True,
                    help="Event description, e.g. 'Soccer practice Sat Aug 23 9:00 AM'")
    ap.add_argument("--dry-run", action="store_true",
                    help="Parse only; don't create event or send SMS")
    args = ap.parse_args()

    dt_info = parse_date_time(args.describe)
    if not dt_info:
        print("NO_DATE: couldn't parse a date/time from: " + args.describe)
        sys.exit(0)

    # Derive title: everything up to the date portion (best effort).
    # parse_date_time doesn't return a span, so strip common date tokens to get a clean title.
    title = _derive_title(args.describe, dt_info)
    when = f"{dt_info['year']}-{dt_info['month']:02d}-{dt_info['day']:02d}"
    if dt_info.get("hour") is not None:
        when += f" {dt_info['hour']:02d}:{dt_info.get('minute') or 0:02d}"

    print(f"Parsed: title='{title}'  when={when}")

    if args.dry_run:
        print("DRY-RUN: not creating event / sending SMS")
        sys.exit(0)

    ok, start = create_calendar_event(title, dt_info, args.describe)
    if ok:
        when2 = start.get("dateTime", start.get("date", when))
        send_sms(f"📅 Added to calendar: \"{title}\" ({when2})")
        print(f"SMS sent: 📅 Added to calendar: \"{title}\" ({when2})")
    else:
        print("Failed to create event")
        sys.exit(1)


def _derive_title(describe, dt_info):
    """Best-effort clean title = description with the date/time span removed.
    Uses the same regexes as the parser to locate and strip the date tokens.
    """
    import re
    t = describe.strip()
    low = t
    # Locate the month-name date "Aug 23" / "September 5, 2026" / "sep 5"
    m = re.search(r"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?(?:[,.]?\s+\d{4})?", low, re.I)
    # Locate numeric date "8/25" "08-21"
    m2 = re.search(r"\b\d{1,2}[/\-.]\d{1,2}(?:[/\-.]\d{2,4})?\b", low)
    if m2 and (not m or m2.start() < m.start()):
        m = m2
    if not m:
        return t[:120]
    start = m.start()
    # Also drop any leading "on " before the date
    pre = t[:start]
    pre = re.sub(r"(?:\s+on\s+|\s+at\s+|\s+@\s+)$", " ", pre, flags=re.I)
    # Include any time right after the date
    tail = t[start:]
    tm = re.search(r"(?:\d{1,2}:\d{2}\s*(?:am|pm|a\.m\.|p\.m\.)?|\d{1,2}\s*(?:am|pm|a\.m\.|p\.m\.))", tail, re.I)
    if tm:
        # keep date + time but that's the part we drop; also drop weekday words
        pass
    head = pre.strip(" .,;:- ")
    # Drop a trailing weekday word ("Sat", "Friday") left before the date
    head = re.sub(r"\s+(?:saturday|sunday|monday|tuesday|wednesday|thursday|friday|sat|sun|mon|tue|tues|wed|thu|thur|thurs|fri)$", "", head, flags=re.I)
    return head[:120] if head else "Family event"


if __name__ == "__main__":
    main()
