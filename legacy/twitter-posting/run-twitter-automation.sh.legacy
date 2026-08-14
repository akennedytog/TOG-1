#!/bin/bash
# Twitter Automation Runner
# Generates content from calendar and posts to Twitter

set -e

cd /Users/aleckennedy/.openclaw/workspace

echo "🤖 Twitter Automation - $(date)"
echo "================================"

# Step 1: Generate content from calendar
echo ""
echo "📅 Step 1: Generating content from calendar..."
python3 twitter_content_generator.py

# Step 2: Check if there are posts to send
echo ""
echo "📤 Step 2: Posting to Twitter..."
node post-from-queue.mjs

echo ""
echo "✅ Automation complete!"
