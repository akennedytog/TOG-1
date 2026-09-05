#!/usr/bin/env python3
"""
The One Group — AI Visibility Audit Outreach
Creates Gmail drafts that lead with the FREE AI Visibility Score as the hook.

This is the "do everything for the visibility audit" demand engine:
Instead of cold-pitching "we do AI automation," we lead with a free diagnostic:
"I ran your business through our AI visibility check — here's where you rank
when customers ask AI for the best [service] near you."

WHY THIS WORKS: It's value-first. It gives the owner something concrete
(a score + specific gaps) before asking for anything. It turns cold outreach
into a conversation-starter and positions Alec as the expert.

SAFETY: Creates GMAIL DRAFTS only (never sends). Alec reviews + sends.
Reuses the working connector mechanism from iris_real.py.

Usage:
  python3 scripts/visibility_audit_outreach.py --preview [N]   # show next N leads + draft bodies (no draft)
  python3 scripts/visibility_audit_outreach.py --draft [N]     # create N Gmail drafts (default 5)
  python3 scripts/visibility_audit_outreach.py --status        # show outreach state
"""
import os, sys, json, re, time, argparse, datetime, urllib.request
from pathlib import Path

WORKSPACE = Path(os.path.expanduser("~/.openclaw/workspace"))
LEADS_FILE = WORKSPACE / "data" / "real_smb_leads.json"
STATE_FILE = WORKSPACE / "data" / "visibility_audit_state.json"

# Gmail draft creation via the local OpenClaw connector
CONNECTOR = "http://localhost:3000/v1/actions"
GMAIL_CREATE_DRAFT = "gmail.create_draft"

DEFAULT_DRAFTS = 5  # warm-up cap per run

SIGNATURE = """--
Alec Kennedy | The One Group.AI
Founder | CEO | (c) 754.799.8676 | akennedy@theonegroup.info"""

AUDIT_URL = "https://theonegroup.info/ai-visibility-score"

# Industry-matched score "gap" angles. We lead with what the score would reveal.
SCORE_ANGLES = {
    "trades": (
        "When a customer in {city} asks AI for the best {industry} company nearby, "
        "is your business the one it recommends — or your competitor's? Most local "
        "companies don't show up at all, and that's who loses the job before the "
        "phone even rings."
    ),
    "pro": (
        "When a prospect in {city} asks AI for the best {industry} firm nearby, "
        "does your business get recommended — or the competitor who answered first? "
        "Most firms don't show up in AI answers, and that's the lead that never "
        "reaches you in the first place."
    ),
    "generic": (
        "When someone in {city} asks AI for the best {industry} business nearby, "
        "does your name come up? Most local businesses don't show up in AI answers "
        "at all — and that's who loses the customer before they ever call."
    ),
}

# Industry keywords for bucket matching (same logic as iris_real.py)
TRADE_KEYWORDS = ("hvac", "plumb", "roof", "electr", "landscap", "home service",
                  "handyman", "pest", "cleaning", "pool", "garage", "lawn",
                  "remodel", "contractor", "exterior", "window", "solar")
PRO_KEYWORDS = ("real estate", "realty", "account", "bookkeep", "tax", "legal",
                "law", "attorney", "dent", "medical", "clinic", "health",
                "insur", "finance", "financial", "mortgage", "consult",
                "agency", "firm", "therapy", "counsel", "chiropract", "wellness")

def pitch_bucket(industry):
    if not industry:
        return "generic"
    key = industry.strip().lower()
    if any(k in key for k in TRADE_KEYWORDS):
        return "trades"
    if any(k in key for k in PRO_KEYWORDS):
        return "pro"
    return "generic"

def first_name(contact_name, fallback_name=None):
    if contact_name:
        return contact_name.strip().split()[0].capitalize()
    if fallback_name:
        # Use a short business name as greeting: "Hi Flow-Tech," or "Hi Boca Dental,"
        # Clean up: strip legal suffixes, parentheticals, and "& Something" tails
        short = re.sub(r"\s*\([^)]*\)", "", fallback_name)
        short = re.sub(r"\s*&\s*\w+.*$", "", short, flags=re.I)  # strip & Cosmetic, & Company
        short = re.sub(r"\b(LLC|INC|CORP|CORPORATION|LTD|PA|P\.A\.|GROUP|COMPANY|SERVICES?|SOLUTIONS)\b.*$", "", short, flags=re.I).strip()
        # also drop a dangling slash segment like "/ Accounting Services"
        short = re.sub(r"\s*/.*$", "", short).strip()
        short = re.sub(r"\s+", " ", short).strip(" ,")
        if short:
            return short if len(short) <= 25 else short[:25].rsplit(" ", 1)[0]
    return "there"

def company_name(name):
    """Strip common legal suffixes for a cleaner greeting."""
    if not name:
        return "your business"
    n = re.sub(r"\b(LLC|INC|CORP|CORPORATION|LTD|CO|GROUP|SERVICES?|COMPANY|ENTERPRISES?|SOLUTIONS)\b.*$", "", name, flags=re.I).strip()
    return n if n else name

def usable_email(lead):
    e = (lead.get("email") or "").strip()
    if not e or "@" not in e:
        return None
    low = e.lower()
    if low in ("tbd", "none", "n/a", "unknown", "info@", "contact@", "hello@"):
        return None
    # Only draft to emails we've VERIFIED as deliverable (field email_verified=true)
    if lead.get("email_verified") is not True:
        return None
    return e

def build_body(lead):
    bucket = pitch_bucket(lead.get("industry"))
    angle = SCORE_ANGLES[bucket].format(
        city=lead.get("city") or "your area",
        industry=lead.get("industry") or "service",
    )
    contact = lead.get("contact_name") or None
    biz = lead.get("name") or "your business"
    greeting = f"Hi {first_name(contact, biz)},"
    subject = f"Your AI Visibility Score for {biz[:40]}"

    body = f"""{greeting}

I ran {biz} through our free AI Visibility Score — a quick check of whether your business shows up when customers ask AI for the best {lead.get('industry') or 'service'} near {lead.get('city') or 'you'}.

{angle}

The good news: this is fixable. Most businesses just don't know they're invisible to AI-driven customers yet.

The score takes 60 seconds and shows you exactly where you stand — and what your top competitor does better. No sign-up wall, no sales pitch, just your number and the specific gaps to close.

See your score here: {AUDIT_URL}

Worth a look?

Best,
{SIGNATURE}"""
    return subject, body

def _dedup_key(lead):
    """Return the key used to dedupe this lead in state (domain of email, or id)."""
    e = (lead.get("email") or "").strip().lower()
    if "@" in e:
        return e.split("@")[1]
    return lead.get("id") or e

def load_leads():
    data = json.loads(LEADS_FILE.read_text())
    return data.get("leads", data)  # support both list and {leads: [...]} format

def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"sent": {}, "drafted_at": {}}

def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))

def create_gmail_draft(to, subject, body):
    """Create a Gmail draft via the local connector. Returns (ok, id_or_error)."""
    payload = {"input": {"to": to, "subject": subject, "body": body}}
    req = urllib.request.Request(
        f"{CONNECTOR}/{GMAIL_CREATE_DRAFT}",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())
            sc = data.get("structuredContent", data)
            inner = sc.get("data", sc) if isinstance(sc, dict) else {}
            # Success when structuredContent.data.success is True (draftId present)
            if inner.get("success") or sc.get("success"):
                return True, str(inner.get("draftId", inner.get("id", "sent")))
            return False, str(sc)[:120]
    except Exception as e:
        return False, str(e)

def preview(count=8):
    leads = load_leads()
    state = load_state()
    # Only leads we haven't drafted yet, with usable email
    todo = [l for l in leads if usable_email(l) and _dedup_key(l) not in state["sent"]]
    print(f"Total leads: {len(leads)} | Already drafted: {len(state['sent'])} | Available: {len(todo)}")
    print()
    for l in todo[:count]:
        subject, body = build_body(l)
        print(f"── {l['name'][:40]} | {l.get('industry')} | {l.get('city')} | {l.get('email')}")
        print(f"   SUBJECT: {subject}")
        print(f"   {body.split(chr(10))[2][:100]}")  # first body line after greeting
        print()

def draft(count=DEFAULT_DRAFTS):
    leads = load_leads()
    state = load_state()
    todo = [l for l in leads if usable_email(l) and _dedup_key(l) not in state["sent"]]
    if not todo:
        print("No new leads to draft — all emailed leads already drafted.")
        return
    to_do = todo[:count]
    print(f"Drafting {len(to_do)} Gmail drafts (cap {count})...")
    created = 0
    for l in to_do:
        subject, body = build_body(l)
        ok, result = create_gmail_draft(l["email"], subject, body)
        if ok:
            state["sent"][_dedup_key(l)] = {
                "email": l["email"],
                "name": l["name"],
                "subject": subject,
                "drafted_at": datetime.datetime.now().isoformat(),
            }
            created += 1
            print(f"  ✅ {l['name'][:35]:35} -> {l['email']} ({result})")
        else:
            print(f"  ❌ {l['name'][:35]:35} -> {l['email']}: {result}")
        time.sleep(1)
    save_state(state)
    print(f"\nDone. Created {created} drafts. Total drafted: {len(state['sent'])}.")

def status():
    leads = load_leads()
    state = load_state()
    drafted = len(state["sent"])
    todo = [l for l in leads if usable_email(l) and _dedup_key(l) not in state["sent"]]
    print(f"Total leads: {len(leads)}")
    print(f"Drafted (review pending): {drafted}")
    print(f"Available to draft: {len(todo)}")
    from collections import Counter
    print(f"Industries: {dict(Counter(l.get('industry','?') for l in leads))}")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", type=int, nargs="?", const=8, default=None)
    ap.add_argument("--draft", type=int, nargs="?", const=DEFAULT_DRAFTS, default=None)
    ap.add_argument("--status", action="store_true")
    args = ap.parse_args()

    if args.status:
        status()
    elif args.preview is not None:
        preview(args.preview)
    elif args.draft is not None:
        draft(args.draft)
    else:
        ap.print_help()
