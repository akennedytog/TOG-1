#!/usr/bin/env python3
"""Find Netlify auth token and delete the accidental magenta site."""
import json, os, urllib.request

# Find token
token = None
paths = [
    os.path.expanduser("~/.netlify/config.json"),
    os.path.expanduser("~/.config/netlify/config.json"),
]
for p in paths:
    try:
        d = json.load(open(p))
        if "token" in d:
            token = d["token"]
            break
        # nested
        for v in d.values():
            if isinstance(v, dict) and "token" in v:
                token = v["token"]
                break
        if token:
            break
    except Exception:
        pass

if not token:
    print("NO_TOKEN_FOUND")
    raise SystemExit(1)

print(f"Token found: {token[:8]}...")

# Delete magenta site
site_id = "83c2672f-b2ba-4e9a-9a91-0f662c2537b7"
req = urllib.request.Request(
    f"https://api.netlify.com/api/v1/sites/{site_id}",
    method="DELETE",
    headers={"Authorization": f"Bearer {token}"},
)
try:
    with urllib.request.urlopen(req, timeout=15) as r:
        print(f"DELETE status: {r.status}")
        print(r.read().decode()[:200])
except urllib.error.HTTPError as e:
    print(f"DELETE failed: {e.code} {e.read().decode()[:200]}")
