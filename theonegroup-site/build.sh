#!/bin/bash
rm -rf dist
mkdir -p dist
cp -r *.html dist/
cp -r *.json dist/ 2>/dev/null || true
cp -r assets dist/ 2>/dev/null || true
cp -r css dist/ 2>/dev/null || true
cp -r _astro dist/ 2>/dev/null || true
cp -r *.js dist/ 2>/dev/null || true
cp _redirects dist/ 2>/dev/null || true
cp netlify.toml dist/ 2>/dev/null || true
cp sitemap.xml dist/ 2>/dev/null || true
cp robots.txt dist/ 2>/dev/null || true
cp -r .well-known dist/ 2>/dev/null || true
cp indexnow-key.txt dist/ 2>/dev/null || true
echo "Build complete"
