#!/usr/bin/env python3
import os
import re

base_path = "/Users/aleckennedy/.openclaw/workspace/theonegroup-site"
pages = [f for f in os.listdir(base_path) if f.endswith('.html') and not f.endswith('.backup')]

for page in pages:
    filepath = os.path.join(base_path, page)
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove the logo image but keep the gradient text
    content = re.sub(
        r'<a href="/" class="flex items-center gap-2"><img src="/assets/TOG-Logo-New\.png"[^>]*><span class="font-display font-bold text-xl gradient-text">The One Group</span></a>',
        '<a href="/" class="font-display font-bold text-xl"><span class="gradient-text">The One Group</span></a>',
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Fixed: {page}")

print("\n✅ Logo removed from nav - keeping clean gradient text!")
