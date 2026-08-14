#!/usr/bin/env python3
import os, re, glob

root = '/Users/aleckennedy/.openclaw/workspace/theonegroup-site'
total = 0
files_fixed = 0
meta_fixed = 0

for path in glob.glob(os.path.join(root, '*.html')):
    with open(path) as f: c = f.read()
    orig = c
    # Restore mangled class attributes: cla ="x" or cla="x" -> class="x"
    c, n = re.subn(r'\bcla\s*="', 'class="', c)
    total += n
    # Fix meta refresh URLs pointing to .html
    c, m = re.subn(r'(url=/[^"]+?)\.html(")', r'\1\2', c)
    meta_fixed += m
    if c != orig:
        with open(path, 'w') as f: f.write(c)
        files_fixed += 1

# ai-growth-sprint: retarget dead workshop redirect to /services
gs = os.path.join(root, 'ai-growth-sprint.html')
if os.path.exists(gs):
    with open(gs) as f: c = f.read()
    c = c.replace('/ai-agent-workshop', '/services').replace('AI Agent Workshop', 'Our Services')
    with open(gs, 'w') as f: f.write(c)

print(f"Restored {total} class attributes across {files_fixed} files")
print(f"Fixed {meta_fixed} meta-refresh URLs")
print("ai-growth-sprint retargeted to /services")
