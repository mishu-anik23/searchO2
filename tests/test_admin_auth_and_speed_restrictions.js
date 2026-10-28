const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log("==================================================================");
  console.log("  Admin Auth, OxyForge & Simulation Speed Restrictions Test Suite  ");
  console.log("==================================================================");

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const indexUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
  console.log('Loading Index:', indexUrl);

  await page.goto(indexUrl, { waitUntil: 'load' });
  await page.waitForTimeout(600);

  // Dismiss initial modal
  await page.evaluate(() => {
    var overlay = document.getElementById('initialAuthOverlay');
    if (overlay) overlay.style.display = 'none';
    switchScreen('farm');
    render();
  });
  await page.waitForTimeout(300);

  // -------------------------------------------------------------
  // TEST 1: Guest User Restrictions
  // -------------------------------------------------------------
  console.log('\n--- Test 1: Guest User Restrictions ---');
  let isGuestAdmin = await page.evaluate(() => window.isAdminUser());
  assert.strictEqual(isGuestAdmin, false, 'Guest must NOT be an admin');

  let devRegionDisplay = await page.evaluate(() => {
    const el = document.getElementById('devRegionToggleBtn');
    return el ? window.getComputedStyle(el).display : 'none';
  });
  assert.strictEqual(devRegionDisplay, 'none', 'Guest must NOT see #devRegionToggleBtn');

  let devOxyDisplay = await page.evaluate(() => {
    const el = document.getElementById('devOxyForgeToggleBtn');
    return el ? window.getComputedStyle(el).display : 'none';
  });
  assert.strictEqual(devOxyDisplay, 'none', 'Guest must NOT see #devOxyForgeToggleBtn');

  let speedSelExists = await page.evaluate(() => !!document.getElementById('speedSel'));
  assert.strictEqual(speedSelExists, false, 'Guest must NOT have a speed selector dropdown');

  let normalChipText = await page.evaluate(() => {
    const chip = document.getElementById('normalSpeedChip');
    return chip ? chip.textContent.trim() : null;
  });
  assert.strictEqual(normalChipText, '1x', 'Guest speed indicator must show 1x');

  // Attempt to bypass via setSpeed
  await page.evaluate(() => {
    window.setSpeed(10);
  });
  let speedFactorAfterGuestAttempt = await page.evaluate(() => state.speedFactor);
  assert.strictEqual(speedFactorAfterGuestAttempt, 1, 'Calling setSpeed(10) as guest must keep speedFactor locked at 1');

  // Attempt to bypass via toggleDevRegionPreview
  let initialRegion = await page.evaluate(() => devRegionPreview);
  await page.evaluate(() => {
    window.toggleDevRegionPreview();
  });
  let regionAfterAttempt = await page.evaluate(() => devRegionPreview);
  assert.strictEqual(regionAfterAttempt, initialRegion, 'Calling toggleDevRegionPreview() as guest must do nothing');

  // Attempt to open dev oxyforge modal
  await page.evaluate(() => {
    window.openDevOxyforgeModal();
  });
  let isModalOpen = await page.evaluate(() => !!(activeModal && activeModal.type === 'dev_oxyforge'));
  assert.strictEqual(isModalOpen, false, 'Calling openDevOxyforgeModal() as guest must be blocked');
  console.log('[✓ PASSED] Guest restrictions verified (no buttons, locked 1x speed, functions guarded)');

  // -------------------------------------------------------------
  // TEST 2: Regular Logged-In User Restrictions
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Regular Logged-In User Restrictions ---');
  await page.evaluate(async () => {
    await ApiClient.register('farmer_pip@searcho2.test', 'PipPassword123!', 'Farmer Pip', undefined, undefined, true, false);
    switchScreen('farm');
    render();
  });
  await page.waitForTimeout(300);

  let isPipAdmin = await page.evaluate(() => window.isAdminUser());
  assert.strictEqual(isPipAdmin, false, 'Regular registered user must NOT be an admin');

  let pipDevRegionDisplay = await page.evaluate(() => {
    const el = document.getElementById('devRegionToggleBtn');
    return el ? window.getComputedStyle(el).display : 'none';
  });
  assert.strictEqual(pipDevRegionDisplay, 'none', 'Regular user must NOT see #devRegionToggleBtn');

  let pipDevOxyDisplay = await page.evaluate(() => {
    const el = document.getElementById('devOxyForgeToggleBtn');
    return el ? window.getComputedStyle(el).display : 'none';
  });
  assert.strictEqual(pipDevOxyDisplay, 'none', 'Regular user must NOT see #devOxyForgeToggleBtn');

  let pipSpeedSelExists = await page.evaluate(() => !!document.getElementById('speedSel'));
  assert.strictEqual(pipSpeedSelExists, false, 'Regular user must NOT have a speed dropdown');

  await page.evaluate(() => {
    window.setSpeed(5);
  });
  let pipSpeedFactor = await page.evaluate(() => state.speedFactor);
  assert.strictEqual(pipSpeedFactor, 1, 'Regular user speedFactor must remain locked at 1');
  console.log('[✓ PASSED] Regular logged-in user restrictions verified');

  // Logout regular user
  await page.evaluate(() => ApiClient.logout());
  await page.waitForTimeout(300);

  // -------------------------------------------------------------
  // TEST 3: Admin Registration Protection & Wrong Password Rejection
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Admin Security & Authentication Checks ---');
  let regError = null;
  try {
    await page.evaluate(async () => {
      await ApiClient.register('searcho2.online@gmail.com', 'FakePassword123!', 'Hacker', undefined, undefined, true, false);
    });
  } catch(e) {
    regError = e.message;
  }
  assert(regError, 'Registering with searcho2.online@gmail.com must be rejected');
  console.log('[✓ PASSED] Admin email registration is strictly rejected');

  let wrongPwError = null;
  try {
    await page.evaluate(async () => {
      await ApiClient.login('searcho2.online@gmail.com', 'IncorrectAdminPassword123!', false);
    });
  } catch(e) {
    wrongPwError = e.message;
  }
  assert(wrongPwError, 'Login with incorrect password for searcho2.online@gmail.com must fail');
  console.log('[✓ PASSED] Incorrect admin password is strictly rejected');

  // -------------------------------------------------------------
  // TEST 4: Valid Admin Login (searcho2.online@gmail.com)
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Valid Admin Authentication ---');
  await page.evaluate(async () => {
    await ApiClient.login('searcho2.online@gmail.com', 'SearchO2@Admin2026!', true);
    switchScreen('farm');
    render();
  });
  await page.waitForTimeout(400);

  let isAdmin = await page.evaluate(() => window.isAdminUser());
  assert.strictEqual(isAdmin, true, 'searcho2.online@gmail.com must be authenticated as admin');

  let adminDevRegionDisplay = await page.evaluate(() => {
    const el = document.getElementById('devRegionToggleBtn');
    return el ? window.getComputedStyle(el).display : 'none';
  });
  assert(['flex', 'inline-flex'].includes(adminDevRegionDisplay), 'Admin user MUST see #devRegionToggleBtn as visible flex/inline-flex');

  let adminDevOxyDisplay = await page.evaluate(() => {
    const el = document.getElementById('devOxyForgeToggleBtn');
    return el ? window.getComputedStyle(el).display : 'none';
  });
  assert(['flex', 'inline-flex'].includes(adminDevOxyDisplay), 'Admin user MUST see #devOxyForgeToggleBtn as visible flex/inline-flex');

  let adminSpeedSel = await page.evaluate(() => {
    const sel = document.getElementById('speedSel');
    if (!sel) return null;
    return Array.from(sel.options).map(o => ({ label: o.text, val: o.value }));
  });
  assert(adminSpeedSel, 'Admin user must have #speedSel dropdown');
  assert.deepStrictEqual(
    adminSpeedSel.map(s => s.label),
    ['1x', '2x', '5x', '10x'],
    'Admin speed options must be exactly 1x, 2x, 5x, 10x'
  );
  console.log('[✓ PASSED] Admin speed options verified: 1x, 2x, 5x, 10x');

  // Test Admin setting speed
  for (const speed of [2, 5, 10, 1]) {
    await page.evaluate((s) => window.setSpeed(s), speed);
    let curSpeed = await page.evaluate(() => state.speedFactor);
    assert.strictEqual(curSpeed, speed, `Admin setting speed to ${speed}x must succeed`);
  }
  console.log('[✓ PASSED] Admin simulation speed adjustments (1x, 2x, 5x, 10x) verified');

  // Test Admin toggleDevRegionPreview
  let startReg = await page.evaluate(() => devRegionPreview);
  await page.evaluate(() => window.toggleDevRegionPreview());
  let nextReg = await page.evaluate(() => devRegionPreview);
  assert.notStrictEqual(startReg, nextReg, 'Admin toggleDevRegionPreview must cycle region');
  console.log('[✓ PASSED] Admin toggleDevRegionPreview verified');

  // Test Admin openDevOxyforgeModal
  await page.evaluate(() => window.openDevOxyforgeModal());
  let adminModalOpen = await page.evaluate(() => !!(activeModal && activeModal.type === 'dev_oxyforge'));
  assert.strictEqual(adminModalOpen, true, 'Admin openDevOxyforgeModal must open modal');
  console.log('[✓ PASSED] Admin openDevOxyforgeModal verified');

  // Close modal
  await page.evaluate(() => closeModal());

  // Verify plain admin password is NOT saved in searchO2_saved_creds
  let savedCreds = await page.evaluate(() => localStorage.getItem('searchO2_saved_creds'));
  assert.strictEqual(savedCreds, null, 'Admin password must NEVER be saved in searchO2_saved_creds');
  console.log('[✓ PASSED] Admin password is never stored in searchO2_saved_creds');

  // -------------------------------------------------------------
  // TEST 5: Logout & Credential Wipe
  // -------------------------------------------------------------
  console.log('\n--- Test 5: Logout & Zero-Credential Exposure ---');
  await page.evaluate(() => {
    // Populate an input to verify it gets wiped
    const p = document.getElementById('initAuthPassword');
    if (p) p.value = 'SecretAdminPassword';
    ApiClient.logout();
  });
  await page.waitForTimeout(300);

  let postLogoutElevated = await page.evaluate(() => sessionStorage.getItem('searchO2_admin_elevated'));
  assert.strictEqual(postLogoutElevated, null, 'searchO2_admin_elevated must be removed from sessionStorage');

  let postLogoutAdminToken = await page.evaluate(() => localStorage.getItem('searchO2_admin_token'));
  assert.strictEqual(postLogoutAdminToken, null, 'searchO2_admin_token must be removed from localStorage');

  let postLogoutSavedCreds = await page.evaluate(() => localStorage.getItem('searchO2_saved_creds'));
  assert.strictEqual(postLogoutSavedCreds, null, 'searchO2_saved_creds must be purged on logout');

  let postLogoutSpeed = await page.evaluate(() => state.speedFactor);
  assert.strictEqual(postLogoutSpeed, 1, 'Speed factor must be reset to 1x on logout');

  let postLogoutDevRegion = await page.evaluate(() => {
    const el = document.getElementById('devRegionToggleBtn');
    return el ? window.getComputedStyle(el).display : 'none';
  });
  assert.strictEqual(postLogoutDevRegion, 'none', '#devRegionToggleBtn must be hidden on logout');

  let postLogoutDevOxy = await page.evaluate(() => {
    const el = document.getElementById('devOxyForgeToggleBtn');
    return el ? window.getComputedStyle(el).display : 'none';
  });
  assert.strictEqual(postLogoutDevOxy, 'none', '#devOxyForgeToggleBtn must be hidden on logout');

  let postLogoutPwValues = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="password"]'));
    return inputs.map(i => i.value).filter(Boolean);
  });
  assert.strictEqual(postLogoutPwValues.length, 0, 'All password input values in DOM must be empty after logout');
  console.log('[✓ PASSED] Post-logout credential wipe verified (tokens, elevation, speed reset to 1x, DOM wiped)');

  await browser.close();
  console.log('\n==================================================================');
  console.log('  ALL ADMIN & SPEED RESTRICTION TESTS PASSED (100% SUCCESS)        ');
  console.log('==================================================================');
})().catch(err => {
  console.error('[TEST FAILURE]:', err);
  process.exit(1);
});
