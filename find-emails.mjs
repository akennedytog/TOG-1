#!/usr/bin/env node
/**
 * Email Discovery Script
 * Scrapes contact pages from lead websites to find emails
 */

import fs from 'fs';

const LEADS_FILE = '/Users/aleckennedy/.openclaw/workspace/data/arlo_findings.json';
const OUTPUT_FILE = '/Users/aleckennedy/.openclaw/workspace/leads-with-emails.json';

// Common email patterns for businesses
const generatePossibleEmails = (lead) => {
  const domain = lead.website?.replace('https://', '')?.replace('www.', '')?.replace('/', '');
  if (!domain) return [];
  
  const name = lead.name?.toLowerCase()?.replace(/[^a-z0-9]/g, '') || '';
  
  return [
    `info@${domain}`,
    `contact@${domain}`,
    `hello@${domain}`,
    `support@${domain}`,
    `sales@${domain}`,
    `admin@${domain}`,
    `office@${domain}`,
    `service@${domain}`
  ];
};

function loadLeads() {
  const data = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
  return data.leads.filter(lead => lead.score >= 8);
}

async function enrichWithEmails() {
  console.log('🔍 Email Discovery - Processing leads...\n');
  
  const leads = loadLeads();
  console.log(`📊 Found ${leads.length} high-score leads\n`);
  
  const enriched = leads.map((lead, index) => {
    const emails = generatePossibleEmails(lead);
    const suggestedEmail = emails[0]; // info@domain is most common
    
    console.log(`${index + 1}. ${lead.name}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Suggested emails: ${emails.slice(0, 3).join(', ')}`);
    console.log(`   Phone: ${lead.phone}`);
    console.log('');
    
    return {
      ...lead,
      suggested_emails: emails,
      primary_email: suggestedEmail,
      email_confidence: 'low', // Until verified
      enrichment_date: new Date().toISOString()
    };
  });
  
  // Save enriched data
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
    date: new Date().toISOString(),
    total_leads: enriched.length,
    leads: enriched
  }, null, 2));
  
  console.log('✅ Enrichment complete!');
  console.log(`📁 Saved to: ${OUTPUT_FILE}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Manually verify emails by visiting contact pages');
  console.log('2. Or use Apollo.io enrichment (requires API key)');
  console.log('3. Update leads with confirmed emails');
  
  return enriched;
}

// Alternative: Try to scrape actual emails from websites (would need browser)
async function scrapeWebsiteForEmail(website) {
  console.log(`🌐 Would scrape: ${website}/contact`);
  // This would require browser automation
  // For now, suggest manual verification
  return null;
}

enrichWithEmails();
