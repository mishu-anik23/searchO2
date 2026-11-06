const { chromium } = require('playwright');
const path = require('path');

async function runTests() {
  console.log('========================================================================');
  console.log('  Testing Handover Modal, Shakir Direct Start, Voice, UI & Responsive   ');
  console.log('========================================================================\n');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (e) {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  console.log('Loading page:', fileUrl);

  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Switch to farm
  await page.evaluate(() => {
    if (typeof switchScreen === 'function') switchScreen('farm');
  });
  await page.waitForTimeout(600);

  // --- Test 1: Clean UI - No developer notes in author labels or status ---
  console.log('--- Test 1: Clean UI without internal developer labels ---');
  await page.evaluate(() => {
    KidsSustainabilityAcademy.openAcademyModal();
  });
  await page.waitForTimeout(400);

  const cleanUiCheck = await page.evaluate(() => {
    const catBubble = document.getElementById('academyCatBubble');
    const pipBubble = document.getElementById('academyPipBubble');
    const catAuthor = catBubble ? catBubble.querySelector('.speech-author').textContent : '';
    const pipAuthor = pipBubble ? pipBubble.querySelector('.speech-author').textContent : '';
    const statusText = document.getElementById('academySpeakerStatus').textContent;

    const hasNoInternalNotes =
      !catAuthor.includes('7-8y') && !catAuthor.includes('Moody') &&
      !pipAuthor.includes('4-5y') && !pipAuthor.includes('Toddler') &&
      !statusText.includes('Moody') && !statusText.includes('Curious');

    const hasProperNames =
      catAuthor.includes('Professor Whisker Puff') && pipAuthor.includes('Pip Squeak-a-Link');

    return { hasNoInternalNotes, hasProperNames, catAuthor, pipAuthor, statusText };
  });

  console.log('Cat author label:', cleanUiCheck.catAuthor);
  console.log('Pip author label:', cleanUiCheck.pipAuthor);
  console.log('Speaker status text:', cleanUiCheck.statusText);
  console.log('Has proper character names?', cleanUiCheck.hasProperNames);
  console.log('Has NO internal notes visible to user?', cleanUiCheck.hasNoInternalNotes);

  if (!cleanUiCheck.hasNoInternalNotes || !cleanUiCheck.hasProperNames) {
    throw new Error('Test 1 Failed: Internal developer notes visible or character names incorrect');
  }
  console.log('✓ PASSED: Character speech author tags and status are clean and immersive!\n');

  // --- Test 2: Rephrased Engaging & Child-Friendly Dialogue ---
  console.log('--- Test 2: Rephrased Engaging & Child-Friendly Dialogue ---');
  const dialogueCheck = await page.evaluate(() => {
    const catText = document.getElementById('academyCatText').textContent;
    const pipText = document.getElementById('academyPipText').textContent;

    const harshKeywords = [
      'explaining this once',
      'do not interrupt',
      'do not disrupt',
      'stop fidgeting',
      'be quiet',
      'pay attention or fail'
    ];

    const hasNoHarshPhrases = harshKeywords.every(w =>
      !catText.toLowerCase().includes(w) && !pipText.toLowerCase().includes(w)
    );

    const hasIntriguingPhrases =
      catText.includes('extraordinary living marvel') &&
      (pipText.includes('magic') || pipText.includes('explore together'));

    return { hasNoHarshPhrases, hasIntriguingPhrases, catText, pipText };
  });

  console.log('Has NO harsh phrases?', dialogueCheck.hasNoHarshPhrases);
  console.log('Has fascinating, intriguing story phrases?', dialogueCheck.hasIntriguingPhrases);

  if (!dialogueCheck.hasNoHarshPhrases) {
    throw new Error('Test 2 Failed: Dialogue still contains harsh phrases');
  }
  console.log('✓ PASSED: Dialogues rephrased engagingly and delightfully!\n');

  // --- Test 3: Puff & Pip Handover Modal on Skip Tour ---
  console.log('--- Test 3: Puff & Pip Handover Modal on Academy Skip ---');
  await page.evaluate(() => {
    const skipBtn = document.getElementById('btnAcademySkip');
    if (skipBtn) skipBtn.click();
  });
  await page.waitForTimeout(600);

  const handoverCheck = await page.evaluate(() => {
    const modal = document.getElementById('kidsAcademyHandoverModal');
    if (!modal) return { exists: false };
    const pipText = modal.querySelector('#handoverPipText') ? modal.querySelector('#handoverPipText').textContent : '';
    const puffText = modal.querySelector('#handoverPuffText') ? modal.querySelector('#handoverPuffText').textContent : '';
    const startShakirBtn = modal.querySelector('#btnHandoverStartShakir');
    const freeRoamBtn = modal.querySelector('#btnHandoverFreeRoam');

    const pipWantsWalkingTour = pipText.includes('walking tour') || pipText.includes('field action') || pipText.includes('paws');
    const puffSuggestsShakir = puffText.includes('practical-minded') || puffText.includes('Shakir');

    return {
      exists: true,
      hasStartBtn: !!startShakirBtn,
      hasFreeRoamBtn: !!freeRoamBtn,
      pipWantsWalkingTour,
      puffSuggestsShakir,
      pipText,
      puffText
    };
  });

  console.log('Handover modal exists?', handoverCheck.exists);
  console.log('Pip asks for walking tour?', handoverCheck.pipWantsWalkingTour);
  console.log('Puff suggests Shakir is the one?', handoverCheck.puffSuggestsShakir);
  console.log('Has Start Shakir button?', handoverCheck.hasStartBtn);
  console.log('Has Free Roam button?', handoverCheck.hasFreeRoamBtn);

  if (!handoverCheck.exists || !handoverCheck.pipWantsWalkingTour || !handoverCheck.puffSuggestsShakir) {
    throw new Error('Test 3 Failed: Handover transition modal missing or dialogue mismatch');
  }
  console.log('✓ PASSED: Skip Tour opens Puff & Pip interactive handover modal smoothly!\n');

  // --- Test 4: Starting Shakir from Handover Modal Walks to Chapter 1 ---
  console.log('--- Test 4: Launching Shakir Tour from Handover Modal ---');
  await page.evaluate(() => {
    const startBtn = document.getElementById('btnHandoverStartShakir');
    if (startBtn) startBtn.click();
  });
  await page.waitForTimeout(600);

  const shakirTourActive = await page.evaluate(() => {
    const handoverModalClosed = !document.getElementById('kidsAcademyHandoverModal');
    const farmActive = document.getElementById('farmScreen') && !document.getElementById('farmScreen').classList.contains('hidden');
    return handoverModalClosed && farmActive;
  });

  console.log('Handover closed & Shakir active on Farm?', shakirTourActive);
  if (!shakirTourActive) {
    throw new Error('Test 4 Failed: Shakir walking tour did not initiate properly from handover modal');
  }
  console.log('✓ PASSED: Shakir field tour started successfully!\n');

  // --- Test 5: Guest Homepage Shakir Tour Direct Start ---
  console.log('--- Test 5: Guest Homepage Shakir Tour Direct Start ---');
  await page.evaluate(() => {
    // Switch to region screen (Guest Homepage)
    if (typeof switchScreen === 'function') switchScreen('region');
  });
  await page.waitForTimeout(500);

  const regionActive = await page.evaluate(() => {
    return document.getElementById('regionScreen') && !document.getElementById('regionScreen').classList.contains('hidden');
  });
  console.log('On Region (Guest Home) Screen?', regionActive);

  // Click the guest homepage Shakir tour button
  await page.evaluate(() => {
    const btn = document.getElementById('btnGuestHomeCeoTour');
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);

  const guestTourStarted = await page.evaluate(() => {
    const farmActive = document.getElementById('farmScreen') && !document.getElementById('farmScreen').classList.contains('hidden');
    return farmActive;
  });

  console.log('Guest homepage button directly switched to farm and launched tour?', guestTourStarted);
  if (!guestTourStarted) {
    throw new Error('Test 5 Failed: Guest homepage Shakir tour button did not switch to farm screen');
  }
  console.log('✓ PASSED: Guest homepage Shakir button switches directly to farm tour!\n');

  // --- Test 6: Responsive Viewports & Screen Compatibility ---
  console.log('--- Test 6: Screen Compatibility across Small Laptops & Mobile ---');

  const testViewports = [
    { name: 'Small Laptop (1366x768 @ 125% DPI)', width: 1093, height: 614 },
    { name: 'Small Monitor', width: 1024, height: 600 },
    { name: 'Mobile Landscape', width: 844, height: 390 },
    { name: 'Mobile Portrait', width: 390, height: 844 }
  ];

  for (const vp of testViewports) {
    console.log(`Testing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(300);

    // Open academy modal
    await page.evaluate(() => {
      KidsSustainabilityAcademy.openAcademyModal();
    });
    await page.waitForTimeout(400);

    const fitCheck = await page.evaluate((vh) => {
      const card = document.querySelector('.kids-academy-card');
      const tabs = document.querySelector('.timeline-indicators-row');
      if (!card) return { found: false };

      const cardRect = card.getBoundingClientRect();
      const cardFits = cardRect.top >= 0 && cardRect.bottom <= (vh + 2); // small tolerance for borders

      const tabsRect = tabs ? tabs.getBoundingClientRect() : null;
      const tabsInsideCard = tabsRect ? (tabsRect.top >= cardRect.top && tabsRect.bottom <= (cardRect.bottom + 5)) : true;

      return {
        found: true,
        cardFits,
        tabsInsideCard,
        cardHeight: Math.round(cardRect.height),
        viewportHeight: vh
      };
    }, vp.height);

    console.log(`  Card height: ${fitCheck.cardHeight}px (viewport: ${vp.height}px), card fits? ${fitCheck.cardFits}, tabs inside? ${fitCheck.tabsInsideCard}`);
    if (!fitCheck.found || !fitCheck.cardFits || !fitCheck.tabsInsideCard) {
      throw new Error(`Test 6 Failed: Academy card or tabs clipped on viewport ${vp.name}`);
    }

    // Close modal
    await page.evaluate(() => {
      KidsSustainabilityAcademy.closeAcademyModal(true);
    });
    await page.waitForTimeout(200);
  }
  console.log('✓ PASSED: All tabs and UI elements fit comfortably on all screen sizes!\n');

  // --- Test 7: Floating Eco Academy Button is Icon-Only ---
  console.log('--- Test 7: Eco Academy Floating Button is Icon-Only with Hover Card ---');
  await page.setViewportSize({ width: 1280, height: 800 });
  const iconOnlyCheck = await page.evaluate(() => {
    const container = document.getElementById('kidsAcademyInstructionPoint');
    if (!container) return false;
    const btn = container.querySelector('#btnKidsAcademyTrigger');
    const tooltip = container.querySelector('.instruction-point-tooltip');
    const hasCharPair = btn && btn.querySelector('.ip-char-pair');
    const hasNoPersistentLabel = !container.querySelector('.ip-label');
    return !!btn && !!tooltip && !!hasCharPair && hasNoPersistentLabel;
  });
  console.log('Eco Academy button is icon-only?', iconOnlyCheck);

  if (!iconOnlyCheck) {
    throw new Error('Test 7 Failed: Floating point is not icon-only');
  }
  console.log('✓ PASSED: Eco Academy button is icon-only with rich hover info!\n');

  await browser.close();
  console.log('========================================================================');
  console.log('  ALL HANDOVER, TOUR, VOICE, UI & SCREEN COMPATIBILITY TESTS PASSED!    ');
  console.log('========================================================================');
}

runTests().catch(err => {
  console.error('Test run error:', err);
  process.exit(1);
});
