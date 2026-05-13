#!/usr/bin/env python3
import os
import re

calendly_url = "https://calendly.com/akennedy-theonegroup/30min"
base_path = "/Users/aleckennedy/.openclaw/workspace/theonegroup-site"

# Files to update
files_to_update = []
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.html') and not file.endswith('.backup'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            if 'href="/index.html#book"' in content:
                files_to_update.append(filepath)

print(f"Found {len(files_to_update)} files to update")

for filepath in files_to_update:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace the book a call link with Calendly
    updated_content = content.replace('href="/index.html#book"', f'href="{calendly_url}"')
    
    if content != updated_content:
        with open(filepath, 'w') as f:
            f.write(updated_content)
        print(f"Updated: {os.path.basename(filepath)}")

print(f"\n✅ Updated {len(files_to_update)} files to link to Calendly!")
print(f"Link: {calendly_url}")
