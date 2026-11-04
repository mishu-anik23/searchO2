import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

function getFileHash(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

test('Alpenhof 3D Knowledge Lab & Puff-Pip Office Comprehensive Verification', async (t) => {
  // 1. Verify 100% Byte Parity
  const labBavaria = path.resolve('bavaria/knowledge_lab.html');
  const labPublic = path.resolve('public/bavaria/knowledge_lab.html');
  assert(fs.existsSync(labBavaria), 'bavaria/knowledge_lab.html must exist');
  assert(fs.existsSync(labPublic), 'public/bavaria/knowledge_lab.html must exist');

  const hash1 = getFileHash(labBavaria);
  const hash2 = getFileHash(labPublic);
  assert.strictEqual(hash1, hash2, 'bavaria/knowledge_lab.html and public/bavaria/knowledge_lab.html must have 100% byte parity');
  console.log('[✓ PASSED] 100% Byte Parity for knowledge_lab.html verified (' + hash1.substring(0, 16) + '...)');

  // Verify all 13 animation files exist
  const animDir = path.resolve('bavaria/animation');
  assert(fs.existsSync(animDir), 'bavaria/animation must exist');
  const animFiles = [
    'dairy/pnp_alpenhof_cheese_curd_fermentation.html',
    'dairy/pnp_alpenhof_dairy_htst_pasteurization_packaging.html',
    'dairy/Alpenhof_Smart_Pasture_Enhanced.html',
    'energy/pnp_alpenhof_bess_energy_trade.html',
    'energy/alpenhof_bess_microgrid_turbine_solar_enhanced.html',
    'energy/pnp_alpenhof_solar_installation.html',
    'energy/pnp_alpenhof_wind_turbine_microgrid_simulation.html',
    'infra/alpenhof_dairy_cold_storage.html',
    'infra/alpenhof_grain_silo_cold_storage.html',
    'infra/pnp_alpenhof_crewShed.html',
    'infra/pnp_alpenhof_farm_garage_geothermal_agtech.html',
    'infra/pnp_alpenhof_gorge_bridge_construction.html',
    'infra/pnp_alpenhof_pond_excavation.html'
  ];
  for (const f of animFiles) {
    const full = path.join(animDir, f);
    assert(fs.existsSync(full), 'Animation file must exist: ' + f);
  }
  console.log('[✓ PASSED] All 13 3D animation simulation files confirmed present in bavaria/animation/');

  // Launch browser
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 2. Load standalone knowledge_lab.html
  await page.goto('file:///' + labBavaria.replace(/\\/g, '/'));
  await page.waitForTimeout(500);

  // Check card count
  const cardCount = await page.locator('.module-card').count();
  assert.strictEqual(cardCount, 13, 'Must render exactly 13 module cards');
  console.log('[✓ PASSED] Exactly 13 volumetric 3D module cards rendered in knowledge_lab.html');

  // 3. Category Filter Navigation
  await page.click('.cat-btn[data-cat="Dairy"]');
  await page.waitForTimeout(200);
  let visibleCards = await page.locator('.module-card').count();
  assert.strictEqual(visibleCards, 3, 'Dairy filter must display 3 modules');

  await page.click('.cat-btn[data-cat="Energy"]');
  await page.waitForTimeout(200);
  visibleCards = await page.locator('.module-card').count();
  assert.strictEqual(visibleCards, 4, 'Energy filter must display 4 modules');

  await page.click('.cat-btn[data-cat="Infrastructure"]');
  await page.waitForTimeout(200);
  visibleCards = await page.locator('.module-card').count();
  assert.strictEqual(visibleCards, 6, 'Infrastructure filter must display 6 modules');

  await page.click('.cat-btn[data-cat="All"]');
  await page.waitForTimeout(200);
  visibleCards = await page.locator('.module-card').count();
  assert.strictEqual(visibleCards, 13, 'All filter must display all 13 modules');
  console.log('[✓ PASSED] Category filtering verified (Dairy: 3, Energy: 4, Infrastructure: 6, All: 13)');

  // 4. Search Filter
  await page.fill('#search-input', 'cheese');
  await page.waitForTimeout(200);
  visibleCards = await page.locator('.module-card').count();
  assert.strictEqual(visibleCards, 1, 'Search for "cheese" must match 1 card');
  const cardTitle = await page.locator('.module-card .card-title').textContent();
  assert(cardTitle.includes('Cheese'), 'Must match Cheese module');

  await page.fill('#search-input', '');
  await page.waitForTimeout(200);
  assert.strictEqual(await page.locator('.module-card').count(), 13, 'Clearing search restores 13 cards');
  console.log('[✓ PASSED] Real-time search filter verified');

  // 5. Admin Mode Toggle
  let adminBtn = page.locator('#btn-admin-toggle');
  let adminText = await adminBtn.textContent();
  assert(adminText.includes('Player Mode'), 'Default mode should be Player Mode with progression locks');

  // In Player Mode Ch. 1, Ch. 4/5 cards should be locked
  let lockedCards = await page.locator('.module-card.locked').count();
  assert(lockedCards > 0, 'In Player Mode Chapter 1, higher chapter cards should be locked');

  // Click Admin Toggle
  await adminBtn.click();
  await page.waitForTimeout(200);
  adminText = await adminBtn.textContent();
  assert(adminText.includes('Admin Mode: ALL UNLOCKED'), 'Admin mode should now be active');
  lockedCards = await page.locator('.module-card.locked').count();
  assert.strictEqual(lockedCards, 0, 'In Admin Mode, 0 cards should be locked');
  console.log('[✓ PASSED] Admin Mode master toggle unlocks all 13 modules immediately');

  // 6. One-Time Big Reward vs. Repeat +2 Rememorize XP
  const initMoney = await page.evaluate(() => state.money);
  const initXP = await page.evaluate(() => state.xp);

  // Launch Cheese Curd module
  await page.click('.module-card:has-text("Artisan Cheese") .btn-launch');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#sim-modal.open'), 'Simulation modal should open');

  // Click claim reward (first time)
  await page.click('#btn-claim');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#dialogue-modal.open'), 'Grand Achievement dialogue should open on first completion');

  const afterFirstMoney = await page.evaluate(() => state.money);
  const afterFirstXP = await page.evaluate(() => state.xp);
  assert.strictEqual(afterFirstMoney, initMoney + 120, 'First completion must award +€120 capital');
  assert.strictEqual(afterFirstXP, initXP + 45, 'First completion must award +45 XP');
  console.log('[✓ PASSED] First-time completion awards one-time major grant (+€120, +45 XP)');

  await page.click('#dialogue-modal .btn-claim-reward');
  await page.waitForTimeout(300);

  // Now launch again for Replay
  await page.click('.module-card:has-text("Artisan Cheese") .btn-launch');
  await page.waitForTimeout(400);
  const claimBtnText = await page.locator('#btn-claim').textContent();
  assert(claimBtnText.includes('+2 Rememorize XP'), 'Subsequent play must offer +2 Rememorize XP');

  // Claim repeat reward
  await page.click('#btn-claim');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#dialogue-modal.open'), 'Rememorize dialogue must open');
  const dlgTitle = await page.locator('#dlg-title').textContent();
  assert(dlgTitle.includes('Rememorized') && dlgTitle.includes('+2 XP'), 'Must show Rememorized +2 XP dialogue');

  const afterRepeatMoney = await page.evaluate(() => state.money);
  const afterRepeatXP = await page.evaluate(() => state.xp);
  assert.strictEqual(afterRepeatMoney, afterFirstMoney, 'Repeat play must NOT grant money (money is one-time only)');
  assert.strictEqual(afterRepeatXP, afterFirstXP + 2, 'Repeat play must add EXACTLY +2 Rememorize XP');
  console.log('[✓ PASSED] Subsequent replay awards exactly +2 Rememorize XP and zero additional money as required');

  await page.click('#dialogue-modal .btn-claim-reward');
  await page.waitForTimeout(300);

  // 7. Character Office Modal
  await page.click('#btn-open-office');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#office-modal.open'), 'Office modal should open');

  const presenterTabs = await page.locator('.char-tab-btn').count();
  assert.strictEqual(presenterTabs, 5, 'Must have tabs for all 5 presenters');

  // Click Ignaz Curd tab
  await page.click('.char-tab-btn:has-text("Ignaz")');
  await page.waitForTimeout(200);
  const charContent = await page.locator('#char-content').textContent();
  assert(charContent.includes('Ignaz Curd') && charContent.includes('Bernese Mountain Dog'), 'Must display Ignaz Curd bio');
  assert(charContent.includes('copper kettles'), 'Must contain QA on copper kettles');
  console.log('[✓ PASSED] Puff & Pip Character Office verified with all 5 presenters and interactive QA');

  await page.click('#office-modal .btn-close');
  await page.waitForTimeout(300);

  // 8. Test Alpenhof In-Game HUD & Modals
  const alpenhofPath = path.resolve('bavaria/alpenhof.html');
  await page.goto('file:///' + alpenhofPath.replace(/\\/g, '/'));
  await page.waitForTimeout(600);

  // Dismiss intro banner if visible
  if (await page.isVisible('#cinBanner')) {
    await page.click('#btn-start');
    await page.waitForTimeout(300);
  }
  if (await page.isVisible('#modal.open')) {
    await page.click('.btn-close');
    await page.waitForTimeout(200);
  }

  // Open HUD menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);

  // Check btn-lab and btn-office exist in HUD
  assert(await page.isVisible('#btn-lab'), 'HUD must contain #btn-lab');
  assert(await page.isVisible('#btn-office'), 'HUD must contain #btn-office');

  // Open 3D Knowledge Lab from HUD
  await page.click('#btn-lab');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#modal.open'), 'Lab Archive modal should open from HUD');
  const modalText = await page.locator('#modalBody').textContent();
  assert(modalText.includes('Alpenhof 3D Knowledge Enhancement Lab'), 'Must display Lab Archive title');
  assert(modalText.includes('All 13 Chapters'), 'Must display chapter tab');
  console.log('[✓ PASSED] Alpenhof in-game HUD 3D Knowledge Lab integration verified');

  await page.click('#modal .btn-close');
  await page.waitForTimeout(200);

  // Open Puff & Pip Office from HUD
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#btn-office');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#modal.open'), 'Puff & Pip Office modal should open from HUD');
  const officeText = await page.locator('#modalBody').textContent();
  assert(officeText.includes('Interactive Knowledge Office'), 'Must display Office title');
  console.log('[✓ PASSED] Alpenhof in-game HUD Puff & Pip Office integration verified');

  await page.click('#modal .btn-close');
  await page.waitForTimeout(200);

  await browser.close();
  console.log('========================================================');
  console.log('  ALL KNOWLEDGE LAB & OFFICE TESTS PASSED (8/8)!       ');
  console.log('========================================================');
});
