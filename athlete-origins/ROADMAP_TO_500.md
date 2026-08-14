# Roadmap to 500 Profiles

## Current Status: 93 Profiles ✅

### Batch 1 (60 profiles)
- Athletes turned actors
- Musicians who played sports
- Actors with athletic backgrounds

### Batch 2 (33 profiles)
- More athletes/actors
- MLB/NFL dual-sport athletes
- Comedians with sports backgrounds

## Remaining: 407 Profiles

### Batch 3: Olympic Athletes (50 profiles)
- Olympic medalists who became actors/media
- Track stars, gymnasts, swimmers
- Winter Olympians

### Batch 4: Female Celebrities (75 profiles)
- Actresses who played sports
- Female musicians/athletes
- Sports anchors/reporters

### Batch 5: International Stars (50 profiles)
- Soccer players turned celebrities
- Cricket, rugby, Aussie Rules backgrounds
- European athletes/actors

### Batch 6: Coaches & Executives (50 profiles)
- Former players turned coaches
- Sports executives (GM, owners)
- Broadcasters with playing backgrounds

### Batch 7: Business Leaders (50 profiles)
- CEOs who played college/pro sports
- Tech founders with athletic backgrounds
- Wall Street with sports pasts

### Batch 8: Politicians (32 profiles)
- Politicians who played sports
- Presidents/PMs with athletic backgrounds
- Governors, Senators

### Batch 9: Miscellaneous (50 profiles)
- Models who were athletes
- Authors with sports backgrounds
- Chefs, doctors, other professions

## Data Collection Strategy

### Automated Scraping Sources:
1. **Wikipedia Categories**
   - "American football players turned actors"
   - "NBA players from California"
   - "Baseball players turned broadcasters"

2. **Sports Reference Sites**
   - Pro-Football-Reference.com
   - Basketball-Reference.com
   - Baseball-Reference.com

3. **Celebrity Databases**
   - Famous Birthdays (with sports filter)
   - IMDb (biography sections)
   - TMZ sports backgrounds

4. **Manual Research**
   - ESPN 30 for 30 documentaries
   - Sports Illustrated features
   - Athlete autobiographies

## Quality Standards

### Required Fields:
- ✅ Name (verified)
- ✅ High School Name
- ✅ Hometown
- ✅ Sport(s) Played
- ✅ Position (if applicable)
- ✅ Notable Achievement(s)
- ✅ What If Analysis
- ✅ Viral Angle (hook for social)

### Data Verification:
- Cross-reference at least 2 sources
- Wikipedia preferred
- Local newspaper archives
- School hall of fame records

## Timeline

| Batch | Profiles | Status | ETA |
|-------|----------|--------|-----|
| 1 | 60 | ✅ Complete | Done |
| 2 | 33 | ✅ Complete | Done |
| 3 | 50 | ⏳ Planned | +1 week |
| 4 | 75 | ⏳ Planned | +2 weeks |
| 5 | 50 | ⏳ Planned | +3 weeks |
| 6 | 50 | ⏳ Planned | +4 weeks |
| 7 | 50 | ⏳ Planned | +5 weeks |
| 8 | 32 | ⏳ Planned | +6 weeks |
| 9 | 50 | ⏳ Planned | +7 weeks |
| **Total** | **500** | **In Progress** | **~2 months** |

## Viral Content Strategy

### Content Types That Work:
1. **"Before they were famous"** - Origin stories
2. **"What if they chose [other sport]?"** - Alternate realities
3. **"Stat comparison"** - HS stats vs current fame
4. **"Same school"** - Multiple celebs from one school
5. **"Position surprises"** - Unexpected positions (Tom Brady catcher)

### Platform-Specific:
- **TikTok**: 60-second stories with text overlays
- **Instagram Reels**: Carousel posts with stats
- **YouTube Shorts**: Voiceover narrations
- **Twitter/X**: Thread format with stats

## Technical Notes

### Performance with 500 Profiles:
- Current: Static JSON loading
- Future: Add pagination (50 per page)
- Search: Client-side filtering (fast enough)
- Images: Lazy load as needed

### SEO Opportunities:
- Individual profile pages
- Sport-specific landing pages
- School-specific pages
- Hometown city pages

## Next Steps

1. ✅ Fix data loading (complete)
2. ✅ Add 93 profiles (complete)
3. ⏳ Build automated scraper (next)
4. ⏳ Collect batches 3-9
5. ⏳ Add images to profiles
6. ⏳ Deploy to production

---

**Current Deploy:** http://localhost:8000 (93 profiles)
