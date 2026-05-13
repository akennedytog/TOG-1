#!/bin/bash
# Business Automation Setup Script
# Sets up Apollo, Ahrefs, Biz-Reporter, Resend, Todoist, Perplexity integrations

set -e

echo "🚀 Setting up Business Automation Suite..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found in current directory"
    echo "   Please run this from your workspace directory"
    exit 1
fi

echo "📋 Checking existing environment variables..."
echo ""

# Function to add env var if not exists
add_env_var() {
    local key=$1
    local value=$2
    local description=$3
    
    if grep -q "^${key}=" .env 2>/dev/null; then
        echo "✅ ${key} already configured"
    else
        echo "# ${description}" >> .env
        echo "${key}=${value}" >> .env
        echo "📝 Added ${key} (please update with real value)"
    fi
}

# === APOLLO.IO ===
echo "🛰️  Apollo.io Setup (Lead Enrichment)"
echo "    Get API key from: https://www.apollo.io/"
add_env_var "APOLLO_API_KEY" "your_apollo_api_key_here" "Apollo.io API for lead enrichment"
add_env_var "APOLLO_BASE_URL" "https://api.apollo.io" "Apollo API base URL"
echo ""

# === AHREFS ===
echo "📊 Ahrefs Setup (SEO Tracking)"
echo "    Get API token from: https://ahrefs.com/account/api"
add_env_var "AHREFS_API_TOKEN" "your_ahrefs_token_here" "Ahrefs API token"
add_env_var "AHREFS_API_PLAN" "lite" "Ahrefs plan: lite, standard, advanced, enterprise"
echo ""

# === STRIPE (Optional) ===
echo "💳 Stripe Setup (Revenue Tracking) - Optional"
echo "    Get API key from: https://dashboard.stripe.com/apikeys"
add_env_var "STRIPE_API_KEY" "sk_test_your_key_here" "Stripe API for revenue tracking"
echo ""

# === RESEND ===
echo "📧 Resend Setup (Email Management)"
echo "    Get API key from: https://resend.com/api-keys"
add_env_var "RESEND_API_KEY" "re_your_resend_key_here" "Resend API for inbound email"
echo ""

# === TODOIST ===
echo "✅ Todoist Setup (Task Management)"
echo "    Get token from: https://todoist.com/app/settings/integrations"
add_env_var "TODOIST_API_TOKEN" "your_todoist_token_here" "Todoist API for task automation"
echo ""

# === PERPLEXITY ===
echo "🔍 Perplexity Setup (AI Research)"
echo "    Get API key from: https://www.perplexity.ai/settings"
add_env_var "PERPLEXITY_API_KEY" "pplx-your_key_here" "Perplexity API for research"
echo ""

# === FIRECRAWL ===
echo "🕷️  Firecrawl Setup (Web Scraping)"
echo "    Get API key from: https://firecrawl.dev"
add_env_var "FIRECRAWL_API_KEY" "fc-your_firecrawl_key_here" "Firecrawl API for web scraping"
echo ""

echo "✅ Environment variables configured!"
echo ""
echo "⚠️  IMPORTANT: Update .env with your real API keys:"
echo "   - Apollo.io: https://www.apollo.io/"
echo "   - Ahrefs: https://ahrefs.com/account/api"
echo "   - Resend: https://resend.com/api-keys"
echo "   - Todoist: https://todoist.com/app/settings/integrations"
echo "   - Perplexity: https://www.perplexity.ai/settings"
echo "   - Firecrawl: https://firecrawl.dev"
echo ""

echo "🎯 Next steps:"
echo "   1. Edit .env and add your real API keys"
echo "   2. Run: ./scripts/enrich-leads.sh to test Apollo"
echo "   3. Check your crontab: crontab -l"
echo ""
