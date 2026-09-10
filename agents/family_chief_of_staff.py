#!/usr/bin/env python3
"""
Family Chief of Staff — Proactive Household Orchestrator

Implements the "Family Chief of Staff" operating spec: reduce mental load, keep
the household organized, anticipate needs, and keep Alec + Allison aligned.

Delivers four proactive message types via SMS:
  - MORNING briefing  (daily): today's calendar + conflicts, top priorities,
    baby/travel/appt/weather/bills considerations, one proactive suggestion.
  - MIDDAY support    (as needed): time-sensitive reminders, calendar changes,
    buy/bring/prepare/decide items. Only fires when genuinely helpful.
  - EVENING reset     (daily): tomorrow's first commitment + prep, unfinished
    important tasks, one question that clears a blocker.
  - WEEKLY planning   (weekly): next week's commitments/conflicts, appointments,
    travel, birthdays, bills, renewals, deadlines, grocery needs, division of
    responsibilities, one family activity, decisions needed.

Also maintains a living household operating picture in family_state.json:
tasks (owner/due/next action), tracked supplies (formula/diapers/wipes/meds),
recurring items, preferences, and a weekly improvement log.

USAGE:
  python3 family_chief_of_staff.py --morning
  python3 family_chief_of_staff.py --midday
  python3 family_chief_of_staff.py --evening
  python3 family_chief_of_staff.py --weekly
  python3 family_chief_of_staff.py --state        # print household state
  python3 family_chief_of_staff.py --task add "Title|Owner|Due|Next action"
  python3 family_chief_of_staff.py --task list
  python3 family_chief_of_staff.py --supply add "Formula|Low|2 cans"
  python3 family_chief_of_staff.py --supply list

Requires: open-connector on localhost:3000 with twilio + googlecalendar +
googlesheets + googletasks configured. Family number = +17543509490.
"""
import argparse
import json
import re
import subprocess
import sys
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
CONNECTOR = "http://127.0.0.1:3000/v1/actions"

ASSISTANT_NUMBER = "+17543509490"   # Twilio outbound (from) = family number
ALEC = "+15024037201"
ALLISON = "+18472801393"
FAMILY_CALENDAR_ID = "c_c7cc9b7b1d5f15090fe45b07b7dbcc1dd036107ed0c4bbc1d6ff133bee4b9b04@group.calendar.google.com"
ALEC_CALENDAR_ID = "akennedy@theonegroup.info"
STATE_FILE = WS / "data" / "family_state.json"

# ---- Connector -------------------------------------------------------------
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

def send_sms(to, body):
    """Send an SMS via Twilio. Returns True on success."""
    try:
        res = call_action("twilio.send_message", {
            "to": to, "from": ASSISTANT_NUMBER, "body": body,
        })
        return bool(res.get("ok") or res.get("success"))
    except Exception as e:
        print(f"[send_sms] error: {e}", file=sys.stderr)
        return False

# ---- Household state ------------------------------------------------------
def load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            pass
    return {"tasks": [], "supplies": [], "preferences": {}, "improvements": []}

def save_state(state):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2))

# ---- Calendar helpers ------------------------------------------------------
def get_events(calendar_id, tmin, tmax, q=None):
    payload = {
        "calendarId": calendar_id,
        "timeMin": tmin, "timeMax": tmax,
        "singleEvents": True, "orderBy": "startTime", "maxResults": 50,
    }
    if q:
        payload["q"] = q
    try:
        res = call_action("googlecalendar.list_events", payload)
        return res.get("data", {}).get("items", []) or []
    except Exception as e:
        print(f"[get_events] {calendar_id}: {e}", file=sys.stderr)
        return []

def fmt_event(ev):
    s = ev.get("start", {}).get("dateTime") or ev.get("start", {}).get("date", "")
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        tstr = dt.strftime("%I:%M%p").lstrip("0")
    except Exception:
        tstr = s
    return f"{ev.get('summary','')} {tstr}"

def _dedupe(events):
    """Remove duplicate events that appear in both family + Alec calendars
    (same summary + start time), keeping the family-calendar copy."""
    seen = {}
    out = []
    for cal, ev in events:
        s = ev.get("start", {}).get("dateTime") or ev.get("start", {}).get("date", "")
        key = (ev.get("summary", "").strip().lower(), s)
        if key in seen:
            continue  # already have this event
        seen[key] = True
        out.append((cal, ev))
    return out


def today_events():
    """All events today across family + Alec calendars, sorted + deduped."""
    now = datetime.now()
    tmin = now.strftime("%Y-%m-%dT00:00:00-04:00")
    tmax = (now + timedelta(days=1)).strftime("%Y-%m-%dT00:00:00-04:00")
    out = []
    for cal in (FAMILY_CALENDAR_ID, ALEC_CALENDAR_ID):
        for ev in get_events(cal, tmin, tmax):
            out.append((cal, ev))
    out.sort(key=lambda x: x[1].get("start", {}).get("dateTime", ""))
    return _dedupe(out)

def week_events(days=7):
    """All events over the next N days across family + Alec calendars, deduped."""
    now = datetime.now()
    tmin = now.strftime("%Y-%m-%dT00:00:00-04:00")
    tmax = (now + timedelta(days=days)).strftime("%Y-%m-%dT00:00:00-04:00")
    out = []
    for cal in (FAMILY_CALENDAR_ID, ALEC_CALENDAR_ID):
        for ev in get_events(cal, tmin, tmax):
            out.append((cal, ev))
    out.sort(key=lambda x: x[1].get("start", {}).get("dateTime", ""))
    return _dedupe(out)

def find_conflicts(events):
    """Return human-readable overlapping events."""
    conflicts = []
    for i in range(len(events)):
        for j in range(i + 1, len(events)):
            a, b = events[i][1], events[j][1]
            a_start = a.get("start", {}).get("dateTime")
            b_start = b.get("start", {}).get("dateTime")
            a_end = a.get("end", {}).get("dateTime")
            b_end = b.get("end", {}).get("dateTime")
            if not (a_start and b_start and a_end and b_end):
                continue
            try:
                as_, ae = datetime.fromisoformat(a_start.replace("Z", "+00:00")), datetime.fromisoformat(a_end.replace("Z", "+00:00"))
                bs_, be = datetime.fromisoformat(b_start.replace("Z", "+00:00")), datetime.fromisoformat(b_end.replace("Z", "+00:00"))
            except Exception:
                continue
            if as_ < be and bs_ < ae:
                conflicts.append(f"⚠️ {a.get('summary','')} overlaps {b.get('summary','')}")
    return conflicts

# ---- Data pulls ------------------------------------------------------------
def run_script(script, *args):
    try:
        r = subprocess.run(
            [sys.executable, str(WS / "agents" / script), *args],
            capture_output=True, text=True, timeout=60,
        )
        return r.stdout.strip() or r.stderr.strip()
    except Exception as e:
        return f"Error running {script}: {e}"

def get_due_items(days=14):
    return run_script("family_trackers.py", "--due", str(days))

def get_shopping_list():
    return run_script("family_shopping_list.py", "show")

def get_meal_plan():
    return run_script("family_meal_plan.py", "--preview")

def get_weather():
    # Lightweight: reuse family_reminders weather if present, else skip.
    return ""

# ---- Task management -------------------------------------------------------
def add_task(state, title, owner="", due="", next_action=""):
    task = {
        "title": title, "owner": owner, "due": due,
        "next_action": next_action, "created": datetime.now().isoformat(),
        "status": "open",
    }
    state["tasks"].append(task)
    save_state(state)
    return f"✅ Task captured: {title}" + (f" (owner: {owner})" if owner else "")

def list_tasks(state):
    if not state["tasks"]:
        return "No open tasks."
    lines = []
    for t in state["tasks"]:
        if t.get("status") == "open":
            due = f" due {t['due']}" if t.get("due") else ""
            owner = f" [{t['owner']}]" if t.get("owner") else ""
            lines.append(f"• {t['title']}{owner}{due}")
    return "\n".join(lines) if lines else "No open tasks."

# ---- Supply tracking -------------------------------------------------------
def add_supply(state, name, level="", note=""):
    state["supplies"].append({"name": name, "level": level, "note": note,
                              "updated": datetime.now().isoformat()})
    save_state(state)
    return f"✅ Tracked supply: {name} ({level})"

def low_supplies(state):
    """Return supplies flagged low/out."""
    low = [s for s in state["supplies"] if s.get("level", "").lower() in ("low", "out", "running low")]
    return low

# ---- Briefing builders -----------------------------------------------------
def build_morning(state):
    now = datetime.now()
    lines = [f"☀️ Good morning! {now.strftime('%A %b %d')}"]
    # Calendar + conflicts
    evs = today_events()
    if evs:
        lines.append("\n📅 Today:")
        for cal, ev in evs:
            cal_name = "Family" if cal == FAMILY_CALENDAR_ID else "Alec"
            lines.append(f"  • [{cal_name}] {fmt_event(ev)}")
    else:
        lines.append("\n📅 No events on the calendar today.")
    conflicts = find_conflicts(evs)
    if conflicts:
        lines.append("\n" + "\n".join(conflicts))
    # Due items
    due = get_due_items(14)
    if due and "Nothing due" not in due:
        lines.append(f"\n⏰ Due soon:\n{due}")
    # Low supplies
    low = low_supplies(state)
    if low:
        names = ", ".join(s["name"] for s in low)
        lines.append(f"\n🛒 Running low: {names}")
    # Open tasks
    tasks = list_tasks(state)
    if tasks and "No open tasks" not in tasks:
        lines.append(f"\n📝 Tasks:\n{tasks}")
    # One proactive suggestion
    lines.append("\n💡 Tip: reply 'help' anytime to see what I can do.")
    return "\n".join(lines)

def build_evening(state):
    now = datetime.now()
    lines = [f"🌙 Evening check-in — {now.strftime('%A %b %d')}"]
    # Tomorrow's first commitment
    tmin = (now + timedelta(days=1)).strftime("%Y-%m-%dT00:00:00-04:00")
    tmax = (now + timedelta(days=2)).strftime("%Y-%m-%dT00:00:00-04:00")
    tomorrow = []
    for cal in (FAMILY_CALENDAR_ID, ALEC_CALENDAR_ID):
        for ev in get_events(cal, tmin, tmax):
            tomorrow.append((cal, ev))
    tomorrow.sort(key=lambda x: x[1].get("start", {}).get("dateTime", ""))
    tomorrow = _dedupe(tomorrow)
    if tomorrow:
        first = tomorrow[0][1]
        lines.append(f"\n⏰ Tomorrow starts with: {fmt_event(first)}")
    else:
        lines.append("\n⏰ Nothing on the calendar tomorrow.")
    # Unfinished tasks
    tasks = list_tasks(state)
    if tasks and "No open tasks" not in tasks:
        lines.append(f"\n📝 Still open:\n{tasks}")
    lines.append("\n💤 Rest up — I've got the morning covered.")
    return "\n".join(lines)

def build_weekly(state):
    now = datetime.now()
    lines = [f"🗓️ Weekly planning — week of {now.strftime('%b %d')}"]
    # Next week's commitments
    evs = week_events(7)
    if evs:
        lines.append("\n📅 This week:")
        for cal, ev in evs:
            cal_name = "Family" if cal == FAMILY_CALENDAR_ID else "Alec"
            s = ev.get("start", {}).get("dateTime") or ev.get("start", {}).get("date", "")
            try:
                dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
                day = dt.strftime("%a %b %d")
                tstr = dt.strftime("%I:%M%p").lstrip("0")
            except Exception:
                day, tstr = s, ""
            lines.append(f"  • [{cal_name}] {ev.get('summary','')} {day} {tstr}")
    else:
        lines.append("\n📅 Nothing on the calendar this week.")
    conflicts = find_conflicts(evs)
    if conflicts:
        lines.append("\n" + "\n".join(conflicts))
    # Due items
    due = get_due_items(14)
    if due and "Nothing due" not in due:
        lines.append(f"\n⏰ Due soon:\n{due}")
    # Grocery needs
    low = low_supplies(state)
    if low:
        names = ", ".join(s["name"] for s in low)
        lines.append(f"\n🛒 Restock: {names}")
    # Meal plan (compact — only the dinner plan, not the grocery list)
    meal = get_meal_plan()
    if meal and "MEAL PLAN" in meal:
        lines.append("\n🍽️ Dinners:")
        days = r"(monday|tuesday|wednesday|thursday|friday|saturday|sunday)"
        for l in meal.splitlines():
            l = l.strip()
            if re.match(days, l, re.I):
                lines.append(f"  {l}")
    # Spain trip status (if active)
    spain = run_script("family_spain_trip.py", "--status")
    if spain and "Spain Trip" in spain:
        open_items = [l for l in spain.splitlines() if l.strip().startswith("•")]
        if open_items:
            lines.append(f"\n🇪🇸 Spain trip — {len(open_items)} open items:")
            for l in open_items[:6]:
                lines.append(f"  {l.strip()}")
            if len(open_items) > 6:
                lines.append(f"  …and {len(open_items)-6} more")
    # One family activity suggestion
    lines.append("\n💡 Suggested: pick one evening this week for a family movie or walk.")
    return "\n".join(lines)

# ---- Main ------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--morning", action="store_true")
    ap.add_argument("--midday", action="store_true")
    ap.add_argument("--evening", action="store_true")
    ap.add_argument("--weekly", action="store_true")
    ap.add_argument("--state", action="store_true")
    ap.add_argument("--task", nargs="+", help="add 'Title|Owner|Due|Next' | list")
    ap.add_argument("--supply", nargs="+", help="add 'Name|Level|Note' | list")
    ap.add_argument("--dry-run", action="store_true", help="print instead of send")
    args = ap.parse_args()

    state = load_state()

    if args.task:
        if args.task[0] == "list":
            print(list_tasks(state))
        else:
            parts = [p.strip() for p in " ".join(args.task[1:]).split("|")]
            title = parts[0] if parts else ""
            owner = parts[1] if len(parts) > 1 else ""
            due = parts[2] if len(parts) > 2 else ""
            na = parts[3] if len(parts) > 3 else ""
            print(add_task(state, title, owner, due, na))
        return
    if args.supply:
        if args.supply[0] == "list":
            for s in state["supplies"]:
                print(f"• {s['name']} ({s.get('level','')}) {s.get('note','')}")
        else:
            parts = [p.strip() for p in " ".join(args.supply[1:]).split("|")]
            print(add_supply(state, parts[0], parts[1] if len(parts) > 1 else "",
                             parts[2] if len(parts) > 2 else ""))
        return
    if args.state:
        print(json.dumps(state, indent=2))
        return

    # Build the message for the requested briefing.
    if args.morning:
        msg = build_morning(state)
    elif args.evening:
        msg = build_evening(state)
    elif args.weekly:
        msg = build_weekly(state)
    elif args.midday:
        # Midday only fires when there's something genuinely helpful.
        due = get_due_items(3)
        low = low_supplies(state)
        if (not due or "Nothing due" in due) and not low:
            print("[midday] nothing urgent — staying quiet.")
            return
        msg = "📌 Quick heads-up:\n"
        if due and "Nothing due" not in due:
            msg += f"{due}\n"
        if low:
            msg += "🛒 Running low: " + ", ".join(s["name"] for s in low)
        msg = msg.strip()
    else:
        ap.print_help()
        return

    if args.dry_run:
        print(msg)
        return

    # Send to both Alec + Allison (household-wide message).
    ok1 = send_sms(ALEC, msg)
    ok2 = send_sms(ALLISON, msg)
    print(f"[sent] Alec:{ok1} Allison:{ok2}")

if __name__ == "__main__":
    main()
