#!/usr/bin/env node
/**
 * Lead Manager Script
 * Captures, qualifies, and nurtures leads for The One Group
 */

import fs from 'fs';
import path from 'path';

const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');

// Ensure data directory exists
if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });

function loadLeads() {
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLeads(leads) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

function generateId() {
  return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

function scoreLead(lead) {
  let score = 5; // Base score
  
  // Industry scoring
  const highValueIndustries = ['hvac', 'legal', 'accounting', 'consulting', 'e-commerce', 'real estate'];
  if (highValueIndustries.some(i => lead.company?.toLowerCase().includes(i))) score += 2;
  
  // Budget indicators
  if (lead.budget) {
    const budgetNum = parseInt(lead.budget.replace(/[^0-9]/g, ''));
    if (budgetNum >= 5000) score += 3;
    else if (budgetNum >= 2500) score += 2;
    else if (budgetNum >= 1000) score += 1;
  }
  
  // Source quality
  const highQualitySources = ['referral', 'twitter', 'linkedin', 'direct'];
  if (highQualitySources.includes(lead.source?.toLowerCase())) score += 2;
  
  // Urgency signals
  const urgencyWords = ['urgent', 'asap', 'immediately', 'this week', 'help'];
  if (urgencyWords.some(w => lead.notes?.toLowerCase().includes(w))) score += 1;
  
  return Math.min(10, Math.max(1, score));
}

function determineService(notes) {
  const notes_lower = notes?.toLowerCase() || '';
  
  if (notes_lower.includes('audit') || notes_lower.includes('visibility')) {
    return { service: 'AI Visibility Audit', price: '$2,500' };
  }
  if (notes_lower.includes('implement') || notes_lower.includes('build') || notes_lower.includes('deploy')) {
    return { service: 'AI Optimization', price: '$2,500-$10,000' };
  }
  if (notes_lower.includes('train') || notes_lower.includes('learn') || notes_lower.includes('coaching')) {
    return { service: 'AI Coaching', price: '$1,500-$7,500' };
  }
  if (notes_lower.includes('competitor') || notes_lower.includes('monitor') || notes_lower.includes('spy')) {
    return { service: 'Competitor Intel', price: '$297/month' };
  }
  
  return { service: 'AI Visibility Audit', price: '$2,500' }; // Default
}

function generateResponse(lead) {
  const { service, price } = determineService(lead.notes);
  
  return `Hi ${lead.name.split(' ')[0]},

Thanks for reaching out about AI automation for ${lead.company}.

Based on what you shared, I'd recommend starting with our **${service}** (${price}).

Here's what happens next:
1. Book a 15-min discovery call: https://calendly.com/theonegroup/discovery
2. I'll audit your current setup
3. You'll get a clear roadmap

What's your availability this week?

Best,
Alec
The One Group

P.S. Here's what others are saying: https://theonegroup.info/case-studies.html`;
}

function addLead(input) {
  const leads = loadLeads();
  
  const lead = {
    id: generateId(),
    ...input,
    score: scoreLead(input),
    status: 'new',
    created: new Date().toISOString(),
    next_action: 'Send Calendly link',
    follow_up_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days
  };
  
  leads.push(lead);
  saveLeads(leads);
  
  const response = generateResponse(lead);
  
  console.log('✅ Lead captured');
  console.log(`   Score: ${lead.score}/10`);
  console.log(`   Status: ${lead.status}`);
  console.log(`   Next action: ${lead.next_action}`);
  console.log('\n📧 Suggested response:\n');
  console.log(response);
  
  return lead;
}

function listLeads(filter = 'all') {
  const leads = loadLeads();
  
  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  
  console.log(`\n📊 Leads (${filtered.length} total):\n`);
  
  filtered.forEach(lead => {
    console.log(`${lead.score >= 8 ? '🔥' : lead.score >= 5 ? '⭐' : '•'} ${lead.name} - ${lead.company}`);
    console.log(`   Service: ${determineService(lead.notes).service}`);
    console.log(`   Score: ${lead.score}/10 | Status: ${lead.status}`);
    console.log(`   Next: ${lead.next_action} | Due: ${new Date(lead.follow_up_date).toLocaleDateString()}`);
    console.log('');
  });
  
  return filtered;
}

function updateLead(id, updates) {
  const leads = loadLeads();
  const index = leads.findIndex(l => l.id === id);
  
  if (index === -1) {
    console.error(`❌ Lead ${id} not found`);
    return null;
  }
  
  leads[index] = { ...leads[index], ...updates };
  saveLeads(leads);
  
  console.log(`✅ Lead ${id} updated`);
  return leads[index];
}

// CLI
const [,, command, ...args] = process.argv;

switch (command) {
  case 'add':
    const input = JSON.parse(args.join(' '));
    addLead(input);
    break;
    
  case 'list':
    listLeads(args[0] || 'all');
    break;
    
  case 'update':
    const [id, ...updateArgs] = args;
    const updates = JSON.parse(updateArgs.join(' '));
    updateLead(id, updates);
    break;
    
  default:
    console.log(`
Usage:
  node lead_manager.js add '{"name":"John","company":"Acme","email":"john@acme.com","source":"Twitter","notes":"Wants AI for scheduling"}'
  node lead_manager.js list [filter]
  node lead_manager.js update lead_xxx '{"status":"qualified"}'
    `);
}