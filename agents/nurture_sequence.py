#!/usr/bin/env python3
"""
Email Nurture Sequence — The One Group
Turns non-converting leads into customers with a 5-email follow-up cadence.

The 5-email arc (from EMAIL_NURTURE_SEQUENCE.md):
  E1 Day 0  — Immediate welcome (after audit report sent)
  E2 Day 3  — Value add (the #1 AI mistake)
  E3 Day 7  — Social proof (case study)
  E4 Day 14 — Objection handling (FAQ)
  E5 Day 30 — Final offer (first month free + guarantee)

State: data/nurture_state.json — tracks each lead's stage + next_due date.
Run:  python3 agents/nurture_sequence.py --dry-run   (preview)
      python3 agents/nurture_sequence.py --send      (send due emails)
      python3 agents/nurture_sequence.py --add <email> <name> <business> [--start-day 0]
"""
import argparse, json, os, re, sys, time
from datetime import datetime, timedelta
from pathlib import Path

WS = Path(__file__).resolve().parent.parent
STATE_FILE = WS / "data" / "nurture_state.json"
API = "http://127.0.0.1:3000/v1/actions/"
SIGNATURE = (
    "--\nAlec Kennedy | The One Group.AI\n"
    "Founder | CEO | (c) 754.799.8676 | akennedy@theonegroup.info"
)

# ---- The 5-email sequence (templates) ----
# Each is a function(lead) -> (subject, body). [First Name] / [Business] filled in.

def e1(lead):
    subj = "Your AI Visibility Report is Ready 📊"
    body = (
        f"Hi {lead['first']},\n\n"
        f"Your AI Visibility Audit for {lead['business']} is attached.\n\n"
        f"Quick summary:\n"
        f"• Score: [X]/100 ([Rating])\n"
        f"• Top priority: [Issue]\n"
        f"• Estimated impact: [X]% improvement\n\n"
        f"Questions? Just reply to this email.\n\n"
        f"If you'd like help implementing these fixes, I offer two options:\n\n"
        f"DIY: Use the report and implement yourself (free)\n"
        f"Done-For-You: I handle everything ($2,500 setup + $500/month)\n\n"
        f"Either way, hope this helps!\n\n{SIGNATURE}"
    )
    return subj, body

def e2(lead):
    subj = "Quick tip: The #1 AI mistake I see"
    body = (
        f"Hi {lead['first']},\n\n"
        f"Quick follow-up on your audit.\n\n"
        f"The #1 mistake I see businesses make?\n\n"
        f"They try to automate everything at once.\n\n"
        f"Don't.\n\n"
        f"Pick ONE task that:\n"
        f"• Takes 30+ minutes/week\n"
        f"• Happens repeatedly\n"
        f"• Doesn't require your unique expertise\n\n"
        f"Automate that first. Get it working. Then expand.\n\n"
        f"That's how a client saved 10 hours/week. Not by doing everything—by doing one thing really well.\n\n"
        f"Want help identifying your highest-impact automation? Just reply.\n\n{SIGNATURE}"
    )
    return subj, body

def e3(lead):
    subj = "How a similar business saved 10 hours/week"
    body = (
        f"Hi {lead['first']},\n\n"
        f"Thought you might find this interesting.\n\n"
        f"A {lead['industry'] or 'similar'} business in {lead['city'] or 'your area'} was struggling with the same issue I flagged in your audit.\n\n"
        f"Here's what they did:\n"
        f"[2-3 sentences about their solution]\n\n"
        f"Results:\n"
        f"• 40% faster response time\n"
        f"• 10 hours saved per week\n"
        f"• 3x more meetings booked\n\n"
        f"Full case study: [link]\n\n"
        f"Want similar results for {lead['business']}?\n\n"
        f"Book a 15-minute call: [Calendly link]\n\n"
        f"Best,\nAlec\n\n"
        f"P.S. No pressure—just wanted to show what's possible."
    )
    return subj, body

def e4(lead):
    subj = '"Is this too complicated?" (and other questions)'
    body = (
        f"Hi {lead['first']},\n\n"
        f"I've been helping businesses with AI automation for a while now.\n\n"
        f"The most common questions I get:\n\n"
        f"Q: \"Is this too complicated for my team?\"\n"
        f"A: If you can use email and calendar, you can use this. I handle all the technical setup.\n\n"
        f"Q: \"What if it doesn't work for my business?\"\n"
        f"A: I only take on projects I'm confident will succeed. If I'm not sure, I'll tell you upfront.\n\n"
        f"Q: \"How long until we see results?\"\n"
        f"A: Most clients see measurable improvements within 30 days.\n\n"
        f"Q: \"Is it worth the investment?\"\n"
        f"A: If I save you 10 hours/week at $50/hour, that's $26,000/year in value. Your investment: $2,500.\n\n"
        f"Have other questions? Just reply.\n\n{SIGNATURE}"
    )
    return subj, body

def e5(lead):
    subj = "Last call: Free AI audit follow-up"
    body = (
        f"Hi {lead['first']},\n\n"
        f"This is my last email about your AI Visibility Audit.\n\n"
        f"If you're not interested in moving forward, no worries at all. I'll just check in again in a few months.\n\n"
        f"But if you're on the fence, I have an offer:\n\n"
        f"Book a project this week and get:\n"
        f"• First month FREE (save $500)\n"
        f"• Priority onboarding\n"
        f"• 60-day guarantee: If you don't see results, I'll work for free\n\n"
        f"This offer expires Friday at midnight.\n\n"
        f"Interested? Book here: [Calendly link]\n\n"
        f"Either way, good luck with everything!\n\n"
        f"Best,\nAlec\n\n"
        f"P.S. If now's not the right time, totally understand. Just hit reply and let me know."
    )
    return subj, body

SEQUENCE = [e1, e2, e3, e4, e5]
# Day offsets for each email (0, 3, 7, 14, 30)
DAY_OFFSETS = [0, 3, 7, 14, 30]


# ---------- State ----------

def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"leads": {}}

def save_state(state):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2))


# ---------- Gmail send (via open-connector is not callable from script; use Gmail API directly) ----------

def create_draft(to, subject, body, attempts=3):
    """Create a Gmail draft via the open-connector API (same path iris_real.py uses).
    Returns True on success. Drafts (not auto-send) so Alec reviews before sending."""
    import urllib.request
    payload = {"input": {"to": to, "subject": subject, "body": body}}
    req = urllib.request.Request(API + "gmail.create_draft",
                                 data=json.dumps(payload).encode(),
                                 headers={"content-type": "application/json"})
    for i in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                resp = json.load(r)
                if resp.get("success"):
                    return True
                print(f"  ❌ draft failed for {to}: {resp}")
                return False
        except Exception as e:
            if i < attempts - 1:
                wait = 2 ** i
                print(f"  ⚠️ retry {i+1}/{attempts} for {to} after {wait}s – {e}")
                time.sleep(wait)
            else:
                print(f"  ❌ final failure for {to}: {e}")
                return False
    return False


# ---------- Commands ----------

def cmd_add(args):
    state = load_state()
    email = args.email.strip().lower()
    if email in state["leads"]:
        print(f"⚠️  {email} already in nurture. Skipping.")
        return
    start_day = args.start_day or 0
    state["leads"][email] = {
        "first": args.name.strip(),
        "business": args.business.strip(),
        "industry": args.industry or "",
        "city": args.city or "",
        "stage": 0,  # emails 1..5 sent; stage = number sent so far
        "added": datetime.now().isoformat(),
        "next_due": (datetime.now() + timedelta(days=DAY_OFFSETS[start_day])).isoformat(),
        "converted": False,
    }
    save_state(state)
    print(f"✅ Added {email} to nurture (starts at email {start_day+1}).")

def cmd_send(args):
    state = load_state()
    now = datetime.now()
    due = []
    for email, lead in state["leads"].items():
        if lead.get("converted"):
            continue
        if lead["stage"] >= len(SEQUENCE):
            continue
        next_due = datetime.fromisoformat(lead["next_due"])
        if next_due <= now:
            due.append((email, lead))
    if not due:
        print("No nurture emails due right now.")
        return
    print(f"{len(due)} nurture email(s) due:")
    for email, lead in due:
        idx = lead["stage"]
        subj, body = SEQUENCE[idx](lead)
        print(f"\n  [{idx+1}/5] {email} — {subj}")
        if args.send:
            ok = create_draft(email, subj, body)
            if ok:
                lead["stage"] += 1
                lead[f"e{idx+1}_sent"] = datetime.now().isoformat()
                lead["next_due"] = (now + timedelta(days=DAY_OFFSETS[idx+1] - DAY_OFFSETS[idx])).isoformat()
            else:
                print(f"  ❌ draft failed for {email} — will retry next run")
        else:
            print(f"  (dry-run — would send email {idx+1})")
    if args.send:
        save_state(state)
        print("\n✅ State saved.")

def cmd_status(args):
    state = load_state()
    if not state["leads"]:
        print("No leads in nurture yet.")
        return
    print(f"{'Email':<40} {'Stage':<6} {'Next due':<22} Converted")
    for email, lead in state["leads"].items():
        nd = lead.get("next_due", "—")[:16]
        print(f"{email:<40} {lead['stage']}/5  {nd:<22} {lead.get('converted', False)}")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("add"); a.add_argument("email"); a.add_argument("name"); a.add_argument("business")
    a.add_argument("--industry", default=""); a.add_argument("--city", default=""); a.add_argument("--start-day", type=int, default=0)
    s = sub.add_parser("send"); s.add_argument("--send", action="store_true", help="actually send (default dry-run)")
    st = sub.add_parser("status")
    args = ap.parse_args()
    if args.cmd == "add": cmd_add(args)
    elif args.cmd == "send": cmd_send(args)
    elif args.cmd == "status": cmd_status(args)

if __name__ == "__main__":
    main()
