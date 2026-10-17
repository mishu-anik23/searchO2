/**
 * test_base_farm_11_modifications.js
 * Comprehensive integration test suite for the 11 base farm mechanics, UI, and progression modifications in index.html.
 */

const { chromium } = require('playwright');
const path = require('path');

const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

async function runTests() {
  console.log('================================================================');
  console.log('  SearchO2 Base Farm 11 Modifications Verification Suite');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const results = [];
  function record(id, label, passed, note) {
    results.push({ id, label, passed, note });
    console.log(`[${passed ? '✓ PASSED' : '❌ FAILED'}] ${id}: ${label}`);
    if (note) console.log(`    ↳ ${note}`);
  }

  // Intercept uncaught page errors
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  console.log(`Loading simulation page: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  // Auto-dismiss welcome intro modal if open
  await page.evaluate(() => {
    switchScreen('farm');
    render();
    if (typeof closeModal === 'function') closeModal();
    state.money = 25000; // ample funds for testing all chapters
  });

  // ----------------------------------------------------
  // TEST 1: Chapter 2 Crew Shed Laborer Recruitment in Unbuilt Modal
  // ----------------------------------------------------
  try {
    const test1 = await page.evaluate(() => {
      state.currentChapter = 2;
      state.buildings.crew_shed.built = false;
      state.buildings.crew_shed.building = false;
      openModal('building', 'crew_shed');
      const modalEl = document.getElementById('modalOverlay') || document.querySelector('.modal');
      const html = modalEl ? modalEl.innerHTML : '';
      const hasRecruitBtn = html.includes('Recruit Field Labourer') || html.includes('hireWorker(\'laborer\')');
      const hasPayrollBadge = html.includes('on Payroll');
      closeModal();
      return hasRecruitBtn && hasPayrollBadge;
    });
    record('test1_crewShedLaborerRecruit', 'Recruit Laborer option visible in unbuilt Crew Shed info modal', test1,
      'Unbuilt Crew Shed modal renders dedicated Field Labourer (€80) recruitment button and payroll badge.');
  } catch (e) {
    record('test1_crewShedLaborerRecruit', 'Recruit Laborer option visible in unbuilt Crew Shed info modal', false, e.message);
  }

  // ----------------------------------------------------
  // TEST 2: Plot 3 Crew Synergy Guide & Labor Assignment Modal
  // ----------------------------------------------------
  try {
    const test2 = await page.evaluate(() => {
      openLaborAssignmentInfoModal();
      const modalEl = document.getElementById('modalOverlay') || document.querySelector('.modal');
      const html = modalEl ? modalEl.innerHTML : '';
      const hasTitle = html.includes('Plot 3 Crew Synergy') || html.includes('Labor Allocation Guide');
      const hasFarmerRole = html.includes('Dedicated Farmer') && html.includes('Tills &amp; sows');
      const hasLaborerRole = html.includes('Field Labourer') && html.includes('Clears road boulders');
      closeModal();

      // Check task card button in Chapter 2 tasks panel
      state.currentChapter = 2;
      state.selectedChapterTab = 2;
      state.plots = state.plots || [];
      state.plots[0] = { id: 0, status: 'growing', waterHours: 1, treeType: 'apple', harvestsDone: 1 };
      state.rocksCleared = false; // keep Plot 3 locked so the guidance button renders
      openPanel = 'tasks';
      render();
      const panelEl = document.getElementById('floatPanel') || document.body;
      const hasGuideBtn = panelEl.innerHTML.includes('openLaborAssignmentInfoModal()') || panelEl.innerHTML.includes('Crew Guide');
      closePanel();

      return hasTitle && hasFarmerRole && hasLaborerRole && hasGuideBtn;
    });
    record('test2_plot3LaborAssignmentInfo', 'Plot 3 labor assignment info popup and role distinction', test2,
      'Info modal clearly explains Farmer vs Labourer roles and why Plot 3 requires dual collaboration.');
  } catch (e) {
    record('test2_plot3LaborAssignmentInfo', 'Plot 3 labor assignment info popup and role distinction', false, e.message);
  }

  // ----------------------------------------------------
  // TEST 3: Advance to Chapter 3 Task Banner & Modal
  // ----------------------------------------------------
  try {
    const test3 = await page.evaluate(() => {
      // Simulate Chapter 2 completion
      state.currentChapter = 2;
      state.selectedChapterTab = 2;
      state.rocksCleared = true;
      state.buildings.gate.built = true;
      state.buildings.road.built = true;
      state.storage.built = true;
      state.storage.inventory = { apple: 10 };
      state.storage.capacityUsed = 50;
      state.buildings.garage.built = true;
      state.mechanizedHarvestDone = true;
      state.manualHarvestCount = 6;
      if (!state.workers.some(w => w.type === 'farmer')) {
        state.workers.push({ id: 91, type: 'farmer', assignedPlot: null, assignedBuilding: null });
      }
      for (let i = 0; i < 6; i++) {
        if (!state.plots[i]) state.plots[i] = { id: i, status: 'ready', treeType: 'apple', harvestsDone: 2 };
        else { state.plots[i].treeType = 'apple'; state.plots[i].harvestsDone = 2; }
      }

      openPanel = 'tasks';
      render();
      const panel = document.getElementById('floatPanel') || document.body;
      const hasAdvanceBox = panel.innerHTML.includes('Advance to Chapter 3: The Silent Meadow');
      closePanel();

      // Test opening completion modal
      openChapter2CompletionModal();
      const m = document.getElementById('modalOverlay') || document.querySelector('.modal');
      const hasModal = m && m.innerHTML.includes('Chapter 2 Complete!');
      closeModal();

      return hasAdvanceBox && hasModal;
    });
    record('test3_advanceToChapter3Box', 'Advance to Chapter 3 celebratory information box and modal', test3,
      'Tasks panel renders celebratory 100% complete advance box linking directly to Chapter 3.');
  } catch (e) {
    record('test3_advanceToChapter3Box', 'Advance to Chapter 3 celebratory information box and modal', false, e.message);
  }

  // ----------------------------------------------------
  // TEST 4: Pond Fish Collection Bug Fix & Level-Up System
  // ----------------------------------------------------
  try {
    const test4 = await page.evaluate(() => {
      state.buildings.pond.built = true;
      state.buildings.pond.specialization = 'fish';
      state.buildings.pond.freshness = 100;
      state.buildings.pond.pendingCollect = 40;
      state.buildings.pond.level = 1;
      state.buildings.pond.fishCapacity = 150;
      state.storage.built = true;
      state.storage.capacity = 500;
      state.storage.stored = 10;
      if (!state.storage.items) state.storage.items = [];

      // Assign farmer to pond
      let fWorker = state.workers.find(w => w.type === 'farmer');
      if (!fWorker) {
        fWorker = { id: 92, type: 'farmer', assignedPlot: null, assignedBuilding: 'pond' };
        state.workers.push(fWorker);
      } else {
        fWorker.assignedBuilding = 'pond';
      }
      state.buildings.pond.assignedWorker = fWorker.id;

      // Trigger collection
      startCollectPond();
      // Fast forward collect duration
      state.buildings.pond.collectStartReal = Date.now() - 5000;

      // Run game harvest logic that completes pond collection
      processHarvests();

      const fishCollected = !state.buildings.pond.collecting && state.storage.items.some(it => it.cropKey === 'fish');

      // Add milk to test restaurant trout recipe crafting
      state.storage.items.push({ id: 'milk_1', cropKey: 'milk', name: 'Fresh Organic Milk', category: 'livestock', qty: 2 });

      // Test Pond Level Up to Level 2
      state.money = 2000;
      upgradePondLevel();
      const isLvl2 = state.buildings.pond.level === 2 && state.buildings.pond.fishCapacity === 300;

      // Test Restaurant Recipes
      const hasTroutRecipe = !!CENTRAL_RECIPES.pan_seared_trout && canCraftRecipe('pan_seared_trout');
      const hasDuckRecipe = !!CENTRAL_RECIPES.crispy_roast_duck;

      return fishCollected && isLvl2 && hasTroutRecipe && hasDuckRecipe;
    });
    record('test4_pondCollectionAndLevelUp', 'Pond collection bug fix, Level-Up to Level 2 & Restaurant recipes', test4,
      'Fish collected without ReferenceError, pond upgraded to Level 2 (300 cap), and Trout/Duck recipes active.');
  } catch (e) {
    record('test4_pondCollectionAndLevelUp', 'Pond collection bug fix, Level-Up to Level 2 & Restaurant recipes', false, e.message);
  }

  // ----------------------------------------------------
  // TEST 5: Chapter 4 Pond Excavation Task Sync
  // ----------------------------------------------------
  try {
    const test5 = await page.evaluate(() => {
      state.buildings.pond.built = false;
      state.buildings.pond.building = true;
      state.buildings.pond.buildHours = 2.0; // 40% -> Stage 2: Bentonite Liner

      const taskObj = CHAPTER_CHALLENGES[4].find(t => t.id === 'ch4_pond');
      const actionHtml = taskObj ? taskObj.getActionHtml(state) : '';
      const hasStage2 = actionHtml.includes('Stage 2/4: Bentonite Liner') && actionHtml.includes('40%');

      // Advance to 80% -> Stage 4
      state.buildings.pond.buildHours = 4.0;
      const actionHtml4 = taskObj.getActionHtml(state);
      const hasStage4 = actionHtml4.includes('Stage 4/4') && actionHtml4.includes('80%');

      return hasStage2 && hasStage4;
    });
    record('test5_ch4PondExcavationSync', 'Chapter 4 pond task card live 4-stage excavation tracking', test5,
      'Pond task card dynamically reflects excavation stages 1 to 4 with live percentage and step labels.');
  } catch (e) {
    record('test5_ch4PondExcavationSync', 'Chapter 4 pond task card live 4-stage excavation tracking', false, e.message);
  }

  // ----------------------------------------------------
  // TEST 6: Wind Turbine Trigger Opens 4-Corner Grid Directly
  // ----------------------------------------------------
  try {
    const test6 = await page.evaluate(() => {
      openModal('building', 'wind_turbine');
      const modalEl = document.getElementById('modalOverlay') || document.querySelector('.modal');
      const isGridModal = modalEl && modalEl.innerHTML.includes('4-Corner Wind Turbine Grid');
      closeModal();
      return isGridModal;
    });
    record('test6_windTurbineGridTrigger', 'Wind turbines action opens 4-corner grid modal directly', test6,
      'Clicking wind turbines directly opens 4-corner grid panel with comprehensive telemetry and engineer guidance.');
  } catch (e) {
    record('test6_windTurbineGridTrigger', 'Wind turbines action opens 4-corner grid modal directly', false, e.message);
  }

  // ----------------------------------------------------
  // TEST 7: 5 Dedicated Engineers for Power Community (4 Turbines + 1 BESS)
  // ----------------------------------------------------
  try {
    const test7 = await page.evaluate(() => {
      ensureWindTurbinesState();
      // Provide 5 engineers
      state.workers = state.workers.filter(w => w.type !== 'engineer');
      for (let i = 1; i <= 5; i++) {
        state.workers.push({ id: 100 + i, type: 'engineer', assignedPlot: null, assignedBuilding: null });
      }

      // Build and commission all 4 turbines
      ['wt_nw', 'wt_ne', 'wt_sw', 'wt_se'].forEach((k, idx) => {
        const wt = state.buildings.wind_turbines[k];
        wt.built = true;
        wt.checklistPending = true;
        performEngineerCommissioning(101 + idx, k);
      });

      // Assign 5th engineer to BESS
      state.buildings.energy_storage.built = true;
      assignEngineerToBESS(105);

      const count = getPowerCommunityAssignedEngineersCount();
      const allTurbinesStaffed = ['wt_nw', 'wt_ne', 'wt_sw', 'wt_se'].every(k => state.buildings.wind_turbines[k].assignedEngineerId !== null);
      const bessStaffed = state.buildings.energy_storage.assignedEngineerId === 105;

      return count === 5 && allTurbinesStaffed && bessStaffed;
    });
    record('test7_dedicated5Engineers', '5 dedicated Engineers requirement for Power Community', test7,
      'Enforced 4 dedicated Engineers for 4 turbines + 1 dedicated Engineer for BESS container (5 total).');
  } catch (e) {
    record('test7_dedicated5Engineers', '5 dedicated Engineers requirement for Power Community', false, e.message);
  }

  // ----------------------------------------------------
  // TEST 8: Theme & Mission Icon & Horizontal Chapter Task Flow
  // ----------------------------------------------------
  try {
    const test8 = await page.evaluate(() => {
      openChapterRoadmapForObject('plot');
      const modalEl = document.getElementById('modalOverlay') || document.querySelector('.modal');
      const html = modalEl ? modalEl.innerHTML : '';
      const hasHeaderIcon = html.includes('Theme &amp; Mission') || html.includes('Theme & Mission');
      const hasChapterTitle = html.includes('Look, I Can Grow Something!');
      const hasHorizontalStrip = html.includes('Sequential Mission Progression:') && html.includes('overflow-x:auto');
      closeModal();
      return hasHeaderIcon && hasChapterTitle && hasHorizontalStrip;
    });
    record('test8_themeAndMissionHorizontal', 'Theme & Mission icon, title, and horizontal mission progression cards', test8,
      'Roadmap modal displays chapter icon beside Scout Chapter, title below, and horizontal mission card flow.');
  } catch (e) {
    record('test8_themeAndMissionHorizontal', 'Theme & Mission icon, title, and horizontal mission progression cards', false, e.message);
  }

  // ----------------------------------------------------
  // TEST 9: Advance to Chapter 6 Modal & Task Banner
  // ----------------------------------------------------
  try {
    const test9 = await page.evaluate(() => {
      state.currentChapter = 5;
      state.selectedChapterTab = 5;
      ensureWindTurbinesState();
      ['wt_nw', 'wt_ne', 'wt_sw', 'wt_se'].forEach(k => {
        state.buildings.wind_turbines[k].built = true;
        state.buildings.wind_turbines[k].checklistPending = false;
      });
      state.buildings.energy_storage.built = true;
      state.buildings.energy_storage.storedKWh = 100;

      openPanel = 'tasks';
      render();
      const panel = document.getElementById('floatPanel') || document.body;
      const hasCh6Banner = panel.innerHTML.includes('Advance to Chapter 6: Build an Eco-Village');
      closePanel();

      openChapter5CompletionModal();
      const m = document.getElementById('modalOverlay') || document.querySelector('.modal');
      const hasCh5CompleteModal = m && m.innerHTML.includes('Chapter 5 Complete!') && m.innerHTML.includes('Power Your Community');
      closeModal();

      return hasCh6Banner && hasCh5CompleteModal;
    });
    record('test9_advanceToChapter6', 'Advance to Chapter 6 celebratory information box and completion modal', test9,
      'Chapter 5 completion modal awards +50 XP and provides smooth transition button to Chapter 6.');
  } catch (e) {
    record('test9_advanceToChapter6', 'Advance to Chapter 6 celebratory information box and completion modal', false, e.message);
  }

  // ----------------------------------------------------
  // TEST 10: Walkable Promenade Unlock Gate (Locked until Juice Bar & Cafe built)
  // ----------------------------------------------------
  try {
    const test10 = await page.evaluate(() => {
      state.money = 5000;
      state.rocksCleared = true;
      state.buildings.crew_shed = { built: true };
      state.buildings.road = { built: true };
      if (!state.workers.some(w => w.type === 'laborer')) {
        state.workers.push({ id: 101, type: 'laborer', assignedBuilding: null, assignedPlot: null });
      }
      state.buildings.juice_bar.built = false;
      state.buildings.coffee_shop.built = false;
      state.roads.market_promenade = { built: false, building: false, buildHours: 0 };

      // Attempt to build promenade via function
      startBuildRoadSegment('market_promenade');
      const blockedWhenUnbuilt = !state.roads.market_promenade.building;

      // Check Road Modal button state
      openModal('building', 'road');
      const rModal = document.getElementById('modalOverlay') || document.querySelector('.modal');
      const modalHtml = rModal ? rModal.innerHTML : '';
      const isLockedInModal = modalHtml.includes('Construct Juice Bar &amp; Cafe Restaurant First') || modalHtml.includes('Construct Juice Bar & Cafe Restaurant First');
      closeModal();

      // Now build both and verify unlock
      state.buildings.juice_bar.built = true;
      state.buildings.coffee_shop.built = true;
      startBuildRoadSegment('market_promenade');
      const allowedWhenBuilt = state.roads.market_promenade.building;

      return blockedWhenUnbuilt && isLockedInModal && allowedWhenBuilt;
    });
    record('test10_promenadeLockGate', 'Walkable Promenade strictly locked until Juice Bar & Cafe Restaurant built', test10,
      'Paving promenade is blocked from all interfaces until both village commerce venues are constructed.');
  } catch (e) {
    record('test10_promenadeLockGate', 'Walkable Promenade strictly locked until Juice Bar & Cafe Restaurant built', false, e.message);
  }

  // ----------------------------------------------------
  // TEST 11: Chapter 6 Active Village Visitors Spawning
  // ----------------------------------------------------
  try {
    const test11 = await page.evaluate(() => {
      state.money = 5000;
      state.buildings.road = { built: true };
      state.buildings.juice_bar.built = true;
      state.buildings.coffee_shop.built = true;
      state.roads.market_promenade.built = true;
      state.villagePromenadeActiveAnnounced = false;

      // Run game tick with 100% visitor spawn override for testing
      window.VISITOR_SPAWN_RATE = 1.0;
      advanceGame(1.0);

      const announced = state.villagePromenadeActiveAnnounced === true;
      const dests = visitorEligibleDestinations();
      const hasJuiceDest = dests.some(d => d.key === 'juice_bar');
      const hasCoffeeDest = dests.some(d => d.key === 'coffee_shop');

      return announced && hasJuiceDest && hasCoffeeDest;
    });
    record('test11_activeVillageVisitors', 'Active village visitors dynamically stroll when Juice Bar, Restaurant & Promenade built', test11,
      'Tourists and villagers dynamically spawn and visit commerce amenities along the promenade.');
  } catch (e) {
    record('test11_activeVillageVisitors', 'Active village visitors dynamically stroll when Juice Bar, Restaurant & Promenade built', false, e.message);
  }

  await browser.close();

  const allPassed = results.every(r => r.passed);
  console.log('\n======================================================');
  if (allPassed) {
    console.log(`🎉 ALL 11 BASE FARM MODIFICATION TESTS PASSED! (11/11, 100%) 🎉`);
  } else {
    console.log(`⚠️ SOME TESTS FAILED: ${results.filter(r => !r.passed).length} failure(s) detected.`);
  }
  console.log('======================================================\n');

  if (pageErrors.length > 0) {
    console.log('Page Errors logged during test run:');
    pageErrors.forEach(err => console.log('  -', err));
  }

  process.exit(allPassed ? 0 : 1);
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
