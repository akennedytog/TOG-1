#!/usr/bin/env python3
import os
import re

base_path = "/Users/aleckennedy/.openclaw/workspace/theonegroup-site"

# Pages to update with Free Workshop
pages_to_update = [
    "about.html", "ai-audit.html", "ai-coaching.html", "ai-optimization.html",
    "free-ai-audit.html", "missed-call-calculator.html", "mmw-2026.html",
    "truerep.html"
]

# Add Pricing to Services dropdown on all pages
all_pages = [f for f in os.listdir(base_path) if f.endswith('.html') and not f.endswith('.backup')]

for page in all_pages:
    filepath = os.path.join(base_path, page)
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Add Free Workshop if missing
    if 'Free Workshop' not in content and 'ai-agent-workshop.html' in content:
        content = re.sub(
            r'(href="/case-studies\.html"[^>]*>Case Studies</a>)',
            r'\1\n          <a href="/ai-agent-workshop.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition font-medium text-primary-600">Free Workshop</a>',
            content
        )
        print(f"Added Free Workshop to: {page}")
    
    # Add Pricing to Services dropdown if missing
    if 'pricing.html' not in content and 'services-dropdown' in content:
        # Find last link in services dropdown and add pricing after
        content = re.sub(
            r'(href="[^"]*openclaw-setup\.html"[^>]*>[^<]*</a>)\s*(</div>\s*<!-- end services dropdown|</div>\s*class="services-dropdown")',
            r'\1\n              <a href="/pricing.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">💰 Pricing</a>\2',
            content
        )
        print(f"Added Pricing to Services dropdown on: {page}")
    
    with open(filepath, 'w') as f:
        f.write(content)

print("\nNavigation fixes complete!")
