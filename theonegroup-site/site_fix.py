#!/usr/bin/env python3
import os, re, shutil, glob

root = '/Users/aleckennedy/.openclaw/workspace/theonegroup-site'
dist = os.path.join(root, 'dist')

# 1. Restore legit pages that were wrongly deleted (still in dist)
restore = ['404.html','ai-invoicing.html','boca-raton-ai-bookkeeping.html',
 'compliance-content.html','events.html','fort-lauderdale-ai-bookkeeping.html',
 'index.html','lead-response.html','miami-ai-bookkeeping.html','newsletter-thanks.html',
 'palm-beach-gardens-ai-bookkeeping.html','qualify.html','receipt-automation.html',
 'truerep.html','west-palm-beach-ai-bookkeeping.html']
restored = []
for f in restore:
    src, dst = os.path.join(dist, f), os.path.join(root, f)
    if os.path.exists(src) and not os.path.exists(dst):
        shutil.copy2(src, dst)
        restored.append(f)

# 2. Remove blog + workshop pages everywhere (root, dist, blog/ dirs)
removed = []
for f in ['blog.html','workshop.html','ai-agent-workshop.html']:
    for d in [root, dist]:
        p = os.path.join(d, f)
        if os.path.exists(p):
            os.remove(p); removed.append(p)
for bd in [os.path.join(root,'blog'), os.path.join(dist,'blog')]:
    if os.path.isdir(bd):
        shutil.rmtree(bd); removed.append(bd)

# 3. Normalize every root HTML file:
#    - fix /a ets/ typo
#    - strip .html from internal links (keep anchors)
#    - remove any remaining <a> links to blog/workshop pages
link_re = re.compile(r'href="/([^"]+?)\.html(#[^"]*)?"')
dead_link_re = re.compile(r'<a[^>]*href="/(blog|workshop|ai-agent-workshop)[^"]*"[^>]*>.*?</a>', re.S)
changed = 0
for path in glob.glob(os.path.join(root, '*.html')):
    with open(path) as f: c = f.read()
    orig = c
    c = c.replace('/a ets/', '/assets/')
    c = dead_link_re.sub('', c)
    c = link_re.sub(r'href="/\1\2"', c)
    if c != orig:
        with open(path, 'w') as f: f.write(c)
        changed += 1

# 4. netlify.toml: drop blog + workshop redirects
toml_path = os.path.join(root, 'netlify.toml')
with open(toml_path) as f: t = f.read()
t = re.sub(r'\[\[redirects\]\]\s*\n\s*from = "/blog[^\n]*\n\s*to = "[^"]*"\s*\n\s*status = \d+\s*\n', '', t)
t = re.sub(r'\[\[redirects\]\]\s*\n\s*from = "/ai-agent-workshop"\s*\n\s*to = "[^"]*"\s*\n\s*status = \d+\s*\n', '', t)
with open(toml_path, 'w') as f: f.write(t)

# 5. build.sh: clean dist before copying (no more stale files)
with open(os.path.join(root, 'build.sh'), 'w') as f:
    f.write('#!/bin/bash\nrm -rf dist\nmkdir -p dist\ncp -r *.html dist/\ncp -r assets dist/ 2>/dev/null || true\ncp -r _astro dist/ 2>/dev/null || true\ncp _redirects dist/ 2>/dev/null || true\ncp netlify.toml dist/ 2>/dev/null || true\ncp sitemap.xml dist/ 2>/dev/null || true\ncp robots.txt dist/ 2>/dev/null || true\necho "Build complete"\n')
os.chmod(os.path.join(root, 'build.sh'), 0o755)

print(f"Restored {len(restored)} pages: {', '.join(restored)}")
print(f"Removed: {', '.join(removed) if removed else 'nothing'}")
print(f"Normalized {changed} HTML files")
print("netlify.toml + build.sh updated")
