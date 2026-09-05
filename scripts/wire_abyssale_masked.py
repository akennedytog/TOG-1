#!/usr/bin/env python3
"""Masked, one-shot script to wire your Abyssale API key into the local open-connector.
You type the key HERE in your own terminal (shown as dots). It is sent directly to the
connector and never printed, logged, or written to disk by this script.
"""
import getpass, json, sys, urllib.request

def main():
    service = "abyssale"
    # Masked prompt; value never echoes
    key = getpass.getpass("Paste your Abyssale API key, then press Enter (characters are hidden): ").strip()
    if not key:
        print("No key entered; aborting.")
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
            prof = data.get("profile", {})
            print(f"OK  {service} configured.")
            print(f"    account:  {prof.get('displayName','?')}  ({prof.get('accountId','?')})")
            print(f"    authType: {data.get('authType','?')}")
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode()[:300]}")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
