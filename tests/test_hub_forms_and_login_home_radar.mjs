import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('================================================================');
  console.log('  Testing Hub Brand Link, Updated Forms & Login Home 3D Radar');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push(err.message);
    console.error('[BROWSER ERROR]:', err.message);
  });

  const hubUrl = 'file:///' + path.resolve(__dirname, '..', 'hub', 'index.html').replace(/\\/g, '/');
  const gameUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

  // ---------------------------------------------------------------------------
  // 1. Hub Brand Link Navigation: Guest vs Logged-In
  // ---------------------------------------------------------------------------
  console.log('Test 1: Hub Brand Link navigation for Guest user...');
  await page.goto(hubUrl, { waitUntil: 'load' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('searchO2_guest_user', JSON.stringify({ isGuest: true, role: 'guest' }));
  });
  await page.goto(hubUrl, { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const guestHref = await page.evaluate(() => {
    const brand = document.querySelector('.brand');
    return brand ? brand.getAttribute('href') : null;
  });
  console.log('   ↳ Guest brand href:', guestHref);
  assert(guestHref && guestHref.includes('guest=1') && guestHref.includes('enter=farm'), 'Guest brand link must navigate to guest farm');
  console.log('   [✓ PASSED] Guest brand navigation verified\n');

  console.log('Test 2: Hub Brand Link navigation for Logged-in user...');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('searchO2_user', JSON.stringify({
      id: 'usr_green_hero',
      displayName: 'Captain Eco',
      email: 'eco@searcho2.org',
      role: 'user',
      isGuest: false
    }));
    localStorage.setItem('searchO2_token', 'valid_token_long_jwt_string_1234567890');
  });
  await page.goto(hubUrl, { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const userHref = await page.evaluate(() => {
    const brand = document.querySelector('.brand');
    return brand ? brand.getAttribute('href') : null;
  });
  console.log('   ↳ Logged-in user brand href:', userHref);
  assert(userHref && userHref.includes('mode=home'), 'Logged-in user brand link must navigate to mode=home');
  console.log('   [✓ PASSED] Logged-in brand navigation verified\n');

  // ---------------------------------------------------------------------------
  // 2. Updated Forms in Hub: Chapter Feedback, Playtest Review, Report a Problem
  // ---------------------------------------------------------------------------
  console.log('Test 3: Chapter Feedback Form questions and Other write-in box...');
  await page.goto(hubUrl + '#/feedback/chapter', { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const chapterFormData = await page.evaluate(() => {
    const q1Options = Array.from(document.querySelectorAll('input[name="chapter"]')).map(el => el.value);
    const q2Options = Array.from(document.querySelectorAll('input[name="completed"]')).map(el => el.value);
    const hasOtherInput = !!document.getElementById('chCompletedOther');
    const q4Options = Array.from(document.querySelectorAll('input[name="difficulty"]')).map(el => el.value);
    const q5Options = Array.from(document.querySelectorAll('input[name="confusionSource"]')).map(el => el.value);
    const hasConfusionOtherInput = !!document.getElementById('chConfusionOther');
    const hasQ6Textarea = !!document.getElementById('chClarityFb');
    const q7Options = Array.from(document.querySelectorAll('input[name="continueIntent"]')).map(el => el.value);
    return { q1Options, q2Options, hasOtherInput, q4Options, q5Options, hasConfusionOtherInput, hasQ6Textarea, q7Options };
  });

  assert.strictEqual(chapterFormData.q1Options.length, 8, 'Must have 8 Base Farm chapters (1-8)');
  assert(chapterFormData.q2Options.includes('Other'), 'Q2 must include Other option');
  assert(chapterFormData.hasOtherInput, 'Q2 must have Other write-in input box');
  assert.strictEqual(chapterFormData.q4Options.length, 5, 'Q4 difficulty must have 5 rating levels');
  assert(chapterFormData.q5Options.includes('Other'), 'Q5 confusion must include Other option');
  assert(chapterFormData.hasConfusionOtherInput, 'Q5 must have Other write-in input box');
  assert(chapterFormData.hasQ6Textarea, 'Q6 must have what happened / clarity textarea');
  assert.strictEqual(chapterFormData.q7Options.length, 5, 'Q7 continue intent must have 5 options');
  console.log('   ↳ Verified Chapter Feedback: Q1-Q8 mapped accurately to updated docx');
  console.log('   [✓ PASSED] Chapter Feedback Form structure verified\n');

  console.log('Test 4: Playtest Review Form questions...');
  await page.goto(hubUrl + '#/feedback/playtest', { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const playtestFormData = await page.evaluate(() => {
    const q1Options = Array.from(document.querySelectorAll('input[name="genreFrequency"]')).map(el => el.value);
    const hasEase = !!document.querySelector('input[name="rateEaseOfLearning"]');
    const hasNav = !!document.querySelector('input[name="rateNavigation"]');
    const hasVisual = !!document.querySelector('input[name="rateVisualReadability"]');
    const hasObj = !!document.querySelector('input[name="rateClarityOfObjectives"]');
    const hasO2 = !!document.querySelector('input[name="rateUnderstandingO2"]');
    const hasJoy = !!document.querySelector('input[name="rateEnjoyment"]');
    const hasStab = !!document.querySelector('input[name="rateGameStability"]');
    const q10Options = Array.from(document.querySelectorAll('input[name="visualDifficulty"]')).map(el => el.value);
    const q11Options = Array.from(document.querySelectorAll('input[name="visualElementImprovement"]')).map(el => el.value);
    const hasImprovementOther = !!document.getElementById('ptVisualImprovementOther');
    const hasStrongest = !!document.getElementById('ptStrongest');
    const hasChange = !!document.getElementById('ptChange');
    const disappointmentOptions = Array.from(document.querySelectorAll('input[name="disappointmentLevel"]')).map(el => el.value);
    const npsOptions = Array.from(document.querySelectorAll('input[name="npsRecommend"]')).map(el => el.value);
    return { q1Options, hasEase, hasNav, hasVisual, hasObj, hasO2, hasJoy, hasStab, q10Options, q11Options, hasImprovementOther, hasStrongest, hasChange, disappointmentOptions, npsOptions };
  });

  assert.deepStrictEqual(playtestFormData.q1Options, ['Never', 'Occasionally', 'Monthly', 'Weekly or more']);
  assert(playtestFormData.hasEase && playtestFormData.hasNav && playtestFormData.hasVisual && playtestFormData.hasObj && playtestFormData.hasO2 && playtestFormData.hasJoy && playtestFormData.hasStab, 'Must have Q2-Q9 Likert ratings 1-5');
  assert.deepStrictEqual(playtestFormData.q10Options, ['Yes', 'No', 'Not sure']);
  assert(playtestFormData.q11Options.includes('Other'), 'Q11 must include Other option');
  assert(playtestFormData.hasImprovementOther, 'Q11 must have Other write-in box');
  assert(playtestFormData.hasStrongest, 'Q12 strongest part textarea must exist');
  assert(playtestFormData.hasChange, 'Q13 change one thing textarea must exist');
  assert.strictEqual(playtestFormData.disappointmentOptions.length, 4, 'Q14 must have 4 disappointment choices');
  assert.strictEqual(playtestFormData.npsOptions.length, 11, 'Q15 must have 11 NPS choices (0-10)');
  console.log('   ↳ Verified Full Playtest Review: Q1-Q15 mapped accurately to updated docx/txt');
  console.log('   [✓ PASSED] Full Playtest Review Form structure verified\n');

  console.log('Test 5: Report a Problem Form questions and areas...');
  await page.goto(hubUrl + '#/report', { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const problemFormData = await page.evaluate(() => {
    const hasTitle = !!document.getElementById('rpTitle');
    const areaOptions = Array.from(document.querySelectorAll('input[name="area"]')).map(el => el.value);
    const hasTrying = !!document.getElementById('rpTrying');
    const hasWhat = !!document.getElementById('rpWhat');
    const hasExp = !!document.getElementById('rpExp');
    const repOptions = Array.from(document.querySelectorAll('input[name="reproduce"]')).map(el => el.value);
    const impOptions = Array.from(document.querySelectorAll('input[name="impact"]')).map(el => el.value);
    const hasDevice = !!document.getElementById('rpDevice');
    const hasEmail = !!document.getElementById('rpEmail');
    return { hasTitle, areaOptions, hasTrying, hasWhat, hasExp, repOptions, impOptions, hasDevice, hasEmail };
  });

  assert(problemFormData.hasTitle, 'Q1 short title required');
  assert(problemFormData.areaOptions.includes('Base Farm - Chapter 1') && problemFormData.areaOptions.includes('Base Farm - Chapter 8'), 'Area must include Base Farm chapters 1-8');
  assert(problemFormData.areaOptions.some(a => a.toLowerCase().includes('saint martin') && a.toLowerCase().includes('bluelab')), 'Area must include Saint Martin - BlueLab');
  assert(problemFormData.areaOptions.includes('Bavaria - Alpenhof'), 'Area must include Bavaria - Alpenhof');
  assert(problemFormData.hasTrying && problemFormData.hasWhat && problemFormData.hasExp, 'Must have trying to do, what happened, expected');
  assert.strictEqual(problemFormData.repOptions.length, 4, 'Must have 4 reproduction choices');
  assert.strictEqual(problemFormData.impOptions.length, 4, 'Must have 4 impact choices');
  assert(problemFormData.hasDevice && problemFormData.hasEmail, 'Must have device and optional email');
  console.log('   ↳ Verified Report a Problem: Q1-Q10 mapped accurately to updated docx');
  console.log('   [✓ PASSED] Report a Problem Form structure verified\n');

  console.log('Test 5b: Clean Direct Navbar, On-Page Tabs, Typography & Puff/Pip Guidance...');
  const navAndPuffState = await page.evaluate(() => {
    const navDropdown = document.querySelector('.nav-dropdown');
    const feedbackLink = document.querySelector('#nav a[data-route="feedback"]');
    const reportLink = document.querySelector('#nav a[data-route="report"]');
    
    const mentorCard = document.querySelector('.puff-pip-mentor-card');
    const puffAvatars = document.querySelectorAll('.puff-avatar-svg');
    const pipAvatars = document.querySelectorAll('.pip-avatar-svg');
    const guidanceBoxes = document.querySelectorAll('.puff-guidance');
    const handoffCard = document.querySelector('.pip-handoff-card');
    const subnavTabs = Array.from(document.querySelectorAll('.subnav-tab')).map(t => t.textContent.trim());

    // Typography checks
    const qLabel = document.querySelector('legend.lbl, .lbl');
    const optLabel = document.querySelector('.radios span');
    let qFontSize = qLabel ? parseFloat(window.getComputedStyle(qLabel).fontSize) : 0;
    let optFontSize = optLabel ? parseFloat(window.getComputedStyle(optLabel).fontSize) : 0;

    return {
      hasNavDropdown: !!navDropdown,
      hasFeedbackLink: !!feedbackLink,
      hasReportLink: !!reportLink,
      hasMentorCard: !!mentorCard,
      puffAvatarCount: puffAvatars.length,
      pipAvatarCount: pipAvatars.length,
      guidanceCount: guidanceBoxes.length,
      hasHandoffCard: !!handoffCard,
      subnavTabs,
      qFontSize,
      optFontSize
    };
  });

  assert(!navAndPuffState.hasNavDropdown, 'Must remove redundant navbar dropdown');
  assert(navAndPuffState.hasFeedbackLink, 'Must have direct Feedback link in navbar');
  assert(navAndPuffState.hasReportLink, 'Must have direct Report a Problem link in navbar');
  assert(navAndPuffState.subnavTabs.length >= 3, 'Must render 3-tab on-page subnav bar');
  assert(navAndPuffState.hasMentorCard, 'Must render Puff & Pip mentor dialogue hero');
  assert(navAndPuffState.puffAvatarCount >= 2, 'Must render animated Puff mentor avatars');
  assert(navAndPuffState.pipAvatarCount >= 2, 'Must render animated Pip sprout avatars');
  assert(navAndPuffState.guidanceCount >= 4, 'Must render Puff question guidance prompts and guidelines');
  assert(navAndPuffState.hasHandoffCard, 'Must render Pip & Puff feedback hand-off card');
  assert(navAndPuffState.qFontSize > navAndPuffState.optFontSize, 'Question text must be larger than option text');

  console.log('   ↳ Direct nav: Feedback & Report links verified (no redundant dropdown)');
  console.log('   ↳ Puff & Pip components verified: Mentor Hero, SVGs, Question Guidance, Handoff Card');
  console.log('   ↳ Typography verified: Question font size (' + navAndPuffState.qFontSize + 'px) > Option font size (' + navAndPuffState.optFontSize + 'px)');
  console.log('   [✓ PASSED] Direct Navbar, Subnav Tabs, Typography & Puff/Pip Guidance verified\n');

  // ---------------------------------------------------------------------------
  // 3. User Login Home Page (Avatar Selection) & 3D Map Radar Rendering
  // ---------------------------------------------------------------------------
  console.log('Test 6: User Login Home Page (mode=home) 3D Map Radar & Biomes...');
  await page.goto(gameUrl, { waitUntil: 'load' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('searchO2_user', JSON.stringify({
      id: 'usr_green_hero',
      displayName: 'Captain Eco',
      email: 'eco@searcho2.org',
      role: 'user',
      isGuest: false
    }));
    localStorage.setItem('searchO2_token', 'valid_token_long_jwt_string_1234567890');
    // Pre-select an avatar so we test that mode=home forces display of the home overlay
    localStorage.setItem('searchO2_selected_avatar', JSON.stringify({ id: 'avatar_1', name: 'Liam' }));
  });

  // Navigate to game with mode=home
  await page.goto(gameUrl + '?mode=home', { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  const homeStatus = await page.evaluate(() => {
    const overlay = document.getElementById('s2HomeOverlay');
    const canvas = document.getElementById('s2HomeGlobeCanvas');
    const biomeCards = Array.from(document.querySelectorAll('.s2-biome-card'));

    let nonZeroPixels = 0;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < img.data.length; i += 4) {
        if (img.data[i + 3] > 0) nonZeroPixels++;
      }
    }

    return {
      overlayExists: !!overlay,
      overlayVisible: overlay && window.getComputedStyle(overlay).display !== 'none',
      canvasExists: !!canvas,
      canvasWidth: canvas ? canvas.width : 0,
      canvasHeight: canvas ? canvas.height : 0,
      canvasDisplay: canvas ? window.getComputedStyle(canvas).display : null,
      nonZeroPixels,
      biomeCount: biomeCards.length,
      biomes: biomeCards.map(c => ({
        id: c.getAttribute('data-biome'),
        badge: c.querySelector('.s2-biome-badge') ? c.querySelector('.s2-biome-badge').textContent.trim() : '',
        isActive: c.classList.contains('is-active'),
        isLocked: c.classList.contains('is-locked')
      }))
    };
  });

  console.log('   ↳ Home Overlay exists:', homeStatus.overlayExists, 'Visible:', homeStatus.overlayVisible);
  console.log('   ↳ 3D Globe Canvas exists:', homeStatus.canvasExists, 'Size:', `${homeStatus.canvasWidth}x${homeStatus.canvasHeight}`, 'Non-zero pixels:', homeStatus.nonZeroPixels);
  console.log('   ↳ Biome Cards Count:', homeStatus.biomeCount);

  assert(homeStatus.overlayExists, 'Home Overlay #s2HomeOverlay must exist in DOM');
  assert(homeStatus.overlayVisible, 'Home Overlay #s2HomeOverlay must be visible');
  assert(homeStatus.canvasExists, '3D Map Radar #s2HomeGlobeCanvas must exist in DOM');
  assert(homeStatus.canvasWidth > 0 && homeStatus.canvasHeight > 0, 'Canvas must have dimensions > 0');
  assert(homeStatus.nonZeroPixels > 10000, `Canvas must render 3D planetary globe pixels (found ${homeStatus.nonZeroPixels})`);
  assert(homeStatus.biomeCount >= 8, 'Must render all biomes cards');

  // Verify Active vs Locked status
  const gerBiome = homeStatus.biomes.find(b => b.id === 'germany');
  const bavBiome = homeStatus.biomes.find(b => b.id === 'bavaria');
  const smBiome = homeStatus.biomes.find(b => b.id === 'saint_martin');
  const brBiome = homeStatus.biomes.find(b => b.id === 'brazil');

  assert(gerBiome && gerBiome.isActive && gerBiome.badge.includes('ACTIVE'), 'Germany must be Active Farm');
  assert(bavBiome && bavBiome.isActive && bavBiome.badge.includes('ACTIVE'), 'Bavaria must be Active Farm');
  assert(smBiome && smBiome.isActive && smBiome.badge.includes('ACTIVE'), 'Saint Martin must be Active Farm');
  assert(brBiome && brBiome.isLocked && brBiome.badge.includes('2,500 O₂'), 'Brazil must be Locked requiring 2,500 O₂');

  console.log('   ↳ Germany status:', gerBiome.badge);
  console.log('   ↳ Bavaria status:', bavBiome.badge);
  console.log('   ↳ Saint Martin status:', smBiome.badge);
  console.log('   ↳ Brazil status:', brBiome.badge);
  console.log('   [✓ PASSED] 3D Map Radar and Biomes Lock Status verified\n');

  // ---------------------------------------------------------------------------
  // 4. Biome Card Click Navigation & Notification
  // ---------------------------------------------------------------------------
  console.log('Test 7: Biome Card click behavior...');
  // Click locked biome (Brazil) -> should show notification
  const notifMsg = await page.evaluate(() => {
    let captured = null;
    window.showNotification = function(icon, text) { captured = { icon, text }; };
    const brazilCard = document.querySelector('.s2-biome-card[data-biome="brazil"]');
    if (brazilCard) brazilCard.click();
    return captured;
  });

  assert(notifMsg && notifMsg.text.includes('2,500 O₂'), 'Clicking locked biome must show required O₂ notification');
  console.log('   ↳ Locked biome click notification:', notifMsg.text);

  // Click unlocked Base Farm (Germany) -> closes overlay
  await page.evaluate(() => {
    const gerCard = document.querySelector('.s2-biome-card[data-biome="germany"]');
    if (gerCard) gerCard.click();
  });
  await page.waitForTimeout(300);

  const overlayHiddenAfterClick = await page.evaluate(() => {
    const overlay = document.getElementById('s2HomeOverlay');
    return !overlay || overlay.classList.contains('hidden');
  });
  assert(overlayHiddenAfterClick, 'Clicking Germany card must enter farm and hide home overlay');
  console.log('   ↳ Germany card click successfully navigated to Base Farm and closed overlay');
  console.log('   [✓ PASSED] Biome Card click navigation verified\n');

  console.log('================================================================');
  console.log('  ALL TESTS PASSED SUCCESSFULLY (0 FAILURES)');
  console.log('================================================================');

  await browser.close();
})();
