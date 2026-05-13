#!/usr/bin/env node
/**
 * South Florida Lead Generator
 * Scrapes local businesses and enriches data for outreach
 */

import fs from 'fs';
import path from 'path';

const LEADS_FILE = path.join(process.cwd(), 'data', 'south_florida_leads.json');

// Ensure data directory exists
if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });

// South Florida Industries to Target
const TARGET_INDUSTRIES = [
  { name: 'HVAC', keywords: ['hvac', 'air conditioning', 'heating', 'cooling'], cities: ['Miami', 'Fort Lauderdale', 'West Palm Beach'] },
  { name: 'Legal', keywords: ['law firm', 'attorney', 'lawyer'], cities: ['Miami', 'Fort Lauderdale', 'Boca Raton'] },
  { name: 'Accounting', keywords: ['accounting', 'cpa', 'bookkeeping'], cities: ['Miami', 'Fort Lauderdale', 'Palm Beach'] },
  { name: 'Real Estate', keywords: ['realty', 'real estate', 'property management'], cities: ['Miami', 'Fort Lauderdale', 'Boca Raton', 'West Palm Beach'] },
  { name: 'Dental', keywords: ['dental', 'dentist', 'orthodontist'], cities: ['Miami', 'Fort Lauderdale', 'Boca Raton'] },
  { name: 'Medical', keywords: ['medical practice', 'doctor', 'clinic'], cities: ['Miami', 'Fort Lauderdale', 'West Palm Beach'] },
];

// Mock data for demo - in production, this would scrape actual sources
const MOCK_LEADS = [
  { name: "Cool Breeze HVAC", industry: "HVAC", city: "Miami", employees: 25, website: "coolbreezehvac.com", phone: "305-555-0101", source: "Google Maps" },
  { name: "Miami Legal Group", industry: "Legal", city: "Miami", employees: 15, website: "miamilegal.com", phone: "305-555-0202", source: "LinkedIn" },
  { name: "Broward Accounting", industry: "Accounting", city: "Fort Lauderdale", employees: 12, website: "browardcpa.com", phone: "954-555-0303", source: "Chamber of Commerce" },
  { name: "Palm Beach Realty", industry: "Real Estate", city: "West Palm Beach", employees: 30, website: "palmbeachrealty.com", phone: "561-555-0404", source: "Google Maps" },
  { name: "Sunshine Dental", industry: "Dental", city: "Boca Raton", employees: 18, website: "sunshinedental.com", phone: "561-555-0505", source: "LinkedIn" },
  { name: "Elite Medical Miami", industry: "Medical", city: "Miami", employees: 45, website: "elitemedical.com", phone: "305-555-0606", source: "Google Maps" },
  { name: "Fort Lauderdale Law", industry: "Legal", city: "Fort Lauderdale", employees: 22, website: "ftllaw.com", phone: "954-555-0707", source: "LinkedIn" },
  { name: "Coastal HVAC", industry: "HVAC", city: "Fort Lauderdale", employees: 35, website: "coastalhvac.com", phone: "954-555-0808", source: "Google Maps" },
  { name: "Boca Accounting Pros", industry: "Accounting", city: "Boca Raton", employees: 8, website: "bocacpa.com", phone: "561-555-0909", source: "Chamber of Commerce" },
  { name: "Miami Property Management", industry: "Real Estate", city: "Miami", employees: 28, website: "miamipm.com", phone: "305-555-1010", source: "LinkedIn" },
];

function generateId() {
  return `sf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

function scoreLead(lead) {
  let score = 5;
  
  // Company size
  if (lead.employees >= 20 && lead.employees <= 50) score += 3;
  else if (lead.employees >= 10) score += 2;
  
  // Industry priority
  const priorityIndustries = ['HVAC', 'Legal', 'Real Estate'];
  if (priorityIndustries.includes(lead.industry)) score += 2;
  
  // Has website
  if (lead.website) score += 1;
  
  // Source quality
  const qualitySources = ['LinkedIn', 'Chamber of Commerce'];
  if (qualitySources.includes(lead.source)) score += 1;
  
  return Math.min(10, Math.max(1, score));
}

function addLeads(leads) {
  const existing = loadLeads();
  const newLeads = [];
  
  leads.forEach(lead => {
    // Check for duplicates
    const exists = existing.find(l => 
      l.name.toLowerCase() === lead.name.toLowerCase() || 
      (l.phone && l.phone === lead.phone)
    );
    
    if (!exists) {
      newLeads.push({
        id: generateId(),
        ...lead,
        score: scoreLead(lead),
        status: 'new',
        priority: scoreLead(lead) >= 8 ? 'high' : scoreLead(lead) >= 5 ? 'medium' : 'low',
        created: new Date().toISOString(),
        outreach: {
          linkedin_connected: false,
          email_sent: false,
          call_made: false,
          meeting_booked: false
        },
        notes: '',
        last_contact: null,
        next_action: 'Send LinkedIn connection',
        next_action_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  });
  
  const allLeads = [...existing, ...newLeads];
  fs.writeFileSync(LEADS_FILE, JSON.stringify(allLeads, null, 2));
  
  console.log(`✅ Added ${newLeads.length} new leads`);
  console.log(`📊 Total leads: ${allLeads.length}`);
  
  if (newLeads.length > 0) {
    console.log('\n🔥 Top Priority Leads:');
    newLeads
      .filter(l => l.priority === 'high')
      .slice(0, 5)
      .forEach(l => {
        console.log(`   • ${l.name} (${l.industry}, ${l.city}) - Score: ${l.score}/10`);
      });
  }
  
  return newLeads;
}

function loadLeads() {
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function getLeadsByStatus(status) {
  const leads = loadLeads();
  return status === 'all' ? leads : leads.filter(l => l.status === status);
}

function getHighPriorityLeads() {
  return loadLeads().filter(l => l.priority === 'high' && l.status === 'new');
}

function updateLead(id, updates) {
  const leads = loadLeads();
  const index = leads.findIndex(l => l.id === id);
  
  if (index === -1) {
    console.error(`❌ Lead ${id} not found`);
    return null;
  }
  
  leads[index] = { ...leads[index], ...updates, updated: new Date().toISOString() };
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  
  console.log(`✅ Updated ${leads[index].name}`);
  return leads[index];
}

function getOutreachQueue() {
  const leads = loadLeads();
  const today = new Date().toISOString().split('T')[0];
  
  return leads.filter(l => {
    if (!l.next_action_date) return false;
    return l.next_action_date.split('T')[0] <= today && l.status !== 'closed';
  }).sort((a, b) => (b.score || 0) - (a.score || 0));
}

function getStats() {
  const leads = loadLeads();
  
  return {
    total: leads.length,
    by_status: {
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      proposal: leads.filter(l => l.status === 'proposal_sent').length,
      closed_won: leads.filter(l => l.status === 'closed_won').length,
      closed_lost: leads.filter(l => l.status === 'closed_lost').length
    },
    by_industry: leads.reduce((acc, l) => {
      acc[l.industry] = (acc[l.industry] || 0) + 1;
      return acc;
    }, {}),
    by_city: leads.reduce((acc, l) => {
      acc[l.city] = (acc[l.city] || 0) + 1;
      return acc;
    }, {}),
    high_priority: leads.filter(l => l.priority === 'high').length,
    outreach_today: getOutreachQueue().length
  };
}

// CLI
const [,, command, ...args] = process.argv;

switch (command) {
  case 'scrape':
    console.log('🔍 Scraping South Florida leads...\n');
    addLeads(MOCK_LEADS);
    console.log('\n💡 Next: Run "node south_florida_leads.js queue" to see outreach queue');
    break;
    
  case 'list':
    const filter = args[0] || 'all';
    const leads = getLeadsByStatus(filter);
    console.log(`\n📋 ${filter === 'all' ? 'All' : filter} Leads (${leads.length}):\n`);
    leads.slice(0, 20).forEach(l => {
      const icon = l.priority === 'high' ? '🔥' : l.priority === 'medium' ? '⭐' : '•';
      console.log(`${icon} ${l.name} (${l.industry})`);
      console.log(`   ${l.city} | Score: ${l.score}/10 | Status: ${l.status}`);
      console.log(`   Next: ${l.next_action} | ${l.next_action_date?.split('T')[0]}`);
      console.log('');
    });
    if (leads.length > 20) console.log(`... and ${leads.length - 20} more`);
    break;
    
  case 'queue':
    const queue = getOutreachQueue();
    console.log(`\n📞 Outreach Queue (${queue.length} leads):\n`);
    queue.slice(0, 10).forEach((l, i) => {
      console.log(`${i + 1}. ${l.name} (${l.industry}, ${l.city})`);
      console.log(`   📧 ${l.phone || 'No phone'} | ${l.website || 'No website'}`);
      console.log(`   🎯 Action: ${l.next_action}`);
      console.log('');
    });
    break;
    
  case 'update':
    const [id, ...updateArgs] = args;
    const updates = JSON.parse(updateArgs.join(' '));
    updateLead(id, updates);
    break;
    
  case 'stats':
    const stats = getStats();
    console.log('\n📊 South Florida Lead Stats\n');
    console.log(`Total Leads: ${stats.total}`);
    console.log(`High Priority: ${stats.high_priority}`);
    console.log(`Outreach Today: ${stats.outreach_today}`);
    console.log('\nBy Status:');
    Object.entries(stats.by_status).forEach(([k, v]) => {
      if (v > 0) console.log(`  ${k}: ${v}`);
    });
    console.log('\nBy Industry:');
    Object.entries(stats.by_industry).forEach(([k, v]) => {
      console.log(`  ${k}: ${v}`);
    });
    break;
    
  case 'high':
    const high = getHighPriorityLeads();
    console.log(`\n🔥 High Priority Leads (${high.length}):\n`);
    high.forEach(l => {
      console.log(`${l.name} (${l.industry})`);
      console.log(`  ${l.city} | ${l.employees} employees | Score: ${l.score}/10`);
      console.log(`  ${l.phone || 'No phone'} | ${l.website || 'No website'}`);
      console.log('');
    });
    break;
    
  default:
    console.log(`
🌴 South Florida Lead Generator

Usage:
  node south_florida_leads.js scrape
    → Scrape new leads from sources

  node south_florida_leads.js list [filter]
    → Show all leads (optionally filter by status)

  node south_florida_leads.js queue
    → Show today's outreach queue

  node south_florida_leads.js high
    → Show high priority leads

  node south_florida_leads.js stats
    → Show pipeline statistics

  node south_florida_leads.js update [id] '{"status":"contacted"}'
    → Update lead status

Examples:
  node south_florida_leads.js scrape
  node south_florida_leads.js queue
  node south_florida_leads.js stats
`);
}