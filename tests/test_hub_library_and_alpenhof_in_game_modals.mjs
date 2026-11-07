import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();

test('Verify Hub Library Tags, Title Ampersand, Regional Bar OxyForge Visibility, and In-Game Botanical & Concept Libraries', async (t) => {
  try {
    // Step 1: Byte Parity Check
  console.log('\n[Step 1] Verifying 100% Byte Parity across mirrored files...');
  const hubFiles = ['index.html', 'hub.js', 'hub.css', 'data/content.json', 'data/content.js'];
  for (const f of hubFiles) {
    const b1 = fs.readFileSync(path.join(root, 'hub', f));
    const b2 = fs.readFileSync(path.join(root, 'public', 'hub', f));
    assert.strictEqual(b1.equals(b2), true, `Byte parity mismatch in hub/${f}`);
  }
  const alpBav = fs.readFileSync(path.join(root, 'bavaria', 'alpenhof.html'));
  const alpPub = fs.readFileSync(path.join(root, 'public', 'bavaria', 'alpenhof.html'));
  assert.strictEqual(alpBav.equals(alpPub), true, 'Byte parity mismatch in bavaria/alpenhof.html vs public/bavaria/alpenhof.html');
  console.log('[✓ PASSED] 100% Byte Parity verified across all 6 mirrored files!');

  // Launch browser
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('ERR_NAME_NOT_RESOLVED') && !msg.text().includes('net::ERR_')) pageErrors.push(msg.text());
  });

  const hubUrl = 'file:///' + path.join(root, 'hub', 'index.html').replace(/\\/g, '/');

  // Step 2: Hub Page Regional Bar & OxyForge Coming Soon tab visibility
  console.log('\n[Step 2] Testing Hub Regional Bar & OxyForge Coming Soon tab visibility...');
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto(hubUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#regionalBar');

  const oxyDome = await page.$('#regLinkOxyDome');
  assert.ok(oxyDome, 'OxyDome link should exist in #regionalBar');

  const oxyText = await oxyDome.innerText();
  assert.ok(oxyText.includes('Orbital · OxyForge Dome'), 'OxyDome link should contain "Orbital · OxyForge Dome"');
  assert.ok(oxyText.includes('Coming Soon'), 'OxyDome badge should contain "Coming Soon"');

  const playBtn = await page.$('.reg-action-btn');
  assert.ok(playBtn, 'Play Alpenhof 3D button should exist');

  // Check bounding box to ensure OxyDome is not cut off or covered
  const boxOxy = await oxyDome.boundingBox();
  const boxPlay = await playBtn.boundingBox();
  assert.ok(boxOxy && boxOxy.width > 50 && boxOxy.height > 20, 'OxyDome tab must have visible layout dimensions');
  assert.ok(boxPlay && boxPlay.width > 50 && boxPlay.height > 20, 'Play button must have visible layout dimensions');

  console.log(`[✓ PASSED] Regional tabs verified! OxyDome box: ${Math.round(boxOxy.x)},${Math.round(boxOxy.y)} ${Math.round(boxOxy.width)}x${Math.round(boxOxy.height)}; PlayBtn box: ${Math.round(boxPlay.x)},${Math.round(boxPlay.y)} ${Math.round(boxPlay.width)}x${Math.round(boxPlay.height)}`);

  // Step 3: Test Title Ampersand double-escaping fix
  console.log('\n[Step 3] Testing Ampersand double-escaping fix in #/alpenhof...');
  await page.evaluate(() => { location.hash = '#/alpenhof'; });
  await page.waitForSelector('.puff-pip-mentor-card h1');

  const dialogueHeading = await page.$eval('.puff-pip-mentor-card h1', el => el.innerText);
  console.log('Rendered dialogue heading:', dialogueHeading);
  assert.strictEqual(dialogueHeading, 'A Dialogue on Alpine Agroforestry & Circular Bio-Economy');
  assert.ok(!dialogueHeading.includes('&amp;'), 'Rendered text must not contain &amp;');
  console.log('[✓ PASSED] Title rendered cleanly with single ampersand: "A Dialogue on Alpine Agroforestry & Circular Bio-Economy"');

  // Step 4: Test Hub Library Page Tags & Species
  console.log('\n[Step 4] Testing Hub Library Page Base Farm and Alpenhof tags...');
  await page.evaluate(() => { location.hash = '#/library'; });
  await page.waitForSelector('#packets');

  const countText = await page.$eval('#libCount', el => el.innerText);
  console.log('Hub Library count:', countText);
  assert.ok(countText.includes('106 of 106 plants'), 'Hub library should display 106 species');

  // Check tags on packet cards
  const alpenhofCardTags = await page.$$('.packet-source-tag.alpenhof-tag');
  const baseFarmCardTags = await page.$$('.packet-source-tag.base-farm-tag');
  assert.ok(alpenhofCardTags.length >= 27, `Expected at least 27 Alpenhof tags, found ${alpenhofCardTags.length}`);
  assert.ok(baseFarmCardTags.length >= 18, `Expected at least 18 Base Farm tags, found ${baseFarmCardTags.length}`);

  // Check Latin scientific name on card
  const latinCard = await page.$eval('[data-key="alp_apple"] i', el => el.innerText);
  assert.strictEqual(latinCard, 'Malus domestica', 'alp_apple should have Latin name Malus domestica');

  // Click on alp_apple to open drawer
  await page.click('[data-key="alp_apple"]');
  await page.waitForSelector('#drawer:not([hidden])');

  const drawerSourceTag = await page.$eval('.packet-source-pill.alpenhof-pill', el => el.innerText);
  assert.ok(drawerSourceTag.includes('Alpenhof Alpine Biome'), 'Drawer must have Alpenhof source tag pill');

  const drawerLatin = await page.$eval('#drawerBody p.muted', el => el.innerText);
  assert.ok(drawerLatin.includes('Malus domestica'), 'Drawer must show Malus domestica');

  await page.click('#drawer [data-close]');
  await page.waitForTimeout(300);

  // Click on base farm oak (oak)
  await page.click('[data-key="oak"]');
  await page.waitForSelector('#drawer:not([hidden])');

  const drawerBaseTag = await page.$eval('.packet-source-pill.base-farm-pill', el => el.innerText);
  assert.ok(drawerBaseTag.includes('Base Farm'), 'Drawer must have Base Farm source tag pill for oak');

  await page.click('#drawer [data-close]');
  console.log('[✓ PASSED] Hub Library successfully tagged with Base Farm and Alpenhof badges, Latin scientific names, and drawer telemetry!');

  // Step 5: Test In-Game Alpenhof Botanical Library & Concept Library
  console.log('\n[Step 5] Testing In-Game Alpenhof Botanical Library (openSpecies)...');
  const alpenhofUrl = 'file:///' + path.join(root, 'bavaria', 'alpenhof.html').replace(/\\/g, '/');
  await page.goto(alpenhofUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  // Invoke openSpecies()
  await page.evaluate(() => { window.openSpecies(); });
  await page.waitForSelector('#alpSpeciesGrid .species-card-adv');

  const totalInGameCards = await page.$$eval('#alpSpeciesGrid .species-card-adv', cards => cards.length);
  console.log('In-Game Botanical species count:', totalInGameCards);
  assert.ok(totalInGameCards >= 35, `Expected 35+ botanical species cards, found ${totalInGameCards}`);

  // Test filter chips
  await page.click('.botanical-chip[data-cat="alpenhof"]');
  await page.waitForTimeout(100);
  const alpenhofFilteredCards = await page.$$eval('#alpSpeciesGrid .species-card-adv', cards => cards.length);
  assert.ok(alpenhofFilteredCards >= 27, `Expected at least 27 Alpenhof species, found ${alpenhofFilteredCards}`);

  await page.click('.botanical-chip[data-cat="base"]');
  await page.waitForTimeout(100);
  const baseFilteredCards = await page.$$eval('#alpSpeciesGrid .species-card-adv', cards => cards.length);
  assert.ok(baseFilteredCards >= 5, 'Base Farm filter should show base farm species');

  // Reset to All and test search input
  await page.click('.botanical-chip[data-cat="all"]');
  await page.waitForTimeout(100);
  await page.fill('#alpSpeciesSearch', 'Malus domestica');
  await page.waitForTimeout(100);
  const searchedCards = await page.$$eval('#alpSpeciesGrid .species-card-adv', cards => cards.length);
  assert.strictEqual(searchedCards, 1, 'Searching Malus domestica should find exactly 1 card (Boskoop Apple)');

  // Close modal
  await page.evaluate(() => { window.closeModal(); });
  await page.waitForTimeout(200);

  // Step 6: Test In-Game Alpenhof Concept Library (openWhy)
  console.log('\n[Step 6] Testing In-Game Alpenhof Concept Library (openWhy)...');
  await page.evaluate(() => { window.openWhy(); });
  await page.waitForSelector('#globalWhyBody h4');

  const whyTitle1 = await page.$eval('#globalWhyBody h4', el => el.innerText);
  assert.ok(whyTitle1.includes('Photosynthesis Superpower Equation'), 'Initial tab should be Photosynthesis');

  // Test Circular Economy tab
  await page.click('.concept-tab-btn[data-key="circular"]');
  await page.waitForTimeout(100);
  const whyTitle2 = await page.$eval('#globalWhyBody h4', el => el.innerText);
  assert.ok(whyTitle2.includes('Circular Bio-Economy'), 'Switched tab should be Circular Bio-Economy');

  // Test Base Farm Recall tab
  await page.click('.concept-tab-btn[data-key="recall"]');
  await page.waitForTimeout(100);
  const whyTitle3 = await page.$eval('#globalWhyBody h4', el => el.innerText);
  assert.ok(whyTitle3.includes('Solo Founder Base Farm Recall Link'), 'Switched tab should be Solo Founder Recall Link');

  // Action button click
  await page.click('.concept-lib-card button.btn-g');
  await page.waitForTimeout(300);

  // Verify toast appeared
  const toastText = await page.$eval('.toast', el => el.innerText);
  assert.ok(toastText.includes('Science Academy Discovery Commenced'), 'Discovery toast should appear');

  console.log('[✓ PASSED] In-Game Botanical Library and Concept Academy fully verified with 0 errors!');

  // Step 7: Check Mobile Responsiveness for Hub and Regional Bar
  console.log('\n[Step 7] Checking Mobile Responsiveness (320px, 360px, 390px)...');
  await page.goto(hubUrl, { waitUntil: 'domcontentloaded' });
  for (const w of [390, 360, 320]) {
    await page.setViewportSize({ width: w, height: 740 });
    await page.waitForTimeout(200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    assert.strictEqual(overflow, false, `Horizontal overflow detected at ${w}px width`);
    console.log(`   [✓ PASSED] ${w}px viewport: Zero horizontal overflow!`);
  }

  await browser.close();
  assert.strictEqual(pageErrors.length, 0, `Uncaught page errors: ${pageErrors.join(', ')}`);
  console.log('\n================================================================');
  } catch (err) {
    console.error('INNER ERROR STACK:', err);
    throw err;
  }
});
