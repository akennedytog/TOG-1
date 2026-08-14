#!/bin/bash
# Twitter Automation Runner
# Canonical flow: refresh fresh content, then post via post_tweet.py

set -euo pipefail

cd /Users/aleckennedy/.openclaw/workspace

echo "🤖 Twitter Automation - $(date)"
echo "================================"

echo ""
echo "📅 Step 1: Refreshing fresh content..."
python3 content_refresh_v2.py

echo ""
echo "📤 Step 2: Posting from queue..."
python3 post_tweet.py

echo ""
echo "✅ Automation complete!"
