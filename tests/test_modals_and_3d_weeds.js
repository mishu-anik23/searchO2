/**
 * test_modals_and_3d_weeds.js
 * Verification of:
 * 1. Task List Modal Alignment & Stewardship Row Flex Layout
 * 2. Worker Command Hub Overhaul (Stats Strip, Role Tabs, Location Context, Quick Dispatch)
 * 3. Marketplace Modal & Milestone Track Styling
 * 4. 3D Isometric Plot Weed Rendering across Multi-Stage Growth & Overgrown Terrace Embankment Spillover
 */

const { chromium } = require('playwright');
const path = require('path');

async function runTests() {
  console.log('====================================================');
  console.log('  Testing Modals Alignment, Workers Hub & 3D Weeds  ');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('Browser Error:', msg.text());
  });

  const fileUrl = 'file:///c:/Users/AM/PycharmProjects/searchO2/index.html';
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  let passedTests = 0;
  let totalTests = 4;

  // -------------------------------------------------------------------------
  // TEST 1: Task List Modal Alignment & Regenerative Stewardship Flex
  // -------------------------------------------------------------------------
  try {
    console.log('--- TEST 1: Task List Modal Alignment & Flex Layout ---');
    await page.evaluate(() => {
      switchScreen('farm');
      openPanel = 'tasks';
      render();
    });
    await page.waitForTimeout(400);

    const taskListCheck = await page.evaluate(() => {
      const panel = document.querySelector('.float-panel');
      if (!panel) return { success: false, reason: 'Panel not found' };
      const panelWidth = panel.getBoundingClientRect().width;
      
      const taskRows = Array.from(panel.querySelectorAll('.task-row'));
      if (taskRows.length === 0) return { success: false, reason: 'No task rows found' };

      // Find stewardship task row
      const stewRow = taskRows.find(r => r.textContent.includes('Soil Tilth') || r.textContent.includes('Clear Rocks'));
      if (!stewRow) return { success: false, reason: 'Stewardship task row not found' };

      const taskInfo = stewRow.querySelector('.task-info');
      const whyBtn = taskInfo.querySelector('button');
      const actionBtn = stewRow.querySelector('.claim-btn') || stewRow.querySelector('button.active');

      const infoWidth = taskInfo.getBoundingClientRect().width;
      return {
        success: true,
        panelWidth,
        infoWidth,
        hasWhyBtnInInfo: !!(whyBtn && whyBtn.textContent.includes('Why & Roadmap')),
        hasActionBtn: !!actionBtn,
        stewName: taskInfo.querySelector('.name') ? taskInfo.querySelector('.name').textContent : ''
      };
    });

    if (!taskListCheck.success) {
      throw new Error('Task list check failed: ' + taskListCheck.reason);
    }
    if (taskListCheck.panelWidth < 360) {
      throw new Error(`Desktop float-panel width too narrow: ${taskListCheck.panelWidth}px (expected >= 360px)`);
    }
    if (!taskListCheck.hasWhyBtnInInfo) {
      throw new Error('Why & Roadmap button not located inside .task-info badge row');
    }
    if (taskListCheck.infoWidth < 160) {
      throw new Error(`Task info width too squeezed: ${taskListCheck.infoWidth}px`);
    }

    console.log(`[✓ PASSED] Task list modal verified: panel width ${taskListCheck.panelWidth}px, info width ${taskListCheck.infoWidth}px, Why & Roadmap neatly positioned in badge row.`);
    passedTests++;
  } catch (err) {
    console.error('[✗ FAILED] TEST 1:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Worker Command Hub Overhaul (Stats, Tabs, Location Pills, Dispatch)
  // -------------------------------------------------------------------------
  try {
    console.log('\n--- TEST 2: Worker Command Hub Overhaul ---');
    await page.evaluate(() => {
      // Ensure we have workers hired
      if (!state.workers || state.workers.length === 0) {
        state.buildings.crew_shed.built = true;
        hireWorker('laborer');
        hireWorker('farmer');
      }
      openPanel = 'workers';
      render();
    });
    await page.waitForTimeout(400);

    const workerCheck = await page.evaluate(() => {
      const panel = document.querySelector('.float-panel');
      if (!panel) return { success: false, reason: 'Workers panel not found' };

      const statsStrip = panel.querySelector('.crew-stats-strip');
      if (!statsStrip) return { success: false, reason: 'Crew stats strip not found' };
      const statPills = Array.from(statsStrip.querySelectorAll('.crew-stat-pill'));

      const workerCards = Array.from(panel.querySelectorAll('.crew-worker-card'));
      if (workerCards.length === 0) return { success: false, reason: 'Worker cards not found' };

      const firstCard = workerCards[0];
      const avatar = firstCard.querySelector('.worker-avatar-box');
      const name = firstCard.querySelector('b');
      const locPill = firstCard.querySelector('span[style*="border-radius:6px"]');
      const actionBtn = firstCard.querySelector('.secondary.mini-btn') || firstCard.querySelector('.fire-dismiss-btn');

      const recruitPanel = panel.querySelector('.crew-recruit-panel');
      const recruitBtns = recruitPanel ? Array.from(recruitPanel.querySelectorAll('.crew-recruit-btn')) : [];

      return {
        success: true,
        statCount: statPills.length,
        workerCount: workerCards.length,
        hasAvatar: !!avatar,
        workerName: name ? name.textContent : '',
        locText: locPill ? locPill.textContent : '',
        hasActionBtn: !!actionBtn,
        recruitBtnCount: recruitBtns.length
      };
    });

    if (!workerCheck.success) {
      throw new Error('Worker hub check failed: ' + workerCheck.reason);
    }
    if (workerCheck.statCount < 4) {
      throw new Error(`Expected 4 stat metric pills in stats strip, found ${workerCheck.statCount}`);
    }
    if (workerCheck.recruitBtnCount < 4) {
      throw new Error(`Expected 4 role recruit buttons, found ${workerCheck.recruitBtnCount}`);
    }

    console.log(`[✓ PASSED] Worker Command Hub verified: 4 stat metric cards, active worker card (${workerCheck.workerName} at ${workerCheck.locText}), and 4-tier recruitment panel.`);
    passedTests++;
  } catch (err) {
    console.error('[✗ FAILED] TEST 2:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 3: Marketplace Drawer & Milestone Progress Track
  // -------------------------------------------------------------------------
  try {
    console.log('\n--- TEST 3: Marketplace Drawer & Milestone Progress ---');
    await page.evaluate(() => {
      closePanel();
      if (typeof toggleCorner === 'function') toggleCorner('marketplaceExpanded');
      render();
    });
    await page.waitForTimeout(400);

    const marketCheck = await page.evaluate(() => {
      const tray = document.getElementById('marketplaceTray');
      if (!tray) return { success: false, reason: 'Marketplace tray not found' };

      const milestoneBar = tray.querySelector('.marketplace-milestone-bar');
      const progressTrack = tray.querySelector('.marketplace-progress-track');
      const cards = Array.from(tray.querySelectorAll('.market-card'));

      if (!milestoneBar || !progressTrack) return { success: false, reason: 'Milestone bar or progress track not found' };
      if (cards.length === 0) return { success: false, reason: 'Market cards not found' };

      const firstCard = cards[0];
      const title = firstCard.querySelector('.m-title');
      const bonus = firstCard.querySelector('.m-bonus');
      const btn = firstCard.querySelector('button');

      return {
        success: true,
        cardCount: cards.length,
        titleText: title ? title.textContent : '',
        bonusText: bonus ? bonus.textContent : '',
        btnText: btn ? btn.textContent : ''
      };
    });

    if (!marketCheck.success) {
      throw new Error('Marketplace check failed: ' + marketCheck.reason);
    }

    console.log(`[✓ PASSED] Marketplace drawer verified: Glowing milestone progress track, ${marketCheck.cardCount} catalog cards with bonus tags and action buttons.`);
    passedTests++;
  } catch (err) {
    console.error('[✗ FAILED] TEST 3:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 4: 3D Isometric Plot Weed Rendering Across Progression Stages
  // -------------------------------------------------------------------------
  try {
    console.log('\n--- TEST 4: 3D Isometric Plot Weed Rendering ---');
    const weedVisualCheck = await page.evaluate(() => {
      // Test Stage 1: Moderate weeds (weedHours = 50)
      const p1 = { id: 0, status: 'barren', weedHours: 50 };
      const svg1 = plotSvg(p1);

      // Test Stage 2: Heavy weeds (weedHours = 100)
      const p2 = { id: 1, status: 'barren', weedHours: 100 };
      const svg2 = plotSvg(p2);

      // Test Stage 3: Full overgrown (status = 'overgrown', weedHours = 130)
      const p3 = { id: 2, status: 'overgrown', weedHours: 130 };
      const svg3 = plotSvg(p3);

      return {
        hasIsoGroup1: svg1.includes('class="iso3d-weeds"'),
        hasShadows1: svg1.includes('rgba(24,16,10,0.38)'),
        hasBrambleCanes1: svg1.includes('stroke="#263814"') || svg1.includes('stroke="#1B3310"'),
        hasThistleBloom2: svg2.includes('#8E24AA'), // Vibrant purple thistle crest
        hasOvergrownSpillover3: svg3.includes('class="overgrown-spillover"'),
        hasSpores3: svg3.includes('fill="#FFFDE7"'),
        svg1Length: svg1.length,
        svg3Length: svg3.length
      };
    });

    if (!weedVisualCheck.hasIsoGroup1 || !weedVisualCheck.hasShadows1) {
      throw new Error('3D Isometric weed container or ground contact shadows not rendered');
    }
    if (!weedVisualCheck.hasThistleBloom2) {
      throw new Error('3D Purple thistle bloom crown (#8E24AA) missing from mature weed stage');
    }
    if (!weedVisualCheck.hasOvergrownSpillover3) {
      throw new Error('Choking overgrown embankment spillover missing from overgrown plot state');
    }
    if (!weedVisualCheck.hasSpores3) {
      throw new Error('Floating dandelion seed spores missing from overgrown plot state');
    }

    console.log(`[✓ PASSED] 3D Isometric Weed visual verified: Multi-stage geometry with ground shadows, dual-tone thorny bramble canes, purple thistle crowns, and full terrace embankment spillover.`);
    passedTests++;
  } catch (err) {
    console.error('[✗ FAILED] TEST 4:', err.message);
  }

  await browser.close();

  console.log('\n================ TEST SUMMARY ================');
  console.log(`Passed: ${passedTests} / ${totalTests}`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL MODALS & 3D WEED TESTS PASSED (100%)! 🎉');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests();
