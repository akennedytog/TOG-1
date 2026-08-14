#!/bin/bash
# Twitter Schedule Runner - Manual scheduling for tonight
# Add to crontab or run manually

cd ~/.openclaw/workspace

# Tonight's post at 8pm
sleep $(( ($(date -d "20:00" +%s) - $(date +%s)) ))

python3 - <<'PY'
import json
from datetime import datetime
from pathlib import Path

state_path = Path('/Users/aleckennedy/.openclaw/workspace/state.json')
text = """Behind the scenes: Our AI agent just made its first autonomous decision.

It noticed a pattern in engagement data and suggested we test a new hook format.

I approved. We will see how it performs.

This is the future: AI suggests, humans decide.

#BuildingInPublic #AI #Automation"""

if state_path.exists():
    state = json.loads(state_path.read_text())
else:
    state = {}

queue = state.get('twitterQueue')
if queue is None:
    queue = state.get('queuedPosts', [])
if not isinstance(queue, list):
    queue = []

queue.insert(0, {
    'id': f"manual_schedule_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
    'status': 'queued',
    'text': text,
    'scheduledFor': '20:00',
    'source': 'Manual-Schedule',
    'createdAt': datetime.now().isoformat(),
    'audited': True
})

state['twitterQueue'] = queue
state['queuedPosts'] = queue
state_path.write_text(json.dumps(state, indent=2))
PY

python3 post_tweet.py

# Tomorrow's posts (if running overnight)
# 10am tomorrow - queued in content-calendar.json
