#!/bin/bash
# AI News Ticker - Daily update script
# Run via cron: 0 7 * * * cd /path/to/site && bash scripts/update-ai-news.sh
set -e
SITE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT="$SITE_DIR/ai-news.json"

source ~/.openclaw/.env 2>/dev/null || true

if [ -z "$TAVILY_API_KEY" ]; then
  echo "ERROR: TAVILY_API_KEY not set"
  exit 1
fi

echo "Fetching AI news for $(date)..."
RESPONSE=$(curl -s --max-time 30 -X POST https://api.tavily.com/search \
  -H 'content-type: application/json' \
  -d "{
    \"api_key\": \"$TAVILY_API_KEY\",
    \"query\": \"AI industry news today\",
    \"search_depth\": \"basic\",
    \"include_domains\": [\"techcrunch.com\", \"theverge.com\", \"venturebeat.com\", \"arstechnica.com\", \"wired.com\"],
    \"max_results\": 5
  }")

python3 -c "
import json, sys

data = json.loads(sys.stdin.read())
articles = []
for r in data.get('results', []):
    title = r.get('title', '').strip()
    url = r.get('url', '')
    if title and url:
        for suffix in [' | TechCrunch', ' | VentureBeat', ' | Ars Technica', ' | The Verge', ' | WIRED']:
            if title.endswith(suffix):
                title = title[:-len(suffix)]
                break
        articles.append({
            'title': title,
            'url': url,
            'source': url.split('/')[2].replace('www.', '') if '//' in url else '',
            'time': 'Today'
        })

output = {
    'updated': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
    'articles': articles[:5]
}

with open('$OUTPUT', 'w') as f:
    json.dump(output, f, indent=2)

print(f'Written {len(articles[:5])} articles to $OUTPUT')
" <<< "$RESPONSE"

# Build
cd "$SITE_DIR"
bash build.sh
echo "Build complete"

# Deploy via fresh temp dir (bypasses Next.js build issue)
DEPLOY_DIR=$(mktemp -d)
cp dist/*.html "$DEPLOY_DIR/" 2>/dev/null
cp dist/ai-news.json "$DEPLOY_DIR/" 2>/dev/null
cp -r dist/_astro "$DEPLOY_DIR/" 2>/dev/null || true
cp -r dist/assets "$DEPLOY_DIR/" 2>/dev/null || true
cp -r dist/css "$DEPLOY_DIR/" 2>/dev/null || true
cp dist/*.js "$DEPLOY_DIR/" 2>/dev/null || true
cp dist/_redirects "$DEPLOY_DIR/" 2>/dev/null || true
cp dist/netlify.toml "$DEPLOY_DIR/" 2>/dev/null || true
cp dist/sitemap.xml "$DEPLOY_DIR/" 2>/dev/null || true
cp dist/robots.txt "$DEPLOY_DIR/" 2>/dev/null || true

cd "$DEPLOY_DIR" && netlify link --id a70736d7-9776-4d0e-9908-0f5402a5e16d 2>&1 && netlify deploy --prod --dir . 2>&1
rm -rf "$DEPLOY_DIR"
echo "Deploy complete"
