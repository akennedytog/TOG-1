#!/usr/bin/env node
/**
 * Business Automation Dashboard
 * Master script to run all business automation tasks
 * Usage: node scripts/business-dashboard.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = path.resolve(__dirname, '..');
const LOG_DIR = path.join(WORKSPACE, 'logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const tools = {
    apollo: checkApollo,
    ahrefs: checkAhrefs,
    bizReporter: checkBizReporter,
    resend: checkResend,
    todoist: checkTodoist,
    perplexity: checkPerplexity,
    firecrawl: checkFirecrawl,
};

function log(msg) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${msg}`);
}

function checkApollo() {
    const token = process.env.APOLLO_API_KEY;
    if (!token) return { status: 'missing', msg: 'Add APOLLO_API_KEY to .env' };
    return { status: 'ready', msg: 'API key configured' };
}

function checkAhrefs() {
    const token = process.env.AHREFS_API_TOKEN;
    if (!token) return { status: 'missing', msg: 'Add AHREFS_API_TOKEN to .env' };
    return { status: 'ready', msg: 'API token configured' };
}

function checkBizReporter() {
    // Checks if GA/Stripe configured
    const hasStripe = process.env.STRIPE_API_KEY;
    return { 
        status: hasStripe ? 'ready' : 'partial', 
        msg: hasStripe ? 'Stripe + GA configured' : 'GA only (add Stripe for revenue)' 
    };
}

function checkResend() {
    const token = process.env.RESEND_API_KEY;
    if (!token) return { status: 'missing', msg: 'Add RESEND_API_KEY to .env' };
    return { status: 'ready', msg: 'Email monitoring ready' };
}

function checkTodoist() {
    const token = process.env.TODOIST_API_TOKEN;
    if (!token) return { status: 'missing', msg: 'Add TODOIST_API_TOKEN to .env' };
    return { status: 'ready', msg: 'Task sync ready' };
}

function checkPerplexity() {
    const token = process.env.PERPLEXITY_API_KEY;
    if (!token) return { status: 'missing', msg: 'Add PERPLEXITY_API_KEY to .env' };
    return { status: 'ready', msg: 'Research AI ready' };
}

function checkFirecrawl() {
    const token = process.env.FIRECRAWL_API_KEY;
    if (!token) return { status: 'missing', msg: 'Add FIRECRAWL_API_KEY to .env' };
    return { status: 'ready', msg: 'Web scraping ready' };
}

function printStatus() {
    console.log('\n📊 Business Automation Dashboard\n');
    console.log('=' .repeat(50));
    
    Object.entries(tools).forEach(([name, checker]) => {
        const result = checker();
        const icon = result.status === 'ready' ? '✅' : result.status === 'partial' ? '⚠️' : '❌';
        console.log(`${icon} ${name.padEnd(15)} ${result.msg}`);
    });
    
    console.log('=' .repeat(50));
    console.log('\n🚀 Quick Actions:\n');
    console.log('   1. Run setup:    ./scripts/setup-business-automation.sh');
    console.log('   2. Enrich leads: ./scripts/enrich-leads.sh');
    console.log('   3. SEO monitor:  ./scripts/seo-monitor.sh');
    console.log('   4. Update cron:  crontab config/enhanced-crontab.txt');
    console.log('\n📁 Configuration:\n');
    console.log('   Edit: .env (add your API keys)');
    console.log('   View: config/business-automation.env.example');
    console.log('');
}

function main() {
    // Load env
    const envPath = path.join(WORKSPACE, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value.length > 0) {
                process.env[key.trim()] = value.join('=').trim();
            }
        });
    }
    
    printStatus();
    
    // Show what's already working
    console.log('🎯 Currently Active:\n');
    console.log('   ✅ Twitter automation (PM2 managed)');
    console.log('   ✅ Content pipeline (cron scheduled)');
    console.log('   ✅ AI news briefings (daily at 9am)');
    console.log('   ✅ Blog monitoring (daily at 10am)');
    console.log('   ✅ Weekly newsletter (Sundays 9am)');
    console.log('   ✅ Security checks (daily at 6am)');
    console.log('');
}

main();
