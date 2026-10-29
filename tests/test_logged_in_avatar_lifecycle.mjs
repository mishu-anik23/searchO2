import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function runTests() {
  console.log('🚀 Starting Automated Test Suite for Logged-In User Avatar & Exploration Lifecycle:');
  console.log('   - Logged-in mode farm scorecard displays selected or default avatar (NOT "Explorer")');
  console.log('   - Scorecard avatar click opens avatar selection page (#s2HomeOverlay)');
  console.log('   - Feedback & bug report buttons in scorecard open hub/#/feedback & hub/#/report');
  console.log('   - Registered dashboard topbar contains avatar button, feedback & bug report buttons');
  console.log('   - Avatar leaves farm after exploration via gate exit');
  console.log('   - Successful exploration count increments and displays in scorecard');
  console.log('   - Broken or half exploration does NOT increment successful exploration count');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  let failed = 0;
  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  try {
    const indexUrl = 'file:///' + path.join(rootDir, 'index.html').replace(/\\/g, '/');
    await page.goto(indexUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // =========================================================================
    // TEST 1: Scorecard in Logged-In Mode displays selected/default avatar (not "Explorer")
    // =========================================================================
    console.log('\n--- 1. Testing Farm Scorecard in Logged-In User Mode ---');

    const scorecardData = await page.evaluate(() => {
      // Set logged in user
      window.apiUser = {
        id: 'usr_logged_in_123',
        displayName: 'Dr. Clara Green',
        role: 'registered',
        email: 'clara@searcho2.online'
      };
      // Reset avatar in state to null to test fallback to default or roster avatar
      if (window.state) {
        window.state.playerAvatar = null;
      }
      localStorage.removeItem('searchO2_selected_avatar');
      localStorage.removeItem('searchO2_successful_explorations');

      var html = window.topbarStatsHtml();
      var container = document.createElement('div');
      container.innerHTML = html;

      var avatarCard = Array.from(container.querySelectorAll('.kid-stat-card')).find(c => {
        var icon = c.querySelector('.kid-stat-icon');
        return icon && icon.textContent.includes('👤');
      });

      var avatarVal = avatarCard ? avatarCard.querySelector('.kid-stat-val')?.textContent.trim() : null;
      var avatarLbl = avatarCard ? avatarCard.querySelector('.kid-stat-lbl')?.textContent.trim() : null;
      var avatarOnClick = avatarCard ? avatarCard.getAttribute('onclick') : null;

      // Check feedback and report links in header & cards
      var feedbackLink = container.querySelector('a[href*="hub/#/feedback"]');
      var reportLink = container.querySelector('a[href*="hub/#/report"]');

      return {
        avatarVal,
        avatarLbl,
        avatarOnClick,
        hasFeedback: !!feedbackLink,
        feedbackHref: feedbackLink ? feedbackLink.getAttribute('href') : null,
        hasReport: !!reportLink,
        reportHref: reportLink ? reportLink.getAttribute('href') : null
      };
    });

    assert(scorecardData.avatarVal !== 'Explorer', `Avatar name in scorecard is NOT 'Explorer' (got: "${scorecardData.avatarVal}")`);
    assert(scorecardData.avatarVal === 'Rio' || scorecardData.avatarVal?.length > 1, `Avatar defaults to Rio or selected avatar (got: "${scorecardData.avatarVal}")`);
    assert(scorecardData.avatarOnClick && scorecardData.avatarOnClick.includes('showHomeOverlay'), `Avatar card onclick calls SearchO2HomeAvatar.showHomeOverlay (got: "${scorecardData.avatarOnClick}")`);
    assert(scorecardData.hasFeedback && scorecardData.feedbackHref === 'hub/#/feedback', `Scorecard includes Feedback link pointing to hub/#/feedback`);
    assert(scorecardData.hasReport && scorecardData.reportHref === 'hub/#/report', `Scorecard includes Report Problem link pointing to hub/#/report`);

    // =========================================================================
    // TEST 2: Avatar selection persists and updates scorecard
    // =========================================================================
    console.log('\n--- 2. Testing Custom Selected Avatar in Scorecard ---');

    const selectedAvatarResult = await page.evaluate(() => {
      // Select Maya (Savanna / Kenya)
      var maya = {
        id: 'av_maya_girl',
        name: 'Maya',
        adjective: 'Attentive',
        region: 'africa',
        gender: 'girl'
      };
      localStorage.setItem('searchO2_selected_avatar', JSON.stringify(maya));
      if (window.state) {
        window.state.playerAvatar = maya;
      }

      var html = window.topbarStatsHtml();
      var container = document.createElement('div');
      container.innerHTML = html;

      var avatarCard = Array.from(container.querySelectorAll('.kid-stat-card')).find(c => {
        var icon = c.querySelector('.kid-stat-icon');
        return icon && icon.textContent.includes('👤');
      });

      return {
        avatarVal: avatarCard ? avatarCard.querySelector('.kid-stat-val')?.textContent.trim() : null,
        avatarLbl: avatarCard ? avatarCard.querySelector('.kid-stat-lbl')?.textContent.trim() : null
      };
    });

    assert(selectedAvatarResult.avatarVal === 'Maya', `Scorecard displays selected avatar name 'Maya' (got: "${selectedAvatarResult.avatarVal}")`);
    assert(selectedAvatarResult.avatarLbl?.includes('Attentive'), `Scorecard displays avatar adjective 'Attentive' (got: "${selectedAvatarResult.avatarLbl}")`);

    // =========================================================================
    // TEST 3: Scorecard avatar click opens avatar selection page (#s2HomeOverlay)
    // =========================================================================
    console.log('\n--- 3. Testing Avatar Card Onclick opens #s2HomeOverlay ---');

    const overlayOpenResult = await page.evaluate(() => {
      if (window.SearchO2HomeAvatar) {
        window.SearchO2HomeAvatar.showHomeOverlay(true);
      }
      var overlay = document.getElementById('s2HomeOverlay');
      return {
        exists: !!overlay,
        isVisible: overlay && !overlay.classList.contains('hidden')
      };
    });

    assert(overlayOpenResult.exists, `#s2HomeOverlay element created/present in DOM`);
    assert(overlayOpenResult.isVisible, `#s2HomeOverlay is open and visible after card click`);

    // =========================================================================
    // TEST 4: Registered Dashboard Topbar (Command Center) includes Avatar, Feedback & Report
    // =========================================================================
    console.log('\n--- 4. Testing Registered Dashboard Topbar (Global Eco-Command) ---');

    const regDockResult = await page.evaluate(() => {
      var dummy = document.createElement('div');
      window.renderRegisteredHomeDashboard(dummy, window.state, { emoji: '🌸', name: 'Spring' });

      var btnAv = dummy.querySelector('#regionTopbarUserDock button.primary');
      var fbLink = dummy.querySelector('#regionTopbarUserDock a[href="hub/#/feedback"]');
      var rpLink = dummy.querySelector('#regionTopbarUserDock a[href="hub/#/report"]');

      return {
        avBtnText: btnAv ? btnAv.textContent.trim() : null,
        hasFeedback: !!fbLink,
        hasReport: !!rpLink
      };
    });

    assert(regDockResult.avBtnText !== '👤 Explorer', `Registered dock avatar button is NOT '👤 Explorer' (got: "${regDockResult.avBtnText}")`);
    assert(regDockResult.avBtnText?.includes('Maya') || regDockResult.avBtnText?.includes('Rio'), `Registered dock avatar button shows avatar name (got: "${regDockResult.avBtnText}")`);
    assert(regDockResult.hasFeedback, `Registered dock contains Feedback button (hub/#/feedback)`);
    assert(regDockResult.hasReport, `Registered dock contains Report button (hub/#/report)`);

    // =========================================================================
    // TEST 5: Avatar Leaves Farm after Successful Exploration & Increments Count
    // =========================================================================
    console.log('\n--- 5. Testing Avatar Leaves Farm & Successful Exploration Counter ---');

    const initialExplorationCount = await page.evaluate(() => {
      localStorage.setItem('searchO2_successful_explorations', '0');
      if (window.state) window.state.successfulExplorations = 0;
      return window.SearchO2HomeAvatar.getSuccessfulExplorations();
    });
    assert(initialExplorationCount === 0, `Initial successful explorations count is 0`);

    // Spawn avatar on farm to simulate active exploration
    const spawnAndLeaveResult = await page.evaluate(async () => {
      var scene = document.getElementById('fieldScene');
      if (!scene) {
        scene = document.createElement('div');
        scene.id = 'fieldScene';
        scene.style.position = 'relative';
        scene.style.width = '1000px';
        scene.style.height = '600px';
        document.body.appendChild(scene);
      }

      var av = { id: 'av_rio_boy', name: 'Rio', adjective: 'Curious' };
      var walker = window.SearchO2HomeAvatar.spawnWalker(av, { left: 40, top: 40 });

      var walkerSpawned = !!document.getElementById('s2PlayerAvatar');

      // Trigger avatar leave farm on successful completion
      return new Promise(resolve => {
        window.SearchO2HomeAvatar.avatarLeaveFarm(true, () => {
          var walkerStillPresent = !!document.getElementById('s2PlayerAvatar');
          var count = window.SearchO2HomeAvatar.getSuccessfulExplorations();
          resolve({
            walkerSpawned,
            walkerStillPresent,
            count
          });
        });
      });
    });

    assert(spawnAndLeaveResult.walkerSpawned, `Avatar walker spawned on farm before completion`);
    assert(!spawnAndLeaveResult.walkerStillPresent, `Avatar walker left the farm and was removed from DOM after exploration`);
    assert(spawnAndLeaveResult.count === 1, `Successful exploration count incremented to 1 (got: ${spawnAndLeaveResult.count})`);

    // Verify count displays on scorecard
    const scorecardWithCount = await page.evaluate(() => {
      var html = window.topbarStatsHtml();
      var container = document.createElement('div');
      container.innerHTML = html;

      var repCard = Array.from(container.querySelectorAll('.kid-stat-card')).find(c => {
        var icon = c.querySelector('.kid-stat-icon');
        return icon && icon.textContent.includes('🏆');
      });

      return {
        cardVal: repCard ? repCard.querySelector('.kid-stat-val')?.textContent.trim() : null
      };
    });

    assert(scorecardWithCount.cardVal?.includes('1'), `Scorecard displays updated successful exploration count (got: "${scorecardWithCount.cardVal}")`);

    // =========================================================================
    // TEST 6: Broken or Half Exploration does NOT increment count
    // =========================================================================
    console.log('\n--- 6. Testing Broken or Half Exploration (Count MUST NOT increment) ---');

    const brokenExplorationResult = await page.evaluate(async () => {
      var initialCount = window.SearchO2HomeAvatar.getSuccessfulExplorations();

      // Spawn walker again for an interrupted tour
      var av = { id: 'av_rio_boy', name: 'Rio', adjective: 'Curious' };
      window.SearchO2HomeAvatar.spawnWalker(av, { left: 30, top: 30 });

      return new Promise(resolve => {
        // Leave farm with isSuccessful = false (broken / half / skipped tour)
        window.SearchO2HomeAvatar.avatarLeaveFarm(false, () => {
          var walkerStillPresent = !!document.getElementById('s2PlayerAvatar');
          var finalCount = window.SearchO2HomeAvatar.getSuccessfulExplorations();
          resolve({
            initialCount,
            walkerStillPresent,
            finalCount
          });
        });
      });
    });

    assert(!brokenExplorationResult.walkerStillPresent, `Avatar left the farm even on broken/half exploration`);
    assert(brokenExplorationResult.finalCount === brokenExplorationResult.initialCount, `Successful exploration count remained strictly unchanged (${brokenExplorationResult.finalCount} === ${brokenExplorationResult.initialCount}) on broken/half exploration`);

    console.log(`\n=======================================================`);
    if (failed === 0) {
      console.log('🎉 ALL TESTS PASSED! (0 failures)');
    } else {
      console.error(`💥 ${failed} TEST(S) FAILED!`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
