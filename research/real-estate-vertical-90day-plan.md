# The One Group — Vertical AI Micro-SaaS: 90-Day Plan
## Chosen Vertical: South Florida Real Estate (agent teams + property managers)

**Date:** 2026-08-16
**Context:** OpenRouter→Stripe $7B+ exit validated the "picks & shovels" thesis. Research (research/ai-shovel-opportunities.md) ranked Vertical AI Micro-SaaS (#1) + White-label fulfillment (#2) as the two best plays. This plan picks the vertical and sequences the build.

---

## Why Real Estate (data-backed)

The One Group's own lead data (data/arlo_findings.json, 204 total findings) shows real estate is the **deepest existing foothold**:

| Vertical | Leads | Benchmark | Lead Magnet | Nurture Seq |
|----------|-------|-----------|-------------|-------------|
| **Real Estate** | **60** | ✅ built | ✅ built | ✅ built |
| HVAC | 49 | ✅ built | ✅ built | — |
| Medical | 26 | — | — | — |
| Accounting | 20 | ✅ built | — | — |
| Dental | 11 | — | — | — |

**Why RE wins over HVAC:**
1. **Most leads (60)** + highest concentration (82% high-intent, score 8+)
2. **Most built assets already** — benchmark report, lead magnet PDF, nurture sequence all exist
3. **Higher ticket / recurring** — real estate agents + property managers pay $300-1,500/mo for lead follow-up; the missed-call math ($1,200/call) is the perfect sales hook
4. **Two distinct buyer segments** to productize: (a) agent teams, (b) property managers (50-500 units)
5. **Less seasonal** than HVAC — RE lead flow is year-round, HVAC is weather-spiked

**The wedge (already proven):** "Did AI Just Steal Your Call?" lead magnet + "State of Real Estate in South Florida 2026" benchmark. These already exist and already position TOG as the local RE AI authority.

---

## The Product: "Lead Response AI" for South Florida Real Estate

**One workflow, deeply done** (per the vertical AI playbook — don't ship 10 features, own 1 workflow):
> **Instant lead response + follow-up for real estate agents & property managers.**

The single workflow: every inbound lead (call, text, web form, Zillow/Realtor.com) gets answered in <60 seconds, qualified, and booked — 24/7. Plus automated follow-up until the lead converts or opts out.

**Why this workflow:** It's the exact pain the existing lead magnet already speaks to (missed calls = $1,200 each). It's measurable (response time, booking rate, conversion). It's the #1 revenue leak in the vertical.

**Pricing (value-anchored, not seats):**
- **Starter:** $299/mo — AI answers missed calls + texts back in <5 min, books to calendar
- **Pro:** $599/mo — adds web form + Zillow/Realtor.com lead capture, 24/7, follow-up sequences
- **Property Manager tier:** $799/mo — adds tenant communication + maintenance intake + review responses
- **Setup fee:** $500-1,500 one-time (implementation)

**Target:** 20 paying clients at avg $500/mo = **$10k MRR / $120k ARR** by end of year 1. That's a strong cash business for a small agency.

---

## 90-Day Execution Plan

### Days 1-30: Validate + Productize (foundation)
**Goal:** Confirm the workflow with 3-5 paid pilots, lock the product scope.

- [ ] **Week 1:** Pick 3-5 existing RE contacts/leads from the 60-lead pool as paid pilot prospects. Offer "AI Visibility Audit" ($1,500) as the entry — they pay to see their own missed-call leak.
- [ ] **Week 1-2:** Build the core workflow on existing stack (n8n/Make + voice AI + calendar). One workflow: call → AI answer → qualify → book → follow-up.
- [ ] **Week 2-3:** Run 3-5 paid pilots at a discount ($199/mo intro) in exchange for testimonials + case-study data. Measure: response time, booking rate, missed-call recovery.
- [ ] **Week 3-4:** Productize the repeatable 80%. Package as Starter/Pro/PM tiers. Write the sales one-pager + demo script. Collect 2-3 written testimonials.

**Milestone:** 3-5 paying pilots live, product packaged, first case study drafted.

### Days 31-60: Launch + White-Label Engine (scale)
**Goal:** Public launch + sign 2-3 white-label agency partners.

- [ ] **Week 5:** Public launch. Push the existing lead magnet + benchmark report as the funnel. Email the 60-lead RE pool (they're already in the nurture sequence).
- [ ] **Week 5-6:** Sign 2-3 white-label partners (a web design firm, an MSP, a bookkeeper — non-competing agencies with SMB RE clients). Package "AI Starter" (receptionist + lead capture + follow-up) they resell under their brand.
- [ ] **Week 6-7:** Build the white-label fulfillment engine — standard onboarding, standard deployment, standard reporting. You're the OEM; they're the brand.
- [ ] **Week 7-8:** Add the observability/cost-control wedge (#3) as an upsell to every client — the "AI CFO" monthly report (cost, response time, bookings, ROI).

**Milestone:** 10 total clients (5 direct + 5 via partners), 2-3 white-label partners signed, observability upsell live.

### Days 61-90: Optimize + Compound (grow)
**Goal:** Hit 15-20 clients, refine pricing, build the template library.

- [ ] **Week 9-10:** Double down on the best channel (likely direct outbound to the 60-lead pool + partner referrals). Cut what's not converting.
- [ ] **Week 10-11:** Build the vertical template library (#4) from real deployments — package every client engagement into reusable RE-specific templates. Publish 5-10 free as SEO/lead magnets.
- [ ] **Week 11-12:** Raise prices on new signups (prove value first). Add the property-manager segment if agent teams are saturated.
- [ ] **Week 12:** Review: 15-20 clients, $8-10k MRR, 3-5 white-label partners, template library live. Decide: expand to HVAC (2nd vertical) or deepen RE.

**Milestone:** 15-20 clients, ~$10k MRR, white-label engine running, template library live.

---

## The Funnel (how it all connects)

```
Front door:  AI Readiness Audit ($1,500) + free RE benchmark/lead magnet
     ↓
Core:        Lead Response AI micro-SaaS ($299-799/mo)
     ↓
Scale:       White-label fulfillment for agencies (B2B2C)
     ↓
Sticky:      AI cost/observability "AI CFO" report (upsell)
     ↓
Compound:    Vertical template library (lead gen + productization)
```

---

## What NOT to do (guardrails)
- **Don't go horizontal** — no generic "AI for small business." Stay RE-specific.
- **Don't build a general agent marketplace** — two-sided cold-start, you'd lose.
- **Don't compete on "we do AI for local biz"** — 8+ SF competitors already there (red ocean).
- **Don't ship 10 features** — own the ONE lead-response workflow, do it deeply.
- **Don't skip the pilots** — validate with 3-5 paid clients before scaling.

---

## Immediate Next Steps (this week)
1. Pull the 60 RE leads from data/arlo_findings.json → shortlist 10 for pilot outreach
2. Draft the pilot offer email (AI Visibility Audit → Lead Response AI pilot)
3. Confirm the build stack (n8n/Make + voice AI + calendar) for the lead-response workflow
4. Decide: agent teams first, or property managers first? (Recommend: agent teams — bigger pool, faster sales)

---

*Prepared by Clawd for The One Group.AI — 2026-08-16*
