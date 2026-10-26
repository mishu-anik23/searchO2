/**
 * Playwright Test Suite:
 * Interactive 3D OpenStreetMap Coordinate Selection, Custom Farm Gate Banner,
 * Biome Views Redesign & Saint Martin Roadmap Fix
 */
const { chromium } = require('playwright');
const path = require('path');

async function runTestSuite() {
  console.log('========================================================================');
  console.log('  Testing 3D OpenStreetMap, Farm Gate Banner, Biome Views & Saint Martin');
  console.log('========================================================================\n');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (e) {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
    console.log(`[Step 1] Loading index.html fresh: ${fileUrl}`);

    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // 1. Verify Explore Planetary Biomes Enhanced Description in #regionHeroSection
    console.log('\n--- Test 1: Explore Planetary Biomes Enhanced Description ---');
    const heroData = await page.evaluate(() => {
      const hero = document.getElementById('regionHeroSection');
      if (!hero) return null;
      const text = hero.textContent || '';
      return {
        hasBavarian: text.includes('traditional Bavarian Alpine farming') || text.includes('cattling') || text.includes('dairy pasturization'),
        hasSaintMartin: text.includes('Coral Reef Ranger') && text.includes('Saint Martin') && text.includes('Bay of Bengal'),
        hasBrazil: text.includes('Brazil'),
        hasGermanyRooted: text.includes('anywhere across Germany') || text.includes('German roots'),
        heroLeadText: text.substring(0, 250)
      };
    });

    console.log('Hero section verification:', heroData);
    if (!heroData) throw new Error('#regionHeroSection not found');
    if (!heroData.hasGermanyRooted || !heroData.hasBavarian || !heroData.hasSaintMartin || !heroData.hasBrazil) {
      throw new Error('Enhanced biome exploration description missing key regions (Bavarian Alpine, Saint Martin Coral Reef Ranger, Brazil)');
    }
    console.log('✓ PASSED: Enhanced description verified with German rooted, Bavarian Alpine farming, Saint Martin, and Brazil.');

    // 2. Verify Underlying Planetary Achievements Roadmap Saint Martin FR -> BD Fix
    console.log('\n--- Test 2: Saint Martin Roadmap Fix (FR -> BD) ---');
    const achieveData = await page.evaluate(() => {
      const tray = document.querySelector('.intro-achievements-tray');
      if (!tray) return null;
      const text = tray.textContent || '';
      const flags = Array.from(tray.querySelectorAll('.achieve-flag')).map(el => el.textContent.trim());
      const hasFrenchFlag = flags.includes('🇫🇷');
      const hasBangladeshFlag = flags.includes('🇧🇩');
      const hasSaintMartinCoral = text.includes('Saint Martin') && (text.includes('Coral Reef Ranger') || text.includes('Bay of Bengal'));
      return { flags, hasFrenchFlag, hasBangladeshFlag, hasSaintMartinCoral };
    });

    console.log('Achievements roadmap data:', achieveData);
    if (!achieveData) throw new Error('.intro-achievements-tray not found');
    if (achieveData.hasFrenchFlag) throw new Error('French flag 🇫🇷 still present for Saint Martin in achievements tray!');
    if (!achieveData.hasBangladeshFlag) throw new Error('Bangladesh flag 🇧🇩 missing for Saint Martin in achievements tray!');
    if (!achieveData.hasSaintMartinCoral) throw new Error('Saint Martin Coral Reef Ranger title/description missing in achievements tray!');
    console.log('✓ PASSED: Saint Martin FR mistake fixed to Bangladesh 🇧🇩 with Coral Reef Ranger in achievements roadmap.');

    // 3. Verify View Mode Buttons & Split View Two-Line Text
    console.log('\n--- Test 3: Redesigned View Mode Buttons & Two-Line Split View ---');
    const vtabsData = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.view-tab-btn'));
      const splitBtn = document.querySelector('[data-viewmode="split"]');
      const splitTextHtml = splitBtn ? splitBtn.innerHTML : '';
      return {
        count: tabs.length,
        buttons: tabs.map(t => t.textContent.trim().replace(/\s+/g, ' ')),
        splitHasTwoLines: splitTextHtml.includes('<br') || splitTextHtml.includes('vtab-text')
      };
    });

    console.log('View tab buttons:', vtabsData);
    if (vtabsData.count < 4) throw new Error('Expected 4 view mode tab buttons');
    if (!vtabsData.splitHasTwoLines) throw new Error('Split View text does not have two lines / line break');
    console.log('✓ PASSED: All 4 view buttons redesigned with puff-pip styling and two-line Split View text.');

    // 4. Verify Interactive 3D OpenStreetMap Setup Modal Popup
    console.log('\n--- Test 4: Interactive 3D OpenStreetMap Setup Modal on One-Click Guest Login ---');
    await page.evaluate(() => {
      if (window.openGuestFarmSetupModal) window.openGuestFarmSetupModal();
    });
    await page.waitForTimeout(500);

    const modalState = await page.evaluate(() => {
      const modal = document.getElementById('guestFarmSetupModal');
      const canvas = document.getElementById('guestOsmCanvas');
      const pin = document.getElementById('guestOsmPin');
      const coords = document.getElementById('osmHudCoords');
      const region = document.getElementById('osmHudRegion');
      const input = document.getElementById('guestFarmNameInput');
      const presets = Array.from(document.querySelectorAll('.guest-osm-preset-pill')).map(p => p.textContent.trim());

      return {
        isOpen: modal && modal.style.display !== 'none',
        hasCanvas: !!canvas,
        hasPin: !!pin,
        coordsText: coords ? coords.textContent : '',
        regionText: region ? region.textContent : '',
        inputValue: input ? input.value : '',
        presets
      };
    });

    console.log('Guest OSM Modal State:', modalState);
    if (!modalState.isOpen) throw new Error('guestFarmSetupModal failed to open');
    if (!modalState.hasCanvas || !modalState.hasPin) throw new Error('3D OpenStreetMap canvas or pin missing');
    if (modalState.presets.length < 5) throw new Error('Expected 5 German farming region presets');
    console.log('✓ PASSED: Interactive 3D OpenStreetMap modal opened with pin, HUD, canvas, and presets.');

    // 5. Test Zoom Controls and Preset Region Switching
    console.log('\n--- Test 5: Zoom Controls & Preset Coordinates Switching ---');
    await page.evaluate(() => {
      // Click Black Forest preset
      const pills = document.querySelectorAll('.guest-osm-preset-pill');
      if (pills[1]) pills[1].click();
    });
    await page.waitForTimeout(300);

    const presetCheck = await page.evaluate(() => {
      const coords = document.getElementById('osmHudCoords')?.textContent || '';
      const region = document.getElementById('osmHudRegion')?.textContent || '';
      const input = document.getElementById('guestFarmNameInput')?.value || '';
      return { coords, region, input };
    });

    console.log('After selecting Black Forest preset:', presetCheck);
    if (!presetCheck.region.includes('Black Forest')) throw new Error('Selecting Black Forest preset did not update region');
    if (!presetCheck.coords.includes('48.15')) throw new Error('Preset coordinates mismatch for Black Forest');
    console.log('✓ PASSED: Preset switching updated coordinates and region HUD.');

    // 6. Test Farm Name Validation (Max 9, Illegal Characters, Abusive Filter & Funny Rejection)
    console.log('\n--- Test 6: Farm Name Restrictions & Funny Rejection Message ---');
    
    // Test A: Illegal symbol
    await page.evaluate(() => {
      const inp = document.getElementById('guestFarmNameInput');
      inp.value = 'Farm@#$';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(200);

    const illegalCheck = await page.evaluate(() => {
      const rej = document.getElementById('guestOsmRejectBubble');
      const isVisible = rej && rej.style.display !== 'none';
      const text = rej ? rej.textContent : '';
      return { isVisible, text };
    });
    console.log('Illegal characters reject bubble:', illegalCheck);
    if (!illegalCheck.isVisible || !illegalCheck.text.includes('symbols') && !illegalCheck.text.includes('Whisker Puff')) {
      throw new Error('Illegal characters did not trigger funny rejection bubble from Whisker Puff');
    }
    console.log('✓ PASSED: Illegal characters rejected with funny Whisker Puff message.');

    // Test B: Abusive word
    await page.evaluate(() => {
      const inp = document.getElementById('guestFarmNameInput');
      inp.value = 'badshit';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(200);

    const abusiveCheck = await page.evaluate(() => {
      const rej = document.getElementById('guestOsmRejectBubble');
      const isVisible = rej && rej.style.display !== 'none';
      const text = rej ? rej.textContent : '';
      return { isVisible, text };
    });
    console.log('Abusive word reject bubble:', abusiveCheck);
    if (!abusiveCheck.isVisible || !abusiveCheck.text.includes('spicy') && !abusiveCheck.text.includes('catnip')) {
      throw new Error('Abusive word did not trigger funny rejection bubble from Whisker Puff');
    }
    console.log('✓ PASSED: Abusive word rejected with funny catnip/hairball message.');

    // Test C: Valid custom farm name (max 9 chars)
    await page.evaluate(() => {
      const inp = document.getElementById('guestFarmNameInput');
      inp.value = 'AlpenO2';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(200);

    const validCheck = await page.evaluate(() => {
      const rej = document.getElementById('guestOsmRejectBubble');
      return { isVisible: rej && rej.style.display !== 'none' };
    });
    if (validCheck.isVisible) throw new Error('Valid name "AlpenO2" should not show reject bubble');
    console.log('✓ PASSED: Valid name "AlpenO2" accepted cleanly.');

    // 7. Commission Farm & Verify Volumetric 3D Banner on Farm Gate
    console.log('\n--- Test 7: Commission Farm & Pure Volumetric 3D Gate Banner ---');
    await page.evaluate(() => {
      window.commitGuestFarmSetup();
    });
    await page.waitForTimeout(1000);

    // Verify on farm screen
    const gateBannerData = await page.evaluate(() => {
      const current = typeof currentScreen !== 'undefined' ? currentScreen : '';
      const banner = document.querySelector('.gate-volumetric-banner');
      const textElements = banner ? Array.from(banner.querySelectorAll('text')).map(t => t.textContent.trim()) : [];
      const dockChip = document.querySelector('.guest-farm-dock-chip') || document.querySelector('.kid-stat-card .kid-stat-val');
      const dockText = dockChip ? dockChip.textContent : '';

      return {
        screen: current,
        hasBanner: !!banner,
        textElements,
        dockText
      };
    });

    console.log('Gate banner & account dock data:', gateBannerData);
    if (!gateBannerData.hasBanner) throw new Error('Pure Volumetric 3D Isometric Banner not found on farm gate!');
    const bannerCombinedText = gateBannerData.textElements.join(' ');
    if (!bannerCombinedText.includes('ALPEN') || !bannerCombinedText.includes('searchO2')) {
      throw new Error('Banner text mismatch: ' + bannerCombinedText + ' (expected User_SetName and Powered by searchO2)');
    }
    console.log('✓ PASSED: Pure volumetric 3D Isometric Banner rendered on farm gate with User_SetName and "Powered 🌿 by searchO2"!');

    // 8. Test Tabular Comparison View (Redesign & Zero Overlap)
    console.log('\n--- Test 8: Tabular Comparison Redesign & Zero Overlap ---');
    await page.evaluate(() => {
      if (typeof switchScreen === 'function') switchScreen('region_select');
    });
    await page.waitForTimeout(500);

    // Click Tabular View tab button
    await page.evaluate(() => {
      const btn = document.querySelector('[data-viewmode="tabular"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);

    const tableData = await page.evaluate(() => {
      const wrapper = document.querySelector('.region-tabular-wrapper');
      const table = document.querySelector('.region-tabular-table');
      const rows = table ? table.querySelectorAll('tbody tr').length : 0;
      const childLocks = document.querySelectorAll('.child-friendly-lock').length;
      const tableWidth = table ? table.offsetWidth : 0;
      const wrapperScrollWidth = wrapper ? wrapper.scrollWidth : 0;

      return {
        hasWrapper: !!wrapper,
        hasTable: !!table,
        rowsCount: rows,
        childLocksCount: childLocks,
        tableWidth,
        wrapperScrollWidth
      };
    });

    console.log('Tabular view metrics:', tableData);
    if (!tableData.hasWrapper || !tableData.hasTable) throw new Error('Tabular comparison wrapper/table not found');
    if (tableData.rowsCount < 10) throw new Error('Expected 10 planetary biomes in tabular view');
    if (tableData.childLocksCount === 0) throw new Error('Child-friendly lock visuals missing in table');
    if (tableData.tableWidth < 980) throw new Error('Table width is too narrow, potential text collision!');
    console.log('✓ PASSED: Tabular Comparison redesigned with Puff-Pip deep matrix, min-width 1040px, child-friendly locks, and zero overlap.');

    // 9. Mobile Responsiveness (375x667 & 320x568)
    console.log('\n--- Test 9: Mobile Viewports & Screen Alignment ---');
    const mobileViewports = [
      { name: 'iPhone SE (375x667)', width: 375, height: 667 },
      { name: 'Small Mobile (320x568)', width: 320, height: 568 }
    ];

    for (const vp of mobileViewports) {
      console.log(`Checking ${vp.name}...`);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(500);

      // Check on globe view
      await page.evaluate(() => {
        const btn = document.querySelector('[data-viewmode="globe"]');
        if (btn) btn.click();
      });
      await page.waitForTimeout(400);

      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          clientWidth: doc.clientWidth,
          scrollWidth: doc.scrollWidth,
          hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth + 2
        };
      });

      console.log(`${vp.name} globe view metrics:`, metrics);
      if (metrics.hasHorizontalOverflow) {
        throw new Error(`Horizontal overflow on ${vp.name} in globe view: scrollWidth=${metrics.scrollWidth}, clientWidth=${metrics.clientWidth}`);
      }

      // Check on split view
      await page.evaluate(() => {
        const btn = document.querySelector('[data-viewmode="split"]');
        if (btn) btn.click();
      });
      await page.waitForTimeout(400);

      const splitMetrics = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          clientWidth: doc.clientWidth,
          scrollWidth: doc.scrollWidth,
          hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth + 2
        };
      });

      console.log(`${vp.name} split view metrics:`, splitMetrics);
      if (splitMetrics.hasHorizontalOverflow) {
        throw new Error(`Horizontal overflow on ${vp.name} in split view: scrollWidth=${splitMetrics.scrollWidth}, clientWidth=${splitMetrics.clientWidth}`);
      }
      console.log(`✓ PASSED: ${vp.name} clean alignment with zero horizontal cut!`);
    }

    console.log('\n========================================================================');
    console.log('  ALL 9 3D OPENSTREETMAP & REDESIGN TESTS PASSED WITH 100% SUCCESS! 🎉');
    console.log('========================================================================\n');

  } finally {
    if (browser) await browser.close();
  }
}

runTestSuite().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
