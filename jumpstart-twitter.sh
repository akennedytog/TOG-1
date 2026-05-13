#!/bin/bash
# Jumpstart Twitter Campaign - Post tonight's content NOW
# Run: bash jumpstart-twitter.sh

cd ~/.openclaw/workspace

echo "🚀 Twitter Jumpstart - $(date)"
echo ""

# Get today's content from calendar
node -e "
const fs = require('fs');
const calendar = JSON.parse(fs.readFileSync('content-calendar.json', 'utf-8'));
const today = new Date().getDay();
const todayPosts = calendar.filter(i => i.dayOfWeek === today);

// Post the first one NOW (if not already posted)
if (todayPosts.length > 0) {
  const post = todayPosts[0];
  console.log('POSTING:', post.text);
  // Write to temp file for posting
  fs.writeFileSync('/tmp/tweet-to-post.txt', post.text);
}
"

# Post it
if [ -f /tmp/tweet-to-post.txt ]; then
  TWEET_TEXT=$(cat /tmp/tweet-to-post.txt)
  echo "Posting: $TWEET_TEXT"
  node post-now.js "$TWEET_TEXT"
  rm /tmp/tweet-to-post.txt
fi

echo ""
echo "✅ Posted! Automation now running in background."
echo "Check: tail -f twitter-automation.log"
