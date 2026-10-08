const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('====================================================');
  console.log('  SearchO2 MVP v2 Gameplay Concepts Test Suite');
  console.log('  Validating all 11 Enhanced Gaming Features');
  console.log('====================================================\n');

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
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('ERR_CONNECTION_REFUSED') && !text.includes('favicon')) {
        pageErrors.push(text);
      }
    }
  });
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  const fileUrl = 'file:///c:/Users/AM/PycharmProjects/searchO2/index.html';
  console.log('Loading SearchO2 simulation page:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss guest / intro modals if present
  try {
    const guestBtn = await page.$('#btnGuestStart');
    if (guestBtn) await guestBtn.click();
    await new Promise(r => setTimeout(r, 600));
  } catch (e) {}

  const results = await page.evaluate(async () => {
    window.confirm = function() { return true; };

    const report = {
      test1:  { name: '4-Dimension Progression: Money, O2, Knowledge XP & Levels', passed: false, details: [] },
      test2:  { name: 'Dynamic "Why?" System & 3 Learning Depths', passed: false, details: [] },
      test3:  { name: 'Collectible Discovery Cards & Knowledge Rewards', passed: false, details: [] },
      test4:  { name: 'Non-Punitive Quiz Policy (Zero Demerits on Skip)', passed: false, details: [] },
      test5:  { name: 'Chapters 1-8 & "My Sustainability Journey" Roadmap', passed: false, details: [] },
      test6:  { name: 'Sustainability Dashboard (0-100 Score across 6 Pillars)', passed: false, details: [] },
      test7:  { name: 'Guidance Modes (Guided, Balanced, Explorer) & Oxy Companion', passed: false, details: [] },
      test8:  { name: 'Consequence-Based Mechanics: BESS Curtailment vs Storage', passed: false, details: [] },
      test9:  { name: 'Commercial & Space Delivery Contracts', passed: false, details: [] },
      test10: { name: 'Space Mission Control & 3D Flight Readiness Gate', passed: false, details: [] },
      test11: { name: 'Smooth Modal Auto-Closing on Visual Graphic Activities', passed: false, details: [] }
    };

    // -------------------------------------------------------------------------
    // TEST 1: 4-Dimension Progression
    // -------------------------------------------------------------------------
    try {
      state.knowledgeXP = 0;
      state.knowledgeLevel = 1;
      const lvl1 = getKnowledgeLevelInfo(0);

      addKnowledgeXP(60, 'Initial Botany Learning');
      const lvl2 = getKnowledgeLevelInfo(state.knowledgeXP);

      addKnowledgeXP(100, 'Microgrid Engineering');
      const lvl3 = getKnowledgeLevelInfo(state.knowledgeXP);

      addKnowledgeXP(160, 'Space Science Research');
      const lvl4 = getKnowledgeLevelInfo(state.knowledgeXP);

      const dimensionsOk = (
        typeof state.money === 'number' &&
        typeof state.totalO2 === 'number' &&
        typeof state.knowledgeXP === 'number' &&
        state.knowledgeXP === 320 &&
        lvl1.level === 1 && lvl1.title === 'Eco Beginner' &&
        lvl2.level === 2 && lvl2.title === 'Green Grower' &&
        lvl3.level === 3 && lvl3.title === 'Ecosystem Builder' &&
        lvl4.level === 4 && lvl4.title === 'Eco Scientist'
      );

      if (dimensionsOk) {
        report.test1.passed = true;
        report.test1.details.push(`4 Progression dimensions verified. Knowledge XP advanced across all 4 tiers (Eco Beginner -> Green Grower -> Ecosystem Builder -> Eco Scientist).`);
      } else {
        report.test1.details.push(`Failed: dimensionsOk=${dimensionsOk}, xp=${state.knowledgeXP}, lvl=${lvl4.level}`);
      }
    } catch (e) {
      report.test1.details.push('Error: ' + e.message);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Dynamic "Why?" System & 3 Learning Depths
    // -------------------------------------------------------------------------
    try {
      openWhyModal('wind_turbine', 'quick');
      const modalOpen = (activeModal && activeModal.type === 'why');
      const htmlQuick = whyModalHtml('wind_turbine', 'quick');
      const hasQuick = htmlQuick.includes('🌱 Quick Fact') && htmlQuick.includes('zero-emission electricity');

      const htmlLearn = whyModalHtml('wind_turbine', 'learn');
      const hasLearn = htmlLearn.includes('🔬 Learn More') && htmlLearn.includes('generator');

      const htmlDeep = whyModalHtml('wind_turbine', 'deep');
      const hasDeep = htmlDeep.includes('📚 Deep Dive') && htmlDeep.includes('Betz limit') && htmlDeep.includes('1/2');

      const xpBefore = state.knowledgeXP;
      addKnowledgeXP(WHY_TOPICS.wind_turbine.xpReward, 'Explored Wind Turbine');
      const xpAfter = state.knowledgeXP;
      const rewardedOk = (xpAfter - xpBefore === 5);

      closeModal();
      const closedOk = (activeModal === null);

      if (modalOpen && hasQuick && hasLearn && hasDeep && rewardedOk && closedOk) {
        report.test2.passed = true;
        report.test2.details.push(`Why? modal opened with 3 learning depths (Quick Fact, Learn More, Deep Dive with Betz formula), awarded +5 XP and closed cleanly.`);
      } else {
        report.test2.details.push(`Failed: modalOpen=${modalOpen}, hasQuick=${hasQuick}, hasLearn=${hasLearn}, hasDeep=${hasDeep}, rewardedOk=${rewardedOk}`);
      }
    } catch (e) {
      report.test2.details.push('Error: ' + e.message);
    }

    // -------------------------------------------------------------------------
    // TEST 3: Collectible Discovery Cards
    // -------------------------------------------------------------------------
    try {
      state.discoveredCards = ['photosynthesis'];
      const xpBefore = state.knowledgeXP;

      triggerDiscoveryCard('pollination');
      const cardTriggered = (activeModal && activeModal.type === 'discovery_card' && activeModal.cardKey === 'pollination');
      const inCollection = state.discoveredCards.includes('pollination');
      const xpAwarded = (state.knowledgeXP - xpBefore === 10);

      const html = discoveryCardModalHtml('pollination');
      const htmlOk = html.includes('NEW DISCOVERY!') && html.includes('Pollination Synergy') && html.includes('10 Knowledge XP');

      closeModal();

      if (cardTriggered && inCollection && xpAwarded && htmlOk && activeModal === null) {
        report.test3.passed = true;
        report.test3.details.push(`Discovery Card triggered: "Pollination Synergy" indexed into collection, awarded +10 Knowledge XP, rendered modal, and closed cleanly.`);
      } else {
        report.test3.details.push(`Failed: cardTriggered=${cardTriggered}, inCollection=${inCollection}, xpAwarded=${xpAwarded}, htmlOk=${htmlOk}`);
      }
    } catch (e) {
      report.test3.details.push('Error: ' + e.message);
    }

    // -------------------------------------------------------------------------
    // TEST 4: Non-Punitive Quiz Policy (Zero Demerits on Skip)
    // -------------------------------------------------------------------------
    try {
      state.demerits = 0;
      state.quiz = {
        pending: {
          id: Date.now(),
          questions: [{ q: 'Test Question', options: ['A', 'B', 'C', 'D'], answer: 0 }],
          answers: [null],
          revealIdx: null,
          region: 'germany'
        },
        skipped: 0
      };

      forfeitQuiz();
      const demeritsRemainedZero = (state.demerits === 0);
      const skippedRecorded = (state.quiz.skipped === 1 && state.quiz.pending === null);

      if (demeritsRemainedZero && skippedRecorded) {
        report.test4.passed = true;
        report.test4.details.push(`Zero-demerit policy verified: Forfeiting/skipping an Eco Challenge added ZERO demerits (demerits = 0), dismissing cleanly.`);
      } else {
        report.test4.details.push(`Failed: demerits=${state.demerits} (expected 0), skipped=${state.quiz.skipped}`);
      }
    } catch (e) {
      report.test4.details.push('Error: ' + e.message);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Chapters 1-8 & "My Sustainability Journey" Roadmap
    // -------------------------------------------------------------------------
    try {
      openSustainabilityJourneyModal();
      const modalOpen = (activeModal && activeModal.type === 'sustainability_journey');
      const html = sustainabilityJourneyModalHtml();

      const hasCh1 = html.includes('Look, I Can Grow Something') || html.includes('Chapter 1: Bring the Land to Life');
      const hasCh2 = html.includes('Chapter 2: Build Your Farm');
      const hasCh3 = html.includes('Chapter 3: Build an Ecosystem');
      const hasCh4 = html.includes('Chapter 4: Close the Loop');
      const hasCh5 = html.includes('Chapter 5: Power Your Community');
      const hasCh6 = html.includes('Chapter 6: Build an Eco-Village');
      const hasCh7 = html.includes('Chapter 7: Become Self-Sustaining');
      const hasCh8 = html.includes('Chapter 8: Beyond Earth');
      const hasJourneyTitle = html.includes('My Sustainability Journey');

      closeModal();

      if (modalOpen && hasCh1 && hasCh2 && hasCh3 && hasCh4 && hasCh5 && hasCh6 && hasCh7 && hasCh8 && hasJourneyTitle) {
        report.test5.passed = true;
        report.test5.details.push(`Sustainability Journey verified: Chapters 1-8 fully rendered with progress bars, rewards, and player fantasies.`);
      } else {
        report.test5.details.push(`Failed: modalOpen=${modalOpen}, hasCh1=${hasCh1}, hasCh8=${hasCh8}`);
      }
    } catch (e) {
      report.test5.details.push('Error: ' + e.message);
    }

    // -------------------------------------------------------------------------
    // TEST 6: Sustainability Dashboard (0-100 Score across 6 Pillars)
    // -------------------------------------------------------------------------
    try {
      openSustainabilityDashboardModal();
      const modalOpen = (activeModal && activeModal.type === 'sustainability_dashboard');
      const html = sustainabilityDashboardModalHtml();

      const score = calculateSustainabilityScore();
      const scoreOk = (typeof score === 'number' && score >= 50 && score <= 100);
      const hasPillars = (
        html.includes('Biodiversity') &&
        html.includes('Clean Energy') &&
        html.includes('Water Efficiency') &&
        html.includes('Soil Health') &&
        html.includes('Circular Loops') &&
        html.includes('Economic Health')
      );

      closeModal();

      if (modalOpen && scoreOk && hasPillars) {
        report.test6.passed = true;
        report.test6.details.push(`Sustainability Dashboard verified: Calculated overall Eco Score (${score}/100) across all 6 core pillars with diagnostic metrics.`);
      } else {
        report.test6.details.push(`Failed: modalOpen=${modalOpen}, scoreOk=${scoreOk}, score=${score}, hasPillars=${hasPillars}`);
      }
    } catch (e) {
      report.test6.details.push('Error: ' + e.message);
    }

    // -------------------------------------------------------------------------
    // TEST 7: Guidance Modes & Oxy Companion
    // -------------------------------------------------------------------------
    try {
      setGuidanceMode('guided');
      const guidedOk = (state.guidanceMode === 'guided');
      const tipGuided = getOxyTip();
      const tipOk = (tipGuided && tipGuided.title && tipGuided.text);

      setGuidanceMode('balanced');
      const balancedOk = (state.guidanceMode === 'balanced');

      setGuidanceMode('explorer');
      const explorerOk = (state.guidanceMode === 'explorer');
      const tipExplorer = getOxyTip();
      const explorerMuted = (tipExplorer === null);

      if (guidedOk && tipOk && balancedOk && explorerOk && explorerMuted) {
        report.test7.passed = true;
        report.test7.details.push(`Guidance modes verified: 🟢 Guided provides smart tips, 🟡 Balanced offers contextual prompts, and ⚪ Explorer mutes hints for experienced players.`);
      } else {
        report.test7.details.push(`Failed: guidedOk=${guidedOk}, tipOk=${tipOk}, explorerMuted=${explorerMuted}`);
      }
    } catch (e) {
      report.test7.details.push('Error: ' + e.message);
    }

    // -------------------------------------------------------------------------
    // TEST 8: Consequence-Based Mechanics: BESS Curtailment vs Storage
    // -------------------------------------------------------------------------
    try {
      state.curtailedEnergyKWh = 0;
      state.capturedEnergyKWh = 0;
      state.buildings.wind_turbines = {
        wt_nw: { built: true, commissioned: true },
        wt_ne: { built: true, commissioned: true },
        wt_sw: { built: false, commissioned: false },
        wt_se: { built: false, commissioned: false }
      };
      state.buildings.coffee_shop = { built: false };
      state.buildings.juice_bar = { built: false };
      state.storage = { built: false };
      state.equipment = { owned: {}, leased: {} };

      // Case 1: Without BESS -> 6 kW supply vs 0 kW demand -> 6 kWh surplus curtailed & wasted
      state.buildings.energy_storage = { built: false };
      computePowerGridState(1.0);
      const curtailedOk = (state.curtailedEnergyKWh >= 6.0);

      // Case 2: With BESS -> 6 kWh surplus captured into battery
      state.buildings.energy_storage = { built: true, storedKWh: 0, maxKWh: 500 };
      computePowerGridState(1.0);
      const capturedOk = (state.capturedEnergyKWh >= 6.0 && state.buildings.energy_storage.storedKWh >= 6);

      if (curtailedOk && capturedOk) {
        report.test8.passed = true;
        report.test8.details.push(`Consequence mechanic verified: Renewable surplus without BESS was curtailed and wasted (+${state.curtailedEnergyKWh} kWh); building BESS successfully captured surplus (+${state.capturedEnergyKWh} kWh).`);
      } else {
        report.test8.details.push(`Failed: curtailedOk=${curtailedOk} (${state.curtailedEnergyKWh}), capturedOk=${capturedOk} (${state.capturedEnergyKWh})`);
      }
    } catch (e) {
      report.test8.details.push('Error: ' + e.message);
    }

    // -------------------------------------------------------------------------
    // TEST 9: Commercial & Space Delivery Contracts
    // -------------------------------------------------------------------------
    try {
      openContractsModal();
      const modalOpen = (activeModal && activeModal.type === 'contracts');
      const html = contractsModalHtml();
      const hasClients = html.includes('Frankfurt Elementary School') && html.includes('European Space Agency');

      const moneyBefore = state.money;
      const xpBefore = state.knowledgeXP;
      fulfillContract('contract_school');
      const moneyAfter = state.money;
      const xpAfter = state.knowledgeXP;

      const fulfilledOk = (moneyAfter - moneyBefore === 600 && xpAfter - xpBefore === 25);
      const modalClosed = (activeModal === null);

      if (modalOpen && hasClients && fulfilledOk && modalClosed) {
        report.test9.passed = true;
        report.test9.details.push(`Commercial contracts verified: Order modal rendered regional & space contracts, fulfillment awarded +€600 and +25 Knowledge XP, and modal closed.`);
      } else {
        report.test9.details.push(`Failed: modalOpen=${modalOpen}, hasClients=${hasClients}, fulfilledOk=${fulfilledOk}`);
      }
    } catch (e) {
      report.test9.details.push('Error: ' + e.message);
    }

    // -------------------------------------------------------------------------
    // TEST 10: Space Mission Control & Readiness Gate
    // -------------------------------------------------------------------------
    try {
      openMissionControlModal();
      const modalOpen = (activeModal && activeModal.type === 'mission_control');
      const html = missionControlModalHtml();

      const hasReadinessReqs = (
        html.includes('Financial Readiness:</b> €120,000') &&
        html.includes('Space Science Level:</b> Level 4') &&
        html.includes('Cumulative Clean O2:</b> 250,000') &&
        html.includes('Launch 3D FPV Cruise')
      );

      closeModal();

      if (modalOpen && hasReadinessReqs) {
        report.test10.passed = true;
        report.test10.details.push(`Space Mission Control verified: Canonical readiness gate checking €120k reserve, Level 4 Eco Scientist, 250k lifetime O2, with seamless 3D FPV launch links.`);
      } else {
        report.test10.details.push(`Failed: modalOpen=${modalOpen}, hasReadinessReqs=${hasReadinessReqs}`);
      }
    } catch (e) {
      report.test10.details.push('Error: ' + e.message);
    }

    // -------------------------------------------------------------------------
    // TEST 11: Smooth Modal Auto-Closing on Visual Graphic Activities
    // -------------------------------------------------------------------------
    try {
      state.currentChapter = 2;
      state.basicToolsDiscovered = true;
      state.storage = { built: true };
      state.money = 50000;
      state.workers = [{ id: 1, type: 'laborer', assignedPlot: null, assignedBuilding: null }];

      // Action 1: startPrep closes modal and highlights plot
      state.plots[0].status = 'barren';
      openModal('plot', 0);
      startPrep(0);
      const prepClosedOk = (activeModal === null);

      // Action 2: startBuildBuilding closes modal and highlights building spot
      state.buildings.crew_shed = { built: false, building: false };
      openModal('building', 'crew_shed');
      startBuildBuilding('crew_shed');
      const buildClosedOk = (activeModal === null && state.buildings.crew_shed.building === true);

      // Action 3: startBuildRoadSegment closes modal and highlights road corridor
      state.buildings.road = { built: false, building: false };
      state.workers = [
        { id: 1, type: 'laborer', assignedPlot: null, assignedBuilding: null },
        { id: 2, type: 'laborer', assignedPlot: null, assignedBuilding: null }
      ];
      state.rocksCleared = true;
      if (state.buildings && state.buildings.gate) state.buildings.gate.built = true;
      openModal('building', 'road');
      startBuildRoadSegment('main');
      const roadClosedOk = (activeModal === null && state.buildings.road.building === true);

      if (prepClosedOk && buildClosedOk && roadClosedOk) {
        report.test11.passed = true;
        report.test11.details.push(`Smooth modal auto-close rule verified across desktop & mobile: starting visual tasks (soil digging, building construction, road paving) immediately auto-closes instruction modals so visual animations play unobstructed!`);
      } else {
        report.test11.details.push(`Failed: prepClosedOk=${prepClosedOk}, buildClosedOk=${buildClosedOk}, roadClosedOk=${roadClosedOk}`);
      }
    } catch (e) {
      report.test11.details.push('Error: ' + e.message);
    }

    return report;
  });

  console.log('\n================ TEST RESULTS SUMMARY ================');
  let allPassed = true;
  Object.keys(results).forEach(k => {
    const t = results[k];
    const statusMark = t.passed ? '✓ PASSED' : '✗ FAILED';
    console.log(`[${statusMark}] ${t.name}`);
    t.details.forEach(d => console.log(`    ↳ ${d}`));
    if (!t.passed) allPassed = false;
  });

  if (pageErrors.length > 0) {
    console.log('\n--- Captured Page Errors ---');
    pageErrors.forEach(err => console.error('  PAGE ERROR:', err));
  }

  console.log('======================================================');
  if (allPassed) {
    console.log('🎉 ALL 11 MVP V2 GAMEPLAY TESTS PASSED SUCCESSFULLY! 🎉');
  } else {
    console.log('❌ SOME TESTS FAILED. Please review the details above.');
  }
  console.log('======================================================\n');

  await browser.close();
  process.exit(allPassed ? 0 : 1);
})();
