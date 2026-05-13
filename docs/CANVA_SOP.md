# Canva Template Business - Standard Operating Procedures

**Version:** 1.0  
**Created:** 2026-03-22  
**Author:** Rico (Operations Agent)  
**Last Updated:** 2026-03-22

---

## Table of Contents

1. [Overview](#overview)
2. [Research Workflow](#1-research-workflow)
3. [Creation Workflow](#2-creation-workflow)
4. [Listing Workflow](#3-listing-workflow)
5. [Delivery Workflow](#4-delivery-workflow)
6. [Folder Structure](#folder-structure)
7. [Automation Summary](#automation-summary)
8. [Manual Tasks Checklist](#manual-tasks-checklist)

---

## Overview

This SOP documents the complete workflow for creating and selling Canva templates. Use the automation scripts in `~/.openclaw/workspace/scripts/canva_workflow.js` to streamline repetitive tasks.

**Workflow Phases:**
1. Research → 2. Create → 3. List → 4. Deliver

**Automation vs Manual:**
- ✅ **Automated:** Project initialization, SEO generation, file organization, checklists
- 🔧 **Semi-automated:** Tag suggestions, title options, content templates
- ✋ **Manual:** Actual design work, Canva uploads, customer service

---

## 1. RESEARCH WORKFLOW

### 1.1 Trending Design Discovery

**Frequency:** Weekly  
**Time Required:** 30-45 minutes  
**Status:** 🔧 Semi-automated

#### Automated Tasks:
```bash
# Run research command to see current keywords
node ~/.openclaw/workspace/scripts/canva_workflow.js research --category=social-media
```

This outputs:
- Trending keywords (rotated from database)
- Competitor shop URLs to check
- Seasonal trend reminders

#### Manual Tasks Required:
- [ ] Visit Canva search and type keywords to see autocomplete suggestions
- [ ] Check Canva's "Featured Templates" page
- [ ] Browse competitor shops (manually review their bestsellers)
- [ ] Note design styles, colors, and layouts trending
- [ ] Screenshot inspiration (save to `01-assets/inspiration/`)

### 1.2 Competitor Monitoring

**Frequency:** Weekly  
**Time Required:** 20-30 minutes  
**Status:** ✋ Manual

**Tracked Competitors:**
| Shop | Focus | What to Note |
|------|-------|--------------|
| Top Seller A | Wedding templates | Pricing, bundle sizes |
| Top Seller B | Business templates | Description keywords |
| Top Seller C | Social media | Thumbnail style |

**Monitoring Template:**
```
Date: [YYYY-MM-DD]
Competitor: [Name]
New Templates: [Count]
Top Performers: [Names]
Pricing Trends: [Notes]
Keywords Used: [List]
Opportunities: [Your notes]
```

### 1.3 Alert System for Trending Keywords

**Frequency:** Real-time monitoring  
**Status:** 🔧 Semi-automated

**Setup:**
1. Create Google Alerts for: "Canva templates trending", "Canva design trends"
2. Subscribe to Canva's creator newsletter
3. Follow design hashtags on Instagram/Pinterest: #canvadesign #canvatemplate
4. Set calendar reminders for seasonal events (holidays, back-to-school, etc.)

**Automation Script:**
```bash
# Generate seasonal keyword list
node ~/.openclaw/workspace/scripts/canva_workflow.js research --season=upcoming
```

**High-Priority Seasonal Keywords:**
| Month | Keywords |
|-------|----------|
| Jan | new year, planner, goals, minimalist |
| Feb | valentine, love, wedding, romance |
| Mar | spring, easter, st patrick, green |
| Apr | easter, spring cleaning, taxes |
| May | mother's day, graduation, summer prep |
| Jun | wedding season, father's day, summer |
| Jul | summer, vacation, patriotic |
| Aug | back to school, fall preview |
| Sep | fall, back to school, labor day |
| Oct | halloween, fall, spooky |
| Nov | thanksgiving, black friday, christmas |
| Dec | christmas, winter, new year |

---

## 2. CREATION WORKFLOW

### 2.1 Template Creation Checklist

**Status:** ✅ Automated (generated per project)

```bash
# Initialize new template project
node ~/.openclaw/workspace/scripts/canva_workflow.js init \
  --name="Instagram Story Bundle" \
  --category=social-media
```

This creates a project folder with:
- `CHECKLIST.md` - Phase-by-phase checklist
- `template-info.json` - Template metadata
- `SEO.json` - SEO data structure
- `NOTES.md` - Your notes and ideas
- Organized folder structure

### 2.2 File Organization System

**Status:** ✅ Automated

**Project Structure:**
```
templates/canva/
└── {template-name}-{id}/
    ├── template-info.json          # Metadata
    ├── CHECKLIST.md                # Phase checklist
    ├── NOTES.md                    # Your notes
    ├── SEO.json                    # SEO data
    │
    ├── 01-assets/
    │   ├── original/               # Original assets
    │   ├── stock-photos/           # Licensed images
    │   └── fonts/                  # Font files + licenses
    │
    ├── 02-designs/
    │   ├── canva-files/            # Canva export JSON
    │   └── working/                # WIP versions
    │
    ├── 03-previews/
    │   ├── thumbnails/             # Main listing image
    │   ├── mockups/                # Device mockups
    │   └── gallery/                # Gallery images
    │
    ├── 04-exports/
    │   ├── pdf/                    # Printable exports
    │   └── png/                    # Image exports
    │
    ├── 05-listing/
    │   ├── copy/                   # Final listing text
    │   └── seo/                    # Generated SEO files
    │
    └── 06-delivery/                # Created on export
        ├── delivery-info.json
        ├── README.txt
        └── [preview-zip]
```

### 2.3 Batch Creation Process

**Status:** 🔧 Semi-automated

**For Template Bundles:**

1. **Master Template First:**
   - Design the core template
   - Define color palette (3-5 colors)
   - Choose fonts (max 3 per set)

2. **Variation System:**
   - Duplicate master in Canva
   - Change colors (document in `template-info.json`)
   - Swap images
   - Adjust layouts

3. **Batch Export Checklist:**
   ```bash
   # Run for each variation
   node ~/.openclaw/workspace/scripts/canva_workflow.js init \
     --name="Template Name - {Variation}" \
     --category=social-media
   ```

4. **Quality Control Steps:**
   - [ ] Test each template in free Canva account
   - [ ] Verify all fonts are free/available
   - [ ] Check text is editable
   - [ ] Confirm images can be replaced
   - [ ] Review for typos
   - [ ] Check color contrast (accessibility)

---

## 3. LISTING WORKFLOW

### 3.1 SEO-Optimized Title Generation

**Status:** 🔧 Semi-automated

```bash
# Generate listing content
node ~/.openclaw/workspace/scripts/canva_workflow.js generate \
  --project="/path/to/template" \
  --keywords="minimalist,instagram,stories,creator"
```

**Output:**
- 3 title options
- Recommended title (best SEO score)
- 13 optimized tags
- Full description
- SEO score (aim for 80+)

**Title Formula:**
```
[Style/Adjective] + [Platform/Type] + [Template Type] + [Benefit/Feature]

Examples:
✅ Minimalist Instagram Story Templates - Clean Social Media Bundle
✅ Professional Resume Template - Modern CV Design for Canva
✅ Boho Wedding Invitation Suite - Printable Invite Template

❌ Bad examples:
❌ Template (too vague)
❌ AMAZING BEST TEMPLATE EVER!!! (spammy, caps)
❌ Canva (trademark issue, too generic)
```

**Title Best Practices:**
- Length: 50-70 characters
- Front-load important keywords
- Use proper capitalization
- No ALL CAPS
- No excessive punctuation
- Include "Canva" or "Template" (but not both redundantly)

### 3.2 Description Templates

**Status:** 🔧 Semi-automated (script generates base)

**Structure (auto-generated):**
```markdown
✨ [Hook statement]

📱 Perfect for: [Target audience]

🎨 What's included:
• Canva template link
• X page designs
• [Specific deliverables]

💡 How to use:
1. Click Canva link
2. Click "Use template"
3. Customize
4. Download/share

✅ Features:
• Fully editable in Canva Free
• Professional layouts
• Easy customization
• Instant access

📋 Note: This is a Canva template. You need a free Canva 
account to use it. No physical items will be shipped.

© All rights reserved.
```

**Customization Required:**
- [ ] Edit hook to match template personality
- [ ] Add specific use cases
- [ ] List exact deliverables
- [ ] Add any unique features
- [ ] Proofread (Grammarly recommended)

### 3.3 Tag Generation

**Status:** 🔧 Semi-automated

**Script generates:**
- Base tags from category
- Keyword-derived tags
- Duplicate removal
- 13-tag limit enforcement

**Manual Review:**
- [ ] Verify tags are relevant
- [ ] Include long-tail keywords
- [ ] Mix broad + specific terms
- [ ] Check for typos
- [ ] Ensure no trademarked terms

**Tag Strategy:**
```
3-4 broad tags: canva template, digital download, editable template
3-4 medium tags: instagram template, social media design
3-4 specific tags: minimalist instagram, creator bundle, story highlights
2-3 niche tags: fashion influencer, boutique branding
```

### 3.4 Image/Preview Creation

**Status:** ✋ Manual

**Required Images:**

| Image | Size | Purpose |
|-------|------|---------|
| Thumbnail | 1600x1200 | Main listing image |
| Gallery 1-3 | 1600x1200 | Detail views |
| Mockup | Variable | Device/usage preview |

**Thumbnail Best Practices:**
- [ ] Clean, uncluttered design
- [ ] Show actual template (not stock)
- [ ] Consistent branding (your style)
- [ ] Readable at small sizes
- [ ] Include "Canva" badge if platform allows
- [ ] 72 DPI, sRGB color profile

**Gallery Strategy:**
- Image 1: Best template showcase
- Image 2: All pages/variations visible
- Image 3: Close-up of details
- Image 4: Usage example/mockup

---

## 4. DELIVERY WORKFLOW

### 4.1 Automated File Delivery

**Status:** ✅ Semi-automated

**Canva Link Method:**
1. In Canva, click "Share" → "Template link"
2. Copy link to `template-info.json`
3. Run export command:

```bash
node ~/.openclaw/workspace/scripts/canva_workflow.js export \
  --project="/path/to/template"
```

This generates:
- `delivery-info.json` - Metadata
- `README.txt` - Instructions
- Ready-to-upload package

**Platform-Specific Delivery:**

| Platform | Method |
|----------|--------|
| Etsy | Digital download: Upload README + preview zip |
| Creative Market | Add Canva link in file description |
| Your own site | Auto-email with link after purchase |
| Gumroad | File attachment: PDF with link |

### 4.2 Customer Email Sequences

**Status:** 🔧 Semi-automated

**Email 1: Instant Delivery** (automated via platform)
```
Subject: Your Canva Template is Ready! 🎨

Hi [Customer Name],

Thanks for your purchase!

Access your template here: [CANVA LINK]

How to use:
1. Click the link above
2. Click "Use template" 
3. Start customizing!

Need help? Reply to this email.

[Your Brand]
```

**Email 2: Day 3 - Tips** (auto-send if platform supports)
```
Subject: Quick tips for your new template ✨

Hi [Customer Name],

How are you enjoying your template? Here are some tips:

• Use Canva's "Brand Kit" for easy color changes
• Try the "Animate" feature for extra flair
• Check Canva tutorials if you're new

Questions? Just reply!

[Your Brand]
```

**Email 3: Day 7 - Review Request** (manual or auto)
```
Subject: Quick favor? 🙏

Hi [Customer Name],

If you're enjoying your template, would you mind leaving 
a review? It helps other creators find us!

[Review Link]

Thanks for your support!

[Your Brand]
```

### 4.3 Review Collection

**Status:** ✋ Manual

**Strategy:**
- Include review request in delivery email
- Follow up after 1 week (if platform allows)
- Respond to all reviews (positive + negative)
- Use feedback to improve templates

**Review Template (for your responses):**
```
Thanks so much for your review, [Name]! 

So glad you're enjoying the template. If you ever have 
questions or need other designs, I'm here to help!

- [Your Name]
```

---

## Folder Structure

**Base Path:** `~/.openclaw/workspace/`

```
.
├── scripts/
│   └── canva_workflow.js      # Main automation script
│
├── docs/
│   └── CANVA_SOP.md            # This document
│
├── templates/
│   └── canva/
│       └── {project-folders}   # Individual template projects
│
├── output/                     # Generated reports (optional)
│   └── canva/
│
└── memory/
    └── canva/                  # Research notes, trends
        ├── competitor-notes.md
        ├── trending-keywords.json
        └── monthly-reports/
```

---

## Automation Summary

| Task | Automation Level | Tool/Method |
|------|-----------------|-------------|
| **Project initialization** | ✅ Automated | `canva_workflow.js init` |
| **Folder structure** | ✅ Automated | Script creates structure |
| **Checklist generation** | ✅ Automated | Generated per category |
| **SEO title options** | 🔧 Semi-automated | Script generates 3 options |
| **Tag generation** | 🔧 Semi-automated | Script suggests, manual review |
| **Description template** | 🔧 Semi-automated | Base generated, customize |
| **Trending keywords** | 🔧 Semi-automated | Database + manual research |
| **Competitor tracking** | ✋ Manual | Research template provided |
| **Design creation** | ✋ Manual | Canva (no automation possible) |
| **Preview images** | ✋ Manual | Photoshop/Canva export |
| **Canva upload** | ✋ Manual | Canva Creator dashboard |
| **Delivery file prep** | ✅ Semi-automated | `canva_workflow.js export` |
| **Email sequences** | 🔧 Semi-automated | Templates provided |
| **Review collection** | ✋ Manual | Manual follow-up |

**Automation Percentage:** ~40% of workflow steps

---

## Manual Tasks Checklist

### Critical Manual Tasks (Cannot be automated)

- [ ] **Design work** - Creating in Canva
- [ ] **Canva upload** - Publishing to Canva Creator
- [ ] **Preview images** - Creating thumbnails/gallery
- [ ] **Competitor research** - Browsing competitor shops
- [ ] **Customer service** - Responding to questions
- [ ] **Review responses** - Replying to customer reviews
- [ ] **Pricing decisions** - Setting template prices
- [ ] **Platform uploads** - Listing on Etsy/Gumroad/etc

### Recommended Manual Tasks (Review automation output)

- [ ] **SEO content review** - Edit generated titles/descriptions
- [ ] **Tag verification** - Ensure relevance
- [ ] **Proofreading** - Check all text for errors
- [ ] **Link testing** - Verify Canva links work
- [ ] **Template testing** - Try in free Canva account

---

## Quick Reference

### Daily Commands
```bash
# Start new template
node ~/.openclaw/workspace/scripts/canva_workflow.js init --name="Template Name" --category=social-media

# Generate SEO content
node ~/.openclaw/workspace/scripts/canva_workflow.js generate --project="./path" --keywords="kw1,kw2"

# Research trending
node ~/.openclaw/workspace/scripts/canva_workflow.js research

# List projects
node ~/.openclaw/workspace/scripts/canva_workflow.js list --status=draft

# Export for delivery
node ~/.openclaw/workspace/scripts/canva_workflow.js export --project="./path"
```

### File Locations
- Workflow script: `~/.openclaw/workspace/scripts/canva_workflow.js`
- This SOP: `~/.openclaw/workspace/docs/CANVA_SOP.md`
- Templates folder: `~/.openclaw/workspace/templates/canva/`

---

**Next Steps:**
1. Run your first project: `node canva_workflow.js init --name="Test Template" --category=social-media`
2. Follow the generated CHECKLIST.md
3. Customize the SEO content generated by the script
4. Upload to Canva Creator
5. Profit! 🎉

---

*Document generated by Rico (Operations Agent) for Canva Template Business*  
*Last updated: 2026-03-22*
