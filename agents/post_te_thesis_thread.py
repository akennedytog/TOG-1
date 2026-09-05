#!/usr/bin/env python3
"""One-off: post the $TE (T1 Energy) thesis thread (5 tweets, reply-chained)."""
import os, sys
from datetime import datetime
sys.path.insert(0, os.path.expanduser("~/.openclaw/workspace"))

TWEETS = [
    # 1 hook (no cashtag needed - opener)
    "Adding a second conviction to my board: the onshoring of America's solar supply chain.\n\nThe AI-infra trio covers compute and power demand. This one covers clean-energy manufacturing — a very different kind of bet.",
    # 2 TE identity
    "$TE — T1 Energy, US solar manufacturing.\n\nA former battery maker (FREYR) now building photovoltaic modules and cells in America. Multi-GW US ramp underway, ~$250M Q2 sales.\n\nThe bet: America builds its solar supply chain at home — T1 is one of the purest plays on it.",
    # 3 US potential
    "Why the US is the opportunity for $TE:\n\nSolar manufacturing is crowded globally, but domestic US capacity is the scarce piece — tariffs and policy are pulling supply chains onshore.\n\nT1 is vertically integrated (polysilicon to modules) and scaling US output. That's the edge.",
    # 4 demand signal
    "The quiet signal I like on $TE:\n\nA Clearway offtake deal for traceable modules built with domestic cells — an anchor customer validating the US-made thesis. Real demand, not a story.\n\nOutput is the number I watch: does the ramp hit multi-GW and drive margin?",
    # 5 honesty + close
    "The honest part on $TE:\n\nUS solar manufacturing is capital-heavy and policy-dependent — tariffs, IRA fate, and ramp execution are real swing factors. I size it as a manufacturing turnaround, not a sure thing.\n\nNot financial advice — just the thesis I'm tracking.",
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
