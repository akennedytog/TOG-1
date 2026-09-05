#!/usr/bin/env python3
"""Post a single optimistic $HIVE weekly-recap tweet. Validates <=280 chars + exactly one cashtag."""
import os, sys, re

text = (
    "$HIVE had a week. The $350M 5-yr GPU cloud deal with BUZZ HPC "
    "(investment-grade customer) adds ~$70M annualized revenue and pushes "
    "them toward a $200M ARR target. Stock +12% on the news, +15% in two "
    "weeks. AI-infra momentum is real. Not financial advice."
)

# validate
if len(text) > 280:
    print(f"❌ too long: {len(text)} chars"); sys.exit(1)
cashtags = re.findall(r"\$[A-Z]{1,5}\b", text)
tickers = [c for c in cashtags if c.upper() in ("$HIVE",)]
if len(tickers) != 1:
    print(f"❌ expected exactly 1 ticker cashtag, got {tickers}"); sys.exit(1)
print(f"✅ valid: {len(text)} chars, ticker cashtags={tickers}")

if "--post" in sys.argv:
    import tweepy
    client = tweepy.Client(
        consumer_key=os.getenv("TWITTER_API_KEY"),
        consumer_secret=os.getenv("TWITTER_API_SECRET"),
        access_token=os.getenv("TWITTER_ACCESS_TOKEN"),
        access_token_secret=os.getenv("TWITTER_ACCESS_SECRET"),
    )
    resp = client.create_tweet(text=text)
    print(f"✅ POSTED tweet id: {resp.data['id']}")
else:
    print("\n(dry-run — add --post to actually post)\n")
    print(text)
