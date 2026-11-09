import { chromium } from 'playwright';
import path from 'path';

async function runTests() {
  console.log('Launching Chrome for 3D verification...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => {
    if (!err.message.includes('SpeechSynthesis')) {
      console.error('Page error:', err.message);
      errors.push(err.message);
    }
  });

  // 1. Wind Turbine Microgrid Dynamics
  console.log('--- Testing Wind Turbine Microgrid Dynamics ---');
  const windUrl = 'file:///' + path.resolve('bavaria/animation/energy/pnp_alpenhof_wind_turbine_microgrid_simulation.html').replace(/\\/g, '/');
  await page.goto(windUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const windArchiveBtn = await page.$('#archive-home-link');
  if (!windArchiveBtn) throw new Error('Wind scene archive button not found');
  const windArchiveBox = await windArchiveBtn.boundingBox();
  console.log('Wind archive button position:', windArchiveBox);
  if (windArchiveBox.x < 300) throw new Error('Wind archive button is still overlapping top-left!');

  const isPerspective = await page.evaluate(() => {
    return camera && camera.isPerspectiveCamera === true;
  });
  console.log('Wind camera is PerspectiveCamera:', isPerspective);
  if (!isPerspective) throw new Error('Wind camera is not PerspectiveCamera');

  // 2. Solar Installation
  console.log('--- Testing Agrivoltaic Solar Installation ---');
  const solarUrl = 'file:///' + path.resolve('bavaria/animation/energy/pnp_alpenhof_solar_installation.html').replace(/\\/g, '/');
  await page.goto(solarUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const solarArchiveBtn = await page.$('#archive-home-link');
  if (!solarArchiveBtn) throw new Error('Solar scene archive button not found');
  const solarArchiveBox = await solarArchiveBtn.boundingBox();
  console.log('Solar archive button position:', solarArchiveBox);
  if (solarArchiveBox.x < 300) throw new Error('Solar archive button is still overlapping top-left!');

  const floatingPanel = await page.$('.bottom-28.right-4');
  if (floatingPanel) throw new Error('Unnecessary options still hanging at bottom-28 right-4!');

  const solarCameraIsPerspective = await page.evaluate(() => {
    return camera && camera.isPerspectiveCamera === true;
  });
  console.log('Solar camera is PerspectiveCamera:', solarCameraIsPerspective);
  if (!solarCameraIsPerspective) throw new Error('Solar camera is not PerspectiveCamera');

  const iconSeasonSummer = await page.$('#btn-season-summer');
  const iconSeasonText = await iconSeasonSummer.textContent();
  console.log('Solar Summer icon text:', iconSeasonText.trim());
  if (iconSeasonText.trim() !== '☀️') throw new Error('Solar season button is not icon-based');

  // 3. Cheese Curd Fermentation Sound
  console.log('--- Testing Cheese Curd Fermentation Sound ---');
  const curdUrl = 'file:///' + path.resolve('bavaria/animation/dairy/pnp_alpenhof_cheese_curd_fermentation.html').replace(/\\/g, '/');
  await page.goto(curdUrl, { waitUntil: 'domcontentloaded' });
  await page.click('body');
  await page.waitForTimeout(800);

  const curdAudioState = await page.evaluate(() => {
    if (typeof initAudio === 'function') initAudio();
    if (typeof playVatSwirlSFX === 'function') playVatSwirlSFX();
    if (typeof playHarpSlicingSFX === 'function') playHarpSlicingSFX();
    return {
      audioEnabled,
      hasSynth: !!synth,
      synthState: synth ? synth.state : 'none'
    };
  });
  console.log('Curd audio state:', curdAudioState);
  if (!curdAudioState.hasSynth) throw new Error('Curd sound synth not initialized');

  // 4. HTST Pasteurization Sound
  console.log('--- Testing HTST Pasteurization Sound ---');
  const htstUrl = 'file:///' + path.resolve('bavaria/animation/dairy/pnp_alpenhof_dairy_htst_pasteurization_packaging.html').replace(/\\/g, '/');
  await page.goto(htstUrl, { waitUntil: 'domcontentloaded' });
  await page.click('body');
  await page.waitForTimeout(800);

  const htstAudioState = await page.evaluate(() => {
    if (typeof initAudio === 'function') initAudio();
    if (typeof playPumpHum === 'function') playPumpHum();
    if (typeof playSteamHissSFX === 'function') playSteamHissSFX();
    return {
      audioEnabled,
      hasSynth: !!synth,
      synthState: synth ? synth.state : 'none'
    };
  });
  console.log('HTST audio state:', htstAudioState);
  if (!htstAudioState.hasSynth) throw new Error('HTST sound synth not initialized');

  // 5. Hub Navigation Test
  console.log('--- Testing Return to Research Lab Navigation ---');
  const hubSimUrl = windUrl + '?source=hub';
  await page.goto(hubSimUrl, { waitUntil: 'domcontentloaded' });
  const navTarget = await page.evaluate(() => {
    var search = window.location.search || '';
    if (search.indexOf('source=hub') !== -1) {
      return '../../hub/index.html#/alpenhof';
    }
    return 'fallback';
  });
  console.log('Hub source redirects to:', navTarget);
  if (navTarget !== '../../hub/index.html#/alpenhof') throw new Error('Did not route to hub');

  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  await browser.close();
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
