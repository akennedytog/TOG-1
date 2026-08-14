#!/usr/bin/env python3
import os
import re

base_path = '/Users/aleckennedy/.openclaw/workspace/theonegroup-site'

for filename in os.listdir(base_path):
    if filename.endswith('.html'):
        filepath = os.path.join(base_path, filename)
        with open(filepath, 'r+') as f:
            content = f.read()
            content = content.replace('/a ets/', '/assets/')
            content = re.sub(r'<a[^>]*href="/(blog|workshop|ai-agent-workshop)\.html"[^>]*>[^<]*</a>', '', content)
            f.seek(0)
            f.write(content)
            f.truncate()

print('Asset paths fixed and Blog/Workshop links removed.')
