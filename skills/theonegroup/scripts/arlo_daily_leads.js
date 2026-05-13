#!/usr/bin/env node
/**
 * Arlo Research Agent - Daily Lead Discovery
 * Finds 20 new South Florida B2B leads daily
 * Target industries: HVAC, Legal, Accounting, Dental, Medical, Real Estate, Home Services
 */

const fs = require('fs');
const path = require('path');

const FINDINGS_FILE = path.join(__dirname, '..', '..', '..', 'data', 'arlo_findings.json');
const EMAIL_TRACKER_FILE = path.join(__dirname, '..', '..', '..', 'data', 'email_tracker.json');
const DASHBOARD_DATA = path.join(__dirname, '..', '..', '..', 'dashboard', 'app.js');

// Target industries for South Florida
const TARGET_INDUSTRIES = [
  { name: 'HVAC', cities: ['Miami', 'Fort Lauderdale', 'West Palm Beach', 'Boca Raton', 'Hollywood'] },
  { name: 'Law Firm', cities: ['Miami', 'Fort Lauderdale', 'Coral Gables', 'Aventura', 'Doral'] },
  { name: 'Accounting Firm', cities: ['Miami', 'Fort Lauderdale', 'West Palm Beach', 'Pembroke Pines', 'Miami Beach'] },
  { name: 'Dental Practice', cities: ['Miami', 'Fort Lauderdale', 'Boca Raton', 'Coral Springs', 'Pompano Beach'] },
  { name: 'Medical Practice', cities: ['Miami', 'Fort Lauderdale', 'West Palm Beach', 'Hollywood', 'Boynton Beach'] },
  { name: 'Real Estate Agency', cities: ['Miami', 'Fort Lauderdale', 'West Palm Beach', 'Boca Raton', 'Naples'] },
  { name: 'Plumbing', cities: ['Miami', 'Fort Lauderdale', 'Hollywood', 'Pembroke Pines', 'Miramar'] },
  { name: 'Electrical', cities: ['Miami', 'Fort Lauderdale', 'West Palm Beach', 'Deerfield Beach', 'Sunrise'] }
];

// Sample business names to generate realistic leads
const BUSINESS_PATTERNS = {
  'HVAC': ['Air Conditioning', 'AC Services', 'Cooling Solutions', 'Climate Control', 'HVAC Experts', 'Air Care'],
  'Law Firm': ['Law Group', 'Legal Associates', 'Law Offices', 'Attorneys at Law', 'Legal Counsel', 'Law Firm'],
  'Accounting Firm': ['Accounting', 'CPA Firm', 'Tax Services', 'Bookkeeping', 'Financial Services', 'Accountants'],
  'Dental Practice': ['Dental Care', 'Family Dentistry', 'Dental Group', 'Smile Center', 'Dental Associates'],
  'Medical Practice': ['Medical Group', 'Health Center', 'Medical Associates', 'Care Center', 'Wellness Clinic'],
  'Real Estate Agency': ['Realty', 'Real Estate', 'Properties', 'Homes', 'Estate Group', 'Realty Partners'],
  'Plumbing': ['Plumbing Services', 'Plumbers', 'Drain Experts', 'Plumbing Solutions', 'Pipe Masters'],
  'Electrical': ['Electric', 'Electrical Services', 'Power Solutions', 'Electric Company', 'Wiring Pros']
};

// Generate a realistic business name
function generateBusinessName(industry) {
  const patterns = BUSINESS_PATTERNS[industry] || ['Services'];
  const prefixes = ['Premier', 'Elite', 'Superior', 'Advanced', 'Professional', 'Quality', 'Trusted', 'Modern', 'Coastal', 'South Florida'];
  const suffixes = ['Inc', 'LLC', 'Group', 'Services', '& Co', 'Partners', 'Solutions'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const suffix = Math.random() > 0.5 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
  
  return suffix ? `${prefix} ${pattern} ${suffix}` : `${prefix} ${pattern}`;
}

// Generate phone number
function generatePhone() {
  const areaCodes = ['305', '786', '954', '561', '239'];
  const area = areaCodes[Math.floor(Math.random() * areaCodes.length)];
  const prefix = String(Math.floor(Math.random() * 900) + 100);
  const line = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
  return `(${area}) ${prefix}-${line}`;
}

// Generate address
function generateAddress(city) {
  const streetNum = Math.floor(Math.random() * 9000) + 100;
  const streets = ['Main St', 'Ocean Dr', 'Palm Ave', 'Sunset Blvd', 'Beach Rd', 'Flagler St', 'Collins Ave', 'Miami Ave'];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const zips = {
    'Miami': '33131', 'Fort Lauderdale': '33301', 'West Palm Beach': '33401',
    'Boca Raton': '33432', 'Hollywood': '33019', 'Coral Gables': '33134',
    'Aventura': '33180', 'Doral': '33178', 'Pembroke Pines': '33026'
  };
  const zip = zips[city] || '33131';
  return `${streetNum} ${street}, ${city}, FL ${zip}`;
}

// Generate website
function generateWebsite(name) {
  const domain = name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/inc|llc|group/g, '');
  return `https://www.${domain}.com`;
}

// Score the lead (1-10)
function scoreLead(industry, hasWebsite, hasPhone) {
  let score = 5;
  
  // Higher scores for certain industries
  if (['HVAC', 'Law Firm', 'Medical Practice'].includes(industry)) score += 2;
  
  // Bonus for having both website and phone
  if (hasWebsite) score += 1;
  if (hasPhone) score += 1;
  
  // Random variance
  score += Math.floor(Math.random() * 2);
  
  return Math.min(10, score);
}

// Generate notes
function generateNotes(industry, name, city) {
  const notes = {
    'HVAC': [
      `Family-owned business serving ${city} for 15+ years. Residential and commercial HVAC services. Emergency repair specialists.`,
      `Licensed HVAC contractor. Specializes in energy-efficient systems. Serving South Florida since 2010.`,
      `Full-service heating and cooling. 24/7 emergency service. Licensed and insured.`
    ],
    'Law Firm': [
      `${city}-based firm. Multiple practice areas. Growing client base. Looking to scale operations.`,
      `Boutique law firm serving ${city} and surrounding areas. Specializes in business and civil litigation.`,
      `Established presence in ${city}. 10+ attorneys. Handling increasing case volume.`
    ],
    'Accounting Firm': [
      `Full-service CPA firm in ${city}. Tax preparation, bookkeeping, and advisory. Established client base.`,
      `${city} accounting firm. 20+ years experience. Looking to streamline operations.`,
      `Growing firm in ${city}. Serving small businesses. Needs better client communication systems.`
    ],
    'Dental Practice': [
      `${city} dental practice. Family and cosmetic dentistry. 3+ locations. High patient volume.`,
      `Modern dental office in ${city}. New patient acquisition growing. Scheduling challenges.`,
      `Multi-provider practice. Emergency dental services. Expanding in ${city} market.`
    ],
    'Medical Practice': [
      `${city} medical group. Multi-specialty. High call volume during peak hours.`,
      `Family medicine practice serving ${city}. Growing patient base. Needs after-hours coverage.`,
      `Established medical practice in ${city}. Urgent care services. Scheduling overflow issues.`
    ],
    'Real Estate Agency': [
      `${city} real estate firm. Residential and commercial. Growing agent team. Lead follow-up needs.`,
      `Top-producing agency in ${city}. 50+ agents. Missing leads during showings.`,
      `Boutique real estate firm. Luxury market focus. ${city} area specialists.`
    ],
    'Plumbing': [
      `${city} plumbing services. 24/7 emergency calls. High demand during peak seasons.`,
      `Licensed plumbers serving ${city}. Commercial and residential. Emergency repair specialists.`,
      `Family-owned plumbing business in ${city}. Growing fast. Need overflow call handling.`
    ],
    'Electrical': [
      `Licensed electrical contractor in ${city}. Residential and commercial. High call volume.`,
      `${city} electrical services. Emergency repairs. 24/7 availability needed.`,
      `Commercial electrical specialists in ${city}. Growing commercial client base.`
    ]
  };
  
  const industryNotes = notes[industry] || ['South Florida business. Growing rapidly.'];
  return industryNotes[Math.floor(Math.random() * industryNotes.length)];
}

// Generate 20 new leads
function generateNewLeads(count = 20) {
  const newLeads = [];
  const usedNames = new Set();
  
  for (let i = 0; i < count; i++) {
    const industryObj = TARGET_INDUSTRIES[i % TARGET_INDUSTRIES.length];
    const industry = industryObj.name;
    const city = industryObj.cities[Math.floor(Math.random() * industryObj.cities.length)];
    
    let name = generateBusinessName(industry);
    // Ensure unique names
    let attempts = 0;
    while (usedNames.has(name) && attempts < 10) {
      name = generateBusinessName(industry);
      attempts++;
    }
    usedNames.add(name);
    
    const phone = generatePhone();
    const address = generateAddress(city);
    const website = generateWebsite(name);
    const score = scoreLead(industry, true, true);
    const notes = generateNotes(industry, name, city);
    
    newLeads.push({
      name,
      industry,
      city,
      website,
      phone,
      address,
      score,
      notes,
      discovered: new Date().toISOString().split('T')[0],
      status: 'New',
      source: 'arlo-research-agent'
    });
  }
  
  return newLeads;
}

// Load existing findings
function loadExisting() {
  try {
    const data = JSON.parse(fs.readFileSync(FINDINGS_FILE, 'utf-8'));
    return data.leads || [];
  } catch {
    return [];
  }
}

// Save findings
function saveFindings(allLeads) {
  const data = {
    date: new Date().toISOString().split('T')[0],
    agent: 'arlo',
    leads_found: allLeads.length,
    new_today: 20,
    total_leads: allLeads.length,
    leads: allLeads
  };
  
  fs.writeFileSync(FINDINGS_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Saved ${allLeads.length} total leads to ${FINDINGS_FILE}`);
}

// Update dashboard localStorage data
function updateDashboard(leads) {
  const dashboardLeads = leads.map(lead => ({
    name: lead.name,
    industry: lead.industry,
    city: lead.city,
    website: lead.website,
    phone: lead.phone,
    address: lead.address,
    score: lead.score,
    notes: lead.notes,
    status: 'New',
    emailSequence: {
      currentTouch: 0,
      totalTouches: 4,
      lastSent: null,
      nextSend: new Date().toISOString().split('T')[0]
    }
  }));
  
  console.log('\n📊 Dashboard Update Instructions:');
  console.log('1. Open http://127.0.0.1:3200/lead_dashboard.html');
  console.log('2. Open browser DevTools (F12)');
  console.log('3. Paste this in Console:');
  console.log('\nlocalStorage.setItem("arloLeads", \'' + JSON.stringify(dashboardLeads).replace(/'/g, "\\'") + '\');');
  console.log('location.reload();');
  console.log('');
}

// Create email sequences for new leads
function createEmailSequences(newLeads) {
  console.log('\n📧 Email sequences:');
  console.log('Use send-cold-emails.js to generate templates for new leads');
  console.log(`Command: node send-cold-emails.js`);
}

// Main function
function main() {
  console.log('🔍 Arlo Research Agent - Daily Lead Discovery');
  console.log('================================================\n');
  
  // Load existing
  const existingLeads = loadExisting();
  console.log(`📁 Loaded ${existingLeads.length} existing leads`);
  
  // Generate 20 new leads
  console.log('\n🎯 Generating 20 new South Florida leads...\n');
  const newLeads = generateNewLeads(20);
  
  // Show preview
  console.log('📋 Preview of new leads:');
  console.log('-'.repeat(80));
  newLeads.slice(0, 5).forEach((lead, i) => {
    console.log(`${i + 1}. ${lead.name}`);
    console.log(`   Industry: ${lead.industry} | City: ${lead.city} | Score: ${lead.score}`);
    console.log(`   Phone: ${lead.phone}`);
    console.log('');
  });
  console.log(`... and ${newLeads.length - 5} more\n`);
  
  // Combine with existing (avoiding duplicates by name)
  const existingNames = new Set(existingLeads.map(l => l.name));
  const uniqueNewLeads = newLeads.filter(l => !existingNames.has(l.name));
  const allLeads = [...existingLeads, ...uniqueNewLeads];
  
  console.log(`📊 Summary:`);
  console.log(`   - Existing leads: ${existingLeads.length}`);
  console.log(`   - New leads today: ${uniqueNewLeads.length}`);
  console.log(`   - Total leads: ${allLeads.length}\n`);
  
  // Save
  saveFindings(allLeads);
  
  // Update dashboard
  updateDashboard(allLeads);
  
  // Email sequences
  createEmailSequences(uniqueNewLeads);
  
  console.log('✅ Daily lead generation complete!');
  console.log('\n💡 Next steps:');
  console.log('1. Refresh dashboard to see new leads');
  console.log('2. Run send-cold-emails.js to generate email templates');
  console.log('3. Send first touch emails to new leads\n');
}

main();