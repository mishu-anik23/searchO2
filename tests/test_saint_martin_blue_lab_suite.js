const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log("====================================================");
  console.log("  Saint Martin Blue Lab Comprehensive Verification  ");
  console.log("====================================================");

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

  const blueLabUrl = 'file:///' + path.resolve(__dirname, '..', 'saint-martin', 'blue-lab.html').replace(/\\/g, '/');
  console.log('Loading:', blueLabUrl);

  await page.goto(blueLabUrl, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // 1. Verify Zero Page Errors on Load
  assert.strictEqual(errors.length, 0, `Page loaded with errors: ${errors.join(', ')}`);
  console.log('[✓ PASSED] Zero browser page errors on load');

  // 2. Skip Boat Tour to Land on Island
  const btnSkip = await page.$('#btn-skip-boat');
  assert(btnSkip, '#btn-skip-boat must exist');
  await page.click('#btn-skip-boat');
  await page.waitForTimeout(600);

  // 3. Verify Island Canvas & Scoreboard
  const isIslandVisible = await page.isVisible('#island-zone');
  assert(isIslandVisible, '#island-zone must be visible after landing');
  console.log('[✓ PASSED] Island zone active & rendered');

  // Dismiss Chapter Briefing modal if open
  await page.waitForTimeout(500);
  const isWhyOpen = await page.isVisible('#why-modal');
  if (isWhyOpen) {
    await page.click('#why-ack');
    await page.waitForTimeout(400);
    console.log('[✓ PASSED] Chapter 1 briefing acknowledged');
  }

  const sbText = await page.textContent('#scoreboard');
  assert(sbText.includes('SHI') && sbText.includes('DO') && sbText.includes('O₂'), 'Scoreboard must have SHI, DO, O2');
  console.log('[✓ PASSED] Scoreboard rendered with Sea Health Index & Dissolved O2');

  // 4. Test Special Sea Dashboard Modal
  await page.click('#btn-sea-dash');
  await page.waitForTimeout(400);
  const isSeaDashVisible = await page.isVisible('#seadash-modal');
  assert(isSeaDashVisible, '#seadash-modal must be open');
  const seaDashText = await page.textContent('#seadash-body');
  assert(seaDashText.includes('Sea Health Index') && seaDashText.includes('Algae Bioreactor'), 'Sea dashboard must include gauges and algae telemetry');
  console.log('[✓ PASSED] Special Sea Dashboard modal opened with live gauges and Big Jar Algae telemetry');
  await page.click('#sd-close');
  await page.waitForTimeout(300);

  // 5. Test Labour Market & Crew Shed Modal
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-labour');
  await page.waitForTimeout(400);
  const isLabourVisible = await page.isVisible('#labour-modal');
  assert(isLabourVisible, '#labour-modal must be open');
  const labourText = await page.textContent('#labour-body');
  assert(labourText.includes('Rahim') && labourText.includes('Fatema') && labourText.includes('Tarek'), 'Labour market must contain worker roster');
  console.log('[✓ PASSED] Labour market modal active with specialized worker roster');
  await page.click('#labour-close');
  await page.waitForTimeout(300);

  // 6. Test 5-Chapter Masterplan
  await page.click('#btn-masterplan');
  await page.waitForTimeout(400);
  const isMasterVisible = await page.isVisible('#master-modal');
  assert(isMasterVisible, '#master-modal must be open');
  const masterText = await page.textContent('#master-body');
  assert(masterText.includes('Ch.1') && masterText.includes('Ch.5') && masterText.includes('German Farm Link'), 'Masterplan must show 5 chapters');
  console.log('[✓ PASSED] 5-Chapter Masterplan modal active with Ch 1-5 progression');
  await page.click('#master-close');
  await page.waitForTimeout(300);

  // 7. Test 3D Reef Dive Zone
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-dive');
  await page.waitForTimeout(500);
  const isDiveVisible = await page.isVisible('#dive-zone');
  assert(isDiveVisible, '#dive-zone must be active');
  console.log('[✓ PASSED] 3D Reef Dive zone entered successfully');
  await page.click('#btn-surface');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#island-zone'), 'Must return to surface island zone');
  console.log('[✓ PASSED] Successfully ascended to surface');

  await browser.close();
  console.log("====================================================");
  console.log("  ALL SAINT MARTIN BLUE LAB CHECKS PASSED (100%)    ");
  console.log("====================================================");
})();
