#!/bin/bash
# Reconnect to new Netlify team after accidental deletion

cd ~/.openclaw/workspace/theonegroup-site

echo "🔄 Reconnecting to new Netlify team..."
echo ""

# Step 1: Unlink old site
echo "Step 1: Unlinking old site..."
netlify unlink 2>/dev/null || true

# Step 2: Initialize new site
echo ""
echo "Step 2: Initializing new site on 'Theonegroup' team..."
netlify init --manual

# Step 3: Deploy
echo ""
echo "Step 3: Deploying..."
netlify deploy --prod --dir=.

echo ""
echo "✅ Done! Your site should be live on the new team."
echo "Next: Add custom domain at https://app.netlify.com"
