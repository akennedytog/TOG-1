#!/usr/bin/env python3
"""
Arlo -> Google Sheets sync (via Open Connector on localhost:3000)
Appends only NEW leads since last sync. State: data/lead_sheet_state.json
"""
import json, os, sys, urllib.request

WS = "/Users/aleckennedy/.openclaw/workspace"
FINDINGS = f"{WS}/data/arlo_findings.json"
STATE = f"{WS}/data/lead_sheet_state.json"
SHEET_ID = open(f"{WS}/data/lead_sheet_id.txt").read().strip()
API = "http://localhost:3000/v1/actions/googlesheets.spreadsheets_values_append"

def post(payload):
    req = urllib.request.Request(API, data=json.dumps({"input": payload}).encode(),
                                 headers={"content-type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def main():
    findings = json.load(open(FINDINGS))
    leads = findings.get("leads", [])
    try:
        state = json.load(open(STATE))
        synced = state.get("synced_count", 0)
    except (FileNotFoundError, json.JSONDecodeError):
        # First run: sync only today's batch, don't backfill history
        synced = max(0, len(leads) - findings.get("new_today", 20))
    new = leads[synced:]
    if not new:
        print("no new leads to sync"); return
    rows = []
    for l in new:
        rows.append([
            (l.get("discovered_at") or findings.get("date") or "")[:10],
            l.get("business_name") or l.get("name") or "",
            l.get("industry", ""), l.get("city", ""), l.get("website", ""),
            l.get("phone", ""), l.get("score", ""), l.get("priority", ""),
            l.get("status", "new"), (l.get("notes") or "")[:200],
        ])
    resp = post({"spreadsheetId": SHEET_ID, "range": "Sheet1!A1",
                 "valueInputOption": "USER_ENTERED", "values": rows})
    if resp.get("success"):
        json.dump({"synced_count": synced + len(new)}, open(STATE, "w"))
        print(f"synced {len(new)} leads (total synced: {synced + len(new)})")
    else:
        print("SYNC FAILED:", json.dumps(resp)[:300]); sys.exit(1)

if __name__ == "__main__":
    main()
