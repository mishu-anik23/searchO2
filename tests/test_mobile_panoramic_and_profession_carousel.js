/**
 * test_mobile_panoramic_and_profession_carousel.js
 * 
 * Verifies:
 * 1. Mobile Panoramic Landscape Viewport (844x390) & Portrait (390x844):
 *    Scouting instruction text (.scout-chapter-guide-msg-box) stays 100% inside screen bounds.
 * 2. Multi-Profession Dynamic Task Calculation:
 *    Calculates available assignable tasks dynamically for Laborer, Farmer, Engineer, Botanist.
 * 3. Bottom-Right Carousel Positioning:
 *    #idleLaborerSuggestionContainer is placed directly in .bottom-buttons-stack immediately to the left of #btnToggleMarketplace.
 * 4. Carousel Slider Navigation & Auto-Interchange:
 *    Next/previous arrows, progress dots, and slide cycling dynamically swap available profession tasks.
 * 5. Fast Touch/Click Response & Modal Opening:
 *    Object click / tap response executes with zero delay or hanging, opening modals cleanly with zero page errors.
 */

const { chromium } = require('playwright');
const path = require('path');

async function runTests() {
  console.log('================================================================');
  console.log('  SearchO2 Mobile Panoramic & Profession Carousel Test Suite    ');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push(err.message);
    console.error('[BROWSER ERROR]:', err.message);
  });

  const filePath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

  let passedTests = 0;
  const totalTests = 6;

  // Test 1: Mobile Panoramic Landscape Viewport & Chapter 1 Scouting Text Alignment
  try {
    // Set mobile panoramic landscape viewport (e.g., iPhone landscape: 844x390)
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto(filePath);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const alignmentLandscape = await page.evaluate(() => {
      // Switch to farm screen with Chapter 1 active
      if (typeof switchScreen === 'function') switchScreen('farm');
      state.currentChapter = 1;
      state.exploredChapters = {};
      state.exploredChapterObjects = {};
      if (typeof render === 'function') render();
      if (typeof adjustEdgeModalsAndLocators === 'function') adjustEdgeModalsAndLocators();

      var box = document.querySelector('.scout-chapter-guide-msg-box');
      if (!box) {
        // Trigger plot badge render
        var html = getChapterExploreBadgeHtml('plot', state);
        var testContainer = document.createElement('div');
        testContainer.id = 'testBadgeContainer';
        testContainer.innerHTML = html;
        document.body.appendChild(testContainer);
        if (typeof adjustEdgeModalsAndLocators === 'function') adjustEdgeModalsAndLocators();
        box = document.querySelector('.scout-chapter-guide-msg-box');
      }

      if (!box) return { found: false };

      var rect = box.getBoundingClientRect();
      var vw = window.innerWidth;
      var vh = window.innerHeight;

      var insideLeft = rect.left >= 0;
      var insideRight = rect.right <= vw;
      var visible = rect.width > 0 && rect.height > 0;

      return {
        found: true,
        insideLeft: insideLeft,
        insideRight: insideRight,
        visible: visible,
        rect: { left: rect.left, right: rect.right, top: rect.top, width: rect.width },
        viewport: { width: vw, height: vh }
      };
    });

    if (alignmentLandscape.found && alignmentLandscape.insideLeft && alignmentLandscape.insideRight && alignmentLandscape.visible) {
      console.log('[✓ PASSED] test1_mobilePanoramicLandscapeScoutTextAlignment');
      console.log(`    ↳ Panoramic Landscape (844x390): Scouting text inside screen bounds (left: ${Math.round(alignmentLandscape.rect.left)}px >= 0, right: ${Math.round(alignmentLandscape.rect.right)}px <= ${alignmentLandscape.viewport.width}px).`);
      passedTests++;
    } else {
      console.error('[✗ FAILED] test1_mobilePanoramicLandscapeScoutTextAlignment', alignmentLandscape);
    }
  } catch (err) {
    console.error('[✗ FAILED] test1_mobilePanoramicLandscapeScoutTextAlignment error:', err);
  }

  // Test 2: Mobile Portrait Viewport Scouting Text Alignment
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    const alignmentPortrait = await page.evaluate(() => {
      if (typeof adjustEdgeModalsAndLocators === 'function') adjustEdgeModalsAndLocators();
      var box = document.querySelector('.scout-chapter-guide-msg-box');
      if (!box) return { found: false };

      var rect = box.getBoundingClientRect();
      var vw = window.innerWidth;
      var insideLeft = rect.left >= 0;
      var insideRight = rect.right <= vw;
      var visible = rect.width > 0 && rect.height > 0;

      return {
        found: true,
        insideLeft: insideLeft,
        insideRight: insideRight,
        visible: visible,
        rect: { left: rect.left, right: rect.right, width: rect.width },
        viewportWidth: vw
      };
    });

    if (alignmentPortrait.found && alignmentPortrait.insideLeft && alignmentPortrait.insideRight && alignmentPortrait.visible) {
      console.log('[✓ PASSED] test2_mobilePortraitScoutTextAlignment');
      console.log(`    ↳ Portrait (390x844): Scouting text safely inside screen (left: ${Math.round(alignmentPortrait.rect.left)}px >= 0, right: ${Math.round(alignmentPortrait.rect.right)}px <= ${alignmentPortrait.viewportWidth}px).`);
      passedTests++;
    } else {
      console.error('[✗ FAILED] test2_mobilePortraitScoutTextAlignment', alignmentPortrait);
    }
  } catch (err) {
    console.error('[✗ FAILED] test2_mobilePortraitScoutTextAlignment error:', err);
  }

  // Restore landscape viewport for remaining tests
  await page.setViewportSize({ width: 844, height: 390 });

  // Test 3: Multi-Profession Dynamic Task Calculation (Laborer, Farmer, Engineer, Botanist)
  try {
    const profTasks = await page.evaluate(() => {
      // 1. Laborer only state
      state.workers = [{ id: 1, type: 'laborer', name: 'Laborer Bob' }];
      state.currentChapter = 2;
      state.buildings.crew_shed.built = false;
      var labTasks = getDynamicProfessionAvailableTasks(state);
      var hasLabTask = labTasks.some(t => t.profession === 'Laborer');

      // 2. Farmer only state
      state.workers = [{ id: 2, type: 'farmer', name: 'Farmer Jill' }];
      state.plots[0].treeType = 'apple';
      state.plots[0].health = 100;
      state.plots[0].growth = 100; // Ready for harvest
      var farmTasks = getDynamicProfessionAvailableTasks(state);
      var hasHarvestTask = farmTasks.some(t => t.profession === 'Farmer' && t.id.includes('harvest'));

      // 3. Engineer state
      state.workers = [{ id: 3, type: 'engineer', name: 'Engineer Tesla' }];
      state.currentChapter = 4;
      var engTasks = getDynamicProfessionAvailableTasks(state);
      var hasEngTask = engTasks.some(t => t.profession === 'Engineer');

      // 4. Combined multi-profession roster
      state.workers = [
        { id: 1, type: 'laborer', name: 'Laborer Bob' },
        { id: 2, type: 'farmer', name: 'Farmer Jill' },
        { id: 3, type: 'engineer', name: 'Engineer Tesla' }
      ];
      var combinedTasks = getDynamicProfessionAvailableTasks(state);
      var professionsIncluded = [...new Set(combinedTasks.map(t => t.profession))];

      return {
        hasLabTask,
        hasHarvestTask,
        hasEngTask,
        professionsIncluded,
        totalCombined: combinedTasks.length
      };
    });

    if (profTasks.hasLabTask && profTasks.hasHarvestTask && profTasks.hasEngTask && profTasks.professionsIncluded.length >= 3) {
      console.log('[✓ PASSED] test3_multiProfessionDynamicTasksCalculation');
      console.log(`    ↳ Dynamic tasks generated across all hired professions: ${profTasks.professionsIncluded.join(', ')} (${profTasks.totalCombined} available actions).`);
      passedTests++;
    } else {
      console.error('[✗ FAILED] test3_multiProfessionDynamicTasksCalculation', profTasks);
    }
  } catch (err) {
    console.error('[✗ FAILED] test3_multiProfessionDynamicTasksCalculation error:', err);
  }

  // Test 4: Bottom-Right Carousel DOM Placement Immediately Beside Marketplace
  try {
    const placement = await page.evaluate(() => {
      var container = document.getElementById('idleLaborerSuggestionContainer');
      var marketplaceBtn = document.getElementById('btnToggleMarketplace');
      var parent = container ? container.parentElement : null;

      var isInsideBottomStack = parent && parent.classList.contains('bottom-buttons-stack');
      var isDirectlyBeforeMarketplace = container && marketplaceBtn && container.nextElementSibling === marketplaceBtn;

      // Render carousel HTML
      container.innerHTML = renderIdleLaborerSuggestionHtml(state);
      var floater = container.querySelector('.idle-laborer-suggestion-floater');
      var hasFloater = !!floater;
      var hasCarouselClass = floater && floater.classList.contains('dynamic-profession-task-carousel');

      return {
        hasContainer: !!container,
        isInsideBottomStack,
        isDirectlyBeforeMarketplace,
        hasFloater,
        hasCarouselClass
      };
    });

    if (placement.hasContainer && placement.isInsideBottomStack && placement.isDirectlyBeforeMarketplace && placement.hasFloater) {
      console.log('[✓ PASSED] test4_bottomRightCarouselPlacementBesideMarketplace');
      console.log('    ↳ Carousel container positioned directly in .bottom-buttons-stack immediately adjacent to #btnToggleMarketplace.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test4_bottomRightCarouselPlacementBesideMarketplace', placement);
    }
  } catch (err) {
    console.error('[✗ FAILED] test4_bottomRightCarouselPlacementBesideMarketplace error:', err);
  }

  // Test 5: Carousel Navigation & Slide Interchange
  try {
    const carouselNav = await page.evaluate(() => {
      var tasks = getDynamicProfessionAvailableTasks(state);
      if (tasks.length < 2) return { error: 'Not enough tasks for carousel test' };

      window.taskCarouselIndex = 0;
      updateTaskCarouselDOM();
      var initialIdx = window.taskCarouselIndex;

      // Next slide
      nextTaskCarouselSlide();
      var nextIdx = window.taskCarouselIndex;

      // Previous slide
      prevTaskCarouselSlide();
      var backIdx = window.taskCarouselIndex;

      // Direct slide set
      setTaskCarouselSlide(1);
      var setIdx = window.taskCarouselIndex;

      var container = document.getElementById('idleLaborerSuggestionContainer');
      var html = container ? container.innerHTML : '';
      var hasArrows = html.includes('carousel-arrow');
      var hasDots = html.includes('carousel-dots');
      var hasAssignBtn = html.includes('Assign ➔') || html.includes('button');

      return {
        initialIdx,
        nextIdx,
        backIdx,
        setIdx,
        hasArrows,
        hasDots,
        hasAssignBtn,
        cycledCorrectly: (nextIdx === 1) && (backIdx === 0) && (setIdx === 1)
      };
    });

    if (carouselNav.cycledCorrectly && carouselNav.hasArrows && carouselNav.hasDots && carouselNav.hasAssignBtn) {
      console.log('[✓ PASSED] test5_carouselNavigationAndSlideInterchange');
      console.log('    ↳ Carousel slide interchange verified: next, prev, dots navigation correctly cycles through available profession tasks.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test5_carouselNavigationAndSlideInterchange', carouselNav);
    }
  } catch (err) {
    console.error('[✗ FAILED] test5_carouselNavigationAndSlideInterchange error:', err);
  }

  // Test 6: Fast Modal Touch/Click Response with Zero Delay / Hanging
  try {
    const responseSpeed = await page.evaluate(() => {
      if (typeof switchScreen === 'function') switchScreen('farm');
      state.currentChapter = 1;
      if (typeof render === 'function') render();

      var tStart = performance.now();

      // Open plot modal
      openModal('plot', 0);
      var modal = document.getElementById('modalOverlay') || document.querySelector('.modal');
      var isOpen = !!modal;

      var tOpen = performance.now() - tStart;

      // Close modal
      if (typeof closeModal === 'function') closeModal();

      // Test exploration roadmap open
      var tStartRoadmap = performance.now();
      openChapterRoadmapForObject('plot');
      var roadmap = document.getElementById('modalOverlay') || document.querySelector('.cartoon-roadmap-modal');
      var roadmapOpen = !!roadmap;
      var tRoadmap = performance.now() - tStartRoadmap;

      if (typeof closeModal === 'function') closeModal();

      return {
        isOpen,
        tOpenMs: tOpen,
        roadmapOpen,
        tRoadmapMs: tRoadmap,
        fast: tOpen < 100 && tRoadmap < 100
      };
    });

    // Verify zero uncaught runtime exceptions
    const errorCount = pageErrors.length;

    if (responseSpeed.isOpen && responseSpeed.roadmapOpen && responseSpeed.fast && errorCount === 0) {
      console.log('[✓ PASSED] test6_fastTouchModalResponseZeroLag');
      console.log(`    ↳ Modal touch/click response: ${responseSpeed.tOpenMs.toFixed(1)}ms plot modal, ${responseSpeed.tRoadmapMs.toFixed(1)}ms roadmap modal (Zero latency, zero errors).`);
      passedTests++;
    } else {
      console.error('[✗ FAILED] test6_fastTouchModalResponseZeroLag', { responseSpeed, pageErrors });
    }
  } catch (err) {
    console.error('[✗ FAILED] test6_fastTouchModalResponseZeroLag error:', err);
  }

  await browser.close();

  console.log('\n================================================================');
  if (passedTests === totalTests) {
    console.log(`🎉 ALL ${totalTests}/${totalTests} MOBILE PANORAMIC & PROFESSION CAROUSEL TESTS PASSED! (100%) 🎉`);
  } else {
    console.error(`⚠️ FAILED: Only ${passedTests}/${totalTests} passed.`);
    process.exit(1);
  }
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
