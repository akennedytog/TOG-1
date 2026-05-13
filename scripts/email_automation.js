#!/usr/bin/env node
/**
 * Rico's Email Automation System
 * The One Group - South Florida Cold Outreach
 * 
 * Handles: Personalization, Follow-up Scheduling, Tracking
 * Usage: node email_automation.js [command] [options]
 */

const fs = require('fs');
const path = require('path');

// File paths
const TEMPLATES_FILE = path.join(__dirname, '../data/iris_templates.json');
const SEQUENCES_FILE = path.join(__dirname, '../data/iris_sequences.json');
const LEADS_FILE = path.join(__dirname, '../data/arlo_findings.json');
const TRACKER_FILE = path.join(__dirname, '../data/email_tracker.json');

// Sender configuration (update these with your details)
const SENDER_CONFIG = {
  name: 'Rico',
  company: 'The One Group',
  phone: '(305) 555-0142',
  email: 'rico@theonegroup.io',
  calendar_link: 'https://calendly.com/theonegroup/discovery'
};

/**
 * Load JSON file safely
 */
function loadJson(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    process.exit(1);
  }
}

/**
 * Save JSON file safely
 */
function saveJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error saving ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Ensure tracker file exists with proper structure
 */
function ensureTracker() {
  if (!fs.existsSync(TRACKER_FILE)) {
    const initialTracker = {
      metadata: {
        created: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        campaign: 'South Florida Cold Outreach Q1 2026'
      },
      leads: [],
      sequences: [],
      stats: {
        total_contacted: 0,
        total_responded: 0,
        total_meetings_booked: 0,
        total_unsubscribed: 0
      }
    };
    saveJson(TRACKER_FILE, initialTracker);
    return initialTracker;
  }
  return loadJson(TRACKER_FILE);
}

/**
 * Extract first name from company name or generate placeholder
 */
function extractContactName(companyName) {
  // Common patterns
  const patterns = [
    // "Firstname Lastname & Associates" or "Firstname Lastname, CPA"
    /^([A-Za-z]+)\s+[A-Za-z]+/,
    // "Company Name" - use generic greeting
  ];
  
  // For law firms with names like "Greenberg Traurig" - use "there"
  // For others, try to extract first name
  const words = companyName.split(/[\s,&]+/);
  
  // If first word looks like a person's name (capitalized, not "The", "Group", etc.)
  const nonNames = ['The', 'Group', 'Services', 'Company', 'Corp', 'Inc', 'LLC', 'LLP', 'PA'];
  
  if (words.length > 0 && !nonNames.includes(words[0])) {
    // Check if it's a personal name (ends in common last name patterns)
    return words[0];
  }
  
  return 'there';
}

/**
 * Map industry from leads to template key
 */
function mapIndustry(industry) {
  const mapping = {
    'HVAC': 'hvac',
    'Law Firm': 'legal',
    'Accounting Firm': 'accounting',
    'Dental Practice': null,  // No template available
    'Medical Practice': null  // No template available
  };
  return mapping[industry] || null;
}

/**
 * Get similar company for social proof
 */
function getSimilarCompany(industry, city) {
  const similar = {
    'hvac': ['AirTech Solutions', 'CoolFlow HVAC', 'Summit Air Services'],
    'legal': ['Morrison & Associates', 'Carter Legal Group', 'Vega Law Firm'],
    'accounting': ['Hernandez & Partners', 'Summit Tax Services', 'First Coast CPAs']
  };
  const options = similar[industry] || ['a similar local firm'];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Get nearby city for personalization
 */
function getNearbyCity(city) {
  const nearby = {
    'Miami': ['Fort Lauderdale', 'Coral Gables', 'Aventura', 'Doral'],
    'Fort Lauderdale': ['Miami', 'Hollywood', 'Pompano Beach'],
    'Palm Beach': ['West Palm Beach', 'Boca Raton', 'Delray Beach']
  };
  const options = nearby[city] || ['nearby cities'];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Personalize template with variables
 */
function personalizeTemplate(template, variables) {
  if (!template) return '';
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  // Clean up any unreplaced variables
  result = result.replace(/\{\{[^}]+\}\}/g, '');
  return result;
}

/**
 * Generate email sequence for a lead
 */
function generateSequence(lead, templates, sequences) {
  const industry = mapIndustry(lead.industry);
  if (!industry) {
    return { error: `No sequence available for industry: ${lead.industry}` };
  }

  const firstName = extractContactName(lead.name);
  const similarCompany = getSimilarCompany(industry, lead.city);
  const nearbyCity = getNearbyCity(lead.city);

  const variables = {
    first_name: firstName,
    company_name: lead.name,
    city: lead.city,
    nearby_city: nearbyCity,
    similar_company: similarCompany,
    sender_name: SENDER_CONFIG.name,
    phone: SENDER_CONFIG.phone,
    email: SENDER_CONFIG.email,
    calendar_link: SENDER_CONFIG.calendar_link
  };

  const sequenceData = sequences.sequences[industry];
  if (!sequenceData) {
    return { error: `No sequence found for industry: ${industry}` };
  }

  const emails = sequenceData.sequence.map((touch, index) => {
    const sendDate = new Date();
    sendDate.setDate(sendDate.getDate() + touch.day);

    let subject = touch.subject;
    let body = touch.body;

    // Touch 1 uses template from templates file
    if (index === 0 && templates.industries?.[industry]?.templates?.cold_email) {
      const template = templates.industries[industry].templates.cold_email;
      subject = personalizeTemplate(template.subject, variables);
      body = personalizeTemplate(template.body, variables);
    }

    return {
      touch_number: touch.touch,
      day: touch.day,
      channel: touch.channel,
      scheduled_date: sendDate.toISOString().split('T')[0],
      subject: personalizeTemplate(subject, variables),
      body: personalizeTemplate(body, variables),
      goal: touch.goal,
      status: 'pending',
      sent_at: null,
      opened: false,
      replied: false,
      unsubscribed: false
    };
  });

  return {
    lead_id: lead.name.replace(/\s+/g, '_').toLowerCase(),
    lead_name: lead.name,
    industry: industry,
    industry_display: lead.industry,
    city: lead.city,
    contact_first_name: firstName,
    sequence: emails,
    total_touches: emails.length,
    current_touch: 0,
    status: 'active',
    created_at: new Date().toISOString()
  };
}

/**
 * Add lead to tracker
 */
function addLeadToTracker(leadSequence) {
  const tracker = ensureTracker();
  
  // Check if lead already exists
  const existingIndex = tracker.leads.findIndex(l => l.lead_id === leadSequence.lead_id);
  
  if (existingIndex >= 0) {
    console.log(`Lead "${leadSequence.lead_name}" already in tracker. Updating...`);
    tracker.leads[existingIndex] = leadSequence;
  } else {
    tracker.leads.push(leadSequence);
    tracker.stats.total_contacted++;
  }
  
  tracker.metadata.last_updated = new Date().toISOString();
  saveJson(TRACKER_FILE, tracker);
  return true;
}

/**
 * Get next actions (emails to send today)
 */
function getNextActions() {
  const tracker = ensureTracker();
  const today = new Date().toISOString().split('T')[0];
  const actions = [];

  for (const lead of tracker.leads) {
    if (lead.status !== 'active') continue;

    for (const email of lead.sequence) {
      if (email.status === 'pending' && email.scheduled_date <= today) {
        actions.push({
          lead_id: lead.lead_id,
          lead_name: lead.lead_name,
          industry: lead.industry,
          touch_number: email.touch_number,
          channel: email.channel,
          scheduled_date: email.scheduled_date,
          subject: email.subject,
          body_preview: email.body.substring(0, 100) + '...',
          full_body: email.body
        });
      }
    }
  }

  return actions.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
}

/**
 * Mark email as sent
 */
function markSent(leadId, touchNumber) {
  const tracker = ensureTracker();
  const lead = tracker.leads.find(l => l.lead_id === leadId);
  
  if (!lead) {
    console.error(`Lead "${leadId}" not found`);
    return false;
  }

  const email = lead.sequence.find(e => e.touch_number === parseInt(touchNumber));
  if (!email) {
    console.error(`Touch ${touchNumber} not found for lead "${leadId}"`);
    return false;
  }

  email.status = 'sent';
  email.sent_at = new Date().toISOString();
  lead.current_touch = parseInt(touchNumber);
  
  tracker.metadata.last_updated = new Date().toISOString();
  saveJson(TRACKER_FILE, tracker);
  console.log(`✓ Marked Touch ${touchNumber} as sent for "${lead.lead_name}"`);
  return true;
}

/**
 * Mark email as replied
 */
function markReplied(leadId, touchNumber) {
  const tracker = ensureTracker();
  const lead = tracker.leads.find(l => l.lead_id === leadId);
  
  if (!lead) {
    console.error(`Lead "${leadId}" not found`);
    return false;
  }

  const email = lead.sequence.find(e => e.touch_number === parseInt(touchNumber));
  if (!email) {
    console.error(`Touch ${touchNumber} not found for lead "${leadId}"`);
    return false;
  }

  email.replied = true;
  lead.status = 'responded';
  tracker.stats.total_responded++;
  
  tracker.metadata.last_updated = new Date().toISOString();
  saveJson(TRACKER_FILE, tracker);
  console.log(`✓ Marked Touch ${touchNumber} as replied for "${lead.lead_name}"`);
  return true;
}

/**
 * Mark as meeting booked
 */
function markMeetingBooked(leadId) {
  const tracker = ensureTracker();
  const lead = tracker.leads.find(l => l.lead_id === leadId);
  
  if (!lead) {
    console.error(`Lead "${leadId}" not found`);
    return false;
  }

  lead.status = 'meeting_booked';
  tracker.stats.total_meetings_booked++;
  
  tracker.metadata.last_updated = new Date().toISOString();
  saveJson(TRACKER_FILE, tracker);
  console.log(`✓ Marked "${lead.lead_name}" as meeting booked!`);
  return true;
}

/**
 * Mark as unsubscribed
 */
function markUnsubscribed(leadId) {
  const tracker = ensureTracker();
  const lead = tracker.leads.find(l => l.lead_id === leadId);
  
  if (!lead) {
    console.error(`Lead "${leadId}" not found`);
    return false;
  }

  lead.status = 'unsubscribed';
  tracker.stats.total_unsubscribed++;
  
  tracker.metadata.last_updated = new Date().toISOString();
  saveJson(TRACKER_FILE, tracker);
  console.log(`✓ Marked "${lead.lead_name}" as unsubscribed`);
  return true;
}

/**
 * Get tracking stats
 */
function getStats() {
  const tracker = ensureTracker();
  return {
    ...tracker.stats,
    active_leads: tracker.leads.filter(l => l.status === 'active').length,
    responded_leads: tracker.leads.filter(l => l.status === 'responded').length,
    meeting_booked_leads: tracker.leads.filter(l => l.status === 'meeting_booked').length,
    total_leads: tracker.leads.length
  };
}

/**
 * Process all leads from arlo_findings.json
 */
function processAllLeads() {
  const templates = loadJson(TEMPLATES_FILE);
  const sequences = loadJson(SEQUENCES_FILE);
  const leads = loadJson(LEADS_FILE);

  console.log(`\n📧 Processing ${leads.leads_found} leads...\n`);

  for (const lead of leads.leads) {
    const result = generateSequence(lead, templates, sequences);
    
    if (result.error) {
      console.log(`⚠️  Skipped "${lead.name}": ${result.error}`);
      continue;
    }

    addLeadToTracker(result);
    console.log(`✓ Generated sequence for "${lead.name}" (${lead.industry})`);
  }

  console.log(`\n✅ Done! Run 'node email_automation.js actions' to see what's next.`);
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
📧 Rico's Email Automation System - The One Group

USAGE:
  node email_automation.js [command]

COMMANDS:
  init              Process all leads from arlo_findings.json and create sequences
  actions           Show emails ready to send today
  send [id] [touch] Mark specific email as sent (e.g., send rci_air 1)
  replied [id] [t]  Mark email as replied
  meeting [id]      Mark lead as meeting booked
  unsub [id]        Mark lead as unsubscribed
  stats             Show campaign statistics
  preview [id]      Preview email sequence for a lead
  help              Show this help message

GMAIL SETUP:
  1. Enable "Less secure app access" or use App Password
  2. For production, use OAuth2 or Mailgun API

MAILGUN SETUP:
  1. Sign up at mailgun.com
  2. Add your domain
  3. Set environment variables:
     export MAILGUN_API_KEY="your-api-key"
     export MAILGUN_DOMAIN="mg.yourdomain.com"
  4. Use the sendViaMailgun() function (see code)

FILES:
  Templates:  ${TEMPLATES_FILE}
  Sequences:  ${SEQUENCES_FILE}
  Leads:      ${LEADS_FILE}
  Tracker:    ${TRACKER_FILE}
`);
}

/**
 * Preview sequence for a lead
 */
function previewLead(leadId) {
  const tracker = ensureTracker();
  const lead = tracker.leads.find(l => l.lead_id === leadId);
  
  if (!lead) {
    console.error(`Lead "${leadId}" not found`);
    return;
  }

  console.log(`\n📧 Sequence for: ${lead.lead_name}`);
  console.log(`Industry: ${lead.industry_display} | City: ${lead.city}`);
  console.log(`Status: ${lead.status} | Current Touch: ${lead.current_touch}/${lead.total_touches}`);
  console.log('\n' + '='.repeat(60));

  for (const email of lead.sequence) {
    const statusIcon = email.status === 'sent' ? '✓' : '○';
    console.log(`\n${statusIcon} Touch ${email.touch_number} (Day ${email.day}) - ${email.channel.toUpperCase()}`);
    console.log(`   Scheduled: ${email.scheduled_date} | Status: ${email.status}`);
    console.log(`   Subject: ${email.subject}`);
    console.log(`\n   Body:\n   ${'-'.repeat(40)}`);
    console.log(email.body.split('\n').map(l => '   ' + l).join('\n'));
    console.log(`   ${'-'.repeat(40)}`);
  }
}

// CLI
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

switch (command) {
  case 'init':
    processAllLeads();
    break;
  case 'actions':
    const actions = getNextActions();
    console.log(`\n📋 Next Actions (${actions.length} emails ready):\n`);
    if (actions.length === 0) {
      console.log('No emails scheduled for today. Run "init" first if you haven\'t.');
    } else {
      for (const action of actions) {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`To: ${action.lead_name} (${action.industry})`);
        console.log(`Touch: ${action.touch_number} | Channel: ${action.channel}`);
        console.log(`Scheduled: ${action.scheduled_date}`);
        console.log(`Subject: ${action.subject}`);
        console.log(`\nBody Preview:\n${action.body_preview}`);
        console.log(`\nRun: node email_automation.js send ${action.lead_id} ${action.touch_number}`);
      }
    }
    console.log('');
    break;
  case 'send':
    if (!arg1 || !arg2) {
      console.log('Usage: node email_automation.js send <lead_id> <touch_number>');
      process.exit(1);
    }
    markSent(arg1, arg2);
    break;
  case 'replied':
    if (!arg1 || !arg2) {
      console.log('Usage: node email_automation.js replied <lead_id> <touch_number>');
      process.exit(1);
    }
    markReplied(arg1, arg2);
    break;
  case 'meeting':
    if (!arg1) {
      console.log('Usage: node email_automation.js meeting <lead_id>');
      process.exit(1);
    }
    markMeetingBooked(arg1);
    break;
  case 'unsub':
    if (!arg1) {
      console.log('Usage: node email_automation.js unsub <lead_id>');
      process.exit(1);
    }
    markUnsubscribed(arg1);
    break;
  case 'stats':
    const stats = getStats();
    console.log(`\n📊 Campaign Statistics - The One Group\n`);
    console.log(`Total Leads:        ${stats.total_leads}`);
    console.log(`Active Sequences:    ${stats.active_leads}`);
    console.log(`Responded:           ${stats.total_responded}`);
    console.log(`Meetings Booked:     ${stats.total_meetings_booked}`);
    console.log(`Unsubscribed:        ${stats.total_unsubscribed}`);
    console.log(`\nConversion Rates:`);
    const replyRate = stats.total_contacted > 0 ? ((stats.total_responded / stats.total_contacted) * 100).toFixed(1) : 0;
    const meetingRate = stats.total_contacted > 0 ? ((stats.total_meetings_booked / stats.total_contacted) * 100).toFixed(1) : 0;
    console.log(`Reply Rate:          ${replyRate}%`);
    console.log(`Meeting Rate:        ${meetingRate}%`);
    console.log('');
    break;
  case 'preview':
    if (!arg1) {
      console.log('Usage: node email_automation.js preview <lead_id>');
      console.log('\nAvailable leads:');
      const tracker = ensureTracker();
      tracker.leads.forEach(l => console.log(`  - ${l.lead_id}: ${l.lead_name}`));
      process.exit(1);
    }
    previewLead(arg1);
    break;
  case 'preview-send':
    if (!arg1 || !arg2) {
      console.log('Usage: node email_automation.js preview-send <lead_id> <touch_number>');
      console.log('\nExample: node email_automation.js preview-send rci_air_conditioning_company 1');
      process.exit(1);
    }
    sendEmail(arg1, arg2);
    break;
  default:
    showHelp();
}

/**
 * SEND FUNCTIONS (Uncomment and configure for actual sending)
 */

// Gmail SMTP (requires 'nodemailer' package)
const nodemailer = require('nodemailer');

async function sendViaGmail(to, subject, body, leadId, touchNumber) {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'theonegroup.alec@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || 'kpiv yuhq krgy nfkq'  // App password
    }
  });

  const info = await transporter.sendMail({
    from: `"${SENDER_CONFIG.name}" <${process.env.GMAIL_USER || 'theonegroup.alec@gmail.com'}>`,
    to: to,
    subject: subject,
    text: body,
    headers: {
      'X-Lead-ID': leadId,
      'X-Touch-Number': touchNumber
    }
  });

  console.log('Email sent:', info.messageId);
  markSent(leadId, touchNumber);
  return info;
}

// Mailgun API (requires 'form-data' and 'node-fetch')
const FormData = require('form-data');
const fetch = require('node-fetch');

async function sendViaMailgun(to, subject, body, leadId, touchNumber) {
  const form = new FormData();
  form.append('from', `${SENDER_CONFIG.name} <${SENDER_CONFIG.email}>`);
  form.append('to', to);
  form.append('subject', subject);
  form.append('text', body);
  form.append('h:X-Lead-ID', leadId);
  form.append('h:X-Touch-Number', touchNumber);

  const response = await fetch(
    `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')
      },
      body: form
    }
  );

  if (response.ok) {
    console.log('Email sent via Mailgun');
    markSent(leadId, touchNumber);
  } else {
    console.error('Mailgun error:', await response.text());
  }
}

/**
 * Send email via Gmail (requires nodemailer)
 */
async function sendEmail(leadId, touchNumber) {
  const tracker = ensureTracker();
  const lead = tracker.leads.find(l => l.lead_id === leadId);
  
  if (!lead) {
    console.error(`❌ Lead "${leadId}" not found`);
    return false;
  }

  const email = lead.sequence.find(e => e.touch_number === parseInt(touchNumber));
  if (!email) {
    console.error(`❌ Touch ${touchNumber} not found for lead "${leadId}"`);
    return false;
  }

  // For now, just preview the email (sending requires valid email addresses)
  console.log(`\n📧 READY TO SEND:
`);
  console.log(`To: ${lead.lead_name} <NEED_EMAIL_ADDRESS>`);
  console.log(`Subject: ${email.subject}`);
  console.log(`\nBody:\n${'─'.repeat(60)}`);
  console.log(email.body);
  console.log(`${'─'.repeat(60)}`);
  console.log(`\n⚠️  Note: Need actual email addresses for leads`);
  console.log(`To send: Uncomment sendViaGmail() call and add recipient email`);
  
  // Uncomment this when you have real email addresses:
  // await sendViaGmail(recipientEmail, email.subject, email.body, leadId, touchNumber);
  
  return true;
}

// Export for use as module
module.exports = {
  generateSequence,
  addLeadToTracker,
  getNextActions,
  markSent,
  markReplied,
  markMeetingBooked,
  markUnsubscribed,
  getStats,
  sendEmail,
  SENDER_CONFIG
};
