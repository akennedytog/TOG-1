#!/bin/bash
# Twitter Campaign Manager
# Run all posting and engagement in one command

cd ~/.openclaw/workspace

echo "🐦 Twitter Campaign Manager"
echo "Started: $(date)"
echo ""

# Check rate limit status
echo "📊 Checking rate limits..."

# Post scheduled content
if [ "$1" == "post" ]; then
  echo "📝 Posting scheduled content..."
  node -e "
const fs = require('fs');
const calendar = JSON.parse(fs.readFileSync('content-calendar-next.json', 'utf-8'));
const today = new Date().toISOString().split('T')[0];
const todayPosts = calendar.posts.find(p => p.date === today);

if (todayPosts) {
  console.log('Today\\'s schedule:', todayPosts.day);
  todayPosts.schedule.forEach((post, i) => {
    console.log(\`  \${i+1}. \${post.time} - [\${post.type.toUpperCase()}] \${post.text.substring(0, 50)}...\`);
  });
}
"
fi

# Run engagement
if [ "$1" == "engage" ]; then
  echo "🤝 Running engagement system..."
  node engagement-system.js
fi

# Full run
if [ "$1" == "full" ]; then
  echo "Running full campaign..."
  node post-scheduled.js
  sleep 60
  node engagement-system.js
fi

echo ""
echo "✅ Campaign complete: $(date)"
