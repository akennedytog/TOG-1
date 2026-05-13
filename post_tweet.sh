#!/bin/bash
# Twitter Post Wrapper - Loads env and runs poster

export $(grep -v '^#' /Users/aleckennedy/.openclaw/workspace/.env | xargs)
cd /Users/aleckennedy/.openclaw/workspace
python3 post_tweet.py
