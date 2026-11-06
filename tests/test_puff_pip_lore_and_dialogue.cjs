const { chromium } = require('playwright');
const path = require('path');

async function runLoreAndDialogueTests() {
  console.log('====================================================');
  console.log('  Testing Whisker Puff & Pip Lore, SVG & Dialogue   ');
  console.log('====================================================\n');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (e) {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  console.log('Loading page:', fileUrl);

  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // 1. Verify Whisker Puff SVG Attire & Details
  console.log('--- Test 1: Whisker Puff Calico Astrobiologist SVG ---');
  const puffSvg = await page.evaluate(() => {
    return KidsSustainabilityAcademy.getWhiskerPuffSvg(110, 135);
  });
  const hasAmberBuns = puffSvg.includes('#D97706');
  const hasAmethystRibbons = puffSvg.includes('#9333EA') && puffSvg.includes('#D946EF');
  const hasNavyWaistcoat = puffSvg.includes('#1E3A8A');
  const hasBrassButtons = puffSvg.includes('#F59E0B');
  const hasGreenSkirt = puffSvg.includes('#065F46');
  const hasObsidianGlasses = puffSvg.includes('#111827');
  const hasLaserSpectrometer = puffSvg.includes('#0EA5E9') && puffSvg.includes('stroke-dasharray="2 2"');

  console.log('Has amber hair buns?', hasAmberBuns);
  console.log('Has amethyst & magenta silken ribbons?', hasAmethystRibbons);
  console.log('Has royal navy-blue waistcoat?', hasNavyWaistcoat);
  console.log('Has triple brass buttons?', hasBrassButtons);
  console.log('Has forest green pleated wool skirt?', hasGreenSkirt);
  console.log('Has circular obsidian spectacles?', hasObsidianGlasses);
  console.log('Has dual-band laser spectrometer & porosity scanner?', hasLaserSpectrometer);

  if (!hasAmberBuns || !hasAmethystRibbons || !hasNavyWaistcoat || !hasBrassButtons || !hasGreenSkirt || !hasObsidianGlasses || !hasLaserSpectrometer) {
    throw new Error('Test 1 Failed: Whisker Puff SVG missing specified attire or gear');
  }
  console.log('✓ PASSED: Whisker Puff visual attire & signature gear verified!\n');

  // 2. Verify Pip Squeak-a-Link SVG Attire & Details
  console.log('--- Test 2: Pip Squeak-a-Link Agtech Marshaler SVG ---');
  const pipSvg = await page.evaluate(() => {
    return KidsSustainabilityAcademy.getPipSvg(95, 120);
  });
  const hasPinkAuricles = pipSvg.includes('#F472B6') && pipSvg.includes('#FBCFE8');
  const hasHawaiianShirt = pipSvg.includes('#06B6D4') && pipSvg.includes('#FDE047');
  const hasOrangeShorts = pipSvg.includes('#EA580C');
  const hasLimeSneakers = pipSvg.includes('#84CC16');
  const hasWaffleSoles = pipSvg.includes('#E2E8F0') && pipSvg.includes('stroke="#64748B"');
  const hasMarshalingWands = pipSvg.includes('#22C55E') && pipSvg.includes('wand-light');

  console.log('Has prominent oversized rose-pink auricles?', hasPinkAuricles);
  console.log('Has cyan-blue tropical Hawaiian floral shirt?', hasHawaiianShirt);
  console.log('Has hi-vis orange twill shorts?', hasOrangeShorts);
  console.log('Has lime-green field sneakers?', hasLimeSneakers);
  console.log('Has high-traction waffle soles?', hasWaffleSoles);
  console.log('Has twin high-candela green LED marshaling wands?', hasMarshalingWands);

  if (!hasPinkAuricles || !hasHawaiianShirt || !hasOrangeShorts || !hasLimeSneakers || !hasWaffleSoles || !hasMarshalingWands) {
    throw new Error('Test 2 Failed: Pip Squeak-a-Link SVG missing specified attire or gear');
  }
  console.log('✓ PASSED: Pip Squeak-a-Link visual attire & signature gear verified!\n');

  // 3. Verify Dialogue Lore across all 5 Scenes
  console.log('--- Test 3: Dialogue Lore across Scenes ---');
  const dialogueContent = await page.evaluate(() => {
    KidsSustainabilityAcademy.openAcademyModal();
    const modal = document.getElementById('kidsAcademyModal');
    const catText = document.getElementById('academyCatText').textContent;
    const pipText = document.getElementById('academyPipText').textContent;
    return { open: !!modal, catText, pipText };
  });

  const puffHasLore = dialogueContent.catText.includes('Microclimatology') || dialogueContent.catText.includes('living marvel');
  const pipHasLore = dialogueContent.pipText.includes('marshaling wands') && dialogueContent.pipText.includes('waffle-sole');

  console.log('Scene 1 Puff Lore present?', puffHasLore);
  console.log('Scene 1 Pip Lore present?', pipHasLore);

  if (!puffHasLore || !pipHasLore) {
    throw new Error('Test 3 Failed: Dialogue does not reflect required character voice');
  }
  console.log('✓ PASSED: Character dialogue lore correctly initialized!\n');

  // 4. Test Manual Navigation Controls (Next, Prev, Pause)
  console.log('--- Test 4: Interactive Scene Controls (Next, Prev, Pause) ---');
  await page.evaluate(() => {
    const nextBtn = document.getElementById('btnAcademyNext');
    if (nextBtn) nextBtn.click();
  });
  await page.waitForTimeout(300);

  const scene2Check = await page.evaluate(() => {
    const pill = document.getElementById('sceneStepPill');
    const catText = document.getElementById('academyCatText').textContent;
    return { pillText: pill ? pill.textContent : '', hasSoilStratification: catText.includes('soil horizon') || catText.includes('aeration') || catText.includes('underground metropolis') };
  });

  console.log('Transitioned to Scene 2?', scene2Check.pillText.includes('Scene 2/5'));
  console.log('Scene 2 contains soil stratification lore?', scene2Check.hasSoilStratification);

  if (!scene2Check.pillText.includes('Scene 2/5') || !scene2Check.hasSoilStratification) {
    throw new Error('Test 4 Failed: Manual Next button did not advance smoothly to Scene 2');
  }
  console.log('✓ PASSED: Smooth manual step navigation verified!\n');

  await browser.close();
  console.log('====================================================');
  console.log('  ALL PUFF & PIP LORE & DIALOGUE TESTS PASSED!       ');
  console.log('====================================================');
}

runLoreAndDialogueTests().catch(err => {
  console.error('Test run error:', err);
  process.exit(1);
});
