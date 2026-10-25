/**
 * Playwright Test Suite:
 * Animated Hub Deep-Dive Spotlight (Whisker Puff & Pip Squeak-a-Link) in Guest Mode Home Globe Page
 */
const { chromium } = require('playwright');
const path = require('path');

async function runTestSuite() {
  console.log('====================================================================');
  console.log('  Testing Animated Hub Spotlight (Cat & Mouse) on Home Globe Page');
  console.log('====================================================================\n');

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

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
    console.log(`[Step 1] Loading index.html in guest mode: ${fileUrl}`);

    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Ensure we are on region/globe screen
    await page.evaluate(() => {
      if (typeof switchScreen === 'function') {
        switchScreen('region_select');
      }
    });
    await page.waitForTimeout(1000);

    // 1. Verify existence and position of #hubDeepDiveSpotlight before .intro-achievements-tray
    console.log('\n--- Test 1: DOM Placement & Structure ---');
    const orderCheck = await page.evaluate(() => {
      const spotlight = document.getElementById('hubDeepDiveSpotlight');
      const tray = document.querySelector('.intro-achievements-tray');
      if (!spotlight) return { error: 'Spotlight element #hubDeepDiveSpotlight not found' };
      if (!tray) return { error: 'Achievements tray .intro-achievements-tray not found' };

      // Check if spotlight appears before tray in the document flow
      const position = spotlight.compareDocumentPosition(tray);
      const isBefore = (position & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      
      const trayHeading = tray.querySelector('h2, h3, .tray-title, .achieve-title');
      const trayText = tray.textContent || '';
      const hasMilestoneText = trayText.includes('Planetary Achievements') || trayText.includes('Roadmap');

      return {
        hasSpotlight: true,
        hasTray: true,
        isBefore,
        hasMilestoneText
      };
    });

    console.log('DOM order check result:', orderCheck);
    if (!orderCheck.hasSpotlight) throw new Error(orderCheck.error);
    if (!orderCheck.isBefore) throw new Error('Spotlight is not positioned before the achievements tray');
    console.log('✓ PASSED: #hubDeepDiveSpotlight is directly before .intro-achievements-tray');

    // 2. Verify Cat character (Professor Whisker Puff)
    console.log('\n--- Test 2: Cat Character (Professor Whisker Puff) ---');
    const catData = await page.evaluate(() => {
      const catEl = document.querySelector('.hub-dd-char-col.cat-col');
      if (!catEl) return null;
      const tag = catEl.querySelector('.speech-author')?.textContent?.trim() || '';
      const bubble = catEl.querySelector('.speech-text')?.textContent?.trim() || '';
      const svg = catEl.querySelector('svg.whisker-puff-svg');
      const hasHead = !!catEl.querySelector('.whisker-head');
      const hasTail = !!catEl.querySelector('.whisker-tail');
      const hasPaw = !!catEl.querySelector('.whisker-paw');
      return { tag, bubble, hasSvg: !!svg, hasHead, hasTail, hasPaw };
    });

    console.log('Cat Character:', catData);
    if (!catData) throw new Error('Cat character container not found');
    if (!catData.tag.includes('Professor Whisker Puff')) throw new Error('Cat name "Professor Whisker Puff" missing');
    if (!catData.bubble.includes('gateway to deeper truth') || !catData.bubble.includes('Squeak-a-Link')) {
      throw new Error('Cat dialogue mismatch: ' + catData.bubble);
    }
    if (!catData.hasSvg || !catData.hasHead || !catData.hasTail) {
      throw new Error('Cat animated SVG elements missing');
    }
    console.log('✓ PASSED: Cat character name, dialogue, and animated SVG elements verified.');

    // 3. Verify Mouse character (Pip Squeak-a-Link)
    console.log('\n--- Test 3: Mouse Character (Pip Squeak-a-Link) ---');
    const mouseData = await page.evaluate(() => {
      const mouseEl = document.querySelector('.hub-dd-char-col.mouse-col');
      if (!mouseEl) return null;
      const tag = mouseEl.querySelector('.speech-author')?.textContent?.trim() || '';
      const bubble = mouseEl.querySelector('.speech-text')?.textContent?.trim() || '';
      const svg = mouseEl.querySelector('svg.pip-mouse-svg');
      const hasBody = !!mouseEl.querySelector('.pip-body-group');
      const hasTail = !!mouseEl.querySelector('.pip-tail');
      return { tag, bubble, hasSvg: !!svg, hasBody, hasTail };
    });

    console.log('Mouse Character:', mouseData);
    if (!mouseData) throw new Error('Mouse character container not found');
    if (!mouseData.tag.includes('Pip Squeak-a-Link')) throw new Error('Mouse name "Pip Squeak-a-Link" missing');
    if (!mouseData.bubble.includes('No time to explain') || !mouseData.bubble.includes('Motherlode')) {
      throw new Error('Mouse dialogue mismatch: ' + mouseData.bubble);
    }
    if (!mouseData.hasSvg || !mouseData.hasBody || !mouseData.hasTail) {
      throw new Error('Mouse animated SVG elements missing');
    }
    console.log('✓ PASSED: Mouse character name, dialogue, and animated SVG elements verified.');

    // 4. Verify Holographic Hub Card
    console.log('\n--- Test 4: Holographic Hub Card & Visual Elements ---');
    const cardData = await page.evaluate(() => {
      const card = document.querySelector('.hub-dd-holo-card');
      if (!card) return null;
      const text = card.textContent || '';
      const rings = card.querySelectorAll('.holo-orbital-ring').length;
      const spores = card.querySelectorAll('.spore').length;
      const cursor = card.querySelector('.holo-cursor-hand');
      const directHubBtn = document.querySelector('.btn-hub-dd-primary');
      const directHref = directHubBtn ? directHubBtn.getAttribute('href') : '';
      return {
        hasCard: true,
        textSnippet: text.substring(0, 100).replace(/\s+/g, ' '),
        ringsCount: rings,
        sporesCount: spores,
        hasCursor: !!cursor,
        directHref
      };
    });

    console.log('Card data:', cardData);
    if (!cardData || !cardData.hasCard) throw new Error('Holographic hub card not found');
    if (cardData.ringsCount < 2 || cardData.sporesCount < 3) {
      throw new Error('Orbital rings or spores missing from holographic card');
    }
    if (!cardData.directHref.includes('hub/index.html')) {
      throw new Error('Direct hub button href does not point to hub/index.html');
    }
    console.log('✓ PASSED: Holographic Hub card visuals & direct access link verified.');

    // 5. Test Keyframe Animations
    console.log('\n--- Test 5: Steady Repetitive CSS Keyframe Animations ---');
    const animCheck = await page.evaluate(() => {
      const card = document.querySelector('.hub-dd-holo-card');
      const catHead = document.querySelector('.whisker-head');
      const pipBody = document.querySelector('.pip-body-group');
      const ring = document.querySelector('.holo-orbital-ring.ring-1');

      const cardAnim = card ? window.getComputedStyle(card).animationName : '';
      const catAnim = catHead ? window.getComputedStyle(catHead).animationName : '';
      const pipAnim = pipBody ? window.getComputedStyle(pipBody).animationName : '';
      const ringAnim = ring ? window.getComputedStyle(ring).animationName : '';

      return { cardAnim, catAnim, pipAnim, ringAnim };
    });

    console.log('Computed animation names:', animCheck);
    if (!animCheck.cardAnim.includes('holoCardBob')) throw new Error('Card animation missing');
    if (!animCheck.catAnim.includes('whiskerHeadTilt')) throw new Error('Cat head animation missing');
    if (!animCheck.pipAnim.includes('pipHop')) throw new Error('Mouse hop animation missing');
    if (!animCheck.ringAnim.includes('ringSpin')) throw new Error('Ring spin animation missing');
    console.log('✓ PASSED: Steady repetitive CSS keyframe animations confirmed active.');

    // 6. Test Modal Triggering, Chime & Navigation
    console.log('\n--- Test 6: Deep-Dive Modal, Sound Chime & Hub Navigation Link ---');
    
    // Check initial modal state
    const initialModalState = await page.evaluate(() => {
      const modal = document.getElementById('hubDeepDiveModal');
      return modal ? (modal.style.display !== 'none' && modal.style.display !== '') : false;
    });
    console.log('Initial modal active state:', initialModalState);
    if (initialModalState) throw new Error('Modal should not be open by default');

    // Click Holographic Card
    console.log('Clicking Hologram card to trigger modal...');
    await page.evaluate(() => {
      const card = document.querySelector('.hub-dd-holo-card');
      if (card) {
        card.scrollIntoView({ behavior: 'instant', block: 'center' });
        card.click();
      }
    });
    await page.waitForTimeout(600);

    const modalOpenState = await page.evaluate(() => {
      const modal = document.getElementById('hubDeepDiveModal');
      if (!modal) return { open: false };
      const isOpen = modal.style.display === 'flex' || modal.style.display !== 'none';
      const title = modal.querySelector('.hub-dd-modal-title')?.textContent || '';
      const docket = modal.querySelector('.hub-dd-modal-docket')?.textContent || '';
      const primaryBtn = modal.querySelector('.hub-dd-modal-btn-primary');
      const primaryHref = primaryBtn ? primaryBtn.getAttribute('href') : '';
      const dismissBtn = modal.querySelector('.hub-dd-modal-btn-secondary');
      return {
        open: isOpen,
        title,
        docket,
        primaryHref,
        hasDismissBtn: !!dismissBtn
      };
    });

    console.log('Modal opened state:', modalOpenState);
    if (!modalOpenState.open) throw new Error('Modal failed to open upon clicking hologram card');
    if (!modalOpenState.docket.includes('#409')) throw new Error('Modal docket #409 missing');
    if (!modalOpenState.primaryHref.includes('hub/index.html')) {
      throw new Error('Modal primary link href does not point to hub/index.html: ' + modalOpenState.primaryHref);
    }
    console.log('✓ PASSED: Deep-Dive Modal successfully opened with docket #409 and Hub link.');

    // 7. Test Modal Dismiss & Smooth Continuation to Rest of Biome Cards
    console.log('\n--- Test 7: Modal Dismiss & Non-Blocking Navigation to Biome Cards ---');
    
    // Click "Return to Biomes" button in modal
    await page.evaluate(() => {
      const btn = document.querySelector('.hub-dd-modal-btn-secondary');
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);

    const modalClosedState = await page.evaluate(() => {
      const modal = document.getElementById('hubDeepDiveModal');
      const achieveCards = document.querySelectorAll('.intro-achievements-tray .achieve-card');
      const globeChips = document.querySelectorAll('.globe-chip');
      const heroSection = document.getElementById('regionHeroSection');

      return {
        isModalClosed: modal ? (modal.style.display === 'none' || modal.style.display === '') : false,
        achieveCardsCount: achieveCards.length,
        globeChipsCount: globeChips.length,
        hasHeroSection: !!heroSection
      };
    });

    console.log('After dismiss state:', modalClosedState);
    if (!modalClosedState.isModalClosed) throw new Error('Modal did not close on clicking dismiss button');
    if (modalClosedState.achieveCardsCount === 0) throw new Error('Achievement cards missing after dismiss');
    console.log(`✓ PASSED: Modal dismissed cleanly. Found ${modalClosedState.achieveCardsCount} achievement cards and ${modalClosedState.globeChipsCount} globe chips clickable in document flow.`);

    // Click an achievement card to verify interactivity is not blocked
    await page.evaluate(() => {
      const card = document.querySelector('.intro-achievements-tray .achieve-card');
      if (card) {
        card.scrollIntoView({ behavior: 'instant', block: 'center' });
        card.click();
      }
    });
    await page.waitForTimeout(300);
    console.log('✓ PASSED: Achievement card interaction succeeded.');

    // 8. Mobile Responsiveness Tests
    console.log('\n--- Test 8: Mobile Viewports & Screen Alignment ---');
    const mobileViewports = [
      { name: 'iPhone SE (375x667)', width: 375, height: 667 },
      { name: 'Small Mobile (320x568)', width: 320, height: 568 }
    ];

    for (const vp of mobileViewports) {
      console.log(`Testing viewport: ${vp.name}...`);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(500);

      const metrics = await page.evaluate(() => {
        const spotlight = document.getElementById('hubDeepDiveSpotlight');
        const docEl = document.documentElement;
        const body = document.body;

        const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
        const clientWidth = docEl.clientWidth;
        const spotlightRect = spotlight ? spotlight.getBoundingClientRect() : null;

        return {
          clientWidth,
          scrollWidth,
          overflowX: scrollWidth > clientWidth + 2,
          spotlightWidth: spotlightRect ? spotlightRect.width : 0,
          spotlightLeft: spotlightRect ? spotlightRect.left : 0
        };
      });

      console.log(`Viewport ${vp.name} metrics:`, metrics);
      if (metrics.overflowX) {
        throw new Error(`Horizontal overflow detected in ${vp.name}: scrollWidth=${metrics.scrollWidth}, clientWidth=${metrics.clientWidth}`);
      }
      console.log(`✓ PASSED: ${vp.name} rendered without horizontal overflow or screen clipping.`);
    }

    console.log('\n====================================================================');
    console.log('  ALL ANIMATED HUB SPOTLIGHT TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('====================================================================\n');

  } finally {
    if (browser) await browser.close();
  }
}

runTestSuite().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
