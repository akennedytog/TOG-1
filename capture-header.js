const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureScreenshot() {
  const htmlPath = path.resolve(process.argv[2] || './blog-header-image.html');
  const outputPath = path.resolve(process.argv[3] || './openclaw-blog-header.png');
  
  if (!fs.existsSync(htmlPath)) {
    console.error('HTML file not found:', htmlPath);
    process.exit(1);
  }
  
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to match Twitter card dimensions
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 1
    });
    
    const fileUrl = 'file://' + htmlPath;
    console.log('Loading:', fileUrl);
    
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    
    // Wait for animations to settle
    await page.waitForTimeout(2000);
    
    console.log('Capturing screenshot...');
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 1200, height: 630 }
    });
    
    console.log('✅ Screenshot saved to:', outputPath);
    console.log('📐 Dimensions: 1200x630 (Twitter card optimized)');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureScreenshot();