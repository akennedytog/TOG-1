# AI Visibility Audit Checklist
## Manual Audit Process (5-10 minutes per site)

---

## Pre-Audit Setup

**Tools Needed:**
- Web browser (Chrome recommended)
- Text editor or Google Sheet to record scores
- Email template ready

**For Each Audit:**
1. Open incognito/private browser window
2. Navigate to client's website
3. Work through each section below
4. Record scores in tracking sheet
5. Generate PDF report (use Google Docs template)
6. Send email with report

---

## SECTION 1: AI Crawler Access (Score 0-25)

### 1.1 Check robots.txt (5 points)
**URL:** `https://[website]/robots.txt`

**What to look for:**
- ✅ PASS: No Disallow rules blocking AI crawlers
- ⚠️ PARTIAL: Some blocking but not complete
- ❌ FAIL: Blocks major crawlers

**Common blocking patterns:**
```
User-agent: *
Disallow: /  ← FAIL

User-agent: GPTBot
Disallow: /  ← FAIL

User-agent: *
Disallow: /admin/  ← OK if not critical content
```

**Score:**
- 5 = Fully accessible
- 3 = Some minor blocking
- 0 = Major blocking detected

### 1.2 Check for JavaScript Rendering Issues (10 points)
**Test:** View source (Ctrl+U) vs. Inspect Element

**What to check:**
- Right-click → "View Page Source"
- Search for structured data (JSON-LD)
- Compare with "Inspect Element"

**Scoring:**
- 10 = All content in initial HTML
- 5 = Some content loaded via JS
- 0 = Heavy JS dependency

**Quick test:**
```bash
# In browser console
document.querySelector('script[type="application/ld+json"]')
# If null → data loaded via JS (bad for AI)
```

### 1.3 Page Load Speed (5 points)
**Tool:** Chrome DevTools → Network tab → Hard refresh

**Scoring:**
- 5 = < 2 seconds
- 3 = 2-4 seconds
- 0 = > 4 seconds

**Why it matters:** AI crawlers have timeout limits

### 1.4 Mobile Responsiveness (5 points)
**Test:** Chrome DevTools → Toggle Device Toolbar

**Scoring:**
- 5 = Fully responsive
- 3 = Minor issues
- 0 = Major mobile problems

---

## SECTION 2: Structured Data (Score 0-25)

### 2.1 Schema.org Markup Present (10 points)
**Test:** View source → Search for "schema.org"

**What to look for:**
```html
<!-- GOOD: Server-side rendered JSON-LD -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  ...
}
</script>
```

**Scoring:**
- 10 = Complete LocalBusiness or Organization schema
- 6 = Partial schema
- 3 = Basic schema only
- 0 = No schema found

### 2.2 Key Schema Properties Present (10 points)
Check for these required fields:

**Business Info:**
- [ ] `@type` (LocalBusiness, Organization, etc.)
- [ ] `name` (business name)
- [ ] `description`
- [ ] `url`
- [ ] `telephone`
- [ ] `email`

**Location:**
- [ ] `address` (streetAddress, addressLocality, addressRegion, postalCode)
- [ ] `geo` (latitude/longitude)

**Services:**
- [ ] `@type: Service` or service listings
- [ ] `areaServed`
- [ ] `priceRange`

**Hours & Contact:**
- [ ] `openingHoursSpecification`
- [ ] `contactPoint`

**Scoring:**
- 10 = 10+ fields present
- 7 = 7-9 fields
- 4 = 4-6 fields
- 0 = < 4 fields

### 2.3 Schema Validation (5 points)
**Tool:** Google Rich Results Test
**URL:** https://search.google.com/test/rich-results

**Scoring:**
- 5 = No errors
- 3 = Minor warnings
- 0 = Critical errors

---

## SECTION 3: Entity Recognition (Score 0-25)

### 3.1 Business Type Clarity (10 points)
**Test:** Can you tell what they do in 5 seconds?

**Check homepage for:**
- Clear headline stating business type
- Services/products listed
- Industry keywords present

**Scoring:**
- 10 = Crystal clear (e.g., "HVAC Services in Louisville")
- 6 = Mostly clear
- 3 = Confusing
- 0 = Unclear what they do

### 3.2 Location Signals (5 points)
**Check for:**
- City/State in title/meta
- Address visible on homepage
- "Near me" or location pages
- Local keywords in content

**Scoring:**
- 5 = Strong location signals
- 3 = Some location info
- 0 = No location clarity

### 3.3 Content Clarity for AI (5 points)
**Read homepage as if you were AI:**
- Can you extract key facts?
- Are services clearly listed?
- Is pricing/availability mentioned?

**Scoring:**
- 5 = AI-friendly content structure
- 3 = Somewhat clear
- 0 = AI would struggle

### 3.4 Entity Consistency (5 points)
**Check:** Is business name consistent across:
- Website
- Google Business Profile
- Social media
- Directories

**Scoring:**
- 5 = Fully consistent
- 3 = Minor variations
- 0 = Major inconsistencies

---

## SECTION 4: Citation Presence (Score 0-25)

### 4.1 Google Business Profile (10 points)
**Search:** `"Business Name" + "Google Business"`

**Check:**
- Profile exists?
- Claimed and verified?
- Complete information?
- Recent reviews?
- Posts active?

**Scoring:**
- 10 = Complete, optimized GBP
- 7 = Good but could improve
- 4 = Basic profile
- 0 = Missing or unclaimed

### 4.2 Industry Directories (5 points)
**Common directories by industry:**
- **HVAC:** Angi, HomeAdvisor, Thumbtack, Yelp
- **Legal:** Avvo, Martindale, FindLaw
- **Medical:** Healthgrades, ZocDoc, WebMD
- **General:** BBB, Chamber of Commerce

**Scoring:**
- 5 = Listed on 3+ relevant directories
- 3 = Listed on 1-2
- 0 = No directory presence

### 4.3 Review Presence (5 points)
**Check:** Google, Yelp, industry sites

**Scoring:**
- 5 = 10+ recent reviews across platforms
- 3 = Some reviews but sparse
- 0 = Few or no reviews

### 4.4 Social Media Presence (5 points)
**Check:** Active profiles on:
- Facebook (business page)
- LinkedIn (company page)
- Twitter/X
- Instagram (if visual business)

**Scoring:**
- 5 = Active on 3+ platforms
- 3 = Active on 1-2
- 0 = No social presence

---

## SCORING SUMMARY

### Calculate Total Score

| Section | Max Score | Actual Score |
|---------|-----------|--------------|
| AI Crawler Access | 25 | ___ |
| Structured Data | 25 | ___ |
| Entity Recognition | 25 | ___ |
| Citation Presence | 25 | ___ |
| **TOTAL** | **100** | **___** |

### Score Interpretation

- **80-100:** Excellent AI Visibility
  - AI can easily find and understand the business
  - Likely to be cited in responses
  - Minor optimizations recommended

- **50-79:** Moderate AI Visibility
  - AI can find the business but may not fully understand
  - Significant improvements possible
  - Priority fixes will have impact

- **25-49:** Poor AI Visibility
  - AI may struggle to find or understand
  - Major optimization needed
  - High opportunity for improvement

- **0-24:** Critical Issues
  - Likely invisible to AI
  - Immediate action required
  - Foundational fixes needed

---

## REPORT GENERATION

### Create PDF Report (Google Docs Template)

**Sections to include:**

1. **Executive Summary**
   - Overall score
   - Key findings (2-3 bullets)
   - Priority recommendations

2. **Detailed Findings**
   - Section-by-section breakdown
   - Screenshots of issues
   - Specific examples

3. **Recommendations**
   - Prioritized action items
   - Estimated impact
   - Implementation difficulty

4. **Next Steps**
   - How to fix top 3 issues
   - Option to hire for implementation
   - Pricing for ongoing optimization

### Email Template

See `email-templates.md` for full templates

---

## TRACKING SHEET

**Google Sheet Columns:**
1. Date
2. Business Name
3. Website URL
4. Email
5. Industry
6. Crawler Score (0-25)
7. Structured Data Score (0-25)
8. Entity Score (0-25)
9. Citation Score (0-25)
10. Total Score (0-100)
11. Priority Level (High/Med/Low)
12. Report Sent (Y/N)
13. Follow-up Date
14. Converted to Client (Y/N)

---

## TIME TRACKING

**Target time per audit:**
- Setup + initial checks: 2 min
- Crawler access: 2 min
- Structured data: 2 min
- Entity recognition: 2 min
- Citations: 2 min
- Report generation: 5 min
- Email + upload: 2 min

**Total: ~17 minutes per audit**

**Premium audits:** Add 15 min for competitor analysis

---

## QUICK REFERENCE

### Free Tools to Use
- Google Rich Results Test
- Schema.org Validator
- PageSpeed Insights
- Mobile-Friendly Test

### Common Issues (Quick Fixes)
1. **No schema markup** → Add JSON-LD to <head>
2. **JS-rendered content** → Make server-side
3. **Missing GBP** → Create/claim profile
4. **No directory listings** → Submit to 3-5 directories
5. **Slow load time** → Optimize images, enable caching

### Red Flags (Immediate Action)
- robots.txt blocking everything
- No contact info on homepage
- Business name varies across platforms
- Website loads in >5 seconds
- No mobile version

---

## PRICING REFERENCE

**Free Audit:** Basic score + top 3 recommendations
**Premium Audit ($297):**
- Detailed 20+ page report
- Competitor analysis (3 competitors)
- Prioritized action plan
- 30-min consultation
- Implementation quote

**Optimization Services:**
- Starter: $2,500 setup + $500/month
- Growth: $5,000 setup + $1,000/month
- Enterprise: $10,000 setup + $2,500/month

---

Last updated: March 19, 2026
Version: 1.0
