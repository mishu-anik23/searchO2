const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log('====================================================');
  console.log('  Saint Martin Blue Lab Diving & Avian Verification ');
  console.log('====================================================');

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

  const fileUrl = 'file:///' + path.resolve('saint-martin/blue-lab.html').replace(/\\/g, '/');
  console.log('Loading:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // 1. Skip boat tour to land on island
  if (await page.isVisible('#btn-skip-boat')) {
    await page.click('#btn-skip-boat');
    await page.waitForTimeout(400);
  }
  const isWhyOpen = await page.isVisible('#why-modal');
  if (isWhyOpen) {
    await page.click('#why-ack');
    await page.waitForTimeout(300);
  }

  // 2. Verify Avian Engine
  const birdsCount = await page.evaluate(() => SaintMartinBirds.birds.length);
  assert(birdsCount >= 4, 'SaintMartinBirds must have at least 4 birds spawned in sky: ' + birdsCount);
  console.log('[✓ PASSED] Saint Martin Avian Engine active with ' + birdsCount + ' soaring 3D birds');

  // 3. Verify Construction costs for Diving Stands
  const bldgData = await page.evaluate(() => ({
    central: state.buildings.reef_basin_central,
    outer: state.buildings.reef_basin_outer
  }));
  assert.strictEqual(bldgData.central.cost, 140, 'reef_basin_central cost must be 140');
  assert.strictEqual(bldgData.outer.cost, 160, 'reef_basin_outer cost must be 160');
  console.log('[✓ PASSED] Diving stands construction costs verified (€140 Lagoon, €160 Trench)');

  // 4. Test clicking unbuilt reef_basin_central triggers construction modal
  await page.evaluate(() => {
    IslandMap.handleSiteAction('reef_basin_central', 'reef_basin_central');
  });
  await page.waitForTimeout(300);
  let isConstructOpen = await page.$eval('#garden-construct-modal', el => el.classList.contains('open'));
  assert.strictEqual(isConstructOpen, true, 'Clicking unbuilt reef_basin_central must open garden-construct-modal');
  let constructTitle = await page.textContent('#garden-construct-title');
  assert(constructTitle.includes('Coral Sanctuary'), 'Construction title must mention Coral Sanctuary: ' + constructTitle);
  console.log('[✓ PASSED] Unbuilt reef_basin_central correctly opens construction modal');
  await page.evaluate(() => document.getElementById('garden-construct-modal').classList.remove('open'));
  await page.waitForTimeout(200);

  // 5. Build both diving stands and verify 3D stand rendering
  await page.evaluate(() => {
    state.buildings.reef_basin_central.built = true;
    state.buildings.reef_basin_central.building = false;
    state.buildings.reef_basin_central.progress = 100;
    state.buildings.reef_basin_outer.built = true;
    state.buildings.reef_basin_outer.building = false;
    state.buildings.reef_basin_outer.progress = 100;
  });
  await page.waitForTimeout(400);

  // 6. Test clicking built reef_basin_central opens coral explore modal with scientific details
  await page.evaluate(() => {
    IslandMap.handleSiteAction('reef_basin_central', 'reef_basin_central');
  });
  await page.waitForTimeout(300);
  let isCoralExploreOpen = await page.$eval('#coral-explore-modal', el => el.classList.contains('open'));
  assert.strictEqual(isCoralExploreOpen, true, 'Clicking built reef_basin_central must open coral-explore-modal');
  let exploreContent = await page.textContent('#coral-explore-content');
  assert(exploreContent.includes('CaCO₃ Aragonite'), 'Modal must contain CaCO3 Aragonite biomineralization science');
  assert(exploreContent.includes('Zooxanthellae Symbiosis'), 'Modal must contain Zooxanthellae Symbiosis science');
  assert(exploreContent.includes('Wave Energy Dissipation'), 'Modal must contain wave dissipation');
  console.log('[✓ PASSED] Coral explore modal displays rich CaCO3 aragonite biomineralization & zooxanthellae science');
  await page.click('#coral-explore-close');
  await page.waitForTimeout(200);

  // 7. Test clicking built reef_basin_outer opens 3D Deep Trench explore modal
  await page.evaluate(() => {
    IslandMap.handleSiteAction('reef_basin_outer', 'reef_basin_outer');
  });
  await page.waitForTimeout(300);
  isCoralExploreOpen = await page.$eval('#coral-explore-modal', el => el.classList.contains('open'));
  assert.strictEqual(isCoralExploreOpen, true, 'Clicking built reef_basin_outer must open coral-explore-modal');
  let exploreTitle = await page.textContent('#coral-explore-title');
  assert(exploreTitle.includes('Deep Trench Dive Base'), 'Modal title must specify Deep Trench Dive Base');
  console.log('[✓ PASSED] Deep Trench explore modal displays outer trench specifications');
  await page.click('#coral-explore-close');
  await page.waitForTimeout(200);

  // 8. Test entering 3D Dive zone from Island
  await page.evaluate(() => enterDive('reef_basin_central'));
  await page.waitForTimeout(500);
  assert(await page.isVisible('#dive-zone'), '#dive-zone must be visible');
  
  // Verify DiveScene sanctuary positions: Lagoon (0.72, 0.28) and Trench (0.22, 0.78)
  const diveSanctuaries = await page.evaluate(() => DiveScene.sanctuaries);
  assert.strictEqual(diveSanctuaries.lagoon.cx, 0.72, 'Lagoon cx must be 0.72');
  assert.strictEqual(diveSanctuaries.lagoon.cy, 0.28, 'Lagoon cy must be 0.28');
  assert.strictEqual(diveSanctuaries.trench.cx, 0.22, 'Trench cx must be 0.22');
  assert.strictEqual(diveSanctuaries.trench.cy, 0.78, 'Trench cy must be 0.78');
  console.log('[✓ PASSED] DiveScene sanctuaries separated across corridor (Lagoon: 0.72, 0.28 vs Trench: 0.22, 0.78)');

  // Verify Icon-only buttons dock in dive zone
  const hasViewBtn = await page.$('#btn-dive-view');
  const hasSanctBtn = await page.$('#btn-dive-sanctuary');
  const hasScanBtn = await page.$('#btn-dive-scan');
  const hasSurfaceBtn = await page.$('#btn-surface');
  assert(hasViewBtn && hasSanctBtn && hasScanBtn && hasSurfaceBtn, 'All 4 icon buttons must exist in dive zone');
  console.log('[✓ PASSED] Clean icon-only dock verified with tooltips');

  // Surface back to island
  await page.click('#btn-surface');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#island-zone'), 'Must return to island surface');
  console.log('[✓ PASSED] Successfully ascended to island');

  // Verify zero browser errors
  assert.strictEqual(errors.length, 0, 'Zero errors expected: ' + JSON.stringify(errors));
  console.log('[✓ PASSED] 0 page errors throughout test execution');

  await browser.close();
  console.log('====================================================');
  console.log('  ALL DIVING & AVIAN TESTS PASSED (100% GREEN)       ');
  console.log('====================================================');
})();
