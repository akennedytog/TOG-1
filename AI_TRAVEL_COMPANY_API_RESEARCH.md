# Travel Booking API Landscape - Research Summary

## Executive Summary

The travel booking API ecosystem is mature but fragmented. Your AI travel company concept is **technically feasible** but requires navigating multiple API partnerships, varying access levels, and significant integration complexity.

---

## 1. FLIGHT BOOKING APIs

### Major GDS (Global Distribution Systems)

#### **Amadeus** ⭐ RECOMMENDED FOR STARTUPS
- **What:** Largest GDS, 43% global market share
- **API Access:** Self-Service APIs (REST/JSON) - perfect for startups
- **Cost:** Free tier: 2,000 API calls/month, then pay-as-you-go
- **Coverage:** Global flights, hotels, cars
- **Pros:** 
  - Self-service sign-up (no sales call)
  - Modern REST APIs
  - Good documentation
- **Cons:** 
  - Limited to "self-service" features (basic booking)
  - Full GDS access requires enterprise contract
- **Docs:** https://developers.amadeus.com

#### **Sabre**
- **What:** Second largest GDS, strong US presence
- **API Access:** Requires partnership agreement
- **Cost:** Enterprise pricing (varies by volume)
- **Coverage:** Flights, hotels, cars
- **Pros:** Strong airline relationships
- **Cons:** Requires sales process, longer to get started
- **Docs:** https://developer.sabre.com

#### **Travelport (Galileo/Worldspan)**
- **What:** Universal API for flights, hotels, cars
- **API Access:** Requires agreement
- **Coverage:** Global, strong in Europe/Asia
- **Cons:** More complex integration

### Alternative Flight APIs

**Kiwi.com** - Aggregator, self-service, budget flights
**Skyscanner** - Affiliate model, price comparison
**Duffel** - Modern API, startup-friendly, instant access

**Duffel** is worth noting - it's a newer company that offers a clean, modern API with instant access. They abstract the GDS complexity.

---

## 2. HOTEL BOOKING APIs

#### **Booking.com Affiliate Program** ⭐ RECOMMENDED
- **What:** World's largest hotel inventory (30M+ properties)
- **API Access:** Affiliate program (application required)
- **Revenue Model:** Commission-based (typically 4-6%)
- **Pros:** Massive inventory, trusted brand
- **Cons:** Application process, commission only
- **Docs:** https://developers.booking.com

#### **Expedia Rapid API** ⭐ RECOMMENDED
- **What:** 700K+ properties, strong in US
- **API Access:** Self-service + partnership tiers
- **Revenue Model:** Commission or markup pricing
- **Pros:** Good US coverage, multiple pricing models
- **Docs:** https://developers.expediagroup.com

#### **Hotelbeds**
- **What:** B2B hotel wholesaler
- **API Access:** Requires partnership
- **Revenue Model:** Net rates (you set margin)
- **Pros:** Better margins
- **Cons:** Requires volume commitment

#### **Airbnb API**
- **API Access:** VERY restricted (invitation only)
- **Reality:** Only for large partners

---

## 3. RESTAURANT RESERVATION APIs

#### **OpenTable**
- **What:** Largest restaurant reservation platform (60K+ restaurants)
- **API Access:** RESTRICTED - requires partnership
- **Challenge:** They gatekeep API access heavily
- **Options:**
  1. Affiliate Links - redirect to OpenTable
  2. Partner API - requires volume
- **Docs:** https://docs.opentable.com

#### **Resy** (American Express)
- **What:** 25K+ restaurants, premium focus
- **API Access:** Limited public API
- **Challenge:** Enterprise-focused
- **Status:** Merging Tock into platform

### Restaurant API Reality Check ⚠️

**This is your hardest problem.** Restaurant reservation APIs are:
- Heavily gatekept
- Fragmented
- Require direct partnerships

### Workaround Strategies

1. **Deep Linking**: Send users to OpenTable/Resy
2. **Concierge Model**: AI recommends, human books
3. **Direct Partnerships**: Work with restaurant groups

---

## 4. EXPERIENCES APIs

**GetYourGuide** - Tours, activities (80K+ experiences)
**Viator** - TripAdvisor-owned experiences
**Tiqets** - Museum tickets, attractions

---

## 5. RECOMMENDED API STACK FOR MVP

### Phase 1: MVP (Months 1-3)

| Category | API | Why |
|----------|-----|-----|
| **Flights** | Amadeus Self-Service | Free tier, instant access |
| **Hotels** | Booking.com Affiliate | Massive inventory |
| **Restaurants** | Deep links | No API needed |
| **Experiences** | GetYourGuide | Easy integration |

---

## 6. COST ESTIMATES

### Free Tier (MVP)
- Amadeus: 2,000 calls/month free
- Booking.com: Commission only
- OpenTable: Free (deep links)
- **Total:** $0/month + commissions

### Scale (10K users/month)
- Amadeus: ~$500-1,000/month
- Hotelbeds: Net rates
- **Total:** $1,000-3,000/month

---

## 7. KEY RISKS

1. **Restaurant API Access** - Biggest blocker
2. **GDS Contracts** - Full booking requires partnerships
3. **Commission Squeeze** - Need volume for profit
4. **Payment Flow** - Holding funds = regulatory complexity
5. **Error Handling** - Customer service burden

---

## 8. COMPETITIVE MOAT

| Feature | Mindtrip | Your Concept |
|---------|----------|--------------|
| AI planning | Yes | Yes |
| Flight booking | No | Yes |
| Hotel booking | Partial | Yes |
| Restaurant booking | No | Yes (goal) |
| End-to-end | No | Yes |

**Your moat:** Actually executing bookings, not just suggesting.

---

## 9. NEXT STEPS

### Immediate (This Week)
1. Sign up for Amadeus Self-Service API (free)
2. Apply for Booking.com Affiliate Program
3. Research Duffel as flight alternative

### Key Questions
1. Will users trust AI to book without approval?
2. What's acceptable commission margin?
3. Is restaurant booking must-have for MVP?

---

## 10. RESOURCE LINKS

- Amadeus: https://developers.amadeus.com
- Duffel: https://duffel.com
- Booking.com: https://developers.booking.com
- Expedia: https://developers.expediagroup.com
