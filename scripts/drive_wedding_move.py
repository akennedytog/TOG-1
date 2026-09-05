#!/usr/bin/env python3
"""
Move all 'Copy of *.jpg' wedding photos from Google Drive root into the
'Kennedy Wedding' folder, using the open-connector local HTTP endpoint.

LIST (paginate) all matching root files, then MOVE each via files.update
with addParents=wedding folder & removeParents=root.

Reversible: only changes parents, never deletes or overwrites.
"""
import json
import sys
import time
import urllib.request
import urllib.parse

BASE = "http://localhost:3000/v1/actions"
WEDDING_FOLDER = "19j5zDWefshnmj8SQKaEQe7gI56Gi1373"   # Kennedy Wedding
DRIVE_ROOT = "0APRPHlZwtnbxUk9PVA"                      # My Drive root


def post(action, payload):
    data = json.dumps({"input": payload}).encode()
    req = urllib.request.Request(
        f"{BASE}/{action}",
        data=data,
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())


def list_wedding_files():
    """Paginate through all root 'Copy of *.jpg' files. Returns list of ids."""
    ids = []
    token = None
    page = 0
    while True:
        q = ("name contains 'Copy of' and 'root' in parents "
             "and mimeType = 'image/jpeg' and trashed = false")
        payload = {"pageSize": 200, "q": q}
        if token:
            payload["pageToken"] = token
        res = post("googledrive.files.list", payload)
        if not res.get("success"):
            print("LIST ERROR:", json.dumps(res)[:500], file=sys.stderr)
            break
        data = res.get("data", {})
        files = data.get("files", [])
        for f in files:
            ids.append((f["id"], f["name"]))
        token = data.get("nextPageToken")
        page += 1
        print(f"  page {page}: {len(files)} files (total {len(ids)})", flush=True)
        if not token:
            break
    return ids


def move_file(file_id, name):
    payload = {
        "fileId": file_id,
        "addParents": WEDDING_FOLDER,
        "removeParents": DRIVE_ROOT,
    }
    res = post("googledrive.files.update", payload)
    ok = res.get("success", False)
    return ok, res


def main():
    print(f"Target folder: {WEDDING_FOLDER} (Kennedy Wedding)", flush=True)
    files = list_wedding_files()
    print(f"Found {len(files)} wedding JPGs to move", flush=True)
    if not files:
        print("Nothing to move.")
        return

    ok_count = 0
    fail = []
    for i, (fid, fname) in enumerate(files, 1):
        try:
            ok, res = move_file(fid, fname)
        except Exception as e:
            ok, res = False, {"error": str(e)}
        if ok:
            ok_count += 1
        else:
            fail.append((fid, fname, res))
        if i % 50 == 0:
            print(f"  moved {i}/{len(files)}", flush=True)
        time.sleep(0.15)  # gentle rate limit

    print(f"\nDONE: moved {ok_count}/{len(files)}", flush=True)
    if fail:
        print(f"FAILURES ({len(fail)}):")
        for fid, fname, res in fail[:20]:
            print(f"  - {fname} ({fid}): {json.dumps(res)[:200]}")


if __name__ == "__main__":
    main()
