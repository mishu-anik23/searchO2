import { chromium } from 'playwright';
import path from 'path';

async function runTests() {
  console.log('Launching browser for Blue Lab integration test...');
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

  // 1. Test Hub page - Saint Martin / Blue Lab Route
  console.log('--- Testing Hub Page: Saint Martin & Blue Lab ---');
  const hubUrl = 'file:///' + path.resolve('hub/index.html').replace(/\\/g, '/') + '#/saint-martin';
  console.log('Navigating to:', hubUrl);
  await page.goto(hubUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(800);

  // Check Regional Bar
  const isSaintMartinActive = await page.$eval('#regLinkSaintMartin', el => el.classList.contains('active'));
  console.log('Is Saint Martin active in Regional Bar:', isSaintMartinActive);
  if (!isSaintMartinActive) throw new Error('Saint Martin link not active in Regional Bar');

  const actionBtnText = await page.$eval('#regActionLabel', el => el.textContent.trim());
  console.log('Regional action button text:', actionBtnText);
  if (!actionBtnText.includes('Play Blue Lab 3D')) throw new Error('Action button does not say Play Blue Lab 3D');

  // Check Blue Lab Hero and Character Cards
  const heroTitle = await page.$eval('.alp-hero h1', el => el.textContent.trim());
  console.log('Hero Title:', heroTitle);
  if (!heroTitle.includes('SearchO2 Blue Lab')) throw new Error('Hero title mismatch');

  const charCount = await page.$$eval('.alp-char-card', els => els.length);
  console.log('Character count in Blue Lab roster:', charCount);
  if (charCount < 7) throw new Error(`Expected at least 7 animal characters, got ${charCount}`);

  // Check Tariq the Fishing Cat
  const tariqFound = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.alp-char-card h3')).some(h => h.textContent.includes('Tariq the Fishing Cat'));
  });
  console.log('Has Tariq the Fishing Cat:', tariqFound);
  if (!tariqFound) throw new Error('Tariq the Fishing Cat not found in roster');

  // Check 10 Research Simulations
  const simCardsCount = await page.$$eval('#blSceneGrid .alp-scene-card', els => els.length);
  console.log('Total simulation cards in gallery:', simCardsCount);
  if (simCardsCount !== 10) throw new Error(`Expected 10 simulation cards, got ${simCardsCount}`);

  // Test Category Filtering
  console.log('Testing category filter: Energy & Microgrid...');
  await page.click('#blSceneFilters [data-cat="energy"]');
  await page.waitForTimeout(300);
  const visibleEnergy = await page.$$eval('#blSceneGrid .alp-scene-card', els => els.filter(el => el.style.display !== 'none').length);
  console.log('Visible energy cards:', visibleEnergy);
  if (visibleEnergy !== 2) throw new Error(`Expected 2 energy cards, got ${visibleEnergy}`);

  console.log('Testing category filter: All...');
  await page.click('#blSceneFilters [data-cat="all"]');
  await page.waitForTimeout(300);
  const visibleAll = await page.$$eval('#blSceneGrid .alp-scene-card', els => els.filter(el => el.style.display !== 'none').length);
  console.log('Visible all cards:', visibleAll);
  if (visibleAll !== 10) throw new Error(`Expected 10 all cards, got ${visibleAll}`);

  // 2. Test 3D Research Simulation: CNG field progression
  console.log('--- Testing 3D Simulation: Seashore CNG Field ---');
  const cngUrl = 'file:///' + path.resolve('saint-martin/research/so2bl_cng_field_progression.html').replace(/\\/g, '/');
  await page.goto(cngUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(600);

  const archiveBtn = await page.$('#archive-home-link');
  if (!archiveBtn) throw new Error('#archive-home-link not found in CNG simulation');
  console.log('CNG simulation archive return button verified');

  const hasReturnFn = await page.evaluate(() => typeof window.returnToBlueLab === 'function');
  console.log('CNG simulation has returnToBlueLab function:', hasReturnFn);
  if (!hasReturnFn) throw new Error('returnToBlueLab not found in CNG simulation');

  // 3. Test In-Game Blue Lab: Dynamic HUD & Chapter Progression
  console.log('--- Testing In-Game Blue Lab (blue-lab.html) ---');
  const blueLabUrl = 'file:///' + path.resolve('saint-martin/blue-lab.html').replace(/\\/g, '/');
  await page.goto(blueLabUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(1000);

  // Check Research HQ Button
  const researchBtn = await page.$('#btn-blue-research');
  if (!researchBtn) throw new Error('#btn-blue-research not found in HUD');
  console.log('Research HQ HUD button present');

  // Test opening Research HQ Modal
  await page.evaluate(() => openBlueLabResearchModal());
  await page.waitForTimeout(400);
  const researchModalOpen = await page.$eval('#blue-research-modal', el => el.classList.contains('open'));
  console.log('Research HQ modal open:', researchModalOpen);
  if (!researchModalOpen) throw new Error('Research HQ modal failed to open');
  await page.evaluate(() => document.getElementById('blue-research-modal').classList.remove('open'));

  // Test Dynamic Task HUD initial state (Chapter 1)
  const initialCh = await page.evaluate(() => state.currentChapter);
  console.log('Initial chapter:', initialCh);
  if (initialCh !== 1) throw new Error('Initial chapter should be 1');

  const taskTxt = await page.$eval('#task-txt', el => el.textContent.trim());
  console.log('Task capsule text:', taskTxt);
  if (!taskTxt.includes('Ch. 1')) throw new Error('Task capsule does not indicate Chapter 1');

  // Complete sub-challenges 1.1, 1.2, 1.3
  console.log('Simulating sub-challenge completions...');
  await page.evaluate(() => {
    completeTask('1.1');
    completeTask('1.2');
    completeTask('1.3');
  });
  await page.waitForTimeout(300);

  const taskTxtAfter = await page.$eval('#task-txt', el => el.textContent.trim());
  console.log('Task capsule text after sub-challenges:', taskTxtAfter);
  if (!taskTxtAfter.includes('100%')) throw new Error('Task capsule does not show 100% after all 3 completed');

  // Open Task HUD and verify Claim Button
  await page.evaluate(() => toggleTaskHud());
  await page.waitForTimeout(300);
  const claimBtnText = await page.$eval('#task-hud-claim', el => el.textContent.trim());
  console.log('Claim button text:', claimBtnText);
  if (!claimBtnText.includes('Claim Chapter 1 Reward')) throw new Error('Claim button does not prompt claiming Chapter 1 reward');

  // Claim Chapter Reward & Advance to Chapter 2
  console.log('Claiming Chapter 1 Reward...');
  await page.evaluate(() => claimChapterReward());
  await page.waitForTimeout(400);

  const nextCh = await page.evaluate(() => state.currentChapter);
  console.log('Advanced to chapter:', nextCh);
  if (nextCh !== 2) throw new Error(`Expected currentChapter to advance to 2, got ${nextCh}`);

  const taskTxtCh2 = await page.$eval('#task-txt', el => el.textContent.trim());
  console.log('Task capsule text in Chapter 2:', taskTxtCh2);
  if (!taskTxtCh2.includes('Ch. 2')) throw new Error('Task capsule did not dynamically update to Chapter 2');

  await browser.close();

  if (errors.length > 0) {
    throw new Error('Errors encountered: ' + errors.join(', '));
  }

  console.log('All Blue Lab integration and dynamic HUD tests passed successfully with 0 errors!');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
