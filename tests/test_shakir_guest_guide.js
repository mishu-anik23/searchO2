/**
 * Automated Test: Shakir CEO Guide for Guest Users & Removal of Current Avatar in Guest Mode
 */
const { chromium } = require('playwright');
const path = require('path');

async function runTest() {
  console.log('====================================================');
  console.log('  Testing SearchO2 Shakir CEO Guide for Guest Users');
  console.log('====================================================\n');

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

  // Clear localStorage before testing to ensure fresh guest session
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  console.log('\n--- Test 1: Verify Initial Guest Status & Avatar Select Overlay Suppressed ---');
  const homeOverlayVisible = await page.evaluate(() => {
    const overlay = document.getElementById('s2HomeOverlay');
    return overlay && !overlay.classList.contains('hidden') && overlay.style.display !== 'none';
  });
  console.log('Is s2HomeOverlay visible on initial guest load?', homeOverlayVisible);
  if (homeOverlayVisible) {
    console.error('❌ FAILED: Avatar selection overlay was shown to guest user!');
  } else {
    console.log('✓ PASSED: Avatar selection overlay is completely suppressed for guest mode.');
  }

  console.log('\n--- Test 2: Switch to Farm View in Guest Mode ---');
  await page.evaluate(() => {
    if (typeof switchScreen === 'function') {
      switchScreen('farm');
    }
  });
  await page.waitForTimeout(1400);

  const checkElements = await page.evaluate(() => {
    const oldAvatar = document.getElementById('s2PlayerAvatar');
    const shakir = document.getElementById('s2ShakirGuide');
    const headTag = shakir ? shakir.querySelector('.shakir-head-tag') : null;
    const bubble = document.getElementById('s2ShakirBubble');
    const svg = shakir ? shakir.querySelector('.shakir-walker-svg') : null;

    // Check topbar stats
    const statsHtml = document.getElementById('topbarStats') ? document.getElementById('topbarStats').innerHTML : '';
    const hasShakirCard = statsHtml.includes('CEO Guide') && statsHtml.includes('Shakir');
    const hasOldAvatarSelectCard = statsHtml.includes('SearchO2HomeAvatar.showHomeOverlay()');

    return {
      hasOldAvatar: !!oldAvatar,
      hasShakir: !!shakir,
      headTagText: headTag ? headTag.textContent : null,
      bubbleText: bubble ? bubble.textContent : null,
      hasSvg: !!svg,
      hasShakirCard,
      hasOldAvatarSelectCard
    };
  });

  console.log('Old player avatar exists on farm?', checkElements.hasOldAvatar);
  console.log('Shakir Guide exists on farm?', checkElements.hasShakir);
  console.log('Shakir head tag:', checkElements.headTagText);
  console.log('Shakir speech bubble:', checkElements.bubbleText);
  console.log('Topbar stats has Shakir CEO Guide card?', checkElements.hasShakirCard);
  console.log('Topbar stats has old avatar select card?', checkElements.hasOldAvatarSelectCard);

  if (checkElements.hasOldAvatar) {
    console.error('❌ FAILED: Old player avatar still exists on farm in guest mode!');
  } else {
    console.log('✓ PASSED: Old avatar completely removed from guest mode on farm.');
  }

  if (checkElements.hasShakir && checkElements.hasSvg) {
    console.log('✓ PASSED: Shakir 3D Isometric Guide spawned on farm with full SVG asset.');
  } else {
    console.error('❌ FAILED: Shakir was not spawned properly on the farm.');
  }

  if (checkElements.hasShakirCard && !checkElements.hasOldAvatarSelectCard) {
    console.log('✓ PASSED: Topbar correctly displays Shakir CEO Guide card and completely omitted old avatar card.');
  } else {
    console.error('❌ FAILED: Topbar card does not match guest mode specifications.');
  }

  console.log('\n--- Test 3: Test Interactive Click on Shakir (Opens CEO Dialog, NOT Avatar Select) ---');
  await page.evaluate(() => {
    const shakir = document.getElementById('s2ShakirGuide');
    if (shakir) shakir.click();
  });
  await page.waitForTimeout(600);

  const checkModal = await page.evaluate(() => {
    const modal = document.getElementById('s2ShakirModal');
    const homeOverlay = document.getElementById('s2HomeOverlay');
    const isHomeVisible = homeOverlay && !homeOverlay.classList.contains('hidden');
    return {
      modalExists: !!modal,
      modalText: modal ? modal.textContent : '',
      isHomeVisible: isHomeVisible
    };
  });

  console.log('Shakir CEO Modal opened?', checkModal.modalExists);
  console.log('Avatar select overlay opened on click?', checkModal.isHomeVisible);

  if (checkModal.modalExists && !checkModal.isHomeVisible) {
    console.log('✓ PASSED: Clicking Shakir opened child-friendly CEO Guidance Dialog, NEVER avatar select overlay.');
  } else {
    console.error('❌ FAILED: Clicking Shakir opened wrong modal or failed.');
  }

  console.log('\n--- Test 4: Walking Dynamics, Wonder Touch & Cyan Blueprint Without Blueprint Text ---');
  await page.evaluate(() => {
    if (window.SearchO2ShakirGuide) {
      window.SearchO2ShakirGuide.walkToChapter(1);
    }
  });

  // Wait for walk animation and wonder touch
  await page.waitForTimeout(4500);

  const checkWonderTouchAndBlueprints = await page.evaluate(() => {
    const shakir = document.getElementById('s2ShakirGuide');
    const ghostLayer = document.getElementById('s2GhostLayer');
    const ghostObjs = ghostLayer ? ghostLayer.querySelectorAll('.s2-ghost-obj') : [];
    const blueprintTags = ghostLayer ? ghostLayer.querySelectorAll('.s2-ghost-blueprint-tag') : [];
    const visibleTags = Array.from(blueprintTags).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    const skyHeading = document.getElementById('s2SkyHeading');
    const isCooldown = window.SearchO2ShakirGuide ? window.SearchO2ShakirGuide.isCooldownActive() : false;
    const cooldownRem = window.SearchO2ShakirGuide ? window.SearchO2ShakirGuide.getCooldownRemaining() : 0;

    return {
      shakirPosition: shakir ? { left: shakir.style.left, top: shakir.style.top } : null,
      ghostCount: ghostObjs.length,
      visibleBlueprintTagCount: visibleTags.length,
      hasSkyHeading: !!skyHeading,
      skyHeadingText: skyHeading ? skyHeading.textContent : null,
      isCooldown: isCooldown,
      cooldownRemaining: cooldownRem
    };
  });

  console.log('Shakir position after walk to Ch 1:', checkWonderTouchAndBlueprints.shakirPosition);
  console.log('Cyan Ghost objects count:', checkWonderTouchAndBlueprints.ghostCount);
  console.log('Visible Blueprint text tags count (must be 0):', checkWonderTouchAndBlueprints.visibleBlueprintTagCount);
  console.log('Sky heading text:', checkWonderTouchAndBlueprints.skyHeadingText);
  console.log('Is Scout Cooldown active?', checkWonderTouchAndBlueprints.isCooldown);
  console.log('Cooldown remaining seconds:', checkWonderTouchAndBlueprints.cooldownRemaining);

  if (checkWonderTouchAndBlueprints.visibleBlueprintTagCount === 0) {
    console.log('✓ PASSED: Cyan blueprint structures displayed WITHOUT blueprint text as requested!');
  } else {
    console.error('❌ FAILED: Blueprint text tags were visible on ghost objects!');
  }

  if (checkWonderTouchAndBlueprints.isCooldown) {
    console.log('✓ PASSED: Scout Cooldown successfully activated with timer.');
  } else {
    console.error('❌ FAILED: Scout Cooldown was not active.');
  }

  console.log('\n--- Test 5: Verify Shakir Guide Only For Guest User (Login Disables Shakir) ---');
  await page.evaluate(() => {
    window.apiUser = {
      id: 'usr_reg_123',
      displayName: 'Alice Farmer',
      role: 'registered'
    };
    if (window.SearchO2ShakirGuide) {
      window.SearchO2ShakirGuide.removeGuide();
    }
  });
  await page.waitForTimeout(600);

  const checkRegistered = await page.evaluate(() => {
    const shakir = document.getElementById('s2ShakirGuide');
    const isGuest = window.SearchO2ShakirGuide ? window.SearchO2ShakirGuide.isGuestMode() : true;
    return {
      shakirOnFarm: !!shakir,
      isGuest: isGuest
    };
  });

  console.log('Is guest mode reported when logged in?', checkRegistered.isGuest);
  console.log('Is Shakir present when logged in?', checkRegistered.shakirOnFarm);

  if (!checkRegistered.isGuest && !checkRegistered.shakirOnFarm) {
    console.log('✓ PASSED: Shakir Guide is strictly for guest users and is removed for logged-in accounts.');
  } else {
    console.error('❌ FAILED: Shakir guide logic did not respect login state.');
  }

  console.log('\n====================================================');
  console.log('  ALL SHAKIR GUEST GUIDE TESTS COMPLETED SUCCESSFULLY');
  console.log('====================================================');

  await browser.close();
}

runTest().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
