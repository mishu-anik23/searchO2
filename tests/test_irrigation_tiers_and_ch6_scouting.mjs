/**
 * Automated Playwright Test Suite
 * Verifying:
 * 1. Chapter 1 Mission "Water Seedling" / "Water Plot 1" opens Plot 1 Irrigation System Architecture Panel.
 * 2. Only Tier 1 irrigation is selectable in Chapter 1 (Tier 2 & 3 locked).
 * 3. Tier 2 activates after Pond activation (Chapter 4).
 * 4. Tier 3 activates after BESS activation (Chapter 5).
 * 5. In Chapter 6 scouting of "Build an Eco-Village", Artisan Juice Bar & Village Restaurant are shown as '🔒 Locked' (not 'Active').
 * 6. "Village Coffee House" is cleanly renamed to "Village Restaurant".
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexPath = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');

async function runTests() {
  console.log('================================================================');
  console.log('  Testing Irrigation Tiers, Ch1 Flow, Ch6 Scouting & Rename');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('  [BROWSER ERROR]:', msg.text());
    }
  });

  try {
    await page.goto(indexPath, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // =========================================================================
    // Test 1: Renaming of "Village Coffee House" to "Village Restaurant"
    // =========================================================================
    console.log('Test 1: Verifying Village Coffee House renamed to Village Restaurant...');
    const renameCheck = await page.evaluate(() => {
      const bTypeLabel = window.BUILDING_TYPES.coffee_shop.label;
      const unlockName = window.OBJECT_CHAPTER_UNLOCKS.coffee_shop.name;
      const ch6Def = window.CHAPTER_DEFINITIONS.find(c => c.chapter === 6);
      const hasRestaurantInSystems = ch6Def.keySystems.includes('Village Restaurant');
      const ch6Challenges = window.CHAPTER_CHALLENGES[6];
      const coffeeShopTask = ch6Challenges.find(t => t.id === 'ch6_coffee_shop');
      const taskShortTitle = coffeeShopTask ? coffeeShopTask.shortTitle : null;

      return {
        bTypeLabel,
        unlockName,
        hasRestaurantInSystems,
        taskShortTitle
      };
    });

    console.log('   ↳ BUILDING_TYPES label:', renameCheck.bTypeLabel);
    console.log('   ↳ OBJECT_CHAPTER_UNLOCKS name:', renameCheck.unlockName);
    console.log('   ↳ CHAPTER_DEFINITIONS keySystems has Village Restaurant:', renameCheck.hasRestaurantInSystems);
    console.log('   ↳ CHAPTER_CHALLENGES shortTitle:', renameCheck.taskShortTitle);

    if (renameCheck.bTypeLabel !== 'Village Restaurant') throw new Error(`Expected BUILDING_TYPES.coffee_shop.label to be 'Village Restaurant', got '${renameCheck.bTypeLabel}'`);
    if (renameCheck.unlockName !== 'Village Restaurant') throw new Error(`Expected OBJECT_CHAPTER_UNLOCKS.coffee_shop.name to be 'Village Restaurant', got '${renameCheck.unlockName}'`);
    if (!renameCheck.hasRestaurantInSystems) throw new Error(`Expected CHAPTER_DEFINITIONS Ch.6 keySystems to include 'Village Restaurant'`);
    if (renameCheck.taskShortTitle !== 'Village Restaurant') throw new Error(`Expected CHAPTER_CHALLENGES[6] coffee_shop shortTitle to be 'Village Restaurant', got '${renameCheck.taskShortTitle}'`);
    console.log('   [✓ PASSED] Village Coffee House successfully renamed to Village Restaurant\n');

    // =========================================================================
    // Test 2: Chapter 6 Scouting of Build an Eco-Village (Artisan Juice Bar and Village Restaurant shown 'locked')
    // =========================================================================
    console.log('Test 2: Verifying Chapter 6 Scouting shows Artisan Juice Bar & Village Restaurant as "Locked"...');
    const ch6ScoutCheck = await page.evaluate(() => {
      // In Chapter 1 (scouting phase), render chapter 6 roadmap modal
      window.state.currentChapter = 1;
      window.state.allChaptersExplored = false;
      const html = window.chapterRoadmapModalHtml('juice_bar');

      // Check task cards in Chapter 6
      const ch6Tasks = window.CHAPTER_CHALLENGES[6];
      const juiceUnlocked = ch6Tasks.find(t => t.id === 'ch6_juice_bar').isUnlocked(window.state);
      const restaurantUnlocked = ch6Tasks.find(t => t.id === 'ch6_coffee_shop').isUnlocked(window.state);
      const promenadeUnlocked = ch6Tasks.find(t => t.id === 'ch6_promenade').isUnlocked(window.state);

      return {
        juiceUnlocked,
        restaurantUnlocked,
        promenadeUnlocked,
        htmlIncludesJuiceBar: html.includes('Artisan Juice Bar'),
        htmlIncludesRestaurant: html.includes('Village Restaurant'),
        htmlIncludesLocked: html.includes('🔒 Locked'),
        htmlIncludesActive: html.includes('>Active<')
      };
    });

    console.log('   ↳ Juice Bar isUnlocked in Ch 1 scouting:', ch6ScoutCheck.juiceUnlocked);
    console.log('   ↳ Village Restaurant isUnlocked in Ch 1 scouting:', ch6ScoutCheck.restaurantUnlocked);
    console.log('   ↳ Promenade isUnlocked in Ch 1 scouting:', ch6ScoutCheck.promenadeUnlocked);
    console.log('   ↳ Roadmap HTML displays 🔒 Locked:', ch6ScoutCheck.htmlIncludesLocked);

    if (ch6ScoutCheck.juiceUnlocked) throw new Error('Expected Artisan Juice Bar to be locked during chapter scouting');
    if (ch6ScoutCheck.restaurantUnlocked) throw new Error('Expected Village Restaurant to be locked during chapter scouting');
    if (!ch6ScoutCheck.htmlIncludesLocked) throw new Error('Expected roadmap HTML to render 🔒 Locked badges');
    if (ch6ScoutCheck.htmlIncludesActive) throw new Error('Roadmap HTML unexpectedly contains >Active< badge for Chapter 6 during chapter scouting');
    console.log('   [✓ PASSED] Chapter 6 scouting displays Artisan Juice Bar & Village Restaurant as 🔒 Locked\n');

    // =========================================================================
    // Test 3: Chapter 1 Mission "Water Plot 1" button opens Irrigation Architecture Panel
    // =========================================================================
    console.log('Test 3: Verifying Chapter 1 "Water Plot 1" action button opens Irrigation System Architecture Panel...');
    const ch1ActionButtonCheck = await page.evaluate(() => {
      window.state.currentChapter = 1;
      window.state.plots[0].status = 'growing';
      window.state.plots[0].treeType = 'apple';
      window.state.plots[0].o2Produced = 0;
      window.state.plots[0].waterHours = 0;
      window.state.plots[0].accessories = {};
      window.state.totalO2AllTime = 0;

      const ch1Tasks = window.CHAPTER_CHALLENGES[1];
      const vitalityTask = ch1Tasks.find(t => t.id === 'ch1_vitality');
      const actionHtml = vitalityTask.getActionHtml(window.state);

      // Verify the button calls openIrrigationSelectModal(0)
      const hasIrrigationCall = actionHtml.includes('openIrrigationSelectModal(0)');

      // Simulate clicking it
      window.openIrrigationSelectModal(0);
      const isModalOpen = window.activeModal && window.activeModal.type === 'irrigation_select' && window.activeModal.plotId === 0;
      const modalHtml = window.irrigationSelectModalHtml(0);
      const titleMatches = modalHtml.includes('💧 Irrigation System Architecture — Plot 1');

      return {
        actionHtml,
        hasIrrigationCall,
        isModalOpen,
        titleMatches
      };
    });

    console.log('   ↳ Action HTML button has openIrrigationSelectModal(0):', ch1ActionButtonCheck.hasIrrigationCall);
    console.log('   ↳ Modal opened with type irrigation_select on Plot 0:', ch1ActionButtonCheck.isModalOpen);
    console.log('   ↳ Modal title matches "Irrigation System Architecture — Plot 1":', ch1ActionButtonCheck.titleMatches);

    if (!ch1ActionButtonCheck.hasIrrigationCall) throw new Error('Expected Chapter 1 Water Plot 1 button to call openIrrigationSelectModal(0)');
    if (!ch1ActionButtonCheck.isModalOpen) throw new Error('Expected activeModal to be irrigation_select for Plot 0');
    if (!ch1ActionButtonCheck.titleMatches) throw new Error('Expected modal title to contain "💧 Irrigation System Architecture — Plot 1"');
    console.log('   [✓ PASSED] Chapter 1 "Water Plot 1" button opens Irrigation Architecture Panel\n');

    // =========================================================================
    // Test 4: Beside-Menu Active Task Capsule "Water Seedling" opens Irrigation Panel
    // =========================================================================
    console.log('Test 4: Verifying Beside-Menu Active Task Capsule "Water Seedling" opens Irrigation Panel...');
    const guideCapsuleCheck = await page.evaluate(() => {
      window.state.currentChapter = 1;
      window.state.allChaptersExplored = true;
      window.state.basicToolsDiscovered = true;
      window.state.plots[0].status = 'growing';
      window.state.plots[0].treeType = 'apple';
      window.state.plots[0].waterHours = 0;
      window.state.plots[0].o2Produced = 0;
      window.state.plots[0].accessories = {};
      window.state.totalO2AllTime = 0;

      const guide = window.getFarmProgressionGuide();
      const compactLabel = guide ? guide.compactLabel : null;
      const actionType = guide ? guide.actionType : null;

      // Close modal and call handler
      window.activeModal = null;
      window.handleStartingTaskGuideClick();
      const isModalOpen = window.activeModal && window.activeModal.type === 'irrigation_select' && window.activeModal.plotId === 0;

      return {
        compactLabel,
        actionType,
        isModalOpen
      };
    });

    console.log('   ↳ Active guide compact label:', guideCapsuleCheck.compactLabel);
    console.log('   ↳ Active guide actionType:', guideCapsuleCheck.actionType);
    console.log('   ↳ handleStartingTaskGuideClick opened irrigation panel:', guideCapsuleCheck.isModalOpen);

    if (guideCapsuleCheck.compactLabel !== 'Water Seedling') throw new Error(`Expected compact label 'Water Seedling', got '${guideCapsuleCheck.compactLabel}'`);
    if (guideCapsuleCheck.actionType !== 'open_irrigation') throw new Error(`Expected actionType 'open_irrigation', got '${guideCapsuleCheck.actionType}'`);
    if (!guideCapsuleCheck.isModalOpen) throw new Error('Expected handleStartingTaskGuideClick to open irrigation_select modal');
    console.log('   [✓ PASSED] "Water Seedling" guide capsule opens Irrigation Panel\n');

    // =========================================================================
    // Test 5: Only Tier 1 irrigation selectable in Chapter 1; Tier 2 & 3 locked
    // =========================================================================
    console.log('Test 5: Verifying in Chapter 1 only Tier 1 is selectable, Tier 2 & 3 locked...');
    const tierCheckCh1 = await page.evaluate(() => {
      window.state.currentChapter = 1;
      window.state.buildings = { pond: { built: false }, energy_storage: { built: false } };
      window.state.money = 10000;
      window.state.plots[0].accessories = {};

      const t1Unlocked = window.isIrrigationTierUnlocked('sprinkler', window.state);
      const t2Unlocked = window.isIrrigationTierUnlocked('drip', window.state);
      const t3Unlocked = window.isIrrigationTierUnlocked('solar', window.state);

      const html = window.irrigationSelectModalHtml(0);

      // Try installing Tier 2 (should be blocked)
      window.installIrrigationTier(0, 'drip');
      const t2Installed = window.state.plots[0].accessories.irrigation === 'drip';

      // Try installing Tier 3 (should be blocked)
      window.installIrrigationTier(0, 'solar');
      const t3Installed = window.state.plots[0].accessories.irrigation === 'solar';

      // Install Tier 1 (should succeed)
      window.installIrrigationTier(0, 'sprinkler');
      const t1Installed = window.state.plots[0].accessories.irrigation === 'sprinkler';
      const plotWatered = (window.state.plots[0].waterHours || 0) > 0;

      return {
        t1Unlocked,
        t2Unlocked,
        t3Unlocked,
        t2Blocked: !t2Installed,
        t3Blocked: !t3Installed,
        t1Installed,
        plotWatered,
        htmlHasT2Locked: html.includes('Needs Active Pond') || html.includes('Activates in Chapter 4'),
        htmlHasT3Locked: html.includes('Needs BESS') || html.includes('Activates after Chapter 5')
      };
    });

    console.log('   ↳ Tier 1 unlocked:', tierCheckCh1.t1Unlocked);
    console.log('   ↳ Tier 2 unlocked:', tierCheckCh1.t2Unlocked);
    console.log('   ↳ Tier 3 unlocked:', tierCheckCh1.t3Unlocked);
    console.log('   ↳ Tier 2 install attempt blocked:', tierCheckCh1.t2Blocked);
    console.log('   ↳ Tier 3 install attempt blocked:', tierCheckCh1.t3Blocked);
    console.log('   ↳ Tier 1 install succeeded:', tierCheckCh1.t1Installed);
    console.log('   ↳ Plot received initial watering on Tier 1 install:', tierCheckCh1.plotWatered);

    if (!tierCheckCh1.t1Unlocked) throw new Error('Expected Tier 1 to be unlocked in Chapter 1');
    if (tierCheckCh1.t2Unlocked) throw new Error('Expected Tier 2 to be locked in Chapter 1');
    if (tierCheckCh1.t3Unlocked) throw new Error('Expected Tier 3 to be locked in Chapter 1');
    if (!tierCheckCh1.t2Blocked) throw new Error('Tier 2 install should be blocked when pond not active');
    if (!tierCheckCh1.t3Blocked) throw new Error('Tier 3 install should be blocked when BESS not active');
    if (!tierCheckCh1.t1Installed) throw new Error('Tier 1 install should succeed');
    if (!tierCheckCh1.plotWatered) throw new Error('Plot should receive water hours when Tier 1 is installed');
    console.log('   [✓ PASSED] Only Tier 1 is selectable in Chapter 1; Tier 2 & 3 locked\n');

    // =========================================================================
    // Test 6: Tier 2 irrigation becomes active after Pond activation (Chapter 4)
    // =========================================================================
    console.log('Test 6: Verifying Tier 2 irrigation activates after Pond activation...');
    const tier2ActivationCheck = await page.evaluate(() => {
      window.state.currentChapter = 4;
      window.state.buildings.pond = { built: true };
      window.state.buildings.energy_storage = { built: false };
      window.state.money = 10000;
      window.state.plots[0].accessories = {};

      const t2Unlocked = window.isIrrigationTierUnlocked('drip', window.state);
      const t3Unlocked = window.isIrrigationTierUnlocked('solar', window.state);

      const html = window.irrigationSelectModalHtml(0);
      const htmlHasInstallDrip = html.includes("installIrrigationTier(0,'drip')");

      // Install Tier 2
      window.installIrrigationTier(0, 'drip');
      const t2Installed = window.state.plots[0].accessories.irrigation === 'drip';

      return {
        t2Unlocked,
        t3Unlocked,
        htmlHasInstallDrip,
        t2Installed
      };
    });

    console.log('   ↳ Tier 2 unlocked after pond activation:', tier2ActivationCheck.t2Unlocked);
    console.log('   ↳ Tier 3 remains locked:', !tier2ActivationCheck.t3Unlocked);
    console.log('   ↳ Modal HTML has active Install button for Tier 2:', tier2ActivationCheck.htmlHasInstallDrip);
    console.log('   ↳ Tier 2 installed successfully on Plot 0:', tier2ActivationCheck.t2Installed);

    if (!tier2ActivationCheck.t2Unlocked) throw new Error('Expected Tier 2 to be unlocked after Pond activation');
    if (tier2ActivationCheck.t3Unlocked) throw new Error('Expected Tier 3 to remain locked before BESS activation');
    if (!tier2ActivationCheck.htmlHasInstallDrip) throw new Error('Expected modal HTML to render install button for Tier 2');
    if (!tier2ActivationCheck.t2Installed) throw new Error('Expected Tier 2 installation to succeed');
    console.log('   [✓ PASSED] Tier 2 irrigation active and installable after Pond activation\n');

    // =========================================================================
    // Test 7: Tier 3 irrigation becomes active after BESS activation (Chapter 5)
    // =========================================================================
    console.log('Test 7: Verifying Tier 3 irrigation activates after BESS activation...');
    const tier3ActivationCheck = await page.evaluate(() => {
      window.state.currentChapter = 5;
      window.state.buildings.pond = { built: true };
      window.state.buildings.energy_storage = { built: true };
      window.state.money = 10000;
      window.state.plots[0].accessories = {};

      const t3Unlocked = window.isIrrigationTierUnlocked('solar', window.state);

      const html = window.irrigationSelectModalHtml(0);
      const htmlHasInstallSolar = html.includes("installIrrigationTier(0,'solar')");

      // Install Tier 3
      window.installIrrigationTier(0, 'solar');
      const t3Installed = window.state.plots[0].accessories.irrigation === 'solar';

      return {
        t3Unlocked,
        htmlHasInstallSolar,
        t3Installed
      };
    });

    console.log('   ↳ Tier 3 unlocked after BESS activation:', tier3ActivationCheck.t3Unlocked);
    console.log('   ↳ Modal HTML has active Install button for Tier 3:', tier3ActivationCheck.htmlHasInstallSolar);
    console.log('   ↳ Tier 3 installed successfully on Plot 0:', tier3ActivationCheck.t3Installed);

    if (!tier3ActivationCheck.t3Unlocked) throw new Error('Expected Tier 3 to be unlocked after BESS activation');
    if (!tier3ActivationCheck.htmlHasInstallSolar) throw new Error('Expected modal HTML to render install button for Tier 3');
    if (!tier3ActivationCheck.t3Installed) throw new Error('Expected Tier 3 installation to succeed');
    console.log('   [✓ PASSED] Tier 3 irrigation active and installable after BESS activation\n');

    console.log('================================================================');
    console.log('  ALL 7 TESTS PASSED SUCCESSFULLY (0 FAILURES)');
    console.log('================================================================\n');

  } finally {
    await browser.close();
  }
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
