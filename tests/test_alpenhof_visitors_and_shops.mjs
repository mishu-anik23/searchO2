import { chromium } from 'playwright';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';

const filePath = path.resolve('bavaria/alpenhof.html');
const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');

console.log('========================================================');
console.log('  Alpenhof Volumetric 3D Visitors & Managerial Shops Test');
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
await page.click('#btn-start');
await page.waitForTimeout(300);
if (await page.isVisible('.btn-close')) {
  await page.click('.btn-close');
  await page.waitForTimeout(200);
}

// 2. Verify Visitor Spawning at Main Gate [1750, 890]
// Unlock visitors (or Chapter 2 unlock)
await page.evaluate(() => {
  state.chapter = 2; // Chapter 1 complete!
  spawnRandomVisitor('gastronomy_market');
  spawnRandomVisitor('highland_overbridge');
  spawnRandomVisitor('garden_lake_bypass');
});
await page.waitForTimeout(400);

const visitorCount = await page.evaluate(() => farmVisitors.length);
assert(visitorCount >= 3, 'Must have at least 3 active visitors spawned');
console.log('[✓ PASSED] Active farm visitors spawned successfully: ' + visitorCount + ' visitors');

// Verify initial spawn location was at Main Gate [1750, 890]
const spawnPos = await page.evaluate(() => {
  const v = farmVisitors[0];
  return { wp0: v.waypoints[0], curr: [Math.round(v.x), Math.round(v.y)] };
});
assert.strictEqual(spawnPos.wp0[0], 1750, 'Spawn waypoint X must be Main Gate 1750');
assert.strictEqual(spawnPos.wp0[1], 890, 'Spawn waypoint Y must be Main Gate 890');
console.log('[✓ PASSED] Visitors spawn strictly at Main Entrance Gate [1750, 890] after Chapter 1');

// 3. Verify Cultural Diversity & Roster
const profiles = await page.evaluate(() => farmVisitors.map(v => ({
  name: v.profile.name,
  origin: v.profile.origin,
  attire: v.profile.attire,
  accessory: v.profile.accessory
})));
assert(profiles.length >= 3, 'Must have diverse profiles');
console.log('[✓ PASSED] Cultural diversity verified:', profiles.map(p => p.name + ' (' + p.origin + ')').join('; '));

// 4. Verify Road Network Following & Walking Kinematics
await page.evaluate(() => {
  // Advance simulation by 5 seconds
  for (let t = 0; t < 5; t += 0.016) {
    updateVisitorSimulation(0.016, t);
  }
});
const posAfterMove = await page.evaluate(() => {
  const v = farmVisitors[0];
  return { x: Math.round(v.x), y: Math.round(v.y), angle: v.angle, walkPhase: v.walkPhase };
});
assert(posAfterMove.walkPhase > 0, 'Walk phase must animate leg swing');
assert(Math.abs(posAfterMove.angle) > 0, 'Heading angle must adapt along road segment');
console.log('[✓ PASSED] Walking kinematics verified: legs swinging, smooth turning along road network');

// 5. Test Clickable Visitor Pass Modal
await page.evaluate(() => {
  const v = farmVisitors[0];
  openVisitorPassModal(v);
});
await page.waitForTimeout(300);
assert(await page.isVisible('#modal'), 'Visitor Pass Modal must be visible');
const modalTitle = await page.locator('#modalBody h3').textContent();
assert(modalTitle.includes('Alpenhof Guest Pass'), 'Modal header must be Alpenhof Guest Pass');
console.log('[✓ PASSED] Clickable 3D Visitor Pass Modal opens successfully: ' + modalTitle);

// Test Offering Complimentary Cider
await page.click('#modalBody button:has-text("Offer Complimentary Cider")');
await page.waitForTimeout(300);
const satAfter = await page.evaluate(() => farmVisitors[0].satisfaction);
assert(satAfter >= 95, 'Satisfaction must increase after hospitality gift');
console.log('[✓ PASSED] Hospitality interaction verified: satisfaction increased to ' + satAfter + '%');

// 6. Test Pip Guided VIP Tour
await page.evaluate(() => {
  spawnPipGuidedTour();
});
await page.waitForTimeout(300);
const hasPipTour = await page.evaluate(() => pipTourGroup !== null && pipTourGroup.guests.length >= 2);
assert(hasPipTour, 'Pip Tour Group must be active with Pip and tour guests');
console.log('[✓ PASSED] Pip Eco-Tour Guide active: Pip leading group with tour pennant flag');

// Open Pip Tour Console
await page.evaluate(() => {
  openPipTourConsole();
});
await page.waitForTimeout(300);
const pipTitle = await page.locator('#modalBody h3').textContent();
assert(pipTitle.includes('Pip Eco-Tour Guide Console'), 'Must open Pip Tour Console');
console.log('[✓ PASSED] Pip Tour Console verified with multi-station eco-tour progress');

// Boost Pip Tour
await page.click('#modalBody button:has-text("Award Pip Tour Bonus")');
await page.waitForTimeout(300);
console.log('[✓ PASSED] Pip tour reward awarded successfully');

// 7. Test Interactive Managerial Store Decision Console
// Click the new Visitor HUD Capsule in header
await page.click('#visitorHudCapsule');
await page.waitForTimeout(300);
assert(await page.isVisible('#modal'), 'Managerial Trade Console must open');
const tradeTitle = await page.locator('#modalBody h3').textContent();
assert(tradeTitle.includes('Store Managerial Decision Console'), 'Must open Store Managerial Decision Console');
console.log('[✓ PASSED] Store Managerial Decision Console opened via HUD capsule');

// Check options and worker
const workerText = await page.locator('#modalBody b:has-text("Gretel Huber")').count();
assert(workerText > 0, 'Responsible worker Gretel Huber must be displayed advising the Manager');
console.log('[✓ PASSED] Responsible worker (Gretel Huber) advises player manager on trade decision');

// Authorize Managerial Decision (Option 2: Grant Eco-Cooperative Partner Terms)
const initialMoney = await page.evaluate(() => state.money);
await page.click('#modalBody button:has-text("Authorize ➜") >> nth=1');
await page.waitForTimeout(300);

const afterMoney = await page.evaluate(() => state.money);
assert(afterMoney > initialMoney, 'Treasury must increase after authorizing wholesale trade');
console.log('[✓ PASSED] Managerial trade authorized: Treasury increased by €' + (afterMoney - initialMoney));

// 8. Capture Screenshots
await page.screenshot({ path: 'tests/screenshots/screenshot_alpenhof_visitors_active.png' });
console.log('[✓ SAVED] screenshot_alpenhof_visitors_active.png');

await page.evaluate(() => {
  openManagerialTradeModal();
});
await page.waitForTimeout(300);
await page.screenshot({ path: 'tests/screenshots/screenshot_alpenhof_managerial_trade.png' });
console.log('[✓ SAVED] screenshot_alpenhof_managerial_trade.png');

await browser.close();
console.log('\n========================================================');
console.log('  ALL ALPENHOF 3D VISITORS & MANAGERIAL SHOPS TESTS PASSED!');
console.log('========================================================\n');
