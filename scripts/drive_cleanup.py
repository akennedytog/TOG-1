#!/usr/bin/env python3
"""
Google Drive root cleanup: create Business folders, file loose root files
into proper folders. Reversible (only parent changes + new folders).

Resolves file IDs from names at runtime to avoid ID typos.
"""
import json
import sys
import time
import urllib.request

BASE = "http://localhost:3000/v1/actions"
ROOT = "0APRPHlZwtnbxUk9PVA"
FOLDER_MIME = "application/vnd.google-apps.folder"

FAMILY = "1BMHd_o6EzEJhGwOwkHe8FiZpCMMnt4oj"      # existing Family folder
TOG = "1DPGmdBt402IG2VLcGp668hc0rAtybunO"          # The One Group (first)


def post(action, payload):
    data = json.dumps({"input": payload}).encode()
    req = urllib.request.Request(
        f"{BASE}/{action}", data=data,
        headers={"content-type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())


def create_folder(name, parent=None):
    payload = {"name": name, "mimeType": FOLDER_MIME}
    if parent:
        payload["parents"] = [parent]
    r = post("googledrive.files.create", payload)
    if not r.get("success"):
        print(f"  CREATE FAIL {name}: {json.dumps(r)[:200]}", file=sys.stderr)
        return None
    return r["data"]["id"]


def list_root_files():
    """Return {name: id} for all non-folder root files (excluding Copy-of dump)."""
    out = {}
    tok = None
    while True:
        p = {"pageSize": 200, "q": "'root' in parents and trashed = false"}
        if tok:
            p["pageToken"] = tok
        r = post("googledrive.files.list", p)
        for f in r["data"]["files"]:
            if f["mimeType"] == FOLDER_MIME:
                continue
            if f["name"].startswith("Copy of "):
                continue
            out[f["name"]] = f["id"]
        tok = r["data"].get("nextPageToken")
        if not tok:
            break
    return out


def move(file_id, add_parent, remove_parent=ROOT):
    r = post("googledrive.files.update", {
        "fileId": file_id, "addParents": add_parent,
        "removeParents": remove_parent})
    return r.get("success", False), r


def main():
    print("Creating destination folders...", flush=True)
    biz = create_folder("Business")
    bf = create_folder("Brown-Forman", biz) if biz else None
    prm = create_folder("Pit Row Miami", biz) if biz else None
    junk = create_folder("_Archive Junk")
    print(f"  Business={biz} BF={bf} PRM={prm} Junk={junk}", flush=True)

    root = list_root_files()
    print(f"  root loose files found: {len(root)}", flush=True)

    # name -> target folder id
    plan = []
    for nm in ["01-Hook.png","02-Problem.png","03-System.png","04-Proof.png",
               "05-Workshop.png","06-CTA.png","canva-import-instagram-quote.json",
               "CAPTION-HASHTAGS.md","ChatGPT Image Aug 9, 2026, 06_28_16 PM.png",
               "IMAGE-RECREATION-GUIDE.md","SCRIPT.md","Business Ideas",
               "TOG Leads — Arlo","Iris Sales Automation",
               "TheOneGroup.info - Full System Architecture & Vendor List",
               "OpenClaw Connector Test"]:
        plan.append((nm, TOG))
    for nm in ["B-F FL MTD Portfolio Update FY26 v3b (3).xlsm",
               "B-F FY26 FL Projection Summary.xlsm","F26 PGP",
               "F27 FLASC TMF Budget.xlsx","F27 WR Workshop FLASC Slides.pptx",
               "WR Workshop Copy","WR Workshop FLASC Slides (Converted)"]:
        plan.append((nm, bf))
    for nm in ["Pit Row Miami — Operations Hub",
               "Miami Music Week 2026 - Event Submission Form",
               "Miami Music Week 2026 - Event Submission Form (Responses)"]:
        plan.append((nm, prm))
    for nm in ["Kennedy Family Bills & Subscriptions",
               "Kennedy Family Gifts & Occasions",
               "Kennedy Family Home Maintenance",
               "Kennedy Family Spain Trip",
               "Kennedy Family To-Do List","Lexus TX Tracker - Car Offers",
               "Postpartum Workout + Nutrition Plan","🏠 Family Shopping List",
               "Couples Therapy"]:
        plan.append((nm, FAMILY))
    for nm in ["Untitled document","Untitled form","Untitled spreadsheet"]:
        plan.append((nm, junk))

    # There are 2 'Iris Sales Automation' + 2 'Miami Music Week Responses' —
    # handle duplicates by moving all matches for those names.
    dup_names = {"Iris Sales Automation", "Miami Music Week 2026 - Event Submission Form (Responses)"}

    ok = 0; fail = []
    moved_names = set()
    for nm, folder in plan:
        if not folder:
            fail.append((nm, "NO_FOLDER", {})); continue
        ids = [root[k] for k in root if k == nm]
        if not ids:
            fail.append((nm, "NOT_FOUND", {})); continue
        for fid in ids:
            try:
                s, r = move(fid, folder)
            except Exception as e:
                s, r = False, {"error": str(e)}
            if s: ok += 1
            else: fail.append((nm, folder, r))
            time.sleep(0.15)
        moved_names.add(nm)

    print(f"\nDONE: moved {ok} files across {len(moved_names)} names", flush=True)
    if fail:
        print(f"FAILURES ({len(fail)}):")
        for nm, folder, r in fail[:20]:
            print(f"  - {nm}: {json.dumps(r)[:150]}")


if __name__ == "__main__":
    main()
