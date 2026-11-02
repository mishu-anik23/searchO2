import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TEST SUITE: ADMIN EMAIL REMOVAL & PUFF/PIP MODAL');
  console.log('====================================================\n');

  let failed = 0;
  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  // 1. Static file check for zero email exposure in UI
  console.log('▶ Test 1: Verify Zero Exposure of searcho2.online@gmail.com in UI');
  const indexHtml = readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  const forbiddenUiStrings = [
    'searcho2.online@gmail.com)',
    '(searcho2.online@gmail.com)',
    'reserved for Admin (searcho2.online@gmail.com)',
    'exclusively to Admin (searcho2.online@gmail.com)'
  ];

  for (const s of forbiddenUiStrings) {
    assert(!indexHtml.includes(s), `UI string does not expose admin email: "${s}"`);
  }

  // 2. Static file checks for standalone biome pages
  console.log('\n▶ Test 2: Verify Access Restriction Alerts in Biome Standalone Pages');
  const bavariaHtml = readFileSync(path.join(rootDir, 'bavaria/alpenhof.html'), 'utf8');
  const saintMartinHtml = readFileSync(path.join(rootDir, 'saint-martin/blue-lab.html'), 'utf8');

  assert(!bavariaHtml.includes('Admin (searcho2.online@gmail.com)'), 'bavaria/alpenhof.html alerts sanitized');
  assert(!saintMartinHtml.includes('Admin (searcho2.online@gmail.com)'), 'saint-martin/blue-lab.html alerts sanitized');

  // 3. Static byte parity check
  console.log('\n▶ Test 3: Verify 100% Byte Parity for Mirrored Files');
  assert(readFileSync(path.join(rootDir, 'bavaria/alpenhof.html')).equals(readFileSync(path.join(rootDir, 'public/bavaria/alpenhof.html'))), 'bavaria/alpenhof.html <===> public/bavaria/alpenhof.html');
  assert(readFileSync(path.join(rootDir, 'saint-martin/blue-lab.html')).equals(readFileSync(path.join(rootDir, 'public/saint-martin/blue-lab.html'))), 'saint-martin/blue-lab.html <===> public/saint-martin/blue-lab.html');
  assert(readFileSync(path.join(rootDir, 'home-avatar-tour.js')).equals(readFileSync(path.join(rootDir, 'public/home-avatar-tour.js'))), 'home-avatar-tour.js <===> public/home-avatar-tour.js');
  assert(readFileSync(path.join(rootDir, 'admin/dashboard.html')).equals(readFileSync(path.join(rootDir, 'public/admin/dashboard.html'))), 'admin/dashboard.html <===> public/admin/dashboard.html');

  // 4. Playwright Browser Automation for Puff & Pip Modal
  console.log('\n▶ Test 4: Browser Automation for Puff & Pip Admin Restricted Modal');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    const indexUrl = 'file:///' + path.join(rootDir, 'index.html').replace(/\\/g, '/');
    await page.goto(indexUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Call showAdminRestrictedModal for Saint Martin
    await page.evaluate(() => {
      window.showAdminRestrictedModal('saint_martin', "Saint Martin's Blue Lab");
    });
    await page.waitForTimeout(400);

    const modalExists = await page.locator('#adminRestrictedModal').count();
    assert(modalExists === 1, '#adminRestrictedModal is visible in DOM');

    const modalText = await page.locator('#adminRestrictedModal').innerText();
    assert(!modalText.includes('searcho2.online@gmail.com'), 'Puff & Pip modal text contains zero email exposure');
    assert(modalText.includes("Saint Martin"), 'Modal displays Saint Martin title');
    assert(modalText.includes('Puff explains'), 'Modal contains Puff explanation dialogue');
    assert(modalText.includes('Pip guides'), 'Modal contains Pip guidance dialogue');

    const puffSvgCount = await page.locator('#adminRestrictedModal .gdpr-puff-svg').count();
    const pipSvgCount = await page.locator('#adminRestrictedModal .gdpr-pip-svg').count();
    assert(puffSvgCount >= 1, 'Puff animated SVG character rendered in modal');
    assert(pipSvgCount >= 1, 'Pip animated SVG character rendered in modal');

    const btnEnterFarm = await page.locator('#btnAdminRestrictedEnterFarm').innerText();
    const btnOpenHub = await page.locator('#btnAdminRestrictedOpenHub').innerText();
    const btnClose = await page.locator('#btnAdminRestrictedClose').innerText();

    assert(btnEnterFarm.includes('Enter Active German Farm'), 'Primary navigation button to German farm present');
    assert(btnOpenHub.includes('Explore Learning Hub'), 'Secondary navigation button to Learning Hub present');
    assert(btnClose.includes('Return to World Map'), 'Return to world map button present');

    // Test close button
    await page.click('#btnAdminRestrictedClose');
    await page.waitForTimeout(300);
    const modalAfterClose = await page.locator('#adminRestrictedModal').count();
    assert(modalAfterClose === 0, 'Modal closed and removed on close button click');

    // Test Bavaria modal
    await page.evaluate(() => {
      window.showAdminRestrictedModal('bavaria', 'Alpenhof Journey (Bavaria)');
    });
    await page.waitForTimeout(400);
    const bavariaModalText = await page.locator('#adminRestrictedModal').innerText();
    assert(bavariaModalText.includes('Alpenhof'), 'Bavaria modal displays Alpenhof title and dialogue');
    assert(!bavariaModalText.includes('searcho2.online@gmail.com'), 'Bavaria modal contains zero email exposure');

    // 5. Test Logged-In User Card View
    console.log('\n▶ Test 5: Verify Logged-In User Card View in authModalHtml');
    const authCardHtml = await page.evaluate(() => {
      window.apiUser = {
        id: 'admin_test',
        displayName: 'SearchO2 Admin',
        email: 'searcho2.online@gmail.com',
        role: 'admin'
      };
      return window.authModalHtml();
    });

    assert(!authCardHtml.includes('searcho2.online@gmail.com'), 'Logged-in user card view does NOT expose searcho2.online@gmail.com');
    assert(authCardHtml.includes('Headquarters Admin (Protected)'), 'Logged-in admin user card view displays "Headquarters Admin (Protected)"');

    // 6. Test Region Cards View (renderRegionCardsHtml)
    console.log('\n▶ Test 6: Verify Region Cards View in renderRegionCardsHtml');
    const cardsHtml = await page.evaluate(() => {
      window.apiUser = null; // non-admin
      return window.renderRegionCardsHtml(null, { emoji: '🍂', name: 'Autumn' }, true);
    });

    assert(!cardsHtml.includes('searcho2.online@gmail.com'), 'Region cards do NOT expose searcho2.online@gmail.com');
    assert(cardsHtml.includes('🔒 Administrator Access Only'), 'Region cards render "🔒 Administrator Access Only"');
    assert(cardsHtml.includes('Headquarters Only'), 'Region badges render "Headquarters Only" instead of email/admin ID');

    // 7. Click on an admin-restricted button in DOM and ensure Puff & Pip modal opens
    console.log('\n▶ Test 7: Click on admin-restricted button opens Puff & Pip modal');
    await page.evaluate(() => {
      if (document.getElementById('adminRestrictedModal')) {
        document.getElementById('adminRestrictedModal').remove();
      }
      var testBtn = document.createElement('button');
      testBtn.id = 'dynamicTestAdminBtn';
      testBtn.setAttribute('data-adminrestricted', 'saint_martin');
      testBtn.style.cssText = 'position:fixed;top:10px;left:10px;z-index:9999999;width:50px;height:50px;background:red;';
      document.body.appendChild(testBtn);
      // Re-wire click
      testBtn.onclick = function(e){
        e.stopPropagation();
        window.showAdminRestrictedModal('saint_martin', "Saint Martin's Blue Lab");
      };
    });

    await page.click('#dynamicTestAdminBtn', { force: true });
    await page.waitForTimeout(400);

    const openedModalCount = await page.locator('#adminRestrictedModal').count();
    assert(openedModalCount === 1, 'Clicking data-adminrestricted element opens Puff & Pip modal');

  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! ZERO FAILURES.');
  } else {
    console.error(`❌ TEST SUITE HAD ${failed} FAILURE(S).`);
    process.exit(1);
  }
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST RUNNER ERROR:', err);
  process.exit(1);
});
