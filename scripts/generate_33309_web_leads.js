#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const workspace = '/Users/aleckennedy/.openclaw/workspace';
const firecrawlDir = path.join(workspace, '.firecrawl');
const outDir = path.join(workspace, 'leads');

const files = [
  'yp-plumbers-33309.md',
  'yp-electricians-33309.md',
  'yp-hvac-33309.md',
  'yp-auto-repair-33309.md',
  'yp-roofing-33309.md',
  'yp-dentists-33309.md'
].map((f) => path.join(firecrawlDir, f));

const weakDomains = [
  'localsearch.com',
  'tankworth.com',
  'yellowpages.com',
  'mapquest.com',
  'facebook.com/pages',
  'wixsite.com',
  'weebly.com'
];

function parseCategory(filePath) {
  const base = path.basename(filePath);
  const m = base.match(/^yp-(.+)-33309\.md$/);
  return m ? m[1].replace(/-/g, ' ') : 'unknown';
}

function scoreLead(category, hasWebsite, weakWebsite) {
  let score = 50;
  if (!hasWebsite) score += 40;
  if (weakWebsite) score += 20;
  if (/plumber|electrician|hvac|roofing|auto repair/.test(category)) score += 10;
  return Math.min(score, 100);
}

function parseFile(filePath) {
  const category = parseCategory(filePath);
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);

  const starts = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+\d+\\\.\s+\[/.test(lines[i])) starts.push(i);
  }
  starts.push(lines.length);

  const leads = [];
  for (let s = 0; s < starts.length - 1; s++) {
    const block = lines.slice(starts[s], starts[s + 1]).join('\n');
    if (!/33309/.test(block)) continue;

    const titleMatch = block.match(/^##\s+\d+\\\.\s+\[(.+?)\]\((https?:\/\/[^)]+)\)/m);
    if (!titleMatch) continue;

    const name = titleMatch[1].trim();
    const listingUrl = titleMatch[2].trim();

    const phoneMatch = block.match(/\(\d{3}\)\s\d{3}-\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    const addressMatch = block.match(/([A-Za-z .'-]+,\s*FL\s*33309(?:-\d{4})?)/);
    const address = addressMatch ? addressMatch[1].replace(/\s+/g, ' ').trim() : '33309 area';

    const websiteMatch = block.match(/\[Website\]\((https?:\/\/[^)]+)\)/);
    const website = websiteMatch ? websiteMatch[1].trim() : '';
    const hasWebsite = Boolean(website);
    const weakWebsite = hasWebsite && weakDomains.some((d) => website.includes(d));

    let webStatus = 'strong_website';
    if (!hasWebsite) webStatus = 'no_website_found';
    else if (weakWebsite) webStatus = 'weak_directory_style_site';

    const score = scoreLead(category, hasWebsite, weakWebsite);

    leads.push({
      category,
      business_name: name,
      phone,
      address,
      website,
      web_status: webStatus,
      priority_score: score,
      listing_url: listingUrl
    });
  }

  return leads;
}

function dedupe(leads) {
  const seen = new Set();
  return leads.filter((l) => {
    const k = `${l.business_name.toLowerCase()}|${l.phone}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

let allLeads = [];
for (const file of files) {
  if (fs.existsSync(file)) allLeads = allLeads.concat(parseFile(file));
}

allLeads = dedupe(allLeads)
  .filter((l) => l.web_status !== 'strong_website')
  .sort((a, b) => b.priority_score - a.priority_score || a.business_name.localeCompare(b.business_name));

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const jsonPath = path.join(outDir, 'website-leads-33309.json');
fs.writeFileSync(jsonPath, JSON.stringify(allLeads, null, 2));

const csvPath = path.join(outDir, 'website-leads-33309.csv');
const headers = ['priority_score', 'category', 'business_name', 'phone', 'address', 'web_status', 'website', 'listing_url'];
const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
const csv = [headers.join(',')]
  .concat(allLeads.map((l) => headers.map((h) => esc(l[h])).join(',')))
  .join('\n');
fs.writeFileSync(csvPath, csv);

const mdPath = path.join(outDir, 'website-leads-33309.md');
const top = allLeads.slice(0, 25);
let md = '# 33309 Website Sales Leads\n\n';
md += `Generated leads: ${allLeads.length}\n\n`;
md += 'Focus list (top 25):\n\n';
for (const l of top) {
  md += `- ${l.business_name} | ${l.category} | ${l.phone || 'No phone parsed'} | ${l.address} | ${l.web_status}\n`;
}
fs.writeFileSync(mdPath, md);

console.log(`Generated ${allLeads.length} leads`);
console.log(`- ${jsonPath}`);
console.log(`- ${csvPath}`);
console.log(`- ${mdPath}`);
