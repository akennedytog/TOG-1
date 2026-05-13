#!/usr/bin/env node
/**
 * Google Sheets Integration for The One Group
 * Creates and updates tracking spreadsheets
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DATA_DIR = path.join(process.cwd(), 'data');
const SCRAPED_FILE = path.join(DATA_DIR, 'scraped_leads.json');
const SHEETS_DIR = path.join(DATA_DIR, 'sheets');

// Ensure directories exist
if (!fs.existsSync(SHEETS_DIR)) fs.mkdirSync(SHEETS_DIR, { recursive: true });

function loadLeads() {
  try {
    return JSON.parse(fs.readFileSync(SCRAPED_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function generateGoogleSheetsCSV() {
  const leads = loadLeads();
  
  // Headers for Google Sheets
  const headers = [
    'Company Name',
    'Contact Name',
    'Industry',
    'City',
    'Phone',
    'Email',
    'Website',
    'Address',
    'Employees',
    'Rating',
    'Reviews',
    'Score',
    'Priority',
    'Status',
    'Date Added',
    'Last Contact',
    'Next Action',
    'Next Action Date',
    'Notes',
    'Email Sent',
    'Response Received',
    'Meeting Booked',
    'Deal Value',
    'Deal Status'
  ];
  
  // Map leads to rows
  const rows = leads.map(l => [
    l.name,
    l.contact_name,
    l.industry,
    l.city,
    l.phone,
    l.email || '',
    l.website,
    l.address,
    l.employees,
    l.rating,
    l.reviews,
    l.score,
    l.priority,
    l.status,
    l.scraped_at?.split('T')[0] || '',
    l.last_contact || '',
    l.next_action || '',
    l.next_action_date?.split('T')[0] || '',
    l.notes || '',
    l.outreach?.email_sent ? 'Yes' : 'No',
    l.outreach?.response_received ? 'Yes' : 'No',
    l.outreach?.meeting_booked ? 'Yes' : 'No',
    l.deal_value || '',
    l.deal_status || ''
  ]);
  
  // Create CSV
  const csv = [headers.join(','), ...rows.map(row => 
    row.map(cell => {
      // Escape cells with commas or quotes
      const str = String(cell || '');
      if (str.includes(',') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  )].join('\n');
  
  // Save CSV
  const timestamp = new Date().toISOString().split('T')[0];
  const csvPath = path.join(SHEETS_DIR, `leads_tracking_${timestamp}.csv`);
  fs.writeFileSync(csvPath, csv);
  
  return { csv, csvPath, count: rows.length };
}

function generateSummaryReport() {
  const leads = loadLeads();
  
  const stats = {
    total: leads.length,
    by_industry: {},
    by_city: {},
    by_status: {},
    by_priority: {},
    with_email: leads.filter(l => l.email).length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    meetings: leads.filter(l => l.outreach?.meeting_booked).length,
    pipeline_value: leads
      .filter(l => ['qualified', 'proposal_sent'].includes(l.status))
      .reduce((sum, l) => sum + (l.deal_value || 2500), 0)
  };
  
  leads.forEach(l => {
    stats.by_industry[l.industry] = (stats.by_industry[l.industry] || 0) + 1;
    stats.by_city[l.city] = (stats.by_city[l.city] || 0) + 1;
    stats.by_status[l.status] = (stats.by_status[l.status] || 0) + 1;
    stats.by_priority[l.priority] = (stats.by_priority[l.priority] || 0) + 1;
  });
  
  return stats;
}

function createSheetsUploadInstructions() {
  const { csvPath, count } = generateGoogleSheetsCSV();
  const stats = generateSummaryReport();
  
  const instructions = `
╔══════════════════════════════════════════════════════════════════╗
║     GOOGLE SHEETS UPLOAD INSTRUCTIONS                            ║
╚══════════════════════════════════════════════════════════════════╝

📁 CSV File Created: ${csvPath}
📊 Total Records: ${count}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEPS TO UPLOAD TO GOOGLE SHEETS:

1. Open Google Sheets: https://sheets.google.com

2. Create a new spreadsheet
   Name it: "The One Group - Lead Tracking"

3. Click File → Import
   Select: Upload → Choose File
   Find: ${csvPath}

4. Import settings:
   - Import action: Create new spreadsheet
   - Separator type: Comma
   - Convert text to numbers: Yes
   - Detect dates: Yes

5. After import, format these columns:
   
   Conditional Formatting (for Status column):
   - new = gray
   - contacted = yellow
   - qualified = blue
   - proposal_sent = orange
   - closed_won = green
   - closed_lost = red

6. Share with your team:
   Click Share → Add emails → "Can edit"

7. Set up automation (optional):
   - Extensions → Apps Script
   - Create daily email reminder

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 CURRENT PIPELINE STATS:

Total Leads: ${stats.total}
With Email: ${stats.with_email} (${((stats.with_email/stats.total)*100).toFixed(0)}%)
Contacted: ${stats.contacted}
Meetings Booked: ${stats.meetings}
Pipeline Value: $${stats.pipeline_value.toLocaleString()}

By Industry:
${Object.entries(stats.by_industry).map(([k,v]) => `  ${k}: ${v}`).join('\n')}

By City:
${Object.entries(stats.by_city).map(([k,v]) => `  ${k}: ${v}`).join('\n')}

By Priority:
${Object.entries(stats.by_priority).map(([k,v]) => `  ${k}: ${v}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 READY TO SELL!

Next steps:
1. Upload CSV to Google Sheets
2. Verify email addresses (use Hunter.io if needed)
3. Send 10 emails/day from the "high" priority leads
4. Update Status column as you get responses
5. Track everything in the spreadsheet

Good luck!
`;
  
  const instructionsPath = path.join(SHEETS_DIR, 'UPLOAD_INSTRUCTIONS.txt');
  fs.writeFileSync(instructionsPath, instructions);
  
  console.log(instructions);
  
  return { csvPath, instructionsPath, stats };
}

function tryAutoUploadToSheets() {
  // Check if gog is configured
  try {
    execSync('gog auth list', { stdio: 'pipe' });
    console.log('✅ gog is configured');
    
    // Try to upload
    // This would require setting up a specific spreadsheet ID
    console.log('\n💡 To auto-upload to Google Sheets:');
    console.log('   1. Create a spreadsheet in Google Sheets');
    console.log('   2. Share it with your service account');
    console.log('   3. Get the spreadsheet ID from the URL');
    console.log('   4. Run: gog sheets update [SPREADSHEET_ID] "Sheet1!A1" --values-json ...');
    
    return true;
  } catch {
    console.log('⚠️  gog not configured for auto-upload');
    console.log('   Using CSV export instead');
    return false;
  }
}

// CLI
const [,, command] = process.argv;

switch (command) {
  case 'export':
  case 'create':
    createSheetsUploadInstructions();
    break;
    
  case 'stats':
    const stats = generateSummaryReport();
    console.log('\n📊 Pipeline Statistics\n');
    console.log(`Total Leads: ${stats.total}`);
    console.log(`With Email: ${stats.with_email}`);
    console.log(`Contacted: ${stats.contacted}`);
    console.log(`Meetings: ${stats.meetings}`);
    console.log(`Pipeline: $${stats.pipeline_value.toLocaleString()}`);
    break;
    
  case 'auto':
    tryAutoUploadToSheets();
    break;
    
  default:
    console.log(`
📊 Google Sheets Integration

Usage:
  node google_sheets.js export
    → Create CSV + upload instructions

  node google_sheets.js stats
    → Show pipeline statistics

  node google_sheets.js auto
    → Attempt auto-upload (requires gog setup)

Examples:
  node google_sheets.js export
`);
}