const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

(async () => {
  console.log('====================================================');
  console.log('  Saint Martin Blue Lab Blueprint & Modals Test     ');
  console.log('====================================================');

  // 1. Check file parity
  const origHtml = fs.readFileSync('saint-martin/blue-lab.html', 'utf8');
  const pubHtml = fs.readFileSync('public/saint-martin/blue-lab.html', 'utf8');
  assert.strictEqual(origHtml, pubHtml, 'HTML parity error between saint-martin and public/saint-martin');

  const origSvg = fs.readFileSync('saint-martin/blueprint-map.svg', 'utf8');
  const pubSvg = fs.readFileSync('public/saint-martin/blueprint-map.svg', 'utf8');
  assert.strictEqual(origSvg, pubSvg, 'SVG parity error between saint-martin and public/saint-martin');
  console.log('[✓ PASSED] Strict parity between saint-martin/ and public/saint-martin/');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));
  
  const fileUrl = 'file:///' + path.resolve('saint-martin/blue-lab.html').replace(/\\/g, '/');
  console.log('Visiting:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  
  // Skip boat tour to reach island
  await page.click('#btn-skip-boat');
  await page.waitForTimeout(400);

  // Dismiss onboarding modal if visible
  const isWhyOpen = await page.isVisible('#why-modal');
  if (isWhyOpen) {
    await page.click('#why-ack');
    await page.waitForTimeout(300);
  }
  
  // 2. Blueprint button click -> #blueprint-modal
  await page.click('#btn-blueprint');
  await page.waitForTimeout(300);
  let bpVisible = await page.$eval('#blueprint-modal', el => el.classList.contains('open'));
  assert.strictEqual(bpVisible, true, 'Blueprint modal must be open');
  let bpImgSrc = await page.$eval('#blueprint-body img', el => el.getAttribute('src'));
  assert.strictEqual(bpImgSrc, 'blueprint-map.svg', 'Blueprint modal must render blueprint-map.svg');
  console.log('[✓ PASSED] Top Blueprint button opens modal and displays blueprint-map.svg');
  await page.click('#bp-close');
  await page.waitForTimeout(200);

  // 3. Living Encyclopedia Modal
  await page.click('#btn-encyclopedia');
  await page.waitForTimeout(300);
  let encVisible = await page.$eval('#encyclopedia-modal', el => el.classList.contains('open'));
  assert.strictEqual(encVisible, true, 'Encyclopedia modal must be open');
  let encText = await page.textContent('#encyclopedia-body');
  assert(encText.includes('Cocos nucifera') && encText.includes('Rhizophora mucronata'), 'Encyclopedia must list tree binomials');
  console.log('[✓ PASSED] Living Botanical & Marine Encyclopedia opens with scientific binomials');
  await page.click('#enc-close');
  await page.waitForTimeout(200);

  // 4. Vegetable Crop Field Modal via Float Menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-crop');
  await page.waitForTimeout(300);
  let cropVisible = await page.$eval('#crop-modal', el => el.classList.contains('open'));
  assert.strictEqual(cropVisible, true, 'Crop field modal must be open');
  let cropText = await page.textContent('#crop-body');
  assert(cropText.includes('Polyculture Companion Crop') && cropText.includes('Coastal Cherry Tomato'), 'Crop field modal verification');
  console.log('[✓ PASSED] Menu Crop opens Polyculture Companion Crop Field modal');
  await page.click('#crop-close');
  await page.waitForTimeout(200);

  // 5. Polyculture Botanical Flower Garden Modal via Float Menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-flower');
  await page.waitForTimeout(300);
  let flVisible = await page.$eval('#flower-modal', el => el.classList.contains('open'));
  assert.strictEqual(flVisible, true, 'Flower garden modal must be open');
  let flText = await page.textContent('#flower-body');
  assert(flText.includes('Decagonal Polyculture Botanical Flower') && flText.includes('Ipomoea pes-caprae'), 'Flower modal verification');
  console.log('[✓ PASSED] Menu Flower opens Botanical Flower Garden modal with coastal cultivars');
  await page.click('#flower-close');
  await page.waitForTimeout(200);

  // 6. Farm Garage & Mechanization Depot via Float Menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-garage');
  await page.waitForTimeout(300);
  let garVisible = await page.$eval('#garage-modal', el => el.classList.contains('open'));
  assert.strictEqual(garVisible, true, 'Garage modal must be open');
  let garText = await page.textContent('#garage-body');
  assert(garText.includes('Farm Garage') && garText.includes('Solar Ag-Tractor'), 'Garage modal verification');
  console.log('[✓ PASSED] Menu Garage opens Farm Garage & Mechanization Depot modal');
  await page.click('#garage-close');
  await page.waitForTimeout(200);

  // 7. North Storage Silos via Float Menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-storage');
  await page.waitForTimeout(300);
  let storVisible = await page.$eval('#storage-modal', el => el.classList.contains('open'));
  assert.strictEqual(storVisible, true, 'Storage modal must be open');
  let storText = await page.textContent('#storage-body');
  assert(storText.includes('North Storage Silos') && storText.includes('Tomatoes'), 'Storage modal verification');
  console.log('[✓ PASSED] Menu Storage opens North Storage Silos & Inventory modal');
  await page.click('#storage-close');
  await page.waitForTimeout(200);

  // 8. Seafood modal via float menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-seafood');
  await page.waitForTimeout(300);
  let sfVisible = await page.$eval('#seafood-modal', el => el.classList.contains('open'));
  assert.strictEqual(sfVisible, true, 'Seafood modal must be open');
  let sfText = await page.textContent('#seafood-body');
  assert(sfText.includes('Shrimp & Crab Processing') && sfText.includes('IQF'), 'Seafood modal body verification');
  console.log('[✓ PASSED] Menu Seafood opens Seafood & IQF Processing modal');
  await page.click('#seafood-close');
  await page.waitForTimeout(200);

  // 9. Desal modal via float menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-desal');
  await page.waitForTimeout(300);
  let desalVisible = await page.$eval('#desal-modal', el => el.classList.contains('open'));
  assert.strictEqual(desalVisible, true, 'Desal modal must be open');
  let desalText = await page.textContent('#desal-body');
  assert(desalText.includes('Desalination Core') && desalText.includes('Pure Water Storage Silos'), 'Desal modal body verification');
  console.log('[✓ PASSED] Menu Desal opens Desalination & Silos modal');
  await page.click('#desal-close');
  await page.waitForTimeout(200);

  // 10. Salt modal via float menu
  await page.click('#btn-menu');
  await page.waitForTimeout(200);
  await page.click('#menu-salt');
  await page.waitForTimeout(300);
  let saltVisible = await page.$eval('#salt-modal', el => el.classList.contains('open'));
  assert.strictEqual(saltVisible, true, 'Salt modal must be open');
  let saltText = await page.textContent('#salt-body');
  assert(saltText.includes('Salt Brine Evaporator Beds'), 'Salt modal body verification');
  console.log('[✓ PASSED] Menu Salt opens Salt Brine beds modal');
  await page.click('#salt-close');
  await page.waitForTimeout(200);

  // 11. IslandMap canvas onClick on Vegetable Garden at (0.265, 0.288)
  await page.evaluate(() => {
    islandApi.onClick({
      clientX: islandApi.canvas.getBoundingClientRect().left + islandApi.W * 0.265,
      clientY: islandApi.canvas.getBoundingClientRect().top + islandApi.H * 0.288
    });
  });
  await page.waitForTimeout(300);
  cropVisible = await page.$eval('#crop-modal', el => el.classList.contains('open'));
  assert.strictEqual(cropVisible, true, 'Clicking Vegetable Garden on map opens crop-modal');
  console.log('[✓ PASSED] Map canvas click on Vegetable Garden [509,311] opens crop modal');
  await page.click('#crop-close');
  await page.waitForTimeout(200);

  // 12. IslandMap canvas onClick on Flower Garden at (0.297, 0.448)
  await page.evaluate(() => {
    islandApi.onClick({
      clientX: islandApi.canvas.getBoundingClientRect().left + islandApi.W * 0.297,
      clientY: islandApi.canvas.getBoundingClientRect().top + islandApi.H * 0.448
    });
  });
  await page.waitForTimeout(300);
  flVisible = await page.$eval('#flower-modal', el => el.classList.contains('open'));
  assert.strictEqual(flVisible, true, 'Clicking Flower Garden on map opens flower-modal');
  console.log('[✓ PASSED] Map canvas click on Flower Garden [570,484] opens flower modal');
  await page.click('#flower-close');
  await page.waitForTimeout(200);

  // 13. IslandMap canvas onClick on Farm Garage at (0.367, 0.231)
  await page.evaluate(() => {
    islandApi.onClick({
      clientX: islandApi.canvas.getBoundingClientRect().left + islandApi.W * 0.367,
      clientY: islandApi.canvas.getBoundingClientRect().top + islandApi.H * 0.231
    });
  });
  await page.waitForTimeout(300);
  garVisible = await page.$eval('#garage-modal', el => el.classList.contains('open'));
  assert.strictEqual(garVisible, true, 'Clicking Garage on map opens garage-modal');
  console.log('[✓ PASSED] Map canvas click on Farm Garage [705,250] opens garage modal');
  await page.click('#garage-close');
  await page.waitForTimeout(200);

  // 14. IslandMap canvas onClick on Seafood Facility at (0.447, 0.161)
  await page.evaluate(() => {
    islandApi.onClick({
      clientX: islandApi.canvas.getBoundingClientRect().left + islandApi.W * 0.447,
      clientY: islandApi.canvas.getBoundingClientRect().top + islandApi.H * 0.161
    });
  });
  await page.waitForTimeout(300);
  sfVisible = await page.$eval('#seafood-modal', el => el.classList.contains('open'));
  assert.strictEqual(sfVisible, true, 'Clicking Seafood Facility on map opens seafood-modal');
  console.log('[✓ PASSED] Map canvas click on Seafood Facility [858,174] opens seafood modal');
  await page.click('#seafood-close');
  await page.waitForTimeout(200);

  // 15. IslandMap canvas onClick on Desalination at (0.099, 0.652)
  await page.evaluate(() => {
    islandApi.onClick({
      clientX: islandApi.canvas.getBoundingClientRect().left + islandApi.W * 0.099,
      clientY: islandApi.canvas.getBoundingClientRect().top + islandApi.H * 0.652
    });
  });
  await page.waitForTimeout(300);
  desalVisible = await page.$eval('#desal-modal', el => el.classList.contains('open'));
  assert.strictEqual(desalVisible, true, 'Clicking Desalination on map opens desal-modal');
  console.log('[✓ PASSED] Map canvas click on Desalination Facility [190,704] opens desal modal');
  await page.click('#desal-close');
  await page.waitForTimeout(200);

  // 16. IslandMap canvas onClick on Salt Brines at (0.118, 0.462)
  await page.evaluate(() => {
    islandApi.onClick({
      clientX: islandApi.canvas.getBoundingClientRect().left + islandApi.W * 0.118,
      clientY: islandApi.canvas.getBoundingClientRect().top + islandApi.H * 0.462
    });
  });
  await page.waitForTimeout(300);
  saltVisible = await page.$eval('#salt-modal', el => el.classList.contains('open'));
  assert.strictEqual(saltVisible, true, 'Clicking Salt Brines on map opens salt-modal');
  console.log('[✓ PASSED] Map canvas click on Salt Brines [227,499] opens salt modal');
  await page.click('#salt-close');
  await page.waitForTimeout(200);
  
  assert.strictEqual(pageErrors.length, 0, 'No page errors should occur: ' + JSON.stringify(pageErrors));
  console.log('[✓ PASSED] Zero browser page errors encountered');
  
  await browser.close();
  console.log('====================================================');
  console.log('  ALL BLUE LAB BLUEPRINT & MODAL TESTS PASSED (100%)');
  console.log('====================================================');
})();
