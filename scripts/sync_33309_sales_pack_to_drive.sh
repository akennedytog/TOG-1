#!/usr/bin/env bash
set -euo pipefail

WS="/Users/aleckennedy/.openclaw/workspace"
SRC="$WS/leads"
DEST="/Users/aleckennedy/Library/CloudStorage/GoogleDrive-akennedy@theonegroup.info/My Drive/OpenClaw-Deliverables/33309-Sales-Conversion-Pack"

mkdir -p "$DEST/mockups/33309"

cp -f "$SRC/website-email-batch-top20-33309.csv" "$DEST/"
cp -f "$SRC/website-email-batch-top20-33309.md" "$DEST/"
cp -f "$SRC/website-sales-tracker-33309.csv" "$DEST/"
cp -f "$SRC/website-sales-playbook-33309.md" "$DEST/"
cp -f "$SRC/website-mockup-briefs-33309.md" "$DEST/"
cp -f "$SRC/website-mockup-concepts-top5-33309.md" "$DEST/"
cp -f "$SRC/website-loom-scripts-top5-33309.md" "$DEST/"
cp -f "$SRC/website-recommendations-next-actions-33309.md" "$DEST/"
cp -f "$SRC/mockups/33309/"*.html "$DEST/mockups/33309/"

cp -f "$WS/scripts/generate_website_sales_assets_33309.js" "$DEST/"
cp -f "$WS/scripts/update_outreach_tracker.js" "$DEST/"
cp -f "$WS/scripts/prepare_top5_mockups_33309.js" "$DEST/"

echo "Synced 33309 sales pack to: $DEST"
