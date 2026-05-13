#!/bin/bash
# Deploy to Netlify using site ID from config

SITE_ID="a70736d7-9776-4d0e-9908-0f5402a5e16d"
DEPLOY_DIR="/Users/aleckennedy/.openclaw/workspace/public"

echo "Deploying to Netlify..."
echo "Site ID: $SITE_ID"
echo "Deploy dir: $DEPLOY_DIR"

# Check if netlify CLI is available
if command -v netlify &> /dev/null; then
    echo "Using Netlify CLI..."
    cd "$DEPLOY_DIR" && netlify deploy --prod --site="$SITE_ID"
else
    echo "Netlify CLI not found. Trying manual deploy..."
    
    # Try to use curl with the Netlify API
    # This requires a token, so it will fail if not authenticated
    curl -X POST "https://api.netlify.com/api/v1/sites/$SITE_ID/deploys" \
         -H "Content-Type: application/zip" \
         -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
         --data-binary "@$DEPLOY_DIR.zip" 2>/dev/null || echo "Manual deploy failed - requires authentication"
fi