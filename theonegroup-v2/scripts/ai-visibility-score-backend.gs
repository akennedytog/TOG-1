/**
 * The One Group — AI Visibility Score Backend (Google Apps Script)
 * ===============================================================
 * Deploy this as a Google Apps Script Web App (bound to the Google Sheet that
 * captures leads). It does three things when the site form POSTs to it:
 *
 *   1. Logs the lead (name/email/industry/city/score/bucket) to the bound Sheet.
 *   2. Sends the lead their score + breakdown via Gmail (Alec's account).
 *   3. [Optional] Pushes the lead to Kit (ConvertKit) — fill in KIT_API_KEY to enable.
 *
 * SETUP (one time, ~5 min):
 *   1. Create a Google Sheet. Scripts -> App Scripts. Paste this file.
 *   2. Run `setup_` once to create the header row (authorizes the script).
 *   3. Deploy -> New deployment -> Web app:
 *        - Execute as:  Me (akennedy@theonegroup.info)
 *        - Who has access:  Anyone  (needed so the static site can POST)
 *   4. Copy the Web App URL into the Astro page:
 *        theonegroup-v2/src/pages/ai-visibility-score.astro  ->  const SCRIPT_URL = "..."
 *   5. (Optional) Put your Kit API key below to enable email-list capture.
 */

// ---- CONFIG -----------------------------------------------------------------
var SHEET_NAME = 'Leads';           // sheet tab name inside the bound spreadsheet
var SENDER_NAME = 'The One Group';
var SENDER_EMAIL = 'akennedy@theonegroup.info'; // must match your Gmail
var KIT_API_KEY = '';               // optional: Kit API key (Settings -> Advanced -> API)
var KIT_FORM_ID = '';               // optional: Kit form id (get from Kit dashboard)
// NOTE: For the Kit push to work, create these custom fields in Kit first
// (Settings -> Custom Fields): industry, city, ai_score. The v4 API ignores
// unknown field keys, so the push still succeeds but the fields won't populate.

// ---- Main entry point (called by the web form) -----------------------------
function doPost(e) {
  var out = { ok: true };
  try {
    var body = JSON.parse(e.postData.contents);
    var row = [
      new Date().toISOString(),
      body.name || '',
      body.email || '',
      body.industry || '',
      body.city || '',
      body.website || '',
      body.score != null ? Number(body.score) : '',
      body.bucket || '',
    ];

    logToSheet_(row);
    sendScoreEmail_(body);
    if (KIT_API_KEY) pushToKit_(body);

    out.lead = body.email;
  } catch (err) {
    out.ok = false;
    out.error = String(err);
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

// Support a GET test (browser visit shows it's alive).
function doGet() {
  return ContentService.createTextOutput('AI Visibility Score backend is live. POST to submit a lead.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ---- Sheet logging ----------------------------------------------------------
function logToSheet_(row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Industry', 'City', 'Website', 'Score', 'Bucket']);
  }
  sheet.appendRow(row);
}

// ---- Email the score --------------------------------------------------------
function sendScoreEmail_(b) {
  var s = Number(b.score);
  var subject = 'Your AI Visibility Score: ' + s + '/100 (' + bucketLabel_(s) + ')';
  var body = [
    'Hi ' + (b.name || 'there') + ',',
    '',
    'Thanks for taking the 60-second AI Visibility Score.',
    '',
    'Your score: ' + s + '/100 — ' + bucketLabel_(s) + '.',
    '',
    bucketBlurb_(s),
    '',
    'This is the same diagnostic we run inside our full AI Visibility Audit, which',
    'goes deeper: we actually test what ChatGPT and Google AI say about your',
    'business, find every place you drop off, and lay out the fix step by step.',
    '',
    'Want us to run the full audit for your ' + (b.industry || '') + ' business in ' +
      (b.city || 'your area') + '? Just reply to this email.',
    '',
    '— The One Group',
    'AI Visibility Audits, Optimization & Coaching for South Florida SMBs',
    'akennedy@theonegroup.info | (c) 502.403.7201 | theonegroup.info'
  ].join('\n');

  GmailApp.sendEmail(b.email, subject, body, { name: SENDER_NAME, from: SENDER_EMAIL });
}

function bucketLabel_(s) {
  if (s >= 80) return 'AI-Ready';
  if (s >= 50) return 'At Risk';
  return 'Invisible';
}
function bucketBlurb_(s) {
  if (s >= 80) return 'You show up well in AI search. A full audit verifies you stay ahead as AI answers keep evolving.';
  if (s >= 50) return 'AI may be sending some of your customers elsewhere. The full audit shows exactly where you lose them.';
  return 'You are likely losing calls to competitors right now. The full audit shows the fix, step by step.';
}

// ---- Optional Kit (ConvertKit) push -----------------------------------------
// Kit API v4 (current as of 2026). Two-step flow:
//   1. POST /v4/subscribers  -> create/upsert the subscriber (with custom fields)
//   2. POST /v4/forms/{id}/subscribers -> add them to the form (triggers the automation)
// Auth is the X-Kit-Api-Key header (NOT the old v3 api_key body param).
function pushToKit_(b) {
  if (!KIT_API_KEY) return;
  var headers = { 'X-Kit-Api-Key': KIT_API_KEY, 'Content-Type': 'application/json' };

  // Step 1: create/upsert the subscriber with custom fields.
  // Custom field KEYS must exist on the Kit account (create them in Kit first):
  //   industry, city, ai_score
  var subPayload = {
    email_address: b.email,
    first_name: b.name || '',
    state: 'active',
    fields: {
      industry: b.industry || '',
      city: b.city || '',
      ai_score: String(b.score)
    }
  };
  var subRes = UrlFetchApp.fetch('https://api.kit.com/v4/subscribers', {
    method: 'post',
    headers: headers,
    payload: JSON.stringify(subPayload),
    muteHttpExceptions: true
  });
  var subCode = subRes.getResponseCode();
  if (subCode >= 400) {
    Logger.log('Kit create-subscriber failed (' + subCode + '): ' + subRes.getContentText());
    return;
  }

  // Step 2: add to the form (only if a form id is set) -> drops them into the automation.
  if (KIT_FORM_ID) {
    var formPayload = { email_address: b.email };
    var formRes = UrlFetchApp.fetch('https://api.kit.com/v4/forms/' + KIT_FORM_ID + '/subscribers', {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(formPayload),
      muteHttpExceptions: true
    });
    var formCode = formRes.getResponseCode();
    if (formCode >= 400) {
      Logger.log('Kit add-to-form failed (' + formCode + '): ' + formRes.getContentText());
    }
  }
}

// ---- One-time setup: authorize + create header (run manually in editor) -----
function setup_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Industry', 'City', 'Website', 'Score', 'Bucket']);
  }
  Logger.log('Setup complete. Sheet: ' + ss.getName() + ' / ' + SHEET_NAME);
}
