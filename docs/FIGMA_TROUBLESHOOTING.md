# Figma Plugin Development - Troubleshooting Guide

## Issue: "Development" Option Not Showing in Plugins Menu

## Solution Steps:

### Option 1: Use Figma Desktop App (Recommended)
1. Download Figma Desktop app: https://www.figma.com/downloads/
2. Open same file in Desktop app
3. Plugins → Development should appear

### Option 2: Enable Developer Mode in Browser
1. In Figma, press **Cmd + /** (or **Ctrl + /** on Windows)
2. Type "developer" and select "Developer Mode"
3. OR: Click your profile picture → Settings → Enable Developer Mode

### Option 3: Create New Draft File
1. Figma web: Make sure you're in a **Draft** file (not Team file)
2. Go to: https://www.figma.com/files/drafts
3. Create new draft
4. Then try Plugins → Development

### Option 4: Check Account Type
- **Free Account:** Plugin development works
- **Education Account:** May have restrictions
- **Enterprise Account:** Admin may need to enable

## Quick Test:
1. Go to: https://www.figma.com/community/plugin/837846252797963737/ (any plugin)
2. Click "Open in Figma"
3. Now check Plugins menu - Development should appear

## If Still Not Working:
Try accessing plugin via URL:
```
figma://plugin/PLUGIN_ID/PLUGIN_NAME
```

Or use the Figma CLI to run locally:
```bash
npx figma-cli use-manifest --manifest=manifest.json
```