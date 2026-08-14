#!/usr/bin/env python3
"""
Iris REAL - Outreach Agent v2
Reads enriched leads, drafts personalized outreach into GMAIL DRAFTS (never sends).
- Leads with email  -> individual personalized email draft
- Phone-only leads  -> daily call-list draft to Alec with scripts
Alec reviews every draft before anything sends.
"""
import json, re, urllib.request, time
from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))
from feedback_loop import record_reply_signal

# Eastern timezone (America/New_York) for calendar events — RFC 3339 requires an offset
ET = timezone(timedelta(hours=-4))  # EDT (DST); adjust for EST (-5) if needed

WS = Path("/Users/aleckennedy/.openclaw/workspace")
FINDINGS = WS / "data/arlo_findings.json"
API = "http://localhost:3000/v1/actions/"
MAX_EMAIL_DRAFTS = 5  #/day cap while we warm up reputation
MAX_PROMPT_CHARS = 12000  # keep direct local calls comfortably below context/time limits
SPREADSHEET_ID = "1NcLE13A6aLc2lAkw-5ch46Ydyx-1vabFUstZvBh9UDI"

# Safety net: reject junk emails (Cloudflare obfuscation, button text, literal
# "null", embedded junk, broken addresses) before they hit the Gmail API.
_EMAIL_BAD = re.compile(
    r"cdn-cgi|email-protection|^\s*null\s*$|^\s*email\s*$|^\s*send\s*email\s*$"
    r"|\s|/|@\s|\s@", re.I
)

def valid_email(e):
    """Return a clean email string if e is a real, sendable address, else None."""
    if not e or not isinstance(e, str):
        return None
    e = e.strip()
    if not e or "@" not in e:
        return None
    if _EMAIL_BAD.search(e):
        return None
    local, _, domain = e.partition("@")
    if not local or "." not in domain:
        return None
    return e
SHEET_RANGE = "Sheet1!A:K"
CALENDAR_ENABLED = True        # auto-schedule follow-up calls for phone-only leads
MAX_CALENDAR_EVENTS = 10       # cap so one huge lead batch can't flood Alec's calendar
CALL_START_HOUR = 9            # next business day, 9:00 AM local
CALL_SLOT_MINUTES = 15
CRM_ENABLED = True             # push leads to HubSpot (company + contact when email exists)

# ── PS note library ──────────────────────────────────────────────────────────
# Auto-appended to every email draft after the signature. Picked by industry so
# each lead gets the variant that names THEIR pain. Falls back to the generic
# core note when the industry isn't in the map. (Alec approved 2026-08-10.)
PS_NOTES = {
    "law": "P.S. And the missed-call thing is just the tip of the iceberg. Every hour your attorneys spend on intake, scheduling, or chasing documents is an hour they're not billing. If you've got *any* AI problem eating your billable time, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "legal": "P.S. And the missed-call thing is just the tip of the iceberg. Every hour your attorneys spend on intake, scheduling, or chasing documents is an hour they're not billing. If you've got *any* AI problem eating your billable time, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "medical": "P.S. And the missed-call thing is just the tip of the iceberg. Every no-show, every hour of front-desk time on scheduling and insurance follow-up, is money walking out the door. If you've got *any* AI problem eating your staff's time or your margins, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "dental": "P.S. And the missed-call thing is just the tip of the iceberg. Every no-show, every hour of front-desk time on scheduling and insurance follow-up, is money walking out the door. If you've got *any* AI problem eating your staff's time or your margins, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "real estate": "P.S. And the missed-call thing is just the tip of the iceberg. Every lead that goes cold while you're showing a property is a commission you never see. If you've got *any* AI problem eating your follow-up time or your pipeline, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "accounting": "P.S. And the missed-call thing is just the tip of the iceberg. Every hour your team spends on data entry, reconciliations, or chasing receipts is an hour you're not billing. If you've got *any* AI problem eating your staff's time or your margins, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "bookkeeping": "P.S. And the missed-call thing is just the tip of the iceberg. Every hour your team spends on data entry, reconciliations, or chasing receipts is an hour you're not billing. If you've got *any* AI problem eating your staff's time or your margins, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "restaurant": "P.S. And the missed-call thing is just the tip of the iceberg. Every unanswered call, every hour of a manager doing schedules or inventory by hand, is money you're leaving on the table. If you've got *any* AI problem eating your staff's time or your margins, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "hvac": "P.S. And the missed-call thing is just the tip of the iceberg. Every job that goes to a competitor because you didn't answer in time is revenue you never see. If you've got *any* AI problem eating your dispatch time or your margins, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "plumbing": "P.S. And the missed-call thing is just the tip of the iceberg. Every job that goes to a competitor because you didn't answer in time is revenue you never see. If you've got *any* AI problem eating your dispatch time or your margins, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "roofing": "P.S. And the missed-call thing is just the tip of the iceberg. Every job that goes to a competitor because you didn't answer in time is revenue you never see. If you've got *any* AI problem eating your dispatch time or your margins, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "auto": "P.S. And the missed-call thing is just the tip of the iceberg. Every lead that goes cold while your team is on the lot is a sale you never close. If you've got *any* AI problem eating your follow-up time or your margins, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "insurance": "P.S. And the missed-call thing is just the tip of the iceberg. Every lead that goes cold while you're in a meeting is a policy or a book of business you never write. If you've got *any* AI problem eating your follow-up time or your pipeline, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "salon": "P.S. And the missed-call thing is just the tip of the iceberg. Every no-show and every hour of front-desk time on booking and reminders is money walking out the door. If you've got *any* AI problem eating your staff's time or your margins, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
    "spa": "P.S. And the missed-call thing is just the tip of the iceberg. Every no-show and every hour of front-desk time on booking and reminders is money walking out the door. If you've got *any* AI problem eating your staff's time or your margins, bring it to me — I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure.",
}
PS_DEFAULT = "P.S. And honestly — the missed-call thing is just the tip of the iceberg. If you've got *any* AI problem eating your time or your margins, bring it to me. I'll tell you straight whether it's worth automating, what it'll cost, and what it'll save you. No pitch, no pressure — just a straight answer. Reply with whatever's bugging you."

def pick_ps(industry):
    """Return the industry-matched PS note, or the generic default."""
    if not industry:
        return PS_DEFAULT
    key = industry.strip().lower()
    # match on any keyword contained in the industry string
    for k, note in PS_NOTES.items():
        if k in key:
            return note
    return PS_DEFAULT

# ── Industry-aware pitch buckets (2026-08-14) ───────────────────────────────
# The old single prompt led EVERY email with "missed calls". But that problem
# only genuinely fits trades/solo ops. For pro services (real estate, accounting,
# dental, medical) the real pain is lead-response speed, follow-up consistency,
# and busywork — not unanswered rings. This picks the angle that matches the
# lead's industry so we pitch their ACTUAL problem.
#
# bucket: 'trades' -> missed-calls angle (fits solo service operators)
#         'pro'   -> speed/follow-up/automation angle (fits high-consideration)
#         'generic'-> speed angle without the missed-call assumption
TRADE_KEYWORDS = ("hvac", "plumb", "roof", "electr", "landscap", "home service",
                  "handyman", "pest", "cleaning", "pool", "garage", "lawn",
                  "remodel", "contractor", "exterior", "window", "solar")
PRO_KEYWORDS = ("real estate", "realty", "account", "bookkeep", "tax", "legal",
                "law", "attorney", "dent", "medical", "clinic", "health",
                "insur", "finance", "financial", "mortgage", "consult",
                "agency", "firm", "therapy", "counsel", "chiropract", "wellness")

def pitch_bucket(industry):
    """Return the pitch bucket for a lead's industry string."""
    if not industry:
        return "generic"
    key = industry.strip().lower()
    if any(k in key for k in TRADE_KEYWORDS):
        return "trades"
    if any(k in key for k in PRO_KEYWORDS):
        return "pro"
    return "generic"

# Per-bucket angle instructions fed to the model. Each states the pain to lead with.
PITCH_ANGLES = {
    "trades": (
        "Alec's angle: these owners lose money to missed calls and slow response while "
        "they're out on jobs — a call they can't answer goes to a competitor. The One Group "
        "installs AI that answers/texts missed calls back within seconds and responds to every "
        "lead in under 60 seconds, so no job goes to the guy who picked up first."
    ),
    "pro": (
        "Alec's angle: these businesses don't lose leads to missed calls — they lose them to "
        "slow or inconsistent follow-up. Every inquiry that sits unanswered while they're "
        "busy (showing a property, in a meeting, on a closing) goes to whoever replies first. "
        "The One Group installs AI that responds to every lead in under 60 seconds, on every "
        "channel, 24/7, and logs it to their CRM — so no opportunity goes cold because someone "
        "didn't get back to it fast enough."
    ),
    "generic": (
        "Alec's angle: the real cost isn't missed calls, it's slow lead response. The first "
        "business to reply wins the job, and most don't get back to people for hours or days. "
        "The One Group installs AI that responds to every lead in under 60 seconds, on every "
        "channel, around the clock, and logs it to their CRM — so they stop losing work to "
        "competitors who answered first."
    ),
}

def email_prompt(lead):
    bucket = pitch_bucket(lead.get("industry"))
    angle = PITCH_ANGLES[bucket]
    return f"""Write a short cold outreach email from Alec Kennedy, founder of The One Group (theonegroup.info), to the owner of {lead['name']}, an {lead['industry']} business in {lead['city']}, Florida.

{angle}

Rules:
- 90-120 words, human and direct, no buzzwords, no \"I hope this finds you well\"
- Reference their business name and city naturally
- Lead with the ONE pain that fits them, not generic filler. Do NOT force the missed-call angle unless it genuinely fits their situation — if they're a service/trade shop that can't answer the phone on jobs, use the missed-call stat; otherwise lead with speed-to-lead / follow-up consistency.
- One specific stat: businesses that respond to a lead within 5 minutes are ~100x more likely to connect than those who wait even an hour.
- Soft CTA: \"Worth a 10-minute call this week?\"
- End with this exact signature block (including the -- line):
--
Alec Kennedy | The One Group.AI
Founder | CEO | (c) 502.403.7201 | akennedy@theonegroup.info
- Do NOT add a P.S. — the P.S. is appended automatically after the signature.
- Also output a subject line on the FIRST line formatted exactly: SUBJECT: <subject>
Then a blank line, then the body. Plain text only."""

import base64 as _b64

def _decode_mime_b64(text):
    """Decode any base64 MIME block the model sometimes emits for the signature.
    llama3.1 occasionally wraps the signature (and anything after it) in a
    MIME-Version/Content-Type/Content-Transfer-Encoding: base64 block. This
    finds those blocks, decodes them, and returns the readable text."""
    # Find base64 blobs that follow a 'Content-Transfer-Encoding: base64' header.
    # A base64 blob is a run of [A-Za-z0-9+/=] lines, typically 60+ chars.
    pattern = re.compile(
        r"Content-Transfer-Encoding:\s*base64\s*\n+([A-Za-z0-9+/=\s]{40,}?)(?=\n\S|\Z)",
        re.I | re.S,
    )
    def repl(match):
        blob = re.sub(r"\s+", "", match.group(1))
        try:
            return _b64.b64decode(blob).decode("utf-8", errors="replace")
        except Exception:
            return match.group(0)
    return pattern.sub(repl, text)

def _strip_mime_headers(text):
    """Remove stray MIME header lines the model may leave behind."""
    lines = []
    for ln in text.split("\n"):
        if re.match(r"^(MIME-Version|Content-Type|Content-Transfer-Encoding):", ln.strip()):
            continue
        lines.append(ln)
    return "\n".join(lines)

def _strip_model_ps(text):
    """Remove any P.S. the model generated so we don't get duplicates.
    The deterministic PS is appended separately by pick_ps()."""
    # Cut everything from the first 'P.S.' / 'PS:' / 'P.S :' onward.
    m = re.search(r"\n\s*(P\.?S\.?)\s*[:\-–—]?\s*", text, re.I)
    if m:
        return text[: m.start()].rstrip()
    return text.rstrip()

def clean_body(raw):
    """Normalize the model's raw body: decode base64 MIME blobs, strip MIME
    headers, drop any model-generated P.S., and return clean plain text."""
    body = _decode_mime_b64(raw)
    body = _strip_mime_headers(body)
    body = _strip_model_ps(body)
    return body.strip()


def verify_body_clean(body):
    """Return True if the final body has no leftover MIME/base64 garbage.
    Safety net for the intermittent llama3.1 base64-signature quirk: even with
    clean_body() running, if a draft would still contain a MIME header or a
    base64 blob it is NOT safe to send. Flags (does not silently pass)."""
    if not body or not body.strip():
        return False
    # MIME header lines must never survive into a sendable body.
    if re.search(r"^\s*(MIME-Version|Content-Type|Content-Transfer-Encoding)\s*:", body, re.I | re.M):
        return False
    # A long base64-looking run (>=40 chars of base64 alphabet) is garbage,
    # unless it's a known-safe string like "100x" or a URL query. Keep it
    # simple: a run of 40+ base64 chars on one line = undecoded blob.
    if re.search(r"[A-Za-z0-9+/=]{40,}", body):
        return False
    return True

def bounded_prompt(prompt):
    """Bound direct batch prompts.

    If a generated prompt exceeds ``MAX_PROMPT_CHARS`` we truncate it and
    prepend a short notice.  This protects the local Ollama call from timing
    out on a single massive lead.  We also emit a warning on stdout so the
    operator can see when truncation occurs.
    """
    if len(prompt) <= MAX_PROMPT_CHARS:
        return prompt
    print(f"⚠️  Prompt length {len(prompt)} exceeds {MAX_PROMPT_CHARS}; truncating")
    marker = "\n[Prompt shortened to stay within the batch model budget.]\n"
    return prompt[:MAX_PROMPT_CHARS - len(marker)] + marker

def ollama(prompt, timeout=180):
    prompt = bounded_prompt(prompt)
    body = {"model": "llama3.1:latest", "prompt": prompt, "stream": False,
            "options": {"temperature": 0.7}}
    req = urllib.request.Request("http://localhost:11434/api/generate",
                                 data=json.dumps(body).encode(),
                                 headers={"content-type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r).get("response", "").strip()

def create_draft(to, subject, body, attempts=3):
    """Create a Gmail draft with simple exponential back‑off retry.
    Returns True on success, False on permanent failure.
    """
    payload = {"input": {"to": to, "subject": subject, "body": body}}
    req = urllib.request.Request(API + "gmail.create_draft",
                                 data=json.dumps(payload).encode(),
                                 headers={"content-type": "application/json"})
    for i in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                resp = json.load(r)
                if resp.get("success"):
                    return True
                print(f"❌ draft creation failed for {to}: {resp}")
                return False
        except Exception as e:
            if i < attempts - 1:
                wait = 2 ** i
                print(f"⚠️ retry {i+1}/{attempts} for {to} after {wait}s – {e}")
                time.sleep(wait)
            else:
                print(f"❌ final failure for {to}: {e}")
                return False
    return False

def log_to_sheet(lead, timestamp):
    """Append a row to the Google Sheet with all lead data.
    Columns: Date | Business Name | Industry | City | Website | Phone | Score | Priority | Status | Notes | Email"""
    payload = {
        "input": {
            "spreadsheetId": SPREADSHEET_ID,
            "range": SHEET_RANGE,
            "values": [[
                timestamp[:10],
                lead.get("name", ""),
                lead.get("industry", ""),
                lead.get("city", ""),
                lead.get("website", ""),
                lead.get("phone", ""),
                str(lead.get("score", "")),
                lead.get("priority", ""),
                lead.get("status", ""),
                lead.get("notes", ""),
                lead.get("email", "")
            ]],
            "valueInputOption": "USER_ENTERED",
            "insertDataOption": "INSERT_ROWS"
        }
    }
    req = urllib.request.Request(API + "googlesheets.spreadsheets_values_append",
                                 data=json.dumps(payload).encode(),
                                 headers={"content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            resp = json.load(r)
            if resp.get("success"):
                print("    📊 logged to Google Sheet")
            else:
                print(f"    ⚠️ sheet log failed: {resp}")
    except Exception as e:
        print(f"    ⚠️ sheet request error: {e}")

def _hs_record_id(resp):
    """Extract a HubSpot record id from a connector response, or None if the
    create actually failed. The connector envelope can say success:true while
    the HubSpot record contains a nested validation error, so we require an id."""
    if not isinstance(resp, dict) or resp.get("success") is False:
        return None
    rec = (resp.get("data") or {}).get("record") or {}
    if rec.get("id"):
        return rec["id"]
    return None

def push_to_hubspot(lead, timestamp):
    """Create a HubSpot company (always) and contact (when email exists).
    Gracefully skips with a warning if HubSpot OAuth isn't connected.
    NOTE: we do NOT send `industry` — HubSpot enforces a fixed enum on that
    property and free-text industries fail validation (verified 2026-08-01)."""
    if not CRM_ENABLED:
        return
    def call(action, props):
        req = urllib.request.Request(API + action,
                                     data=json.dumps({"input": {"properties": props}}).encode(),
                                     headers={"content-type": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.load(r)
    try:
        company_props = {
            "name": lead.get("name", ""),
            "city": lead.get("city", ""),
            "website": (lead.get("website") or "").replace("https://", "").replace("http://", "").strip("/"),
        }
        company_props = {k: v for k, v in company_props.items() if v}
        resp = call("hubspot.create_company", company_props)
        cid = _hs_record_id(resp)
        if not cid:
            msg = str(resp)
            if "OAuth" in msg or "authorization" in msg.lower():
                print("    ⚠️ HubSpot not connected — skipping CRM push")
            else:
                print(f"    ⚠️ HubSpot company failed for {lead['name']}: {str(resp)[:300]}")
            return
        lead["hubspot_company_at"] = timestamp
        lead["hubspot_company_id"] = cid
        print(f"    🏢 HubSpot company created — {lead['name']} (id {cid})")
        if lead.get("email"):
            resp2 = call("hubspot.create_contact", {
                "email": lead["email"],
                "company": lead.get("name", ""),
                "city": lead.get("city", ""),
            })
            ctid = _hs_record_id(resp2)
            if not ctid:
                print(f"    ⚠️ HubSpot contact failed for {lead['name']}: {str(resp2)[:300]}")
            else:
                lead["hubspot_contact_at"] = timestamp
                lead["hubspot_contact_id"] = ctid
                print(f"    👤 HubSpot contact created — {lead['email']} (id {ctid})")
    except Exception as e:
        if "401" in str(e) or "authorization" in str(e).lower():
            print("    ⚠️ HubSpot not connected — skipping CRM push")
        else:
            print(f"    ⚠️ HubSpot request error for {lead.get('name','?')}: {e}")

def next_business_day_start():
    d = datetime.now(ET) + timedelta(days=1)
    while d.weekday() >= 5:  # skip Sat/Sun
        d += timedelta(days=1)
    return d.replace(hour=CALL_START_HOUR, minute=0, second=0, microsecond=0)

def schedule_call_event(lead, start_dt):
    """Create a 15-min follow-up call event on Alec's primary Google Calendar."""
    end_dt = start_dt + timedelta(minutes=CALL_SLOT_MINUTES)
    payload = {"input": {
        "calendarId": "primary",
        "event": {
            "summary": f"📞 Call {lead['name']} ({lead.get('city','')})",
            "description": (
                f"Phone: {lead.get('phone','')}\n"
                f"Industry: {lead.get('industry','')}\n"
                f"Lead score: {lead.get('score','?')}\n"
                f"Website: {lead.get('website','n/a')}\n\n"
                "Opener: Hi, this is Alec from The One Group down in South Florida. "
                "Quick one — most local shops miss about a quarter of their incoming calls, "
                "and each missed call is worth $1,200+ in your trade. We install a system "
                "that texts callers back within seconds when you can't pick up. "
                "Who handles your missed calls right now?"
            ),
            "start": {"dateTime": start_dt.isoformat(), "timeZone": "America/New_York"},
            "end": {"dateTime": end_dt.isoformat(), "timeZone": "America/New_York"},
        }
    }}
    try:
        req = urllib.request.Request(API + "googlecalendar.create_event",
                                     data=json.dumps(payload).encode(),
                                     headers={"content-type": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as r:
            resp = json.load(r)
        if resp.get("success") is False:
            print(f"    ⚠️ calendar event failed for {lead['name']}: {resp}")
            return None
        print(f"    📅 call scheduled {start_dt.strftime('%a %m/%d %H:%M')} — {lead['name']}")
        return start_dt.isoformat()
    except Exception as e:
        print(f"    ⚠️ calendar request error for {lead['name']}: {e}")
        return None

def record_reply(lead, outcome, detail=""):
    """Record an outreach outcome into the feedback loop (reply/booking/audit/etc).
    Callable by Iris main() or by a cron/subagent that scans Gmail replies.
    lead: dict with at least industry + city (and ideally name/email)."""
    try:
        record_reply_signal(lead, outcome, detail)
        return True
    except Exception as e:
        print(f"    ⚠️ could not record reply signal: {e}")
        return False


def main():
    d = json.load(open(FINDINGS))
    email_leads = [l for l in d["leads"] if l.get("email") and l.get("status") in ("new", "enriched")]
    phone_leads = [l for l in d["leads"] if not l.get("email") and l.get("phone")
                   and l.get("source") == "arlo_real_tavily" and l.get("status") in ("new", "enriched")]
    print(f"email-ready: {len(email_leads)} | phone-only: {len(phone_leads)}")

    made = 0
    for l in email_leads[:MAX_EMAIL_DRAFTS]:
        print(f"  ✉️ drafting: {l['name']}")
        # Safety net: skip junk emails (Cloudflare obfuscation, button text, etc.)
        # so we never hit the Gmail API with a bad address (HTTP 400).
        if not valid_email(l.get("email")):
            print(f"    ⛔ INVALID EMAIL — skipping {l['name']} ({l.get('email')!r})")
            continue
        raw = ollama(email_prompt(l))
        # Subject is always on the FIRST line. Capture it up to the first newline,
        # then everything after is the body. (Greedy (.+) with re.S was swallowing
        # the whole body into the subject group — fixed 2026-08-10.)
        m = re.match(r"SUBJECT:\s*([^\n]+)\n\s*\n?(.*)", raw, re.S)
        subject = m.group(1).strip() if m else f"Quick question about {l['name']}"
        body = clean_body(m.group(2).strip() if m else raw)
        # Auto-append the industry-matched PS note after the signature (Alec 2026-08-10)
        body = body.rstrip() + "\n\n" + pick_ps(l.get("industry", ""))
        # VERIFY the rendered body is clean before creating a draft (2026-08-10).
        # The llama3.1 base64 quirk is intermittent — catch any leftover garbage
        # here so a garbled draft is never silently created.
        if not verify_body_clean(body):
            print(f"    ⛔ GARBAGE DETECTED — skipping {l['name']} (body not sendable)")
            continue
        if create_draft(l["email"], subject, body):
            ts = datetime.now().isoformat()
            l["status"] = "drafted"
            l["drafted_at"] = ts
            made += 1
            print(f"    ✅ draft created")
            log_to_sheet(l, ts)
            push_to_hubspot(l, ts)
        else:
            print(f"    ❌ draft failed")

    if phone_leads:
        today = datetime.now().strftime("%Y-%m-%d")
        lines = [f"CALL LIST — {today} ({len(phone_leads)} phone-only leads)\n",
                 "These businesses don't publish email — they're phone-first.",
                 "Your opener (30 sec):", "",
                 '"Hi, this is Alec from The One Group down in South Florida. Quick one —',
                 'we found that most {trade} shops miss about a quarter of their incoming calls,',
                 'and each missed call is worth $1,200+ in your trade. We install a system that',
                 'texts callers back within seconds when you can\'t pick up. Who handles your',
                 'missed calls right now?"', ""]
        for i, l in enumerate(phone_leads, 1):
            lines.append(f"{i}. {l['name']} — {l['city']} — {l.get('phone','')} "
                         f"(score {l.get('score','?')})" +
                         (f" — {l['website']}" if l.get('website') else ""))
        if create_draft("akennedy@theonegroup.info", f"📞 Arlo Call List — {today} ({len(phone_leads)} leads)", "\n".join(lines)):
            ts = datetime.now().isoformat()
            for l in phone_leads:
                l["status"] = "call_listed"
                l["listed_at"] = ts
                log_to_sheet(l, ts)
                push_to_hubspot(l, ts)
            print(f"  📞 call-list draft created ({len(phone_leads)} leads)")
            if CALENDAR_ENABLED:
                slot = next_business_day_start()
                for l in phone_leads[:MAX_CALENDAR_EVENTS]:
                    # DEDUP GUARD (2026-08-10): skip any lead that already has a
                    # scheduled call event so a re-run can't create duplicate calendar
                    # events (this happened across repeated Iris runs).
                    if l.get("calendar_event_at"):
                        print(f"    ⏭️  already scheduled {l['name']} — skipping")
                        continue
                    event_at = schedule_call_event(l, slot)
                    if event_at:
                        l["calendar_event_at"] = event_at
                    slot += timedelta(minutes=CALL_SLOT_MINUTES)
        else:
            print(f"  ❌ call-list draft failed")

    json.dump(d, open(FINDINGS, "w"), indent=2)
    print(f"✅ Iris done: {made} email drafts + call list")

if __name__ == "__main__":
    main()
