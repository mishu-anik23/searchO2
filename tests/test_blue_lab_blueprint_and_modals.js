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

  // 3. Seafood modal via float menu
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

  // 4. Desal modal via float menu
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

  // 5. Salt modal via float menu
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

  // 6. IslandMap canvas onClick triggers (simulate click on seafood_hub at 0.625, 0.444)
  await page.evaluate(() => {
    islandApi.onClick({
      clientX: islandApi.canvas.getBoundingClientRect().left + islandApi.W * 0.625,
      clientY: islandApi.canvas.getBoundingClientRect().top + islandApi.H * 0.444
    });
  });
  await page.waitForTimeout(300);
  sfVisible = await page.$eval('#seafood-modal', el => el.classList.contains('open'));
  assert.strictEqual(sfVisible, true, 'Clicking Seafood Hub on map opens seafood-modal');
  console.log('[✓ PASSED] Map canvas click on Seafood Hub [1200,480] opens seafood modal');
  await page.click('#seafood-close');
  await page.waitForTimeout(200);

  // 7. IslandMap canvas onClick on Desal Intake at 0.292, 0.435
  await page.evaluate(() => {
    islandApi.onClick({
      clientX: islandApi.canvas.getBoundingClientRect().left + islandApi.W * 0.292,
      clientY: islandApi.canvas.getBoundingClientRect().top + islandApi.H * 0.435
    });
  });
  await page.waitForTimeout(300);
  desalVisible = await page.$eval('#desal-modal', el => el.classList.contains('open'));
  assert.strictEqual(desalVisible, true, 'Clicking Desal intake on map opens desal-modal');
  console.log('[✓ PASSED] Map canvas click on Desal Intake [560,470] opens desal modal');
  await page.click('#desal-close');
  await page.waitForTimeout(200);

  // 8. IslandMap canvas onClick on Salt Brines at 0.104, 0.444
  await page.evaluate(() => {
    islandApi.onClick({
      clientX: islandApi.canvas.getBoundingClientRect().left + islandApi.W * 0.104,
      clientY: islandApi.canvas.getBoundingClientRect().top + islandApi.H * 0.444
    });
  });
  await page.waitForTimeout(300);
  saltVisible = await page.$eval('#salt-modal', el => el.classList.contains('open'));
  assert.strictEqual(saltVisible, true, 'Clicking Salt Brines on map opens salt-modal');
  console.log('[✓ PASSED] Map canvas click on Salt Brines [200,480] opens salt modal');
  await page.click('#salt-close');
  await page.waitForTimeout(200);
  
  assert.strictEqual(pageErrors.length, 0, 'No page errors should occur: ' + JSON.stringify(pageErrors));
  console.log('[✓ PASSED] Zero browser page errors encountered');
  
  await browser.close();
  console.log('====================================================');
  console.log('  ALL BLUE LAB BLUEPRINT & MODAL TESTS PASSED (100%)');
  console.log('====================================================');
})();
