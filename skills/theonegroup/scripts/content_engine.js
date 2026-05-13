#!/usr/bin/env node
/**
 * Content Engine Script
 * Generates Twitter threads, blog posts, and newsletters
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const TEMPLATES_DIR = path.join(process.cwd(), 'skills', 'theonegroup', 'templates');

// Ensure directories exist
if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });

const contentIdeas = [
  { topic: 'AI myths', hook: 'AI Myth #1: You need tons of data to get started' },
  { topic: 'automation', hook: 'Most AI automation is just scheduled posting' },
  { topic: 'feedback loops', hook: 'The businesses winning with AI have the tightest feedback loops' },
  { topic: 'cost', hook: 'We run our entire content pipeline on Ollama. Total cost: $0.' },
  { topic: 'results', hook: 'Real numbers from a client last week...' },
];

function generateTwitterThread(topic) {
  const templates = {
    'AI myths': `🧵 AI Myth #1: "You need tons of data to get started"

Reality: Most SMBs see results with just 10-20 examples.

The barrier isn't data volume.
It's knowing which 10-20 examples actually matter.

Quality of signal > quantity of noise.

1/`,
    
    'automation': `🧵 Most AI "automation" is just scheduled posting.

Real automation learns from engagement and adapts.

We built a system that tracks which hooks get replies vs. likes.

The data surprised us.

1/`,
    
    'feedback loops': `🧵 The businesses winning with AI right now?

They're not the ones with the biggest models.

They're the ones with the tightest feedback loops.

Ship → Measure → Learn → Ship again

Speed of iteration beats size of model. Every time.

1/`,
    
    'cost': `🧵 How much does AI automation actually cost?

We run our entire content pipeline on Ollama.

Total cost: $0.

95% of tasks don't need GPT-4.

Use the right model for the job:

1/`,
    
    'results': `🧵 Real numbers from a client last week:

❌ Before: 2 hours/day on lead follow-up
✅ After: 15 min/day review + AI handles the rest

Result: 40% faster response time, 3x more meetings booked

The AI didn't replace them. It amplified them.

1/`
  };
  
  return templates[topic] || templates['AI myths'];
}

function generateBlogPost(title) {
  const template = `# ${title}

*Published: ${new Date().toISOString().split('T')[0]}*

## TL;DR

[One paragraph summary]

## The Problem

[Describe the problem your reader faces]

## The Solution

[Your unique approach/solution]

## Real Results

[Specific numbers and outcomes]

## How to Implement

1. [Step one]
2. [Step two]  
3. [Step three]

## Resources

- [Link 1]
- [Link 2]

---

*Want help implementing this? [Book a free consultation →](https://theonegroup.info#book)*

*Follow [@TheOneGroupAI](https://x.com/TheOneGroupAI) for weekly AI insights.*`;

  return template;
}

function saveContent(type, title, content) {
  const filename = `${type}_${Date.now()}.md`;
  const filepath = path.join(CONTENT_DIR, filename);
  fs.writeFileSync(filepath, content);
  console.log(`✅ ${type} saved: ${filepath}`);
  return filepath;
}

function listContent() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  console.log(`\n📁 Content (${files.length} items):\n`);
  files.forEach(f => {
    const stats = fs.statSync(path.join(CONTENT_DIR, f));
    console.log(`• ${f} (${new Date(stats.mtime).toLocaleDateString()})`);
  });
}

// CLI
const [,, command, ...args] = process.argv;

switch (command) {
  case 'twitter':
    const topic = args[0] || 'AI myths';
    const thread = generateTwitterThread(topic);
    console.log('\n🐦 Twitter Thread:\n');
    console.log(thread);
    saveContent('twitter', topic, thread);
    break;
    
  case 'blog':
    const title = args.join(' ') || 'New Blog Post';
    const post = generateBlogPost(title);
    const filepath = saveContent('blog', title, post);
    console.log(`\n📝 Blog post template created`);
    console.log(`   Edit: ${filepath}`);
    break;
    
  case 'list':
    listContent();
    break;
    
  default:
    console.log(`
Usage:
  node content_engine.js twitter [topic]
  node content_engine.js blog [title]
  node content_engine.js list
    `);
}