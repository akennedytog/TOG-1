#!/usr/bin/env node
/**
 * Content Pipeline Generator
 * Converts tweet threads/calendar into blog posts, newsletters, etc.
 * Usage: node content-pipeline/generate.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Paths
const CALENDAR_FILE = path.join(ROOT, 'content-calendar.json');
const BLOG_DIR = path.join(__dirname, 'blog');
const NEWSLETTER_DIR = path.join(__dirname, 'newsletters');
const GENERATION_LOG = path.join(__dirname, '.generation-log.json');

// Ensure directories exist
[BLOG_DIR, NEWSLETTER_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Generation log tracking
function loadGenerationLog() {
  try {
    return JSON.parse(fs.readFileSync(GENERATION_LOG, 'utf-8'));
  } catch {
    return { blogPosts: {}, newsletters: {} };
  }
}

function saveGenerationLog(log) {
  fs.writeFileSync(GENERATION_LOG, JSON.stringify(log, null, 2));
}

function getContentHash(item) {
  // Create a hash based on content to detect duplicates
  return `${item.topic}-${item.type}-${item.text.substring(0, 50)}`;
}

function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday of this week
  return d.toISOString().split('T')[0];
}

/**
 * Generate blog post from tweet thread
 */
function generateBlogPost(item, date) {
  const slug = item.topic.toLowerCase().replace(/\s+/g, '-');
  const filename = `${date}-${slug}.md`;
  
  let content = `# ${item.topic}: ${item.text.split('\n')[0].substring(0, 60)}\n\n`;
  content += `*Published: ${date}*\n\n`;
  content += `## TL;DR\n\n${item.text}\n\n`;
  
  // Expand follow-ups if thread
  if (item.followUps && item.followUps.length > 0) {
    content += `## The Full Breakdown\n\n`;
    item.followUps.forEach((followUp, i) => {
      const clean = followUp.replace(/^\d+\/\s*/, '');
      content += `### ${clean.split(':')[0] || `Point ${i + 1}`}\n\n`;
      content += `${clean}\n\n`;
    });
  }
  
  // Add CTA
  content += `---\n\n`;
  content += `## Ready to implement AI in your business?\n\n`;
  content += `We help small businesses deploy AI systems that actually get used. \n`;
  content += `[Book a free consultation →](https://theonegroup.info#book)\n\n`;
  content += `*Follow [@TheOneGroupAI](https://x.com/TheOneGroupAI) for weekly AI insights.*\n`;
  
  return { filename, content };
}

/**
 * Generate weekly newsletter
 */
function generateNewsletter(items, weekOf) {
  const filename = `newsletter-${weekOf}.md`;
  
  let content = `# The One Group Weekly: AI Automation for SMBs\n\n`;
  content += `*Week of ${weekOf}*\n\n`;
  content += `## This Week's Insights\n\n`;
  
  items.forEach((item, i) => {
    content += `### ${i + 1}. ${item.topic}\n\n`;
    content += `> ${item.text.substring(0, 200)}...\n\n`;
    if (item.followUps) {
      content += `**Key takeaways:**\n`;
      item.followUps.slice(0, 3).forEach(fu => {
        const clean = fu.replace(/^\d+\/\s*/, '').split(':')[1] || fu;
        content += `- ${clean.substring(0, 100)}\n`;
      });
      content += `\n`;
    }
  });
  
  content += `---\n\n`;
  content += `## What We're Building\n\n`;
  content += `Behind the scenes at The One Group AI, we're constantly refining our AI automation \n`;
  content += `playbooks based on real client results. Every week, we share what works (and what doesn't).\n\n`;
  content += `[Book a free consultation →](https://theonegroup.info#book)\n\n`;
  content += `---\n`;
  content += `*You're receiving this because you followed TheOneGroupAI. \n`;
  content += `Unsubscribe by replying "STOP".*\n`;
  
  return { filename, content };
}

/**
 * Main: Process calendar and generate content
 */
async function main() {
  console.log('📝 Content Pipeline Starting...\n');
  
  try {
    // Load calendar
    const calendar = JSON.parse(fs.readFileSync(CALENDAR_FILE, 'utf-8'));
    console.log(`Loaded ${calendar.length} content items\n`);
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Generate blog posts from threads (Mondays = threads)
    const threads = calendar.filter(i => i.type === 'thread');
    console.log(`Found ${threads.length} threads to convert to blog posts`);
    
    const log = loadGenerationLog();
    const weekKey = getWeekKey(today);
    
    threads.forEach((item, i) => {
      const contentHash = getContentHash(item);
      
      // Skip if already generated this week for this content
      if (log.blogPosts[contentHash] && log.blogPosts[contentHash].week === weekKey) {
        console.log(`⏭️  Skipped (already generated this week): ${item.topic}`);
        return;
      }
      
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7)); // Stagger by week
      const dateStr = date.toISOString().split('T')[0];
      
      const post = generateBlogPost(item, dateStr);
      const filepath = path.join(BLOG_DIR, post.filename);
      
      if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, post.content);
        console.log(`✅ Generated: ${post.filename}`);
        
        // Log generation
        log.blogPosts[contentHash] = { week: weekKey, date: dateStr };
      } else {
        console.log(`⏭️  Skipped (file exists): ${post.filename}`);
        // Still log it so we don't try again
        log.blogPosts[contentHash] = { week: weekKey, date: dateStr };
      }
    });
    
    // Generate newsletter from all items (only once per week)
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStr = weekStart.toISOString().split('T')[0];
    
    if (log.newsletters[weekStr]) {
      console.log(`⏭️  Skipped newsletter (already generated for week of ${weekStr})`);
    } else {
      const newsletter = generateNewsletter(calendar.slice(0, 7), weekStr);
      const newsletterPath = path.join(NEWSLETTER_DIR, newsletter.filename);
      
      if (!fs.existsSync(newsletterPath)) {
        fs.writeFileSync(newsletterPath, newsletter.content);
        console.log(`✅ Generated newsletter: ${newsletter.filename}`);
      } else {
        console.log(`⏭️  Skipped newsletter (file exists): ${newsletter.filename}`);
      }
      
      // Log generation
      log.newsletters[weekStr] = { date: todayStr };
    }
    
    // Save generation log
    saveGenerationLog(log);
    
    // Summary
    const stats = {
      blogPosts: fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md')).length,
      newsletters: fs.readdirSync(NEWSLETTER_DIR).filter(f => f.endsWith('.md')).length
    };
    
    console.log('\n📊 Content Pipeline Stats:');
    console.log(`   Blog posts: ${stats.blogPosts}`);
    console.log(`   Newsletters: ${stats.newsletters}`);
    console.log('\n✨ Done! Next: Install blogwatcher + himalaya for full automation');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
