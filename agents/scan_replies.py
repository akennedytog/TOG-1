#!/usr/bin/env python3
"""
Reply Scanner — closes the Iris → Arlo feedback loop automatically.

WHY: Iris drafts outreach to leads, Alec sends them manually. Replies come back
into the same Gmail inbox mixed with Alec's personal mail. Nothing currently
detects those replies, so the feedback loop (data/reply_signals.json) stays empty
and Arlo never learns which industries/cities actually respond.

WHAT THIS DOES:
  1. Fetches recent inbox replies via the local open-connector (Gmail API).
  2. Matches the sender against known Iris-outreach leads in data/arlo_findings.json
     (status 'drafted'/'sent'). Matching by sender email domain avoids false
     positives from Alec's personal dealership/car-buying threads.
  3. Classifies the reply (reply / positive / booking) with conservative keyword
     heuristics — never claims a booking from a fuzzy signal.
  4. Records the outcome into the feedback loop (record_reply_signal), which
     re-weights Arlo's lead discovery.
  5. Marks the lead 'replied' so it isn't double-counted on re-runs.

RUN:  python3 agents/scan_replies.py [--days 14] [--dry-run]
Cron:  every 2-3 hours during business hours (best-effort; idempotent).

Requires: open-connector running on localhost:3000 with gmail configured.
"""
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
FINDINGS = WS / "data/arlo_findings.json"
CONNECTOR = "http://localhost:3000/v1/actions"
FETCH = CONNECTOR + "/gmail.fetch_emails"

# Lead statuses that count as "outreach went out, a reply is meaningful".
# 'sent' = confirmed sent (reconcile_draft_status.py); 'drafted' = still pending.
# Note: 'deleted_duplicate' leads are NOT outreach targets (Alec trashed dup drafts).
OUTREACHED = {"drafted", "sent", "replied"}

# ---- Reply classification (conservative) ------------------------------------
POSITIVE_HINTS = [
    r"\b(interested|let'?s (talk|chat)|book|schedule|calend(y|endar|l)|call|yes|sure|great|perfect|sounds good|want to|go ahead)\b",
    r"\b(what'?s your (rate|price|fee|cost)|pricing|quote|more info|details|tell me more)\b",
    r"\b(we (need|want|could use)|i (need|want))",
]
BOOKING_HINTS = [
    r"\b(booked|scheduled|calendar invite|sent (you )?an invite|confirmed|on your calendar)\b",
    r"\b(can you (call|meet) (me )?(on|at|monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today))\b",
]
NEGATIVE_HINTS = [
    r"\b(not interested|no thanks|no thank you|unsubscribe|stop (email|contacting)|remove me|don'?t (contact|call) (me|us))\b",
]

# Senders we should NEVER treat as outreach replies (newsletters, Alec's own aliases).
SKIP_DOMAINS = {
    "theonegroup.info", "sendinblue.com", "mailchimp.com", "convertkit.com",
    "kit.com", "autotrader.com", "edealerhub.com", "sendealer.com", "roadster.com",
    "carleadsup.com", "hubspot.com", "intercom.io",
}
SKIP_SENDER_PARTS = {"noreply", "no-reply", "notifications", "newsletter", "sales@", "info@"}


def _load_findings():
    return json.load(open(FINDINGS))


def _save_findings(d):
    json.dump(d, open(FINDINGS, "w"), indent=2)


def _fetch_replies(days):
    """Pull inbox messages that look like replies, newest first."""
    body = json.dumps({
        "input": {
            "query": f"to:akennedy@theonegroup.info newer_than:{days}d "
                     f"-from:me -category:promotions -category:notifications",
            "detail": "summary",
            "maxResults": 60,
        }
    }).encode()
    req = urllib.request.Request(FETCH, data=body,
                                 headers={"content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read().decode())
    except Exception as e:
        print(f"  ⚠️ connector fetch failed: {e}")
        return []
    return data.get("data", {}).get("messages", [])


def _norm_email(e):
    """Return (local, domain) lowercased; None if unparseable."""
    if not e:
        return None
    m = re.search(r"[\w.+-]+@[\w.-]+", e)
    if not m:
        return None
    local, _, domain = m.group(0).partition("@")
    return local.lower(), domain.lower()


def _is_skippable(sender):
    pair = _norm_email(sender)
    if not pair:
        return True
    local, domain = pair
    if domain in SKIP_DOMAINS:
        return True
    if any(p in local for p in SKIP_SENDER_PARTS):
        return True
    if any(p in sender.lower() for p in ("noreply", "no-reply", "donotreply", "do-not-reply")):
        return True
    return False


def _classify(subject, sender):
    text = f"{subject} {sender}".lower()
    if any(re.search(p, text) for p in NEGATIVE_HINTS):
        return "no_reply"  # explicit opt-out
    if any(re.search(p, text) for p in BOOKING_HINTS):
        return "booking"
    if any(re.search(p, text) for p in POSITIVE_HINTS):
        return "positive"
    return "reply"  # a genuine reply but neutral wording


def _match_lead(leads, sender):
    pair = _norm_email(sender)
    if not pair:
        return None
    _, domain = pair
    # Prefer exact email, then domain match against drafted/sent leads.
    for l in leads:
        if l.get("status") not in OUTREACHED:
            continue
        le = _norm_email(l.get("email") or "")
        if le and le == pair:
            return l
    for l in leads:
        if l.get("status") not in OUTREACHED:
            continue
        le = _norm_email(l.get("email") or "")
        if le and le[1] == domain:
            return l
    return None


def main():
    days = 14
    dry = False
    args = sys.argv[1:]
    for i, a in enumerate(args):
        if a.startswith("--days"):
            if "=" in a:
                days = int(a.split("=")[1])
            elif i + 1 < len(args):
                days = int(args[i + 1])
        if a == "--dry-run":
            dry = True

    d = _load_findings()
    leads = d["leads"]
    reply_by_domain = {  # dedupe: one signal per lead per run
        (l.get("email") or "").lower().split("@")[-1]: l for l in leads if l.get("email")
    }

    print(f"Scanning Gmail for outreach replies (last {days}d)...")
    messages = _fetch_replies(days)
    print(f"  fetched {len(messages)} candidate messages")

    recorded = 0
    matched_any = 0
    for m in messages:
        sender = m.get("sender", "")
        subject = m.get("subject", "")
        if _is_skippable(sender):
            continue
        lead = _match_lead(leads, sender)
        if not lead:
            continue
        matched_any += 1
        # dedupe by lead email
        key = (lead.get("email") or "").lower()
        if key in reply_by_domain and reply_by_domain[key].get("status") == "replied":
            continue

        outcome = _classify(subject, sender)
        print(f"  🔁 {lead.get('name')} <{sender}> -> {outcome} | '{subject[:50]}'")
        if dry:
            continue

        # record into feedback loop
        try:
            sys.path.insert(0, str(WS / "agents"))
            from feedback_loop import record_reply_signal
            record_reply_signal(lead, outcome, detail=subject[:120])
        except Exception as e:
            print(f"    ⚠️ record failed: {e}")

        # mark lead so it isn't re-counted
        lead["status"] = "replied"
        lead["replied_at"] = datetime.now(timezone.utc).isoformat()
        lead["reply_outcome"] = outcome
        recorded += 1

    if recorded:
        _save_findings(d)
        print(f"  ✅ recorded {recorded} reply signal(s), matched {matched_any} candidate(s).")
    else:
        print(f"  ℹ️  no new outreach replies to record (matched {matched_any} candidate(s)).")
    print("Done.")


if __name__ == "__main__":
    main()
