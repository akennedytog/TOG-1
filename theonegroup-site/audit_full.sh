#!/bin/bash
# Full website audit script

echo "=== THE ONE GROUP FULL WEBSITE AUDIT ==="
echo "Date: $(date)"
echo ""

# Count HTML files
echo "## FILE COUNT"
echo "Total HTML files: $(find . -name '*.html' -type f ! -path './node_modules/*' ! -path './.git/*' | wc -l)"
echo ""

# Find duplicates (same name in root and dist/)
echo "## DUPLICATE FILES (root + dist/)"
for file in *.html; do
    if [ -f "dist/$file" ]; then
        echo "DUPLICATE: $file (root + dist/)"
    fi
done
echo ""

# Check for broken links
echo "## CHECKING FOR BROKEN INTERNAL LINKS"
grep -r 'href="/' --include='*.html' . | grep -v node_modules | grep -v '.git' | sed 's/.*href="\([^"]*\)".*/\1/' | sort | uniq > /tmp/links.txt
echo "Found $(wc -l < /tmp/links.txt) unique links"
echo ""

# Check for missing pages
echo "## PAGES REFERENCED BUT MISSING"
while read link; do
    # Remove leading slash and check if file exists
    clean_link="${link#/}"
    if [ ! -f "$clean_link" ] && [ ! -f "${clean_link}.html" ] && [ "$link" != "/" ]; then
        echo "MISSING: $link"
    fi
done < /tmp/links.txt
echo ""

# Check for pages not in navigation
echo "## PAGES THAT EXIST BUT MAY BE ORPHANED"
echo "(Not checking if they're linked, just listing)"
ls -1 *.html 2>/dev/null | grep -v "NAV_SNIPPET\|nav-" | head -20
echo ""

# Check file sizes
echo "## LARGEST FILES (potential bloat)"
find . -name '*.html' -type f ! -path './node_modules/*' ! -path './.git/*' -exec ls -lh {} \; | awk '{ print $5, $9 }' | sort -rh | head -10
echo ""

# Check for common issues
echo "## POTENTIAL ISSUES"
echo "Missing title tags:"
grep -L '<title>' *.html 2>/dev/null | head -5

echo "Missing meta description:"
grep -L 'meta name="description"' *.html 2>/dev/null | head -5

echo "Missing viewport:"
grep -L 'viewport' *.html 2>/dev/null | head -5

echo ""
echo "=== AUDIT COMPLETE ==="
