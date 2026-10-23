/* searchO2 Learning Hub
 * Vanilla, no build step. Content comes from data/content.js, which
 * scripts/build-hub-data.mjs generates from index.html (re-run it after
 * changing game data).
 */
(function () {
  'use strict';

  var D = window.HUB_CONTENT;
  var main = document.getElementById('main');
  if (!D) {
    main.innerHTML = '<div class="empty"><h2>Hub content is missing</h2><p>Run <code>node scripts/build-hub-data.mjs</code> to create <code>hub/data/content.js</code>.</p></div>';
    return;
  }

  /* ------------------------------------------------------------------ *
   * Config
   * ------------------------------------------------------------------ */
  var HUB_VERSION = '1.0';
  var SAVE_KEY = 'searchO2-save-v4';            // the game's own save slot
  var SELECT_KEY = 'searchO2_selected_region';  // written by index.html when the globe selection changes
  var OUTBOX_KEY = 'searchO2_hub_outbox';
  var QUIZ_KEY = 'searchO2_hub_quiz_best';
  // Same rule the game's ApiClient uses: explicit override, else local dev server, else same-origin /api
  // (the Cloudflare worker proxies /api to the backend).
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API_BASE = window.SEARCHO2_API_BASE || (isLocal ? 'http://localhost:5000/api' : location.origin + '/api');
  var FEEDBACK_ENDPOINT = API_BASE + '/feedback';

  // Where each map sends the player. Anything not listed is still locked in the game,
  // so it opens the globe with that region centred.
  var DEST = {
    germany: '../index.html?enter=farm',
    bavaria: '../bavaria/alpenhof.html',
    saint_martin: '../saint-martin/blue-lab.html'
  };

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function num(n) { return Number(n || 0).toLocaleString('en-US'); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function sample(a, n) { return shuffle(a).slice(0, n); }
  function lsGet(k, fallback) {
    try { var v = localStorage.getItem(k); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsJSON(k, fallback) { try { return JSON.parse(lsGet(k, '')) || fallback; } catch (e) { return fallback; } }
  function biome(id) { return D.biomes.filter(function (b) { return b.id === id; })[0]; }
  function mdBold(s) { // "Lead: rest" -> <b>Lead:</b> rest (input is escaped first)
    var i = s.indexOf(':');
    if (i > 0 && i < 60) return '<b>' + esc(s.slice(0, i + 1)) + '</b>' + esc(s.slice(i + 1));
    return esc(s);
  }
  var REGION_LABEL = { germany: 'Germany', sweden: 'Sweden', brazil: 'Brazil', spain: 'Spain', saint_martin: 'Saint Martin' };

  /* ------------------------------------------------------------------ *
   * Selected map (shared with the game through localStorage)
   * ------------------------------------------------------------------ */
  function selectedId() {
    var id = lsGet(SELECT_KEY, 'germany');
    return biome(id) ? id : 'germany';
  }
  function isPlayable(b) { return !!DEST[b.id]; }
  function destFor(b) { return DEST[b.id] || ('../index.html?region=' + encodeURIComponent(b.id)); }
  function setSelected(id) {
    lsSet(SELECT_KEY, id);
    paintGo();
    var m = $('#mapCard'); if (m) paintMapCard();
    $$('.map-pt').forEach(function (g) { g.setAttribute('aria-pressed', g.dataset.id === id ? 'true' : 'false'); });
    paintMapPoints();
  }

  var goBtn = $('#goBtn'), goChange = $('#goChange'), picker = $('#picker');
  function paintGo() {
    var b = biome(selectedId());
    goBtn.href = destFor(b);
    goBtn.innerHTML = '<span class="flag" aria-hidden="true">' + b.flag + '</span><span><small>' +
      (isPlayable(b) ? 'Play your map' : 'Not open yet · see globe') + '</small><b>' + esc(shortTitle(b)) + '</b></span>';
    goBtn.setAttribute('aria-label', (isPlayable(b) ? 'Play ' : 'Open the globe for ') + b.title);
    picker.innerHTML = D.biomes.map(function (x) {
      return '<button type="button" role="menuitemradio" aria-checked="' + (x.id === b.id) + '" data-pick="' + x.id + '">' +
        '<span class="p-flag" aria-hidden="true">' + x.flag + '</span>' +
        '<span><span class="p-name">' + esc(shortTitle(x)) + '</span><span class="p-sub">' + esc(x.country) + '</span></span>' +
        (isPlayable(x) ? '' : '<span class="lock">🔒 ' + num(x.unlockO2) + ' O₂</span>') + '</button>';
    }).join('');
  }
  function shortTitle(b) { return b.title.replace(/ ·.*$/, '').replace(/^Alpenhof Journey/, 'Alpenhof Journey'); }
  goChange.addEventListener('click', function () {
    var open = picker.hidden;
    picker.hidden = !open;
    goChange.setAttribute('aria-expanded', String(open));
    if (open) { var cur = $('[aria-checked="true"]', picker); if (cur) cur.focus(); }
  });
  picker.addEventListener('click', function (e) {
    var t = e.target.closest('[data-pick]'); if (!t) return;
    setSelected(t.dataset.pick); picker.hidden = true; goChange.setAttribute('aria-expanded', 'false'); goChange.focus();
  });
  document.addEventListener('click', function (e) {
    if (!picker.hidden && !e.target.closest('.go-wrap')) { picker.hidden = true; goChange.setAttribute('aria-expanded', 'false'); }
  });
  window.addEventListener('storage', function (e) { if (e.key === SELECT_KEY) { paintGo(); } }); // game tab changed it

  /* ------------------------------------------------------------------ *
   * Drawer
   * ------------------------------------------------------------------ */
  var drawer = $('#drawer'), drawerBody = $('#drawerBody'), lastFocus = null, onDrawerClose = null;
  function openDrawer(html, onClose) {
    lastFocus = document.activeElement;
    drawerBody.innerHTML = html;
    drawer.hidden = false;
    document.body.style.overflow = 'hidden';
    onDrawerClose = onClose || null;
    $('.x', drawer).focus();
  }
  function closeDrawer() {
    if (drawer.hidden) return;
    drawer.hidden = true;
    document.body.style.overflow = '';
    if (onDrawerClose) { onDrawerClose(); onDrawerClose = null; }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  drawer.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeDrawer(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDrawer(); if (!picker.hidden) { picker.hidden = true; goChange.focus(); } }
    if (e.key === 'Tab' && !drawer.hidden) { // keep focus inside the dialog
      var f = $$('button,[href],input,select,textarea', drawer).filter(function (n) { return !n.disabled && n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ------------------------------------------------------------------ *
   * Router
   * ------------------------------------------------------------------ */
  var ROUTES = [
    { id: '', label: 'Home', title: 'Learning Hub', render: pageHome },
    { id: 'start', label: 'Getting Started', title: 'Getting Started', render: pageStart },
    { id: 'components', label: 'Components', title: 'Components', render: pageComponents },
    { id: 'library', label: 'Library', title: 'Plant Library', render: pageLibrary },
    { id: 'concepts', label: 'Concepts', title: 'Concepts', render: pageConcepts },
    { id: 'howto', label: 'How-to', title: 'How-to Guides', render: pageHowto },
    { id: 'player', label: 'Player Hub', title: 'Player Hub', render: pagePlayer },
    { id: 'help', label: 'Help & FAQ', title: 'Help & FAQ', render: pageHelp },
    { id: 'feedback', label: 'Feedback', title: 'Send Feedback', render: pageFeedback },
    { id: 'report', label: 'Report a Problem', title: 'Report a Problem', render: pageReport }
  ];
  $('#nav').innerHTML = ROUTES.map(function (r) {
    return '<a href="#/' + r.id + '" data-route="' + r.id + '">' + esc(r.label) + '</a>';
  }).join('');

  var firstRender = true;
  function route() {
    closeDrawer();
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var id = parts[0] || '', arg = parts[1] || '';
    var r = ROUTES.filter(function (x) { return x.id === id; })[0] || ROUTES[0];
    $$('#nav a').forEach(function (a) {
      if (a.dataset.route === r.id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.title = (r.id ? r.title + ' · ' : '') + 'searchO2 Learning Hub';
    main.innerHTML = '';
    r.render(arg);
    if (!arg) window.scrollTo(0, 0);
    if (!firstRender) main.focus({ preventScroll: true });
    firstRender = false;
  }
  window.addEventListener('hashchange', route);

  /* ------------------------------------------------------------------ *
   * HOME: growth demo + map + doors
   * ------------------------------------------------------------------ */
  function treeSVGInner(sp) {
    var c = sp.canopy || '#4E8F52', t = sp.trunk || '#6E4429', d = sp.dotColor;
    var dots = function (pts) {
      return d ? pts.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="' + d + '"/>'; }).join('') : '';
    };
    switch (sp.shape) {
      case 'conifer':
        return '<rect x="-7" y="-44" width="14" height="44" fill="' + t + '"/>' +
          '<polygon points="0,-190 -58,-90 58,-90" fill="' + c + '"/>' +
          '<polygon points="0,-150 -72,-48 72,-48" fill="' + c + '" opacity=".92"/>' +
          '<polygon points="0,-110 -84,-20 84,-20" fill="' + c + '" opacity=".85"/>';
      case 'tallRound':
        return '<rect x="-7" y="-70" width="14" height="70" fill="' + t + '"/>' +
          '<ellipse cx="0" cy="-130" rx="46" ry="82" fill="' + c + '"/>' + dots([[-18, -150], [22, -110], [0, -178]]);
      case 'umbrella':
        return '<rect x="-6" y="-100" width="12" height="100" fill="' + t + '"/>' +
          '<ellipse cx="0" cy="-112" rx="104" ry="34" fill="' + c + '"/>' + dots([[-50, -108], [40, -118]]);
      case 'bush':
        return '<circle cx="-34" cy="-30" r="34" fill="' + c + '"/><circle cx="34" cy="-30" r="34" fill="' + c + '" opacity=".95"/>' +
          '<circle cx="0" cy="-48" r="42" fill="' + c + '"/>' + dots([[-30, -34], [30, -26], [4, -66], [-2, -22]]);
      default:
        return '<rect x="-8" y="-84" width="16" height="84" fill="' + t + '"/>' +
          '<circle cx="0" cy="-132" r="74" fill="' + c + '"/><circle cx="-38" cy="-108" r="46" fill="' + c + '" opacity=".92"/>' +
          '<circle cx="40" cy="-110" r="44" fill="' + c + '" opacity=".92"/>' + dots([[-36, -128], [30, -150], [48, -104], [-4, -96]]);
    }
  }
  function stageScale(i, n) { return n < 2 ? 1 : 0.16 + 0.84 * (i / (n - 1)); }

  function growDemo() {
    var pool = D.species.filter(function (s) { return s.o2AtStage.some(function (v) { return v > 0; }); });
    var opts = pool.map(function (s) {
      return '<option value="' + s.key + '"' + (s.key === 'oak' ? ' selected' : '') + '>' + esc(s.icon + ' ' + s.label) + '</option>';
    }).join('');
    return '<div class="grow">' +
      '<svg viewBox="0 0 480 330" role="img" aria-labelledby="growTitle growDesc">' +
      '<title id="growTitle">Growth demo</title><desc id="growDesc">A plant drawn at the growth stage chosen with the slider.</desc>' +
      '<circle cx="404" cy="58" r="30" fill="#F0AC3D"/><g fill="#fff" opacity=".85"><ellipse cx="90" cy="64" rx="46" ry="14"/><ellipse cx="116" cy="54" rx="30" ry="12"/><ellipse cx="300" cy="92" rx="40" ry="11"/></g>' +
      '<ellipse cx="240" cy="204" rx="62" ry="9" fill="#2f5e2b" opacity=".35"/>' +
      '<g transform="translate(240 205)"><g id="growTree" class="tree-anim"></g></g></svg>' +
      '<div class="grow-ctl">' +
      '<div class="grow-top"><label class="sr-only" for="growSel">Plant</label><select id="growSel">' + opts + '</select>' +
      '<div class="o2-read" aria-live="polite"><span id="growO2">0</span> O₂/hr</div></div>' +
      '<div class="stage-read"><span class="stage-name" id="growStage"></span></div>' +
      '<label class="sr-only" for="growRange">Growth stage</label><input type="range" id="growRange" min="0" max="3" step="1" value="3">' +
      '<div class="stage-ticks" id="growTicks"></div>' +
      '<p class="grow-fact" id="growFact"></p></div></div>';
  }
  function bindGrow() {
    var sel = $('#growSel'), range = $('#growRange'), tree = $('#growTree');
    if (!sel) return;
    function species() { return D.species.filter(function (s) { return s.key === sel.value; })[0]; }
    function draw(resetStage) {
      var sp = species(), n = sp.stages.length;
      range.max = n - 1;
      if (resetStage) range.value = n - 1;
      var i = Number(range.value);
      tree.innerHTML = treeSVGInner(sp);
      tree.style.transform = 'scale(' + stageScale(i, n) + ')';
      $('#growStage').textContent = sp.stages[i];
      $('#growO2').textContent = (sp.o2AtStage[i] || 0).toFixed(1);
      $('#growTicks').innerHTML = sp.stages.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('');
      $('#growFact').textContent = sp.fact || (sp.sciName ? sp.sciName : '');
      range.setAttribute('aria-valuetext', sp.stages[i] + ', ' + (sp.o2AtStage[i] || 0).toFixed(1) + ' O₂ per hour');
    }
    function step() {
      var sp = species(), i = Number(range.value);
      tree.style.transform = 'scale(' + stageScale(i, sp.stages.length) + ')';
      $('#growStage').textContent = sp.stages[i];
      $('#growO2').textContent = (sp.o2AtStage[i] || 0).toFixed(1);
      range.setAttribute('aria-valuetext', sp.stages[i] + ', ' + (sp.o2AtStage[i] || 0).toFixed(1) + ' O₂ per hour');
    }
    sel.addEventListener('change', function () { draw(true); });
    range.addEventListener('input', step);
    draw(true);
    tree.style.transition = 'none'; tree.getBoundingClientRect(); tree.style.transition = '';
  }

  var MAP_W = 1080, MAP_TOP = 20, MAP_H = 380, SCALE = 3;
  function px(lon) { return (lon + 180) * SCALE; }
  function py(lat) { return (90 - lat) * SCALE; }
  function landPath() {
    var d = '';
    D.landBoxes.forEach(function (b) {
      for (var lat = b[0]; lat <= b[1]; lat += b[4]) for (var lon = b[2]; lon <= b[3]; lon += b[5]) {
        d += 'M' + px(lon).toFixed(1) + ' ' + py(lat).toFixed(1) + 'h.1';
      }
    });
    return d;
  }
  function mapBox() {
    var grid = '';
    for (var lon = -150; lon <= 150; lon += 30) grid += '<line x1="' + px(lon) + '" y1="' + MAP_TOP + '" x2="' + px(lon) + '" y2="' + (MAP_TOP + MAP_H) + '"/>';
    for (var lat = 60; lat >= -30; lat -= 30) grid += '<line x1="0" y1="' + py(lat) + '" x2="' + MAP_W + '" y2="' + py(lat) + '"/>';
    return '<section class="mapbox" aria-labelledby="mapH">' +
      '<h2 id="mapH">Choose your map</h2>' +
      '<p>Pick a place on the world map. The Play button at the top of every page takes you to it.</p>' +
      '<svg class="map-svg" viewBox="0 ' + MAP_TOP + ' ' + MAP_W + ' ' + MAP_H + '" role="group" aria-label="World map of searchO2 biomes">' +
      '<g stroke="#2b4a35" stroke-width="1" opacity=".7">' + grid + '</g>' +
      '<path d="' + landPath() + '" stroke="#5E9A62" stroke-width="3.4" stroke-linecap="round" opacity=".55" fill="none"/>' +
      '<g id="mapPts"></g></svg>' +
      '<div class="map-legend"><span><i style="background:#F0AC3D"></i>Open now</span><span><i style="background:#8FA79A"></i>Locked until you make enough O₂</span><span><i style="background:none;border:2px solid #fff"></i>Your map</span></div>' +
      '<div class="map-card" id="mapCard"></div></section>';
  }
  function paintMapPoints() {
    var g = $('#mapPts'); if (!g) return;
    var sel = selectedId();
    var order = D.biomes.slice().sort(function (a, b) { return (a.id === sel) - (b.id === sel); });
    g.innerHTML = order.map(function (b) {
      var on = b.id === sel, ok = isPlayable(b);
      return '<g class="map-pt" tabindex="0" role="button" aria-pressed="' + on + '" data-id="' + b.id + '" aria-label="' +
        esc(b.title + (ok ? ', open' : ', locked until ' + num(b.unlockO2) + ' O₂')) + '">' +
        '<circle class="ring" cx="' + px(b.lon) + '" cy="' + py(b.lat) + '" r="' + (on ? 14 : 0) + '" fill="none" stroke="#fff" stroke-width="2.5"/>' +
        '<circle class="dot" cx="' + px(b.lon) + '" cy="' + py(b.lat) + '" r="7" fill="' + (ok ? '#F0AC3D' : '#8FA79A') + '" stroke="#17301F" stroke-width="2"/>' +
        (on ? '<text x="' + (px(b.lon) + 18) + '" y="' + (py(b.lat) + 5) + '" fill="#fff" font-size="15" font-weight="800" font-family="Nunito,sans-serif" paint-order="stroke" stroke="#17301F" stroke-width="4">' + esc(b.flag + ' ' + shortTitle(b)) + '</text>' : '') +
        '</g>';
    }).join('');
  }
  function paintMapCard() {
    var b = biome(selectedId()), ok = isPlayable(b);
    $('#mapCard').innerHTML = '<h3>' + b.flag + ' ' + esc(b.title) + '</h3>' +
      '<p style="margin:0;color:#BDD9C5">' + esc(b.biomeType) + '</p>' +
      '<dl><dt>Climate</dt><dd>' + esc(b.climate) + '</dd><dt>Soil</dt><dd>' + esc(b.soilQuality) + '</dd>' +
      '<dt>Native plants</dt><dd>' + esc(b.nativeSpecies.join(', ')) + '</dd><dt>Special</dt><dd>' + esc(b.specialTrait) + '</dd>' +
      '<dt>Status</dt><dd>' + (ok ? 'Open: ' + (b.plotsCount || 0) + ' plots' : 'Locked. Make ' + num(b.unlockO2) + ' total O₂ to unlock it.') + '</dd></dl>' +
      '<a class="btn gold" href="' + destFor(b) + '">' + (ok ? 'Play this map' : 'Show it on the globe') + '</a>';
  }
  function bindMap() {
    var svg = $('.map-svg'); if (!svg) return;
    paintMapPoints(); paintMapCard();
    svg.addEventListener('click', function (e) { var g = e.target.closest('.map-pt'); if (g) setSelected(g.dataset.id); });
    svg.addEventListener('keydown', function (e) {
      var g = e.target.closest('.map-pt');
      if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setSelected(g.dataset.id); var again = $('.map-pt[data-id="' + g.dataset.id + '"]'); if (again) again.focus(); }
    });
  }

  function pageHome() {
    var c = D.counts;
    main.innerHTML =
      '<section class="hero"><div>' +
      '<h1>Learn how your farm makes oxygen</h1>' +
      '<p class="lead">Pick a plant and drag the slider. It grows through the same stages it does in the game, and its oxygen output changes with it.</p>' +
      '<div class="hero-actions"><a class="btn" href="#/start">Start here</a><a class="btn ghost" href="#/library">Browse ' + c.species + ' plants</a></div></div>' +
      growDemo() + '</section>' +
      mapBox() +
      '<nav class="doors" aria-label="Sections">' +
      door('library', '📖', 'Plant Library', 'Facts, lifespans, diseases and cures for all ' + c.species + ' plants, plus a quiz.', 'big') +
      door('components', '🏗️', 'Components', 'What each building costs, how long it takes, and what it needs first.', 'soil') +
      door('start', '🌱', 'Getting Started', 'The eight chapters, from your first seed to the Moon.') +
      door('concepts', '💡', 'Concepts', 'Companion planting, grazing, renewable power and more, at three depths.') +
      door('howto', '🧭', 'How-to Guides', 'Step-by-step help with the parts of the game that trip people up.') +
      door('player', '🏅', 'Player Hub', 'Your level, badges and buildings from the save in this browser.', 'gold') +
      door('help', '❓', 'Help & FAQ', 'Quick answers to common questions.') +
      door('feedback', '💬', 'Feedback', 'Tell us what you liked and what to improve.') +
      door('report', '🐞', 'Report a Problem', 'Something broken? Send us the details.') +
      '</nav>';
    bindGrow(); bindMap();
  }
  function door(id, ico, title, text, cls) {
    return '<a class="door ' + (cls || '') + '" href="#/' + id + '"><span class="ico" aria-hidden="true">' + ico + '</span><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p></a>';
  }

  /* ------------------------------------------------------------------ *
   * GETTING STARTED
   * ------------------------------------------------------------------ */
  function pageStart() {
    var chapters = D.chapters.map(function (c) {
      return '<li><span class="num" aria-hidden="true">' + c.chapter + '</span>' +
        '<details><summary><span aria-hidden="true">' + c.icon + '</span> ' + esc(c.title) + '</summary><div class="body">' +
        '<p><i>' + esc(c.fantasy) + '</i></p><p>' + esc(c.desc) + '</p>' +
        '<div class="tags">' + c.keySystems.map(function (k) { return '<span class="pill">' + esc(k) + '</span>'; }).join('') + '</div>' +
        (c.unlockReward ? '<p><b>Unlocks:</b> ' + esc(c.unlockReward) + '</p>' : '') + '</div></details></li>';
    }).join('');
    main.innerHTML =
      '<div class="page-head"><h1>Getting Started</h1><p>You start with barren land and a little money. Your job is to turn it into a farm that makes clean oxygen.</p></div>' +
      '<div class="cols two"><section class="panel"><h2>Your first session</h2><ol class="steps">' +
      '<li><b>Survey.</b> You start with €10,000, six plots and a patch of Central European grassland.</li>' +
      '<li><b>Dig.</b> Barren soil becomes ready soil. It costs €15 and 3 hours per plot.</li>' +
      '<li><b>Plant.</b> Choose a fruit tree, a vegetable, an oxygen tree or a timber tree.</li>' +
      '<li><b>Care.</b> Watering adds 30% hydration, pruning adds 20% vigor and drip irrigation adds 15% growth.</li>' +
      '<li><b>Store.</b> Build a Storage Barn before big harvests, or half the crop can spoil.</li>' +
      '<li><b>Mechanize.</b> Finish six manual harvests, build the Farm Garage, then harvest in 3.5 seconds.</li>' +
      '<li><b>Expand.</b> Add a garden, crop field, animals, a pond, wind turbines and a battery, then a village.</li></ol>' +
      '<a class="btn" href="' + destFor(biome(selectedId())) + '">Play ' + esc(shortTitle(biome(selectedId()))) + '</a></section>' +
      '<section class="panel"><h2>What you earn</h2>' +
      '<p><b>💰 Money</b> pays for seeds, buildings, crew and roads.</p>' +
      '<p><b>🌿 O₂</b> is what your plants release. The game turns it into municipal green credits.</p>' +
      '<p><b>🧠 Knowledge XP</b> comes from learning and quizzes. It raises your level.</p>' +
      '<ol class="steps" style="margin-top:14px">' + D.levels.map(function (l) {
        return '<li><b>' + l.icon + ' ' + esc(l.title) + '</b><br><span class="muted">' + esc(l.desc) + '</span></li>';
      }).join('') + '</ol></section></div>' +
      '<h2 style="margin-top:44px">The eight chapters</h2><p class="muted">Each chapter unlocks the next. Open one to see what it teaches.</p>' +
      '<ol class="trail">' + chapters + '</ol>' +
      '<section class="panel" style="margin-top:20px"><h2>Good to know</h2><ul class="checklist">' +
      '<li>On a phone, hold it sideways. The game asks you to rotate in portrait.</li>' +
      '<li>You can play as a guest. Your farm keeps going while you are away and catches up when you return.</li>' +
      '<li>The Library button inside the game opens the same plant encyclopedia you can browse here.</li></ul></section>';
  }

  /* ------------------------------------------------------------------ *
   * COMPONENTS
   * ------------------------------------------------------------------ */
  var CAT_LABEL = { infrastructure: 'Infrastructure', decorative: 'Beauty', revenue: 'Income', agriculture: 'Growing', livestock: 'Animals', energy: 'Energy' };
  function pageComponents() {
    var cats = Object.keys(CAT_LABEL);
    var maxCost = Math.max.apply(null, D.components.buildings.map(function (b) { return b.cost; }));
    var maxHrs = Math.max.apply(null, D.components.buildings.map(function (b) { return b.buildHours; }));
    var active = 'all';
    main.innerHTML =
      '<div class="page-head"><h1>Components</h1><p>Everything you can build, what it costs and what it needs first. Costs are in euros and build times in game hours.</p></div>' +
      '<div class="toolbar" id="catBar"><button class="chip" aria-pressed="true" data-cat="all">All</button>' +
      cats.map(function (c) { return '<button class="chip" aria-pressed="false" data-cat="' + c + '">' + CAT_LABEL[c] + '</button>'; }).join('') + '</div>' +
      '<table class="ledger"><thead><tr><th scope="col">Building</th><th scope="col">Cost</th><th scope="col">Build time</th><th scope="col">Needs</th></tr></thead><tbody id="ledgerBody"></tbody></table>' +
      '<h2 style="margin-top:40px">Roads and paths</h2><div class="crew" id="roads"></div>' +
      '<h2 style="margin-top:40px">Your crew</h2><p class="muted">You must build the Crew Shed before you can hire anyone.</p><div class="crew" id="crew"></div>';
    function paint() {
      var rows = D.components.buildings.filter(function (b) { return active === 'all' || b.category === active; });
      $('#ledgerBody').innerHTML = rows.map(function (b) {
        var needs = [];
        if (b.requiresRoad) needs.push('Main road');
        if (b.requiresEngineer) needs.push('Certified engineer');
        if (b.key === 'garage') needs.push('1 laborer');
        if (b.key === 'wind_turbine' || b.key === 'energy_storage') needs.push('Chapter 5');
        return '<tr><td><div class="nm"><span class="i" aria-hidden="true">' + b.icon + '</span>' + esc(b.label) + '</div><p class="ds">' + esc(b.desc) + '</p>' +
          '<span class="pill">' + esc(CAT_LABEL[b.category] || b.category) + '</span>' + (b.reputationBonus ? ' <span class="pill gold">+' + b.reputationBonus + ' reputation</span>' : '') + '</td>' +
          '<td><span class="num-s">€' + num(b.cost) + '</span><div class="meter" aria-hidden="true"><i style="width:' + Math.round(b.cost / maxCost * 100) + '%"></i></div>' +
          (b.upkeep ? '<span class="hint">€' + b.upkeep + ' upkeep</span>' : '') + '</td>' +
          '<td><span class="num-s">' + b.buildHours + ' h</span><div class="meter time" aria-hidden="true"><i style="width:' + Math.round(b.buildHours / maxHrs * 100) + '%"></i></div></td>' +
          '<td>' + (needs.length ? needs.map(function (n) { return '<span class="pill soil">' + esc(n) + '</span>'; }).join(' ') : '<span class="muted">Nothing</span>') + '</td></tr>';
      }).join('') || '<tr><td colspan="4" class="empty">Nothing in this group.</td></tr>';
    }
    $('#roads').innerHTML = D.components.roads.map(function (r) {
      return '<div class="panel"><h3><span aria-hidden="true">' + r.icon + '</span> ' + esc(r.label) + '</h3><p>' + esc(r.desc) + '</p><span class="pill gold">€' + r.cost + '</span> <span class="pill">' + r.buildHours + ' h</span></div>';
    }).join('');
    $('#crew').innerHTML = D.components.workers.map(function (w) {
      return '<div class="panel"><h3>' + esc(w.label) + '</h3><p>' + esc(w.desc) + '</p><span class="pill gold">€' + w.wage + ' wage</span></div>';
    }).join('');
    $('#catBar').addEventListener('click', function (e) {
      var t = e.target.closest('[data-cat]'); if (!t) return;
      active = t.dataset.cat;
      $$('#catBar .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === t)); });
      paint();
    });
    paint();
  }

  /* ------------------------------------------------------------------ *
   * LIBRARY (+ species drawer + quiz)
   * ------------------------------------------------------------------ */
  function pageLibrary(arg) {
    var cats = [];
    D.species.forEach(function (s) { if (cats.indexOf(s.category) < 0) cats.push(s.category); });
    var f = { q: '', cat: 'all', region: 'all' };
    main.innerHTML =
      '<div class="page-head"><h1>Plant Library</h1><p>' + D.species.length + ' plants from five biomes. Open one to see how much oxygen it makes at each stage.</p></div>' +
      '<div class="toolbar"><label class="sr-only" for="libQ">Search plants</label><input id="libQ" class="search" type="search" placeholder="Search by name or Latin name">' +
      '<button class="btn gold" id="quizBtn" type="button">Take a quiz</button></div>' +
      '<div class="toolbar" id="catChips" role="group" aria-label="Plant type"><button class="chip" aria-pressed="true" data-v="all">All types</button>' +
      cats.map(function (c) { return '<button class="chip" aria-pressed="false" data-v="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>' +
      '<div class="toolbar" id="regChips" role="group" aria-label="Biome"><button class="chip" aria-pressed="true" data-v="all">All biomes</button>' +
      Object.keys(REGION_LABEL).map(function (r) { return '<button class="chip" aria-pressed="false" data-v="' + r + '">' + REGION_LABEL[r] + '</button>'; }).join('') + '</div>' +
      '<p class="muted" id="libCount" aria-live="polite"></p><div class="packets" id="packets"></div>';
    function paint() {
      var q = f.q.toLowerCase();
      var list = D.species.filter(function (s) {
        return (f.cat === 'all' || s.category === f.cat) && (f.region === 'all' || s.regions.indexOf(f.region) >= 0) &&
          (!q || (s.label + ' ' + (s.sciName || '')).toLowerCase().indexOf(q) >= 0);
      });
      $('#libCount').textContent = list.length + ' of ' + D.species.length + ' plants';
      $('#packets').innerHTML = list.map(function (s) {
        return '<button class="packet" type="button" data-key="' + s.key + '" style="--c:' + esc(s.canopy || '#6FA85A') + '">' +
          '<div class="top"></div><div class="ic" aria-hidden="true">' + s.icon + '</div><b>' + esc(s.label) + '</b><i>' + esc(s.sciName || '') + '</i><span class="cat">' + esc(s.category) + '</span></button>';
      }).join('') || '<div class="empty" style="grid-column:1/-1">No plants match. Try a different word or clear a filter.</div>';
    }
    $('#libQ').addEventListener('input', function (e) { f.q = e.target.value; paint(); });
    function chips(id, key) {
      $(id).addEventListener('click', function (e) {
        var t = e.target.closest('[data-v]'); if (!t) return;
        f[key] = t.dataset.v;
        $$('.chip', $(id)).forEach(function (c) { c.setAttribute('aria-pressed', String(c === t)); });
        paint();
      });
    }
    chips('#catChips', 'cat'); chips('#regChips', 'region');
    $('#packets').addEventListener('click', function (e) {
      var t = e.target.closest('[data-key]'); if (t) { history.replaceState(null, '', '#/library/' + t.dataset.key); openSpecies(t.dataset.key); }
    });
    $('#quizBtn').addEventListener('click', startQuiz);
    paint();
    if (arg) openSpecies(arg);
  }

  function openSpecies(key) {
    var s = D.species.filter(function (x) { return x.key === key; })[0];
    if (!s) return;
    var max = Math.max.apply(null, s.o2AtStage.concat([0.1]));
    var bars = s.stages.map(function (st, i) {
      var v = s.o2AtStage[i] || 0;
      return '<div><b>' + v.toFixed(1) + '</b><i style="height:' + Math.round(v / max * 100) + '%"></i>' + esc(st) + '</div>';
    }).join('');
    var L = s.lib, facts = '';
    if (L) {
      facts = '<dl class="facts">' +
        '<div><dt>Where it comes from</dt><dd>' + esc(L.firstFound) + '</dd></div>' +
        '<div><dt>How long it lives</dt><dd>Up to about ' + num(L.maxAgeYears) + ' years</dd></div>' +
        '<div><dt>When it fruits</dt><dd>' + esc(L.fruitingTime) + '</dd></div>' +
        '<div><dt>How it makes oxygen</dt><dd>' + esc(L.photosynthesis) + '</dd></div>' +
        '<div><dt>Common disease</dt><dd><b>' + esc(L.disease) + '.</b> ' + esc(L.cure) + '</dd></div></dl>';
    } else {
      facts = '<p class="muted">This plant does not have an encyclopedia entry in the game yet.</p>';
    }
    openDrawer('<h2 id="drawerTitle"><span aria-hidden="true">' + s.icon + '</span> ' + esc(s.label) + '</h2>' +
      '<p class="muted"><i>' + esc(s.sciName || '') + '</i> · ' + esc(s.category) + (s.cost ? ' · €' + s.cost + ' to plant' : '') + '</p>' +
      '<div class="tags">' + s.regions.map(function (r) { return '<span class="pill">' + esc(REGION_LABEL[r] || r) + '</span>'; }).join('') + '</div>' +
      (s.fact ? '<p>' + esc(s.fact) + '</p>' : '') +
      '<h3>Oxygen made at each stage (O₂/hr)</h3><div class="bars">' + bars + '</div>' + facts +
      '<a class="btn ghost" href="#/" data-grow="' + s.key + '">See it grow on the home page</a>',
      function () { if (/^#\/library\//.test(location.hash)) history.replaceState(null, '', '#/library'); });
    var link = $('[data-grow]', drawerBody);
    if (link) link.addEventListener('click', function () { try { sessionStorage.setItem('hubGrow', link.dataset.grow); } catch (e) {} });
  }

  /* quiz built from the game's own species data */
  function startQuiz() {
    var withLib = D.species.filter(function (s) { return s.lib; });
    var gens = [
      function () {
        var pool = sample(uniqueBy(withLib, function (s) { return s.lib.maxAgeYears; }), 4); if (pool.length < 4) return null;
        var best = pool.slice().sort(function (a, b) { return b.lib.maxAgeYears - a.lib.maxAgeYears; })[0];
        return mk('Which of these plants can live the longest?', pool.map(lab), lab(best), best.label + ' can live up to about ' + num(best.lib.maxAgeYears) + ' years.');
      },
      function () {
        var s = sample(withLib, 1)[0];
        var others = sample(uniqueBy(withLib.filter(function (x) { return x.lib.disease !== s.lib.disease; }), function (x) { return x.lib.disease; }), 3);
        return mk('Which plant can catch ' + s.lib.disease + '?', [s].concat(others).map(lab), lab(s), s.label + ' is affected by ' + s.lib.disease + '. Remedy: ' + s.lib.cure);
      },
      function () {
        var s = sample(D.species.filter(function (x) { return x.sciName; }), 1)[0];
        var others = sample(uniqueBy(D.species.filter(function (x) { return x.sciName && x.sciName !== s.sciName; }), function (x) { return x.sciName; }), 3);
        return mk('What is the Latin name of ' + s.label + '?', [s].concat(others).map(function (x) { return x.sciName; }), s.sciName, s.label + ' is ' + s.sciName + '.');
      },
      function () {
        var pool = sample(uniqueBy(D.species, function (s) { return Math.max.apply(null, s.o2AtStage); }), 4); if (pool.length < 4) return null;
        var best = pool.slice().sort(function (a, b) { return Math.max.apply(null, b.o2AtStage) - Math.max.apply(null, a.o2AtStage); })[0];
        return mk('Which plant makes the most oxygen once fully grown?', pool.map(lab), lab(best), best.label + ' reaches ' + Math.max.apply(null, best.o2AtStage).toFixed(1) + ' O₂/hr.');
      },
      function () {
        var s = sample(withLib, 1)[0];
        var others = sample(uniqueBy(withLib.filter(function (x) { return x.lib.cure !== s.lib.cure; }), function (x) { return x.lib.cure; }), 3);
        return mk('How do you treat ' + s.lib.disease + ' on ' + s.label + '?', [s].concat(others).map(function (x) { return x.lib.cure; }), s.lib.cure, s.lib.disease + ' is treated this way.');
      }
    ];
    function lab(s) { return s.icon + ' ' + s.label; }
    function mk(q, opts, answer, why) { return { q: q, opts: shuffle(opts), answer: answer, why: why }; }
    function uniqueBy(arr, fn) { var seen = {}; return arr.filter(function (x) { var k = fn(x); if (seen[k]) return false; seen[k] = 1; return true; }); }
    var qs = [], guard = 0;
    while (qs.length < 6 && guard++ < 60) { var q = gens[Math.floor(Math.random() * gens.length)](); if (q && !qs.some(function (z) { return z.q === q.q; })) qs.push(q); }
    var i = 0, score = 0;
    function show() {
      var q = qs[i];
      $('#drawerBody').innerHTML = '<h2 id="drawerTitle">Plant quiz</h2><p class="muted">Question ' + (i + 1) + ' of ' + qs.length + '</p>' +
        '<p class="quiz-q">' + esc(q.q) + '</p><div class="quiz-opts">' +
        q.opts.map(function (o, k) { return '<button type="button" data-k="' + k + '">' + esc(o) + '</button>'; }).join('') + '</div><div id="qOut" aria-live="polite"></div>';
      $$('.quiz-opts button', drawerBody).forEach(function (b) {
        b.addEventListener('click', function () {
          var right = q.opts[Number(b.dataset.k)] === q.answer;
          if (right) score++;
          $$('.quiz-opts button', drawerBody).forEach(function (x) {
            x.disabled = true;
            if (q.opts[Number(x.dataset.k)] === q.answer) x.classList.add('ok');
          });
          if (!right) b.classList.add('no');
          $('#qOut').innerHTML = '<p><b>' + (right ? 'Correct.' : 'Not quite.') + '</b> ' + esc(q.why) + '</p><button class="btn" id="qNext" type="button">' + (i + 1 < qs.length ? 'Next question' : 'See my score') + '</button>';
          $('#qNext').focus();
          $('#qNext').addEventListener('click', function () { i++; if (i < qs.length) show(); else done(); });
        });
      });
    }
    function done() {
      var best = Number(lsGet(QUIZ_KEY, '0'));
      if (score > best) lsSet(QUIZ_KEY, String(score));
      $('#drawerBody').innerHTML = '<h2 id="drawerTitle">You got ' + score + ' of ' + qs.length + '</h2><p>' +
        (score === qs.length ? 'Perfect. You know your plants.' : score >= qs.length / 2 ? 'Nice work. Open a few plants and try again.' : 'Open some plants in the Library, then try again.') +
        (score > best ? ' That is your best score so far.' : '') + '</p><button class="btn" id="again" type="button">Play again</button> <button class="btn ghost" data-close type="button">Back to the Library</button>';
      $('#again').addEventListener('click', startQuiz);
    }
    openDrawer('<div></div>');
    show();
  }

  /* ------------------------------------------------------------------ *
   * CONCEPTS
   * ------------------------------------------------------------------ */
  function pageConcepts() {
    var depth = 'quickFact';
    var DEPTHS = [['quickFact', 'Quick'], ['learnMore', 'More'], ['deepDive', 'Deep']];
    main.innerHTML =
      '<div class="page-head"><h1>Concepts</h1><p>The science behind the game. Start with the big ideas, then use the Why? cards for single topics.</p></div>' +
      '<div id="theory"></div>' +
      '<h2 style="margin-top:40px">Why? cards</h2>' +
      '<p class="muted">Every card has three levels. Pick how much you want to read.</p>' +
      '<div class="depth" id="depth" role="group" aria-label="Reading depth">' +
      DEPTHS.map(function (d) { return '<button type="button" data-d="' + d[0] + '" aria-pressed="' + (d[0] === depth) + '">' + d[1] + '</button>'; }).join('') + '</div>' +
      '<div class="why-grid" id="whys"></div>';
    $('#theory').innerHTML = D.theory.map(function (t) {
      return '<details class="panel concept"' + '><summary style="cursor:pointer;font-family:var(--font-head);font-weight:800;font-size:1.3rem;color:var(--pine)"><span aria-hidden="true">' + t.icon + '</span> ' + esc(t.title) +
        ' <span class="pill">' + esc(t.category) + '</span> <span class="pill gold">' + esc(t.readTime) + '</span></summary>' +
        '<p style="margin-top:12px">' + esc(t.summary) + '</p>' +
        '<h3>Key ideas</h3><ul class="princ">' + (t.principles || []).map(function (p) { return '<li>' + mdBold(p) + '</li>'; }).join('') + '</ul>' +
        (t.gameConnection ? '<div class="tip"><b>In the game.</b> ' + esc(t.gameConnection) + '</div>' : '') +
        '<div class="keyterms">' + (t.keyTerms || []).map(function (k) { return '<span class="pill soil">' + esc(k) + '</span>'; }).join('') + '</div></details>';
    }).join('');
    function paintWhy() {
      $('#whys').innerHTML = D.why.map(function (w) {
        return '<article class="why"><h3><span aria-hidden="true">' + w.icon + '</span> ' + esc(w.title) + '</h3><p>' + esc(w[depth]) + '</p></article>';
      }).join('');
    }
    $('#depth').addEventListener('click', function (e) {
      var t = e.target.closest('[data-d]'); if (!t) return;
      depth = t.dataset.d;
      $$('#depth button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === t)); });
      paintWhy();
    });
    paintWhy();
  }

  /* ------------------------------------------------------------------ *
   * HOW-TO WIKI
   * ------------------------------------------------------------------ */
  function bld(key) { return D.components.buildings.filter(function (b) { return b.key === key; })[0]; }
  function articles() {
    var garage = bld('garage'), wt = bld('wind_turbine'), bess = bld('energy_storage');
    var storageNote = '<div class="tip"><b>Why it matters.</b> Harvested crops keep breathing. Without storage, heat and humidity spoil them within hours.</div>';
    return [
      { id: 'first-plant', title: 'Grow your first plant', body:
        '<p>Chapter 1 asks one question: can you grow something? Here is the path.</p><ol class="steps">' +
        '<li>Explore all eight chapters of your estate by clicking their objects.</li>' +
        '<li>Find the hidden jute tarp. It hides your Hand Spade and basic tools.</li>' +
        '<li>Till Plot 1. Soil goes from barren to preparing to ready.</li>' +
        '<li>Plant a seedling, then water it.</li>' +
        '<li>Wait for your first clean O₂. That completes Chapter 1 and unlocks crew hiring.</li></ol>' +
        '<div class="tip"><b>Good to know.</b> In Chapter 1 you work alone, so buildings and hiring stay locked until your first oxygen.</div>' },
      { id: 'care', title: 'Keep plants healthy', body:
        '<p>Healthy plants grow faster and make more oxygen. Three actions do most of the work.</p><ul class="checklist">' +
        '<li><b>Water</b> adds 30% hydration.</li><li><b>Prune</b> adds 20% vigor.</li><li><b>Drip irrigation</b> adds 15% growth and wastes less water.</li></ul>' +
        '<p>Pests and diseases also appear. Each plant in the <a href="#/library">Library</a> lists its common disease and the remedy.</p>' },
      { id: 'harvest-bottleneck', title: 'Pass the harvest bottleneck', body:
        '<p>Chapter 2 holds you back on purpose so you feel why machines matter.</p><ol class="steps">' +
        '<li>Plant all six plots, using at least three harvestable crops.</li>' +
        '<li>Do six manual harvests. The goal is at least three harvestable plots, harvested twice each.</li>' +
        '<li>Build the <b>' + esc(garage.label) + '</b> (€' + garage.cost + ', ' + garage.buildHours + ' h). You need at least one laborer, and two laborers build twice as fast.</li>' +
        '<li>Harvest again. Mechanized harvests take 3.5 seconds.</li></ol>' + storageNote +
        '<p>Finishing a mechanized harvest completes Chapter 2 and unlocks Chapter 3: the garden and the crop field.</p>' },
      { id: 'crop-limit', title: 'Why you cannot plant a 4th tree', body:
        '<p>The game limits non-harvestable trees to three at a time. The fourth is blocked.</p>' +
        '<p>This is the Crop Diversity Guardrail. It pushes you toward a mix of plants that feed the farm, because varied planting is more resilient than rows of the same tree. Crops you can harvest have no limit.</p>' +
        '<div class="tip"><b>Try this.</b> Fill spare plots with vegetables or fruit trees. Read about the idea under <a href="#/concepts">Concepts</a>, in Polyculture &amp; Companion Farming.</div>' },
      { id: 'power', title: 'Power your farm with wind', body:
        '<p>Chapter 5 gets you off the grid.</p><ol class="steps">' +
        '<li>Hire a certified engineer. Turbines cannot be built without one.</li>' +
        '<li>Build the <b>' + esc(wt.label) + '</b> (€' + wt.cost + ', ' + wt.buildHours + ' h). Four turbines sit in the corners and give 12 kWh/h in total.</li>' +
        '<li>Build <b>' + esc(bess.label) + '</b> (€' + bess.cost + ', ' + bess.buildHours + ' h). It stores up to 500 kWh so surplus wind is not wasted.</li></ol>' +
        '<p>Read why storage matters in the Why? cards on <a href="#/concepts">Concepts</a>.</p>' },
      { id: 'unlock-maps', title: 'Unlock new maps', body:
        '<p>Three maps are open now: your Central European farm, the Alpenhof Journey in Bavaria, and Saint Martin\'s Island Blue Lab. The rest open as your total oxygen grows.</p>' +
        '<table class="ledger"><thead><tr><th scope="col">Map</th><th scope="col">Total O₂ needed</th></tr></thead><tbody>' +
        D.biomes.slice().sort(function (a, b) { return a.unlockO2 - b.unlockO2; }).map(function (b) {
          return '<tr><td>' + b.flag + ' ' + esc(b.title) + '</td><td class="num-s">' + (isPlayable(b) ? 'Open now' : num(b.unlockO2)) + '</td></tr>';
        }).join('') + '</tbody></table>' +
        '<p style="margin-top:14px">Use the map picker on the <a href="#/">home page</a> to choose where the Play button takes you.</p>' },
      { id: 'blue-lab', title: 'Explore the Blue Lab', body:
        '<p>Saint Martin\'s Island is a coastal biome in the Bay of Bengal. You build it from scratch, and each build comes with an ecology card and an engineering card that explain why it works.</p>' +
        '<ul class="checklist"><li>Twin decagonal orchards with coconut, palmyra, keya, mangrove and casuarina</li><li>A greenhouse vegetable farm</li><li>Seaweed rafts, a freshwater lake and a mud crab farm</li><li>Floating solar, two wind turbines and a 500 kWh battery</li><li>Salt flats and a desalination core</li></ul>' +
        '<p>Zoom 1×, 2× or 5× and drag to pan around the island.</p><p><a class="btn" href="../saint-martin/blue-lab.html">Open the Blue Lab</a></p>' }
    ];
  }
  function pageHowto(arg) {
    var list = articles();
    var cur = list.filter(function (a) { return a.id === arg; })[0] || list[0];
    main.innerHTML =
      '<div class="page-head"><h1>How-to Guides</h1><p>Short guides for the moments where most players get stuck.</p></div>' +
      '<div class="wiki"><nav class="toc" aria-label="Guides">' +
      list.map(function (a) { return '<a href="#/howto/' + a.id + '"' + (a.id === cur.id ? ' aria-current="true"' : '') + '>' + esc(a.title) + '</a>'; }).join('') + '</nav>' +
      '<article class="article"><h2>' + esc(cur.title) + '</h2>' + cur.body + '</article></div>';
  }

  /* ------------------------------------------------------------------ *
   * PLAYER HUB (reads the game's save from this browser)
   * ------------------------------------------------------------------ */
  function pagePlayer() {
    var raw = lsGet(SAVE_KEY, ''), s = null;
    try { s = raw ? JSON.parse(raw) : null; } catch (e) { s = null; }
    var b = biome(selectedId());
    var head = '<div class="page-head"><h1>Player Hub</h1><p>Your progress from the game saved in this browser.</p></div>';
    var mapRow = '<section class="panel" style="margin-bottom:24px"><h2>Your map</h2><p>' + b.flag + ' <b>' + esc(b.title) + '</b> · ' + esc(b.biomeType) + '</p>' +
      '<a class="btn gold" href="' + destFor(b) + '">' + (isPlayable(b) ? 'Play this map' : 'Show it on the globe') + '</a></section>';
    if (!s || typeof s !== 'object') {
      main.innerHTML = head + '<div class="panel empty"><h2>No saved farm found</h2><p style="margin-inline:auto">Play for a minute and your progress shows up here. Saves are kept per browser, so a different device or a private window starts fresh.</p>' +
        '<a class="btn" href="' + destFor(b) + '">Start playing</a></div>' + mapRow + quizPanel();
      return;
    }
    var xp = Number(s.knowledgeXP || 0), lv = D.levels[0];
    D.levels.forEach(function (l) { if (xp >= l.minXP) lv = l; });
    var next = D.levels[D.levels.indexOf(lv) + 1];
    var pct = next ? Math.max(0, Math.min(100, Math.round((xp - lv.minXP) / (next.minXP - lv.minXP) * 100))) : 100;
    var quiz = s.quiz || {};
    var built = [];
    var bs = s.buildings || {};
    D.components.buildings.forEach(function (c) {
      var st = bs[c.key];
      if (c.key === 'wind_turbine') { var wts = bs.wind_turbines || {}; if (Object.keys(wts).some(function (k) { return wts[k] && wts[k].built; })) built.push(c); }
      else if (st && st.built) built.push(c);
    });
    var ach = s.achUnlocked || {};
    var got = D.achievements.filter(function (a) { return ach[a.id]; }).length;
    main.innerHTML = head +
      '<div class="level"><div class="big" aria-hidden="true">' + lv.icon + '</div><div style="flex:1"><h2>Level ' + lv.level + ': ' + esc(lv.title) + '</h2>' +
      '<div>' + num(xp) + ' Knowledge XP' + (next ? ' · ' + num(next.minXP - xp) + ' more for ' + esc(next.title) : ' · top level') + '</div>' +
      '<div class="track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Progress to next level"><i style="width:' + pct + '%"></i></div></div></div>' +
      '<div class="stats">' + stat('€' + num(Math.round(s.money || 0)), 'Money') + stat(num(Math.round(s.totalO2AllTime || 0)), 'Total O₂ made') +
      stat(num(s.treesPlanted || 0), 'Plants planted') + stat(num(s.harvestCount || 0), 'Harvests') +
      stat(num(quiz.totalCorrect || 0) + ' / ' + num(quiz.totalCompleted || 0), 'In-game quiz answers right') + '</div>' +
      mapRow +
      '<section class="panel" style="margin-bottom:24px"><h2>Buildings you have built</h2>' +
      (built.length ? '<div class="built">' + built.map(function (c) { return '<span class="pill">' + c.icon + ' ' + esc(c.label) + '</span>'; }).join('') + '</div>' : '<p class="muted">Nothing yet. See <a href="#/components">Components</a> for what to build first.</p>') + '</section>' +
      '<h2>Badges <span class="pill gold">' + got + ' of ' + D.achievements.length + '</span></h2><div class="badges">' +
      D.achievements.map(function (a) { return '<div class="badge' + (ach[a.id] ? '' : ' off') + '">' + esc(a.label) + (ach[a.id] ? '' : ' <span class="hint">(locked)</span>') + '</div>'; }).join('') + '</div>' +
      '<div style="margin-top:24px">' + quizPanel() + '</div>';
  }
  function stat(v, k) { return '<div class="stat"><div class="v">' + esc(v) + '</div><div class="k">' + esc(k) + '</div></div>'; }
  function quizPanel() {
    var best = Number(lsGet(QUIZ_KEY, '0'));
    return '<section class="panel"><h2>Hub plant quiz</h2><p>' + (best ? 'Your best score is ' + best + ' out of 6.' : 'You have not taken the quiz yet.') + '</p><a class="btn ghost" href="#/library">Go to the Library quiz</a></section>';
  }

  /* ------------------------------------------------------------------ *
   * HELP & FAQ
   * ------------------------------------------------------------------ */
  function faqs() {
    var locked = D.biomes.filter(function (b) { return !isPlayable(b); }).sort(function (a, b) { return a.unlockO2 - b.unlockO2; });
    return [
      ['Who is searchO2 for?', '<p>It is an educational simulation built for ages 8 and up, for families and classrooms. There are no loot boxes and no open chat.</p>'],
      ['Do I need an account?', '<p>No. You can play as a guest. Signing in with email or Google is optional.</p>'],
      ['Does my farm grow while I am away?', '<p>Yes. When you come back the game catches up on what happened while you were gone.</p>'],
      ['Where is my progress saved?', '<p>In this browser, automatically. The game saves about every 15 seconds. A different device or a private window will not see it. The <a href="#/player">Player Hub</a> shows what is saved here.</p>'],
      ['My phone asks me to rotate it', '<p>The game is made for landscape. Turn your phone sideways and it carries on.</p>'],
      ['Why can I not enter Brazil, Senegal or the other maps?', '<p>Only the Central European farm, Alpenhof and the Blue Lab are open right now. The rest unlock as your total oxygen grows: ' +
        locked.map(function (b) { return b.flag + ' ' + esc(shortTitle(b)) + ' at ' + num(b.unlockO2); }).join(', ') + '.</p>'],
      ['Why can I not plant a 4th tree?', '<p>Only three non-harvestable trees are allowed at once. Harvestable crops have no limit. <a href="#/howto/crop-limit">Read why</a>.</p>'],
      ['Why is the Farm Garage locked?', '<p>You need six manual harvests first, and at least one laborer to build it. <a href="#/howto/harvest-bottleneck">Step-by-step guide</a>.</p>'],
      ['Why can I not hire anyone?', '<p>Build the Crew Shed first. In Chapter 1 you work alone, and hiring unlocks once you make your first oxygen.</p>'],
      ['Half of my harvest was lost', '<p>Build the Storage Barn before large harvests. Without storage about half the crop spoils.</p>'],
      ['What is OxyForge?', '<p>OxyForge is the space part of searchO2, with Moon and Mars missions and a Sky lab. <a href="../public/oxyforge.html">Open OxyForge</a>.</p>'],
      ['Something is broken', '<p>Please <a href="#/report">report a problem</a>. The more detail you give, the faster it can be fixed.</p>'],
      ['I have an idea or a complaint', '<p>We want to hear it. Use the <a href="#/feedback">feedback form</a>.</p>']
    ];
  }
  function pageHelp() {
    var list = faqs();
    main.innerHTML = '<div class="page-head"><h1>Help &amp; FAQ</h1><p>Quick answers. Not here? <a href="#/report">Report a problem</a> or <a href="#/feedback">send feedback</a>.</p></div>' +
      '<div class="toolbar"><label class="sr-only" for="faqQ">Search help</label><input id="faqQ" class="search" type="search" placeholder="Search the help"></div>' +
      '<div class="faq" id="faqList"></div>';
    function paint(q) {
      q = (q || '').toLowerCase();
      var rows = list.filter(function (f) { return !q || (f[0] + ' ' + f[1].replace(/<[^>]+>/g, ' ')).toLowerCase().indexOf(q) >= 0; });
      $('#faqList').innerHTML = rows.map(function (f) { return '<details><summary>' + esc(f[0]) + '</summary><div class="a">' + f[1] + '</div></details>'; }).join('') ||
        '<div class="empty">Nothing matches. Try one word, like "harvest", or <a href="#/report">report a problem</a>.</div>';
    }
    $('#faqQ').addEventListener('input', function (e) { paint(e.target.value); });
    paint('');
  }

  /* ------------------------------------------------------------------ *
   * FORMS: Feedback + Report a Problem
   * ------------------------------------------------------------------ */
  function diagnostics() {
    var b = biome(selectedId());
    return ['Page: ' + location.pathname + location.hash, 'Map selected: ' + b.id, 'Browser: ' + navigator.userAgent,
      'Screen: ' + screen.width + 'x' + screen.height + ', window ' + innerWidth + 'x' + innerHeight, 'Language: ' + navigator.language,
      'Time zone: ' + (Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'), 'Hub version: ' + HUB_VERSION].join('\n');
  }
  function fieldErr(el, msg) {
    var f = el.closest('.field'); if (!f) return;
    f.classList.add('bad'); var e = $('.err', f); if (e) e.textContent = msg;
  }
  function clearErr(form) { $$('.field.bad', form).forEach(function (f) { f.classList.remove('bad'); }); }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function pageFeedback() {
    main.innerHTML = '<div class="page-head"><h1>Send Feedback</h1><p>What do you like? What would make the game or this hub better? It takes a minute.</p></div>' +
      '<form class="form" id="fbForm" novalidate>' +
      '<fieldset class="field"><legend>How is searchO2 for you right now?</legend><div class="faces" id="fbRate">' +
      [['1', '😞', 'Very bad'], ['2', '🙁', 'Bad'], ['3', '😐', 'Okay'], ['4', '🙂', 'Good'], ['5', '😍', 'Great']].map(function (r) {
        return '<label><input type="radio" name="rating" value="' + r[0] + '"><span title="' + r[2] + '" aria-hidden="true">' + r[1] + '</span><span class="sr-only">' + r[2] + '</span></label>';
      }).join('') + '</div><div class="err" role="alert"></div></fieldset>' +
      '<fieldset class="field"><legend>What is it about?</legend><div class="radios" id="fbTopic">' +
      ['Gameplay', 'Learning content', 'Look and feel', 'Something else'].map(function (t, i) {
        return '<label><input type="radio" name="topic" value="' + t + '"' + (i === 0 ? ' checked' : '') + '><span>' + t + '</span></label>';
      }).join('') + '</div></fieldset>' +
      '<div class="field"><label class="lbl" for="fbMsg">Your feedback</label><textarea id="fbMsg" name="message" maxlength="2000" aria-describedby="fbMsgH"></textarea>' +
      '<div class="hint" id="fbMsgH">Tell us what happened or what you would change. Up to 2000 characters.</div><div class="err" role="alert"></div></div>' +
      '<div class="field"><label class="lbl" for="fbEmail">Email (optional)</label><input type="email" id="fbEmail" name="email" autocomplete="email" aria-describedby="fbEmailH">' +
      '<div class="hint" id="fbEmailH">Only add it if you want a reply. We use it for that and nothing else.</div><div class="err" role="alert"></div></div>' +
      '<label class="check"><input type="checkbox" name="withMap" checked><span>Include which map I have selected (' + esc(biome(selectedId()).title) + ')</span></label>' +
      '<div><button class="btn" type="submit" id="fbSend">Send feedback</button></div><div id="fbOut" aria-live="polite"></div></form>' + outboxHtml();
    wireOutbox();
    var form = $('#fbForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(form);
      var d = new FormData(form), bad = false;
      if (!d.get('rating')) { fieldErr($('#fbRate'), 'Pick a face so we know how you feel.'); bad = true; }
      var msg = String(d.get('message') || '').trim();
      if (msg.length < 10) { fieldErr($('#fbMsg'), msg ? 'Add a little more detail. At least 10 characters.' : 'Write a few words about your experience.'); bad = true; }
      var em = String(d.get('email') || '').trim();
      if (em && !validEmail(em)) { fieldErr($('#fbEmail'), 'That email address does not look right. Check it or leave it empty.'); bad = true; }
      if (bad) { var first = $('.field.bad input, .field.bad textarea', form); if (first) first.focus(); return; }
      submit({ type: 'feedback', rating: Number(d.get('rating')), topic: d.get('topic'), message: msg, email: em || null, map: d.get('withMap') ? selectedId() : null }, form, $('#fbSend'), $('#fbOut'));
    });
  }

  function pageReport() {
    main.innerHTML = '<div class="page-head"><h1>Report a Problem</h1><p>Tell us what went wrong. A clear description and the steps to repeat it help us fix it quickly.</p></div>' +
      '<form class="form" id="rpForm" novalidate>' +
      '<div class="field"><label class="lbl" for="rpArea">Where did it happen?</label><select id="rpArea" name="area"><option value="">Choose one</option>' +
      ['Farm game (Central Europe)', 'World globe and map', 'Alpenhof Journey', 'Saint Martin Blue Lab', 'OxyForge and space', 'Library or quiz', 'Sign-in or save', 'This Learning Hub', 'Somewhere else'].map(function (a) { return '<option>' + a + '</option>'; }).join('') +
      '</select><div class="err" role="alert"></div></div>' +
      '<fieldset class="field"><legend>How bad is it?</legend><div class="radios">' +
      [['blocker', 'I cannot continue'], ['broken', 'Something is broken'], ['visual', 'Looks wrong'], ['minor', 'Small annoyance']].map(function (s, i) {
        return '<label><input type="radio" name="severity" value="' + s[0] + '"' + (i === 1 ? ' checked' : '') + '><span>' + s[1] + '</span></label>';
      }).join('') + '</div></fieldset>' +
      '<div class="field"><label class="lbl" for="rpTitle">Short summary</label><input type="text" id="rpTitle" name="title" maxlength="120"><div class="err" role="alert"></div></div>' +
      '<div class="field"><label class="lbl" for="rpWhat">What happened?</label><textarea id="rpWhat" name="what" maxlength="2000"></textarea><div class="err" role="alert"></div></div>' +
      '<div class="field"><label class="lbl" for="rpSteps">How can we repeat it? (optional)</label><textarea id="rpSteps" name="steps" maxlength="2000" aria-describedby="rpStepsH"></textarea><div class="hint" id="rpStepsH">For example: 1. Open the globe. 2. Click Bavaria. 3. The page stays blank.</div></div>' +
      '<div class="field"><label class="lbl" for="rpExp">What did you expect? (optional)</label><textarea id="rpExp" name="expected" maxlength="1000" style="min-height:80px"></textarea></div>' +
      '<div class="field"><label class="lbl" for="rpEmail">Email (optional)</label><input type="email" id="rpEmail" name="email" autocomplete="email" aria-describedby="rpEmailH"><div class="hint" id="rpEmailH">Only if you want us to reply about this report.</div><div class="err" role="alert"></div></div>' +
      '<div><label class="check"><input type="checkbox" name="diag" id="rpDiag" checked><span>Add technical details to help us find the cause</span></label>' +
      '<p class="hint" style="margin:8px 0 6px">This is exactly what will be sent. It does not include your save, name or email.</p><div class="diag" id="rpDiagBox"></div></div>' +
      '<div><button class="btn" type="submit" id="rpSend">Send report</button></div><div id="rpOut" aria-live="polite"></div></form>' + outboxHtml();
    wireOutbox();
    var form = $('#rpForm'), box = $('#rpDiagBox');
    box.textContent = diagnostics();
    $('#rpDiag').addEventListener('change', function (e) { box.style.display = e.target.checked ? '' : 'none'; });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(form);
      var d = new FormData(form), bad = false;
      if (!d.get('area')) { fieldErr($('#rpArea'), 'Choose where the problem happened.'); bad = true; }
      var title = String(d.get('title') || '').trim();
      if (title.length < 5) { fieldErr($('#rpTitle'), 'Give it a short summary, at least 5 characters.'); bad = true; }
      var what = String(d.get('what') || '').trim();
      if (what.length < 15) { fieldErr($('#rpWhat'), 'Describe what happened in a sentence or two.'); bad = true; }
      var em = String(d.get('email') || '').trim();
      if (em && !validEmail(em)) { fieldErr($('#rpEmail'), 'That email address does not look right. Check it or leave it empty.'); bad = true; }
      if (bad) { var first = $('.field.bad select, .field.bad input, .field.bad textarea', form); if (first) first.focus(); return; }
      submit({
        type: 'problem', area: d.get('area'), severity: d.get('severity'), title: title, what: what,
        steps: String(d.get('steps') || '').trim() || null, expected: String(d.get('expected') || '').trim() || null,
        email: em || null, map: selectedId(), diagnostics: d.get('diag') ? diagnostics() : null
      }, form, $('#rpSend'), $('#rpOut'));
    });
  }

  /* --- sending: try the API; if it is unreachable keep the report on this device --- */
  function getOutbox() { return lsJSON(OUTBOX_KEY, []); }
  function setOutbox(a) { return lsSet(OUTBOX_KEY, JSON.stringify(a)); }
  function postJSON(payload) {
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 8000) : null;
    return fetch(FEEDBACK_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctl ? ctl.signal : undefined
    }).then(function (r) { if (timer) clearTimeout(timer); if (!r.ok) throw new Error('HTTP ' + r.status); return r; },
      function (e) { if (timer) clearTimeout(timer); throw e; });
  }
  function submit(payload, form, btn, out) {
    payload.submittedAt = new Date().toISOString();
    payload.hubVersion = HUB_VERSION;
    btn.disabled = true; var label = btn.textContent; btn.textContent = 'Sending…';
    postJSON(payload).then(function () {
      form.reset();
      out.innerHTML = '<div class="result ok"><h3>Thank you. It was sent.</h3><p>' + (payload.type === 'problem' ? 'We will look into it.' : 'Every message gets read.') + '</p></div>';
    }).catch(function () {
      var box = getOutbox();
      box.push({ id: 'o' + Date.now().toString(36), payload: payload });
      var saved = setOutbox(box);
      out.innerHTML = '<div class="result warn"><h3>We could not send it just now</h3><p>' +
        (saved ? 'Your message is saved on this device. Use Retry in the list below when you are online, or copy the text and send it another way.' :
          'Your browser would not let us save it. Use Copy below so nothing is lost.') + '</p>' +
        (saved ? '' : '<pre class="diag">' + esc(formatPayload(payload)) + '</pre>') + '</div>';
      refreshOutbox();
    }).then(function () { btn.disabled = false; btn.textContent = label; out.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
  }
  function formatPayload(p) {
    var lines = [p.type === 'problem' ? 'PROBLEM REPORT: ' + p.title : 'FEEDBACK (' + p.rating + '/5, ' + p.topic + ')'];
    if (p.area) lines.push('Area: ' + p.area); if (p.severity) lines.push('Severity: ' + p.severity);
    lines.push('', p.message || p.what || '');
    if (p.steps) lines.push('', 'Steps: ' + p.steps); if (p.expected) lines.push('Expected: ' + p.expected);
    if (p.map) lines.push('Map: ' + p.map); if (p.email) lines.push('Reply to: ' + p.email);
    if (p.diagnostics) lines.push('', p.diagnostics);
    return lines.join('\n');
  }
  function outboxHtml() { return '<section class="outbox" id="outbox" aria-label="Saved on this device"></section>'; }
  function refreshOutbox() {
    var host = $('#outbox'); if (!host) return;
    var box = getOutbox();
    if (!box.length) { host.innerHTML = ''; return; }
    host.innerHTML = '<h2>Saved on this device</h2><p class="muted">These did not send yet.</p><ul>' + box.map(function (o) {
      var p = o.payload;
      return '<li><span style="flex:1"><b>' + (p.type === 'problem' ? 'Problem' : 'Feedback') + ':</b> ' + esc((p.title || p.message || '').slice(0, 70)) + '</span>' +
        '<button class="btn ghost" type="button" data-act="retry" data-id="' + o.id + '">Retry</button> ' +
        '<button class="btn ghost" type="button" data-act="copy" data-id="' + o.id + '">Copy</button> ' +
        '<button class="btn ghost" type="button" data-act="del" data-id="' + o.id + '" aria-label="Delete this saved message">Delete</button></li>';
    }).join('') + '</ul><div id="outboxMsg" aria-live="polite" class="hint"></div>';
  }
  function wireOutbox() {
    refreshOutbox();
    var host = $('#outbox');
    host.addEventListener('click', function (e) {
      var t = e.target.closest('[data-act]'); if (!t) return;
      var box = getOutbox(), item = box.filter(function (o) { return o.id === t.dataset.id; })[0]; if (!item) return;
      var msg = $('#outboxMsg');
      if (t.dataset.act === 'del') { setOutbox(box.filter(function (o) { return o !== item && o.id !== item.id; })); refreshOutbox(); }
      else if (t.dataset.act === 'copy') {
        var text = formatPayload(item.payload);
        (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(text) : Promise.reject()).then(
          function () { msg.textContent = 'Copied.'; }, function () { msg.textContent = 'Copy is blocked in this browser. Select the text from the saved report instead.'; });
      } else if (t.dataset.act === 'retry') {
        t.disabled = true; t.textContent = 'Sending…';
        postJSON(item.payload).then(function () {
          setOutbox(getOutbox().filter(function (o) { return o.id !== item.id; })); refreshOutbox();
          var m = $('#outboxMsg'); if (m) m.textContent = 'Sent. Thank you.';
        }).catch(function () { t.disabled = false; t.textContent = 'Retry'; msg.textContent = 'Still cannot reach the server. Try again later.'; });
      }
    });
  }

  /* ------------------------------------------------------------------ */
  paintGo();
  route();
  // Library drawer "see it grow" hand-off to the home demo
  window.addEventListener('hashchange', function () {
    if (location.hash === '#/' || location.hash === '') {
      var k = null; try { k = sessionStorage.getItem('hubGrow'); sessionStorage.removeItem('hubGrow'); } catch (e) {}
      var sel = $('#growSel');
      if (k && sel && $('option[value="' + k + '"]', sel)) { sel.value = k; sel.dispatchEvent(new Event('change')); }
    }
  });
})();
