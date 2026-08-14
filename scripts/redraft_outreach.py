#!/usr/bin/env python3
"""
REDRAFT OUTREACH (2026-08-14)
Regenerate the Arlo mixed-SMB outreach drafts with the NEW industry-aware
pitch angles (trades=missed-calls, pro-services=speed/follow-up). Replaces
each existing draft in place: delete old draft, create new with same recipient.

Targets only leads that currently have an outreach draft (by recipient email).
Safe: never sends, never touches call-list drafts, never exceeds a batch cap.
"""
import json, re, time, urllib.request
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent / "agents"))

from iris_real import (
    email_prompt, ollama, clean_body, verify_body_clean, pick_ps,
    pitch_bucket, create_draft,
)

WS = Path("/Users/aleckennedy/.openclaw/workspace")
FINDINGS = WS / "data/arlo_findings.json"
API = "http://localhost:3000/v1/actions/"

# The 18 recipient emails that currently have outreach drafts (after dedupe).
TARGET_EMAILS = [
    "Figueroaland01@gmail.com", "mail@coolairservices.com", "BRRHGutin@baptisthealth.net",
    "tenetwestboca@datavant.com", "mrecords@mdnow.com", "info@palmbeachhealthnetwork.com",
    "support@onemedical.com", "alltimeairconditioning@gmail.com", "info@mallscenters.com",
    "adc@americandentalcareinc.com", "frontdesk@drsinghdds.com", "info@waterviewdentalgroup.com",
    "info@palmbeachinstituteofdentistry.com", "info@wolfeofrealestate.com", "homes@seanunderwood.com",
    "info@atlispm.com", "sherry.snider@coldwellbankerhomes.com", "highlightrealty@aol.com",
]


def norm(e):
    return (e or "").strip().lower().replace("mailto:", "")


def list_drafts_verbose():
    req = urllib.request.Request(
        API + "gmail.list_drafts",
        data=json.dumps({"input": {"verbose": True, "maxResults": 40}}).encode(),
        headers={"content-type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r).get("data", {}).get("drafts", [])


def delete_draft(draft_id):
    req = urllib.request.Request(
        API + "gmail.delete_draft",
        data=json.dumps({"input": {"draftId": draft_id}}).encode(),
        headers={"content-type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r).get("success")


def main():
    d = json.load(open(FINDINGS))
    leads = d.get("leads", [])

    # Build recipient -> draft id map from current drafts.
    drafts = list_drafts_verbose()
    draft_by_to = {}
    for dr in drafts:
        msg = dr.get("message") or {}
        hdrs = {h.get("name", "").lower(): h.get("value")
                for h in (msg.get("payload", {}).get("headers") or [])}
        to = norm(hdrs.get("to"))
        if to and to not in ("akennedy@theonegroup.info",):
            draft_by_to[to] = dr.get("id")

    # Build recipient -> lead map from data.
    lead_by_email = {}
    for l in leads:
        e = norm(l.get("email"))
        if e:
            lead_by_email.setdefault(e, l)

    made = 0
    skipped = 0
    for target in TARGET_EMAILS:
        tnorm = target.lower()
        lead = lead_by_email.get(tnorm)
        if not lead:
            print(f"⛔ no lead in data for {target}")
            continue

        print(f"\n=== {lead['name']} ({lead['industry']}) — {target} — bucket={pitch_bucket(lead.get('industry'))} ===")
        raw = ollama(email_prompt(lead))
        m = re.match(r"SUBJECT:\s*([^\n]+)\n\s*\n?(.*)", raw, re.S)
        subject = m.group(1).strip() if m else f"Quick question about {lead['name']}"
        body = clean_body(m.group(2).strip() if m else raw)
        body = body.rstrip() + "\n\n" + pick_ps(lead.get("industry", ""))

        if not verify_body_clean(body):
            print(f"  ⛔ GARBAGE — skipping {target}")
            skipped += 1
            continue

        old_id = draft_by_to.get(tnorm)
        # Delete old draft first (if it exists) so we don't stack duplicates.
        if old_id:
            try:
                delete_draft(old_id)
                print(f"  🗑️ deleted old draft {old_id}")
            except Exception as e:
                print(f"  ⚠️ could not delete old draft {old_id}: {e}")

        if create_draft(target, subject, body):
            made += 1
            print(f"  ✅ drafted — {subject}")
        else:
            print(f"  ❌ draft failed for {target}")
            skipped += 1

        time.sleep(1)  # gentle pacing

    print(f"\nDone. Drafted {made}, skipped/failed {skipped}.")


if __name__ == "__main__":
    main()
