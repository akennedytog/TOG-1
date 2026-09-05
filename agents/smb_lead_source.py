#!/usr/bin/env python3
"""
Weekly SMB Lead Source — The One Group
Finds real, email-verified SMB leads in the industries the site targets
(HVAC, legal, medical/dental, accounting) across Miami / Ft. Lauderdale /
West Palm Beach / Boca Raton, then enriches emails and merges into the
Iris pipeline (data/arlo_findings.json) as status="new" so Iris drafts them.

Method (proven 8/14): Firecrawl search -> candidate businesses -> website
discovery + aggressive email extraction (reuses enrich_leads.py logic).

Run:  python3 agents/smb_lead_source.py --industries "HVAC,Legal,Dental" --cities "Miami,Fort Lauderdale" --limit 8
      python3 agents/smb_lead_source.py --dry-run   (preview only, no merge)
"""
import argparse, json, re, ssl, html, time, urllib.request, subprocess, sys
from datetime import datetime
from pathlib import Path

WS = Path(__file__).resolve().parent.parent
FINDINGS = WS / "data" / "arlo_findings.json"
OUT = WS / "data" / "smb_lead_source.json"

CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
CFEMAIL_RE = re.compile(r'data-cfemail="([0-9a-fA-F]+)"')
JUNK = ("sentry", "wixpress", "example.", "godaddy", ".png", ".jpg", ".webp", ".gif",
        "u003", "wordpress", "sitelock", "placeholder", "yourdomain", "@email.com",
        "@domain", "@sentry", "privacy", "noreply", "no-reply", "abuse@")
PREFERRED = ("info@", "contact@", "office@", "hello@", "admin@", "service@", "sales@", "support@")
DIRS = ("yelp.", "yellowpages.", "angi.", "forbes.", "facebook.", "bbb.", "thumbtack.",
        "homeadvisor.", "google.", "mapquest.", "manta.", "nextdoor.", "porch.", "expertise.",
        "angi.com", "thisoldhouse.", "bankrate.", "nerdwallet.", "usnews.")
PATHS = ("/contact", "/contact-us", "/contactus", "/contact.html", "/about", "/about-us", "", "/locations")

# Industry -> search terms (match the site's verticals)
INDUSTRY_TERMS = {
    "HVAC": "air conditioning company",
    "Legal": "law firm",
    "Dental": "dentist",
    "Medical": "medical practice",
    "Accounting": "CPA accounting firm",
    "Roofing": "roofing company",
    "Auto": "auto repair shop",
}


def decode_cfemail(cf):
    try:
        key = int(cf[:2], 16)
        return "".join(chr(int(cf[i:i+2], 16) ^ key) for i in range(2, len(cf), 2))
    except Exception:
        return None


def firecrawl_search(query, limit=6):
    """Run firecrawl search, return list of {url,title}."""
    out = WS / ".firecrawl" / f"smb-{int(time.time())}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["firecrawl", "search", query, "--limit", str(limit), "-o", str(out), "--json"]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
        if r.returncode != 0:
            print(f"  ⚠️ firecrawl search failed: {r.stderr[:200]}")
            return []
        data = json.loads(out.read_text())
        results = data.get("data", {}).get("web", []) if isinstance(data.get("data"), dict) else data.get("data", [])
        return [{"url": x.get("url"), "title": x.get("title")} for x in results if x.get("url")]
    except Exception as e:
        print(f"  ⚠️ firecrawl error: {e}")
        return []


def fetch(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
            return r.read().decode("utf-8", "ignore")
    except Exception:
        return ""


def extract_emails(html_text):
    found = set()
    for m in CFEMAIL_RE.finditer(html_text):
        dec = decode_cfemail(m.group(1))
        if dec:
            found.add(dec)
    for m in EMAIL_RE.finditer(html_text):
        e = m.group(0).lower()
        if not any(j in e for j in JUNK):
            found.add(e)
    return found


def find_website(name, city):
    """Find a business website via firecrawl search (skip directory sites)."""
    for q in (f'"{name}" {city} Florida', f'{name} {city} FL'):
        for r in firecrawl_search(q, limit=5):
            url = r.get("url") or ""
            m = re.search(r"https?://([^/]+)", url)
            if m and not any(d in m.group(1).lower() for d in DIRS):
                return "https://" + m.group(1)
    return None


def enrich(name, city):
    """Find website + best email for a business. Returns (website, email)."""
    website = find_website(name, city)
    if not website:
        return None, None
    emails = set()
    for p in PATHS:
        page = fetch(website.rstrip("/") + p)
        if page:
            emails |= extract_emails(page)
        if emails:
            break
    if not emails:
        return website, None
    # Prefer info@/contact@ style
    preferred = [e for e in emails if e.startswith(PREFERRED)]
    best = sorted(preferred or emails)[0]
    return website, best


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--industries", default="HVAC,Legal,Dental,Accounting")
    ap.add_argument("--cities", default="Miami,Fort Lauderdale,West Palm Beach,Boca Raton")
    ap.add_argument("--limit", type=int, default=6, help="search results per query")
    ap.add_argument("--dry-run", action="store_true", help="preview only, don't merge")
    args = ap.parse_args()

    industries = [i.strip() for i in args.industries.split(",") if i.strip()]
    cities = [c.strip() for c in args.cities.split(",") if c.strip()]

    found = []
    for ind in industries:
        term = INDUSTRY_TERMS.get(ind, ind)
        for city in cities:
            query = f"best {term} in {city} Florida"
            print(f"🔍 {query}")
            for r in firecrawl_search(query, args.limit):
                name = (r.get("title") or "").split("|")[0].split(" - ")[0].strip()
                if not name or len(name) < 3:
                    continue
                found.append({"name": name, "industry": ind, "city": city, "url": r.get("url")})

    # Dedup by name
    seen = set(); uniq = []
    for f in found:
        key = f["name"].lower()
        if key not in seen:
            seen.add(key); uniq.append(f)

    print(f"\n{len(uniq)} unique candidates. Enriching emails...")
    enriched = []
    for f in uniq[:args.limit * 4]:
        website, email = enrich(f["name"], f["city"])
        f["website"] = website
        f["email"] = email
        f["email_verified"] = bool(email)
        f["discovered_at"] = datetime.now().isoformat()
        enriched.append(f)
        print(f"  {'✅' if email else '❌'} {f['name']} | {f['industry']} | {f['city']} | {email or 'form-only'}")

    # Save raw output
    OUT.write_text(json.dumps({"generated": datetime.now().isoformat(), "leads": enriched}, indent=2))

    if args.dry_run:
        print(f"\n(dry-run — {len(enriched)} found, not merged)")
        return

    # Merge email-verified leads into Iris pipeline as status="new"
    arlo = json.loads(FINDINGS.read_text())
    existing = {l.get("name", "").lower() for l in arlo["leads"]}
    added = 0
    for f in enriched:
        if not f.get("email"):
            continue
        if f["name"].lower() in existing:
            continue
        arlo["leads"].append({
            "name": f["name"], "industry": f["industry"], "city": f["city"],
            "website": f.get("website"), "phone": None, "address": None,
            "email": f["email"], "contact_name": None, "pain_point": None,
            "score": 8, "priority": "high", "status": "new",
            "source": "smb_lead_source_weekly",
            "notes": "Real SMB lead, email verified via website scrape.",
            "discovered_at": f["discovered_at"],
        })
        existing.add(f["name"].lower())
        added += 1
    FINDINGS.write_text(json.dumps(arlo, indent=2))
    print(f"\n✅ Merged {added} new email-verified leads into Iris pipeline (total {len(arlo['leads'])}).")


if __name__ == "__main__":
    main()
