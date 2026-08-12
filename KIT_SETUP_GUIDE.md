# Kit Setup Guide — Load the AI Visibility Score Nurture Sequence
## For The One Group.AI (Alec Kennedy) — August 2026

*Step-by-step to get the 5-email nurture sequence (NURTURE_SEQUENCE.md) live on Kit's free plan (10,000 subscribers, $0/mo). Total time: ~30-45 min once, then ongoing.*

---

## What you're building

A free lead-capture funnel:
```
[AI Visibility Score page] → [Kit form] → [5-email nurture] → [Book $2,500 audit]
```

The Kit form is the **email-capture gate**. People enter their email → land in the sequence → get the score report, case study, AI snapshot, audit pitch, and final push.

---

## Step 1 — Create the Kit account (free)

1. Go to **kit.com** → **Sign up free**.
2. Pick the **Newsletter (free)** plan. Confirm: free = **10,000 subscribers, unlimited-ish sends** (as of 2026).
3. Fill in your sender details:
   - **From name:** The One Group.AI
   - **From email:** akennedy@theonegroup.info
   - **Reply-to:** akennedy@theonegroup.info
4. Verify your email. Done — that's the whole account setup.

---

## Step 2 — Create your form (the capture gate)

1. In Kit, go to **Forms → New Form**.
2. Choose a **"Subscribe" / single-field form** (email + optional name).
3. Name it: **AI Visibility Score Lead Capture**.
4. Add fields:
   - **Email** (required)
   - **Name** (optional, first name — used in the emails as `[First]`)
   - **Custom field: Industry** (dropdown: Real Estate / HVAC / Plumbing / Accounting / Restaurant / Medical / Home Services / Other) — this drives the industry-matched P.S.
   - **Custom field: City** (text) — from the score tool.
5. **Set the "success" behavior:** after submit, show a thank-you + link to the score breakdown page (or auto-send Email #1 with the score).

> 💡 **Two ways to capture:** (A) embed the Kit form directly on the AI Visibility Score page, OR (B) let the Google Apps Script backend push the lead to Kit via API (see Step 6). Option B is cleaner if the score tool already collects the data.

---

## Step 3 — Create the custom fields

In **Settings → Custom Fields**, add:
- `First` (text)
- `Company` (text)
- `City` (text)
- `Industry` (single-select: Real Estate / HVAC / Plumbing / Accounting / Restaurant / Medical / Home Services / Other)
- `Score` (number) — from the AI Visibility Score tool

These map to the `[First]`, `[City]`, `[Score]`, `[Industry]` placeholders in the emails.

---

## Step 4 — Build the 5-email automation

1. Go to **Automations → New Automation**.
2. Trigger: **Subscriber added to form** "AI Visibility Score Lead Capture".
3. Add the 5 emails from `NURTURE_SEQUENCE.md` with these delays:

| Step | Delay | Subject | Content source |
|------|-------|---------|----------------|
| 1 | **Instant** (0 min) | Your AI Visibility Score: [Score]/100 | Email 1 |
| 2 | **+1 day** | Did AI just steal one of your calls? | Email 2 |
| 3 | **+3 days** | What AI is telling customers about you right now | Email 3 |
| 4 | **+5 days** | The fix that pays for itself in 3 weeks | Email 4 |
| 5 | **+8 days** | Last call, [First] — your score expires soon | Email 5 |

4. For each email, paste the body and swap in placeholders using Kit's **personalization** (`{{ subscriber.first_name }}`, `{{ custom.score }}`, etc.).
5. **P.S. logic (important):** Use Kit's **conditional content** or **tags** so the P.S. auto-matches industry:
   - Create 9 tags: `ps-real-estate`, `ps-hvac`, `ps-plumbing`, `ps-accounting`, `ps-restaurant`, `ps-medical`, `ps-home-services`, `ps-insurance`, `ps-salon`.
   - Or simpler: make the P.S. a **separate snippet** and use an if/else rule on `Industry`. For v1, you can paste the generic core P.S. everywhere and upgrade later.

6. **Email 4 + 5 CTA** → link to your audit booking page (Calendly). Paste the Calendly URL in both.
7. **Email 3** → the "reply snapshot" line: set up so replying with "snapshot" triggers a tag (see Step 5).

---

## Step 5 — Optional: the "snapshot" reply trigger

Email 3 invites leads to reply "snapshot" for a free AI Reputation Snapshot.
1. In **Automations**, add a rule: **When subscriber replies to Email 3 with "snapshot"** → add tag `wants-snapshot`.
2. That tag can trigger a follow-up automation sending the snapshot (you can use the benchmark report or a per-lead AI snapshot as the deliverable).
3. Set expectations: you'll fulfill these manually at first (Alec reviews), then automate later.

---

## Step 6 — Connect the AI Visibility Score tool to Kit (API)

Once the score tool's Google Apps Script backend is deployed:
1. In Kit, get your **API key** (Settings → Advanced → API).
2. In the Apps Script (`ai-visibility-score-backend.gs`), set the Kit API key + form ID as script properties.
3. The script then: on form submit → compute score → **create/update the subscriber in Kit** (with industry, city, score) → this drops them into the nurture automation automatically.
4. Test end-to-end: submit the form with a test email, confirm it lands in Kit and triggers Email #1.

> **If you don't want the API integration yet:** just embed the Kit form on the page instead (Step 2A). The form itself captures the email and starts the sequence — the script integration just removes the need to type data twice.

---

## Step 7 — CAN-SPAM compliance (required before sending)

Kit adds these automatically, but verify:
- ✅ Unsubscribe link (Kit auto-appends)
- ✅ Physical mailing address (add in Settings → Branding) — required by CAN-SPAM
- ✅ Clear from-name + reply-to (done in Step 1)
- ✅ A plain-text version of each email (Kit auto-generates)

---

## Step 8 — Test & launch

1. **Send yourself a test** of each email (Kit has a send-test button).
2. Verify: placeholders fill correctly, P.S. matches industry, Calendly links work, unsubscribe renders.
3. **A/B test subjects** (optional): Email 1 subject — "Your AI Visibility Score: [Score]/100" vs "Your [City] [Industry] AI Score". Pick the winner after ~50 sends.
4. Turn the automation **live**.
5. Point traffic: the score tool page CTA, pinned X post, Facebook/Nextdoor/Reddit placements (funnel doc §4).

---

## Quick checklist

- [ ] Kit account created (free)
- [ ] Sender identity set
- [ ] Form "AI Visibility Score Lead Capture" created
- [ ] Custom fields added (First, Company, City, Industry, Score)
- [ ] 5-email automation built with delays
- [ ] P.S. industry-matching set up
- [ ] Calendly links on emails 4 & 5
- [ ] "snapshot" reply trigger (optional)
- [ ] API connection from score backend (optional)
- [ ] CAN-SPAM: unsubscribe + address verified
- [ ] Test sends all 5 clean
- [ ] Automation LIVE + traffic pointing

---

*This pairs with `NURTURE_SEQUENCE.md` (the actual email copy) and `lead_magnet_funnel.md` (the strategy + distribution). All in the OpenClaw-Deliverables / lead-magnet folder.*
