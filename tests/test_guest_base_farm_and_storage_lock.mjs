import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function runTests() {
  console.log('🚀 Running Test Suite: Guest Base Farm, Storage Lock Bug & Scoreboard Customization');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  let failed = 0;
  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  try {
    const indexUrl = 'file:///' + path.join(rootDir, 'index.html').replace(/\\/g, '/');
    await page.goto(indexUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // =========================================================================
    // TEST 1: Default Guest Profile is SearchO2 & Hesse (NOT Alpenhof/Bavaria)
    // =========================================================================
    console.log('\n--- 1. Testing Default Guest Profile ---');
    const prof = await page.evaluate(() => {
      localStorage.removeItem('searchO2_guest_farm_profile');
      return window.getGuestFarmProfile();
    });

    assert(prof.name === 'SearchO2', `Default guest name is SearchO2 (got: "${prof.name}")`);
    assert(prof.stateId === 'hesse', `Default guest state is Hesse (got: "${prof.stateId}")`);
    assert(prof.coords.lat === 50.11 && prof.coords.lon === 8.68, `Default coordinates are Hesse 50.11° N, 8.68° E (got: ${prof.coords.lat}, ${prof.coords.lon})`);
    assert(prof.name !== 'Alpenhof' && prof.name !== 'AlpenO2', 'Default name is NOT Alpenhof or AlpenO2');

    // =========================================================================
    // TEST 2: Migration of Legacy Alpenhof/Bavaria Profile
    // =========================================================================
    console.log('\n--- 2. Testing Migration of Legacy Alpenhof Profile ---');
    const migrated = await page.evaluate(() => {
      localStorage.setItem('searchO2_guest_farm_profile', JSON.stringify({
        name: 'Alpenhof',
        stateId: 'bavaria',
        coords: { lat: 47.75, lon: 11.55, stateId: 'bavaria', region: 'Bavaria · Alpenhof Eco-Estate' }
      }));
      return window.getGuestFarmProfile();
    });

    assert(migrated.name === 'SearchO2', `Migrated name from Alpenhof to SearchO2 (got: "${migrated.name}")`);
    assert(migrated.stateId === 'hesse', `Migrated state from bavaria to hesse (got: "${migrated.stateId}")`);

    // =========================================================================
    // TEST 3: Guest Modal High Contrast & 15 German States Restriction
    // =========================================================================
    console.log('\n--- 3. Testing Guest Modal Contrast & Bavaria Lock Restriction ---');
    await page.evaluate(() => {
      window.openGuestFarmSetupModal();
    });
    await page.waitForTimeout(300);

    const modalData = await page.evaluate(() => {
      const m = document.getElementById('guestFarmSetupModal');
      const input = document.getElementById('guestFarmNameInput');
      const charCount = document.getElementById('guestOsmCharCount');
      const hudCoords = document.getElementById('osmHudCoords');
      const hudReg = document.getElementById('osmHudRegion');
      const bavariaBtn = document.querySelector('.guest-osm-preset-pill[data-state="bavaria"]');
      const hesseBtn = document.querySelector('.guest-osm-preset-pill[data-state="hesse"]');

      return {
        isOpen: m && m.style.display !== 'none',
        inputValue: input?.value,
        inputPlaceholder: input?.placeholder,
        charCountText: charCount?.textContent,
        hudCoordsText: hudCoords?.textContent,
        hudRegText: hudReg?.textContent,
        bavariaHasLock: bavariaBtn?.classList.contains('locked-bavaria') && bavariaBtn?.textContent.includes('Unlock via Base Farm'),
        hesseIsActive: hesseBtn?.classList.contains('active')
      };
    });

    assert(modalData.isOpen, 'Guest setup modal opened successfully');
    assert(modalData.inputValue === 'SearchO2', `Input default value is SearchO2 (got: "${modalData.inputValue}")`);
    assert(modalData.inputPlaceholder === 'e.g. SearchO2', `Input placeholder is e.g. SearchO2 (got: "${modalData.inputPlaceholder}")`);
    assert(modalData.hudCoordsText.includes('50.11'), `HUD coordinates default to Hesse (got: "${modalData.hudCoordsText}")`);
    assert(modalData.hudRegText.includes('Hesse'), `HUD region defaults to Hesse (got: "${modalData.hudRegText}")`);
    assert(modalData.bavariaHasLock, 'Bavaria preset pill is clearly styled with locked-bavaria and "Unlock via Base Farm"');
    assert(modalData.hesseIsActive, 'Hesse preset pill is active by default');

    // Test clicking locked Bavaria preset
    console.log('\n--- Testing Click on Locked Bavaria Preset ---');
    await page.evaluate(() => {
      window.selectGermanStatePreset('bavaria');
    });
    await page.waitForTimeout(200);

    const bavariaRejection = await page.evaluate(() => {
      const bubble = document.getElementById('guestOsmRejectBubble');
      const text = document.getElementById('guestOsmRejectText');
      return {
        visible: bubble && bubble.style.display !== 'none',
        msg: text?.textContent || ''
      };
    });

    assert(bavariaRejection.visible, 'Rejection bubble displayed when attempting to select Bavaria Alpenhof');
    assert(bavariaRejection.msg.includes('Bavaria Alpenhof is an advanced eco-journey unlocked by progressing your Base Farm'),
      `Rejection message clearly explains unlock requirement (got: "${bavariaRejection.msg}")`);

    // Test selecting a valid state from the 15 states (e.g. Saxony-Anhalt)
    console.log('\n--- Testing Selection of another of the 15 German States (Saxony-Anhalt) ---');
    await page.evaluate(() => {
      window.selectGermanStatePreset('saxony_anhalt');
    });
    await page.waitForTimeout(200);

    const saxonyAnhaltState = await page.evaluate(() => {
      const bubble = document.getElementById('guestOsmRejectBubble');
      const reg = document.getElementById('osmHudRegion')?.textContent || '';
      const inp = document.getElementById('guestFarmNameInput')?.value || '';
      return {
        bubbleHidden: !bubble || bubble.style.display === 'none',
        reg,
        inp
      };
    });

    assert(saxonyAnhaltState.bubbleHidden, 'Rejection bubble dismissed after picking valid state');
    assert(saxonyAnhaltState.reg.includes('Saxony-Anhalt') && saxonyAnhaltState.reg.includes('Börde Schwarzerde-Gut'),
      `HUD region correctly updated to Saxony-Anhalt (got: "${saxonyAnhaltState.reg}")`);

    // =========================================================================
    // TEST 4: Committing Custom Setup & Verification of Gate Banner & Scoreboard
    // =========================================================================
    console.log('\n--- 4. Testing Custom Name & Scoreboard Customization ---');
    await page.evaluate(() => {
      const inp = document.getElementById('guestFarmNameInput');
      if (inp) inp.value = 'GreenO2';
      window.commitGuestFarmSetup();
    });
    await page.waitForTimeout(400);

    const postCommitData = await page.evaluate(() => {
      const prof = window.getGuestFarmProfile();
      if (typeof window.topbarStatsHtml === 'function') {
        const topEl = document.getElementById('topbarStats');
        if (topEl) topEl.innerHTML = window.topbarStatsHtml();
      }
      const scoreboardTitle = document.querySelector('.scoreboard-title')?.textContent || '';
      const estateVal = document.querySelector('.kid-stat-card .kid-stat-val[style*="FDE047"]')?.textContent || '';
      const shakirCard = document.querySelector('.kid-stat-card[data-role="OxyEco Forger CEO Guide"]');
      const avatarCard = document.querySelector('.kid-stat-card[title*="3D Avatar Explorer"]');

      return {
        savedName: prof.name,
        scoreboardTitle,
        estateVal,
        hasShakir: !!shakirCard,
        hasAvatar: !!avatarCard
      };
    });

    assert(postCommitData.savedName === 'GreenO2', `Custom farm name saved: "${postCommitData.savedName}"`);
    assert(postCommitData.scoreboardTitle.includes('GreenO2 Scoreboard'), `Scoreboard header reflects custom name: "${postCommitData.scoreboardTitle}"`);
    assert(!postCommitData.scoreboardTitle.toLowerCase().includes('alpenhof'), 'Scoreboard title does NOT contain Alpenhof');
    assert(postCommitData.estateVal === 'GreenO2', `Estate card reflects custom name: "${postCommitData.estateVal}"`);
    assert(!postCommitData.hasShakir, 'Shakir OxyEco Forger card is removed from farm scoreboard');
    assert(postCommitData.hasAvatar, 'Player Avatar card is displayed on farm scoreboard');

    // =========================================================================
    // TEST 5: Base Farm Storage Lock Icon Bug Fix
    // =========================================================================
    console.log('\n--- 5. Testing Base Farm Storage Lock Icon Rendering ---');
    const storageHtmlData = await page.evaluate(() => {
      // Simulate state where storage is unbuilt and road is not built
      if (typeof state !== 'undefined') {
        state.storage = { built: false, building: false, stored: 0, capacity: 200 };
        if (state.buildings && state.buildings.road) {
          state.buildings.road.built = false;
        }
      }
      const spotHtml = typeof window.storageSpotHtml === 'function' ? window.storageSpotHtml() : '';

      // Check whether an HTML tag was placed inside SVG <text>
      const hasCorruptTextSvg = spotHtml.includes('<text x="0" y="5.5"') && spotHtml.includes('<span');
      const hasIsoLockSvg = spotHtml.includes('iso-3d-lock') || spotHtml.includes('iso-3d-lock-svg');
      const hasNeedsRoadPill = spotHtml.includes('Needs Road');

      return {
        spotHtmlLength: spotHtml.length,
        hasCorruptTextSvg,
        hasIsoLockSvg,
        hasNeedsRoadPill
      };
    });

    assert(!storageHtmlData.hasCorruptTextSvg, 'Storage spot SVG contains NO HTML <span> inside SVG <text>');
    assert(storageHtmlData.hasNeedsRoadPill, 'Storage spot marker clearly displays "Needs Road" lock pill');
    assert(storageHtmlData.hasIsoLockSvg, 'Storage spot cleanly renders 3D isometric lock vector');

    console.log('\n=======================================================');
    if (failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Guest Base Farm, Storage Lock & Scoreboard verified cleanly.');
    } else {
      console.error(`💥 ${failed} TEST(S) FAILED!`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
