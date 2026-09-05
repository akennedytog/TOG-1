#!/usr/bin/env python3
"""
Instagram Following List Extractor (Path A - browser login)
Opens a HEADED browser with Alec's real Chrome profile, waits for manual login,
then scrolls the following list and extracts all usernames to a JSON file.

Usage:
  python3 scripts/ig_following_extract.py [--profile "Profile 1"] [--username aleckennedy2]
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

SKIP = {
    "accounts", "explore", "reels", "direct", "p", "stories", "tags", "about",
    "help", "privacy", "terms", "login", "signup", "web", "api", "static",
    "graphql", "i", "session", "oauth", "settings", "notifications", "saved",
    "activity", "discover", "top", "search", "invite", "emails", "edit",
    "challenge", "two_factor", "password", "username", "email", "contact",
    "business", "professional", "ads", "insights", "content", "creators",
    "verified", "meta", "facebook", "threads", "messenger", "whatsapp",
}


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--profile", default="Profile 1")
    ap.add_argument("--username", default="aleckennedy2")
    ap.add_argument("--wait-login", type=int, default=240, help="seconds to wait for manual login")
    ap.add_argument("--max-rounds", type=int, default=80, help="max scroll rounds")
    args = ap.parse_args()

    from browser_use.browser.session import BrowserSession

    print("[ig] Opening HEADED browser (fresh lightweight profile)...")
    session = BrowserSession(
        headless=False,  # visible window so Alec can log in
    )
    await session.start()

    # 1. Go to login page
    print("[ig] Navigating to Instagram login...")
    await session.navigate_to("https://www.instagram.com/accounts/login/")
    await asyncio.sleep(4)

    # 2. Wait for manual login
    print(f"[ig] >>> LOG IN NOW in the visible browser window. Waiting up to {args.wait_login}s...")
    deadline = time.time() + args.wait_login
    logged_in = False
    while time.time() < deadline:
        try:
            url = await session.get_current_page_url()
            # Only count as logged in if we're on instagram.com proper (not facebook/oidc),
            # and NOT on a login/signup/challenge page.
            if (
                url
                and "instagram.com" in url
                and "facebook.com" not in url
                and "/accounts/login" not in url
                and "/accounts/signup" not in url
                and "/challenge" not in url
                and "/accounts/emailsignup" not in url
            ):
                logged_in = True
                break
        except Exception:
            pass
        await asyncio.sleep(3)
    if not logged_in:
        print("[ig] Login not detected in time. Aborting.")
        await session.stop()
        sys.exit(1)

    print(f"[ig] Logged in! URL: {await session.get_current_page_url()}")

    # 3. Navigate to following list
    following_url = f"https://www.instagram.com/{args.username}/following/"
    print(f"[ig] Navigating to following list: {following_url}")
    await session.navigate_to(following_url)
    await asyncio.sleep(6)

    # Verify the following dialog actually loaded (not a login wall)
    try:
        url = await session.get_current_page_url()
        if "instagram.com" not in url or "/accounts/login" in url:
            print(f"[ig] WARNING: following page not loaded (url={url}). Still behind login wall?")
    except Exception:
        pass

    # 4. Scroll and extract usernames
    print("[ig] Scrolling following list and extracting usernames...")
    usernames = set()
    last_count = -1
    for round_no in range(1, args.max_rounds + 1):
        try:
            state = await session.get_state_as_text()
            found = set(re.findall(r'href="/?([A-Za-z0-9_.]{1,30})/"', state))
            found = {u for u in found if u not in SKIP and not u.startswith("_")}
            usernames |= found
        except Exception as e:
            print(f"[ig] extract error: {e}")
        # Also try direct DOM extraction of the following dialog
        try:
            page = await session.get_current_page()
            if page:
                html = await page.content()
                # Following dialog usernames appear as href="/username/" links
                found2 = set(re.findall(r'href="/?([A-Za-z0-9_.]{1,30})/"', html))
                found2 = {u for u in found2 if u not in SKIP and not u.startswith("_")}
                usernames |= found2
        except Exception:
            pass
        if len(usernames) != last_count:
            print(f"[ig] ... {len(usernames)} usernames so far")
            last_count = len(usernames)
        # Scroll down to load more
        try:
            page = await session.get_current_page()
            if page:
                await page.evaluate("window.scrollBy(0, 800)")
        except Exception:
            pass
        await asyncio.sleep(1.5)
        if round_no % 10 == 0:
            print(f"[ig] round {round_no}, {len(usernames)} usernames")

    # 5. Save
    result = {
        "username": args.username,
        "extracted_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "count": len(usernames),
        "following": sorted(usernames),
    }
    OUT.write_text(json.dumps(result, indent=2))
    print(f"[ig] DONE. Extracted {len(usernames)} usernames -> {OUT}")

    await session.stop()


if __name__ == "__main__":
    asyncio.run(main())
