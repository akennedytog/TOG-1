#!/bin/bash
# Run all agent daily tasks

echo "🤖 Running Daily Agent Tasks - $(date)"
echo "=========================================="

# Arlo - Research Agent
echo ""
echo "🔍 Running Arlo (Research)..."
python3 /Users/aleckennedy/.openclaw/workspace/agents/arlo.py

# Dante - Creative Agent
echo ""
echo "🎨 Running Dante (Creative)..."
python3 /Users/aleckennedy/.openclaw/workspace/agents/dante.py

echo ""
echo "✅ All agents complete!"
