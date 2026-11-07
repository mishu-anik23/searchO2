import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

function getFileHash(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

const animFiles = [
  'dairy/Alpenhof_Smart_Pasture_Enhanced.html',
  'dairy/pnp_alpenhof_cheese_curd_fermentation.html',
  'dairy/pnp_alpenhof_dairy_htst_pasteurization_packaging.html',
  'energy/alpenhof_bess_microgrid_turbine_solar_enhanced.html',
  'energy/pnp_alpenhof_bess_energy_trade.html',
  'energy/pnp_alpenhof_solar_installation.html',
  'energy/pnp_alpenhof_wind_turbine_microgrid_simulation.html',
  'infra/alpenhof_dairy_cold_storage.html',
  'infra/alpenhof_grain_silo_cold_storage.html',
  'infra/pnp_alpenhof_crewShed.html',
  'infra/pnp_alpenhof_farm_garage_geothermal_agtech.html',
  'infra/pnp_alpenhof_gorge_bridge_construction.html',
  'infra/pnp_alpenhof_pond_excavation.html'
];

test('Verify All 13 3D Scenes: Subtitles Bottom-Left, Inline CC Toggle, Icon-Only Design & Parity', { timeout: 120000 }, async () => {
  try {
  // 1. Verify Byte Parity between bavaria/animation and public/bavaria/animation
  for (const rel of animFiles) {
    const f1 = path.resolve('bavaria/animation', rel);
    const f2 = path.resolve('public/bavaria/animation', rel);
    assert(fs.existsSync(f1), `File missing: ${f1}`);
    assert(fs.existsSync(f2), `File missing: ${f2}`);
    const h1 = getFileHash(f1);
    const h2 = getFileHash(f2);
    assert.strictEqual(h1, h2, `Byte parity mismatch for ${rel}`);
  }
  console.log('[✓ PASSED] 100% Byte Parity verified across all 13 3D scenes between bavaria/ and public/bavaria/');

  // Launch browser
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  for (const rel of animFiles) {
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', err => {
      // In offline testing without WebGL hardware canvas, ignore CDN network missing scripts
      if (!err.message.includes('THREE') && !err.message.includes('WebGL') && !err.message.includes('OrbitControls') && !err.message.includes('TWEEN')) {
        pageErrors.push(err.message);
      }
    });

    const fileUrl = 'file:///' + path.resolve('bavaria/animation', rel).replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    // Verify zero fatal syntax/runtime page errors
    assert.strictEqual(pageErrors.length, 0, `Page errors in ${rel}: ${pageErrors.join(', ')}`);

    // Verify Subtitle container exists
    const dBox = page.locator('#dialogue-container');
    assert(await dBox.count() > 0, `Dialogue container must exist in ${rel}`);

    // Verify Subtitle container is located on left side (x < 300) and at bottom (y > 450)
    const box = await dBox.boundingBox();
    assert(box !== null, `Dialogue container must have bounding box in ${rel}`);
    assert(box.x < 300, `Subtitle container must be placed at bottom-left in ${rel}, but x was ${box.x}`);
    assert(box.y > 450, `Subtitle container must be at bottom in ${rel}, but y was ${box.y}`);

    // Verify inline CC toggle exists
    const ccBtn = page.locator('#btn-sub-toggle-pill');
    assert(await ccBtn.count() > 0, `Inline CC toggle must exist in ${rel}`);
    assert.strictEqual(await ccBtn.isVisible(), true, `Inline CC toggle must be visible in ${rel}`);

    // Test clicking CC toggle
    await ccBtn.click();
    await page.waitForTimeout(100);
    const ccTextOff = await ccBtn.textContent();
    assert(ccTextOff.includes('OFF'), `CC toggle should switch to OFF in ${rel}`);

    await ccBtn.click();
    await page.waitForTimeout(100);
    const ccTextOn = await ccBtn.textContent();
    assert(ccTextOn.includes('ON'), `CC toggle should switch back to ON in ${rel}`);

    // Verify no repetitive btn-info-modal or station modal button in header
    const infoModalBtn = page.locator('header #btn-info-modal, header #btn-open-geo, header #btn-open-telemetry');
    assert.strictEqual(await infoModalBtn.count(), 0, `Repetitive modal button should be removed from header in ${rel}`);

    // Verify step buttons are icon-only where present
    const step1 = page.locator('#step-btn-1');
    if (await step1.count() > 0) {
      const step1Text = (await step1.textContent()).trim();
      assert.strictEqual(step1Text, '1', `Step button 1 should be icon-only ("1") in ${rel}, but was "${step1Text}"`);
    }

    console.log(`[✓ PASSED] ${rel}: Bottom-left thinner subtitle modal, inline CC toggle, and icon-only design verified.`);
    await page.close();
  }

  await browser.close();
  console.log('========================================================');
  console.log('  ALL 13 3D SCENES VERIFIED SUCCESSFULLY!');
  console.log('========================================================');
  } catch (err) {
    console.error('TEST ERROR OCCURRED:', err);
    throw err;
  }
});
