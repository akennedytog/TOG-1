#!/bin/bash
# Start Mission Control Dashboard
# Run: ./start-mission-control.sh

cd /Users/aleckennedy/.openclaw/workspace

# Ensure logs directory exists
mkdir -p logs

echo "🚀 Starting Mission Control..."
echo "Port: 3400"
echo "URL: http://localhost:3400/MISSION_CONTROL.html"
echo ""

# Check if already running
if lsof -i :3400 > /dev/null 2>&1; then
    echo "✅ Mission Control already running!"
    echo "Access: http://localhost:3400/MISSION_CONTROL.html"
    exit 0
fi

# Start with PM2 (auto-restart on crash)
if command -v pm2 > /dev/null 2>&1; then
    echo "Using PM2 for auto-restart..."
    pm2 start pm2-mission-control.json
    pm2 save
    echo ""
    echo "✅ Mission Control started with PM2!"
else
    # Fallback: start directly
    echo "PM2 not found, starting directly..."
    nohup node mission-control-api.js > logs/mission-control.log 2>&1 &
    echo ""
    echo "✅ Mission Control started!"
fi

echo ""
echo "📊 Dashboard: http://localhost:3400/MISSION_CONTROL.html"
echo "🔌 API: http://localhost:3400/api/health"
echo ""
echo "To stop: pm2 stop mission-control"
echo "To view logs: pm2 logs mission-control"