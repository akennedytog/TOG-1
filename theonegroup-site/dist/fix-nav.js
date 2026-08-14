const fs = require('fs');
const path = require('path');

// Standard navigation HTML
const standardNav = `<div class="hidden md:flex items-center space-x-8">
          <a href="/services.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Services</a>
          <a href="/ai-coaching.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">AI Coaching</a>
          <a href="/ai-optimization.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">AI Optimization</a>
          <a href="/competitor-monitoring.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Competitor Intel</a>
          <a href="/case-studies.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Case Studies</a>
          <a href="/blog.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Blog</a>
          <a href="/about.html" class="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">About</a>
        </div>`;

const files = [
  'about.html',
  'ai-audit.html', 
  'ai-coaching.html',
  'ai-optimization.html',
  'blog.html',
  'case-studies.html',
  'competitor-monitoring.html'
];

files.forEach(file => {
  const filepath = path.join(__dirname, file);
  if (!fs.existsSync(filepath)) {
    console.log('Skipping ' + file + ' (not found)');
    return;
  }
  
  let content = fs.readFileSync(filepath, 'utf-8');
  
  // Find and replace the navigation div
  const navRegex = /<div class="hidden md:flex items-center space-x-8"[^\u003e]*>[\s\S]*?<\/div>/;
  
  if (navRegex.test(content)) {
    // Replace with standard nav and set active state
    let newNav = standardNav;
    const pageName = file.replace('.html', '');
    
    // Set active state for current page
    if (file === 'ai-coaching.html') {
      newNav = newNav.replace('href="/ai-coaching.html" class="text-gray-600', 'href="/ai-coaching.html" class="text-primary-600 dark:text-primary-400 font-medium');
    } else if (file === 'ai-optimization.html') {
      newNav = newNav.replace('href="/ai-optimization.html" class="text-gray-600', 'href="/ai-optimization.html" class="text-primary-600 dark:text-primary-400 font-medium');
    } else if (file === 'competitor-monitoring.html') {
      newNav = newNav.replace('href="/competitor-monitoring.html" class="text-gray-600', 'href="/competitor-monitoring.html" class="text-primary-600 dark:text-primary-400 font-medium');
    } else if (file === 'case-studies.html') {
      newNav = newNav.replace('href="/case-studies.html" class="text-gray-600', 'href="/case-studies.html" class="text-primary-600 dark:text-primary-400 font-medium');
    } else if (file === 'blog.html') {
      newNav = newNav.replace('href="/blog.html" class="text-gray-600', 'href="/blog.html" class="text-primary-600 dark:text-primary-400 font-medium');
    } else if (file === 'about.html') {
      newNav = newNav.replace('href="/about.html" class="text-gray-600', 'href="/about.html" class="text-primary-600 dark:text-primary-400 font-medium');
    }
    
    content = content.replace(navRegex, newNav.trim());
    fs.writeFileSync(filepath, content);
    console.log('✅ Updated: ' + file);
  } else {
    console.log('⚠️  Nav not found in: ' + file);
  }
});

console.log('\nDone!');
