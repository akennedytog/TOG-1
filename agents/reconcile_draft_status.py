#!/usr/bin/env python3
"""
Reconcile Iris lead status vs actual Gmail sent-mail.

Problem: leads stay 'drafted' forever even after Alec sends the Gmail draft.
This script:
  1. Loads data/arlo_findings.json (leads with status 'drafted').
  2. Queries Gmail sent-mail (via local open-connector) for each drafted lead's
     email address to see if a message was actually SENT to them.
  3. If sent → mark lead status 'sent' (keep sent_at, sent_thread_id if available).
  4. Writes the file back, preserving everything else.

RUN: python3 agents/reconcile_draft_status.py [--dry-run]
Cron/use: run after each Iris draft batch + after Alec reports sending.

Requires open-connector on localhost:3000 with gmail configured.
"""
import json
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
FINDINGS = WS / "data/arlo_findings.json"
CONNECTOR = "http://localhost:3000/v1/actions"
FETCH = CONNECTOR + "/gmail.fetch_emails"


def _fetch_sent(to_addr, include_trash=False):
    """Return list of sent-message dicts to a given address (to: match)."""
    q = f"from:me to:{to_addr}"
    body = json.dumps({
        "input": {
            "query": q,
            "detail": "summary",
            "maxResults": 10,
            "includeSpamTrash": include_trash,
        }
    }).encode()
    req = urllib.request.Request(FETCH, data=body,
                                 headers={"content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read().decode())
    except Exception as e:
        print(f"  ⚠️ fetch failed for {to_addr}: {e}")
        return []
    msgs = data.get("data", {}).get("messages", [])
    # only actual SENT messages (not DRAFT label)
    return [m for m in msgs if "DRAFT" not in m.get("labelIds", [])]


def main():
    dry = "--dry-run" in sys.argv

    d = json.load(open(FINDINGS))
    leads = d["leads"]
    drafted = [l for l in leads if l.get("status") == "drafted"]

    print(f"Reconciling {len(drafted)} drafted leads against Gmail sent-mail...")
    updated = 0
    still_draft = 0
    for i, lead in enumerate(drafted):
        email = lead.get("email")
        if not email:
            continue
        sent = _fetch_sent(email)
        if sent:
            latest = sent[0]
            sent_at = latest.get("messageTimestamp") or datetime.now(timezone.utc).isoformat()
            lead["status"] = "sent"
            lead["sent_at"] = sent_at
            lead["sent_thread_id"] = latest.get("threadId")
            # a real outreach message went out; clear stale drafted flag
            print(f"  ✅ {lead.get('name')} -> SENT ({sent_at[:19]})")
            updated += 1
        else:
            still_draft += 1
            print(f"  ⏳ {lead.get('name')} -> still DRAFT (not found in sent)")
        # be gentle with the connector
        time.sleep(0.4)

    print(f"\nResult: {updated} marked SENT, {still_draft} still DRAFT.")
    if dry:
        print("Dry run — file NOT written.")
    else:
        json.dump(d, open(FINDINGS, "w"), indent=2)
        print(f"Wrote {FINDINGS}")


if __name__ == "__main__":
    main()
