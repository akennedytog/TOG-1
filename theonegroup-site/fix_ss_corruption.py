#!/usr/bin/env python3
import os, re, glob

root = '/Users/aleckennedy/.openclaw/workspace/theonegroup-site'

# Load dictionary
words = set()
for p in ['/usr/share/dict/words']:
    if os.path.exists(p):
        with open(p, errors='ignore') as f:
            words = {w.strip().lower() for w in f}
# Additions we know are correct
words |= {'class','glass','assets','messaging','assessment','business','process',
          'success','successful','access','across','address','possible','lessons',
          'press','missed','discuss','progress','express','professional','password',
          'compliance','onboarding','stress','distress','embarrass','harness'}

def in_dict(w): return w.lower() in words

fixed_files = 0
total_fixes = 0

merge_re = re.compile(r'\b([A-Za-z]{1,}) ([a-z]{1,})\b')
leftss_re = re.compile(r'\b([A-Za-z]{2,}) ([A-Z][a-z])')
endss_re  = re.compile(r'\b([a-z]{3,}) ([a-z])')
hyphen_re = re.compile(r'\b([a-z]{2,}) (-[a-z])')

for path in glob.glob(os.path.join(root, '*.html')):
    with open(path, errors='ignore') as f: c = f.read()
    orig = c
    n = 0

    # Rule C: known whole-word corruptions
    c, k = re.subn(r'\bgla\b', 'glass', c); n += k
    c, k = re.subn(r'\bcla\b(?=\s*=)', 'class', c); n += k
    c, k = re.subn(r'\bPre  Mentions\b', 'Press Mentions', c); n += k

    # Rule A: "me aging" -> "messaging" (merge with ss)
    def merge_sub(m):
        l, r = m.group(1), m.group(2)
        merged = l + 'ss' + r
        if in_dict(merged) and not in_dict(l + r):
            nonlocal_n[0] += 1
            return merged
        return m.group(0)
    nonlocal_n = [0]
    c = merge_re.sub(merge_sub, c); n += nonlocal_n[0]

    # Rule B: "Pre M" -> "Press M" (ss at end of word before capital)
    def leftss_sub(m):
        l = m.group(1)
        if in_dict(l + 'ss') and not in_dict(l):
            nonlocal_n[0] += 1
            return l + 'ss ' + m.group(2)
        return m.group(0)
    nonlocal_n = [0]
    c = leftss_re.sub(leftss_sub, c); n += nonlocal_n[0]

    # Rule D: "cro -domain" -> "cross-domain"
    def hyphen_sub(m):
        l = m.group(1)
        if in_dict(l + 'ss') and not in_dict(l):
            nonlocal_n[0] += 1
            return l + 'ss' + m.group(2)
        return m.group(0)
    nonlocal_n = [0]
    c = hyphen_re.sub(hyphen_sub, c); n += nonlocal_n[0]

    # Rule E: "addre s" handled by A; "addre thing" -> "address thing"
    def endss_sub(m):
        l = m.group(1)
        if in_dict(l + 'ss') and not in_dict(l):
            nonlocal_n[0] += 1
            return l + 'ss ' + m.group(2)
        return m.group(0)
    nonlocal_n = [0]
    c = endss_re.sub(endss_sub, c); n += nonlocal_n[0]

    if c != orig:
        with open(path, 'w') as f: f.write(c)
        fixed_files += 1
        total_fixes += n

print(f"Applied {total_fixes} ss-restorations across {fixed_files} files")

# --- Normalize nav + footer across all pages using index.html as canonical ---
with open(os.path.join(root, 'index.html')) as f: idx = f.read()
nav_m = re.search(r'<nav\b.*?</nav>', idx, re.S)
foot_m = re.search(r'<footer\b.*?</footer>', idx, re.S)
nav, foot = nav_m.group(0), foot_m.group(0)

nav_done = foot_done = 0
for path in glob.glob(os.path.join(root, '*.html')):
    if path.endswith('index.html'): continue
    with open(path, errors='ignore') as f: c = f.read()
    orig = c
    c, k = re.subn(r'<nav\b.*?</nav>', lambda m: nav, c, count=1, flags=re.S)
    nav_done += k
    c, k = re.subn(r'<footer\b.*?</footer>', lambda m: foot, c, count=1, flags=re.S)
    foot_done += k
    if c != orig:
        with open(path, 'w') as f: f.write(c)

print(f"Nav normalized on {nav_done} pages, footer on {foot_done} pages")
