#!/usr/bin/env python3
"""Update all pages with new logo and SEO meta tags"""

import os
import re

base_path = "/Users/aleckennedy/.openclaw/workspace/theonegroup-site"

# Pages to update
pages = [
    "index.html", "services.html", "pricing.html", "ai-agent-workshop.html",
    "case-studies.html", "blog.html", "competitor-monitoring.html",
    "openclaw-setup.html", "about.html", "ai-audit.html", "ai-coaching.html",
    "ai-optimization.html", "web-design.html", "social-media.html",
    "free-ai-audit.html", "lead-lists.html", "missed-call-calculator.html",
    "truerep.html", "events.html"
]

# Page-specific meta data
meta_data = {
    "index.html": {
        "title": "AI Automation for SMBs | The One Group",
        "description": "Practical AI automation for South Florida businesses. 8-agent system for lead research, content creation, and sales outreach. Real results, no hype.",
        "keywords": "AI automation, SMB automation, South Florida, lead generation, content automation, sales outreach"
    },
    "services.html": {
        "title": "AI Automation Services | The One Group",
        "description": "AI automation services: visibility audits, implementation, competitor monitoring, social media, and web design. ROI-focused solutions for SMBs.",
        "keywords": "AI services, automation services, AI audit, competitor monitoring, web design, South Florida"
    },
    "pricing.html": {
        "title": "Pricing | The One Group",
        "description": "Transparent pricing for AI automation services. AI Visibility Audit $250, AI Agent System $1,997, Competitor Intel $297/month.",
        "keywords": "AI pricing, automation pricing, AI services cost, SMB pricing"
    },
    "ai-agent-workshop.html": {
        "title": "Free AI Agent Workshop | The One Group",
        "description": "Free 30-minute workshop: Learn how to build your AI agent system. Live demos of 8 agents working together. Wednesday, May 20th.",
        "keywords": "free workshop, AI workshop, agent system, automation training"
    },
    "case-studies.html": {
        "title": "Case Studies | The One Group",
        "description": "Real results from AI automation implementations. See how businesses save 20+ hours weekly with our 8-agent system.",
        "keywords": "case studies, AI results, automation ROI, success stories"
    },
    "blog.html": {
        "title": "Blog | The One Group",
        "description": "Practical AI automation insights for small businesses. No hype, just actionable strategies for building your agent system.",
        "keywords": "AI blog, automation blog, SMB tips, AI insights"
    },
    "competitor-monitoring.html": {
        "title": "Competitor Intelligence | The One Group",
        "description": "Monthly competitor intelligence for South Florida businesses. Track pricing, services, and market changes automatically.",
        "keywords": "competitor monitoring, competitive intelligence, market analysis"
    },
    "openclaw-setup.html": {
        "title": "OpenClaw Setup | The One Group",
        "description": "Complete OpenClaw setup for your business. 8 AI agents configured and deployed in 7-14 days.",
        "keywords": "OpenClaw setup, AI agents, automation setup, AI deployment"
    }
}

def add_seo_tags(content, page, url_path):
    """Add SEO meta tags to page"""
    data = meta_data.get(page, {
        "title": f"{page.replace('.html', '').replace('-', ' ').title()} | The One Group",
        "description": "Practical AI automation for South Florida businesses. 8-agent system delivering real results.",
        "keywords": "AI automation, SMB automation, South Florida"
    })
    
    # Create SEO block
    seo_block = f"""  <meta name="title" content="{data['title']}">
  <meta name="description" content="{data['description']}">
  <meta name="keywords" content="{data['keywords']}">
  <meta name="author" content="The One Group">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://theonegroup.info/{url_path}">
  <meta property="og:title" content="{data['title']}">
  <meta property="og:description" content="{data['description']}">
  <meta property="og:image" content="https://theonegroup.info/assets/TOG-Logo-New.png">
  <meta property="og:site_name" content="The One Group">
  <meta property="og:locale" content="en_US">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://theonegroup.info/{url_path}">
  <meta property="twitter:title" content="{data['title']}">
  <meta property="twitter:description" content="{data['description']}">
  <meta property="twitter:image" content="https://theonegroup.info/assets/TOG-Logo-New.png">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://theonegroup.info/{url_path}">"""
    
    # Insert after viewport meta
    content = re.sub(
        r'(<meta name="viewport" content="[^"]*">)',
        r'\1\n' + seo_block,
        content
    )
    
    return content

def add_logo(content):
    """Replace text logo with image logo"""
    # Replace text branding with image in nav
    content = re.sub(
        r'<a href="/" class="[^"]*"><span class="gradient-text">The One Group</span></a>',
        '<a href="/" class="flex items-center gap-2"><img src="/assets/TOG-Logo-New.png" alt="The One Group" class="h-10 w-auto"><span class="font-display font-bold text-xl gradient-text">The One Group</span></a>',
        content
    )
    return content

for page in pages:
    filepath = os.path.join(base_path, page)
    if not os.path.exists(filepath):
        print(f"Skipping (not found): {page}")
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Skip if already has SEO tags
    if 'property="og:' in content:
        print(f"Already has SEO: {page}")
    else:
        # Get URL path
        url_path = page if page != "index.html" else ""
        content = add_seo_tags(content, page, url_path)
        print(f"Added SEO to: {page}")
    
    # Add logo
    if 'TOG-Logo-New.png' not in content and '<img' not in content:
        content = add_logo(content)
        print(f"Added logo to: {page}")
    
    with open(filepath, 'w') as f:
        f.write(content)

print("\n✅ SEO and Logo updates complete!")
