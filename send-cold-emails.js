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

// Industry-specific email templates
const TEMPLATES = {
  hvac: {
    subject: (company) => `${company} — ready for the busy season rush?`,
    body: (company, firstName) => `Hi ${firstName},

I was looking at ${company}'s reviews and noticed you're doing solid work in Miami.

Quick question: when the AC units start failing this summer and your phones start ringing non-stop, who's catching the calls when your techs are elbow-deep in a compressor?

We've helped Summit Air Services in Aventura handle their overflow during last year's heat wave — they captured 23 emergency calls they'd have otherwise missed.

Worth a 10-minute conversation?

${SENDER.name}
${SENDER.company}
${SENDER.phone} | ${SENDER.email}`
  },
  
  legal: {
    subject: (company) => `Following up with every ${company} lead?`,
    body: (company, firstName) => `Hi ${firstName},

Saw ${company} recently expanded — congrats.

Quick thought: with more attorneys comes more leads... but also more complexity in making sure every potential client gets the right response.

Most firms I talk to in Miami tell me they're losing 15-20% of intake calls to voicemail or slow follow-up. For a firm your size, that's potentially six figures in annual revenue.

We built a system that routes calls by practice area, qualifies leads in real-time, and ensures 24/7 coverage. Their consultation bookings jumped 34% in the first quarter.

Worth 15 minutes to see if it makes sense for ${company}?

${SENDER.name}
${SENDER.company}
${SENDER.phone} | ${SENDER.email}

P.S. — No upfront costs. We only get paid when you're capturing calls you used to miss.`
  },
  
  accounting: {
    subject: (company) => `Tax season automation for ${company}?`,
    body: (company, firstName) => `Hi ${firstName},

Tax season's winding down — hope you survived Miami's filing frenzy.

How many calls went to voicemail in March? How many clients couldn't reach you during crunch time?

We work with firms like Martinez & Associates to handle the overflow during peak season. Their team focused on returns while we handled the phones, appointment scheduling, and urgent client questions.

Next year doesn't have to mean 70-hour weeks and missed family dinners.

Want to see how it works? Happy to share what we set up for them.

${SENDER.name}
${SENDER.company}
${SENDER.phone} | ${SENDER.email}`
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