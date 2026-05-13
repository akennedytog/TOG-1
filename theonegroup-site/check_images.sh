#!/bin/bash
# Phase 3: Image Optimization Script

SITE_DIR="/Users/aleckennedy/.openclaw/workspace/theonegroup-site"
ASSETS_DIR="$SITE_DIR/assets"

echo "=== Phase 3: Image Optimization ==="
echo ""

# Check for images
echo "1. Finding images..."
find "$SITE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) | grep -v dist | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "   $size: $file"
done

echo ""
echo "2. Checking for lazy loading in HTML..."
grep -l "loading=\"lazy\"" "$SITE_DIR"/*.html 2>/dev/null | wc -l | xargs echo "   Pages with lazy loading:"

echo ""
echo "3. Checking for WebP usage..."
grep -l "webp" "$SITE_DIR"/*.html 2>/dev/null | wc -l | xargs echo "   Pages using WebP:"

echo ""
echo "4. Checking for image dimensions..."
grep -n "width=\|height=" "$SITE_DIR"/*.html 2>/dev/null | head -10 || echo "   No explicit dimensions found"

echo ""
echo "=== Recommendations ==="
echo ""
echo "TOG-Trans-Logo.png is 1.4MB - needs compression"
echo ""
echo "Actions to take:"
echo "1. Convert PNG to WebP (60-80% smaller)"
echo "2. Add lazy loading to all images"
echo "3. Add width/height attributes to prevent layout shift"
echo "4. Implement responsive images with srcset"
echo ""
