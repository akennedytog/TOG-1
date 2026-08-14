#!/bin/bash
# Deploy TheOneGroupAI website to Netlify
# Usage: bash deploy.sh [prod|preview]

echo "🚀 Deploying TheOneGroupAI to Netlify..."
echo ""

cd ~/.openclaw/workspace/theonegroup-site

# Always publish the clean build output, never the repository root.
./build.sh

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Check if logged in
if ! netlify status &> /dev/null; then
    echo "🔐 Please login to Netlify:"
    netlify login
fi

# Deploy mode
MODE=${1:-preview}

if [ "$MODE" == "prod" ]; then
    echo "📤 Deploying to PRODUCTION..."
    netlify deploy --prod --dir=dist
else
    echo "🔍 Deploying PREVIEW (use 'bash deploy.sh prod' for production)..."
    netlify deploy --dir=dist
fi

echo ""
echo "✅ Deployment complete!"
