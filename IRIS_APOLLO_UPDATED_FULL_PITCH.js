/**
 * IRIS + APOLLO Combined Automation - Updated for Full Service Pitch
 * 
 * 8:00 AM - Apollo finds leads
 * 9:00 AM - Iris sends emails
 * 
 * Schedule both functions to run daily
 */

// CONFIG
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1Tzxe7hk4fECzqJq7-s1zZgr07LYEIu-nIOJZ4e78x0w/edit?gid=0#gid=0';
const MY_EMAIL = 'akennedy@theonegroup.info';
const APOLLO_API_KEY = 'hciXhyExi2ia20bS81YIzQ';
const CALENDLY_LINK = 'https://calendly.com/alec-kennedy/the-one-group-ai-discovery-call';

// Industry searches for Apollo
const INDUSTRY_SEARCHES = {
  'HVAC': ['HVAC contractor Miami', 'air conditioning service Florida'],
  'Legal': ['law firm Fort Lauderdale', 'attorney Palm Beach'],
  'Accounting': ['CPA Miami', 'bookkeeping service Florida'],
  'Dental': ['dental practice Fort Lauderdale', 'dentist Boca Raton'],
  'Medical': ['medical clinic Miami', 'doctor office Florida'],
  'Real Estate': ['real estate agent Miami', 'property management Fort Lauderdale'],
  'Plumbing': ['plumber Miami', 'plumbing service Florida'],
  'Electrical': ['electrician Fort Lauderdale', 'electrical contractor Palm Beach']
};

/**
 * APOLLO CONNECTOR - Run at 8:00 AM
 * Finds leads and adds them to the Leads sheet
 */
function findAndImportLeads() {
  try {
    Logger.log('Starting Apollo lead search...');
    
    var ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
    var leadsSheet = ss.getSheetByName('Leads');
    
    if (!leadsSheet) {
      Logger.log('ERROR: Create a tab named "Leads"');
      GmailApp.sendEmail(MY_EMAIL, 'Apollo Error', 'Create Leads tab first');
      return;
    }
    
    // Get existing emails
    var existingEmails = getExistingEmails(leadsSheet);
    Logger.log('Existing leads: ' + existingEmails.length);
    
    // Search for leads (top 4 industries)
    var industries = ['HVAC', 'Legal', 'Dental', 'Real Estate'];
    var allNewLeads = [];
    
    for (var i = 0; i < industries.length; i++) {
      var industry = industries[i];
      var searchTerms = INDUSTRY_SEARCHES[industry];
      
      Logger.log('Searching: ' + industry);
      var leads = searchApollo(searchTerms[0], 3);
      
      for (var j = 0; j < leads.length; j++) {
        // Check if already exists
        if (existingEmails.indexOf(leads[j].email.toLowerCase()) === -1) {
          allNewLeads.push(leads[j]);
        }
      }
    }
    
    // Add to sheet (limit to 10 per day)
    var leadsToAdd = allNewLeads.slice(0, 10);
    var added = 0;
    
    for (var k = 0; k < leadsToAdd.length; k++) {
      var lead = leadsToAdd[k];
      leadsSheet.appendRow([
        lead.email,
        lead.company,
        lead.name,
        lead.industry,
        'Apollo ' + new Date().toISOString().split('T')[0]
      ]);
      added++;
      Logger.log('Added: ' + lead.email);
    }
    
    // Send summary
    var subject = 'Apollo Complete: ' + added + ' new leads added';
    var body = 'Lead Import Summary\n\n' +
      'Date: ' + new Date().toDateString() + '\n' +
      'New leads: ' + added + '\n' +
      'Total in sheet: ' + (existingEmails.length + added) + '\n\n' +
      'Iris will email these at 9 AM.';
    
    GmailApp.sendEmail(MY_EMAIL, subject, body);
    Logger.log('Complete! Added ' + added + ' leads');
    
  } catch (e) {
    Logger.log('ERROR: ' + e.message);
    GmailApp.sendEmail(MY_EMAIL, 'Apollo Error', e.message);
  }
}

// Search Apollo.io
function searchApollo(keywords, limit) {
  var url = 'https://api.apollo.io/v1/mixed_people/search';
  
  var payload = {
    api_key: APOLLO_API_KEY,
    q_keywords: keywords,
    location: 'Florida',
    page: 1,
    per_page: limit
  };
  
  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': APOLLO_API_KEY
    },
    payload: JSON.stringify(payload)
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());
    
    if (!data.people || data.people.length === 0) {
      Logger.log('No results for: ' + keywords);
      return getSampleLeads(keywords); // Fallback
    }
    
    var leads = [];
    for (var i = 0; i < data.people.length; i++) {
      var person = data.people[i];
      if (person.email && person.email.indexOf('@') > -1) {
        leads.push({
          email: person.email,
          name: (person.first_name || '') + ' ' + (person.last_name || ''),
          firstName: person.first_name || 'there', // Extract first name
          company: person.organization?.name || 'Unknown',
          industry: keywords
        });
      }
    }
    
    Logger.log('Found ' + leads.length + ' leads');
    return leads;
    
  } catch (e) {
    Logger.log('Apollo API error: ' + e.message);
    return getSampleLeads(keywords); // Fallback for testing
  }
}

// Sample leads (fallback)
function getSampleLeads(industry) {
  return [
    {
      email: 'sample-' + industry.replace(/\s+/g, '-').toLowerCase() + '@test.com',
      name: 'Sample Contact',
      firstName: 'Sample',
      company: industry + ' Business',
      industry: industry
    }
  ];
}

// Get existing emails
function getExistingEmails(sheet) {
  var data = sheet.getDataRange().getValues();
  var emails = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      emails.push(data[i][0].toLowerCase());
    }
  }
  return emails;
}

/**
 * IRIS EMAIL SENDER - Run at 9:00 AM
 * Sends polished emails with full service pitch and Calendly link
 */
function sendEmails() {
  try {
    var ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
    var leadsSheet = ss.getSheetByName('Leads');
    var trackingSheet = ss.getSheetByName('Email Tracking');
    
    if (!leadsSheet) {
      Logger.log('ERROR: Create a tab named "Leads"');
      return;
    }
    
    // Create tracking sheet if missing
    if (!trackingSheet) {
      trackingSheet = ss.insertSheet('Email Tracking');
      trackingSheet.appendRow(['Email', 'Business', 'Sent', 'Date', 'Status']);
    }
    
    // Get leads
    var data = leadsSheet.getDataRange().getValues();
    Logger.log('Found ' + (data.length - 1) + ' leads');
    
    if (data.length < 2) {
      Logger.log('No leads found. Add emails to Leads sheet.');
      return;
    }
    
    // Send to first lead (test mode - change to loop for all)
    var lead = {
      email: data[1][0],
      business: data[1][1] || 'your business',
      fullName: data[1][2] || 'there',
      firstName: extractFirstName(data[1][2]) || 'there'
    };
    
    Logger.log('Processing: ' + lead.email);
    
    // Check if already sent
    var trackingData = trackingSheet.getDataRange().getValues();
    var alreadySent = false;
    for (var i = 1; i < trackingData.length; i++) {
      if (trackingData[i][0] === lead.email) {
        alreadySent = true;
        break;
      }
    }
    
    if (alreadySent) {
      Logger.log('Already sent to ' + lead.email);
      return;
    }
    
    // Build email with full service pitch
    var subject = buildSubject(lead);
    var body = buildEmailBody(lead);
    
    GmailApp.sendEmail(lead.email, subject, body, {
      from: MY_EMAIL,
      name: 'Alec Kennedy - The One Group',
      replyTo: MY_EMAIL
    });
    
    // Log it
    trackingSheet.appendRow([lead.email, lead.business, 'Yes', new Date(), 'Sent']);
    
    Logger.log('✅ Email sent to: ' + lead.email);
    GmailApp.sendEmail(MY_EMAIL, 'Iris: Email sent', 'Sent to: ' + lead.email);
    
  } catch (e) {
    Logger.log('ERROR: ' + e.message);
  }
}

// Extract first name from full name
function extractFirstName(fullName) {
  if (!fullName) return 'there';
  return fullName.split(' ')[0];
}

// Build personalized subject line
function buildSubject(lead) {
  var subjects = [
    'Quick question about ' + lead.business,
    lead.firstName + ', quick question about ' + lead.business,
    'Quick question for ' + lead.firstName + ' at ' + lead.business,
    lead.firstName + ' - question about your automation',
    '15 minutes that could save ' + lead.firstName + ' 10+ hours/week'
  ];
  
  // Rotate subjects or pick first
  return subjects[0];
}

// Build comprehensive email with full service pitch
function buildEmailBody(lead) {
  return 'Hi ' + lead.firstName + ',\n\n' +
    'I came across ' + lead.business + ' while researching local businesses in South Florida.\n\n' +
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
    'I recently helped a ' + lead.business + ' in South Florida save 15 hours per week on administrative tasks and increase their response rate by 40%.\n\n' +
    'Worth a quick 15-minute call to see if there\'s a fit for your business?\n\n' +
    'Book a time that works for you: ' + CALENDLY_LINK + '\n\n' +
    'Or just reply to this email and I\'ll send over a few times.\n\n' +
    'Best,\n' +
    'Alec Kennedy\n' +
    'Founder, The One Group\n' +
    'https://theonegroup.info\n\n' +
    'P.S. Not the right time? Just reply "not now" and I\'ll check back in a few months.';
}

/**
 * TEST FUNCTIONS
 * Use these to test each part
 */
function testApollo() {
  Logger.log('Testing Apollo search...');
  var leads = searchApollo('HVAC contractor Miami', 2);
  Logger.log('Found: ' + leads.length + ' leads');
  for (var i = 0; i < leads.length; i++) {
    Logger.log(leads[i].email + ' (' + leads[i].firstName + ') at ' + leads[i].company);
  }
}

function testIris() {
  Logger.log('Testing Iris email sender with updated pitch...');
  sendEmails();
}

function testEmailBody() {
  var testLead = {
    firstName: 'John',
    business: 'Test Business',
    email: 'test@example.com'
  };
  Logger.log('=== TEST EMAIL ===');
  Logger.log(buildSubject(testLead));
  Logger.log('');
  Logger.log(buildEmailBody(testLead));
}

function testBoth() {
  Logger.log('=== Testing Apollo ===');
  testApollo();
  Logger.log('=== Testing Iris ===');
  testIris();
}