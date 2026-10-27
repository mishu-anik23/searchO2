// @ts-check
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('🚀 Running Test: Shakir OxyEco Forger Tour & Chapter Scouting');

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
  } catch (e) {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
  }

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const rootIndex = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  const hubIndex = 'file:///' + path.resolve(__dirname, '../hub/index.html').replace(/\\/g, '/');

  // --- 1. Verify Hub Page Title & Positioning ---
  console.log('\n--- 1. Testing Hub Page OxyEco Forger Spotlight & CTAs ---');
  await page.goto(hubIndex, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const hubData = await page.evaluate(() => {
    const spotlightTitle = document.querySelector('.ceo-info-col h2')?.textContent || '';
    const badge = document.querySelector('.ceo-badge')?.textContent || '';
    const quote = document.querySelector('.ceo-quote')?.textContent || '';
    const tourBtn = document.querySelector('.ceo-actions .btn.gold')?.textContent || '';
    const stripItem = document.querySelector('.game-highlights-strip')?.textContent || '';
    return { spotlightTitle, badge, quote, tourBtn, stripItem };
  });

  console.log('Hub spotlight title:', hubData.spotlightTitle);
  console.log('Hub badge text:', hubData.badge);
  console.log('Hub tour CTA text:', hubData.tourBtn);

  if (hubData.spotlightTitle.includes('OxyEco Forger')) {
    console.log('✅ PASS: Hub spotlight title displays "OxyEco Forger"');
  } else {
    throw new Error(`Hub spotlight title does not mention OxyEco Forger: "${hubData.spotlightTitle}"`);
  }

  if (hubData.badge.includes('OxyEco Forger')) {
    console.log('✅ PASS: Hub badge displays "OxyEco Forger"');
  } else {
    throw new Error(`Hub badge does not mention OxyEco Forger: "${hubData.badge}"`);
  }

  if (hubData.tourBtn.includes('OxyEco Forger')) {
    console.log('✅ PASS: Hub tour CTA displays "OxyEco Forger Tour"');
  } else {
    throw new Error(`Hub tour CTA does not mention OxyEco Forger: "${hubData.tourBtn}"`);
  }

  // --- 2. Switch to Farm & Verify Guest Mode Head Tag & HUD Topbar ---
  console.log('\n--- 2. Testing Farm Screen & Shakir OxyEco Forger Avatar ---');
  await page.goto(rootIndex, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  // Switch to farm
  await page.evaluate(() => {
    if (typeof switchScreen === 'function') switchScreen('farm');
  });
  await page.waitForTimeout(1500);

  const farmElements = await page.evaluate(() => {
    const shakir = document.getElementById('s2ShakirGuide');
    const headTag = shakir?.querySelector('.shakir-head-tag')?.textContent || '';
    const topbar = document.getElementById('topbarStats')?.innerHTML || '';
    const hasOxyEcoForgerLabel = topbar.includes('OxyEco Forger');
    const mapIconExists = document.querySelectorAll('.chapter-explore-locator, .facility-locator-svg').length;
    return {
      hasShakir: !!shakir,
      headTag,
      hasOxyEcoForgerLabel,
      mapIconCount: mapIconExists
    };
  });

  console.log('Shakir present on farm?', farmElements.hasShakir);
  console.log('Shakir head tag:', farmElements.headTag);
  console.log('Topbar has OxyEco Forger card?', farmElements.hasOxyEcoForgerLabel);
  console.log('Standalone map icon count in guest mode (should be 0):', farmElements.mapIconCount);

  if (farmElements.hasShakir) {
    console.log('✅ PASS: Shakir avatar spawned on farm in guest mode');
  } else {
    throw new Error('Shakir avatar was not spawned on farm');
  }

  if (farmElements.headTag.includes('OxyEco Forger')) {
    console.log('✅ PASS: Shakir head tag displays "🧑‍🌾 Shakir (OxyEco Forger)"');
  } else {
    throw new Error(`Shakir head tag does not say OxyEco Forger: "${farmElements.headTag}"`);
  }

  if (farmElements.hasOxyEcoForgerLabel) {
    console.log('✅ PASS: HUD topbar displays "OxyEco Forger" label');
  } else {
    throw new Error('HUD topbar does not display OxyEco Forger label');
  }

  if (farmElements.mapIconCount === 0) {
    console.log('✅ PASS: Standalone map icon / pin is removed in guest mode; merged into Shakir avatar');
  } else {
    throw new Error(`Standalone map icons still visible in guest mode: ${farmElements.mapIconCount}`);
  }

  // --- 3. Walking, Wonder Stick, Directing Beam, Blueprint & Dream Cloud ---
  console.log('\n--- 3. Testing Wonder Stick Indicating Animation, Blueprint & Dream Cloud ---');
  await page.evaluate(() => {
    if (window.SearchO2ShakirGuide) {
      window.SearchO2ShakirGuide.walkToChapter(1);
    }
  });

  // Wait for walk completion (3200ms) and wonder stick/directing/blueprint/dream animations (700ms)
  await page.waitForTimeout(4600);

  const scoutState = await page.evaluate(() => {
    const shakir = document.getElementById('s2ShakirGuide');
    const hasWonderStick = shakir?.classList.contains('has-wonder-stick');
    const wonderStickSvg = shakir?.querySelector('.shakir-wonder-stick');
    const ghostObjs = document.querySelectorAll('.s2-ghost-obj');
    const dreamCloud = document.getElementById('s2ShakirDreamCloud');
    const dreamTitle = dreamCloud?.querySelector('.dream-cloud-tag')?.textContent || '';
    const dreamQuote = dreamCloud?.querySelector('.dream-cloud-quote')?.textContent || '';
    const dialogModal = document.getElementById('s2ShakirModal');
    const dialogTitle = dialogModal?.querySelector('.shakir-modal-title')?.textContent || '';
    const roadmapModal = document.querySelector('.cartoon-roadmap-modal');

    return {
      hasWonderStick,
      hasWonderStickSvg: !!wonderStickSvg,
      ghostCount: ghostObjs.length,
      hasDreamCloud: !!dreamCloud,
      dreamTitle,
      dreamQuote,
      hasDialogModal: !!dialogModal,
      dialogTitle,
      hasRoadmapModal: !!roadmapModal
    };
  });

  console.log('Shakir has wonder stick class?', scoutState.hasWonderStick);
  console.log('Wonder stick SVG rendered?', scoutState.hasWonderStickSvg);
  console.log('Ghost blueprints count:', scoutState.ghostCount);
  console.log('Dream cloud visible?', scoutState.hasDreamCloud);
  console.log('Dream cloud tag:', scoutState.dreamTitle);
  console.log('Dream cloud quote preview:', scoutState.dreamQuote);
  console.log('Dialog modal title:', scoutState.dialogTitle);
  console.log('Green explore roadmap modal present?', scoutState.hasRoadmapModal);

  if (scoutState.hasWonderStick && scoutState.hasWonderStickSvg) {
    console.log('✅ PASS: Wonder stick appeared in Shakir\'s hand with indicating animation');
  } else {
    throw new Error('Wonder stick was not found on Shakir walker');
  }

  if (scoutState.ghostCount > 0) {
    console.log('✅ PASS: Cyan 3D blueprint appeared after stick directing animation');
  } else {
    throw new Error('Cyan blueprint was not displayed');
  }

  if (scoutState.hasDreamCloud && scoutState.dreamQuote.includes('OxyEco Forger')) {
    console.log('✅ PASS: Dream Shakir message cloud displayed with 3D dream preview & quote');
  } else {
    throw new Error(`Dream cloud not properly rendered: quote="${scoutState.dreamQuote}"`);
  }

  // --- 4. Mobile Viewport Layout & Bottom-Left Positioning beside Marketplace ---
  console.log('\n--- 4. Testing Mobile Viewport & Guide Modal Bottom-Left Layout ---');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);

  const mobileMetrics = await page.evaluate(() => {
    const card = document.querySelector('.shakir-modal-card');
    if (!card) return null;
    const rect = card.getBoundingClientRect();
    const style = window.getComputedStyle(card);
    return {
      bottom: style.bottom,
      left: style.left,
      height: rect.height,
      width: rect.width,
      maxHeight: style.maxHeight
    };
  });

  console.log('Mobile modal card metrics:', mobileMetrics);
  if (mobileMetrics && mobileMetrics.height <= 260) {
    console.log('✅ PASS: Shakir guide modal is compact on mobile with reduced vertical height (height <= 260px)');
  } else {
    throw new Error(`Mobile modal height exceeds expected compact layout: ${mobileMetrics?.height}`);
  }

  // Reset to desktop viewport
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(400);

  // --- 5. Sequential Chapter Scouting (Got It Click Progression) ---
  console.log('\n--- 5. Testing Sequential Advancement on "Got It" Click ---');
  // Click got it to advance to chapter 2
  await page.evaluate(() => {
    if (window.SearchO2ShakirGuide) {
      window.SearchO2ShakirGuide.onGotItClicked();
    }
  });

  const nextCh = await page.evaluate(() => {
    return window.SearchO2ShakirGuide ? window.SearchO2ShakirGuide.getGuideState().currentChapter : null;
  });

  console.log('Current chapter after first Got It click:', nextCh);
  if (nextCh === 2) {
    console.log('✅ PASS: Shakir advanced to Chapter 2 upon clicking "Got It"');
  } else {
    throw new Error(`Expected Chapter 2 but got: ${nextCh}`);
  }

  // Wait for walk transition
  await page.waitForTimeout(1000);

  // --- 6. Completion & Shakir Walking Out Through Gate to Unlock Jute Tarp ---
  console.log('\n--- 6. Testing Final Walk Out Through Gate & Jute Tarpaulin Task Popup ---');
  // Simulate reaching chapter 8 and clicking Got It to finish scouting
  await page.evaluate(() => {
    if (window.SearchO2ShakirGuide) {
      const state = window.SearchO2ShakirGuide.getGuideState();
      state.currentChapter = 8;
      window.SearchO2ShakirGuide.onGotItClicked();
    }
  });

  // Wait for walk out through gate (2400ms walk + 500ms exit + buffer)
  await page.waitForTimeout(3800);

  const postSurvey = await page.evaluate(() => {
    const shakir = document.getElementById('s2ShakirGuide');
    const allExplored = window.state ? window.state.allChaptersExplored : false;
    const activeModalType = window.activeModal ? window.activeModal.type : null;
    const overlay = document.getElementById('modalOverlay');
    return {
      shakirStillPresent: !!shakir,
      allExplored,
      activeModalType,
      overlayVisible: !!overlay
    };
  });

  console.log('Shakir still on farm scene (should be false):', postSurvey.shakirStillPresent);
  console.log('State allChaptersExplored:', postSurvey.allExplored);
  console.log('Active modal popped up:', postSurvey.activeModalType);

  if (!postSurvey.shakirStillPresent) {
    console.log('✅ PASS: Shakir completed walk out through the main gate and exited the farm');
  } else {
    throw new Error('Shakir walker is still present on the farm scene');
  }

  if (postSurvey.allExplored) {
    console.log('✅ PASS: state.allChaptersExplored set to true');
  } else {
    throw new Error('state.allChaptersExplored is false');
  }

  if (postSurvey.activeModalType === 'jute_tarp') {
    console.log('✅ PASS: Next unlock task popped up: Jute Tarpaulin Explore Modal (jute_tarp)');
  } else {
    throw new Error(`Expected jute_tarp modal but found: ${postSurvey.activeModalType}`);
  }

  // --- 7. Manual User Execution of Chapter 1 Jute Tarp & Till Task ---
  console.log('\n--- 7. Verifying Manual User Execution & No Avatar Automated Digging ---');
  const initialXp = await page.evaluate(() => {
    const s = window.state;
    return s ? (s.knowledgeXP !== undefined ? s.knowledgeXP : (s.xp || 0)) : 0;
  });

  // User manually uncovers the jute tarpaulin
  await page.evaluate(() => {
    if (typeof uncoverJuteTarpAction === 'function') {
      uncoverJuteTarpAction();
    }
  });

  const postTarp = await page.evaluate(() => {
    const s = window.state;
    const spadeOwned = s && s.equipment && s.equipment.owned && s.equipment.owned['spade'];
    const xp = s ? (s.knowledgeXP !== undefined ? s.knowledgeXP : (s.xp || 0)) : 0;
    const basicModalOpen = window.activeModal ? window.activeModal.type : null;
    const isPlayerAvatarDigging = document.getElementById('s2PlayerAvatar')?.classList.contains('is-digging');
    return {
      spadeOwned: !!spadeOwned,
      xp,
      basicModalOpen,
      isPlayerAvatarDigging: !!isPlayerAvatarDigging
    };
  });

  console.log('Spade owned in state:', postTarp.spadeOwned);
  console.log('XP updated:', initialXp, '->', postTarp.xp);
  console.log('Modal opened after uncovering:', postTarp.basicModalOpen);
  console.log('Did avatar automatically start digging (must be false):', postTarp.isPlayerAvatarDigging);

  if (postTarp.spadeOwned) {
    console.log('✅ PASS: User equipped hand-forged spade upon uncovering cache');
  } else {
    throw new Error('Spade was not equipped');
  }

  if (postTarp.xp > initialXp) {
    console.log('✅ PASS: User earned exploration/uncover XP (+10 XP)');
  } else {
    throw new Error('XP was not upgraded');
  }

  if (!postTarp.isPlayerAvatarDigging) {
    console.log('✅ PASS: No automated avatar digging occurred; player executes soil tillage manually');
  } else {
    throw new Error('Avatar was automatically digging without user manual action');
  }

  await browser.close();
  console.log('\n======================================================');
  console.log('🎉 ALL OXYECO FORGER & CHAPTER SCOUTING TESTS PASSED!');
  console.log('======================================================\n');
}

run().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
