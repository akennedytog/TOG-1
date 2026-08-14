#!/bin/bash
# Twitter AI News Post - picks an article from ai-news.json and posts with commentary
# Called by cron job

set -e

NEWS_FILE="$HOME/.openclaw/workspace/theonegroup-site/ai-news.json"
WORKSPACE="$HOME/.openclaw/workspace"

# Load env
source "$HOME/.openclaw/.env" 2>/dev/null || true

# Read the news JSON
if [ ! -f "$NEWS_FILE" ]; then
    echo "No news file found"
    exit 1
fi

# Use python to pick a random article and generate a tweet
python3 << 'PYEOF'
import json, random, os, subprocess, sys

# Load news
with open(os.path.expanduser("~/.openclaw/workspace/theonegroup-site/ai-news.json")) as f:
    news = json.load(f)

articles = news.get("articles", [])
if not articles:
    print("No articles")
    sys.exit(0)

# Pick 1-2 articles
selected = random.sample(articles, min(2, len(articles)))

# Generate tweet text
tweets = []
for article in selected:
    title = article["title"]
    url = article["url"]
    source = article["source"]
    
    # Build a tweet with commentary
    tweet = f"🧵 {title}\n\n"
    
    # Add context/opinion based on keywords
    title_lower = title.lower()
    if "openai" in title_lower or "gpt" in title_lower or "chatgpt" in title_lower:
        tweet += "This is wild. AI agents are getting too smart too fast. For SMBs, the takeaway: don't ignore AI safety, but also don't let fear stop you from using tools that actually work today.\n\n"
    elif "gemini" in title_lower or "google" in title_lower:
        tweet += "Google keeps pushing. The pace of AI releases is insane — every 2-3 months there's something new. For business owners: you don't need the latest model, you need the one that actually solves your problem.\n\n"
    elif "deploy" in title_lower or "engineer" in title_lower or "startup" in title_lower:
        tweet += "The real bottleneck isn't the AI — it's getting it to work in your actual business. That's where the value is. Tools are cheap. Implementation is everything.\n\n"
    elif "altman" in title_lower or "brake" in title_lower or "regulation" in title_lower:
        tweet += "Even the people building AI are saying slow down. That tells you something. But for SMBs? The smart play is adopt early, adopt practical. Don't wait for the hype cycle to settle.\n\n"
    elif "security" in title_lower or "hack" in title_lower or "cyber" in title_lower:
        tweet += "AI security is becoming a real concern. If you're using AI tools in your business, make sure you have basic safeguards — data access controls, monitoring, and a human in the loop.\n\n"
    else:
        tweet += "This is worth paying attention to. The AI landscape shifts fast. What worked 3 months ago might be outdated today. Stay informed, but focus on what actually moves the needle for your business.\n\n"
    
    tweet += f"Full article: {url}\n\n"
    tweet += "#AI #SmallBusiness #Tech"
    
    tweets.append(tweet)

# Output for the cron job to use
for t in tweets:
    print(t)
    print("---SEPARATOR---")
PYEOF
