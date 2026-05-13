# AI Visibility Audit - Industry-Specific Recommendations
## Quick Reference for Common Industries

---

## HVAC / PLUMBING / ELECTRICAL

### Common Issues
- No LocalBusiness schema
- Missing service area definitions
- No emergency service markup
- Weak Google Business Profile

### Priority Fixes
1. **Add LocalBusiness schema** with:
   - `@type: HVACBusiness` or `Plumber` or `Electrician`
   - Service area (cities/counties)
   - Emergency service hours
   - Price range

2. **Google Business Profile optimization:**
   - Add all services (AC repair, furnace install, etc.)
   - Upload before/after photos
   - Get 10+ reviews
   - Post weekly updates

3. **Citation building:**
   - Angi (formerly Angie's List)
   - HomeAdvisor
   - Thumbtack
   - Yelp
   - BBB
   - Local Chamber of Commerce

### AI Search Query Examples
"Best HVAC company in [city]"
"Emergency plumber near me"
"AC repair [city] reviews"

### Expected Results
- 40-60% improvement in 60 days
- More "near me" queries
- Higher intent leads (emergency calls)

---

## LEGAL SERVICES

### Common Issues
- No Attorney schema
- Missing practice area markup
- Weak entity recognition (just "law firm")
- No review presence on legal sites

### Priority Fixes
1. **Add Attorney schema** with:
   - `@type: Attorney`
   - Practice areas (Personal Injury, Family Law, etc.)
   - Bar association memberships
   - Languages spoken

2. **Entity clarity:**
   - Specific practice areas on homepage
   - Attorney bios with credentials
   - Case result highlights

3. **Citation building:**
   - Avvo
   - Martindale-Hubbell
   - FindLaw
   - Justia
   - Lawyers.com
   - State bar directory

### AI Search Query Examples
"Best personal injury lawyer in [city]"
"Divorce attorney near me"
"Criminal defense lawyer [city] reviews"

### Expected Results
- 50-70% improvement in 60 days
- Higher quality leads (specific practice area)
- Better pre-qualified prospects

---

## MEDICAL / DENTAL

### Common Issues
- No Physician/Dentist schema
- Missing insurance acceptance markup
- Weak location signals
- HIPAA concerns (limited content)

### Priority Fixes
1. **Add Physician/Dentist schema** with:
   - `@type: Physician` or `Dentist`
   - Medical specialty
   - Insurance accepted
   - Hospital affiliations

2. **Content strategy:**
   - Service pages for each procedure
   - FAQ schema for common questions
   - Before/after galleries (with consent)

3. **Citation building:**
   - Healthgrades
   - ZocDoc
   - WebMD
   - Vitals
   - RateMDs
   - RealSelf (for cosmetic)

### AI Search Query Examples
"Best dentist in [city]"
"Emergency dentist near me"
"Pediatrician [city] accepting new patients"

### Expected Results
- 30-50% improvement in 60 days
- More appointment bookings
- Better patient education

---

## RESTAURANT / FOOD SERVICE

### Common Issues
- No Restaurant schema
- Missing menu markup
- Weak review presence
- No reservation system integration

### Priority Fixes
1. **Add Restaurant schema** with:
   - `@type: Restaurant`
   - Menu items with prices
   - Cuisine type
   - Hours of operation
   - Accepts reservations

2. **Google Business Profile:**
   - Menu photos
   - Popular dishes
   - Reservation link
   - Order online link

3. **Citation building:**
   - Yelp
   - OpenTable
   - TripAdvisor
   - Grubhub/DoorDash/Uber Eats
   - Local food blogs

### AI Search Query Examples
"Best Italian restaurant in [city]"
"Romantic dinner near me"
"Brunch spots [city]"

### Expected Results
- 60-80% improvement in 60 days
- More reservations
- Higher foot traffic

---

## REAL ESTATE

### Common Issues
- No RealEstateAgent schema
- Missing property listings markup
- Weak local market content
- No neighborhood pages

### Priority Fixes
1. **Add RealEstateAgent schema** with:
   - `@type: RealEstateAgent`
   - Areas served
   - Specialties (luxury, commercial, etc.)
   - Languages spoken

2. **Content strategy:**
   - Neighborhood guides
   - Market reports
   - Buyer/seller resources
   - Local school information

3. **Citation building:**
   - Zillow
   - Realtor.com
   - Trulia
   - Redfin
   - Local MLS
   - Chamber of Commerce

### AI Search Query Examples
"Best real estate agent in [city]"
"Homes for sale in [neighborhood]"
"Top realtor [city] reviews"

### Expected Results
- 50-70% improvement in 60 days
- More listing inquiries
- Better qualified buyers

---

## CONSULTING / AGENCY

### Common Issues
- No ProfessionalService schema
- Vague service descriptions
- Weak thought leadership
- No case studies

### Priority Fixes
1. **Add ProfessionalService schema** with:
   - `@type: ProfessionalService`
   - Specific services offered
   - Industries served
   - Pricing model (if public)

2. **Content strategy:**
   - Case studies with results
   - Industry-specific landing pages
   - Thought leadership blog
   - Client testimonials

3. **Citation building:**
   - Clutch.co
   - GoodFirms
   - UpCity
   - LinkedIn
   - Industry directories
   - Speaking engagements

### AI Search Query Examples
"Best marketing agency in [city]"
"Business consultant near me"
"Top [industry] consulting firm"

### Expected Results
- 40-60% improvement in 60 days
- Higher value clients
- Better project fit

---

## RETAIL / E-COMMERCE

### Common Issues
- No Product schema
- Missing store location markup
- Weak local SEO
- No inventory markup

### Priority Fixes
1. **Add Product schema** with:
   - `@type: Product`
   - Price and availability
   - Reviews
   - Brand

2. **For physical stores:**
   - Store schema with hours
   - Inventory availability
   - Local pickup options

3. **Citation building:**
   - Google Shopping
   - Yelp
   - Local directories
   - Industry-specific sites

### AI Search Query Examples
"Best [product] store near me"
"Where to buy [product] in [city]"
"[Product] reviews and prices"

### Expected Results
- 50-70% improvement in 60 days
- More store visits
- Higher online sales

---

## HOME SERVICES (Cleaning, Landscaping, etc.)

### Common Issues
- No LocalBusiness schema
- Missing service area
- Weak before/after content
- No pricing transparency

### Priority Fixes
1. **Add LocalBusiness schema** with:
   - `@type: LocalBusiness`
   - Specific services (cleaning, landscaping, etc.)
   - Service area radius
   - Pricing estimates

2. **Content strategy:**
   - Before/after galleries
   - Service area pages
   - Seasonal tips
   - Customer stories

3. **Citation building:**
   - Yelp
   - HomeAdvisor
   - Thumbtack
   - TaskRabbit
   - Nextdoor
   - Local Facebook groups

### AI Search Query Examples
"Best house cleaning service in [city]"
"Landscaping company near me"
"Affordable lawn care [city]"

### Expected Results
- 60-80% improvement in 60 days
- More recurring customers
- Higher job values

---

## QUICK REFERENCE: SCHEMA TYPES BY INDUSTRY

| Industry | Primary Schema | Secondary Schemas |
|----------|---------------|-------------------|
| HVAC | HVACBusiness | LocalBusiness, Service |
| Plumbing | Plumber | LocalBusiness, Service |
| Electrical | Electrician | LocalBusiness, Service |
| Legal | Attorney | LegalService, Organization |
| Medical | Physician | MedicalBusiness, Hospital |
| Dental | Dentist | MedicalBusiness |
| Restaurant | Restaurant | FoodEstablishment, Menu |
| Real Estate | RealEstateAgent | Organization, Place |
| Consulting | ProfessionalService | Organization |
| Retail | Store | LocalBusiness, Product |
| Home Services | LocalBusiness | Service, Organization |

---

## QUICK REFERENCE: TOP CITATION SOURCES BY INDUSTRY

### Home Services
1. Angi (Angie's List)
2. HomeAdvisor
3. Thumbtack
4. Yelp
5. BBB
6. Houzz (for design/build)

### Legal
1. Avvo
2. Martindale-Hubbell
3. FindLaw
4. Justia
5. Lawyers.com
6. State bar directory

### Medical
1. Healthgrades
2. ZocDoc
3. WebMD
4. Vitals
5. RateMDs
6. Hospital affiliations

### Restaurant
1. Yelp
2. OpenTable
3. TripAdvisor
4. Google Business Profile
5. Grubhub/DoorDash
6. Local food blogs

### Real Estate
1. Zillow
2. Realtor.com
3. Trulia
4. Redfin
5. Local MLS
6. Chamber of Commerce

### Consulting
1. Clutch.co
2. GoodFirms
3. UpCity
4. LinkedIn
5. Industry directories
6. Speaking engagements

---

## INDUSTRY-SPECIFIC AI SEARCH PATTERNS

### High-Intent Queries (Prioritize These)

**Home Services:**
- "Emergency [service] near me"
- "Best [service] in [city]"
- "[Service] reviews [city]"
- "Affordable [service] near me"

**Legal:**
- "Best [practice area] lawyer in [city]"
- "Top rated [practice area] attorney"
- "[Practice area] lawyer free consultation"
- "How much does [service] cost"

**Medical:**
- "Best [specialty] in [city]"
- "[Specialty] accepting new patients"
- "[Specialty] near me that takes [insurance]"
- "Emergency dentist open now"

**Restaurant:**
- "Best [cuisine] restaurant in [city]"
- "Romantic dinner near me"
- "[Cuisine] restaurant with outdoor seating"
- "Brunch spots [city]"

**Real Estate:**
- "Best realtor in [city]"
- "Top real estate agent [neighborhood]"
- "Homes for sale in [area]"
- "Best time to sell house in [city]"

---

Last updated: March 19, 2026
Version: 1.0
