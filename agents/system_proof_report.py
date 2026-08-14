#!/usr/bin/env python3
"""
System Proof Report — captures what the AI operating system actually did.
Turns real pipeline data into a shareable "proof of system" report.
Run weekly (or on demand) to show the receipts: leads found, drafts created,
HubSpot records, content queued.

Output: data/system_proof_report.md (and prints to stdout for delivery)
"""
import json, subprocess, sys
from datetime import datetime, timedelta
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")

def load_json(path, default):
    try:
        return json.load(open(path))
    except Exception:
        return default

def main():
    findings = load_json(WS / "data/arlo_findings.json", {"leads": []})
    runs = load_json(WS / "data/pipeline_runs.json", [])
    leads = findings.get("leads", [])

    # Lead stats
    total_leads = len(leads)
    with_email = sum(1 for l in leads if l.get("email"))
    phone_only = sum(1 for l in leads if l.get("phone") and not l.get("email"))
    drafted = sum(1 for l in leads if l.get("status") == "drafted")
    call_listed = sum(1 for l in leads if l.get("status") == "call_listed")
    new = sum(1 for l in leads if l.get("status") == "new")

    # This week's runs (last 7 days)
    week_ago = datetime.now() - timedelta(days=7)
    week_runs = [r for r in runs if datetime.fromisoformat(r.get("timestamp", "")).replace(tzinfo=None) >= week_ago.replace(tzinfo=None)] if runs else []
    week_leads = sum(r.get("new_leads", 0) for r in week_runs)
    week_drafts = sum(r.get("email_drafts", 0) for r in week_runs)

    # HubSpot count (via connector — search with high limit, count results)
    hs_companies = "?"
    try:
        r = subprocess.run([sys.executable, "-c", """
import json, urllib.request
req = urllib.request.Request("http://localhost:3000/v1/actions/hubspot.search_companies",
    data=json.dumps({"input":{"limit":100}}).encode(),
    headers={"content-type":"application/json"})
with urllib.request.urlopen(req, timeout=15) as resp:
    d = json.load(resp)
print(len(d.get("data",{}).get("results",[])))
"""], capture_output=True, text=True, timeout=20)
        hs_companies = r.stdout.strip() or "?"
    except Exception:
        pass

    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    report = f"""# 🤖 The One Group — System Proof Report

**Generated:** {now} | **What the AI operating system did**

---

## 📊 Pipeline Health

| Metric | Value |
|--------|-------|
| **Total leads in system** | {total_leads} |
| Leads with email | {with_email} |
| Phone-only leads | {phone_only} |
| Emails drafted (Gmail) | {drafted} |
| Leads call-listed | {call_listed} |
| Leads ready to process | {new} |
| HubSpot companies | {hs_companies} |

## 📈 This Week's Activity

| Metric | Value |
|--------|-------|
| New leads found | {week_leads} |
| Email drafts created | {week_drafts} |
| Pipeline runs | {len(week_runs)} |

## 🧠 What this proves

This report is generated **by the same AI system we sell**. Every lead above was
researched by Arlo (AI research agent), every email was drafted by Iris (AI
outreach agent), and every record was pushed to HubSpot automatically — no
manual data entry.

**We don't just sell AI automation. We run on it.**

---

*Generated automatically by the OpenClaw agent pipeline.*
"""
    out = WS / "data/system_proof_report.md"
    out.write_text(report)
    print(report)
    print(f"\n✅ Report saved to {out}")

    # Copy to Google Drive deliverables folder (keeps Drive copy fresh daily)
    drive = Path("/Users/aleckennedy/Library/CloudStorage/GoogleDrive-akennedy@theonegroup.info/My Drive/OpenClaw-Deliverables")
    try:
        if drive.exists():
            (drive / "System-Proof-Report.md").write_text(report)
            print(f"✅ Copied to Google Drive: {drive / 'System-Proof-Report.md'}")
        else:
            print("⚠️ Google Drive folder not found, skipped Drive copy")
    except Exception as e:
        print(f"⚠️ Drive copy failed: {e}")

if __name__ == "__main__":
    main()
