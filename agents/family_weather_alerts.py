#!/usr/bin/env python3
"""
Family Assistant — Weather Alerts

Checks the Fort Lauderdale forecast for rain/thunderstorms in the next N hours
and sends a proactive SMS alert to the owner. Designed to run on a cron.

RUN:  python3 agents/family_weather_alerts.py [--dry-run]
Cron: every 30 minutes (e.g. */30 * * * *)

Uses wttr.in JSON (format=j2). Sends via twilio.send_message on localhost:3000.
"""
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
CONNECTOR = "http://127.0.0.1:3000/v1/actions"

ASSISTANT_NUMBER = "+17543509490"
OWNER_NUMBER = "+18472801393"   # Allison (wife) — family SMS target
LOCATION = "Fort+Lauderdale"
WEATHER_URL = f"https://wttr.in/{LOCATION}?format=j2"
STATE_FILE = WS / "data" / "family_weather_state.json"

# Conditions that trigger an alert (case-insensitive substring match)
ALERT_KEYWORDS = ["rain", "thunder", "storm", "shower", "drizzle", "sleet", "snow", "hail"]

def fetch_weather():
    req = urllib.request.Request(
        WEATHER_URL,
        headers={"User-Agent": "curl/8.0"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def call_action(action_id, payload):
    req = urllib.request.Request(
        CONNECTOR + "/" + action_id,
        data=json.dumps({"input": payload}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"last_alert": None}

def save_state(state):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2))

def send_sms(body, dry_run=False):
    if dry_run:
        print("=== DRY RUN — would send SMS ===")
        print(body)
        return True
    payload = {"to": OWNER_NUMBER, "from": ASSISTANT_NUMBER, "body": body}
    try:
        result = call_action("twilio.send_message", payload)
        ok = result.get("success") or result.get("ok")
        print(f"[sms] sent: {ok}")
        return bool(ok)
    except Exception as e:
        print(f"[sms] error: {e}", file=sys.stderr)
        return False

def main():
    dry_run = "--dry-run" in sys.argv
    state = load_state()

    try:
        data = fetch_weather()
    except Exception as e:
        print(f"[weather] error: {e}", file=sys.stderr)
        return

    # Current condition
    current = data.get("current_condition", [{}])[0]
    desc = (current.get("weatherDesc", [{}])[0].get("value", "") or "").lower()
    temp_f = current.get("temp_F", "?")
    precip = current.get("precipMM", "0")

    # Look at today's forecast for alert-worthy conditions
    forecast = data.get("weather", [])
    alert_hits = []
    for day in forecast[:1]:  # today only
        for period in day.get("hourly", []):
            cond = (period.get("weatherDesc", [{}])[0].get("value", "") or "").lower()
            if any(k in cond for k in ALERT_KEYWORDS):
                alert_hits.append(cond)

    # Deduplicate
    alert_hits = list(dict.fromkeys(alert_hits))

    # Only alert if there's actual rain/thunder in the forecast
    if not alert_hits:
        print(f"[weather] no alert conditions (current: {desc}, {temp_f}F, precip {precip}mm)")
        return

    # Cooldown: don't spam the same alert more than once per 3 hours
    now = datetime.now(timezone.utc)
    last = state.get("last_alert")
    if last:
        last_dt = datetime.fromisoformat(last)
        if (now - last_dt).total_seconds() < 3 * 3600:
            print("[weather] alert cooldown active, skipping")
            return

    body = (
        f"🌧 Weather alert (Fort Lauderdale):\n"
        f"Rain/thunder expected today — {', '.join(alert_hits)}.\n"
        f"Currently {temp_f}°F, feels like {current.get('FeelsLikeF','?')}°F."
    )

    if send_sms(body, dry_run=dry_run):
        state["last_alert"] = now.isoformat()
        save_state(state)
        print(f"[weather] alert sent: {', '.join(alert_hits)}")

if __name__ == "__main__":
    main()
