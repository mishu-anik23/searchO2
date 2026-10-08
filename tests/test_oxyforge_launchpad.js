const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('🚀 Starting OxyForge & 3D Launchpad Verification Suite...');
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (e) {
    browser = await chromium.launch({ headless: true });
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Test 1: Verify index.html DEV Modal
  console.log('\n--- Test 1: index.html DEV Modal ---');
  const indexUrl = 'file://' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  await page.goto(indexUrl, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss guest start if present
  try {
    const guestBtn = await page.$('#btnGuestStart');
    if (guestBtn) {
      await guestBtn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  } catch (e) {}

  // Open DEV OxyForge Modal
  await page.evaluate(() => {
    if (typeof window.openDevOxyforgeModal === 'function') {
      window.openDevOxyforgeModal();
    }
  });
  await new Promise(r => setTimeout(r, 500));

  // Check modal links
  const hqLink = await page.$('a[href="public/oxyforge.html"]');
  const padLink = await page.$('a[href="public/launchpad-preview.html"]');
  const cruiseLink = await page.$('a[href="public/transfer-cruise-preview.html"]');
  const marsLink = await page.$('a[href="public/mars-explorer-preview.html"]');
  const lunarLink = await page.$('a[href="public/lunar-explorer-preview.html"]');
  const moonLink = await page.$('a[href="public/moon-landing-preview.html"]');

  if (!hqLink || !padLink || !cruiseLink || !marsLink || !lunarLink || !moonLink) {
    throw new Error('❌ One or more OxyForge navigation links missing from DEV modal');
  }
  console.log('✓ DEV modal contains links to OxyForge HQ, 3D Pad, Transfer Cruise FPV, Mars Explorer, Lunar Explorer, and Moon Landing!');

  // Test 2: Verify public/oxyforge.html
  console.log('\n--- Test 2: public/oxyforge.html HQ Mission Command ---');
  const hqUrl = 'file://' + path.resolve(__dirname, '../public/oxyforge.html').replace(/\\/g, '/');
  await page.goto(hqUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  const title = await page.title();
  console.log('✓ Page title:', title);

  const crewCards = await page.$$('.crew-card');
  console.log(`✓ Found ${crewCards.length} crew cards in Mission Roster (expected 12)`);
  if (crewCards.length !== 12) {
    throw new Error(`Expected 12 crew cards, found ${crewCards.length}`);
  }

  const seatsFilledText = await page.$eval('#seatsFilledCounter', el => el.textContent.trim());
  console.log(`✓ Seats filled counter: ${seatsFilledText}`);

  const padBtn = await page.$('a[href="launchpad-preview.html"]');
  const moonBtn = await page.$('a[href="moon-landing-preview.html"]');
  if (!padBtn || !moonBtn) {
    throw new Error('❌ Missing 3D launchpad or moon landing buttons in HQ Mission Page');
  }
  console.log('✓ Found 3D Launchpad & Rocket Ignition and 3D Moon Landing action buttons in HQ!');

  // Test 3: Verify public/launchpad-preview.html 3D scene & ignition
  console.log('\n--- Test 3: public/launchpad-preview.html 3D Launchpad ---');
  const padUrl = 'file://' + path.resolve(__dirname, '../public/launchpad-preview.html').replace(/\\/g, '/');
  await page.goto(padUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  const padTitle = await page.title();
  console.log('✓ Pad page title:', padTitle);

  const countdownText = await page.$eval('#clockDisplay', el => el.textContent.trim());
  console.log(`✓ Countdown display initialized: ${countdownText}`);

  const checklistItems = await page.$$('.check-item');
  console.log(`✓ Found ${checklistItems.length} checklist items on launch pad console`);

  const hqBackBtn = await page.$('a[href="oxyforge.html"]');
  if (!hqBackBtn) {
    throw new Error('❌ Missing navigation link back to Mission HQ in launchpad simulator');
  }
  console.log('✓ Found navigation link back to Mission HQ in 3D Launchpad!');

  // Test 4: Verify public/moon-landing-preview.html
  console.log('\n--- Test 4: public/moon-landing-preview.html 3D Moon Landing ---');
  const moonUrl = 'file://' + path.resolve(__dirname, '../public/moon-landing-preview.html').replace(/\\/g, '/');
  await page.goto(moonUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  const moonTitle = await page.title();
  console.log('✓ Moon page title:', moonTitle);

  const callsign = await page.$eval('#callsign', el => el.textContent.trim());
  console.log(`✓ Current lunar descent step: ${callsign}`);

  const padLinkFromMoon = await page.$('a[href="launchpad-preview.html"]');
  if (!padLinkFromMoon) {
    throw new Error('❌ Missing link to 3D Launchpad in moon landing preview');
  }
  console.log('✓ Found link to 3D Launchpad in moon landing preview!');

  // Test 5: Verify public/transfer-cruise-preview.html
  console.log('\n--- Test 5: public/transfer-cruise-preview.html 3D Transfer Cruise & Deep Sky FPV ---');
  const cruiseUrl = 'file://' + path.resolve(__dirname, '../public/transfer-cruise-preview.html').replace(/\\/g, '/');
  await page.goto(cruiseUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  const cruiseTitle = await page.title();
  console.log('✓ Cruise page title:', cruiseTitle);

  const canvasExists = await page.$('#spaceCanvas');
  if (!canvasExists) throw new Error('❌ Missing 3D space canvas in transfer cruise simulator');
  console.log('✓ Found 3D celestial canvas!');

  // Verify 5,400 stars, 19 galaxies, 25 named stars, 10 bodies, and 160 asteroids
  const starCount = await page.evaluate(() => typeof STAR_CATALOG !== 'undefined' ? STAR_CATALOG.length : 0);
  const galaxyCount = await page.evaluate(() => typeof GALAXIES !== 'undefined' ? GALAXIES.length : 0);
  const namedStarCount = await page.evaluate(() => typeof NAMED_STARS !== 'undefined' ? NAMED_STARS.length : 0);
  const bodiesCount = await page.evaluate(() => typeof BODIES !== 'undefined' ? BODIES.length : 0);
  const asteroidCount = await page.evaluate(() => typeof ASTEROIDS !== 'undefined' ? ASTEROIDS.length : 0);

  console.log(`✓ Cosmos verification: ${starCount} stars, ${galaxyCount} galaxies/nebulae, ${namedStarCount} named stars, ${bodiesCount} planetary bodies, ${asteroidCount} asteroids`);
  if (starCount !== 5400) throw new Error(`Expected 5400 stars, found ${starCount}`);
  if (galaxyCount !== 19) throw new Error(`Expected 19 galaxies, found ${galaxyCount}`);
  if (namedStarCount !== 158 && namedStarCount !== 25) throw new Error(`Expected at least 25 named stars, found ${namedStarCount}`);
  if (bodiesCount !== 10) throw new Error(`Expected 10 planetary bodies, found ${bodiesCount}`);
  if (asteroidCount !== 160) throw new Error(`Expected 160 asteroids, found ${asteroidCount}`);

  // Test locking Andromeda and opening Deep Sky Dossier
  await page.evaluate(() => {
    const andromeda = GALAXIES.find(g => g.id === 'andromeda');
    if (andromeda && typeof lockTarget === 'function') {
      lockTarget(andromeda);
    }
  });
  await new Promise(r => setTimeout(r, 300));
  const dossierName = await page.$eval('#dosName', el => el.textContent.trim());
  const dossierDist = await page.$eval('#dosDist', el => el.textContent.trim());
  console.log(`✓ Deep Sky Dossier target lock: ${dossierName} at ${dossierDist}`);
  if (!dossierName.includes('Andromeda')) throw new Error('❌ Failed to lock Andromeda Galaxy in dossier');

  const zoomBtns = await page.$$('.zoom-btn');
  console.log(`✓ Found ${zoomBtns.length} optical zoom buttons (expected 4: 1x, 2.5x, 5x, 10x)`);
  if (zoomBtns.length !== 4) throw new Error(`Expected 4 zoom buttons, found ${zoomBtns.length}`);

  const lockStatus = await page.$eval('#targetLockStatus', el => el.textContent.trim());
  console.log(`✓ Target acquisition status: ${lockStatus}`);

  const sessionCost = await page.$eval('#sessionCostVal', el => el.textContent.trim());
  console.log(`✓ Initial session billing readout: ${sessionCost}`);

  const hqBackBtnCruise = await page.$('a[href="oxyforge.html"]');
  if (!hqBackBtnCruise) throw new Error('❌ Missing navigation link back to Mission HQ in cruise simulator');
  console.log('✓ Found navigation link back to Mission HQ in cruise simulator!');

  // Test 6: Verify public/mars-explorer-preview.html
  console.log('\n--- Test 6: public/mars-explorer-preview.html 3D Mars Explorer & Jezero Traverse ---');
  const marsUrl = 'file://' + path.resolve(__dirname, '../public/mars-explorer-preview.html').replace(/\\/g, '/');
  await page.goto(marsUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  const marsTitle = await page.title();
  console.log('✓ Mars page title:', marsTitle);

  const marsCanvas = await page.$('#marsCanvas');
  if (!marsCanvas) throw new Error('❌ Missing 3D Mars canvas');
  console.log('✓ Found 3D Mars WebGL canvas!');

  // Verify Mars 5400 cosmos stars and 44 celestial targets
  const marsStarCount = await page.evaluate(() => typeof STAR_CATALOG !== 'undefined' ? STAR_CATALOG.length : 0);
  const marsCelestialCount = await page.evaluate(() => typeof celestialTargets !== 'undefined' ? celestialTargets.length : 0);
  console.log(`✓ Mars Cosmos verification: ${marsStarCount} stars, ${marsCelestialCount} celestial targets`);
  if (marsStarCount !== 5400) throw new Error(`Expected 5400 stars in Mars Explorer, found ${marsStarCount}`);
  if (marsCelestialCount !== 44) throw new Error(`Expected 44 celestial targets in Mars Explorer, found ${marsCelestialCount}`);

  // Test celestial hover card
  await page.evaluate(() => {
    if (typeof showCelestialHoverCard === 'function' && typeof GALAXIES !== 'undefined') {
      showCelestialHoverCard(GALAXIES[0], 250, 200);
    }
  });
  await new Promise(r => setTimeout(r, 200));
  const celTitleMars = await page.$eval('#celTitle', el => el.textContent.trim());
  console.log(`✓ Celestial hover card active: ${celTitleMars}`);
  if (!celTitleMars.includes('Andromeda')) throw new Error('❌ Celestial hover card failed to display Andromeda');

  await page.evaluate(() => hideCelestialHoverCard());

  const marsFilters = await page.$$('#filterContainer button');
  console.log(`✓ Found ${marsFilters.length} filter buttons in Mars Explorer`);
  if (marsFilters.length < 5) throw new Error('Expected at least 5 filter buttons in Mars Explorer');

  const marsExpedition = await page.$eval('#expeditionCount', el => el.textContent.trim());
  const marsXp = await page.$eval('#researchXp', el => el.textContent.trim());
  console.log(`✓ Gamification readout: ${marsExpedition}, ${marsXp}`);

  const zoomBtnMars = await page.$('#btnZoomToggle');
  const roamBtnMars = await page.$('#btnRoam');
  if (!zoomBtnMars || !roamBtnMars) throw new Error('❌ Missing zoom/roam controls in Mars Explorer');
  console.log('✓ Found Close Surface Zoom and Free Pan controls!');

  // Test opening classroom study modal
  await page.evaluate(() => {
    if (typeof openStudyModal === 'function' && typeof MARS_FEATURES !== 'undefined') {
      openStudyModal(MARS_FEATURES[0]);
    }
  });
  await new Promise(r => setTimeout(r, 300));
  const isModalOpen = await page.$eval('#studyModal', el => el.classList.contains('open'));
  const quizQ = await page.$eval('#quizQuestion', el => el.textContent.trim());
  console.log(`✓ Classroom study modal open status: ${isModalOpen}, Quiz question: "${quizQ.slice(0, 45)}..."`);
  if (!isModalOpen || !quizQ) throw new Error('❌ Classroom study modal failed to open with quiz');

  await page.evaluate(() => closeStudyModal());
  await new Promise(r => setTimeout(r, 200));

  const hqBackBtnMars = await page.$('a[href="oxyforge.html"]');
  const lunarToggleMars = await page.$('a[href="lunar-explorer-preview.html"]');
  if (!hqBackBtnMars || !lunarToggleMars) throw new Error('❌ Missing HQ or Lunar toggle link in Mars Explorer');
  console.log('✓ Found Mission HQ and Lunar toggle links in Mars Explorer!');

  // Test 7: Verify public/lunar-explorer-preview.html
  console.log('\n--- Test 7: public/lunar-explorer-preview.html 3D Lunar Surface & South Pole Explorer ---');
  const lunarUrl = 'file://' + path.resolve(__dirname, '../public/lunar-explorer-preview.html').replace(/\\/g, '/');
  await page.goto(lunarUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  const lunarTitle = await page.title();
  console.log('✓ Lunar page title:', lunarTitle);

  const lunarCanvas = await page.$('#lunarCanvas');
  if (!lunarCanvas) throw new Error('❌ Missing 3D Lunar canvas');
  console.log('✓ Found 3D Lunar WebGL canvas!');

  // Verify Lunar 5400 cosmos stars and 44 celestial targets
  const lunarStarCount = await page.evaluate(() => typeof STAR_CATALOG !== 'undefined' ? STAR_CATALOG.length : 0);
  const lunarCelestialCount = await page.evaluate(() => typeof celestialTargets !== 'undefined' ? celestialTargets.length : 0);
  console.log(`✓ Lunar Cosmos verification: ${lunarStarCount} stars, ${lunarCelestialCount} celestial targets`);
  if (lunarStarCount !== 5400) throw new Error(`Expected 5400 stars in Lunar Explorer, found ${lunarStarCount}`);
  if (lunarCelestialCount !== 44) throw new Error(`Expected 44 celestial targets in Lunar Explorer, found ${lunarCelestialCount}`);

  // Test lunar celestial hover card
  await page.evaluate(() => {
    if (typeof showCelestialHoverCard === 'function' && typeof GALAXIES !== 'undefined') {
      showCelestialHoverCard(GALAXIES[0], 250, 200);
    }
  });
  await new Promise(r => setTimeout(r, 200));
  const celTitleLunar = await page.$eval('#celTitle', el => el.textContent.trim());
  console.log(`✓ Lunar celestial hover card active: ${celTitleLunar}`);
  if (!celTitleLunar.includes('Andromeda')) throw new Error('❌ Lunar celestial hover card failed to display Andromeda');

  await page.evaluate(() => hideCelestialHoverCard());

  const lunarFilters = await page.$$('#filterContainer button');
  console.log(`✓ Found ${lunarFilters.length} filter buttons in Lunar Explorer`);
  if (lunarFilters.length < 5) throw new Error('Expected at least 5 filter buttons in Lunar Explorer');

  const lunarExpedition = await page.$eval('#expeditionCount', el => el.textContent.trim());
  const lunarXp = await page.$eval('#researchXp', el => el.textContent.trim());
  console.log(`✓ Gamification readout: ${lunarExpedition}, ${lunarXp}`);

  // Test opening classroom study modal
  await page.evaluate(() => {
    if (typeof openStudyModal === 'function' && typeof LUNAR_FEATURES !== 'undefined') {
      openStudyModal(LUNAR_FEATURES[0]);
    }
  });
  await new Promise(r => setTimeout(r, 300));
  const isLunarModalOpen = await page.$eval('#studyModal', el => el.classList.contains('open'));
  const lunarQuizQ = await page.$eval('#quizQuestion', el => el.textContent.trim());
  console.log(`✓ Lunar study modal open status: ${isLunarModalOpen}, Quiz question: "${lunarQuizQ.slice(0, 45)}..."`);
  if (!isLunarModalOpen || !lunarQuizQ) throw new Error('❌ Lunar study modal failed to open with quiz');

  await page.evaluate(() => closeStudyModal());
  await new Promise(r => setTimeout(r, 200));

  const hqBackBtnLunar = await page.$('a[href="oxyforge.html"]');
  const marsToggleLunar = await page.$('a[href="mars-explorer-preview.html"]');
  if (!hqBackBtnLunar || !marsToggleLunar) throw new Error('❌ Missing HQ or Mars toggle link in Lunar Explorer');
  console.log('✓ Found Mission HQ and Mars toggle links in Lunar Explorer!');

  await browser.close();
  console.log('\n🎉 ALL 7 E2E TESTS PASSED WITH 100% SUCCESS!');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
