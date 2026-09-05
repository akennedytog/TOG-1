#!/usr/bin/env python3
"""One-off: post the pinned thesis thread (5 tweets, reply-chained)."""
import os, sys, json
from pathlib import Path
from datetime import datetime
sys.path.insert(0, os.path.expanduser("~/.openclaw/workspace"))

TWEETS = [
    # 1 hook
    "I'm building a position around one idea: the AI buildout is a power-and-infrastructure story, not a chatbot story.\n\nThe compute, the data centers, the connectivity — that's where value compounds. I track three names that own different layers of it.",
    # 2 HIVE
    "$HIVE — the compute layer.\n\nA Bitcoin miner repurposing its data centers + power into GPU/AI cloud. $350M AI cloud contract signed, GPU cloud ARR ~$110M.\n\nThe market still prices it like a miner. The business is becoming an AI-compute company. That gap is the opportunity.",
    # 3 KEEL
    "$KEEL — the infrastructure-landlord layer.\n\nDecommissioning all US crypto mining to lease data-center capacity to AI. ~$819M liquidity funds the build.\n\n\"Power is the constraint\" — their words. Owning the power + land is the pick-and-shovel of the AI era.",
    # 4 ASTS
    "$ASTS — the connectivity layer.\n\nDirect-to-cell from space on the phones we already carry. 60+ MNO partners, 3B+ subscribers covered, 400k sq ft Midland production ramp.\n\nWhen the network is the bottleneck, capacity wins.",
    # 5 close + honesty
    "The honest part: these are small caps in a capital-heavy transition. Volatility is the price of admission. I size positions for multi-year buildouts, not day trades.\n\nNot financial advice — just the framework I'm tracking. Follow along as the AI buildout compounds.",
]

def log(m): print(f"[{datetime.now().strftime('%H:%M:%S')}] {m}")

def main():
    import tweepy
    api_key = os.getenv("TWITTER_API_KEY")
    api_secret = os.getenv("TWITTER_API_SECRET")
    at = os.getenv("TWITTER_ACCESS_TOKEN")
    ats = os.getenv("TWITTER_ACCESS_SECRET")
    if not all([api_key, api_secret, at, ats]):
        log("❌ credentials missing"); return
    client = tweepy.Client(consumer_key=api_key, consumer_secret=api_secret,
                           access_token=at, access_token_secret=ats)
    reply_to = None
    ids = []
    for i, text in enumerate(TWEETS, 1):
        kw = {"text": text}
        if reply_to:
            kw["in_reply_to_tweet_id"] = reply_to
        resp = client.create_tweet(**kw)
        tid = resp.data["id"]
        ids.append(tid)
        reply_to = tid
        log(f"✅ posted tweet {i}: {tid}")
    log("DONE: " + ", ".join(ids))

if __name__ == "__main__":
    main()
