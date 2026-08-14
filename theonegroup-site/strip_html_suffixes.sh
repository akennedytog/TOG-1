#!/usr/bin/env bash
cd /Users/aleckennedy/.openclaw/workspace/theonegroup-site
for f in *.html; do
  sed -i "" -E "s#href=\"/([^\"/]+)\.html\"#href=\"/\1\"#g" "$f"
done
