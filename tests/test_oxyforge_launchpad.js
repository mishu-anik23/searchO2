const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('🚀 Starting OxyForge & 3D Launchpad Verification Suite...');
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (e) {
    browser = await chromium.launch({ headless: true });
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Test 1: Verify index.html DEV Modal
  console.log('\n--- Test 1: index.html DEV Modal ---');
  const indexUrl = 'file://' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  await page.goto(indexUrl, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss guest start if present
  try {
    const guestBtn = await page.$('#btnGuestStart');
    if (guestBtn) {
      await guestBtn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  } catch (e) {}

  // Open DEV OxyForge Modal
  await page.evaluate(() => {
    if (typeof window.openDevOxyforgeModal === 'function') {
      window.openDevOxyforgeModal();
    }
  });
  await new Promise(r => setTimeout(r, 500));

  // Check modal links
  const hqLink = await page.$('a[href="public/oxyforge.html"]');
  const padLink = await page.$('a[href="public/launchpad-preview.html"]');
  const moonLink = await page.$('a[href="public/moon-landing-preview.html"]');

  if (!hqLink || !padLink || !moonLink) {
    throw new Error('❌ One or more OxyForge navigation links missing from DEV modal');
  }
  console.log('✓ DEV modal contains links to OxyForge HQ, 3D Pad, and Moon Landing!');

  // Test 2: Verify public/oxyforge.html
  console.log('\n--- Test 2: public/oxyforge.html HQ Mission Command ---');
  const hqUrl = 'file://' + path.resolve(__dirname, '../public/oxyforge.html').replace(/\\/g, '/');
  await page.goto(hqUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  const title = await page.title();
  console.log('✓ Page title:', title);

  const crewCards = await page.$$('.crew-card');
  console.log(`✓ Found ${crewCards.length} crew cards in Mission Roster (expected 6)`);
  if (crewCards.length !== 6) {
    throw new Error(`Expected 6 crew cards, found ${crewCards.length}`);
  }

  const seatsFilledText = await page.$eval('#seatsFilledCounter', el => el.textContent.trim());
  console.log(`✓ Seats filled counter: ${seatsFilledText}`);

  const padBtn = await page.$('a[href="launchpad-preview.html"]');
  const moonBtn = await page.$('a[href="moon-landing-preview.html"]');
  if (!padBtn || !moonBtn) {
    throw new Error('❌ Missing 3D launchpad or moon landing buttons in HQ Mission Page');
  }
  console.log('✓ Found 3D Launchpad & Rocket Ignition and 3D Moon Landing action buttons in HQ!');

  // Test 3: Verify public/launchpad-preview.html 3D scene & ignition
  console.log('\n--- Test 3: public/launchpad-preview.html 3D Launchpad ---');
  const padUrl = 'file://' + path.resolve(__dirname, '../public/launchpad-preview.html').replace(/\\/g, '/');
  await page.goto(padUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  const padTitle = await page.title();
  console.log('✓ Pad page title:', padTitle);

  const countdownText = await page.$eval('#clockDisplay', el => el.textContent.trim());
  console.log(`✓ Countdown display initialized: ${countdownText}`);

  const checklistItems = await page.$$('.check-item');
  console.log(`✓ Found ${checklistItems.length} checklist items on launch pad console`);

  const hqBackBtn = await page.$('a[href="oxyforge.html"]');
  if (!hqBackBtn) {
    throw new Error('❌ Missing navigation link back to Mission HQ in launchpad simulator');
  }
  console.log('✓ Found navigation link back to Mission HQ in 3D Launchpad!');

  // Test 4: Verify public/moon-landing-preview.html
  console.log('\n--- Test 4: public/moon-landing-preview.html 3D Moon Landing ---');
  const moonUrl = 'file://' + path.resolve(__dirname, '../public/moon-landing-preview.html').replace(/\\/g, '/');
  await page.goto(moonUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  const moonTitle = await page.title();
  console.log('✓ Moon page title:', moonTitle);

  const callsign = await page.$eval('#callsign', el => el.textContent.trim());
  console.log(`✓ Current lunar descent step: ${callsign}`);

  const padLinkFromMoon = await page.$('a[href="launchpad-preview.html"]');
  if (!padLinkFromMoon) {
    throw new Error('❌ Missing link to 3D Launchpad in moon landing preview');
  }
  console.log('✓ Found link to 3D Launchpad in moon landing preview!');

  await browser.close();
  console.log('\n🎉 ALL 4 E2E TESTS PASSED WITH 100% SUCCESS!');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
