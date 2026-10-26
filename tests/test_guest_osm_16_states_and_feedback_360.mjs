import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function runTests() {
  console.log('🚀 Starting Automated Playwright Test Suite for SearchO2:');
  console.log('   - 16 German States & 15 Unique Land Names (Bavaria Alpenhof Focused)');
  console.log('   - Hub Dynamic Authentication Header (Logged in medium & Guest)');
  console.log('   - Feedback & Problem Reports Multi-Channel Delivery & DB Persistence');
  console.log('   - Admin Dashboard Feedback 360° User Modal Linking');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  let failed = 0;
  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  try {
    // =========================================================================
    // TEST 1: 16 German States in 1-Click Guest Modal (index.html)
    // =========================================================================
    console.log('\n--- 1. Testing 16 German States & 15 Unique Lands in Guest Modal ---');
    const indexUrl = 'file:///' + path.join(rootDir, 'index.html').replace(/\\/g, '/');
    await page.goto(indexUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const statesData = await page.evaluate(() => {
      const states = window.GERMAN_STATES || [];
      return {
        count: states.length,
        states: states.map(s => ({
          id: s.id,
          name: s.name,
          landName: s.landName,
          bannerPreset: s.bannerPreset,
          isFocused: !!s.isFocused,
          lat: s.lat,
          lon: s.lon,
          polyLength: (s.poly || []).length
        }))
      };
    });

    assert(statesData.count === 16, `Exactly 16 German states defined in GERMAN_STATES (found ${statesData.count})`);

    const bavaria = statesData.states.find(s => s.id === 'bavaria');
    assert(!!bavaria, 'Bavaria (Bayern) exists in state definitions');
    assert(bavaria.isFocused === true, 'Bavaria is explicitly flagged as isFocused === true');
    assert(bavaria.landName === 'Alpenhof', `Bavaria land name is Alpenhof (found: "${bavaria.landName}")`);
    assert(bavaria.bannerPreset === 'Alpenhof', `Bavaria banner preset is Alpenhof (found: "${bavaria.bannerPreset}")`);
    assert(bavaria.bannerPreset.length <= 9, `Bavaria banner preset <= 9 chars (length: ${bavaria.bannerPreset.length})`);

    const otherStates = statesData.states.filter(s => s.id !== 'bavaria');
    assert(otherStates.length === 15, `Exactly 15 other German states exist (found: ${otherStates.length})`);

    const uniqueLandNames = new Set(otherStates.map(s => s.landName));
    assert(uniqueLandNames.size === 15, `All 15 other states have unique intelligent land names (unique count: ${uniqueLandNames.size})`);
    assert(!uniqueLandNames.has('Alpenhof'), 'None of the other 15 states share the Alpenhof name');

    // Verify all 16 banner presets are <= 9 characters and pass child validation
    const validationResults = await page.evaluate((states) => {
      return states.map(s => ({
        id: s.id,
        preset: s.bannerPreset,
        len: s.bannerPreset.length,
        valid: window.validateGuestFarmName(s.bannerPreset).valid
      }));
    }, statesData.states);

    const allPresetsValid = validationResults.every(r => r.len <= 9 && r.valid);
    assert(allPresetsValid, 'All 16 banner presets are <= 9 characters and pass child-friendly banner validation');

    // Test opening modal and interacting with presets
    await page.evaluate(() => {
      window.openGuestFarmSetupModal();
    });
    await page.waitForTimeout(300);

    const modalVisible = await page.evaluate(() => {
      const m = document.getElementById('guestFarmSetupModal');
      return m && m.style.display !== 'none';
    });
    assert(modalVisible, 'guestFarmSetupModal opens successfully');

    // Test selecting a state preset (e.g. Thuringia)
    await page.evaluate(() => {
      window.selectGermanStatePreset('thuringia');
    });
    await page.waitForTimeout(200);

    const hudState = await page.evaluate(() => {
      const reg = document.getElementById('osmHudRegion')?.textContent || '';
      const coords = document.getElementById('osmHudCoords')?.textContent || '';
      const inpVal = document.getElementById('guestFarmNameInput')?.value || '';
      return { reg, coords, inpVal };
    });

    assert(hudState.reg.includes('Thuringia') && hudState.reg.includes('Rennsteig Urwald-Domäne'),
      `HUD region updated to Thuringia Rennsteig Urwald-Domäne (got: "${hudState.reg}")`);
    assert(hudState.inpVal === 'Rennsteig', `Farm name input auto-populated with Thuringia preset "Rennsteig" (got: "${hudState.inpVal}")`);

    // Now select Bavaria (Alpenhof) and commit setup
    await page.evaluate(() => {
      window.selectGermanStatePreset('bavaria');
    });
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      window.commitGuestFarmSetup();
    });
    await page.waitForTimeout(200);

    const savedProfile = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('searchO2_guest_farm_profile') || 'null');
    });

    assert(savedProfile && savedProfile.stateId === 'bavaria' && savedProfile.landName === 'Alpenhof',
      `Guest farm profile saved in localStorage with Bavaria Alpenhof (name: "${savedProfile?.name}", land: "${savedProfile?.landName}")`);

    // =========================================================================
    // TEST 2: Hub Dynamic Authentication Header (hub/index.html)
    // =========================================================================
    console.log('\n--- 2. Testing Hub Dynamic Authentication Header & Mediums ---');
    const hubUrl = 'file:///' + path.join(rootDir, 'hub', 'index.html').replace(/\\/g, '/');

    // Subtest 2a: Guest mode header
    await page.goto(hubUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    const guestBadge = await page.evaluate(() => {
      const b = document.querySelector('.hub-auth-user-badge.guest');
      const med = document.querySelector('.hub-auth-user-badge.guest .hub-auth-medium')?.textContent || '';
      const nm = document.querySelector('.hub-auth-user-badge.guest .hub-auth-name')?.textContent || '';
      return { exists: !!b, med, nm };
    });

    assert(guestBadge.exists, 'Hub header displays .hub-auth-user-badge.guest when guest profile exists');
    assert(guestBadge.med.includes('Guest Trial'), `Guest badge medium shows "Guest Trial" (got: "${guestBadge.med}")`);
    assert(guestBadge.nm.includes('Alpenhof'), `Guest badge shows farm/land name Alpenhof (got: "${guestBadge.nm}")`);

    // Subtest 2b: Registered user header (Google OAuth medium)
    await page.evaluate(() => {
      localStorage.setItem('searchO2_user', JSON.stringify({
        id: 'usr_playwright_test_01',
        displayName: 'Dr. Evelyn Reed',
        email: 'evelyn.reed@ecosim.org',
        role: 'user',
        auth_provider: 'google'
      }));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    const userBadge = await page.evaluate(() => {
      const b = document.querySelector('.hub-auth-user-badge.logged-in');
      const med = document.querySelector('.hub-auth-user-badge.logged-in .hub-auth-medium')?.textContent || '';
      const nm = document.querySelector('.hub-auth-user-badge.logged-in .hub-auth-name')?.textContent || '';
      const av = document.querySelector('.hub-auth-user-badge.logged-in .hub-auth-avatar')?.textContent || '';
      return { exists: !!b, med, nm, av };
    });

    assert(userBadge.exists, 'Hub header displays .hub-auth-user-badge.logged-in for authenticated users');
    assert(userBadge.med.includes('Google'), `User badge medium shows "Google" (got: "${userBadge.med}")`);
    assert(userBadge.nm === 'Dr. Evelyn Reed', `User badge name shows "Dr. Evelyn Reed" (got: "${userBadge.nm}")`);
    assert(userBadge.av === 'D', `User avatar shows initial "D" (got: "${userBadge.av}")`);

    // =========================================================================
    // TEST 3: Feedback Forms & Problem Reports Multi-Channel Delivery
    // =========================================================================
    console.log('\n--- 3. Testing Feedback Forms & Problem Reports Delivery ---');
    // Navigate to Report a Problem
    await page.goto(hubUrl + '#/report', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    // Fill form
    await page.fill('#rpTitle', 'Playwright Automated Forest Glitch Report');
    await page.fill('#rpWhat', 'Canopy shadows flickered slightly under heavy wind gusts at high speed.');
    await page.fill('#rpTrying', 'Testing high-speed biological simulations in Bavarian Alpenhof');

    // Submit form
    await page.click('#rpSend');
    await page.waitForTimeout(800);

    const submitResult = await page.evaluate(() => {
      const out = document.getElementById('rpOut');
      const text = out ? out.textContent : '';
      const isOk = out ? !!out.querySelector('.result.ok') : false;
      const isWarn = out ? !!out.querySelector('.result.warn') : false;
      const localSubmissions = JSON.parse(localStorage.getItem('searchO2_feedback_submissions') || '[]');
      return { text, isOk, isWarn, localCount: localSubmissions.length, latest: localSubmissions[0] };
    });

    assert(submitResult.isOk, 'Feedback submission produced .result.ok confirmation');
    assert(!submitResult.isWarn, 'NO warning banner or "could not send, saved in local with file name, retry when online" shown');
    assert(/thank you/i.test(submitResult.text) && /database/i.test(submitResult.text),
      `Confirmation message states feedback was saved in database (got: "${submitResult.text.trim().slice(0, 100)}")`);
    assert(submitResult.localCount > 0, `Submission stored in searchO2_feedback_submissions (count: ${submitResult.localCount})`);
    assert(submitResult.latest && submitResult.latest.title === 'Playwright Automated Forest Glitch Report',
      `Latest local submission has correct title (got: "${submitResult.latest?.title}")`);
    assert(submitResult.latest && submitResult.latest.user_id === 'usr_playwright_test_01',
      `Submission is linked to user_id "usr_playwright_test_01" (got: "${submitResult.latest?.user_id}")`);

    // =========================================================================
    // TEST 4: Admin Dashboard 360° User Modal Linking (admin/dashboard.html)
    // =========================================================================
    console.log('\n--- 4. Testing Admin Dashboard Feedback & 360° User Modal Linking ---');
    const adminUrl = 'file:///' + path.join(rootDir, 'admin', 'dashboard.html').replace(/\\/g, '/');
    await page.goto(adminUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Open admin app directly and switch to Feedback & Reports tab
    await page.evaluate(() => {
      if (typeof openApp === 'function') openApp();
      sessionStorage.setItem('searchO2_admin_elevated', '1');
    });
    await page.waitForTimeout(300);

    await page.click('[data-view="feedback"]');
    await page.waitForTimeout(600);

    const feedbackRowsCount = await page.evaluate(() => {
      return document.querySelectorAll('#feedbackRows tr').length;
    });
    assert(feedbackRowsCount > 0, `Admin feedback table populated with rows (found: ${feedbackRowsCount})`);

    const has360Button = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#feedbackRows button'));
      return btns.some(b => b.textContent.includes('360°'));
    });
    assert(has360Button, 'Feedback rows include a direct "👤 360°" player profile button');

    // Click 360 button on first feedback item
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('#feedbackRows button')).find(b => b.textContent.includes('360°'));
      if (btn) btn.click();
    });
    await page.waitForTimeout(400);

    const modal360Status = await page.evaluate(() => {
      const m = document.getElementById('modalUser360');
      const isVisible = m && !m.classList.contains('hidden');
      const name = document.getElementById('mDisplayName')?.textContent || '';
      const stateEl = document.getElementById('mValGermanState')?.textContent || '';
      return { isVisible, name, stateEl };
    });

    assert(modal360Status.isVisible, '360° User Modal (modalUser360) opened from feedback item');
    assert(modal360Status.name === 'Dr. Evelyn Reed', `360° modal displays user name "Dr. Evelyn Reed" (got: "${modal360Status.name}")`);
    assert(modal360Status.stateEl.includes('Alpenhof') || modal360Status.stateEl.includes('Bavaria'),
      `360° modal Farm tab reflects German State & Land (got: "${modal360Status.stateEl}")`);

  } catch (err) {
    console.error('Unhandled test exception:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('\n======================================================');
  if (failed === 0) {
    console.log('🎉 ALL AUTOMATED PLAYWRIGHT TESTS PASSED (0 failures)!');
    process.exit(0);
  } else {
    console.error(`💥 TEST SUITE FAILED with ${failed} error(s).`);
    process.exit(1);
  }
}

runTests();
