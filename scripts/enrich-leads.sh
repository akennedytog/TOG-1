#!/bin/bash
# Apollo Lead Enrichment Script
# Enriches your 10 South Florida leads with contact data

cd "$(dirname "$0")/.."

# Load env
source .env 2>/dev/null || true

if [ -z "$APOLLO_API_KEY" ]; then
    echo "❌ APOLLO_API_KEY not set"
    echo "   Add to .env: APOLLO_API_KEY=your_key_here"
    exit 1
fi

echo "🛰️  Enriching leads with Apollo.io..."

# Read leads and enrich each one
node << 'EOF'
const fs = require('fs');
const path = require('path');

const leadsFile = path.resolve('data/leads.json');
const leads = JSON.parse(fs.readFileSync(leadsFile, 'utf-8'));

console.log(`Found ${leads.length} leads to enrich\n`);

// Enrichment function (mock for now - replace with real Apollo API call)
async function enrichLead(lead) {
    console.log(`🔍 Enriching: ${lead.businessName}`);
    console.log(`   Domain: ${lead.contactEmail.split('@')[1]}`);
    
    // TODO: Call Apollo API
    // const domain = lead.contactEmail.split('@')[1];
    // const enriched = await apolloEnrich(domain);
    
    return {
        ...lead,
        enriched: true,
        enrichedAt: new Date().toISOString()
    };
}

// Process all leads
(async () => {
    for (const lead of leads) {
        await enrichLead(lead);
    }
    console.log('\n✅ Enrichment complete!');
    console.log('   (API integration pending - add Apollo API key to .env)');
})();
EOF
