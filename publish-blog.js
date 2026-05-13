import fs from 'fs';
import path from 'path';

const blogFile = '/Users/aleckennedy/.openclaw/workspace/content-pipeline/blog/2026-04-03-invisible-automation.md';
const publicDir = '/Users/aleckennedy/.openclaw/workspace/public/blog';

// Ensure public blog directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Read blog content
const content = fs.readFileSync(blogFile, 'utf-8');

// Create HTML version
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Secret to AI Tools That Actually Get Used | The One Group</title>
  <meta name="description" content="The AI tools that stick share one trait: they don't ask users to change their workflow. They adapt to it.">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; color: #333; }
    h1 { color: #1a365d; }
    h2 { color: #2c5282; margin-top: 30px; }
    a { color: #63b3ed; }
    .date { color: #666; font-size: 0.9em; }
    .cta { background: #1a365d; color: white; padding: 20px; border-radius: 8px; margin: 30px 0; }
    .cta a { color: #90cdf4; }
  </style>
</head>
<body>
  <article>
    ${content.replace(/# (.*)/, '<h1>$1</h1>').replace(/## (.*)/g, '<h2>$1</h2>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br><br>')}
  </article>
  
  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em;">
    <p>© 2026 The One Group | <a href="https://theonegroup.info">theonegroup.info</a></p>
  </footer>
</body>
</html>`;

// Save as HTML
const outputFile = path.join(publicDir, '2026-04-03-invisible-automation.html');
fs.writeFileSync(outputFile, htmlContent);

console.log('✅ Blog post published!');
console.log('URL:', 'https://theonegroup.info/blog/2026-04-03-invisible-automation.html');
console.log('File:', outputFile);