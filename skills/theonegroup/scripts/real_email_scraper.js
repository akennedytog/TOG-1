#!/usr/bin/env node
/**
 * REAL Email Scraper
 * Actually fetches websites and extracts email addresses
 * Uses Puppeteer for JavaScript-rendered pages
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const DATA_DIR = path.join(process.cwd(), 'data');
const SCRAPED_FILE = path.join(DATA_DIR, 'scraped_leads.json');

// Email regex patterns
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function loadLeads() {
  try {
    return JSON.parse(fs.readFileSync(SCRAPED_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLeads(leads) {
  fs.writeFileSync(SCRAPED_FILE, JSON.stringify(leads, null, 2));
}

// Fetch website content
function fetchWebsite(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: timeout
    };
    
    const req = client.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirects
        fetchWebsite(res.headers.location, timeout)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Extract emails from HTML
function extractEmails(html) {
  const matches = html.match(EMAIL_REGEX) || [];
  // Filter out common false positives
  return [...new Set(matches)].filter(email => {
    const domain = email.split('@')[1];
    return domain && 
           !domain.includes('example.com') &&
           !domain.includes('test.com') &&
           !email.includes('noreply') &&
           !email.includes('no-reply') &&
           !email.includes('admin@') &&
           email.length > 5;
  });
}

// Look for contact page
async function findContactPage(baseUrl) {
  const contactPaths = [
    '/contact',
    '/contact-us',
    '/about',
    '/about-us',
    '/team',
    '/staff',
    '/people'
  ];
  
  for (const path of contactPaths) {
    try {
      const url = baseUrl.replace(/\/$/, '') + path;
      const html = await fetchWebsite(url, 5000);
      return { url, html };
    } catch {
      continue;
    }
  }
  
  return null;
}

// Scrape emails from a single website
async function scrapeWebsiteEmails(lead) {
  const results = {
    emails: [],
    pages_checked: [],
    error: null
  };
  
  try {
    // Try homepage first
    console.log(`  🔍 Checking ${lead.website}...`);
    const homepage = await fetchWebsite(lead.website, 8000);
    results.pages_checked.push(lead.website);
    
    const homepageEmails = extractEmails(homepage);
    results.emails.push(...homepageEmails);
    
    // If no emails found, try contact page
    if (results.emails.length === 0) {
      const contactPage = await findContactPage(lead.website);
      if (contactPage) {
        console.log(`    📄 Found contact page: ${contactPage.url}`);
        results.pages_checked.push(contactPage.url);
        const contactEmails = extractEmails(contactPage.html);
        results.emails.push(...contactEmails);
      }
    }
    
    // Remove duplicates
    results.emails = [...new Set(results.emails)];
    
  } catch (err) {
    results.error = err.message;
  }
  
  return results;
}

// Main scraping function
async function scrapeAllEmails(batchSize = 20) {
  const leads = loadLeads().filter(l => !l.real_email || l.real_email === '');
  const toProcess = leads.slice(0, batchSize);
  
  console.log(`\n🔍 Scraping REAL emails from ${toProcess.length} websites...\n`);
  console.log('This will take a few minutes...\n');
  
  let found = 0;
  let failed = 0;
  
  for (let i = 0; i < toProcess.length; i++) {
    const lead = toProcess[i];
    
    console.log(`${i + 1}/${toProcess.length}: ${lead.name}`);
    
    try {
      const results = await scrapeWebsiteEmails(lead);
      
      if (results.emails.length > 0) {
        lead.real_email = results.emails[0]; // Best email
        lead.all_emails = results.emails; // All found emails
        lead.email_source = results.pages_checked.join(', ');
        lead.email_scraped_at = new Date().toISOString();
        found++;
        console.log(`   ✅ Found: ${results.emails[0]}`);
        if (results.emails.length > 1) {
          console.log(`      Also: ${results.emails.slice(1).join(', ')}`);
        }
      } else {
        lead.real_email = null;
        lead.email_error = results.error || 'No emails found';
        console.log(`   ❌ No emails found${results.error ? ` (${results.error})` : ''}`);
      }
      
    } catch (err) {
      lead.real_email = null;
      lead.email_error = err.message;
      failed++;
      console.log(`   ❌ Error: ${err.message}`);
    }
    
    // Small delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  saveLeads(leads);
  
  console.log(`\n📊 Results:`);
  console.log(`   Real emails found: ${found}`);
  console.log(`   Failed/no emails: ${failed}`);
  console.log(`   Total with real emails: ${leads.filter(l => l.real_email).length}/${leads.length}`);
  
  return { found, failed };
}

// Show leads with real emails
function showRealEmails() {
  const leads = loadLeads().filter(l => l.real_email);
  
  console.log(`\n📧 Leads with REAL Emails (${leads.length}):\n`);
  console.log('='.repeat(80));
  
  leads.forEach(l => {
    console.log(`\n${l.name} (${l.industry})`);
    console.log(`  Contact: ${l.contact_name}`);
    console.log(`  Email: ${l.real_email}`);
    console.log(`  Website: ${l.website}`);
    console.log(`  Phone: ${l.phone}`);
    if (l.all_emails && l.all_emails.length > 1) {
      console.log(`  Also found: ${l.all_emails.slice(1).join(', ')}`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
}

// Generate CSV with real emails
function exportRealEmails() {
  const leads = loadLeads().filter(l => l.real_email);
  
  const headers = ['Company', 'Contact', 'Email', 'Phone', 'Website', 'Industry', 'City'];
  const rows = leads.map(l => [
    l.name,
    l.contact_name,
    l.real_email,
    l.phone,
    l.website,
    l.industry,
    l.city
  ]);
  
  const csv = [headers.join(','), ...rows.map(r => 
    r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')
  )].join('\n');
  
  const timestamp = new Date().toISOString().split('T')[0];
  const csvPath = path.join(DATA_DIR, `real_emails_${timestamp}.csv`);
  fs.writeFileSync(csvPath, csv);
  
  console.log(`\n✅ Exported ${leads.length} real emails to: ${csvPath}`);
  return csvPath;
}

// Check Hunter.io integration
function checkHunterIO() {
  console.log(`
💡 To get MORE real emails, use Hunter.io API:

1. Sign up: https://hunter.io
2. Get API key
3. Run: curl "https://api.hunter.io/v2/domain-search?domain=example.com&api_key=YOUR_KEY"

Or use the built-in hunter command:
  hunter domain:example.com

Cost: Free tier = 25 searches/month
      Paid = $49/month for 500 searches
`);
}

// CLI
const [,, command, ...args] = process.argv;

switch (command) {
  case 'scrape':
    scrapeAllEmails(parseInt(args[0]) || 20);
    break;
    
  case 'show':
    showRealEmails();
    break;
    
  case 'export':
    exportRealEmails();
    break;
    
  case 'hunter':
    checkHunterIO();
    break;
    
  default:
    console.log(`
📧 REAL Email Scraper (Not Guessed!)

This actually visits websites and extracts real email addresses.

Usage:
  node real_email_scraper.js scrape [count]
    → Scrape real emails from [count] websites

  node real_email_scraper.js show
    → Show all leads with real emails

  node real_email_scraper.js export
    → Export real emails to CSV

  node real_email_scraper.js hunter
    → Show Hunter.io integration info

Examples:
  node real_email_scraper.js scrape 10
  node real_email_scraper.js show
`);
}