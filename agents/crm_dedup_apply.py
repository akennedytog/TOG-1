#!/usr/bin/env python3
"""
CRM dedup apply — merges duplicate business records in the Google Sheet CRM.

For each duplicate group (same phone/email/name), keeps the single most-complete
row and drops the rest. Selection priority:
  1. Has email (non-junk)
  2. Has website
  3. Status: drafted > call_listed > new > other
  4. Higher score
  5. Earlier row (stable)

Writes the deduplicated sheet back via values_update (full rewrite of the data
range). Prints a summary of what was merged/dropped.

Usage:
  python3 agents/crm_dedup_apply.py [--dry-run]
"""
import json
import re
import sys
import urllib.request

CONNECTOR = "http://127.0.0.1:3000/v1/actions"
SPREADSHEET_ID = "1NcLE13A6aLc2lAkw-5ch46Ydyx-1vabFUstZvBh9UDI"
RANGE = "A1:K400"

STATUS_PRIORITY = {"drafted": 3, "call_listed": 2, "new": 1}


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
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits


def norm_email(e):
    if not e:
        return ""
    e = str(e).strip().lower()
    if e.startswith("mailto:"):
        e = e[5:]
    if e in ("null", "email us", "info@", "n/a", "-", "none"):
        return ""
    return e


def norm_name(n):
    if not n:
        return ""
    n = str(n).lower()
    n = re.sub(r"\b(llc|inc|inc\.|corp|corporation|co|company|pa|pllc|p\.a\.|p\.c\.|ltd|services|service)\b", "", n)
    n = re.sub(r"[^a-z0-9 ]", "", n)
    n = re.sub(r"\s+", " ", n).strip()
    return n


def row_quality(r):
    """Return a sortable quality score for a row (higher = better keep)."""
    email = norm_email(r[10])
    website = r[4]
    status = r[8]
    score = 0
    try:
        score = int(r[6]) if r[6] else 0
    except (ValueError, TypeError):
        score = 0
    q = 0
    if email:
        q += 100
    if website:
        q += 50
    q += STATUS_PRIORITY.get(status, 0) * 10
    q += min(score, 10)
    return q


def main():
    dry_run = "--dry-run" in sys.argv
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
    print(f"Input data rows: {len(data)}")

    # Build duplicate groups
    by_phone, by_email, by_name = {}, {}, {}
    for i, r in enumerate(data):
        phone = norm_phone(r[5])
        email = norm_email(r[10])
        nname = norm_name(r[1])
        by_phone.setdefault(phone, []).append(i)
        by_email.setdefault(email, []).append(i)
        by_name.setdefault(nname, []).append(i)

    groups = []
    seen = set()
    def add_group(idxs):
        key = tuple(sorted(idxs))
        if key in seen:
            return
        seen.add(key)
        groups.append(sorted(idxs))

    for phone, idxs in by_phone.items():
        if phone and len(idxs) > 1:
            add_group(idxs)
    for email, idxs in by_email.items():
        if email and len(idxs) > 1:
            add_group(idxs)
    for nname, idxs in by_name.items():
        if nname and len(nname) > 2 and len(idxs) > 1:
            add_group(idxs)

    # Determine rows to drop (all but best in each group)
    drop_rows = set()
    merged = []
    for g in groups:
        # Pick best row by quality, tie-break by earliest index
        best = max(g, key=lambda i: (row_quality(data[i]), -i))
        for i in g:
            if i != best:
                drop_rows.add(i)
        merged.append((best, g))

    keep_rows = [i for i in range(len(data)) if i not in drop_rows]
    print(f"Duplicate groups: {len(groups)}")
    print(f"Rows to drop: {len(drop_rows)}")
    print(f"Rows to keep: {len(keep_rows)}")

    if dry_run:
        print("\n[DRY RUN] No changes written.")
        for best, g in merged[:20]:
            print(f"  keep row {best+2}: {data[best][1]} | drop {[i+2 for i in g if i!=best]}")
        return

    # Build new sheet: header + kept rows
    new_rows = [header] + [data[i] for i in keep_rows]
    print(f"\nWriting {len(new_rows)} rows (was {len(rows)})...")
    res2 = call_action("googlesheets.values_update", {
        "spreadsheetId": SPREADSHEET_ID,
        "range": RANGE,
        "values": new_rows,
        "valueInputOption": "USER_ENTERED",
    })
    print("Update result:", json.dumps(res2.get("data", {}), indent=2)[:500])
    print("\nDONE. Deduplicated.")


if __name__ == "__main__":
    main()
