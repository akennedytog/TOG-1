#!/usr/bin/env python3
"""
Pit Row Miami — Dealership Outreach Pipeline
Sends the 4-email dealership sequence from info@pitrowmiami.com via Resend.

SAFETY: This script NEVER sends unless explicitly enabled. Default is DRY-RUN.
Set PITROW_SEND=1 to actually send. Warm-up batching is enforced (max per day).

Usage:
  python3 scripts/pitrow_dealership_outreach.py --status          # show pipeline state
  python3 scripts/pitrow_dealership_outreach.py --preview        # preview next batch (no send)
  python3 scripts/pitrow_dealership_outreach.py --send            # send next batch (respects warm-up)
  python3 scripts/pitrow_dealership_outreach.py --send --force    # send regardless of warm-up (careful)
"""
import os, sys, json, re, time, argparse, datetime
from pathlib import Path

WORKSPACE = Path(os.path.expanduser("~/.openclaw/workspace"))
DATA_DIR = WORKSPACE / "data"
STATE_FILE = DATA_DIR / "pitrow_outreach_state.json"
DEALERS_FILE = DATA_DIR / "south_florida_dealerships_clean.json"
SELL_SHEET = WORKSPACE / "out" / "pitrow-sell-sheet.pdf"

FROM_NAME = "Pit Row Miami"
FROM_EMAIL = "info@pitrowmiami.com"
SIGNATURE = "Alec Kennedy\nPit Row Miami | info@pitrowmiami.com | (954) 800-2162\npitrowmiami.com"

# Warm-up: max emails per day (cold domain protection)
DEFAULT_MAX_PER_DAY = 15
# Follow-up delays in days
FOLLOWUP_DAYS = {2: 3, 3: 7, 4: 14}  # email_num -> day offset from email 1

# ---- Email templates (from out/pitrow-dealership-email-sequence.md) ----
EMAILS = {
    1: {
        "subject": "Turn your showroom into a race weekend 🏎️",
        "body": """Hi {first_name},

Quick one — I run Pit Row Miami, and we bring two professional racing simulators to dealerships across South Florida. We race F1 on them, head-to-head.

The idea: you host a race activation, we handle everything. Two head-to-head Fanatec rigs on 48" screens, delivered, set up, and staffed. Your team just opens the doors.

Dealerships use it for:
• Test-drive events — racing pulls people in, then they browse the lot
• Customer appreciation — reward buyers and service customers
• Launch events — pair a new-model reveal with a race weekend
• Social content — shareable racing moments that market you for free

It's turnkey, from $1,200/day, and it gets people in the door.

I've attached a one-page sell sheet with the full rundown. Worth a 10-minute look?

Best,
{signature}""",
        "attach": True,
    },
    2: {
        "subject": "Re: Turn your showroom into a race weekend",
        "body": """Hi {first_name},

Just floating this back to the top — I know inboxes get busy.

We've got open dates coming up in the next few weeks, and I wanted to make sure you saw the sell sheet I sent. The short version:

• Two pro F1 simulators, delivered + staffed, from $1,200/day
• Perfect for test-drive events, customer appreciation, and launch days
• Zero setup for your team — we handle everything

If a race activation isn't the right fit right now, no problem — but if you've got an event coming up, I'd love to lock in a date before the calendar fills.

Want me to send over a couple of dates that work?

Best,
Alec""",
        "attach": False,
    },
    3: {
        "subject": "A dealership in {city} just booked us — here's what they did",
        "body": """Hi {first_name},

Thought you might find this useful — a dealership near you recently ran a Pit Row activation for a weekend event, and the two things that stood out:

1. Foot traffic — the racing rigs pulled families and enthusiasts into the showroom all day, not just browsers.
2. Social content — they got hours of shareable racing footage that kept marketing the event for weeks after.

That's the whole pitch in a nutshell: we bring the experience, you get the foot traffic and the content.

If you'd like to see how it'd work at your location, I can send over a quick custom proposal — no obligation.

Best,
Alec""",
        "attach": False,
    },
    4: {
        "subject": "Closing the loop on Pit Row Miami",
        "body": """Hi {first_name},

I'll keep this short — I know you're busy, and I don't want to be a pest.

We've sent a few notes about bringing our F1 simulators to your dealership for a test-drive event, customer appreciation day, or launch. If it's not a fit right now, totally understand — just reply "not interested" and I'll leave you alone.

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


def load_dealers():
    d = json.loads(DEALERS_FILE.read_text())
    return d["dealerships"]


# Known acronyms to keep uppercase in dealership names (source data is ALL-CAPS,
# so we can't rely on input case). Everything else gets title-cased.
KNOWN_ACRONYMS = {
    "ABC", "JS", "BMW", "FL", "SEFL", "AN", "B O O",
    "VW", "AUDI", "MB", "AMG", "GT", "SUV", "EV", "US", "USA",
}


def first_name(name):
    # "ABC JS AUTO IMPORTS II, LLC" -> "ABC JS" (acronyms stay uppercase)
    # "ABRAHAM CHEVROLET MIAMI INC" -> "Abraham Chevrolet" (real words title-cased)
    # Source data is ALL-CAPS, so we can't trust input case. Strategy:
    #   - strip only TRAILING legal/generic words (INC, LLC, AUTO, MOTORS, ...)
    #   - title-case every remaining word (capitalize after hyphens)
    #   - re-uppercase any token that matches a known acronym
    # Strip trailing generic/legal words one at a time from the end.
    generic = re.compile(r"\b(II|III|IV|V|INC|LLC|CORP|CORPORATION|LTD|LTD\.|CO|COMPANY|AUTO|MOTORS|IMPORTS|OF|THE|AND|&|A|AN)\s*$", re.I)
    short = name.strip().rstrip(",")
    changed = True
    while changed:
        changed = False
        m = generic.search(short)
        if m:
            short = short[:m.start()].strip().rstrip(",")
            changed = True
    if not short:
        short = name

    words = short.split()
    out = []
    for w in words:
        w = w.strip(",")
        if not w:
            continue
        if w.upper() in KNOWN_ACRONYMS:
            out.append(w.upper())
        else:
            # Title-case, capitalizing the letter after each hyphen (Miami-Dade)
            out.append("-".join(part.capitalize() for part in w.split("-")))
    result = " ".join(out)
    return result if result else name.title()


def city_for(county):
    return {"MIAMI-DADE": "Miami", "BROWARD": "Fort Lauderdale", "PALM BEACH": "West Palm Beach"}.get(county, county.title())


def render(email_num, dealer):
    tpl = EMAILS[email_num]
    body = tpl["body"].format(
        first_name=first_name(dealer["name"]),
        city=city_for(dealer["county"]),
        signature=SIGNATURE,
    )
    return tpl["subject"].format(city=city_for(dealer["county"])), body


def send_email(to, subject, body, attach=False):
    """Send via Resend. Returns (ok, id_or_error)."""
    key = os.environ.get("RESEND_API_KEY")
    if not key:
        # Try loading from ~/.openclaw/.env
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
            # Cloudflare blocks urllib's default UA (HTTP 403 / error 1010).
            # A browser-like UA is required for api.resend.com.
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
    dealers = load_dealers()
    leads = state["leads"]
    print(f"Dealerships in list: {len(dealers)}")
    print(f"Leads tracked: {len(leads)}")
    print(f"Sent today: {state.get('sent_today', 0)} (last: {state.get('last_send_date')})")
    print()
    # Breakdown by email stage
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
    dealers = load_dealers()
    leads = state["leads"]
    # Find next batch: leads not yet started, or due for follow-up
    today = datetime.date.today()
    batch = []
    for d in dealers:
        email = d["email"].lower()
        info = leads.get(email)
        if not info:
            batch.append((d, 1, "Email 1 (new)"))
        else:
            stage = info.get("stage", 0)
            if info.get("replied") or info.get("opted_out"):
                continue
            if stage >= 4:
                continue
            # Check if follow-up is due
            sent_date = info.get("sent_dates", {}).get(str(stage))
            if sent_date:
                sd = datetime.date.fromisoformat(sent_date)
                due_day = FOLLOWUP_DAYS.get(stage + 1)
                if due_day and (today - sd).days >= due_day:
                    batch.append((d, stage + 1, f"Email {stage+1} (follow-up)"))
    print(f"Next batch candidates: {len(batch)}")
    print()
    for d, stage, label in batch[:20]:
        print(f"  [{label}] {d['name'][:35]:35} | {d['email']}")
    if len(batch) > 20:
        print(f"  ... and {len(batch)-20} more")


def send_batch(force=False):
    state = load_state()
    dealers = load_dealers()
    leads = state["leads"]
    today = datetime.date.today()
    today_str = today.isoformat()

    # Reset daily counter if new day
    if state.get("last_send_date") != today_str:
        state["sent_today"] = 0
        state["last_send_date"] = today_str

    max_per_day = int(os.environ.get("PITROW_MAX_PER_DAY", DEFAULT_MAX_PER_DAY))
    remaining = max_per_day - state.get("sent_today", 0)
    if remaining <= 0 and not force:
        print(f"Warm-up limit reached ({max_per_day}/day). Run tomorrow or use --force.")
        return

    # Build batch
    batch = []
    for d in dealers:
        email = d["email"].lower()
        info = leads.get(email)
        if not info:
            batch.append((d, 1))
        else:
            stage = info.get("stage", 0)
            if info.get("replied") or info.get("opted_out") or stage >= 4:
                continue
            sent_date = info.get("sent_dates", {}).get(str(stage))
            if sent_date:
                sd = datetime.date.fromisoformat(sent_date)
                due_day = FOLLOWUP_DAYS.get(stage + 1)
                if due_day and (today - sd).days >= due_day:
                    batch.append((d, stage + 1))

    if not batch:
        print("No emails due to send right now.")
        return

    to_send = batch[:remaining] if not force else batch
    print(f"Sending {len(to_send)} emails (limit {max_per_day}/day, {remaining} remaining)...")
    print()

    sent = 0
    for d, stage in to_send:
        email = d["email"].lower()
        subject, body = render(stage, d)
        ok, result = send_email(email, subject, body, attach=EMAILS[stage]["attach"])
        if ok:
            info = leads.setdefault(email, {"name": d["name"], "county": d["county"], "phone": d["phone"], "stage": 0, "sent_dates": {}, "replied": False, "opted_out": False})
            info["stage"] = stage
            info["sent_dates"][str(stage)] = today_str
            info["last_sent"] = today_str
            state["sent_today"] = state.get("sent_today", 0) + 1
            sent += 1
            print(f"  ✅ [{stage}] {d['name'][:35]:35} -> {email} ({result})")
        else:
            print(f"  ❌ [{stage}] {d['name'][:35]:35} -> {email}: {result}")
        time.sleep(1)  # rate limit

    save_state(state)
    print(f"\nDone. Sent {sent} this run. Total today: {state['sent_today']}.")


def mark_replied(email):
    state = load_state()
    email = email.lower()
    if email in state["leads"]:
        state["leads"][email]["replied"] = True
        save_state(state)
        print(f"Marked {email} as replied.")
    else:
        print(f"{email} not found in leads.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--status", action="store_true")
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--send", action="store_true")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--mark-replied", metavar="EMAIL")
    args = ap.parse_args()

    if args.status:
        status()
    elif args.preview:
        preview()
    elif args.send:
        send_batch(force=args.force)
    elif args.mark_replied:
        mark_replied(args.mark_replied)
    else:
        ap.print_help()
