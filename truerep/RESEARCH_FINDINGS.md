# TrueRep - Competitive Analysis & Research Findings

## Date: March 21, 2026

---

## Competitor Research

### 1. Glassdoor (The Big One)

**Founded:** 2007
**Acquired:** $1.2 billion by Recruit Holdings (2018)
**Users:** Anonymous employee reviews of companies

**What They Did Right:**
- Anonymous reviews = honest feedback
- Company-level aggregation (not individual)
- Revenue model: Enhanced Employer Profiles (paid by companies)
- Survived legal challenges (Section 230 protection)

**Legal Protections:**
- Section 230 of Communications Decency Act
- Reviews are "opinion" not statements of fact
- Moderation team removes 20% of submissions
- Different rules for small vs large companies

**Recent Changes (2024):**
- **Now requires real names and job titles** (bought Fishbowl)
- Names can't be deleted or changed without support
- **No longer fully anonymous**
- This is your opportunity!

**Key Insight:** Glassdoor moved AWAY from anonymity. There's now a gap for truly anonymous professional reputation.

---

### 2. Blind (Tech Focus)

**What it is:** Anonymous community for tech workers
**Verification:** Company email required
**Features:** Forums, career advice, company reviews

**Strengths:**
- Strong community culture
- Verified employment (prevents fakes)
- Topic-based discussions

**Weaknesses:**
- Tech-only
- Forums not structured ratings
- Can be toxic

**Key Insight:** Verification + anonymity works. But it's community-based, not individual reputation.

---

### 3. TeamBlind / Fishbowl

**Similar to Blind** but different focus
**Fishbowl acquired by Glassdoor** → now integrated, requires real names

**Key Insight:** Glassdoor is consolidating competitors and removing anonymity.

---

## Legal Structure Recommendations

### Best Option: LLC (Limited Liability Company)

**Why LLC over Corporation:**
- Pass-through taxation (no double taxation)
- Personal asset protection
- Flexible management structure
- Lower formation/maintenance costs
- Perfect for MVP stage

**Where to Incorporate:**

**Option 1: Delaware LLC** ⭐ RECOMMENDED
- Gold standard for internet companies
- Business-friendly courts
- Strong liability protection
- Investors understand Delaware
- Cost: ~$300 formation + $300/year franchise tax

**Option 2: Florida LLC** (where you are)
- Simpler if you're based there
- Lower fees
- But less legal precedent for internet companies

**Recommendation:** Start Delaware LLC, register as foreign entity in Florida if needed.

---

### Liability Protection Strategy

**Layer 1: Business Entity**
- Delaware LLC shields personal assets
- You're an employee of the LLC

**Layer 2: Terms of Service**
- Users agree to arbitration (not lawsuits)
- Disclaimers about opinion vs fact
- Right to remove content

**Layer 3: Insurance**
- Media liability insurance (~$2-5K/year)
- Covers defamation, IP claims

**Layer 4: Operational**
- Moderation before publication (expensive)
- Or: Post-moderation with fast takedown

---

## What Went Wrong for Competitors

### Glassdoor's Mistakes:
1. **Acquired by corporate owner** → pressured to remove anonymity
2. **Didn't have individual profiles** → limited network effects
3. **Company-focused** → couldn't monetize individual users

### What Your Idea Fixes:
1. **Individual profiles** = network effects
2. **Verified + anonymous** = trust without doxxing
3. **No connections/followers** = pure meritocracy
4. **User ratings, not company** = different market

---

## Revenue Model Analysis

### Option A: Freemium
- Free: Basic profile, limited ratings
- Premium ($10/mo): Full ratings history, analytics

### Option B: B2B (Recommended)
- Companies pay to see aggregated talent data
- "Who are the best engineers at competitor X?"
- Talent intelligence reports

### Option C: Verification Fees
- Charge $5-10 for employment verification
- One-time cost, user pays

### Option D: Job Board
- Verified candidates post anonymously
- Employers pay to contact
- Similar to Hired/AngelList

**Best Combo:** B2C verification fees + B2B talent intelligence

---

## Technical Challenges

### 1. Email Verification
**Problem:** Need to verify without storing PII
**Solution:** 
- Hash emails, store hash only
- Use third-party verification (NeverBounce, ZeroBounce)
- One-time verification, discard email

### 2. Rating Authenticity
**Problem:** Fake ratings, revenge ratings
**Solutions:**
- Rate limiting (1 rating per person per month)
- Pattern detection (same IP, writing style)
- Require time overlap at company ( employment dates match )
- Weight by verifier credibility

### 3. Deanonymization Risk
**Problem:** Writing style analysis reveals identity
**Solutions:**
- Aggregate ratings only (no individual reviews)
- Minimum rating threshold before display
- Time delay on publication

---

## MVP Validation Questions

Before building full product, validate:

1. **Would you create a profile?** (Would Alec use this?)
2. **Would you rate colleagues?** (Honestly, anonymously?)
3. **Would you check someone's profile before hiring?**
4. **Would you pay $5 for verification?**

**Quick Test:**
- Post in relevant subreddits (r/cscareerquestions, r/startups)
- Ask: "Would you use anonymous professional ratings?"
- Gauge interest before building

---

## Next Steps

### Phase 1: MVP (This Week)
- [x] Landing page created
- [ ] Deploy landing page
- [ ] Post in communities for validation
- [ ] Collect email signups

### Phase 2: Legal (Next 2 Weeks)
- [ ] Form Delaware LLC ($300)
- [ ] Draft Terms of Service
- [ ] Draft Privacy Policy
- [ ] Get media liability insurance quote

### Phase 3: Build (If Validated)
- [ ] Email verification system
- [ ] Anonymous profile creation
- [ ] Rating submission (with abuse detection)
- [ ] Search/browse functionality

### Phase 4: Launch
- [ ] Beta with 100 users
- [ ] Iterate based on feedback
- [ ] Scale if traction

---

## Key Takeaways

1. **Glassdoor abandoned anonymity** → Market opportunity
2. **Delaware LLC is best structure** → Do this first
3. **Verification + anonymity is hard but doable** → Technical challenge
4. **Individual reputation is untapped** → Different from Glassdoor
5. **Validate before building** → Save months of work

**The idea is validated by Glassdoor's $1.2B exit + their recent abandonment of anonymity.**

**Your move is the individual focus + maintaining anonymity that Glassdoor gave up.**

---

*Research completed: March 21, 2026*