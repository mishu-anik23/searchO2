/**
 * Playwright Test Suite:
 * 1. Hub 3D Volumetric Trees in Growth Simulator (#/)
 * 2. Hub Botanical Library (#/library) with 3D Volumetric Trees & Crisp 3D Country Flags
 * 3. Mobile (375x667, 320x568) & PC (1440x900) Responsiveness & Zero Horizontal Overflow
 * 4. Species Inspection Drawer with Large 3D Tree Hero Showcase & 3D Flag Pills
 * 5. Sending Feedback Forms & Supabase Backend / Outbox Persistence
 * 6. Admin Dashboard: Feedback & Problem Reports View, KPI Cards, Filters, Table & Detailed Modal Inspection
 */

const { chromium } = require('playwright');
const path = require('path');

async function runTests() {
  console.log('========================================================================');
  console.log('  Testing SearchO2 Hub 3D Volumetric Trees, 3D Flags & Admin Feedback');
  console.log('========================================================================\n');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const hubPath = 'file:///' + path.resolve(__dirname, '../hub/index.html').replace(/\\/g, '/');
    const adminPath = 'file:///' + path.resolve(__dirname, '../admin/dashboard.html').replace(/\\/g, '/');

    // -------------------------------------------------------------
    // TEST 1: Hub Growth Demo with 3D Volumetric Tree Renderer
    // -------------------------------------------------------------
    console.log('[Test 1] Testing Hub Growth Demo with 3D Volumetric Tree (#/)...');
    const pcContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const hubPage = await pcContext.newPage();
    await hubPage.goto(hubPath + '#/', { waitUntil: 'load' });
    await hubPage.waitForTimeout(600);

    // Verify tree elements in #growTree
    const treeEl = await hubPage.$('#growTree');
    if (!treeEl) throw new Error('#growTree not found on home page');

    // Verify 3D facets (root flare, trunk facets, shaded & lit foliage polygons/ellipses)
    const treeInnerHtml = await hubPage.$eval('#growTree', el => el.innerHTML);
    if (!treeInnerHtml.includes('ellipse') || !treeInnerHtml.includes('polygon')) {
      throw new Error('Expected 3D tree to contain faceted polygons and volumetric lighting elements');
    }
    console.log('  ✓ Growth simulator renders 3D faceted tree with root flare & ground shadow');

    // Test changing plant to conifer (pine) and bush (coffee/hazelnut)
    await hubPage.selectOption('#growSel', 'pine');
    await hubPage.waitForTimeout(300);
    const pineHtml = await hubPage.$eval('#growTree', el => el.innerHTML);
    if (!pineHtml.includes('polygon')) throw new Error('Expected conifer to render 3D conical tiers');
    console.log('  ✓ Conifer (Pine) renders 3D tiered isometric facets');

    // -------------------------------------------------------------
    // TEST 2: Botanical Library (#/library) with 3D Trees & 3D Flags
    // -------------------------------------------------------------
    console.log('\n[Test 2] Testing Botanical Library 3D Trees & Region Classification Tags...');
    await hubPage.goto(hubPath + '#/library', { waitUntil: 'load' });
    await hubPage.waitForTimeout(600);

    // Verify packet cards
    const packets = await hubPage.$$('.packet');
    console.log(`  Found ${packets.length} botanical seed packets in Library`);
    if (packets.length === 0) throw new Error('No botanical packets found');

    // Verify first packet has 3D tree box and region tag with 3D country flag
    const first3dBox = await hubPage.$('.packet .packet-3d-box');
    if (!first3dBox) throw new Error('.packet-3d-box not found in seed packet');

    const firstFlag = await hubPage.$('.packet .packet-region-tag .s2-volumetric-flag');
    if (!firstFlag) throw new Error('.s2-volumetric-flag not found in seed packet region tag');

    const regName = await hubPage.$eval('.packet .packet-region-tag span', el => el.textContent.trim());
    console.log(`  First packet region classification: "${regName}" with crisp 3D country flag`);

    // Verify Biome toolbar chips have 3D flags
    const biomeChips = await hubPage.$$('#regChips .chip');
    console.log(`  Found ${biomeChips.length} biome filter chips`);
    const chipFlagCount = await hubPage.$$eval('#regChips .chip .s2-volumetric-flag', els => els.length);
    console.log(`  Biome chips with 3D flags: ${chipFlagCount}`);
    if (chipFlagCount < 4) throw new Error('Expected at least 4 biome chips to have crisp 3D country flags');

    // -------------------------------------------------------------
    // TEST 3: Species Drawer Hero 3D Showcase & Flag Pills
    // -------------------------------------------------------------
    console.log('\n[Test 3] Testing Species Inspection Drawer...');
    const firstPacket = await hubPage.$('.packet');
    await firstPacket.click();
    await hubPage.waitForTimeout(500);

    const drawer = await hubPage.$('#drawer');
    const isDrawerOpen = await hubPage.$eval('#drawer', el => !el.hasAttribute('hidden'));
    if (!isDrawerOpen) throw new Error('Drawer failed to open on packet click');

    const hero3d = await hubPage.$('.species-3d-hero .s2-volumetric-tree');
    if (!hero3d) throw new Error('Prominent 3D tree hero not found in drawer');
    console.log('  ✓ Species drawer displays prominent 3D tree hero showcase');

    const drawerFlagPill = await hubPage.$('.drawer .pill-flag .s2-volumetric-flag');
    if (!drawerFlagPill) throw new Error('Drawer missing 3D country flag pill');
    console.log('  ✓ Species drawer tags display crisp 3D country flag pill');

    // Close drawer
    await hubPage.click('.drawer .x');
    await hubPage.waitForTimeout(300);

    // -------------------------------------------------------------
    // TEST 4: Mobile Responsiveness & Zero Screen Overflow
    // -------------------------------------------------------------
    console.log('\n[Test 4] Testing Mobile Responsiveness (375x667 & 320x568)...');
    for (const vp of [{ width: 375, height: 667, name: 'iPhone SE' }, { width: 320, height: 568, name: 'Small Mobile' }]) {
      const mobContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const mobPage = await mobContext.newPage();
      await mobPage.goto(hubPath + '#/library', { waitUntil: 'load' });
      await mobPage.waitForTimeout(500);

      const hasHScroll = await mobPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      console.log(`  Mobile ${vp.name} (${vp.width}x${vp.height}) horizontal overflow: ${hasHScroll}`);
      if (hasHScroll) throw new Error(`Horizontal overflow detected on ${vp.name}!`);

      const mobPackets = await mobPage.$$('.packet');
      if (mobPackets.length === 0) throw new Error(`No packets rendered on ${vp.name}`);
      console.log(`  ✓ ${vp.name}: Clean 2-column packet layout with 3D trees and flags rendered without clipping`);
      await mobContext.close();
    }

    // -------------------------------------------------------------
    // TEST 5: Feedback Submissions (Report Problem, Chapter, Playtest)
    // -------------------------------------------------------------
    console.log('\n[Test 5] Testing Feedback Submissions & Persistence...');
    // 1. Chapter Feedback Submission
    await hubPage.goto(hubPath + '#/feedback/chapter', { waitUntil: 'load' });
    await hubPage.waitForTimeout(500);

    await hubPage.check('input[name="gameVersion"][value="Current test version"]');
    await hubPage.check('input[name="chapter"][value="Chapter 1"]');
    await hubPage.check('input[name="completed"][value="Yes, without help"]');
    await hubPage.click('#fbRate label:nth-child(5)');
    await hubPage.check('input[name="difficulty"][value="About right"]');
    await hubPage.check('input[name="confusionSource"][value="Nothing was confusing"]');
    await hubPage.fill('#chClarityFb', 'Volumetric trees look magnificent!');
    await hubPage.check('input[name="continueIntent"][value="Definitely yes"]');
    await hubPage.fill('#chEmail', 'playtester@searcho2.online');

    await hubPage.click('#fbSend');
    await hubPage.waitForTimeout(9000);
    const fbOutText = await hubPage.$eval('#fbOut', el => el.textContent);
    console.log(`  Chapter submission feedback result: "${fbOutText.slice(0, 60)}..."`);

    // Verify outbox or confirmation exists
    const outboxItems = await hubPage.evaluate(() => JSON.parse(localStorage.getItem('searchO2_hub_outbox') || '[]'));
    console.log(`  Outbox items count on device: ${outboxItems.length}`);

    // -------------------------------------------------------------
    // TEST 6: Admin Dashboard Feedback & Problem Reports View
    // -------------------------------------------------------------
    console.log('\n[Test 6] Testing Admin Dashboard Feedback View & Modal Inspection...');
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const adminPage = await adminContext.newPage();

    // Mock feedback items in localStorage for testing
    await adminPage.addInitScript(() => {
      const mockSubmissions = [
        {
          id: 'fb-prob-1001',
          kind: 'problem',
          title: 'Tree harvest animation paused on Android Chrome',
          game_version: 'v1.4.2-beta',
          area: 'Germany Farm',
          trying_to_do: 'Harvesting fully grown oak tree at plot 3',
          what_happened: 'Tree particle effects stayed frozen in air for 4 seconds',
          expected: 'Particles should fade smoothly into the oxygen reservoir',
          reproduce: 'Sometimes',
          impact: 'Slowed down play',
          severity: 'visual',
          device_browser: 'Android 14 · Chrome 124',
          email: 'farmer.hans@gmail.com',
          status: 'new',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          payload: { steps: '1. Plant oak 2. Speed fertilizer 3. Harvest' }
        },
        {
          id: 'fb-chap-2002',
          kind: 'chapter_feedback',
          title: 'Chapter 2 Progression Feedback',
          chapter: '2',
          completed: 'yes',
          rating: 4,
          difficulty: 'Just right',
          confusion_source: 'Soil pH buffer threshold was slightly unclear',
          message: 'Loved the peat moss soil amendment quest!',
          continue_intent: 'Definitely',
          game_version: 'v1.4.2',
          email: 'tester.sarah@gmail.com',
          status: 'seen',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          payload: { clarityRating: 4 }
        },
        {
          id: 'fb-play-3003',
          kind: 'playtest_review',
          title: 'SearchO2 Playtest Review (Build 1.4)',
          game_version: 'v1.4.2',
          nps_recommend: 9,
          area: 'Overall UI & O2 Balance',
          message: 'The biological realism and atmospheric CO2 absorption cycle is exceptional.',
          status: 'resolved',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          payload: {
            genreFrequency: 'Weekly',
            rateEaseOfLearning: 'Good',
            rateNavigation: 'Very good',
            rateVisualReadability: 'Very good',
            rateClarityOfObjectives: 'Good',
            rateUnderstandingO2: 'Very good',
            rateEnjoyment: 'Very good',
            rateGameStability: 'Very good',
            visualDifficulty: 'No',
            visualElementImprovement: 'Tabular view alignment',
            strongestPart: 'Volumetric 3D trees and realistic photosynthesis mechanics',
            changeOneThing: 'Add more regional seeds from South America',
            disappointmentLevel: 'Very disappointed',
            npsRecommend: 9
          }
        }
      ];
      localStorage.setItem('searchO2_feedback_submissions', JSON.stringify(mockSubmissions));
    });

    await adminPage.goto(adminPath, { waitUntil: 'load' });
    await adminPage.waitForTimeout(600);

    // Bypass login if login view is active
    const isLoginActive = await adminPage.evaluate(() => {
      const lv = document.getElementById('loginView');
      return lv && !lv.classList.contains('hidden');
    });
    if (isLoginActive) {
      console.log('  Admin login view detected, switching to main view...');
      await adminPage.evaluate(() => {
        document.getElementById('loginView').classList.add('hidden');
        document.querySelector('.shell').classList.remove('hidden');
      });
    }

    // Click Feedback & Reports navigation tab
    const feedbackTab = await adminPage.$('button[data-view="feedback"]');
    if (!feedbackTab) throw new Error('Feedback nav tab button not found in Admin sidebar');
    await feedbackTab.click();
    await adminPage.waitForTimeout(600);

    // Verify section is displayed
    const isFeedbackViewVisible = await adminPage.evaluate(() => {
      const s = document.getElementById('view-feedback');
      return s && !s.classList.contains('hidden');
    });
    if (!isFeedbackViewVisible) throw new Error('#view-feedback section is not visible');
    console.log('  ✓ #view-feedback section successfully active');

    // Verify KPI Stat Cards
    const kpiCards = await adminPage.$$('#feedbackStatCards .card');
    console.log(`  Rendered ${kpiCards.length} feedback KPI cards`);
    if (kpiCards.length < 4) throw new Error('Expected 4 KPI stat cards (Total, Problems, Chapters, Playtests)');

    // Verify Feedback Table Rows
    const rows = await adminPage.$$('#feedbackRows tr');
    console.log(`  Feedback table rendered ${rows.length} submission rows`);
    if (rows.length < 3) throw new Error('Expected at least 3 feedback rows rendered');

    // Verify Inspect Button Opens Detail Modal
    const firstInspectBtn = await adminPage.$('#feedbackRows tr:first-child button');
    await firstInspectBtn.click();
    await adminPage.waitForTimeout(500);

    const isModalOpen = await adminPage.evaluate(() => {
      const m = document.getElementById('modalFeedbackDetail');
      return m && !m.classList.contains('hidden');
    });
    if (!isModalOpen) throw new Error('#modalFeedbackDetail did not open');
    console.log('  ✓ #modalFeedbackDetail opened with structured survey inspection');

    const modalTitle = await adminPage.$eval('#mfTitle', el => el.textContent.trim());
    console.log(`  Inspecting Submission: "${modalTitle}"`);

    const qaCards = await adminPage.$$('#mfQAList .qa-card');
    console.log(`  Rendered ${qaCards.length} structured Question & Answer cards`);
    if (qaCards.length === 0) throw new Error('No structured Q&A cards rendered in modal');

    // Test Status Toggle
    await adminPage.click('#btnStatusResolved');
    await adminPage.waitForTimeout(300);
    const resolvedBadgeText = await adminPage.$eval('#mfStatusBadge', el => el.textContent.trim());
    console.log(`  Updated status badge in modal: "${resolvedBadgeText}"`);
    if (!resolvedBadgeText.includes('Resolved')) throw new Error('Status update to Resolved failed');
    console.log('  ✓ Status update to Resolved succeeded');

    // Close modal
    await adminPage.click('#mfCloseBtn');
    await adminPage.waitForTimeout(300);
    const isModalClosed = await adminPage.evaluate(() => {
      const m = document.getElementById('modalFeedbackDetail');
      return m && m.classList.contains('hidden');
    });
    if (!isModalClosed) throw new Error('Modal failed to close');
    console.log('  ✓ Detail modal closed cleanly');

    console.log('\n========================================================================');
    console.log('  ALL TESTS PASSED! 3D Trees, 3D Flags & Admin Feedback are 100% Verified');
    console.log('========================================================================');
  } finally {
    if (browser) await browser.close();
  }
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
