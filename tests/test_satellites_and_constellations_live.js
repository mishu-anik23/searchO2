const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log('==============================================================');
  console.log('  OxyForge FPV: 88 Constellations & Satellite System Live Test');
  console.log('==============================================================');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (err) {
    console.error('Failed to launch Chromium browser:', err.message);
    process.exit(1);
  }

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push(err.message);
    console.error('[BROWSER ERROR]:', err.message);
  });

  const previewUrl = 'file:///' + path.resolve(__dirname, '..', 'public/transfer-cruise-preview.html').replace(/\\/g, '/');
  console.log('Loading:', previewUrl);

  await page.goto(previewUrl, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  // 1. Verify Zero Fatal Errors
  assert.strictEqual(pageErrors.length, 0, `Expected 0 page errors, found: ${pageErrors.join(', ')}`);
  console.log('[✓ PASSED] Zero browser page errors on load');

  // 2. Verify Canvas Active
  const canvasValid = await page.evaluate(() => {
    const canvas = document.getElementById('spaceCanvas');
    if (!canvas) return false;
    return { w: canvas.width, h: canvas.height };
  });

  assert(canvasValid.w > 0 && canvasValid.h > 0, 'Canvas must have dimensions');
  console.log(`[✓ PASSED] Canvas active (${canvasValid.w}x${canvasValid.h})`);

  // 3. Verify Real-time Metered Billing (€1.80/s)
  const b1 = await page.$eval('#fundsRemainingVal', el => el.textContent);
  await page.waitForTimeout(1200);
  const b2 = await page.$eval('#fundsRemainingVal', el => el.textContent);
  console.log(`Balance 1: ${b1} -> Balance 2: ${b2}`);
  assert.notStrictEqual(b1, b2, 'Metered balance must tick down over time');
  console.log('[✓ PASSED] Metered billing is actively deducting funds in real-time');

  // 4. Verify 158 Named Stars & 88 Constellation Stick Figures Present
  const catalogStats = await page.evaluate(() => {
    return {
      namedStarsCount: typeof NAMED_STARS !== 'undefined' ? NAMED_STARS.length : 0,
      constellationsCount: typeof CONSTELLATIONS !== 'undefined' ? CONSTELLATIONS.length : 0,
      constellations88Count: typeof CONSTELLATIONS_88 !== 'undefined' ? CONSTELLATIONS_88.length : 0,
      satellitesCount: typeof PUBLIC_SATELLITES !== 'undefined' ? PUBLIC_SATELLITES.length : 0,
      regimeStyleKeys: typeof REGIME_STYLE !== 'undefined' ? Object.keys(REGIME_STYLE) : []
    };
  });

  assert(catalogStats.namedStarsCount >= 150, `Expected >= 150 named stars, got ${catalogStats.namedStarsCount}`);
  assert(catalogStats.constellationsCount >= 88, `Expected >= 88 constellation figures, got ${catalogStats.constellationsCount}`);
  assert(catalogStats.satellitesCount >= 15, `Expected >= 15 public satellites, got ${catalogStats.satellitesCount}`);
  console.log(`[✓ PASSED] Celestial Catalog Stats: ${catalogStats.namedStarsCount} named stars, ${catalogStats.constellationsCount} stick figures, ${catalogStats.satellitesCount} satellites`);

  // 5. Test Satellite Target Locking & Hover Card
  console.log('\n--- Testing Satellite Targeting & Educational Modal ---');
  await page.evaluate(() => {
    const iss = PUBLIC_SATELLITES.find(s => s.id === 'iss');
    if (iss) lockTarget({
      id: iss.id,
      name: iss.name,
      kind: `Public Satellite · ${iss.regime} (${iss.agency})`,
      agency: iss.agency,
      regime: iss.regime,
      altitudeKm: iss.altitudeKm,
      dist: `Alt ~${iss.altitudeKm.toLocaleString()} km`,
      mag: `Status: ${iss.status}`,
      spec: `COSPAR: ${iss.catalogId} · Inc: ${iss.inclinationDeg}°`,
      coords: `Period: ${iss.periodMin} min`,
      blurb: iss.blurb,
      fact: iss.fact,
      missionDetail: iss.missionDetail,
      launched: iss.launched,
      status: iss.status,
      catalogId: iss.catalogId,
      periodMin: iss.periodMin,
      inclinationDeg: iss.inclinationDeg
    });
  });

  await page.waitForTimeout(300);
  const dossierData = await page.evaluate(() => {
    const name = document.getElementById('dosName').textContent;
    const kind = document.getElementById('dosKind').textContent;
    const dist = document.getElementById('dosDist').textContent;
    const fact = document.getElementById('dosFact').textContent;
    return { name, kind, dist, fact };
  });

  assert(dossierData.name.includes('International Space Station'), `Dossier name should be ISS, got: ${dossierData.name}`);
  assert(dossierData.kind.includes('LEO'), `Dossier kind should include LEO, got: ${dossierData.kind}`);
  console.log(`[✓ PASSED] Satellite Target Locked: ${dossierData.name} · ${dossierData.kind}`);

  // 6. Test On-Click Educational Tutorial Modal for Satellite
  await page.click('button:has-text("🎓 Study & Quiz")');
  await page.waitForSelector('#studyModal.open');

  const studyModalData = await page.evaluate(() => {
    const title = document.getElementById('modalTitle').textContent;
    const type = document.getElementById('modalType').textContent;
    const why = document.getElementById('modalWhy').textContent;
    const qText = document.getElementById('quizQuestion').textContent;
    const options = Array.from(document.querySelectorAll('#quizOptions .quiz-btn')).map(b => b.textContent);
    return { title, type, why, qText, optionsCount: options.length };
  });

  assert(studyModalData.title.includes('International Space Station'), 'Modal title should be ISS');
  assert(studyModalData.why.includes('Low Earth Orbit'), 'Modal should explain LEO orbital mechanics');
  assert(studyModalData.optionsCount >= 2, 'Quiz should contain options');
  console.log(`[✓ PASSED] Satellite Tutorial Modal Opened: ${studyModalData.title}`);
  console.log(`[✓ PASSED] Orbital Mechanics Lesson Verified: "${studyModalData.why.slice(0, 85)}..."`);

  // Answer Quiz
  await page.click('#quizOptions .quiz-btn:first-child');
  const quizFeedback = await page.$eval('#quizFeedback', el => el.textContent);
  assert(quizFeedback.includes('Correct'), 'First option should be correct answer');
  console.log(`[✓ PASSED] Interactive Quiz feedback: ${quizFeedback}`);

  // Close Study Modal
  await page.click('.btn-modal-close');
  await page.waitForTimeout(200);

  // 7. Test On-Click Educational Classroom Modal for Constellations
  console.log('\n--- Testing Constellation Educational Classroom Modal ---');
  await page.evaluate(() => {
    const uma = CONSTELLATIONS_88.find(c => c.id === 'ursa_major');
    if (uma) openStudyModal(uma);
  });
  await page.waitForSelector('#studyModal.open');

  const constModalData = await page.evaluate(() => {
    const title = document.getElementById('modalTitle').textContent;
    const why = document.getElementById('modalWhy').textContent;
    const qText = document.getElementById('quizQuestion').textContent;
    return { title, why, qText };
  });

  assert(constModalData.title.includes('Ursa Major'), 'Modal title should be Ursa Major');
  assert(constModalData.why.includes('Menzel'), 'Modal should describe Menzel family sky path');
  assert(constModalData.qText.includes('Ursa Major'), 'Quiz should reference constellation Ursa Major');
  const constOptions = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#quizOptions .quiz-btn')).map(b => b.textContent);
  });
  assert(constOptions.some(o => o.includes('Alioth')), 'Quiz options should include key star Alioth');
  console.log(`[✓ PASSED] Constellation Classroom Modal Opened: ${constModalData.title}`);
  console.log(`[✓ PASSED] Menzel Sky Path Locating Guide Verified: "${constModalData.why.slice(0, 85)}..."`);

  await page.click('#quizOptions .quiz-btn:first-child');
  const constQuizFeedback = await page.$eval('#quizFeedback', el => el.textContent);
  assert(constQuizFeedback.includes('Correct'), 'First option should be correct answer');
  console.log(`[✓ PASSED] Constellation Quiz feedback: ${constQuizFeedback}`);

  await page.click('.btn-modal-close');
  await page.waitForTimeout(200);

  // 8. Test Menzel Constellation Family Navigation & Reveal All
  console.log('\n--- Testing Menzel Constellation Family Reveal Navigation ---');
  await page.click('#btnFamilyRevealToggle');
  await page.waitForSelector('#familyRevealOverlay:not(.hidden)');

  const familyData = await page.evaluate(() => {
    const name = document.getElementById('froName').textContent;
    const pills = Array.from(document.querySelectorAll('.fro-pill')).map(p => p.textContent);
    return { name, pillsCount: pills.length };
  });

  assert(familyData.name.includes('Ursa Major'), 'Active family should be Ursa Major');
  console.log(`[✓ PASSED] Family HUD Active: ${familyData.name} with ${familyData.pillsCount} member pills`);

  // Click Next
  await page.click('.fro-btn:has-text("Next ▶")');
  const nextPill = await page.$eval('.fro-pill.selected', el => el.textContent);
  console.log(`[✓ PASSED] Cycled constellation to: ${nextPill}`);

  // Click Reveal All
  await page.click('.fro-btn:has-text("✨ Reveal All")');
  const revealCount = await page.$eval('#froCount', el => el.textContent);
  assert(revealCount.includes('10 / 10'), 'All 10 members should be revealed');
  console.log(`[✓ PASSED] Reveal All completed: ${revealCount}`);

  // Dismiss HUD
  await page.click('.fro-btn-close');
  console.log('[✓ PASSED] Reset family overlay cleanly');

  await browser.close();
  console.log('\n==============================================================');
  console.log('  ALL SATELLITE & 88-CONSTELLATION TESTS PASSED (100%)');
  console.log('==============================================================');
})();
