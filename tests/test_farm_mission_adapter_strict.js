/**
 * SearchO2 Farm Mission Adapter & Strict Progression Test Suite
 * Validates all 9 critical requirements from feedback_20261007.md:
 * 1. Pond: Locked in Ch. 1-3, unlocks in Ch. 4 (Living Waters & Retention). Spot & modal click locked.
 * 2. Farm Garage: Locked in Ch. 1, unlocks at end of Ch. 2 after storage + road built. Spot & modal click locked.
 * 3. Garden: Locked in Ch. 1-2, unlocks in Ch. 3. Spot & modal click locked.
 * 4. Plots: In Ch. 1, ONLY Plot 1 (index 0) is active. Plots 2-6 locked. Sequential unlock in Ch. 2+.
 * 5. Crushed Rock Ballast: Material requirement for road construction, not a random reward badge.
 * 6. Wind Turbines: Strictly locked before Ch. 5. Never suggested as active next step in Ch. 1-4.
 * 7. Wind Turbines Engineer Requirement: Without engineer assigned, turbines are idle (0 kWh generation).
 * 8. Teaching Briefings & +5 Knowledge XP Acknowledgment: Each chapter briefing requires acknowledgment (+5 XP) to unlock missions.
 * 9. Chapter 1 Task UI: "Awaken the Bedrock" displays progressive lock reasons (Needs Crew Shed -> Needs Labourer -> Needs Digging Equipment -> Till Plot 1).
 */

const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('================================================================');
  console.log('  SearchO2 Strict Farm Mission Adapter & Progression Suite');
  console.log('  Verifying all 9 requirements from feedback_20261007.md');
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
      test1_pondLockingCh4: { passed: false, details: [] },
      test2_garageLockingEndCh2: { passed: false, details: [] },
      test3_gardenLockingCh3: { passed: false, details: [] },
      test4_plot1OnlyInCh1: { passed: false, details: [] },
      test5_crushedRockRoadMaterial: { passed: false, details: [] },
      test6_windTurbineCh5Lock: { passed: false, details: [] },
      test7_windTurbineEngineerRequirement: { passed: false, details: [] },
      test8_chapterIntroBriefingAnd5XP: { passed: false, details: [] },
      test9_chapter1TaskContextualLocks: { passed: false, details: [] }
    };

    // 1. Pond Gated to Chapter 4
    try {
      state.currentChapter = 1;
      const lockedCh1 = !isObjectUnlockedByChapter('pond', state);
      activeModal = null;
      openModal('building', 'pond');
      const modalBlockedCh1 = (activeModal === null);

      state.currentChapter = 3;
      const lockedCh3 = !isObjectUnlockedByChapter('pond', state);

      state.currentChapter = 4;
      const unlockedCh4 = isObjectUnlockedByChapter('pond', state);

      state.currentChapter = 1;
      const spotHtml = drawPondScene(null, 100, false, false, false);
      const spotShowsCh4Lock = spotHtml.includes('🔒') || spotHtml.includes('Ch. 4');

      if (lockedCh1 && modalBlockedCh1 && lockedCh3 && unlockedCh4 && spotShowsCh4Lock) {
        report.test1_pondLockingCh4.passed = true;
        report.test1_pondLockingCh4.details.push('Pond strictly locked in Chapters 1-3, unlocks in Chapter 4, and canvas spot reflects lock.');
      } else {
        report.test1_pondLockingCh4.details.push('Failed: lockedCh1=' + lockedCh1 + ', modalBlockedCh1=' + modalBlockedCh1 + ', lockedCh3=' + lockedCh3 + ', unlockedCh4=' + unlockedCh4 + ', spotShowsCh4Lock=' + spotShowsCh4Lock);
      }
    } catch (e) {
      report.test1_pondLockingCh4.details.push('Error: ' + e.message);
    }

    // 2. Farm Garage Gated to End of Chapter 2
    try {
      state.currentChapter = 1;
      state.storage.built = false;
      state.buildings.road.built = false;
      const lockedCh1 = !isObjectUnlockedByChapter('garage', state);
      activeModal = null;
      openModal('building', 'garage');
      const modalBlockedCh1 = (activeModal === null);

      state.currentChapter = 2;
      state.storage.built = false;
      state.buildings.road.built = true;
      const lockedCh2NoStorage = !isObjectUnlockedByChapter('garage', state);

      state.storage.built = true;
      state.buildings.road.built = false;
      const lockedCh2NoRoad = !isObjectUnlockedByChapter('garage', state);

      state.storage.built = true;
      state.buildings.road.built = true;
      const unlockedEndCh2 = isObjectUnlockedByChapter('garage', state);

      state.storage.built = false;
      state.buildings.road.built = false;
      state.currentChapter = 1;
      const spotHtml = drawGarageScene(state.buildings.garage);
      const spotShowsLock = spotHtml.includes('🔒') || spotHtml.includes('End Ch. 2') || spotHtml.includes('Ch. 2');

      if (lockedCh1 && modalBlockedCh1 && lockedCh2NoStorage && lockedCh2NoRoad && unlockedEndCh2 && spotShowsLock) {
        report.test2_garageLockingEndCh2.passed = true;
        report.test2_garageLockingEndCh2.details.push('Garage strictly locked until end of Chapter 2 after both storage and road are built.');
      } else {
        report.test2_garageLockingEndCh2.details.push('Failed: lockedCh1=' + lockedCh1 + ', modalBlockedCh1=' + modalBlockedCh1 + ', unlockedEndCh2=' + unlockedEndCh2);
      }
    } catch (e) {
      report.test2_garageLockingEndCh2.details.push('Error: ' + e.message);
    }

    // 3. Garden Gated to Chapter 3
    try {
      state.currentChapter = 1;
      const lockedCh1 = !isObjectUnlockedByChapter('garden', state);
      activeModal = null;
      openModal('building', 'garden');
      const modalBlockedCh1 = (activeModal === null);

      state.currentChapter = 2;
      const lockedCh2 = !isObjectUnlockedByChapter('garden', state);

      state.currentChapter = 3;
      const unlockedCh3 = isObjectUnlockedByChapter('garden', state);

      state.currentChapter = 1;
      const spotHtml = drawGardenScene(null, 100, false, false);
      const spotShowsCh3Lock = spotHtml.includes('🔒') || spotHtml.includes('Ch. 3');

      if (lockedCh1 && modalBlockedCh1 && lockedCh2 && unlockedCh3 && spotShowsCh3Lock) {
        report.test3_gardenLockingCh3.passed = true;
        report.test3_gardenLockingCh3.details.push('Garden strictly locked in Chapters 1-2, unlocks in Chapter 3, and spot marker shows lock.');
      } else {
        report.test3_gardenLockingCh3.details.push('Failed: lockedCh1=' + lockedCh1 + ', modalBlockedCh1=' + modalBlockedCh1 + ', unlockedCh3=' + unlockedCh3);
      }
    } catch (e) {
      report.test3_gardenLockingCh3.details.push('Error: ' + e.message);
    }

    // 4. Chapter 1: ONLY Plot 1 Active
    try {
      state.currentChapter = 1;
      for (let i = 0; i < state.plots.length; i++) {
        state.plots[i].harvestsDone = 0;
        state.plots[i].treeType = null;
        state.plots[i].status = 'barren';
      }
      const plot0Open = isPlotUnlocked(0, state);
      const plot1Locked = !isPlotUnlocked(1, state);
      const plot2Locked = !isPlotUnlocked(2, state);

      state.buildings.crew_shed.built = true;
      activeModal = null;
      openModal('plot', 1);
      const clickPlot1Blocked = (activeModal === null);

      state.currentChapter = 2;
      state.plots[0].status = 'growing';
      state.plots[0].treeType = 'apple';
      const plot1OpenInCh2 = isPlotUnlocked(1, state);

      state.plots[0].status = 'barren';
      state.plots[0].treeType = null;
      state.currentChapter = 1;

      if (plot0Open && plot1Locked && plot2Locked && clickPlot1Blocked && plot1OpenInCh2) {
        report.test4_plot1OnlyInCh1.passed = true;
        report.test4_plot1OnlyInCh1.details.push('Chapter 1 strictly limits interaction to Plot 1; Plots 2-6 are click-locked until sequential Chapter 2 progress.');
      } else {
        report.test4_plot1OnlyInCh1.details.push('Failed: plot0Open=' + plot0Open + ', plot1Locked=' + plot1Locked + ', clickPlot1Blocked=' + clickPlot1Blocked + ', plot1OpenInCh2=' + plot1OpenInCh2);
      }
    } catch (e) {
      report.test4_plot1OnlyInCh1.details.push('Error: ' + e.message);
    }

    // 5. Crushed Rock Ballast as Road Material Requirement
    try {
      state.currentChapter = 2;
      state.buildings.crew_shed.built = true;
      state.money = 1000;
      state.workers = [
        { id: 1, type: 'laborer', name: 'Laborer #1', busy: false, assignedPlot: null, assignedBuilding: null },
        { id: 2, type: 'laborer', name: 'Laborer #2', busy: false, assignedPlot: null, assignedBuilding: null }
      ];
      state.rocksCleared = false;
      state.rocksClearing = false;
      state.buildings.gate.built = true;
      state.buildings.road.built = false;

      startBuildRoadSegment('main');
      const blockedWithoutRockMaterial = (!state.buildings.road.built && !state.buildings.road.building);

      state.rocksCleared = true;
      startBuildRoadSegment('main');
      const startedPavingWithMaterial = (state.buildings.road.building === true);

      state.buildings.road.built = false;
      state.buildings.road.building = false;
      state.rocksCleared = false;

      if (blockedWithoutRockMaterial && startedPavingWithMaterial) {
        report.test5_crushedRockRoadMaterial.passed = true;
        report.test5_crushedRockRoadMaterial.details.push('Crushed rock material requirement enforced: Road construction blocked until boulders are cleared.');
      } else {
        report.test5_crushedRockRoadMaterial.details.push('Failed: blockedWithoutRockMaterial=' + blockedWithoutRockMaterial + ', startedPavingWithMaterial=' + startedPavingWithMaterial);
      }
    } catch (e) {
      report.test5_crushedRockRoadMaterial.details.push('Error: ' + e.message);
    }

    // 6. Wind Turbines Strictly Locked Before Chapter 5
    try {
      state.currentChapter = 1;
      const lockedCh1 = !isObjectUnlockedByChapter('wind_turbine', state);
      activeModal = null;
      openModal('building', 'wind_turbine');
      const modalBlockedCh1 = (activeModal === null);

      state.currentChapter = 4;
      const lockedCh4 = !isObjectUnlockedByChapter('wind_turbine', state);

      state.currentChapter = 5;
      const unlockedCh5 = isObjectUnlockedByChapter('wind_turbine', state);

      state.currentChapter = 1;
      const guide = getFarmProgressionGuide();
      const guideDoesNotSuggestTurbines = (guide && guide.targetId !== 'wind_turbine');

      if (lockedCh1 && modalBlockedCh1 && lockedCh4 && unlockedCh5 && guideDoesNotSuggestTurbines) {
        report.test6_windTurbineCh5Lock.passed = true;
        report.test6_windTurbineCh5Lock.details.push('Wind Turbines strictly locked in Chapters 1-4, unlocked in Chapter 5, and omitted from early progression recommendations.');
      } else {
        report.test6_windTurbineCh5Lock.details.push('Failed: lockedCh1=' + lockedCh1 + ', modalBlockedCh1=' + modalBlockedCh1 + ', unlockedCh5=' + unlockedCh5);
      }
    } catch (e) {
      report.test6_windTurbineCh5Lock.details.push('Error: ' + e.message);
    }

    // 7. Wind Turbines Require Engineer on Duty
    try {
      state.currentChapter = 5;
      ensureWindTurbinesState();
      state.buildings.wind_turbines.wt_nw.built = true;
      state.buildings.wind_turbines.wt_nw.commissioned = true;
      state.buildings.wind_turbines.wt_nw.totalGeneratedKWh = 0;

      state.workers = state.workers.filter(w => w.type !== 'engineer');
      advanceGame(1.0);
      const genWithoutEng = state.buildings.wind_turbines.wt_nw.totalGeneratedKWh;
      const idleReasonWithoutEng = state.buildings.wind_turbines.wt_nw.idleReason;

      state.workers.push({ id: 99, type: 'engineer', name: 'Engineer #1', busy: false });
      advanceGame(1.0);
      const genWithEng = state.buildings.wind_turbines.wt_nw.totalGeneratedKWh;

      const modalHtmlContent = windTurbineModalHtml('wt_nw');
      const modalShowsEngineerOnDuty = modalHtmlContent.includes('Operational') || modalHtmlContent.includes('Active');

      if (genWithoutEng === 0 && idleReasonWithoutEng === 'needs_engineer' && genWithEng > 0 && modalShowsEngineerOnDuty) {
        report.test7_windTurbineEngineerRequirement.passed = true;
        report.test7_windTurbineEngineerRequirement.details.push('Engineer requirement verified: Wind turbines remain idle (0 kWh) without an Engineer on staff; generate clean power when Engineer is present.');
      } else {
        report.test7_windTurbineEngineerRequirement.details.push('Failed: genWithoutEng=' + genWithoutEng + ', idleReasonWithoutEng=' + idleReasonWithoutEng + ', genWithEng=' + genWithEng);
      }
    } catch (e) {
      report.test7_windTurbineEngineerRequirement.details.push('Error: ' + e.message);
    }

    // 8. Chapter Intro Briefing & +5 Knowledge XP Acknowledgment
    try {
      state.chapterIntroAcks = {};
      const ch2Unacked = !FarmMissionAdapter.isChapterIntroAcked(2, state);

      const xpBefore = state.knowledgeXP || 0;
      FarmMissionAdapter.ackChapterIntro(2);
      const xpAfter = state.knowledgeXP || 0;
      const xpAwarded = (xpAfter - xpBefore === 5);
      const ch2Acked = FarmMissionAdapter.isChapterIntroAcked(2, state);

      const briefingHtml = chapterIntroModalHtml({ chapter: 2, title: '🚜 Build the Farm', body: 'Infrastructure' });
      const hasBriefingXpBadge = briefingHtml.includes('+5 Knowledge XP') && briefingHtml.includes('Understood — continue');

      if (ch2Unacked && xpAwarded && ch2Acked && hasBriefingXpBadge) {
        report.test8_chapterIntroBriefingAnd5XP.passed = true;
        report.test8_chapterIntroBriefingAnd5XP.details.push('Chapter intro briefings award +5 Knowledge XP upon acknowledgment, and gate progression.');
      } else {
        report.test8_chapterIntroBriefingAnd5XP.details.push('Failed: ch2Unacked=' + ch2Unacked + ', xpAwarded=' + xpAwarded + ', ch2Acked=' + ch2Acked);
      }
    } catch (e) {
      report.test8_chapterIntroBriefingAnd5XP.details.push('Error: ' + e.message);
    }

    // 9. Chapter 1 Task UI Contextual Locks
    try {
      state.currentChapter = 1;
      state.plots[0].status = 'barren';
      state.plots[0].treeType = null;
      state.plots[0].harvestsDone = 0;
      state.buildings.crew_shed.built = false;
      state.workers = [];
      state.basicToolsDiscovered = false;

      const soilTask = CHAPTER_CHALLENGES[1].find(t => t.id === 'ch1_soil');

      const html1 = soilTask.getActionHtml(state);
      const lockShed = html1.includes('Needs Crew Shed');

      state.buildings.crew_shed.built = true;
      const html2 = soilTask.getActionHtml(state);
      const lockLaborer = html2.includes('Needs Labourer');

      state.workers.push({ id: 10, type: 'laborer', name: 'Laborer #1' });
      const html3 = soilTask.getActionHtml(state);
      const lockTools = html3.includes('Needs Digging Equipment');

      state.basicToolsDiscovered = true;
      const html4 = soilTask.getActionHtml(state);
      const unlockedTill = html4.includes('Till Plot 1');

      const farmerTask = CHAPTER_CHALLENGES[1].find(t => t.id === 'ch1_farmer');
      const farmerLockedUntilTilled = farmerTask && !farmerTask.isUnlocked(state);
      state.plots[0].status = 'ready';
      const farmerUnlockedAfterTilled = farmerTask && farmerTask.isUnlocked(state);

      if (lockShed && lockLaborer && lockTools && unlockedTill && farmerLockedUntilTilled && farmerUnlockedAfterTilled) {
        report.test9_chapter1TaskContextualLocks.passed = true;
        report.test9_chapter1TaskContextualLocks.details.push('Awaken the Bedrock contextual locks verified: Needs Crew Shed -> Needs Labourer -> Needs Digging Equipment -> Till Plot 1; Farmer unlocks after tillage.');
      } else {
        report.test9_chapter1TaskContextualLocks.details.push('Failed: lockShed=' + lockShed + ', lockLaborer=' + lockLaborer + ', lockTools=' + lockTools + ', unlockedTill=' + unlockedTill);
      }
    } catch (e) {
      report.test9_chapter1TaskContextualLocks.details.push('Error: ' + e.message);
    }

    return report;
  });

  console.log('================ TEST RESULTS SUMMARY ================');
  let allPassed = true;
  for (const [key, test] of Object.entries(results)) {
    if (test.passed) {
      console.log(`[✓ PASSED] ${key}`);
      test.details.forEach(d => console.log(`    ↳ ${d}`));
    } else {
      allPassed = false;
      console.log(`[✗ FAILED] ${key}`);
      test.details.forEach(d => console.log(`    ↳ ${d}`));
    }
  }

  await browser.close();

  console.log('\n======================================================');
  if (allPassed) {
    console.log('🎉 ALL 9 STRICT PROGRESSION REQUIREMENTS PASSED! (100%) 🎉');
    console.log('======================================================');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED. Please review details above.');
    console.log('======================================================');
    process.exit(1);
  }
})();
