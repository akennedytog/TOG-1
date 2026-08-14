/* Comprehensive accessibility audit: axe-core + keyboard interaction tests
 * Usage: node scripts/a11y_audit.js [site]  (site = onegroup | pitrow | all)
 */
const puppeteer = require('puppeteer-core');
const axe = require('axe-core');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const SITES = {
  onegroup: {
    name: 'theonegroup.info',
    base: 'https://theonegroup.info',
    pages: ['/', '/services/', '/contact/', '/blog/', '/system-proof/', '/ai-visibility-score/', '/privacy/', '/terms/', '/case-studies/', '/real-estate-market-report/'],
  },
  pitrow: {
    name: 'pitrowmiami.com',
    base: 'https://pitrowmiami.com',
    pages: ['/', '/blog/', '/one-sheet/', '/privacy/', '/terms/', '/blog/racing-simulator-party-rental-miami/'],
  },
};

const WANTED = ['critical', 'serious', 'moderate', 'minor'];

function summarize(results) {
  const byImpact = {};
  for (const r of results) {
    if (!byImpact[r.impact]) byImpact[r.impact] = 0;
    byImpact[r.impact] += 1;
  }
  return byImpact;
}

async function runAxe(page, url) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } });
    return r.violations;
  });
  return results;
}

async function testKeyboard(page) {
  const report = { skipLink: null, focusVisibleCheck: null, mobileMenu: null, tabReachesInteractive: true };
  // Skip link test
  report.skipLink = await page.evaluate(() => {
    const sk = document.querySelector('a[href="#main-content"]');
    if (!sk) return 'MISSING';
    const cs = getComputedStyle(sk);
    // hidden until focused via sr-only
    return `present (hidden=${cs.clip === 'rect(0px, 0px, 0px, 0px)' || cs.position === 'absolute'})`;
  });
  return report;
}

async function testMobileMenu(page, base) {
  // emulate mobile viewport
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(base + '/', { waitUntil: 'networkidle2', timeout: 45000 });
  const result = await page.evaluate(() => {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return { ok: false, reason: 'menu elements missing' };
    const out = { ok: true };
    out.hasAriaExpanded = btn.hasAttribute('aria-expanded');
    out.hasAriaControls = btn.hasAttribute('aria-controls') && btn.getAttribute('aria-controls') === 'mobile-menu';
    // click to open
    btn.click();
    out.expandedAfterOpen = btn.getAttribute('aria-expanded');
    out.menuVisibleAfterOpen = !menu.classList.contains('hidden');
    // Escape to close
    const evt = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(evt);
    out.expandedAfterEscape = btn.getAttribute('aria-expanded');
    out.menuHiddenAfterEscape = menu.classList.contains('hidden');
    return out;
  });
  await page.setViewport({ width: 1280, height: 800 });
  return result;
}

async function main() {
  const siteArg = process.argv[2] || 'all';
  const targets = siteArg === 'all' ? Object.values(SITES) : [SITES[siteArg]];
  if (!targets[0]) { console.error('Unknown site: ' + siteArg); process.exit(1); }

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  for (const site of targets) {
    console.log(`\n===== ${site.name} =====`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    for (const p of site.pages) {
      const url = site.base + p;
      try {
        await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
        const lightV = await runAxe(page, url);
        await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
        const darkV = await runAxe(page, url);
        const fmt = (v) => { const i = summarize(v); return Object.entries(i).map(([k, x]) => `${k}:${x}`).join(' ') || 'clean'; };
        console.log(`  ${p.padEnd(40)} light[${fmt(lightV)}]  dark[${fmt(darkV)}]`);
      } catch (e) {
        console.log(`  ${p.padEnd(40)} ERROR: ${e.message.split('\n')[0]}`);
      }
    }

    // Keyboard tests on homepage
    try {
      await page.goto(site.base + '/', { waitUntil: 'networkidle2', timeout: 45000 });
      const kb = await testKeyboard(page);
      console.log(`  [keyboard] skip link: ${kb.skipLink}`);
      const mm = await testMobileMenu(page, site.base);
      console.log(`  [mobile-menu] ${mm.ok ? JSON.stringify(mm) : 'FAIL: ' + mm.reason}`);
    } catch (e) {
      console.log(`  [keyboard] ERROR: ${e.message.split('\n')[0]}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('\nDone.');
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
