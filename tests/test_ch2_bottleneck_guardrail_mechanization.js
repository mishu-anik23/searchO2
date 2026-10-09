/**
 * test_ch2_bottleneck_guardrail_mechanization.js
 * 
 * Verifies all 6 requirements from user request:
 * 1. Chapter 1 Laptop Cleanup: Crew Shed is never displayed as Step 1 or in active task guide during Chapter 1.
 * 2. Crop Diversity Guardrail: Maximum 3 non-harvestable plants allowed across 6 plots. 4th non-harvestable plant is blocked.
 * 3. Harvest Bottleneck & Farm Garage Unlock: In Chapter 2, garage is locked until 6 plots planted + 6 manual harvests done.
 * 4. Farm Garage Construction: Requires at least 1 Labourer; 2 Labourers scale build speed by 2x.
 * 5. Mechanized Harvest: Once garage is built, harvesting takes 3.5s and marks state.mechanizedHarvestDone = true.
 * 6. Chapter 2 Finish & Chapter 3 Pure Scope: Chapter 2 completes with mechanized harvest; Chapter 3 unlocks with Garden + Crop Field.
 */

const { chromium } = require('playwright');
const path = require('path');

async function runTests() {
  console.log('================================================================');
  console.log('  SearchO2 Chapter 2 Bottleneck, Guardrail & Mechanization Suite ');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const filePath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

  await page.goto(filePath);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  let passedTests = 0;
  const totalTests = 6;

  // Test 1: Chapter 1 Solo Founder Cleanup on Laptop
  try {
    const res = await page.evaluate(() => {
      state.currentChapter = 1;
      state.allChaptersExplored = false;
      state.exploredChapters = {};

      const step1 = FARM_PROGRESSION_STEPS[0];
      const step1NotCrewShed = step1.key !== 'crew_shed' && !step1.title.includes('Crew Shed');
      const step1Badge = step1.badgeText;

      const guide = getFarmProgressionGuide();
      const guideNotCrewShed = guide.targetId !== 'crew_shed' && guide.key !== 'crew_shed' && !guide.title.includes('Crew Shed');

      return { step1NotCrewShed, step1Badge, guideNotCrewShed, targetId: guide.targetId, guideTitle: guide.title };
    });

    if (res.step1NotCrewShed && res.guideNotCrewShed) {
      console.log('[✓ PASSED] test1_ch1LaptopSoloFounderCleanup');
      console.log('    ↳ Chapter 1 Step 1 is "' + res.step1Badge + '", and active task guide targets "' + res.targetId + '" instead of crew_shed.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test1_ch1LaptopSoloFounderCleanup', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test1_ch1LaptopSoloFounderCleanup with error:', err);
  }

  // Test 2: Crop Diversity Guardrail (Max 3 Non-Harvestable Plants)
  try {
    const res = await page.evaluate(() => {
      state.currentChapter = 2;
      state.money = 2000;
      state.rocksCleared = true;
      state.buildings.gate = { built: true };
      state.buildings.road = { built: true };
      state.storage.built = true;
      state.workers = [{ id: 1, type: 'farmer' }, { id: 2, type: 'laborer' }];
      // Plant 3 non-harvestable trees (Oak, Pine, Maple)
      state.plots = [
        { id: 0, status: 'growing', treeType: 'oak', harvestsDone: 0 },
        { id: 1, status: 'growing', treeType: 'pine', harvestsDone: 0 },
        { id: 2, status: 'growing', treeType: 'maple', harvestsDone: 0 },
        { id: 3, status: 'ready', treeType: null, harvestsDone: 0 },
        { id: 4, status: 'ready', treeType: null, harvestsDone: 0 },
        { id: 5, status: 'ready', treeType: null, harvestsDone: 0 }
      ];

      const countBefore = getNonHarvestablePlotsCount(state);

      // Attempt to plant a 4th non-harvestable tree (Poplar or Birch)
      const initialMoney = state.money;
      plantTree(3, 'poplar');
      const blocked4th = state.plots[3].treeType === null;

      // Planting a harvestable crop (Tomato, Apple, or Teak) must succeed
      plantTree(3, 'apple');
      const allowedHarvestable = state.plots[3].treeType === 'apple';

      return { countBefore, blocked4th, allowedHarvestable };
    });

    if (res.countBefore === 3 && res.blocked4th && res.allowedHarvestable) {
      console.log('[✓ PASSED] test2_cropDiversityGuardrailMax3');
      console.log('    ↳ Guardrail correctly allows exactly 3 non-harvestable plants, blocks 4th non-harvestable plant, and allows harvestable crops.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test2_cropDiversityGuardrailMax3', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test2_cropDiversityGuardrailMax3 with error:', err);
  }

  // Test 3: Harvest Bottleneck & Farm Garage Unlock (6 plots planted + 6 manual harvests)
  try {
    const res = await page.evaluate(() => {
      state.currentChapter = 2;
      state.storage.built = true;
      state.buildings.road.built = true;
      state.buildings.garage = { built: false, building: false, buildHours: 0, assignedLaborers: [] };

      // Case A: 6 plots planted, but only 2 manual harvests done
      state.plots = [
        { id: 0, treeType: 'apple', status: 'growing', manualHarvestsDone: 1, harvestsDone: 1 },
        { id: 1, treeType: 'orange', status: 'growing', manualHarvestsDone: 1, harvestsDone: 1 },
        { id: 2, treeType: 'lemon', status: 'growing', manualHarvestsDone: 0, harvestsDone: 0 },
        { id: 3, treeType: 'oak', status: 'growing', manualHarvestsDone: 0, harvestsDone: 0 },
        { id: 4, treeType: 'pine', status: 'growing', manualHarvestsDone: 0, harvestsDone: 0 },
        { id: 5, treeType: 'maple', status: 'growing', manualHarvestsDone: 0, harvestsDone: 0 }
      ];
      state.manualHarvestCount = 2;
      const lockedBeforeBottleneck = !isObjectUnlockedByChapter('garage', state);

      // Case B: 6 plots planted, and 2 manual harvests done on each of 3 harvestable crops (6 total)
      state.plots[0].manualHarvestsDone = 2;
      state.plots[1].manualHarvestsDone = 2;
      state.plots[2].manualHarvestsDone = 2;
      state.manualHarvestCount = 6;
      const unlockedAfterBottleneck = isObjectUnlockedByChapter('garage', state);

      return { lockedBeforeBottleneck, unlockedAfterBottleneck };
    });

    if (res.lockedBeforeBottleneck && res.unlockedAfterBottleneck) {
      console.log('[✓ PASSED] test3_harvestBottleneckGarageUnlock');
      console.log('    ↳ Farm Garage is locked with 2 manual harvests, and unlocks once all 6 manual harvests (2 per harvestable crop) are fulfilled.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test3_harvestBottleneckGarageUnlock', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test3_harvestBottleneckGarageUnlock', res);
  }
  // Test 4: Farm Garage Construction with 1-2 Labourers & 2x Speed Scaling
  try {
    const res = await page.evaluate(() => {
      state.currentChapter = 2;
      state.money = 2000;
      state.buildings.garage = { built: false, building: false, buildHours: 0, assignedLaborers: [] };
      state.garageUnlockedByHarvests = true;

      // 0 laborers available -> startBuildBuilding should not start
      state.workers = [];
      startBuildBuilding('garage');
      const notStartedWithoutLabour = !state.buildings.garage.building;

      // 1 laborer available -> assigns 1 laborer (1x speed)
      state.workers = [{ id: 101, type: 'laborer', assignedBuilding: null }];
      startBuildBuilding('garage');
      const startedWith1 = state.buildings.garage.building && state.buildings.garage.assignedLaborers.length === 1;

      // Reset and test with 2 laborers -> assigns 2 laborers (2x speed)
      state.buildings.garage = { built: false, building: false, buildHours: 0, assignedLaborers: [] };
      state.workers = [
        { id: 101, type: 'laborer', assignedBuilding: null },
        { id: 102, type: 'laborer', assignedBuilding: null }
      ];
      startBuildBuilding('garage');
      const startedWith2 = state.buildings.garage.building && state.buildings.garage.assignedLaborers.length === 2;

      // Advance game with 2 laborers for 1 hour -> should advance 2.0 buildHours due to 2x speed scaling
      advanceGame(1.0);
      const scaledBuildHours = state.buildings.garage.buildHours;

      return { notStartedWithoutLabour, startedWith1, startedWith2, scaledBuildHours };
    });

    if (res.notStartedWithoutLabour && res.startedWith1 && res.startedWith2 && res.scaledBuildHours >= 1.9) {
      console.log('[✓ PASSED] test4_garageLabourAssignmentAndSpeedScaling');
      console.log('    ↳ Construction requires Labourers, assigns up to 2 workers, and achieves 2x speed scaling (buildHours=' + res.scaledBuildHours.toFixed(1) + ').');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test4_garageLabourAssignmentAndSpeedScaling', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test4_garageLabourAssignmentAndSpeedScaling with error:', err);
  }

  // Test 5: Mechanized Harvest Speed & Tracking
  try {
    const res = await page.evaluate(() => {
      state.currentChapter = 2;
      state.buildings.garage = { built: true, building: false };
      state.mechanizedHarvestDone = false;
      state.mechanizedHarvestCount = 0;

      state.plots = [
        { id: 0, status: 'growing', treeType: 'apple', pendingHarvest: 10, harvesting: false, harvestAmount: 0, assignedWorker: 201 }
      ];
      state.workers = [{ id: 201, type: 'farmer', assignedPlot: 0 }];

      startHarvest(0, 'storage');
      const isHarvesting = state.plots[0].harvesting;

      // Advance time beyond tractor duration (3.5s)
      state.plots[0].harvestStartReal = Date.now() - 4000;
      processHarvests();

      const harvestDone = !state.plots[0].harvesting;
      const mechanizedFlag = !!state.mechanizedHarvestDone;
      const mechanizedCount = state.mechanizedHarvestCount;

      return { isHarvesting, harvestDone, mechanizedFlag, mechanizedCount };
    });

    if (res.isHarvesting && res.harvestDone && res.mechanizedFlag && res.mechanizedCount >= 1) {
      console.log('[✓ PASSED] test5_mechanizedHarvestTracking');
      console.log('    ↳ Mechanized harvest completes rapidly and registers state.mechanizedHarvestDone = true.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test5_mechanizedHarvestTracking', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test5_mechanizedHarvestTracking with error:', err);
  }

  // Test 6: Chapter 2 Completion & Chapter 3 Pure Scope
  try {
    const res = await page.evaluate(() => {
      state.currentChapter = 2;
      state.rocksCleared = true;
      state.buildings.gate = { built: true };
      state.buildings.road = { built: true };
      state.storage.built = true;
      state.workers = [
        { id: 1, type: 'laborer' },
        { id: 2, type: 'farmer' }
      ];
      state.plots = [
        { id: 0, treeType: 'apple', status: 'growing', manualHarvestsDone: 2 },
        { id: 1, treeType: 'orange', status: 'growing', manualHarvestsDone: 2 },
        { id: 2, treeType: 'lemon', status: 'growing', manualHarvestsDone: 2 },
        { id: 3, treeType: 'oak', status: 'growing', manualHarvestsDone: 0 },
        { id: 4, treeType: 'pine', status: 'growing', manualHarvestsDone: 0 },
        { id: 5, treeType: 'maple', status: 'growing', manualHarvestsDone: 0 }
      ];
      state.manualHarvestCount = 6;
      state.buildings.garage = { built: true };
      state.mechanizedHarvestDone = false;

      // Before mechanized harvest -> Chapter 2 incomplete
      const ch2IncompleteBeforeMech = !CHAPTER_DEFINITIONS[1].isComplete(state);

      // Complete mechanized harvest -> Chapter 2 complete
      state.mechanizedHarvestDone = true;
      const ch2CompleteAfterMech = CHAPTER_DEFINITIONS[1].isComplete(state);

      // Verify Chapter 3 pure scope (Garden & Crop Field, no garage required)
      const ch3Def = CHAPTER_DEFINITIONS[2];
      const ch3KeySystems = ch3Def.keySystems;
      const ch3DoesNotRequireGarage = !ch3KeySystems.includes('Equipment Depot');

      state.currentChapter = 3;
      state.buildings.garden = { built: true };
      state.buildings.crop_field = { built: true };
      const ch3CompleteWithGardenAndCrops = ch3Def.isComplete(state);

      return { ch2IncompleteBeforeMech, ch2CompleteAfterMech, ch3DoesNotRequireGarage, ch3CompleteWithGardenAndCrops };
    });

    if (res.ch2IncompleteBeforeMech && res.ch2CompleteAfterMech && res.ch3DoesNotRequireGarage && res.ch3CompleteWithGardenAndCrops) {
      console.log('[✓ PASSED] test6_ch2FinishAndCh3PureScope');
      console.log('    ↳ Chapter 2 completes with mechanized harvest; Chapter 3 unlocks with pure Botanical Garden & Crop Field.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test6_ch2FinishAndCh3PureScope', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test6_ch2FinishAndCh3PureScope with error:', err);
  }

  console.log('\n================================================================');
  console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED! (${Math.round(passedTests/totalTests*100)}%) 🎉`);
  console.log('================================================================\n');

  await browser.close();
  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
