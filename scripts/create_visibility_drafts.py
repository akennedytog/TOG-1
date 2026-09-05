#!/usr/bin/env python3
"""Create AI Visibility Monitor Gmail DRAFTS for the first HVAC batch.
DRAFTS ONLY — never sends. Alec reviews each draft in Gmail before sending.
"""
import json, time, urllib.request

API = "http://127.0.0.1:3000/v1/actions/gmail.create_draft"

# Final 4 Real Estate (score 10, all have email) — batch 5
BATCH = [
    {"name": "All County Coastal", "email": "contact@allcountycoastal.com", "city": "Boynton Beach"},
    {"name": "The Keyes Company", "email": "keyes490@keyes.com", "city": "Boynton Beach"},
    {"name": "Net Assets Corporation", "email": "support@netassets.com", "city": "Boynton Beach"},
    {"name": "Highlight Realty Network", "email": "highlightrealty@aol.com", "city": "Lake Worth"},
]

SIGNATURE = "\n\n—\nAlec Kennedy | The One Group.AI\nakennedy@theonegroup.info | 502-403-7201\ntheonegroup.info"

def body_for(lead):
    return f"""Hi there,

Quick one — how do you currently track what your competitors are up to?

Most owners I talk to rely on "we hear things," which means they find out after the customer's gone. We run an automated monitor that gives you a clean weekly brief of competitor moves — new offers, pricing, reviews, campaigns — plus a scored radar of your best inbound leads.

It's $497/mo and runs without any of your time. And it's literally the same system we run on ourselves.

Want me to run a free scan of your market this week so you can see it in action?{SIGNATURE}"""

def create_draft(to, subject, body, attempts=3):
    payload = {"input": {"to": to, "subject": subject, "body": body}}
    req = urllib.request.Request(API, data=json.dumps(payload).encode(),
                                 headers={"content-type": "application/json"})
    for i in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                resp = json.load(r)
                if resp.get("success"):
                    return True
                print(f"  ❌ failed: {resp}")
                return False
        except Exception as e:
            if i < attempts - 1:
                time.sleep(2 ** i)
            else:
                print(f"  ❌ final failure: {e}")
                return False
    return False

def main():
    print(f"Creating {len(BATCH)} Gmail DRAFTS (no send)...")
    for lead in BATCH:
        subject = f"A weekly look at what your competitors are doing — on us"
        ok = create_draft(lead["email"], subject, body_for(lead))
        print(f"  {'✅' if ok else '❌'} {lead['name']} -> {lead['email']}")
    print("\nDone. Drafts are in Gmail for Alec to review. Nothing was sent.")

if __name__ == "__main__":
    main()
