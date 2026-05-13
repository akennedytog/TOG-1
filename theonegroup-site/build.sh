#!/bin/bash
# Build script to copy all HTML files to dist

mkdir -p dist
cp -r *.html dist/
cp -r assets dist/ 2>/dev/null || true
cp _redirects dist/ 2>/dev/null || true
cp netlify.toml dist/ 2>/dev/null || true

echo "Build complete. Files in dist/:"
ls -la dist/
