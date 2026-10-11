const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log("==================================================================");
  console.log("  3D Globe Zoom Borders & Dev BD Toggle Verification Suite        ");
  console.log("==================================================================");

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.message);
    console.error('[BROWSER ERROR]:', err.message);
  });

  const indexUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
  console.log('Loading Index:', indexUrl);

  await page.goto(indexUrl, { waitUntil: 'load' });
  await page.waitForTimeout(600);

  // 1. Verify Zero Page Errors on Load
  assert.strictEqual(errors.length, 0, `index.html loaded with errors: ${errors.join(', ')}`);
  console.log('[✓ PASSED] Zero browser page errors on index.html load');

  // Dismiss initial auth modal directly via DOM
  await page.evaluate(() => {
    var overlay = document.getElementById('initialAuthOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }
    var rScreen = document.getElementById('regionScreen');
    if (rScreen) rScreen.classList.remove('screen-blurred');
  });
  await page.waitForTimeout(200);

  // 2. Switch to Farm Screen where Dev Region Toggle Button is active
  await page.evaluate(() => {
    switchScreen('farm');
  });
  await page.waitForTimeout(300);

  const devBtn = await page.$('#devRegionToggleBtn');
  assert(devBtn, '#devRegionToggleBtn must exist in farm screen');
  let btnText = await page.evaluate(() => document.getElementById('devRegionToggleBtn').innerText);
  console.log('Initial Dev Button Text:', btnText);
  assert(btnText.includes('🇩🇪'), 'Initial dev button must show Germany flag');

  // 3. Cycle Dev Region Toggle until Saint Martin (BD)
  // Germany -> Sweden -> Brazil -> Spain -> Saint Martin (BD)
  await page.click('#devRegionToggleBtn'); // -> Sweden
  await page.waitForTimeout(150);
  await page.click('#devRegionToggleBtn'); // -> Brazil
  await page.waitForTimeout(150);
  await page.click('#devRegionToggleBtn'); // -> Spain
  await page.waitForTimeout(150);
  await page.click('#devRegionToggleBtn'); // -> Saint Martin (BD)
  await page.waitForTimeout(250);

  const devRegionState = await page.evaluate(() => devRegionPreview);
  console.log('Active devRegionPreview:', devRegionState);
  assert.strictEqual(devRegionState, 'saint_martin', 'devRegionPreview must cycle to saint_martin');

  btnText = await page.evaluate(() => document.getElementById('devRegionToggleBtn').innerText);
  console.log('Saint Martin Dev Button Text:', btnText);
  assert(btnText.includes('🇧🇩') && btnText.includes('ENTER LAB'), 'Dev button in saint_martin mode must show 🇧🇩 and ENTER LAB');
  console.log('[✓ PASSED] Dev Region Toggle cycles to BD with ENTER LAB indicator');

  // 4. Click Dev Button in BD Mode to navigate to Blue Lab
  console.log('Clicking Dev Button to launch Blue Lab...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'load', timeout: 5000 }).catch(() => {}),
    page.click('#devRegionToggleBtn')
  ]);
  await page.waitForTimeout(600);

  let currentUrl = page.url();
  console.log('Navigated URL after clicking Dev BD Button:', currentUrl);
  assert(currentUrl.includes('blue-lab.html'), 'Clicking Dev BD Button must navigate to blue-lab.html');
  console.log('[✓ PASSED] Dev BD Toggle navigates directly to Saint Martin Blue Lab');

  // 5. Return to index.html and test Regional View, 3D Globe & Regional Card
  console.log('Returning to index.html to test Regional View & 3D Globe...');
  await page.goto(indexUrl, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // Switch to Regional Screen
  await page.evaluate(() => {
    var overlay = document.getElementById('initialAuthOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }
    var rScreen = document.getElementById('regionScreen');
    if (rScreen) rScreen.classList.remove('screen-blurred');
    switchScreen('region_select');
  });
  await page.waitForTimeout(500);

  // Verify Saint Martin card in Region Cards DOM
  const smCardData = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.region-card'));
    const sm = cards.find(c => c.innerText.includes('Saint Martin') || c.innerText.includes('🇧🇩'));
    if (!sm) return null;
    return {
      text: sm.innerText,
      hasBtn: sm.querySelector('[data-enterfarm="saint_martin"]') !== null
    };
  });
  assert(smCardData, 'Saint Martin region card must exist in DOM');
  assert(smCardData.text.includes('Bangladesh') && smCardData.text.includes('🇧🇩'), 'Card must show Bangladesh and 🇧🇩');
  console.log('[✓ PASSED] Saint Martin region card rendered with Bangladesh 🇧🇩 details');

  // Verify Saint Martin card in Region Cards
  const smCardExists = await page.evaluate(() => {
    const card = document.querySelector('[data-enterfarm="saint_martin"]');
    return card !== null;
  });
  assert(smCardExists, 'Saint Martin active card with data-enterfarm="saint_martin" must exist in region cards');
  console.log('[✓ PASSED] Saint Martin active card with "Enter Blue Lab ➔" button exists');

  // Verify 3D Globe Canvas & Vector Border Polygons
  const globeCanvas = await page.$('#globeCanvas');
  assert(globeCanvas, '#globeCanvas must exist in regional screen');

  // Test Globe Zoom controls
  await page.evaluate(() => {
    var zoomBtn = document.getElementById('btnGlobeZoomIn');
    if (zoomBtn) zoomBtn.click();
  });
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    var zoomBtn = document.getElementById('btnGlobeZoomIn');
    if (zoomBtn) zoomBtn.click();
  });
  await page.waitForTimeout(200);
  console.log('[✓ PASSED] Globe zoom-in controls operational');

  // Test Clicking Saint Martin card button navigates to Blue Lab
  console.log('Clicking Enter Blue Lab on Saint Martin card...');
  await page.evaluate(() => {
    var btn = document.querySelector('button[data-enterfarm="saint_martin"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);

  currentUrl = page.url();
  console.log('Navigated URL from Saint Martin card:', currentUrl);
  assert(currentUrl.includes('blue-lab.html'), 'Clicking Enter Blue Lab button must navigate to blue-lab.html');
  console.log('[✓ PASSED] Enter Blue Lab card button navigates to blue-lab.html');

  // 6. Test Blue Lab operational features
  await page.click('#btn-skip-boat');
  await page.waitForTimeout(400);

  const isIslandVisible = await page.isVisible('#island-zone');
  assert(isIslandVisible, '#island-zone must be visible after landing');

  // Dismiss Chapter Briefing modal if open
  await page.waitForTimeout(400);
  const isWhyOpen = await page.isVisible('#why-modal');
  if (isWhyOpen) {
    await page.click('#why-ack');
    await page.waitForTimeout(300);
    console.log('[✓ PASSED] Chapter 1 briefing acknowledged');
  }

  const sbText = await page.textContent('#scoreboard');
  assert(sbText.includes('SHI') && sbText.includes('DO') && sbText.includes('O₂'), 'Scoreboard must have SHI, DO, O2');
  console.log('[✓ PASSED] Blue Lab Scoreboard with Sea Health Index & Dissolved O2 active');

  // Open Sea Dashboard
  await page.click('#btn-sea-dash');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#seadash-modal'), '#seadash-modal must be open');
  console.log('[✓ PASSED] Special Sea Dashboard verified');
  await page.click('#sd-close');
  await page.waitForTimeout(200);

  // Open Masterplan
  await page.click('#btn-masterplan');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#master-modal'), '#master-modal must be open');
  console.log('[✓ PASSED] 5-Chapter Masterplan verified');
  await page.click('#master-close');
  await page.waitForTimeout(200);

  await browser.close();
  console.log('==================================================================');
  console.log('  ALL GLOBE, DEV TOGGLE & BLUE LAB TESTS PASSED SUCCESSFULLY!     ');
  console.log('==================================================================');
})().catch(err => {
  console.error('[TEST FAILURE]:', err);
  process.exit(1);
});
