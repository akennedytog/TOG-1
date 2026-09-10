#!/usr/bin/env python3
"""
CRM dedup analysis — reads the Google Sheet CRM, finds duplicate business
records (by normalized phone/email/name), and outputs a merge plan.

READ-ONLY: prints the plan; does NOT modify the sheet. A separate apply step
runs after Alec reviews (or after explicit approval to apply).

Usage:
  python3 agents/crm_dedup_analyze.py
"""
import json
import re
import sys
import urllib.request

CONNECTOR = "http://127.0.0.1:3000/v1/actions"
SPREADSHEET_ID = "1NcLE13A6aLc2lAkw-5ch46Ydyx-1vabFUstZvBh9UDI"


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


def norm_phone(p):
    if not p:
        return ""
    digits = re.sub(r"\D", "", str(p))
    # Normalize to last 10 digits (strip country code 1)
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits


def norm_email(e):
    if not e:
        return ""
    e = str(e).strip().lower()
    # Strip mailto: prefix
    if e.startswith("mailto:"):
        e = e[5:]
    # Reject junk
    if e in ("null", "email us", "info@", "n/a", "-", "none"):
        return ""
    return e


def norm_name(n):
    if not n:
        return ""
    n = str(n).lower()
    # Remove common suffixes/legal forms for matching
    n = re.sub(r"\b(llc|inc|inc\.|corp|corporation|co|company|pa|pllc|p\.a\.|p\.c\.|ltd|services|service)\b", "", n)
    n = re.sub(r"[^a-z0-9 ]", "", n)
    n = re.sub(r"\s+", " ", n).strip()
    return n


def main():
    res = call_action("googlesheets.values_get", {
        "spreadsheetId": SPREADSHEET_ID,
        "range": "A1:K400",
    })
    rows = res.get("data", {}).get("values", [])
    if not rows:
        print("No data returned")
        return
    header = rows[0]
    data = rows[1:]
    print(f"Total data rows: {len(data)}")

    # Index by phone, email, normalized name
    by_phone = {}
    by_email = {}
    by_name = {}
    for i, r in enumerate(data):
        # Pad row to 11 cols
        r = (r + [""] * 11)[:11]
        name = r[1]
        phone = norm_phone(r[5])
        email = norm_email(r[10])
        nname = norm_name(name)
        by_phone.setdefault(phone, []).append(i)
        by_email.setdefault(email, []).append(i)
        by_name.setdefault(nname, []).append(i)

    dup_groups = []
    seen = set()

    def add_group(indices):
        key = tuple(sorted(indices))
        if key in seen:
            return
        seen.add(key)
        dup_groups.append(sorted(indices))

    # Phone duplicates (non-empty)
    for phone, idxs in by_phone.items():
        if phone and len(idxs) > 1:
            add_group(idxs)
    # Email duplicates (non-empty)
    for email, idxs in by_email.items():
        if email and len(idxs) > 1:
            add_group(idxs)
    # Name duplicates (non-empty, len>2)
    for nname, idxs in by_name.items():
        if nname and len(nname) > 2 and len(idxs) > 1:
            add_group(idxs)

    print(f"\nDuplicate groups found: {len(dup_groups)}")
    print("=" * 60)
    for g in dup_groups:
        print(f"\nGROUP (rows {[i+2 for i in g]}):")
        for i in g:
            r = (data[i] + [""] * 11)[:11]
            print(f"  row {i+2}: {r[1]} | {r[5]} | {r[10]} | status={r[8]}")
    print("\n" + "=" * 60)
    print(f"Total rows that are part of a duplicate group: {len(seen)}")


if __name__ == "__main__":
    main()
