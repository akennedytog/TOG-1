// Arlo to Iris Lead Importer
// Run this daily to sync leads from Arlo's research to Iris's Google Sheet

function importArloLeadsToIris() {
  // Arlo's findings file
  const arloData = {
    "agent": "ARLO (Research Agent)",
    "date": "2026-04-01",
    "findings": {
      "total_leads": 20,
      "region": "South Florida",
      "industries": ["HVAC", "Legal", "Accounting", "Dental", "Medical", "Real Estate", "Home Services", "Plumbing", "Electrical"],
      "leads_summary": {
        "HVAC": { "count": 2, "notes": "Residential and commercial service providers" },
        "Legal": { "count": 2, "notes": "Small law firms and solo practitioners" },
        "Accounting": { "count": 2, "notes": "CPAs and bookkeeping services" },
        "Dental": { "count": 2, "notes": "Private dental practices" },
        "Medical": { "count": 2, "notes": "Specialist clinics and practices" },
        "Real Estate": { "count": 3, "notes": "Brokerages and property management" },
        "Home Services": { "count": 2, "notes": "General home improvement contractors" },
        "Plumbing": { "count": 3, "notes": "Emergency and residential plumbing" },
        "Electrical": { "count": 2, "notes": "Licensed electricians and contractors" }
      }
    }
  };
  
  // Open Iris spreadsheet (paste your URL here)
  const SPREADSHEET_URL = 'PASTE_YOUR_SPREADSHEET_URL_HERE';
  const ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  const leadsSheet = ss.getSheetByName('Leads');
  
  if (!leadsSheet) {
    Logger.log('ERROR: Create "Leads" tab first');
    return;
  }
  
  // Get existing emails to avoid duplicates
  const existingData = leadsSheet.getDataRange().getValues();
  const existingEmails = [];
  for (let i = 1; i < existingData.length; i++) {
    if (existingData[i][0]) existingEmails.push(existingData[i][0].toLowerCase());
  }
  
  // Generate sample leads based on Arlo's industry data
  // NOTE: Replace these with real emails from your research
  const industries = arloData.findings.industries;
  let added = 0;
  
  // Sample leads - REPLACE WITH REAL DATA
  const sampleLeads = [
    { email: 'info@miami-hvac.com', business: 'Miami HVAC Services', contact: 'Owner', industry: 'HVAC' },
    { email: 'contact@coastallaw.com', business: 'Coastal Law Partners', contact: 'Partner', industry: 'Legal' },
    { email: 'admin@palmbeach-dental.com', business: 'Palm Beach Dental', contact: 'Dr. Smith', industry: 'Dental' },
    { email: 'hello@broward-realty.com', business: 'Broward Realty Group', contact: 'Broker', industry: 'Real Estate' },
    { email: 'service@plumbing-pros.com', business: 'Plumbing Pros', contact: 'Manager', industry: 'Plumbing' }
  ];
  
  for (const lead of sampleLeads) {
    // Skip if already in sheet
    if (existingEmails.includes(lead.email.toLowerCase())) {
      Logger.log('Skipping duplicate: ' + lead.email);
      continue;
    }
    
    // Add to sheet
    leadsSheet.appendRow([
      lead.email,
      lead.business,
      lead.contact,
      lead.industry,
      'Arlo ' + arloData.date
    ]);
    
    added++;
    Logger.log('Added: ' + lead.email);
  }
  
  Logger.log('Total added: ' + added);
  
  // Send summary email
  GmailApp.sendEmail(
    'akennedy@theonegroup.info',
    'Arlo → Iris: ' + added + ' new leads imported',
    'Arlo Lead Import Summary\n\n' +
    'Date: ' + new Date().toDateString() + '\n' +
    'New leads added: ' + added + '\n' +
    'Total in sheet: ' + (existingData.length - 1 + added) + '\n\n' +
    'Iris will start emailing these leads tomorrow at 9 AM.'
  );
}

// Manual import trigger
function manualImport() {
  importArloLeadsToIris();
}