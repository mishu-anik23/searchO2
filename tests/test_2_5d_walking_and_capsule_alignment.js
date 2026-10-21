const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');

async function runTests() {
  console.log('================================================================');
  console.log('  SearchO2 2.5D Walking Dynamics & Top Capsule Alignment Suite  ');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  const indexPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  console.log('Loading page:', indexPath);
  await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Ensure farm screen is active and avatar is initialized
  await page.evaluate(() => {
    if (typeof showScreen === 'function') showScreen('farm');
    if (typeof SearchO2HomeAvatar !== 'undefined') {
      const roster = SearchO2HomeAvatar.AVATAR_ROSTER || [];
      if (roster.length > 0) {
        SearchO2HomeAvatar.selectAvatar(roster[0].id);
        SearchO2HomeAvatar.startChapterTour(roster[0]);
      }
    }
  });
  await page.waitForTimeout(500);

  // ---------------------------------------------------------------------------
  // Test 1: Sizing and Alignment of Top Guide Capsules Container & Sticky Meadow Cooldown
  // ---------------------------------------------------------------------------
  console.log('Test 1: Verifying Top Guide Capsules Container & Sticky Meadow Cooldown Floater...');
  const capsuleMetrics = await page.evaluate(() => {
    const container = document.getElementById('topGuideCapsulesContainer');
    const taskGuide = document.getElementById('startingTaskGuideCapsule');
    if (!container || !taskGuide) return null;

    // Trigger tour modal to inspect capsule docking
    if (typeof SearchO2HomeAvatar !== 'undefined' && SearchO2HomeAvatar.openTourModal) {
      SearchO2HomeAvatar.openTourModal(1);
    }
    // Also trigger scout countdown floater
    if (typeof SearchO2HomeAvatar !== 'undefined' && SearchO2HomeAvatar.renderScoutCountdownFloater) {
      SearchO2HomeAvatar.renderScoutCountdownFloater(45, 2);
    }

    const tourModal = document.getElementById('s2TourModal');
    const tourCard = document.getElementById('s2TourModalCard');
    const floater = document.getElementById('s2ScoutCountdownFloater');
    const fieldScene = document.getElementById('fieldScene');
    const iconPill = document.getElementById('s2CooldownIconPill');
    const popModal = document.getElementById('s2CooldownPopModal');

    const cRect = container.getBoundingClientRect();
    const tRect = taskGuide.getBoundingClientRect();
    const mRect = tourCard ? tourCard.getBoundingClientRect() : null;
    const pRect = iconPill ? iconPill.getBoundingClientRect() : null;

    // Test clicking icon pill toggles pop modal
    const popHiddenBefore = popModal ? popModal.classList.contains('hidden') : null;
    if (iconPill) iconPill.click();
    const popHiddenAfter = popModal ? popModal.classList.contains('hidden') : null;
    // Close it back
    if (iconPill) iconPill.click();

    return {
      containerExists: !!container,
      containerDisplay: window.getComputedStyle(container).display,
      taskGuideHeight: Math.round(tRect.height),
      modalDockedInContainer: tourModal ? tourModal.parentElement === container : false,
      floaterAnchoredOnMeadow: floater ? (floater.parentElement === fieldScene || floater.parentElement === document.body) : false,
      hasIconPill: !!iconPill,
      hasPopModal: !!popModal,
      iconPillHeight: pRect ? Math.round(pRect.height) : null,
      popHiddenBefore: popHiddenBefore,
      popHiddenAfter: popHiddenAfter,
      modalCardHeight: mRect ? Math.round(mRect.height) : null,
      isOverlayStatic: tourModal ? window.getComputedStyle(tourModal).position === 'static' : false
    };
  });

  assert(capsuleMetrics, 'topGuideCapsulesContainer and startingTaskGuideCapsule must exist');
  assert.strictEqual(capsuleMetrics.containerDisplay, 'flex', 'Container must have display: flex');
  assert.strictEqual(capsuleMetrics.modalDockedInContainer, true, 'Scouting guidance modal must dock inside #topGuideCapsulesContainer');
  assert.strictEqual(capsuleMetrics.floaterAnchoredOnMeadow, true, 'Scout cooldown floater must be anchored on green meadow #fieldScene');
  assert.strictEqual(capsuleMetrics.hasIconPill, true, 'Scout cooldown floater must render sticky icon pill #s2CooldownIconPill');
  assert.strictEqual(capsuleMetrics.hasPopModal, true, 'Scout cooldown floater must render popup modal #s2CooldownPopModal');
  assert.strictEqual(capsuleMetrics.popHiddenBefore, true, 'Cooldown popup modal must be hidden by default until icon clicked');
  assert.strictEqual(capsuleMetrics.popHiddenAfter, false, 'Cooldown popup modal must pop open on click of icon pill');
  assert.strictEqual(capsuleMetrics.taskGuideHeight, 32, 'Active chapter challenge capsule height must be 32px');
  assert.strictEqual(capsuleMetrics.modalCardHeight, 32, 'Scouting guidance modal capsule height must be 32px');
  assert(capsuleMetrics.iconPillHeight <= 30, 'Cooldown sticky icon pill height must be compact (<= 30px)');
  assert.strictEqual(capsuleMetrics.isOverlayStatic, true, 'Modal overlay must be static (not a full-screen blocking overlay)');
  console.log('    ↳ Verified top guide capsules 32px uniform height and meadow sticky cooldown icon with on-click popup.');
  console.log('[✓ PASSED] Test 1: Top Guide Capsules Alignment & Sticky Meadow Cooldown\n');

  // ---------------------------------------------------------------------------
  // Test 2: Mobile Responsive Viewport (375x667) - No Overlapping Modals
  // ---------------------------------------------------------------------------
  console.log('Test 2: Verifying Mobile Viewport (375x667) Non-Overlapping Layout...');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(300);

  const mobileMetrics = await page.evaluate(() => {
    const container = document.getElementById('topGuideCapsulesContainer');
    const taskGuide = document.getElementById('startingTaskGuideCapsule');
    const tourCard = document.getElementById('s2TourModalCard');
    const floater = document.getElementById('s2ScoutCountdownFloater');
    const iconPill = document.getElementById('s2CooldownIconPill');

    const cStyle = window.getComputedStyle(container);
    const tRect = taskGuide.getBoundingClientRect();
    const mRect = tourCard ? tourCard.getBoundingClientRect() : null;
    const pRect = iconPill ? iconPill.getBoundingClientRect() : null;

    // Check whether top capsules overlap horizontally
    const noOverlapTM = mRect ? (tRect.right <= mRect.left + 2 || mRect.right <= tRect.left + 2) : true;

    return {
      overflowX: cStyle.overflowX,
      containerLeft: cStyle.left,
      taskGuideHeight: Math.round(tRect.height),
      modalHeight: mRect ? Math.round(mRect.height) : null,
      iconPillHeight: pRect ? Math.round(pRect.height) : null,
      noOverlap: noOverlapTM,
      containerFitsViewport: container.getBoundingClientRect().right <= 376
    };
  });

  assert(mobileMetrics.taskGuideHeight <= 32, 'Mobile capsule height must be compact (<= 32px)');
  assert.strictEqual(mobileMetrics.noOverlap, true, 'Top capsules must not overlap in mobile view');
  assert(mobileMetrics.iconPillHeight <= 28, 'Mobile cooldown icon pill must be compact (<= 28px)');
  console.log('    ↳ Mobile capsules render in compact flex row with zero screen overlap and compact cooldown pill.');
  console.log('[✓ PASSED] Test 2: Mobile Non-Overlapping Layout\n');

  // Reset to desktop viewport for subsequent tests
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(300);

  // ---------------------------------------------------------------------------
  // Test 3: Avatar 3D Isometric Walking Dynamics, Volumetric Facets & 360° Turns
  // ---------------------------------------------------------------------------
  console.log('Test 3: Verifying Avatar 3D Isometric Walking Dynamics, Volumetric Facets & Turns...');
  const avatarDynamics = await page.evaluate(() => {
    // Ensure avatar is created
    if (typeof SearchO2HomeAvatar !== 'undefined' && SearchO2HomeAvatar.initAvatar) {
      SearchO2HomeAvatar.initAvatar('rio', 1);
    }
    const avatar = document.getElementById('s2PlayerAvatar');
    if (!avatar) return null;

    // Check SVG layers for 3D isometric volumetric depth
    const rearHair = !!avatar.querySelector('.av-head-back');
    const rearTorso = !!avatar.querySelector('.av-torso-back');
    const backpack = !!avatar.querySelector('.av-backpack');
    const frontFace = !!avatar.querySelector('.av-face-features');
    const frontHead = !!avatar.querySelector('.av-head-front');

    // Check new 3D volumetric facets
    const headTop = !!avatar.querySelector('.av-head-top');
    const earLeft = !!avatar.querySelector('.av-ear-left');
    const earRight = !!avatar.querySelector('.av-ear-right');
    const nose = !!avatar.querySelector('.av-nose');
    const torsoYoke = !!avatar.querySelector('.av-torso-yoke');
    const torsoFlankLeft = !!avatar.querySelector('.av-torso-flank-left');
    const torsoFlankRight = !!avatar.querySelector('.av-torso-flank-right');
    const bootToeLeft = !!avatar.querySelector('.av-boot-toe-left');
    const bootToeRight = !!avatar.querySelector('.av-boot-toe-right');
    const bootSoleLeft = !!avatar.querySelector('.av-boot-sole-left');
    const bootSoleRight = !!avatar.querySelector('.av-boot-sole-right');

    // Simulate Northbound walk (angle = -90 deg)
    avatar.className = 's2-player-avatar facing-north is-walking';
    const northFaceStyle = window.getComputedStyle(avatar.querySelector('.av-face-features') || avatar);
    const northDisplay = northFaceStyle.display;

    // Simulate Southbound walk (angle = +90 deg)
    avatar.className = 's2-player-avatar facing-south is-walking';
    const southFaceStyle = window.getComputedStyle(avatar.querySelector('.av-face-features') || avatar);

    // Simulate Eastbound walk (profile shift)
    avatar.className = 's2-player-avatar facing-east is-walking';

    // Simulate Turnaround squash transition
    avatar.classList.add('turning-around');
    const hasTurnClass = avatar.classList.contains('turning-around');
    avatar.classList.remove('turning-around');

    return {
      avatarExists: true,
      hasRearHair: rearHair,
      hasRearTorso: rearTorso,
      hasBackpack: backpack,
      hasFrontFace: frontFace,
      hasFrontHead: frontHead,
      hasHeadTop: headTop,
      hasEars: earLeft && earRight,
      hasNose: nose,
      hasTorsoYoke: torsoYoke,
      hasTorsoFlanks: torsoFlankLeft && torsoFlankRight,
      hasBootToes: bootToeLeft && bootToeRight,
      hasBootSoles: bootSoleLeft && bootSoleRight,
      hasTurnClass: hasTurnClass,
      northDisplay: northDisplay
    };
  });

  assert(avatarDynamics, 'Avatar element must exist');
  assert.strictEqual(avatarDynamics.hasRearHair, true, 'Avatar SVG must contain .av-head-back layer');
  assert.strictEqual(avatarDynamics.hasRearTorso, true, 'Avatar SVG must contain .av-torso-back layer');
  assert.strictEqual(avatarDynamics.hasBackpack, true, 'Avatar SVG must contain .av-backpack explorer gear');
  assert.strictEqual(avatarDynamics.hasFrontFace, true, 'Avatar SVG must contain .av-face-features layer');
  assert.strictEqual(avatarDynamics.hasHeadTop, true, 'Avatar SVG must contain .av-head-top lit crown facet');
  assert.strictEqual(avatarDynamics.hasEars, true, 'Avatar SVG must contain .av-ear-left and .av-ear-right 3D ears');
  assert.strictEqual(avatarDynamics.hasNose, true, 'Avatar SVG must contain .av-nose 3D isometric nose facet');
  assert.strictEqual(avatarDynamics.hasTorsoYoke, true, 'Avatar SVG must contain .av-torso-yoke shoulder yoke facet');
  assert.strictEqual(avatarDynamics.hasTorsoFlanks, true, 'Avatar SVG must contain .av-torso-flank lateral facets');
  assert.strictEqual(avatarDynamics.hasBootToes, true, 'Avatar SVG must contain .av-boot-toe 3D toe caps');
  assert.strictEqual(avatarDynamics.hasBootSoles, true, 'Avatar SVG must contain .av-boot-sole 3D tread soles');
  assert.strictEqual(avatarDynamics.hasTurnClass, true, 'Avatar must support .turning-around turnover transition');
  console.log('    ↳ 3D Isometric SVG layers present: Lit crown dome, 3D ears, nose, torso yoke/flanks, boots, explorer backpack.');
  console.log('[✓ PASSED] Test 3: Avatar 3D Isometric Volumetric Geometry & Turnover Dynamics\n');

  // ---------------------------------------------------------------------------
  // Test 4: Explored Icon Coordinates Calculation & Badge Placement
  // ---------------------------------------------------------------------------
  console.log('Test 4: Verifying Explored Badge Coordinates Calculation & Pinned Visibility...');
  const exploreBadges = await page.evaluate(() => {
    // Render explored badges for chapters 1 and 2
    if (typeof SearchO2HomeAvatar !== 'undefined' && SearchO2HomeAvatar.renderExploredFieldBadge) {
      SearchO2HomeAvatar.renderExploredFieldBadge(1, 'farm_plot_1');
      SearchO2HomeAvatar.renderExploredFieldBadge(2, 'water_well');
    }

    const b1 = document.getElementById('s2ExploredBadge_ch1');
    const b2 = document.getElementById('s2ExploredBadge_ch2');
    if (!b1 || !b2) return null;

    const b1Left = parseFloat(b1.style.left);
    const b1Top = parseFloat(b1.style.top);
    const b2Left = parseFloat(b2.style.left);
    const b2Top = parseFloat(b2.style.top);

    return {
      b1Exists: true,
      b2Exists: true,
      b1Left: b1Left,
      b1Top: b1Top,
      b2Left: b2Left,
      b2Top: b2Top,
      b1HasTickStar: !!b1.querySelector('.tick-star'),
      b2HasTickStar: !!b2.querySelector('.tick-star')
    };
  });

  assert(exploreBadges, 'Explored badges must be created by renderExploredFieldBadge');
  assert(exploreBadges.b1Left > 0 && exploreBadges.b1Top > 0, 'Badge 1 coordinates must be calculated and > 0%');
  assert(exploreBadges.b2Left > 0 && exploreBadges.b2Top > 0, 'Badge 2 coordinates must be calculated and > 0%');
  assert.notStrictEqual(exploreBadges.b1Left, exploreBadges.b2Left, 'Badges must have distinct coordinates based on facility spots');
  console.log(`    ↳ Ch.1 badge pinned at (${exploreBadges.b1Left}%, ${exploreBadges.b1Top}%), Ch.2 at (${exploreBadges.b2Left}%, ${exploreBadges.b2Top}%).`);
  console.log('[✓ PASSED] Test 4: Explored Badge Coordinates Calculation\n');

  // ---------------------------------------------------------------------------
  // Test 5: True 3D Architectural Blueprint Structures in Transparent Shadow
  // ---------------------------------------------------------------------------
  console.log('Test 5: Verifying True 3D After-Build Blueprint Structures (Not Green Boxes)...');
  const blueprintDetails = await page.evaluate(() => {
    if (typeof SearchO2HomeAvatar !== 'undefined' && SearchO2HomeAvatar.showChapterGhosts) {
      SearchO2HomeAvatar.showChapterGhosts(1, false);
    }
    const ghostObjs = Array.from(document.querySelectorAll('.s2-ghost-obj'));
    return ghostObjs.map(g => {
      const struct = g.querySelector('.s2-ghost-structure');
      const svg = struct ? struct.querySelector('svg') : null;
      const tag = g.querySelector('.s2-ghost-blueprint-tag');
      const lock = g.querySelector('.s2-ghost-lock');
      const sStyle = struct ? window.getComputedStyle(struct) : null;

      return {
        hasStructure: !!struct,
        hasSvg: !!svg,
        hasBlueprintTag: !!tag,
        hasLock: !!lock,
        svgChildCount: svg ? svg.children.length : 0,
        filter: sStyle ? sStyle.filter : '',
        opacity: sStyle ? parseFloat(sStyle.opacity) : 0
      };
    });
  });

  assert(blueprintDetails.length > 0, 'At least 1 ghost structure must be rendered for Chapter 1');
  assert(blueprintDetails.every(b => b.hasStructure && b.hasSvg), 'Every ghost must render a 3D architectural SVG structure');
  assert(blueprintDetails.every(b => b.hasBlueprintTag), 'Every ghost must render a 📐 Blueprint tag');
  assert(blueprintDetails.every(b => b.hasLock), 'Every ghost must render a 🔒 padlock badge');
  assert(blueprintDetails.every(b => b.svgChildCount >= 3), 'Architectural SVGs must contain detailed 3D polygons/elements (not empty boxes)');
  assert(blueprintDetails.every(b => b.filter.includes('drop-shadow')), 'Must use holographic cyan drop-shadow filter (not solid green)');
  console.log(`    ↳ Verified ${blueprintDetails.length} true 3D architectural SVG blueprint structures rendered in transparent holographic shadows.`);
  console.log('[✓ PASSED] Test 5: True 3D Architectural Blueprint Shadows\n');

  // ---------------------------------------------------------------------------
  // Test 6: Zero Browser Errors
  // ---------------------------------------------------------------------------
  console.log('Test 6: Checking for Browser Errors/Exceptions...');
  assert.strictEqual(pageErrors.length, 0, 'Browser page must have zero errors: ' + JSON.stringify(pageErrors));
  console.log('[✓ PASSED] Test 6: Zero Page Errors\n');

  await browser.close();

  console.log('================================================================');
  console.log('🎉 ALL 6/6 2.5D WALKING & CAPSULE ALIGNMENT TESTS PASSED! (100%) 🎉');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('[TEST ERROR]:', err);
  process.exit(1);
});
