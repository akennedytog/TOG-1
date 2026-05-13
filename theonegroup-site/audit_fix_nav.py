#!/usr/bin/env python3
"""Audit and fix all navigation inconsistencies"""
import os
import re

base_path = "/Users/aleckennedy/.openclaw/workspace/theonegroup-site"
pages = [f for f in os.listdir(base_path) if f.endswith('.html') and not f.endswith('.backup')]

# Proper navigation that should be on ALL pages
proper_nav = '''<!-- Desktop navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <a href="/" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">About</a>
          <div class="relative services-dropdown-container">
            <button class="services-dropdown-btn text-gray-600 dark:text-gray-300 hover:text-primary-600 transition flex items-center gap-1">
              Services
              <svg class="w-4 h-4 dropdown-arrow transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div class="services-dropdown absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden p-2 z-50">
              <a href="/services.html#ai-audit" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">📊 AI Visibility Audit</a>
              <a href="/services.html#ai-optimization" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">⚡ AI Implementation</a>
              <a href="/competitor-monitoring.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">👁️ Competitor Intel</a>
              <a href="/services.html#social-media" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">📱 Social Media</a>
              <a href="/web-design.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">💻 Web Design</a>
              <a href="/openclaw-setup.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">🔥 OpenClaw Setup</a>
              <a href="/pricing.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">💰 Pricing</a>
            </div>
          </div>
          <a href="/case-studies.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Case Studies</a>
          <a href="/ai-agent-workshop.html" class="text-primary-600 dark:text-primary-400 font-medium">Free Workshop</a>
          <a href="/blog.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-300 transition">Blog</a>
        </div>
'''

for page in pages:
    filepath = os.path.join(base_path, page)
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if page has proper navigation
    if '💰 Pricing' not in content and 'href="/pricing.html"' not in content:
        print(f"⚠️  Missing Pricing: {page}")
        
        # Try to add pricing to services dropdown
        content = re.sub(
            r'(href="/openclaw-setup\.html"[^>]*>[^<]*</a>)(\s*\u003c/div\u003e\s*\u003c/div\u003e\s*\u003ca href="/case-studies)',
            r'\1\n              <a href="/pricing.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">💰 Pricing</a>\2',
            content
        )
    
    if 'Free Workshop' not in content:
        print(f"⚠️  Missing Workshop: {page}")
        # Add Free Workshop after Case Studies
        content = re.sub(
            r'(href="/case-studies\.html"[^>]*>Case Studies</a>)(\s*\u003ca href="/blog\.html")',
            r'\1\n          <a href="/ai-agent-workshop.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition font-medium text-primary-600">Free Workshop</a>\2',
            content
        )
    
    with open(filepath, 'w') as f:
        f.write(content)

print("\n✅ Navigation audit complete!")
