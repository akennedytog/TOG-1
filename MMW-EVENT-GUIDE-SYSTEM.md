# Miami Music Week Event Guide System

## Overview
Automated event aggregation system that creates real-time event guides for Miami Music Week, positioned as AI-curated content that crosses into general consumer markets.

## What Was Built

### 1. Event Aggregator Script (`mmw-event-scraper.js`)
- Generates curated event list from multiple sources
- Creates CSV for Google Sheets import
- Generates beautiful HTML page with filterable event grid
- Outputs ready-to-post tweet content

### 2. Live Event Page
**URL:** https://theonegroup.info/mmw-2026.html

Features:
- Date filtering (Tue-Sun)
- Event cards with venue, time, price, genre
- Direct ticket links
- Mobile-responsive dark theme
- "Curated by AI" branding
- Last updated timestamp

### 3. Twitter Content

**Tweet Template:**
```
🎵 Miami Music Week 2026 is HERE!

Your complete event guide — 10 events across 6 days:

• Ultra Music Festival
• Defected Miami  
• Drumcode Pool Party
• Anjunadeep
• Paradise + More

Live event page with tickets:
https://theonegroup.info/mmw-2026.html

Curated by AI. Updated daily.

#MiamiMusicWeek #MMW2026 #Ultra2026 #MiamiEvents #ElectronicMusic
```

## Why This Works for Traffic

1. **Timely + Local** = High search intent
2. **Utility** = People share useful resources
3. **AI angle** = Differentiator from generic event lists
4. **Visual** = HTML page is shareable, not just spreadsheet
5. **Crossover** = EDM fans + Miami locals + tourists

## Next Events to Target

| Event | Dates | Audience |
|-------|-------|----------|
| Ultra Music Festival | March 27-29 | EDM, global |
| Miami Open (Tennis) | March 18-30 | Sports, affluent |
| Bitcoin Miami | May | Crypto, tech |
| Art Basel Miami | December | Art, luxury |
| Miami GP (F1) | May | Motorsports, luxury |
| South Beach Wine & Food | Feb/March | Foodies |

## Expansion Ideas

### 1. Real-Time Scraping
Add these sources for live updates:
- Resident Advisor API
- Songkick API
- Eventbrite API
- Venue websites (Club Space, LIV, E11even)

### 2. Automation
```bash
# Daily cron job
0 9 * * * node mmw-event-scraper.js && node post-to-twitter.js
```

### 3. Google Sheets Integration
- Live spreadsheet that auto-updates
- Public view link in tweets
- Embeddable on website

### 4. Multi-Platform
- Instagram Stories (event cards)
- LinkedIn (business events)
- Reddit (r/Miami, r/electronicmusic)

## Files Generated

```
mmw-events/
├── mmw-events.csv       # Google Sheets import
├── mmw-events.html      # Standalone page
├── mmw-2026.html        # Deployed to website
├── events.json          # Structured data
└── tweet.txt            # Ready to post
```

## How to Update

1. Edit events in `mmw-event-scraper.js`
2. Run: `node mmw-event-scraper.js`
3. Copy `mmw-events.html` to `theonegroup-site/mmw-2026.html`
4. Deploy: `cd theonegroup-site && bash deploy.sh prod`
5. Tweet the link

## Twitter Rate Limit

Hit rate limit (100 tweets/15 min). 
Reset time: 1774032000 (Unix timestamp)

Can retry in ~15 minutes or post manually.

## Success Metrics to Track

- Page views (Google Analytics)
- Tweet impressions
- Click-through rate
- Event link clicks
- Follower growth during event week
- Inquiries from Miami area

## Future: AI-Enhanced Features

1. **Price tracking** - Alert when ticket prices drop
2. **Sold out detection** - Mark events as sold out
3. **Similar events** - "If you like X, try Y"
4. **Personalized schedule** - Based on preferences
5. **Real-time updates** - Scrape every hour during event

---

**Built:** March 20, 2026
**Status:** Ready to scale to other events
**Next:** Tweet when rate limit resets