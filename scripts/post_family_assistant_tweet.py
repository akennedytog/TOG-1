#!/usr/bin/env python3
"""One-off: post the family assistant tweet to @TheOneGroupAI."""
import os
from pathlib import Path

def load_dotenv():
    candidates = [
        Path('.env'),
        Path(__file__).parent.parent / '.env',
        Path.home() / '.openclaw' / '.env',
    ]
    for p in candidates:
        if p.exists():
            for line in p.read_text().splitlines():
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    os.environ.setdefault(k, v)
            break

load_dotenv()

TWEET = """I built an AI family assistant for my household. It lives in our family group chat and handles the stuff that used to fall through the cracks:

• "Add X to the list" → it writes to our shared family to-do sheet
• "What's on my list?" → instant rundown
• Shared with my wife — we both text it, one source of truth
• Calendar, reminders, the daily chaos

It's not a smart speaker. It's a copilot for running a family.

The same system that automates my business now runs my home. And honestly? The potential here is huge — every family has a million tiny logistics that shouldn't require a human brain to track.

If you've got a partner, kids, or just a life — this is where AI actually pays off. Not in a dashboard. In your group chat.

#AI #FamilyTech #Automation #Productivity"""

import tweepy

api_key = os.getenv('TWITTER_API_KEY')
api_secret = os.getenv('TWITTER_API_SECRET')
access_token = os.getenv('TWITTER_ACCESS_TOKEN')
access_secret = os.getenv('TWITTER_ACCESS_SECRET')

if not all([api_key, api_secret, access_token, access_secret]):
    print("❌ Twitter credentials not found")
    raise SystemExit(1)

client = tweepy.Client(
    consumer_key=api_key,
    consumer_secret=api_secret,
    access_token=access_token,
    access_token_secret=access_secret,
)

resp = client.create_tweet(text=TWEET)
print(f"✅ Tweet posted! ID: {resp.data['id']}")
