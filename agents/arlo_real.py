#!/usr/bin/env python3
"""
Arlo REAL - Research Agent v3
Finds REAL South Florida SMB leads daily via Tavily search + local LLM extraction.
v3: Two-phase email hunting:
  Phase 1: Search for businesses WITH email addresses (owner/contact emails)
  Phase 2: For phone-only leads with websites, scrape the site for contact info
  Phase 3: For remaining phone-only leads, do a targeted email search

Cost: ~8-10 Tavily credits/day (~250/mo of 1,000 free), $0 LLM (local ollama).
"""
import json, re, subprocess, sys, urllib.request
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from feedback_loop import weighted_rotation_pairs

WS = Path("/Users/aleckennedy/.openclaw/workspace")
OUTPUT_FILE = WS / "data/arlo_findings.json"

# Junk-email patterns the LLM/scraper sometimes returns instead of a real address.
# Cloudflare obfuscation (/cdn-cgi/l/email-protection#...), button text ("Email your
# question", "Send Email"), literal "null", embedded junk, or broken addresses.
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
TAVILY = WS / "skills/tavily/scripts/tavily_search.py"
STATE_FILE = WS / "data/arlo_rotation_state.json"

INDUSTRIES = ["HVAC", "Plumbing", "Electrical", "Dental", "Legal", "Accounting",
              "Real Estate", "Home Services", "Medical", "Roofing", "Landscaping", "Pest Control"]
CITIES = ["West Palm Beach", "Boca Raton", "Fort Lauderdale", "Delray Beach",
          "Boynton Beach", "Lake Worth", "Palm Beach Gardens", "Jupiter", "Wellington", "Coral Springs"]
QUERIES_PER_RUN = 3   # ~3 credits/day for Phase 1 (reduced 2026-08-08 to fit cron timeout)
LEADS_TARGET = 20
EMAIL_ENRICH_QUERIES = 2  # ~2 credits/day for Phase 3 enrichment (reduced 2026-08-08)

def rotation_pairs(n):
    """Deterministic daily rotation through industry x city grid."""
    try:
        state = json.load(open(STATE_FILE))
        idx = state.get("idx", 0)
    except Exception:
        idx = 0
    combos = [(i, c) for i in INDUSTRIES for c in CITIES]
    pairs = [combos[(idx + k) % len(combos)] for k in range(n)]
    json.dump({"idx": (idx + n) % len(combos)}, open(STATE_FILE, "w"))
    return pairs

def tavily(query):
    r = subprocess.run([sys.executable, str(TAVILY), query, "--max-results", "8", "--json"],
                       capture_output=True, text=True, timeout=90)
    try:
        d = json.loads(r.stdout)
        if d.get("success"):
            return d
    except json.JSONDecodeError:
        pass
    return None

def extract_leads(raw_text, industry, city, require_email=False):
    """Local LLM extracts structured business records from search text.
    If require_email=True, only return leads that have an email address."""
    prompt = f"""Extract real {industry} businesses in or near {city}, Florida from the text below.
Return ONLY a JSON array. Each object: {{"name": "...", "phone": "(xxx) xxx-xxxx or null", "address": "street address or null", "website": "domain or null", "email": "email address or null"}}
Rules: only real named businesses, no directories (Yelp, Angi, Forbes, Yellow Pages), no duplicates, max 8.
{"IMPORTANT: Only include businesses where you can find an email address. Prioritize results with emails." if require_email else ""}
If none found, return [].
TEXT:
{raw_text[:6000]}"""
    body = {"model": "llama3.1:latest", "prompt": prompt, "stream": False,
            "options": {"temperature": 0.1}}
    req = urllib.request.Request("http://localhost:11434/api/generate",
                                 data=json.dumps(body).encode(),
                                 headers={"content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            resp = json.load(r).get("response", "")
        m = re.search(r"\[.*\]", resp, re.S)
        if m:
            arr = json.loads(m.group(0))
            out = []
            for b in arr:
                if not isinstance(b, dict) or not b.get("name"):
                    continue
                b["email"] = valid_email(b.get("email"))
                if require_email and not b["email"]:
                    continue  # email-prioritized search: drop leads with no real email
                out.append(b)
            return out
    except Exception as e:
        print(f"  extract error: {e}")
    return []

def scrape_website_for_email(domain):
    """Try to find contact email on a business website using Tavily.
    Returns email string or None."""
    if not domain:
        return None
    # Clean domain
    domain = domain.strip().lower()
    domain = re.sub(r'^https?://', '', domain)
    domain = domain.rstrip('/')
    
    # Search for contact info on this domain
    q = f"site:{domain} email OR contact OR info"
    d = tavily(q)
    if not d:
        return None
    
    raw = (d.get("answer") or "") + "\n\n" + "\n\n".join(
        f"{r.get('title','')}\n{r.get('url','')}\n{r.get('content','')}"
        for r in d.get("results", []))
    
    # Use LLM to extract email
    prompt = f"""Extract any email addresses from the text below that belong to the domain {domain}.
Return ONLY a JSON array of email strings, e.g. ["info@example.com", "john@example.com"].
If no emails found, return [].
TEXT:
{raw[:4000]}"""
    body = {"model": "llama3.1:latest", "prompt": prompt, "stream": False,
            "options": {"temperature": 0.1}}
    req = urllib.request.Request("http://localhost:11434/api/generate",
                                 data=json.dumps(body).encode(),
                                 headers={"content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            resp = json.load(r).get("response", "")
        m = re.search(r"\[.*\]", resp, re.S)
        if m:
            emails = json.loads(m.group(0))
            if emails and isinstance(emails, list):
                # Filter to real, sendable emails
                valid = [valid_email(e) for e in emails]
                valid = [e for e in valid if e]
                return valid[0] if valid else None
    except Exception:
        pass
    return None

def search_for_email_by_name(lead):
    """Do a targeted Tavily search for a specific business's email.
    Returns email string or None."""
    name = lead.get("name", "")
    city = lead.get("city", "")
    industry = lead.get("industry", "")
    q = f'"{name}" {city} {industry} email OR contact OR "info@"'
    d = tavily(q)
    if not d:
        return None
    
    raw = (d.get("answer") or "") + "\n\n" + "\n\n".join(
        f"{r.get('title','')}\n{r.get('url','')}\n{r.get('content','')}"
        for r in d.get("results", []))
    
    prompt = f"""Extract any email addresses from the text below that belong to the business "{name}".
Return ONLY a JSON array of email strings, e.g. ["info@example.com", "owner@example.com"].
If no emails found, return [].
TEXT:
{raw[:4000]}"""
    body = {"model": "llama3.1:latest", "prompt": prompt, "stream": False,
            "options": {"temperature": 0.1}}
    req = urllib.request.Request("http://localhost:11434/api/generate",
                                 data=json.dumps(body).encode(),
                                 headers={"content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            resp = json.load(r).get("response", "")
        m = re.search(r"\[.*\]", resp, re.S)
        if m:
            emails = json.loads(m.group(0))
            if emails and isinstance(emails, list):
                valid = [valid_email(e) for e in emails]
                valid = [e for e in valid if e]
                return valid[0] if valid else None
    except Exception:
        pass
    return None

def score(lead):
    s = 5
    if lead.get("phone"): s += 2
    if lead.get("website"): s += 2
    if lead.get("address"): s += 1
    if lead.get("email"): s += 3  # Email is gold
    return min(s, 10)

def log_new_leads_to_sheet(leads):
    """Log newly discovered leads to the Google Sheet."""
    API = "http://localhost:3000/v1/actions/"
    SPREADSHEET_ID = "1NcLE13A6aLc2lAkw-5ch46Ydyx-1vabFUstZvBh9UDI"
    now = datetime.now().isoformat()
    for lead in leads:
        payload = {
            "input": {
                "spreadsheetId": SPREADSHEET_ID,
                "range": "Sheet1!A:K",
                "values": [[
                    now[:10],
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
                    print(f"    📊 logged {lead['name']} to sheet")
                else:
                    print(f"    ⚠️ sheet log failed for {lead['name']}: {resp}")
        except Exception as e:
            print(f"    ⚠️ sheet request error for {lead['name']}: {e}")


def main():
    print(f"🔍 Arlo REAL v3 starting {datetime.now():%Y-%m-%d %H:%M}")
    print(f"   Strategy: Two-phase email hunting")
    try:
        findings = json.load(open(OUTPUT_FILE))
    except Exception:
        findings = {"leads": [], "total_discovered": 0}
    existing_keys = {(l.get("name") or l.get("business_name", "")).lower().strip()
                     for l in findings.get("leads", [])}
    new_leads = []
    
    # ===== PHASE 1: Search for businesses (prioritize email results) =====
    print("\n📋 PHASE 1: Industry/city search (email-prioritized)")
    for industry, city in weighted_rotation_pairs(QUERIES_PER_RUN):
        if len(new_leads) >= LEADS_TARGET: break
        
        # Search 1: Try to find businesses with email addresses
        q1 = f"{industry} companies in {city} Florida email contact owner info"
        print(f"  🔎 {industry} / {city} (email search)")
        d = tavily(q1)
        if d:
            raw = (d.get("answer") or "") + "\n\n" + "\n\n".join(
                f"{r.get('title','')}\n{r.get('url','')}\n{r.get('content','')}"
                for r in d.get("results", []))
            for b in extract_leads(raw, industry, city, require_email=True):
                key = b["name"].lower().strip()
                if not key or key in existing_keys: continue
                existing_keys.add(key)
                new_leads.append({
                    "name": b["name"].strip(),
                    "industry": industry,
                    "city": city,
                    "website": b.get("website"),
                    "phone": b.get("phone"),
                    "address": b.get("address"),
                    "email": b.get("email"),
                    "score": score(b),
                    "priority": "high" if score(b) >= 8 else ("medium" if score(b) >= 6 else "low"),
                    "status": "new",
                    "source": "arlo_real_tavily",
                    "notes": f"Real {industry} business found via web research in {city}.",
                    "discovered_at": datetime.now().isoformat(),
                })
                if len(new_leads) >= LEADS_TARGET: break
        
        # Search 2: General business search (catch what email search missed)
        if len(new_leads) < LEADS_TARGET:
            q2 = f"{industry} businesses in {city} Florida phone address"
            print(f"  🔎 {industry} / {city} (general search)")
            d = tavily(q2)
            if d:
                raw = (d.get("answer") or "") + "\n\n" + "\n\n".join(
                    f"{r.get('title','')}\n{r.get('url','')}\n{r.get('content','')}"
                    for r in d.get("results", []))
                for b in extract_leads(raw, industry, city):
                    key = b["name"].lower().strip()
                    if not key or key in existing_keys: continue
                    existing_keys.add(key)
                    new_leads.append({
                        "name": b["name"].strip(),
                        "industry": industry,
                        "city": city,
                        "website": b.get("website"),
                        "phone": b.get("phone"),
                        "address": b.get("address"),
                        "email": b.get("email"),  # May be None
                        "score": score(b),
                        "priority": "high" if score(b) >= 8 else ("medium" if score(b) >= 6 else "low"),
                        "status": "new",
                        "source": "arlo_real_tavily",
                        "notes": f"Real {industry} business found via web research in {city}.",
                        "discovered_at": datetime.now().isoformat(),
                    })
                    if len(new_leads) >= LEADS_TARGET: break
    
    # ===== PHASE 2: Website scraping for email enrichment =====
    phone_only_with_websites = [l for l in new_leads if not l.get("email") and l.get("website")]
    if phone_only_with_websites:
        print(f"\n📋 PHASE 2: Website scraping for emails ({len(phone_only_with_websites)} leads)")
        for lead in phone_only_with_websites:
            print(f"  🔎 scraping {lead['website']} for {lead['name']}")
            email = scrape_website_for_email(lead["website"])
            if email:
                lead["email"] = email
                lead["score"] = score(lead)
                lead["priority"] = "high" if lead["score"] >= 8 else ("medium" if lead["score"] >= 6 else "low")
                lead["notes"] += f" Email found via website scrape: {email}"
                print(f"    ✅ Found: {email}")
            else:
                print(f"    ❌ No email found")
    
    # ===== PHASE 3: Targeted email search for remaining phone-only leads =====
    still_no_email = [l for l in new_leads if not l.get("email")]
    if still_no_email and EMAIL_ENRICH_QUERIES > 0:
        print(f"\n📋 PHASE 3: Targeted email search ({min(len(still_no_email), EMAIL_ENRICH_QUERIES)}/{len(still_no_email)} leads)")
        for lead in still_no_email[:EMAIL_ENRICH_QUERIES]:
            print(f"  🔎 searching for {lead['name']} email")
            email = search_for_email_by_name(lead)
            if email:
                lead["email"] = email
                lead["score"] = score(lead)
                lead["priority"] = "high" if lead["score"] >= 8 else ("medium" if lead["score"] >= 6 else "low")
                lead["notes"] += f" Email found via targeted search: {email}"
                print(f"    ✅ Found: {email}")
            else:
                print(f"    ❌ No email found")
    
    # Save results
    findings.setdefault("leads", []).extend(new_leads)
    findings["leads_found"] = len(findings["leads"])
    findings["total_leads"] = len(findings["leads"])
    findings["new_today"] = len(new_leads)
    findings["last_run"] = datetime.now().isoformat()
    findings["date"] = datetime.now().strftime("%Y-%m-%d")
    findings["total_discovered"] = findings.get("total_discovered", 0) + len(new_leads)
    
    # Stats
    with_email = sum(1 for l in new_leads if l.get("email"))
    phone_only = sum(1 for l in new_leads if not l.get("email"))
    
    json.dump(findings, open(OUTPUT_FILE, "w"), indent=2)
    print(f"\n✅ {len(new_leads)} REAL leads added (total: {len(findings['leads'])})")
    print(f"   📧 With email: {with_email}")
    print(f"   📞 Phone only: {phone_only}")
    
    # Log new leads to Google Sheet
    if new_leads:
        log_new_leads_to_sheet(new_leads)

if __name__ == "__main__":
    main()
