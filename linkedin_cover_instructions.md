# LinkedIn Cover Image — Screenshot Instructions

## File Created
`~/.openclaw/workspace/linkedin_cover.html`

## How to Capture

### Option 1: Open in Browser (Easiest)

1. Open the file in Chrome/Firefox:
   ```
   open ~/.openclaw/workspace/linkedin_cover.html
   ```

2. Zoom browser to 100% (Cmd+0 on Mac, Ctrl+0 on Windows)

3. Screenshot just the cover image:
   - **Mac:** Cmd+Shift+4, then drag to select
   - **Windows:** Snipping Tool or Win+Shift+S
   - Make sure dimensions are exactly 1128 x 191 pixels

4. Save as PNG

### Option 2: Use Playwright/Screenshot Tool

```bash
cd ~/.openclaw/workspace
# Install playwright if needed
npm install playwright
# Run screenshot script
node screenshot_cover.js
```

### Option 3: Upload to Canva

1. Go to canva.com
2. Search "LinkedIn company cover"
3. Use custom size: 1128 x 191 pixels
4. Recreate the design:
   - Left: Upload TOG logo
   - Right: Text "AUTOMATE THE BORING. SCALE THE IMPORTANT."
   - Background: Dark gradient (navy to blue)
   - Highlight "BORING" and "IMPORTANT" in purple (#8b5cf6)

## Design Specs

**Layout:**
- Left side: TOG Logo (100x100px)
- Right side: Text aligned right
- Background: Gradient #0f172a → #3b82f6

**Text:**
- Tagline: "AUTOMATE THE BORING. SCALE THE IMPORTANT."
- Highlight "BORING" and "IMPORTANT" in purple (#8b5cf6)
- Subtext: "AI Automation for SMBs" (white, smaller)
- URL: "theonegroup.info" (light blue #60a5fa)

**Font:** Inter (Google Font)

## After Screenshot

Upload to LinkedIn:
1. Go to linkedin.com/company/theonegroup/settings
2. Click "Page info" → "Logo" and "Cover photo"
3. Upload your screenshot
4. Preview on desktop and mobile
5. Adjust if needed
