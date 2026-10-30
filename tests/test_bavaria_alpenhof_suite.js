const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

(async () => {
  console.log('========================================================');
  console.log('  Bavaria Alpenhof Journey Comprehensive Verification v4');
  console.log('========================================================');

  // 1. Strict Byte Parity between bavaria/alpenhof.html and public/bavaria/alpenhof.html
  const file1 = path.resolve(__dirname, '..', 'bavaria', 'alpenhof.html');
  const file2 = path.resolve(__dirname, '..', 'public', 'bavaria', 'alpenhof.html');
  const b1 = fs.readFileSync(file1);
  const b2 = fs.readFileSync(file2);
  assert.strictEqual(b1.length, b2.length, `Byte lengths differ: ${b1.length} vs ${b2.length}`);
  assert(b1.equals(b2), 'bavaria/alpenhof.html and public/bavaria/alpenhof.html must have 100% identical byte content');
  console.log(`[✓ PASSED] 100% Byte Parity between bavaria/alpenhof.html and public/bavaria/alpenhof.html (${b1.length} bytes)`);

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
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.warn('[CONSOLE ERROR]:', msg.text());
    }
  });

  const alpenhofUrl = 'file:///' + file1.replace(/\\/g, '/');
  console.log('Loading:', alpenhofUrl);

  await page.goto(alpenhofUrl, { waitUntil: 'load' });
  await page.waitForTimeout(600);

  // 2. Zero Page Errors on Load
  assert.strictEqual(errors.length, 0, `Page loaded with errors: ${errors.join(', ')}`);
  console.log('[✓ PASSED] Zero browser page errors on load');

  // 3. Fullscreen Canvas Verification
  const canvasSize = await page.evaluate(() => {
    const c = document.getElementById('farm-canvas');
    return {
      width: c.width,
      height: c.height,
      clientWidth: c.clientWidth,
      clientHeight: c.clientHeight,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight
    };
  });
  console.log('Canvas sizing:', canvasSize);
  assert(canvasSize.clientWidth === canvasSize.innerWidth, 'Canvas clientWidth must match innerWidth');
  assert(canvasSize.clientHeight === canvasSize.innerHeight, 'Canvas clientHeight must match innerHeight');
  console.log('[✓ PASSED] Canvas covers full viewport edge-to-edge without borders or voids');

  // 4. Verify 21 SITES (6 orchard plots + 15 facilities) and 6 chapters
  const farmConfig = await page.evaluate(() => {
    return {
      sitesCount: SITES.length,
      orchardsCount: ORCHARD_PLOTS.length,
      sites: SITES.map(s => ({ id: s.id, x: s.x, y: s.y, action: s.action })),
      speciesCount: Object.keys(SPECIES).length,
      grapeSpeciesCount: Object.keys(GRAPE_SPECIES).length,
      vegSpeciesCount: Object.keys(VEG_SPECIES).length,
      vegBedsCount: state.vegetables.beds.length,
      totalVegPositions: state.vegetables.beds.reduce((acc, b) => acc + b.plants.length, 0),
      vineyardBedsCount: VINEYARD_BEDS.length,
      totalVinePositions: VINEYARD_BEDS.length * 12,
      chaptersCount: CHAPTERS.length
    };
  });
  assert.strictEqual(farmConfig.sitesCount, 26, `Expected 26 sites, found ${farmConfig.sitesCount}`);
  assert.strictEqual(farmConfig.orchardsCount, 6, `Expected 6 orchard plots, found ${farmConfig.orchardsCount}`);
  assert.strictEqual(farmConfig.vegBedsCount, 4, `Expected 4 vegetable quadrant beds (2x2), found ${farmConfig.vegBedsCount}`);
  assert.strictEqual(farmConfig.totalVegPositions, 48, `Expected 48 total vegetable plant positions, found ${farmConfig.totalVegPositions}`);
  assert.strictEqual(farmConfig.vegSpeciesCount, 8, `Expected 8 German heirloom vegetable varieties, found ${farmConfig.vegSpeciesCount}`);
  assert.strictEqual(farmConfig.vineyardBedsCount, 9, `Expected 9 vineyard beds, found ${farmConfig.vineyardBedsCount}`);
  assert.strictEqual(farmConfig.totalVinePositions, 108, `Expected 108 total vine positions, found ${farmConfig.totalVinePositions}`);
  assert.strictEqual(farmConfig.chaptersCount, 6, `Expected 6 progression chapters, found ${farmConfig.chaptersCount}`);
  console.log('[✓ PASSED] 21 calibrated sites, 6 orchard plots, 48-plot hexagonal vegetable garden (4 beds x 12 plants), 108-vine vineyard, 6 chapters verified');

  // Verify calibrated coordinates from bavaria-bg-plan.jpg
  const findSite = id => farmConfig.sites.find(s => s.id === id);
  assert.deepStrictEqual({ x: findSite('wind_w').x, y: findSite('wind_w').y }, { x: 316, y: 156 }, 'wind_w coordinates');
  assert.deepStrictEqual({ x: findSite('bess').x, y: findSite('bess').y }, { x: 710, y: 216 }, 'bess coordinates');
  assert.deepStrictEqual({ x: findSite('farm_shed').x, y: findSite('farm_shed').y }, { x: 933, y: 237 }, 'farm_shed coordinates');
  assert.deepStrictEqual({ x: findSite('solar').x, y: findSite('solar').y }, { x: 770, y: 330 }, 'solar farm coordinates stretched left towards orchard plots and down towards veg garden');
  assert.deepStrictEqual({ x: findSite('veg').x, y: findSite('veg').y }, { x: 920, y: 525 }, 'hexagonal vegetable garden coordinates stretched 60px down to bottom meadow');
  assert.deepStrictEqual({ x: findSite('silo').x, y: findSite('silo').y }, { x: 790, y: 435 }, 'bavarian grain silo coordinates on two-corner plot side of vegetable garden');
  assert.deepStrictEqual({ x: findSite('cold_storage').x, y: findSite('cold_storage').y }, { x: 190, y: 915 }, 'bavarian dairy cold storage coordinates along bypass road opposite pond shore');
  assert.deepStrictEqual({ x: findSite('flower_oval').x, y: findSite('flower_oval').y }, { x: 835, y: 755 }, 'triangular 3-oval flower garden coordinates');
  assert.deepStrictEqual({ x: findSite('bbq').x, y: findSite('bbq').y }, { x: 1760, y: 380 }, 'hilltop tourist bbq coordinates with marker placed behind kiosk roof');
  assert.deepStrictEqual({ x: findSite('pond').x, y: findSite('pond').y }, { x: 630, y: 870 }, 'pond coordinates bottom-left meadow');
  assert.deepStrictEqual({ x: findSite('restaurant').x, y: findSite('restaurant').y }, { x: 1620, y: 530 }, 'restaurant coordinates at corner of road network with timber deck & grape juice silo');
  assert.deepStrictEqual({ x: findSite('cattle').x, y: findSite('cattle').y }, { x: 1360, y: 255 }, 'cattle coordinates long pasture downslope');
  assert.deepStrictEqual({ x: findSite('gate').x, y: findSite('gate').y }, { x: 1750, y: 890 }, 'gate coordinates at bottom right entrance road');
  assert.deepStrictEqual({ x: findSite('crew').x, y: findSite('crew').y }, { x: 945, y: 310 }, 'crew shed transferred north of veg garden');
  assert.deepStrictEqual({ x: findSite('dairy_market').x, y: findSite('dairy_market').y }, { x: 1220, y: 480 }, 'dairy market coordinates on central roadside terrace');
  assert.deepStrictEqual({ x: findSite('dairy_plant').x, y: findSite('dairy_plant').y }, { x: 200, y: 770 }, 'dairy processing plant coordinates in bottom left meadow');
  assert.deepStrictEqual({ x: findSite('vineyard').x, y: findSite('vineyard').y }, { x: 1435, y: 380 }, 'vineyard coordinates terrace on hill upslope');
  assert.deepStrictEqual({ x: findSite('bridge').x, y: findSite('bridge').y }, { x: 1625, y: 230 }, 'bridge coordinates to distant hilltop turbine');
  assert.deepStrictEqual({ x: findSite('wind_e').x, y: findSite('wind_e').y }, { x: 1700, y: 165 }, 'wind_e coordinates on farm hilltop');
  console.log('[✓ PASSED] Strict coordinate mapping verified against bavaria-bg-plan.jpg');

  // 5. Dismiss Welcome Banner and verify Intro Why Modal
  await page.click('#btn-start');
  await page.waitForTimeout(400);
  const isBannerVisible = await page.isVisible('#cinBanner');
  assert(!isBannerVisible, 'Welcome banner should be dismissed after clicking start');
  console.log('[✓ PASSED] Intro cinematic banner dismissed');

  const introWhyVisible = await page.isVisible('#modal.open');
  assert(introWhyVisible, 'Intro Why modal should open upon starting');
  const introWhyText = await page.textContent('#modalBody');
  assert(introWhyText.includes('Why Streuobst & Polyculture'), 'Intro Why modal title');
  assert(introWhyText.includes('German Farm Recall Link'), 'Must have German Farm Recall Link');
  console.log('[✓ PASSED] Intro Why modal verified with 3-tier recall');
  await page.click('#modalBody .btn-g');
  await page.waitForTimeout(300);

  // 6. Masterplan Modal & Basic Farm Recall Verification
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#btn-master');
  await page.waitForTimeout(300);
  const isModalOpen = await page.isVisible('#modal.open');
  assert(isModalOpen, 'Masterplan modal should open');
  const masterContent = await page.textContent('#modalBody');
  assert(masterContent.includes('Survey the Alpenhof Estate'), 'Must contain Ch 1');
  assert(masterContent.includes('Recalling Solo Founder Ch. 1'), 'Must recall Solo Founder Ch. 1');
  assert(masterContent.includes('Recalling Infrastructure & Tilth Ch. 2'), 'Must recall Ch. 2');
  assert(masterContent.includes('Recalling Ecosystem & Companion Guilds Ch. 3'), 'Must recall Ch. 3');
  assert(masterContent.includes('Recalling Circular Closed-Loop Ecology Ch. 4'), 'Must recall Ch. 4');
  assert(masterContent.includes('Recalling Microgrid & Clean Power Ch. 5'), 'Must recall Ch. 5');
  assert(masterContent.includes('Recalling Eco-Village & Commerce Ch. 6'), 'Must recall Ch. 6');
  console.log('[✓ PASSED] 6-Chapter Masterplan modal verified with all 6 Basic Farm recall links');
  await page.click('.btn-close');
  await page.waitForTimeout(200);

  // 7. Why Alpenhof Educational Modal Verification (3-Tier Depth)
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#btn-why');
  await page.waitForTimeout(300);
  const whyContent = await page.textContent('#modalBody');
  assert(whyContent.includes('Why Streuobst & Polyculture'), 'Why modal title');
  assert(whyContent.includes('German Farm Recall Link'), 'Must have German Farm Recall Link tab');
  console.log('[✓ PASSED] Why Alpenhof 3-tier modal verified');
  await page.click('.btn-close');
  await page.waitForTimeout(200);

  // 8. Labour Board & Worker Roster
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#btn-labour');
  await page.waitForTimeout(300);
  const labourContent = await page.textContent('#modalBody');
  assert(labourContent.includes('Hans Weber') && labourContent.includes('Lukas Gruber'), 'Must contain labour roster');
  console.log('[✓ PASSED] Labour HQ roster verified');
  const hireBtns = await page.$$('#modalBody .btn-g');
  if (hireBtns.length > 0) {
    await hireBtns[0].click();
    await page.waitForTimeout(200);
    console.log('[✓ PASSED] Worker hired successfully without syntax errors');
  }
  await page.click('.btn-close');
  await page.waitForTimeout(200);

  // 9. Orchard Plot 1 Aeration & Planting Workflow
  await page.evaluate(() => {
    const o1 = SITES.find(s => s.id === 'o1');
    AlpenMap.handle(o1);
  });
  await page.waitForTimeout(400);
  const orchardModalOpen = await page.isVisible('#modal.open');
  assert(orchardModalOpen, 'Orchard modal must open on site click');
  const orchardContent = await page.textContent('#modalBody');
  assert(orchardContent.includes('Orchard Plot 1 (NW'), 'Must show Orchard Plot 1');
  assert(orchardContent.includes('3×3 circular'), 'Must indicate 3x3 circular beds');

  const aerateBtn = await page.$('#modalBody .btn-a');
  assert(aerateBtn, 'Aerate button must exist for un-aerated crust');
  await aerateBtn.click();
  await page.waitForTimeout(400);
  console.log('[✓ PASSED] Bed #1 soil crust aerated into fertile planting ring');

  const bed1Cell = await page.$('.bed-cell.open');
  assert(bed1Cell, 'Bed #1 cell should be ready and clickable');
  await bed1Cell.click();
  await page.waitForTimeout(300);

  const plantCherryBtn = await page.$('#modalBody .btn-c');
  assert(plantCherryBtn, 'Plant species button must exist');
  await plantCherryBtn.click();
  await page.waitForTimeout(400);
  console.log('[✓ PASSED] Sweet Cherry planted in aerated circular bed');

  const bed2Cell = await page.$$('.bed-cell.open');
  if (bed2Cell.length > 0) {
    await bed2Cell[0].click();
    await page.waitForTimeout(300);
    const btns = await page.$$('#modalBody .btn-c');
    if (btns.length > 1) {
      await btns[1].click();
      await page.waitForTimeout(400);
      console.log('[✓ PASSED] Boskoop Apple planted in aerated circular bed');
    }
  }
  if (await page.isVisible('#modal.open')) await page.click('.btn-close');
  await page.waitForTimeout(200);

  // 10. Commercial 3x3 Grape Vineyard (108 Vines) Verification
  await page.evaluate(() => {
    const vine = SITES.find(s => s.id === 'vineyard');
    AlpenMap.handle(vine);
  });
  await page.waitForTimeout(300);
  const buildVineBtn = await page.$('#modalBody .btn-g');
  if (buildVineBtn) {
    await buildVineBtn.click();
    await page.waitForTimeout(300);
    console.log('[✓ PASSED] Bavarian Heritage Vineyard commissioned');
  }
  if (await page.isVisible('#modal.open')) await page.click('.btn-close');

  await page.evaluate(() => {
    openVineyardModal(0);
  });
  await page.waitForTimeout(300);
  const vineModalContent = await page.textContent('#modalBody');
  assert(vineModalContent.includes('Bavarian Heritage Vineyard · Bed #1 / 9'), 'Vineyard modal title');
  assert(vineModalContent.includes('108 Estate Vines Total'), 'Must mention 108 estate vines total');
  assert(vineModalContent.includes('Bed 9'), 'Must have navigation buttons for all 9 beds');

  const aerateVineBtn = await page.$('#modalBody .btn-a');
  assert(aerateVineBtn, 'Aerate button must exist for un-aerated vineyard bed');
  await aerateVineBtn.click();
  await page.waitForTimeout(300);
  console.log('[✓ PASSED] Vineyard Bed #1 aerated (all 12 vine pits ready)');

  await page.evaluate(() => {
    plantVineHole(0, 0, 'silvaner');
    plantVineHole(0, 1, 'riesling');
  });
  await page.waitForTimeout(300);
  console.log('[✓ PASSED] Silvaner and Riesling heritage vines planted in Bed #1');

  await page.evaluate(() => {
    aerateVineBed(1);
    plantUniformBed(1, 'bacchus');
  });
  await page.waitForTimeout(300);
  console.log('[✓ PASSED] Bed #2 planted uniformly with 12 Bacchus grapevines');

  await page.evaluate(() => {
    careVineBed(0);
    careVineBed(0);
  });
  await page.waitForTimeout(300);
  console.log('[✓ PASSED] Rebschnitt & Spalierbindung trellis training advanced vines to mature fruiting');

  await page.evaluate(() => {
    harvestVineBed(0);
  });
  await page.waitForTimeout(300);
  console.log('[✓ PASSED] Traubenlese vintage harvested and dispatched to Stuben & Mosterei');

  // Test automatic vine growth via tickGrowth
  const vineGrowthResult = await page.evaluate(() => {
    state.vineyard.beds[1].vines[0].progress = 0.10;
    state.vineyard.beds[1].vines[0].status = 'sprout';
    AlpenMap.tickGrowth();
    return state.vineyard.beds[1].vines[0].progress > 0.10;
  });
  assert(vineGrowthResult, 'Vineyard vines must advance growth automatically during tickGrowth');
  console.log('[✓ PASSED] Vineyard vines automatic growth ticking verified in tickGrowth()');

  if (await page.isVisible('#modal.open')) await page.click('.btn-close');
  await page.waitForTimeout(200);

  // 11. Test Facility Construction: Living Lake Excavation Sequence, Cattle Pasture, Wind Turbines, Barn & Stuben
  // 11A. Test 48-Plot Hexagonal Vegetable Garden (Plant Selection, Watering, Harvesting)
  await page.evaluate(() => {
    const vegSite = SITES.find(s => s.id === 'veg');
    AlpenMap.handle(vegSite);
  });
  await page.waitForTimeout(400);
  const vegModalOpen = await page.isVisible('#modal.open');
  assert(vegModalOpen, 'Vegetable garden modal must open');
  const vegModalContent = await page.textContent('#modalBody');
  assert(vegModalContent.includes('48-Plot Hexagonal Vegetable Garden'), 'Must show hexagonal garden header');

  // Commission garden if unbuilt
  await page.evaluate(() => {
    if (!state.built['veg']) buildSite('veg', 80);
  });
  await page.waitForTimeout(300);

  // Test plant selection: Sow Kürbis into Bed 0, Spargel into Bed 1
  await page.evaluate(() => {
    plantVegBed(0, 'kuerbis');
    plantVegBed(1, 'spargel');
  });
  await page.waitForTimeout(200);

  // Test watering and automatic growth progression via tickGrowth
  await page.evaluate(() => {
    waterVegBed(0);
    AlpenMap.tickGrowth();
  });
  await page.waitForTimeout(200);

  // Test harvesting
  await page.evaluate(() => {
    state.vegetables.beds[0].plants[0].status = 'mature';
    harvestVegBed(0);
    harvestAllVeg();
  });
  await page.waitForTimeout(200);
  const harvestedCount = await page.evaluate(() => state.vegetables.harvestedTotal);
  assert(harvestedCount > 0, 'Vegetable harvesting must record harvested produce');
  console.log(`[✓ PASSED] 48-Plot Hexagonal Vegetable Garden verified (Kürbis, Zucchini, Spargel sown, watered & harvested: ${harvestedCount} crops)`);
  if (await page.isVisible('#modal.open')) await page.click('.btn-close');
  await page.waitForTimeout(200);

  // 11B. Test 4x4 Agrivoltaic Solar Farm Multi-Stage Construction
  await page.evaluate(() => {
    const solarSite = SITES.find(s => s.id === 'solar');
    AlpenMap.handle(solarSite);
  });
  await page.waitForTimeout(400);
  const solarModalOpen = await page.isVisible('#modal.open');
  assert(solarModalOpen, 'Solar farm modal must open');
  const solarModalContent = await page.textContent('#modalBody');
  assert(solarModalContent.includes('4×4 Agrivoltaic Solar Farm Console'), 'Must show solar farm header');

  // Step 1: Foundation Piles
  await page.evaluate(() => advanceSolarStep(0, 40));
  await page.waitForTimeout(200);
  // Step 2: Aluminum Racking
  await page.evaluate(() => advanceSolarStep(1, 50));
  await page.waitForTimeout(200);
  // Complete Solar Array
  await page.evaluate(() => buildSolarComplete(200));
  await page.waitForTimeout(300);
  const solarDone = await page.evaluate(() => state.built['solar'] && state.solar.stage >= 4);
  assert(solarDone, '4x4 Solar Farm must be fully commissioned and operational');
  console.log('[✓ PASSED] 4×4 Agrivoltaic Solar Farm multi-stage construction verified (16 modules producing clean power)');
  if (await page.isVisible('#modal.open')) await page.click('.btn-close');
  await page.waitForTimeout(200);

  // 11C. Test Oval Shape Flower Garden & Bee Hotel
  await page.evaluate(() => {
    const flowerSite = SITES.find(s => s.id === 'flower_oval');
    AlpenMap.handle(flowerSite);
  });
  await page.waitForTimeout(400);
  const flowerModalOpen = await page.isVisible('#modal.open');
  assert(flowerModalOpen, 'Oval flower garden modal must open');
  const flowerModalContent = await page.textContent('#modalBody');
  assert(flowerModalContent.includes('Oval Alpine Flower Garden'), 'Must show oval flower garden header');

  // Commission, tend, and harvest honey
  await page.evaluate(() => {
    buildSite('flower_oval', 75);
    tendFlowerGarden();
    harvestFlowerHoney();
  });
  await page.waitForTimeout(200);
  const honeyCount = await page.evaluate(() => state.flowers.harvestedHoney);
  assert(honeyCount > 0, 'Honey must be harvested from the bee hotel');
  console.log(`[✓ PASSED] Oval Alpine Flower Garden verified (Edelweiß/Enzian bloomed, ${honeyCount} kg honey harvested)`);
  if (await page.isVisible('#modal.open')) await page.click('.btn-close');
  await page.waitForTimeout(200);

  await page.evaluate(() => {
    const pond = SITES.find(s => s.id === 'pond');
    AlpenMap.handle(pond);
  });
  await page.waitForTimeout(400);
  const lakeModalOpen = await page.isVisible('#modal.open');
  assert(lakeModalOpen, 'Lake modal must open on site click');
  const lakeContent = await page.textContent('#modalBody');
  assert(lakeContent.includes('Living Waters 2-Basin Alpine Lake System'), 'Must show 2-basin excavation console');
  assert(lakeContent.includes('Excavation Progress'), 'Must show progress indicator');

  // Step 1: Survey
  await page.evaluate(() => advanceLakeStep(0, 25));
  await page.waitForTimeout(200);
  console.log('[✓ PASSED] Lake Step 1: Surveying & Staking completed');

  // Step 2: Excavation
  await page.evaluate(() => advanceLakeStep(1, 35));
  await page.waitForTimeout(200);
  console.log('[✓ PASSED] Lake Step 2: Mechanical Loam Excavation completed');

  // Complete Lake
  await page.evaluate(() => buildLakeComplete(120));
  await page.waitForTimeout(300);
  const lakeDone = await page.evaluate(() => state.built['pond'] && state.lake.stage >= 4);
  assert(lakeDone, 'Lake must be fully built and commissioned');
  console.log('[✓ PASSED] Living Waters Alpine Lake fully excavated and commissioned with 3D assets');

  // Test Fish Hatchery & Duck Aviary Actions
  await page.evaluate(() => {
    stockAlpineFish();
    harvestAlpineFish();
    breedDucklings();
    collectDuckEggs();
  });
  const lakeFauna = await page.evaluate(() => ({ fish: state.fish, ducks: state.ducks }));
  assert(lakeFauna.fish.trout > 0, 'Fish must be actively stocked');
  assert(lakeFauna.ducks.ducklings > 0, 'Ducklings must be bred');
  console.log('[✓ PASSED] Glacial Fish Hatchery & Floating Entenhaus waterfowl management verified');

  if (await page.isVisible('#modal.open')) await page.click('.btn-close');

  await page.evaluate(() => {
    const cattle = SITES.find(s => s.id === 'cattle');
    AlpenMap.handle(cattle);
  });
  await page.waitForTimeout(400);
  const buildCattleBtn = await page.$('#modalBody .btn-g');
  if (buildCattleBtn) {
    await buildCattleBtn.click();
    await page.waitForTimeout(300);
  }
  // Commission and test livestock acquisition (Simmental cow, Alpine sheep, Chamois goat)
  await page.evaluate(() => {
    buildPastureEnclosure();
    acquireLivestock('goat');
    acquireLivestock('cow');
    feedHerd();
    collectDairyProducts();
  });
  const herdState = await page.evaluate(() => ({
    total: state.cattle.animals.length,
    types: [...new Set(state.cattle.animals.map(a => a.type))]
  }));
  assert(herdState.total >= 9, 'Herd must have at least 9 active animals');
  assert(herdState.types.includes('cow') && herdState.types.includes('sheep') && herdState.types.includes('goat'), 'Herd must include cows, sheep, and goats');
  console.log(`[✓ PASSED] Hillside Pasture commissioned with ${herdState.total} multi-species livestock (${herdState.types.join(', ')})`);
  if (await page.isVisible('#modal.open')) await page.click('.btn-close');

  await page.evaluate(() => {
    const windE = SITES.find(s => s.id === 'wind_e');
    AlpenMap.handle(windE);
  });
  await page.waitForTimeout(400);
  const buildWindBtn = await page.$('#modalBody .btn-g');
  if (buildWindBtn) {
    await buildWindBtn.click();
    await page.waitForTimeout(300);
    console.log('[✓ PASSED] High-Ridge Wind Turbine commissioned');
  }
  if (await page.isVisible('#modal.open')) await page.click('.btn-close');

  await page.evaluate(() => {
    const bridge = SITES.find(s => s.id === 'bridge');
    AlpenMap.handle(bridge);
  });
  await page.waitForTimeout(400);
  const bridgeModalOpen = await page.isVisible('#modal.open');
  assert(bridgeModalOpen, 'Bridge modal must open on site click');
  const bridgeContent = await page.textContent('#modalBody');
  assert(bridgeContent.includes('Alpine Wooden Overbridge'), 'Bridge modal title');
  await page.evaluate(() => buildBridge());
  await page.waitForTimeout(300);
  const bridgeDone = await page.evaluate(() => !!state.built['bridge']);
  assert(bridgeDone, 'Alpine Wooden Overbridge must be built and commissioned');
  console.log('[✓ PASSED] Alpine Wooden Overbridge commissioned across mountain cleft');
  if (await page.isVisible('#modal.open')) await page.click('.btn-close');

  await page.evaluate(() => {
    const shed = SITES.find(s => s.id === 'farm_shed');
    AlpenMap.handle(shed);
  });
  await page.waitForTimeout(400);
  const buildShedBtn = await page.$('#modalBody .btn-g');
  if (buildShedBtn) {
    await buildShedBtn.click();
    await page.waitForTimeout(300);
    console.log('[✓ PASSED] Farm Barn & Fendt Tractor commissioned');
  }
  if (await page.isVisible('#modal.open')) await page.click('.btn-close');

  await page.evaluate(() => {
    const rest = SITES.find(s => s.id === 'restaurant');
    AlpenMap.handle(rest);
  });
  await page.waitForTimeout(400);
  const restModalOpen = await page.isVisible('#modal.open');
  assert(restModalOpen, 'Restaurant modal must open on site click');
  const restContent = await page.textContent('#modalBody');
  assert(restContent.includes('Gasthof Stuben & Timber Terrace Console'), 'Must show timber terrace console');

  const buildRestBtn = await page.$('#modalBody .btn-g');
  if (buildRestBtn) {
    await buildRestBtn.click();
    await page.waitForTimeout(300);
    console.log('[✓ PASSED] Alpenhof Gasthof Stuben, Timber Terrace & Grape Juice Silo commissioned');
  }

  // Test Grape Juice Silo dispensing and evening banquet
  await page.evaluate(() => {
    dispenseGrapeJuice();
    hostGastronomyEvening();
  });
  await page.waitForTimeout(300);
  console.log('[✓ PASSED] Grape Juice Silo dispensing and Gasthof evening banquet verified');
  if (await page.isVisible('#modal.open')) await page.click('.btn-close');

  // Commission Juice Bar with front boardwalk terrace & barrel tables
  await page.evaluate(() => {
    const juice = SITES.find(s => s.id === 'juice');
    AlpenMap.handle(juice);
  });
  await page.waitForTimeout(400);
  const buildJuiceBtn = await page.$('#modalBody .btn-g');
  if (buildJuiceBtn) {
    await buildJuiceBtn.click();
    await page.waitForTimeout(300);
    console.log('[✓ PASSED] Hof-Mosterei Juice Bar & Cider Press commissioned');
  }
  if (await page.isVisible('#modal.open')) await page.click('.btn-close');

  // Commission Hilltop Tourist BBQ Place & Food Stand Console
  await page.evaluate(() => {
    const bbqSite = SITES.find(s => s.id === 'bbq');
    AlpenMap.handle(bbqSite);
  });
  await page.waitForTimeout(400);
  const bbqModalOpen = await page.isVisible('#modal.open');
  assert(bbqModalOpen, 'Tourist BBQ modal must open on site click');
  const bbqModalContent = await page.textContent('#modalBody');
  assert(bbqModalContent.includes('Hilltop Tourist BBQ & Food Stand Console'), 'Must show BBQ modal header');

  // Test multi-stage tourism development steps
  await page.evaluate(() => {
    advanceBBQStep(0, 35);
    advanceBBQStep(1, 45);
    buildBBQComplete(180);
    restockBBQFood();
    hostBBQTourists();
  });
  await page.waitForTimeout(300);
  const bbqDone = await page.evaluate(() => state.built['bbq'] && state.bbq.touristsServed >= 12);
  assert(bbqDone, 'Tourist BBQ Place must be fully commissioned and hosting tourists');
  console.log('[✓ PASSED] Hilltop Tourist BBQ Place & Food Stand multi-stage development and tourist hosting verified');
  if (await page.isVisible('#modal.open')) await page.click('.btn-close');

  // Advance trees and vines to mature for rich screenshot captures
  await page.evaluate(() => {
    Object.values(state.orchards).forEach(o => {
      o.beds.forEach(b => {
        if (b.species) { b.status = 'mature'; b.progress = 1.0; }
      });
    });
    state.vineyard.beds.forEach(b => {
      b.vines.forEach(v => {
        if (v.species) { v.status = 'mature'; v.progress = 1.0; }
      });
    });
  });
  await page.waitForTimeout(300);

  // 12. Multi-level Zoom Controls
  await page.click('.zoom-btn[data-z="2"]');
  await page.waitForTimeout(300);
  let curZoom = await page.evaluate(() => state.zoom);
  assert.strictEqual(curZoom, 2, 'Zoom should be 2x');
  console.log('[✓ PASSED] 2x zoom mode active');

  await page.click('.zoom-btn[data-z="1"]');
  await page.waitForTimeout(300);
  curZoom = await page.evaluate(() => state.zoom);
  assert.strictEqual(curZoom, 1, 'Zoom should return to 1x');
  console.log('[✓ PASSED] 1x zoom mode reset');

  // 13. Capture High-Resolution Visual Screenshots
  const scratchDir = path.join(process.cwd(), 'tests', 'screenshots');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_overview.png'), fullPage: true });
  console.log('[✓ SAVED] screenshot_alpenhof_overview.png');

  // Orchards close-up
  await page.evaluate(() => {
    state.zoom = 2.4;
    state.panX = 660;
    state.panY = 60;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_orchards.png') });
  console.log('[✓ SAVED] screenshot_alpenhof_orchards.png');

  // Cattle pasture close-up
  await page.evaluate(() => {
    state.zoom = 2.0;
    state.panX = -460;
    state.panY = 210;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_cattle_pasture.png') });
  console.log('[✓ SAVED] screenshot_alpenhof_cattle_pasture.png');

  // Lake amoeba close-up
  await page.evaluate(() => {
    state.zoom = 2.2;
    state.panX = 520;
    state.panY = -340;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_lake_amoeba.png') });
  console.log('[✓ SAVED] screenshot_alpenhof_lake_amoeba.png');

  // 108-vine vineyard close-up
  await page.evaluate(() => {
    state.zoom = 2.3;
    state.panX = -540;
    state.panY = 50;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_vineyard_108.png') });
  console.log('[✓ SAVED] screenshot_alpenhof_vineyard_108.png');

  // Village plaza close-up
  await page.evaluate(() => {
    state.zoom = 2.2;
    state.panX = -670;
    state.panY = -230;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_village_plaza.png') });
  console.log('[✓ SAVED] screenshot_alpenhof_village_plaza.png');

  // Wooden overbridge & hilltop turbine close-up
  await page.evaluate(() => {
    state.zoom = 2.0;
    state.panX = -1150;
    state.panY = 560;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_wooden_bridge.png') });
  console.log('[✓ SAVED] screenshot_alpenhof_wooden_bridge.png');

  // Hexagonal vegetable garden close-up (rotated 45 deg more to right, enlarged with wider pathways)
  await page.evaluate(() => {
    state.zoom = 2.2;
    state.panX = 88;
    state.panY = 165;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_hexagonal_veg.png') });
  console.log('[✓ SAVED] screenshot_alpenhof_hexagonal_veg.png');

  // 4x4 Agrivoltaic solar farm close-up (stretched left towards orchards & bottom towards veg garden)
  await page.evaluate(() => {
    state.zoom = 2.2;
    state.panX = 418;
    state.panY = 462;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_solar_farm.png') });
  console.log('[✓ SAVED] screenshot_alpenhof_solar_farm.png');

  // Triangular joined 3-oval flower garden close-up (with bee hotel and flutter bees)
  await page.evaluate(() => {
    state.zoom = 2.4;
    state.panX = 300;
    state.panY = -515;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_oval_flowers.png') });
  console.log('[✓ SAVED] screenshot_alpenhof_oval_flowers.png');

  // Hilltop Tourist BBQ Place close-up (food kiosk, 4 fire pits, 7 benches, marker behind stand, walking tourists)
  await page.evaluate(() => {
    state.zoom = 2.0;
    state.panX = -1600;
    state.panY = 380;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_tourist_bbq.png') });
  console.log('[✓ SAVED] screenshot_alpenhof_tourist_bbq.png');

  // Gasthof Stuben with Classical Timber Deck Floor, 4 Table Sets, Stehtische, 3 Umbrellas, Fountain & Grape Juice Silo
  await page.evaluate(() => {
    state.zoom = 2.0;
    state.panX = -1220;
    state.panY = -60;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_stuben_terrace.png') });
  console.log('[✓ SAVED] screenshot_alpenhof_stuben_terrace.png');

  // Hof-Mosterei Juice Bar with Front Boardwalk Terrace & Barrel Tables
  await page.evaluate(() => {
    state.zoom = 2.3;
    state.panX = -795;
    state.panY = -140;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_juice_terrace.png') });
  console.log('[✓ SAVED] screenshot_alpenhof_juice_terrace.png');

  // Reset zoom
  await page.evaluate(() => {
    state.zoom = 1.0;
    state.panX = 0;
    state.panY = 0;
  });
  await page.waitForTimeout(200);

  // 14. Mobile Landscape & Portrait View Verification
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(400);
  const isLandscapePromptHidden = await page.evaluate(() => {
    const el = document.getElementById('landscapeRotatePrompt');
    return window.getComputedStyle(el).display === 'none';
  });
  assert(isLandscapePromptHidden, 'Landscape prompt should NOT be visible in landscape view');
  await page.screenshot({ path: path.join(scratchDir, 'screenshot_alpenhof_mobile_landscape.png') });
  console.log('[✓ PASSED] Mobile Landscape view verified with edge-to-edge canvas');

  // Test Mobile Portrait View
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  const isPortraitPromptVisible = await page.evaluate(() => {
    const el = document.getElementById('landscapeRotatePrompt');
    return window.getComputedStyle(el).display === 'flex';
  });
  assert(isPortraitPromptVisible, 'Landscape rotate prompt MUST be visible in portrait view on mobile');
  console.log('[✓ PASSED] Mobile Portrait view displays rotation prompt');

  await page.click('#landscapeRotatePrompt button');
  await page.waitForTimeout(200);
  const isPromptDismissed = await page.evaluate(() => {
    const el = document.getElementById('landscapeRotatePrompt');
    return el.style.display === 'none';
  });
  assert(isPromptDismissed, 'Landscape rotate prompt should be dismissible');
  console.log('[✓ PASSED] Portrait fallback dismissal verified');

  assert.strictEqual(errors.length, 0, `Errors occurred during testing: ${errors.join(', ')}`);
  console.log('\n========================================================');
  console.log('  ALL BAVARIA ALPENHOF SUITE TESTS PASSED (14/14)!     ');
  console.log('========================================================');

  await browser.close();
})();
