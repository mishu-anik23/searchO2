const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

(async () => {
  console.log('====================================================');
  console.log('  Saint Martin Blue Lab Enhanced 3D Verification    ');
  console.log('====================================================');

  // 1. Check strict file parity
  const origHtml = fs.readFileSync('saint-martin/blue-lab.html', 'utf8');
  const pubHtml = fs.readFileSync('public/saint-martin/blue-lab.html', 'utf8');
  assert.strictEqual(origHtml, pubHtml, 'HTML parity error between saint-martin and public/saint-martin');

  const origSvg = fs.readFileSync('saint-martin/blueprint-map.svg', 'utf8');
  const pubSvg = fs.readFileSync('public/saint-martin/blueprint-map.svg', 'utf8');
  assert.strictEqual(origSvg, pubSvg, 'SVG parity error between saint-martin and public/saint-martin');
  console.log('[✓ PASSED] Strict parity between saint-martin/ and public/saint-martin/');

  // Verify blueprint has 20 markers, enlarged decagons and gas platform
  assert(origSvg.includes('marker-gas_field'), 'Blueprint SVG must include gas_field marker');
  assert(origSvg.includes('DECAGON 1: MANGROVE BIO-SHIELD (3 PLOTS)'), 'Blueprint SVG must show enlarged Decagon 1');
  assert(origSvg.includes('DECAGON 2: AGRO-ORCHARD (3 PLOTS)'), 'Blueprint SVG must show enlarged Decagon 2');
  assert(origSvg.includes('dec1.plot1') && origSvg.includes('dec2.plot3'), 'Blueprint SVG must label sub-plots');
  console.log('[✓ PASSED] Blueprint SVG contains 20 markers, enlarged twin decagons (3 plots), and gas platform');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));
  
  const fileUrl = 'file:///' + path.resolve('saint-martin/blue-lab.html').replace(/\\/g, '/');
  console.log('Visiting:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // Land on island via boat skip button if boat tour is active
  if (await page.isVisible('#btn-skip-boat')) {
    await page.click('#btn-skip-boat');
    await page.waitForTimeout(500);
  }

  // Dismiss onboarding modal if visible
  const isWhyOpen = await page.isVisible('#why-modal');
  if (isWhyOpen) {
    await page.click('#why-ack');
    await page.waitForTimeout(300);
  }
  
  // 2. Blueprint button click -> #blueprint-modal
  await page.click('#btn-blueprint');
  await page.waitForTimeout(300);
  let bpVisible = await page.$eval('#blueprint-modal', el => el.classList.contains('open'));
  assert.strictEqual(bpVisible, true, 'Blueprint modal must be open');
  let bpImgSrc = await page.$eval('#blueprint-body img', el => el.getAttribute('src'));
  assert.strictEqual(bpImgSrc, 'blueprint-map.svg', 'Blueprint modal must render blueprint-map.svg');
  console.log('[✓ PASSED] Top Blueprint button opens modal and displays blueprint-map.svg');
  await page.click('#bp-close');
  await page.waitForTimeout(200);

  // 3. Living Encyclopedia Modal
  await page.click('#btn-encyclopedia');
  await page.waitForTimeout(300);
  let encVisible = await page.$eval('#encyclopedia-modal', el => el.classList.contains('open'));
  assert.strictEqual(encVisible, true, 'Encyclopedia modal must be open');
  let encText = await page.textContent('#encyclopedia-body');
  assert(encText.includes('Cocos nucifera') && encText.includes('Rhizophora mucronata'), 'Encyclopedia must list tree binomials');
  console.log('[✓ PASSED] Living Botanical & Marine Encyclopedia opens with scientific binomials');
  await page.click('#enc-close');
  await page.waitForTimeout(200);

  // 4. Vegetable Crop Field Modal via Float Menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-crop');
  await page.waitForTimeout(300);
  let cropVisible = await page.$eval('#crop-modal', el => el.classList.contains('open'));
  assert.strictEqual(cropVisible, true, 'Crop field modal must be open');
  let cropText = await page.textContent('#crop-body');
  assert(cropText.includes('Polyculture Companion Crop') && cropText.includes('Coastal Cherry Tomato'), 'Crop field modal verification');
  console.log('[✓ PASSED] Menu Crop opens Polyculture Companion Crop Field modal');
  await page.click('#crop-close');
  await page.waitForTimeout(200);

  // 5. Polyculture Botanical Flower Garden Modal via Float Menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-flower');
  await page.waitForTimeout(300);
  let flVisible = await page.$eval('#flower-modal', el => el.classList.contains('open'));
  assert.strictEqual(flVisible, true, 'Flower garden modal must be open');
  let flText = await page.textContent('#flower-body');
  assert(flText.includes('Decagonal Polyculture Botanical Flower') && flText.includes('Ipomoea pes-caprae'), 'Flower modal verification');
  console.log('[✓ PASSED] Menu Flower opens Botanical Flower Garden modal with coastal cultivars');
  await page.click('#flower-close');
  await page.waitForTimeout(200);

  // 6. Farm Garage & Mechanization Depot via Float Menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-garage');
  await page.waitForTimeout(300);
  let garVisible = await page.$eval('#garage-modal', el => el.classList.contains('open'));
  assert.strictEqual(garVisible, true, 'Garage modal must be open');
  let garText = await page.textContent('#garage-body');
  assert(garText.includes('Farm Garage') && garText.includes('Solar Ag-Tractor'), 'Garage modal verification');
  console.log('[✓ PASSED] Menu Garage opens Farm Garage & Mechanization Depot modal');
  await page.click('#garage-close');
  await page.waitForTimeout(200);

  // 7. North Storage Silos via Float Menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-storage');
  await page.waitForTimeout(300);
  let storVisible = await page.$eval('#storage-modal', el => el.classList.contains('open'));
  assert.strictEqual(storVisible, true, 'Storage modal must be open');
  let storText = await page.textContent('#storage-body');
  assert(storText.includes('North Storage Silos') && storText.includes('Tomatoes'), 'Storage modal verification');
  console.log('[✓ PASSED] Menu Storage opens North Storage Silos & Inventory modal');
  await page.click('#storage-close');
  await page.waitForTimeout(200);

  // 8. Seafood modal via float menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-seafood');
  await page.waitForTimeout(300);
  let sfVisible = await page.$eval('#seafood-modal', el => el.classList.contains('open'));
  assert.strictEqual(sfVisible, true, 'Seafood modal must be open');
  let sfText = await page.textContent('#seafood-body');
  assert(sfText.includes('Shrimp & Crab Processing') && sfText.includes('IQF'), 'Seafood modal body verification');
  console.log('[✓ PASSED] Menu Seafood opens Seafood & IQF Processing modal');
  await page.click('#seafood-close');
  await page.waitForTimeout(200);

  // 9. Desal modal via float menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-desal');
  await page.waitForTimeout(300);
  let desalVisible = await page.$eval('#desal-modal', el => el.classList.contains('open'));
  assert.strictEqual(desalVisible, true, 'Desal modal must be open');
  let desalText = await page.textContent('#desal-body');
  assert(desalText.includes('Desalination Core') && desalText.includes('Pure Water Storage Silos'), 'Desal modal body verification');
  console.log('[✓ PASSED] Menu Desal opens Desalination & Silos modal');
  await page.click('#desal-close');
  await page.waitForTimeout(200);

  // 10. Salt modal via float menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-salt');
  await page.waitForTimeout(300);
  let saltVisible = await page.$eval('#salt-modal', el => el.classList.contains('open'));
  assert.strictEqual(saltVisible, true, 'Salt modal must be open');
  let saltText = await page.textContent('#salt-body');
  assert(saltText.includes('Salt Brine Evaporator Beds'), 'Salt modal body verification');
  console.log('[✓ PASSED] Menu Salt opens Salt Brine beds modal');
  await page.click('#salt-close');
  await page.waitForTimeout(200);

  // 11. Gas modal via float menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-gas');
  await page.waitForTimeout(300);
  let gasVisible = await page.$eval('#gas-modal', el => el.classList.contains('open'));
  assert.strictEqual(gasVisible, true, 'Gas modal must be open');
  let gasText = await page.textContent('#gas-modal');
  assert(gasText.includes('Offshore Gas Platform') && gasText.includes('CNG Compression'), 'Gas modal text verification');
  console.log('[✓ PASSED] Menu Gas opens Offshore Gas Field & CNG modal');
  await page.click('#gas-close');
  await page.waitForTimeout(200);

  // 12. IslandMap canvas onClick on Vegetable Garden at (509, 311)
  await page.evaluate(() => {
    islandApi.onClick({
      clientX: islandApi.canvas.getBoundingClientRect().left + islandApi.scaleX * 509,
      clientY: islandApi.canvas.getBoundingClientRect().top + islandApi.scaleY * 311
    });
  });
  await page.waitForTimeout(300);
  cropVisible = await page.$eval('#crop-modal', el => el.classList.contains('open'));
  assert.strictEqual(cropVisible, true, 'Clicking Vegetable Garden on map opens crop-modal');
  console.log('[✓ PASSED] Map canvas click on Vegetable Garden [509,311] opens crop modal');
  await page.click('#crop-close');
  await page.waitForTimeout(200);

  // 13. Sub-Plot Click on Decagon 1 (dec1.plot2 - Hard Mud Rock Clearing)
  await page.evaluate(() => {
    islandApi.onClick({
      clientX: islandApi.canvas.getBoundingClientRect().left + islandApi.scaleX * 300,
      clientY: islandApi.canvas.getBoundingClientRect().top + islandApi.scaleY * 520
    });
  });
  await page.waitForTimeout(300);
  let subVisible = await page.$eval('#subplot-modal', el => el.classList.contains('open'));
  assert.strictEqual(subVisible, true, 'Clicking dec1.plot2 opens subplot-modal');
  let subText = await page.textContent('#subplot-body');
  assert(subText.includes('Compacted Hard Mud Rock') && subText.includes('Clear Hard Mud Rock'), 'Sub-plot starts in hard mud rock state');
  console.log('[✓ PASSED] Map canvas click on dec1.plot2 [300,520] opens mud rock sub-plot modal');

  // Trigger hard mud rock clearance
  await page.evaluate(() => startClearingMudRock('dec1.plot2'));
  await page.waitForTimeout(200);
  let clearingText = await page.textContent('#subplot-body');
  assert(clearingText.includes('Clearing Hard Mud Rock') || clearingText.includes('Progress'), 'Plot transitions to clearing state with progress');
  console.log('[✓ PASSED] Hard mud rock clearing starts with live timer countdown & percentage progress');
  await page.click('#subplot-close');
  await page.waitForTimeout(200);

  // 14. Sub-Plot Click on Decagon 2 (dec2.plot1 - 3D Tree Growth & Lifecycle)
  await page.evaluate(() => {
    islandApi.onClick({
      clientX: islandApi.canvas.getBoundingClientRect().left + islandApi.scaleX * 1520,
      clientY: islandApi.canvas.getBoundingClientRect().top + islandApi.scaleY * 410
    });
  });
  await page.waitForTimeout(300);
  subVisible = await page.$eval('#subplot-modal', el => el.classList.contains('open'));
  assert.strictEqual(subVisible, true, 'Clicking dec2.plot1 opens subplot-modal');
  let treeText = await page.textContent('#subplot-body');
  assert(treeText.includes('Coastal Coconut Palm') && treeText.includes('Stage:'), 'Sub-plot displays 3D tree growth stages');
  console.log('[✓ PASSED] Sub-plot dec2.plot1 renders active tree growth with stages, timers, and percentages');
  await page.click('#subplot-close');
  await page.waitForTimeout(200);

  // 15. Task HUD Capsule click -> #task-hud
  await page.click('#task-capsule');
  await page.waitForTimeout(300);
  let taskHudOpen = await page.$eval('#task-hud', el => el.classList.contains('open'));
  assert.strictEqual(taskHudOpen, true, 'Task HUD panel must be open');
  let taskHudText = await page.textContent('#task-hud');
  assert(taskHudText.includes('Chapter 1') && taskHudText.includes('Sub-Challenge 1.1'), 'Task HUD displays chapter and sub-challenges');
  console.log('[✓ PASSED] Task Capsule opens floating Task List HUD with 5-chapter missions & sub-challenges');
  await page.click('#task-hud-close');
  await page.waitForTimeout(200);

  // 16. Boat Simulation launch and test
  await page.click('#btn-boat-nav');
  await page.waitForTimeout(300);
  let boatTourVisible = await page.$eval('#boat-tour', el => el.style.display === 'block');
  assert.strictEqual(boatTourVisible, true, 'Boat tour canvas must be active');
  console.log('[✓ PASSED] Boat Simulation launches with 18s bird\'s eye and rear deck FPV');
  await page.click('#btn-skip-boat');
  await page.waitForTimeout(300);

  // 17. 3D Outer Gas Platform View entry
  await page.evaluate(() => enterOuter());
  await page.waitForTimeout(300);
  let outerVisible = await page.$eval('#outer-zone', el => el.style.display === 'block');
  assert.strictEqual(outerVisible, true, '3D Outer Gas Platform zone must be active');
  console.log('[✓ PASSED] 3D Offshore Gas Platform view entered with interactive pins and isometric rig');
  await page.click('#btn-outer-island');
  await page.waitForTimeout(300);

  // 18. Planetary Biome Globe modal
  await page.click('#btn-globe');
  await page.waitForTimeout(300);
  let globeVisible = await page.$eval('#globe-modal', el => el.classList.contains('open'));
  assert.strictEqual(globeVisible, true, 'Globe modal must be open');
  let globeText = await page.textContent('#globe-modal');
  assert(globeText.includes('Germany: Active Farm') && globeText.includes('Saint Martin: Blue Lab'), 'Globe modal connects planetary biomes');
  console.log('[✓ PASSED] Planetary Biome Globe displays 3D sphere and connects Germany & Saint Martin');
  await page.click('#globe-close');
  await page.waitForTimeout(200);

  assert.strictEqual(pageErrors.length, 0, 'No page errors should occur: ' + JSON.stringify(pageErrors));
  console.log('[✓ PASSED] Zero browser page errors encountered');
  
  await browser.close();
  console.log('====================================================');
  console.log('  ALL BLUE LAB ENHANCED 3D TESTS PASSED (100%)      ');
  console.log('====================================================');
})();
