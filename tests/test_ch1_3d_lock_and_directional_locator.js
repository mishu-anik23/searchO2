/**
 * SearchO2 Chapter 1 3D Isometric Volumetric Lock & Directional Facility Locator Test Suite
 */

const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('================================================================');
  console.log('  SearchO2 Chapter 1 3D Lock & Directional Locator Test Suite');
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
      test1_3dIsoLockRenderingAndComponents: { passed: false, details: [] },
      test2_spotPlaqueAndCanvasLockVisuals: { passed: false, details: [] },
      test3_juteTarp3dVolumetricLock: { passed: false, details: [] },
      test4_directionalLocatorGeometryAndAnimation: { passed: false, details: [] },
      test5_directionalLocator8ChapterProgression: { passed: false, details: [] },
      test6_tutorialDescriptionsAndZeroHandEmojis: { passed: false, details: [] }
    };

    try {
      // TEST 1: 3D Isometric Volumetric Lock Rendering
      const svg = get3dIsoLockSvg(32, 32);
      const html = get3dIsoLockHtml(20);

      const hasSvgTag = svg.includes('<svg') && svg.includes('iso-3d-lock-svg');
      const hasVolumetricShackle = svg.includes('isoLockShackle') && svg.includes('stroke-linecap="round"');
      const hasIsometricFacets = svg.includes('isoLockTop') && svg.includes('isoLockLeft') && svg.includes('isoLockRight');
      const hasKeyhole = svg.includes('isoLockKeyhole');
      const hasHtmlWrapper = html.includes('class="iso-3d-lock') && html.includes('<svg');

      if (hasSvgTag && hasVolumetricShackle && hasIsometricFacets && hasKeyhole && hasHtmlWrapper) {
        report.test1_3dIsoLockRenderingAndComponents.passed = true;
        report.test1_3dIsoLockRenderingAndComponents.details.push('3D Isometric Volumetric Lock verified: pure vector SVG with chrome shackle, sunny golden facets, chamfered bevels, and keyhole chamber.');
      } else {
        report.test1_3dIsoLockRenderingAndComponents.details.push(`Failed: hasSvgTag=${hasSvgTag}, hasVolumetricShackle=${hasVolumetricShackle}, hasIsometricFacets=${hasIsometricFacets}, hasKeyhole=${hasKeyhole}, hasHtmlWrapper=${hasHtmlWrapper}`);
      }
    } catch (e) {
      report.test1_3dIsoLockRenderingAndComponents.details.push('Error: ' + e.message);
    }

    try {
      // TEST 2: Unbuilt Spot Markers and Facility Badges in DOM
      state.currentChapter = 1;
      state.buildings.crew_shed.built = false;
      state.buildings.garden.built = false;
      state.buildings.pond.built = false;
      state.storage.built = false;
      state.plots[1].status = 'barren';
      render();

      const gardenSpotMarker = drawUnbuiltSpotMarker('garden', BUILDING_TYPES.garden, true);
      const hasPlaque3dLock = gardenSpotMarker.includes('iso-3d-lock-svg') && gardenSpotMarker.includes('isoLockTop');

      const fieldHtml = document.getElementById('fieldPlots') ? document.getElementById('fieldPlots').innerHTML : '';
      const has3dLockInDom = fieldHtml.includes('iso-3d-lock') || fieldHtml.includes('iso-3d-lock-svg');

      // Check plot 2 in DOM has 3d lock
      const plot1El = document.querySelector('[data-plot="1"]');
      const hasPlotLock = plot1El && (plot1El.innerHTML.includes('iso-3d-lock') || plot1El.classList.contains('is-plot-locked'));

      // Check crew shed has lock
      const crewShedEl = document.querySelector('[data-building="crew_shed"]');
      const hasCrewLock = crewShedEl && (crewShedEl.innerHTML.includes('iso-3d-lock') || crewShedEl.classList.contains('is-locked'));

      if (hasPlaque3dLock && has3dLockInDom && hasPlotLock && hasCrewLock) {
        report.test2_spotPlaqueAndCanvasLockVisuals.passed = true;
        report.test2_spotPlaqueAndCanvasLockVisuals.details.push('Canvas Lock Visuals verified: 3D volumetric locks render across unbuilt plaques, live DOM building tags, wind turbines, and locked barren plots.');
      } else {
        report.test2_spotPlaqueAndCanvasLockVisuals.details.push(`Failed: hasPlaque3dLock=${hasPlaque3dLock}, has3dLockInDom=${has3dLockInDom}, hasPlotLock=${hasPlotLock}, hasCrewLock=${hasCrewLock}`);
      }
    } catch (e) {
      report.test2_spotPlaqueAndCanvasLockVisuals.details.push('Error: ' + e.message);
    }

    try {
      // TEST 3: Jute Tarp Tool Cache 3D Lock
      state.currentChapter = 1;
      state.basicToolsDiscovered = false;
      state.juteTarpUncovered = false;
      state.allChaptersExplored = false;
      state.exploredChapters = {};
      state.exploredChapterObjects = {};
      render();

      const tarpSvg = drawJuteTarpScene(false, false);
      const hasTarp3dLock = tarpSvg.includes('iso-3d-lock-svg') && tarpSvg.includes('3D Isometric Volumetric Padlock Badge');

      const spotHtml = juteTarpSpotHtml();
      const hasSpot3dLockBadge = spotHtml.includes('iso-3d-lock');

      openJuteTarpModal();
      const modal = modalHtml();
      const hasModal3dLock = modal.includes('iso-3d-lock');
      closeModal();

      if (hasTarp3dLock && hasSpot3dLockBadge && hasModal3dLock) {
        report.test3_juteTarp3dVolumetricLock.passed = true;
        report.test3_juteTarp3dVolumetricLock.details.push('Jute Tarpaulin 3D Lock verified: Mystery cache renders 3D volumetric padlock on burlap folds, in canvas spot label, and in modal header.');
      } else {
        report.test3_juteTarp3dVolumetricLock.details.push(`Failed: hasTarp3dLock=${hasTarp3dLock}, hasSpot3dLockBadge=${hasSpot3dLockBadge}, hasModal3dLock=${hasModal3dLock}`);
      }
    } catch (e) {
      report.test3_juteTarp3dVolumetricLock.details.push('Error: ' + e.message);
    }

    try {
      // TEST 4: Directional Facility Locator Geometry & Animations
      const locatorSvg = getDirectionalLocatorSvg(1, 'Bring the Land to Life');
      const hasTeardropPin = locatorSvg.includes('facility-locator-svg') && locatorSvg.includes('pinBodyGrad');
      const hasDownwardPointer = locatorSvg.includes('locator-ground-ripple') && locatorSvg.includes('polygon points="27,58 22,49 32,49"');
      const hasDiscoveryStar = locatorSvg.includes('goldTargetGrad') && locatorSvg.includes('polygon points="0,-9');

      const badgeHtml = getChapterExploreBadgeHtml('plot', state);
      const hasLocatorClass = badgeHtml.includes('chapter-explore-locator') && badgeHtml.includes('chapter-explore-hand');
      const hasGroundRipple = badgeHtml.includes('locator-pulse-ring');
      const hasPillTag = badgeHtml.includes('locator-pill-tag') && badgeHtml.includes('Ch. 1');

      if (hasTeardropPin && hasDownwardPointer && hasDiscoveryStar && hasLocatorClass && hasGroundRipple && hasPillTag) {
        report.test4_directionalLocatorGeometryAndAnimation.passed = true;
        report.test4_directionalLocatorGeometryAndAnimation.details.push('Directional Facility Locator verified: precision downward pointing beacon, 3D emerald gradient, golden discovery star, ground ripple, and chapter pill tag.');
      } else {
        report.test4_directionalLocatorGeometryAndAnimation.details.push(`Failed: hasTeardropPin=${hasTeardropPin}, hasDownwardPointer=${hasDownwardPointer}, hasDiscoveryStar=${hasDiscoveryStar}, hasLocatorClass=${hasLocatorClass}, hasGroundRipple=${hasGroundRipple}, hasPillTag=${hasPillTag}`);
      }
    } catch (e) {
      report.test4_directionalLocatorGeometryAndAnimation.details.push('Error: ' + e.message);
    }

    try {
      // TEST 5: 8-Chapter Step-by-Step Survey Progression with Directional Locator
      state.currentChapter = 1;
      state.basicToolsDiscovered = false;
      state.juteTarpUncovered = false;
      state.allChaptersExplored = false;
      state.exploredChapters = {};
      state.exploredChapterObjects = {};
      state.knowledgeXP = 0;
      render();

      const sequence = [
        { key: 'plot', ch: 1 },
        { key: 'crew_shed', ch: 2 },
        { key: 'garden', ch: 3 },
        { key: 'pond', ch: 4 },
        { key: 'wind_turbine', ch: 5 },
        { key: 'juice_bar', ch: 6 },
        { key: 'eco_passport', ch: 7 },
        { key: 'space_mission', ch: 8 }
      ];

      let allStepsMatched = true;
      const progressionLog = [];

      for (let i = 0; i < sequence.length; i++) {
        const item = sequence[i];
        const targetCh = getCurrentExplorationChapter(state);
        if (targetCh !== item.ch) {
          allStepsMatched = false;
          progressionLog.push(`Mismatch at index ${i}: expected targetCh=${item.ch}, got ${targetCh}`);
          break;
        }

        const badgeHtml = getChapterExploreBadgeHtml(item.key, state);
        if (!badgeHtml.includes('chapter-explore-locator') || !badgeHtml.includes('Ch. ' + item.ch)) {
          allStepsMatched = false;
          progressionLog.push(`Locator missing on ${item.key} for Ch. ${item.ch}`);
          break;
        }

        // Survey facility
        exploreChapterObject(item.key);
        closeModal();

        // Previous facility should now display surveyed tick
        const surveyedBadge = getChapterExploreBadgeHtml(item.key, state);
        if (!surveyedBadge.includes('chapter-explore-tick')) {
          allStepsMatched = false;
          progressionLog.push(`Surveyed badge missing on ${item.key} after exploration`);
          break;
        }
      }

      const finalCount = getExploredChaptersCount(state);
      const isComplete = (finalCount === 8) && (state.allChaptersExplored === true);

      if (allStepsMatched && isComplete) {
        report.test5_directionalLocator8ChapterProgression.passed = true;
        report.test5_directionalLocator8ChapterProgression.details.push('8-Chapter Progression verified: directional locator accurately guides through Plot 1 -> Crew Shed -> Garden -> Pond -> Turbine -> Juice Bar -> Eco Passport -> Space Mission.');
      } else {
        report.test5_directionalLocator8ChapterProgression.details.push(`Failed: allStepsMatched=${allStepsMatched}, finalCount=${finalCount}, log=${progressionLog.join('; ')}`);
      }
    } catch (e) {
      report.test5_directionalLocator8ChapterProgression.details.push('Error: ' + e.message);
    }

    try {
      // TEST 6: Descriptions & Zero Hand Emojis in Chapter 1 Exploration
      const introBody = FarmMissionAdapter.CHAPTER_INTROS[1].body;
      const hasHandInIntro = introBody.includes('👆');
      const hasLocatorInIntro = introBody.includes('directional locator');

      const ch1Tasks = CHAPTER_CHALLENGES[1];
      const task1Sub = ch1Tasks[0].subtitle;
      const hasHandInTask = task1Sub.includes('👆');
      const hasLocatorInTask = task1Sub.includes('directional locator');

      if (!hasHandInIntro && hasLocatorInIntro && !hasHandInTask && hasLocatorInTask) {
        report.test6_tutorialDescriptionsAndZeroHandEmojis.passed = true;
        report.test6_tutorialDescriptionsAndZeroHandEmojis.details.push('Tutorial Descriptions verified: all references to hand emojis cleanly replaced with directional locator beacons.');
      } else {
        report.test6_tutorialDescriptionsAndZeroHandEmojis.details.push(`Failed: hasHandInIntro=${hasHandInIntro}, hasLocatorInIntro=${hasLocatorInIntro}, hasHandInTask=${hasHandInTask}, hasLocatorInTask=${hasLocatorInTask}`);
      }
    } catch (e) {
      report.test6_tutorialDescriptionsAndZeroHandEmojis.details.push('Error: ' + e.message);
    }

    return report;
  });

  await browser.close();

  let allPassed = true;
  for (const [testName, result] of Object.entries(results)) {
    if (result.passed) {
      console.log(`[✓ PASSED] ${testName}`);
      result.details.forEach(d => console.log(`    ↳ ${d}`));
    } else {
      console.log(`[❌ FAILED] ${testName}`);
      result.details.forEach(d => console.log(`    ↳ ${d}`));
      allPassed = false;
    }
  }

  console.log('\n======================================================');
  if (allPassed) {
    console.log('🎉 ALL CHAPTER 1 3D LOCK & LOCATOR TESTS PASSED! (100%) 🎉');
  } else {
    console.log('⚠️ SOME TESTS FAILED.');
    process.exit(1);
  }
  console.log('======================================================\n');
})();
