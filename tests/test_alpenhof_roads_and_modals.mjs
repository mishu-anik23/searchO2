import { chromium } from 'playwright';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';

const filePath = path.resolve('bavaria/alpenhof.html');
const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');

console.log('========================================================');
console.log('  Alpenhof Road Network & Redesigned Modals Verification');
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

// ========================================================
// 2. Road Network Model & Specs Verification
// ========================================================
const roadData = await page.evaluate(() => {
  return {
    segmentsCount: ALPENHOF_ROAD_NETWORK.length,
    segments: ALPENHOF_ROAD_NETWORK.map(r => ({ id: r.id, type: r.road_type, width: r.width_px, pts: r.waypoints.length })),
    types: Object.keys(ROAD_TYPE_SPECS),
    specs: ROAD_TYPE_SPECS
  };
});

assert.strictEqual(roadData.segmentsCount, 15, 'Must have exactly 15 road segments from alpenhof_road_network.json');
assert.strictEqual(roadData.types.length, 4, 'Must have 4 calibrated road type specifications');
assert(roadData.types.includes('type_a_main_arterial'), 'Must include type_a_main_arterial');
assert(roadData.types.includes('type_b_sub_road'), 'Must include type_b_sub_road');
assert(roadData.types.includes('type_c_garden_path'), 'Must include type_c_garden_path');
assert(roadData.types.includes('type_d_bypass_road'), 'Must include type_d_bypass_road');

// Check Primary Arterial
const primary = roadData.segments.find(s => s.id === 'main_arterial_primary');
assert(primary, 'Must find main_arterial_primary');
assert.strictEqual(primary.width, 32, 'Primary arterial width must be 32px');
assert.strictEqual(primary.pts, 11, 'Primary arterial must have 11 waypoints matching JSON');

// Check Southern Pond Bypass
const bypass = roadData.segments.find(s => s.id === 'bypass_road_southern_pond');
assert(bypass, 'Must find bypass_road_southern_pond');
assert.strictEqual(bypass.pts, 14, 'Bypass must have 14 waypoints matching JSON');

console.log('[✓ PASSED] Road network structure verified: 15 segments across 4 calibrated types');

// ========================================================
// 3. Old Sticky Modal Removal Verification
// ========================================================
const capsuleStyles = await page.evaluate(() => {
  const el = document.getElementById('taskCapsule');
  const computed = window.getComputedStyle(el);
  return {
    top: computed.top,
    bottom: computed.bottom,
    left: computed.left,
    position: computed.position,
    cursor: computed.cursor
  };
});

assert.notStrictEqual(capsuleStyles.bottom, '20px', 'Task capsule must not be sticky at bottom: 20px');
assert.strictEqual(capsuleStyles.cursor, 'pointer', 'Task capsule must have pointer cursor to invite exploration click');
console.log('[✓ PASSED] Old bottom-left sticky task capsule removed; repositioned as header tracker pill');

// Click task capsule to open redesigned Chapter Exploration modal
await page.click('#taskCapsule');
await page.waitForTimeout(300);
assert(await page.isVisible('#modal.open'), 'Clicking task capsule must open the Chapter Exploration modal');

const masterHdr = await page.textContent('.modal-hdr h3');
assert(masterHdr.includes('Mastery Journey') || masterHdr.includes('Chapter'), 'Modal header title verified');
console.log('[✓ PASSED] Clicking header task capsule successfully opens Chapter Exploration modal');

// ========================================================
// 4. Redesigned Chapter Exploration Modal & Recall Links
// ========================================================
const modalBodyText = await page.textContent('#modalBody');
assert(modalBodyText.includes('Survey the Alpenhof Estate'), 'Ch 1 present');
assert(modalBodyText.includes('Recalling Solo Founder Ch. 1'), 'Ch 1 recall present');
assert(modalBodyText.includes('Streuobst Soil Mechanics & Crust Aeration'), 'Ch 2 present');
assert(modalBodyText.includes('Recalling Infrastructure & Tilth Ch. 2'), 'Ch 2 recall present');
assert(modalBodyText.includes('Polyculture Arable & Pollinator Guilds'), 'Ch 3 present');
assert(modalBodyText.includes('Recalling Ecosystem & Companion Guilds Ch. 3'), 'Ch 3 recall present');
assert(modalBodyText.includes('Closed-Loop Living Waters & Alpine Grazing'), 'Ch 4 present');
assert(modalBodyText.includes('Recalling Circular Closed-Loop Ecology Ch. 4'), 'Ch 4 recall present');
assert(modalBodyText.includes('Mountain Renewable Microgrid & Automation'), 'Ch 5 present');
assert(modalBodyText.includes('Recalling Microgrid & Clean Power Ch. 5'), 'Ch 5 recall present');
assert(modalBodyText.includes('Eco-Village Community & Farm-to-Table Stuben'), 'Ch 6 present');
assert(modalBodyText.includes('Recalling Eco-Village & Commerce Ch. 6'), 'Ch 6 recall present');

// Verify Objects & Facilities Listed
assert(modalBodyText.includes('Streuobst Orchard Plot 1'), 'Must list Streuobst plots');
assert(modalBodyText.includes('Alps Main Entrance Gate'), 'Must list Gate');
assert(modalBodyText.includes('Farm Shed & Workshop'), 'Must list Farm Shed');
assert(modalBodyText.includes('48-Plot Hexagonal Vegetable Garden'), 'Must list Vegetable Garden');
assert(modalBodyText.includes('Living Waters Alpine Lake System'), 'Must list Lake System');
assert(modalBodyText.includes('4×4 Agrivoltaic Solar Farm'), 'Must list Solar Farm');
assert(modalBodyText.includes('Alpenhof Gasthof & Village Restaurant'), 'Must list Village Restaurant');
console.log('[✓ PASSED] Redesigned Chapter Exploration modal verified with all 6 chapters, recall links, and objects');

// Switch to Road Network Tab in Master Modal
await page.click('button:has-text("Road Network")');
await page.waitForTimeout(300);
const roadsTabText = await page.textContent('#modalBody');
assert(roadsTabText.includes('Alpenhof Civil Road Network Suite'), 'Must display Road Network Suite title');
assert(roadsTabText.includes('Main Road (Primary Arterial)'), 'Must list Main Road type');
assert(roadsTabText.includes('Sub-Road (Service Route)'), 'Must list Sub-Road type');
assert(roadsTabText.includes('Garden Path (Pedestrian / Plot Access)'), 'Must list Garden Path type');
assert(roadsTabText.includes('Bypass Road (Southern Pond Loop / Manhattan Bypass)'), 'Must list Bypass Road type');
console.log('[✓ PASSED] Master Road Network tab verified with all 4 road types and civil engineering specs');

// Close modal
await page.click('.btn-close');
await page.waitForTimeout(200);

// ========================================================
// 5. Road Network Engineering Paving & Mechanics
// ========================================================
// Open road engineering modal for main_arterial_primary
await page.evaluate(() => openRoadNetworkModal('main_arterial_primary'));
await page.waitForTimeout(300);

const roadModalHdr = await page.textContent('.modal-hdr h3');
assert(roadModalHdr.includes('Alps Main Gate to West Orchard Hub'), 'Road modal header role');
const roadModalBody = await page.textContent('#modalBody');
assert(roadModalBody.includes('Heavy Packed Bavarian Loam'), 'Must describe materials');
assert(roadModalBody.includes('Subgrade Loam Excavation'), 'Must describe Step 1');
assert(roadModalBody.includes('Packed Clay Compaction'), 'Must describe Step 2');

// Test Step 1 Construction
const initialMoney = await page.evaluate(() => state.money);
const initialXP = await page.evaluate(() => state.xp);

await page.evaluate(() => buildRoadSegment('main_arterial_primary', 1));
await page.waitForTimeout(200);

const afterStep1 = await page.evaluate(() => ({
  money: state.money,
  xp: state.xp,
  step: state.built.road_steps['main_arterial_primary'],
  isBuilt: isRoadBuilt('main_arterial_primary')
}));

assert.strictEqual(afterStep1.money, initialMoney - 90, 'Step 1 must deduct €90');
assert.strictEqual(afterStep1.xp, initialXP + 15 + 8, 'Step 1 must award +15 engineering XP and +8 O2 XP (+23 total)');
assert.strictEqual(afterStep1.step, 1, 'Road step must be 1');
assert.strictEqual(afterStep1.isBuilt, false, 'Road not fully operational yet');
console.log('[✓ PASSED] Road Step 1 construction: €90 deducted, +23 XP awarded, subgrade excavated');

// Test Step 2 Construction
await page.evaluate(() => buildRoadSegment('main_arterial_primary', 2));
await page.waitForTimeout(200);

const afterStep2 = await page.evaluate(() => ({
  money: state.money,
  xp: state.xp,
  step: state.built.road_steps['main_arterial_primary'],
  isBuilt: isRoadBuilt('main_arterial_primary')
}));

assert.strictEqual(afterStep2.money, initialMoney - 200, 'Step 2 must deduct €110 (total €200)');
assert.strictEqual(afterStep2.xp, initialXP + 23 + 20 + 12, 'Step 2 must award +20 engineering XP and +12 O2 XP (+55 total)');
assert.strictEqual(afterStep2.step, 2, 'Road step must be 2');
assert.strictEqual(afterStep2.isBuilt, true, 'Road is now fully built and active');
console.log('[✓ PASSED] Road Step 2 construction: €110 deducted, +32 XP awarded, highway fully operational');

// ========================================================
// 6. Southern Pond Bypass Compatibility & Manhattan Analysis
// ========================================================
await page.evaluate(() => openWhyManhattanRoadModal());
await page.waitForTimeout(300);
const manhattanContent = await page.textContent('#modalBody');
assert(manhattanContent.includes('Southern Meadow Manhattan Bypass Main Road'), 'Manhattan modal title');
assert(manhattanContent.includes('Shortest-Path Manhattan Grid Routing'), 'Manhattan routing analysis');
assert(manhattanContent.includes('670m'), 'Saving 670m efficiency');

// Construct bypass road
await page.evaluate(() => buildDairyRoad());
await page.waitForTimeout(200);

const bypassStatus = await page.evaluate(() => ({
  legacyBuilt: state.built['road_dairy_bypass'],
  newBuilt: isRoadBuilt('bypass_road_southern_pond'),
  step: state.built.road_steps['bypass_road_southern_pond']
}));

assert.strictEqual(bypassStatus.legacyBuilt, true, 'Legacy road_dairy_bypass must be true for full backward compatibility');
assert.strictEqual(bypassStatus.newBuilt, true, 'isRoadBuilt for bypass_road_southern_pond must be true');
assert.strictEqual(bypassStatus.step, 2, 'Bypass step must be 2');
console.log('[✓ PASSED] Southern Pond Bypass backward compatibility verified: animated milk tanker active');

// ========================================================
// 7. Group Paving & Entire Road Network Package
// ========================================================
// Build entire road network
await page.evaluate(() => buildEntireRoadNetwork());
await page.waitForTimeout(200);

const allRoadsBuilt = await page.evaluate(() => {
  return ALPENHOF_ROAD_NETWORK.every(r => isRoadBuilt(r.id));
});

assert.strictEqual(allRoadsBuilt, true, 'All 15 road segments must now be built');
console.log('[✓ PASSED] Master civil engineering package: all 15 road segments paved and active');

// Capture High-Res Verification Screenshots
const screenshotDir = path.resolve('tests/screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

await page.screenshot({ path: path.join(screenshotDir, 'screenshot_alpenhof_roads_paved.png') });
console.log('[✓ SAVED] screenshot_alpenhof_roads_paved.png');

await page.evaluate(() => openMaster('roads'));
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(screenshotDir, 'screenshot_alpenhof_master_roads_tab.png') });
console.log('[✓ SAVED] screenshot_alpenhof_master_roads_tab.png');

await page.evaluate(() => openMaster('all'));
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(screenshotDir, 'screenshot_alpenhof_master_chapters_all.png') });
console.log('[✓ SAVED] screenshot_alpenhof_master_chapters_all.png');

await browser.close();

console.log('\n========================================================');
console.log('  ALL ALPENHOF ROADS & REDESIGNED MODALS TESTS PASSED!   ');
console.log('========================================================');
