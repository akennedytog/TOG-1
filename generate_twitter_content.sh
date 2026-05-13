#!/bin/bash
# Generate Twitter content - Style A (Technical) & B (Personal)
# Run by cron or manually

STATE_FILE="/Users/aleckennedy/.openclaw/workspace/state.json"
CONTENT_FILE="/Users/aleckennedy/.openclaw/workspace/data/dante_twitter_content.json"
LOG_FILE="/Users/aleckennedy/.openclaw/workspace/logs/content_gen.log"
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$(dirname "$CONTENT_FILE")"

echo "$(date): Generating Twitter content..." >> "$LOG_FILE"

# Generate 3 posts with new style
# Style A: Technical explainers
# Style B: Personal/behind-the-scenes

cat > /tmp/new_posts.json << 'EOF'
[
  {
    "text": "OpenClaw's 'skills' system is actually brilliant.\n\nInstead of stuffing everything into a prompt, you:\n1. Write a SKILL.md\n2. Agent reads it\n3. Executes exactly what's documented\n\nIt's like having a README that actually gets used.\n\nMost underrated feature.",
    "type": "technical_explainer",
    "style": "A",
    "scheduled": "morning"
  },
  {
    "text": "Currently running 8 agents in Mission Control:\n\n• Arlo - Lead research\n• Dante - Content creation\n• Iris - Sales outreach\n• Abby - Quality check\n• Dev - Code tasks\n• Opal - Operations\n• Rico - Analytics\n• Jerry - General support\n\nThe chaos is... organized?",
    "type": "behind_scenes",
    "style": "B",
    "scheduled": "afternoon"
  },
  {
    "text": "TIL: Context windows aren't just about length.\n\nThey're about:\n• Keeping the full conversation\n• Referencing earlier context\n• Maintaining coherence across long tasks\n\nA model with 2M tokens isn't 'better' - it's just capable of holding more in working memory.\n\nLike RAM vs processing power.",
    "type": "technical_explainer",
    "style": "A",
    "scheduled": "evening"
  }
]
EOF

# Ensure content file exists
if [ ! -f "$CONTENT_FILE" ]; then
    echo '{"posts": [], "total_generated": 0, "last_run": ""}' > "$CONTENT_FILE"
fi

# Add to state.json queued posts
jq --arg time "$CURRENT_TIME" --slurpfile newPosts /tmp/new_posts.json '
    .queuedPosts += $newPosts[0]
' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"

# Also append to content file
jq --arg time "$CURRENT_TIME" --slurpfile newPosts /tmp/new_posts.json '
    .posts += $newPosts[0] |
    .total_generated += ($newPosts[0] | length) |
    .last_run = $time
' "$CONTENT_FILE" > "${CONTENT_FILE}.tmp" && mv "${CONTENT_FILE}.tmp" "$CONTENT_FILE"

echo "$(date): Generated 3 posts (2 technical, 1 personal)" >> "$LOG_FILE"
rm /tmp/new_posts.json
