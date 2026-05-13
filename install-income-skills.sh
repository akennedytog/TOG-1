#!/bin/bash
# Install script for ClawdBot Income & Opportunity Skills
# Run these one at a time to avoid rate limits

echo "Installing skills for: Lead Gen → AI Agency → Consulting → Content → Trading"
echo ""

# CORE INCOME SKILLS
echo "=== CORE INCOME SKILLS ==="
npx clawhub install affiliate-master
npx clawhub install ai-lead-generator-skill
npx clawhub install ai-affiliate-marketing-goldmine
npx clawhub install agent-commerce-engine

# OPPORTUNITY DISCOVERY
echo "=== OPPORTUNITY DISCOVERY ==="
npx clawhub install ai-news-oracle
npx clawhub install blogwatcher
npx clawhub install airadar
npx clawhub install biz-reporter

# 24/7 AUTOMATION
echo "=== AUTOMATION INFRASTRUCTURE ==="
npx clawhub install agent-daily-planner
npx clawhub install active-maintenance
npx clawhub install agent-task-tracker
npx clawhub install agent-step-sequencer

# COMMUNICATION & SALES
echo "=== SALES & COMMUNICATION ==="
npx clawhub install gog          # Gmail/Calendar/Drive
npx clawhub install himalaya     # Email automation
npx clawhub install slack        # Team/business comms
npx clawhub install xurl         # X/Twitter API

# TRADING & FINANCE
echo "=== TRADING & FINANCE ==="
npx clawhub install a-share-real-time-data  # China stocks
# Search for more trading skills: npx clawhub search trading

echo ""
echo "✅ Core skills installed!"
echo ""
echo "Additional skills to explore:"
echo "  npx clawhub search 'trading'"
echo "  npx clawhub search 'crypto'"
echo "  npx clawhub search 'content'"
echo "  npx clawhub search 'social media'"
