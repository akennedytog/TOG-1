/* Detail contrast violations on specific One Group pages */
const puppeteer = require('puppeteer-core');
const axe = require('axe-core');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const pages = [
    'https://theonegroup.info/',
    'https://theonegroup.info/privacy/',
    'https://theonegroup.info/terms/',
  ];
  for (const url of pages) {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const r = await window.axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] } });
      return r.violations;
    });
    console.log(`\n===== ${url} =====`);
    for (const v of violations) {
      for (const n of v.nodes) {
        const html = n.html.replace(/\s+/g, ' ').slice(0, 140);
        console.log(`  [${v.id}] ${n.failureSummary ? n.failureSummary.split('\n')[0].slice(0, 120) : ''}`);
        console.log(`    ${html}`);
        console.log(`    target: ${n.target.join(' ')}`);
      }
    }
  }
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
