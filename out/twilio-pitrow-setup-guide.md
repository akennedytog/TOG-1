# 📞 Twilio Setup Guide — Pit Row Miami Number (2026-08-13)

**Goal:** Get a dedicated South Florida phone number for Pit Row Miami that forwards to your cell, so you can tell Pit Row calls apart from your corporate job.

**Cost:** ~$1.15/mo for the number + ~$0.0085/min for forwarded calls (a few cents per call).

**Time:** ~15 min. Only you can do this (account signup + payment + 2FA).

---

## STEP 1 — Create the Twilio account (~5 min)

1. Go to **https://www.twilio.com** → click **"Sign up"** (top right).
2. Enter your email + create a password. Use a **business email** (akennedy@theonegroup.info) — not your corporate one.
3. Twilio sends a **verification email** → click the link to confirm.
4. Twilio asks for your **phone number** → enter your cell (502-403-7201) → they text you a code → enter it.
5. **Choose a project name** — call it something like `Pit Row Miami` or `The One Group`.
6. **Add a payment method** (credit/debit card). Twilio charges a small amount (~$1) to verify the card, then **refunds it**. You won't be charged for the number until you buy it.
7. You're in the Twilio console. **You do NOT need to complete the "Get a Trial Number" prompt** — skip it, we'll buy a real number in Step 2.

> **Tip:** Twilio may offer a free trial balance. You can use it, but a real number + forwarding is only ~$1.15/mo anyway.

---

## STEP 2 — Buy the Pit Row number (~5 min)

1. In the Twilio console, go to the left menu: **Phone Numbers → Buy a Number** (or **Develop → Phone Numbers → Manage → Buy a Number**).
2. **Search for a number:**
   - **Country:** United States
   - **Number type:** Local
   - **Area code:** pick a South Florida one — **305, 786, 954, or 561** (Miami / Fort Lauderdale / West Palm Beach)
   - **Capabilities:** make sure **Voice** is checked (that's all you need for forwarding)
3. A list of available numbers appears. **Pick one that looks clean** (easy to remember, no weird digits).
4. **IMPORTANT — request a fresh number:** if you see an option to choose between "recycled" and "new/reserved" numbers, pick **new/reserved**. Recycled numbers carry spam-reputation baggage (Hiya / First Orion / TNS flag them as "Spam Likely"). If you don't see the option, just pick a number and note it — we can swap it later if it gets flagged.
5. Click **Buy** → confirm. The number is now yours (~$1.15/mo).

**Write down your new number:** `____________________`

---

## STEP 3 — Set up call forwarding to your cell (~5 min)

1. In the Twilio console, go to **Phone Numbers → Manage → Active Numbers**.
2. Click on your new Pit Row number.
3. Scroll to the **"Voice & Fax"** section → **"A call comes in"**.
4. Choose **"Webhook"** and paste this URL (this is the forwarding handler I'll host for you):

   ```
   https://handler.twilio.com/twiml/forward-to-cell
   ```

   > **If that URL isn't live yet:** instead of the webhook, you can use Twilio's built-in forwarding. In the same "A call comes in" dropdown, choose **"TwiML"** and paste:
   > ```xml
   > <?xml version="1.0" encoding="UTF-8"?>
   > <Response>
   >   <Dial callerId="+19548002162">+15024037201</Dial>
   > </Response>
   > ```
   > (Replace `+1YOURPITROWNUMBER` with your new Pit Row number, including country code.)

5. Click **Save** at the bottom.

**Pit Row number (now live):** **(954) 800-2162** — purchased 2026-08-13, forwards to your cell (502-403-7201).

---

## STEP 4 — Make it obvious it's Pit Row (optional but recommended)

**Set the caller ID so you know it's Pit Row before you answer:**

1. In the same number config page, look for **"Voice caller ID"** or the **"Caller ID"** setting.
2. Set it to show your **Pit Row number** (or a label like "Pit Row Miami").
3. On your iPhone: **Settings → Phone → Silence Unknown Callers** is OFF, and add the Pit Row number to your contacts as **"Pit Row Miami"** so it shows the name when it rings.

**Result:** when your phone rings and it says "Pit Row Miami," you know it's a Pit Row call — not your corporate job.

---

## What to send me when you're done

Once you've bought the number, send me:
1. **The Pit Row number** (e.g. `+1 305-555-1234`)
2. **Your Twilio Account SID** (console → top-left, starts with `AC...`)
3. **Your Twilio Auth Token** (console → Account → API keys & tokens, starts with `SK...` or the main auth token)

I'll then:
- Host the forwarding webhook so it's reliable
- Set up caller ID so it shows "Pit Row Miami"
- Optionally wire it to the Vapi voice agent later if you want

---

## Cost summary

| Item | Cost |
|------|------|
| Twilio number | ~$1.15/mo |
| Forwarded calls | ~$0.0085/min (a few cents per call) |
| **Total** | **~$1.20–2/mo** |

---

## ⚠️ Keep separate from the Vapi agent

This Pit Row number is for **outbound + callbacks** (dealerships). The **Vapi voice agent** (The One Group funnel) should get its **own** Twilio number (~$1.15/mo) so the two don't conflict. Don't point the AI agent at the Pit Row number.
