#!/usr/bin/env python3
import os
import re

pages = [
    "blog.html", "case-studies.html", "competitor-monitoring.html", 
    "events.html", "free-ai-audit.html", "lead-lists.html",
    "missed-call-calculator.html", "openclaw-setup.html", 
    "social-media.html", "truerep.html", "web-design.html"
]

base_path = "/Users/aleckennedy/.openclaw/workspace/theonegroup-site"

for page in pages:
    filepath = os.path.join(base_path, page)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Skip if already has Free Workshop
    if 'Free Workshop' in content:
        print(f"Skipping (already has link): {page}")
        continue
    
    # Add Free Workshop link after Case Studies
    pattern = r'(href="/case-studies\.html"[^>]*>Case Studies</a>)'
    replacement = r'\1\n          <a href="/ai-agent-workshop.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition font-medium text-primary-600">Free Workshop</a>'
    content = re.sub(pattern, replacement, content)
    
    # Add analytics before </body>
    if 'analytics.js' not in content:
        content = content.replace('</body>', '<script src="/analytics.js"></script>\n</body>')
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Updated: {page}")

print("\nDone!")
