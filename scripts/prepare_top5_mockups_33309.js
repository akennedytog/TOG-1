#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const workspace = '/Users/aleckennedy/.openclaw/workspace';
const leadsDir = path.join(workspace, 'leads');
const mockupDir = path.join(leadsDir, 'mockups', '33309');

const emailCsvPath = path.join(leadsDir, 'website-email-batch-top20-33309.csv');
const trackerCsvPath = path.join(leadsDir, 'website-sales-tracker-33309.csv');
const playbookPath = path.join(leadsDir, 'website-sales-playbook-33309.md');
const conceptsMdPath = path.join(leadsDir, 'website-mockup-concepts-top5-33309.md');
const loomMdPath = path.join(leadsDir, 'website-loom-scripts-top5-33309.md');
const DRIVE_PACK_FOLDER_LINK = 'https://drive.google.com/drive/folders/1bnP_PN-vcJjjBBTGwhzxplNdLDYAFvai?usp=drive_link';

const CATEGORY_CONFIG = {
  roofing: {
    hero: 'Get Roof Repairs Scheduled Fast',
    sub: 'Emergency response, financing options, and a clean quote funnel for 33309 homeowners.',
    bullets: ['Emergency Roof Repair CTA', 'Financing and Insurance Support', 'Storm Damage Service Area']
  },
  plumbers: {
    hero: 'Turn Plumbing Emergencies Into Booked Jobs',
    sub: 'Fast call routing, sticky click-to-call, and trust blocks that convert mobile traffic.',
    bullets: ['24/7 Emergency Banner', 'Fast Dispatch Form', 'Hydrojetting and Drain Services']
  },
  electricians: {
    hero: 'Convert Electrical Searches Into Calls',
    sub: 'Service-first messaging with panel upgrades, outage support, and estimate capture.',
    bullets: ['Panel Upgrade Offer', 'Same-Day Service CTA', 'Licensed and Insured Proof']
  },
  hvac: {
    hero: 'Book More AC and HVAC Calls',
    sub: 'Seasonal repair positioning with maintenance plan lead capture and service area trust.',
    bullets: ['AC Repair Hero', 'Maintenance Plan CTA', 'Service Area + Reviews']
  },
  'auto repair': {
    hero: 'Fill More Bays With Local Bookings',
    sub: 'Service menu clarity and faster appointment conversions from mobile visitors.',
    bullets: ['Book Appointment CTA', 'Service Menu Cards', 'Google Review Trust Block']
  },
  default: {
    hero: 'Get More Qualified Local Leads',
    sub: 'Simple service pages, clear calls to action, and a faster path from search to call.',
    bullets: ['Clear Offer Above the Fold', 'Strong Proof + Reviews', 'Lead Form + Click-to-Call']
  }
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
  const lines = [headers.join(',')];
  rows.forEach((row) => lines.push(headers.map((h) => csvEscape(row[h])).join(',')));
  return `${lines.join('\n')}\n`;
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function makeHtml(lead) {
  const cfg = CATEGORY_CONFIG[lead.category] || CATEGORY_CONFIG.default;
  const phone = lead.phone || '(954) 000-0000';
  const city = (lead.address || 'Fort Lauderdale, FL 33309').split(',')[0] || 'Fort Lauderdale';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${lead.business_name} | Website Concept</title>
  <style>
    :root { --bg:#f4f6f8; --card:#ffffff; --ink:#1b1f23; --muted:#5f6b76; --brand:#005bbb; --accent:#ffb703; }
    * { box-sizing: border-box; font-family: "Avenir Next", "Segoe UI", sans-serif; }
    body { margin:0; background:linear-gradient(180deg, #f4f6f8, #edf2f7); color:var(--ink); }
    .wrap { max-width: 960px; margin: 0 auto; padding: 28px 20px 50px; }
    .pill { display:inline-block; background:#dbeafe; color:#1e3a8a; padding:6px 10px; border-radius:999px; font-weight:700; font-size:12px; letter-spacing:.02em; }
    h1 { font-size: clamp(30px, 5vw, 44px); line-height:1.1; margin: 14px 0; }
    p { color: var(--muted); line-height:1.6; }
    .cta { display:flex; gap:10px; flex-wrap:wrap; margin:22px 0; }
    .btn { border:0; border-radius:10px; padding:12px 16px; font-weight:700; cursor:pointer; }
    .btn.primary { background:var(--brand); color:#fff; }
    .btn.alt { background:#fff; color:var(--ink); border:1px solid #d0d7de; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; margin:24px 0; }
    .card { background:var(--card); border:1px solid #d8dee4; border-radius:14px; padding:16px; box-shadow:0 6px 16px rgba(20,30,40,.05); }
    .kpi { background:#0f172a; color:#fff; border-radius:14px; padding:16px; margin-top:16px; }
    .footer { margin-top:24px; font-size:14px; color:#6b7280; }
  </style>
</head>
<body>
  <div class="wrap">
    <span class="pill">Quick Concept for ${lead.business_name}</span>
    <h1>${cfg.hero}</h1>
    <p>${cfg.sub}</p>
    <div class="cta">
      <button class="btn primary">Call ${phone}</button>
      <button class="btn alt">Request Quote</button>
    </div>

    <div class="grid">
      <div class="card"><strong>${cfg.bullets[0]}</strong><p>Designed to convert high-intent local searches into calls within 1 click.</p></div>
      <div class="card"><strong>${cfg.bullets[1]}</strong><p>Build trust early with specific proof points and clear next-step actions.</p></div>
      <div class="card"><strong>${cfg.bullets[2]}</strong><p>Local service relevance for ${city} + nearby areas improves lead quality.</p></div>
    </div>

    <div class="kpi">
      <strong>KPI Target (Week 1):</strong> +20% qualified inquiries from mobile traffic
    </div>
    <p class="footer">Prepared by The One Group as a preview concept. Next step: production site launch in 7 days.</p>
  </div>
</body>
</html>
`;
}

function patchPlaybook(top5) {
  const old = fs.existsSync(playbookPath) ? fs.readFileSync(playbookPath, 'utf8') : '# 33309 Website Sales Playbook\n';
  const today = new Date().toISOString().slice(0, 10);
  const section = [
    '## Next Step Execution (Top 5 Mockups Ready)',
    `- Updated: ${today}`,
    '- Use the concept links in your first email immediately after a same-day call attempt.',
    '- Priority today: complete the first 5 call + email sends before 1 PM local.',
    '- Ask one close question in every touch: "Want this live in 7 days?"',
    '',
    '### Top 5 Ready-to-Send Concept Links',
    ...top5.map((t) => `- ${t.business_name}: ${t.mockup_link}`),
    ''
  ].join('\n');

  const marker = '## Next Step Execution (Top 5 Mockups Ready)';
  const out = old.includes(marker) ? old.replace(new RegExp(`${marker}[\\s\\S]*$`), section) : `${old.trim()}\n\n${section}\n`;
  fs.writeFileSync(playbookPath, out);
}

function main() {
  if (!fs.existsSync(emailCsvPath) || !fs.existsSync(trackerCsvPath)) {
    console.error('Missing email or tracker CSV input.');
    process.exit(1);
  }

  fs.mkdirSync(mockupDir, { recursive: true });

  const emailCsv = parseCsv(fs.readFileSync(emailCsvPath, 'utf8'));
  const trackerCsv = parseCsv(fs.readFileSync(trackerCsvPath, 'utf8'));

  const top5 = emailCsv.rows.slice(0, 5).map((lead) => {
    const slug = slugify(lead.business_name);
    const fileName = `mockup-${String(lead.rank).padStart(2, '0')}-${slug}.html`;
    const relPath = `leads/mockups/33309/${fileName}`;
    const absPath = path.join(workspace, relPath);

    fs.writeFileSync(absPath, makeHtml(lead), 'utf8');
    return {
      ...lead,
      mockup_link: `${DRIVE_PACK_FOLDER_LINK} (file: ${fileName})`,
      local_mockup_path: absPath,
      mockup_file_name: fileName,
      rel_mockup_path: relPath
    };
  });

  const top5ByName = new Map(top5.map((t) => [t.business_name, t]));

  emailCsv.rows = emailCsv.rows.map((row) => {
    const match = top5ByName.get(row.business_name);
    if (!match) return row;
    const body = String(row.email_body || '')
      .replace('{{MOCKUP_LINK}}', match.mockup_link)
      .replace('{{LOOM_LINK}}', 'PENDING_RECORDING');
    const normalizedBody = body
      .replace(/^Mockup:\s.*$/m, `Mockup: ${match.mockup_link}`)
      .replace(/^40-sec walkthrough:\s.*$/m, '40-sec walkthrough: PENDING_RECORDING');
    return {
      ...row,
      email_body: normalizedBody,
      mockup_link: match.mockup_link,
      loom_link: 'PENDING_RECORDING'
    };
  });

  trackerCsv.rows = trackerCsv.rows.map((row) => {
    const match = top5ByName.get(row.business_name);
    if (!match) return row;
    return {
      ...row,
      mockup_status: 'ready',
      mockup_link: match.mockup_link,
      loom_link: 'PENDING_RECORDING',
      notes: 'Top-5 concept generated; send call+email today.'
    };
  });

  fs.writeFileSync(emailCsvPath, toCsv(emailCsv.headers, emailCsv.rows));
  fs.writeFileSync(trackerCsvPath, toCsv(trackerCsv.headers, trackerCsv.rows));

  const conceptMd = [
    '# Top 5 Mockup Concepts - 33309',
    '',
    'These files are ready to use as "quick examples" in outreach.',
    '',
    '| Rank | Business | Category | Mockup File |',
    '|---|---|---|---|',
    ...top5.map((t) => `| ${t.rank} | ${t.business_name} | ${t.category} | ${t.mockup_file_name} |`),
    '',
    `Google Drive folder: ${DRIVE_PACK_FOLDER_LINK}`,
    ''
  ].join('\n');
  fs.writeFileSync(conceptsMdPath, `${conceptMd}\n`, 'utf8');

  const loomMd = [
    '# Loom Scripts - Top 5 Leads (33309)',
    '',
    'Use this 35-second structure for each recording:',
    '1. "I mocked this up for your business in 33309 to show what a conversion-first site could look like."',
    '2. "I focused on one outcome: more qualified calls and quote requests."',
    '3. "If this direction makes sense, I can have the live version up in 7 days."',
    '',
    'Attach each business-specific mockup filename from `website-mockup-concepts-top5-33309.md`.',
    `Shared folder link for prospects: ${DRIVE_PACK_FOLDER_LINK}`,
    ''
  ].join('\n');
  fs.writeFileSync(loomMdPath, `${loomMd}\n`, 'utf8');

  patchPlaybook(top5);

  console.log(`Updated: ${emailCsvPath}`);
  console.log(`Updated: ${trackerCsvPath}`);
  console.log(`Created: ${conceptsMdPath}`);
  console.log(`Created: ${loomMdPath}`);
  console.log(`Mockup files: ${top5.length} in ${mockupDir}`);
}

main();
