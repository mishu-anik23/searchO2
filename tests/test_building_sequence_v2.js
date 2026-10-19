const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

(async () => {
  console.log('========================================================');
  console.log('  Saint Martin Blue Lab: Building Sequence & 3D Render  ');
  console.log('========================================================');

  // Strict Parity check
  const origHtml = fs.readFileSync('saint-martin/blue-lab.html', 'utf8');
  const pubHtml = fs.readFileSync('public/saint-martin/blue-lab.html', 'utf8');
  assert.strictEqual(origHtml, pubHtml, 'HTML byte parity mismatch!');

  const origSvg = fs.readFileSync('saint-martin/blueprint-map.svg', 'utf8');
  const pubSvg = fs.readFileSync('public/saint-martin/blueprint-map.svg', 'utf8');
  assert.strictEqual(origSvg, pubSvg, 'SVG byte parity mismatch!');
  console.log('[✓ PASSED] Strict parity between saint-martin/ and public/saint-martin/');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const pageErrors = [];
  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.message);
    pageErrors.push(err.message);
  });

  const fileUrl = 'file:///' + path.resolve('saint-martin/blue-lab.html').replace(/\\/g, '/');
  console.log('Visiting:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // Skip boat tour if active
  if (await page.isVisible('#btn-skip-boat')) {
    await page.click('#btn-skip-boat');
    await page.waitForTimeout(500);
  }

  // Dismiss why onboarding modal
  if (await page.isVisible('#why-ack')) {
    await page.click('#why-ack');
    await page.waitForTimeout(300);
  }

  // 1. Verify Global draw3DIsoPlaque is defined
  const isPlaqueDefined = await page.evaluate(() => typeof window.draw3DIsoPlaque === 'function');
  assert.strictEqual(isPlaqueDefined, true, 'window.draw3DIsoPlaque must be a defined function');
  console.log('[✓ PASSED] window.draw3DIsoPlaque is defined globally');

  // 2. Verify State Workers
  const workers = await page.evaluate(() => state.workers);
  assert(workers >= 3, 'state.workers must be >= 3 to allow construction');
  console.log('[✓ PASSED] state.workers initialized to ' + workers);

  // 3. Verify SITES Coordinates
  const sites = await page.evaluate(() => SITES);
  const cotSite = sites.find(s => s.id === 'tourist_cottages');
  assert.strictEqual(cotSite.x1080, 120, 'tourist_cottages x1080 must be 120');
  assert.strictEqual(cotSite.y1080, 230, 'tourist_cottages y1080 must be 230');

  const sunSite = sites.find(s => s.id === 'beach_sunbeds');
  assert.strictEqual(sunSite.x1080, 228, 'beach_sunbeds x1080 must be 228');
  assert.strictEqual(sunSite.y1080, 178, 'beach_sunbeds y1080 must be 178');

  const dec3Site = sites.find(s => s.id === 'mangrove_decagon_3');
  assert.strictEqual(dec3Site.x1080, 265, 'mangrove_decagon_3 x1080 must be 265');
  assert.strictEqual(dec3Site.y1080, 335, 'mangrove_decagon_3 y1080 must be 335');

  const saltSite = sites.find(s => s.id === 'salt_brine_beds');
  assert.strictEqual(saltSite.x1080, 205, 'salt_brine_beds x1080 must be 205');
  assert.strictEqual(saltSite.y1080, 475, 'salt_brine_beds y1080 must be 475');

  const jettySite = sites.find(s => s.id === 't_jetty_pier');
  assert.strictEqual(jettySite.x1080, 1415, 't_jetty_pier x1080 must be 1415');
  assert.strictEqual(jettySite.y1080, 489, 't_jetty_pier y1080 must be 489');
  console.log('[✓ PASSED] Calibrated coordinates verified for cottages, sunbeds, decagon 3, salt beds, and modern jetty');

  // 4. Verify Decagon 3 PLOT_DEFS Coordinates
  const plotDefs = await page.evaluate(() => PLOT_DEFS);
  assert.strictEqual(plotDefs['dec3.plot1'].y1080, 275);
  assert.strictEqual(plotDefs['dec3.plot5'].x1080, 320);
  assert.strictEqual(plotDefs['dec3.plot5'].y1080, 358);
  console.log('[✓ PASSED] Decagon 3 PLOT_DEFS verified with plot5 relocated to green meadow (320, 358)');

  // 5. Test Building all 6 Facilities in Parallel / Sequential
  console.log('Testing construction of all 6 facilities...');
  const testBuildings = ['tourist_cottages', 'beach_sunbeds', 'salt_brine_beds', 'pearl_farming', 'shrimp_crab_freshwater', 't_jetty_pier'];

  for (const bKey of testBuildings) {
    await page.evaluate((key) => {
      startBuildingFacility(key);
    }, bKey);
  }

  // Fast-forward progress to complete construction and close construction modal
  await page.evaluate((keys) => {
    keys.forEach(k => {
      const b = state.buildings[k];
      if (b) {
        b.building = false;
        b.built = true;
        b.progress = 100;
      }
    });
    const cm = document.getElementById('garden-construct-modal');
    if (cm) cm.classList.remove('open');
  }, testBuildings);

  // Allow render loop to execute multiple frames with all 5 facilities built simultaneously
  await page.waitForTimeout(1000);

  // Verify none of the buildings threw errors or crashed the render loop
  assert.strictEqual(pageErrors.length, 0, 'No page errors should occur during/after building all 5 facilities: ' + JSON.stringify(pageErrors));
  console.log('[✓ PASSED] All 5 facilities built and rendered simultaneously with 0 errors');

  // 6. Test Crab Prawn Modal with Cephalopod Section Divider
  await page.evaluate(() => openCrabPrawnModal());
  await page.waitForTimeout(300);
  const crabModalContent = await page.textContent('#crab-prawn-content');
  assert(crabModalContent.includes('Horizontal Sea-Deck Extension · Cephalopod RAS Jars'), 'Modal must contain cephalopod section divider');
  assert(crabModalContent.includes('Chamber 3: Oceanic Reef Squid'), 'Modal must show Chamber 3 Squid');
  assert(crabModalContent.includes('Chamber 4: Reef Octopus'), 'Modal must show Chamber 4 Octopus');
  console.log('[✓ PASSED] openCrabPrawnModal renders distinct cephalopod section divider');
  await page.evaluate(() => document.getElementById('crab-prawn-modal').classList.remove('open'));
  await page.waitForTimeout(200);

  // 7. Test Modern Cargo Jetty Modal & Cargo Dispatch
  await page.evaluate(() => openModernJettyModal());
  await page.waitForTimeout(300);
  let jettyModalOpen = await page.$eval('#modern-jetty-modal', el => el.classList.contains('open'));
  assert.strictEqual(jettyModalOpen, true, 'Modern Jetty modal must open');
  const jettyContent = await page.textContent('#modern-jetty-content');
  assert(jettyContent.includes('MV Blue Horizon'), 'Jetty modal must display MV Blue Horizon');
  assert(jettyContent.includes('Export Freight Manifest'), 'Jetty modal must show export manifest');

  const moneyBefore = await page.evaluate(() => state.money);
  await page.click('#modern-jetty-content button');
  await page.waitForTimeout(300);
  const moneyAfter = await page.evaluate(() => state.money);
  assert.strictEqual(moneyAfter, moneyBefore + 350, 'Dispatching cargo must add €350 to state.money');
  console.log('[✓ PASSED] Modern Jetty modal opens and dispatches cargo (+€350)');

  // 8. Capture Screenshots for Visual Verification
  // Northwest beach area (L-shaped cottages, sea-facing sunbeds, and lone palm tree)
  await page.evaluate(() => {
    state.zoom = 1.8;
    state.panX = 650;
    state.panY = 350;
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/AM/.gemini/antigravity/brain/d0f09cad-1638-4e2c-b505-333cd232aacf/scratch/screenshot_northwest_beach_cottages_sunbeds.png' });
  console.log('[✓ PASSED] Captured screenshot_northwest_beach_cottages_sunbeds.png');

  // Eastern basin area (modern jetty and berthed cargo ship)
  await page.evaluate(() => {
    state.zoom = 1.5;
    state.panX = -682;
    state.panY = 76;
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/AM/.gemini/antigravity/brain/d0f09cad-1638-4e2c-b505-333cd232aacf/scratch/screenshot_modern_jetty_cargo_ship.png' });
  console.log('[✓ PASSED] Captured screenshot_modern_jetty_cargo_ship.png');

  // Rotated Salt Beds on Beach Sand (190, 505)
  await page.evaluate(() => {
    state.zoom = 1.8;
    state.panX = 650;
    state.panY = -150;
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/AM/.gemini/antigravity/brain/d0f09cad-1638-4e2c-b505-333cd232aacf/scratch/screenshot_rotated_salt_beds_sand.png' });
  console.log('[✓ PASSED] Captured screenshot_rotated_salt_beds_sand.png');

  // Decagon 3 and Meadow Plot 5 (350, 325)
  await page.evaluate(() => {
    state.zoom = 1.5;
    state.panX = 450;
    state.panY = 100;
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/AM/.gemini/antigravity/brain/d0f09cad-1638-4e2c-b505-333cd232aacf/scratch/screenshot_meadow_plot5_and_dec3.png' });
  console.log('[✓ PASSED] Captured screenshot_meadow_plot5_and_dec3.png');

  // Full Western Shore & Meadow Overview (1x)
  await page.evaluate(() => {
    state.zoom = 1.0;
    state.panX = 0;
    state.panY = 0;
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/AM/.gemini/antigravity/brain/d0f09cad-1638-4e2c-b505-333cd232aacf/scratch/screenshot_full_overview_western_shore.png' });
  console.log('[✓ PASSED] Captured screenshot_full_overview_western_shore.png');

  assert.strictEqual(pageErrors.length, 0, 'Zero page errors guaranteed throughout full test lifecycle!');
  console.log('========================================================');
  console.log('  ALL SAINT MARTIN BLUE LAB CHECKS PASSED (100% GREEN)  ');
  console.log('========================================================');

  await browser.close();
})();
