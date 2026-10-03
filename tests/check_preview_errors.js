const { chromium } = require('playwright');
const path = require('path');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (err) {
    console.error('Failed to launch Chromium browser:', err.message);
    process.exit(1);
  }

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE ${msg.type().toUpperCase()}]:`, msg.text());
  });

  page.on('pageerror', err => {
    console.error('[BROWSER PAGE ERROR]:', err.message);
    console.error('[STACK TRACE]:', err.stack);
  });

  const previewUrl = 'file:///' + path.resolve(__dirname, '..', 'public/transfer-cruise-preview.html').replace(/\\/g, '/');
  console.log('Loading:', previewUrl);

  try {
    await page.goto(previewUrl, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 2000));
  } catch (err) {
    console.error('Page load error:', err.message);
  }

  await browser.close();
  console.log('Done checking preview.');
})();
