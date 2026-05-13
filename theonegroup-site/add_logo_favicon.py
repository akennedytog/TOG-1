#!/usr/bin/env python3
import os
import re

base_path = "/Users/aleckennedy/.openclaw/workspace/theonegroup-site"

# All HTML pages
pages = [f for f in os.listdir(base_path) if f.endswith('.html') and not f.endswith('.backup')]

for page in pages:
    filepath = os.path.join(base_path, page)
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace favicon
    content = re.sub(
        r'<link rel="icon"[^\u003e]*\u003e',
        '<link rel="icon" type="image/png" href="/assets/favicon.png">\n<link rel="apple-touch-icon" href="/assets/TOG-Logo-New.png">',
        content
    )
    
    # Replace text-only logo with image + text
    content = re.sub(
        r'<a href="/" class="[^"]*font-bold[^"]*"><span class="[^"]*gradient-text[^"]*">The One Group</span></a>',
        '<a href="/" class="flex items-center gap-2"><img src="/assets/TOG-Logo-New.png" alt="The One Group" class="h-8 w-auto"><span class="font-display font-bold text-xl gradient-text">The One Group</span></a>',
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Updated: {page}")

print("\n✅ Favicon and Logo added to all pages!")
