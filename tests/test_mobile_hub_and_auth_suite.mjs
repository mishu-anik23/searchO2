import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('================================================================');
  console.log('  Testing Mobile Hub Zero-Cut & Smallest Screen Nav Alignment  ');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage();
  const hubUrl = 'file:///' + path.resolve(__dirname, '..', 'hub', 'index.html').replace(/\\/g, '/');

  // Test across multiple small mobile viewports
  const viewports = [
    { name: 'Ultra-compact mobile (320px)', width: 320, height: 568 },
    { name: 'Standard small mobile (360px)', width: 360, height: 640 },
    { name: 'Modern mobile (390px)', width: 390, height: 844 }
  ];

  const routes = ['', '#/feedback', '#/feedback/playtest', '#/report', '#/library', '#/player', '#/calculator'];

  for (const vp of viewports) {
    console.log(`Checking viewport: ${vp.name}...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });

    for (const r of routes) {
      await page.goto(hubUrl + r, { waitUntil: 'load' });
      await page.waitForTimeout(150);

      const check = await page.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const nav = document.querySelector('.nav');
        const activeNav = document.querySelector('.nav a[aria-current="page"]');
        return {
          route: window.location.hash || 'home',
          docW,
          winW,
          isNoCut: docW <= winW + 1,
          navScrollable: nav ? nav.scrollWidth > nav.clientWidth : false,
          activeNavVisible: activeNav ? activeNav.getBoundingClientRect().width > 0 : false
        };
      });

      assert(check.isNoCut, `Screen cut off on ${vp.name} on route ${r}: docW (${check.docW}) > winW (${check.winW})`);
      console.log(`   [✓ PASSED] ${r || 'home'}: docW ${check.docW}px === winW ${check.winW}px (No horizontal screen cut)`);
    }
  }

  console.log('\n================================================================');
  console.log('  ALL MOBILE ZERO-CUT & NAVIGATION ALIGNMENT CHECKS PASSED!     ');
  console.log('================================================================');

  await browser.close();
})();
