#!/bin/bash
# Deploy just the blog file to Netlify

SITE_ID="a70736d7-9776-4d0e-9908-0f5402a5e16d"
BLOG_FILE="/Users/aleckennedy/.openclaw/workspace/public/blog/2026-04-03-invisible-automation.html"

echo "Deploying blog post to Netlify..."
echo "Site ID: $SITE_ID"
echo "File: $BLOG_FILE"

# Create a temporary directory with just the blog file
DEPLOY_TMP=$(mktemp -d)
cp "$BLOG_FILE" "$DEPLOY_TMP/index.html"

# Deploy using netlify CLI
cd "$DEPLOY_TMP" && netlify deploy --prod --site="$SITE_ID" --dir=. && echo "✅ Deployed successfully!"

# Cleanup
rm -rf "$DEPLOY_TMP"