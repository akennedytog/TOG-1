#!/bin/bash
# The One Group - Multi-Platform Content Generator
# Generate content for Twitter, LinkedIn, Reddit, Newsletter, YouTube Shorts

WORKSPACE="$HOME/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/multiplatform.log"

mkdir -p "$WORKSPACE/logs"
mkdir -p "$WORKSPACE/content/multi-platform/queue"

echo "=== Multi-Platform Content Generation ===" | tee -a "$LOG_FILE"

# Get topic from command line or use default
if [ -z "$1" ]; then
    # Generate from daily intel
    TOPIC=$(python3 -c "
import json
import glob
files = glob.glob('$WORKSPACE/.content_cache.json')
if files:
    with open(files[0]) as f:
        data = json.load(f)
        stories = data.get('stories', [])
        if stories:
            print(stories[0].get('title', 'AI automation for small businesses'))
else:
    print('AI automation for small businesses')
" 2>/dev/null || echo "AI automation for small businesses")
else
    TOPIC="$1"
fi

echo "Topic: $TOPIC" | tee -a "$LOG_FILE"

cd "$WORKSPACE/content/multi-platform"

# Generate content
python3 content_engine.py "$TOPIC" 2>&1 | tee -a "$LOG_FILE"

# Queue files for posting
LATEST_JSON=$(ls -t generated/*.json 2>/dev/null | head -1)
if [ -n "$LATEST_JSON" ]; then
    echo "" | tee -a "$LOG_FILE"
    echo "Generated: $LATEST_JSON" | tee -a "$LOG_FILE"
    
    # Create queue entries for each platform
    python3 << PYTHON
import json
import os
from datetime import datetime, timedelta

with open('$LATEST_JSON') as f:
    data = json.load(f)

# Schedule posts
schedules = {
    'twitter': 0,      # Immediate
    'linkedin': 2,     # +2 hours
    'reddit': 24,      # +1 day
    'newsletter': 168, # +7 days
    'youtube_shorts': 48  # +2 days
}

for platform, offset in schedules.items():
    if platform in data['platforms']:
        scheduled_time = datetime.now() + timedelta(hours=offset)
        queue_file = f'$WORKSPACE/content/multi-platform/queue/{platform}_{scheduled_time.strftime("%Y%m%d_%H%M")}.json'
        
        queue_entry = {
            'platform': platform,
            'content': data['platforms'][platform]['content'],
            'format': data['platforms'][platform]['format'],
            'scheduled_for': scheduled_time.isoformat(),
            'status': 'queued',
            'source': '$LATEST_JSON'
        }
        
        with open(queue_file, 'w') as f:
            json.dump(queue_entry, f, indent=2)
        
        print(f"Queued for {platform}: {scheduled_time.strftime('%Y-%m-%d %H:%M')}")
PYTHON
fi

echo "" | tee -a "$LOG_FILE"
echo "Done at $(date)" | tee -a "$LOG_FILE"
