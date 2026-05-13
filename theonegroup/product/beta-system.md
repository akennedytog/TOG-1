# Beta Access System

**Version:** 1.0  
**Created:** 2026-03-14  
**Purpose:** Onboard first 10 users with white-glove experience

---

## Overview

The beta access system is designed to:
1. **Qualify** the right users (SMBs with clear automation needs)
2. **Onboard** them with personal attention
3. **Learn** from their usage and feedback
4. **Iterate** based on real-world use
5. **Document** success stories for future marketing

---

## The Funnel

```
Awareness (Twitter, communities)
    ↓
Interest (Landing page visit)
    ↓
Signup (Form submission)
    ↓
Qualification (Review submission)
    ↓
Selection (Choose 10 best fits)
    ↓
Onboarding (Discovery call)
    ↓
Activation (First automation live)
    ↓
Retention (Weekly check-ins)
    ↓
Success (Case study + referral)
```

---

## Landing Page Structure

### Hero Section
**Headline:** "AI Automation That Actually Works"  
**Subheadline:** "We build custom AI agents for SMBs. No code. No disruption. Just results."  
**CTA:** "Join the Beta" (button to form)

### Problem Section
- What you're doing now (manual, repetitive)
- What you could be doing (strategic, growth-focused)
- The gap (AI bridges it)

### How It Works
1. **Discovery Call** - We understand your workflow
2. **Custom Build** - We create your AI agent
3. **2-Week Trial** - You test with real work
4. **Iterate** - We refine based on feedback

### Social Proof
- Twitter growth metrics
- Engagement screenshots
- "Building in public" transparency

### FAQ
**Q: How much does it cost?**  
A: Beta is free. After beta, we'll have SMB-friendly pricing.

**Q: What can you automate?**  
A: Scheduling, email responses, data entry, lead qualification, reporting, and more. If it's repetitive and follows a pattern, we can automate it.

**Q: Do I need technical skills?**  
A: No. We handle the technical side. You just use it.

**Q: What if it doesn't work for me?**  
A: Beta is no-obligation. If it's not a fit, you keep the learnings, we keep the feedback.

### Signup Form Fields
- Name
- Email
- Business name
- Business type (dropdown: Service, E-commerce, SaaS, Agency, Other)
- Team size (1, 2-5, 6-10, 10+)
- Biggest time sink (text area)
- Current tools (text)
- Why now? (text)

---

## Waitlist Management

### Tool: Airtable

**Table Structure:**
| Field | Type | Notes |
|-------|------|-------|
| Name | Text | |
| Email | Email | |
| Business | Text | |
| Type | Single select | Service, E-com, SaaS, Agency, Other |
| Team Size | Single select | |
| Pain Point | Long text | Key for qualification |
| Current Tools | Long text | |
| Why Now | Long text | |
| Signup Date | Date | |
| Status | Single select | New, Reviewed, Selected, Rejected, Contacted |
| Fit Score | Number | 1-10 based on criteria |
| Notes | Long text | |
| Discovery Call | Date | |
| Onboarded | Checkbox | |
| Active | Checkbox | |
| NPS | Number | After 2 weeks |
| Case Study | Checkbox | |

### Qualification Criteria

**High Fit (8-10):**
- Clear, specific pain point
- Team of 2-10 people
- Already tried to solve it
- Willing to give feedback
- Decision maker

**Medium Fit (5-7):**
- Vague pain point but engaged
- Larger team (might be slower to adopt)
- Curious but not urgent

**Low Fit (1-4):**
- Just browsing
- No clear use case
- Expecting magic without effort
- Not decision maker

---

## Onboarding Flow

### Email 1: Welcome (Immediate)
```
Subject: You're on the list! 🎉

Hi [Name],

Thanks for signing up for TheOneGroupAI beta.

We're reviewing applications and will reach out to selected users within 48 hours.

In the meantime, follow us on Twitter [@TheOneGroupAI](link) where we're building in public.

Questions? Just reply to this email.

— Alec & Clawd
```

### Email 2: Selected (Within 48h if chosen)
```
Subject: You're in! Let's schedule your discovery call

Hi [Name],

Great news — you've been selected for our beta program!

Here's what happens next:
1. Book a 15-min discovery call: [Calendly link]
2. We'll understand your workflow
3. We'll build your custom AI agent
4. You'll test it for 2 weeks

Book your call here: [link]

Excited to work with you!

— Alec
```

### Email 3: Discovery Call Confirmation
```
Subject: Discovery call confirmed — [Date] at [Time]

Hi [Name],

You're all set for our call on [Date] at [Time].

We'll discuss:
- Your current workflow
- Your biggest time sinks
- What success looks like for you

No prep needed — just bring your questions.

[Calendar invite attached]

— Alec
```

### Email 4: Post-Discovery (Within 24h)
```
Subject: Your custom AI agent — next steps

Hi [Name],

Thanks for the great conversation today.

Based on what you shared, here's what we're building:

**Your Automation:** [Summary]
**Timeline:** Live by [Date]
**Your Tasks:** [What they need to do]
**Our Tasks:** [What we'll do]

Questions? Just reply.

— Alec
```

### Email 5: Go-Live
```
Subject: Your AI agent is ready! 🚀

Hi [Name],

Your custom automation is live and ready to test.

**Access:** [Link]
**Quick start guide:** [Link]
**Support:** Reply to this email or DM [@TheOneGroupAI](link)

We'll check in on Day 3 and Day 7. But don't wait — if you hit any issues, reach out immediately.

Let's see what this thing can do!

— Alec
```

### Email 6: Week 2 Check-in
```
Subject: Week 2 check-in — how's it going?

Hi [Name],

You've been using your AI agent for 2 weeks now.

Quick questions:
1. What's working well?
2. What's frustrating?
3. What would make this 10x better?

[Optional: Quick survey link]

Also: Would you be open to a brief case study? No pressure — just want to share real results.

— Alec
```

---

## Success Metrics

### Activation Metrics
- Time to first automation: < 3 days
- First week usage: > 5 interactions
- Support tickets: < 2 per user

### Retention Metrics
- Week 2 active: > 70%
- Week 4 active: > 50%
- NPS: > 50

### Learning Metrics
- Feedback sessions completed: 10/10
- Feature requests documented: Track all
- Bugs reported: Track and fix < 24h
- Case studies secured: > 3

---

## Feedback Collection

### Weekly Check-in Questions
1. How many hours did this save you this week?
2. What worked better than expected?
3. What was frustrating?
4. What feature would you add?
5. Would you pay for this? How much?

### Exit Interview (if churning)
1. What made you stop using it?
2. What would have kept you?
3. Would you recommend it to others? Why/why not?

---

## Documentation

Every beta user gets a dedicated file:

`product/beta-users/[business-name].md`

Contents:
- Business profile
- Pain point
- Solution built
- Usage metrics
- Feedback log
- Outcome

---

## Iteration Plan

**After User 3:** Review patterns, adjust onboarding  
**After User 7:** Identify common features, prioritize  
**After User 10:** Full retrospective, plan v1.0

---

*Documented by: Clawd (AI assistant) on 2026-03-14*
