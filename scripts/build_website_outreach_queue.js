#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const workspace = '/Users/aleckennedy/.openclaw/workspace';
const leadsPath = path.join(workspace, 'leads', 'website-leads-33309.json');
const outCsv = path.join(workspace, 'leads', 'website-outreach-queue-33309.csv');
const outMd = path.join(workspace, 'leads', 'website-sales-playbook-33309.md');

if (!fs.existsSync(leadsPath)) {
  console.error(`Missing leads file: ${leadsPath}`);
  process.exit(1);
}

const leads = JSON.parse(fs.readFileSync(leadsPath, 'utf8')).slice(0, 40);

function angleFor(category) {
  if (category.includes('plumber') || category.includes('hvac') || category.includes('electric')) {
    return 'emergency calls + quote requests';
  }
  if (category.includes('roof')) {
    return 'storm-season lead capture + financing pages';
  }
  if (category.includes('auto repair')) {
    return 'service booking + map pack trust';
  }
  if (category.includes('dentist')) {
    return 'new patient bookings + insurance pages';
  }
  return 'more qualified inbound leads';
}

function offerFor(category) {
  if (category.includes('plumber') || category.includes('hvac') || category.includes('electric')) {
    return '3-page service site + call tracking + quote form in 7 days';
  }
  if (category.includes('roof')) {
    return 'roofing landing page stack + financing CTA + review embeds';
  }
  if (category.includes('auto repair')) {
    return 'service menu + appointment form + local SEO page set';
  }
  if (category.includes('dentist')) {
    return 'patient-first site + service pages + booking funnel';
  }
  return 'fast local business site + lead form + analytics';
}

const headers = [
  'priority_score',
  'business_name',
  'category',
  'phone',
  'address',
  'web_status',
  'pitch_angle',
  'offer',
  'call_opener',
  'status',
  'next_action_date',
  'notes'
];

const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;

const rows = leads.map((l) => {
  const angle = angleFor(l.category);
  const offer = offerFor(l.category);
  const opener = `Hi, is this ${l.business_name}? I help ${l.category} businesses in 33309 get more ${angle}. I noticed your web presence is ${l.web_status.replaceAll('_', ' ')}. Could I show you a 1-page mockup for your business this week?`;
  return {
    priority_score: l.priority_score,
    business_name: l.business_name,
    category: l.category,
    phone: l.phone,
    address: l.address,
    web_status: l.web_status,
    pitch_angle: angle,
    offer,
    call_opener: opener,
    status: 'new',
    next_action_date: new Date().toISOString().slice(0, 10),
    notes: l.listing_url
  };
});

const csv = [headers.join(',')]
  .concat(rows.map((r) => headers.map((h) => esc(r[h])).join(',')))
  .join('\n');

fs.writeFileSync(outCsv, csv);

const top10 = rows.slice(0, 10);
let md = '# 33309 Website Sales Playbook\n\n';
md += '## Offer\n';
md += '- Primary: 7-day website launch for local service businesses\n';
md += '- Promise: more calls + quote requests, not just a pretty site\n\n';
md += '## Daily Workflow\n';
md += '1. Call top 15 leads from `website-outreach-queue-33309.csv`.\n';
md += '2. Send same-day follow-up SMS with your offer and callback number.\n';
md += '3. Build 1 quick homepage mockup for hot leads within 24h.\n';
md += '4. Close with setup fee + monthly care plan.\n\n';
md += '## Top 10 to Contact First\n';
for (const r of top10) {
  md += `- ${r.business_name} (${r.category}) | ${r.phone} | ${r.address} | ${r.web_status}\n`;
}
md += '\n## Phone Script (Short)\n';
md += '- “I help local service companies in 33309 turn missed calls into booked jobs with fast websites and quote funnels. I noticed your current web presence is weak. Want me to send a quick mockup for your brand?”\n';
md += '\n## SMS Follow-up Template\n';
md += '- “Hey {name}, this is Alec with The One Group. I called about helping {business} get more local leads with a better website + quote flow. I can send a quick homepage mockup this week. Want me to text it here?”\n';

fs.writeFileSync(outMd, md);

console.log(`Wrote ${rows.length} outreach rows:`);
console.log(`- ${outCsv}`);
console.log(`- ${outMd}`);
