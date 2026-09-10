#!/usr/bin/env python3
"""
Family Calendar Sync — copy family-relevant events into the Kennedy Family calendar

The family-scoped assistant (SMS router + Chief of Staff) only reads the Kennedy
Family calendar, but real family events (Spain trip, games, appointments) live on
Alec's primary calendar. This script mirrors those events into the family calendar
so the assistant can see and act on them.

SYNC RULES:
  - Reads events from Alec's primary calendar (akennedy@theonegroup.info).
  - For each event in the lookahead window, checks if a matching event already
    exists in the family calendar (same summary + same start time).
  - If missing, creates it in the family calendar.
  - Idempotent: safe to run repeatedly; won't create duplicates.

USAGE:
  python3 family_calendar_sync.py [--days 60] [--dry-run]

Requires: open-connector on localhost:3000 with googlecalendar configured.
"""
import argparse
import json
import sys
import urllib.request
from datetime import datetime, timedelta

CONNECTOR = "http://127.0.0.1:3000/v1/actions"
ALEC_CALENDAR_ID = "akennedy@theonegroup.info"
FAMILY_CALENDAR_ID = "c_c7cc9b7b1d5f15090fe45b07b7dbcc1dd036107ed0c4bbc1d6ff133bee4b9b04@group.calendar.google.com"


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


def get_events(calendar_id, tmin, tmax):
    res = call_action("googlecalendar.list_events", {
        "calendarId": calendar_id,
        "timeMin": tmin, "timeMax": tmax,
        "singleEvents": True, "orderBy": "startTime", "maxResults": 100,
    })
    return res.get("data", {}).get("items", []) or []


def create_event(calendar_id, event):
    res = call_action("googlecalendar.create_event", {
        "calendarId": calendar_id, "event": event,
    })
    return res.get("ok") or res.get("success")


def event_key(ev):
    """Unique key: summary + start time (normalized)."""
    s = ev.get("start", {}).get("dateTime") or ev.get("start", {}).get("date", "")
    return (ev.get("summary", "").strip().lower(), s)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=60)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    now = datetime.now()
    tmin = now.strftime("%Y-%m-%dT00:00:00-04:00")
    tmax = (now + timedelta(days=args.days)).strftime("%Y-%m-%dT00:00:00-04:00")

    src = get_events(ALEC_CALENDAR_ID, tmin, tmax)
    dst = get_events(FAMILY_CALENDAR_ID, tmin, tmax)
    dst_keys = {event_key(ev) for ev in dst}

    created = 0
    skipped = 0
    for ev in src:
        key = event_key(ev)
        if key in dst_keys:
            skipped += 1
            continue
        # Build a clean event for the family calendar.
        new_ev = {
            "summary": ev.get("summary", ""),
            "start": ev.get("start", {}),
            "end": ev.get("end", {}),
        }
        if ev.get("location"):
            new_ev["location"] = ev["location"]
        if ev.get("description"):
            new_ev["description"] = ev["description"]
        if args.dry_run:
            print(f"[dry-run] would create: {ev.get('summary','')} @ {ev.get('start',{}).get('dateTime','')}")
            created += 1
            continue
        ok = create_event(FAMILY_CALENDAR_ID, new_ev)
        if ok:
            print(f"✅ Created: {ev.get('summary','')} @ {ev.get('start',{}).get('dateTime','')}")
            created += 1
        else:
            print(f"❌ Failed: {ev.get('summary','')}")
            skipped += 1

    print(f"\nDone: {created} created, {skipped} skipped (already present or failed).")


if __name__ == "__main__":
    main()
