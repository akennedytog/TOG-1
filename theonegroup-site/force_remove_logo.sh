#!/bin/bash
# Force remove all logo references from navigation

cd /Users/aleckennedy/.openclaw/workspace/theonegroup-site

for file in *.html; do
    if [[ "$file" != *.backup ]]; then
        # Remove the entire logo img tag but keep the text link
        sed -i '' 's|<img src="/assets/TOG-Logo[^"]*"[^>]*>||g' "$file"
        echo "Fixed: $file"
    fi
done

echo ""
echo "Deploying..."
netlify deploy --prod 2>&1 | tail -5
