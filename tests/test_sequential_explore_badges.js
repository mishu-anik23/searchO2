/**
 * test_sequential_explore_badges.js
 * 
 * Verifies sequential one-at-a-time exploration guidance for Chapters 1 through 8:
 * 1. Single Animated Hand: At any given time, only the farm object corresponding to the CURRENT chapter being explored displays 👆.
 * 2. Fixed Right Tick: Once an object is explored, it displays a small fixed right tick ✓.
 * 3. Sequential progression: Ch 1 ➔ Ch 2 ➔ Ch 3 ➔ Ch 4 ➔ Ch 5 ➔ Ch 6 ➔ Ch 7 ➔ Ch 8.
 * 4. Vanishing ticks: When Chapter 1 finishes (currentChapter >= 2 or ch1CompletedModalShown), ALL explored ticks vanish completely.
 */

const { chromium } = require('playwright');
const path = require('path');

async function runSequentialExploreTests() {
  console.log('====================================================');
  console.log('  SearchO2 Sequential Chapter Explore Badges Suite  ');
  console.log('====================================================\n');

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
  const totalTests = 4;

  // Test 1: Single hand on Chapter 1 initially; no other hands
  try {
    const res = await page.evaluate(() => {
      if (typeof switchScreen === 'function') switchScreen('farm');
      // Reset state to fresh Chapter 1
      state.currentChapter = 1;
      state.exploredChapters = {};
      state.exploredChapterObjects = {};
      state.allChaptersExplored = false;
      state.basicToolsDiscovered = false;
      state.juteTarpUncovered = false;
      state.ch1CompletedModalShown = false;
      render();

      const targetCh = getCurrentExplorationChapter(state);
      const ch1Badge = getChapterExploreBadgeHtml('plot', state);
      const ch2Badge = getChapterExploreBadgeHtml('crew_shed', state);
      const ch3Badge = getChapterExploreBadgeHtml('garden', state);
      const ch4Badge = getChapterExploreBadgeHtml('pond', state);
      const ch5Badge = getChapterExploreBadgeHtml('wind_turbine', state);
      const ch6Badge = getChapterExploreBadgeHtml('juice_bar', state);
      const ch7Badge = getChapterExploreBadgeHtml('eco_passport', state);
      const ch8Badge = getChapterExploreBadgeHtml('space_mission', state);

      const ch1HasHand = ch1Badge.includes('chapter-explore-hand') && ch1Badge.includes('👆');
      const othersEmpty = (ch2Badge === '') && (ch3Badge === '') && (ch4Badge === '') &&
                          (ch5Badge === '') && (ch6Badge === '') && (ch7Badge === '') && (ch8Badge === '');

      // Verify DOM rendering
      const plot0El = document.querySelector('[data-plot="0"]');
      const plot0Hand = plot0El ? plot0El.querySelector('.chapter-explore-hand') : null;

      return {
        targetCh,
        ch1HasHand,
        othersEmpty,
        plot0HandPresent: !!plot0Hand
      };
    });

    if (res.targetCh === 1 && res.ch1HasHand && res.othersEmpty && res.plot0HandPresent) {
      console.log('[✓ PASSED] test1_initialChapter1SingleAnimatedHand');
      console.log('    ↳ Initially, target chapter is 1. ONLY Plot 1 displays animated 👆 hand; all other 7 chapters show nothing.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test1_initialChapter1SingleAnimatedHand', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test1_initialChapter1SingleAnimatedHand with error:', err);
  }

  // Test 2: Sequential step-by-step exploration from Ch 1 through Ch 8
  try {
    const res = await page.evaluate(() => {
      const sequence = [
        { ch: 1, key: 'plot', nextKey: 'crew_shed' },
        { ch: 2, key: 'crew_shed', nextKey: 'garden' },
        { ch: 3, key: 'garden', nextKey: 'pond' },
        { ch: 4, key: 'pond', nextKey: 'wind_turbine' },
        { ch: 5, key: 'wind_turbine', nextKey: 'juice_bar' },
        { ch: 6, key: 'juice_bar', nextKey: 'eco_passport' },
        { ch: 7, key: 'eco_passport', nextKey: 'space_mission' },
        { ch: 8, key: 'space_mission', nextKey: null }
      ];

      const stepResults = [];

      sequence.forEach((step) => {
        // Before clicking, step.key must have hand
        const beforeBadge = getChapterExploreBadgeHtml(step.key, state);
        const hadHand = beforeBadge.includes('chapter-explore-hand') && beforeBadge.includes('👆');

        // Explore step.key
        exploreChapterObject(step.key);

        // After exploring, step.key must have fixed tick ✓
        const afterBadge = getChapterExploreBadgeHtml(step.key, state);
        const hasTick = afterBadge.includes('chapter-explore-tick') && afterBadge.includes('✓');

        // Next key must have hand (if nextKey exists)
        let nextHasHand = true;
        if (step.nextKey) {
          const nextBadge = getChapterExploreBadgeHtml(step.nextKey, state);
          nextHasHand = nextBadge.includes('chapter-explore-hand') && nextBadge.includes('👆');
        }

        stepResults.push({ ch: step.ch, hadHand, hasTick, nextHasHand });
      });

      const count = getExploredChaptersCount(state);
      const allExplored = state.allChaptersExplored;

      return {
        stepResults,
        count,
        allExplored
      };
    });

    const allStepsOk = res.stepResults.every(r => r.hadHand && r.hasTick && r.nextHasHand);
    if (allStepsOk && res.count === 8 && res.allExplored === true) {
      console.log('[✓ PASSED] test2_sequentialProgressionAndFixedRightTicks');
      console.log('    ↳ Explored 1➔2➔3➔4➔5➔6➔7➔8 sequentially: each object turned into fixed tick ✓ and passed the animated hand 👆 to the next object.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test2_sequentialProgressionAndFixedRightTicks', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test2_sequentialProgressionAndFixedRightTicks with error:', err);
  }

  // Test 3: All 8 fixed ticks present simultaneously while still in Chapter 1
  try {
    const res = await page.evaluate(() => {
      render();
      const keys = ['plot', 'crew_shed', 'garden', 'pond', 'wind_turbine', 'juice_bar', 'eco_passport', 'space_mission'];
      const badges = keys.map(k => getChapterExploreBadgeHtml(k, state));
      const allHaveTicks = badges.every(b => b.includes('chapter-explore-tick') && b.includes('✓'));
      const noHands = badges.every(b => !b.includes('chapter-explore-hand'));

      return { allHaveTicks, noHands, curCh: state.currentChapter };
    });

    if (res.allHaveTicks && res.noHands && res.curCh === 1) {
      console.log('[✓ PASSED] test3_all8FixedTicksRetainedInChapter1');
      console.log('    ↳ While in Chapter 1 with 8/8 surveyed, all 8 facilities display fixed right ticks ✓, zero animated hands.');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test3_all8FixedTicksRetainedInChapter1', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test3_all8FixedTicksRetainedInChapter1 with error:', err);
  }

  // Test 4: All fixed ticks vanish when Chapter 1 completes (currentChapter >= 2)
  try {
    const res = await page.evaluate(() => {
      // Complete Chapter 1 by establishing growing oak with active watering & harvest
      state.plots[0].status = 'growing';
      state.plots[0].treeType = 'oak';
      state.plots[0].treeHours = 1;
      state.plots[0].waterHours = 2;
      state.plots[0].harvestsDone = 1;
      state.currentChapter = 2;
      state.ch1CompletedModalShown = true;
      render();

      const keys = ['plot', 'crew_shed', 'garden', 'pond', 'wind_turbine', 'juice_bar', 'eco_passport', 'space_mission'];
      const badges = keys.map(k => getChapterExploreBadgeHtml(k, state));
      const allEmpty = badges.every(b => b === '');

      // Check DOM
      const domTicks = document.querySelectorAll('.chapter-explore-tick').length;
      const domHands = document.querySelectorAll('.chapter-explore-hand').length;

      return {
        allEmpty,
        domTicks,
        domHands,
        curCh: state.currentChapter
      };
    });

    if (res.allEmpty && res.domTicks === 0 && res.domHands === 0 && res.curCh === 2) {
      console.log('[✓ PASSED] test4_allFixedTicksVanishInChapter2');
      console.log('    ↳ Once Chapter 1 finishes (currentChapter = 2), ALL explored fixed ticks vanish completely from HTML and DOM (0 ticks, 0 hands).');
      passedTests++;
    } else {
      console.error('[✗ FAILED] test4_allFixedTicksVanishInChapter2', res);
    }
  } catch (err) {
    console.error('[✗ FAILED] test4_allFixedTicksVanishInChapter2 with error:', err);
  }

  await browser.close();

  console.log('\n======================================================');
  if (passedTests === totalTests) {
    console.log(`🎉 ALL ${totalTests}/${totalTests} SEQUENTIAL EXPLORE BADGE TESTS PASSED! (100%) 🎉`);
  } else {
    console.error(`⚠️ FAILED: Only ${passedTests}/${totalTests} passed.`);
    process.exit(1);
  }
  console.log('======================================================\n');
}

runSequentialExploreTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
