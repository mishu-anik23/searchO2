/**
 * Playwright Test Suite:
 * 1. Tabular View Horizontal Scroll Position Persistence across 1000ms Ticks & TouchEvent tracking
 * 2. 3D Globe Touch-Action pan-y & Smooth Scrolling
 * 3. Mobile Landscape (Horizontal) Side-by-Side Split View
 * 4. 3D Map Tag Modals / Tooltips Crisp Emerald Standard Styling
 * 5. Puff-Pip Explore Hub Spotlight Hardware Acceleration
 */
const { chromium } = require('playwright');
const path = require('path');

async function runTestSuite() {
  console.log('========================================================================');
  console.log('  Testing Smooth Scrolling, Tabular Scroll Persistence & Mobile Split');
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

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
    console.log(`[Step 1] Loading index.html: ${fileUrl}`);

    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Dismiss initial modals (Shakir guide / auth) if present
    await page.evaluate(() => {
      const shakir = document.getElementById('s2ShakirModal');
      if (shakir) shakir.remove();
      const auth = document.getElementById('initialAuthOverlay');
      if (auth) auth.classList.add('hidden');
    });
    await page.waitForTimeout(300);

    // TEST 1: Tabular View Horizontal Scroll Position Persistence
    console.log('\n--- Test 1: Tabular View Horizontal Scroll Persistence across Ticks ---');
    // Switch to Tabular Comparison view
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-viewmode="tabular"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(500);

    const isTabularVisible = await page.evaluate(() => {
      const host = document.getElementById('regionTabularHost');
      const wrap = document.querySelector('.region-tabular-wrapper');
      return !!(host && host.style.display !== 'none' && wrap);
    });
    assert(isTabularVisible, 'Tabular comparison wrapper is mounted and visible');

    // Scroll horizontally to 240px
    const initialScroll = await page.evaluate(() => {
      const wrap = document.querySelector('.region-tabular-wrapper');
      if (!wrap) return -1;
      wrap.scrollLeft = 240;
      return wrap.scrollLeft;
    });
    assert(initialScroll >= 200, `Horizontal scroll applied: ${initialScroll}px`);

    // Simulate touch interaction and verify activeScrollTouch tracking
    const touchTracked = await page.evaluate(() => {
      const wrap = document.querySelector('.region-tabular-wrapper');
      wrap.dispatchEvent(new Event('touchstart', { bubbles: true }));
      const isTracking = !!(window.activeScrollTouch && window.activeScrollTouch.regionTabular);
      wrap.dispatchEvent(new Event('touchend', { bubbles: true }));
      return isTracking;
    });
    assert(touchTracked, 'activeScrollTouch tracks regionTabular touch/pointer events');

    console.log('  Waiting 3.2 seconds across 3+ game loop interval ticks (1000ms each)...');
    await page.waitForTimeout(3200);

    const scrollAfterTicks = await page.evaluate(() => {
      const wrap = document.querySelector('.region-tabular-wrapper');
      return wrap ? wrap.scrollLeft : -1;
    });
    assert(scrollAfterTicks === initialScroll, `Horizontal scroll position preserved across ticks without resetting: ${scrollAfterTicks}px (was ${initialScroll}px)`);

    // TEST 2: 3D Globe Touch-Action & Smooth Scrolling Optimizations
    console.log('\n--- Test 2: 3D Globe Touch-Action & Smooth Scrolling Optimizations ---');
    // Switch back to Globe view
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-viewmode="globe"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(400);

    const globeProps = await page.evaluate(() => {
      const container = document.getElementById('globeCanvasContainer');
      const canvas = document.getElementById('globeCanvas');
      if (!container || !canvas) return null;
      const style = window.getComputedStyle(container);
      return {
        touchAction: style.touchAction,
        hasCanvas: !!canvas,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
      };
    });
    assert(globeProps && globeProps.touchAction === 'pan-y', `.globe-canvas-container has touch-action: pan-y (got ${globeProps?.touchAction})`);
    assert(globeProps && globeProps.canvasWidth > 0 && globeProps.canvasHeight > 0, 'Globe canvas has valid pixel buffer');

    // TEST 3: Mobile Landscape (Horizontal) Side-by-Side Split View
    console.log('\n--- Test 3: Mobile Horizontal View (Landscape) Side-by-Side Split View ---');
    // Test on iPhone 14 landscape viewport: 844 x 390
    await page.setViewportSize({ width: 844, height: 390 });
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-viewmode="split"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(500);

    const landscapeSplitLayout = await page.evaluate(() => {
      const wrapper = document.getElementById('regionMainWrapper');
      const globe = document.getElementById('globeStageWrapper');
      const cards = document.getElementById('regionCardsContainer');
      if (!wrapper || !globe || !cards) return null;

      const style = window.getComputedStyle(wrapper);
      const globeRect = globe.getBoundingClientRect();
      const cardsRect = cards.getBoundingClientRect();

      return {
        display: style.display,
        gridTemplateColumns: style.gridTemplateColumns,
        globeLeft: globeRect.left,
        globeWidth: globeRect.width,
        cardsLeft: cardsRect.left,
        cardsWidth: cardsRect.width,
        isSideBySide: (globeRect.right <= cardsRect.left + 5) || (globeRect.left < cardsRect.left && cardsRect.left > globeRect.width * 0.7)
      };
    });

    console.log('  Mobile Landscape Split Layout:', JSON.stringify(landscapeSplitLayout, null, 2));
    assert(landscapeSplitLayout && landscapeSplitLayout.display === 'grid', 'Split layout is display: grid');
    assert(landscapeSplitLayout && landscapeSplitLayout.gridTemplateColumns.split(' ').length >= 2, `Split layout has 2 grid columns in landscape: ${landscapeSplitLayout?.gridTemplateColumns}`);
    assert(landscapeSplitLayout && landscapeSplitLayout.isSideBySide, 'Globe and Biome Cards are positioned side-by-side in mobile landscape');

    // Also test on iPhone SE landscape: 667 x 375
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(300);
    const seSideBySide = await page.evaluate(() => {
      const globe = document.getElementById('globeStageWrapper');
      const cards = document.getElementById('regionCardsContainer');
      if (!globe || !cards) return false;
      const gRect = globe.getBoundingClientRect();
      const cRect = cards.getBoundingClientRect();
      return (gRect.left < cRect.left) && (gRect.width > 0) && (cRect.width > 0);
    });
    assert(seSideBySide, 'Globe and Biome Cards are positioned side-by-side on 667x375 (iPhone SE landscape)');

    // Reset back to desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(300);

    // TEST 4: 3D Map Tag Modals / Tooltips Crisp Standard Styling
    console.log('\n--- Test 4: 3D Map Tag Modals / Tooltips Crisp Standard Styling ---');
    const tooltipStyles = await page.evaluate(() => {
      const tt = document.getElementById('globe3dTooltip');
      const tagBtn = document.querySelector('.globe-tag-btn.active-farm');
      if (!tt) return null;
      tt.classList.add('visible');
      const ttStyle = window.getComputedStyle(tt);
      const tagStyle = tagBtn ? window.getComputedStyle(tagBtn) : null;
      return {
        ttBorder: ttStyle.borderColor,
        ttBorderWidth: ttStyle.borderWidth,
        ttBorderRadius: ttStyle.borderRadius,
        ttBg: ttStyle.backgroundImage || ttStyle.background,
        tagBg: tagStyle ? (tagStyle.backgroundImage || tagStyle.background) : ''
      };
    });

    console.log('  Tooltip Computed Styles:', tooltipStyles);
    assert(tooltipStyles && (tooltipStyles.ttBorder.includes('16, 185, 129') || tooltipStyles.ttBorder === 'rgb(16, 185, 129)'), 'Tooltip has crisp emerald border (#10B981 / rgb(16, 185, 129))');
    assert(tooltipStyles && tooltipStyles.ttBorderRadius === '16px', 'Tooltip has 16px crisp border radius');

    // TEST 5: Puff-Pip Explore Hub Spotlight Hardware Acceleration
    console.log('\n--- Test 5: Puff-Pip Explore Hub Spotlight Hardware Acceleration ---');
    const puffPipAccel = await page.evaluate(() => {
      const card = document.querySelector('.hub-dd-holo-card');
      const catSvg = document.querySelector('.whisker-puff-svg');
      const mouseSvg = document.querySelector('.pip-mouse-svg');
      if (!card || !catSvg || !mouseSvg) return null;
      return {
        cardWillChange: window.getComputedStyle(card).willChange,
        catWillChange: window.getComputedStyle(catSvg).willChange,
        mouseWillChange: window.getComputedStyle(mouseSvg).willChange
      };
    });

    console.log('  Puff-Pip Acceleration Properties:', puffPipAccel);
    assert(puffPipAccel && puffPipAccel.cardWillChange.includes('transform'), 'Holo card has will-change: transform');
    assert(puffPipAccel && puffPipAccel.catWillChange.includes('transform'), 'Whisker Puff SVG has will-change: transform');
    assert(puffPipAccel && puffPipAccel.mouseWillChange.includes('transform'), 'Pip Mouse SVG has will-change: transform');

    console.log('\n========================================================================');
    console.log(`  Summary: ${passed} Passed, ${failed} Failed`);
    console.log('========================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runTestSuite();
