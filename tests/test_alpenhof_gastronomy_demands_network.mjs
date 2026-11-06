// tests/test_alpenhof_gastronomy_demands_network.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const BAVARIA_PATH = path.resolve('bavaria/alpenhof.html');
const PUBLIC_PATH = path.resolve('public/bavaria/alpenhof.html');

test('Alpenhof Gastronomy Menus, Daily Auto Demands, Vineyard Harvest & Pond Logistics Verification', async (t) => {
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

  // Dismiss intro banner
  if (await page.isVisible('#btn-start')) {
    await page.click('#btn-start');
    await page.waitForTimeout(300);
  }
  await page.evaluate(() => {
    if (typeof closeModal === 'function') closeModal();
  });

  // Step 2: Verify state.dailyDemand and state.pondHarvest initialization
  const initialDemand = await page.evaluate(() => {
    return {
      dailyDemand: state.dailyDemand,
      pondHarvest: state.pondHarvest,
      labourPool: state.labourPool
    };
  });

  assert.ok(initialDemand.dailyDemand, 'state.dailyDemand must be defined');
  assert.equal(initialDemand.dailyDemand.juice.target.grapes, 30, 'Juice bar grape target is 30 kg');
  assert.equal(initialDemand.dailyDemand.restaurant.target.fish, 10, 'Restaurant fish target is 10 kg');
  assert.equal(initialDemand.dailyDemand.restaurant.target.duck, 6, 'Restaurant duck target is 6 portions');
  assert.equal(initialDemand.dailyDemand.cheese_shop.target.cheese, 10, 'Cheese shop cheese target is 10 wheels');
  assert.equal(initialDemand.dailyDemand.veg_stand.target.vegetables, 40, 'Veg stand vegetable target is 40 kg');
  console.log('[✓ PASSED] state.dailyDemand initialized across Juice Bar, Restaurant, Cheese Shop, Veg Stand, and BBQ');

  assert.ok(initialDemand.pondHarvest, 'state.pondHarvest must be defined');
  assert.ok(initialDemand.pondHarvest.trout >= 10, 'Pond trout initialized');
  assert.ok(initialDemand.pondHarvest.duckEggs >= 10, 'Pond duck eggs initialized');
  console.log('[✓ PASSED] state.pondHarvest initialized properly');

  // Verify area-specific workers in Labour Pool
  const georg = initialDemand.labourPool.find(w => w.id === 'georg');
  const franz = initialDemand.labourPool.find(w => w.id === 'franz');
  const sepp = initialDemand.labourPool.find(w => w.id === 'sepp');
  assert.ok(georg && georg.station.includes('Lake'), 'Georg Huber assigned to Lake station');
  assert.ok(franz && franz.station.includes('BBQ'), 'Franz Bichler assigned to Gasthof & BBQ station');
  assert.ok(sepp && sepp.station.includes('Bio-Molkerei'), 'Sepp Obermeier assigned to Molkerei station');
  console.log('[✓ PASSED] Area-specific worker roster & station perks verified');

  // Step 3: Test Vineyard Auto-Harvest Cart Dispatch & Juice Bar Demand Fulfillment
  const vineyardResult = await page.evaluate(() => {
    state.built['juice'] = true;
    openJuiceBarModal('grape');
    const modalText = document.getElementById('modalBody')?.textContent || '';
    const hasDemandCard = modalText.includes('Daily Vintage Demand') && modalText.includes('Traubenschorle');

    // Trigger cart
    dispatchVineyardCart();
    const cart = (state.vehicles || []).find(v => v.type === 'vineyard_cart');
    const hasCart = !!cart;

    let iters = 0;
    let hitVineyardLoading = false;
    let hitJuiceBarUnload = false;

    while (state.vehicles && state.vehicles.some(v => v.type === 'vineyard_cart') && iters < 3000) {
      const cur = state.vehicles.find(v => v.type === 'vineyard_cart');
      if (cur.phase === 'to_vineyard' && cur.status === 'loading') hitVineyardLoading = true;
      if (cur.phase === 'to_juice_bar' && cur.status === 'unloading') hitJuiceBarUnload = true;
      updateVehicleLogistics();
      iters++;
    }

    return {
      hasDemandCard,
      hasCart,
      hitVineyardLoading,
      hitJuiceBarUnload,
      remaining: (state.vehicles || []).filter(v => v.type === 'vineyard_cart').length,
      grapesSupplied: state.dailyDemand.juice.current.grapes,
      demandFulfilled: state.dailyDemand.juice.fulfilled
    };
  });

  assert.ok(vineyardResult.hasDemandCard, 'Juice Bar modal displays daily vintage demand and native menu');
  assert.ok(vineyardResult.hasCart, 'Vineyard auto-harvest cart dispatched from Farm Garage');
  assert.ok(vineyardResult.hitVineyardLoading, 'Cart docked at Vineyard with worker loading fresh grape crates');
  assert.ok(vineyardResult.hitJuiceBarUnload, 'Cart docked at Hof-Mosterei and unloaded into grape must hopper');
  assert.equal(vineyardResult.remaining, 0, 'Vineyard cart returned to Farm Garage Depot');
  assert.ok(vineyardResult.grapesSupplied >= 30, 'Supplied at least 30 kg fresh grapes to Juice Bar');
  assert.ok(vineyardResult.demandFulfilled, 'Juice Bar daily grape demand marked fulfilled');
  console.log('[✓ PASSED] Vineyard Auto-Harvest Express completed full cycle: Farm Garage -> Vineyard harvest -> Juice Bar delivery -> Demand fulfilled -> Garage return');

  // Step 4: Test Multi-Step Pond Harvesting & Pond Cart Dispatch
  const pondResult = await page.evaluate(() => {
    state.built['pond'] = true;
    openLakeModal();
    const modalTextBefore = document.getElementById('modalBody')?.textContent || '';
    const hasHarvestButtons = modalTextBefore.includes('Deploy Net Traps') && modalTextBefore.includes('Entenhaus Harvest');

    // Execute Step 1: Deploy Net Traps
    executePondHarvestStep(1);
    const step1Active = state.pondHarvest.harvestStep === 1;

    // Execute Step 2: Catch & Grade Trout & Char
    executePondHarvestStep(2);
    const step2Active = state.pondHarvest.harvestStep === 2;

    // Execute Step 3: Entenhaus Duck Eggs & Dressed Duck
    executePondHarvestStep(3);
    const step3Active = state.pondHarvest.harvestStep === 3;

    // Execute Step 4: Dispatch Pond Logistics Cart
    dispatchPondCart();
    const cart = (state.vehicles || []).find(v => v.type === 'pond_cart');
    const hasCart = !!cart;

    let iters = 0;
    let hitPondLoading = false;
    let hitRestaurantDelivery = false;
    let hitBBQDelivery = false;

    while (state.vehicles && state.vehicles.some(v => v.type === 'pond_cart') && iters < 4000) {
      const cur = state.vehicles.find(v => v.type === 'pond_cart');
      if (cur.phase === 'to_pond' && cur.status === 'loading') hitPondLoading = true;
      if (cur.phase === 'to_restaurant' && cur.status === 'unloading') hitRestaurantDelivery = true;
      if (cur.phase === 'to_bbq' && cur.status === 'unloading') hitBBQDelivery = true;
      updateVehicleLogistics();
      iters++;
    }

    return {
      hasHarvestButtons,
      step1Active,
      step2Active,
      step3Active,
      hasCart,
      hitPondLoading,
      hitRestaurantDelivery,
      hitBBQDelivery,
      remaining: (state.vehicles || []).filter(v => v.type === 'pond_cart').length,
      restFish: state.dailyDemand.restaurant.current.fish,
      restDuck: state.dailyDemand.restaurant.current.duck,
      bbqFish: state.dailyDemand.bbq.current.fish
    };
  });

  assert.ok(pondResult.hasHarvestButtons, 'Lake modal displays enhanced multi-step harvesting controls');
  assert.ok(pondResult.step1Active && pondResult.step2Active && pondResult.step3Active, 'All 3 pond harvest steps executed successfully');
  assert.ok(pondResult.hasCart, 'Glacial Waters & Poultry Express dispatched from Farm Garage');
  assert.ok(pondResult.hitPondLoading, 'Cart docked at Lake Hatchery pier with Fisherman Georg loading chilled crates');
  assert.ok(pondResult.hitRestaurantDelivery, 'Cart delivered fresh trout and duck portions to Gasthof Stuben kitchen');
  assert.ok(pondResult.hitBBQDelivery, 'Cart delivered fish and poultry skewers to Hilltop BBQ stand');
  assert.equal(pondResult.remaining, 0, 'Pond cart returned to Farm Garage Depot');
  assert.ok(pondResult.restFish > 0 && pondResult.restDuck > 0, 'Restaurant pantry supplied with fish and duck');
  console.log('[✓ PASSED] Enhanced Pond Harvesting & Multi-Stop Cart: Lake -> Gasthof Stuben -> Hilltop BBQ -> Garage');

  // Step 5: Test Restaurant Gastronomy Menu Console
  const restResult = await page.evaluate(() => {
    state.built['restaurant'] = true;
    openRestaurantModal();
    const text = document.getElementById('modalBody')?.textContent || '';
    return {
      hasMenu: text.includes('Forelle Blau') && text.includes('Knusprige Alpen-Ente') && text.includes('Allgäuer Kässpatzen'),
      hasDispatches: text.includes('Dispatch Lake Pond Cart') && text.includes('Dispatch Silo Produce Cart')
    };
  });
  assert.ok(restResult.hasMenu, 'Restaurant displays native farm gastronomy menu based on pond and dairy products');
  assert.ok(restResult.hasDispatches, 'Restaurant console contains direct logistics cart dispatch controls');
  console.log('[✓ PASSED] Alpenhof Gasthof Stuben native gastronomy menu and logistics verified');

  // Step 6: Test Hilltop Tourist BBQ Hosted Events & Reward Economy
  const bbqResult = await page.evaluate(() => {
    state.built['bbq'] = true;
    state.bbq = { stage: 4, touristsServed: 10 };
    openBBQModal();
    const text = document.getElementById('modalBody')?.textContent || '';
    const hasEvents = text.includes('Alpen-Sommerfest') && text.includes('Smokehouse Grill') && text.includes('Herbst-Festschmaus');

    const startMoney = state.money;
    hostBBQEvent('summer_bbq');
    const summerPaid = state.money - startMoney;

    hostBBQEvent('smokehouse_grill');
    const totalPaid = state.money - startMoney;

    return {
      hasEvents,
      summerPaid,
      totalPaid,
      touristsServed: state.bbq.touristsServed,
      eventsHosted: state.dailyDemand.bbq.totalEventsHosted
    };
  });

  assert.ok(bbqResult.hasEvents, 'BBQ console renders 3 hosted events with grill menus');
  assert.equal(bbqResult.summerPaid, 240, 'Alpen-Sommerfest BBQ awarded €240 event revenue');
  assert.equal(bbqResult.totalPaid, 570, 'Both events awarded €570 cumulative revenue');
  assert.ok(bbqResult.touristsServed >= 50, 'Tourist count increased from hosted events');
  assert.equal(bbqResult.eventsHosted, 2, 'Events recorded in daily demand statistics');
  console.log('[✓ PASSED] Hilltop BBQ Hosted Events economy verified with dynamic menus and tourist rewards');

  // Step 7: Test Cheese Shop & Veg Stand Demand Quotas
  const shopResult = await page.evaluate(() => {
    state.built['dairy_market'] = true;
    openDairyMarketModal();
    const cheeseText = document.getElementById('modalBody')?.textContent || '';
    const hasCheeseDemand = cheeseText.includes('Daily Demand Target') && cheeseText.includes('Milk 25L');

    state.built['veg'] = true;
    openVegModal(0);
    const vegText = document.getElementById('modalBody')?.textContent || '';
    const hasVegDemand = vegText.includes('Daily Stand Demand') && vegText.includes('40 kg Vegetables');

    return { hasCheeseDemand, hasVegDemand };
  });

  assert.ok(shopResult.hasCheeseDemand, 'Cheese Shop renders artisan selling list and daily demand target');
  assert.ok(shopResult.hasVegDemand, 'Roadside vegetable stand renders fresh produce selling list and demand quota');
  console.log('[✓ PASSED] Cheese Shop and Veg Stand selling lists and daily demand quotas verified');

  // Step 8: Test Labour HQ Area-Specific Stations and Perks
  const labourResult = await page.evaluate(() => {
    openLabour();
    const text = document.getElementById('modalBody')?.textContent || '';
    return {
      hasGeorg: text.includes('Georg Huber') && text.includes('Living Waters Alpine Lake'),
      hasFranz: text.includes('Franz Bichler') && text.includes('Gasthof Stuben & Hilltop BBQ'),
      hasSepp: text.includes('Sepp Obermeier') && text.includes('Bio-Molkerei')
    };
  });
  assert.ok(labourResult.hasGeorg, 'Labour HQ renders Georg Huber with Lake station');
  assert.ok(labourResult.hasFranz, 'Labour HQ renders Franz Bichler with BBQ & Gasthof station');
  assert.ok(labourResult.hasSepp, 'Labour HQ renders Sepp Obermeier with Molkerei station');
  console.log('[✓ PASSED] Labour HQ area-specific worker assignments, stations, and perks verified');

  console.log('\n========================================================');
  console.log('  ALL GASTRONOMY, DEMANDS & POND LOGISTICS TESTS PASSED! ');
  console.log('========================================================\n');

  await browser.close();
  } catch (err) {
    console.error('TEST ERROR TRACE:', err);
    throw err;
  }
});
