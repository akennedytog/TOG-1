#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const trackerPath = process.argv[2] || '/Users/aleckennedy/.openclaw/workspace/leads/website-sales-tracker-33309.csv';

const RULES = {
  new: { nextStage: 'call_attempt_1', nextType: 'email_followup_1', days: 2, status: 'contacting' },
  call_attempt_1: { nextStage: 'email_followup_1', nextType: 'email_followup_2', days: 3, status: 'contacting' },
  email_followup_1: { nextStage: 'email_followup_2', nextType: 'close_file_email', days: 3, status: 'contacting' },
  email_followup_2: { nextStage: 'close_file_email', nextType: 'reopen_email', days: 4, status: 'contacting' },
  close_file_email: { nextStage: 'reopen_email', nextType: 'nurture_monthly', days: 10, status: 'nurture' },
  reopen_email: { nextStage: 'nurture_monthly', nextType: 'nurture_monthly', days: 30, status: 'nurture' },
  nurture_monthly: { nextStage: 'nurture_monthly', nextType: 'nurture_monthly', days: 30, status: 'nurture' }
};

function parseCsv(content) {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      if (value.length > 0 || row.length > 0) {
        row.push(value);
        rows.push(row);
        row = [];
        value = '';
      }
    } else {
      value += char;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const [headers, ...dataRows] = rows;
  return {
    headers,
    rows: dataRows.map((values) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] ?? '';
      });
      return obj;
    })
  };
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(headers, rows) {
  const out = [headers.join(',')];
  rows.forEach((row) => out.push(headers.map((h) => csvEscape(row[h])).join(',')));
  return `${out.join('\n')}\n`;
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isDue(dateStr, today) {
  return dateStr && dateStr <= today;
}

function main() {
  if (!fs.existsSync(trackerPath)) {
    console.error(`Tracker not found: ${trackerPath}`);
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const raw = fs.readFileSync(trackerPath, 'utf8');
  const { headers, rows } = parseCsv(raw);

  let updated = 0;
  for (const row of rows) {
    const closed = row.status === 'closed_won' || row.status === 'closed_lost';
    if (closed || !isDue(row.next_action_date, today)) continue;

    const current = row.stage || 'new';
    const rule = RULES[current] || RULES.new;

    row.last_touch_date = today;
    row.stage = rule.nextStage;
    row.next_action_type = rule.nextType;
    row.next_action_date = addDays(today, rule.days);
    row.status = rule.status;
    row.touch_count = String((Number(row.touch_count || 0) + 1));
    updated++;
  }

  fs.writeFileSync(trackerPath, toCsv(headers, rows));
  console.log(`Updated ${updated} rows in ${path.basename(trackerPath)} on ${today}`);
}

main();
