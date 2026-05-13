#!/usr/bin/env node
/**
 * Outreach Automation for South Florida Leads
 * Generates personalized messages and tracks responses
 */

import fs from 'fs';
import path from 'path';

const LEADS_FILE = path.join(process.cwd(), 'data', 'south_florida_leads.json');

function loadLeads() {
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

// Message Templates
const TEMPLATES = {
  linkedin_connect: (lead) => {
    // Extract first name or use generic greeting
    const firstName = lead.contact_name ? lead.contact_name.split(' ')[0] : 'there';
    const companyName = lead.name;
    
    return `Hi ${firstName},

I came across ${companyName} while researching growing businesses in ${lead.city}. Love what you're building in the ${lead.industry.toLowerCase()} space here in South Florida.

Would love to connect and learn more about your growth strategy.

Best,
Alec`;
  },

  linkedin_followup: (lead) => `Hi ${lead.name.split(' ')[0]},

Thanks for connecting! I saw your recent post about ${lead.industry} challenges in Miami.

Quick question: Are you exploring AI automation to handle the busy season ahead? I've been helping South Florida ${lead.industry.toLowerCase()} companies automate their scheduling/lead follow-up, and they're seeing 3x faster response times.

Worth a 15-min chat? https://calendly.com/theonegroup/discovery

Best,
Alec`,

  email_cold: (lead) => `Subject: Quick question about ${lead.name}

Hi ${lead.name.split(' ')[0]},

I'm Alec Kennedy with The One Group - we help South Florida ${lead.industry.toLowerCase()} businesses automate their operations.

Noticed ${lead.name} while researching growing companies in ${lead.city}. Impressive growth to ${lead.employees} employees.

Quick question: Are you currently exploring AI automation for lead follow-up or scheduling? We're seeing 40% faster response times and 3x more meetings booked for companies like yours.

Happy to share a quick case study - no pitch, just value.

If interested, book a quick call: https://calendly.com/theonegroup/discovery

Best,
Alec Kennedy
Founder, The One Group
P.S. Here's what we did for a similar ${lead.industry} company: https://theonegroup.info/case-studies.html`,

  email_followup: (lead) => `Subject: Following up - ${lead.name}

Hi ${lead.name.split(' ')[0]},

Wanted to follow up on my email from last week about AI automation for ${lead.name}.

I understand you're probably swamped - just wanted to share one thing:

We recently helped a ${lead.industry} company in Miami automate their lead follow-up and they went from 2 hours/day to 15 minutes/day. Result: 40% faster response times, 3x more meetings booked.

If that sounds interesting, here's my Calendly for a quick 15-min chat (no pressure):
https://calendly.com/theonegroup/discovery

If not, no worries - just thought I'd share.

Best,
Alec`,
};

function generateBatch(count = 5) {
  const leads = loadLeads().filter(l => 
    l.status === 'new' && 
    l.priority === 'high'
  ).slice(0, count);
  
  console.log(`\n🎯 Batch Outreach Generation (${leads.length} leads)\n`);
  
  leads.forEach((lead, i) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Lead ${i + 1}: ${lead.name} (${lead.industry}, ${lead.city})`);
    console.log(`Phone: ${lead.phone || 'N/A'} | Website: ${lead.website || 'N/A'}`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(TEMPLATES.linkedin_connect(lead));
    console.log('');
  });
  
  console.log(`\n✅ Generated messages for ${leads.length} leads`);
  console.log('📋 Copy and paste into LinkedIn');
}

function printDailyTasks() {
  const leads = loadLeads().filter(l => 
    l.status === 'new' && 
    l.priority === 'high'
  ).slice(0, 10);
  
  console.log('\n📅 TODAY\'S OUTREACH TASKS\n');
  console.log('='.repeat(60));
  
  if (leads.length === 0) {
    console.log('No high priority leads found. Run "scrape" to add new leads.');
    return;
  }
  
  console.log(`\n🔥 HIGH PRIORITY (${leads.length}):\n`);
  leads.forEach((l, i) => {
    console.log(`${i + 1}. ${l.name} (${l.industry}, ${l.city})`);
    console.log(`   Score: ${l.score}/10 | Phone: ${l.phone || 'N/A'}`);
    console.log(`   Action: Send LinkedIn connection request`);
    console.log('');
  });
}

// CLI
const [,, command, ...args] = process.argv;

switch (command) {
  case 'batch':
    generateBatch(parseInt(args[0]) || 5);
    break;
    
  case 'today':
  case 'daily':
    printDailyTasks();
    break;
    
  default:
    console.log(`
📧 South Florida Outreach Automation

Usage:
  node outreach.js batch [count]
    → Generate LinkedIn messages for top leads

  node outreach.js today
    → Show today's outreach tasks

Examples:
  node outreach.js batch 10
  node outreach.js today
`);
}