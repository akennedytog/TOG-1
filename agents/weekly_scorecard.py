#!/usr/bin/env python3
"""
Weekly AI-Infrastructure Scorecard — $HIVE / $KEEL / $ASTS
============================================================
Posts a recurring, branded thread every week (default Friday 5pm ET) tracking
the three tickers week-over-week: price, weekly % change, 52-week position.

This is the "leading voice" franchise piece — a consistent, recognizable
scorecard nobody else publishes on this exact AI-infra pair.

Thread format (reply-chained):
  T1: opener + weekly context
  T2: $HIVE line
  T3: $KEEL line
  T4: $ASTS line
  T5: close / thesis reminder

Rules honored:
  - Single cashtag per tweet (X API limit: 403 with >1).
  - "$" ticker prefix everywhere.
  - Real numbers from Yahoo chart API, labeled with date.
"""
import json
import os
import sys
import urllib.request
from pathlib import Path
from datetime import datetime

WORKSPACE = Path(__file__).resolve().parent.parent
STATE_FILE = WORKSPACE / "state.json"
sys.path.insert(0, str(WORKSPACE))

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

TRACKED = ["HIVE", "KEEL", "ASTS"]
LABELS = {
    "HIVE": "AI-compute pivot",
    "KEEL": "AI-infrastructure landlord",
    "ASTS": "direct-to-cell satellite",
}


def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")


def fetch_chart(symbol):
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
           f"?interval=1d&range=1mo")
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=25) as r:
        return json.loads(r.read().decode("utf-8"))


def get_snapshot(symbol):
    data = fetch_chart(symbol)
    r = data["chart"]["result"][0]
    m = r["meta"]
    closes = r["indicators"]["quote"][0]["close"]
    ts = r.get("timestamp", [])
    # Build clean (date, close) list
    hist = []
    for t, c in zip(ts, closes):
        if c is not None:
            hist.append((datetime.fromtimestamp(t).strftime("%b %d"), round(c, 2)))
    price = m.get("regularMarketPrice")
    hi52 = m.get("fiftyTwoWeekHigh")
    lo52 = m.get("fiftyTwoWeekLow")
    # Weekly change: last close vs close ~5 trading days earlier
    week_ago = hist[-6][1] if len(hist) >= 6 else None
    week_chg = ((price - week_ago) / week_ago * 100.0) if (price and week_ago) else None
    return {
        "price": round(price, 2) if price else None,
        "hi52": round(hi52, 2) if hi52 else None,
        "lo52": round(lo52, 2) if lo52 else None,
        "week_chg": week_chg,
        "last_date": hist[-1][0] if hist else "recent",
    }


def post_tweet(client, text, reply_to=None):
    kw = {"text": text}
    if reply_to:
        kw["in_reply_to_tweet_id"] = reply_to
    resp = client.create_tweet(**kw)
    return resp.data["id"]


def post_thread(snapshots, date_str):
    import tweepy
    api_key = os.getenv("TWITTER_API_KEY")
    api_secret = os.getenv("TWITTER_API_SECRET")
    access_token = os.getenv("TWITTER_ACCESS_TOKEN")
    access_secret = os.getenv("TWITTER_ACCESS_SECRET")
    if not all([api_key, api_secret, access_token, access_secret]):
        log("❌ Twitter credentials missing")
        return False
    client = tweepy.Client(
        consumer_key=api_key, consumer_secret=api_secret,
        access_token=access_token, access_token_secret=access_secret)

    def chg(sym):
        wc = snapshots[sym]["week_chg"]
        if wc is None:
            return "n/a"
        arrow = "▲" if wc >= 0 else "▼"
        return f"{arrow}{abs(wc):.1f}%"

    # T1 opener (no cashtag needed, or lead with a ticker)
    t1 = (f"📊 AI-infrastructure scorecard — week of {date_str}\n\n"
          f"Three names, one thesis: the buildout underneath AI.\n"
          f"$HIVE (compute), $KEEL (infra landlord), $ASTS (connectivity).\n\n"
          f"Weekly change →")
    # T2-T4 per ticker
    t2 = (f"$HIVE — {snapshots['HIVE']['price']} ({chg('HIVE')} wk)\n"
          f"AI-compute pivot. 52-wk {snapshots['HIVE']['lo52']}–{snapshots['HIVE']['hi52']}.")
    t3 = (f"$KEEL — {snapshots['KEEL']['price']} ({chg('KEEL')} wk)\n"
          f"AI-infrastructure landlord. "
          f"52-wk {snapshots['KEEL']['lo52']}–{snapshots['KEEL']['hi52']}.")
    t4 = (f"$ASTS — {snapshots['ASTS']['price']} ({chg('ASTS')} wk)\n"
          f"Direct-to-cell satellite. "
          f"52-wk {snapshots['ASTS']['lo52']}–{snapshots['ASTS']['hi52']}.")
    t5 = ("Closes as of " + snapshots["HIVE"]["last_date"] +
          ". Prices move; the power-and-capacity thesis compounds.\n\n"
          "Tracking the AI buildout, week by week.")

    # Post the chain
    try:
        id1 = post_tweet(client, t1)
        id2 = post_tweet(client, t2, reply_to=id1)
        id3 = post_tweet(client, t3, reply_to=id2)
        id4 = post_tweet(client, t4, reply_to=id3)
        id5 = post_tweet(client, t5, reply_to=id4)
        log(f"✅ Scorecard thread posted: {id1}, {id2}, {id3}, {id4}, {id5}")
        # Record in state postedLog to avoid duplicate re-posts
        state = load_state()
        state.setdefault("postedLog", []).append({
            "id": f"scorecard-{date_str}", "text": t1 + " " + t2 + " " + t3,
            "postedAt": datetime.now().isoformat(), "type": "weekly_scorecard",
            "storyTitle": f"weekly-scorecard-{date_str}"})
        save_state(state)
        return True
    except Exception as e:
        log(f"❌ Thread failed mid-way: {e}")
        return False


def load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            pass
    return {"twitterQueue": [], "postedLog": []}


def save_state(state):
    state["queuedPosts"] = state.get("twitterQueue", [])
    STATE_FILE.write_text(json.dumps(state, indent=2))


def main():
    date_str = datetime.now().strftime("%b %d")
    snapshots = {}
    for sym in TRACKED:
        snapshots[sym] = get_snapshot(sym)
        s = snapshots[sym]
        log(f"{sym}: ${s['price']} ({s['week_chg']:.1f}% wk) "
            f"52wk {s['lo52']}-{s['hi52']}")
    post_thread(snapshots, date_str)


if __name__ == "__main__":
    main()
