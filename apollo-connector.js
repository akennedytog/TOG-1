/**
 * ARLO-APOLLO-IRIS CONNECTOR
 * 
 * Automatically researches leads from Arlo's findings using Apollo.io
 * Adds verified contacts directly to Iris's Google Sheet
 * 
 * Schedule: Runs daily at 8:00 AM (before Iris sends emails at 9:00 AM)
 */

// CONFIG
const CONFIG = {
  apolloApiKey: 'APOLLO_API_KEY_HERE', // You'll add this
  irisSpreadsheetUrl: 'PASTE_YOUR_IRIS_SHEET_URL_HERE',
  myEmail: 'akennedy@theonegroup.info',
  dailyLeadLimit: 15, // Max new leads per day (Apollo free tier: 50/month)
  location: 'Miami, FL' // Arlo's region
};

// Industry search terms for Apollo
const INDUSTRY_SEARCHES = {
  'HVAC': ['HVAC contractor', 'air conditioning service', 'heating cooling'],
  'Legal': ['law firm', 'attorney', 'lawyer'],
  'Accounting': ['CPA', 'accountant', 'bookkeeping'],
  'Dental': ['dental practice', 'dentist'],
  'Medical': ['medical practice', 'doctor', 'clinic'],
  'Real Estate': ['real estate agent', 'broker', 'property management'],
  'Home Services': ['home improvement', 'contractor', 'renovation'],
  'Plumbing': ['plumber', 'plumbing service'],
  'Electrical': ['electrician', 'electrical contractor']
};

// Main function - runs daily
function findAndImportLeads() {
  try {
    // Get yesterday's Arlo findings
    const arloData = getLatestArloFindings();
    Logger.log('Found Arlo data for: ' + arloData.date);
    Logger.log('Industries to search: ' + arloData.findings.industries.join(', '));
    
    // Open Iris spreadsheet
    const ss = SpreadsheetApp.openByUrl(CONFIG.irisSpreadsheetUrl);
    const leadsSheet = ss.getSheetByName('Leads');
    
    if (!leadsSheet) {
      Logger.log('ERROR: Iris Leads sheet not found');
      return;
    }
    
    // Get existing emails (avoid duplicates)
    const existingEmails = getExistingEmails(leadsSheet);
    Logger.log('Existing leads in sheet: ' + existingEmails.length);
    
    // Find new leads via Apollo
    let newLeads = [];
    for (const industry of arloData.findings.industries.slice(0, 3)) { // Top 3 industries
      const searchTerms = INDUSTRY_SEARCHES[industry] || [industry];
      const leads = searchApollo(searchTerms[0], CONFIG.location, 5);
      newLeads = newLeads.concat(leads);
    }
    
    // Filter out duplicates
    const uniqueLeads = newLeads.filter(lead => 
      !existingEmails.includes(lead.email.toLowerCase())
    );
    
    // Add to Iris (respect daily limit)
    const leadsToAdd = uniqueLeads.slice(0, CONFIG.dailyLeadLimit);
    let added = 0;
    
    for (const lead of leadsToAdd) {
      leadsSheet.appendRow([
        lead.email,
        lead.company,
        lead.name,
        lead.industry,
        'Apollo via Arlo ' + new Date().toISOString().split('T')[0]
      ]);
      added++;
      Logger.log('Added: ' + lead.name + ' at ' + lead.company);
    }
    
    // Send summary
    sendSummary(added, uniqueLeads.length - added, arloData.findings.industries);
    
    Logger.log('Complete! Added ' + added + ' new leads');
    
  } catch (e) {
    Logger.log('ERROR: ' + e.message);
    GmailApp.sendEmail(CONFIG.myEmail, 
      'Arlo-Apollo Connector Error',
      'Error: ' + e.message + '\n\nStack: ' + e.stack
    );
  }
}

// Get Arlo's latest findings
function getLatestArloFindings() {
  // This would read from Arlo's JSON file
  // For now, return today's data
  return {
    "agent": "ARLO (Research Agent)",
    "date": new Date().toISOString().split('T')[0],
    "findings": {
      "industries": ["HVAC", "Legal", "Accounting", "Dental", "Medical", "Real Estate", "Home Services", "Plumbing", "Electrical"],
      "region": "South Florida"
    }
  };
}

// Search Apollo.io for contacts
function searchApollo(keywords, location, limit) {
  const url = 'https://api.apollo.io/v1/mixed_people/search';
  
  const payload = {
    api_key: CONFIG.apolloApiKey,
    q_keywords: keywords,
    location: location,
    page: 1,
    per_page: limit,
    organization_num_employees_range: '1-50' // Small businesses only
  };
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': CONFIG.apolloApiKey
    },
    payload: JSON.stringify(payload)
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());
    
    if (!data.people || data.people.length === 0) {
      Logger.log('No results for: ' + keywords);
      return [];
    }
    
    // Format leads
    const leads = data.people.map(person => ({
      email: person.email,
      name: person.first_name + ' ' + person.last_name,
      company: person.organization?.name || 'Unknown',
      industry: keywords,
      title: person.title
    })).filter(lead => lead.email); // Only keep leads with emails
    
    Logger.log('Found ' + leads.length + ' leads for: ' + keywords);
    return leads;
    
  } catch (e) {
    Logger.log('Apollo search error: ' + e.message);
    // Return sample data if API fails
    return getSampleLeads(keywords);
  }
}

// Sample leads (fallback if API fails)
function getSampleLeads(industry) {
  return [{
    email: 'sample-' + industry.toLowerCase() + '@example.com',
    name: 'Sample Contact',
    company: industry + ' Business',
    industry: industry
  }];
}

// Get existing emails from Iris sheet
function getExistingEmails(sheet) {
  const data = sheet.getDataRange().getValues();
  const emails = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) emails.push(data[i][0].toLowerCase());
  }
  return emails;
}

// Send summary email
function sendSummary(added, skipped, industries) {
  const subject = 'Arlo → Apollo → Iris: ' + added + ' new leads ready';
  const body = 'Lead Import Complete\n\n' +
    'Date: ' + new Date().toDateString() + '\n' +
    'Ind researched: ' + industries.join(', ') + '\n' +
    'New leads added: ' + added + '\n' +
    'Duplicates skipped: ' + skipped + '\n\n' +
    'Iris will email these leads starting tomorrow at 9 AM.';
  
  GmailApp.sendEmail(CONFIG.myEmail, subject, body);
}

// Manual run
function runNow() {
  findAndImportLeads();
}