/**
 * IRIS - Full Service Pitch with Calendly
 */

const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1Tzxe7hk4fECzqJq7-s1zZgr07LYEIu-nIOJZ4e78x0w/edit?gid=0#gid=0';
const MY_EMAIL = 'akennedy@theonegroup.info';
const CALENDLY_LINK = 'https://calendly.com/alec-kennedy/the-one-group-ai-discovery-call';

function sendEmails() {
  try {
    var ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
    var leadsSheet = ss.getSheetByName('Leads');
    var trackingSheet = ss.getSheetByName('Email Tracking');
    
    if (!leadsSheet) {
      Logger.log('ERROR: Create a tab named "Leads"');
      return;
    }
    
    if (!trackingSheet) {
      trackingSheet = ss.insertSheet('Email Tracking');
      trackingSheet.appendRow(['Email', 'Business', 'Sent', 'Date', 'Status']);
    }
    
    var data = leadsSheet.getDataRange().getValues();
    Logger.log('Found ' + (data.length - 1) + ' leads');
    
    if (data.length < 2) {
      Logger.log('No leads found. Add emails to Leads sheet.');
      return;
    }
    
    // Get tracking data
    var trackingData = trackingSheet.getDataRange().getValues();
    var sentEmails = [];
    for (var i = 1; i < trackingData.length; i++) {
      if (trackingData[i][0]) sentEmails.push(trackingData[i][0].toLowerCase());
    }
    
    // Process leads
    var sentCount = 0;
    var maxPerDay = 20;
    
    for (var row = 1; row < data.length && sentCount < maxPerDay; row++) {
      var email = data[row][0];
      var business = data[row][1] || 'your business';
      var fullName = data[row][2] || '';
      var firstName = extractFirstName(fullName);
      
      if (!email) continue;
      if (sentEmails.indexOf(email.toLowerCase()) !== -1) continue;
      
      // Build email
      var subject = 'Quick question about ' + business;
      var body = buildEmailBody(firstName, business);
      
      // Send
      GmailApp.sendEmail(email, subject, body, {
        from: MY_EMAIL,
        name: 'Alec Kennedy - The One Group',
        replyTo: MY_EMAIL
      });
      
      // Log
      trackingSheet.appendRow([email, business, 'Yes', new Date(), 'Sent']);
      sentCount++;
      Logger.log('✅ Sent to: ' + email);
      
      Utilities.sleep(2000);
    }
    
    // Summary
    if (sentCount > 0) {
      GmailApp.sendEmail(MY_EMAIL, 'Iris: ' + sentCount + ' emails sent', 
        'Sent ' + sentCount + ' emails this morning.\n\nCheck your inbox for replies!');
    }
    
    Logger.log('Complete! Sent ' + sentCount + ' emails');
    
  } catch (e) {
    Logger.log('ERROR: ' + e.message);
    GmailApp.sendEmail(MY_EMAIL, 'Iris Error', e.message);
  }
}

function extractFirstName(fullName) {
  if (!fullName) return 'there';
  var parts = fullName.split(' ');
  return parts[0] || 'there';
}

function buildEmailBody(firstName, business) {
  return 'Hi ' + firstName + ',\n\n' +
    'I came across ' + business + ' while researching local businesses in South Florida.\n\n' +
    'Quick question: Where are you on the AI adoption curve?\n\n' +
    'Most businesses I talk to fall into one of three camps:\n\n' +
    '1. "We\'re overwhelmed by manual tasks and need automation"\n' +
    '2. "We want to understand how AI could help but don\'t know where to start"\n' +
    '3. "We\'re already using AI but want to optimize our approach"\n\n' +
    'Wherever you are, The One Group helps businesses like yours leverage AI to save time, reduce costs, and scale operations.\n\n' +
    'Here\'s what we do:\n\n' +
    '✓ AI-Powered Lead Response\n' +
    '  → Respond to inquiries in 60 seconds (not hours)\n' +
    '  → Automatically qualify and route leads\n' +
    '  → Never miss another opportunity\n\n' +
    '✓ Intelligent Workflow Automation\n' +
    '  → Automate repetitive tasks (invoicing, scheduling, data entry)\n' +
    '  → Connect your existing tools seamlessly\n' +
    '  → Free up your team for high-value work\n\n' +
    '✓ Content & Communication Systems\n' +
    '  → AI-assisted content creation for social media and email\n' +
    '  → Automated client communication and follow-ups\n' +
    '  → Consistent brand messaging without the busywork\n\n' +
    '✓ Custom AI Solutions\n' +
    '  → Tailored automation for your specific industry and workflow\n' +
    '  → Integration with your existing tech stack\n' +
    '  → Ongoing optimization and support\n\n' +
    'I recently helped a similar business in South Florida save 15 hours per week on administrative tasks and increase their response rate by 40%.\n\n' +
    'Worth a quick 15-minute call to see if there\'s a fit for your business?\n\n' +
    'Book a time that works for you:\n' + CALENDLY_LINK + '\n\n' +
    'Or just reply to this email and I\'ll send over a few times.\n\n' +
    'Best,\n' +
    'Alec Kennedy\n' +
    'Founder, The One Group\n' +
    'https://theonegroup.info\n\n' +
    'P.S. Not the right time? Just reply "not now" and I\'ll check back in a few months.';
}