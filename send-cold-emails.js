#!/usr/bin/env node
/**
 * Gmail Cold Email Sender for The One Group
 * Generates email templates ready to send
 * 
 * Usage: node send-cold-emails.js [--lead <name>] [--all]
 */

const fs = require('fs');
const path = require('path');

const EMAIL_TRACKER = path.join(__dirname, 'data', 'email_tracker.json');

// Sender info
const SENDER = {
  name: 'Alec Kennedy',
  company: 'The One Group',
  email: 'alec@theonegroup.io',
  phone: '(305) 555-0142'
};

// Industry-aware AI visibility email templates
const TEMPLATES = {
  hvac: {
    subject: (company) => `Would ${company} come up in ChatGPT?`,
    body: (company, firstName) => `Hi ${firstName},

If someone asked ChatGPT for the best HVAC company in South Florida, would ${company} come up?

Most local businesses have no idea how they appear in AI search—or which competitors ChatGPT recommends instead.

The One Group helps businesses improve their AI visibility and turn that visibility into more qualified leads. We also provide:
• AI visibility audits and optimization
• AI-powered workflow and lead-response automation
• AI coaching and team training
• Competitor intelligence and ongoing monitoring

Would a 15-minute conversation be worthwhile to see where ${company} stands?

${SENDER.name}
The One Group.AI
Founder | CEO | (c) 502.403.7201 | akennedy@theonegroup.info
https://theonegroup.info`
  },
  
  legal: {
    subject: (company) => `Would ${company} come up in ChatGPT?`,
    body: (company, firstName) => `Hi ${firstName},

If someone asked ChatGPT for the best law firm in South Florida for their situation, would ${company} come up?

AI search is becoming part of how people choose professional services, but most firms do not know whether they are visible—or which competitors are being recommended instead.

The One Group helps businesses improve their AI visibility and turn that visibility into more qualified leads. We also provide:
• AI visibility audits and optimization
• AI-powered workflow and lead-response automation
• AI coaching and team training
• Competitor intelligence and ongoing monitoring

Would a 15-minute conversation be worthwhile to see where ${company} stands?

${SENDER.name}
The One Group.AI
Founder | CEO | (c) 502.403.7201 | akennedy@theonegroup.info
https://theonegroup.info`
  },
  
  accounting: {
    subject: (company) => `Would ${company} come up in ChatGPT?`,
    body: (company, firstName) => `Hi ${firstName},

If someone asked ChatGPT for the best accounting firm in South Florida, would ${company} come up?

AI search is changing how people discover professional services, yet most firms have no clear view of how they appear or which competitors ChatGPT recommends instead.

The One Group helps businesses improve their AI visibility and turn that visibility into more qualified leads. We also provide:
• AI visibility audits and optimization
• AI-powered workflow and lead-response automation
• AI coaching and team training
• Competitor intelligence and ongoing monitoring

Would a 15-minute conversation be worthwhile to see where ${company} stands?

${SENDER.name}
The One Group.AI
Founder | CEO | (c) 502.403.7201 | akennedy@theonegroup.info
https://theonegroup.info`
  }
};

// Load email tracker
function loadTracker() {
  try {
    return JSON.parse(fs.readFileSync(EMAIL_TRACKER, 'utf-8'));
  } catch (err) {
    console.error('❌ Error loading email tracker:', err.message);
    process.exit(1);
  }
}

// Generate Gmail compose URL
function generateGmailUrl(to, subject, body) {
  const params = new URLSearchParams({
    to: to || '',
    su: subject,
    body: body,
    fs: '1', // fullscreen
    tf: '1'  // text format
  });
  return `https://mail.google.com/mail/u/0/?${params.toString()}`;
}

// Generate email for a lead
function generateEmail(lead) {
  const industryKey = (lead.industry || lead.industry_display || '').toLowerCase();
  const industry = industryKey.includes('hvac') ? 'hvac' :
                   (industryKey.includes('law') || industryKey.includes('legal')) ? 'legal' :
                   industryKey.includes('accounting') ? 'accounting' : 'hvac';
  
  const template = TEMPLATES[industry];
  const firstName = (lead.contact_first_name || lead.name?.split(' ')[0] || 'there').replace(/,/g, '');
  
  return {
    to: '', // You'll fill this in
    subject: template.subject(lead.lead_name || lead.name),
    body: template.body(lead.lead_name || lead.name, firstName),
    lead: lead.lead_name,
    industry: lead.industry
  };
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const sendAll = args.includes('--all');
  const leadIndex = args.indexOf('--lead');
  const specificLead = leadIndex !== -1 ? args[leadIndex + 1] : null;
  
  const tracker = loadTracker();
  
  console.log('\n🔥 The One Group - Cold Email Generator\n');
  console.log(`From: ${SENDER.name} <${SENDER.email}>`);
  console.log(`Campaign: ${tracker.metadata.campaign}\n`);
  console.log('=' .repeat(60));
  
  // Filter leads ready to send (Touch 1, status pending)
  const readyLeads = tracker.leads.filter(lead => {
    if (specificLead && !lead.lead_name.toLowerCase().includes(specificLead.toLowerCase())) {
      return false;
    }
    const touch1 = lead.sequence.find(s => s.touch_number === 1);
    return touch1 && touch1.status === 'pending';
  });
  
  if (readyLeads.length === 0) {
    console.log('\n✅ No leads ready to send (or already sent).');
    console.log('Use --all to see all leads or --lead <name> for specific lead.\n');
    return;
  }
  
  console.log(`\n📧 Ready to send: ${readyLeads.length} leads\n`);
  
  const emails = readyLeads.map(generateEmail);
  
  // Output options
  if (sendAll) {
    console.log('🚀 Generating all emails...\n');
    emails.forEach((email, i) => {
      console.log(`\n${'-'.repeat(60)}`);
      console.log(`📧 Email ${i + 1}/${emails.length}: ${email.lead}`);
      console.log(`${'-'.repeat(60)}\n`);
      console.log(`To: [Find on ${email.lead}'s website]`);
      console.log(`Subject: ${email.subject}\n`);
      console.log(email.body);
      console.log(`\n🌐 Open Gmail: ${generateGmailUrl('', email.subject, email.body)}\n`);
    });
  } else {
    // Interactive mode - show first email
    const email = emails[0];
    console.log(`\n📧 Next up: ${email.lead} (${email.industry})\n`);
    console.log(`Subject: ${email.subject}\n`);
    console.log(email.body);
    console.log(`\n${'-'.repeat(60)}`);
    console.log('\n📝 Instructions:');
    console.log('1. Find contact email on their website');
    console.log('2. Copy the subject and body above');
    console.log('3. Paste into Gmail and send');
    console.log('\n🌐 Or open Gmail compose:');
    console.log(generateGmailUrl('', email.subject, email.body));
    console.log('\n💡 Tip: Use --all flag to see all emails at once');
    console.log('💡 Tip: Use --lead "Company Name" for specific lead\n');
  }
  
  // Save draft for reference
  const draftPath = path.join(__dirname, 'email-drafts', `drafts-${Date.now()}.txt`);
  const draftDir = path.dirname(draftPath);
  if (!fs.existsSync(draftDir)) fs.mkdirSync(draftDir, { recursive: true });
  
  let draftContent = `The One Group - Cold Email Drafts\n`;
  draftContent += `Generated: ${new Date().toISOString()}\n`;
  draftContent += `Sender: ${SENDER.name} <${SENDER.email}>\n`;
  draftContent += `${'='.repeat(60)}\n\n`;
  
  emails.forEach((email, i) => {
    draftContent += `EMAIL ${i + 1}: ${email.lead}\n`;
    draftContent += `${'-'.repeat(60)}\n`;
    draftContent += `Subject: ${email.subject}\n\n`;
    draftContent += email.body;
    draftContent += `\n\n${'='.repeat(60)}\n\n`;
  });
  
  fs.writeFileSync(draftPath, draftContent);
  console.log(`💾 Drafts saved to: ${draftPath}\n`);
}

main();
