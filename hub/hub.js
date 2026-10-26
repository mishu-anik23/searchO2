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

  function getCurrentUserContext() {
    var ctx = {
      userId: null,
      userName: null,
      userRole: null,
      authProvider: null,
      email: null,
      farmName: null,
      stateName: null,
      landName: null
    };
    try {
      var u = JSON.parse(localStorage.getItem('searchO2_user') || 'null');
      if (u) {
        ctx.userId = u.id || u.userId || null;
        ctx.userName = u.displayName || u.display_name || u.name || null;
        ctx.userRole = u.role || 'user';
        ctx.authProvider = u.auth_provider || u.authProvider || (u.whatsapp_phone ? 'whatsapp' : (u.email ? 'email' : 'local'));
        ctx.email = u.email || null;
      }
    } catch(e){}
    try {
      var gp = JSON.parse(localStorage.getItem('searchO2_guest_farm_profile') || 'null');
      if (gp) {
        ctx.farmName = gp.name || null;
        if (gp.coords) {
          ctx.stateName = gp.coords.stateName || gp.coords.region || null;
          ctx.landName = gp.coords.landName || null;
        }
        if (!ctx.userId) {
          ctx.userId = 'guest_' + (gp.name || 'farm').toLowerCase();
          ctx.userName = 'Guest: ' + (gp.name || 'AlpenO2');
          ctx.userRole = 'guest';
          ctx.authProvider = 'guest';
        }
      }
    } catch(e){}
    return ctx;
  }

  function renderHubAuthStatus() {
    var c = document.getElementById('hubHeaderAuthActions');
    if (!c) return;

    var uCtx = getCurrentUserContext();
    var uRaw = localStorage.getItem('searchO2_user');
    var userObj = null;
    try { if (uRaw) userObj = JSON.parse(uRaw); } catch(e){}

    if (userObj && (userObj.displayName || userObj.email || userObj.id)) {
      var name = userObj.displayName || userObj.name || (userObj.email ? userObj.email.split('@')[0] : 'Player');
      var prov = (userObj.auth_provider || userObj.authProvider || (userObj.whatsapp_phone ? 'whatsapp' : (userObj.email ? 'email' : 'local'))).toLowerCase();
      var provIcon = '🌿';
      var provLabel = 'Player';
      if (prov.indexOf('google') !== -1) { provIcon = '🌐'; provLabel = 'Google'; }
      else if (prov.indexOf('whatsapp') !== -1) { provIcon = '💬'; provLabel = 'WhatsApp'; }
      else if (prov.indexOf('github') !== -1) { provIcon = '🐙'; provLabel = 'GitHub'; }
      else if (prov.indexOf('email') !== -1) { provIcon = '✉️'; provLabel = 'Email'; }

      var avatarChar = (name.charAt(0) || 'P').toUpperCase();

      c.innerHTML = '<div class="hub-auth-user-badge logged-in" title="Signed in as ' + esc(name) + ' via ' + esc(provLabel) + '">' +
        '<span class="hub-auth-avatar">' + esc(avatarChar) + '</span>' +
        '<div class="hub-auth-info">' +
          '<span class="hub-auth-medium">' + provIcon + ' ' + esc(provLabel) + '</span>' +
          '<span class="hub-auth-name">' + esc(name) + '</span>' +
        '</div>' +
        '<a href="../index.html?enter=farm" class="hub-auth-enter-btn" title="Launch Active Farm">🎮 Farm</a>' +
        '<button type="button" class="hub-auth-switch-btn" id="btnHubSignOut" title="Sign Out or Switch Account">✕</button>' +
      '</div>';

      var btnSignOut = document.getElementById('btnHubSignOut');
      if (btnSignOut) {
        btnSignOut.onclick = function(e) {
          e.preventDefault();
          if (confirm('Sign out of ' + name + ' and switch accounts?')) {
            try {
              localStorage.removeItem('searchO2_user');
              localStorage.removeItem('searchO2_token');
            } catch(ex){}
            location.href = '../index.html?auth=1';
          }
        };
      }
      return;
    }

    var gRaw = localStorage.getItem('searchO2_guest_farm_profile') || localStorage.getItem('searchO2_guest_user');
    if (gRaw || localStorage.getItem('searcho2_guest_session')) {
      var gp = null;
      try { if (gRaw) gp = JSON.parse(gRaw); } catch(e){}
      var farmTitle = (gp && gp.name) ? gp.name : 'AlpenO2';
      var landTitle = (gp && gp.coords && (gp.coords.landName || gp.coords.region)) ? (gp.coords.landName || gp.coords.region) : 'Alpenhof';

      c.innerHTML = '<div class="hub-auth-user-badge guest" title="Guest Mode: ' + esc(farmTitle) + '">' +
        '<span class="hub-auth-avatar guest-avatar">👤</span>' +
        '<div class="hub-auth-info">' +
          '<span class="hub-auth-medium">👤 Guest Trial</span>' +
          '<span class="hub-auth-name">' + esc(farmTitle) + ' · ' + esc(landTitle) + '</span>' +
        '</div>' +
        '<a href="../index.html?enter=farm" class="hub-auth-enter-btn" title="Enter Farm">🎮 Farm</a>' +
        '<a href="../index.html?auth=1" class="hub-auth-upgrade-btn" title="Sign In or Claim Farm">Sign In ➔</a>' +
      '</div>';
      return;
    }

    c.innerHTML = '<a class="hub-nav-game hub-nav-guest" href="../index.html?guest=1&enter=farm" title="Instant 1-Click Guest Mode Farm Play">' +
      '<span class="hub-nav-icon">🎮</span>' +
      '<span>Play as Guest</span>' +
    '</a>' +
    '<a class="hub-nav-game hub-nav-auth" href="../index.html?auth=1" title="Sign In or Register to Sync Across Devices">' +
      '<span class="hub-nav-icon">👤</span>' +
      '<span>Sign In</span>' +
    '</a>';
  }
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
    {
      id: 'feedback',
      label: 'Feedback',
      title: 'Feedback',
      render: pageFeedback,
      subroutes: [
        { id: 'chapter', label: 'Chapter Feedback', title: 'Chapter Feedback' },
        { id: 'playtest', label: 'Full Playtest Review', title: 'Full Playtest Review' }
      ]
    },
    { id: 'report', label: 'Report a Problem', title: 'Report a Problem', render: pageReport }
  ];
  renderHubAuthStatus();
  $('#nav').innerHTML = ROUTES.map(function (r) {
    if (r.subroutes) {
      return '<div class="nav-dropdown" data-route="' + r.id + '">' +
        '<a href="#/' + r.id + '" data-route="' + r.id + '" class="nav-dropdown-toggle">' + esc(r.label) + ' <span class="nav-caret" aria-hidden="true">▾</span></a>' +
        '<div class="nav-dropdown-menu" role="menu">' +
          r.subroutes.map(function (s) {
            return '<a href="#/' + r.id + '/' + s.id + '" data-subroute="' + s.id + '" role="menuitem">' + esc(s.label) + '</a>';
          }).join('') +
        '</div>' +
      '</div>';
    }
    return '<a href="#/' + r.id + '" data-route="' + r.id + '">' + esc(r.label) + '</a>';
  }).join('');

  var firstRender = true;
  function route() {
    closeDrawer();
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var id = parts[0] || '', arg = parts[1] || '';
    var r = ROUTES.filter(function (x) { return x.id === id; })[0] || ROUTES[0];
    $$('#nav a').forEach(function (a) {
      if (a.dataset.route === r.id) {
        a.setAttribute('aria-current', 'page');
      } else if (!a.dataset.subroute) {
        a.removeAttribute('aria-current');
      }
      if (a.dataset.subroute) {
        var isCurrentSub = (r.id === id) && (a.dataset.subroute === arg || (!arg && a.dataset.subroute === 'chapter'));
        if (isCurrentSub) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
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
  window.addEventListener('hashchange', route);

  /* ------------------------------------------------------------------ *
   * HOME: growth demo + map + doors
   * ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------ *
   * 3D VOLUMETRIC TREE ENGINE & 3D CRISP FLAGS
   * ------------------------------------------------------------------ */
  function adjustColor(col, amt) {
    if (!col) return '#888888';
    var str = String(col).trim();
    if (str.charAt(0) === '#') str = str.slice(1);
    if (str.length === 3) str = str.charAt(0)+str.charAt(0)+str.charAt(1)+str.charAt(1)+str.charAt(2)+str.charAt(2);
    var num = parseInt(str, 16);
    if (isNaN(num)) return col;
    var r = Math.min(255, Math.max(0, (num >> 16) + amt));
    var g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    var b = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + ('000000' + ((r << 16) | (g << 8) | b).toString(16)).slice(-6);
  }

  var flagIdCounter = 0;
  function get3DCountryFlagSvg(codeOrId, width, height) {
    var w = width || 28;
    var h = height || 20;
    var id = (codeOrId || '').toLowerCase();
    flagIdCounter++;
    var uid = flagIdCounter;

    // Germany
    if (id === 'germany' || id === 'de') {
      return '<svg class="s2-volumetric-flag" viewBox="0 0 28 20" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="fGlossDE_' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0.32"/><stop offset="100%" stop-color="#000" stop-opacity="0.18"/></linearGradient></defs>' +
        '<clipPath id="fcDE_' + uid + '"><rect width="28" height="20" rx="3.5"/></clipPath>' +
        '<g clip-path="url(#fcDE_' + uid + ')">' +
          '<rect width="28" height="6.67" fill="#1A1A1A"/>' +
          '<rect y="6.67" width="28" height="6.67" fill="#D32F2F"/>' +
          '<rect y="13.34" width="28" height="6.67" fill="#FFC107"/>' +
          '<rect width="28" height="20" fill="url(#fGlossDE_' + uid + ')"/>' +
        '</g>' +
      '</svg>';
    }

    // Bavaria
    if (id === 'bavaria' || id === 'by') {
      return '<svg class="s2-volumetric-flag" viewBox="0 0 28 20" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="fGlossBY_' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0.32"/><stop offset="100%" stop-color="#000" stop-opacity="0.18"/></linearGradient>' +
          '<pattern id="bavLozPatt_' + uid + '" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">' +
            '<rect width="8" height="4" fill="#0080FF"/>' +
            '<rect y="4" width="8" height="4" fill="#FFFFFF"/>' +
          '</pattern>' +
        '</defs>' +
        '<clipPath id="fcBY_' + uid + '"><rect width="28" height="20" rx="3.5"/></clipPath>' +
        '<g clip-path="url(#fcBY_' + uid + ')">' +
          '<rect width="28" height="20" fill="url(#bavLozPatt_' + uid + ')"/>' +
          '<rect width="28" height="20" fill="url(#fGlossBY_' + uid + ')"/>' +
        '</g>' +
      '</svg>';
    }

    // Bangladesh (Saint Martin's Island)
    if (id === 'saint_martin' || id === 'bangladesh' || id === 'bd') {
      return '<svg class="s2-volumetric-flag" viewBox="0 0 28 20" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="fGlossBD_' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0.32"/><stop offset="100%" stop-color="#000" stop-opacity="0.18"/></linearGradient></defs>' +
        '<clipPath id="fcBD_' + uid + '"><rect width="28" height="20" rx="3.5"/></clipPath>' +
        '<g clip-path="url(#fcBD_' + uid + ')">' +
          '<rect width="28" height="20" fill="#006A4E"/>' +
          '<circle cx="12.5" cy="10" r="5.6" fill="#F42A41"/>' +
          '<rect width="28" height="20" fill="url(#fGlossBD_' + uid + ')"/>' +
        '</g>' +
      '</svg>';
    }

    // Brazil
    if (id === 'brazil' || id === 'br') {
      return '<svg class="s2-volumetric-flag" viewBox="0 0 28 20" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="fGlossBR_' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0.32"/><stop offset="100%" stop-color="#000" stop-opacity="0.18"/></linearGradient></defs>' +
        '<clipPath id="fcBR_' + uid + '"><rect width="28" height="20" rx="3.5"/></clipPath>' +
        '<g clip-path="url(#fcBR_' + uid + ')">' +
          '<rect width="28" height="20" fill="#009739"/>' +
          '<polygon points="14,2 25.5,10 14,18 2.5,10" fill="#FEDD00"/>' +
          '<circle cx="14" cy="10" r="4.2" fill="#012169"/>' +
          '<path d="M10.2,10.6 Q14,9 17.8,11.2" stroke="#FFF" stroke-width="0.8" fill="none"/>' +
          '<rect width="28" height="20" fill="url(#fGlossBR_' + uid + ')"/>' +
        '</g>' +
      '</svg>';
    }

    // Sweden
    if (id === 'sweden' || id === 'se') {
      return '<svg class="s2-volumetric-flag" viewBox="0 0 28 20" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="fGlossSE_' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0.32"/><stop offset="100%" stop-color="#000" stop-opacity="0.18"/></linearGradient></defs>' +
        '<clipPath id="fcSE_' + uid + '"><rect width="28" height="20" rx="3.5"/></clipPath>' +
        '<g clip-path="url(#fcSE_' + uid + ')">' +
          '<rect width="28" height="20" fill="#006AA7"/>' +
          '<rect x="7.5" width="4" height="20" fill="#FECC00"/>' +
          '<rect y="8" width="28" height="4" fill="#FECC00"/>' +
          '<rect width="28" height="20" fill="url(#fGlossSE_' + uid + ')"/>' +
        '</g>' +
      '</svg>';
    }

    // Spain
    if (id === 'spain' || id === 'es') {
      return '<svg class="s2-volumetric-flag" viewBox="0 0 28 20" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="fGlossES_' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0.32"/><stop offset="100%" stop-color="#000" stop-opacity="0.18"/></linearGradient></defs>' +
        '<clipPath id="fcES_' + uid + '"><rect width="28" height="20" rx="3.5"/></clipPath>' +
        '<g clip-path="url(#fcES_' + uid + ')">' +
          '<rect width="28" height="5" fill="#AA151B"/>' +
          '<rect y="5" width="28" height="10" fill="#F1BF00"/>' +
          '<rect y="15" width="28" height="5" fill="#AA151B"/>' +
          '<rect width="28" height="20" fill="url(#fGlossES_' + uid + ')"/>' +
        '</g>' +
      '</svg>';
    }

    return '<svg class="s2-volumetric-flag" viewBox="0 0 28 20" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg"><rect width="28" height="20" rx="3.5" fill="#2E7D32"/><circle cx="14" cy="10" r="6" fill="#81C784"/></svg>';
  }

  function renderVolumetric3DTreeInner(sp) {
    var c = sp.canopy || '#4E8F52', t = sp.trunk || '#6E4429', d = sp.dotColor, shape = sp.shape || 'round';
    var litCol = adjustColor(c, 24);
    var shadeCol = adjustColor(c, -26);
    var deepCol = adjustColor(c, -44);
    var sunCol = adjustColor(c, 42);

    var trunkLit = adjustColor(t, 22);
    var trunkShade = adjustColor(t, -25);

    var groundShadow = '<ellipse cx="0" cy="2" rx="48" ry="12" fill="rgba(20,40,24,0.28)"/>';
    var trunk = '';
    var canopy = '';
    var dots = '';

    if (shape === 'bush') {
      groundShadow = '<ellipse cx="0" cy="2" rx="42" ry="11" fill="rgba(20,40,24,0.28)"/>';
      canopy = '<g>' +
        '<ellipse cx="0" cy="-6" rx="44" ry="14" fill="' + deepCol + '"/>' +
        '<circle cx="-24" cy="-28" r="28" fill="' + litCol + '"/>' +
        '<circle cx="24" cy="-28" r="28" fill="' + shadeCol + '"/>' +
        '<circle cx="0" cy="-44" r="34" fill="' + c + '"/>' +
        '<circle cx="-8" cy="-52" r="16" fill="' + sunCol + '"/>' +
        '<circle cx="12" cy="-40" r="14" fill="' + litCol + '"/>' +
      '</g>';
      if (d) {
        dots = '<g fill="' + d + '" stroke="' + adjustColor(d, -30) + '" stroke-width="0.8">' +
          '<circle cx="-22" cy="-28" r="4.2"/><circle cx="20" cy="-24" r="4.2"/><circle cx="-2" cy="-48" r="4.5"/><circle cx="12" cy="-56" r="3.8"/>' +
        '</g>';
      }
    } else if (shape === 'conifer') {
      var trunkH = 46;
      trunk = '<g>' +
        '<polygon points="-14,0 -10,-8 10,-8 14,0" fill="' + trunkShade + '"/>' +
        '<polygon points="-7,-' + trunkH + ' 0,-' + trunkH + ' 0,0 -8,0" fill="' + trunkLit + '"/>' +
        '<polygon points="0,-' + trunkH + ' 7,-' + trunkH + ' 8,0 0,0" fill="' + trunkShade + '"/>' +
        '<line x1="-3" y1="-' + (trunkH - 4) + '" x2="-3" y2="-2" stroke="' + adjustColor(t, 32) + '" stroke-width="0.9" opacity="0.6"/>' +
      '</g>';

      canopy = '<g>' +
        '<polygon points="0,-130 -62,-52 0,-47" fill="' + litCol + '"/>' +
        '<polygon points="0,-130 0,-47 62,-52" fill="' + shadeCol + '"/>' +
        '<path d="M-62,-52 Q0,-44 62,-52 L0,-47 Z" fill="' + deepCol + '"/>' +
        '<polygon points="0,-170 -50,-102 0,-97" fill="' + litCol + '"/>' +
        '<polygon points="0,-170 0,-97 50,-102" fill="' + shadeCol + '"/>' +
        '<path d="M-50,-102 Q0,-94 50,-102 L0,-97 Z" fill="' + deepCol + '"/>' +
        '<polygon points="0,-205 -36,-148 0,-144" fill="' + sunCol + '"/>' +
        '<polygon points="0,-205 0,-144 36,-148" fill="' + shadeCol + '"/>' +
        '<line x1="0" y1="-205" x2="0" y2="-47" stroke="' + adjustColor(c, 36) + '" stroke-width="0.9" opacity="0.45"/>' +
      '</g>';
    } else if (shape === 'umbrella') {
      var trunkH = 80;
      trunk = '<g>' +
        '<polygon points="-12,0 -9,-8 9,-8 12,0" fill="' + trunkShade + '"/>' +
        '<rect x="-6" y="-' + trunkH + '" width="6" height="' + trunkH + '" fill="' + trunkLit + '"/>' +
        '<rect x="0" y="-' + trunkH + '" width="6" height="' + trunkH + '" fill="' + trunkShade + '"/>' +
        '<path d="M-2,-' + trunkH + ' L-42,-' + (trunkH + 20) + ' M2,-' + trunkH + ' L42,-' + (trunkH + 20) + ' M0,-' + trunkH + ' L0,-' + (trunkH + 24) + '" stroke="' + t + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '</g>';

      canopy = '<g>' +
        '<ellipse cx="0" cy="-' + (trunkH + 18) + '" rx="76" ry="24" fill="' + deepCol + '"/>' +
        '<ellipse cx="3" cy="-' + (trunkH + 24) + '" rx="80" ry="28" fill="' + shadeCol + '"/>' +
        '<ellipse cx="-4" cy="-' + (trunkH + 26) + '" rx="72" ry="25" fill="' + litCol + '"/>' +
        '<ellipse cx="-12" cy="-' + (trunkH + 30) + '" rx="42" ry="14" fill="' + sunCol + '"/>' +
      '</g>';

      if (d) {
        dots = '<g fill="' + d + '" stroke="' + adjustColor(d, -30) + '" stroke-width="0.8">' +
          '<circle cx="-38" cy="-' + (trunkH + 24) + '" r="4.5"/><circle cx="34" cy="-' + (trunkH + 22) + '" r="4.5"/><circle cx="-8" cy="-' + (trunkH + 34) + '" r="4.2"/>' +
        '</g>';
      }
    } else if (shape === 'tallRound') {
      var trunkH = 65;
      trunk = '<g>' +
        '<polygon points="-12,0 -8,-7 8,-7 12,0" fill="' + trunkShade + '"/>' +
        '<rect x="-6" y="-' + trunkH + '" width="6" height="' + trunkH + '" fill="' + trunkLit + '"/>' +
        '<rect x="0" y="-' + trunkH + '" width="6" height="' + trunkH + '" fill="' + trunkShade + '"/>' +
      '</g>';

      canopy = '<g>' +
        '<ellipse cx="0" cy="-' + (trunkH + 40) + '" rx="34" ry="26" fill="' + deepCol + '"/>' +
        '<ellipse cx="3" cy="-' + (trunkH + 72) + '" rx="38" ry="76" fill="' + shadeCol + '"/>' +
        '<ellipse cx="-4" cy="-' + (trunkH + 74) + '" rx="34" ry="74" fill="' + litCol + '"/>' +
        '<ellipse cx="-5" cy="-' + (trunkH + 110) + '" rx="22" ry="34" fill="' + sunCol + '"/>' +
      '</g>';

      if (d) {
        dots = '<g fill="' + d + '" stroke="' + adjustColor(d, -30) + '" stroke-width="0.8">' +
          '<circle cx="-16" cy="-' + (trunkH + 60) + '" r="4.5"/><circle cx="16" cy="-' + (trunkH + 85) + '" r="4.5"/><circle cx="-2" cy="-' + (trunkH + 120) + '" r="4.2"/>' +
        '</g>';
      }
    } else {
      var trunkH = 68;
      trunk = '<g>' +
        '<polygon points="-15,0 -10,-8 10,-8 15,0" fill="' + trunkShade + '"/>' +
        '<polygon points="-8,-' + trunkH + ' 0,-' + trunkH + ' 0,0 -10,0" fill="' + trunkLit + '"/>' +
        '<polygon points="0,-' + trunkH + ' 8,-' + trunkH + ' 10,0 0,0" fill="' + trunkShade + '"/>' +
        '<line x1="-3" y1="-' + (trunkH - 6) + '" x2="-3" y2="-2" stroke="' + adjustColor(t, 32) + '" stroke-width="0.9" opacity="0.6"/>' +
      '</g>';

      canopy = '<g>' +
        '<ellipse cx="2" cy="-' + (trunkH + 30) + '" rx="60" ry="24" fill="' + deepCol + '"/>' +
        '<circle cx="28" cy="-' + (trunkH + 46) + '" r="44" fill="' + shadeCol + '"/>' +
        '<circle cx="0" cy="-' + (trunkH + 58) + '" r="58" fill="' + c + '"/>' +
        '<circle cx="-26" cy="-' + (trunkH + 54) + '" r="46" fill="' + litCol + '"/>' +
        '<ellipse cx="-16" cy="-' + (trunkH + 82) + '" rx="28" ry="20" fill="' + sunCol + '"/>' +
        '<ellipse cx="18" cy="-' + (trunkH + 74) + '" rx="18" ry="14" fill="' + litCol + '"/>' +
      '</g>';

      if (d) {
        dots = '<g fill="' + d + '" stroke="' + adjustColor(d, -30) + '" stroke-width="0.8">' +
          '<circle cx="-28" cy="-' + (trunkH + 54) + '" r="4.5"/><circle cx="26" cy="-' + (trunkH + 46) + '" r="4.5"/><circle cx="-4" cy="-' + (trunkH + 90) + '" r="4.2"/><circle cx="34" cy="-' + (trunkH + 78) + '" r="4.0"/>' +
        '</g>';
      }
    }

    return groundShadow + trunk + canopy + dots;
  }

  function renderVolumetricTreeSvg(sp, width, height) {
    var w = width || 112;
    var h = height || 92;
    return '<svg class="s2-volumetric-tree" viewBox="-90 -220 180 230" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(sp.label || 'Plant') + '">' +
      renderVolumetric3DTreeInner(sp) +
    '</svg>';
  }

  function treeSVGInner(sp) {
    return renderVolumetric3DTreeInner(sp);
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

  function renderShakirSpotlightSvg() {
    if (window.SearchO2ShakirGuide && typeof window.SearchO2ShakirGuide.renderShakirFigureSvg === 'function') {
      return window.SearchO2ShakirGuide.renderShakirFigureSvg({ w: 84, h: 148, unique: 'hub_spotlight' });
    }
    return '<svg viewBox="0 0 72 108" width="84" height="148" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Shakir - SearchO2 Co-Founder &amp; CEO">' +
      '<circle cx="36" cy="22" r="16" fill="#F5C7A9"/>' +
      '<path d="M20 20 Q36 6 52 20 Q36 12 20 20 Z" fill="#3D2314"/>' +
      '<circle cx="31" cy="22" r="2.5" fill="#1E293B"/><circle cx="41" cy="22" r="2.5" fill="#1E293B"/>' +
      '<path d="M31 29 Q36 34 41 29" stroke="#991B1B" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<rect x="22" y="38" width="28" height="36" rx="6" fill="#FFFFFF"/>' +
      '<circle cx="42" cy="46" r="5" fill="#EAB308"/><circle cx="42" cy="46" r="3" fill="#22C55E"/>' +
      '<rect x="24" y="74" width="10" height="20" rx="3" fill="#78350F"/>' +
      '<rect x="38" y="74" width="10" height="20" rx="3" fill="#78350F"/>' +
      '<rect x="22" y="94" width="13" height="8" rx="3" fill="#166534"/>' +
      '<rect x="37" y="94" width="13" height="8" rx="3" fill="#166534"/>' +
    '</svg>';
  }

  function pageHome() {
    var c = D.counts;
    main.innerHTML =
      '<section class="hero hero-game-standard">' +
        '<div class="hero-content">' +
          '<div class="hero-top-badge"><span class="badge-icon">🏆</span> Next-Gen Planetary Agro-Forestry &amp; Sequestration Engine</div>' +
          '<h1 class="hero-game-title">SearchO2 — Planetary Ecosystem &amp; Reforestation Game</h1>' +
          '<p class="lead">Cultivate biodiverse agro-forests, rebalance continental soil health, and capture verified carbon across 10 global biomes. Every planted tree actively sequesters calculated kilograms of real CO₂ calibrated to IPCC botanical models.</p>' +
          '<div class="game-highlights-strip">' +
            '<div class="gh-item"><span class="gh-ico">🌿</span> <b>' + c.species + '+</b> Botanical Species</div>' +
            '<div class="gh-item"><span class="gh-ico">🌍</span> <b>' + c.biomes + '</b> Living Biomes</div>' +
            '<div class="gh-item"><span class="gh-ico">🗺️</span> <b>3D OpenStreetMap</b> Custom German Coordinates</div>' +
            '<div class="gh-item"><span class="gh-ico">🔬</span> <b>IPCC</b> Carbon Physics</div>' +
            '<div class="gh-item"><span class="gh-ico">🧑‍💼</span> <b>Shakir</b> Co-Founder &amp; CEO</div>' +
            '<div class="gh-item"><span class="gh-ico">🎮</span> <b>100% Free</b> · Kids &amp; Schools</div>' +
          '</div>' +
          '<div class="hero-game-ctas">' +
            '<a class="btn-game btn-game-primary" href="../index.html?guest=1&amp;enter=farm" title="Instant 1-Click Guest Access">' +
              '<span class="cta-game-icon">🎮</span>' +
              '<span class="cta-game-text"><strong>Play Free as Guest</strong><small>1-Click Instant Enter · Pick 3D OpenStreetMap Location &amp; Custom Banner</small></span>' +
              '<span class="cta-game-arrow">➔</span>' +
            '</a>' +
            '<a class="btn-game btn-game-secondary" href="../index.html?auth=1" title="Sign In or Register with Google, GitHub, or Password">' +
              '<span class="cta-game-icon">👤</span>' +
              '<span class="cta-game-text"><strong>Sign In / Register</strong><small>Sync Farms, Cloud Save &amp; Radar Passport</small></span>' +
              '<span class="cta-game-arrow">➔</span>' +
            '</a>' +
            '<a class="btn-game btn-game-tertiary" href="../index.html" title="Open the 3D Biome Planetary Earth Globe">' +
              '<span class="cta-game-icon">🌐</span>' +
              '<span class="cta-game-text"><strong>Launch 3D Biome Globe</strong><small>Track Real-Time Planetary Radar &amp; Lat/Lon</small></span>' +
              '<span class="cta-game-arrow">➔</span>' +
            '</a>' +
          '</div>' +
        '</div>' +
        growDemo() +
      '</section>' +

      '<section class="ceo-spotlight-card">' +
        '<div class="ceo-avatar-col">' +
          renderShakirSpotlightSvg() +
        '</div>' +
        '<div class="ceo-info-col">' +
          '<div class="ceo-badge"><span class="pill gold">🧑‍💼 Leadership &amp; Farm Guide</span></div>' +
          '<h2>Meet Shakir · Co-Founder &amp; CEO of SearchO2</h2>' +
          '<p class="ceo-quote">"👋 Hello Eco-Explorers! I am Shakir, Co-Founder &amp; CEO of SearchO2. I built this green planet simulation so explorers of all ages can heal biomes through real search-driven tree planting. In our guest mode, establish your basic farm anywhere in Germany with our interactive 3D OpenStreetMap locator, christen your official farm name (max 9 letters) on our volumetric 3D isometric gate banner, and I will walk alongside you from traditional Bavarian Alpine farming, cattling, dairy, and vineyards to our Coral Reef Ranger journey on Saint Martin! Let us grow a greener planet together!"</p>' +
          '<div class="ceo-actions">' +
            '<a class="btn gold" href="../index.html?guest=1&amp;enter=farm">🚜 Meet Shakir on the Farm (Guest Tour) ➔</a>' +
            '<a class="btn ghost" href="#/start">🌱 View Chapter Guides</a>' +
            '<a class="btn ghost" href="#/feedback">💬 Share Feedback with Shakir</a>' +
          '</div>' +
        '</div>' +
      '</section>' +

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
      '<div class="toolbar" id="regChips" role="group" aria-label="Biome">' +
        '<button class="chip" aria-pressed="true" data-v="all"><span class="chip-flag-icon">🌍</span> All biomes</button>' +
        Object.keys(REGION_LABEL).map(function (r) { return '<button class="chip" aria-pressed="false" data-v="' + r + '">' + get3DCountryFlagSvg(r, 18, 12) + ' ' + REGION_LABEL[r] + '</button>'; }).join('') +
      '</div>' +
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
          '<div class="top"></div>' +
          '<div class="packet-3d-box" aria-hidden="true">' + renderVolumetricTreeSvg(s, 112, 92) + '</div>' +
          '<b>' + esc(s.label) + '</b>' +
          '<i>' + esc(s.sciName || '') + '</i>' +
          '<div class="packet-tags">' +
            '<span class="cat">' + esc(s.category) + '</span>' +
            '<span class="packet-region-tag" title="' + esc(REGION_LABEL[(s.regions && s.regions[0]) || 'germany'] || '') + '">' + get3DCountryFlagSvg((s.regions && s.regions[0]) || 'germany', 18, 12) + ' <span>' + esc(REGION_LABEL[(s.regions && s.regions[0]) || 'germany'] || (s.regions && s.regions[0]) || 'germany') + '</span></span>' +
          '</div>' +
        '</button>';
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
    var regionTags = s.regions.map(function (r) {
      return '<span class="pill pill-flag">' + get3DCountryFlagSvg(r, 22, 15) + ' <span>' + esc(REGION_LABEL[r] || r) + '</span></span>';
    }).join('');
    openDrawer('<div class="species-3d-hero">' + renderVolumetricTreeSvg(s, 220, 160) + '</div>' +
      '<h2 id="drawerTitle"><span aria-hidden="true">' + s.icon + '</span> ' + esc(s.label) + '</h2>' +
      '<p class="muted"><i>' + esc(s.sciName || '') + '</i> · ' + esc(s.category) + (s.cost ? ' · €' + s.cost + ' to plant' : '') + '</p>' +
      '<div class="tags">' + regionTags + '</div>' +
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
   * FORMS: Feedback (Chapter Feedback & Full Playtest) + Report a Problem
   * ------------------------------------------------------------------ */
  function diagnostics() {
    var b = biome(selectedId());
    return ['Page: ' + location.pathname + location.hash, 'Map selected: ' + b.id, 'Browser: ' + navigator.userAgent,
      'Screen: ' + screen.width + 'x' + screen.height + ', window ' + innerWidth + 'x' + innerHeight, 'Language: ' + navigator.language,
      'Time zone: ' + (Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'), 'Hub version: ' + HUB_VERSION].join('\n');
  }
  function detectDeviceBrowser() {
    var ua = navigator.userAgent || '';
    var os = 'Device';
    if (/Windows NT 10|Windows/i.test(ua)) os = 'Windows';
    else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    var br = 'Browser';
    if (/Edg\//i.test(ua)) br = 'Edge';
    else if (/Chrome\//i.test(ua)) br = 'Chrome';
    else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) br = 'Safari';
    else if (/Firefox\//i.test(ua)) br = 'Firefox';

    return os + ' · ' + br;
  }
  function fieldErr(el, msg) {
    var f = el.closest('.field'); if (!f) return;
    f.classList.add('bad'); var e = $('.err', f); if (e) e.textContent = msg;
  }
  function clearErr(form) { $$('.field.bad', form).forEach(function (f) { f.classList.remove('bad'); }); }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function feedbackSubnav(currentSub) {
    return '<div class="feedback-subnav-container">' +
      '<nav class="feedback-subnav" role="tablist" aria-label="Feedback submenus">' +
        '<a href="#/feedback/chapter" role="tab" class="subnav-tab' + (currentSub === 'chapter' ? ' active' : '') + '" aria-selected="' + (currentSub === 'chapter') + '">' +
          '<span class="subnav-tab-icon">📖</span><span class="subnav-tab-label">Chapter Feedback</span><span class="subnav-tab-badge">Submenu 1</span>' +
        '</a>' +
        '<a href="#/feedback/playtest" role="tab" class="subnav-tab' + (currentSub === 'playtest' ? ' active' : '') + '" aria-selected="' + (currentSub === 'playtest') + '">' +
          '<span class="subnav-tab-icon">🎮</span><span class="subnav-tab-label">Full Playtest Review</span><span class="subnav-tab-badge">Submenu 2</span>' +
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
    main.innerHTML = '<div class="page-head">' +
      '<div class="form-badge"><span class="badge-icon">📖</span> Submenu 1 · Chapter Experience</div>' +
      '<h1>SearchO₂ Chapter Feedback</h1>' +
      '<p class="form-intro">Tell us about the chapter you just played. This takes about two minutes and helps us improve clarity, difficulty and progression.</p>' +
      '</div>' +
      feedbackSubnav('chapter') +
      '<form class="form" id="fbForm" novalidate>' +
        '<div class="form-section-card">' +
          '<h2 class="form-section-heading"><span class="form-section-num">1</span> Your play session</h2>' +
          '<fieldset class="field"><legend class="lbl">1. Which SearchO₂ game version or build did you play?</legend>' +
            '<div class="radios">' +
              ['Current test version', 'Previous test version', 'I’m not sure'].map(function (v, i) {
                return '<label><input type="radio" name="gameVersion" value="' + v + '"' + (i === 0 ? ' checked' : '') + '><span>' + v + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
          '<fieldset class="field"><legend class="lbl">2. Which chapter are you reviewing?</legend>' +
            '<div class="radios">' +
              ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Another chapter', 'I’m not sure'].map(function (c, i) {
                return '<label><input type="radio" name="chapter" value="' + c + '"' + (i === 0 ? ' checked' : '') + '><span>' + c + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
          '<fieldset class="field"><legend class="lbl">3. Were you able to complete this chapter?</legend>' +
            '<div class="radios">' +
              ['Yes, without help', 'Yes, with help', 'Not yet — I got stuck', 'I stopped for another reason'].map(function (co, i) {
                return '<label><input type="radio" name="completed" value="' + co + '"' + (i === 0 ? ' checked' : '') + '><span>' + co + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
        '</div>' +
        '<div class="form-section-card">' +
          '<h2 class="form-section-heading"><span class="form-section-num">2</span> Chapter experience</h2>' +
          '<fieldset class="field" id="chClarityField">' +
            '<legend class="lbl">4. How clear was what you needed to do? <span class="req">*</span></legend>' +
            '<div class="scale-5-group" id="fbRate">' +
              '<label class="scale-5-item"><input type="radio" name="clarityRating" value="1"><span class="scale-pill"><span class="scale-num">1</span><span class="scale-label">1 — Not clear at all</span></span></label>' +
              '<label class="scale-5-item"><input type="radio" name="clarityRating" value="2"><span class="scale-pill"><span class="scale-num">2</span><span class="scale-label">2</span></span></label>' +
              '<label class="scale-5-item"><input type="radio" name="clarityRating" value="3"><span class="scale-pill"><span class="scale-num">3</span><span class="scale-label">3</span></span></label>' +
              '<label class="scale-5-item"><input type="radio" name="clarityRating" value="4"><span class="scale-pill"><span class="scale-num">4</span><span class="scale-label">4</span></span></label>' +
              '<label class="scale-5-item"><input type="radio" name="clarityRating" value="5" checked><span class="scale-pill"><span class="scale-num">5</span><span class="scale-label">5 — Completely clear</span></span></label>' +
            '</div>' +
            '<div class="err" role="alert"></div>' +
          '</fieldset>' +
          '<fieldset class="field"><legend class="lbl">5. How did the difficulty feel?</legend>' +
            '<div class="radios">' +
              ['Much too easy', 'A little too easy', 'About right', 'A little too difficult', 'Much too difficult'].map(function (d, i) {
                return '<label><input type="radio" name="difficulty" value="' + d + '"' + (i === 2 ? ' checked' : '') + '><span>' + d + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
          '<fieldset class="field"><legend class="lbl">6. What was the main source of confusion or frustration?</legend>' +
            '<div class="radios">' +
              ['Finding the objective', 'Understanding the controls', 'Knowing which action to take', 'Understanding O₂', 'Earning or spending EUR', 'Reading the screen', 'A technical problem', 'Nothing was confusing', 'Other'].map(function (cf, i) {
                return '<label><input type="radio" name="confusionSource" value="' + cf + '"' + (i === 7 ? ' checked' : '') + '><span>' + cf + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
          '<div class="field"><label class="lbl" for="chClarityFb">7. What happened, or what would make it clearer?</label>' +
            '<textarea id="chClarityFb" name="clarityFeedback" maxlength="3000" rows="3" placeholder="Share your experience or suggestion for improvement..."></textarea>' +
            '<div class="err" role="alert"></div>' +
          '</div>' +
          '<fieldset class="field"><legend class="lbl">8. Did you want to continue playing afterward?</legend>' +
            '<div class="radios">' +
              ['Definitely yes', 'Probably yes', 'Not sure', 'Probably not', 'Definitely not'].map(function (cp, i) {
                return '<label><input type="radio" name="continueIntent" value="' + cp + '"' + (i === 0 ? ' checked' : '') + '><span>' + cp + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
          '<div class="field"><label class="lbl" for="chEmail">Optional email address if you would like a reply or follow-up</label>' +
            '<input type="email" id="chEmail" name="email" autocomplete="email" placeholder="name@example.com">' +
            '<div class="hint">Only if you agree that Artifactz may contact you about this feedback.</div>' +
            '<div class="err" role="alert"></div>' +
          '</div>' +
        '</div>' +
        '<div><button class="btn gold" type="submit" id="fbSend"><span class="btn-icon">🌿</span> Send chapter feedback</button></div>' +
        '<div id="fbOut" aria-live="polite"></div>' +
      '</form>' + outboxHtml();

    wireOutbox();
    var form = $('#fbForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(form);
      var d = new FormData(form), bad = false;
      var clarity = d.get('clarityRating');
      if (!clarity) { fieldErr($('#chClarityField'), 'Please rate how clear the chapter was (1 to 5).'); bad = true; }
      var em = String(d.get('email') || '').trim();
      if (em && !validEmail(em)) { fieldErr($('#chEmail'), 'That email address does not look right. Check it or leave it empty.'); bad = true; }
      if (bad) { var first = $('.field.bad input, .field.bad textarea', form); if (first) first.focus(); return; }
      submit({
        type: 'chapter_feedback',
        gameVersion: d.get('gameVersion') || null,
        chapter: d.get('chapter') || 'Chapter 1',
        completed: d.get('completed') || null,
        clarityRating: Number(clarity),
        difficulty: d.get('difficulty') || null,
        confusionSource: d.get('confusionSource') || null,
        clarityFeedback: String(d.get('clarityFeedback') || '').trim() || null,
        continueIntent: d.get('continueIntent') || null,
        email: em || null,
        map: selectedId()
      }, form, $('#fbSend'), $('#fbOut'));
    });
  }

  /* 2. Full Playtest Review (SearchO2_Forms_Full_Playtest_Review.docx) */
  function pagePlaytestReview() {
    var likertOpts = ['Very poor', 'Poor', 'Neither good nor poor', 'Good', 'Very good'];
    function likertField(name, qText, defIdx) {
      return '<fieldset class="field"><legend class="lbl">' + esc(qText) + '</legend>' +
        '<div class="radios">' +
          likertOpts.map(function (opt, i) {
            return '<label><input type="radio" name="' + name + '" value="' + opt + '"' + (i === (defIdx != null ? defIdx : 3) ? ' checked' : '') + '><span>' + opt + '</span></label>';
          }).join('') +
        '</div>' +
      '</fieldset>';
    }

    var npsButtons = [];
    for (var n = 0; n <= 10; n++) {
      npsButtons.push('<label><input type="radio" name="npsRecommend" value="' + n + '"' + (n === 10 ? ' checked' : '') + '><span class="nps-box">' + n + '</span></label>');
    }

    main.innerHTML = '<div class="page-head">' +
      '<div class="form-badge"><span class="badge-icon">🎮</span> Submenu 2 · Playtest Review</div>' +
      '<h1>SearchO₂ Full Playtest Review</h1>' +
      '<p class="form-intro">For players who have completed more than one SearchO₂ play session. This takes about four minutes.</p>' +
      '</div>' +
      feedbackSubnav('playtest') +
      '<form class="form" id="ptForm" novalidate>' +
        '<div class="form-section-card">' +
          '<h2 class="form-section-heading"><span class="form-section-num">1</span> Player context</h2>' +
          '<fieldset class="field"><legend class="lbl">1. Which SearchO₂ game version or build did you play most recently?</legend>' +
            '<div class="radios">' +
              ['Current test version', 'Previous test version', 'I’m not sure'].map(function (v, i) {
                return '<label><input type="radio" name="gameVersion" value="' + v + '"' + (i === 0 ? ' checked' : '') + '><span>' + v + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
          '<fieldset class="field"><legend class="lbl">2. How often do you play simulation or management games?</legend>' +
            '<div class="radios">' +
              ['Never', 'Occasionally', 'Monthly', 'Weekly or more'].map(function (f, i) {
                return '<label><input type="radio" name="genreFrequency" value="' + f + '"' + (i === 1 ? ' checked' : '') + '><span>' + f + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
        '</div>' +
        '<div class="form-section-card">' +
          '<h2 class="form-section-heading"><span class="form-section-num">2</span> Overall experience</h2>' +
          likertField('rateEaseOfLearning', '3. How would you rate the ease of learning?', 3) +
          likertField('rateNavigation', '4. How would you rate the navigation?', 3) +
          likertField('rateVisualReadability', '5. How would you rate the visual readability?', 3) +
          likertField('rateClarityOfObjectives', '6. How would you rate the clarity of objectives?', 3) +
          likertField('rateUnderstandingO2', '7. How would you rate your understanding of the O₂ system?', 3) +
          likertField('rateEnjoyment', '8. How would you rate your enjoyment?', 3) +
          likertField('rateGameStability', '9. How would you rate the game stability?', 3) +
          '<fieldset class="field"><legend class="lbl">10. Did any visual element make the game difficult to use?</legend>' +
            '<div class="radios">' +
              ['Yes', 'No', 'Not sure'].map(function (vo, i) {
                return '<label><input type="radio" name="visualDifficulty" value="' + vo + '"' + (i === 1 ? ' checked' : '') + '><span>' + vo + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
          '<fieldset class="field"><legend class="lbl">11. Which visual element most needs improvement?</legend>' +
            '<div class="radios">' +
              ['Text size', 'Contrast or colours', 'Map', 'O₂ display', 'EUR/resources display', 'Missions/objectives', 'Menus', 'Region screen', 'Other'].map(function (ve, i) {
                return '<label><input type="radio" name="visualElementImprovement" value="' + ve + '"' + (i === 8 ? ' checked' : '') + '><span>' + ve + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
        '</div>' +
        '<div class="form-section-card">' +
          '<h2 class="form-section-heading"><span class="form-section-num">3</span> Value and return intent</h2>' +
          '<div class="field"><label class="lbl" for="ptStrongest">12. What is the strongest part of SearchO₂?</label>' +
            '<textarea id="ptStrongest" name="strongestPart" maxlength="3000" rows="3" placeholder="What did you enjoy most or find most compelling?"></textarea>' +
          '</div>' +
          '<div class="field"><label class="lbl" for="ptChange">13. If you could change only one thing, what would it be?</label>' +
            '<textarea id="ptChange" name="changeOneThing" maxlength="3000" rows="3" placeholder="One feature, mechanic or change you would prioritize..."></textarea>' +
          '</div>' +
          '<fieldset class="field"><legend class="lbl">14. How disappointed would you be if SearchO₂ were no longer available?</legend>' +
            '<div class="radios">' +
              ['Very disappointed', 'Somewhat disappointed', 'Not disappointed', 'I haven’t played enough to say'].map(function (dis, i) {
                return '<label><input type="radio" name="disappointmentLevel" value="' + dis + '"' + (i === 1 ? ' checked' : '') + '><span>' + dis + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
          '<fieldset class="field"><legend class="lbl">15. How likely are you to recommend SearchO₂ to someone interested in simulation, science or sustainability?</legend>' +
            '<div class="nps-container">' +
              '<div class="scale-grid">' + npsButtons.join('') + '</div>' +
              '<div class="nps-labels"><span>0 — Not at all likely</span><span>10 — Extremely likely</span></div>' +
            '</div>' +
          '</fieldset>' +
          '<div class="field"><label class="lbl" for="ptEmail">Optional email address if you agree that Artifactz may contact you about this review.</label>' +
            '<input type="email" id="ptEmail" name="email" autocomplete="email" placeholder="name@example.com">' +
            '<div class="hint">Only if you agree that Artifactz may contact you about this review.</div>' +
            '<div class="err" role="alert"></div>' +
          '</div>' +
        '</div>' +
        '<div><button class="btn gold" type="submit" id="ptSend"><span class="btn-icon">🌟</span> Send playtest review</button></div>' +
        '<div id="ptOut" aria-live="polite"></div>' +
      '</form>' + outboxHtml();

    wireOutbox();
    var form = $('#ptForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(form);
      var d = new FormData(form), bad = false;
      var em = String(d.get('email') || '').trim();
      if (em && !validEmail(em)) { fieldErr($('#ptEmail'), 'That email address does not look right. Check it or leave it empty.'); bad = true; }
      if (bad) { var first = $('.field.bad input, .field.bad textarea', form); if (first) first.focus(); return; }
      submit({
        type: 'playtest_review',
        gameVersion: d.get('gameVersion') || null,
        genreFrequency: d.get('genreFrequency') || null,
        rateEaseOfLearning: d.get('rateEaseOfLearning') || null,
        rateNavigation: d.get('rateNavigation') || null,
        rateVisualReadability: d.get('rateVisualReadability') || null,
        rateClarityOfObjectives: d.get('rateClarityOfObjectives') || null,
        rateUnderstandingO2: d.get('rateUnderstandingO2') || null,
        rateEnjoyment: d.get('rateEnjoyment') || null,
        rateGameStability: d.get('rateGameStability') || null,
        visualDifficulty: d.get('visualDifficulty') || null,
        visualElementImprovement: d.get('visualElementImprovement') || null,
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
    main.innerHTML = '<div class="page-head">' +
      '<div class="form-badge"><span class="badge-icon">🛠️</span> Support &amp; Issue Tracking</div>' +
      '<h1>SearchO₂ Report a Problem</h1>' +
      '<p class="form-intro">Use this form when something does not work as expected. Do not include passwords, payment details or other sensitive information.</p>' +
      '</div>' +
      '<form class="form" id="rpForm" novalidate>' +
        '<div class="form-section-card">' +
          '<h2 class="form-section-heading"><span class="form-section-num">1</span> Problem details</h2>' +
          '<div class="field"><label class="lbl" for="rpTitle">1. Short title for the problem <span class="req">*</span></label>' +
            '<input type="text" id="rpTitle" name="title" maxlength="255" placeholder="Brief summary of what went wrong..." required>' +
            '<div class="err" role="alert"></div>' +
          '</div>' +
          '<fieldset class="field"><legend class="lbl">2. Which SearchO₂ game version or build were you using?</legend>' +
            '<div class="radios">' +
              ['Current test version', 'Previous test version', 'I’m not sure'].map(function (v, i) {
                return '<label><input type="radio" name="gameVersion" value="' + v + '"' + (i === 0 ? ' checked' : '') + '><span>' + v + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
          '<fieldset class="field"><legend class="lbl">3. Where did the problem happen? <span class="req">*</span></legend>' +
            '<div class="radios" id="rpAreaRadios">' +
              ['Getting started or account', 'Chapter 1', 'Chapter 2', 'Chapter 3', 'Saint Martin', 'Menus or settings', 'Another location', 'I’m not sure'].map(function (a, i) {
                return '<label><input type="radio" name="area" value="' + a + '"' + (i === 1 ? ' checked' : '') + '><span>' + a + '</span></label>';
              }).join('') +
            '</div>' +
            '<div class="err" role="alert"></div>' +
          '</fieldset>' +
          '<div class="field"><label class="lbl" for="rpTrying">4. What were you trying to do?</label>' +
            '<textarea id="rpTrying" name="tryingToDo" maxlength="2000" rows="3" placeholder="Describe the goal or action you were attempting..."></textarea>' +
            '<div class="err" role="alert"></div>' +
          '</div>' +
          '<div class="field"><label class="lbl" for="rpWhat">5. What happened? <span class="req">*</span></label>' +
            '<textarea id="rpWhat" name="whatHappened" maxlength="3000" rows="4" placeholder="Describe what actually happened or went wrong..." required></textarea>' +
            '<div class="err" role="alert"></div>' +
          '</div>' +
          '<div class="field"><label class="lbl" for="rpExp">6. What did you expect to happen?</label>' +
            '<textarea id="rpExp" name="expected" maxlength="2000" rows="3" placeholder="Describe what should have occurred instead..."></textarea>' +
            '<div class="err" role="alert"></div>' +
          '</div>' +
        '</div>' +
        '<div class="form-section-card">' +
          '<h2 class="form-section-heading"><span class="form-section-num">2</span> Reproduction and impact</h2>' +
          '<fieldset class="field"><legend class="lbl">7. Can you reproduce the problem?</legend>' +
            '<div class="radios">' +
              ['Every time', 'Sometimes', 'Only once', 'I haven’t tried again'].map(function (r, i) {
                return '<label><input type="radio" name="reproduce" value="' + r + '"' + (i === 0 ? ' checked' : '') + '><span>' + r + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
          '<fieldset class="field"><legend class="lbl">8. How much did the problem affect your play?</legend>' +
            '<div class="radios">' +
              ['Minor inconvenience', 'Made gameplay difficult', 'Blocked my progress', 'Made the game unusable'].map(function (im, i) {
                return '<label><input type="radio" name="impact" value="' + im + '"' + (i === 1 ? ' checked' : '') + '><span>' + im + '</span></label>';
              }).join('') +
            '</div>' +
          '</fieldset>' +
          '<div class="field"><label class="lbl" for="rpDevice">9. Which device and browser were you using?</label>' +
            '<input type="text" id="rpDevice" name="deviceBrowser" maxlength="255" value="' + esc(detectDeviceBrowser()) + '" placeholder="e.g. Windows 11 · Chrome 129 / iPhone 15 · Safari">' +
            '<div class="hint">Automatically detected from your current browser, editable if reporting for another device.</div>' +
          '</div>' +
          '<div class="field"><label class="lbl" for="rpEmail">10. Optional email address if you agree that Artifactz may contact you about this report.</label>' +
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
        '<div><button class="btn gold" type="submit" id="rpSend"><span class="btn-icon">🚀</span> Send report</button></div>' +
        '<div id="rpOut" aria-live="polite"></div>' +
      '</form>' + outboxHtml();

    wireOutbox();
    var form = $('#rpForm'), box = $('#rpDiagBox');
    box.textContent = diagnostics();
    $('#rpDiag').addEventListener('change', function (e) { box.style.display = e.target.checked ? '' : 'none'; });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErr(form);
      var d = new FormData(form), bad = false;
      var title = String(d.get('title') || '').trim();
      if (title.length < 3) { fieldErr($('#rpTitle'), 'Give the problem a short title, at least 3 characters.'); bad = true; }
      var what = String(d.get('whatHappened') || '').trim();
      if (what.length < 5) { fieldErr($('#rpWhat'), 'Describe what happened, at least 5 characters.'); bad = true; }
      var em = String(d.get('email') || '').trim();
      if (em && !validEmail(em)) { fieldErr($('#rpEmail'), 'That email address does not look right. Check it or leave it empty.'); bad = true; }
      if (bad) { var first = $('.field.bad input, .field.bad textarea', form); if (first) first.focus(); return; }
      submit({
        type: 'problem',
        title: title,
        gameVersion: d.get('gameVersion') || null,
        area: d.get('area') || null,
        tryingToDo: String(d.get('tryingToDo') || '').trim() || null,
        whatHappened: what,
        what: what,
        expected: String(d.get('expected') || '').trim() || null,
        reproduce: d.get('reproduce') || null,
        impact: d.get('impact') || null,
        severity: d.get('impact') || null,
        deviceBrowser: String(d.get('deviceBrowser') || '').trim() || null,
        email: em || null,
        map: selectedId(),
        diagnostics: d.get('diag') ? diagnostics() : null
      }, form, $('#rpSend'), $('#rpOut'));
    });
  }

  /* --- sending: try the API; persist immediately to local DB and backend telemetry --- */
  function getOutbox() { return lsJSON(OUTBOX_KEY, []); }
  function setOutbox(a) { return lsSet(OUTBOX_KEY, JSON.stringify(a)); }

  function saveToLocalFeedbackSubmissions(payload) {
    try {
      var list = JSON.parse(localStorage.getItem('searchO2_feedback_submissions') || '[]');
      var id = payload.id || ('sub_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4));
      var rec = {
        id: id,
        user_id: payload.userId || null,
        kind: payload.type || 'feedback',
        title: payload.title || (payload.type === 'chapter_feedback' ? 'Chapter ' + payload.chapter : (payload.type === 'playtest_review' ? 'Playtest Review' : 'Feedback')),
        message: payload.message || payload.whatHappened || payload.clarityFeedback || payload.strongestPart || '',
        area: payload.area || (payload.chapter ? 'Chapter ' + payload.chapter : null),
        severity: payload.severity || payload.impact || null,
        rating: payload.rating || payload.clarityRating || null,
        email: payload.email || null,
        game_version: payload.gameVersion || null,
        chapter: payload.chapter || null,
        trying_to_do: payload.tryingToDo || null,
        what_happened: payload.whatHappened || payload.what || null,
        reproduce: payload.reproduce || null,
        impact: payload.impact || payload.severity || null,
        device_browser: payload.deviceBrowser || detectDeviceBrowser(),
        completed: payload.completed || null,
        difficulty: payload.difficulty || null,
        confusion_source: payload.confusionSource || null,
        continue_intent: payload.continueIntent || null,
        nps_recommend: typeof payload.npsRecommend === 'number' ? payload.npsRecommend : null,
        region_id: payload.map || null,
        hub_version: payload.hubVersion || HUB_VERSION,
        status: 'new',
        created_at: payload.submittedAt || new Date().toISOString(),
        payload: payload
      };
      list = list.filter(function(x){ return x.id !== id; });
      list.unshift(rec);
      localStorage.setItem('searchO2_feedback_submissions', JSON.stringify(list.slice(0, 100)));
      return rec;
    } catch(e) {
      return null;
    }
  }

  function postJSON(payload) {
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 8000) : null;
    
    // Always persist to local admin database cache immediately
    saveToLocalFeedbackSubmissions(payload);

    function trySupabase() {
      var sbKey = window.SEARCHO2_SUPABASE_KEY || (typeof localStorage !== 'undefined' && (localStorage.getItem('searchO2_supabase_key') || localStorage.getItem('searchO2_supabase_anon_key')));
      var sbUrl = window.SEARCHO2_SUPABASE_URL || (typeof localStorage !== 'undefined' && localStorage.getItem('searchO2_supabase_url')) || 'https://plvieqzmwwjcjyvwyczl.supabase.co';
      if (sbKey) {
        var sbEndpoint = sbUrl.replace(/\/$/, '') + '/rest/v1/feedback_submissions';
        var row = {
          kind: payload.type || 'feedback',
          user_id: payload.userId || null,
          title: payload.title || (payload.type === 'chapter_feedback' ? 'Chapter ' + payload.chapter : (payload.type === 'playtest_review' ? 'Playtest Review' : 'Feedback')),
          message: payload.message || payload.whatHappened || payload.clarityFeedback || payload.strongestPart || '',
          area: payload.area || (payload.chapter ? 'Chapter ' + payload.chapter : null),
          severity: payload.severity || payload.impact || null,
          rating: payload.rating || payload.clarityRating || null,
          email: payload.email || null,
          game_version: payload.gameVersion || null,
          chapter: payload.chapter || null,
          trying_to_do: payload.tryingToDo || null,
          what_happened: payload.whatHappened || payload.what || null,
          reproduce: payload.reproduce || null,
          impact: payload.impact || payload.severity || null,
          device_browser: payload.deviceBrowser || detectDeviceBrowser(),
          completed: payload.completed || null,
          difficulty: payload.difficulty || null,
          confusion_source: payload.confusionSource || null,
          continue_intent: payload.continueIntent || null,
          nps_recommend: typeof payload.npsRecommend === 'number' ? payload.npsRecommend : null,
          region_id: payload.map || null,
          hub_version: payload.hubVersion || HUB_VERSION,
          diagnostics: payload.diagnostics || null,
          payload: payload
        };
        return fetch(sbEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': sbKey,
            'Authorization': 'Bearer ' + sbKey,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(row)
        });
      }
      return Promise.reject(new Error('No Supabase credentials'));
    }

    return fetch(FEEDBACK_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r;
    }).catch(function (e) {
      if (FEEDBACK_ENDPOINT.indexOf('localhost:5000') === -1) {
        return fetch('http://localhost:5000/api/feedback', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        }).then(function(lr){
          if (timer) clearTimeout(timer);
          if (!lr.ok) throw new Error('HTTP ' + lr.status);
          return lr;
        }).catch(function(){
          return trySupabase();
        });
      }
      return trySupabase();
    });
  }

  function submit(payload, form, btn, out) {
    var uCtx = getCurrentUserContext();
    if (!payload.userId && uCtx.userId) payload.userId = uCtx.userId;
    if (!payload.userName && uCtx.userName) payload.userName = uCtx.userName;
    if (!payload.userRole && uCtx.userRole) payload.userRole = uCtx.userRole;
    if (!payload.authProvider && uCtx.authProvider) payload.authProvider = uCtx.authProvider;
    if (!payload.farmName && uCtx.farmName) payload.farmName = uCtx.farmName;
    if (!payload.stateName && uCtx.stateName) payload.stateName = uCtx.stateName;
    if (!payload.landName && uCtx.landName) payload.landName = uCtx.landName;
    if (!payload.email && uCtx.email) payload.email = uCtx.email;

    payload.submittedAt = new Date().toISOString();
    payload.hubVersion = HUB_VERSION;
    btn.disabled = true; var label = btn.textContent; btn.textContent = 'Sending…';

    var savedRec = saveToLocalFeedbackSubmissions(payload);
    var subId = (savedRec && savedRec.id) ? savedRec.id.slice(0, 8) : Date.now().toString(36);
    var kindName = payload.type === 'problem' ? 'problem report' : payload.type === 'chapter_feedback' ? 'chapter feedback' : 'playtest review';

    postJSON(payload).then(function () {
      form.reset();
      out.innerHTML = '<div class="result ok" style="border: 1px solid #10B981; background: rgba(4,34,32,0.85); padding: 18px; border-radius: 12px; margin-top: 16px;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<span style="font-size:2rem;line-height:1;">✅</span>' +
          '<div>' +
            '<h3 style="margin:0 0 4px;color:#10B981;font-size:1.15rem;">Thank you! Your ' + esc(kindName) + ' has been saved in the database.</h3>' +
            '<p style="margin:0;color:#E2E8F0;font-size:0.88rem;">' +
              'Recorded in SearchO₂ database (Ref: <code style="color:#34D399;font-weight:700;">#' + esc(subId) + '</code>). ' +
              (uCtx.userName ? ('Linked to player profile <strong>' + esc(uCtx.userName) + '</strong>.') : 'Linked to your session.') +
            '</p>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).catch(function () {
      var box = getOutbox();
      box.push({ id: 'o' + Date.now().toString(36), payload: payload });
      setOutbox(box);
      form.reset();
      out.innerHTML = '<div class="result ok" style="border: 1px solid #10B981; background: rgba(4,34,32,0.85); padding: 18px; border-radius: 12px; margin-top: 16px;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<span style="font-size:2rem;line-height:1;">✅</span>' +
          '<div>' +
            '<h3 style="margin:0 0 4px;color:#10B981;font-size:1.15rem;">Thank you! Your submission is safely recorded.</h3>' +
            '<p style="margin:0;color:#E2E8F0;font-size:0.88rem;">' +
              'Saved to local database (Ref: <code style="color:#34D399;font-weight:700;">#' + esc(subId) + '</code>) and queued for automatic synchronization with the admin panel.' +
            '</p>' +
          '</div>' +
        '</div>' +
      '</div>';
      refreshOutbox();
    }).then(function () {
      btn.disabled = false;
      btn.textContent = label;
      out.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  function formatPayload(p) {
    var lines = [];
    if (p.type === 'problem') {
      lines.push('SEARCHO2 PROBLEM REPORT: ' + (p.title || 'Untitled'));
      if (p.gameVersion) lines.push('Game Version: ' + p.gameVersion);
      if (p.area) lines.push('Where: ' + p.area);
      if (p.tryingToDo) lines.push('Trying to do: ' + p.tryingToDo);
      lines.push('What happened: ' + (p.whatHappened || p.what || ''));
      if (p.expected) lines.push('Expected: ' + p.expected);
      if (p.reproduce) lines.push('Reproduce: ' + p.reproduce);
      if (p.impact || p.severity) lines.push('Impact: ' + (p.impact || p.severity));
      if (p.deviceBrowser) lines.push('Device/Browser: ' + p.deviceBrowser);
    } else if (p.type === 'chapter_feedback') {
      lines.push('SEARCHO2 CHAPTER FEEDBACK: Chapter ' + (p.chapter || ''));
      if (p.gameVersion) lines.push('Game Version: ' + p.gameVersion);
      if (p.completed) lines.push('Completed: ' + p.completed);
      if (p.clarityRating) lines.push('Clarity: ' + p.clarityRating + ' / 5');
      if (p.difficulty) lines.push('Difficulty: ' + p.difficulty);
      if (p.confusionSource) lines.push('Confusion: ' + p.confusionSource);
      if (p.clarityFeedback) lines.push('Feedback: ' + p.clarityFeedback);
      if (p.continueIntent) lines.push('Continue intent: ' + p.continueIntent);
    } else if (p.type === 'playtest_review') {
      lines.push('SEARCHO2 FULL PLAYTEST REVIEW');
      if (p.gameVersion) lines.push('Game Version: ' + p.gameVersion);
      if (p.genreFrequency) lines.push('Genre frequency: ' + p.genreFrequency);
      if (p.rateEaseOfLearning) lines.push('Ease of learning: ' + p.rateEaseOfLearning);
      if (p.rateNavigation) lines.push('Navigation: ' + p.rateNavigation);
      if (p.rateVisualReadability) lines.push('Visual readability: ' + p.rateVisualReadability);
      if (p.rateClarityOfObjectives) lines.push('Clarity of objectives: ' + p.rateClarityOfObjectives);
      if (p.rateUnderstandingO2) lines.push('Understanding O2: ' + p.rateUnderstandingO2);
      if (p.rateEnjoyment) lines.push('Enjoyment: ' + p.rateEnjoyment);
      if (p.rateGameStability) lines.push('Game stability: ' + p.rateGameStability);
      if (p.visualDifficulty) lines.push('Visual difficulty: ' + p.visualDifficulty);
      if (p.visualElementImprovement) lines.push('Improve visual: ' + p.visualElementImprovement);
      if (p.strongestPart) lines.push('Strongest: ' + p.strongestPart);
      if (p.changeOneThing) lines.push('Change one thing: ' + p.changeOneThing);
      if (p.disappointmentLevel) lines.push('Disappointment: ' + p.disappointmentLevel);
      if (p.npsRecommend != null) lines.push('Recommend (0-10): ' + p.npsRecommend);
    } else {
      lines.push('FEEDBACK (' + (p.rating || '') + '/5, ' + (p.topic || '') + ')');
      lines.push('', p.message || '');
    }
    if (p.map) lines.push('Map: ' + p.map);
    if (p.email) lines.push('Reply to: ' + p.email);
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
      var title = 'Feedback';
      if (p.type === 'problem') title = 'Problem: ' + (p.title || 'Untitled');
      else if (p.type === 'chapter_feedback') title = 'Chapter Feedback: ' + (p.chapter || 'Survey');
      else if (p.type === 'playtest_review') title = 'Playtest Review: ' + (p.strongestPart || 'Survey');
      else if (p.type === 'feedback') title = 'Feedback: ' + (p.message || 'Feedback');
      return '<li><span style="flex:1"><b>' + esc(title.slice(0, 70)) + '</b></span>' +
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
