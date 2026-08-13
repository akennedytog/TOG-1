#!/bin/bash
# AI News Ticker - Daily update script (LIVE site: theonegroup-v2)
# Fetches AI news via Tavily, writes ai-news.json into the live Astro project,
# rebuilds, and deploys to theonegroup.info (Netlify id 56446bc7).
# Run via cron: 0 7 * * * bash ~/.openclaw/workspace/theonegroup-v2/scripts/update-ai-news.sh
set -e

PROJECT_DIR="$HOME/.openclaw/workspace/theonegroup-v2"
OUTPUT="$PROJECT_DIR/public/ai-news.json"
NETLIFY_SITE_ID="56446bc7-9070-44b6-84f3-aa0dd8b5277b"   # theonegroup-v2 (LIVE)

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
    \"query\": \"latest AI news announcement funding model release\",
    \"search_depth\": \"basic\",
    \"include_domains\": [\"techcrunch.com\", \"theverge.com\", \"venturebeat.com\", \"arstechnica.com\", \"wired.com\"],
    \"max_results\": 8
  }")

python3 -c "
import json, sys, re

data = json.loads(sys.stdin.read())
articles = []
# Reject category/landing/tag pages and bare domains (not real articles)
BAD_PATTERNS = [
    '/category/', '/tag/', '/topic/', '/page', '/latest', '/news',
    'techcrunch.com/category', 'wired.com/tag', 'arstechnica.com/ai',
    'theverge.com'
]
for r in data.get('results', []):
    title = r.get('title', '').strip()
    url = r.get('url', '')
    if not title or not url:
        continue
    if any(p in url for p in BAD_PATTERNS):
        continue
    # Skip generic titles that are just site/category names
    if re.match(r'^(AI News|Artificial Intelligence|The Verge|WIRED|Category: AI)', title, re.I):
        continue
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
    if len(articles) >= 5:
        break

output = {
    'updated': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
    'articles': articles[:5]
}

with open('$OUTPUT', 'w') as f:
    json.dump(output, f, indent=2)

print(f'Written {len(articles[:5])} articles to $OUTPUT')
" <<< "$RESPONSE"

# Build the live Astro site
cd "$PROJECT_DIR"
npm run build
echo "Build complete"

# Deploy via fresh temp dir (documented method — full dist, never partial)
rm -rf /tmp/tog-news && mkdir -p /tmp/tog-news
cp -r "$PROJECT_DIR"/dist/* /tmp/tog-news/
cp "$PROJECT_DIR"/dist/_redirects /tmp/tog-news/ 2>/dev/null || true
cd /tmp/tog-news
rm -rf .netlify
netlify link --id "$NETLIFY_SITE_ID" 2>&1
netlify deploy --prod --dir . 2>&1
rm -rf /tmp/tog-news
echo "Deploy complete"
