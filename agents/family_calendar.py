#!/usr/bin/env python3
"""
Family Assistant — Calendar Command Center

The "power move": reads events across all family calendars, flags conflicts
(both parents booked at the same time → who's on baby duty), and can add events
to the shared Kennedy Family calendar.

CALENDARS:
  Primary (Alec)      akennedy@theonegroup.info
  Work (Alec)         c_dae6c993b2a559caf518986e7c45801a2625ff864a85dddeea9b3e270daac9d1@group.calendar.google.com
  Family (shared)     c_c7cc9b7b1d5f15090fe45b07b7dbcc1dd036107ed0c4bbc1d6ff133bee4b9b04@group.calendar.google.com

USAGE:
  python3 family_calendar.py --week            # show this week's family view
  python3 family_calendar.py --conflicts       # flag overlapping events
  python3 family_calendar.py --add "Title|2026-08-20 18:00|2026-08-20 19:00|Location"
  python3 family_calendar.py --today           # today's events
"""
import argparse
import json
import urllib.request
from datetime import datetime, timedelta

CONNECTOR = "http://127.0.0.1:3000/v1/actions"

FAMILY_CAL = "c_c7cc9b7b1d5f15090fe45b07b7dbcc1dd036107ed0c4bbc1d6ff133bee4b9b04@group.calendar.google.com"
PRIMARY_CAL = "akennedy@theonegroup.info"
WORK_CAL = "c_dae6c993b2a559caf518986e7c45801a2625ff864a85dddeea9b3e270daac9d1@group.calendar.google.com"

ALL_CALS = [PRIMARY_CAL, WORK_CAL, FAMILY_CAL]


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


def get_events(cal_id, time_min, time_max):
    res = call_action("googlecalendar.list_events", {
        "calendarId": cal_id,
        "timeMin": time_min,
        "timeMax": time_max,
        "timeZone": "America/New_York",
        "singleEvents": True,
        "orderBy": "startTime",
    })
    return res.get("data", {}).get("items", []) or []


def fmt_event(ev):
    start = ev.get("start", {}).get("dateTime") or ev.get("start", {}).get("date", "")
    end = ev.get("end", {}).get("dateTime") or ""
    loc = ev.get("location", "")
    s = f"{ev.get('summary','(no title)')}"
    if start:
        try:
            dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
            s += f" @ {dt.strftime('%a %b %d %I:%M%p')}"
        except ValueError:
            s += f" @ {start}"
    if loc:
        s += f" ({loc})"
    return s


def week_view():
    today = datetime.now().date()
    start = today - timedelta(days=today.weekday())  # Monday
    end = start + timedelta(days=7)
    tmin = f"{start}T00:00:00-04:00"
    tmax = f"{end}T00:00:00-04:00"
    out = []
    for cal in ALL_CALS:
        for ev in get_events(cal, tmin, tmax):
            out.append((cal, ev))
    out.sort(key=lambda x: x[1].get("start", {}).get("dateTime", ""))
    lines = []
    for cal, ev in out:
        cal_name = {"akennedy@theonegroup.info": "Alec", WORK_CAL: "Work", FAMILY_CAL: "Family"}.get(cal, cal)
        lines.append(f"[{cal_name}] {fmt_event(ev)}")
    return "\n".join(lines) if lines else "No events this week."


def conflicts():
    """Flag overlapping events across calendars (both parents busy = baby duty gap)."""
    today = datetime.now().date()
    start = today
    end = today + timedelta(days=7)
    tmin = f"{start}T00:00:00-04:00"
    tmax = f"{end}T00:00:00-04:00"
    events = []
    for cal in ALL_CALS:
        for ev in get_events(cal, tmin, tmax):
            s = ev.get("start", {}).get("dateTime")
            e = ev.get("end", {}).get("dateTime")
            if s and e:
                try:
                    events.append({
                        "cal": cal,
                        "summary": ev.get("summary", ""),
                        "start": datetime.fromisoformat(s.replace("Z", "+00:00")),
                        "end": datetime.fromisoformat(e.replace("Z", "+00:00")),
                    })
                except ValueError:
                    pass
    # find overlaps
    overlaps = []
    for i in range(len(events)):
        for j in range(i + 1, len(events)):
            a, b = events[i], events[j]
            if a["start"] < b["end"] and b["start"] < a["end"]:
                if a["cal"] != b["cal"]:  # only flag cross-calendar conflicts
                    overlaps.append((a, b))
    if not overlaps:
        return "No cross-calendar conflicts in the next 7 days."
    lines = ["⚠️ Conflicts found:"]
    for a, b in overlaps:
        lines.append(f"  • {a['summary']} ({a['start'].strftime('%a %I:%M%p')}) overlaps {b['summary']} ({b['start'].strftime('%a %I:%M%p')})")
    return "\n".join(lines)


def add_event(text):
    parts = [p.strip() for p in text.split("|")]
    if len(parts) < 3:
        return "Format: Title|YYYY-MM-DD HH:MM|YYYY-MM-DD HH:MM|Location"
    title, start_s, end_s = parts[0], parts[1], parts[2]
    loc = parts[3] if len(parts) > 3 else ""
    try:
        start_dt = datetime.strptime(start_s, "%Y-%m-%d %H:%M")
        end_dt = datetime.strptime(end_s, "%Y-%m-%d %H:%M")
    except ValueError:
        return "Dates must be YYYY-MM-DD HH:MM"
    event = {
        "summary": title,
        "start": {"dateTime": start_dt.strftime("%Y-%m-%dT%H:%M:%S-04:00"), "timeZone": "America/New_York"},
        "end": {"dateTime": end_dt.strftime("%Y-%m-%dT%H:%M:%S-04:00"), "timeZone": "America/New_York"},
    }
    if loc:
        event["location"] = loc
    res = call_action("googlecalendar.create_event", {
        "calendarId": FAMILY_CAL,
        "event": event,
    })
    if res.get("ok") or res.get("success"):
        return f"✅ Added to Family calendar: {title} ({start_dt.strftime('%b %d %I:%M%p')})"
    return f"Error: {res}"


def today_view():
    today = datetime.now().date()
    tmin = f"{today}T00:00:00-04:00"
    tmax = f"{today + timedelta(days=1)}T00:00:00-04:00"
    out = []
    for cal in ALL_CALS:
        for ev in get_events(cal, tmin, tmax):
            out.append((cal, ev))
    out.sort(key=lambda x: x[1].get("start", {}).get("dateTime", ""))
    lines = []
    for cal, ev in out:
        cal_name = {"akennedy@theonegroup.info": "Alec", WORK_CAL: "Work", FAMILY_CAL: "Family"}.get(cal, cal)
        lines.append(f"[{cal_name}] {fmt_event(ev)}")
    return "\n".join(lines) if lines else "No events today."


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--week", action="store_true")
    ap.add_argument("--conflicts", action="store_true")
    ap.add_argument("--today", action="store_true")
    ap.add_argument("--add", help="Title|YYYY-MM-DD HH:MM|YYYY-MM-DD HH:MM|Location")
    args = ap.parse_args()

    if args.week:
        print(week_view())
    elif args.conflicts:
        print(conflicts())
    elif args.today:
        print(today_view())
    elif args.add:
        print(add_event(args.add))
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
