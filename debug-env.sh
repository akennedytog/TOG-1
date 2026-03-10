#!/usr/bin/env bash
set -e
cd /Users/aleckennedy/.openclaw/workspace
node -e "import('dotenv/config'); console.log('KEY:', !!process.env.TWITTER_API_KEY, 'SECRET:', !!process.env.TWITTER_API_SECRET)"
pm2 show x-engagement-bot | grep -i "exec cwd" || true
