#!/bin/bash
# Generate 3 Canva templates for different platforms

cd /Users/aleckennedy/.openclaw/workspace/figma-plugin/canva-template-generator

echo "🎨 Generating 3 Canva Templates"
echo "==============================="

# Template 1: Instagram Modern
echo "📱 Generating Instagram Modern template..."
node dist/cli.js generate -t instagram -m modern -o ./templates --title "Instagram Modern Template"

# Template 2: LinkedIn Corporate  
echo "💼 Generating LinkedIn Corporate template..."
node dist/cli.js generate -t linkedin -m corporate -o ./templates --title "LinkedIn Corporate Template"

# Template 3: Pinterest Bold
echo "📌 Generating Pinterest Bold template..."
node dist/cli.js generate -t pinterest -m bold -o ./templates --title "Pinterest Bold Template"

# Update inventory
echo ""
echo "📝 Updating template inventory..."
node dist/cli.js config -o ./template-inventory-$(date +%Y-%m-%d).json

echo ""
echo "✅ All templates generated successfully!"
echo "   Location: ./templates/"
ls -la ./templates/ 2>/dev/null | tail -5
