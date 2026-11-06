// tests/test_alpenhof_vehicle_network.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const BAVARIA_PATH = path.resolve('bavaria/alpenhof.html');
const PUBLIC_PATH = path.resolve('public/bavaria/alpenhof.html');

test('Alpenhof Dairy Vehicle Network & Logistics Verification', async (t) => {
  // Step 1: Verify 100% Byte Parity
  const bavariaBuf = fs.readFileSync(BAVARIA_PATH);
  const publicBuf = fs.readFileSync(PUBLIC_PATH);
  const bavariaHash = crypto.createHash('sha256').update(bavariaBuf).digest('hex');
  const publicHash = crypto.createHash('sha256').update(publicBuf).digest('hex');
  assert.equal(bavariaHash, publicHash, 'bavaria/alpenhof.html and public/bavaria/alpenhof.html must have 100% byte parity');
  console.log(`[✓ PASSED] 100% Byte Parity verified (${bavariaHash.slice(0, 16)}...)`);

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  await page.goto(`file:///${BAVARIA_PATH.replace(/\\/g, '/')}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  assert.equal(pageErrors.length, 0, `Page loaded with errors: ${pageErrors.join(', ')}`);
  console.log('[✓ PASSED] Zero page errors on load');

  // Dismiss welcome banner and modal
  if (await page.isVisible('#btn-start')) {
    await page.click('#btn-start');
    await page.waitForTimeout(300);
  }
  await page.evaluate(() => {
    if (typeof closeModal === 'function') closeModal();
  });

  // Step 2: Verify state.dairyLogistics initialization
  const initialLogistics = await page.evaluate(() => {
    return typeof state !== 'undefined' ? state.dairyLogistics : null;
  });
  assert.ok(initialLogistics, 'state.dairyLogistics must be defined');
  assert.equal(initialLogistics.storageCapacity, 500, 'Initial storage capacity must be 500');
  assert.ok(initialLogistics.inventory.cheese >= 0, 'Cheese inventory tracked');
  assert.ok(initialLogistics.inventory.milk >= 0, 'Milk inventory tracked');
  console.log('[✓ PASSED] state.dairyLogistics initialized properly with 500 units capacity');

  // Step 3: Verify Cold Storage modal rendering and controls
  const coldStorageModalInfo = await page.evaluate(() => {
    state.built['cold_storage'] = true;
    openColdStorageModal();
    return {
      isOpen: document.getElementById('modal').classList.contains('open'),
      text: document.getElementById('modalBody').innerText
    };
  });
  assert.ok(coldStorageModalInfo.isOpen, 'Cold Storage modal opens');
  assert.ok(coldStorageModalInfo.text.includes('Cold Storage'), 'Modal contains Cold Storage title');
  assert.ok(coldStorageModalInfo.text.includes('Wholesale Refrigerated Hauler'), 'Contains Export Hauler button');
  assert.ok(coldStorageModalInfo.text.includes('Expand Geothermal Vault'), 'Contains Capacity upgrade button');
  console.log('[✓ PASSED] Cold Storage modal rendered with storage capacity and dispatch actions');

  // Step 4: Expand Cold Storage Capacity
  const upgradeResult = await page.evaluate(() => {
    state.money = 5000;
    const prevCap = state.dairyLogistics.storageCapacity;
    expandColdStorageCapacity();
    return { prevCap, newCap: state.dairyLogistics.storageCapacity };
  });
  assert.equal(upgradeResult.newCap, 850, 'Cold storage capacity upgraded from 500 to 850 (+350 units)');
  console.log('[✓ PASSED] Cold storage capacity expanded successfully to 850 units');

  // Step 5: Test Export Hauler Dispatch & Simulation Traversal
  const exportTruckResult = await page.evaluate(() => {
    closeModal();
    state.dairyLogistics.inventory.cheese = 40;
    state.dairyLogistics.inventory.milk = 60;
    const startMoney = state.money;

    dispatchExportTruck();
    const truck = (state.vehicles || []).find(v => v.type === 'export_truck');
    const hasTruck = !!truck;
    const phase = truck?.phase;

    let iters = 0;
    let hitLoading = false;
    let hitOutbound = false;

    while (state.vehicles && state.vehicles.some(v => v.type === 'export_truck') && iters < 3000) {
      const cur = state.vehicles.find(v => v.type === 'export_truck');
      if (cur.status === 'loading') hitLoading = true;
      if (cur.phase === 'outbound') hitOutbound = true;
      updateVehicleLogistics();
      iters++;
    }

    return {
      hasTruck,
      phase,
      iters,
      hitLoading,
      hitOutbound,
      remaining: (state.vehicles || []).filter(v => v.type === 'export_truck').length,
      revenueEarned: state.money - startMoney,
      totalExportSales: state.dairyLogistics.stats.totalExportSales
    };
  });

  assert.ok(exportTruckResult.hasTruck, 'Export truck dispatched');
  assert.equal(exportTruckResult.phase, 'inbound', 'Export truck enters in inbound phase');
  assert.ok(exportTruckResult.hitLoading, 'Export truck docked and loaded at Cold Storage');
  assert.ok(exportTruckResult.hitOutbound, 'Export truck departed via outbound highway network');
  assert.equal(exportTruckResult.remaining, 0, 'Export truck departed farm campus');
  assert.ok(exportTruckResult.revenueEarned > 0, 'Export truck awarded coin revenue');
  assert.ok(exportTruckResult.totalExportSales >= 1, 'Total export sales recorded');
  console.log(`[✓ PASSED] Export hauler completed full cycle: entry -> worker loading at Cold Storage -> departure -> payout (+€${exportTruckResult.revenueEarned})`);

  // Step 6: Test Local Dairy Cart (Fendt Tractor) Dispatch & Simulation Traversal
  const localCartResult = await page.evaluate(() => {
    closeModal();
    state.dairyLogistics.inventory.cheese = 40;
    state.dairyLogistics.inventory.milk = 60;
    const initialShopCheese = state.dairyLogistics.shopStock.cheese;
    const initialRestCheese = state.dairyLogistics.restaurantStock.cheese;

    dispatchLocalDairyCart();
    const cart = (state.vehicles || []).find(v => v.type === 'local_cart');
    const hasCart = !!cart;
    const phase = cart?.phase;

    let iters = 0;
    let hitLoading = false;
    let hitCheeseShop = false;
    let hitRestaurant = false;

    while (state.vehicles && state.vehicles.some(v => v.type === 'local_cart') && iters < 4000) {
      const cur = state.vehicles.find(v => v.type === 'local_cart');
      if (cur.status === 'loading') hitLoading = true;
      if (cur.phase === 'to_cheese_shop') hitCheeseShop = true;
      if (cur.phase === 'to_restaurant') hitRestaurant = true;
      updateVehicleLogistics();
      iters++;
    }

    return {
      hasCart,
      phase,
      iters,
      hitLoading,
      hitCheeseShop,
      hitRestaurant,
      remaining: (state.vehicles || []).filter(v => v.type === 'local_cart').length,
      shopCheeseDelta: state.dairyLogistics.shopStock.cheese - initialShopCheese,
      restCheeseDelta: state.dairyLogistics.restaurantStock.cheese - initialRestCheese,
      totalLocalDeliveries: state.dairyLogistics.stats.totalLocalDeliveries
    };
  });

  assert.ok(localCartResult.hasCart, 'Local dairy cart dispatched');
  assert.equal(localCartResult.phase, 'to_storage', 'Local cart travels to storage first');
  assert.ok(localCartResult.hitLoading, 'Local cart loaded at Cold Storage');
  assert.ok(localCartResult.hitCheeseShop, 'Local cart navigated central divider subway and delivered to Cheese Shop');
  assert.ok(localCartResult.hitRestaurant, 'Local cart delivered to Gasthof Stuben restaurant');
  assert.equal(localCartResult.remaining, 0, 'Local cart returned safely to Farm Garage depot');
  assert.ok(localCartResult.shopCheeseDelta > 0, 'Cheese Shop inventory restocked');
  assert.ok(localCartResult.restCheeseDelta > 0, 'Restaurant inventory restocked');
  console.log(`[✓ PASSED] Local cart completed multi-stop delivery: Farm Garage -> Cold Storage -> Central Divider Subway -> Cheese Shop -> Gasthof Stuben -> Farm Garage (Deliveries completed: ${localCartResult.totalLocalDeliveries})`);

  // Step 7: Verify Cheese Shop and Restaurant modal integration
  const marketAndRestModals = await page.evaluate(() => {
    closeModal();
    state.built['dairy_market'] = true;
    openDairyMarketModal();
    const marketText = document.getElementById('modalBody').innerText;

    closeModal();
    state.built['restaurant'] = true;
    openRestaurantModal();
    const restText = document.getElementById('modalBody').innerText;

    return { marketText, restText };
  });

  assert.ok(marketAndRestModals.marketText.includes('Artisanal Dairy Sales Terrace') || marketAndRestModals.marketText.includes('Molkerei'), 'Cheese shop modal includes dairy info');
  assert.ok(marketAndRestModals.marketText.includes('Request Dairy Express Restock'), 'Cheese shop includes restock dispatch button');
  console.log('[✓ PASSED] Cheese Shop modal verified with local cart restock integration');

  assert.ok(marketAndRestModals.restText.includes('Gasthof Stuben') || marketAndRestModals.restText.includes('Console'), 'Restaurant modal includes console info');
  assert.ok(marketAndRestModals.restText.includes('Request Dairy Express Pantry Delivery'), 'Restaurant includes dairy supply button');
  console.log('[✓ PASSED] Gasthof Stuben modal verified with dairy delivery integration');

  await browser.close();
  console.log('\n========================================================');
  console.log('  ALL ALPENHOF VEHICLE NETWORK TESTS PASSED!            ');
  console.log('========================================================\n');
});
