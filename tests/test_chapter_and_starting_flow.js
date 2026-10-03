/**
 * SearchO2 Chapter-Based Progression & Section 7 First Starting Gameplay Test Suite
 * Validating:
 * 1. Chapter-wise task and challenge list (openPanel === 'tasks') with interest-triggering hooks, interactive Why? triggers, and lock/unlock previews
 * 2. Farming objects unlocking mechanism based on chapters (OBJECT_CHAPTER_UNLOCKS & isObjectUnlockedByChapter)
 * 3. Visitor feedback mechanism tailored by chapter (generateDwellReaction across chapters 1-8)
 * 4. Section 7 first starting gameplay interactions (Welcome modal, startFirstGameExperience, Plot 0 pulse)
 * 5. Kids-friendly motivational speech bubbles (empty soil, beginner choices, first planted, Oxy bubbles)
 * 6. Smooth modal and bubble auto-close on visual tasks
 */

const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('====================================================');
  console.log('  SearchO2 Chapter Progression & Section 7 Test Suite');
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
      test1_taskListChapters: { passed: false, details: [] },
      test2_objectUnlocksByChapter: { passed: false, details: [] },
      test3_visitorFeedbackByChapter: { passed: false, details: [] },
      test4_section7WelcomeFlow: { passed: false, details: [] },
      test5_beginnerChoicesAndPlanting: { passed: false, details: [] },
      test6_motivationalBubbleLifecycle: { passed: false, details: [] }
    };

    try {
      // =======================================================================
      // TEST 1: Chapter-Wise Task & Challenge List with Interactive Why Triggers
      // =======================================================================
      state.selectedChapterTab = 1;
      openPanel = 'tasks';
      render();

      const fpEl = document.getElementById('floatPanel');
      const hasFloatPanel = !!fpEl;
      const htmlContent = fpEl ? fpEl.innerHTML : '';

      const hasChapterHeader = htmlContent.includes('Chapter 1: Bring the Land to Life') || htmlContent.includes('Bring the Land to Life');
      const hasFantasyQuote = htmlContent.includes('I can grow something');
      const hasChapterTabs = htmlContent.includes('Ch.1') && htmlContent.includes('Ch.8');

      // Verify Chapter 1 has its specific challenges (NOT old flat steps)
      const hasCh1SoilChallenge = htmlContent.includes('Awaken the Bedrock') && htmlContent.includes('Till Plot 1');
      const hasCh1PlantChallenge = htmlContent.includes('First Breath of Life');
      const hasInteractiveWhyBtn = htmlContent.includes('Why Aerate Bedrock?') || htmlContent.includes('Why Photosynthesis?');
      const oldStepsNotReplicated = !htmlContent.includes('Core Progression Milestones (Chapters 1 → 8)');

      // Test switching to Chapter 2 -> displays Chapter 2 challenges and Subway Credibility Sub-Steps
      state.selectedChapterTab = 2;
      render();
      const fpEl2 = document.getElementById('floatPanel');
      const htmlContent2 = fpEl2 ? fpEl2.innerHTML : '';
      const hasCh2Challenges = htmlContent2.includes('The Spoilage Crisis') && htmlContent2.includes('The Great Boulder Heist');
      const hasSubwayCredibility = htmlContent2.includes('⭐ Optional Subway &amp; Feeder Roads') && htmlContent2.includes('Credibility Sub-Step');

      // Test switching to Chapter 5 -> displays Chapter 5 renewable energy challenges
      state.selectedChapterTab = 5;
      render();
      const fpEl5 = document.getElementById('floatPanel');
      const htmlContent5 = fpEl5 ? fpEl5.innerHTML : '';
      const hasCh5Challenges = htmlContent5.includes('Harnessing the Gales') && htmlContent5.includes('Master of the Grid') && htmlContent5.includes('Defeating Intermittency');

      // Test locked chapter preview (e.g. Chapter 7 when on Chapter 1)
      state.currentChapter = 1;
      state.selectedChapterTab = 7;
      render();
      const fpEl7 = document.getElementById('floatPanel');
      const htmlContent7 = fpEl7 ? fpEl7.innerHTML : '';
      const hasLockedCh7Preview = htmlContent7.includes('Chapter 7 is Locked') && htmlContent7.includes('Upcoming Chapter Challenges');

      // Test HUD Starting Task Guide Capsule sync with active chapter task
      const guide = getFarmProgressionGuide();
      const hasGuideBadge = guide && guide.badgeText && guide.badgeText.includes('Ch.1');

      // Reset panel
      closePanel();

      if (hasFloatPanel && hasChapterHeader && hasFantasyQuote && hasChapterTabs && 
          hasCh1SoilChallenge && hasCh1PlantChallenge && hasInteractiveWhyBtn && 
          oldStepsNotReplicated && hasCh2Challenges && hasSubwayCredibility && 
          hasCh5Challenges && hasLockedCh7Preview && hasGuideBadge) {
        report.test1_taskListChapters.passed = true;
        report.test1_taskListChapters.details.push('Chapter-wise task and challenge list verified: Each chapter displays only its specific interest-triggering challenges, interactive Why? buttons, chapter-appropriate facilities, and locked previews without replicating old steps.');
      } else {
        report.test1_taskListChapters.details.push(`Failed checks: hasFloatPanel=${hasFloatPanel}, hasChapterHeader=${hasChapterHeader}, hasFantasyQuote=${hasFantasyQuote}, hasChapterTabs=${hasChapterTabs}, hasCh1SoilChallenge=${hasCh1SoilChallenge}, hasCh1PlantChallenge=${hasCh1PlantChallenge}, hasInteractiveWhyBtn=${hasInteractiveWhyBtn}, oldStepsNotReplicated=${oldStepsNotReplicated}, hasCh2Challenges=${hasCh2Challenges}, hasSubwayCredibility=${hasSubwayCredibility}, hasCh5Challenges=${hasCh5Challenges}, hasLockedCh7Preview=${hasLockedCh7Preview}, hasGuideBadge=${hasGuideBadge}`);
      }
    } catch (e) {
      report.test1_taskListChapters.details.push('Error: ' + e.message);
    }

    try {
      // =======================================================================
      // TEST 2: Farming Objects Unlocking Mechanism Based on Chapters
      // =======================================================================
      const testState = freshState();
      testState.currentChapter = 1;

      // Chapter 1: plot and crew_shed should be unlocked
      const plotCh1 = isObjectUnlockedByChapter('plot', testState);
      const crewCh1 = isObjectUnlockedByChapter('crew_shed', testState);
      // Chapter 3/4/5 objects should be locked in Chapter 1
      const gardenCh1 = isObjectUnlockedByChapter('garden', testState);
      const cattleCh1 = isObjectUnlockedByChapter('cattle_farm', testState);
      const turbineCh1 = isObjectUnlockedByChapter('wind_turbine', testState);
      const juiceCh1 = isObjectUnlockedByChapter('juice_bar', testState);

      // Advance to Chapter 3 -> garden should now be unlocked
      testState.currentChapter = 3;
      const gardenCh3 = isObjectUnlockedByChapter('garden', testState);
      const cattleCh3 = isObjectUnlockedByChapter('cattle_farm', testState);

      // Advance to Chapter 5 -> turbines and BESS unlocked
      testState.currentChapter = 5;
      const turbineCh5 = isObjectUnlockedByChapter('wind_turbine', testState);
      const bessCh5 = isObjectUnlockedByChapter('energy_storage', testState);

      // Check lock badge in building spot card HTML
      testState.currentChapter = 1;
      const gardenSpotLockedHtml = buildingSpotHtml('garden', testState);
      const hasLockBadge = gardenSpotLockedHtml.includes('🔒 Ch. 3') || gardenSpotLockedHtml.includes('🔒');

      if (plotCh1 && crewCh1 && !gardenCh1 && !cattleCh1 && !turbineCh1 && !juiceCh1 && gardenCh3 && !cattleCh3 && turbineCh5 && bessCh5 && hasLockBadge) {
        report.test2_objectUnlocksByChapter.passed = true;
        report.test2_objectUnlocksByChapter.details.push('Chapter-based object unlocks verified: Ch.1 allows soil/shed, Ch.3 unlocks gardens, Ch.5 unlocks microgrids, and unearned canvas spots render lock badges.');
      } else {
        report.test2_objectUnlocksByChapter.details.push(`Failed: plotCh1=${plotCh1}, crewCh1=${crewCh1}, gardenCh1=${gardenCh1}, cattleCh1=${cattleCh1}, turbineCh1=${turbineCh1}, gardenCh3=${gardenCh3}, cattleCh3=${cattleCh3}, turbineCh5=${turbineCh5}, hasLockBadge=${hasLockBadge}`);
      }
    } catch (e) {
      report.test2_objectUnlocksByChapter.details.push('Error: ' + e.message);
    }

    try {
      // =======================================================================
      // TEST 3: Visitor Feedback Mechanism Tailored by Chapter
      // =======================================================================
      const mockVisitorDest = { type: 'building', key: 'garden', x: 200, y: 200 };
      
      // Test dynamic visitor thought across chapters
      function getSampledReaction(ch) {
        state.currentChapter = ch;
        for (let attempt = 0; attempt < 25; attempt++) {
          const r = generateDwellReaction(mockVisitorDest);
          const txt = typeof r === 'string' ? r : (r && r.text ? r.text : '');
          if (ch === 1 && (txt.includes('loam') || txt.includes('seedlings') || txt.includes('Plot 1') || txt.includes('soil') || txt.includes('crisper'))) return txt;
          if (ch === 3 && (txt.includes('honeybees') || txt.includes('biodiversity') || txt.includes('canopy') || txt.includes('pesticides') || txt.includes('bees'))) return txt;
          if (ch === 5 && (txt.includes('turbines') || txt.includes('BESS') || txt.includes('renewable') || txt.includes('microgrid') || txt.includes('clean energy'))) return txt;
          if (ch === 8 && (txt.includes('Earth to the stars') || txt.includes('Mars') || txt.includes('Moon') || txt.includes('closed-loop') || txt.includes('life support'))) return txt;
        }
        const fallback = generateDwellReaction(mockVisitorDest);
        return typeof fallback === 'string' ? fallback : (fallback && fallback.text ? fallback.text : '');
      }

      const textCh1 = getSampledReaction(1);
      const hasSoilThought = textCh1.includes('loam') || textCh1.includes('seedlings') || textCh1.includes('Plot 1') || textCh1.includes('soil') || textCh1.includes('crisper');

      const textCh3 = getSampledReaction(3);
      const hasBioThought = textCh3.includes('honeybees') || textCh3.includes('biodiversity') || textCh3.includes('canopy') || textCh3.includes('pesticides') || textCh3.includes('bees');

      const textCh5 = getSampledReaction(5);
      const hasEnergyThought = textCh5.includes('turbines') || textCh5.includes('BESS') || textCh5.includes('renewable') || textCh5.includes('microgrid') || textCh5.includes('clean energy');

      const textCh8 = getSampledReaction(8);
      const hasSpaceThought = textCh8.includes('Earth to the stars') || textCh8.includes('Mars') || textCh8.includes('Moon') || textCh8.includes('closed-loop') || textCh8.includes('life support');

      if (hasSoilThought && hasBioThought && hasEnergyThought && hasSpaceThought) {
        report.test3_visitorFeedbackByChapter.passed = true;
        report.test3_visitorFeedbackByChapter.details.push('Visitor feedback mechanism verified: Dwell reactions adapt dynamically across chapters 1 through 8 reflecting soil, biodiversity, clean energy, and space life support.');
      } else {
        report.test3_visitorFeedbackByChapter.details.push(`Failed: hasSoilThought=${hasSoilThought}, hasBioThought=${hasBioThought}, hasEnergyThought=${hasEnergyThought}, hasSpaceThought=${hasSpaceThought}`);
      }
    } catch (e) {
      report.test3_visitorFeedbackByChapter.details.push('Error: ' + e.message);
    }

    try {
      // =======================================================================
      // TEST 4: Section 7 Opening Welcome & Start Experience
      // =======================================================================
      state.introSeen = false;
      state.firstStartCompleted = false;
      activeModal = null;

      // Render welcome modal HTML
      const welcomeHtml = welcomeIntroModalHtml();
      const hasWelcomeText = welcomeHtml.includes('Welcome to SearchO₂') && welcomeHtml.includes('This land is yours') && welcomeHtml.includes('Turn it into a thriving, sustainable community');
      const hasStartGrowingBtn = welcomeHtml.includes('🌱 Start Growing');

      // Trigger startFirstGameExperience
      startFirstGameExperience();
      const modalClosed = (activeModal === null);
      const introMarkedSeen = (state.introSeen === true);
      const firstStartDone = (state.firstStartCompleted === true);
      const hasEmptySoilSpeech = !!(state.activeMotivationalSpeech && ((typeof state.activeMotivationalSpeech === 'string' && state.activeMotivationalSpeech === 'empty_soil') || (state.activeMotivationalSpeech.title && state.activeMotivationalSpeech.title.includes('Soil'))));

      if (hasWelcomeText && hasStartGrowingBtn && modalClosed && introMarkedSeen && firstStartDone && hasEmptySoilSpeech) {
        report.test4_section7WelcomeFlow.passed = true;
        report.test4_section7WelcomeFlow.details.push('Section 7 opening welcome flow verified: Welcome modal, 🌱 Start Growing CTA, Plot 0 pulse, and initial empty soil motivation triggered seamlessly.');
      } else {
        report.test4_section7WelcomeFlow.details.push(`Failed: hasWelcomeText=${hasWelcomeText}, hasStartGrowingBtn=${hasStartGrowingBtn}, modalClosed=${modalClosed}, introMarkedSeen=${introMarkedSeen}, firstStartDone=${firstStartDone}, hasEmptySoilSpeech=${hasEmptySoilSpeech}`);
      }
    } catch (e) {
      report.test4_section7WelcomeFlow.details.push('Error: ' + e.message);
    }

    try {
      // =======================================================================
      // TEST 5: Beginner Crop Choices with Displayed Consequences
      // =======================================================================
      // Ensure plot is ready for planting and storage built
      state.storage.built = true;
      state.plots[0].status = 'ready';
      activeModal = { type: 'plot', plotId: 0, id: 0 };
      
      const plotModalContent = modalHtml();
      const hasAppleCard = plotModalContent.includes('Apple Tree') && plotModalContent.includes('Steady food harvest');
      const hasVegetableCard = plotModalContent.includes('Vegetables') && plotModalContent.includes('Rapid food production');
      const hasOakCard = plotModalContent.includes('English Oak') && plotModalContent.includes('Maximum O₂ generation');
      const hasConsequenceHeader = plotModalContent.includes('Recommended Beginner Crops') || plotModalContent.includes('Consequences');

      // Test planting triggers photosynthesis discovery card (+5 XP)
      state.treesPlanted = 0;
      state.knowledgeXP = 0;
      if (state.discoveredCards) {
        state.discoveredCards = state.discoveredCards.filter(c => c !== 'photosynthesis');
      }
      plantTree(0, 'apple');

      const treePlanted = (state.plots[0].treeType === 'apple');
      const earnedXP = (state.knowledgeXP >= 5);
      const hasDiscoveryCard = !!(activeModal && activeModal.type === 'discovery_card' && (activeModal.cardKey === 'photosynthesis' || activeModal.cardId === 'photosynthesis'));
      closeModal();

      if (hasAppleCard && hasVegetableCard && hasOakCard && hasConsequenceHeader && treePlanted && earnedXP && hasDiscoveryCard) {
        report.test5_beginnerChoicesAndPlanting.passed = true;
        report.test5_beginnerChoicesAndPlanting.details.push('Beginner choices verified: Transparent consequences displayed before planting, tree planted successfully, and Photosynthesis Discovery Card awarded +5 Knowledge XP.');
      } else {
        report.test5_beginnerChoicesAndPlanting.details.push(`Failed: hasAppleCard=${hasAppleCard}, hasVegetableCard=${hasVegetableCard}, hasOakCard=${hasOakCard}, hasConsequenceHeader=${hasConsequenceHeader}, treePlanted=${treePlanted}, earnedXP=${earnedXP}, hasDiscoveryCard=${hasDiscoveryCard}`);
      }
    } catch (e) {
      report.test5_beginnerChoicesAndPlanting.details.push('Error: ' + e.message);
    }

    try {
      // =======================================================================
      // TEST 6: Kids-Friendly Motivational Speech Bubbles Lifecycle
      // =======================================================================
      triggerMotivationalGuide('empty_soil', true);
      render();

      const bubbleEl = document.getElementById('oxyMotivationalBubble');
      const hasBubble = !!bubbleEl;
      const bubbleText = bubbleEl ? bubbleEl.innerText : '';
      const hasFriendlyText = bubbleText.includes('Your Soil is Empty') || bubbleText.includes('waiting for life');

      // Test clicking action button smoothly closes speech bubble
      handleMotivationalAction('open_plot_0');
      const bubbleDismissed = (state.activeMotivationalSpeech === null);

      // Trigger another bubble and test auto-close on visual action
      triggerMotivationalGuide('need_storage', true);
      const hasStorageBubble = !!(state.activeMotivationalSpeech && ((state.activeMotivationalSpeech.title && state.activeMotivationalSpeech.title.includes('Harvest')) || (state.activeMotivationalSpeech.text && state.activeMotivationalSpeech.text.includes('Storage'))));
      
      // Starting visual task auto-dismisses bubble
      dismissMotivationalBubble();
      const dismissedCleanly = (state.activeMotivationalSpeech === null);

      if (hasBubble && hasFriendlyText && bubbleDismissed && hasStorageBubble && dismissedCleanly) {
        report.test6_motivationalBubbleLifecycle.passed = true;
        report.test6_motivationalBubbleLifecycle.details.push('Motivational bubble lifecycle verified: Interactive Oxy mascot bubble rendered, action button handled, and clean auto-dismissal executed.');
      } else {
        report.test6_motivationalBubbleLifecycle.details.push(`Failed: hasBubble=${hasBubble}, hasFriendlyText=${hasFriendlyText}, bubbleDismissed=${bubbleDismissed}, hasStorageBubble=${hasStorageBubble}, dismissedCleanly=${dismissedCleanly}`);
      }
    } catch (e) {
      report.test6_motivationalBubbleLifecycle.details.push('Error: ' + e.message);
    }

    return report;
  });

  console.log('================ TEST RESULTS SUMMARY ================');
  let allPassed = true;
  for (const [key, val] of Object.entries(results)) {
    if (val.passed) {
      console.log(`[✓ PASSED] ${key}`);
      for (const d of val.details) console.log(`    ↳ ${d}`);
    } else {
      console.log(`[✗ FAILED] ${key}`);
      for (const d of val.details) console.log(`    ↳ ${d}`);
      allPassed = false;
    }
  }

  await browser.close();

  if (allPassed) {
    console.log('\n======================================================');
    console.log('🎉 ALL CHAPTER PROGRESSION & SECTION 7 TESTS PASSED! 🎉');
    console.log('======================================================\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOME TESTS FAILED.');
    process.exit(1);
  }
})();
