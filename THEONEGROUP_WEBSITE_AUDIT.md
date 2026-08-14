# The One Group Website Audit
## Comprehensive Analysis + Recommendations
**Date:** July 26, 2026

---

## SITE STRUCTURE OVERVIEW

### Total Pages: 33 HTML files

### Core Pages (Should Keep)
| Page | Purpose | Status |
|------|---------|--------|
| index.html | Homepage | ✅ Keep |
| about.html | About page | ✅ Keep |
| services.html | Services overview | ✅ Keep (needs update) |
| pricing.html | Pricing | ✅ Keep (needs update) |
| case-studies.html | Social proof | ✅ Keep |
| blog.html | Content marketing | ✅ Keep |
| contact.html | Missing! | ❌ CREATE |
| competitor-monitoring.html | Product page | ✅ Keep (needs upgrade) |

### Service Pages (Consolidate)
| Current Pages | Problem | Recommendation |
|---------------|---------|----------------|
| ai-assessment.html | Similar to ai-audit.html | MERGE into services |
| ai-audit.html | Standalone | Keep but consolidate nav |
| ai-optimization.html | Standalone | Keep |
| ai-coaching.html | Standalone | Keep |
| social-media.html | Service page | Keep |
| web-design.html | Service page | Keep |
| lead-lists.html | Standalone | Keep |

### Event/Workshop Pages (Consolidate)
| Page | Status |
|------|--------|
| ai-agent-workshop.html | Keep |
| ai-growth-sprint.html | Merge with workshop |
| events.html | Keep |
| mmw-2026.html | Archive (dated) |

### System/Utility Pages (Clean up)
| Page | Status |
|------|--------|
| openclaw-setup.html | Keep (product) |
| free-ai-audit.html | Landing page | Keep |
| qualify.html | Funnel page | Keep |
| truerep.html | Product page | Keep |
| missed-call-calculator.html | Tool | Keep |
| proof-hvac-case-study.html | Content | Keep |
| newsletter-thanks.html | Utility | Keep |

### Navigation/Template Files (Internal use)
- NAV_SNIPPET.html
- nav-mobile.html
- nav-template.html
- nav-with-dropdown.html
- calendly-float.html
- email-popup.html
- twitter-article-header.html
- twitter-invisible-automation-header.html

---

## CRITICAL ISSUES FOUND

### 1. ❌ DUPLICATE SERVICE PAGES
**Problem:** Multiple pages with overlapping content

**Duplicates found:**
- `ai-assessment.html` vs `ai-audit.html` — Similar offerings, confusing
- `ai-growth-sprint.html` vs `ai-agent-workshop.html` — Overlapping events

**Impact:** SEO dilution, confused visitors, maintenance burden

**Fix:** Consolidate into clear service categories

---

### 2. ❌ MISSING CRITICAL PAGES

| Missing Page | Why Critical | Priority |
|--------------|--------------|----------|
| /contact.html | Every site needs contact | HIGH |
| /privacy.html | Legal requirement | HIGH |
| /terms.html | Legal requirement | MEDIUM |
| /sitemap.html | SEO best practice | LOW |

---

### 3. ❌ OUTDATED PRICING

**Current pricing.html mentions:**
- AI Visibility Audit $250 (was $2,500?)
- AI Agent System $1,997
- Competitor Intel $297/month ✅

**Missing new services:**
- Multi-Platform Management $997/month
- Compliance Content Packs $497
- Lead Response Automation (Setup + $297/month)

---

### 4. ❌ COMPETITOR MONITORING PAGE IS BASIC

**Current:** Generic description, no differentiation
**Need:** Upgrade to premium product page with:
- Live monitoring examples
- Sample alert screenshots
- ROI calculator
- "1-hour alert" guarantee

---

### 5. ❌ NO COMPLIANCE CONTENT PAGES

**Missing entirely:**
- `/hipaa-ai-services.html`
- `/soc2-compliance-content.html`
- `/finra-ai-content.html`
- `/compliance-content-packs.html`

**Impact:** Missing huge SEO opportunity + revenue stream

---

## VISUAL DESIGN ISSUES

### 1. Navigation Inconsistency
**Problem:** 8 nav-related files suggest fragmented navigation system

**Fix:** Consolidate to single nav component

### 2. Mobile Menu Issues
**Evidence:** nav-mobile.html exists separately
**Fix:** Ensure responsive design works, remove separate mobile files

### 3. CTA Button Placement
**Issue:** "Free Audit" button appears on every page but no clear path for paid services
**Fix:** Add service-specific CTAs

---

## CONTENT ISSUES

### 1. Messaging Drift
**Homepage:** "8-agent system for South Florida businesses"
**Some pages:** Generic AI services

**Fix:** Consistent messaging across all pages

### 2. Outdated Content
- mmw-2026.html (dated event)
- Old case studies may need refresh

### 3. Missing Social Proof
**No testimonials section on:**
- services.html
- pricing.html
- competitor-monitoring.html

---

## RECOMMENDED CHANGES

### PHASE 1: Critical Fixes (This Week)

#### 1. Update Pricing Page
**File:** pricing.html
**Changes:**
- Add new services:
  - Multi-Platform Management: $997/month
  - Compliance Content Packs: $497 (one-time)
  - Lead Response Automation: Setup + $297/month
- Clarify Competitor Intel: $297/month (already there, verify)
- Add comparison table

#### 2. Create Contact Page
**File:** contact.html (NEW)
**Include:**
- Contact form
- Email: akennedy@theonegroup.info
- Phone: 502-403-7201
- Calendly embed
- Office hours

#### 3. Consolidate Duplicate Services
**Action:**
- Merge ai-assessment.html into ai-audit.html
- Redirect ai-assessment.html → ai-audit.html
- Merge ai-growth-sprint.html into ai-agent-workshop.html

---

### PHASE 2: New Product Pages (Next Week)

#### 1. Upgrade Competitor Intel Page
**File:** competitor-monitoring.html (ENHANCE)
**Add:**
- "Alert within 1 hour" guarantee
- Sample alert screenshot
- Pricing calculator (competitors × $297)
- ROI examples
- Integration with your new monitoring system

#### 2. Create Compliance Content Page
**File:** compliance-content-services.html (NEW)
**Include:**
- HIPAA for healthcare
- SOC2 for accounting
- FINRA for financial services
- Pricing: $497 per industry pack
- Sample content downloads

#### 3. Create Lead Response Page
**File:** lead-response-automation.html (NEW)
**Include:**
- "Industry average: 42 hours. Our system: 5 minutes"
- Before/after comparison
- Integration with Scout CRM
- Pricing: Setup + $297/month

---

### PHASE 3: SEO & Content (Next Month)

#### 1. Create Industry-Specific Landing Pages
- `/healthcare-ai-automation.html`
- `/legal-ai-services.html`
- `/accounting-ai-tools.html`

#### 2. Add Legal Pages
- `/privacy.html`
- `/terms.html`

#### 3. Archive/Delete
- mmw-2026.html → archive or redirect

---

## CONSOLIDATION PLAN

### Before: 33 pages
### After: ~25 focused pages

**Pages to Delete/Merge:**
1. ai-assessment.html → merge into ai-audit.html
2. ai-growth-sprint.html → merge into ai-agent-workshop.html
3. nav-template.html → internal only, don't deploy
4. nav-mobile.html → use responsive instead
5. twitter-article-header.html → internal only
6. twitter-invisible-automation-header.html → internal only

**New Pages to Create:**
1. contact.html
2. compliance-content-services.html
3. lead-response-automation.html
4. privacy.html
5. terms.html

---

## NAVIGATION RECOMMENDATIONS

### Current Nav (Services Dropdown):
- AI Assessment
- AI Visibility Audit ❌ (duplicate)
- AI Implementation
- Competitor Intel
- Social Media
- Web Design
- Premium Lead Lists

### Recommended Nav:
**Services:**
- AI Audit & Assessment (merged)
- AI Implementation
- Competitor Intelligence (upgraded)
- Compliance Content (NEW)
- Lead Response Automation (NEW)
- Social Media
- Web Design
- Lead Lists

**Other:**
- About
- Case Studies
- Blog
- Pricing
- Contact (NEW)

---

## IMMEDIATE ACTION ITEMS

1. ✅ **Update pricing.html** with new services
2. ✅ **Create contact.html** 
3. ✅ **Merge ai-assessment.html** into ai-audit.html
4. ✅ **Enhance competitor-monitoring.html** with new features
5. ✅ **Create compliance-content-services.html**
6. ✅ **Create lead-response-automation.html**
7. ⏳ **Update services.html** to reflect new offerings
8. ⏳ **Fix navigation** across all pages
9. ⏳ **Add testimonials** to key pages
10. ⏳ **Deploy and test**

---

## QUESTIONS FOR YOU

1. **Should I proceed with these changes?**
2. **Priority order:** Pricing first, then new pages?
3. **Competitor Intel page:** Do you have real alert examples to show?
4. **Contact page:** Any specific info to include beyond email/phone?
5. **Compliance content:** Which industry should we prioritize first?

Say "proceed" and I'll start making these changes immediately.
