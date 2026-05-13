#!/bin/bash
# Update all HTML pages with analytics and consistent nav

PAGES=(
  "about.html"
  "ai-audit.html"
  "ai-coaching.html"
  "ai-optimization.html"
  "blog.html"
  "case-studies.html"
  "competitor-monitoring.html"
  "events.html"
  "free-ai-audit.html"
  "lead-lists.html"
  "missed-call-calculator.html"
  "mmw-2026.html"
  "newsletter-thanks.html"
  "openclaw-setup.html"
  "services.html"
  "social-media.html"
  "truerep.html"
  "web-design.html"
)

for page in "${PAGES[@]}"; do
  file="/Users/aleckennedy/.openclaw/workspace/theonegroup-site/$page"
  if [ -f "$file" ]; then
    # Add analytics script before </body>
    if ! grep -q "analytics.js" "$file"; then
      sed -i '' 's|</body>|<script src="/analytics.js"></script>\n</body>|' "$file"
    fi
    
    # Add Free Workshop link after Case Studies
    sed -i '' 's|href="/case-studies.html".*>Case Studies</a>|href="/case-studies.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Case Studies</a>\n          <a href="/ai-agent-workshop.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition font-medium text-primary-600">Free Workshop</a>|' "$file"
  fi
done

echo "Updated ${#PAGES[@]} pages"
