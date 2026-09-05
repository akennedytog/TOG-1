#!/usr/bin/env python3
"""
Instagram Following List Extractor v2 (robust)
1. Opens HEADED browser, waits for manual login
2. Exports session cookies
3. Uses Instagram's internal web API to fetch the FULL following list as JSON
   (much more reliable than DOM scraping; handles pagination)

Usage:
  python3 scripts/ig_following_extract2.py [--username aleckennedy2] [--wait-login 600]
"""
import argparse
import asyncio
import json
import re
import sys
import time
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
OUT = WS / "data" / "ig_following.json"
COOKIE_FILE = WS / "data" / "ig_session.json"


async def get_session_cookies(session, wait_login):
    """Open headed browser, wait for login, return cookies dict."""
    print("[ig] Opening HEADED browser...")
    await session.start()
    await session.navigate_to("https://www.instagram.com/accounts/login/")
    await asyncio.sleep(4)

    print(f"[ig] >>> LOG IN NOW in the visible browser window. Waiting up to {wait_login}s...")
    deadline = time.time() + wait_login
    while time.time() < deadline:
        try:
            url = await session.get_current_page_url()
            if (
                url
                and "instagram.com" in url
                and "facebook.com" not in url
                and "/accounts/login" not in url
                and "/accounts/signup" not in url
                and "/challenge" not in url
                and "/accounts/emailsignup" not in url
            ):
                print(f"[ig] Logged in! URL: {url}")
                break
        except Exception:
            pass
        await asyncio.sleep(3)
    else:
        print("[ig] Login not detected in time. Aborting.")
        await session.stop()
        sys.exit(1)

    # Export cookies
    state = await session.export_storage_state()
    cookies = state.get("cookies", [])
    COOKIE_FILE.write_text(json.dumps(cookies, indent=2))
    print(f"[ig] Saved {len(cookies)} cookies -> {COOKIE_FILE}")
    return cookies


def cookies_to_dict(cookies):
    """Convert browser cookies list to a requests-friendly dict + csrftoken."""
    jar = {}
    csrftoken = None
    for c in cookies:
        name = c.get("name")
        value = c.get("value")
        if name and value:
            jar[name] = value
            if name == "csrftoken":
                csrftoken = value
    return jar, csrftoken


def fetch_following(cookies, username):
    """Use Instagram internal API to fetch full following list."""
    import urllib.request

    jar, csrftoken = cookies_to_dict(cookies)
    if not csrftoken:
        print("[ig] WARNING: no csrftoken in cookies")
    sessionid = jar.get("sessionid")
    if not sessionid:
        print("[ig] ERROR: no sessionid cookie — not logged in properly")
        return []

    # Build cookie header
    cookie_str = "; ".join(f"{k}={v}" for k, v in jar.items())

    # First get the user id
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Cookie": cookie_str,
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": csrftoken or "",
        "X-IG-App-ID": "936619743392459",
        "Referer": f"https://www.instagram.com/{username}/following/",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
    }

    # Get user id from profile page
    try:
        req = urllib.request.Request(f"https://www.instagram.com/{username}/", headers=headers)
        with urllib.request.urlopen(req, timeout=20) as resp:
            html = resp.read().decode("utf-8", "ignore")
        m = re.search(r'"user_id":"(\d+)"', html) or re.search(r'"id":"(\d+)"', html)
        if not m:
            m = re.search(r'"pk":"(\d+)"', html)
        if not m:
            print("[ig] Could not find user id in profile HTML")
            return []
        user_id = m.group(1)
        print(f"[ig] User id: {user_id}")
    except Exception as e:
        print(f"[ig] Error getting user id: {e}")
        return []

    # Fetch following via internal API
    following = []
    max_id = None
    page = 0
    while page < 200:  # safety cap
        url = f"https://www.instagram.com/api/v1/friendships/{user_id}/following/?count=50"
        if max_id:
            url += f"&max_id={max_id}"
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            print(f"[ig] API error page {page}: {e}")
            break

        users = data.get("users", [])
        for u in users:
            following.append({
                "username": u.get("username"),
                "full_name": u.get("full_name"),
                "is_verified": u.get("is_verified", False),
                "is_private": u.get("is_private", False),
                "pk": u.get("pk"),
            })
        print(f"[ig] page {page}: +{len(users)} (total {len(following)})")

        max_id = data.get("next_max_id")
        if not max_id or not users:
            break
        page += 1
        time.sleep(1)  # be polite

    return following


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--username", default="aleckennedy2")
    ap.add_argument("--wait-login", type=int, default=600)
    args = ap.parse_args()

    from browser_use.browser.session import BrowserSession

    session = BrowserSession(headless=False)
    cookies = await get_session_cookies(session, args.wait_login)
    await session.stop()

    print("[ig] Fetching following list via internal API...")
    following = fetch_following(cookies, args.username)

    result = {
        "username": args.username,
        "extracted_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "count": len(following),
        "following": following,
    }
    OUT.write_text(json.dumps(result, indent=2))
    print(f"[ig] DONE. Extracted {len(following)} accounts -> {OUT}")


if __name__ == "__main__":
    asyncio.run(main())
