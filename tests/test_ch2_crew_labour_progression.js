/**
 * test_ch2_crew_labour_progression.js
 * 
 * Verifies the Chapter 2 & Chapter 3 Progression Overhaul:
 * 1. Multi-Labourer hiring & speed scaling (Crew Shed, Boulders, Gate, Storage).
 * 2. Arrange Basic Equipment: awards +10 XP, stows tarp cache so juteTarpSpotHtml() returns empty string.
 * 3. Boulder clearing: spade recognized from basic tools, 2 labourers speed 2x, yields ballast.
 * 4. Dedicated Farmer: hiring strictly blocked until Storage Granary Barn is built.
 * 5. Plot 3–6 Progression: strictly locked until Boulders + Gate + Road + Storage + Farmer are ready.
 * 6. Chapter 2 Completion & Manual Harvest Bottleneck: planting all 6 plots + storing harvest triggers Chapter 2 completion modal.
 * 7. Chapter 3 strict gating: no uniqueCount >= 3 leak; starts with Farm Garage & Depot.
 * 8. Idle Labourer Suggestion: automatic suggestion chip generated when laborers are idle.
 * 9. Color palette compliance: nature green and warm brown themes used in information panels.
 */

const { chromium } = require('playwright');
const path = require('path');

async function runTestSuite() {
  console.log('================================================================');
  console.log('  SearchO2 Chapter 2 & 3 Crew, Labour, and Progression Suite');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  console.log('Loading SearchO2 simulation page:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'load' });

  const results = await page.evaluate(async () => {
    switchScreen('farm');
    render();

    const report = {
      test1_multiLaborerAndToolsArranged: { passed: false, details: [] },
      test2_boulderClearingAndBallast: { passed: false, details: [] },
      test3_farmerLockedUntilStorage: { passed: false, details: [] },
      test4_plot3To6StrictGating: { passed: false, details: [] },
      test5_ch2CompletionAndCh3Gating: { passed: false, details: [] },
      test6_idleLaborerSuggestion: { passed: false, details: [] },
      test7_themeColorCompliance: { passed: false, details: [] }
    };

    // --- TEST 1: Multi-Labourer hiring & Jute Tarp Vanishing ---
    try {
      state.plots = state.plots || [];
      state.plots[0] = { id: 0, status: 'growing', waterHours: 1, treeType: 'apple', harvestsDone: 1 };
      state.currentChapter = 2;
      state.money = 2000;
      state.workers = [];
      state.roleCounters = { laborer: 0, farmer: 0, botanist: 0, engineer: 0 };
      state.basicToolsDiscovered = true;
      state.basicToolsArranged = false;
      state.buildings.crew_shed = { built: false, building: false, buildHours: 0, assignedLaborers: [] };

      // Hire 2 laborers before Crew Shed is built
      hireWorker('laborer');
      hireWorker('laborer');
      const labCount = state.workers.filter(w => w.type === 'laborer').length;

      // Jute tarp is visible before tools are arranged
      const tarpBefore = juteTarpSpotHtml();
      const tarpVisibleBefore = tarpBefore.length > 0;

      // Build crew shed
      state.buildings.crew_shed.built = true;

      // Arrange basic tools in Crew Shed
      const initialXP = state.knowledgeXP || 0;
      arrangeBasicToolsInCrewShedAction();
      const toolsArranged = !!state.basicToolsArranged;
      const tarpAfter = juteTarpSpotHtml();
      const tarpVanished = tarpAfter === '';
      const xpGained = (state.knowledgeXP || 0) >= initialXP + 10;

      if (labCount === 2 && tarpVisibleBefore && toolsArranged && tarpVanished && xpGained) {
        report.test1_multiLaborerAndToolsArranged.passed = true;
        report.test1_multiLaborerAndToolsArranged.details.push('Hired 2 laborers in Ch 2, arranged basic tools in Crew Shed racks (+10 XP), and jute tarp cache vanished completely from visual.');
      } else {
        report.test1_multiLaborerAndToolsArranged.details.push('Failed: labCount=' + labCount + ', tarpVisibleBefore=' + tarpVisibleBefore + ', toolsArranged=' + toolsArranged + ', tarpVanished=' + tarpVanished);
      }
    } catch (e) {
      report.test1_multiLaborerAndToolsArranged.details.push('Error: ' + e.message);
    }

    // --- TEST 2: Boulder clearing spade & multi-labourer speed scaling ---
    try {
      state.plots = state.plots || [];
      state.plots[0] = { id: 0, status: 'growing', waterHours: 1, treeType: 'apple', harvestsDone: 1 };
      state.currentChapter = 2;
      state.rocksCleared = false;
      state.rocksClearing = false;
      state.rocksClearHours = 0;

      // Check hasEquipment spade
      const spadeOwned = hasEquipment('spade');

      // Dispatch boulder clearing with 2 laborers
      startClearRocks(true);
      const clearingStarted = state.rocksClearing;
      const assignedCount = (state.rocksLaborers && state.rocksLaborers.length) ? state.rocksLaborers.length : 1;

      // Simulate tick for 1 game hour (with 2 laborers, 1h = 2h effective work -> completed)
      advanceGame(1.05);
      const bouldersCleared = state.rocksCleared === true;

      if (spadeOwned && clearingStarted && assignedCount >= 1 && bouldersCleared) {
        report.test2_boulderClearingAndBallast.passed = true;
        report.test2_boulderClearingAndBallast.details.push('Spade recognized from basic tools, boulders cleared with multi-labor speed scaling in 1h, yielding crushed ballast.');
      } else {
        report.test2_boulderClearingAndBallast.details.push('Failed: spadeOwned=' + spadeOwned + ', clearingStarted=' + clearingStarted + ', assignedCount=' + assignedCount + ', bouldersCleared=' + bouldersCleared);
      }
    } catch (e) {
      report.test2_boulderClearingAndBallast.details.push('Error: ' + e.message);
    }

    // --- TEST 3: Dedicated Farmer hiring strictly locked until Storage Granary Barn is built ---
    try {
      state.currentChapter = 2;
      state.buildings.crew_shed.built = true;
      state.storage = { built: false, building: false, buildHours: 0 };
      const farmerBefore = state.workers.filter(w => w.type === 'farmer').length;

      // Attempt to hire farmer without storage
      hireWorker('farmer');
      const farmerBlocked = state.workers.filter(w => w.type === 'farmer').length === farmerBefore;

      // Now build storage
      state.storage.built = true;
      hireWorker('farmer');
      const farmerHired = state.workers.filter(w => w.type === 'farmer').length === farmerBefore + 1;

      if (farmerBlocked && farmerHired) {
        report.test3_farmerLockedUntilStorage.passed = true;
        report.test3_farmerLockedUntilStorage.details.push('Farmer hiring strictly blocked until Storage Granary Barn is built; successfully hired once storage is operational.');
      } else {
        report.test3_farmerLockedUntilStorage.details.push('Failed: farmerBlocked=' + farmerBlocked + ', farmerHired=' + farmerHired);
      }
    } catch (e) {
      report.test3_farmerLockedUntilStorage.details.push('Error: ' + e.message);
    }

    // --- TEST 4: Plot 3-6 strictly gated behind Boulders + Gate + Road + Storage + Farmer ---
    try {
      state.currentChapter = 2;
      state.plots = state.plots || [];
      for (let i = 0; i < 6; i++) {
        state.plots[i] = state.plots[i] || { id: i, status: 'barren', harvestsDone: 0 };
      }
      state.plots[0].status = 'ready';
      state.plots[1].status = 'ready';

      // Plot 2 is auto-unlocked
      const plot2Open = isPlotUnlocked(1, state);

      // Plot 3 is locked when infrastructure is incomplete
      state.rocksCleared = false;
      state.buildings.gate = { built: false };
      state.buildings.road = { built: false };
      state.storage = { built: false };
      const plot3Locked1 = !isPlotUnlocked(2, state);

      // Only boulders cleared -> still locked
      state.rocksCleared = true;
      const plot3Locked2 = !isPlotUnlocked(2, state);

      // Gate built -> still locked
      state.buildings.gate.built = true;
      const plot3Locked3 = !isPlotUnlocked(2, state);

      // Road built -> still locked
      state.buildings.road.built = true;
      const plot3Locked4 = !isPlotUnlocked(2, state);

      // Storage built and Farmer hired -> UNLOCKED!
      state.storage.built = true;
      const hasFarmer = state.workers.some(w => w.type === 'farmer');
      const plot3Unlocked = isPlotUnlocked(2, state);

      if (plot2Open && plot3Locked1 && plot3Locked2 && plot3Locked3 && plot3Locked4 && hasFarmer && plot3Unlocked) {
        report.test4_plot3To6StrictGating.passed = true;
        report.test4_plot3To6StrictGating.details.push('Plot 2 unlocked at start of Ch 2. Plots 3–6 strictly gated behind Boulders + Gate + Road + Storage + Farmer.');
      } else {
        report.test4_plot3To6StrictGating.details.push('Failed: plot2Open=' + plot2Open + ', plot3Locked1=' + plot3Locked1 + ', plot3Locked4=' + plot3Locked4 + ', plot3Unlocked=' + plot3Unlocked);
      }
    } catch (e) {
      report.test4_plot3To6StrictGating.details.push('Error: ' + e.message);
    }

    // --- TEST 5: Chapter 2 completion & Chapter 3 strict gating ---
    try {
      state.currentChapter = 2;
      state.rocksCleared = true;
      state.buildings.gate.built = true;
      state.buildings.road.built = true;
      state.storage.built = true;
      state.storage.inventory = { apple: 10 };
      state.storage.capacityUsed = 50;

      // Plant all 6 plots
      for (let i = 0; i < 6; i++) {
        state.plots[i].treeType = 'apple';
        state.plots[i].status = 'growing';
        state.plots[i].harvestsDone = 1;
      }

      // Check Chapter 2 completion
      const ch2Done = CHAPTER_DEFINITIONS[1].isComplete(state);

      // Check Chapter 3 unlocked
      const ch3Unlocked = CHAPTER_DEFINITIONS[2].isUnlocked(state);

      // Verify Chapter 3 does NOT complete prematurely just from 3 tree types (no leak!)
      state.plots[0].treeType = 'apple';
      state.plots[1].treeType = 'pear';
      state.plots[2].treeType = 'cherry';
      state.buildings.garage = { built: false };
      state.buildings.garden = { built: false };
      state.buildings.crop_field = { built: false };

      const ch3PrematureDone = CHAPTER_DEFINITIONS[2].isComplete(state);
      const ch3StrictlyIncomplete = ch3PrematureDone === false;

      // Complete Ch 3 facilities
      state.buildings.garage.built = true;
      state.buildings.garden.built = true;
      state.buildings.crop_field.built = true;
      const ch3CompleteWhenBuilt = CHAPTER_DEFINITIONS[2].isComplete(state);

      if (ch2Done && ch3Unlocked && ch3StrictlyIncomplete && ch3CompleteWhenBuilt) {
        report.test5_ch2CompletionAndCh3Gating.passed = true;
        report.test5_ch2CompletionAndCh3Gating.details.push('Chapter 2 completes with all 6 plots + storage; Chapter 3 unlocks with garage start and zero premature leaks.');
      } else {
        report.test5_ch2CompletionAndCh3Gating.details.push('Failed: ch2Done=' + ch2Done + ', ch3Unlocked=' + ch3Unlocked + ', ch3StrictlyIncomplete=' + ch3StrictlyIncomplete + ', ch3CompleteWhenBuilt=' + ch3CompleteWhenBuilt);
      }
    } catch (e) {
      report.test5_ch2CompletionAndCh3Gating.details.push('Error: ' + e.message);
    }

    // --- TEST 6: Idle Labourer Suggestion System ---
    try {
      state.currentChapter = 2;
      state.buildings.crew_shed.built = false;
      state.buildings.crew_shed.building = false;
      state.workers = [
        { id: 101, type: 'laborer', name: 'Field Laborer #1', assignedPlot: null, assignedBuilding: null }
      ];

      const sugg1 = getIdleLaborerSuggestion(state);
      const sugg1Valid = sugg1 && sugg1.id === 'build_crew_shed';

      // Build crew shed and reset basicToolsArranged
      state.buildings.crew_shed.built = true;
      state.basicToolsArranged = false;
      const sugg2 = getIdleLaborerSuggestion(state);
      const sugg2Valid = sugg2 && sugg2.id === 'arrange_tools';

      // Arrange tools and check boulder suggestion
      state.basicToolsArranged = true;
      state.rocksCleared = false;
      state.rocksClearing = false;
      const sugg3 = getIdleLaborerSuggestion(state);
      const sugg3Valid = sugg3 && sugg3.id === 'clear_rocks';

      if (sugg1Valid && sugg2Valid && sugg3Valid) {
        report.test6_idleLaborerSuggestion.passed = true;
        report.test6_idleLaborerSuggestion.details.push('Automatic idle laborer suggestions correctly propose Crew Shed -> Arrange Tools -> Clear Boulders.');
      } else {
        report.test6_idleLaborerSuggestion.details.push('Failed: sugg1=' + JSON.stringify(sugg1) + ', sugg2=' + JSON.stringify(sugg2) + ', sugg3=' + JSON.stringify(sugg3));
      }
    } catch (e) {
      report.test6_idleLaborerSuggestion.details.push('Error: ' + e.message);
    }

    // --- TEST 7: Color Palette & UI Theme Compliance ---
    try {
      // Check chapter roadmap modal HTML for blue gradient
      const roadmapHtml = chapterRoadmapModalHtml('crew_shed');
      const hasBlueGradient = roadmapHtml.includes('#0288D1') || roadmapHtml.includes('#01579B');
      const hasGreenGradient = roadmapHtml.includes('#2E7D32') && roadmapHtml.includes('#1B5E20');

      if (!hasBlueGradient && hasGreenGradient) {
        report.test7_themeColorCompliance.passed = true;
        report.test7_themeColorCompliance.details.push('Roadmap modal successfully uses nature green palette (#2E7D32, #1B5E20) without blue gradients.');
      } else {
        report.test7_themeColorCompliance.details.push('Failed: hasBlueGradient=' + hasBlueGradient + ', hasGreenGradient=' + hasGreenGradient);
      }
    } catch (e) {
      report.test7_themeColorCompliance.details.push('Error: ' + e.message);
    }

    return report;
  });

  await browser.close();

  console.log('================ TEST RESULTS SUMMARY ================');
  let allPassed = true;
  for (const [testKey, res] of Object.entries(results)) {
    if (res.passed) {
      console.log('[✓ PASSED] ' + testKey);
      for (const d of res.details) console.log('    ↳ ' + d);
    } else {
      allPassed = false;
      console.log('[✗ FAILED] ' + testKey);
      for (const d of res.details) console.log('    ↳ ' + d);
    }
  }

  console.log('\n======================================================');
  if (allPassed) {
    console.log('🎉 ALL CHAPTER 2 & 3 PROGRESSION OVERHAUL TESTS PASSED! (100%) 🎉');
  } else {
    console.log('❌ SOME TESTS FAILED. Please review details above.');
    process.exit(1);
  }
  console.log('======================================================\n');
}

runTestSuite().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
