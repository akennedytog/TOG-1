#!/bin/bash
# Daily Mission Control Update Script
# Run this daily to update all dashboard metrics

set -e

cd /Users/aleckennedy/.openclaw/workspace

echo "🚀 Daily Mission Control Update - $(date)"
echo "=========================================="

# Run Arlo to get new leads
echo ""
echo "🔍 Running Arlo (Research Agent)..."
python3 agents/arlo.py

# Run Dante to generate content
echo ""
echo "🎨 Running Dante (Creative Agent)..."
python3 agents/dante.py

# Generate Twitter content from calendar
echo ""
echo "🐦 Generating Twitter content..."
python3 twitter_content_generator.py

# Update Mission Control with new stats
echo ""
echo "📊 Updating Mission Control dashboard..."
python3 update_mission_control_daily.py

echo ""
echo "✅ All daily updates complete!"
echo "🎯 Mission Control is up to date."
