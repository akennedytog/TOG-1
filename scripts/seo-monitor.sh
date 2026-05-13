#!/bin/bash
# Ahrefs SEO Monitoring for The One Group AI
# Tracks keywords related to AI automation in South Florida

set -e

cd "$(dirname "$0")/.."

# Load env
source .env 2>/dev/null || true

API_TOKEN=${AHREFS_API_TOKEN:-}
DATE=$(date +%Y-%m-%d)

if [ -z "$API_TOKEN" ]; then
    echo "❌ AHREFS_API_TOKEN not set"
    echo "   Add to .env: AHREFS_API_TOKEN=your_token_here"
    echo "   Get token from: https://ahrefs.com/account/api"
    exit 1
fi

echo "📊 Ahrefs SEO Monitoring - $DATE"
echo "================================"
echo ""

# Keywords to track
KEYWORDS=(
    "AI automation Miami"
    "AI automation Fort Lauderdale"
    "AI receptionist HVAC"
    "AI phone answering service"
    "automated lead follow-up"
    "AI legal intake"
    "AI medical appointment scheduling"
    "small business AI automation Florida"
    "AI answering service South Florida"
    "chatbot for law firms"
)

echo "🎯 Tracking ${#KEYWORDS[@]} keywords:"
for keyword in "${KEYWORDS[@]}"; do
    echo "   • $keyword"
done
echo ""

# Check domain metrics for your site
echo "🔍 Checking your domain: theonegroup.info"
echo ""

# This would make real API calls - placeholder for now
curl -s -X GET "https://api.ahrefs.com/v3/site-explorer/metrics?date=$DATE&target=theonegroup.info" \
    -H "Authorization: Bearer $API_TOKEN" 2>/dev/null | jq '.' 2>/dev/null || echo "   (API call would go here - add your token to run)"

echo ""
echo "💡 To enable real monitoring:"
echo "   1. Add AHREFS_API_TOKEN to .env"
echo "   2. Run: ./scripts/seo-monitor.sh"
echo ""
echo "📈 This script can be scheduled via cron:"
echo "   0 9 * * 1 $PWD/scripts/seo-monitor.sh >> logs/seo-monitor.log 2>&1"
