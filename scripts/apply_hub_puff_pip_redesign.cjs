const fs = require('fs');
const path = require('path');

const hubJsPath = path.join(__dirname, '..', 'hub', 'hub.js');
const hubCssPath = path.join(__dirname, '..', 'hub', 'hub.css');
const hubHtmlPath = path.join(__dirname, '..', 'hub', 'index.html');
const testPath = path.join(__dirname, '..', 'tests', 'test_hub_forms_and_login_home_radar.mjs');

let hubJs = fs.readFileSync(hubJsPath, 'utf8');
let hubCss = fs.readFileSync(hubCssPath, 'utf8');
let hubHtml = fs.readFileSync(hubHtmlPath, 'utf8');

console.log('1. Updating Navbar & Routing in hub.js...');

// Replace ROUTES and #nav generation and route() function
const oldNavBlockRegex = /var ROUTES = \[\s*\{ id: '', label: 'Home'[\s\S]*?window\.addEventListener\('hashchange', route\);/;

const newNavBlock = `var ROUTES = [
    { id: '', label: 'Home', title: 'Learning Hub', render: pageHome },
    { id: 'start', label: 'Getting Started', title: 'Getting Started', render: pageStart },
    { id: 'components', label: 'Components', title: 'Components', render: pageComponents },
    { id: 'library', label: 'Library', title: 'Plant Library', render: pageLibrary },
    { id: 'concepts', label: 'Concepts', title: 'Concepts', render: pageConcepts },
    { id: 'howto', label: 'How-to', title: 'How-to Guides', render: pageHowto },
    { id: 'player', label: 'Player Hub', title: 'Player Hub', render: pagePlayer },
    { id: 'help', label: 'Help & FAQ', title: 'Help & FAQ', render: pageHelp },
    { id: 'feedback', label: 'Feedback', title: 'Feedback', render: pageFeedback },
    { id: 'report', label: 'Report a Problem', title: 'Report a Problem', render: pageReport }
  ];
  renderHubAuthStatus();
  $('#nav').innerHTML = ROUTES.map(function (r) {
    return '<a href="#/' + r.id + '" data-route="' + r.id + '">' + esc(r.label) + '</a>';
  }).join('');

  var firstRender = true;
  function route() {
    closeDrawer();
    var parts = location.hash.replace(/^#\\/?/, '').split('/');
    var id = parts[0] || '', arg = parts[1] || '';
    var r = ROUTES.filter(function (x) { return x.id === id; })[0] || ROUTES[0];
    $$('#nav a').forEach(function (a) {
      if (a.dataset.route === r.id) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
    var pageTitle = r.title;
    if (r.id === 'feedback') {
      if (arg === 'playtest') pageTitle = 'Full Playtest Review';
      else pageTitle = 'Chapter Feedback';
    }
    document.title = (r.id ? pageTitle + ' · ' : '') + 'searchO2 Learning Hub';
    main.innerHTML = '';
    r.render(arg);
    if (!arg) window.scrollTo(0, 0);
    if (!firstRender) main.focus({ preventScroll: true });
    firstRender = false;
  }
  window.addEventListener('hashchange', route);`;

if (!oldNavBlockRegex.test(hubJs)) {
  console.error('ERROR: oldNavBlockRegex failed to match in hub.js');
  process.exit(1);
}
hubJs = hubJs.replace(oldNavBlockRegex, newNavBlock);

console.log('2. Inserting Puff & Pip SVGs and guidance components in hub.js...');

const oldFeedbackSubnavRegex = /function feedbackSubnav\(currentSub\) \{[\s\S]*?function pageReport\(\) \{[\s\S]*?wireOutbox\(\);\s*var form = \$\('#rpForm'\)[\s\S]*?diagnostics\(\) : null\s*\}, form, \$\('#rpSend'\), \$\('#rpOut'\)\);\s*\}\);/g;

const newFeedbackAndPuffPipBlock = `  /* ------------------------------------------------------------------ *
   * PUFF & PIP ANIMATED CHARACTERS & STORY-DRIVEN GUIDANCE
   * Puff: Wise O₂ Mentor Spirit · Pip: Curious Player Explorer Sprout
   * ------------------------------------------------------------------ */
  function puffSvg(size) {
    var s = size || 80;
    return '<svg class="puff-avatar-svg" viewBox="0 0 100 100" width="' + s + '" height="' + s + '" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<radialGradient id="puffGrad" cx="35%" cy="35%" r="65%">' +
          '<stop offset="0%" stop-color="#FFFFFF"/>' +
          '<stop offset="65%" stop-color="#E0F2FE"/>' +
          '<stop offset="100%" stop-color="#BAE6FD"/>' +
        '</radialGradient>' +
        '<filter id="puffGlowFilt" x="-20%" y="-20%" width="140%" height="140%">' +
          '<feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#38BDF8" flood-opacity="0.35"/>' +
        '</filter>' +
      '</defs>' +
      '<g class="puff-cloud-body" filter="url(#puffGlowFilt)">' +
        '<circle cx="50" cy="54" r="28" fill="url(#puffGrad)"/>' +
        '<circle cx="30" cy="58" r="20" fill="url(#puffGrad)"/>' +
        '<circle cx="70" cy="58" r="20" fill="url(#puffGrad)"/>' +
        '<circle cx="39" cy="40" r="22" fill="url(#puffGrad)"/>' +
        '<circle cx="61" cy="40" r="22" fill="url(#puffGrad)"/>' +
      '</g>' +
      '<rect x="36" y="21" width="28" height="15" rx="7.5" fill="#10B981"/>' +
      '<text x="50" y="32" font-size="10" font-weight="900" fill="#FFFFFF" text-anchor="middle" font-family="system-ui,sans-serif">O₂</text>' +
      '<ellipse cx="43" cy="53" rx="3.2" ry="4.2" fill="#0369A1"/>' +
      '<ellipse cx="57" cy="53" rx="3.2" ry="4.2" fill="#0369A1"/>' +
      '<circle cx="44.5" cy="51.5" r="1.3" fill="#FFFFFF"/>' +
      '<circle cx="58.5" cy="51.5" r="1.3" fill="#FFFFFF"/>' +
      '<ellipse cx="36" cy="58" rx="4" ry="2.2" fill="#FDA4AF" opacity="0.85"/>' +
      '<ellipse cx="64" cy="58" rx="4" ry="2.2" fill="#FDA4AF" opacity="0.85"/>' +
      '<path d="M 46 57 Q 50 62 54 57" stroke="#0369A1" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '</svg>';
  }

  function pipSvg(size) {
    var s = size || 80;
    return '<svg class="pip-avatar-svg" viewBox="0 0 100 100" width="' + s + '" height="' + s + '" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="pipBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" stop-color="#FFEDD5"/>' +
          '<stop offset="100%" stop-color="#FB923C"/>' +
        '</linearGradient>' +
        '<linearGradient id="pipLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" stop-color="#4ADE80"/>' +
          '<stop offset="100%" stop-color="#15803D"/>' +
        '</linearGradient>' +
        '<filter id="pipGlowFilt" x="-20%" y="-20%" width="140%" height="140%">' +
          '<feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#15803D" flood-opacity="0.3"/>' +
        '</filter>' +
      '</defs>' +
      '<g class="pip-body-group" filter="url(#pipGlowFilt)">' +
        '<ellipse cx="50" cy="62" rx="25" ry="23" fill="url(#pipBodyGrad)"/>' +
        '<path d="M 26 60 C 26 46, 74 46, 74 60 C 74 77, 26 77, 26 60 Z" fill="url(#pipBodyGrad)"/>' +
      '</g>' +
      '<g class="pip-leaves-group">' +
        '<path d="M 50 44 Q 50 31 50 26" stroke="#15803D" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M 50 30 C 38 22, 30 27, 32 35 C 34 40, 48 37, 50 30 Z" fill="url(#pipLeafGrad)"/>' +
        '<path d="M 50 28 C 62 18, 70 23, 68 31 C 66 37, 52 35, 50 28 Z" fill="url(#pipLeafGrad)"/>' +
      '</g>' +
      '<ellipse cx="42" cy="58" rx="4.2" ry="5.8" fill="#1C1917"/>' +
      '<ellipse cx="58" cy="58" rx="4.2" ry="5.8" fill="#1C1917"/>' +
      '<circle cx="43.5" cy="55.5" r="1.8" fill="#FFFFFF"/>' +
      '<circle cx="59.5" cy="55.5" r="1.8" fill="#FFFFFF"/>' +
      '<ellipse cx="33" cy="63" rx="3.8" ry="2" fill="#FB7185" opacity="0.85"/>' +
      '<ellipse cx="67" cy="63" rx="3.8" ry="2" fill="#FB7185" opacity="0.85"/>' +
      '<path d="M 47 64 Q 50 68 53 64" stroke="#7C2D12" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<path d="M 28 69 Q 50 77 72 69" stroke="#10B981" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
    '</svg>';
  }

  function puffPipHero(badgeText, title, introText, puffQuote, pipQuote) {
    return '<div class="puff-pip-mentor-card">' +
      '<div class="puff-pip-header-bar">' +
        '<div class="form-badge">' + badgeText + '</div>' +
        '<div class="mentor-sync-tag">✨ Mentor Guidance System</div>' +
      '</div>' +
      '<h1>' + esc(title) + '</h1>' +
      '<p class="form-intro">' + esc(introText) + '</p>' +
      '<div class="puff-pip-characters">' +
        '<div class="puff-char-wrap" title="Puff: Wise O₂ Mentor Spirit">' +
          puffSvg(82) +
          '<div class="char-caption">☁️ <strong>Puff</strong><small>O₂ Eco Mentor</small></div>' +
        '</div>' +
        '<div class="dialogue-cloud">' +
          '<div class="dialogue-bubble puff-bubble">' +
            '<div class="speaker-tag">☁️ <strong>Puff asks Pip:</strong></div>' +
            '<p class="speaker-text">“' + esc(puffQuote) + '”</p>' +
          '</div>' +
          '<div class="dialogue-bubble pip-bubble">' +
            '<div class="speaker-tag">🌱 <strong>Pip reflects &amp; shares:</strong></div>' +
            '<p class="speaker-text">“' + esc(pipQuote) + '”</p>' +
          '</div>' +
          '<div class="dialogue-footer-hint">💡 <em>Puff helps Pip articulate gameplay insights with guidelines so the game development team can build an even better game!</em></div>' +
        '</div>' +
        '<div class="pip-char-wrap" title="Pip: Curious Player Explorer Sprout">' +
          pipSvg(82) +
          '<div class="char-caption">🌱 <strong>Pip</strong><small>Explorer Sprout</small></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function puffGuide(prompt, guideline) {
    return '<div class="puff-guidance">' +
      '<div class="puff-guide-badge"><span class="guide-icon">☁️</span><strong>Puff\'s Guide:</strong></div>' +
      '<div class="puff-guide-content">' +
        '<p class="puff-prompt"><strong>Probable Question:</strong> ' + esc(prompt) + '</p>' +
        (guideline ? '<p class="puff-guideline"><strong>Guidelines for Options:</strong> ' + esc(guideline) + '</p>' : '') +
      '</div>' +
    '</div>';
  }

  function pipHandoffCard(summaryText) {
    return '<div class="pip-handoff-card">' +
      '<div class="pip-handoff-avatar">' + pipSvg(54) + '</div>' +
      '<div class="pip-handoff-text">' +
        '<strong>🌱 Pip\'s Feedback Scroll Ready!</strong>' +
        '<p>' + esc(summaryText) + '</p>' +
      '</div>' +
      '<div class="pip-handoff-puff">' + puffSvg(48) + '</div>' +
    '</div>';
  }

  function feedbackSubnav(currentSub) {
    return '<div class="feedback-subnav-container">' +
      '<nav class="feedback-subnav" role="tablist" aria-label="Feedback submenus">' +
        '<a href="#/feedback/chapter" role="tab" class="subnav-tab' + (currentSub === 'chapter' ? ' active' : '') + '" aria-selected="' + (currentSub === 'chapter') + '">' +
          '<span class="subnav-tab-icon">📖</span><span class="subnav-tab-label">Chapter Feedback</span><span class="subnav-tab-badge">Base Farm</span>' +
        '</a>' +
        '<a href="#/feedback/playtest" role="tab" class="subnav-tab' + (currentSub === 'playtest' ? ' active' : '') + '" aria-selected="' + (currentSub === 'playtest') + '">' +
          '<span class="subnav-tab-icon">🎮</span><span class="subnav-tab-label">Full Playtest Review</span><span class="subnav-tab-badge">Overall &amp; NPS</span>' +
        '</a>' +
        '<a href="#/report" role="tab" class="subnav-tab' + (currentSub === 'report' ? ' active' : '') + '" aria-selected="' + (currentSub === 'report') + '">' +
          '<span class="subnav-tab-icon">🐞</span><span class="subnav-tab-label">Report a Problem</span><span class="subnav-tab-badge">Issues</span>' +
        '</a>' +
      '</nav>' +
    '</div>';
  }

  function pageFeedback(arg) {
    var sub = arg === 'playtest' ? 'playtest' : 'chapter';
    if (sub === 'playtest') {
      pagePlaytestReview();
    } else {
      pageChapterFeedback();
    }
  }

  /* 1. Chapter Feedback (SearchO2_Forms_Chapter_Feedback.docx) */
  function pageChapterFeedback() {
    main.innerHTML = puffPipHero(
      '<span class="badge-icon">📖</span> Form 1 · Chapter Experience',
      'SearchO₂ Chapter Feedback',
      'Tell us about the chapter you just played. This takes about two minutes and helps us improve clarity, difficulty and progression.',
      'Hey Pip! How did your journey through Base Farm feel? Let me know so we can tune the soil, crops, and O₂ flow!',
      'Here is what happened on my plot, Puff! I want to share my honest thoughts so the dev team can make our next chapter even better.'
    ) +
    feedbackSubnav('chapter') +
    '<form class="form" id="fbForm" novalidate>' +
      '<div class="form-section-card">' +
        '<h2 class="form-section-heading"><span class="form-section-num">1</span> Your play session</h2>' +
        '<fieldset class="field">' +
          '<legend class="lbl">1. Which chapter are you reviewing from Base Farm?</legend>' +
          puffGuide('Which chapter plot did you just cultivate in Base Farm?', 'Select the chapter (1 to 8) so our dev team can target that specific stage.') +
          '<div class="radios">' +
            ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5', 'Chapter 6', 'Chapter 7', 'Chapter 8'].map(function (c, i) {
              return '<label><input type="radio" name="chapter" value="' + c + '"' + (i === 0 ? ' checked' : '') + '><span>' + c + '</span></label>';
            }).join('') +
          '</div>' +
        '</fieldset>' +
        '<fieldset class="field">' +
          '<legend class="lbl">2. Were you able to complete this chapter?</legend>' +
          puffGuide('Were you able to bring this chapter to harvest?', 'Choose whether you finished without help, needed a guide/hint, got stuck on a puzzle/resource, or had another experience.') +
          '<div class="radios">' +
            ['Yes, without help', 'Yes, with help', 'Not yet — I got stuck', 'Other'].map(function (co, i) {
              return '<label><input type="radio" name="completed" value="' + co + '"' + (i === 0 ? ' checked' : '') + '><span>' + co + '</span></label>';
            }).join('') +
          '</div>' +
          '<div id="chCompletedOtherWrap" style="margin-top:10px;display:none;">' +
            '<input type="text" name="completedOther" id="chCompletedOther" placeholder="Please specify your completion status..." maxlength="255">' +
          '</div>' +
        '</fieldset>' +
      '</div>' +
      '<div class="form-section-card">' +
        '<h2 class="form-section-heading"><span class="form-section-num">2</span> Chapter experience</h2>' +
        '<fieldset class="field" id="chClarityField">' +
          '<legend class="lbl">3. How clear was what you needed to do? <span class="req">*</span></legend>' +
          puffGuide('How clear was your objective path on screen?', 'Rate from 1 (foggy & confused) to 5 (crystal clear like alpine spring water).') +
          '<div class="scale-5-group" id="fbRate">' +
            '<label class="scale-5-item"><input type="radio" name="clarityRating" value="1"><span class="scale-pill"><span class="scale-num">1</span><span class="scale-label">1 — Not clear at all</span></span></label>' +
            '<label class="scale-5-item"><input type="radio" name="clarityRating" value="2"><span class="scale-pill"><span class="scale-num">2</span><span class="scale-label">2</span></span></label>' +
            '<label class="scale-5-item"><input type="radio" name="clarityRating" value="3"><span class="scale-pill"><span class="scale-num">3</span><span class="scale-label">3</span></span></label>' +
            '<label class="scale-5-item"><input type="radio" name="clarityRating" value="4"><span class="scale-pill"><span class="scale-num">4</span><span class="scale-label">4</span></span></label>' +
            '<label class="scale-5-item"><input type="radio" name="clarityRating" value="5" checked><span class="scale-pill"><span class="scale-num">5</span><span class="scale-label">5 — Completely clear</span></span></label>' +
          '</div>' +
          '<div class="err" role="alert"></div>' +
        '</fieldset>' +
        '<fieldset class="field">' +
          '<legend class="lbl">4. How did the difficulty feel?</legend>' +
          puffGuide('How did the gameplay difficulty and pacing feel?', '1 = Much too easy, 3 = balanced rhythm, 5 = Much too difficult. Help us tune the challenge!') +
          '<div class="scale-5-group" id="fbDiffRate">' +
            '<label class="scale-5-item"><input type="radio" name="difficulty" value="1 — Much too easy"><span class="scale-pill"><span class="scale-num">1</span><span class="scale-label">1 — Much too easy</span></span></label>' +
            '<label class="scale-5-item"><input type="radio" name="difficulty" value="2"><span class="scale-pill"><span class="scale-num">2</span><span class="scale-label">2</span></span></label>' +
            '<label class="scale-5-item"><input type="radio" name="difficulty" value="3" checked><span class="scale-pill"><span class="scale-num">3</span><span class="scale-label">3</span></span></label>' +
            '<label class="scale-5-item"><input type="radio" name="difficulty" value="4"><span class="scale-pill"><span class="scale-num">4</span><span class="scale-label">4</span></span></label>' +
            '<label class="scale-5-item"><input type="radio" name="difficulty" value="5 — Much too difficult"><span class="scale-pill"><span class="scale-num">5</span><span class="scale-label">5 — Much too difficult</span></span></label>' +
          '</div>' +
        '</fieldset>' +
        '<fieldset class="field">' +
          '<legend class="lbl">5. What was the main source of confusion or frustration?</legend>' +
          puffGuide('What was the main friction point that slowed Pip down?', 'Identify what was puzzling: finding objectives, controls, action choice, O₂ mechanics, coins/EUR, reading screen text, technical glitches, or smooth sailing.') +
          '<div class="radios">' +
            ['Finding the objective', 'Understanding the controls', 'Knowing which action to take', 'Understanding O₂', 'Earning or spending EUR', 'Reading the screen', 'A technical problem', 'Nothing was confusing', 'Other'].map(function (cf, i) {
              return '<label><input type="radio" name="confusionSource" value="' + cf + '"' + (i === 7 ? ' checked' : '') + '><span>' + cf + '</span></label>';
            }).join('') +
          '</div>' +
          '<div id="chConfusionOtherWrap" style="margin-top:10px;display:none;">' +
            '<input type="text" name="confusionSourceOther" id="chConfusionOther" placeholder="Please describe other source of confusion..." maxlength="255">' +
          '</div>' +
        '</fieldset>' +
        '<div class="field">' +
          '<label class="lbl" for="chClarityFb">6. What happened, or what would make it clearer?</label>' +
          puffGuide('What happened on your plot, or what would make it clearer?', 'Share your direct player perspective or feature suggestions with Puff and the engineers!') +
          '<textarea id="chClarityFb" name="clarityFeedback" maxlength="3000" rows="3" placeholder="Share your experience or suggestion for improvement..."></textarea>' +
          '<div class="err" role="alert"></div>' +
        '</div>' +
        '<fieldset class="field">' +
          '<legend class="lbl">7. Did you want to continue playing afterward?</legend>' +
          puffGuide('Did completing this chapter leave you excited for the next chapter?', 'Tell us how eager you feel to continue your journey across SearchO₂.') +
          '<div class="radios">' +
            ['Definitely yes', 'Probably yes', 'Not sure', 'Probably not', 'Definitely not'].map(function (cp, i) {
              return '<label><input type="radio" name="continueIntent" value="' + cp + '"' + (i === 0 ? ' checked' : '') + '><span>' + cp + '</span></label>';
            }).join('') +
          '</div>' +
        '</fieldset>' +
        '<div class="field">' +
          '<label class="lbl" for="chEmail">Optional email address if you agree that Artifactz may contact you about this feedback.</label>' +
          '<input type="email" id="chEmail" name="email" autocomplete="email" placeholder="name@example.com">' +
          '<div class="hint">Only if you agree that Artifactz may contact you about this feedback.</div>' +
          '<div class="err" role="alert"></div>' +
        '</div>' +
      '</div>' +
      pipHandoffCard('Pip has packaged your chapter feedback for the SearchO₂ development team. Click send to deliver your experience!') +
      '<div><button class="btn gold" type="submit" id="fbSend"><span class="btn-icon">🌿</span> Send chapter feedback</button></div>' +
      '<div id="fbOut" aria-live="polite"></div>' +
    '</form>' + outboxHtml();

    wireOutbox();
    var form = $('#fbForm');
    form.querySelectorAll('input[name="completed"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var wrap = $('#chCompletedOtherWrap');
        if (wrap) wrap.style.display = (r.value === 'Other' && r.checked) ? 'block' : 'none';
      });
    });
    form.querySelectorAll('input[name="confusionSource"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var wrap = $('#chConfusionOtherWrap');
        if (wrap) wrap.style.display = (r.value === 'Other' && r.checked) ? 'block' : 'none';
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(form);
      var d = new FormData(form), bad = false;
      var clarity = d.get('clarityRating');
      if (!clarity) { fieldErr($('#chClarityField'), 'Please rate how clear the chapter was (1 to 5).'); bad = true; }
      var em = String(d.get('email') || '').trim();
      if (em && !validEmail(em)) { fieldErr($('#chEmail'), 'That email address does not look right. Check it or leave it empty.'); bad = true; }
      if (bad) { var first = $('.field.bad input, .field.bad textarea', form); if (first) first.focus(); return; }
      var compVal = d.get('completed') || null;
      var compOther = String(d.get('completedOther') || '').trim();
      var confVal = d.get('confusionSource') || null;
      var confOther = String(d.get('confusionSourceOther') || '').trim();
      var diffVal = d.get('difficulty') || null;
      var diffNum = diffVal ? parseInt(diffVal, 10) : null;
      submit({
        type: 'chapter_feedback',
        chapter: d.get('chapter') || 'Chapter 1',
        completed: compVal,
        completedOther: compOther || null,
        completedWithOther: (compVal === 'Other' && compOther) ? ('Other: ' + compOther) : compVal,
        clarityRating: Number(clarity),
        difficulty: diffVal,
        difficultyRating: isNaN(diffNum) ? null : diffNum,
        confusionSource: confVal,
        confusionSourceOther: confOther || null,
        confusionSourceWithOther: (confVal === 'Other' && confOther) ? ('Other: ' + confOther) : confVal,
        clarityFeedback: String(d.get('clarityFeedback') || '').trim() || null,
        continueIntent: d.get('continueIntent') || null,
        email: em || null,
        map: selectedId()
      }, form, $('#fbSend'), $('#fbOut'));
    });
  }

  /* 2. Full Playtest Review (SearchO2_Forms_Full_Playtest_Review.docx) */
  function pagePlaytestReview() {
    var likertOpts = ['1 — Very poor', '2', '3', '4', '5 — Very good'];
    function likertField(name, qText, defIdx) {
      return '<fieldset class="field"><legend class="lbl">' + esc(qText) + '</legend>' +
        '<div class="scale-5-group">' +
          likertOpts.map(function (opt, i) {
            var num = i + 1;
            return '<label class="scale-5-item"><input type="radio" name="' + name + '" value="' + opt + '"' + (i === (defIdx != null ? defIdx : 2) ? ' checked' : '') + '><span class="scale-pill"><span class="scale-num">' + num + '</span><span class="scale-label">' + esc(opt) + '</span></span></label>';
          }).join('') +
        '</div>' +
      '</fieldset>';
    }

    var npsButtons = [];
    for (var i = 0; i <= 10; i++) {
      npsButtons.push('<label><input type="radio" name="npsRecommend" value="' + i + '"' + (i === 10 ? ' checked' : '') + '><span class="nps-box">' + i + '</span></label>');
    }

    main.innerHTML = puffPipHero(
      '<span class="badge-icon">🎮</span> Form 2 · Full Playtest Review',
      'SearchO₂ Full Playtest Review',
      'For players who have completed more than one SearchO₂ play session. This takes about four minutes.',
      'Look how tall you\\'ve grown, Pip! You\\'ve spent multiple sessions exploring our world. Help me evaluate the mechanics, visuals, and stability so we can cultivate an even richer planetary ecosystem!',
      'I\\'ve seen the whole ecosystem in action, Puff! Let\\'s grade the game elements and share my honest feedback to help the devs build the ultimate eco-farming universe.'
    ) +
    feedbackSubnav('playtest') +
    '<form class="form" id="ptForm" novalidate>' +
      '<div class="form-section-card">' +
        '<h2 class="form-section-heading"><span class="form-section-num">1</span> Player context</h2>' +
        '<fieldset class="field">' +
          '<legend class="lbl">1. How often do you play simulation or management games?</legend>' +
          puffGuide('How often do you play simulation or management games?', 'Tells our balance team whether you are a brand new seedling or a seasoned agro-forestry master!') +
          '<div class="radios">' +
            ['Never', 'Occasionally', 'Monthly', 'Weekly or more'].map(function (f, i) {
              return '<label><input type="radio" name="genreFrequency" value="' + f + '"' + (i === 1 ? ' checked' : '') + '><span>' + f + '</span></label>';
            }).join('') +
          '</div>' +
        '</fieldset>' +
      '</div>' +
      '<div class="form-section-card">' +
        '<h2 class="form-section-heading"><span class="form-section-num">2</span> Overall experience</h2>' +
        puffGuide('How would you grade your overall gameplay experience?', 'Scale: 1 = Very poor (needs urgent work), 3 = Acceptable, 5 = Very good (delightful, polished and rewarding).') +
        likertField('rateEaseOfLearning', '2. How would you rate the ease of learning?', 3) +
        likertField('rateNavigation', '4. How would you rate the navigation?', 3) +
        likertField('rateVisualReadability', '5. How would you rate the visual readability?', 3) +
        likertField('rateClarityOfObjectives', '6. How would you rate the clarity of objectives?', 3) +
        likertField('rateUnderstandingO2', '7. How would you rate your understanding of the O₂ system?', 3) +
        likertField('rateEnjoyment', '8. How would you rate your enjoyment?', 3) +
        likertField('rateGameStability', '9. How would you rate the game stability?', 3) +
        '<fieldset class="field">' +
          '<legend class="lbl">10. Did any visual element make the game difficult to use?</legend>' +
          puffGuide('Did any visual element make the game difficult to use?', 'Did colors, contrast, fonts, or icons strain your eyes or feel hard to locate?') +
          '<div class="radios">' +
            ['Yes', 'No', 'Not sure'].map(function (vo, i) {
              return '<label><input type="radio" name="visualDifficulty" value="' + vo + '"' + (i === 1 ? ' checked' : '') + '><span>' + vo + '</span></label>';
            }).join('') +
          '</div>' +
        '</fieldset>' +
        '<fieldset class="field">' +
          '<legend class="lbl">11. Which visual element most needs improvement?</legend>' +
          puffGuide('Which visual element most needs improvement?', 'Pinpoint which screen element our artists and UI designers should refine first.') +
          '<div class="radios">' +
            ['Text size', 'Contrast or colours', 'Map', 'O₂ display', 'EUR/resources display', 'Missions/objectives', 'Menus', 'Region screen', 'Other'].map(function (ve, i) {
              return '<label><input type="radio" name="visualElementImprovement" value="' + ve + '"' + (i === 8 ? ' checked' : '') + '><span>' + ve + '</span></label>';
            }).join('') +
          '</div>' +
          '<div id="ptVisualImprovementOtherWrap" style="margin-top:10px;display:none;">' +
            '<input type="text" name="visualElementImprovementOther" id="ptVisualImprovementOther" placeholder="Please specify visual element..." maxlength="255">' +
          '</div>' +
        '</fieldset>' +
      '</div>' +
      '<div class="form-section-card">' +
        '<h2 class="form-section-heading"><span class="form-section-num">3</span> Value and return intent</h2>' +
        '<div class="field">' +
          '<label class="lbl" for="ptStrongest">12. What is the strongest part of SearchO₂?</label>' +
          puffGuide('What is the strongest part of SearchO₂?', 'What mechanic, visual, or moment felt most rewarding and memorable to Pip?') +
          '<textarea id="ptStrongest" name="strongestPart" maxlength="3000" rows="3" placeholder="What worked best, felt most engaging, or was most memorable?"></textarea>' +
          '<div class="err" role="alert"></div>' +
        '</div>' +
        '<div class="field">' +
          '<label class="lbl" for="ptChange">13. If you could change only one thing, what would it be?</label>' +
          puffGuide('If you could change only one thing, what would it be?', 'The single highest-priority improvement or addition you wish for.') +
          '<textarea id="ptChange" name="changeOneThing" maxlength="3000" rows="3" placeholder="The single most important improvement or adjustment..."></textarea>' +
          '<div class="err" role="alert"></div>' +
        '</div>' +
        '<fieldset class="field">' +
          '<legend class="lbl">14. How disappointed would you be if SearchO₂ were no longer available?</legend>' +
          puffGuide('How would you feel if SearchO₂ were no longer available?', 'Helps us measure player connection and attachment to the game world.') +
          '<div class="radios">' +
            ['Very disappointed', 'Somewhat disappointed', 'Not disappointed', 'I haven’t played enough to say'].map(function (dl, i) {
              return '<label><input type="radio" name="disappointmentLevel" value="' + dl + '"' + (i === 0 ? ' checked' : '') + '><span>' + dl + '</span></label>';
            }).join('') +
          '</div>' +
        '</fieldset>' +
        '<fieldset class="field">' +
          '<legend class="lbl">15. How likely are you to recommend SearchO₂ to someone interested in simulation, science or sustainability?</legend>' +
          puffGuide('How likely are you to recommend SearchO₂ to a friend?', 'NPS scale from 0 (Not at all likely) to 10 (Extremely likely).') +
          '<div class="nps-container">' +
            '<div class="scale-grid">' + npsButtons.join('') + '</div>' +
            '<div class="nps-labels"><span>0 — Not at all likely</span><span>10 — Extremely likely</span></div>' +
          '</div>' +
        '</fieldset>' +
        '<div class="field">' +
          '<label class="lbl" for="ptEmail">Optional email address if you agree that Artifactz may contact you about this review.</label>' +
          '<input type="email" id="ptEmail" name="email" autocomplete="email" placeholder="name@example.com">' +
          '<div class="hint">Only if you agree that Artifactz may contact you about this review.</div>' +
          '<div class="err" role="alert"></div>' +
        '</div>' +
      '</div>' +
      pipHandoffCard('Pip has packaged your full playtest review. Every rating helps the game grow greener and stronger!') +
      '<div><button class="btn gold" type="submit" id="ptSend"><span class="btn-icon">🌟</span> Send playtest review</button></div>' +
      '<div id="ptOut" aria-live="polite"></div>' +
    '</form>' + outboxHtml();

    wireOutbox();
    var form = $('#ptForm');
    form.querySelectorAll('input[name="visualElementImprovement"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var wrap = $('#ptVisualImprovementOtherWrap');
        if (wrap) wrap.style.display = (r.value === 'Other' && r.checked) ? 'block' : 'none';
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(form);
      var d = new FormData(form), bad = false;
      var em = String(d.get('email') || '').trim();
      if (em && !validEmail(em)) { fieldErr($('#ptEmail'), 'That email address does not look right. Check it or leave it empty.'); bad = true; }
      if (bad) { var first = $('.field.bad input, .field.bad textarea', form); if (first) first.focus(); return; }
      var visVal = d.get('visualElementImprovement') || null;
      var visOther = String(d.get('visualElementImprovementOther') || '').trim();
      submit({
        type: 'playtest_review',
        genreFrequency: d.get('genreFrequency') || null,
        rateEaseOfLearning: d.get('rateEaseOfLearning') || null,
        rateNavigation: d.get('rateNavigation') || null,
        rateVisualReadability: d.get('rateVisualReadability') || null,
        rateClarityOfObjectives: d.get('rateClarityOfObjectives') || null,
        rateUnderstandingO2: d.get('rateUnderstandingO2') || null,
        rateEnjoyment: d.get('rateEnjoyment') || null,
        rateGameStability: d.get('rateGameStability') || null,
        visualDifficulty: d.get('visualDifficulty') || null,
        visualElementImprovement: visVal,
        visualElementImprovementOther: visOther || null,
        visualElementImprovementWithOther: (visVal === 'Other' && visOther) ? ('Other: ' + visOther) : visVal,
        strongestPart: String(d.get('strongestPart') || '').trim() || null,
        changeOneThing: String(d.get('changeOneThing') || '').trim() || null,
        disappointmentLevel: d.get('disappointmentLevel') || null,
        npsRecommend: d.get('npsRecommend') != null && d.get('npsRecommend') !== '' ? Number(d.get('npsRecommend')) : null,
        email: em || null,
        map: selectedId()
      }, form, $('#ptSend'), $('#ptOut'));
    });
  }

  /* 3. Report a Problem (SearchO2_Forms_Report_a_Problem.docx) */
  function pageReport() {
    var curMap = selectedId();
    var defaultArea = curMap === 'bavaria' ? 'Bavaria - Alpenhof' : curMap === 'saint_martin' ? 'Saint Martin - BlueLab' : 'Base Farm - Chapter 1';
    var defaultAreas = ['Getting started or account', 'Base Farm - Chapter 1', 'Base Farm - Chapter 2', 'Base Farm - Chapter 3', 'Base Farm - Chapter 4', 'Base Farm - Chapter 5', 'Base Farm - Chapter 6', 'Base Farm - Chapter 7', 'Base Farm - Chapter 8', 'Saint Martin - BlueLab', 'Bavaria - Alpenhof', 'Menus or settings', 'Another location', 'I’m not sure'];

    main.innerHTML = puffPipHero(
      '<span class="badge-icon">🛠️</span> Support &amp; Issue Tracking',
      'SearchO₂ Report a Problem',
      'Use this form when something does not work as expected. Do not include passwords, payment details or other sensitive information.',
      'Uh oh, Pip! Did a glitch sprout in your garden or did a screen freeze? Don\\'t worry—let\\'s trace your steps together so the game dev team can fix it right away!',
      'Thanks for having my back, Puff! Something wasn\\'t working right on my screen. Let me show you where it happened so our engineers can squash the bug!'
    ) +
    feedbackSubnav('report') +
    '<form class="form" id="rpForm" novalidate>' +
      '<div class="form-section-card">' +
        '<h2 class="form-section-heading"><span class="form-section-num">1</span> Problem details</h2>' +
        '<div class="field">' +
          '<label class="lbl" for="rpTitle">1. Short title for the problem <span class="req">*</span></label>' +
          puffGuide('Short title for the problem', 'A concise summary so developers can categorize the issue at a glance.') +
          '<input type="text" id="rpTitle" name="title" maxlength="255" placeholder="Brief summary of what went wrong..." required>' +
          '<div class="err" role="alert"></div>' +
        '</div>' +
        '<fieldset class="field">' +
          '<legend class="lbl">2. Where did the problem happen? <span class="req">*</span></legend>' +
          puffGuide('Where did the problem happen?', 'Choose the exact chapter, region (like Bavaria - Alpenhof or Saint Martin - BlueLab), or menu.') +
          '<div class="radios" id="rpAreaRadios">' +
            defaultAreas.map(function (a) {
              return '<label><input type="radio" name="area" value="' + a + '"' + (a === defaultArea ? ' checked' : '') + '><span>' + a + '</span></label>';
            }).join('') +
          '</div>' +
          '<div class="err" role="alert"></div>' +
        '</fieldset>' +
        '<div class="field">' +
          '<label class="lbl" for="rpTrying">4. What were you trying to do?</label>' +
          puffGuide('What was Pip trying to do?', 'Describe the harvest, building, menu, or movement action you initiated.') +
          '<textarea id="rpTrying" name="tryingToDo" maxlength="2000" rows="3" placeholder="Describe the goal or action you were attempting..."></textarea>' +
          '<div class="err" role="alert"></div>' +
        '</div>' +
        '<div class="field">' +
          '<label class="lbl" for="rpWhat">5. What happened? <span class="req">*</span></label>' +
          puffGuide('What actually happened?', 'Describe the glitch, error message, freeze, or visual defect that appeared.') +
          '<textarea id="rpWhat" name="whatHappened" maxlength="3000" rows="4" placeholder="Describe what actually happened or went wrong..." required></textarea>' +
          '<div class="err" role="alert"></div>' +
        '</div>' +
        '<div class="field">' +
          '<label class="lbl" for="rpExp">6. What did you expect to happen?</label>' +
          puffGuide('What did you expect to happen?', 'Describe the normal expected game behavior.') +
          '<textarea id="rpExp" name="expected" maxlength="2000" rows="3" placeholder="Describe what should have occurred instead..."></textarea>' +
          '<div class="err" role="alert"></div>' +
        '</div>' +
      '</div>' +
      '<div class="form-section-card">' +
        '<h2 class="form-section-heading"><span class="form-section-num">2</span> Reproduction and impact</h2>' +
        '<fieldset class="field">' +
          '<legend class="lbl">7. Can you reproduce the problem?</legend>' +
          puffGuide('Can you reproduce the problem?', 'Let developers know if this bug occurs consistently or only once.') +
          '<div class="radios">' +
            ['Every time', 'Sometimes', 'Only once', 'I haven’t tried again'].map(function (r, i) {
              return '<label><input type="radio" name="reproduce" value="' + r + '"' + (i === 0 ? ' checked' : '') + '><span>' + r + '</span></label>';
            }).join('') +
          '</div>' +
        '</fieldset>' +
        '<fieldset class="field">' +
          '<legend class="lbl">8. How much did the problem affect your play?</legend>' +
          puffGuide('How much did the problem affect your play?', 'From a minor graphical blip to blocking chapter progression or crashing.') +
          '<div class="radios">' +
            ['Minor inconvenience', 'Made gameplay difficult', 'Blocked my progress', 'Made the game unusable'].map(function (im, i) {
              return '<label><input type="radio" name="impact" value="' + im + '"' + (i === 1 ? ' checked' : '') + '><span>' + im + '</span></label>';
            }).join('') +
          '</div>' +
        '</fieldset>' +
        '<div class="field">' +
          '<label class="lbl" for="rpDevice">9. Which device and browser were you using?</label>' +
          '<input type="text" id="rpDevice" name="deviceBrowser" maxlength="255" value="' + esc(detectDeviceBrowser()) + '" placeholder="e.g. Windows 11 · Chrome 129 / iPhone 15 · Safari">' +
          '<div class="hint">Automatically detected from your current browser, editable if reporting for another device.</div>' +
        '</div>' +
        '<div class="field">' +
          '<label class="lbl" for="rpEmail">10. Optional email address if you agree that Artifactz may contact you about this report.</label>' +
          '<input type="email" id="rpEmail" name="email" autocomplete="email" placeholder="name@example.com">' +
          '<div class="hint">Only if you agree that Artifactz may contact you about this report.</div>' +
          '<div class="err" role="alert"></div>' +
        '</div>' +
        '<div>' +
          '<label class="check"><input type="checkbox" name="diag" id="rpDiag" checked><span>Add technical diagnostics to help us isolate the cause</span></label>' +
          '<p class="hint" style="margin:8px 0 6px">This includes your screen resolution, browser user agent, and selected region. No passwords or personal data are included.</p>' +
          '<div class="diag" id="rpDiagBox"></div>' +
        '</div>' +
      '</div>' +
      pipHandoffCard('Pip and Puff have packaged your bug report and diagnostic telemetry. Our engineers are on the case!') +
      '<div><button class="btn gold" type="submit" id="rpSend"><span class="btn-icon">🚀</span> Send report</button></div>' +
      '<div id="rpOut" aria-live="polite"></div>' +
    '</form>' + outboxHtml();

    wireOutbox();
    var form = $('#rpForm'), box = $('#rpDiagBox');
    box.textContent = diagnostics();
    $('#rpDiag').addEventListener('change', function (e) { box.style.display = e.target.checked ? '' : 'none'; });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(form);
      var d = new FormData(form), bad = false;`;

if (!oldFeedbackSubnavRegex.test(hubJs)) {
  console.error('ERROR: oldFeedbackSubnavRegex failed to match in hub.js');
  process.exit(1);
}
hubJs = hubJs.replace(oldFeedbackSubnavRegex, newFeedbackAndPuffPipBlock);

fs.writeFileSync(hubJsPath, hubJs, 'utf8');
console.log('✓ Successfully updated hub.js');

console.log('3. Updating Typography, Spacing, and Puff & Pip animations in hub.css...');

// In hub.css, replace forms styles and dropdown styles
const oldLegendRegex = /legend,\.lbl\{font-weight:800;margin-bottom:6px;display:block;padding:0\}/;
const newLegend = `legend,.lbl{font-size:1.12rem;font-weight:800;color:#064E3B;margin-bottom:14px;display:block;padding:0;line-height:1.45;letter-spacing:-0.01em}
.field{margin-bottom:28px}`;
hubCss = hubCss.replace(oldLegendRegex, newLegend);

// Update radios span font-size (option text smaller than question text)
hubCss = hubCss.replace(
  /\.radios span\{display:inline-block;padding:7px 15px;border-radius:99px;border:2px solid var\(--line\);background:#fff;font-weight:800\}/,
  `.radios span{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:99px;border:2px solid var(--line);background:#fff;font-size:0.88rem;font-weight:700;color:#1E293B;line-height:1.35;transition:all 0.15s ease}`
);

// Update form-section-card margin and padding
hubCss = hubCss.replace(
  /\.form-section-card \{\s*background: #fff;\s*border: 1\.5px solid rgba\(31, 58, 42, 0\.14\);\s*border-radius: 16px;\s*padding: 24px;\s*margin-bottom: 22px;\s*box-shadow: 0 4px 18px rgba\(31, 58, 42, 0\.05\);\s*\}/,
  `.form-section-card {
  background: #fff;
  border: 1.5px solid rgba(31, 58, 42, 0.14);
  border-radius: 20px;
  padding: 30px 32px;
  margin-bottom: 38px;
  box-shadow: 0 6px 24px rgba(31, 58, 42, 0.06);
}`
);

// Remove old navbar dropdown css and append Puff & Pip animations
const oldNavDropdownRegex = /\/\* Navbar Feedback Dropdown \*\/[\s\S]*?\/\* Feedback Subnav Tabs Bar \*\//;

const newPuffPipCss = `/* ==========================================================================
   PUFF & PIP MENTOR SYSTEM, NARRATIVE GUIDANCE & VISUAL ELEVATION
   ========================================================================== */

/* Keyframe animations for floating mentor Puff and swaying seedling Pip */
@keyframes puffFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-7px) rotate(1.8deg); }
}
@keyframes puffGlow {
  0%, 100% { filter: drop-shadow(0 4px 10px rgba(56, 189, 248, 0.35)); }
  50% { filter: drop-shadow(0 6px 18px rgba(56, 189, 248, 0.65)); }
}
@keyframes pipSway {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(1.5deg); }
}
@keyframes pipLeafWiggle {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(8deg); }
}
@keyframes sparkPop {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
}

/* Puff & Pip Hero Mentor Card */
.puff-pip-mentor-card {
  background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 50%, #E0F2FE 100%);
  border: 2px solid #86EFAC;
  border-radius: 22px;
  padding: 26px 30px;
  margin-bottom: 24px;
  box-shadow: 0 8px 26px rgba(16, 185, 129, 0.12);
  position: relative;
  overflow: hidden;
}
.puff-pip-mentor-card::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
  pointer-events: none;
}
.puff-pip-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.mentor-sync-tag {
  font-size: 0.82rem;
  font-weight: 800;
  color: #065F46;
  background: #D1FAE5;
  border: 1px solid #A7F3D0;
  padding: 3px 10px;
  border-radius: 99px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.puff-pip-characters {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 18px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  padding: 20px 24px;
  border-radius: 18px;
  border: 1.5px solid rgba(16, 185, 129, 0.25);
  box-shadow: 0 4px 14px rgba(6, 78, 59, 0.05);
}
.puff-char-wrap, .pip-char-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-shrink: 0;
}
.puff-char-wrap .puff-avatar-svg {
  animation: puffFloat 3.8s ease-in-out infinite, puffGlow 3.8s ease-in-out infinite;
}
.pip-char-wrap .pip-avatar-svg {
  animation: pipSway 3.2s ease-in-out infinite;
}
.pip-char-wrap .pip-leaves-group {
  transform-origin: 50% 40%;
  animation: pipLeafWiggle 2.8s ease-in-out infinite;
}
.char-caption {
  font-size: 0.84rem;
  font-weight: 800;
  color: var(--pine);
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.15;
}
.char-caption small {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--leaf);
}
.dialogue-cloud {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dialogue-bubble {
  padding: 12px 16px;
  border-radius: 14px;
  border: 1.5px solid transparent;
  position: relative;
}
.puff-bubble {
  background: #F0F9FF;
  border-color: #BAE6FD;
}
.pip-bubble {
  background: #F0FDF4;
  border-color: #BBF7D0;
}
.speaker-tag {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--pine);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.speaker-text {
  font-size: 0.94rem;
  color: #1E293B;
  font-weight: 600;
  line-height: 1.45;
  margin: 0;
}
.dialogue-footer-hint {
  font-size: 0.82rem;
  color: #047857;
  font-weight: 600;
  margin-top: 2px;
}

/* In-Question Puff Guidance Bubble */
.puff-guidance {
  background: #F0FDF4;
  border-left: 4px solid #10B981;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.puff-guide-badge {
  font-size: 0.8rem;
  font-weight: 900;
  color: #065F46;
  display: flex;
  align-items: center;
  gap: 5px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.puff-guide-content {
  font-size: 0.88rem;
  line-height: 1.4;
  color: #1F2937;
}
.puff-prompt {
  margin: 0 0 3px 0;
  color: #065F46;
}
.puff-guideline {
  margin: 0;
  color: #374151;
  font-size: 0.85rem;
}

/* Pip Handoff Card before Submit */
.pip-handoff-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%);
  border: 2px dashed #10B981;
  border-radius: 18px;
  padding: 16px 20px;
  margin-top: 10px;
  margin-bottom: 16px;
}
.pip-handoff-avatar .pip-avatar-svg {
  animation: pipSway 2.5s ease-in-out infinite;
}
.pip-handoff-puff .puff-avatar-svg {
  animation: puffFloat 3.2s ease-in-out infinite;
}
.pip-handoff-text {
  flex: 1;
}
.pip-handoff-text strong {
  display: block;
  font-size: 0.95rem;
  color: var(--pine);
  margin-bottom: 3px;
}
.pip-handoff-text p {
  font-size: 0.88rem;
  color: #047857;
  font-weight: 600;
  margin: 0;
  line-height: 1.35;
}

@media (max-width: 720px) {
  .puff-pip-characters {
    flex-direction: column;
    padding: 16px 14px;
    gap: 14px;
  }
  .puff-char-wrap, .pip-char-wrap {
    flex-direction: row;
    gap: 10px;
  }
  .char-caption {
    align-items: flex-start;
  }
}

/* Feedback Subnav Tabs Bar */`;

hubCss = hubCss.replace(oldNavDropdownRegex, newPuffPipCss);

fs.writeFileSync(hubCssPath, hubCss, 'utf8');
console.log('✓ Successfully updated hub.css');

// Bump cache buster in hub/index.html
const timestamp = Date.now();
hubHtml = hubHtml.replace(/hub\.css\?v=\d+/g, 'hub.css?v=' + timestamp);
hubHtml = hubHtml.replace(/hub\.js\?v=\d+/g, 'hub.js?v=' + timestamp);
fs.writeFileSync(hubHtmlPath, hubHtml, 'utf8');
console.log('✓ Successfully bumped cache busters in hub/index.html to v=' + timestamp);

console.log('All files updated successfully!');
