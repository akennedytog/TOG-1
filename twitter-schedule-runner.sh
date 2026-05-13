#!/bin/bash
# Twitter Schedule Runner - Manual scheduling for tonight
# Add to crontab or run manually

cd ~/.openclaw/workspace

# Tonight's post at 8pm
sleep $(( ($(date -d "20:00" +%s) - $(date +%s)) ))
node post-now.js 'Behind the scenes: Our AI agent just made its first autonomous decision.

It noticed a pattern in engagement data and suggested we test a new hook format.

I approved. We will see how it performs.

This is the future: AI suggests, humans decide.

#BuildingInPublic #AI #Automation'

# Tomorrow's posts (if running overnight)
# 10am tomorrow - queued in content-calendar.json
