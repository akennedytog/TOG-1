# Miami Music Week Google Form - Complete Setup Guide

## Issue: OAuth Redirect Failed
The credentials file contains an OAuth 2.0 client that requires browser authorization. The localhost redirect isn't working in your environment.

## Solution: Two Options

### OPTION 1: Manual Google Form Creation (FASTEST - 3 minutes)

This is actually the fastest path to get live:

**Step 1: Create the Form**
1. Go to https://forms.google.com
2. Click "+ Blank" to create new form
3. Title: **"Miami Music Week 2026 - Event Submission"**
4. Description: *"Submit an event for the community-powered MMW 2026 guide"*

**Step 2: Add Questions**

| Question | Type | Required | Help Text |
|----------|------|----------|-----------|
| Event Name | Short answer | ✅ | - |
| Venue / Location | Short answer | ✅ | e.g., Club Space, Bayfront Park |
| Event Date | Date | ✅ | - |
| Start Time | Short answer | ✅ | e.g., 10:00 PM |
| End Time | Short answer | ❌ | e.g., 6:00 AM (optional) |
| Ticket Price | Short answer | ✅ | e.g., $50-$100 |
| Genre / Music Style | Multiple choice | ✅ | Options listed below |
| Ticket Link | Short answer | ✅ | Direct URL to buy tickets |
| Event Description | Paragraph | ❌ | Lineup, special notes, etc. |
| Your Email | Short answer | ✅ | For confirmation when added |
| Twitter Handle | Short answer | ❌ | e.g., @yourhandle |

**Genre Options:**
- House
- Techno
- Tech House
- Deep House
- EDM / Dance Pop
- Trance
- Drum & Bass
- Hip Hop / R&B
- Multi-Genre
- Other

**Step 3: Link to Spreadsheet**
1. Click "Responses" tab
2. Click green spreadsheet icon
3. Select "Create new spreadsheet"
4. Name: "MMW 2026 Event Submissions"

**Step 4: Make Spreadsheet Public**
1. Open the spreadsheet
2. Click "Share" (top right)
3. Change to "Anyone with the link can view"
4. Copy the link

**Step 5: Get URLs**
1. **Form URL:** Click "Send" → Link icon → Copy URL
   - Looks like: `https://docs.google.com/forms/d/e/1FAIpQLS.../viewform`
   
2. **Sheet ID:** From spreadsheet URL
   - Looks like: `https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit`

**Step 6: Update Website**
Replace in `mmw-2026.html`:
- `YOUR_FORM_ID` → Your actual form URL
- `YOUR_SHEET_ID` → Your actual sheet ID

Then deploy:
```bash
cd theonegroup-site && bash deploy.sh prod
```

---

### OPTION 2: Update OAuth Redirect (More Complex)

If you want full API automation, you need to:

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 client ID
3. Edit it
4. Add redirect URI: `http://localhost:8085` or `urn:ietf:wg:oauth:2.0:oob`
5. Save
6. Re-run authentication

Then I can use the Google APIs directly to create forms.

---

## Recommended: Option 1 (Manual)

**Why:** 
- Takes 3 minutes vs 15+ minutes for OAuth fix
- Same end result
- Works immediately
- You only do this once

**Timeline:**
1. Create form (3 min)
2. Get URLs (1 min)
3. Update HTML (2 min)
4. Deploy (1 min)
5. **Total: 7 minutes → Live community form**

---

## After Form is Live

**Tweet Strategy:**
```
🎵 Miami Music Week 2026 is HERE!

The community-powered event guide is live:

• Submit YOUR events
• 10+ events already listed
• Filter by day
• Direct ticket links

Live page → https://theonegroup.info/mmw-2026.html

Built by AI. Powered by the community.

#MiamiMusicWeek #MMW2026 #Ultra2026
```

**Monitor Submissions:**
- Check Google Sheet daily
- Verify events (make sure they're real)
- Add verified events to the website
- Tweet about new additions

---

## Need Help?

Once you create the form and get the URLs, just paste them here and I'll update the website immediately.

**Your credentials are saved:** `~/.openclaw/workspace/google-credentials.json`

**Ready when you are!**