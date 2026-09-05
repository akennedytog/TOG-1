#!/usr/bin/env python3
"""
Import Alec's work Outlook calendar (.ics) events into a Google Calendar
named 'Alec Kennedy (Work)'.

Because the connector's Google OAuth client cannot create external calendar
subscriptions (calendarList.insert with source returns 404), this script
imports the events directly as a snapshot. Recurring events are expanded
into individual occurrences for the next 6 months.

Usage:
  python3 import_outlook_calendar.py
"""
import json
import os
import sqlite3
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timedelta, timezone

from icalendar import Calendar
import recurring_ical_events

CONNECTOR_DB = os.path.expanduser(
    "~/.openclaw/workspace/spikes/open-connector/data/connect.sqlite"
)
ICS_PATH = "/tmp/outlook_cal.ics"
CAL_TITLE = "Alec Kennedy (Work)"
LOOKAHEAD_DAYS = 180  # import events for the next 6 months


def load_connection():
    con = sqlite3.connect(CONNECTOR_DB)
    row = con.execute(
        "SELECT value FROM connections WHERE service='googlecalendar' AND connection_name='default'"
    ).fetchone()
    conn = json.loads(row[0])
    cfg_row = con.execute(
        "SELECT value FROM oauth_client_configs WHERE service='googlecalendar'"
    ).fetchone()
    cfg = json.loads(cfg_row[0]) if cfg_row else {}
    con.close()
    return conn, cfg


def get_access_token(conn, cfg):
    access = conn["accessToken"]
    expires_at = conn.get("expiresAt")
    if expires_at:
        try:
            exp = time.mktime(time.strptime(expires_at, "%Y-%m-%dT%H:%M:%S.%fZ"))
        except ValueError:
            exp = 0
        if time.time() < exp - 60:
            return access
    body = urllib.parse.urlencode({
        "client_id": cfg["clientId"],
        "client_secret": cfg["clientSecret"],
        "refresh_token": conn["refreshToken"],
        "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token", data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())["access_token"]


def api(token, url, method="GET", payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        url, data=data,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read()
            return resp.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw.decode()[:300]}


def ensure_calendar(token):
    """Create the work calendar if it doesn't exist; return its id."""
    s, d = api(token, "https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=100")
    if s == 200:
        for item in d.get("items", []):
            if item.get("summary") == CAL_TITLE:
                return item["id"]
    s, d = api(token, "https://www.googleapis.com/calendar/v3/calendars",
               method="POST", payload={"summary": CAL_TITLE, "timeZone": "America/New_York"})
    if s == 200:
        return d["id"]
    raise RuntimeError(f"Could not create calendar: {s} {d}")


def parse_events():
    with open(ICS_PATH, "rb") as f:
        cal = Calendar.from_ical(f.read())
    start = datetime.now(timezone.utc) - timedelta(days=30)
    end = datetime.now(timezone.utc) + timedelta(days=LOOKAHEAD_DAYS)
    events = recurring_ical_events.of(cal).between(start, end)
    return events


def to_google_event(ev):
    """Convert an icalendar event to a Google Calendar event payload."""
    summary = str(ev.get("SUMMARY", "(no title)")).strip()
    location = str(ev.get("LOCATION", "")).strip()
    description = str(ev.get("DESCRIPTION", "")).strip()

    payload = {"summary": summary}
    if location:
        payload["location"] = location
    if description:
        payload["description"] = description

    dtstart = ev.get("DTSTART")
    dtend = ev.get("DTEND")
    if dtstart is None:
        return None

    # All-day event (date only)
    if isinstance(dtstart.dt, datetime):
        payload["start"] = {"dateTime": dtstart.dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
        if dtend is not None and isinstance(dtend.dt, datetime):
            payload["end"] = {"dateTime": dtend.dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
        else:
            payload["end"] = {"dateTime": (dtstart.dt + timedelta(hours=1)).astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
    else:
        payload["start"] = {"date": dtstart.dt.strftime("%Y-%m-%d")}
        if dtend is not None and not isinstance(dtend.dt, datetime):
            payload["end"] = {"date": dtend.dt.strftime("%Y-%m-%d")}
        else:
            payload["end"] = {"date": (dtstart.dt + timedelta(days=1)).strftime("%Y-%m-%d")}

    return payload


def main():
    conn, cfg = load_connection()
    token = get_access_token(conn, cfg)
    cal_id = ensure_calendar(token)
    print(f"Using calendar: {cal_id} ({CAL_TITLE})")

    events = parse_events()
    print(f"Parsed {len(events)} event occurrences (next {LOOKAHEAD_DAYS} days)")

    imported = 0
    skipped = 0
    errors = 0
    for ev in events:
        payload = to_google_event(ev)
        if payload is None:
            skipped += 1
            continue
        s, d = api(token, f"https://www.googleapis.com/calendar/v3/calendars/{cal_id}/events",
                   method="POST", payload=payload)
        if s == 200:
            imported += 1
        else:
            errors += 1
            if errors <= 5:
                print(f"  ERROR importing '{payload.get('summary')}': {s} {d}")
    print(f"\nDone: {imported} imported, {skipped} skipped, {errors} errors")
    print(f"Calendar ID: {cal_id}")


if __name__ == "__main__":
    main()
