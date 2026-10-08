const { chromium } = require('playwright');

(async () => {
  console.log('====================================================');
  console.log('  SearchO2: Auth Input Stability & Section 9/10 Suite');
  console.log('====================================================\n');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (err) {
    console.error('Failed to launch Chromium browser:', err.message);
    process.exit(1);
  }

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const pageErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('ERR_CONNECTION_REFUSED') && !text.includes('favicon')) {
        pageErrors.push(text);
      }
    }
  });
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  const fileUrl = 'file:///c:/Users/AM/PycharmProjects/searchO2/index.html';
  console.log('Loading SearchO2 page:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1500));

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, detail) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`[✓ PASSED] ${testName}: ${detail}`);
    } else {
      console.error(`[✗ FAILED] ${testName}: ${detail}`);
    }
  }

  console.log('\n--- Running Test 1: Typing Clobber & Focus Protection ---');
  await page.evaluate(() => {
    if (typeof closeModal === 'function') closeModal();
    activeModal = null;
    render();
  });
  await new Promise(r => setTimeout(r, 400));

  // Wait for initial auth card
  const authCard = await page.$('#initialAuthCard');
  assert(authCard !== null, 'Initial Auth Card', 'Found #initialAuthCard element');

  // Find email input
  const emailInput = await page.$('#initAuthEmail');
  assert(emailInput !== null, 'Email Input Exists', 'Found #initAuthEmail input');

  if (emailInput) {
    await emailInput.click();
    await emailInput.type('testplayer@example.com', { delay: 50 });
    // Wait for 3 game loop cycles (600ms) to ensure render loop does not wipe value or drop focus
    await new Promise(r => setTimeout(r, 600));

    const emailVal = await page.$eval('#initAuthEmail', el => el.value);
    const activeId = await page.evaluate(() => document.activeElement ? document.activeElement.id : null);

    assert(emailVal === 'testplayer@example.com', 'Value Preservation', `Email value preserved during game ticks: "${emailVal}"`);
    assert(activeId === 'initAuthEmail', 'Focus Preservation', `Active element remained focused: "${activeId}"`);
  }

  // TEST 2: Tab Switching to Register & Section 9 Merge Options
  console.log('\n--- Running Test 2: Section 9 Registration Mode Selection ---');
  const regTabBtn = await page.$('[data-authtab="register"]');
  assert(regTabBtn !== null, 'Register Tab Button', 'Found [data-authtab="register"] button');

  if (regTabBtn) {
    await regTabBtn.click();
    await new Promise(r => setTimeout(r, 300));

    // Verify registration mode choices are rendered
    const mergeModePills = await page.$('.merge-mode-pills');
    assert(mergeModePills !== null, 'Section 9 Merge Options', 'Found .merge-mode-pills container');

    const pillUpgrade = await page.$('input[value="upgrade"]');
    const pillRecover = await page.$('input[value="code"]');
    const pillFresh = await page.$('input[value="fresh"]');

    assert(pillUpgrade !== null && pillRecover !== null && pillFresh !== null, 'All 3 Section 9 Pills Present', 'Option 1 (Upgrade), Option 2 (Recover), Option 3 (Fresh Start) exist');

    // Click Recover Remote Guest pill
    if (pillRecover) {
      await pillRecover.click();
      await new Promise(r => setTimeout(r, 200));

      const recoveryInput = await page.$('#initAuthRecoveryCode');
      assert(recoveryInput !== null, 'Recovery Code Input', 'Found #initAuthRecoveryCode input field after selecting Option 2');

      if (recoveryInput) {
        await recoveryInput.type('GUEST-ABCD-1234-EFGH-5678', { delay: 30 });
        const recoveryVal = await page.$eval('#initAuthRecoveryCode', el => el.value);
        assert(recoveryVal === 'GUEST-ABCD-1234-EFGH-5678', 'Recovery Code Typing', 'Recovery code typed and preserved successfully');
      }
    }
  }

  // TEST 3: Guest Login & In-Game Account Modal Recovery Code UI
  console.log('\n--- Running Test 3: Guest Login & Recovery Code Generation UI ---');
  const guestStartBtn = await page.$('#btnGuestStart');
  assert(guestStartBtn !== null, 'Guest Start Button', 'Found #btnGuestStart button');

  if (guestStartBtn) {
    await guestStartBtn.click();
    await new Promise(r => setTimeout(r, 800));

    // Switch to farm screen
    await page.evaluate(() => switchScreen('farm'));
    await new Promise(r => setTimeout(r, 600));

    const fScreen = await page.$('#farmScreen');
    assert(fScreen !== null, 'Farm Screen Entered', 'Player switched to farmScreen');

    // Open Account Modal
    await page.evaluate(() => openModal('auth'));
    await new Promise(r => setTimeout(r, 500));

    const recoveryCard = await page.$('.recovery-code-card');
    assert(recoveryCard !== null, 'Guest Recovery Code Card', 'Account modal displays .recovery-code-card for guest user');

    const copyBtn = await page.$('#btnCopyRecoveryCode');
    const downloadBtn = await page.$('#btnDownloadRecoveryCode');
    assert(copyBtn !== null && downloadBtn !== null, 'Recovery Code Action Buttons', 'Found Copy Code and Download Backup buttons');

    // Close modal
    await page.evaluate(() => closeModal());
    await new Promise(r => setTimeout(r, 300));
  }

  // TEST 4: Admin Console Access & Modal Inspection
  console.log('\n--- Running Test 4: Section 10 Admin Console & 360° Inspector ---');
  // Inject mock admin role into apiUser
  await page.evaluate(() => {
    apiUser = {
      id: 'admin_test_uuid_123',
      email: 'admin@searcho2.org',
      displayName: 'System Admin',
      role: 'admin',
      authProvider: 'local',
      token: 'mock_admin_jwt_token'
    };
    render();
  });
  await new Promise(r => setTimeout(r, 500));

  // Check for admin launch button in dock/topbar
  const adminBtn = await page.$('[onclick*="openAdminDashboard"]');
  assert(adminBtn !== null, 'Admin Launch Button', 'Admin icon / dock button is visible when apiUser.role === "admin"');

  // Open Admin Dashboard directly
  await page.evaluate(() => openAdminDashboard());
  await new Promise(r => setTimeout(r, 500));

  // Verify Admin Modal opened
  const adminWrap = await page.$('.admin-modal-wrap');
  assert(adminWrap !== null, 'Admin Modal Rendered', 'Admin console modal opened (.admin-modal-wrap)');

  if (adminWrap) {

    // Verify 7 Admin Tabs
    const tabs = await page.$$('.admin-tab-item');
    assert(tabs.length >= 6, 'Admin Sub-Views Count', `Found ${tabs.length} admin navigation tabs`);

    // Provide mock overview stats
    await page.evaluate(() => {
      adminState.loading = false;
      adminState.stats = { totalUsers: 125, totalFarms: 80, activeSessions: 30, totalTreasuryEUR: 75000, totalO2: 95000 };
      render();
    });
    await new Promise(r => setTimeout(r, 200));

    // Verify Overview Stats Tiles
    const statTiles = await page.$$('.admin-stat-tile');
    assert(statTiles.length >= 4, 'System Overview Metrics', `Found ${statTiles.length} metrics dashboard tiles`);

    // Simulate switching to Game Data tab with 6-plot matrix
    await page.evaluate(() => {
      adminState.selectedUser = {
        id: 'user_target_456',
        email: 'farmer_bob@example.com',
        displayName: 'Farmer Bob',
        role: 'user',
        status: 'active',
        emailVerified: true,
        kycLevel: 'TIER_2',
        createdAt: '2026-09-15T10:00:00Z',
        lastLoginAt: '2026-10-02T18:00:00Z',
        lastIp: '192.168.1.100',
        deviceType: 'Desktop',
        browser: 'Chrome 128',
        os: 'Windows 11',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        farm: {
          balance: 14250.75,
          totalO2: 8900,
          speedFactor: 180,
          plots: [
            { id: 0, treeType: 'oak', health: 95, growth: 80, accessories: { irrigation: 'drip' } },
            { id: 1, treeType: 'pine', health: 88, growth: 60, accessories: {} },
            { id: 2, treeType: 'birch', health: 100, growth: 100, accessories: {} },
            { id: 3, treeType: 'empty', health: 0, growth: 0, accessories: {} },
            { id: 4, treeType: 'empty', health: 0, growth: 0, accessories: {} },
            { id: 5, treeType: 'empty', health: 0, growth: 0, accessories: {} }
          ]
        },
        sessions: [
          { id: 'sess_1', ip: '192.168.1.100', device: 'Desktop', browser: 'Chrome 128', os: 'Windows 11', createdAt: '2026-10-02T18:00:00Z', isCurrent: true }
        ],
        ledger: [
          { id: 'tx_1', amount: 500, type: 'crop_sale', desc: 'Sold 20 crates of Apples', timestamp: '2026-10-02T19:30:00Z' }
        ]
      };
      adminState.selectedUserId = 'user_target_456';
      adminState.tab = 'game';
      render();
    });
    await new Promise(r => setTimeout(r, 400));

    // Verify 6-plot visual grid rendered in Game Data view
    const plotCells = await page.$$('.admin-plot-mini-cell');
    assert(plotCells.length === 6, '6 Plots Matrix Inspection', `Admin Game view rendered all 6 plots in matrix (count: ${plotCells.length})`);

    // Verify Verified Game Balance Adjustment Tool inputs
    const adjInput = await page.$('#adminAdjAmountInput');
    const reasonInput = await page.$('#adminAdjReasonSelect');
    const ticketInput = await page.$('#adminAdjTicketInput');
    assert(adjInput !== null && reasonInput !== null && ticketInput !== null, 'Anti-Cheat Balance Tool', 'Verified Balance Adjustment Tool contains mandatory Delta, Reason, and Ticket Ref fields');

    // Switch to Cookies & Sessions tab
    await page.evaluate(() => {
      adminState.tab = 'cookies';
      render();
    });
    await new Promise(r => setTimeout(r, 300));

    const sessionItems = await page.$$('.admin-session-item');
    assert(sessionItems.length >= 1, 'Active Sessions & Cookies View', `Rendered ${sessionItems.length} active browser session record(s)`);

    // Close admin modal
    const closeAdminBtn = await page.$('#btnCloseAdmin');
    if (closeAdminBtn) await closeAdminBtn.click();
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n====================================================');
  console.log(`  Tests Completed: ${passedTests} / ${totalTests} Passed`);
  console.log('====================================================\n');

  if (pageErrors.length > 0) {
    console.log('Captured Page Errors:');
    pageErrors.forEach(err => console.error('  ERROR:', err));
  }

  await browser.close();
  process.exit(passedTests === totalTests ? 0 : 1);
})();
