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

test('Verify Hub Alpenhof Expansion: Byte Parity, Modular Regional Bar, Characters, Pip Rules, 13 Scenes, Challenges & Zero-Cut Mobile', { timeout: 120000 }, async () => {
  let browser;
  try {
  // 1. Verify 100% Byte Parity across hub files
  const filePairs = [
    ['hub/index.html', 'public/hub/index.html'],
    ['hub/hub.js', 'public/hub/hub.js'],
    ['hub/hub.css', 'public/hub/hub.css']
  ];

  for (const [f1, f2] of filePairs) {
    const p1 = path.resolve(f1);
    const p2 = path.resolve(f2);
    assert(fs.existsSync(p1), `File missing: ${p1}`);
    assert(fs.existsSync(p2), `File missing: ${p2}`);
    const h1 = getFileHash(p1);
    const h2 = getFileHash(p2);
    assert.strictEqual(h1, h2, `Byte parity mismatch between ${f1} and ${f2}`);
  }
  console.log('[✓ PASSED] 100% Byte Parity verified across all hub and public/hub files!');

  // Launch browser
  browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  const hubUrl = 'file:///' + path.resolve('hub/index.html').replace(/\\/g, '/');

  // 2. Load Homepage
  console.log('[Step 1] Loading Learning Hub Homepage...');
  await page.goto(hubUrl, { waitUntil: 'load' });
  await page.waitForTimeout(300);

  assert.strictEqual(pageErrors.length, 0, `Page errors on hub load: ${pageErrors.join(', ')}`);

  // Verify Regional Expansion Bar exists on top of hub
  const regBar = page.locator('#regionalBar');
  assert(await regBar.count() > 0, '#regionalBar must exist on top of hub');
  assert.strictEqual(await regBar.isVisible(), true, '#regionalBar must be visible');

  // Verify Regional Options: Alpenhof, Saint Martin, Base Farm, Orbital OxyDome
  const alpenhofRegPill = page.locator('#regLinkAlpenhof');
  const saintMartinRegPill = page.locator('#regLinkSaintMartin');
  const baseFarmRegPill = page.locator('#regLinkBaseFarm');
  const oxyDomeRegPill = page.locator('#regLinkOxyDome');
  const playAlpenhofBtn = page.locator('.reg-action-btn');

  assert(await alpenhofRegPill.count() > 0, 'Alpenhof regional pill missing');
  assert(await saintMartinRegPill.count() > 0, 'Saint Martin regional pill missing');
  assert(await baseFarmRegPill.count() > 0, 'Base Farm regional pill missing');
  assert(await oxyDomeRegPill.count() > 0, 'OxyDome regional pill missing');
  assert(await playAlpenhofBtn.count() > 0, 'Play Alpenhof 3D CTA button missing in regional bar');

  const alpenhofHref = await alpenhofRegPill.getAttribute('href');
  assert(alpenhofHref.includes('#/alpenhof'), 'Alpenhof pill must route to #/alpenhof');

  const smHref = await saintMartinRegPill.getAttribute('href');
  assert(smHref.includes('saint-martin/blue-lab.html'), 'Saint Martin pill must link to blue-lab.html');

  const playAlpenhofHref = await playAlpenhofBtn.getAttribute('href');
  assert(playAlpenhofHref.includes('bavaria/alpenhof.html'), 'Play Alpenhof CTA must link to alpenhof.html');

  console.log('[✓ PASSED] Modular Regional Expansion Bar verified on top of Hub!');

  // Verify Alpenhof banner on Homepage
  const homeBanner = page.locator('.alpenhof-home-banner');
  assert(await homeBanner.count() > 0, 'Alpenhof spotlight banner must exist on home page');
  console.log('[✓ PASSED] Featured Alpenhof Regional Expansion banner verified on Home!');

  // 3. Test Navigation into Alpenhof Hub (#/alpenhof)
  console.log('[Step 2] Navigating to Alpenhof Eco-Village Hub (#/alpenhof)...');
  await alpenhofRegPill.click();
  await page.waitForTimeout(300);

  assert.strictEqual(page.url().includes('#/alpenhof'), true, 'URL hash must update to #/alpenhof');

  // Verify Alpenhof Hero
  const alpTitle = await page.locator('.alp-hero h1').textContent();
  assert(alpTitle.includes('Alpenhof Alpine Eco-Village'), `Unexpected title: ${alpTitle}`);
  console.log(`[✓ PASSED] Alpenhof Hero loaded: "${alpTitle}"`);

  // Verify Telemetry capsules
  const capsules = await page.locator('.alp-capsule').allTextContents();
  assert(capsules.some(c => c.includes('54') && c.includes('Orchard Beds')), 'Missing 54 Orchard Beds capsule');
  assert(capsules.some(c => c.includes('2') && c.includes('Lake Basins')), 'Missing 2 Lake Basins capsule');
  assert(capsules.some(c => c.includes('13') && c.includes('3D Research Labs')), 'Missing 13 3D Research Labs capsule');
  console.log('[✓ PASSED] Telemetry capsules verified!');

  // 4. Verify Characters Specialization Grid
  console.log('[Step 3] Verifying Characters Specialization Showcase...');
  const charCards = page.locator('.alp-char-card');
  const charCount = await charCards.count();
  assert(charCount >= 10, `Expected at least 10 character specialization cards, found ${charCount}`);

  // Check key characters
  const charText = await page.locator('.alp-char-grid').textContent();
  assert(charText.includes('Professor Whisker Puff'), 'Missing Professor Whisker Puff card');
  assert(charText.includes('Apprentice Pip'), 'Missing Apprentice Pip card');
  assert(charText.includes('Shakir'), 'Missing Shakir card');
  assert(charText.includes('Gretel Huber'), 'Missing Gretel Huber card');
  assert(charText.includes('Lukas Baumgartner'), 'Missing Lukas Baumgartner card');
  assert(charText.includes('Vroni Maier'), 'Missing Vroni Maier card');
  assert(charText.includes('Hansel Vogl'), 'Missing Hansel Vogl card');
  assert(charText.includes('Georg Huber'), 'Missing Georg Huber card');
  assert(charText.includes('Franz Bichler'), 'Missing Franz Bichler card');
  assert(charText.includes('Sepp Obermeier'), 'Missing Sepp Obermeier card');

  // Verify perks and speech quotes
  const quotes = await page.locator('.alp-char-quote-bubble').allTextContents();
  assert(quotes.length >= 10, 'Each character card must have a quote bubble');
  const perks = await page.locator('.alp-char-perk').allTextContents();
  assert(perks.length >= 10, 'Each character card must have an in-game perk');
  console.log(`[✓ PASSED] Verified ${charCount} Character Specialization cards with perks & quotes!`);

  // 5. Verify Pip's 5 Cardinal Eco-Rules
  console.log('[Step 4] Verifying Pip\'s 5 Cardinal Eco-Rules...');
  const ruleCards = page.locator('.alp-rule-card');
  assert.strictEqual(await ruleCards.count(), 5, 'Must have exactly 5 Pip rule cards');
  const rulesText = await page.locator('.alp-rules-grid').textContent();
  assert(rulesText.includes('Cobblestone Roads'), 'Rule 1 missing Cobblestone Roads');
  assert(rulesText.includes('Water Hydration & Prune Canopy'), 'Rule 2 missing Water & Pruning');
  assert(rulesText.includes('Living Waters Equilibrium'), 'Rule 3 missing Living Waters');
  assert(rulesText.includes('Keep Service Swift'), 'Rule 4 missing Guest Service');
  assert(rulesText.includes('Circular Bio-Loop'), 'Rule 5 missing Circular Bio-Loop');
  console.log('[✓ PASSED] Verified all 5 of Pip\'s Cardinal Eco-Rules!');

  // 6. Verify Facilities & Living Mechanics
  console.log('[Step 5] Verifying Facilities & Living Game Mechanics...');
  const facilityCards = page.locator('.alp-facility-card');
  assert.strictEqual(await facilityCards.count(), 6, 'Must have 6 facility cards');
  const facText = await page.locator('.alp-facilities-grid').textContent();
  assert(facText.includes('54 Planted Beds'), 'Missing 54 beds agroforestry details');
  assert(facText.includes('Real-Time Progress Bar'), 'Missing real-time task timer details');
  assert(facText.includes('Municipal Clearance Truck'), 'Missing municipal dead tree clearance truck');
  assert(facText.includes('Heavy Logging Transporter'), 'Missing heavy logging transporter truck');
  assert(facText.includes('Living Waters Glacial Lake'), 'Missing living waters lake details');
  assert(facText.includes('Diving Mallard Ducks'), 'Missing diving mallard ducks');
  assert(facText.includes('Alpenblumen-Standl Retail'), 'Missing flower standl retail');
  assert(facText.includes('Volumetric 3D Visitor'), 'Missing volumetric 3D visitor dynamics');
  console.log('[✓ PASSED] All 6 Living Facilities & Game Mechanics verified!');

  // 7. Verify 13 3D Research HQ Labs Gallery & Filtering
  console.log('[Step 6] Verifying 13 3D Research HQ Labs Gallery & Interactive Filtering...');
  const sceneCards = page.locator('.alp-scene-card');
  assert.strictEqual(await sceneCards.count(), 13, 'Must render all 13 3D scenes');

  // Test filter: Dairy (3)
  await page.locator('#alpSceneFilters button[data-cat="dairy"]').click();
  await page.waitForTimeout(100);
  let visibleScenes = await page.locator('.alp-scene-card:visible').count();
  assert.strictEqual(visibleScenes, 3, `Expected 3 visible dairy scenes, got ${visibleScenes}`);

  // Test filter: Energy (4)
  await page.locator('#alpSceneFilters button[data-cat="energy"]').click();
  await page.waitForTimeout(100);
  visibleScenes = await page.locator('.alp-scene-card:visible').count();
  assert.strictEqual(visibleScenes, 4, `Expected 4 visible energy scenes, got ${visibleScenes}`);

  // Test filter: Infra (6)
  await page.locator('#alpSceneFilters button[data-cat="infra"]').click();
  await page.waitForTimeout(100);
  visibleScenes = await page.locator('.alp-scene-card:visible').count();
  assert.strictEqual(visibleScenes, 6, `Expected 6 visible infra scenes, got ${visibleScenes}`);

  // Test filter: All (13)
  await page.locator('#alpSceneFilters button[data-cat="all"]').click();
  await page.waitForTimeout(100);
  visibleScenes = await page.locator('.alp-scene-card:visible').count();
  assert.strictEqual(visibleScenes, 13, `Expected 13 visible scenes under All, got ${visibleScenes}`);

  // Verify feature badges (English Accent Audio & Inline CC Toggle)
  const featuresText = await page.locator('.alp-scene-features').first().textContent();
  assert(featuresText.includes('English Accent Audio'), 'Scene must highlight English Accent Audio');
  assert(featuresText.includes('Inline CC Toggle'), 'Scene must highlight Inline CC Toggle');
  console.log('[✓ PASSED] 13 3D Scenes gallery and interactive tab filtering verified!');

  // 8. Verify 6-Chapter Mastery Progression
  console.log('[Step 7] Verifying 6 Chapter Mastery Progression...');
  const chCards = page.locator('.alp-ch-card');
  assert.strictEqual(await chCards.count(), 6, 'Must render 6 chapter mastery cards');
  const chText = await page.locator('.alp-chapters-grid').textContent();
  assert(chText.includes('Recalling Solo Founder Ch. 1'), 'Missing Solo Founder recall connection');
  assert(chText.includes('Recalling Solo Founder Ch. 6'), 'Missing Chapter 6 recall connection');
  console.log('[✓ PASSED] 6 Chapter Mastery cards verified!');

  // 9. Verify Scientific Learning Outcomes
  console.log('[Step 8] Verifying Scientific Learning Outcomes for Children...');
  const outcomeItems = page.locator('.alp-outcome-item');
  assert.strictEqual(await outcomeItems.count(), 6, 'Must render 6 learning outcome items');
  const learnText = await page.locator('.alp-learning-box').textContent();
  assert(learnText.includes('Photosynthesis & Oxygen Math'), 'Missing Photosynthesis outcome');
  assert(learnText.includes('Circular Bio-Economy'), 'Missing Circular Bio-Economy outcome');
  assert(learnText.includes('Food Miles'), 'Missing Food Miles outcome');
  assert(learnText.includes('Soil Hydration & Neglect'), 'Missing Soil Hydration outcome');
  console.log('[✓ PASSED] Educational Learning Outcomes for children verified!');

  // 10. Verify Zero-Cut Mobile Responsiveness on #/alpenhof
  console.log('[Step 9] Verifying Mobile Responsiveness down to 320px (Zero Cut)...');
  const viewports = [
    { name: 'Ultra-compact mobile (320px)', width: 320, height: 568 },
    { name: 'Standard small mobile (360px)', width: 360, height: 640 },
    { name: 'Modern mobile (390px)', width: 390, height: 844 },
    { name: 'Tablet (768px)', width: 768, height: 1024 }
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(150);

    const check = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      return { docW, winW, isNoCut: docW <= winW + 1 };
    });

    assert(check.isNoCut, `Screen cut off on ${vp.name} on #/alpenhof: docW (${check.docW}) > winW (${check.winW})`);
    console.log(`   [✓ PASSED] ${vp.name}: docW ${check.docW}px === winW ${check.winW}px (No horizontal screen cut)`);
  }

  await browser.close();
  console.log('\n================================================================');
  console.log('  ALL HUB ALPENHOF EXPANSION VERIFICATION TESTS PASSED (10/10)! ');
  console.log('================================================================');
  } catch (err) {
    if (browser) await browser.close();
    console.error('FATAL TEST ERROR:', err);
    throw err;
  }
});
