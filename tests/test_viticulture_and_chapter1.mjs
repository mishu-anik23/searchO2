import { chromium } from 'playwright';
import path from 'path';

async function runTests() {
  console.log('Launching browser for Viticulture & Chapter 1 verification...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => {
    if (!err.message.includes('SpeechSynthesis') && !err.message.includes('THREE')) {
      console.error('Page error:', err.message);
      errors.push(err.message);
    }
  });

  // 1. Viticulture 3D scene
  console.log('--- Testing Viticulture 3D Scene ---');
  const viticultureUrl = 'file:///' + path.resolve('bavaria/animation/viticulture/pnp_alpenhof_bavarian_viticulture_terroir.html').replace(/\\/g, '/');
  console.log('Navigating to:', viticultureUrl);
  await page.goto(viticultureUrl, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(e => console.log('Load event timeout, continuing:', e.message));
  await page.waitForTimeout(1000);

  const returnBtn = await page.$('#archive-home-link');
  if (!returnBtn) throw new Error('#archive-home-link not found');
  const returnBox = await returnBtn.boundingBox();
  console.log('Return button position:', returnBox);
  if (returnBox.x < 300) throw new Error('Return button is overlapping top-left!');

  const subContainer = await page.$('#subtitles-container');
  if (!subContainer) throw new Error('#subtitles-container not found');

  const inlineCc = await page.$('#btn-sub-toggle-pill');
  if (!inlineCc) throw new Error('#btn-sub-toggle-pill not found');
  const ccText = await inlineCc.textContent();
  console.log('CC text:', ccText.trim());
  if (!ccText.includes('CC ON')) throw new Error('CC toggle default is not ON');

  // Toggle CC
  await inlineCc.click();
  const ccOffText = await inlineCc.textContent();
  console.log('CC text after toggle:', ccOffText.trim());
  if (!ccOffText.includes('CC OFF')) throw new Error('CC toggle did not turn OFF');

  // Toggle back ON via top-bar CC button
  await page.click('#toggle-subtitles-btn');

  const drainageBtn = await page.$('.nav-dock-btn[data-action="cam-drainage"]');
  if (!drainageBtn) throw new Error('Drainage button not found');
  await drainageBtn.click();
  await page.waitForTimeout(600);

  const sceneTagText = await page.$eval('#subtitle-scene-tag', el => el.textContent);
  console.log('Scene tag text:', sceneTagText);
  if (!sceneTagText.includes('Hill Slope Hydrology')) throw new Error('Did not switch to Hill Slope Hydrology');

  const hasReturnFn = await page.evaluate(() => typeof window.returnToResearchLab === 'function');
  console.log('Has returnToResearchLab function:', hasReturnFn);
  if (!hasReturnFn) throw new Error('returnToResearchLab function not found');

  // 2. Knowledge Lab
  console.log('--- Testing Knowledge Lab ---');
  const labUrl = 'file:///' + path.resolve('bavaria/knowledge_lab.html').replace(/\\/g, '/');
  await page.goto(labUrl, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(e => console.log('Load event timeout, continuing:', e.message));
  await page.waitForTimeout(1000);

  const moduleCount = await page.evaluate(() => LAB_MODULES.length);
  console.log('Total modules in LAB_MODULES:', moduleCount);
  if (moduleCount !== 14) throw new Error(`Expected 14 modules, got ${moduleCount}`);

  const hasLukas = await page.evaluate(() => !!LAB_PEOPLE['Lukas Gruber']);
  console.log('Has Lukas Gruber in LAB_PEOPLE:', hasLukas);
  if (!hasLukas) throw new Error('Lukas Gruber not found in LAB_PEOPLE');

  // 3. Alpenhof simulation: Plot 1 unlock, locked plots, trade buttons, and Chapter 1 concept modal
  console.log('--- Testing Alpenhof Game & Chapter 1 Unlocks ---');
  const alpenhofUrl = 'file:///' + path.resolve('bavaria/alpenhof.html').replace(/\\/g, '/');
  await page.goto(alpenhofUrl, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(e => console.log('Load event timeout, continuing:', e.message));
  await page.waitForTimeout(1000);

  // Check plot unlocking status
  const p1 = await page.evaluate(() => isPlotUnlocked('o1'));
  const p2 = await page.evaluate(() => isPlotUnlocked('o2'));
  const p3 = await page.evaluate(() => isPlotUnlocked('o3'));
  console.log('Plot 1 unlocked:', p1, '| Plot 2 unlocked:', p2, '| Plot 3 unlocked:', p3);
  if (!p1) throw new Error('Plot 1 should be unlocked in Chapter 1');
  if (p2 || p3) throw new Error('Plot 2 and 3 must be locked in Chapter 1');

  // Check HUD icon buttons
  const economyBtn = await page.$('#economyHudBtn');
  const visitorBtn = await page.$('#visitorHudBtn');
  if (!economyBtn || !visitorBtn) throw new Error('Icon HUD buttons missing');
  console.log('Economy and Trade HUD icon buttons present and clean');

  // Test opening Plot 2 -> triggers explainLockedPlot
  await page.evaluate(() => openSiteById('o2'));
  await page.waitForTimeout(300);
  const modalText = await page.$eval('.modal-hdr h3', el => el.textContent);
  console.log('Locked plot modal title:', modalText);
  if (!modalText.includes('Plot 2 Shrouded in Mountain Mist')) throw new Error('Locked plot modal not triggered');
  await page.evaluate(() => closeModal());

  // Test Chapter 1 Concept Presentation Modal
  await page.evaluate(() => openChapter1ConceptModal(0));
  await page.waitForTimeout(400);
  const conceptTitle = await page.$eval('.modal-hdr h3', el => el.textContent);
  console.log('Chapter 1 concept modal title:', conceptTitle);
  if (!conceptTitle.includes('Chapter 1 Journey Guide')) throw new Error('Chapter 1 Concept modal title mismatch');

  await browser.close();

  if (errors.length > 0) {
    throw new Error('Errors encountered: ' + errors.join(', '));
  }

  console.log('All tests passed successfully with 0 errors!');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
