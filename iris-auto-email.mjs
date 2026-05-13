#!/usr/bin/env node
/**
 * IRIS - Automated Lead Email System
 * 
 * Workflow:
 * 1. Read high-score leads from arlo_findings.json (score >= 8)
 * 2. Add to Google Sheet via gog CLI
 * 3. Generate personalized cold email
 * 4. Send via Gmail (gog)
 * 5. Log to email_tracker.json
 * 
 * Run: node iris-auto-email.mjs
 * Cron: Daily at 8:00 AM
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const LEADS_FILE = '/Users/aleckennedy/.openclaw/workspace/data/arlo_findings.json';
const TRACKER_FILE = '/Users/aleckennedy/.openclaw/workspace/email_tracker.json';
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1Tzxe7hk4fECzqJq7-s1zZgr07LYEIu-nIOJZ4e78x0w/edit';

// Email templates by industry
const emailTemplates = {
  HVAC: (lead) => `Subject: ${lead.name} - Quick question about your summer call volume

Hi there,

I was looking at HVAC companies in ${lead.city} and noticed ${lead.name} has been around for a while (${lead.notes?.match(/\d+ years?/)?.[0] || 'serving the community'}).

Quick question: How do you handle the summer surge when calls spike 3-4x? 

I helped a local HVAC company last month set up an AI system that handles scheduling/qualifying calls automatically. Cut their response time from 15 minutes to 30 seconds.

Not a pitch - just curious if this is even on your radar for 2026?

Best,
Alec Kennedy
The One Group
(502) 403-7201

P.S. - Saw you're a ${lead.notes?.includes('Trane') ? 'Trane dealer' : 'family business'}. Respect that.`,

  'Law Firm': (lead) => `Subject: ${lead.name} - Missed calls question

Hi ${lead.name} team,

I was researching Miami law firms and came across your practice. ${lead.notes?.includes('attorneys') ? `Impressive - ${lead.notes.match(/\d+\+? attorneys?/)?.[0] || 'your team'}.` : ''}

Quick question: What happens to calls that come in after hours or when everyone's in court?

I work with a few South Florida law firms on automating intake/scheduling. One client (similar size) was losing 8-12 qualified leads per week to voicemail.

Is this something you're tracking, or am I solving a problem that doesn't exist?

Either way, curious about your take.

Best,
Alec Kennedy
The One Group
(502) 403-7201`,

  'Dental': (lead) => `Subject: ${lead.name} - After-hours scheduling

Hi ${lead.name},

Saw your practice while looking at dental offices in ${lead.city}. 

Question: How do you handle appointment requests that come in evenings/weekends?

I'm working with a dental group in South Florida that set up AI scheduling - patients book directly, no back-and-forth. New patient appointments went up 23%.

Is this even interesting for ${lead.name}, or are you already covered?

Either way, thanks for your time.

Best,
Alec Kennedy
The One Group
(502) 403-7201`,

  'Medical': (lead) => `Subject: ${lead.name} - Patient intake question

Hi ${lead.name} team,

Noticed your practice in ${lead.city} while researching medical offices.

Quick question: What percentage of your calls are "information gathering" vs "actual appointments"?

I ask because I helped a local medical practice automate patient intake/questions. Freed up their front desk to focus on in-office patients.

Is this the kind of thing ${lead.name} would even consider, or is your current system working fine?

Curious, not selling.

Best,
Alec Kennedy
The One Group
(502) 403-7201`,

  default: (lead) => `Subject: ${lead.name} - Quick question

Hi ${lead.name} team,

Came across your business while researching ${lead.industry} companies in ${lead.city}.

Quick question: How are you handling overflow calls when things get busy?

I'm working with a few ${lead.industry} businesses on automating scheduling and basic inquiries. Cut response times and caught leads they'd otherwise miss.

Is this something ${lead.name} has looked at, or are you good with your current setup?

Either way - just curious about your take.

Best,
Alec Kennedy
The One Group
(502) 403-7201`
};

function loadLeads() {
  try {
    const data = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    // Filter for high-score leads (8+) not yet contacted
    return data.leads.filter(lead => lead.score >= 8);
  } catch (e) {
    console.error('❌ Error loading leads:', e.message);
    return [];
  }
}

function loadTracker() {
  try {
    const data = JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf8'));
    // Ensure sent_to is always an array
    if (!data.sent_to || !Array.isArray(data.sent_to)) {
      data.sent_to = [];
    }
    return data;
  } catch (e) {
    return { 
      total_sent: 0, 
      today_sent: 0,
      sent_to: [],
      last_run: null,
      responses: []
    };
  }
}

function saveTracker(tracker) {
  fs.writeFileSync(TRACKER_FILE, JSON.stringify(tracker, null, 2));
}

function generateEmail(lead) {
  const template = emailTemplates[lead.industry] || emailTemplates.default;
  return template(lead);
}

function addToGoogleSheet(lead) {
  try {
    // Use gog CLI to append to spreadsheet
    // Note: This requires gog to be configured with sheet write permissions
    const cmd = `gog sheets append "${SPREADSHEET_URL}" "${lead.name}" "${lead.industry}" "${lead.city}" "${lead.phone}" "${lead.website}" "${lead.score}" "Pending" "${new Date().toISOString().split('T')[0]}"`;
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✅ Added to Google Sheet: ${lead.name}`);
    return true;
  } catch (e) {
    console.error(`❌ Failed to add to sheet: ${lead.name}`, e.message);
    // Continue anyway - we can still send email
    return false;
  }
}

function sendEmail(lead, emailContent) {
  try {
    // Extract subject and body
    const lines = emailContent.split('\n');
    const subjectLine = lines.find(l => l.startsWith('Subject:'));
    const subject = subjectLine ? subjectLine.replace('Subject:', '').trim() : 'Quick question';
    const body = lines.slice(lines.findIndex(l => l.startsWith('Subject:')) + 1).join('\n').trim();
    
    // Use gog to send email
    // Note: Need to determine actual email address from lead data or website
    const email = lead.email || `info@${lead.website?.replace('https://', '')?.replace('www.', '')}`;
    
    if (!email || !email.includes('@')) {
      console.log(`⚠️ No email for ${lead.name}, skipping send`);
      return false;
    }
    
    const cmd = `gog gmail send --to "${email}" --subject "${subject}" --body "${body}"`;
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✅ Email sent to: ${email}`);
    return true;
  } catch (e) {
    console.error(`❌ Failed to send email to ${lead.name}:`, e.message);
    return false;
  }
}

function main() {
  console.log('🚀 IRIS - Automated Lead Email System');
  console.log(`⏰ Run time: ${new Date().toLocaleString()}`);
  console.log('');
  
  const leads = loadLeads();
  const tracker = loadTracker();
  
  // Reset daily counter if new day
  const today = new Date().toISOString().split('T')[0];
  if (tracker.last_run !== today) {
    tracker.today_sent = 0;
  }
  
  console.log(`📊 Found ${leads.length} high-score leads (8+)`);
  
  // Filter out already contacted leads
  const newLeads = leads.filter(lead => 
    !tracker.sent_to.some(sent => sent.name === lead.name)
  );
  
  console.log(`🆕 ${newLeads.length} leads not yet contacted`);
  console.log('');
  
  // Daily limit: 10 emails max
  const DAILY_LIMIT = 10;
  const remaining = DAILY_LIMIT - tracker.today_sent;
  
  if (remaining <= 0) {
    console.log('⛔ Daily limit reached (10 emails). Try again tomorrow.');
    return;
  }
  
  const toProcess = newLeads.slice(0, remaining);
  console.log(`📧 Will process ${toProcess.length} leads today (${remaining} remaining in quota)`);
  console.log('');
  
  let successCount = 0;
  
  for (const lead of toProcess) {
    console.log(`🎯 Processing: ${lead.name} (${lead.industry}, Score: ${lead.score})`);
    
    // 1. Add to Google Sheet
    const sheetAdded = addToGoogleSheet(lead);
    
    // 2. Generate email
    const email = generateEmail(lead);
    
    // 3. Send email (if we have email address)
    const emailSent = sendEmail(lead, email);
    
    // 4. Log to tracker
    tracker.sent_to.push({
      name: lead.name,
      industry: lead.industry,
      city: lead.city,
      phone: lead.phone,
      website: lead.website,
      score: lead.score,
      date: today,
      sheet_added: sheetAdded,
      email_sent: emailSent,
      email_preview: email.substring(0, 100) + '...'
    });
    
    tracker.total_sent++;
    tracker.today_sent++;
    successCount++;
    
    // Rate limiting: wait 2 seconds between sends
    if (toProcess.indexOf(lead) < toProcess.length - 1) {
      console.log('⏱️ Waiting 2 seconds...');
      execSync('sleep 2');
    }
    console.log('');
  }
  
  tracker.last_run = today;
  saveTracker(tracker);
  
  console.log('✅ IRIS Run Complete');
  console.log(`📊 Stats: ${successCount} processed, ${tracker.today_sent}/${DAILY_LIMIT} daily quota used`);
  console.log(`📁 Tracker: ${TRACKER_FILE}`);
}

main();
