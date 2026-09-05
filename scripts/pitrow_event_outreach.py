#!/usr/bin/env python3
"""
Pit Row Miami — Event Outreach Pipeline (v2)
Sends the event-specific sequence (cars & coffee / car shows / corporate events)
from info@pitrowmiami.com via Resend.

SAFETY: Never sends unless PITROW_SEND=1. Warm-up batching enforced.
Usage:
  python3 scripts/pitrow_event_outreach.py --status
  python3 scripts/pitrow_event_outreach.py --preview
  python3 scripts/pitrow_event_outreach.py --send
  python3 scripts/pitrow_event_outreach.py --send --force
"""
import os, sys, json, re, time, argparse, datetime
from pathlib import Path

WORKSPACE = Path(os.path.expanduser("~/.openclaw/workspace"))
DATA_DIR = WORKSPACE / "data"
STATE_FILE = DATA_DIR / "pitrow_event_outreach_state.json"
TARGETS_FILE = DATA_DIR / "pitrow_event_targets.json"
SELL_SHEET = WORKSPACE / "out" / "pitrow-sell-sheet.pdf"

FROM_NAME = "Pit Row Miami"
FROM_EMAIL = "info@pitrowmiami.com"
SIGNATURE = "Alec Kennedy\nPit Row Miami | info@pitrowmiami.com | (954) 800-2162\npitrowmiami.com"

DEFAULT_MAX_PER_DAY = 15
FOLLOWUP_DAYS = {2: 3, 3: 7, 4: 14}

EMAILS = {
    1: {
        "subject": "A race activation that packs your event 🏎️",
        "body": """Hi {first_name},

Quick one — I run Pit Row Miami, and we bring two professional F1 racing simulators to events across South Florida. We race F1 head-to-head on 48" screens, and people line up for it.

The pitch for your {event_type}:

• We deliver, set up, and staff two Fanatec rigs — your team does nothing
• It's a proven crowd-puller: racing draws people in, keeps them hanging around, and gives you shareable content
• From $1,200/day, turnkey

Events use it to:
• Draw a bigger crowd to the {event_type}
• Give sponsors a visual centerpiece that's photogenic
• Keep attendees on-site longer (more time for vendors/sponsors)
• Generate social content — head-to-head racing moments market the event for free

I've attached a one-page sell sheet. Want me to send over a few dates that work?

Best,
{signature}""",
        "attach": True,
    },
    2: {
        "subject": "Re: A race activation that packs your event",
        "body": """Hi {first_name},

Just floating this back to the top — I know inboxes get busy.

We've got open dates in the next few weeks, and I wanted to make sure you saw the sell sheet. Short version:

• Two pro F1 simulators, delivered + staffed, from $1,200/day
• A visual centerpiece that pulls a crowd and generates content
• Zero setup for your team — we handle everything

If a race activation isn't the right fit for this event, no problem. But if you've got a date coming up, I'd love to lock it in before the calendar fills.

Want me to send over a couple of dates that work?

Best,
Alec""",
        "attach": False,
    },
    3: {
        "subject": "An event near you just added racing — here's what it did",
        "body": """Hi {first_name},

Thought you might find this useful — an event organizer near you recently added a Pit Row activation, and the two things that stood out:

1. Foot traffic — the racing rigs pulled people in and kept them around longer, not just passing through.
2. Content — they got hours of shareable racing footage that kept marketing the event for weeks after.

That's the pitch in a nutshell: we bring the experience, you get the crowd and the content.

If you'd like to see how it'd work at your event, I can send over a quick custom proposal — no obligation.

Best,
Alec""",
        "attach": False,
    },
    4: {
        "subject": "Closing the loop on Pit Row Miami",
        "body": """Hi {first_name},

I'll keep this short — I know you're busy, and I don't want to be a pest.

We've sent a few notes about bringing our F1 simulators to your {event_type}. If it's not a fit right now, totally understand — just reply "not interested" and I'll leave you alone.

But if there's any chance you'd want a race activation in the next few months, the sell sheet is attached and my calendar's open. One reply is all it takes.

Thanks for your time either way.

Best,
{signature}""",
        "attach": True,
    },
}


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"leads": {}, "sent_today": 0, "last_send_date": None}


def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))


def load_targets():
    d = json.loads(TARGETS_FILE.read_text())
    return d["targets"]


def first_name(name):
    if not name:
        return "there"
    words = re.sub(r"[^A-Za-z0-9\s'\-]", "", name).split()
    if not words:
        return "there"
    return words[0].capitalize()


def render(email_num, t):
    tpl = EMAILS[email_num]
    # Greet a named contact if we have one; otherwise fall back to a safe "there".
    # Never use the org/event name as a first name ("Hi International" is broken).
    contact = t.get("contact_name")
    greeting = first_name(contact) if contact else "there"
    body = tpl["body"].format(
        first_name=greeting,
        event_type=t.get("event_type") or "event",
        signature=SIGNATURE,
    )
    return tpl["subject"], body


def send_email(to, subject, body, attach=False):
    key = os.environ.get("RESEND_API_KEY")
    if not key:
        env_file = Path(os.path.expanduser("~/.openclaw/.env"))
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.startswith("RESEND_API_KEY="):
                    key = line.split("=", 1)[1].strip()
    if not key:
        return False, "no RESEND_API_KEY"
    import urllib.request
    payload = {
        "from": f"{FROM_NAME} <{FROM_EMAIL}>",
        "to": [to],
        "subject": subject,
        "text": body,
    }
    if attach and SELL_SHEET.exists():
        import base64
        payload["attachments"] = [{
            "filename": "pitrow-sell-sheet.pdf",
            "content": base64.b64encode(SELL_SHEET.read_bytes()).decode(),
        }]
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            return True, data.get("id", "sent")
    except Exception as e:
        return False, str(e)


def status():
    state = load_state()
    targets = load_targets()
    leads = state["leads"]
    print(f"Event targets in list: {len(targets)}")
    print(f"Leads tracked: {len(leads)}")
    print(f"Sent today: {state.get('sent_today', 0)} (last: {state.get('last_send_date')})")
    stages = {}
    for email, info in leads.items():
        stage = info.get("stage", 0)
        stages[stage] = stages.get(stage, 0) + 1
    print("Stage breakdown (0=not started, 1-4=email sent):")
    for s in sorted(stages):
        print(f"  Stage {s}: {stages[s]}")
    replied = sum(1 for i in leads.values() if i.get("replied"))
    print(f"Replied: {replied}")


def preview():
    state = load_state()
    targets = load_targets()
    leads = state["leads"]
    today = datetime.date.today()
    batch = []
    for t in targets:
        email = t["email"].lower()
        info = leads.get(email)
        if not info:
            batch.append((t, 1, "Email 1 (new)"))
        else:
            stage = info.get("stage", 0)
            if info.get("replied") or info.get("opted_out") or stage >= 4:
                continue
            sent_date = info.get("sent_dates", {}).get(str(stage))
            if sent_date:
                sd = datetime.date.fromisoformat(sent_date)
                due_day = FOLLOWUP_DAYS.get(stage + 1)
                if due_day and (today - sd).days >= due_day:
                    batch.append((t, stage + 1, f"Email {stage+1} (follow-up)"))
    print(f"Next batch candidates: {len(batch)}")
    for t, stage, label in batch[:20]:
        print(f"  [{label}] {t.get('name','')[:35]:35} | {t['email']}")


def send_batch(force=False):
    state = load_state()
    targets = load_targets()
    leads = state["leads"]
    today = datetime.date.today()
    today_str = today.isoformat()
    if state.get("last_send_date") != today_str:
        state["sent_today"] = 0
        state["last_send_date"] = today_str
    max_per_day = int(os.environ.get("PITROW_MAX_PER_DAY", DEFAULT_MAX_PER_DAY))
    remaining = max_per_day - state.get("sent_today", 0)
    if remaining <= 0 and not force:
        print(f"Warm-up limit reached ({max_per_day}/day). Run tomorrow or use --force.")
        return
    batch = []
    for t in targets:
        email = t["email"].lower()
        info = leads.get(email)
        if not info:
            batch.append((t, 1))
        else:
            stage = info.get("stage", 0)
            if info.get("replied") or info.get("opted_out") or stage >= 4:
                continue
            sent_date = info.get("sent_dates", {}).get(str(stage))
            if sent_date:
                sd = datetime.date.fromisoformat(sent_date)
                due_day = FOLLOWUP_DAYS.get(stage + 1)
                if due_day and (today - sd).days >= due_day:
                    batch.append((t, stage + 1))
    if not batch:
        print("No emails due to send right now.")
        return
    to_send = batch[:remaining] if not force else batch
    print(f"Sending {len(to_send)} emails (limit {max_per_day}/day, {remaining} remaining)...")
    sent = 0
    for t, stage in to_send:
        email = t["email"].lower()
        subject, body = render(stage, t)
        ok, result = send_email(email, subject, body, attach=EMAILS[stage]["attach"])
        if ok:
            info = leads.setdefault(email, {"name": t.get("name",""), "event_type": t.get("event_type",""), "stage": 0, "sent_dates": {}, "replied": False, "opted_out": False})
            info["stage"] = stage
            info["sent_dates"][str(stage)] = today_str
            info["last_sent"] = today_str
            state["sent_today"] = state.get("sent_today", 0) + 1
            sent += 1
            print(f"  ✅ [{stage}] {t.get('name','')[:35]:35} -> {email} ({result})")
        else:
            print(f"  ❌ [{stage}] {t.get('name','')[:35]:35} -> {email}: {result}")
        time.sleep(1)
    save_state(state)
    print(f"\nDone. Sent {sent} this run. Total today: {state['sent_today']}.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--status", action="store_true")
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--send", action="store_true")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()
    if args.status:
        status()
    elif args.preview:
        preview()
    elif args.send:
        send_batch(force=args.force)
    else:
        ap.print_help()
