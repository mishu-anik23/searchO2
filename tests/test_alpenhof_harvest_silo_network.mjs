// tests/test_alpenhof_harvest_silo_network.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const BAVARIA_PATH = path.resolve('bavaria/alpenhof.html');
const PUBLIC_PATH = path.resolve('public/bavaria/alpenhof.html');

test('Alpenhof Silo Capacity, Harvesting Loop & Harvest Vehicle Logistics Verification', async (t) => {
  try {
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

  // Step 2: Verify state.siloLogistics initialization
  const initialSilo = await page.evaluate(() => {
    return typeof state !== 'undefined' ? state.siloLogistics : null;
  });
  assert.ok(initialSilo, 'state.siloLogistics must be defined');
  assert.equal(initialSilo.storageCapacity, 600, 'Initial silo capacity must be 600 kg');
  assert.ok(initialSilo.inventory.fruits >= 0, 'Fruits inventory tracked');
  assert.ok(initialSilo.inventory.vegetables >= 0, 'Vegetables inventory tracked');
  assert.ok(initialSilo.inventory.grains >= 0, 'Grains inventory tracked');
  console.log('[✓ PASSED] state.siloLogistics initialized properly with 600 kg capacity');

  // Step 3: Harvesting Process Loop Integration (Orchards, Veg, Vineyard store into Silo)
  const harvestLoopResult = await page.evaluate(() => {
    const prevFruit = state.siloLogistics.inventory.fruits;
    const prevVeg = state.siloLogistics.inventory.vegetables;

    // Simulate mature orchard harvest
    state.orchards['o1'].beds[0].status = 'mature';
    harvestOrchardBed('o1', 0);

    // Simulate mature veg bed harvest
    state.vegetables.beds[0].plants[0].status = 'mature';
    state.vegetables.beds[0].plants[1].status = 'mature';
    harvestVegBed(0);

    return {
      fruitStored: state.siloLogistics.inventory.fruits - prevFruit,
      vegStored: state.siloLogistics.inventory.vegetables - prevVeg
    };
  });
  assert.ok(harvestLoopResult.fruitStored > 0, 'Harvested orchard apples stored in Silo');
  assert.ok(harvestLoopResult.vegStored > 0, 'Harvested polyculture vegetables stored in Silo');
  console.log(`[✓ PASSED] Harvesting process loop verified: +${harvestLoopResult.fruitStored}kg fruits and +${harvestLoopResult.vegStored}kg vegetables accumulated in Silo`);

  // Step 4: Verify Silo Modal rendering and controls
  const siloModalInfo = await page.evaluate(() => {
    state.built['silo'] = true;
    openSiloModal();
    return {
      isOpen: document.getElementById('modal').classList.contains('open'),
      text: document.getElementById('modalBody').innerText
    };
  });
  assert.ok(siloModalInfo.isOpen, 'Silo modal opens');
  assert.ok(siloModalInfo.text.includes('Silo Towers') || siloModalInfo.text.includes('Silo'), 'Modal contains Silo title');
  assert.ok(siloModalInfo.text.includes('Wholesale Grain & Harvest Transport Hauler'), 'Contains Wholesale Hauler button');
  assert.ok(siloModalInfo.text.includes('Expand Timber Silo Capacity'), 'Contains Capacity upgrade button');
  console.log('[✓ PASSED] Silo modal rendered with storage capacity, breakdown cards, and dispatch controls');

  // Step 5: Expand Silo Capacity
  const upgradeResult = await page.evaluate(() => {
    state.money = 5000;
    const prevCap = state.siloLogistics.storageCapacity;
    expandSiloCapacity();
    return { prevCap, newCap: state.siloLogistics.storageCapacity };
  });
  assert.equal(upgradeResult.newCap, 1000, 'Silo capacity upgraded from 600 to 1000 kg (+400 kg)');
  console.log('[✓ PASSED] Silo capacity expanded successfully to 1,000 kg');

  // Step 6: Test Wholesale Harvest Hauler (export_truck) Dispatch & Simulation Traversal
  const exportTruckResult = await page.evaluate(() => {
    closeModal();
    state.siloLogistics.inventory.fruits = 50;
    state.siloLogistics.inventory.vegetables = 50;
    state.siloLogistics.inventory.grains = 50;
    const startMoney = state.money;

    dispatchHarvestTruck();
    const truck = (state.vehicles || []).find(v => v.type === 'harvest_truck');
    const hasTruck = !!truck;
    const phase = truck?.phase;

    let iters = 0;
    let hitLoading = false;
    let hitOutbound = false;

    while (state.vehicles && state.vehicles.some(v => v.type === 'harvest_truck') && iters < 3000) {
      const cur = state.vehicles.find(v => v.type === 'harvest_truck');
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
      remaining: (state.vehicles || []).filter(v => v.type === 'harvest_truck').length,
      revenueEarned: state.money - startMoney,
      totalExportSales: state.siloLogistics.stats.totalExportSales
    };
  });

  assert.ok(exportTruckResult.hasTruck, 'Wholesale harvest hauler dispatched');
  assert.equal(exportTruckResult.phase, 'inbound', 'Harvest hauler enters in inbound phase from Main Gate');
  assert.ok(exportTruckResult.hitLoading, 'Harvest hauler docked and loaded at Silo loading apron');
  assert.ok(exportTruckResult.hitOutbound, 'Harvest hauler departed via Main Arterial outbound highway');
  assert.equal(exportTruckResult.remaining, 0, 'Harvest hauler departed campus');
  assert.ok(exportTruckResult.revenueEarned > 0, 'Harvest hauler awarded wholesale revenue');
  assert.ok(exportTruckResult.totalExportSales >= 1, 'Total export sales recorded in silo stats');
  console.log(`[✓ PASSED] Wholesale harvest hauler completed full cycle: entry -> worker loading at Silo apron -> departure -> payout (+€${exportTruckResult.revenueEarned})`);

  // Step 7: Test Local Farm Harvest Cart (Fendt Tractor) Dispatch & Multi-Stop Delivery
  const localCartResult = await page.evaluate(() => {
    closeModal();
    state.siloLogistics.inventory.fruits = 40;
    state.siloLogistics.inventory.vegetables = 50;
    const initialStandVeg = state.siloLogistics.standStock.vegetables;
    const initialRestVeg = state.siloLogistics.restaurantStock.vegetables;

    dispatchLocalHarvestCart();
    const cart = (state.vehicles || []).find(v => v.type === 'local_harvest_cart');
    const hasCart = !!cart;
    const phase = cart?.phase;

    let iters = 0;
    let hitLoading = false;
    let hitVegStand = false;
    let hitRestaurant = false;

    while (state.vehicles && state.vehicles.some(v => v.type === 'local_harvest_cart') && iters < 4000) {
      const cur = state.vehicles.find(v => v.type === 'local_harvest_cart');
      if (cur.status === 'loading') hitLoading = true;
      if (cur.phase === 'to_veg_stand') hitVegStand = true;
      if (cur.phase === 'to_restaurant') hitRestaurant = true;
      updateVehicleLogistics();
      iters++;
    }

    return {
      hasCart,
      phase,
      iters,
      hitLoading,
      hitVegStand,
      hitRestaurant,
      remaining: (state.vehicles || []).filter(v => v.type === 'local_harvest_cart').length,
      standVegDelta: state.siloLogistics.standStock.vegetables - initialStandVeg,
      restVegDelta: state.siloLogistics.restaurantStock.vegetables - initialRestVeg,
      totalLocalDeliveries: state.siloLogistics.stats.totalLocalDeliveries
    };
  });

  assert.ok(localCartResult.hasCart, 'Local harvest cart dispatched');
  assert.equal(localCartResult.phase, 'to_silo', 'Harvest cart drives from garage to Silo first');
  assert.ok(localCartResult.hitLoading, 'Harvest cart loaded at Silo hopper');
  assert.ok(localCartResult.hitVegStand, 'Harvest cart navigated central subway and delivered to Veg Stand');
  assert.ok(localCartResult.hitRestaurant, 'Harvest cart delivered fresh harvest to Gasthof Stuben');
  assert.equal(localCartResult.remaining, 0, 'Harvest cart returned safely to Farm Garage depot');
  assert.ok(localCartResult.standVegDelta > 0, 'Roadside produce stand restocked');
  assert.ok(localCartResult.restVegDelta > 0, 'Gasthof Stuben pantry restocked');
  console.log(`[✓ PASSED] Local harvest cart completed multi-stop delivery: Farm Garage -> Silo -> Subway -> Veg Stand -> Gasthof Stuben -> Farm Garage (Deliveries completed: ${localCartResult.totalLocalDeliveries})`);

  // Step 8: Verify Roadside Veg Stand & Restaurant modal integration
  const vegModalText = await page.evaluate(() => {
    closeModal();
    state.built['veg'] = true;
    openVegModal(0);
    return document.getElementById('modalBody').innerText;
  });
  assert.ok(vegModalText.includes('Bavarian Silo Supply Stock'), 'Veg modal includes Silo supply stock card');
  assert.ok(vegModalText.includes('Request Harvest Cart Delivery from Silo'), 'Veg modal includes restock button');
  console.log('[✓ PASSED] Vegetable garden modal verified with Silo restock integration');

  const restModalText = await page.evaluate(() => {
    closeModal();
    state.built['restaurant'] = true;
    openRestaurantModal();
    return document.getElementById('modalBody').innerText;
  });
  assert.ok(restModalText.includes('Harvest Pantry:'), 'Restaurant modal includes Harvest pantry card');
  assert.ok(restModalText.includes('Restock Harvest'), 'Restaurant includes restock button');
  console.log('[✓ PASSED] Gasthof Stuben modal verified with fresh harvest pantry integration');

  await browser.close();
  console.log('\n========================================================');
  console.log('  ALL SILO & HARVEST VEHICLE NETWORK TESTS PASSED!      ');
  console.log('========================================================\n');
  } catch (err) {
    console.error('TEST ERROR TRACE:', err);
    throw err;
  }
});
