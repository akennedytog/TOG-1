#!/usr/bin/env node
/**
 * Generate Personalized Cold Emails for South Florida Businesses
 * No LinkedIn required - direct email outreach
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SCRAPED_FILE = path.join(DATA_DIR, 'scraped_leads.json');
const OUTPUT_DIR = path.join(DATA_DIR, 'outreach');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function loadLeads() {
  try {
    return JSON.parse(fs.readFileSync(SCRAPED_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

// AI Automation Tool Email Templates
const EMAIL_TEMPLATES = {
  // HVAC - Busy season angle
  hvac: (lead) => `Subject: Getting ahead of Miami's busy season - ${lead.name}

Hi ${lead.contact_name.split(' ')[0]},

I saw ${lead.name} while looking up top HVAC companies in ${lead.city}.

Quick question: With summer coming, are you prepared for the call volume spike?

We've been helping South Florida HVAC companies automate their:
• Scheduling and dispatch
• Emergency call routing  
• Follow-up reminders
• Quote follow-ups

One Miami HVAC company automated just their scheduling and saved 12 hours/week during busy season. They're now booking 40% more appointments without hiring additional staff.

I can show you exactly how in a quick 15-min call (no pitch, just showing the system):
https://calendly.com/theonegroup/discovery

Worth exploring?

Best,
Alec Kennedy
The One Group

P.S. Here's what happens when you miss calls: https://theonegroup.info/case-studies/hvac-automation.html`,

  // Legal - Client acquisition angle
  legal: (lead) => `Subject: Following up with every lead? - ${lead.name}

Hi ${lead.contact_name.split(' ')[0]},

Noticed ${lead.name} while researching growing law firms in ${lead.city}.

Quick question: Is your team able to follow up with every consultation request within 5 minutes?

Most law firms I talk to aren't. And every missed call = a potential client going to a competitor.

We helped a ${lead.city} law firm automate their:
• Lead intake and qualification
• Consultation scheduling
• Document collection
• Client follow-ups

Result: They went from a 6-hour response time to 2 minutes. Consultation bookings increased 3x.

Want to see how? 15-min call, no obligation:
https://calendly.com/theonegroup/discovery

Best,
Alec Kennedy
The One Group

P.S. The system pays for itself with one additional client per month.`,

  // Accounting - Tax season / efficiency angle
  accounting: (lead) => `Subject: Handling client surge without burning out - ${lead.name}

Hi ${lead.contact_name.split(' ')[0]},

Came across ${lead.name} while looking at top accounting firms in ${lead.city}.

Tax season question: Are you drowning in client requests right now?

Most firms I talk to are, and it's getting worse every year.

We helped a ${lead.city} CPA firm automate their:
• Client communication
• Document reminders
• Appointment scheduling
• Deadline tracking

Result: They handle 50% more clients with the same team. No more 80-hour weeks during tax season.

Can show you the system in 15 minutes:
https://calendly.com/theonegroup/discovery

No obligation. Just thought you might be interested.

Best,
Alec Kennedy
The One Group`,

  // Real Estate - Speed to lead angle
  real_estate: (lead) => `Subject: Missing deals to faster agents? - ${lead.name}

Hi ${lead.contact_name.split(' ')[0]},

Saw ${lead.name} while researching top realty companies in ${lead.city}.

Quick question: How fast does your team respond to new leads?

Studies show 78% of deals go to the agent who responds first. And the average response time in real estate is 42 minutes.

We helped a ${lead.city} real estate team automate their:
• Lead response (instant)
• Showing scheduling
• Follow-up sequences
• Client check-ins

Result: 2-minute response time. They went from 15% lead-to-meeting conversion to 45%.

Want to see how? Quick 15-min demo:
https://calendly.com/theonegroup/discovery

Best,
Alec Kennedy
The One Group

P.S. The best part? It runs 24/7. Even at 2 AM.`,

  // Dental/Medical - No-shows angle
  dental: (lead) => `Subject: Reducing no-shows - ${lead.name}

Hi ${lead.contact_name.split(' ')[0]},

Noticed ${lead.name} while looking up highly-rated dental practices in ${lead.city}.

Quick question: What's your no-show rate?

Most dental practices I talk to are at 15-20%. That's lost revenue every day.

We helped a ${lead.city} dental practice automate their:
• Appointment reminders (SMS + email)
• Confirmation requests
• Recall campaigns
• Review requests

Result: No-show rate dropped from 18% to 5%. That's 13 more appointments per week.

Want to see the system? 15-min call:
https://calendly.com/theonegroup/discovery

No obligation.

Best,
Alec Kennedy
The One Group`,

  medical: (lead) => `Subject: Patient communication bottleneck - ${lead.name}

Hi ${lead.contact_name.split(' ')[0]},

Saw ${lead.name} while researching medical practices in ${lead.city}.

Quick question: Is your staff spending hours on the phone with patient calls?

Most practices are, and it's preventing them from focusing on patient care.

We helped a ${lead.city} medical practice automate their:
• Appointment reminders
• Prescription refill requests
• Lab result notifications
• Insurance verification

Result: 60% reduction in phone calls. Staff can actually focus on patients.

Want to see how? Quick demo:
https://calendly.com/theonegroup/discovery

Best,
Alec Kennedy
The One Group`,

  // Home Services - Efficiency angle
  home_services: (lead) => `Subject: Managing field teams more efficiently - ${lead.name}

Hi ${lead.contact_name.split(' ')[0]},

Came across ${lead.name} while looking up home service companies in ${lead.city}.

Quick question: Are dispatch and scheduling eating up your day?

Most contractors I talk to spend 2-3 hours daily on coordination. That's time not billing.

We helped a ${lead.city} contractor automate their:
• Dispatch and routing
• Customer notifications
• Quote follow-ups
• Review requests

Result: Saved 15 hours/week on admin. More time for actual work.

Want to see the system?
https://calendly.com/theonegroup/discovery

15 minutes, no obligation.

Best,
Alec Kennedy
The One Group`,

  // Generic fallback
  default: (lead) => `Subject: Automating ${lead.industry.toLowerCase()} operations - ${lead.name}

Hi ${lead.contact_name.split(' ')[0]},

Noticed ${lead.name} while researching ${lead.industry.toLowerCase()} businesses in ${lead.city}.

Quick question: Are repetitive tasks eating up your team's time?

We've been helping South Florida ${lead.industry.toLowerCase()} companies automate their operations, and they're typically saving 10+ hours/week.

What we automate:
• Customer communication
• Scheduling and reminders
• Follow-ups
• Data entry

Result: Your team focuses on high-value work, not busywork.

Can show you examples in a quick 15-min call:
https://calendly.com/theonegroup/discovery

No pitch, just showing what's possible.

Best,
Alec Kennedy
The One Group

P.S. The system usually pays for itself within 30 days.`,
};

const FOLLOW_UP_TEMPLATES = {
  day3: (lead) => `Subject: Quick follow - ${lead.name}

Hi ${lead.contact_name.split(' ')[0]},

Following up on my email from Tuesday about AI automation for ${lead.name}.

Wanted to share something that might help:

The #1 mistake I see ${lead.industry.toLowerCase()} businesses make with automation is trying to do everything at once.

The smart approach: Start with ONE repetitive task, get it working, then expand.

We helped a similar ${lead.industry.toLowerCase()} company in ${lead.city} automate just their scheduling first. Saved 10 hours immediately.

Happy to share the playbook if you're interested:
https://calendly.com/theonegroup/discovery

Best,
Alec`,

  day7: (lead) => `Subject: Results from a similar ${lead.industry.toLowerCase()} company

Hi ${lead.contact_name.split(' ')[0]},

Wanted to share a quick win from last week:

[Similar ${lead.industry.toLowerCase()} company] in ${lead.city} was spending 2 hours/day on repetitive follow-up tasks.

We automated it in one afternoon.

Result: Now takes 15 minutes. They reallocated that time to revenue-generating work.

If that sounds interesting, happy to share how we did it:
https://calendly.com/theonegroup/discovery

No pressure.

Best,
Alec Kennedy
The One Group`,

  day14: (lead) => `Subject: Should I stop following up?

Hi ${lead.contact_name.split(' ')[0]},

This is my last email - promise.

I know you're busy, so I'll assume automation isn't a priority right now.

If I'm wrong and you do want to see how AI could save your team 10+ hours/week, here's my calendar:
https://calendly.com/theonegroup/discovery

Otherwise, no hard feelings. Good luck with ${lead.name}!

Best,
Alec`,
};

function generateEmailsForLead(lead) {
  const industry = lead.industry.toLowerCase().replace(/\s+/g, '_');
  const template = EMAIL_TEMPLATES[industry] || EMAIL_TEMPLATES.default;
  
  return {
    lead_id: lead.id,
    lead_name: lead.name,
    contact_name: lead.contact_name,
    email: lead.email || `${lead.contact_name.toLowerCase().replace(/\s+/g, '.')}@${lead.website.replace(/^https?:\/\//, '')}`,
    initial: template(lead),
    follow_up_1: FOLLOW_UP_TEMPLATES.day3(lead),
    follow_up_2: FOLLOW_UP_TEMPLATES.day7(lead),
    final: FOLLOW_UP_TEMPLATES.day14(lead)
  };
}

function generateBatch(count = 10) {
  const leads = loadLeads()
    .filter(l => l.status === 'new' && l.score >= 7)
    .slice(0, count);
  
  console.log(`\n✉️  Generating Email Sequences for ${leads.length} Leads\n`);
  console.log('='.repeat(80));
  
  const sequences = leads.map(generateEmailsForLead);
  
  // Save to file
  const timestamp = new Date().toISOString().split('T')[0];
  const outputFile = path.join(OUTPUT_DIR, `email_batch_${timestamp}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(sequences, null, 2));
  
  // Display first 3
  sequences.slice(0, 3).forEach((seq, i) => {
    console.log(`\n${'-'.repeat(80)}`);
    console.log(`LEAD ${i + 1}: ${seq.lead_name} (${seq.contact_name})`);
    console.log(`Email: ${seq.email}`);
    console.log(`${'-'.repeat(80)}\n`);
    
    console.log('=== INITIAL EMAIL ===');
    console.log(seq.initial);
    console.log('\n=== FOLLOW-UP #1 (Day 3) ===');
    console.log(seq.follow_up_1);
    console.log('\n=== FOLLOW-UP #2 (Day 7) ===');
    console.log(seq.follow_up_2);
  });
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`\n✅ Generated ${sequences.length} email sequences`);
  console.log(`📁 Saved to: ${outputFile}`);
  console.log(`\n💡 Next Steps:`);
  console.log(`   1. Find emails using Hunter.io or Apollo.io`);
  console.log(`   2. Send initial emails (copy/paste)`);
  console.log(`   3. Track responses in ${SCRAPED_FILE}`);
  console.log(`   4. Schedule follow-ups in 3, 7, 14 days`);
  
  return sequences;
}

function generateSingle(leadName) {
  const leads = loadLeads();
  const lead = leads.find(l => 
    l.name.toLowerCase().includes(leadName.toLowerCase()) ||
    l.contact_name.toLowerCase().includes(leadName.toLowerCase())
  );
  
  if (!lead) {
    console.error(`❌ Lead not found: ${leadName}`);
    console.log('Run: node google_maps_scraper.js batch');
    return;
  }
  
  const seq = generateEmailsForLead(lead);
  
  console.log(`\n✉️  Email Sequence for ${lead.name}\n`);
  console.log('='.repeat(80));
  console.log('\n=== INITIAL EMAIL ===\n');
  console.log(seq.initial);
  console.log('\n=== FOLLOW-UP #1 (Day 3) ===\n');
  console.log(seq.follow_up_1);
  console.log('\n=== FOLLOW-UP #2 (Day 7) ===\n');
  console.log(seq.follow_up_2);
  console.log('\n=== FINAL EMAIL (Day 14) ===\n');
  console.log(seq.final);
  console.log('='.repeat(80));
  
  return seq;
}

// CLI
const [,, command, ...args] = process.argv;

switch (command) {
  case 'batch':
    generateBatch(parseInt(args[0]) || 10);
    break;
    
  case 'single':
    if (!args[0]) {
      console.log('Usage: node generate_emails.js single [company or contact name]');
      break;
    }
    generateSingle(args.join(' '));
    break;
    
  default:
    console.log(`
✉️  AI Automation Email Generator

Generate personalized cold email sequences for South Florida businesses.

Usage:
  node generate_emails.js batch [count]
    → Generate emails for top [count] leads

  node generate_emails.js single [name]
    → Generate email for specific lead

Examples:
  node generate_emails.js batch 10
  node generate_emails.js single "Cool Breeze"
  node generate_emails.js single "John Smith"
`);
}