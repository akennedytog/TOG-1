#!/usr/bin/env python3
"""
Optimized content refresh - Uses requests + XML parsing instead of feedparser
"""

import json
import requests
import xml.etree.ElementTree as ET
import time
import os
from datetime import datetime
from pathlib import Path

# Config
STATE_FILE = Path('/Users/aleckennedy/.openclaw/workspace/state.json')
MEMORY_DIR = Path('/Users/aleckennedy/.openclaw/workspace/memory')
CACHE_FILE = Path('/Users/aleckennedy/.openclaw/workspace/.content_cache.json')

# RSS Feeds (fast, structured data)
FEEDS = {
    'hackernews': 'https://hnrss.org/frontpage?points=100',
}

def load_cache():
    """Load cached stories to avoid re-processing"""
    if CACHE_FILE.exists():
        return json.loads(CACHE_FILE.read_text())
    return {'stories': {}, 'last_check': None}

def save_cache(cache):
    CACHE_FILE.write_text(json.dumps(cache))

def fetch_hn_rss():
    """Fetch HN RSS and parse manually"""
    try:
        resp = requests.get('https://hnrss.org/frontpage?points=100', timeout=10)
        resp.raise_for_status()
        
        # Parse XML
        root = ET.fromstring(resp.content)
        
        # Find all items
        stories = []
        for item in root.findall('.//item'):
            title = item.find('title')
            link = item.find('link')
            if title is not None and link is not None:
                stories.append({
                    'title': title.text,
                    'link': link.text,
                })
        
        return stories[:10]  # Top 10
    except Exception as e:
        print(f"⚠️ Error fetching HN: {e}")
        return []

def check_trends():
    """Quick trend check using RSS feeds"""
    print("📊 Checking trends...")
    cache = load_cache()
    
    # Fetch HN
    print("  Fetching Hacker News...")
    hn_stories = fetch_hn_rss()
    print(f"    ✅ {len(hn_stories)} stories")
    
    cache['stories'] = {'hackernews': hn_stories}
    cache['last_check'] = datetime.now().isoformat()
    save_cache(cache)
    
    return cache['stories']

def generate_posts_from_trends(trends):
    """Generate 3 posts from trending topics"""
    posts = []
    
    # Get HN stories
    hn_stories = trends.get('hackernews', [])
    
    # Morning post - HN top story (rewritten as original observation)
    if hn_stories and len(hn_stories) > 0:
        top = hn_stories[0]
        posts.append({
            'id': f"morning_{datetime.now().strftime('%Y-%m-%d')}",
            'text': f"Noticed this today: {top['title']}\n\nWhat does this mean for SMBs using AI?",
            'scheduled': '09:00',
            'source': 'Trend Analysis'
        })
    
    # Afternoon post - Another HN story or general question (rewritten as original observation)
    if hn_stories and len(hn_stories) > 1:
        story = hn_stories[1]
        posts.append({
            'id': f"afternoon_{datetime.now().strftime('%Y-%m-%d')}",
            'text': f"Saw this development:\n\n{story['title']}",
            'scheduled': '15:00',
            'source': 'Trend Analysis'
        })
    else:
        posts.append({
            'id': f"afternoon_{datetime.now().strftime('%Y-%m-%d')}",
            'text': "Quick question: What AI tool are you experimenting with this week?\n\nI'm testing a few new workflows.\n\nWhat about you?",
            'scheduled': '15:00',
            'source': 'Generated'
        })
    
    return posts

def is_content_duplicate(text, posted_log, days=30):
    """Check if similar content exists in posted log"""
    import hashlib
    
    text_hash = hashlib.md5(text[:80].lower().strip().encode()).hexdigest()[:12]
    cutoff = datetime.now() - __import__('datetime').timedelta(days=days)
    
    for entry in posted_log:
        try:
            posted_at = entry.get('postedAt', '')
            if posted_at:
                posted_time = datetime.fromisoformat(posted_at.replace('Z', '+00:00').replace('+00:00', ''))
                if posted_time > cutoff:
                    existing_hash = hashlib.md5(entry.get('text', '')[:80].lower().strip().encode()).hexdigest()[:12]
                    if existing_hash == text_hash:
                        return True
        except:
            pass
    return False

def update_state(posts):
    """Update state.json with new posts"""
    if not STATE_FILE.exists():
        state = {'twitterQueue': [], 'postedLog': [], 'postedToday': 0}
    else:
        state = json.loads(STATE_FILE.read_text())
    
    posted_log = state.get('postedLog', [])
    added = 0
    skipped = 0
    
    # Add new posts to queue (skip duplicates)
    for post in posts:
        if is_content_duplicate(post['text'], posted_log):
            print(f"  ⚠️ Skipping duplicate: {post['text'][:50]}...")
            skipped += 1
            continue
            
        state['twitterQueue'].append({
            'id': post['id'],
            'status': 'queued',
            'text': post['text'],
            'scheduledFor': post['scheduled'],
            'source': post['source'],
            'createdAt': datetime.now().isoformat()
        })
        added += 1
    
    state['lastRefresh'] = datetime.now().isoformat()
    STATE_FILE.write_text(json.dumps(state, indent=2))
    print(f"✅ Added {added} posts to queue (skipped {skipped} duplicates)")

def main():
    print("🔄 Content Refresh (Optimized)")
    print("-" * 40)
    
    start = time.time()
    
    # Check trends (fast RSS)
    trends = check_trends()
    
    # Generate posts
    posts = generate_posts_from_trends(trends)
    
    # Update state
    update_state(posts)
    
    elapsed = time.time() - start
    print(f"\n✨ Complete in {elapsed:.1f}s")
    print(f"📊 Fetched {sum(len(v) for v in trends.values())} stories")
    print(f"📝 Generated {len(posts)} posts")

if __name__ == "__main__":
    main()
