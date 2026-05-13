#!/usr/bin/env python3
import re

# Full navigation HTML
FULL_NAV = '''  <!-- Navigation -->
  <nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <a href="/" class="font-bold text-xl"><span class="gradient-text">The One Group</span></a>
        
        <div class="md:hidden flex items-center">
          <button id="mobile-menu-btn" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        
        <div class="hidden md:flex items-center space-x-8">
          <a href="/about.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">About</a>
          <div class="relative services-dropdown-container">
            <button class="services-dropdown-btn text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
              Services
              <svg class="w-4 h-4 dropdown-arrow transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div class="services-dropdown absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden p-2 z-50">
              <a href="/ai-audit.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">📊 AI Visibility Audit</a>
              <a href="/ai-optimization.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">⚡ AI Implementation</a>
              <a href="/competitor-monitoring.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">👁️ Competitor Intel</a>
              <a href="/social-media.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">📱 Social Media</a>
              <a href="/web-design.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">💻 Web Design</a>
              <a href="/lead-lists.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">🎯 Premium Lead Lists</a>
            </div>
          </div>
          <a href="/case-studies.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Case Studies</a>
          <a href="/blog.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Blog</a>
        </div>
        <a href="/free-ai-audit.html" class="hidden md:inline-flex bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">Free Audit</a>
      </div>
      
      <div id="mobile-menu" class="hidden md:hidden pb-4">
        <div class="flex flex-col space-y-2">
          <a href="/about.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition py-2">About</a>
          <div class="mobile-services-container">
            <button class="mobile-services-btn text-primary-600 dark:text-primary-400 font-medium py-2 flex items-center justify-between w-full">
              <span>Services</span>
              <svg class="w-4 h-4 mobile-dropdown-arrow transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div class="mobile-services-dropdown hidden pl-4 space-y-1 mt-1">
              <a href="/ai-audit.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">📊 AI Visibility Audit</a>
              <a href="/ai-optimization.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">⚡ AI Implementation</a>
              <a href="/competitor-monitoring.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">👁️ Competitor Intel</a>
              <a href="/social-media.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">📱 Social Media</a>
              <a href="/web-design.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">💻 Web Design</a>
              <a href="/lead-lists.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">🎯 Premium Lead Lists</a>
            </div>
          </div>
          <a href="/case-studies.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition py-2">Case Studies</a>
          <a href="/blog.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition py-2">Blog</a>
          <div class="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
            <a href="/free-ai-audit.html" class="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition mt-2">Free Audit</a>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <script>
    document.querySelectorAll('.services-dropdown-container').forEach(container => {
      const btn = container.querySelector('.services-dropdown-btn');
      const dropdown = container.querySelector('.services-dropdown');
      const arrow = container.querySelector('.dropdown-arrow');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        arrow.classList.toggle('rotate-180');
      });
      document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
          dropdown.classList.add('hidden');
          arrow.classList.remove('rotate-180');
        }
      });
    });
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
    document.querySelectorAll('.mobile-services-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dropdown = btn.nextElementSibling;
        const arrow = btn.querySelector('.mobile-dropdown-arrow');
        dropdown.classList.toggle('hidden');
        arrow.classList.toggle('rotate-180');
      });
    });
  </script>'''

# Simple nav pattern to match
SIMPLE_NAV = r'<nav[^>]*>.*?<\/nav>'

files = [
    '/Users/aleckennedy/.openclaw/workspace/theonegroup-site/competitor-monitoring.html',
    '/Users/aleckennedy/.openclaw/workspace/theonegroup-site/social-media.html',
    '/Users/aleckennedy/.openclaw/workspace/theonegroup-site/web-design.html'
]

for filepath in files:
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Find and replace the simple nav
        pattern = r'<nav[^>]*>.*?<\/nav>'
        new_content = re.sub(pattern, FULL_NAV, content, flags=re.DOTALL, count=1)
        
        if new_content != content:
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
        else:
            print(f"No changes needed for {filepath}")
    except Exception as e:
        print(f"Error updating {filepath}: {e}")

print("Done!")
