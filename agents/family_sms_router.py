#!/usr/bin/env python3
"""
Family Assistant — Two-Way SMS Router

Turns the family number into a real conversational assistant. Runs on a cron
(every 2 min), polls for NEW inbound SMS to the family number, classifies the
intent, routes to the right family script/action, and replies via SMS.

INTENTS (natural language, keyword-matched):
  - "add milk, eggs, bread"            → shopping list (family_shopping_list.py)
  - "add dentist appt for Enzo Tue 3pm"→ calendar event (family_calendar.py --add)
  - "what's our week look like"         → calendar week view
  - "any conflicts"                     → calendar conflict check
  - "bills due" / "what's due"          → trackers due-soon
  - "meal plan" / "grocery list"        → meal plan preview
  - "help" / "what can you do"          → capability list
  - anything else                       → fallback (reply with help)

USAGE:
  python3 agents/family_sms_router.py [--dry-run] [--once]

Requires: open-connector on localhost:3000 with twilio + googlecalendar +
googlesheets configured. Family number = +17543509490.
"""
import json
import re
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
CONNECTOR = "http://127.0.0.1:3000/v1/actions"

ASSISTANT_NUMBER = "+17543509490"   # Twilio outbound (from) = family number
ALLOWED_SENDERS = {"+15024037201", "+18472801393"}  # Alec + Allison
FAMILY_CALENDAR_ID = "c_c7cc9b7b1d5f15090fe45b07b7dbcc1dd036107ed0c4bbc1d6ff133bee4b9b04@group.calendar.google.com"
STATE_FILE = WS / "data" / "family_sms_router_state.json"

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

# ---- State ----------------------------------------------------------------
def load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            pass
    return {"processed": {}}

def save_state(state):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2))

# ---- Inbound fetch --------------------------------------------------------
def fetch_inbound():
    """Return list of inbound SMS to the family number, newest first.

    The connector's list_messages returns messages sent TO the family number
    (we query with to=ASSISTANT_NUMBER), so every returned message is inbound.
    The connector response has no `direction` field, so we don't filter on it.
    """
    res = call_action("twilio.list_messages", {"to": ASSISTANT_NUMBER, "pageSize": 50})
    msgs = res.get("data", {}).get("messages", []) or []
    inbound = []
    for m in msgs:
        sid = m.get("messageSid") or m.get("sid") or ""
        body = m.get("body", "")
        frm = m.get("from", "")
        if not sid or not body:
            continue
        inbound.append({"sid": sid, "from": frm, "body": body,
                        "date": m.get("dateCreated", "")})
    return inbound

# ---- Intent classification ------------------------------------------------
def classify(text):
    t = text.lower().strip()
    # Shopping list (most common, check first)
    if re.search(r"\b(add|put|get|buy|need|grab|pick up|remind me to get)\b", t) and \
       (re.search(r"(milk|egg|bread|cheese|chicken|steak|banana|apple|toilet|diaper|wipes|"
                  r"coffee|butter|yogurt|pasta|rice|soap|shampoo|detergent|paper towel|"
                  r"grocery|shopping|produce|meat|veggie|vegetable|fruit|snack|drink|water)", t)
        or "shopping list" in t):
        return "shopping"
    # To-do list (add a task) — only when it's clearly a task, not a grocery item
    if re.search(r"(to.?do|task|chore|errand)", t) and \
       re.search(r"\b(add|put|remind|note|write)\b", t):
        return "todo"
    # Cancel a calendar event
    if re.search(r"\b(cancel|remove|delete|reschedule)\b", t) and \
       re.search(r"(appt|appointment|therapy|meeting|event|call|class|lesson|reservation|booking)", t):
        return "cancel"
    # Calendar add
    if re.search(r"\b(add|schedule|book|set up|put)\b", t) and \
       re.search(r"(appt|appointment|dentist|doctor|meeting|event|call|class|lesson|"
                 r"playdate|party|birthday|dinner|lunch|breakfast|flight|trip|visit)", t):
        return "calendar_add"
    # Conflicts (specific — check before broad week)
    if re.search(r"(conflict|overlap|double|both.*busy|baby duty)", t):
        return "conflicts"
    # Meal plan / grocery (specific — check before broad week)
    if re.search(r"(meal plan|grocery list|what.*(eat|dinner|cook)|dinner.*(plan|tonight)|what.*for.*dinner)", t):
        return "meal"
    # Due soon / bills / trackers
    if re.search(r"(due|bill|renew|maintenance|gift|occasion|tracker|upcoming.*(bill|renew))", t):
        return "due"
    # Week view (broad — last)
    if re.search(r"(week|schedule|calendar|what.*(on|up)|coming up|plan|today|tomorrow)", t):
        return "week"
    # Help
    if re.search(r"(help|what can you do|commands|options|how.*use)", t):
        return "help"
    return "fallback"

# ---- Actions --------------------------------------------------------------
def run_script(script, *args):
    """Run a family script and return its stdout."""
    try:
        r = subprocess.run(
            [sys.executable, str(WS / "agents" / script), *args],
            capture_output=True, text=True, timeout=60,
        )
        return r.stdout.strip() or r.stderr.strip()
    except Exception as e:
        return f"Error running {script}: {e}"

def handle_todo(body):
    """Add a task to the family Google Tasks list (@default)."""
    # Strip leading command words + list qualifiers to get the task title.
    title = re.sub(
        r"^(please\s+)?(add|put|remind me to|note|write)\s+"
        r"(to my|to our|to the|on my|on our|on the)?\s*"
        r"(family\s+)?(to.?do|task|chore|errand)?\s*(list)?\s*[:\-]?\s*",
        "", body, flags=re.I).strip()
    title = re.sub(r"^(to.?do|task|chore|errand|list)\s*[:\-]?\s*", "", title, flags=re.I).strip()
    # Strip trailing list qualifiers: "... to our to do list", "... on the list"
    title = re.split(
        r"\s+(?:to|on|onto)\s+(?:my|our|the|your|a)?\s*(?:family\s+)?"
        r"(?:to[- ]?do\s+list|to[- ]?do|task|chore|errand|list)\s*$",
        title, maxsplit=1, flags=re.I)[0].strip()
    if not title:
        return "What should I add to the to-do list? e.g. 'add pick up formula'"
    try:
        res = call_action("googletasks.insert_task", {
            "tasklistId": "@default", "title": title, "status": "needsAction",
        })
        # Also record in shared household state for the Chief of Staff.
        try:
            from family_chief_of_staff import load_state, add_task
            add_task(load_state(), title)
        except Exception:
            pass
        if res.get("ok") or res.get("success"):
            return f"✅ Added to to-do list: {title}"
        return f"Couldn't add task: {res.get('data', {}).get('error', 'unknown')}"
    except Exception as e:
        return f"Error adding task: {e}"


def handle_cancel(body):
    """Cancel a calendar event by keyword. Lists matching upcoming events."""
    # Extract the event keyword (therapy, dentist, meeting, etc.)
    m = re.search(r"(therapy|dentist|doctor|meeting|appointment|appt|call|class|lesson|reservation|booking)", body, re.I)
    keyword = m.group(1).lower() if m else ""
    if not keyword:
        return "What event should I cancel? e.g. 'cancel therapy'"
    # Search the family calendar for matching upcoming events.
    from datetime import datetime, timedelta, timezone as _tz
    now = datetime.now(_tz.utc)
    tmax = (now + timedelta(days=30)).isoformat()
    try:
        res = call_action("googlecalendar.list_events", {
            "calendarId": FAMILY_CALENDAR_ID, "q": keyword,
            "timeMin": now.isoformat(), "timeMax": tmax,
            "singleEvents": True, "orderBy": "startTime", "maxResults": 10,
        })
        items = res.get("data", {}).get("items", []) or []
        if not items:
            return f"No upcoming '{keyword}' events found on the family calendar."
        lines = [f"Found {len(items)} upcoming '{keyword}' event(s):"]
        for it in items[:5]:
            s = it.get("start", {}).get("dateTime") or it.get("start", {}).get("date", "")
            try:
                dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
                tstr = dt.strftime("%a %b %d %I:%M%p")
            except Exception:
                tstr = s
            lines.append(f"  • {it.get('summary','')} @ {tstr}")
        lines.append("\nReply with the exact event to cancel (I'll confirm before deleting).")
        return "\n".join(lines)
    except Exception as e:
        return f"Error searching calendar: {e}"


def handle_shopping(body):
    out = run_script("family_shopping_list.py", "--add", body)
    # The script prints a summary; return the last meaningful line.
    lines = [l for l in out.splitlines() if l.strip()]
    return lines[-1] if lines else "Added to shopping list."

def handle_calendar_add(body):
    """Add a calendar event from natural language (e.g. 'add dentist appt for
    Enzo next tuesday 3pm'). Falls back to the pipe format if unparseable."""
    try:
        from family_nlp import extract_event
        title, start, end = extract_event(body)
    except Exception:
        title = start = end = None
    if title and start and end:
        # Build the pipe format the calendar script expects.
        start_s = start.strftime("%Y-%m-%d %H:%M")
        end_s = end.strftime("%Y-%m-%d %H:%M")
        out = run_script("family_calendar.py", "--add", f"{title}|{start_s}|{end_s}")
        lines = [l for l in out.splitlines() if l.strip()]
        return lines[-1] if lines else f"✅ Added: {title} ({start.strftime('%b %d %I:%M%p')})"
    return ("I couldn't parse that date/time. Try: add Title|YYYY-MM-DD HH:MM|YYYY-MM-DD HH:MM|Location\n"
            "Example: add Dentist|2026-09-15 14:00|2026-09-15 15:00|Downtown")

def handle_week():
    out = run_script("family_calendar.py", "--week")
    return out if out and "No events" not in out else "No events on the calendar this week."

def handle_conflicts():
    out = run_script("family_calendar.py", "--conflicts")
    return out

def handle_due():
    out = run_script("family_trackers.py", "--due", "14")
    return out

def handle_meal():
    out = run_script("family_meal_plan.py", "--preview")
    # Preview prints a lot; return a trimmed version.
    lines = [l for l in out.splitlines() if l.strip()]
    return "\n".join(lines[:20]) if lines else "Meal plan unavailable."

HELP_TEXT = (
    "👋 I'm your family assistant! Text me things like:\n"
    "• 'add milk, eggs, bread' → shopping list\n"
    "• 'add pick up formula to to-do list' → family tasks\n"
    "• 'add dentist appt for Enzo Tue 3pm' → calendar\n"
    "• 'cancel therapy' → find & cancel a calendar event\n"
    "• 'what's our week look like?' → schedule\n"
    "• 'bills due' → bills/maintenance/gifts due soon\n"
    "• 'meal plan' → this week's dinners\n"
    "• 'any conflicts?' → overlapping events\n"
    "Reply with 'help' anytime."
)

def handle_fallback(body):
    return HELP_TEXT

# ---- Reply ----------------------------------------------------------------
def send_reply(to, body):
    res = call_action("twilio.send_message", {
        "to": to, "from": ASSISTANT_NUMBER, "body": body,
    })
    return bool(res.get("success") or res.get("ok"))

# ---- Main -----------------------------------------------------------------
def main():
    dry_run = "--dry-run" in sys.argv
    state = load_state()
    inbound = fetch_inbound()

    # First-run seeding: the connector doesn't return message dates, so on the
    # very first run we mark ALL existing inbound messages as processed. This
    # prevents the router from replying to stale/historical messages (e.g. old
    # "cancel therapy" texts from August) and only handles messages that arrive
    # AFTER deployment.
    if not state.get("seeded"):
        for msg in inbound:
            state["processed"][msg["sid"]] = "seeded"
        state["seeded"] = True
        save_state(state)
        print(f"[router] seeded {len(inbound)} existing inbound messages (first run)")
        return

    handled = 0
    for msg in inbound:
        sid = msg["sid"]
        if sid in state["processed"]:
            continue
        frm = msg["from"]
        if frm not in ALLOWED_SENDERS:
            state["processed"][sid] = "blocked"
            continue
        body = msg["body"].strip()
        intent = classify(body)
        if intent == "shopping":
            reply = handle_shopping(body)
        elif intent == "todo":
            reply = handle_todo(body)
        elif intent == "cancel":
            reply = handle_cancel(body)
        elif intent == "calendar_add":
            reply = handle_calendar_add(body)
        elif intent == "week":
            reply = handle_week()
        elif intent == "conflicts":
            reply = handle_conflicts()
        elif intent == "due":
            reply = handle_due()
        elif intent == "meal":
            reply = handle_meal()
        elif intent == "help":
            reply = HELP_TEXT
        else:
            reply = handle_fallback(body)

        if dry_run:
            print(f"[dry-run] from={frm} intent={intent}\n  in: {body}\n  out: {reply}\n")
        else:
            ok = send_reply(frm, reply)
            print(f"[sms] {frm} intent={intent} replied={ok}")
        state["processed"][sid] = intent
        handled += 1

    save_state(state)
    if handled == 0:
        print("[router] no new inbound messages")

if __name__ == "__main__":
    main()
