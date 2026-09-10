#!/usr/bin/env python3
"""
OneGroup Growth Engine — Pipeline Core

Formalizes the lead-to-client pipeline for OneGroup AI. Single source of truth
for pipeline stages, lead scoring, follow-up tracking, and reporting.

PIPELINE STAGES (per the Growth Engine spec):
  new_lead, researching, qualified, discovery_proposed, discovery_booked,
  discovery_completed, proposal_prep, proposal_sent, follow_up, verbal_yes,
  closed_won, closed_lost, nurture

Every active deal tracks: owner (Alec), next action, next-action date, a note on
the prospect's likely business problem, and estimated opportunity value.

USAGE:
  python3 onegroup_pipeline.py --leads                 # list all pipeline records
  python3 onegroup_pipeline.py --leads --stage qualified
  python3 onegroup_pipeline.py --add "Company|Industry|City|Source"
  python3 onegroup_pipeline.py --update <id> --stage discovery_booked --next "Send calendar link" --next-date 2026-09-12
  python3 onegroup_pipeline.py --score <id>            # re-score a lead
  python3 onegroup_pipeline.py --report daily          # daily pipeline report
  python3 onegroup_pipeline.py --report weekly         # weekly pipeline report
  python3 onegroup_pipeline.py --followups            # follow-ups due today
  python3 onegroup_pipeline.py --at-risk              # deals at risk of going cold
"""
import argparse
import json
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
PIPELINE_FILE = WS / "data" / "onegroup_pipeline.json"

STAGES = [
    "new_lead", "researching", "qualified", "discovery_proposed",
    "discovery_booked", "discovery_completed", "proposal_prep",
    "proposal_sent", "follow_up", "verbal_yes", "closed_won",
    "closed_lost", "nurture",
]

# Stages that count as "active" (not won/lost/nurture)
ACTIVE_STAGES = set(STAGES) - {"closed_won", "closed_lost", "nurture"}

# Default opportunity value by industry (rough, editable)
DEFAULT_VALUE = 5000


def load_pipeline():
    if PIPELINE_FILE.exists():
        try:
            return json.loads(PIPELINE_FILE.read_text())
        except Exception:
            pass
    return {"leads": [], "last_updated": None}


def save_pipeline(p):
    PIPELINE_FILE.parent.mkdir(parents=True, exist_ok=True)
    p["last_updated"] = datetime.now().isoformat()
    PIPELINE_FILE.write_text(json.dumps(p, indent=2))


def new_id():
    return f"og_{datetime.now().strftime('%Y%m%d%H%M%S')}_{len(load_pipeline()['leads'])}"


def add_lead(company, industry="", city="", source="manual", website="", phone="", notes=""):
    p = load_pipeline()
    lead = {
        "id": new_id(),
        "company": company,
        "industry": industry,
        "city": city,
        "website": website,
        "phone": phone,
        "source": source,
        "stage": "new_lead",
        "score": None,
        "priority": "nurture",
        "owner": "Alec",
        "next_action": "",
        "next_action_date": "",
        "problem_note": notes,
        "opportunity_value": DEFAULT_VALUE,
        "contacted": False,
        "last_contact": "",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "history": [],
    }
    p["leads"].append(lead)
    save_pipeline(p)
    return lead


def update_lead(lead_id, **fields):
    p = load_pipeline()
    for lead in p["leads"]:
        if lead["id"] == lead_id:
            for k, v in fields.items():
                if v is not None:
                    lead[k] = v
            lead["updated_at"] = datetime.now().isoformat()
            if "stage" in fields:
                lead["history"].append({
                    "at": datetime.now().isoformat(),
                    "stage": fields["stage"],
                })
            save_pipeline(p)
            return lead
    return None


def score_lead(lead):
    """Score a lead 0-10 based on fit signals. Returns (score, priority)."""
    score = 0
    signals = []
    t = (lead.get("company", "") + " " + lead.get("industry", "") + " " +
         lead.get("notes", "")).lower()

    # Industry fit (strong target categories)
    strong_industries = [
        "law", "legal", "account", "insurance", "real estate", "mortgage",
        "recruit", "hvac", "plumbing", "roof", "restoration", "med spa",
        "dental", "auto", "venue", "restaurant", "hotel", "event",
        "dealership", "distributor", "agency", "healthcare", "clinic",
    ]
    if any(k in t for k in strong_industries):
        score += 3
        signals.append("strong industry fit")

    # Location (South Florida priority)
    city = (lead.get("city", "") or "").lower()
    if any(k in city for k in ["miami", "fort lauderdale", "west palm", "boca",
                               "palm beach", "hollywood", "doral", "coral gables",
                               "hialeah", "pembroke", "miramar", "davie"]):
        score += 2
        signals.append("South Florida local")

    # Contact info present
    if lead.get("phone") or lead.get("website"):
        score += 1
        signals.append("has contact info")

    # Existing score from Arlo (if present)
    if lead.get("score") is not None:
        score += min(lead["score"], 4)
        signals.append("Arlo score signal")

    # Source quality
    if lead.get("source") in ("referral", "inbound", "website", "email_inquiry"):
        score += 2
        signals.append("inbound/referral source")

    score = min(score, 10)
    if score >= 7:
        priority = "high"
    elif score >= 4:
        priority = "medium"
    else:
        priority = "low"
    return score, priority, signals


def re_score_all():
    p = load_pipeline()
    for lead in p["leads"]:
        s, pri, _ = score_lead(lead)
        lead["score"] = s
        lead["priority"] = pri
    save_pipeline(p)
    return len(p["leads"])


def followups_due(days=0):
    """Leads with a next-action date <= today+days that are active."""
    p = load_pipeline()
    today = datetime.now().date()
    due = []
    for lead in p["leads"]:
        if lead["stage"] not in ACTIVE_STAGES:
            continue
        nad = lead.get("next_action_date", "")
        if not nad:
            continue
        try:
            d = datetime.strptime(nad, "%Y-%m-%d").date()
        except ValueError:
            continue
        if d <= today + timedelta(days=days):
            due.append(lead)
    return due


def at_risk(days=7):
    """Active deals with no contact in N days and no next action."""
    p = load_pipeline()
    today = datetime.now().date()
    risk = []
    for lead in p["leads"]:
        if lead["stage"] not in ACTIVE_STAGES:
            continue
        # No next action date set
        if not lead.get("next_action_date"):
            risk.append(lead)
            continue
        try:
            d = datetime.strptime(lead["next_action_date"], "%Y-%m-%d").date()
        except ValueError:
            risk.append(lead)
            continue
        if d < today - timedelta(days=days):
            risk.append(lead)
    return risk


def pipeline_by_stage():
    p = load_pipeline()
    counts = {s: 0 for s in STAGES}
    for lead in p["leads"]:
        counts[lead.get("stage", "new_lead")] = counts.get(lead.get("stage", "new_lead"), 0) + 1
    return counts


def pipeline_value():
    p = load_pipeline()
    total = 0
    for lead in p["leads"]:
        if lead["stage"] in ACTIVE_STAGES:
            total += lead.get("opportunity_value", DEFAULT_VALUE)
    return total


def fmt_lead(l):
    return (f"  [{l['id']}] {l.get('company','')} | {l.get('industry','')} | "
            f"{l.get('city','')} | stage={l.get('stage','')} | score={l.get('score','-')} | "
            f"next={l.get('next_action_date','-')}")


def daily_report():
    p = load_pipeline()
    today = datetime.now().strftime("%A %b %d")
    lines = [f"📊 OneGroup Pipeline — {today}"]
    # New leads (created today)
    new = [l for l in p["leads"] if l.get("created_at", "").startswith(datetime.now().strftime("%Y-%m-%d"))]
    lines.append(f"\n🆕 New leads: {len(new)}")
    for l in new[:5]:
        lines.append(fmt_lead(l))
    # Deals needing action today
    due = followups_due(0)
    lines.append(f"\n⏰ Action due today: {len(due)}")
    for l in due[:5]:
        lines.append(fmt_lead(l))
    # Follow-ups due
    fu = followups_due(3)
    lines.append(f"\n📅 Follow-ups due (3d): {len(fu)}")
    # Calls scheduled
    booked = [l for l in p["leads"] if l.get("stage") == "discovery_booked"]
    lines.append(f"\n📞 Calls booked: {len(booked)}")
    for l in booked[:5]:
        lines.append(fmt_lead(l))
    # At risk
    risk = at_risk(7)
    lines.append(f"\n⚠️ At risk of going cold: {len(risk)}")
    for l in risk[:5]:
        lines.append(fmt_lead(l))
    # Best action
    lines.append("\n💡 Best action today: " + (best_action(p)))
    return "\n".join(lines)


def best_action(p):
    """Pick the single highest-value action for today."""
    due = followups_due(0)
    if due:
        # Highest score active lead needing action
        best = max(due, key=lambda l: l.get("score") or 0)
        return f"Follow up with {best.get('company','')} (score {best.get('score','-')})"
    booked = [l for l in p["leads"] if l.get("stage") == "discovery_booked"]
    if booked:
        return f"Prepare for discovery call with {booked[0].get('company','')}"
    new = [l for l in p["leads"] if l.get("stage") == "new_lead"]
    if new:
        return f"Research + qualify {new[0].get('company','')}"
    return "No urgent pipeline action — focus on content or new lead gen."


def weekly_report():
    p = load_pipeline()
    lines = [f"🗓️ OneGroup Weekly Pipeline Report — {datetime.now().strftime('%b %d')}"]
    # Counts
    counts = pipeline_by_stage()
    lines.append("\n📈 Pipeline by stage:")
    for s in STAGES:
        if counts.get(s, 0):
            lines.append(f"  {s}: {counts[s]}")
    # Value
    lines.append(f"\n💰 Estimated pipeline value: ${pipeline_value():,}")
    # Bottlenecks
    lines.append("\n🔍 Bottlenecks:")
    if counts.get("new_lead", 0) > 5:
        lines.append("  • Many unqualified new leads — need research/qualification")
    if counts.get("discovery_proposed", 0) > 0 and counts.get("discovery_booked", 0) == 0:
        lines.append("  • Discovery proposed but none booked — follow up on proposals")
    if counts.get("proposal_sent", 0) > 0 and counts.get("verbal_yes", 0) == 0:
        lines.append("  • Proposals sent but no verbal yes — need follow-up")
    # Recommendations
    lines.append("\n🎯 Three recommended actions for next week:")
    recs = []
    due = followups_due(7)
    if due:
        recs.append(f"1. Follow up on {len(due)} deals with pending next actions")
    booked = [l for l in p["leads"] if l.get("stage") == "discovery_booked"]
    if booked:
        recs.append(f"2. Prepare for {len(booked)} booked discovery calls")
    new = [l for l in p["leads"] if l.get("stage") == "new_lead"]
    if new:
        recs.append(f"3. Qualify {len(new)} new leads in the pipeline")
    if not recs:
        recs.append("1. Generate new leads (Arlo search / content)")
        recs.append("2. Publish X content to build authority")
        recs.append("3. Nurture existing pipeline contacts")
    lines.extend(recs)
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--leads", action="store_true")
    ap.add_argument("--stage", help="filter leads by stage")
    ap.add_argument("--add", help="Company|Industry|City|Source")
    ap.add_argument("--update", help="lead id")
    ap.add_argument("--next", help="next action (with --update)")
    ap.add_argument("--next-date", help="next action date YYYY-MM-DD (with --update)")
    ap.add_argument("--stage-set", help="set stage (with --update)")
    ap.add_argument("--score", help="re-score a lead id, or 'all'")
    ap.add_argument("--report", choices=["daily", "weekly"])
    ap.add_argument("--followups", action="store_true")
    ap.add_argument("--at-risk", action="store_true")
    args = ap.parse_args()

    if args.add:
        parts = [x.strip() for x in args.add.split("|")]
        lead = add_lead(parts[0], parts[1] if len(parts) > 1 else "",
                        parts[2] if len(parts) > 2 else "",
                        parts[3] if len(parts) > 3 else "")
        s, pri, sig = score_lead(lead)
        lead["score"], lead["priority"] = s, pri
        save_pipeline(load_pipeline())
        print(f"✅ Added {lead['company']} (id {lead['id']}, score {s}, {pri})")
        return

    if args.score:
        if args.score == "all":
            n = re_score_all()
            print(f"Re-scored {n} leads.")
        else:
            p = load_pipeline()
            for lead in p["leads"]:
                if lead["id"] == args.score:
                    s, pri, sig = score_lead(lead)
                    lead["score"], lead["priority"] = s, pri
                    save_pipeline(p)
                    print(f"Re-scored {lead['company']}: {s}/10 ({pri})")
                    return
            print("Lead not found.")
        return

    if args.update:
        fields = {}
        if args.next:
            fields["next_action"] = args.next
        if args.next_date:
            fields["next_action_date"] = args.next_date
        if args.stage_set:
            fields["stage"] = args.stage_set
        lead = update_lead(args.update, **fields)
        if lead:
            print(f"✅ Updated {lead['company']}: stage={lead['stage']} next={lead['next_action_date']}")
        else:
            print("Lead not found.")
        return

    if args.report == "daily":
        print(daily_report())
        return
    if args.report == "weekly":
        print(weekly_report())
        return
    if args.followups:
        for l in followups_due(0):
            print(fmt_lead(l))
        return
    if args.at_risk:
        for l in at_risk(7):
            print(fmt_lead(l))
        return
    if args.leads:
        p = load_pipeline()
        leads = p["leads"]
        if args.stage:
            leads = [l for l in leads if l.get("stage") == args.stage]
        for l in leads:
            print(fmt_lead(l))
        print(f"\nTotal: {len(leads)}")
        return

    ap.print_help()


if __name__ == "__main__":
    main()
