/**
 * Bundle UI files into a single HTML file for Figma
 * 
 * Run: node scripts/build-ui.js
 */

const fs = require('fs');
const path = require('path');

const uiHtmlPath = path.join(__dirname, '../ui/ui.html');
const uiJsPath = path.join(__dirname, '../dist/ui.js');
const outputPath = path.join(__dirname, '../dist/ui.html');

// Read the HTML template
let html = fs.readFileSync(uiHtmlPath, 'utf-8');

// Read the compiled JS
if (!fs.existsSync(uiJsPath)) {
  console.error('❌ ui.js not found. Run `npm run build:ui` first.');
  process.exit(1);
}

const js = fs.readFileSync(uiJsPath, 'utf-8');

// Inline the JavaScript
html = html.replace('<script src="ui.js"></script>', `<script>${js}</script>`);

// Write the bundled HTML
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

fs.writeFileSync(outputPath, html);

console.log('✅ UI bundled to dist/ui.html');
console.log(`   Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
