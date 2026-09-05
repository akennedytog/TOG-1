#!/usr/bin/env python3
"""
Find accounts Alec follows that DON'T follow him back.
Pulls full followers list via Instagram internal API, compares against
the already-extracted following list (data/ig_following.json).

Usage:
  python3 scripts/ig_not_following_back.py
"""
import json
import time
import urllib.request
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
COOKIE_FILE = WS / "data" / "ig_session.json"
FOLLOWING_FILE = WS / "data" / "ig_following.json"
OUT = WS / "data" / "ig_not_following_back.json"

USER_ID = "442174341"
USERNAME = "aleckennedy2"


def build_headers():
    cookies = json.load(open(COOKIE_FILE))
    jar = {c["name"]: c["value"] for c in cookies if c.get("value")}
    cookie_str = "; ".join(f"{k}={v}" for k, v in jar.items())
    csrftoken = jar.get("csrftoken", "")
    return {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Cookie": cookie_str,
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": csrftoken,
        "X-IG-App-ID": "936619743392459",
        "Referer": f"https://www.instagram.com/{USERNAME}/followers/",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
    }


def fetch_all(endpoint, user_id, referer):
    """Paginate through an Instagram friendships endpoint, return list of user dicts."""
    headers = build_headers()
    headers["Referer"] = referer
    results = []
    max_id = None
    page = 0
    while page < 500:
        url = f"https://www.instagram.com/api/v1/friendships/{user_id}/{endpoint}/?count=50"
        if max_id:
            url += f"&max_id={max_id}"
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            print(f"[ig] API error page {page} ({endpoint}): {e}")
            break
        users = data.get("users", [])
        results.extend(users)
        print(f"[ig] {endpoint} page {page}: +{len(users)} (total {len(results)})")
        max_id = data.get("next_max_id")
        if not max_id or not users:
            break
        page += 1
        time.sleep(1)
    return results


def main():
    print("[ig] Pulling full followers list...")
    followers = fetch_all("followers", USER_ID, f"https://www.instagram.com/{USERNAME}/followers/")
    print(f"[ig] Total followers: {len(followers)}")

    print("[ig] Loading following list...")
    following_data = json.load(open(FOLLOWING_FILE))
    following = following_data["following"]
    print(f"[ig] Total following: {len(following)}")

    # Build sets of usernames
    follower_names = {u.get("username") for u in followers if u.get("username")}
    following_names = {u.get("username") for u in following if u.get("username")}

    # Following but NOT followed back
    not_following_back = [u for u in following if u.get("username") in (following_names - follower_names)]

    # Also: followers who I don't follow (for reference)
    i_dont_follow = [u for u in followers if u.get("username") in (follower_names - following_names)]

    result = {
        "username": USERNAME,
        "extracted_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "total_following": len(following),
        "total_followers": len(followers),
        "following_not_following_back": len(not_following_back),
        "followers_i_dont_follow": len(i_dont_follow),
        "not_following_back": sorted(not_following_back, key=lambda u: u.get("username", "").lower()),
        "followers_i_dont_follow": sorted(i_dont_follow, key=lambda u: u.get("username", "").lower()),
    }
    OUT.write_text(json.dumps(result, indent=2))
    print(f"\n[ig] DONE.")
    print(f"[ig] Following: {len(following)} | Followers: {len(followers)}")
    print(f"[ig] Follow but NOT followed back: {len(not_following_back)}")
    print(f"[ig] Followers I don't follow: {len(i_dont_follow)}")
    print(f"[ig] Saved -> {OUT}")


if __name__ == "__main__":
    main()
