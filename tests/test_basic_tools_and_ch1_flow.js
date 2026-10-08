/**
 * SearchO2 Chapter 1 Solo Founder Flow & 3D Jute Tarp Tool Discovery Test Suite
 * Validating:
 * 1. Initial State: All facilities locked in Ch 1 (including Crew Shed), initial task "Explore Chapters", soil digging requires uncovered tools.
 * 2. 3D Isometric Jute Tarp Tool Discovery: 8 chapters explored unlocks jute tarp cache, interactive modal with 3D SVG, What & Why educational rationale, +10 XP.
 * 3. Soil Tillage Scaling: Basic hand tools take 3.5 game-hours vs 2.0h with advanced equipment.
 * 4. Equipment Depot Chapter 1 Lock: Educational notice in Ch. 1 explaining hand tools vs Ch. 2 heavy machinery.
 * 5. Task List Modal & Chapter Challenges: All 5 milestones render cleanly in Chapter 1 without alignment issues.
 * 6. Beside-Menu Active Task Capsule: Compact labels (Explore Chapters -> Uncover Tools -> Till Plot 1 -> Plant Crop -> Water Seedling).
 */

const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('====================================================');
  console.log('  SearchO2 Chapter 1 Solo Founder & Jute Tarp Tool Test Suite');
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
      test1_soloFounderChapter1LocksAndExploration: { passed: false, details: [] },
      test2_juteTarpHiddenObjectAndToolDiscovery: { passed: false, details: [] },
      test3_manualTillageDurationScaling: { passed: false, details: [] },
      test4_equipmentDepotCh1Lock: { passed: false, details: [] },
      test5_chapter1TaskChallengesList: { passed: false, details: [] },
      test6_activeTaskCapsuleCompactLabels: { passed: false, details: [] }
    };

    try {
      // =======================================================================
      // TEST 1: Solo Founder Initial State & Chapter Exploration Prerequisite
      // =======================================================================
      state.currentChapter = 1;
      state.storage.built = false;
      state.buildings.crew_shed.built = false;
      state.basicToolsDiscovered = false;
      state.juteTarpUncovered = false;
      state.exploredChapterObjects = {};
      state.exploredChapters = {};
      state.allChaptersExplored = false;
      state.plots[0].status = 'barren';
      render();

      const guideInitial = getFarmProgressionGuide();
      const capsuleTextInitial = document.getElementById('guideCapsuleText') ? document.getElementById('guideCapsuleText').textContent.trim() : '';
      const hasExploreChaptersLabel = capsuleTextInitial === 'Explore Chapters' && guideInitial.compactLabel === 'Explore Chapters';

      // Verify Crew Shed is strictly locked in Chapter 1
      const crewShedLocked = !isObjectUnlockedByChapter('crew_shed', state);

      // Attempt to dig soil before tools are uncovered from the jute tarp cache -> blocked and opens Jute Tarp modal
      activeModal = null;
      startPrep(0);
      const stillBarren = (state.plots[0].status === 'barren');
      const isJuteTarpModalOpen = (activeModal && activeModal.type === 'jute_tarp');
      closeModal();

      if (hasExploreChaptersLabel && crewShedLocked && stillBarren && isJuteTarpModalOpen) {
        report.test1_soloFounderChapter1LocksAndExploration.passed = true;
        report.test1_soloFounderChapter1LocksAndExploration.details.push('Solo Founder Chapter 1 locks verified: Crew Shed strictly locked, capsule shows "Explore Chapters", and digging plot without tools prompts the Jute Tarp Tool Cache.');
      } else {
        report.test1_soloFounderChapter1LocksAndExploration.details.push(`Failed: hasExploreChaptersLabel=${hasExploreChaptersLabel} (${capsuleTextInitial}), crewShedLocked=${crewShedLocked}, stillBarren=${stillBarren}, isJuteTarpModalOpen=${isJuteTarpModalOpen}`);
      }
    } catch (e) {
      report.test1_soloFounderChapter1LocksAndExploration.details.push('Error: ' + e.message);
    }

    try {
      // =======================================================================
      // TEST 2: Jute Tarp Hidden Object, 8-Chapter Survey & Tool Uncovering
      // =======================================================================
      state.currentChapter = 1;
      state.basicToolsDiscovered = false;
      state.juteTarpUncovered = false;
      state.exploredChapterObjects = {};
      state.exploredChapters = {};
      state.allChaptersExplored = false;
      state.knowledgeXP = 0;
      render();

      // Check 3D Jute Tarp SVG rendering before unlock
      const initialTarpSvg = drawJuteTarpScene(false, false);
      const hasTarpGeometry = initialTarpSvg.includes('jute-tarp-scene-svg') && initialTarpSvg.includes('juteBurlapTop');

      // Clicking tarp before 8 chapters explored displays locked roadmap prompt
      openJuteTarpModal();
      const lockedModalContent = modalHtml();
      const hasLockedExplorationPrompt = lockedModalContent.includes('EXPLORE ALL 8 CHAPTERS FIRST') || lockedModalContent.includes('Explore all 8');
      closeModal();

      // Survey all 8 chapters by clicking locked facilities
      const exploreTargets = ['plot', 'crew_shed', 'garden', 'pond', 'wind_turbine', 'juice_bar', 'eco_passport', 'space_mission'];
      exploreTargets.forEach(key => exploreChapterObject(key));
      const expCount = getExploredChaptersCount(state);
      const allExplored = (expCount >= 8) && (state.allChaptersExplored === true);

      // Now open Jute Tarp modal -> it should be ready to uncover!
      openJuteTarpModal();
      const unlockedModalContent = modalHtml();
      const hasUncoverButton = unlockedModalContent.includes('Uncover Hand Tools Cache') || unlockedModalContent.includes('uncoverJuteTarpAction');

      // Click to uncover the tools (+10 Knowledge XP)
      uncoverJuteTarpAction();
      const toolsDiscovered = (state.basicToolsDiscovered === true) && (state.juteTarpUncovered === true);
      const earnedXP = (state.knowledgeXP >= 10);

      // Verify educational discovery modal was opened
      const discoveryContent = modalHtml();
      const hasEducationalWhat = discoveryContent.includes('WHAT IS THIS EQUIPMENT?') && discoveryContent.includes('Hand-Forged Trenching Spade');
      const hasEducationalWhy = discoveryContent.includes('WHY MANUAL AERATION BEFORE PLANTING?') && discoveryContent.includes('aerobic bacteria');

      discoverBasicToolsAction();
      const modalClosed = (activeModal === null);

      if (hasTarpGeometry && hasLockedExplorationPrompt && allExplored && hasUncoverButton && hasEducationalWhat && hasEducationalWhy && toolsDiscovered && earnedXP && modalClosed) {
        report.test2_juteTarpHiddenObjectAndToolDiscovery.passed = true;
        report.test2_juteTarpHiddenObjectAndToolDiscovery.details.push('3D Jute Tarp Tool Discovery verified: 3D SVG rendered, 8-chapter survey unlocks cache, What & Why biophysical rationale shown, tools uncovered, and +10 Knowledge XP awarded.');
      } else {
        report.test2_juteTarpHiddenObjectAndToolDiscovery.details.push(`Failed: hasTarpGeometry=${hasTarpGeometry}, hasLockedExplorationPrompt=${hasLockedExplorationPrompt}, allExplored=${allExplored} (${expCount}/8), hasUncoverButton=${hasUncoverButton}, hasEducationalWhat=${hasEducationalWhat}, toolsDiscovered=${toolsDiscovered}, earnedXP=${earnedXP}`);
      }
    } catch (e) {
      report.test2_juteTarpHiddenObjectAndToolDiscovery.details.push('Error: ' + e.message);
    }

    try {
      // =======================================================================
      // TEST 3: Manual Tillage Duration Scaling (3.5h basic vs 2.0h advanced)
      // =======================================================================
      state.currentChapter = 1;
      state.basicToolsDiscovered = true;
      state.juteTarpUncovered = true;
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

      const hasSurveyChallenge = taskListHtml.includes('Survey Estate Masterplan') || taskListHtml.includes('Explore Chapters');
      const hasToolsChallenge = taskListHtml.includes('Jute Tarp Tool Cache') || taskListHtml.includes('Uncover Tools');
      const hasSoilChallenge = taskListHtml.includes('Awaken the Bedrock') && taskListHtml.includes('Till Plot 1');
      const hasPlantChallenge = taskListHtml.includes('First Breath of Life');
      const hasVitalityChallenge = taskListHtml.includes('Clean O₂ Vitality') || taskListHtml.includes('Breathable O₂');
      const hasWhyButtons = taskListHtml.includes('Why') && taskListHtml.includes('Masterplan');

      closePanel();

      if (hasSurveyChallenge && hasToolsChallenge && hasSoilChallenge && hasPlantChallenge && hasVitalityChallenge && hasWhyButtons) {
        report.test5_chapter1TaskChallengesList.passed = true;
        report.test5_chapter1TaskChallengesList.details.push('Chapter 1 Task Challenges verified: Displays Survey Masterplan -> Uncover Tools -> Till Plot 1 -> Plant Seedling -> Clean O2 with interactive Why buttons.');
      } else {
        report.test5_chapter1TaskChallengesList.details.push(`Failed: hasSurveyChallenge=${hasSurveyChallenge}, hasToolsChallenge=${hasToolsChallenge}, hasSoilChallenge=${hasSoilChallenge}, hasPlantChallenge=${hasPlantChallenge}, hasVitalityChallenge=${hasVitalityChallenge}, hasWhyButtons=${hasWhyButtons}`);
      }
    } catch (e) {
      report.test5_chapter1TaskChallengesList.details.push('Error: ' + e.message);
    }

    try {
      // =======================================================================
      // TEST 6: Active Task Capsule Compact Labels
      // =======================================================================
      state.currentChapter = 1;
      
      // Stage A: Before 8 chapters explored
      state.allChaptersExplored = false;
      state.exploredChapterObjects = {};
      state.exploredChapters = {};
      state.basicToolsDiscovered = false;
      state.juteTarpUncovered = false;
      state.plots[0].status = 'barren';
      state.plots[0].treeType = null;
      render();
      const labelA = document.getElementById('guideCapsuleText').textContent.trim();

      // Stage B: 8 chapters explored, tools under tarp
      state.allChaptersExplored = true;
      state.basicToolsDiscovered = false;
      state.juteTarpUncovered = false;
      render();
      const labelB = document.getElementById('guideCapsuleText').textContent.trim();

      // Stage C: Tools Discovered, Soil Untilled
      state.basicToolsDiscovered = true;
      state.juteTarpUncovered = true;
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

      const cleanA = labelA === 'Explore Chapters';
      const cleanB = labelB === 'Uncover Tools';
      const cleanC = labelC === 'Till Plot 1';
      const cleanD = labelD === 'Plant Crop';
      const cleanE = labelE === 'Water Seedling';

      if (cleanA && cleanB && cleanC && cleanD && cleanE) {
        report.test6_activeTaskCapsuleCompactLabels.passed = true;
        report.test6_activeTaskCapsuleCompactLabels.details.push(`Active task capsule compact labels verified: "${labelA}" ➔ "${labelB}" ➔ "${labelC}" ➔ "${labelD}" ➔ "${labelE}" (concise, less text, exactly matching solo founder progression).`);
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
    console.log('🎉 ALL CHAPTER 1 & 3D JUTE TARP TOOL TESTS PASSED! (100%) 🎉');
    console.log('======================================================');
    process.exit(0);
  } else {
    console.log('\n======================================================');
    console.log('❌ SOME TESTS FAILED. Please review details above.');
    console.log('======================================================');
    process.exit(1);
  }
})();
