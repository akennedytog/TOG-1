# AI Visibility Audit - Standard Operating Procedure (SOP)
## For: The One Group Internal Use
## Last Updated: March 19, 2026

---

## PURPOSE
This document outlines the step-by-step process for conducting AI Visibility Audits for small business clients.

---

## AUDIT WORKFLOW (10-15 minutes per audit)

### PHASE 1: RECEIVE LEAD (0 minutes)
**Trigger:** Email from Formspree arrives in akennedy@theonegroup.info

**Email contains:**
- websiteUrl
- businessName
- industry
- email
- isPremium (true/false)
- submittedAt

**Action:** Add to Google Sheets tracker immediately

---

### PHASE 2: INITIAL SETUP (2 minutes)

**Step 1: Open Tools**
- [ ] Open incognito browser window
- [ ] Open Google Sheets tracker
- [ ] Open Google Doc template
- [ ] Open checklist document

**Step 2: Record in Tracker**
- [ ] Add new row with lead info
- [ ] Set status: "In Progress"
- [ ] Note: Premium or Free audit

---

### PHASE 3: RUN AUDIT (5-8 minutes)

Follow the checklist in: `ai-visibility-audit-checklist.md`

**Section 1: AI Crawler Access (2 min)**
- [ ] Check robots.txt
- [ ] Test JavaScript rendering
- [ ] Check page load speed
- [ ] Verify mobile responsiveness
- [ ] Record score: ___/25

**Section 2: Structured Data (2 min)**
- [ ] Check for Schema.org markup
- [ ] Validate JSON-LD
- [ ] Check key properties
- [ ] Run Google Rich Results Test
- [ ] Record score: ___/25

**Section 3: Entity Recognition (2 min)**
- [ ] Assess business type clarity
- [ ] Check location signals
- [ ] Evaluate content clarity
- [ ] Check entity consistency
- [ ] Record score: ___/25

**Section 4: Citation Presence (2 min)**
- [ ] Check Google Business Profile
- [ ] Search industry directories
- [ ] Check review presence
- [ ] Verify social media
- [ ] Record score: ___/25

---

### PHASE 4: CALCULATE SCORES (1 minute)

**Auto-calculated in Google Sheets:**
- Total Score = SUM of 4 categories
- Rating = Auto-assigned (Excellent/Good/Needs Work/Critical)
- Priority = Auto-assigned (High/Medium/Low)

**Manual check:**
- [ ] Verify scores make sense
- [ ] Adjust if needed based on gut check

---

### PHASE 5: GENERATE REPORT (3-5 minutes)

**Using Google Doc Template:**

1. **Copy Template**
   - [ ] Open `GOOGLE_DOC_REPORT_TEMPLATE.txt`
   - [ ] Copy all content
   - [ ] Paste into new Google Doc

2. **Fill in Blanks**
   - [ ] [BUSINESS NAME] → Actual business name
   - [ ] [DATE] → Today's date
   - [ ] [WEBSITE URL] → Actual URL
   - [ ] [SCORE] → Total score (0-100)
   - [ ] [Rating] → Based on score
   - [ ] Fill in all 4 category scores
   - [ ] Write brief findings for each section
   - [ ] Create 3-5 priority recommendations

3. **Customize Recommendations**
   - [ ] Make specific to their industry
   - [ ] Include estimated impact
   - [ ] Note difficulty level
   - [ ] Add time estimates

4. **Save & Export**
   - [ ] File → Rename: "[BusinessName]_AI_Audit_[Date]"
   - [ ] File → Download → PDF Document
   - [ ] Save to: `/The One Group/Client Reports/2026/`

---

### PHASE 6: DELIVER REPORT (2 minutes)

**For FREE Audits:**

1. **Send Email**
   - [ ] Use Template: "Free Audit Report Delivery"
   - [ ] Attach PDF report
   - [ ] Personalize first paragraph
   - [ ] Include soft CTA for services

2. **Update Tracker**
   - [ ] Mark "Report Sent" with date
   - [ ] Set Follow-up 1: Today + 3 days
   - [ ] Set Follow-up 2: Today + 7 days
   - [ ] Status: "Report Sent"

**For PREMIUM Audits ($297):**

1. **Enhanced Report**
   - [ ] Add competitor analysis section
   - [ ] Include 3 competitor comparisons
   - [ ] Add prioritized action plan
   - [ ] Make it 20+ pages

2. **Send Email**
   - [ ] Use Template: "Premium Audit Report Delivery"
   - [ ] Attach PDF report
   - [ ] Include Calendly link for consultation
   - [ ] Mention 30-min consultation included

3. **Schedule Follow-up**
   - [ ] Add to calendar: Follow-up in 2 days
   - [ ] Set reminder to book consultation
   - [ ] Status: "Premium - Awaiting Consultation"

---

### PHASE 7: FOLLOW-UP SEQUENCE

**Day 3: First Follow-up**
- [ ] Check if report was opened (ask if they have questions)
- [ ] Use Template: "Follow-Up #1"
- [ ] Soft pitch for services

**Day 7: Second Follow-up**
- [ ] Check if they implemented any recommendations
- [ ] Use Template: "Follow-Up #2"
- [ ] Offer 15-min call to discuss

**Day 14: Final Follow-up**
- [ ] Last attempt
- [ ] Use Template: "Final Follow-Up"
- [ ] Offer limited-time discount

**Day 30: Monthly Check-in**
- [ ] If no conversion, add to newsletter
- [ ] Stay top of mind
- [ ] Share relevant content

---

## CONVERSION TACTICS

### Free Audit → Premium Audit
**Trigger:** They reply asking for more detail

**Response:**
"I'd be happy to dive deeper! I offer a Premium Detailed Audit for $297 that includes:
- Competitor analysis (3 competitors)
- Step-by-step implementation guide
- 30-minute consultation
- Prioritized action plan

Would you like to upgrade?"

### Audit → Monthly Service
**Trigger:** They ask for help implementing

**Response:**
"Absolutely! I offer done-for-you AI Optimization services:
- Starter: $2,500 setup + $500/month
- Includes everything in the report + ongoing optimization
- First month FREE if you sign up this week

Want to book a 15-min call to discuss?"

---

## QUALITY CHECKLIST

Before sending any report, verify:

- [ ] Business name spelled correctly
- [ ] Website URL is correct
- [ ] Scores add up to total
- [ ] No placeholder text remains ([BRACKETS])
- [ ] Recommendations are specific to their industry
- [ ] PDF opens correctly
- [ ] Email is personalized
- [ ] Calendly link works

---

## TIME TRACKING

**Target Times:**
- Setup: 2 min
- Audit: 5-8 min
- Report generation: 3-5 min
- Email/send: 2 min
- **Total: 12-17 minutes per audit**

**Daily Capacity:**
- 20 audits/day = 4-5 hours
- 10 audits/day = 2-3 hours
- 5 audits/day = 1-2 hours

---

## PRICING REFERENCE

| Service | Price | Time | Hourly Rate |
|---------|-------|------|-------------|
| Free Audit | $0 | 15 min | Lead gen |
| Premium Audit | $297 | 30 min | $594/hr |
| Monthly Starter | $500/mo | 5 hrs/mo | $100/hr |
| Monthly Growth | $1,000/mo | 10 hrs/mo | $100/hr |
| Monthly Enterprise | $2,500/mo | 20 hrs/mo | $125/hr |

---

## RED FLAGS (Don't Take These Clients)

**Avoid if:**
- Website is completely broken
- Business is clearly a scam
- They want guaranteed rankings
- They argue about pricing before seeing value
- They want immediate results (unrealistic)

**Proceed with caution if:**
- Score is already 90+ (limited upside)
- Business is brand new (no citations yet)
- Industry is highly regulated (legal/medical)

---

## SUCCESS METRICS

**Track weekly:**
- Leads captured: ___
- Audits completed: ___
- Premium audits sold: ___ ($___)
- Monthly clients signed: ___ ($___)
- Conversion rate: ___%
- Average deal size: $___

**Monthly goals:**
- 20 free audits → 4 premium ($1,188) → 2 monthly ($1,000) = $2,188

---

## TEMPLATES QUICK ACCESS

**Email Templates:**
- File: `email-templates.md`
- Templates 1-7 for all scenarios

**Report Template:**
- File: `GOOGLE_DOC_REPORT_TEMPLATE.txt`
- Copy into Google Docs for each audit

**Checklist:**
- File: `ai-visibility-audit-checklist.md`
- Follow for every audit

**Tracker:**
- File: `GOOGLE_SHEETS_IMPORT.csv`
- Import to Google Sheets

---

## SUPPORT & QUESTIONS

**If stuck on technical issue:**
- Check Formspree dashboard
- Verify website is crawlable
- Try different browser

**If client asks question you can't answer:**
- "That's a great question. Let me research that and get back to you within 24 hours."
- Document the question for future SOP updates

**If client is unhappy:**
- Offer to re-run audit
- Provide additional recommendations
- Extend follow-up period

---

## CONTINUOUS IMPROVEMENT

**After every 10 audits:**
- [ ] Review what's working
- [ ] Update templates based on feedback
- [ ] Refine recommendations
- [ ] Document new questions/objections

**Monthly:**
- [ ] Review conversion rates
- [ ] Adjust pricing if needed
- [ ] Update industry-specific recommendations
- [ ] Train on new tools/features

---

Last updated: March 19, 2026
Version: 1.0
Next review: April 19, 2026
