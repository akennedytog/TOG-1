#!/usr/bin/env python3
"""Check children of candidate empty folders before cleanup."""
import json
import urllib.request

BASE = "http://localhost:3000/v1/actions"

def post(action, payload):
    req = urllib.request.Request(
        f"{BASE}/{action}",
        data=json.dumps({"input": payload}).encode(),
        headers={"content-type": "application/json"}, method="POST")
    return json.loads(urllib.request.urlopen(req, timeout=60).read().decode())

empties = [
    ("Chat GPT", "1o9qJDVik-xcbjIVCrcj-j8c7M8GfDB0r"),
    ("Eastco Taxes", "1I3h9QOXE5k2OlqLb4mA1wXQdiXKaSvas"),
    ("Personal", "1C5WHhec5uYCFM9R4iYj7_eY09nMF_0X2"),
    ("Untitled form (File responses)", "1hf-ze44L0nInpU4zSy2GT3SEf1fv2PsE_Q3NUDu_zKr2yggzSz1K3nQF32hwoflVvnTL-CXQ"),
    ("Work Applications ", "1ekZi1xEzHtucBczMfmRiuUFoC15ESarg"),
]
for nm, fid in empties:
    try:
        r = post("googledrive.files.list",
                 {"pageSize": 50, "q": f"'{fid}' in parents and trashed = false"})
        files = r["data"].get("files", [])
        print(f"=== {nm!r} ({fid}): {len(files)} children")
        for f in files:
            print(f"   - {f['name']}  [{f['mimeType']}]")
    except Exception as e:
        print(f"{nm!r}: ERROR {e}")
