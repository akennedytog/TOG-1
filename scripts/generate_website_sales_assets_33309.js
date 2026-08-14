#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const workspace = '/Users/aleckennedy/.openclaw/workspace';
const leadsDir = path.join(workspace, 'leads');

const inputPath = path.join(leadsDir, 'website-outreach-queue-33309.csv');
const outputEmailCsv = path.join(leadsDir, 'website-email-batch-top20-33309.csv');
const outputEmailMd = path.join(leadsDir, 'website-email-batch-top20-33309.md');
const outputBriefsMd = path.join(leadsDir, 'website-mockup-briefs-33309.md');
const outputTrackerCsv = path.join(leadsDir, 'website-sales-tracker-33309.csv');

const CATEGORY_ORDER = {
  roofing: 1,
  plumbers: 2,
  electricians: 3,
  hvac: 4,
  'auto repair': 5,
  dentists: 9
};

const CATEGORY_OFFER = {
  roofing: {
    headline: 'More storm-season calls in 33309',
    proof: 'Financing CTA + emergency roof repair hero + review proof block',
    kpi: 'Qualified quote requests'
  },
  plumbers: {
    headline: 'More emergency plumbing calls',
    proof: '24/7 emergency CTA + service-area page + click-to-call sticky header',
    kpi: 'Phone calls from website'
  },
  electricians: {
    headline: 'More same-day electrical jobs',
    proof: 'Panel upgrade page + emergency outage CTA + trust/review section',
    kpi: 'Booked estimate requests'
  },
  hvac: {
    headline: 'More AC repair bookings this month',
    proof: 'Repair + maintenance split offers + service request form + call tracking',
    kpi: 'Service requests per week'
  },
  'auto repair': {
    headline: 'More repair bookings from local search',
    proof: 'Service menu + book-now CTA + map/areas served section',
    kpi: 'Appointment form submissions'
  },
  dentists: {
    headline: 'More new patient appointments',
    proof: 'Insurance/payment highlights + online booking CTA + review proof',
    kpi: 'New patient requests'
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
  return dataRows.map((values) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? '';
    });
    return obj;
  });
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function titleCase(s) {
  return (s || '').replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function buildEmail(lead) {
  const category = lead.category || 'service business';
  const cfg = CATEGORY_OFFER[category] || CATEGORY_OFFER['auto repair'];
  const subject = `Quick website example for ${lead.business_name}`;

  const body = [
    `Hi ${lead.business_name} team,`,
    '',
    `I’m Alec with The One Group in South Florida. I noticed your current web presence is mostly ${lead.web_status.replace(/_/g, ' ')}.`,
    '',
    `I made a quick homepage concept for ${lead.business_name} focused on ${cfg.headline.toLowerCase()}.`,
    `Mockup: {{MOCKUP_LINK}}`,
    `40-sec walkthrough: {{LOOM_LINK}}`,
    '',
    'If you want this live, I can ship a conversion-first site in 7 days with:',
    `- ${cfg.proof}`,
    '- Click-to-call and quote form',
    '- Mobile-first pages and basic local SEO structure',
    '',
    `Primary KPI we would track: ${cfg.kpi}.`,
    '',
    'Reply YES and I’ll send a one-page rollout plan and timeline.',
    '',
    '- Alec Kennedy',
    'The One Group',
    'akennedy@theonegroup.info'
  ].join('\n');

  return { subject, body, kpi: cfg.kpi, proof: cfg.proof };
}

function buildBriefs(leads) {
  const categories = [...new Set(leads.map((l) => l.category))];
  const lines = ['# Website Mockup Briefs - 33309', '', 'Use these to generate fast one-page visual examples before outreach.', ''];

  for (const category of categories) {
    const cfg = CATEGORY_OFFER[category] || CATEGORY_OFFER['auto repair'];
    lines.push(`## ${titleCase(category)}`);
    lines.push(`- Target outcome: ${cfg.headline}`);
    lines.push('- Section order:');
    lines.push('  1) Hero with city + service + emergency CTA');
    lines.push('  2) 3 trust blocks (reviews, years in business, license/insured)');
    lines.push('  3) Service cards (top 3 money services)');
    lines.push('  4) Service area map/list for 33309 + nearby cities');
    lines.push('  5) Sticky CTA + quote form');
    lines.push(`- Proof element focus: ${cfg.proof}`);
    lines.push(`- KPI shown on mockup footer: ${cfg.kpi}`);
    lines.push('- Visual style: bold CTA color, clear phone button, no clutter.');
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function main() {
  const raw = fs.readFileSync(inputPath, 'utf8');
  const leads = parseCsv(raw)
    .filter((l) => CATEGORY_ORDER[l.category] <= 5)
    .sort((a, b) => {
      const pA = Number(a.priority_score || 0);
      const pB = Number(b.priority_score || 0);
      if (pA !== pB) return pB - pA;
      const cA = CATEGORY_ORDER[a.category] ?? 99;
      const cB = CATEGORY_ORDER[b.category] ?? 99;
      if (cA !== cB) return cA - cB;
      return a.business_name.localeCompare(b.business_name);
    })
    .slice(0, 20);

  const today = new Date().toISOString().slice(0, 10);

  const emailRows = leads.map((lead, idx) => {
    const email = buildEmail(lead);
    return {
      rank: idx + 1,
      business_name: lead.business_name,
      category: lead.category,
      phone: lead.phone,
      address: lead.address,
      web_status: lead.web_status,
      email_subject: email.subject,
      email_body: email.body,
      mockup_link: '{{MOCKUP_LINK}}',
      loom_link: '{{LOOM_LINK}}',
      kpi: email.kpi,
      listing_url: lead.notes
    };
  });

  const trackerRows = leads.map((lead, idx) => {
    const email = buildEmail(lead);
    return {
      lead_id: `33309_${String(idx + 1).padStart(3, '0')}`,
      business_name: lead.business_name,
      category: lead.category,
      phone: lead.phone,
      status: 'new',
      stage: 'new',
      last_touch_date: '',
      next_action_date: today,
      next_action_type: 'call_then_email',
      touch_count: 0,
      mockup_status: 'pending',
      mockup_link: '',
      loom_link: '',
      email_subject: email.subject,
      notes: ''
    };
  });

  const mdLines = ['# Top 20 Outreach Email Batch - 33309', '', `Generated: ${today}`, '', 'Each row has a ready-to-send email body plus placeholders for mockup and Loom links.', '', '| Rank | Business | Category | Phone |', '|---|---|---|---|'];
  emailRows.forEach((r) => mdLines.push(`| ${r.rank} | ${r.business_name} | ${r.category} | ${r.phone} |`));
  mdLines.push('');
  mdLines.push('Use cadence: Day 1 call+email, Day 3 follow-up, Day 6 close-file, Day 10 re-open.');

  fs.writeFileSync(outputEmailCsv, toCsv(emailRows));
  fs.writeFileSync(outputEmailMd, `${mdLines.join('\n')}\n`);
  fs.writeFileSync(outputBriefsMd, buildBriefs(leads));
  fs.writeFileSync(outputTrackerCsv, toCsv(trackerRows));

  console.log('Generated:');
  console.log(outputEmailCsv);
  console.log(outputEmailMd);
  console.log(outputBriefsMd);
  console.log(outputTrackerCsv);
  console.log(`Leads in batch: ${emailRows.length}`);
}

main();
