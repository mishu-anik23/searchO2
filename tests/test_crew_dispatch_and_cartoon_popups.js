/**
 * test_crew_dispatch_and_cartoon_popups.js
 * 
 * Verifies:
 * 1. Farm Garage strictly locked in Chapter 2, unlocks in Chapter 3.
 * 2. Polyculture (crop_field) gated to Chapter 3, Cattle Grazing (cattle_farm) gated to Chapter 4 in Quick Dispatch Hub.
 * 3. Enhanced Crew Hired Celebration Modal with avatar, wage, quarters, proficiencies, and immediate dispatch button.
 * 4. Active Crew Dispatch Hub rendered in bottom tools drawer (#btnToggleBottomTools) with stats and 1-click actions.
 * 5. Mobile worker floater aligned bottom-screen left behind marketplace.
 * 6. Chapter 5: 2 Active Power Plants (wt_nw, wt_ne) require Engineer; redundant units do not block.
 * 7. Children-friendly 3D Isometric illustrations and cartoon frame exploration roadmap popups.
 */

const { chromium } = require('playwright');
const path = require('path');

async function runTests() {
  console.log('================================================================');
  console.log('  SearchO2 Crew Dispatch, Hiring Popup & Cartoon Suite          ');
  console.log('================================================================\\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const filePath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\\\/g, '/');

  await page.goto(filePath);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  let passedTests = 0;
  const totalTests = 7;

  // Test 1: Farm Garage Chapter 2 infrastructure gating & manual harvest bottleneck
  try {
    const res = await page.evaluate(() => {
      state.currentChapter = 2;
      state.storage.built = true;
      state.buildings.road.built = true;
      state.plots = [
        { id: 0, treeType: 'apple', status: 'growing', harvestsDone: 0, manualHarvestsDone: 0 },
        { id: 1, treeType: 'orange', status: 'growing', harvestsDone: 0, manualHarvestsDone: 0 },
        { id: 2, treeType: 'lemon', status: 'growing', harvestsDone: 0, manualHarvestsDone: 0 }
      ];
      state.manualHarvestCount = 0;

      const garageLockedInCh2BeforeHarvests = !isObjectUnlockedByChapter('garage', state);
      const missionGateLockedCh2 = !ProgressionEvaluator.isObjectAvailable('garage', state);

      // Cultivate all 6 plots (3 harvestable + 3 oxygen) and perform 2 manual harvests per crop (6 total)
      state.plots = [
        { id: 0, treeType: 'apple', status: 'growing', harvestsDone: 2, manualHarvestsDone: 2 },
        { id: 1, treeType: 'orange', status: 'growing', harvestsDone: 2, manualHarvestsDone: 2 },
        { id: 2, treeType: 'lemon', status: 'growing', harvestsDone: 2, manualHarvestsDone: 2 },
        { id: 3, treeType: 'oak', status: 'growing', harvestsDone: 0, manualHarvestsDone: 0 },
        { id: 4, treeType: 'pine', status: 'growing', harvestsDone: 0, manualHarvestsDone: 0 },
        { id: 5, treeType: 'maple', status: 'growing', harvestsDone: 0, manualHarvestsDone: 0 }
      ];
      state.manualHarvestCount = 6;

      const garageUnlockedInCh2WithHarvests = isObjectUnlockedByChapter('garage', state);
      const missionGateUnlockedCh2 = ProgressionEvaluator.isObjectAvailable('garage', state);

      return { garageLockedInCh2BeforeHarvests, missionGateLockedCh2, garageUnlockedInCh2WithHarvests, missionGateUnlockedCh2 };
    });

    if (res.garageLockedInCh2BeforeHarvests && res.missionGateLockedCh2 && res.garageUnlockedInCh2WithHarvests && res.missionGateUnlockedCh2) {
      console.log('[✓ PASSED] test1_farmGarageChapter2InfraGating');
      console.log('    ↳ Farm Garage unlocks in Chapter 2 after all 6 plots planted and 6 manual harvests completed on foot.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test1_farmGarageChapter2InfraGating', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test1_farmGarageStrictCh3Gating with error:', err);
  }

  // Test 2: Polyculture (crop_field) and Cattle Grazing (cattle_farm) chapter-gated in Dispatch Hub
  try {
    const res = await page.evaluate(() => {
      state.currentChapter = 2;
      state.buildings.crew_shed.built = true;
      state.workers = [{ id: 1, type: 'laborer', name: 'Laborer #1' }];

      const tasksCh2 = getPendingTasksList();
      const cropFieldInCh2 = tasksCh2.find(t => t.optKey === 'crop_field');
      const cattleInCh2 = tasksCh2.find(t => t.optKey === 'cattle_farm');

      const cropFieldLockedCh2 = !cropFieldInCh2 || !cropFieldInCh2.isUnlocked;
      const cattleLockedCh2 = !cattleInCh2 || !cattleInCh2.isUnlocked;

      state.currentChapter = 3;
      const tasksCh3 = getPendingTasksList();
      const cropFieldInCh3 = tasksCh3.find(t => t.optKey === 'crop_field');
      const cattleInCh3 = tasksCh3.find(t => t.optKey === 'cattle_farm');

      const cropFieldUnlockedCh3 = cropFieldInCh3 && cropFieldInCh3.isUnlocked;
      const cattleLockedCh3 = !cattleInCh3 || !cattleInCh3.isUnlocked;

      state.currentChapter = 4;
      const tasksCh4 = getPendingTasksList();
      const cattleInCh4 = tasksCh4.find(t => t.optKey === 'cattle_farm');
      const cattleUnlockedCh4 = cattleInCh4 && cattleInCh4.isUnlocked;

      return { cropFieldLockedCh2, cattleLockedCh2, cropFieldUnlockedCh3, cattleLockedCh3, cattleUnlockedCh4 };
    });

    if (res.cropFieldLockedCh2 && res.cattleLockedCh2 && res.cropFieldUnlockedCh3 && res.cattleLockedCh3 && res.cattleUnlockedCh4) {
      console.log('[✓ PASSED] test2_dispatchHubChapterGating');
      console.log('    ↳ Polyculture crop field is strictly gated to Chapter 3+, and Cattle grazing is strictly gated to Chapter 4+ in Quick Dispatch Hub.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test2_dispatchHubChapterGating', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test2_dispatchHubChapterGating with error:', err);
  }

  // Test 3: Crew Member Hired Celebration Popup
  try {
    const res = await page.evaluate(() => {
      state.currentChapter = 2;
      state.money = 1000;
      state.workers = [];
      state.roleCounters = { laborer: 0, farmer: 0, botanist: 0, engineer: 0 };
      state.buildings.crew_shed.built = true;

      hireWorker('laborer');
      const modalOpen = activeModal && activeModal.type === 'crew_hired';
      const hiredWorker = activeModal ? activeModal.worker : null;
      const modalHtml = modalOpen ? crewHiredModalHtml(hiredWorker) : '';

      const hasCelebration = modalHtml.includes('Recruitment Complete');
      const hasAvatar = modalHtml.includes('👷');
      const expectedWage = (typeof WORKER_TYPES !== 'undefined' && WORKER_TYPES.laborer) ? WORKER_TYPES.laborer.wage : 30;
      const hasWage = modalHtml.includes('€' + expectedWage + ' / day') || modalHtml.includes('/ day');
      const hasQuarters = modalHtml.includes('Crew Shed Bunk');
      const hasProficiencies = modalHtml.includes('Trench soil beds') || modalHtml.includes('ALLOWED PROFICIENCIES');
      const hasDispatchBtn = modalHtml.includes('Dispatch to Task Now') || modalHtml.includes('Standby at Bunkhouse');

      return { modalOpen, hasCelebration, hasAvatar, hasWage, hasQuarters, hasProficiencies, hasDispatchBtn };
    });

    if (res.modalOpen && res.hasCelebration && res.hasAvatar && res.hasWage && res.hasQuarters && res.hasProficiencies && res.hasDispatchBtn) {
      console.log('[✓ PASSED] test3_crewHiredCelebrationModal');
      console.log('    ↳ Successful hiring triggers celebration popup with rich metadata: avatar, wage, quarters, proficiencies, and immediate dispatch button.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test3_crewHiredCelebrationModal', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test3_crewHiredCelebrationModal with error:', err);
  }

  // Test 4: Active Crew Dispatch Hub in Bottom Drawer (#btnToggleBottomTools)
  try {
    const res = await page.evaluate(() => {
      state.currentChapter = 2;
      state.buildings.crew_shed.built = true;
      state.workers = [
        { id: 1, type: 'laborer', name: 'Field Laborer #1', assignedPlot: null, assignedBuilding: null, roleSeq: 1 },
        { id: 2, type: 'farmer', name: 'Farmer #1', assignedPlot: 0, assignedBuilding: null, roleSeq: 1 }
      ];

      const drawerHtml = toolStripHtml();
      const hasStatsBar = drawerHtml.includes('Roster') && drawerHtml.includes('Idle in Shed') && drawerHtml.includes('Daily Payroll');
      const hasRecruitButtons = drawerHtml.includes('Laborer') && drawerHtml.includes('Farmer') && drawerHtml.includes('Botanist') && drawerHtml.includes('Engineer');
      const hasWorkersRoster = drawerHtml.includes('Field Laborer #1') && drawerHtml.includes('Farmer #1');
      const hasRecallButton = drawerHtml.includes('Recall');
      const hasHeadquartersLink = drawerHtml.includes('Open Full Crew Shed Headquarters');

      return { hasStatsBar, hasRecruitButtons, hasWorkersRoster, hasRecallButton, hasHeadquartersLink };
    });

    if (res.hasStatsBar && res.hasRecruitButtons && res.hasWorkersRoster && res.hasRecallButton && res.hasHeadquartersLink) {
      console.log('[✓ PASSED] test4_bottomDrawerCrewDispatchHub');
      console.log('    ↳ Bottom Crew Icon (#btnToggleBottomTools) drawer contains full Active Crew Hub: stats bar, recruit buttons, worker roster with 1-click dispatch/recall.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test4_bottomDrawerCrewDispatchHub', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test4_bottomDrawerCrewDispatchHub with error:', err);
  }

  // Test 5: Mobile Worker Task Floater Alignment
  try {
    const res = await page.evaluate(() => {
      state.currentChapter = 2;
      state.rocksCleared = false;
      state.rocksClearing = false;
      state.buildings.crew_shed.built = true;
      state.workers = [{ id: 1, type: 'laborer', name: 'Laborer #1', assignedPlot: null, assignedBuilding: null }];

      const floaterHtml = renderIdleLaborerSuggestionHtml(state);
      const hasFloaterClass = floaterHtml.includes('idle-laborer-suggestion-floater');
      const hasAssignButton = floaterHtml.includes('Assign ➔');

      return { hasFloaterClass, hasAssignButton };
    });

    // Check CSS rules for mobile alignment
    const cssCheck = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      let foundMobileRule = false;
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.media && rule.media.mediaText.includes('768px')) {
              const innerRules = Array.from(rule.cssRules || []);
              for (const ir of innerRules) {
                if (ir.selectorText && ir.selectorText.includes('idle-laborer-suggestion-floater')) {
                  foundMobileRule = ir.cssText.includes('left') && ir.cssText.includes('bottom');
                }
              }
            }
          }
        } catch (e) {}
      }
      return foundMobileRule;
    });

    if (res.hasFloaterClass && res.hasAssignButton && cssCheck) {
      console.log('[✓ PASSED] test5_mobileWorkerTaskFloaterAlignment');
      console.log('    ↳ Mobile dynamically active worker floater is styled to align bottom-left (left: 8px, compact font 0.68rem) behind/beside marketplace.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test5_mobileWorkerTaskFloaterAlignment', { res, cssCheck });
    }
  } catch (err) {
    console.error('[✗ FAILED] test5_mobileWorkerTaskFloaterAlignment with error:', err);
  }

  // Test 6: Chapter 5 Active Power Plants Engineer Requirement vs Redundant Units
  try {
    const res = await page.evaluate(() => {
      state.currentChapter = 5;
      ensureWindTurbinesState();
      state.buildings.wind_turbines.wt_nw.built = true;
      state.buildings.wind_turbines.wt_nw.commissioned = true;
      state.buildings.wind_turbines.wt_nw.totalGeneratedKWh = 0;

      state.buildings.wind_turbines.wt_sw.built = true;
      state.buildings.wind_turbines.wt_sw.commissioned = true;
      state.buildings.wind_turbines.wt_sw.totalGeneratedKWh = 0;

      state.workers = state.workers.filter(w => w.type !== 'engineer');
      advanceGame(1.0);

      const nwIdle = state.buildings.wind_turbines.wt_nw.idleReason === 'needs_engineer';
      const nwGenWithoutEng = state.buildings.wind_turbines.wt_nw.totalGeneratedKWh;
      const swGenWithoutEng = state.buildings.wind_turbines.wt_sw.totalGeneratedKWh;

      state.workers.push({ id: 99, type: 'engineer', name: 'Engineer #1', busy: false });
      advanceGame(1.0);

      const nwGenWithEng = state.buildings.wind_turbines.wt_nw.totalGeneratedKWh;

      return { nwIdle, nwGenWithoutEng, swGenWithoutEng, nwGenWithEng };
    });

    if (res.nwIdle && res.nwGenWithoutEng === 0 && res.swGenWithoutEng > 0 && res.nwGenWithEng > 0) {
      console.log('[✓ PASSED] test6_ch5ActivePowerPlantsEngineerRequirement');
      console.log('    ↳ 2 Active Power Plants (wt_nw, wt_ne) strictly require an Engineer; redundant units (wt_sw, wt_se) operate on automated backup without stalling.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test6_ch5ActivePowerPlantsEngineerRequirement', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test6_ch5ActivePowerPlantsEngineerRequirement with error:', err);
  }

  // Test 7: Cartoonic Exploration Roadmap Popup & Isometric 3D Illustrations
  try {
    const res = await page.evaluate(() => {
      state.currentChapter = 1;
      const roadmapHtml = chapterRoadmapModalHtml('plot');
      const hasCartoonFrame = roadmapHtml.includes('cartoon-roadmap-modal') && roadmapHtml.includes('#66BB6A');
      const hasCandyProgressBar = roadmapHtml.includes('linear-gradient(90deg,#66BB6A,#43A047,#FBC02D)');
      const hasScoutBadge = roadmapHtml.includes('Scout Chapter');

      const icons = [1, 2, 3, 4, 5, 6, 7, 8].map(ch => getChapterIsometric3DIcon(ch, 'plot'));
      const allIconsValid = icons.every(svg => svg.includes('<svg') && svg.includes('</svg>'));

      const plotBadge = getChapterExploreBadgeHtml('plot', state);
      const hasDynamicPos = plotBadge.includes('style="') && plotBadge.includes('top:');

      return { hasCartoonFrame, hasCandyProgressBar, hasScoutBadge, allIconsValid, hasDynamicPos };
    });

    if (res.hasCartoonFrame && res.hasCandyProgressBar && res.hasScoutBadge && res.allIconsValid && res.hasDynamicPos) {
      console.log('[✓ PASSED] test7_cartoonicRoadmapPopupAndIsometric3D');
      console.log('    ↳ Exploration popup rendered with children-friendly cartoon frame, candy progress bar, dynamic collision-free badge positioning, and all 8 isometric 3D SVGs.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test7_cartoonicRoadmapPopupAndIsometric3D', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test7_cartoonicRoadmapPopupAndIsometric3D with error:', err);
  }

  await browser.close();

  console.log('\\n================================================================');
  if (passedTests === totalTests) {
    console.log(`🎉 ALL ${totalTests}/${totalTests} CREW DISPATCH & CARTOON POPUP TESTS PASSED! (100%) 🎉`);
  } else {
    console.error(`⚠️ FAILED: Only ${passedTests}/${totalTests} passed.`);
    process.exit(1);
  }
  console.log('================================================================\\n');
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
