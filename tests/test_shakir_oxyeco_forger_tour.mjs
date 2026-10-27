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

  // --- 3. Walking, Wonder Stick, Directing Beam, Cooldown & Sequential Modal Timing ---
  console.log('\n--- 3. Testing Wonder Stick, Immediate Cooldown, 3s/5s/2s Sequential Modal Timing ---');
  await page.evaluate(() => {
    if (window.SearchO2ShakirGuide) {
      window.SearchO2ShakirGuide.walkToChapter(1);
    }
  });

  // Wait for walk completion (3200ms) + wonder stick manifest & beam (500ms) -> arrival at t=0
  // Wait until walk completes and cooldown activates
  await page.waitForFunction(() => {
    return window.SearchO2ShakirGuide && window.SearchO2ShakirGuide.isCooldownActive();
  }, { timeout: 8000 });

  // Check: Cooldown timer should be IMMEDIATELY ACTIVE right after wonder touch
  const immediateCooldown = await page.evaluate(() => {
    const isCdActive = window.SearchO2ShakirGuide ? window.SearchO2ShakirGuide.isCooldownActive() : false;
    const cdRemaining = window.SearchO2ShakirGuide ? window.SearchO2ShakirGuide.getCooldownRemaining() : 0;
    const floaterPill = document.getElementById('s2CooldownIconPill');
    const isPillVisible = floaterPill && !floaterPill.classList.contains('hidden');
    const ghostObjs = document.querySelectorAll('.s2-ghost-obj');
    const hasShakirModalBefore3s = !!document.getElementById('s2ShakirModal');

    return {
      isCdActive,
      cdRemaining,
      isPillVisible: !!isPillVisible,
      ghostCount: ghostObjs.length,
      hasShakirModalBefore3s
    };
  });

  console.log('Cooldown active immediately after wonder touch?', immediateCooldown.isCdActive);
  console.log('Cooldown remaining seconds (around 20s):', immediateCooldown.cdRemaining);
  console.log('Floater pill visible?', immediateCooldown.isPillVisible);
  console.log('Cyan ghost blueprints visible?', immediateCooldown.ghostCount);
  console.log('Shakir modal opened before 3s (should be false)?', immediateCooldown.hasShakirModalBefore3s);

  if (immediateCooldown.isCdActive && immediateCooldown.cdRemaining > 0) {
    console.log('✅ PASS: Cooldown timer is immediately active after wonder touch');
  } else {
    throw new Error(`Cooldown timer was not active immediately: active=${immediateCooldown.isCdActive}, rem=${immediateCooldown.cdRemaining}`);
  }

  if (immediateCooldown.ghostCount > 0) {
    console.log('✅ PASS: Cyan 3D blueprint appeared after wonder touch directing animation');
  } else {
    throw new Error('Cyan blueprint was not displayed');
  }

  if (!immediateCooldown.hasShakirModalBefore3s) {
    console.log('✅ PASS: Shakir modal did NOT pop up prematurely (waiting 3s smoothly)');
  } else {
    throw new Error('Shakir modal opened immediately instead of waiting 3s');
  }

  // Wait ~3200ms to test 3s later: Shakir modal opens and Dream cloud appears!
  await page.waitForTimeout(3200);

  const at3sState = await page.evaluate(() => {
    const shakirModal = document.getElementById('s2ShakirModal');
    const dreamCloud = document.getElementById('s2ShakirDreamCloud');
    const dreamTitle = dreamCloud?.querySelector('.dream-cloud-tag')?.textContent || '';
    const dreamQuote = dreamCloud?.querySelector('.dream-cloud-quote')?.textContent || '';
    const roadmapModal = document.querySelector('.cartoon-roadmap-modal');
    const cdRemaining = window.SearchO2ShakirGuide ? window.SearchO2ShakirGuide.getCooldownRemaining() : 0;

    return {
      hasShakirModal: !!shakirModal,
      hasDreamCloud: !!dreamCloud,
      dreamTitle,
      dreamQuote,
      hasRoadmapModal: !!roadmapModal,
      cdRemaining
    };
  });

  console.log('Shakir modal open 3s later?', at3sState.hasShakirModal);
  console.log('Dream cloud visible?', at3sState.hasDreamCloud);
  console.log('Green roadmap modal visible yet (should be false)?', at3sState.hasRoadmapModal);
  console.log('Cooldown remaining at 3s mark:', at3sState.cdRemaining);

  if (at3sState.hasShakirModal) {
    console.log('✅ PASS: Shakir modal opened 3s after wonder touch');
  } else {
    throw new Error('Shakir modal did not open 3s after wonder touch');
  }

  if (at3sState.hasDreamCloud && at3sState.dreamQuote.includes('OxyEco Forger')) {
    console.log('✅ PASS: Dream Shakir message cloud displayed with 3D dream preview & quote');
  } else {
    throw new Error(`Dream cloud not properly rendered: quote="${at3sState.dreamQuote}"`);
  }

  if (!at3sState.hasRoadmapModal) {
    console.log('✅ PASS: Green experience progression modal is not yet open (smooth delay)');
  } else {
    throw new Error('Green experience modal opened prematurely during Shakir modal display');
  }

  // --- 4. Mobile Viewport Layout Check during Shakir Modal Display ---
  console.log('\n--- 4. Testing Mobile Viewport & Guide Modal Bottom-Left Layout ---');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(400);

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

  // Now wait remaining time for Shakir modal to auto-close (5s later) and green modal to open (2s later)
  // We already waited ~400ms above, so wait ~5200ms + ~2100ms
  console.log('\n--- 4b. Testing Shakir Modal 5s Auto-Close & 2s Green Roadmap Modal Popup ---');
  await page.waitForTimeout(6800);

  const at10sState = await page.evaluate(() => {
    const shakirModal = document.getElementById('s2ShakirModal');
    const dreamCloud = document.getElementById('s2ShakirDreamCloud');
    const roadmapModal = document.querySelector('.cartoon-roadmap-modal');
    const cdRemaining = window.SearchO2ShakirGuide ? window.SearchO2ShakirGuide.getCooldownRemaining() : 0;
    const gotItTimerSpan = document.getElementById('s2RoadmapGotItTimer')?.textContent || '';

    return {
      hasShakirModal: !!shakirModal,
      hasDreamCloud: !!dreamCloud,
      hasRoadmapModal: !!roadmapModal,
      cdRemaining,
      gotItTimerSpan
    };
  });

  console.log('Shakir modal auto-closed?', !at10sState.hasShakirModal);
  console.log('Dream cloud auto-closed?', !at10sState.hasDreamCloud);
  console.log('Green experience roadmap modal popped up?', at10sState.hasRoadmapModal);
  console.log('Cooldown remaining seconds (should have seconds remaining):', at10sState.cdRemaining);
  console.log('Got It button timer tag:', at10sState.gotItTimerSpan);

  if (!at10sState.hasShakirModal) {
    console.log('✅ PASS: Shakir modal auto-closed 5s later');
  } else {
    throw new Error('Shakir modal did not auto-close after 5s');
  }

  if (at10sState.hasRoadmapModal) {
    console.log('✅ PASS: Green experience chapter progression modal popped up 2s later');
  } else {
    throw new Error('Green experience chapter progression modal did not open 2s later');
  }

  if (at10sState.cdRemaining > 0) {
    console.log(`✅ PASS: Cooldown timer still has ${at10sState.cdRemaining}s remaining while user views Got It modal`);
  } else {
    throw new Error(`Cooldown timer expired prematurely: ${at10sState.cdRemaining}`);
  }

  // --- 5. Got It Click Directly Starts Walking & Clears Previous Cyan Ghosts ---
  console.log('\n--- 5. Testing Got It Button: Directly Starts Walking & Clears Previous Cyan Ghosts ---');
  await page.evaluate(() => {
    if (window.SearchO2ShakirGuide) {
      window.SearchO2ShakirGuide.onGotItClicked();
    }
  });

  const advanceCheck = await page.evaluate(() => {
    const nextCh = window.SearchO2ShakirGuide ? window.SearchO2ShakirGuide.getGuideState().currentChapter : null;
    const ghostObjs = document.querySelectorAll('.s2-ghost-obj');
    const isWalking = window.SearchO2ShakirGuide ? window.SearchO2ShakirGuide.getGuideState().isWalking : false;
    const roadmapModal = document.querySelector('.cartoon-roadmap-modal');

    return {
      nextCh,
      ghostCount: ghostObjs.length,
      isWalking,
      hasRoadmapModal: !!roadmapModal
    };
  });

  console.log('Chapter after Got It click:', advanceCheck.nextCh);
  console.log('Cyan ghost objects remaining before new chapter arrival (should be 0):', advanceCheck.ghostCount);
  console.log('Did Shakir directly start walking?', advanceCheck.isWalking);
  console.log('Roadmap modal closed immediately?', !advanceCheck.hasRoadmapModal);

  if (advanceCheck.nextCh === 2) {
    console.log('✅ PASS: Shakir advanced to Chapter 2 on Got It click');
  } else {
    throw new Error(`Expected Chapter 2 but got: ${advanceCheck.nextCh}`);
  }

  if (advanceCheck.ghostCount === 0) {
    console.log('✅ PASS: All previous cyan ondream exploration objects closed before walking to next chapter');
  } else {
    throw new Error(`Previous cyan ghost objects were not closed: ${advanceCheck.ghostCount} remaining`);
  }

  // --- 6. Chapter 8 Scouting, Rocket Cyan Ghost, Gate Departure & Complete Ghost Cleanup ---
  console.log('\n--- 6. Testing Chapter 8 Scouting, Rocket Cyan Ghost Cleanup & Exit Gate ---');
  // Walk to Chapter 8
  await page.evaluate(() => {
    if (window.SearchO2ShakirGuide) {
      window.SearchO2ShakirGuide.walkToChapter(8);
    }
  });

  // Wait until Chapter 8 walk completes and rocket blueprint is revealed
  await page.waitForFunction(() => {
    const ghosts = document.querySelectorAll('.s2-ghost-obj');
    return Array.from(ghosts).some(el => el.getAttribute('data-facility-key') === 'space_mission' || el.textContent.includes('🚀'));
  }, { timeout: 12000 });

  const ch8Blueprint = await page.evaluate(() => {
    const ghostObjs = document.querySelectorAll('.s2-ghost-obj');
    const rocketGhost = Array.from(ghostObjs).find(el => el.getAttribute('data-facility-key') === 'space_mission' || el.textContent.includes('🚀'));
    return {
      ghostCount: ghostObjs.length,
      hasRocketGhost: !!rocketGhost
    };
  });

  console.log('Chapter 8 ghost count:', ch8Blueprint.ghostCount);
  console.log('Rocket cyan ghost object visible at Chapter 8?', ch8Blueprint.hasRocketGhost);

  if (ch8Blueprint.hasRocketGhost) {
    console.log('✅ PASS: Artemis Space rocket cyan blueprint object appeared at Chapter 8');
  } else {
    throw new Error('Chapter 8 rocket blueprint was not rendered');
  }

  // Now click Got It to finish Chapter 8 and walk out through gate
  console.log('Advancing from Chapter 8 through the gate...');
  await page.evaluate(() => {
    if (window.SearchO2ShakirGuide) {
      window.SearchO2ShakirGuide.onGotItClicked();
    }
  });

  // Immediately verify that rocket cyan object and ALL ghosts are closed/cleared as Shakir walks through gate
  const duringGateWalk = await page.evaluate(() => {
    const ghostObjs = document.querySelectorAll('.s2-ghost-obj');
    const rocketGhost = Array.from(ghostObjs).find(el => el.getAttribute('data-facility-key') === 'space_mission' || el.textContent.includes('🚀'));
    return {
      ghostCount: ghostObjs.length,
      hasRocketGhost: !!rocketGhost
    };
  });

  console.log('Cyan ghost objects while walking through gate (should be 0):', duringGateWalk.ghostCount);
  console.log('Rocket cyan object still present (should be false):', duringGateWalk.hasRocketGhost);

  if (duringGateWalk.ghostCount === 0 && !duringGateWalk.hasRocketGhost) {
    console.log('✅ PASS: Rocket cyan object and all ghost objects cleanly removed when leaving farm through gate');
  } else {
    throw new Error(`Rocket cyan object still remained when leaving farm: ${duringGateWalk.ghostCount} ghosts remaining`);
  }

  // Wait for walk out through gate (2400ms walk + 500ms exit + buffer)
  await page.waitForFunction(() => {
    return !document.getElementById('s2ShakirGuide');
  }, { timeout: 8000 });

  const postSurvey = await page.evaluate(() => {
    const shakir = document.getElementById('s2ShakirGuide');
    const allExplored = window.state ? window.state.allChaptersExplored : false;
    const activeModalType = window.activeModal ? window.activeModal.type : null;
    const overlay = document.getElementById('modalOverlay');
    const ghostObjs = document.querySelectorAll('.s2-ghost-obj');
    return {
      shakirStillPresent: !!shakir,
      allExplored,
      activeModalType,
      overlayVisible: !!overlay,
      ghostCount: ghostObjs.length
    };
  });

  console.log('Shakir still on farm scene (should be false):', postSurvey.shakirStillPresent);
  console.log('State allChaptersExplored:', postSurvey.allExplored);
  console.log('Active modal popped up:', postSurvey.activeModalType);
  console.log('Total cyan ghost blueprints remaining on farm (must be 0):', postSurvey.ghostCount);

  if (!postSurvey.shakirStillPresent) {
    console.log('✅ PASS: Shakir completed walk out through the main gate and exited the farm');
  } else {
    throw new Error('Shakir walker is still present on the farm scene');
  }

  if (postSurvey.ghostCount === 0) {
    console.log('✅ PASS: Zero cyan ghost blueprint objects remain lingering on the farm after Shakir leaves');
  } else {
    throw new Error(`Lingering ghost blueprint objects found on farm: ${postSurvey.ghostCount}`);
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
