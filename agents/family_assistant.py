#!/usr/bin/env python3
"""
Family Assistant — Morning Briefing + Reminder Engine + Weather

Phase 1 of the Family AI Assistant capability expansion.

WHAT THIS DOES:
  1. Pulls today's events from the primary Google Calendar (akennedy@theonegroup.info).
  2. Fetches today's weather for the configured location (wttr.in).
  3. Composes a concise morning briefing text.
  4. Sends it via Twilio SMS to the allowlisted number.

RUN:  python3 agents/family_assistant.py [--briefing] [--weather-only] [--dry-run]
Cron: 8:00 AM daily for the morning briefing.

Requires: open-connector running on localhost:3000 with googlecalendar + twilio configured.
"""
import json
import os
import sys
import urllib.request
import urllib.parse
from datetime import datetime, timedelta, timezone
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
CONNECTOR = "http://127.0.0.1:3000/v1/actions"

# ---- Config ----------------------------------------------------------------
# The assistant's number (Twilio) and the allowlisted owner number.
ASSISTANT_NUMBER = "+17543509490"   # Twilio outbound (from)
OWNER_NUMBER = "+18472801393"   # Allison (wife) — family SMS target
LOCATION = "Fort Lauderdale"        # wttr.in location for weather
TIMEZONE = "America/New_York"

# ---- Connector helpers -----------------------------------------------------
def call_action(action_id, payload):
    """POST to the local open-connector action endpoint.
    The connector expects a top-level 'input' object wrapping the params."""
    body = {"input": payload}
    req = urllib.request.Request(
        CONNECTOR + "/" + action_id,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

# ---- Calendar --------------------------------------------------------------
# Calendars the morning briefing reads. This is the FIX for the "no events on a
# busy day" bug: it was querying only 'primary' (akennedy@theonegroup.info),
# which is usually empty, while the real Brown-Forman/work schedule lives in the
# Work calendar. Now we read ALL of them and merge.
#   - akennedy@theonegroup.info        = Alec primary (usually quiet)
#   - c_dae6c993...@group...            = Alec Kennedy (Work) = Brown-Forman calendar
#   - c_c7cc9b7b...@group...            = Kennedy Family (shared)
BRIEFING_CALENDARS = [
    "primary",
    "c_dae6c993b2a559caf518986e7c45801a2625ff864a85dddeea9b3e270daac9d1@group.calendar.google.com",  # Work / Brown-Forman
    "c_c7cc9b7b1d5f15090fe45b07b7dbcc1dd036107ed0c4bbc1d6ff133bee4b9b04@group.calendar.google.com",  # Kennedy Family
]
# How many days ahead the briefing should show (so a quiet today still surfaces
# the packed week ahead).
BRIEFING_DAYS = 3


def get_upcoming_events():
    """Fetch events from all family calendars for the next BRIEFING_DAYS days.
    Merges + sorts by start time. This replaces the old get_today_events() which
    only read 'primary' for a single day."""
    now = datetime.now(timezone.utc)
    start = now.astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=BRIEFING_DAYS)
    events = []
    for cal in BRIEFING_CALENDARS:
        payload = {
            "calendarId": cal,
            "timeMin": start.isoformat(),
            "timeMax": end.isoformat(),
            "singleEvents": True,
            "orderBy": "startTime",
            "maxResults": 50,
        }
        try:
            result = call_action("googlecalendar.list_events", payload)
            items = result.get("data", {}).get("items", [])
            for it in items:
                summary = it.get("summary", "Untitled")
                start_dt = it.get("start", {}).get("dateTime") or it.get("start", {}).get("date")
                end_dt = it.get("end", {}).get("dateTime") or it.get("end", {}).get("date")
                events.append({"summary": summary, "start": start_dt, "end": end_dt, "cal": cal})
        except Exception as e:
            print(f"[calendar:{cal}] error: {e}", file=sys.stderr)
    # Sort by start (None-safe).
    events.sort(key=lambda e: e["start"] or "")
    return events

# ---- Tasks ----------------------------------------------------------------
def get_today_tasks():
    """Fetch tasks due today from the default Google Tasks list.
    Google Tasks due dates are DATE-ONLY (midnight), so we match by date."""
    now = datetime.now(timezone.utc)
    start = now.astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    payload = {
        "tasklistId": "@default",
        "dueMin": start.isoformat(),
        "dueMax": end.isoformat(),
        "showCompleted": False,
        "showHidden": False,
        "maxResults": 50,
    }
    try:
        result = call_action("googletasks.list_tasks", payload)
        items = result.get("data", {}).get("tasks", [])
        return [it.get("title", "Untitled") for it in items]
    except Exception as e:
        print(f"[tasks] error: {e}", file=sys.stderr)
        return []

# ---- Weather ---------------------------------------------------------------
def get_weather():
    """Fetch today's weather from wttr.in (JSON)."""
    url = f"https://wttr.in/{urllib.parse.quote(LOCATION)}?format=j2"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "curl/8.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        cur = data.get("current_condition", [{}])[0]
        today = data.get("weather", [{}])[0]
        return {
            "condition": cur.get("weatherDesc", [{}])[0].get("value", "n/a"),
            "temp_f": cur.get("temp_F", "n/a"),
            "feels_f": cur.get("FeelsLikeF", "n/a"),
            "precip": cur.get("precipMM", "0"),
            "high_f": today.get("maxtempF", "n/a"),
            "low_f": today.get("mintempF", "n/a"),
        }
    except Exception as e:
        print(f"[weather] error: {e}", file=sys.stderr)
        return None

# ---- Compose ---------------------------------------------------------------
def compose_briefing(events, weather, tasks=None):
    """Build the morning briefing text. Now labels which day each event falls on
    (Today / Tomorrow / weekday) since the window is multi-day."""
    today = datetime.now().astimezone().date()

    def day_label(ev):
        s = ev.get("start")
        if not s:
            return ""
        try:
            d = datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone().date()
        except Exception:
            return ""
        if d == today:
            return "Today"
        if d == today + timedelta(days=1):
            return "Tomorrow"
        return d.strftime("%a %b %d")

    lines = ["☀️ Good morning! Here's your next few days:"]
    if events:
        lines.append("\n📅 Upcoming schedule:")
        last_label = None
        for e in events:
            label = day_label(e)
            if label and label != last_label:
                lines.append(f"\n  {label}:")
                last_label = label
            t = ""
            if e["start"] and "T" in e["start"]:
                try:
                    dt = datetime.fromisoformat(e["start"].replace("Z", "+00:00"))
                    t = dt.strftime("%-I:%M %p") + " — "
                except Exception:
                    t = ""
            lines.append(f"    • {t}{e['summary']}")
    else:
        lines.append("\n📅 No events on your calendar in the next few days.")

    if tasks:
        lines.append("\n☑️ Tasks due today:")
        for t in tasks:
            lines.append(f"  • {t}")

    if weather:
        lines.append(
            f"\n🌤 Weather ({LOCATION}): {weather['condition']}, "
            f"{weather['temp_f']}°F (feels {weather['feels_f']}°F). "
            f"High {weather['high_f']}°F / Low {weather['low_f']}°F. "
            f"Precip: {weather['precip']}mm."
        )
    else:
        lines.append("\n🌤 Weather unavailable right now.")

    lines.append("\nReply with any changes or 'help' for commands.")
    return "\n".join(lines)

# ---- Send ------------------------------------------------------------------
def send_sms(body, dry_run=False):
    """Send the briefing via Twilio SMS."""
    if dry_run:
        print("=== DRY RUN — would send SMS ===")
        print(body)
        return
    payload = {
        "to": OWNER_NUMBER,
        "from": ASSISTANT_NUMBER,
        "body": body,
    }
    try:
        result = call_action("twilio.send_message", payload)
        ok = result.get("success") or result.get("ok")
        sid = result.get("data", {}).get("messageSid", "")
        print(f"[sms] sent: {ok} sid={sid}")
        return result
    except Exception as e:
        print(f"[sms] error: {e}", file=sys.stderr)
        return None

# ---- Main ------------------------------------------------------------------
def main():
    dry_run = "--dry-run" in sys.argv
    weather_only = "--weather-only" in sys.argv

    events = [] if weather_only else get_upcoming_events()
    tasks = [] if weather_only else get_today_tasks()
    weather = get_weather()

    if weather_only:
        if weather:
            print(f"{LOCATION}: {weather['condition']}, {weather['temp_f']}°F, "
                  f"high {weather['high_f']}°F / low {weather['low_f']}°F, "
                  f"precip {weather['precip']}mm")
        return

    body = compose_briefing(events, weather, tasks)
    send_sms(body, dry_run=dry_run)

if __name__ == "__main__":
    main()
