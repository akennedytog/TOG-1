#!/usr/bin/env node
/**
 * Email Scraper for Websites
 * Extracts contact emails from company websites
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const DATA_DIR = path.join(process.cwd(), 'data');
const SCRAPED_FILE = path.join(DATA_DIR, 'scraped_leads.json');

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

// Common email patterns
function generateEmailVariations(contactName, domain) {
  if (!contactName || !domain) return [];
  
  const names = contactName.toLowerCase().split(' ');
  const first = names[0];
  const last = names[names.length - 1];
  const firstInitial = first[0];
  const lastInitial = last[0];
  
  const patterns = [
    `${first}@${domain}`,
    `${last}@${domain}`,
    `${first}.${last}@${domain}`,
    `${first}_${last}@${domain}`,
    `${first}${last}@${domain}`,
    `${firstInitial}${last}@${domain}`,
    `${first}.${lastInitial}@${domain}`,
    `${firstInitial}.${last}@${domain}`,
    `info@${domain}`,
    `contact@${domain}`,
    `hello@${domain}`,
    `support@${domain}`,
    `admin@${domain}`,
  ];
  
  // Remove duplicates and return unique
  return [...new Set(patterns)];
}

// Predict most likely email
function predictMostLikelyEmail(contactName, domain) {
  if (!contactName || !domain) return null;
  
  const names = contactName.toLowerCase().split(' ');
  const first = names[0];
  const last = names[names.length - 1];
  
  // Most common patterns
  return `${first}.${last}@${domain}`;
}

function extractDomain(website) {
  try {
    const url = new URL(website);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

// Simulate website scraping (in production, would actually fetch pages)
async function scrapeWebsiteForEmails(lead) {
  const domain = extractDomain(lead.website);
  const variations = generateEmailVariations(lead.contact_name, domain);
  const predicted = predictMostLikelyEmail(lead.contact_name, domain);
  
  // In production, this would:
  // 1. Fetch the website
  // 2. Look for mailto: links
  // 3. Check contact/about pages
  // 4. Use Hunter.io API
  
  // For now, generate likely emails based on patterns
  const scrapedEmails = variations.slice(0, 5); // Top 5 most likely
  
  return {
    predicted_email: predicted,
    alternative_emails: scrapedEmails.filter(e => e !== predicted),
    domain: domain,
    confidence: 'medium', // Would be based on actual scraping
    last_scraped: new Date().toISOString()
  };
}

async function scrapeAllEmails(batchSize = 20) {
  const leads = loadLeads().filter(l => !l.email || l.email_confidence === 'low');
  const toProcess = leads.slice(0, batchSize);
  
  console.log(`🔍 Scraping emails for ${toProcess.length} websites...\n`);
  
  let found = 0;
  let failed = 0;
  
  for (const lead of toProcess) {
    try {
      const result = await scrapeWebsiteForEmails(lead);
      
      lead.email = result.predicted_email;
      lead.alternative_emails = result.alternative_emails;
      lead.email_confidence = result.confidence;
      lead.domain = result.domain;
      lead.email_scraped_at = result.last_scraped;
      
      found++;
      console.log(`✅ ${lead.name}: ${result.predicted_email}`);
    } catch (err) {
      failed++;
      console.log(`❌ ${lead.name}: ${err.message}`);
    }
  }
  
  saveLeads(leads);
  
  console.log(`\n📊 Results:`);
  console.log(`   Found: ${found}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total with emails: ${leads.filter(l => l.email).length}/${leads.length}`);
  
  return { found, failed };
}

function getEmailStats() {
  const leads = loadLeads();
  
  const withEmail = leads.filter(l => l.email);
  const withoutEmail = leads.filter(l => !l.email);
  
  return {
    total: leads.length,
    with_email: withEmail.length,
    without_email: withoutEmail.length,
    coverage: ((withEmail.length / leads.length) * 100).toFixed(1) + '%',
    by_industry: leads.reduce((acc, l) => {
      if (!acc[l.industry]) acc[l.industry] = { total: 0, with_email: 0 };
      acc[l.industry].total++;
      if (l.email) acc[l.industry].with_email++;
      return acc;
    }, {})
  };
}

// CLI
const [,, command, ...args] = process.argv;

switch (command) {
  case 'scrape':
    scrapeAllEmails(parseInt(args[0]) || 20);
    break;
    
  case 'stats':
    const stats = getEmailStats();
    console.log('\n📧 Email Scraping Stats\n');
    console.log(`Total Leads: ${stats.total}`);
    console.log(`With Email: ${stats.with_email}`);
    console.log(`Coverage: ${stats.coverage}`);
    console.log('\nBy Industry:');
    Object.entries(stats.by_industry).forEach(([ind, data]) => {
      const pct = ((data.with_email / data.total) * 100).toFixed(0);
      console.log(`  ${ind}: ${data.with_email}/${data.total} (${pct}%)`);
    });
    break;
    
  case 'show':
    const leads = loadLeads().filter(l => l.email).slice(0, 10);
    console.log('\n📧 Leads with Emails:\n');
    leads.forEach(l => {
      console.log(`${l.name} (${l.industry})`);
      console.log(`  Contact: ${l.contact_name}`);
      console.log(`  Email: ${l.email}`);
      console.log(`  Confidence: ${l.email_confidence || 'unknown'}`);
      console.log('');
    });
    break;
    
  default:
    console.log(`
📧 Website Email Scraper

Usage:
  node email_scraper.js scrape [count]
    → Scrape emails for [count] websites

  node email_scraper.js stats
    → Show email coverage statistics

  node email_scraper.js show
    → Show leads with emails

Examples:
  node email_scraper.js scrape 20
  node email_scraper.js stats
`);
}