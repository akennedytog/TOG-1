#!/usr/bin/env python3
"""
AI News Tweet Generator - Reads ai-news.json, generates commentary tweets, queues them
"""
import json, os, random, sys
from pathlib import Path
from datetime import datetime

WORKSPACE = Path(os.path.expanduser("~/.openclaw/workspace"))
NEWS_FILE = WORKSPACE / "theonegroup-site" / "ai-news.json"
STATE_FILE = WORKSPACE / "state.json"

def load_news():
    with open(NEWS_FILE) as f:
        return json.load(f)

def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"twitterQueue": []}

def save_state(state):
    state["queuedPosts"] = state.get("twitterQueue", [])
    STATE_FILE.write_text(json.dumps(state, indent=2))

def generate_tweet(article):
    """Generate a tweet with commentary for an article"""
    title = article["title"]
    url = article["url"]
    source = article["source"]
    title_lower = title.lower()
    
    # Pick a commentary style based on article content
    # Use a global set to avoid duplicate commentary in same batch
    if not hasattr(generate_tweet, "used_commentaries"):
        generate_tweet.used_commentaries = set()
    
    if any(w in title_lower for w in ["openai", "gpt", "chatgpt", "sam altman"]):
        options = [
            "Wild stuff. AI agents are getting too capable too fast. For business owners: don't let the hype scare you off — practical AI tools are already saving real companies money today.",
            "OpenAI keeps pushing boundaries. The takeaway for SMBs: you don't need the bleeding edge. You need tools that work reliably for your specific use case.",
            "This is the kind of headline that makes people nervous. But here's the thing — the real AI opportunity for small businesses isn't AGI. It's automating the boring stuff."
        ]
        available = [o for o in options if o not in generate_tweet.used_commentaries]
        commentary = random.choice(available if available else options)
        generate_tweet.used_commentaries.add(commentary)
    elif any(w in title_lower for w in ["gemini", "google"]):
        commentary = random.choice([
            "Google shipping another model. The pace is insane — every 2-3 months there's something new. For business owners: ignore the model names. Focus on what solves your actual problem.",
            "More AI models dropping. The real question isn't which one is best — it's which one can actually integrate with your existing workflow."
        ])
    elif any(w in title_lower for w in ["deploy", "engineer", "startup", "forward"]):
        commentary = random.choice([
            "The real bottleneck isn't the AI — it's getting it to work in your actual business. Implementation is where the value is. Tools are cheap. Integration is everything.",
            "This is the part of AI nobody talks about. Everyone focuses on the models. The real work is making them useful in a real business context."
        ])
    elif any(w in title_lower for w in ["security", "hack", "cyber", "sandbox"]):
        commentary = random.choice([
            "AI security is becoming a real concern. If you're using AI in your business: set up data access controls, keep a human in the loop, and don't give AI tools access to sensitive systems without oversight.",
            "This is why AI safety matters for everyone — not just big tech. If you use AI tools, basic safeguards aren't optional anymore."
        ])
    elif any(w in title_lower for w in ["brake", "slow", "regulation", "pause"]):
        commentary = random.choice([
            "Even the people building AI are saying slow down. For SMBs: adopt early, adopt practical. Don't wait for the hype to settle, but don't bet the farm on unproven tech either.",
            "The AI slowdown debate is interesting. My take: move fast on practical automation, stay cautious on experimental stuff. Balance wins."
        ])
    else:
        commentary = random.choice([
            "Worth paying attention to. The AI landscape shifts fast. What worked 3 months ago might be outdated. Stay informed, but focus on what actually moves the needle for your business.",
            "Another day, another AI milestone. The key insight for small business owners: most of these advances don't matter to you yet. The ones that do? They're already here and affordable."
        ])
    
    return f"🧵 {title}\n\n{commentary}\n\n{url}\n\n#AI #SmallBusiness #Tech"

def main():
    news = load_news()
    articles = news.get("articles", [])
    if not articles:
        print("No articles found")
        return
    
    state = load_state()
    queue = state.get("twitterQueue", [])
    
    # Pick 2 articles (different from what's already queued)
    queued_titles = {q.get("title", "") for q in queue}
    available = [a for a in articles if a["title"] not in queued_titles]
    
    if not available:
        available = articles  # All already queued, just pick fresh ones
    
    selected = random.sample(available, min(2, len(available)))
    
    for article in selected:
        tweet_text = generate_tweet(article)
        queue.append({
            "text": tweet_text,
            "title": article["title"],
            "url": article["url"],
            "queued_at": datetime.now().isoformat(),
            "source": "ai-news"
        })
        print(f"Queued: {article['title'][:60]}...")
    
    state["twitterQueue"] = queue
    save_state(state)
    print(f"Queue now has {len(queue)} tweets")

if __name__ == "__main__":
    main()
