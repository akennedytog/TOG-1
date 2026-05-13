#!/bin/bash
# Canva Template Generation - One-Click Automation
# Run this to generate templates automatically

echo "🎨 Starting Canva Template Generation Pipeline..."
echo "================================================"

# Step 1: Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi

if [ ! -d "$HOME/.openclaw/workspace/figma-plugin/canva-template-generator" ]; then
    echo "❌ Figma plugin not found. Run setup first."
    exit 1
fi

# Step 2: Generate template configs
echo "📝 Generating template configurations..."
cd "$HOME/.openclaw/workspace"
node scripts/template_scheduler.js generate --count=3 --auto=true

# Step 3: Trigger Figma plugin (manual step - Figma requires UI)
echo "🎨 Next: Open Figma and run the plugin"
echo "   Plugins → Development → Canva Template Generator"
echo "   Click 'Generate Batch'"
echo ""
echo "⚠️  Figma requires manual UI interaction - cannot be fully automated"
echo "   (This is a Figma security limitation)"

# Step 4: Wait for exports
echo "⏳ Waiting for exports..."
echo "   Templates will be saved to: templates/canva/exports/"

# Step 5: Process exports
echo "📦 Processing exported templates..."
node scripts/canva_automation.js process-exports

# Step 6: Generate listings
echo "🛒 Generating shop listings..."
node scripts/canva_automation.js generate-listings

# Step 7: Summary
echo ""
echo "✅ Pipeline Complete!"
echo "================================================"
echo "📊 Summary:"
echo "   Templates generated: Check templates/canva/exports/"
echo "   Listings ready: Check templates/canva/listings/"
echo "   Next: Review and upload to Etsy/Creative Market"
echo ""
echo "🚀 Ready to publish!"
