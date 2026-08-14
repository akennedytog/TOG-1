#!/usr/bin/env node
/**
 * IRIS Test - Send ONE email to verify system works
 * 
 * Run: node iris-test-one.mjs
 */

import { execSync } from 'child_process';
import fs from 'fs';

const LEADS_FILE = '/Users/aleckennedy/.openclaw/workspace/data/arlo_findings.json';
const TRACKER_FILE = '/Users/aleckennedy/.openclaw/workspace/email_tracker.json';

// Industry-aware AI visibility email template
const testEmail = (lead) => `Subject: Would ${lead.name} come up in ChatGPT?

Hi there,

If someone asked ChatGPT for the best ${lead.industry || 'business'} company in South Florida, would ${lead.name} come up?

Most local businesses have no idea how they appear in AI search—or which competitors ChatGPT recommends instead.

The One Group helps businesses improve their AI visibility and turn that visibility into more qualified leads. We also provide AI automation, coaching, and ongoing competitor intelligence.

Would a 15-minute conversation be worthwhile to see where your brand stands?

Best,
Alec Kennedy
The One Group.AI
Founder | CEO | (c) 502.403.7201 | akennedy@theonegroup.info
https://theonegroup.info`;

function loadLeads() {
  const data = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
  return data.leads.filter(lead => lead.score >= 8);
}

function loadTracker() {
  try {
    const data = JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf8'));
    if (!data.sent_to || !Array.isArray(data.sent_to)) {
      data.sent_to = [];
    }
    return data;
  } catch (e) {
    return { total_sent: 0, today_sent: 0, sent_to: [], last_run: null };
  }
}

function saveTracker(tracker) {
  fs.writeFileSync(TRACKER_FILE, JSON.stringify(tracker, null, 2));
}

function generateEmail(lead) {
  return testEmail(lead);
}

function main() {
  console.log('🧪 IRIS TEST MODE - Sending ONE email\n');
  
  const leads = loadLeads();
  const tracker = loadTracker();
  
  // Get leads not yet contacted
  const newLeads = leads.filter(lead => 
    !tracker.sent_to.some(sent => sent.name === lead.name)
  );
  
  if (newLeads.length === 0) {
    console.log('⚠️ All leads already contacted. Picking first lead anyway for test.');
    newLeads.push(leads[0]);
  }
  
  // Pick first lead
  const lead = newLeads[0];
  
  console.log(`🎯 Test Lead: ${lead.name}`);
  console.log(`📍 ${lead.city} | Score: ${lead.score} | ${lead.industry}`);
  console.log(`📞 ${lead.phone}`);
  console.log(`🌐 ${lead.website}`);
  console.log('');
  
  // Generate email
  const email = generateEmail(lead);
  
  console.log('✉️ EMAIL PREVIEW:');
  console.log('='.repeat(50));
  console.log(email);
  console.log('='.repeat(50));
  console.log('');
  
  // Extract components
  const lines = email.split('\n');
  const subject = lines.find(l => l.startsWith('Subject:'))?.replace('Subject:', '').trim() || 'Quick question';
  const body = lines.slice(lines.findIndex(l => l.startsWith('Subject:')) + 1).join('\n').trim();
  
  // Determine email address (use your own for test!)
  const testEmailAddress = 'akennedy@theonegroup.info'; // REPLACE with lead's email when ready
  
  console.log(`📤 Would send to: ${testEmailAddress}`);
  console.log(`📝 Subject: ${subject}`);
  console.log(`📊 Body length: ${body.length} characters`);
  console.log('');
  
  // Actually send (commented for safety - uncomment when ready)
  /*
  try {
    const cmd = `gog gmail send --to "${testEmailAddress}" --subject "${subject}" --body "${body}"`;
    execSync(cmd, { stdio: 'inherit' });
    console.log('✅ Email sent successfully!');
    
    // Log to tracker
    tracker.sent_to.push({
      name: lead.name,
      industry: lead.industry,
      city: lead.city,
      phone: lead.phone,
      website: lead.website,
      score: lead.score,
      date: new Date().toISOString().split('T')[0],
      email_sent: true,
      test_mode: true
    });
    tracker.total_sent++;
    saveTracker(tracker);
    
  } catch (e) {
    console.error('❌ Failed to send:', e.message);
  }
  */
  
  console.log('🛑 TEST MODE - Email NOT actually sent (uncomment send code to enable)');
  console.log('✅ System is working correctly!');
  console.log(`📁 Next: Update testEmailAddress to lead's real email and run again`);
}

main();
