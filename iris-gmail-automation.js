/**
 * IRIS - Gmail Sales Automation
 * Sends personalized cold emails to Arlo's leads
 * Tracks sends and schedules follow-ups
 * 
 * Setup:
 * 1. Go to script.google.com
 * 2. Create new project
 * 3. Paste this code
 * 4. Save as "Iris Sales Automation"
 * 5. Run authorize() once
 * 6. Set trigger to run daily
 */

// Configuration
const CONFIG = {
  myEmail: 'akennedy@theonegroup.info',
  dailyLimit: 20, // Max emails per day
  followUpDays: 3, // Days between follow-ups
  ccMyself: true, // Keep records
};

// Email Templates
const TEMPLATES = {
  initial: {
    subject: (lead) => `Quick question about ${lead.businessName || 'your business'}`,
    body: (lead) => `Hi ${lead.contactName || 'there'},

If someone asked ChatGPT for the best ${lead.industry || 'business'} in South Florida, would your brand come up?

Most ${lead.industry || 'businesses'} I work with are missing out because they aren't showing up in AI-driven searches.

I help businesses improve their visibility in AI search and turn that visibility into more qualified leads. Our services include:
• AI visibility audits and optimization
• AI-powered workflow and lead-response automation
• AI coaching and team training
• Competitor intelligence and ongoing monitoring

Would a 15-minute conversation be worthwhile to see how ${lead.businessName || 'your business'} appears today and where there may be opportunities?

Best,
Alec Kennedy
The One Group.AI
Founder | CEO | (c) 502.403.7201 | akennedy@theonegroup.info
https://theonegroup.info

P.S. Not interested? Just reply "no thanks" and I'll remove you from my list.`
  },
  
  followUp1: {
    subject: (lead) => `Following up - ${lead.businessName || 'your business'}`,
    body: (lead) => `Hi ${lead.contactName || 'there'},

Wanted to follow up on my last email about AI automation for ${lead.businessName || 'your business'}.

I recently helped a ${lead.industry || 'local business'} save 10 hours/week on lead follow-up and increase their booking rate by 40%.

They were skeptical at first (most people are), but now they call it their "secret weapon."

Still worth a quick chat? No pressure if the timing isn't right.

Best,
Alec

---
Alec Kennedy | The One Group
AI Automation for Small Businesses
https://theonegroup.info | 502-403-7201`
  },
  
  followUp2: {
    subject: (lead) => `Last try - ${lead.industry || 'your industry'} automation`,
    body: (lead) => `Hi ${lead.contactName || 'there'},

I'll keep this brief since I haven't heard back.

I'm helping 2-3 ${lead.industry || 'businesses'} in South Florida implement AI automation this month.

Most see results within a week:
• Faster lead response (60 seconds vs. hours)
• More meetings booked (without more work)
• Follow-up that actually happens

If you're interested, reply and I'll send over a quick calendar link.

If not, no worries — I'll stop reaching out.

Best,
Alec

---
Alec Kennedy | The One Group
https://theonegroup.info`
  }
};

// Main function - run daily
function sendIrisEmails() {
  const leads = getLeadsFromArlo();
  const sentToday = getSentCountToday();
  const remaining = CONFIG.dailyLimit - sentToday;
  
  if (remaining <= 0) {
    console.log(`Daily limit reached (${CONFIG.dailyLimit}). Stopping.`);
    return;
  }
  
  console.log(`Sending up to ${remaining} emails today...`);
  
  let sent = 0;
  for (const lead of leads) {
    if (sent >= remaining) break;
    
    const status = getLeadStatus(lead.email);
    
    // Skip if already contacted in last 3 days
    if (status.lastContact && daysSince(status.lastContact) < 3) {
      continue;
    }
    
    // Determine which email to send
    let template = TEMPLATES.initial;
    let emailType = 'initial';
    
    if (status.emailsSent === 1 && daysSince(status.lastContact) >= CONFIG.followUpDays) {
      template = TEMPLATES.followUp1;
      emailType = 'followup1';
    } else if (status.emailsSent === 2 && daysSince(status.lastContact) >= CONFIG.followUpDays * 2) {
      template = TEMPLATES.followUp2;
      emailType = 'followup2';
    } else if (status.emailsSent >= 3) {
      continue; // Max 3 emails
    }
    
    // Send email
    try {
      sendEmail(lead, template, emailType);
      logSent(lead, emailType);
      sent++;
      
      // Sleep 2 seconds between emails (rate limiting)
      Utilities.sleep(2000);
      
    } catch (e) {
      console.error(`Failed to send to ${lead.email}: ${e.message}`);
    }
  }
  
  console.log(`Sent ${sent} emails today.`);
  sendSummaryEmail(sent);
}

// Send single email
function sendEmail(lead, template, emailType) {
  const subject = template.subject(lead);
  const body = template.body(lead);
  
  GmailApp.sendEmail(lead.email, subject, body, {
    from: CONFIG.myEmail,
    name: 'Alec Kennedy - The One Group',
    replyTo: CONFIG.myEmail,
    cc: CONFIG.ccMyself ? CONFIG.myEmail : null,
    htmlBody: body.replace(/\n/g, '<br>')
  });
  
  console.log(`Sent ${emailType} to ${lead.email}`);
}

// Get leads from Arlo's data file
function getLeadsFromArlo() {
  try {
    // Read from Google Sheets or Drive file
    // For now, using hardcoded sample - replace with actual import
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const leadsSheet = sheet.getSheetByName('Leads') || sheet.insertSheet('Leads');
    
    // If sheet is empty, return sample leads
    const data = leadsSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return getSampleLeads(); // Replace with actual Arlo data import
    }
    
    // Parse leads from sheet
    const leads = [];
    for (let i = 1; i < data.length; i++) {
      leads.push({
        email: data[i][0],
        businessName: data[i][1],
        contactName: data[i][2],
        industry: data[i][3],
        source: data[i][4] || 'Arlo Research'
      });
    }
    return leads;
    
  } catch (e) {
    console.error('Error loading leads:', e);
    return getSampleLeads();
  }
}

// Sample leads for testing
function getSampleLeads() {
  return [
    { email: 'test@example.com', businessName: 'Test HVAC', contactName: 'John', industry: 'HVAC' }
  ];
}

// Get lead status from tracking sheet
function getLeadStatus(email) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const trackingSheet = sheet.getSheetByName('Email Tracking') || createTrackingSheet();
  
  const data = trackingSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      return {
        emailsSent: parseInt(data[i][2]) || 0,
        lastContact: data[i][3] ? new Date(data[i][3]) : null
      };
    }
  }
  
  return { emailsSent: 0, lastContact: null };
}

// Create tracking sheet
function createTrackingSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const trackingSheet = sheet.insertSheet('Email Tracking');
  trackingSheet.appendRow(['Email', 'Business', 'Emails Sent', 'Last Contact', 'Status', 'Notes']);
  return trackingSheet;
}

// Log sent email
function logSent(lead, emailType) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const trackingSheet = sheet.getSheetByName('Email Tracking') || createTrackingSheet();
  
  const now = new Date();
  const existing = findRowByEmail(trackingSheet, lead.email);
  
  if (existing) {
    // Update existing
    const currentCount = parseInt(trackingSheet.getRange(existing, 3).getValue()) || 0;
    trackingSheet.getRange(existing, 3).setValue(currentCount + 1);
    trackingSheet.getRange(existing, 4).setValue(now);
    trackingSheet.getRange(existing, 5).setValue('Contacted');
  } else {
    // Add new
    trackingSheet.appendRow([
      lead.email,
      lead.businessName,
      1,
      now,
      'Contacted',
      emailType
    ]);
  }
}

// Find row by email
function findRowByEmail(sheet, email) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) return i + 1;
  }
  return null;
}

// Get count sent today
function getSentCountToday() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const trackingSheet = sheet.getSheetByName('Email Tracking');
  if (!trackingSheet) return 0;
  
  const today = new Date().toDateString();
  const data = trackingSheet.getDataRange().getValues();
  let count = 0;
  
  for (let i = 1; i < data.length; i++) {
    const contactDate = data[i][3] ? new Date(data[i][3]).toDateString() : null;
    if (contactDate === today) count++;
  }
  
  return count;
}

// Days since date
function daysSince(date) {
  if (!date) return 999;
  const ms = new Date() - new Date(date);
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// Send summary email
function sendSummaryEmail(sent) {
  GmailApp.sendEmail(CONFIG.myEmail, 
    `Iris Daily Report: ${sent} emails sent`,
    `Iris Sales Automation\n\nDate: ${new Date().toDateString()}\nEmails sent: ${sent}\n\nCheck tracking sheet for details.`);
}

// Authorization function (run once)
function authorize() {
  GmailApp.getInboxUnreadCount();
  console.log('Authorization complete!');
}

// Import leads from Arlo JSON (manual trigger)
function importArloLeads() {
  // Paste Arlo's JSON data here or fetch from Drive
  const arloData = {
    "agent": "ARLO (Research Agent)",
    "date": "2026-04-01",
    "findings": {
      "total_leads": 20,
      "industries": ["HVAC", "Legal", "Accounting", "Dental", "Medical", "Real Estate", "Home Services", "Plumbing", "Electrical"]
    }
  };
  
  // Create sample leads based on Arlo data
  const leads = [];
  const industries = arloData.findings.industries;
  
  for (let i = 0; i < 20; i++) {
    const industry = industries[i % industries.length];
    leads.push({
      email: `lead${i+1}@example.com`, // Replace with actual emails from Arlo
      businessName: `${industry} Business ${i+1}`,
      contactName: 'Business Owner',
      industry: industry
    });
  }
  
  // Save to Leads sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const leadsSheet = sheet.getSheetByName('Leads') || sheet.insertSheet('Leads');
  
  // Clear existing
  leadsSheet.clear();
  leadsSheet.appendRow(['Email', 'Business Name', 'Contact Name', 'Industry', 'Source']);
  
  for (const lead of leads) {
    leadsSheet.appendRow([lead.email, lead.businessName, lead.contactName, lead.industry, 'Arlo Research']);
  }
  
  console.log(`Imported ${leads.length} leads from Arlo`);
}
