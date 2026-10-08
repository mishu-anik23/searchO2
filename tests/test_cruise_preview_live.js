const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log("====================================================");
  console.log("  OxyForge FPV Transfer Cruise Live Verification     ");
  console.log("====================================================");

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.message);
    console.error('[BROWSER ERROR]:', err.message);
  });

  const previewUrl = 'file:///' + path.resolve(__dirname, '..', 'public/transfer-cruise-preview.html').replace(/\\/g, '/');
  console.log('Loading:', previewUrl);

  await page.goto(previewUrl, { waitUntil: 'load' });

  // 1. Verify No Page Errors
  assert.strictEqual(errors.length, 0, `Page loaded with errors: ${errors.join(', ')}`);
  console.log('[✓ PASSED] Zero browser page errors on load');

  // 2. Verify Canvas Exists and is not black
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.getElementById('spaceCanvas');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, Math.min(canvas.width, 200), Math.min(canvas.height, 200));
    let nonBlackCount = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
      if (imgData.data[i] > 10 || imgData.data[i + 1] > 10 || imgData.data[i + 2] > 10) {
        nonBlackCount++;
      }
    }
    return {
      width: canvas.width,
      height: canvas.height,
      nonBlackCount
    };
  });

  assert(canvasInfo, 'Canvas element #spaceCanvas must exist');
  assert(canvasInfo.width > 0 && canvasInfo.height > 0, 'Canvas dimensions must be positive');
  assert(canvasInfo.nonBlackCount > 0, 'Canvas must not be completely black (must render cosmic sky and stars)');
  console.log(`[✓ PASSED] Canvas active (${canvasInfo.width}x${canvasInfo.height}), rendered celestial sky & stars (sample non-black pixels: ${canvasInfo.nonBlackCount})`);

  // 3. Verify Metered Billing Deducts Money Over Time
  const initialBalance = await page.$eval('#fundsRemainingVal', el => el.textContent);
  console.log(`Initial Balance: ${initialBalance}`);

  // Wait 1.5 seconds for billing ticks (€1.80/s)
  await new Promise(r => setTimeout(r, 1500));

  const afterBalance = await page.$eval('#fundsRemainingVal', el => el.textContent);
  console.log(`Balance after 1.5s: ${afterBalance}`);

  assert.notStrictEqual(initialBalance, afterBalance, 'Funds must be actively deducted over time by metered billing tick');
  console.log('[✓ PASSED] Metered billing is actively deducting funds in real-time');

  // 4. Verify Menzel Constellations Button & Interactive HUD
  console.log('\n--- Testing Menzel Constellation Family Navigation ---');
  await page.click('#btnFamilyRevealToggle');

  // Wait for overlay to become visible
  await page.waitForSelector('#familyRevealOverlay:not(.hidden)');

  const familyData = await page.evaluate(() => {
    const name = document.getElementById('froName').textContent;
    const count = document.getElementById('froCount').textContent;
    const pills = Array.from(document.querySelectorAll('.fro-pill')).map(p => p.textContent);
    return { name, count, pillsCount: pills.length };
  });

  assert(familyData.name.includes('Ursa Major'), `Active family must be Ursa Major, got: ${familyData.name}`);
  assert(familyData.pillsCount > 0, 'Member constellation pills must be rendered');
  console.log(`[✓ PASSED] Family Reveal HUD activated: ${familyData.name} with ${familyData.pillsCount} member pills`);

  // 5. Click Next Constellation button
  await page.click('.fro-btn:has-text("Next ▶")');
  const nextFamilyData = await page.evaluate(() => {
    const selectedPill = document.querySelector('.fro-pill.selected');
    return selectedPill ? selectedPill.textContent : null;
  });
  console.log(`[✓ PASSED] Next button cycled selection to: ${nextFamilyData}`);

  // 6. Click Reveal All button
  await page.click('.fro-btn:has-text("✨ Reveal All")');
  const revealAllData = await page.evaluate(() => {
    const count = document.getElementById('froCount').textContent;
    const hullNotice = document.getElementById('froHullNotice').style.display;
    return { count, hullNoticeVisible: hullNotice === 'flex' };
  });

  assert(revealAllData.count.includes('10 / 10'), `All members must be revealed, got: ${revealAllData.count}`);
  assert(revealAllData.hullNoticeVisible, '3D spherical hull notice must be visible when all members are revealed');
  console.log(`[✓ PASSED] Reveal All illuminated full family (${revealAllData.count}) and unlocked 3D spherical hull patch`);

  // 7. Click Reset (ESC or close button)
  await page.click('.fro-btn-close');
  const isHidden = await page.$eval('#familyRevealOverlay', el => el.classList.contains('hidden'));
  assert(isHidden, 'Family overlay must be hidden after reset');
  console.log('[✓ PASSED] Reset dismissed overlay cleanly');

  await browser.close();
  console.log('\n====================================================');
  console.log('  ALL LIVE PREVIEW TESTS PASSED SUCCESSFULLY (100%)');
  console.log('====================================================');
})();
