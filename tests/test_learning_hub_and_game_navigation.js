/**
 * Playwright Test: Learning Hub Homepage, Game Navigation, Shakir Co-Founder & CEO Spotlight, and Feedback Form
 */
const { chromium } = require('playwright');
const path = require('path');

async function runTest() {
  console.log('================================================================');
  console.log('  Testing SearchO2 Learning Hub Homepage & Game Navigation');
  console.log('================================================================\n');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // 1. Load the Learning Hub homepage
    const hubUrl = 'file:///' + path.resolve(__dirname, '../hub/index.html').replace(/\\/g, '/');
    console.log(`[Step 1] Loading Learning Hub: ${hubUrl}`);
    await page.goto(hubUrl, { waitUntil: 'load' });
    await page.waitForTimeout(500);

    // Verify Title & Hero
    const title = await page.title();
    console.log(`Page title: "${title}"`);
    if (!title.includes('searchO2')) throw new Error('Incorrect title');

    // Verify topbar game buttons
    const guestNavBtn = await page.$('.hub-nav-guest');
    const authNavBtn = await page.$('.hub-nav-auth');
    if (!guestNavBtn || !authNavBtn) throw new Error('Missing topbar game action buttons');
    const guestNavHref = await guestNavBtn.getAttribute('href');
    const authNavHref = await authNavBtn.getAttribute('href');
    console.log(`Topbar Guest CTA href: ${guestNavHref}`);
    console.log(`Topbar Auth CTA href: ${authNavHref}`);
    if (!guestNavHref.includes('guest=1') || !guestNavHref.includes('enter=farm')) {
      throw new Error('Guest nav href does not deep link to farm guest mode');
    }
    console.log('✓ PASSED: Header topbar quick game navigation buttons verified.');

    // Verify Hero Section Game CTAs
    const heroPrimaryCta = await page.$('.btn-game-primary');
    const heroSecCta = await page.$('.btn-game-secondary');
    const heroTertiaryCta = await page.$('.btn-game-tertiary');
    if (!heroPrimaryCta || !heroSecCta || !heroTertiaryCta) {
      throw new Error('Missing hero game standard call-to-action buttons');
    }
    console.log('✓ PASSED: Hero game-standard CTAs verified.');

    // Verify Shakir Co-Founder & CEO Spotlight
    const ceoSection = await page.$('.ceo-spotlight-card');
    if (!ceoSection) throw new Error('Missing Shakir CEO spotlight card');
    const ceoHeading = await page.$eval('.ceo-info-col h2', el => el.textContent);
    console.log(`CEO section heading: "${ceoHeading}"`);
    if (!ceoHeading.includes('Shakir') || !ceoHeading.includes('Co-Founder') || !ceoHeading.includes('CEO')) {
      throw new Error('Shakir not properly titled as Co-Founder & CEO');
    }
    const ceoQuote = await page.$eval('.ceo-quote', el => el.textContent);
    console.log(`CEO welcoming quote preview: "${ceoQuote.substring(0, 80)}..."`);
    const ceoTourBtn = await page.$('.ceo-actions a.btn.gold');
    const ceoTourHref = await ceoTourBtn.getAttribute('href');
    console.log(`Meet Shakir CTA href: ${ceoTourHref}`);
    if (!ceoTourHref.includes('guest=1')) throw new Error('Meet Shakir button does not link to guest tour');
    console.log('✓ PASSED: Shakir Co-Founder & CEO spotlight section verified.');

    // 2. Test 1-click Play Free as Guest navigation into game
    console.log('\n[Step 2] Testing 1-click deep link to game in Guest Mode...');
    const gameUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/') + '?guest=1&enter=farm';
    await page.goto(gameUrl, { waitUntil: 'load' });
    await page.waitForTimeout(1500);

    const farmDisplay = await page.$eval('#farmScreen', el => el.style.display);
    console.log(`Farm screen display state: ${farmDisplay}`);
    if (farmDisplay === 'none') throw new Error('Farm screen not displayed via ?enter=farm');

    const isShakirSpawned = await page.$('#s2ShakirGuide');
    console.log(`Shakir guide walker spawned on farm? ${!!isShakirSpawned}`);
    if (!isShakirSpawned) throw new Error('Shakir guide walker not spawned in guest mode');

    const farmCheck = await page.evaluate(() => {
      const stats = document.getElementById('topbarStats');
      const statsHtml = stats ? stats.innerHTML : '';
      return {
        hasShakir: statsHtml.includes('Shakir'),
        hasCeo: statsHtml.includes('Co-Founder & CEO') || statsHtml.includes('CEO Guide'),
        hasHub: statsHtml.includes('Learning Hub') || statsHtml.includes('hub/index.html')
      };
    });
    console.log(`Topbar stats checks: Shakir=${farmCheck.hasShakir}, CEO=${farmCheck.hasCeo}, HubLink=${farmCheck.hasHub}`);
    if (!farmCheck.hasShakir || !farmCheck.hasCeo) {
      throw new Error('Topbar Shakir card missing in topbarStats');
    }
    if (!farmCheck.hasHub) {
      throw new Error('Topbar missing link back to Learning Hub');
    }
    console.log('✓ PASSED: 1-click guest mode enter into farm with Shakir and Learning Hub verified.');

    // 3. Test Learning Hub Feedback Section
    console.log('\n[Step 3] Testing Learning Hub Feedback Section...');
    await page.goto(hubUrl + '#/feedback', { waitUntil: 'load' });
    await page.waitForTimeout(500);

    const feedbackHeading = await page.$eval('.page-head h1', el => el.textContent);
    console.log(`Feedback page heading: "${feedbackHeading}"`);
    const feedbackForm = await page.$('#fbForm');
    if (!feedbackForm) throw new Error('Feedback form not found');

    const ratingOptions = await page.$$('#fbRate label');
    console.log(`Rating faces count: ${ratingOptions.length}`);
    if (ratingOptions.length !== 5) throw new Error('Expected 5 rating options');

    console.log('✓ PASSED: Feedback form rendered cleanly with all interactive elements.');

    // 4. Test Learning Hub Report Section
    console.log('\n[Step 4] Testing Learning Hub Report a Problem Section...');
    await page.goto(hubUrl + '#/report', { waitUntil: 'load' });
    await page.waitForTimeout(500);

    const reportHeading = await page.$eval('.page-head h1', el => el.textContent);
    console.log(`Report page heading: "${reportHeading}"`);
    const reportForm = await page.$('#rpForm');
    if (!reportForm) throw new Error('Report form not found');
    console.log('✓ PASSED: Report form rendered cleanly.');

    console.log('\n================================================================');
    console.log('  ALL LEARNING HUB & NAVIGATION TESTS PASSED SUCCESSFULLY');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
}

runTest();
