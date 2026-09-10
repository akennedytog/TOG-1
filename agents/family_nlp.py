#!/usr/bin/env python3
"""
Family Assistant — Natural Language Date/Time Parser

Turns conversational date/time phrases into datetime objects so the SMS router
can handle requests like "add dentist appt for Enzo next Tuesday 3pm" without
forcing a rigid pipe format.

SUPPORTED:
  - "today", "tomorrow", "tonight", "day after tomorrow"
  - weekday names: "monday".."sunday" (this week or next week)
  - "next tuesday", "this friday"
  - times: "3pm", "3:30pm", "15:00", "at 3", "noon", "midnight"
  - relative: "in 2 hours", "in 3 days"
  - dates: "sept 15", "9/15", "09-15"

USAGE (library):
  from family_nlp import parse_datetime, extract_event
  dt = parse_datetime("next tuesday 3pm")   # -> datetime or None
  title, start, end = extract_event("add dentist appt for Enzo next tuesday 3pm")
"""
import re
from datetime import datetime, timedelta

WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

# ---- Time parsing ---------------------------------------------------------
def _parse_time(s):
    """Parse a time phrase into (hour, minute). Returns None if not a time."""
    s = s.strip().lower()
    if s == "noon":
        return (12, 0)
    if s == "midnight":
        return (0, 0)
    m = re.match(r"^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$", s)
    if m:
        h = int(m.group(1))
        mi = int(m.group(2)) if m.group(2) else 0
        ap = m.group(3)
        if ap == "pm" and h < 12:
            h += 12
        elif ap == "am" and h == 12:
            h = 0
        elif not ap and h < 8:  # bare "3" with no am/pm -> assume PM for daytime
            h += 12
        if 0 <= h <= 23 and 0 <= mi <= 59:
            return (h, mi)
    return None

# ---- Date parsing ---------------------------------------------------------
def _parse_date(s, now=None):
    """Parse a date phrase into a date. Returns None if not a date."""
    now = now or datetime.now()
    today = now.date()
    s = s.strip().lower()

    if s in ("today", "tonight"):
        return today
    if s == "tomorrow":
        return today + timedelta(days=1)
    if s == "day after tomorrow":
        return today + timedelta(days=2)

    m = re.match(r"^(next|this|coming)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$", s)
    if m:
        qualifier, wd = m.group(1), m.group(2)
        target = WEEKDAYS.index(wd)
        delta = (target - today.weekday()) % 7
        if delta == 0:
            delta = 7
        if qualifier == "next":
            delta += 7
        return today + timedelta(days=delta)

    m = re.match(r"^in\s+(\d+)\s+days?$", s)
    if m:
        return today + timedelta(days=int(m.group(1)))

    m = re.match(r"^(\d{1,2})[/-](\d{1,2})$", s)
    if m:
        mo, d = int(m.group(1)), int(m.group(2))
        try:
            return today.replace(month=mo, day=d)
        except ValueError:
            return None
    m = re.match(r"^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})$", s)
    if m:
        mo = MONTHS.index(m.group(1)[:3]) + 1
        d = int(m.group(2))
        try:
            return today.replace(month=mo, day=d)
        except ValueError:
            return None
    return None

# ---- Combined -------------------------------------------------------------
def parse_datetime(text, now=None):
    """Parse a full date+time phrase like 'next tuesday 3pm' into a datetime.
    Returns None if no date or time can be found."""
    now = now or datetime.now()
    t = text.strip().lower()

    time_match = re.search(
        r"(\d{1,2}:\d{2}\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm)|noon|midnight|at\s+\d{1,2}(?::\d{2})?)", t)
    time_str = time_match.group(1) if time_match else None
    if time_str:
        time_str = time_str.replace("at ", "").strip()
        t = t.replace(time_match.group(1), " ").strip()

    date_phrase = re.sub(r"\b(at|on|for|this|the)\b", " ", t).strip()
    date_phrase = re.sub(r"\s+", " ", date_phrase).strip()

    d = _parse_date(date_phrase, now) if date_phrase else None
    if d is None:
        d = now.date()

    h, mi = (9, 0)
    if time_str:
        parsed = _parse_time(time_str)
        if parsed:
            h, mi = parsed

    return datetime(d.year, d.month, d.day, h, mi)

# ---- Event extraction -----------------------------------------------------
def extract_event(text):
    """Extract (title, start_dt, end_dt) from a natural-language event request.
    Returns (None, None, None) if it can't find a date/time."""
    t = text.strip()
    t = re.sub(r"^(please\s+)?(add|schedule|book|set up|put|create)\s+", "", t, flags=re.I).strip()
    t = re.sub(r"\s*(please|thanks|thank you|thx)\s*$", "", t, flags=re.I).strip()

    # Find the schedule phrase. Prefer a date-bearing token (weekday, tomorrow,
    # "in N days", month/day) over a bare time, so "flight sept 20 7am" splits
    # at "sept 20" not at "7am".
    date_pat = (r"(next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|"
                r"(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|"
                r"tomorrow|today|tonight|day after tomorrow|in\s+\d+\s+days?|"
                r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}|"
                r"\d{1,2}[/-]\d{1,2})")
    time_pat = r"(\d{1,2}:\d{2}\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm)|noon|midnight)"
    m_date = re.search(date_pat, t, re.I)
    m_time = re.search(time_pat, t, re.I)
    if m_date:
        m = m_date
    elif m_time:
        m = m_time
    else:
        return (None, None, None)
    # Capture the FULL trailing date/time span (e.g. "next tuesday 3pm"),
    # not just the first token, so the time isn't dropped.
    date_phrase = t[m.start():].strip()
    # Trim trailing filler words that aren't part of the schedule.
    date_phrase = re.sub(r"\s*(please|thanks|thank you|thx)\s*$", "", date_phrase, flags=re.I).strip()
    title = t[:m.start()].strip()
    title = re.sub(r"\s*(for|on|at)\s*$", "", title, flags=re.I).strip()
    if not title:
        title = "Family event"

    start = parse_datetime(date_phrase)
    if start is None:
        return (None, None, None)
    end = start + timedelta(hours=1)
    return (title, start, end)


if __name__ == "__main__":
    # Quick self-test
    tests = [
        "next tuesday 3pm",
        "tomorrow at 2",
        "friday 5pm",
        "today noon",
        "in 3 days",
        "sept 15 10am",
        "9/15 14:00",
    ]
    for t in tests:
        print(f"{t!r:24} -> {parse_datetime(t)}")
    print()
    title, start, end = extract_event("add dentist appt for Enzo next tuesday 3pm")
    print("extract_event:", title, "|", start, "|", end)
