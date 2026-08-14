#!/usr/bin/env python3
"""
Lead enrichment v2: website discovery + aggressive email extraction.
Handles Cloudflare cfemail obfuscation, HTML entities, deep paths, DDG email fallback.
"""
import json, re, time, ssl, html, urllib.request
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
FINDINGS = WS / "data/arlo_findings.json"
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

def decode_cfemail(cf):
    try:
        key = int(cf[:2], 16)
        return "".join(chr(int(cf[i:i+2], 16) ^ key) for i in range(2, len(cf), 2))
    except Exception:
        return None

def find_website(name, city):
    from duckduckgo_search import DDGS
    for q in (f'"{name}" {city} FL', f'{name} {city} Florida'):
        try:
            with DDGS() as ddgs:
                for r in ddgs.text(q, max_results=6):
                    href = r.get("href", "")
                    m = re.search(r"https?://([^/]+)", href)
                    if m and not any(d in m.group(1).lower() for d in DIRS):
                        return "https://" + m.group(1)
        except Exception as e:
            print(f"    ddg error: {type(e).__name__}")
        time.sleep(2)
    return None

def fetch(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"})
        with urllib.request.urlopen(req, timeout=12, context=CTX) as r:
            return r.read(500_000).decode("utf-8", "ignore")
    except Exception:
        return ""

def emails_in(html_text):
    out = []
    for cf in CFEMAIL_RE.findall(html_text):
        e = decode_cfemail(cf)
        if e: out.append(e.lower())
    text = html.unescape(html_text)
    text = re.sub(r"\s*\[at\]\s*|\s*\(at\)\s*", "@", text, flags=re.I)
    text = re.sub(r"\s*\[dot\]\s*|\s*\(dot\)\s*", ".", text, flags=re.I)
    out += [e.lower() for e in EMAIL_RE.findall(text)]
    clean = []
    for e in out:
        if not any(j in e for j in JUNK) and e not in clean:
            clean.append(e)
    return clean

def extract_emails(site):
    for path in PATHS:
        h = fetch(site.rstrip("/") + path)
        found = emails_in(h)
        if found:
            pref = [e for e in found if e.startswith(PREFERRED)]
            return (pref or found)[0]
    return None

def ddg_email_fallback(name, city):
    from duckduckgo_search import DDGS
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(f'"{name}" {city} FL email contact', max_results=5):
                body = (r.get("body") or "") + " " + (r.get("href") or "")
                found = [e.lower() for e in EMAIL_RE.findall(body) if not any(j in e.lower() for j in JUNK)]
                if found:
                    return found[0]
    except Exception:
        pass
    return None

def main():
    d = json.load(open(FINDINGS))
    stats = {"email": 0, "site_only": 0, "none": 0}
    for l in d.get("leads", []):
        if l.get("source") != "arlo_real_tavily" or l.get("email"):
            continue
        name, city = l["name"], l["city"]
        print(f"  🔎 {name} ({city})")
        if not l.get("website"):
            l["website"] = find_website(name, city)
            time.sleep(1.5)
        if l.get("website"):
            email = extract_emails(l["website"]) or ddg_email_fallback(name, city)
            if email:
                l["email"] = email; l["status"] = "enriched"
                stats["email"] += 1
                print(f"    ✅ {email}")
            else:
                stats["site_only"] += 1
                print(f"    ⚠️ site, no email: {l['website']}")
        else:
            stats["none"] += 1
            print(f"    ❌ no website")
        l["enriched_at"] = __import__("datetime").datetime.now().isoformat()
    json.dump(d, open(FINDINGS, "w"), indent=2)
    print(f"✅ emails: {stats['email']} | site-only: {stats['site_only']} | none: {stats['none']}")

if __name__ == "__main__":
    main()
