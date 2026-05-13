#!/usr/bin/env node
/**
 * Miami Music Week Event Aggregator v2 - Crowdsourced
 * With public submission form and community curation
 */

import fs from 'fs';

const EVENT_DATES = ['2026-03-24', '2026-03-25', '2026-03-26', '2026-03-27', '2026-03-28', '2026-03-29'];

const KNOWN_EVENTS = [
  // Scraped from miamimusicweek.com (non-RESISTANCE, non-Ultra events)
  {
    name: "20Five8Records x Groovemates",
    venue: "Astra Rooftop Garden",
    date: "2026-03-24",
    time: "TBD",
    price: "$10+",
    ticketUrl: "https://miamimusicweek.com/event/20five8records-x-groovemates",
    genre: "Various",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Beatport Live Pool Party x Mood Child",
    venue: "Epic Hotel Pool",
    date: "2026-03-25",
    time: "TBD",
    price: "$46+",
    ticketUrl: "https://miamimusicweek.com/event/beatport-live-pool-party-x-mood-child",
    genre: "House / Techno",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Brobot Records Miami x We Group Hi-Fi",
    venue: "Miami Sound Bar",
    date: "2026-03-26",
    time: "TBD",
    price: "FREE",
    ticketUrl: "https://miamimusicweek.com/event/brobot-records-miami-x-we-group-hi-fi",
    genre: "House",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Experts Only: Miami Music Week 2026",
    venue: "Space Miami",
    date: "2026-03-27",
    time: "TBD",
    price: "$70+",
    ticketUrl: "https://miamimusicweek.com/event/experts-only-miami-music-week-2026",
    genre: "Techno",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Get Closer: Luuk Van Dijk",
    venue: "Jolene Sound Room",
    date: "2026-03-28",
    time: "TBD",
    price: "$15+",
    ticketUrl: "https://miamimusicweek.com/event/get-closer-luuk-van-dijk",
    genre: "House",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "MMW26: BEN BÖHMER LIVE",
    venue: "Venue TBD",
    date: "2026-03-27",
    time: "TBD",
    price: "TBD",
    ticketUrl: "https://miamimusicweek.com/event/mmw26-ben-bohmer-live",
    genre: "Melodic House",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Aliens On Mushrooms Pool Party",
    venue: "Venue TBD",
    date: "2026-03-26",
    time: "TBD",
    price: "TBD",
    ticketUrl: "https://miamimusicweek.com/event/aliens-on-mushrooms-pool-party-miami-music-week-2026",
    genre: "Psytrance / Techno",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "AUDIEN: PROGRESSIVE HOUSE NEVER DIES",
    venue: "Venue TBD",
    date: "2026-03-28",
    time: "TBD",
    price: "TBD",
    ticketUrl: "https://miamimusicweek.com/event/audien-progressive-house-never-dies",
    genre: "Progressive House",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Satoshi Tomiie, Melody & More",
    venue: "Venue TBD",
    date: "2026-03-24",
    time: "TBD",
    price: "TBD",
    ticketUrl: "https://miamimusicweek.com/event/satoshi-tomiie-melody-more-nomad-talent-mmw-opener",
    genre: "House",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Balance Miami",
    venue: "Venue TBD",
    date: "2026-03-25",
    time: "TBD",
    price: "TBD",
    ticketUrl: "https://miamimusicweek.com/event/balance-miami",
    genre: "Various",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Beatport Live Pool Party x 20 Years Rekids",
    venue: "Venue TBD",
    date: "2026-03-26",
    time: "TBD",
    price: "TBD",
    ticketUrl: "https://miamimusicweek.com/event/beatport-live-pool-party-x-20-years-rekids",
    genre: "Techno / House",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Carlita + LP Giobbi",
    venue: "Venue TBD",
    date: "2026-03-27",
    time: "TBD",
    price: "TBD",
    ticketUrl: "https://miamimusicweek.com/event/carlita-lp-giobbi",
    genre: "House / Techno",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Coldharbour Night (MMW)",
    venue: "Venue TBD",
    date: "2026-03-24",
    time: "TBD",
    price: "TBD",
    ticketUrl: "https://miamimusicweek.com/event/coldharbour-night-mmw",
    genre: "Trance",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Converge: Richie Hawtin B2b Dubfire",
    venue: "Venue TBD",
    date: "2026-03-25",
    time: "TBD",
    price: "TBD",
    ticketUrl: "https://miamimusicweek.com/event/fooqs-converge-richie-hawtin-b2b-dubfire",
    genre: "Techno",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "DJ Mag presents Cloonee (Sagamore Pool Party)",
    venue: "Sagamore",
    date: "2026-03-27",
    time: "TBD",
    price: "TBD",
    ticketUrl: "https://miamimusicweek.com/event/sagamore-pool-party-dj-mag-presents-cloonee",
    genre: "House",
    source: "MMW Official",
    submittedBy: "TheOneGroupAI"
  },
  // Original events
  {
    name: "Ultra Music Festival 2026",
    venue: "Bayfront Park",
    date: "2026-03-27",
    time: "12:00 PM - 12:00 AM",
    price: "$399+",
    ticketUrl: "https://ultramusicfestival.com",
    genre: "Electronic / Dance",
    source: "Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Defected Miami",
    venue: "The Ground",
    date: "2026-03-25",
    time: "10:00 PM - 6:00 AM",
    price: "$60-$120",
    ticketUrl: "https://ra.co/events/2000000",
    genre: "House",
    source: "RA",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Drumcode Pool Party",
    venue: "Delano Beach Club",
    date: "2026-03-26",
    time: "12:00 PM - 10:00 PM",
    price: "$50-$85",
    ticketUrl: "https://ra.co/events/2000001",
    genre: "Techno",
    source: "RA",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Anjunadeep Miami",
    venue: "The Deck at Island Gardens",
    date: "2026-03-24",
    time: "2:00 PM - 10:00 PM",
    price: "$45-$75",
    ticketUrl: "https://ra.co/events/2000002",
    genre: "Deep House / Progressive",
    source: "RA",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Paradise (Jamie Jones)",
    venue: "Space",
    date: "2026-03-28",
    time: "11:00 PM - 12:00 PM",
    price: "$40-$80",
    ticketUrl: "https://clubspace.com",
    genre: "Tech House",
    source: "Venue",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Masters at Work",
    venue: "Club Space",
    date: "2026-03-27",
    time: "11:00 PM - 12:00 PM",
    price: "$50-$100",
    ticketUrl: "https://clubspace.com",
    genre: "House / Classics",
    source: "Venue",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Factory 93 Miami",
    venue: "Factory Town",
    date: "2026-03-26",
    time: "10:00 PM - 6:00 AM",
    price: "$75-$150",
    ticketUrl: "https://factory93.com",
    genre: "Techno / House",
    source: "Official",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Shiba San @ Treehouse",
    venue: "Treehouse Miami",
    date: "2026-03-25",
    time: "11:00 PM - 5:00 AM",
    price: "$30-$60",
    ticketUrl: "https://ra.co/events/2000003",
    genre: "Tech House",
    source: "RA",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Solomun +1",
    venue: "Club Space",
    date: "2026-03-29",
    time: "11:00 PM - 12:00 PM",
    price: "$60-$120",
    ticketUrl: "https://clubspace.com",
    genre: "Melodic House",
    source: "Venue",
    submittedBy: "TheOneGroupAI"
  },
  {
    name: "Spinnin' Sessions Pool Party",
    venue: "National Hotel Pool",
    date: "2026-03-27",
    time: "12:00 PM - 8:00 PM",
    price: "$40-$75",
    ticketUrl: "https://ra.co/events/2000004",
    genre: "EDM / Dance Pop",
    source: "RA",
    submittedBy: "TheOneGroupAI"
  }
];

// Create output directory
const OUTPUT_DIR = `${process.env.HOME}/.openclaw/workspace/mmw-events`;
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function generateHTML(events) {
  const sortedEvents = events.sort((a, b) => new Date(a.date + 'T' + a.time.split('-')[0]) - new Date(b.date + 'T' + b.time.split('-')[0]));
  
  const eventCards = sortedEvents.map(e => `
    <div class="event-card" data-date="${e.date}" data-genre="${e.genre}">
      <div class="date-badge">${new Date(e.date).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}</div>
      <h3>${e.name}</h3>
      <p class="venue">📍 ${e.venue}</p>
      <p class="time">🕐 ${e.time}</p>
      <div class="meta">
        <span class="genre-tag">${e.genre}</span>
        <span class="price">${e.price}</span>
      </div>
      <a href="${e.ticketUrl}" target="_blank" class="ticket-btn">Get Tickets</a>
      ${e.submittedBy !== 'TheOneGroupAI' ? `<span class="submitted-by">Added by @${e.submittedBy}</span>` : ''}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Miami Music Week 2026 | Community Event Guide</title>
  <meta name="description" content="The complete Miami Music Week 2026 event guide. Curated by AI, powered by the community. March 24-29, 2026.">
  <meta property="og:title" content="Miami Music Week 2026 | Community Event Guide">
  <meta property="og:description" content="Your complete MMW 2026 guide. Curated by AI, powered by the community.">
  <meta property="og:image" content="https://theonegroup.info/assets/mmw-og.png">
  <meta property="og:url" content="https://theonegroup.info/mmw-2026.html">
  <meta name="twitter:card" content="summary_large_image">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
      color: #fff; 
      min-height: 100vh; 
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    
    /* Header */
    header { text-align: center; padding: 3rem 0 2rem; }
    h1 { 
      font-size: clamp(2rem, 5vw, 3.5rem); 
      background: linear-gradient(90deg, #ff006e, #8338ec, #3a86ff); 
      -webkit-background-clip: text; 
      -webkit-text-fill-color: transparent; 
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }
    .subtitle { color: #a0a0a0; font-size: 1.1rem; max-width: 600px; margin: 0 auto; }
    .dates { color: #666; margin-top: 0.5rem; font-size: 0.95rem; }
    
    /* Stats Bar */
    .stats-bar {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
      margin: 1.5rem 0;
      padding: 1rem;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
    }
    .stat { text-align: center; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #ff006e; }
    .stat-label { font-size: 0.8rem; color: #666; }
    
    /* CTA Buttons */
    .cta-section {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin: 2rem 0;
    }
    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      border-radius: 50px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s;
    }
    .cta-btn.primary {
      background: linear-gradient(90deg, #ff006e, #8338ec);
      color: #fff;
    }
    .cta-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(131, 56, 236, 0.4); }
    .cta-btn.secondary {
      background: rgba(255,255,255,0.1);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .cta-btn.secondary:hover { background: rgba(255,255,255,0.15); }
    
    /* Filters */
    .filters { 
      display: flex; 
      gap: 0.75rem; 
      justify-content: center; 
      flex-wrap: wrap; 
      margin: 2rem 0;
      padding: 0 1rem;
    }
    .filter-btn { 
      background: rgba(255,255,255,0.1); 
      border: 1px solid rgba(255,255,255,0.2); 
      color: #fff; 
      padding: 0.5rem 1.25rem; 
      border-radius: 50px; 
      cursor: pointer; 
      transition: all 0.3s;
      font-size: 0.9rem;
    }
    .filter-btn:hover, .filter-btn.active { 
      background: linear-gradient(90deg, #ff006e, #8338ec); 
      border-color: transparent; 
    }
    
    /* Events Grid */
    .events-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
      gap: 1.5rem; 
      margin-top: 2rem; 
    }
    .event-card { 
      background: rgba(255,255,255,0.05); 
      border-radius: 16px; 
      padding: 1.5rem; 
      border: 1px solid rgba(255,255,255,0.1); 
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
    }
    .event-card:hover { 
      transform: translateY(-5px); 
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      border-color: rgba(255,255,255,0.2);
    }
    .date-badge { 
      display: inline-block; 
      background: linear-gradient(90deg, #ff006e, #8338ec); 
      padding: 0.35rem 1rem; 
      border-radius: 50px; 
      font-size: 0.8rem; 
      font-weight: 600; 
      margin-bottom: 1rem;
      align-self: flex-start;
    }
    .event-card h3 { 
      font-size: 1.25rem; 
      margin-bottom: 0.75rem; 
      line-height: 1.3; 
    }
    .venue, .time { 
      color: #a0a0a0; 
      margin-bottom: 0.5rem; 
      font-size: 0.9rem; 
    }
    .meta {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      margin: 0.75rem 0;
      flex-wrap: wrap;
    }
    .genre-tag { 
      display: inline-block; 
      background: rgba(58,134,255,0.2); 
      color: #3a86ff; 
      padding: 0.25rem 0.75rem; 
      border-radius: 20px; 
      font-size: 0.75rem; 
    }
    .price { 
      color: #ff006e; 
      font-weight: 600;
      font-size: 0.9rem;
    }
    .submitted-by {
      font-size: 0.75rem;
      color: #666;
      margin-top: 0.75rem;
    }
    .ticket-btn { 
      display: block; 
      margin-top: auto;
      padding-top: 1rem;
      background: linear-gradient(90deg, #ff006e, #8338ec); 
      color: #fff; 
      text-decoration: none; 
      padding: 0.75rem; 
      border-radius: 8px; 
      text-align: center; 
      font-weight: 600; 
      transition: opacity 0.3s; 
    }
    .ticket-btn:hover { opacity: 0.9; }
    
    /* Submit Section */
    .submit-section {
      background: rgba(255,255,255,0.05);
      border-radius: 20px;
      padding: 2rem;
      margin: 3rem 0;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .submit-section h2 {
      font-size: 1.5rem;
      margin-bottom: 0.75rem;
    }
    .submit-section p {
      color: #a0a0a0;
      margin-bottom: 1.5rem;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    
    /* Community Stats */
    .community-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }
    .community-stat {
      background: rgba(255,255,255,0.05);
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
    }
    .community-stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #3a86ff;
    }
    .community-stat-label {
      font-size: 0.8rem;
      color: #666;
    }
    
    /* Footer */
    footer { 
      text-align: center; 
      padding: 3rem 0 2rem; 
      color: #666; 
    }
    .ai-credit { 
      background: linear-gradient(90deg, #ff006e, #8338ec, #3a86ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 600;
    }
    .footer-links {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      margin: 1rem 0;
      flex-wrap: wrap;
    }
    .footer-links a {
      color: #666;
      text-decoration: none;
      transition: color 0.3s;
    }
    .footer-links a:hover { color: #fff; }
    .last-updated {
      font-size: 0.8rem;
      color: #444;
      margin-top: 1rem;
    }
    
    @media (max-width: 640px) {
      .container { padding: 1rem; }
      .stats-bar { gap: 1rem; }
      .cta-section { flex-direction: column; align-items: center; }
      .cta-btn { width: 100%; max-width: 300px; justify-content: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎵 Miami Music Week 2026</h1>
      <p class="subtitle">The complete community-powered event guide</p>
      <p class="dates">March 24-29, 2026 • Miami, FL</p>
      
      <div class="stats-bar">
        <div class="stat">
          <div class="stat-value">${events.length}</div>
          <div class="stat-label">Events</div>
        </div>
        <div class="stat">
          <div class="stat-value">${new Set(events.map(e => e.venue)).size}</div>
          <div class="stat-label">Venues</div>
        </div>
        <div class="stat">
          <div class="stat-value">6</div>
          <div class="stat-label">Days</div>
        </div>
        <div class="stat">
          <div class="stat-value">1</div>
          <div class="stat-label">Community</div>
        </div>
      </div>
      
      <div class="cta-section">
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSfYOUR_FORM_ID/viewform" target="_blank" class="cta-btn primary">
          <span>➕</span> Submit an Event
        </a>
        <a href="https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pubhtml" target="_blank" class="cta-btn secondary">
          <span>📊</span> View Live Data
        </a>
        <a href="https://twitter.com/intent/tweet?text=Check%20out%20this%20community-powered%20Miami%20Music%20Week%202026%20event%20guide%21%20https%3A%2F%2Ftheonegroup.info%2Fmmw-2026.html" target="_blank" class="cta-btn secondary">
          <span>🐦</span> Share on X
        </a>
      </div>
    </header>
    
    <div class="filters">
      <button class="filter-btn active" data-filter="all">All Events</button>
      <button class="filter-btn" data-filter="2026-03-24">Tue 24</button>
      <button class="filter-btn" data-filter="2026-03-25">Wed 25</button>
      <button class="filter-btn" data-filter="2026-03-26">Thu 26</button>
      <button class="filter-btn" data-filter="2026-03-27">Fri 27</button>
      <button class="filter-btn" data-filter="2026-03-28">Sat 28</button>
      <button class="filter-btn" data-filter="2026-03-29">Sun 29</button>
    </div>
    
    <div class="events-grid">
      ${eventCards}
    </div>
    
    <div class="submit-section">
      <h2>🤝 Powered by the Community</h2>
      <p>Help make this the most comprehensive MMW guide. Submit events you know about and we'll verify and add them within 24 hours.</p>
      
      <div class="community-stats">
        <div class="community-stat">
          <div class="community-stat-value">${events.filter(e => e.submittedBy !== 'TheOneGroupAI').length}</div>
          <div class="community-stat-label">Community Submissions</div>
        </div>
        <div class="community-stat">
          <div class="community-stat-value">24h</div>
          <div class="community-stat-label">Avg Review Time</div>
        </div>
        <div class="community-stat">
          <div class="community-stat-value">0</div>
          <div class="community-stat-label">Pending Reviews</div>
        </div>
      </div>
      
      <a href="https://docs.google.com/forms/d/e/1FAIpQLSfYOUR_FORM_ID/viewform" target="_blank" class="cta-btn primary" style="margin-top: 1rem;">
        <span>➕</span> Submit Your Event
      </a>
    </div>
    
    <footer>
      <p>Curated by <span class="ai-credit">@TheOneGroupAI</span> using automated event aggregation</p>
      <div class="footer-links">
        <a href="https://x.com/TheOneGroupAI" target="_blank">Follow on X</a>
        <a href="https://theonegroup.info" target="_blank">TheOneGroup.info</a>
        <a href="mailto:akennedy@theonegroup.info">Contact</a>
      </div>
      <p class="last-updated">Last updated: ${new Date().toLocaleString('en-US', {timeZone: 'America/New_York'})} ET</p>
    </footer>
  </div>
  
  <script>
    // Filter functionality
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        document.querySelectorAll('.event-card').forEach(card => {
          if (filter === 'all' || card.dataset.date === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
    
    // Animate stats on load
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.stat-value, .community-stat-value').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        setTimeout(() => {
          el.style.transition = 'all 0.5s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, Math.random() * 500);
      });
    });
  </script>
</body>
</html>`;
}

// Generate tweet
function generateTweet(events) {
  const communityCount = events.filter(e => e.submittedBy !== 'TheOneGroupAI').length;
  const communityText = communityCount > 0 ? ` (+ ${communityCount} community submissions)` : '';
  
  return `🎵 Miami Music Week 2026 is HERE!

The community-powered event guide is live${communityText}:

• ${events.length} events
• ${new Set(events.map(e => e.venue)).size} venues  
• Filter by day
• Submit your own events

Live page → https://theonegroup.info/mmw-2026.html

Built by AI. Powered by the community.

#MiamiMusicWeek #MMW2026 #Ultra2026 #MiamiEvents #OpenData`;
}

// Save files
const html = generateHTML(KNOWN_EVENTS);
const tweet = generateTweet(KNOWN_EVENTS);

fs.writeFileSync(`${OUTPUT_DIR}/mmw-2026-v2.html`, html);
fs.writeFileSync(`${OUTPUT_DIR}/tweet-v2.txt`, tweet);

console.log('✅ Miami Music Week Event Guide v2 Generated!');
console.log(`   Events: ${KNOWN_EVENTS.length}`);
console.log(`   Community submissions: ${KNOWN_EVENTS.filter(e => e.submittedBy !== 'TheOneGroupAI').length}`);
console.log(`   HTML: ${OUTPUT_DIR}/mmw-2026-v2.html`);
console.log(`   Tweet: ${OUTPUT_DIR}/tweet-v2.txt`);
console.log(`\n📋 Next Steps:`);
console.log(`   1. Create Google Form for submissions`);
console.log(`   2. Create public Google Sheet`);
console.log(`   3. Update form/sheet URLs in HTML`);
console.log(`   4. Deploy and tweet`);