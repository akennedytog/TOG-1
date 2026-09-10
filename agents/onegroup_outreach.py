#!/usr/bin/env python3
"""
OneGroup Growth Engine — Outreach & Follow-up Engine

Drafts short, personalized outreach and follow-ups for OneGroup AI leads.
Leads with a useful observation, not a generic pitch. Follow-ups add value each
time. Checks prior contact to prevent duplicate/conflicting outreach.

OUTREACH FORMULA (per spec):
  - Relevant business observation
  - Specific operational or revenue opportunity
  - Low-pressure offer to discuss or share a quick idea
  - Simple call to action

USAGE:
  python3 onegroup_outreach.py --draft <lead_id>            # draft first outreach
  python3 onegroup_outreach.py --followup <lead_id>        # draft next follow-up
  python3 onegroup_outreach.py --briefing <lead_id>         # discovery-call prep briefing
  python3 onegroup_outreach.py --check <lead_id>            # show contact history
  python3 onegroup_outreach.py --log <lead_id> --sent <text>  # record an outreach sent

Requires: onegroup_pipeline.py for lead data. Drafts are for Alec's review —
nothing is sent automatically.
"""
import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
sys.path.insert(0, str(WS / "agents"))
from onegroup_pipeline import load_pipeline, save_pipeline, update_lead

# Industry-specific observations (evidence-based, framed as observations)
INDUSTRY_OBSERVATIONS = {
    "hvac": "Most HVAC companies lose after-hours calls to voicemail — and those leads often book with whoever answers first.",
    "plumbing": "Plumbing leads are urgent. A 30-minute reply delay can mean the job goes to a competitor.",
    "roof": "Roofing is seasonal and competitive — fast follow-up on estimates is often the difference between booked and ghosted.",
    "restoration": "Restoration is emergency-driven. Speed of response is the entire game.",
    "law": "Law firms spend hours on intake and follow-up that a simple system could handle overnight.",
    "account": "Accounting firms do a lot of repetitive data entry and client follow-up that could be automated.",
    "insurance": "Insurance agencies juggle quotes and follow-ups across many carriers — easy to drop a lead.",
    "real estate": "Real estate teams lose deals when leads aren't followed up within minutes.",
    "mortgage": "Mortgage leads are time-sensitive — a slow response often means a lost application.",
    "recruit": "Recruiting is a volume follow-up game — most candidates go cold without fast, consistent outreach.",
    "med spa": "Med spas book appointments manually and miss after-hours booking demand.",
    "dental": "Dental practices lose patients to no-shows and slow appointment booking.",
    "auto": "Auto services miss after-hours service requests and repeat-business follow-ups.",
    "venue": "Venues handle a high volume of inquiries and bookings that could be automated.",
    "restaurant": "Restaurants get lots of reservation and catering inquiries that need fast response.",
    "hotel": "Hotels field many booking and inquiry messages that could be handled automatically.",
    "event": "Event companies juggle inquiries, quotes, and follow-ups across many clients.",
    "dealership": "Dealerships lose leads when follow-up is slow or inconsistent.",
    "distributor": "Distributors have repetitive order and inquiry workflows that could be automated.",
    "agency": "Agencies spend too much time on reporting and client follow-up instead of the work.",
    "healthcare": "Healthcare practices lose patients to slow scheduling and no-show follow-up.",
}

# Follow-up value-add angles (each follow-up adds value, not just 'checking in')
FOLLOWUP_ANGLES = [
    "A quick idea: most businesses in your space see the biggest win from automating the first response to a new lead.",
    "One observation: the businesses that reply fastest tend to win the most jobs — speed is often the deciding factor.",
    "A useful question: how many leads do you think you lose to slow follow-up each month?",
    "A short example: a similar business automated after-hours calls and stopped missing booking requests entirely.",
    "A practical tip: you don't need a big system — one agent that answers, qualifies, and books covers most of the value.",
]


def get_lead(lead_id):
    p = load_pipeline()
    for lead in p["leads"]:
        if lead["id"] == lead_id:
            return lead
    return None


def industry_observation(lead):
    """Return a relevant observation for the lead's industry."""
    ind = (lead.get("industry", "") or "").lower()
    for key, obs in INDUSTRY_OBSERVATIONS.items():
        if key in ind:
            return obs
    return "Most businesses in your space have a repetitive workflow that's eating time and losing leads."


def draft_outreach(lead):
    """Draft first outreach — leads with an observation, not a pitch."""
    obs = industry_observation(lead)
    company = lead.get("company", "your business")
    return (
        f"Hi {company} team,\n\n"
        f"{obs}\n\n"
        f"I help businesses like yours set up simple AI systems that handle the repetitive work — "
        f"answering leads, booking appointments, following up — so your team can focus on the work that matters.\n\n"
        f"Happy to share a quick idea specific to {company} — no pitch, just a 10-minute look at where "
        f"automation could save you time.\n\n"
        f"Worth a quick chat?\n\n"
        f"— Alec Kennedy\n"
        f"The One Group | AI systems for SMBs\n"
        f"502-403-7201"
    )


def draft_followup(lead, step):
    """Draft a follow-up that adds value. step = which follow-up (1, 2, 3...)."""
    company = lead.get("company", "your business")
    angle = FOLLOWUP_ANGLES[(step - 1) % len(FOLLOWUP_ANGLES)]
    return (
        f"Hi {company} team,\n\n"
        f"{angle}\n\n"
        f"Happy to share a concrete example of how this works for a business your size — "
        f"no obligation, just a useful look.\n\n"
        f"Want me to send it over?\n\n"
        f"— Alec Kennedy\n"
        f"The One Group"
    )


def check_contact(lead):
    """Show contact history to prevent duplicate outreach."""
    history = lead.get("history", [])
    if not history:
        return f"No prior outreach recorded for {lead.get('company','')}."
    lines = [f"Contact history for {lead.get('company','')}:"]
    for h in history:
        if h.get("type") == "outreach":
            lines.append(f"  • {h.get('at','')}: {h.get('text','')[:60]}...")
    return "\n".join(lines) if len(lines) > 1 else "No outreach recorded."


def log_outreach(lead_id, text):
    """Record an outreach sent (for dedup + history)."""
    lead = get_lead(lead_id)
    if not lead:
        return "Lead not found."
    lead.setdefault("history", []).append({
        "type": "outreach",
        "at": datetime.now().isoformat(),
        "text": text,
    })
    lead["contacted"] = True
    lead["last_contact"] = datetime.now().isoformat()
    update_lead(lead_id, contacted=True, last_contact=lead["last_contact"])
    # Re-save history (update_lead doesn't touch history)
    p = load_pipeline()
    for l in p["leads"]:
        if l["id"] == lead_id:
            l["history"] = lead["history"]
    save_pipeline(p)
    return f"✅ Logged outreach for {lead.get('company','')}."


def briefing(lead):
    """Discovery-call prep briefing per spec."""
    company = lead.get("company", "")
    ind = lead.get("industry", "")
    obs = industry_observation(lead)
    return (
        f"📋 Discovery Call Briefing — {company}\n\n"
        f"WHO: {company} ({ind or 'unknown industry'}), {lead.get('city','unknown location')}\n\n"
        f"LIKELY PROBLEM: {obs}\n\n"
        f"EVIDENCE: {lead.get('problem_note','') or 'Lead identified via ' + (lead.get('source','') or 'research') + '; score ' + str(lead.get('score','-')) + '/10.'}\n\n"
        f"THREE DISCOVERY QUESTIONS:\n"
        f"  1. What's the biggest time sink in your day-to-day operations right now?\n"
        f"  2. How do you currently handle new leads — and how fast do you respond?\n"
        f"  3. What would you automate first if you could pick one thing?\n\n"
        f"OFFER DIRECTION: A simple lead-response or follow-up system (answers, qualifies, books) — start small, measure, scale.\n\n"
        f"POTENTIAL OBJECTIONS:\n"
        f"  • 'We already tried AI' → clarify: most bought tools they don't use; we start with one system that works.\n"
        f"  • 'Too expensive' → frame ROI: one extra client covers the cost.\n"
        f"  • 'We're too busy to set it up' → we handle implementation; they review.\n\n"
        f"NEXT STEP AFTER CALL: Send a concise recap + recommended scope + proposal outline."
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--draft", help="lead id")
    ap.add_argument("--followup", help="lead id")
    ap.add_argument("--step", type=int, default=1, help="follow-up step number")
    ap.add_argument("--briefing", help="lead id")
    ap.add_argument("--check", help="lead id")
    ap.add_argument("--log", help="lead id")
    ap.add_argument("--sent", help="outreach text to log (with --log)")
    args = ap.parse_args()

    if args.draft:
        lead = get_lead(args.draft)
        if not lead:
            print("Lead not found.")
            return
        print(draft_outreach(lead))
        return
    if args.followup:
        lead = get_lead(args.followup)
        if not lead:
            print("Lead not found.")
            return
        print(draft_followup(lead, args.step))
        return
    if args.briefing:
        lead = get_lead(args.briefing)
        if not lead:
            print("Lead not found.")
            return
        print(briefing(lead))
        return
    if args.check:
        lead = get_lead(args.check)
        if not lead:
            print("Lead not found.")
            return
        print(check_contact(lead))
        return
    if args.log:
        if not args.sent:
            print("Provide --sent text to log.")
            return
        print(log_outreach(args.log, args.sent))
        return
    ap.print_help()


if __name__ == "__main__":
    main()
