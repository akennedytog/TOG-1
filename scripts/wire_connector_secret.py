#!/usr/bin/env python3
"""Wire an api_key connector connection using a stored secret injected as env.
Never prints the key value. Reports only masked status."""
import json, os, sys, urllib.request

service = sys.argv[1]
envvar = sys.argv[2]
key = os.environ.get(envvar, "")
if not key:
    print(f"ERROR: {envvar} not injected into this command environment")
    sys.exit(2)

body = json.dumps({"authType": "api_key", "values": {"apiKey": key}}).encode()
req = urllib.request.Request(
    f"http://127.0.0.1:3000/api/connections/{service}",
    data=body,
    headers={"content-type": "application/json"},
    method="PUT",
)
try:
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read().decode())
        print(f"OK {service} configured. profile.displayName={data.get('profile',{}).get('displayName','?')} accountId={data.get('profile',{}).get('accountId','?')}")
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code}: {e.read().decode()[:300]}")
    sys.exit(1)
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
