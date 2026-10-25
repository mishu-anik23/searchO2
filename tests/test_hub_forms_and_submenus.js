/**
 * Playwright Test Suite:
 * 1. SearchO2 Report a Problem (exact 10 questions from SearchO2_Forms_Report_a_Problem.docx)
 * 2. SearchO2 Chapter Feedback (exact 8 questions from SearchO2_Forms_Chapter_Feedback.docx) as Submenu 1
 * 3. SearchO2 Full Playtest Review (exact 15 questions from SearchO2_Forms_Full_Playtest_Review.docx) as Submenu 2
 * 4. PC (1440x900) & Mobile (375x667, 320x568) viewports, responsiveness, scrollability, zero screen-cut.
 */

const { chromium } = require('playwright');
const path = require('path');

async function runTests() {
  console.log('========================================================================');
  console.log('  Testing SearchO2 Forms: Report a Problem, Chapter Feedback & Playtest');
  console.log('========================================================================\n');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const hubPath = 'file:///' + path.resolve(__dirname, '../hub/index.html').replace(/\\/g, '/');

    // -------------------------------------------------------------
    // TEST 1: Report a Problem Form (PC & Mobile)
    // -------------------------------------------------------------
    console.log('[Test 1] Testing Report a Problem (#/report)...');
    const pcContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pcPage = await pcContext.newPage();
    await pcPage.goto(hubPath + '#/report', { waitUntil: 'load' });
    await pcPage.waitForTimeout(500);

    // Check title and intro
    const rpTitle = await pcPage.$eval('.page-head h1', el => el.textContent.trim());
    console.log(`  Report Title: "${rpTitle}"`);
    if (rpTitle !== 'SearchO₂ Report a Problem') throw new Error(`Unexpected title: ${rpTitle}`);

    const rpIntro = await pcPage.$eval('.form-intro', el => el.textContent.trim());
    console.log(`  Report Intro: "${rpIntro}"`);
    if (!rpIntro.includes('Use this form when something does not work as expected')) {
      throw new Error('Intro disclaimer missing or mismatch');
    }

    // Verify all 10 Questions
    const rpForm = await pcPage.$('#rpForm');
    if (!rpForm) throw new Error('#rpForm not found');

    // Q1: Short title for the problem
    const q1Input = await pcPage.$('input[name="title"]');
    if (!q1Input) throw new Error('Q1 title input missing');

    // Q2: Which SearchO2 game version or build were you using?
    const q2Opts = await pcPage.$$eval('input[name="gameVersion"]', els => els.map(e => e.value));
    console.log(`  Q2 Game Version Options: ${JSON.stringify(q2Opts)}`);
    if (!q2Opts.includes('Current test version') || !q2Opts.includes('Previous test version') || !q2Opts.includes('I’m not sure')) {
      throw new Error('Q2 options mismatch');
    }

    // Q3: Where did the problem happen?
    const q3Opts = await pcPage.$$eval('input[name="area"]', els => els.map(e => e.value));
    console.log(`  Q3 Area Options count: ${q3Opts.length}`);
    const expectedAreas = [
      'Getting started or account', 'Chapter 1', 'Chapter 2', 'Chapter 3',
      'Saint Martin', 'Menus or settings', 'Another location', 'I’m not sure'
    ];
    for (const a of expectedAreas) {
      if (!q3Opts.includes(a)) throw new Error(`Missing Q3 area option: ${a}`);
    }

    // Q4: What were you trying to do?
    const q4Area = await pcPage.$('textarea[name="tryingToDo"]');
    if (!q4Area) throw new Error('Q4 tryingToDo textarea missing');

    // Q5: What happened?
    const q5Area = await pcPage.$('textarea[name="whatHappened"]');
    if (!q5Area) throw new Error('Q5 whatHappened textarea missing');

    // Q6: What did you expect to happen?
    const q6Area = await pcPage.$('textarea[name="expected"]');
    if (!q6Area) throw new Error('Q6 expected textarea missing');

    // Q7: Can you reproduce the problem?
    const q7Opts = await pcPage.$$eval('input[name="reproduce"]', els => els.map(e => e.value));
    console.log(`  Q7 Reproduce Options: ${JSON.stringify(q7Opts)}`);
    const expectedRepro = ['Every time', 'Sometimes', 'Only once', 'I haven’t tried again'];
    for (const r of expectedRepro) {
      if (!q7Opts.includes(r)) throw new Error(`Missing Q7 option: ${r}`);
    }

    // Q8: How much did the problem affect your play?
    const q8Opts = await pcPage.$$eval('input[name="impact"]', els => els.map(e => e.value));
    console.log(`  Q8 Impact Options: ${JSON.stringify(q8Opts)}`);
    const expectedImpact = ['Minor inconvenience', 'Made gameplay difficult', 'Blocked my progress', 'Made the game unusable'];
    for (const im of expectedImpact) {
      if (!q8Opts.includes(im)) throw new Error(`Missing Q8 option: ${im}`);
    }

    // Q9: Which device and browser were you using?
    const q9Val = await pcPage.$eval('input[name="deviceBrowser"]', el => el.value);
    console.log(`  Q9 Device & Browser auto-detected value: "${q9Val}"`);
    if (!q9Val) throw new Error('Q9 deviceBrowser should be prefilled with detected device/browser');

    // Q10: Optional email address
    const q10Email = await pcPage.$('input[name="email"]');
    if (!q10Email) throw new Error('Q10 email input missing');

    console.log('✓ PASSED: Report a Problem all 10 questions validated.\n');

    // -------------------------------------------------------------
    // TEST 2: Chapter Feedback (Submenu 1)
    // -------------------------------------------------------------
    console.log('[Test 2] Testing Chapter Feedback (#/feedback/chapter)...');
    await pcPage.goto(hubPath + '#/feedback/chapter', { waitUntil: 'load' });
    await pcPage.waitForTimeout(500);

    const chTitle = await pcPage.$eval('.page-head h1', el => el.textContent.trim());
    console.log(`  Chapter Feedback Title: "${chTitle}"`);
    if (chTitle !== 'SearchO₂ Chapter Feedback') throw new Error(`Unexpected chapter title: ${chTitle}`);

    // Verify Subnav Bar
    const subnavTabs = await pcPage.$$eval('.subnav-tab', els => els.map(e => ({ text: e.textContent.trim(), href: e.getAttribute('href'), active: e.classList.contains('active') })));
    console.log('  Subnav Tabs:', JSON.stringify(subnavTabs));
    if (subnavTabs.length !== 2) throw new Error('Expected 2 subnav tabs');
    if (!subnavTabs[0].active || subnavTabs[1].active) throw new Error('Chapter tab should be active');

    // Verify all 8 Questions
    // Q1: Game version
    const chQ1Opts = await pcPage.$$eval('#fbForm input[name="gameVersion"]', els => els.map(e => e.value));
    if (!chQ1Opts.includes('Current test version') || !chQ1Opts.includes('Previous test version') || !chQ1Opts.includes('I’m not sure')) {
      throw new Error('Chapter Q1 options mismatch');
    }

    // Q2: Which chapter are you reviewing?
    const chQ2Opts = await pcPage.$$eval('#fbForm input[name="chapter"]', els => els.map(e => e.value));
    console.log(`  Chapter Q2 Options: ${JSON.stringify(chQ2Opts)}`);
    const expectedChapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Another chapter', 'I’m not sure'];
    for (const c of expectedChapters) {
      if (!chQ2Opts.includes(c)) throw new Error(`Missing chapter option: ${c}`);
    }

    // Q3: Were you able to complete this chapter?
    const chQ3Opts = await pcPage.$$eval('#fbForm input[name="completed"]', els => els.map(e => e.value));
    const expectedCompleted = ['Yes, without help', 'Yes, with help', 'Not yet — I got stuck', 'I stopped for another reason'];
    for (const comp of expectedCompleted) {
      if (!chQ3Opts.includes(comp)) throw new Error(`Missing completed option: ${comp}`);
    }

    // Q4: How clear was what you needed to do? (Scale 1 to 5)
    const clarityPills = await pcPage.$$('#fbRate label');
    console.log(`  Clarity 1-5 scale pills count: ${clarityPills.length}`);
    if (clarityPills.length !== 5) throw new Error('Expected 5 scale pills for clarity');

    // Q5: How did the difficulty feel?
    const chQ5Opts = await pcPage.$$eval('#fbForm input[name="difficulty"]', els => els.map(e => e.value));
    const expectedDiff = ['Much too easy', 'A little too easy', 'About right', 'A little too difficult', 'Much too difficult'];
    for (const d of expectedDiff) {
      if (!chQ5Opts.includes(d)) throw new Error(`Missing difficulty option: ${d}`);
    }

    // Q6: What was the main source of confusion or frustration?
    const chQ6Opts = await pcPage.$$eval('#fbForm input[name="confusionSource"]', els => els.map(e => e.value));
    const expectedConfusion = [
      'Finding the objective', 'Understanding the controls', 'Knowing which action to take',
      'Understanding O₂', 'Earning or spending EUR', 'Reading the screen',
      'A technical problem', 'Nothing was confusing', 'Other'
    ];
    for (const conf of expectedConfusion) {
      if (!chQ6Opts.includes(conf)) throw new Error(`Missing confusion source option: ${conf}`);
    }

    // Q7: What happened, or what would make it clearer?
    const chQ7 = await pcPage.$('textarea[name="clarityFeedback"]');
    if (!chQ7) throw new Error('Q7 clarityFeedback textarea missing');

    // Q8: Did you want to continue playing afterward?
    const chQ8Opts = await pcPage.$$eval('#fbForm input[name="continueIntent"]', els => els.map(e => e.value));
    const expectedContinue = ['Definitely yes', 'Probably yes', 'Not sure', 'Probably not', 'Definitely not'];
    for (const cont of expectedContinue) {
      if (!chQ8Opts.includes(cont)) throw new Error(`Missing continue intent option: ${cont}`);
    }

    console.log('✓ PASSED: Chapter Feedback all 8 questions validated.\n');

    // -------------------------------------------------------------
    // TEST 3: Full Playtest Review (Submenu 2)
    // -------------------------------------------------------------
    console.log('[Test 3] Testing Full Playtest Review (#/feedback/playtest)...');
    await pcPage.goto(hubPath + '#/feedback/playtest', { waitUntil: 'load' });
    await pcPage.waitForTimeout(500);

    const ptTitle = await pcPage.$eval('.page-head h1', el => el.textContent.trim());
    console.log(`  Playtest Review Title: "${ptTitle}"`);
    if (ptTitle !== 'SearchO₂ Full Playtest Review') throw new Error(`Unexpected playtest title: ${ptTitle}`);

    // Verify Subnav Bar
    const ptTabs = await pcPage.$$eval('.subnav-tab', els => els.map(e => ({ text: e.textContent.trim(), active: e.classList.contains('active') })));
    if (!ptTabs[1].active || ptTabs[0].active) throw new Error('Playtest tab should be active');

    // Verify all 15 Questions
    // Q1: Game version
    const ptQ1 = await pcPage.$('#ptForm input[name="gameVersion"]');
    if (!ptQ1) throw new Error('Playtest Q1 missing');

    // Q2: Simulation genre frequency
    const ptQ2Opts = await pcPage.$$eval('#ptForm input[name="genreFrequency"]', els => els.map(e => e.value));
    const expectedFreq = ['Never', 'Occasionally', 'Monthly', 'Weekly or more'];
    for (const f of expectedFreq) {
      if (!ptQ2Opts.includes(f)) throw new Error(`Missing frequency option: ${f}`);
    }

    // Q3-Q9: Likert ratings
    const likertFields = [
      'rateEaseOfLearning', 'rateNavigation', 'rateVisualReadability',
      'rateClarityOfObjectives', 'rateUnderstandingO2', 'rateEnjoyment', 'rateGameStability'
    ];
    for (const lf of likertFields) {
      const opts = await pcPage.$$eval(`#ptForm input[name="${lf}"]`, els => els.map(e => e.value));
      if (opts.length !== 5 || !opts.includes('Very poor') || !opts.includes('Very good')) {
        throw new Error(`Likert field ${lf} does not have standard 5 options`);
      }
    }
    console.log(`  Verified 7 Likert rating fields (Q3-Q9) with 5-point scales.`);

    // Q10: Visual difficulty
    const ptQ10Opts = await pcPage.$$eval('#ptForm input[name="visualDifficulty"]', els => els.map(e => e.value));
    if (!ptQ10Opts.includes('Yes') || !ptQ10Opts.includes('No') || !ptQ10Opts.includes('Not sure')) {
      throw new Error('Q10 visualDifficulty options mismatch');
    }

    // Q11: Visual element improvement
    const ptQ11Opts = await pcPage.$$eval('#ptForm input[name="visualElementImprovement"]', els => els.map(e => e.value));
    const expectedVisualElements = [
      'Text size', 'Contrast or colours', 'Map', 'O₂ display',
      'EUR/resources display', 'Missions/objectives', 'Menus', 'Region screen', 'Other'
    ];
    for (const ve of expectedVisualElements) {
      if (!ptQ11Opts.includes(ve)) throw new Error(`Missing visual element option: ${ve}`);
    }

    // Q12: Strongest part
    const ptQ12 = await pcPage.$('textarea[name="strongestPart"]');
    if (!ptQ12) throw new Error('Q12 strongestPart textarea missing');

    // Q13: If you could change only one thing
    const ptQ13 = await pcPage.$('textarea[name="changeOneThing"]');
    if (!ptQ13) throw new Error('Q13 changeOneThing textarea missing');

    // Q14: Disappointment level
    const ptQ14Opts = await pcPage.$$eval('#ptForm input[name="disappointmentLevel"]', els => els.map(e => e.value));
    const expectedDisappoint = ['Very disappointed', 'Somewhat disappointed', 'Not disappointed', 'I haven’t played enough to say'];
    for (const dis of expectedDisappoint) {
      if (!ptQ14Opts.includes(dis)) throw new Error(`Missing disappointment option: ${dis}`);
    }

    // Q15: NPS recommend (0-10 scale)
    const npsBoxes = await pcPage.$$('#ptForm .scale-grid input[name="npsRecommend"]');
    console.log(`  NPS rating buttons count (0-10): ${npsBoxes.length}`);
    if (npsBoxes.length !== 11) throw new Error(`Expected 11 NPS buttons (0 to 10), found ${npsBoxes.length}`);

    console.log('✓ PASSED: Full Playtest Review all 15 questions validated.\n');

    // -------------------------------------------------------------
    // TEST 4: Mobile Viewport & Screen-cut verification (375x667 & 320x568)
    // -------------------------------------------------------------
    console.log('[Test 4] Testing Mobile Viewports (375x667 and 320x568)...');
    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const mobPage = await mobileContext.newPage();

    for (const route of ['#/report', '#/feedback/chapter', '#/feedback/playtest']) {
      await mobPage.goto(hubPath + route, { waitUntil: 'load' });
      await mobPage.waitForTimeout(300);

      const hasHorizontalScroll = await mobPage.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      console.log(`  Route ${route} on mobile (375px) has horizontal scroll: ${hasHorizontalScroll}`);
      if (hasHorizontalScroll) throw new Error(`Horizontal scroll detected on mobile for ${route}`);
    }

    // Smallest mobile (320px)
    await mobPage.setViewportSize({ width: 320, height: 568 });
    for (const route of ['#/report', '#/feedback/chapter', '#/feedback/playtest']) {
      await mobPage.goto(hubPath + route, { waitUntil: 'load' });
      await mobPage.waitForTimeout(300);

      const hasHorizontalScroll = await mobPage.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      console.log(`  Route ${route} on narrow mobile (320px) has horizontal scroll: ${hasHorizontalScroll}`);
      if (hasHorizontalScroll) throw new Error(`Horizontal scroll detected on 320px viewport for ${route}`);
    }

    console.log('✓ PASSED: Mobile responsiveness verified with 0 horizontal screen cuts.\n');

    // -------------------------------------------------------------
    // TEST 5: Top Navigation Dropdown Menu
    // -------------------------------------------------------------
    console.log('[Test 5] Testing Top Navigation Feedback Dropdown...');
    const dropdownToggle = await pcPage.$('.nav-dropdown[data-route="feedback"] .nav-dropdown-toggle');
    if (!dropdownToggle) throw new Error('Feedback nav dropdown toggle missing');
    const dropdownItems = await pcPage.$$eval('.nav-dropdown[data-route="feedback"] .nav-dropdown-menu a', els => els.map(e => ({ text: e.textContent.trim(), href: e.getAttribute('href') })));
    console.log('  Dropdown items:', JSON.stringify(dropdownItems));
    if (dropdownItems.length !== 2) throw new Error('Expected 2 dropdown submenu items in navbar');
    if (!dropdownItems[0].href.includes('feedback/chapter') || !dropdownItems[1].href.includes('feedback/playtest')) {
      throw new Error('Dropdown links do not point to submenus');
    }
    console.log('✓ PASSED: Top navigation feedback dropdown verified.\n');

    console.log('========================================================================');
    console.log('  ALL REPORT A PROBLEM & FEEDBACK FORMS TESTS PASSED PERFECTLY!');
    console.log('========================================================================\n');

  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
}

runTests();
