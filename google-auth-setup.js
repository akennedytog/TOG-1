#!/usr/bin/env node
/**
 * Google OAuth Setup Script
 * Creates Google Form and Sheet for Miami Music Week
 * Uses Google Apps Script (no local auth needed)
 */

import fs from 'fs';

// The credentials file exists
const CREDS_PATH = `${process.env.HOME}/.openclaw/workspace/google-credentials.json`;

console.log('✅ Credentials file found:', CREDS_PATH);

// Since we can't use gog (Xcode too old), here's the alternative:

const SETUP_INSTRUCTIONS = `
================================================================
GOOGLE OAUTH SETUP - MANUAL STEPS REQUIRED
================================================================

Since Xcode needs updating (you have 16.4, need 26.3), 
here's the fastest path to get Google Forms working:

OPTION 1: Use Google Apps Script (Recommended - No OAuth Needed)
--------------------------------------------------------------------
1. Go to https://script.google.com
2. Create new project
3. Paste this code:

function createMMWForm() {
  // Create the form
  var form = FormApp.create('Miami Music Week 2026 - Event Submission');
  form.setDescription('Submit an event for the community-powered MMW 2026 guide');
  form.setConfirmationMessage('Thanks! Your event will be reviewed within 24 hours.');
  
  // Add questions
  form.addTextItem().setTitle('Event Name').setRequired(true);
  form.addTextItem().setTitle('Venue / Location').setRequired(true);
  form.addDateItem().setTitle('Event Date').setRequired(true);
  form.addTextItem().setTitle('Start Time').setHelpText('e.g., 10:00 PM').setRequired(true);
  form.addTextItem().setTitle('End Time (Optional)').setHelpText('e.g., 6:00 AM');
  form.addTextItem().setTitle('Ticket Price').setHelpText('e.g., $50-$100').setRequired(true);
  
  // Genre dropdown
  var genre = form.addListItem().setTitle('Genre / Music Style').setRequired(true);
  genre.setChoiceValues(['House', 'Techno', 'Tech House', 'Deep House', 'EDM / Dance Pop', 'Trance', 'Drum & Bass', 'Hip Hop / R&B', 'Multi-Genre', 'Other']);
  
  form.addTextItem().setTitle('Ticket Link').setHelpText('Direct URL to buy tickets').setRequired(true);
  form.addParagraphTextItem().setTitle('Event Description (Optional)').setHelpText('Lineup, special notes, etc.');
  form.addTextItem().setTitle('Your Email').setHelpText('For confirmation when added').setRequired(true);
  form.addTextItem().setTitle('Your Twitter Handle (Optional)').setHelpText('e.g., @yourhandle - we will give you credit!');
  
  // Link to spreadsheet
  var sheet = SpreadsheetApp.create('MMW 2026 Event Submissions');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  
  // Make sheet public
  sheet.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  Logger.log('Form URL: ' + form.getPublishedUrl());
  Logger.log('Sheet ID: ' + sheet.getId());
  Logger.log('Form Edit URL: ' + form.getEditUrl());
}

4. Click Run (▶️) 
5. Authorize when prompted
6. Check View → Logs for the URLs
7. Copy Form URL and Sheet ID to the HTML file

OPTION 2: Update Xcode (If you want full OAuth)
------------------------------------------------
1. Open App Store
2. Search "Xcode"
3. Click Update (this may take 30+ minutes)
4. Then run: brew install steipete/tap/gogcli
5. Then I can complete OAuth authentication

OPTION 3: Direct Google Form Creation (Fastest)
------------------------------------------------
1. Go to https://forms.google.com
2. Create blank form
3. Add these questions:
   - Event Name (short answer, required)
   - Venue (short answer, required)
   - Date (date, required)
   - Start Time (short answer, required)
   - End Time (short answer)
   - Price (short answer, required)
   - Genre (multiple choice: House, Techno, Tech House, Deep House, EDM, Trance, Drum & Bass, Hip Hop, Other)
   - Ticket Link (short answer, required)
   - Description (paragraph)
   - Your Email (short answer, required)
   - Twitter Handle (short answer)

4. Responses → Create Spreadsheet
5. Share spreadsheet: Anyone with link can view
6. Send me the Form URL and Sheet ID

RECOMMENDED: Option 1 or 3 (5 minutes vs 30+ minutes for Xcode update)

================================================================
`;

console.log(SETUP_INSTRUCTIONS);

// Save instructions to file
fs.writeFileSync(`${process.env.HOME}/.openclaw/workspace/GOOGLE_SETUP_INSTRUCTIONS.txt`, SETUP_INSTRUCTIONS);

console.log('📄 Instructions saved to: GOOGLE_SETUP_INSTRUCTIONS.txt');