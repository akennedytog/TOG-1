# IRIS Gmail Automation - Setup Guide
## FREE Sales Email System

---

## What This Does

✅ Sends up to 20 personalized cold emails per day  
✅ Automatic follow-ups (3-email sequence)  
✅ Tracks sends and opens  
✅ Imports leads from Arlo automatically  
✅ Completely FREE (uses your Gmail)

---

## Step 1: Create Google Sheet

1. Go to **sheets.new**
2. Name it: `Iris Sales Automation`
3. Create two tabs:
   - **Leads** - Your prospect list
   - **Email Tracking** - Tracks what's sent

---

## Step 2: Add Leads

**In the "Leads" tab, add columns:**

| Email | Business Name | Contact Name | Industry | Source |
|-------|---------------|--------------|----------|--------|
| john@acmehvac.com | Acme HVAC | John Smith | HVAC | Arlo 4/1 |
| sarah@coastallaw.com | Coastal Law | Sarah Jones | Legal | Arlo 4/1 |

**To get Arlo's leads:**
- Copy from `data/arlo_findings_2026-04-01.json`
- Or paste manually from your lead research

---

## Step 3: Create Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete the default code
3. Copy ALL code from `iris-gmail-automation.js` (I created this file)
4. Paste into Apps Script editor
5. Click **Save** (floppy disk icon)
6. Name project: `Iris Sales Automation`

---

## Step 4: Authorize (One Time)

1. In Apps Script, select function `authorize`
2. Click **Run** (▶️ button)
3. Grant permissions:
   - Click "Review Permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to Iris Sales Automation (unsafe)"
   - Click "Allow"

---

## Step 5: Test

1. Add YOUR email as first lead (to test)
2. Select function `sendIrisEmails`
3. Click **Run**
4. Check your inbox for the test email

---

## Step 6: Schedule Daily Runs

1. In Apps Script, click **clock icon** (Triggers)
2. Click **+ Add Trigger**
3. Configure:
   - Choose function: `sendIrisEmails`
   - Deployment: Head
   - Event source: Time-driven
   - Type: Day timer
   - Time: 2:00 PM to 3:00 PM
4. Click **Save**

---

## How It Works

**Email Sequence:**
- **Day 1:** Initial cold email
- **Day 4:** Follow-up #1 (if no reply)
- **Day 7:** Follow-up #2 (if no reply)
- **Day 8+:** Stop (max 3 emails)

**Daily Limit:** 20 emails/day (Gmail's safe sending limit)

**Tracking:** All sends logged in "Email Tracking" tab

---

## Email Templates

**Initial Email:**
```
Subject: Quick question about [Business Name]

Hi [Name],

I came across [Business] while researching [industry] in South Florida.

Quick question: Are you still handling lead follow-up manually?

Most [businesses] I work with are losing 20-30% of potential revenue 
because they can't respond fast enough.

I help small businesses set up AI automation that:
• Responds to leads in 60 seconds (not 4 hours)
• Follows up automatically until they reply
• Books meetings while you sleep

Takes about a week to set up. No tech skills needed.

Worth a 15-minute call to see if it fits your workflow?

Best,
Alec Kennedy
The One Group
```

---

## Monitoring

**Check the "Email Tracking" tab for:**
- Who was contacted
- How many emails sent
- When last contacted
- Status (Contacted/Reply/Converted)

**Daily Summary Email:**
- You get an email every day with count sent

---

## Next Steps

1. **Today:** Set up the script (15 min)
2. **Tomorrow:** Add 20 leads from Arlo
3. **Day 3:** Start sending 20 emails/day
4. **Week 2:** Review replies and book calls

**Expected:** 20 emails/day → 2-4 replies → 1 call per week

---

## Troubleshooting

**"Authorization required"**
- Run `authorize()` function again
- Check spam folder for test emails

**"Daily limit exceeded"**
- Script auto-limits to 20/day
- Check "Email Tracking" tab for today's count

**"No emails sending"**
- Verify leads in "Leads" tab
- Check "Email Tracking" for recent sends
- Run `importArloLeads()` to refresh from Arlo

---

## Cost

**FREE** — Uses your existing Gmail
- No monthly fees
- No per-email costs
- Just your time (15 min setup)

---

Ready to set this up? Need help with any step?
