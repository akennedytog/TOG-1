#!/usr/bin/env python3
import os
import re

base_path = "/Users/aleckennedy/.openclaw/workspace/theonegroup-site"
pages = [f for f in os.listdir(base_path) if f.endswith('.html') and not f.endswith('.backup')]

for page in pages:
    filepath = os.path.join(base_path, page)
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Add transparent logo back to nav
    content = re.sub(
        r'<a href="/" class="font-display font-bold text-xl"><span class="gradient-text">The One Group</span></a>',
        '<a href="/" class="flex items-center gap-2"><img src="/assets/TOG-Logo-Transparent.png" alt="The One Group" class="h-8 w-auto"><span class="font-display font-bold text-xl gradient-text">The One Group</span></a>',
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Updated: {page}")

print("\n✅ Transparent logo added to all pages!")
