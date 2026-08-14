#!/bin/bash
# Post tweets via Dante / xurl skill
# Called by Dante agent after reviewing generated tweets

TWEET_FILE="$HOME/.openclaw/workspace/market-brief/output/tweets/tweets-$(date +%Y-%m-%d).txt"
ASTS_TWEET="$HOME/.openclaw/workspace/market-brief/output/tweets/asts-tweet-$(date +%Y-%m-%d).txt"
TE_TWEET="$HOME/.openclaw/workspace/market-brief/output/tweets/te-tweet-$(date +%Y-%m-%d).txt"

echo "🐦 Dante - Stock Tweet Poster"
echo "============================="
echo ""

if [ ! -f "$ASTS_TWEET" ]; then
  echo "❌ No tweets generated yet. Run generate-tweets.sh first."
  exit 1
fi

echo "📱 Ready to post tweets:"
echo ""

# Show ASTS tweet
echo "=== ASTS TWEET ==="
cat "$ASTS_TWEET"
echo ""

# Show TE tweet
echo "=== TE TWEET ==="
cat "$TE_TWEET"
echo ""

# Check if xurl skill exists
if [ -f "$HOME/.openclaw/workspace/skills/xurl/SKILL.md" ]; then
  echo "✅ xurl skill available"
  echo ""
  echo "To post via Twitter:"
  echo "  1. Review tweets above"
  echo "  2. Run: xurl post \"$(head -1 $ASTS_TWEET)\""
  echo "  3. Run: xurl post \"$(head -1 $TE_TWEET)\""
else
  echo "⚠️  xurl skill not found. Install from:"
  echo "  https://github.com/openclaw/xurl"
fi

echo ""
echo "💡 Manual posting:"
echo "  Copy text above and post to Twitter"
echo "  Or use: open ~/.openclaw/workspace/market-brief/output/tweets/"