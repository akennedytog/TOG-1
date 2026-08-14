#!/usr/bin/env python3
"""
Arlo → Iris Pipeline
Runs Arlo lead search, then Iris email drafting, then logs everything to the Google Sheet.
Designed to be called from a cron job.
"""
import subprocess, sys, json, time
from datetime import datetime
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
ARLO = WS / "agents/arlo_real.py"
IRIS = WS / "agents/iris_real.py"
FINDINGS = WS / "data/arlo_findings.json"

def run_arlo():
    """Run Arlo lead search. Returns number of new leads found."""
    print(f"🔍 Arlo starting...")
    r = subprocess.run([sys.executable, str(ARLO)], capture_output=True, text=True, timeout=300)
    print(r.stdout)
    if r.returncode != 0:
        print(f"⚠️ Arlo stderr: {r.stderr}")
        return 0
    # Parse new leads count
    for line in r.stdout.splitlines():
        if "REAL leads added" in line:
            try:
                return int(line.split()[1])
            except:
                pass
    return 0

def run_iris():
    """Run Iris email drafting. Returns counts."""
    print(f"\n✉️ Iris starting...")
    r = subprocess.run([sys.executable, str(IRIS)], capture_output=True, text=True, timeout=600)
    print(r.stdout)
    if r.returncode != 0:
        print(f"⚠️ Iris stderr: {r.stderr}")
    # Parse results
    email_drafts = 0
    call_listed = 0
    for line in r.stdout.splitlines():
        if "email drafts" in line:
            try:
                email_drafts = int(line.split()[1])
            except:
                pass
        if "call-list draft created" in line:
            call_listed = int(line.split("(")[1].split()[0]) if "(" in line else 0
    return email_drafts, call_listed

def main():
    print(f"🚀 Arlo → Iris Pipeline")
    print(f"Started: {datetime.now():%Y-%m-%d %H:%M:%S}")
    print("=" * 50)
    
    # Step 1: Run Arlo
    new_leads = run_arlo()
    
    # Step 2: Run Iris
    email_drafts, call_listed = run_iris()
    
    # Summary
    print("\n" + "=" * 50)
    print(f"📊 PIPELINE SUMMARY")
    print(f"   New leads found: {new_leads}")
    print(f"   Email drafts created: {email_drafts}")
    print(f"   Phone leads call-listed: {call_listed}")
    print(f"   Finished: {datetime.now():%Y-%m-%d %H:%M:%S}")
    
    # Save pipeline run record
    record = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "timestamp": datetime.now().isoformat(),
        "new_leads": new_leads,
        "email_drafts": email_drafts,
        "call_listed": call_listed
    }
    record_file = WS / "data/pipeline_runs.json"
    try:
        runs = json.load(open(record_file)) if record_file.exists() else []
    except:
        runs = []
    runs.append(record)
    json.dump(runs, open(record_file, "w"), indent=2)
    
    return record

if __name__ == "__main__":
    main()
