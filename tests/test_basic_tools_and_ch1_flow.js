/**
 * SearchO2 Chapter 1 Flow & 3D Basic Tool Discovery Test Suite
 * Validating:
 * 1. Initial State: Crew Shed prerequisite for soil digging, compact capsule label "Build Crew Shed".
 * 2. 3D Isometric Basic Tool Discovery: Interactive modal with 3D SVG, What & Why educational rationale, +10 XP.
 * 3. Soil Tillage Scaling: Basic hand tools take 3.5 game-hours vs 2.0h with advanced equipment.
 * 4. Equipment Depot Chapter 1 Lock: Educational notice in Ch. 1 explaining hand tools vs Ch. 2 heavy machinery.
 * 5. Task List Modal & Chapter Challenges: All 4 milestones render cleanly in Chapter 1 without alignment issues.
 * 6. Beside-Menu Active Task Capsule: Compact labels with less text (Build Crew Shed -> Discover Tools -> Dig Soil -> Plant Crop).
 */

const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('====================================================');
  console.log('  SearchO2 Chapter 1 & 3D Basic Tool Test Suite');
  console.log('====================================================\n');

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
      test1_crewShedPrereqAndCapsule: { passed: false, details: [] },
      test2_basicToolDiscoveryModalAnd3DSvg: { passed: false, details: [] },
      test3_manualTillageDurationScaling: { passed: false, details: [] },
      test4_equipmentDepotCh1Lock: { passed: false, details: [] },
      test5_chapter1TaskChallengesList: { passed: false, details: [] },
      test6_activeTaskCapsuleCompactLabels: { passed: false, details: [] }
    };

    try {
      // =======================================================================
      // TEST 1: Crew Shed Must Be Built First & Soil Digging Prerequisite
      // =======================================================================
      state.currentChapter = 1;
      state.storage.built = false;
      state.buildings.crew_shed.built = false;
      state.basicToolsDiscovered = false;
      state.plots[0].status = 'barren';
      render();

      const guideInitial = getFarmProgressionGuide();
      const capsuleTextInitial = document.getElementById('guideCapsuleText') ? document.getElementById('guideCapsuleText').textContent.trim() : '';
      const hasBuildCrewShedLabel = capsuleTextInitial === 'Build Crew Shed' && guideInitial.compactLabel === 'Build Crew Shed';

      // Attempt to dig soil before Crew Shed is built -> blocked with prompt to build Crew Shed
      startPrep(0);
      const stillBarren = (state.plots[0].status === 'barren');
      const hasCrewShedPopup = !!document.getElementById('stepInstructionPopupWrapper');
      closeLockedStepPopup();

      if (hasBuildCrewShedLabel && stillBarren && hasCrewShedPopup) {
        report.test1_crewShedPrereqAndCapsule.passed = true;
        report.test1_crewShedPrereqAndCapsule.details.push('Crew Shed prerequisite enforced: Capsule shows "Build Crew Shed", and attempting soil digging opens Crew Shed locked instruction popup.');
      } else {
        report.test1_crewShedPrereqAndCapsule.details.push(`Failed: hasBuildCrewShedLabel=${hasBuildCrewShedLabel} (${capsuleTextInitial}), stillBarren=${stillBarren}, hasCrewShedPopup=${hasCrewShedPopup}`);
      }
    } catch (e) {
      report.test1_crewShedPrereqAndCapsule.details.push('Error: ' + e.message);
    }

    try {
      // =======================================================================
      // TEST 2: 3D Isometric Basic Tool Discovery Modal & XP Reward
      // =======================================================================
      state.buildings.crew_shed.built = true;
      state.basicToolsDiscovered = false;
      state.knowledgeXP = 0;
      render();

      const guideAfterShed = getFarmProgressionGuide();
      const capsuleTextAfterShed = document.getElementById('guideCapsuleText') ? document.getElementById('guideCapsuleText').textContent.trim() : '';
      const hasDiscoverToolsLabel = capsuleTextAfterShed === 'Discover Tools' && guideAfterShed.compactLabel === 'Discover Tools';

      // Attempting to prep plot now triggers the 3D tool discovery modal
      startPrep(0);
      const isDiscoveryModalOpen = (activeModal && activeModal.type === 'basic_equipment_discovery');
      const modalContent = modalHtml();
      const hasIsometricSpadeSvg = modalContent.includes('isometricHandSpadeSvg') && modalContent.includes('spadeBladeGrad');
      const hasEducationalWhat = modalContent.includes('WHAT IS THIS EQUIPMENT?') && modalContent.includes('Hand-Forged Trenching Spade');
      const hasEducationalWhy = modalContent.includes('WHY MANUAL AERATION BEFORE PLANTING?') && modalContent.includes('aerobic bacteria');
      const hasEffortNotice = modalContent.includes('TILLAGE EFFORT &amp; TIME MECHANICS') && modalContent.includes('3.5 game-hours');

      // Discover and equip basic tools (+10 XP)
      discoverBasicToolsAction(null);
      const toolsDiscovered = (state.basicToolsDiscovered === true);
      const earnedXP = (state.knowledgeXP >= 10);
      const modalClosed = (activeModal === null);

      if (hasDiscoverToolsLabel && isDiscoveryModalOpen && hasIsometricSpadeSvg && hasEducationalWhat && hasEducationalWhy && hasEffortNotice && toolsDiscovered && earnedXP && modalClosed) {
        report.test2_basicToolDiscoveryModalAnd3DSvg.passed = true;
        report.test2_basicToolDiscoveryModalAnd3DSvg.details.push('3D Basic Tool Discovery verified: Interactive modal displays 3D isometric SVG, What & Why biophysical rationale, 3.5h duration mechanics, and awards +10 Knowledge XP.');
      } else {
        report.test2_basicToolDiscoveryModalAnd3DSvg.details.push(`Failed: hasDiscoverToolsLabel=${hasDiscoverToolsLabel}, isDiscoveryModalOpen=${isDiscoveryModalOpen}, hasIsometricSpadeSvg=${hasIsometricSpadeSvg}, hasEducationalWhat=${hasEducationalWhat}, hasEducationalWhy=${hasEducationalWhy}, toolsDiscovered=${toolsDiscovered}, earnedXP=${earnedXP}`);
      }
    } catch (e) {
      report.test2_basicToolDiscoveryModalAnd3DSvg.details.push('Error: ' + e.message);
    }

    try {
      // =======================================================================
      // TEST 3: Manual Tillage Duration Scaling (3.5h basic vs 2.0h advanced)
      // =======================================================================
      state.buildings.crew_shed.built = true;
      state.basicToolsDiscovered = true;
      state.equipment = { owned: {}, leased: {} };
      state.money = 1000;
      state.plots[0].status = 'barren';

      // Duration with basic hand spade
      const basicDur = getPlotPrepDurationHours(state);
      startPrep(0);
      const isPreparing = (state.plots[0].status === 'preparing');

      // Advance 2.5 game hours (with prepMult = 1) -> should NOT be ready yet because basic takes 3.5h
      advanceGame(2.5);
      const stillPreparingAt2_5h = (state.plots[0].status === 'preparing');

      // Advance another 1.1 hours (total 3.6h >= 3.5h) -> becomes ready
      advanceGame(1.1);
      const readyAt3_6h = (state.plots[0].status === 'ready');

      // Now test with advanced spade owned from Chapter 2
      state.equipment.owned.spade = true;
      const advancedDur = getPlotPrepDurationHours(state);

      if (basicDur === 3.5 && isPreparing && stillPreparingAt2_5h && readyAt3_6h && advancedDur === 2.0) {
        report.test3_manualTillageDurationScaling.passed = true;
        report.test3_manualTillageDurationScaling.details.push('Tillage duration scaling verified: Basic hand spade takes 3.5 game-hours (still preparing at 2.5h, ready at 3.6h), and advanced equipment accelerates tillage to 2.0h.');
      } else {
        report.test3_manualTillageDurationScaling.details.push(`Failed: basicDur=${basicDur}, isPreparing=${isPreparing}, stillPreparingAt2_5h=${stillPreparingAt2_5h}, readyAt3_6h=${readyAt3_6h}, advancedDur=${advancedDur}`);
      }
    } catch (e) {
      report.test3_manualTillageDurationScaling.details.push('Error: ' + e.message);
    }

    try {
      // =======================================================================
      // TEST 4: Equipment Depot Locked in Chapter 1 with Educational Screen
      // =======================================================================
      state.currentChapter = 1;
      openEquipmentStoreModal();
      const ch1DepotHtml = modalHtml();
      const hasLockedTitle = ch1DepotHtml.includes('Locked · Unlocks in Chapter 2');
      const hasFoundationalFocus = ch1DepotHtml.includes('CHAPTER 1 FOCUS: FOUNDATIONAL HAND TOOLS');
      const hasHandToolCard = ch1DepotHtml.includes('Traditional Hand Trenching Spade &amp; Broadfork');
      closeModal();

      // Advance to Chapter 2 (harvest on Plot 0 so Chapter 1 is complete)
      state.plots[0].status = 'growing';
      state.plots[0].treeType = 'apple';
      state.plots[0].harvestsDone = 1;
      updateChapterProgression();
      openEquipmentStoreModal();
      const ch2DepotHtml = modalHtml();
      const hasTractorStore = ch2DepotHtml.includes('Diesel Field Tractor') && ch2DepotHtml.includes('600');
      closeModal();

      // Reset
      state.currentChapter = 1;
      state.plots[0].harvestsDone = 0;

      if (hasLockedTitle && hasFoundationalFocus && hasHandToolCard && hasTractorStore) {
        report.test4_equipmentDepotCh1Lock.passed = true;
        report.test4_equipmentDepotCh1Lock.details.push('Equipment Depot locking verified: Chapter 1 shows educational lock explaining hand tools vs future machinery; Chapter 2 unlocks full store.');
      } else {
        report.test4_equipmentDepotCh1Lock.details.push(`Failed: hasLockedTitle=${hasLockedTitle}, hasFoundationalFocus=${hasFoundationalFocus}, hasHandToolCard=${hasHandToolCard}, hasTractorStore=${hasTractorStore}`);
      }
    } catch (e) {
      report.test4_equipmentDepotCh1Lock.details.push('Error: ' + e.message);
    }

    try {
      // =======================================================================
      // TEST 5: Chapter 1 Task Challenges List
      // =======================================================================
      state.currentChapter = 1;
      state.selectedChapterTab = 1;
      state.plots[0].status = 'barren';
      state.plots[0].treeType = null;
      openPanel = 'tasks';
      render();

      const fpEl = document.getElementById('floatPanel');
      const taskListHtml = fpEl ? fpEl.innerHTML : '';

      const hasCrewShedChallenge = taskListHtml.includes('Establish Crew Bunkhouse &amp; Workshop') || taskListHtml.includes('Crew Shed');
      const hasToolsChallenge = taskListHtml.includes('Discover Basic Digging Equipment') || taskListHtml.includes('Basic Tools');
      const hasSoilChallenge = taskListHtml.includes('Awaken the Bedrock') && taskListHtml.includes('Till Plot 1');
      const hasPlantChallenge = taskListHtml.includes('First Breath of Life');
      const hasWhyButtons = taskListHtml.includes('Why Crew Bunkhouse?') && taskListHtml.includes('Why Aerate Bedrock?');

      closePanel();

      if (hasCrewShedChallenge && hasToolsChallenge && hasSoilChallenge && hasPlantChallenge && hasWhyButtons) {
        report.test5_chapter1TaskChallengesList.passed = true;
        report.test5_chapter1TaskChallengesList.details.push('Chapter 1 Task Challenges verified: Displays Crew Shed -> Basic Tools -> Awaken Bedrock -> First Breath with interactive Why buttons.');
      } else {
        report.test5_chapter1TaskChallengesList.details.push(`Failed: hasCrewShedChallenge=${hasCrewShedChallenge}, hasToolsChallenge=${hasToolsChallenge}, hasSoilChallenge=${hasSoilChallenge}, hasPlantChallenge=${hasPlantChallenge}, hasWhyButtons=${hasWhyButtons}`);
      }
    } catch (e) {
      report.test5_chapter1TaskChallengesList.details.push('Error: ' + e.message);
    }

    try {
      // =======================================================================
      // TEST 6: Active Task Capsule Compact Labels (Less Text)
      // =======================================================================
      state.currentChapter = 1;
      
      // Stage A: Before Crew Shed
      state.plots[0].status = 'barren';
      state.plots[0].treeType = null;
      state.buildings.crew_shed.built = false;
      state.basicToolsDiscovered = false;
      render();
      const labelA = document.getElementById('guideCapsuleText').textContent.trim();

      // Stage B: Crew Shed Built, Tools Undiscovered
      state.buildings.crew_shed.built = true;
      state.basicToolsDiscovered = false;
      render();
      const labelB = document.getElementById('guideCapsuleText').textContent.trim();

      // Stage C: Tools Discovered, Soil Untilled
      state.basicToolsDiscovered = true;
      state.plots[0].status = 'barren';
      render();
      const labelC = document.getElementById('guideCapsuleText').textContent.trim();

      // Stage D: Soil Tilled, Unplanted
      state.plots[0].status = 'ready';
      render();
      const labelD = document.getElementById('guideCapsuleText').textContent.trim();

      // Stage E: Planted & Growing
      state.plots[0].status = 'growing';
      state.plots[0].treeType = 'apple';
      render();
      const labelE = document.getElementById('guideCapsuleText').textContent.trim();

      const cleanA = labelA === 'Build Crew Shed';
      const cleanB = labelB === 'Discover Tools';
      const cleanC = labelC === 'Dig Soil';
      const cleanD = labelD === 'Plant Crop';
      const cleanE = (labelE === 'Nurture Flora' || labelE === 'Hire Laborer');

      if (cleanA && cleanB && cleanC && cleanD && cleanE) {
        report.test6_activeTaskCapsuleCompactLabels.passed = true;
        report.test6_activeTaskCapsuleCompactLabels.details.push(`Active task capsule compact labels verified: "${labelA}" ➔ "${labelB}" ➔ "${labelC}" ➔ "${labelD}" ➔ "${labelE}" (concise, less text, zero redundant prefixes).`);
      } else {
        report.test6_activeTaskCapsuleCompactLabels.details.push(`Failed: labelA="${labelA}" (${cleanA}), labelB="${labelB}" (${cleanB}), labelC="${labelC}" (${cleanC}), labelD="${labelD}" (${cleanD}), labelE="${labelE}" (${cleanE})`);
      }
    } catch (e) {
      report.test6_activeTaskCapsuleCompactLabels.details.push('Error: ' + e.message);
    }

    return report;
  });

  await browser.close();

  let allPassed = true;
  for (const [testName, res] of Object.entries(results)) {
    if (res.passed) {
      console.log(`[✓ PASSED] ${testName}`);
      res.details.forEach(d => console.log(`    ↳ ${d}`));
    } else {
      allPassed = false;
      console.log(`[✗ FAILED] ${testName}`);
      res.details.forEach(d => console.log(`    ↳ ${d}`));
    }
  }

  if (allPassed) {
    console.log('\n======================================================');
    console.log('🎉 ALL CHAPTER 1 & 3D BASIC TOOL TESTS PASSED! (100%) 🎉');
    console.log('======================================================');
    process.exit(0);
  } else {
    console.log('\n======================================================');
    console.log('❌ SOME TESTS FAILED. Please review details above.');
    console.log('======================================================');
    process.exit(1);
  }
})();
