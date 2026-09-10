#!/usr/bin/env python3
"""
CRM junk-email cleanup — finds rows with junk/invalid email values and clears
them (sets Email to empty) so outreach doesn't target bad addresses.

Junk patterns: "null", "Email Us", "info@", "mailto:", Cloudflare-protected
emails (/cdn-cgi/l/email-protection), "npic@oregonstate.edu" (wrong for Terminix),
"Email Us BK...", "Alejandra Orozco@..." (name+email mashed), "#ERROR!".

READ-ONLY by default; pass --apply to write changes.
"""
import json
import re
import sys
import urllib.request

CONNECTOR = "http://127.0.0.1:3000/v1/actions"
SPREADSHEET_ID = "1NcLE13A6aLc2lAkw-5ch46Ydyx-1vabFUstZvBh9UDI"
RANGE = "A1:K212"

JUNK_PATTERNS = [
    r"^null$",
    r"^email us$",
    r"^info@$",
    r"^n/a$",
    r"^-$",
    r"^none$",
    r"mailto:",
    r"cdn-cgi/l/email-protection",
    r"npic@oregonstate\.edu",
    r"^email us ",
    r"\s+@",          # "Alejandra Orozco@..." has a space before @
    r"^#ERROR!$",
    r"@accessfloridateam\.com/lake-worth",  # mashed URL
]


def call_action(action_id, payload):
    body = {"input": payload}
    req = urllib.request.Request(
        CONNECTOR + "/" + action_id,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def is_junk(email):
    if not email:
        return False
    e = str(email).strip()
    for pat in JUNK_PATTERNS:
        if re.search(pat, e, re.IGNORECASE):
            return True
    # Basic email shape check
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", e):
        return True
    return False


def main():
    apply = "--apply" in sys.argv
    res = call_action("googlesheets.values_get", {
        "spreadsheetId": SPREADSHEET_ID,
        "range": RANGE,
    })
    rows = res.get("data", {}).get("values", [])
    if not rows:
        print("No data")
        return
    header = rows[0]
    data = [((r + [""] * 11)[:11]) for r in rows[1:]]

    junk_rows = []
    for i, r in enumerate(data):
        email = r[10]
        if is_junk(email):
            junk_rows.append((i, r[1], email))

    print(f"Junk email rows found: {len(junk_rows)}")
    for i, name, email in junk_rows:
        print(f"  row {i+2}: {name} | email={email!r}")

    if not apply:
        print("\n[DRY RUN] Pass --apply to clear these emails.")
        return

    # Clear junk emails (fix salvageable ones first)
    fixed = 0
    for i, _, email in junk_rows:
        e = str(email).strip()
        # Salvageable: strip mailto: prefix
        if e.lower().startswith("mailto:"):
            fixed_e = e[7:].strip()
            if re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", fixed_e):
                data[i][10] = fixed_e
                fixed += 1
                continue
        # Salvageable: fix space in email (bocaplumbers@g mail.com)
        if "@g mail.com" in e:
            fixed_e = e.replace("@g mail.com", "@gmail.com")
            if re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", fixed_e):
                data[i][10] = fixed_e
                fixed += 1
                continue
        data[i][10] = ""
    new_rows = [header] + data
    res2 = call_action("googlesheets.values_update", {
        "spreadsheetId": SPREADSHEET_ID,
        "range": RANGE,
        "values": new_rows,
        "valueInputOption": "USER_ENTERED",
    })
    print("\nUpdate result:", json.dumps(res2.get("data", {}), indent=2)[:300])
    print(f"DONE. Fixed {fixed} salvageable, cleared {len(junk_rows)-fixed} junk emails.")


if __name__ == "__main__":
    main()
