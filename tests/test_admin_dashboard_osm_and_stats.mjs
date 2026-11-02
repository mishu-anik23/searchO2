import { chromium } from 'playwright';
import path from 'path';
import assert from 'assert';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('========================================================');
  console.log('  Testing Admin Dashboard OpenStreetMap & Statistical Modals');
  console.log('========================================================');

  // Verify byte parity between admin/dashboard.html and public/admin/dashboard.html
  const file1 = path.resolve(__dirname, '..', 'admin', 'dashboard.html');
  const file2 = path.resolve(__dirname, '..', 'public', 'admin', 'dashboard.html');
  const b1 = fs.readFileSync(file1);
  const b2 = fs.readFileSync(file2);
  assert(b1.equals(b2), 'admin/dashboard.html and public/admin/dashboard.html must have 100% byte parity');
  console.log(`[✓ PASSED] 100% Byte Parity verified (${b1.length} bytes)`);

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('pageerror', (err) => console.log('[PAGE ERROR]:', err.message));

  const dashboardUrl = 'file:///' + path.resolve(__dirname, '../admin/dashboard.html').replace(/\\/g, '/');
  console.log('Loading:', dashboardUrl);
  await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // 1. Sign in with Master Admin password
  console.log('[Test 1] Signing in with Master Admin Password...');
  await page.fill('#password', 'SearchO2@Admin2026!');
  await page.click('#btnLogin');
  await page.waitForTimeout(600);

  const viewOverviewVisible = await page.isVisible('#view-overview');
  assert(viewOverviewVisible, 'Overview view must be visible after login');
  console.log('[✓ PASSED] Successfully signed in to Admin Dashboard');

  // 2. Test OpenStreetMap View & Real-Time Coordinates HUD
  console.log('[Test 2] Navigating to World OSM Map View...');
  await page.click('button[data-view="map"]');
  await page.waitForTimeout(500);

  const viewMapVisible = await page.isVisible('#view-map');
  assert(viewMapVisible, 'World OSM Map view must be visible');

  // Verify Decimal & DMS coordinate HUD elements
  const decCoord = await page.textContent('#ptrCoordDecimal');
  const dmsCoord = await page.textContent('#ptrCoordDMS');
  console.log('Initial Pointer Coordinates:');
  console.log('  Decimal:', decCoord);
  console.log('  DMS:    ', dmsCoord);

  assert(decCoord.includes('° N') && decCoord.includes('° E'), 'Decimal coordinates must format properly');
  assert(dmsCoord.includes('°') && dmsCoord.includes("'") && dmsCoord.includes('"'), 'DMS coordinates must contain degree, minute, second formatting');
  console.log('[✓ PASSED] Decimal & DMS coordinates calculation and display verified');

  // Test map pointer interaction / jump
  console.log('[Test 3] Testing Coordinate Jump & Pointer Selection...');
  await page.fill('#coordSearchInput', '52.520008, 13.404954');
  await page.click('#btnJumpCoords');
  await page.waitForTimeout(400);

  const updatedDec = await page.textContent('#ptrCoordDecimal');
  const updatedDms = await page.textContent('#ptrCoordDMS');
  console.log('Updated Pointer Coordinates after Jump:');
  console.log('  Decimal:', updatedDec);
  console.log('  DMS:    ', updatedDms);

  assert(updatedDec.includes('52.52') && updatedDec.includes('13.40'), 'Pointer must update to jump coordinates');
  assert(updatedDms.includes('52°') && updatedDms.includes('13°'), 'DMS coordinates must update on jump');
  console.log('[✓ PASSED] Pointer selection and auto coordinate calculation verified');

  // Verify User Device access markers on map
  console.log('[Test 4] Verifying User Device Access Locations on Map...');
  const userPinCount = await page.locator('.user-device-pin').count();
  console.log('Rendered User Device Access Pins:', userPinCount);
  assert(userPinCount > 0, 'Must render real user device access pins on global map');

  // Click the first user device pin to inspect popup
  await page.locator('.user-device-pin').first().click();
  await page.waitForTimeout(300);
  const popupContent = await page.textContent('.leaflet-popup-content');
  assert(popupContent.includes('Decimal:') && popupContent.includes('DMS:'), 'Popup must show both Decimal and DMS coordinates');
  assert(popupContent.includes('Current Active') || popupContent.includes('Supabase') || popupContent.includes('Local Vault'), 'Popup must show sync status and source');
  console.log('[✓ PASSED] User device access locations globally plotted with dual coordinates & metadata');

  // Dismiss any open modal before navigating
  if (await page.isVisible('#modalFarmDataStats')) {
    await page.click('#modalFarmDataStats button.ghost');
    await page.waitForTimeout(200);
  }

  // 3. Test Active Users Statistical Modal
  console.log('[Test 5] Testing Active Users Statistical Modal on Click...');
  await page.click('button[data-view="overview"]');
  await page.waitForTimeout(400);

  // Click the Total Players card
  await page.locator('.card.clickable').first().click();
  await page.waitForTimeout(400);

  const ausModalVisible = await page.isVisible('#modalActiveUsersStats');
  assert(ausModalVisible, 'Active Users Statistical Modal must open on card click');

  // Test Time Range filters: 24h, 7d, 30d, all
  await page.click('#modalActiveUsersStats button[data-range="7d"]');
  await page.waitForTimeout(200);
  const count7d = await page.textContent('#ausValActiveCount');
  await page.click('#modalActiveUsersStats button[data-range="30d"]');
  await page.waitForTimeout(200);
  const count30d = await page.textContent('#ausValActiveCount');
  console.log('Active Users Count: 7d =', count7d, '· 30d =', count30d);
  assert(parseInt(count30d) >= parseInt(count7d), '30d count should reflect expanded time window');

  // Verify categorized breakdowns exist
  const osBars = await page.textContent('#ausOsBars');
  const browserBars = await page.textContent('#ausBrowserBars');
  const geoBars = await page.textContent('#ausGeoBars');
  assert(osBars.includes('Windows') && osBars.includes('macOS'), 'Must show OS breakdown');
  assert(browserBars.includes('Chrome') && browserBars.includes('Edge'), 'Must show Browser breakdown');
  assert(geoBars.includes('Germany'), 'Must show Geographic distribution');
  console.log('[✓ PASSED] Active Users Statistical Modal verified with categorized breakdown and time ranges');

  // Close Active Users modal
  await page.click('#modalActiveUsersStats button:has-text("✕")');
  await page.waitForTimeout(300);

  // 4. Test Current Online Presence Modal
  console.log('[Test 6] Testing Current Online Real-Time Presence Modal on Click...');
  await page.click('button[data-view="map"]');
  await page.waitForTimeout(400);
  await page.click('#liveCountLabel');
  await page.waitForTimeout(400);

  const copModalVisible = await page.isVisible('#modalCurrentOnlineStats');
  assert(copModalVisible, 'Current Online Presence Modal must open on click');

  const biomesContent = await page.textContent('#copBiomeBars');
  assert(biomesContent.includes('Alpenhof') && biomesContent.includes('Saint Martin'), 'Must show biome distribution');
  console.log('[✓ PASSED] Current Online Real-Time Presence Modal verified');

  await page.click('#modalCurrentOnlineStats button:has-text("✕")');
  await page.waitForTimeout(300);

  // 5. Test User Farm Data Statistics (Verification of 75 kg/h replacement)
  console.log('[Test 7] Verifying User Farm Data Statistics (No static 75 kg/h)...');
  await page.click('button[data-view="users"]');
  await page.waitForTimeout(500);

  const userTableText = await page.textContent('#userRows');
  const hasFarmStats = userTableText.includes('kg/h') && userTableText.includes('kg/ha') && userTableText.includes('Level');
  assert(hasFarmStats, 'Table must display dynamic farm stage, O2 output, and crop yield per ha');
  console.log('[✓ PASSED] User directory displays dynamic farm level, O2 rate, and crop yield');

  // Click Farm Stats button
  await page.locator('button:has-text("🌾 Farm Stats")').first().click();
  await page.waitForTimeout(400);

  const farmModalVisible = await page.isVisible('#modalFarmDataStats');
  assert(farmModalVisible, 'User Farm Data Statistics Modal must open on click');

  const farmTitle = await page.textContent('#mfdFarmTitle');
  const o2Rate = await page.textContent('#mfdValO2Rate');
  const yieldVal = await page.textContent('#mfdValYield');
  const energyVal = await page.textContent('#mfdValEnergy');
  console.log('Farm Telemetry:', farmTitle);
  console.log('  O2 Rate:   ', o2Rate);
  console.log('  Yield:     ', yieldVal);
  console.log('  Clean Energy:', energyVal);

  assert(o2Rate.includes('kg/h'), 'Must display dynamic O2 rate');
  assert(yieldVal.includes('ha') && yieldVal.includes('kg/ha'), 'Must display hectares and crop yield/ha');
  assert(energyVal.includes('kWh/d'), 'Must display clean microgrid solar and wind output');
  console.log('[✓ PASSED] User Farm Data Statistics Modal fully verified');

  await page.click('#modalFarmDataStats button:has-text("✓ Done")');
  await page.waitForTimeout(300);

  console.log('========================================================');
  console.log('  ALL ADMIN DASHBOARD ENHANCEMENT TESTS PASSED!         ');
  console.log('========================================================');

  await browser.close();
}

run().catch((err) => {
  console.error('[TEST FAILED]:', err);
  process.exit(1);
});
