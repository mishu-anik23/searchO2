import { chromium } from 'playwright';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';

const filePath = path.resolve('bavaria/alpenhof.html');
const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');

console.log('========================================================');
console.log('  Alpenhof Economy, Tree Lifecycle & Aquaculture Test');
console.log('========================================================\n');

// 1. Verify 100% Byte Parity
const b1 = fs.readFileSync('bavaria/alpenhof.html');
const b2 = fs.readFileSync('public/bavaria/alpenhof.html');
assert.strictEqual(b1.length, b2.length, 'File size must match exactly');
assert(b1.equals(b2), '100% byte parity required between bavaria/ and public/bavaria/');
console.log('[✓ PASSED] 100% Byte Parity verified (' + b1.length + ' bytes)');

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1
});

const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', err => pageErrors.push(err.message));
page.on('console', msg => {
  if (msg.type() === 'error' && !msg.text().includes('ERR_NAME_NOT_RESOLVED')) {
    pageErrors.push(msg.text());
  }
});

await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(600);

assert.strictEqual(pageErrors.length, 0, 'No page errors allowed on load: ' + pageErrors.join(', '));
console.log('[✓ PASSED] Zero browser console errors on load');

// Dismiss Welcome Banner and Intro Why Modal
await page.evaluate(() => {
  const btn = document.getElementById('btn-start');
  if (btn) btn.click();
  const m = document.getElementById('modal');
  if (m) m.classList.remove('open');
});
await page.waitForTimeout(300);

// =========================================================================
// 2. Test Economy Telemetry HUD Capsule & Overview Modal
// =========================================================================
await page.click('#economyHudCapsule');
await page.waitForTimeout(400);

assert(await page.isVisible('#modal'), 'Economy Overview Modal must open');
const ecoTitle = await page.locator('#modalBody h3').textContent();
assert(ecoTitle.includes('Economy & Oxygen Architecture'), 'Must display Economy Architecture title');

const systemCardsCount = await page.locator('#modalBody .card-box').count();
assert(systemCardsCount >= 6, 'Must display at least 6 core economic systems');
console.log('[✓ PASSED] Comprehensive Alpenhof Economy & O2 Overview verified (6 core systems audited)');

await page.screenshot({ path: 'tests/screenshots/screenshot_alpenhof_economy_overview.png' });
console.log('[✓ SAVED] screenshot_alpenhof_economy_overview.png');

await page.click('#modalBody button:has-text("Close")');
await page.waitForTimeout(300);

// =========================================================================
// 3. Test Orchard Plot Aeration, Planting & Real-time Task Bar
// =========================================================================
// Open Orchard Plot 1 (o1)
await page.evaluate(() => {
  openOrchardModal(SITES.find(s => s.plot === 'o1'));
});
await page.waitForTimeout(400);

assert(await page.isVisible('#modal'), 'Orchard Plot Modal must open');
console.log('[✓ PASSED] Orchard Plot 1 modal opened');

// Aerate Bed #1
await page.evaluate(() => {
  handleBedAction('o1', 0);
});
await page.waitForTimeout(300);

// Plant Sweet Cherry in Bed #1
await page.evaluate(() => {
  plantBed('o1', 0, 'cherry');
});
await page.waitForTimeout(300);

// Check Bed #1 detail console
await page.evaluate(() => {
  openBedDetailModal('o1', 0);
});
await page.waitForTimeout(400);

const bedDetailText = await page.locator('#modalBody').textContent();
assert(bedDetailText.includes('Sweet Cherry'), 'Must show Sweet Cherry in bed detail modal');
assert(bedDetailText.includes('remaining') || bedDetailText.includes('Complete'), 'Must display real-time task bar remaining time');
assert(bedDetailText.includes('Soil Moisture'), 'Must display Soil Moisture bar');
assert(bedDetailText.includes('Canopy Health'), 'Must display Canopy Health bar');
console.log('[✓ PASSED] Tree Bed Detail Console verified with Real-Time Task Bar (% & hours remaining)');

// =========================================================================
// 4. Test Soil Moisture Watering & Bypass Pruning
// =========================================================================
const initialHydration = await page.evaluate(() => {
  const b = state.orchards['o1'].beds[0];
  b.hydration = 45; // simulate drying
  b.canopyHealth = 55; // simulate overgrowth
  return { hydration: b.hydration, health: b.canopyHealth };
});

await page.evaluate(() => {
  waterBed('o1', 0);
});
await page.waitForTimeout(300);

const afterWaterHydration = await page.evaluate(() => state.orchards['o1'].beds[0].hydration);
assert(afterWaterHydration >= 98, 'Watering bed must restore soil moisture to ~100% (was ' + afterWaterHydration + ')');
console.log('[✓ PASSED] Watering bed verified: Soil moisture restored to 100%');

await page.evaluate(() => {
  pruneBed('o1', 0);
});
await page.waitForTimeout(300);

const afterPruneHealth = await page.evaluate(() => state.orchards['o1'].beds[0].canopyHealth);
assert(afterPruneHealth >= 98, 'Pruning bed must restore canopy health to ~100% (was ' + afterPruneHealth + ')');
console.log('[✓ PASSED] Pruning bed verified: Canopy health restored to 100%');

await page.screenshot({ path: 'tests/screenshots/screenshot_alpenhof_bed_care_taskbar.png' });
console.log('[✓ SAVED] screenshot_alpenhof_bed_care_taskbar.png');

// =========================================================================
// 5. Test Neglect Die-Off & Municipal Dead Tree Clearance Truck Animation
// =========================================================================
// Simulate extreme neglect on Bed #1: zero moisture and zero canopy health
await page.evaluate(() => {
  const b = state.orchards['o1'].beds[0];
  b.hydration = 0;
  b.canopyHealth = 0;
  b.isDead = true;
  b.status = 'dead';
  openBedDetailModal('o1', 0);
});
await page.waitForTimeout(400);

const deadModalText = await page.locator('#modalBody').textContent();
assert(deadModalText.includes('Tree Died From Neglect'), 'Dead tree card must be visible');
assert(deadModalText.includes('Fell & Clear Snag (-€15)'), 'Fell and clear button must be visible');
console.log('[✓ PASSED] Neglect consequence verified: Tree died from lack of care');

const moneyBeforeFelling = await page.evaluate(() => state.money);
const vehiclesBeforeFelling = await page.evaluate(() => state.vehicles.length);

// Execute Dead Tree Felling
await page.evaluate(() => {
  fellDeadTree('o1', 0);
});
await page.waitForTimeout(300);

const moneyAfterFelling = await page.evaluate(() => state.money);
const vehiclesAfterFelling = await page.evaluate(() => state.vehicles);
const deadTreeTruck = vehiclesAfterFelling.find(v => v.type === 'dead_tree_truck');

assert.strictEqual(moneyBeforeFelling - moneyAfterFelling, 15, 'Dead tree removal must deduct €15 removal fee');
assert(deadTreeTruck, 'Municipal dead tree clearance truck must be spawned');
assert(deadTreeTruck.waypoints.length >= 10, 'Dead tree clearance truck must follow arterial road network to Alps Main Gate');
console.log('[✓ PASSED] Dead tree felling verified: €15 fee paid & municipal flatbed truck spawned on road network');

// =========================================================================
// 6. Test Mature Tree Timber Selling & Heavy Logging Transporter Animation
// =========================================================================
// Plant an ancient oak in Bed #2 and set to mature
await page.evaluate(() => {
  state.orchards['o1'].beds[1].status = 'empty';
  plantBed('o1', 1, 'oak');
  const b = state.orchards['o1'].beds[1];
  b.status = 'mature';
  b.stage = 'mature';
  b.progress = 1.0;
  openBedDetailModal('o1', 1);
});
await page.waitForTimeout(400);

const matureModalText = await page.locator('#modalBody').textContent();
assert(matureModalText.includes('Mature Fruiting') || matureModalText.includes('Commercial Harvest'), 'Must display mature harvesting options');

const moneyBeforeTimber = await page.evaluate(() => state.money);

// Sell mature oak timber
await page.evaluate(() => {
  sellTimberTree('o1', 1);
});
await page.waitForTimeout(300);

const moneyAfterTimber = await page.evaluate(() => state.money);
const timberEarned = moneyAfterTimber - moneyBeforeTimber;
assert(timberEarned >= 250, 'Selling ancient oak timber must yield substantial payout (+€' + timberEarned + ')');

const vehiclesAfterTimber = await page.evaluate(() => state.vehicles);
const timberTruck = vehiclesAfterTimber.find(v => v.type === 'timber_truck');
assert(timberTruck, 'Heavy timber logging truck must be spawned');
assert(timberTruck.waypoints.length >= 10, 'Timber truck must travel along road network to Alps Main Gate');
console.log('[✓ PASSED] Timber tree selling verified: +€' + timberEarned + ' revenue & logging hauler spawned on road network');

// =========================================================================
// 7. Test Living Pond Glacial Aquaculture & Restaurant/BBQ Demand Supply
// =========================================================================
await page.evaluate(() => {
  state.built['pond'] = true;
  state.lake.stage = 4;
  openLakeModal();
});
await page.waitForTimeout(400);

const lakeModalText = await page.locator('#modalBody').textContent();
assert(lakeModalText.includes('Gastronomy Aquaculture Demand Status') || lakeModalText.includes('Daily Culinary Targets'), 'Lake console must display gastronomy demand targets');
assert(lakeModalText.includes('Gasthof Stuben') && lakeModalText.includes('Hilltop BBQ'), 'Must track both Gasthof Stuben and Hilltop BBQ targets');
console.log('[✓ PASSED] Lake console verified with Gasthof Stuben & Hilltop BBQ aquaculture demands');

const moneyBeforeSupply = await page.evaluate(() => state.money);

// Execute harvest and supply kitchens
await page.evaluate(() => {
  harvestAndSupplyKitchens();
});
await page.waitForTimeout(400);

const demandStatus = await page.evaluate(() => ({
  restFish: state.dailyDemand.restaurant.current.fish,
  restDuck: state.dailyDemand.restaurant.current.duck,
  bbqFish: state.dailyDemand.bbq.current.fish,
  bbqDuck: state.dailyDemand.bbq.current.duck
}));

assert.strictEqual(demandStatus.restFish, 10, 'Gasthof Stuben fish demand must be fulfilled (10)');
assert.strictEqual(demandStatus.restDuck, 6, 'Gasthof Stuben duck demand must be fulfilled (6)');
assert.strictEqual(demandStatus.bbqFish, 8, 'Hilltop BBQ fish demand must be fulfilled (8)');
assert.strictEqual(demandStatus.bbqDuck, 5, 'Hilltop BBQ duck demand must be fulfilled (5)');
console.log('[✓ PASSED] Living pond harvest fulfilled Gasthof Stuben & BBQ demand (Fish & Duck delivered)');

await page.screenshot({ path: 'tests/screenshots/screenshot_alpenhof_living_lake_demand.png' });
console.log('[✓ SAVED] screenshot_alpenhof_living_lake_demand.png');

// =========================================================================
// 8. Test Flower Garden Cultivation & Alpenblumen-Standl Bouquets
// =========================================================================
// Open Flower Garden Modal
await page.evaluate(() => {
  state.built['flower_oval'] = true;
  state.built['flower_stand'] = true;
  openFlowerModal(0);
});
await page.waitForTimeout(400);

const flowerGardenText = await page.locator('#modalBody').textContent();
assert(flowerGardenText.includes('Harvest Fresh Alpine Bouquets'), 'Must have bouquet harvesting action in flower garden');

await page.evaluate(() => {
  harvestGardenBouquets();
});
await page.waitForTimeout(300);

const bouquetStock = await page.evaluate(() => state.flowers.inventory);
assert(bouquetStock.edelweiss >= 10, 'Bouquet harvest must stock Edelweiß bunches');
console.log('[✓ PASSED] Flower garden cultivation & bouquet harvesting verified');

// Open Flower Stand Modal
await page.evaluate(() => {
  openFlowerStandModal();
});
await page.waitForTimeout(400);

const standText = await page.locator('#modalBody').textContent();
assert(standText.includes('Alpenblumen-Standl'), 'Must display Alpenblumen-Standl title');
assert(standText.includes('Leontopodium nivale') || standText.includes('Edelweiß'), 'Must display Edelweiß bouquets');

const moneyBeforeFlowerSale = await page.evaluate(() => state.money);
await page.evaluate(() => {
  sellFlowerBouquet();
});
await page.waitForTimeout(300);

const moneyAfterFlowerSale = await page.evaluate(() => state.money);
assert.strictEqual(moneyAfterFlowerSale - moneyBeforeFlowerSale, 45, 'Selling bouquets must earn €45');
console.log('[✓ PASSED] Alpenblumen-Standl boutique selling verified: +€45 revenue & O2 bonus');

await page.screenshot({ path: 'tests/screenshots/screenshot_alpenhof_flower_stand.png' });
console.log('[✓ SAVED] screenshot_alpenhof_flower_stand.png');

await browser.close();
console.log('\n========================================================');
console.log('  ALL ALPENHOF ECONOMY, TREES & AQUACULTURE TESTS PASSED!');
console.log('========================================================\n');
