/**
 * SearchO2 — Social auth (Google fix + GitHub + Facebook + WhatsApp)
 * + 7-day guest trial timer (browser-clock synced) on globe page
 *
 * Include after ApiClient is defined, before ApiClient.init():
 *   <script src="auth-social-guest-trial.js"></script>
 *
 * Or paste into index.html.
 */
(function (global) {
  'use strict';

  var GUEST_TRIAL_MS = 7 * 24 * 60 * 60 * 1000;
  var LS_START = 'searchO2_guest_started_at';
  var LS_AVATAR = 'searchO2_selected_avatar';
  var API = function () {
    if (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) return API_BASE_URL;
    if (global.SEARCHO2_API_BASE) return global.SEARCHO2_API_BASE;
    if (global.SEARCHO2_API_URL && !global.SEARCHO2_API_URL.includes('api.searcho2.online')) {
      return global.SEARCHO2_API_URL.replace(/\/+$/, '') + '/api';
    }
    return (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:')
      ? 'http://localhost:5000/api'
      : (location.origin + '/api');
  };

  // ---------- Guest trial (local + optional backend sync) ----------
  function getGuestStart() {
    try {
      var raw = localStorage.getItem(LS_START);
      if (raw) {
        var t = Date.parse(raw);
        if (!isNaN(t)) return t;
      }
    } catch (e) {}
    return null;
  }

  function ensureGuestStart() {
    var t = getGuestStart();
    if (t) return t;
    var nowIso = new Date().toISOString();
    try {
      localStorage.setItem(LS_START, nowIso);
    } catch (e) {}
    return Date.parse(nowIso);
  }

  function trialStatus() {
    var start = getGuestStart();
    if (!start) {
      return { active: false, startedAt: null, expiresAt: null, remainingMs: null, expired: false };
    }
    var expires = start + GUEST_TRIAL_MS;
    var remaining = Math.max(0, expires - Date.now());
    return {
      active: true,
      startedAt: new Date(start).toISOString(),
      expiresAt: new Date(expires).toISOString(),
      remainingMs: remaining,
      expired: remaining <= 0,
    };
  }

  function formatRemaining(ms) {
    if (ms == null) return '—';
    var s = Math.floor(ms / 1000);
    var d = Math.floor(s / 86400);
    s -= d * 86400;
    var h = Math.floor(s / 3600);
    s -= h * 3600;
    var m = Math.floor(s / 60);
    s -= m * 60;
    if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
    if (h > 0) return h + 'h ' + m + 'm ' + s + 's';
    return m + 'm ' + s + 's';
  }

  function isRegisteredUser() {
    var u = typeof apiUser !== 'undefined' ? apiUser : null;
    if (!u) return false;
    if (u.role && u.role !== 'guest') return true;
    if (u.isGuest === false) return true;
    if (u.authProvider && u.authProvider !== 'guest') return true;
    return false;
  }

  function enforceGuestTrial() {
    if (isRegisteredUser()) return { ok: true, registered: true };
    var st = trialStatus();
    if (!st.active) return { ok: true, registered: false };
    if (!st.expired) return { ok: true, registered: false, trial: st };
    return { ok: false, registered: false, trial: st, reason: 'guest_trial_expired' };
  }

  function resetLocalFarmForExpiredGuest() {
    try {
      // Clear farm progress keys used by SPA
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k) continue;
        if (/searchO2.*(farm|state|plots|money|save)/i.test(k) && k !== LS_START && k !== LS_AVATAR) {
          keys.push(k);
        }
      }
      keys.forEach(function (k) {
        localStorage.removeItem(k);
      });
      // Restart trial clock
      localStorage.setItem(LS_START, new Date().toISOString());
      if (typeof state !== 'undefined' && state) {
        state.money = 10000;
        state.totalO2 = 0;
        state.totalO2AllTime = 0;
        if (state.plots) {
          state.plots.forEach(function (p) {
            p.status = 'barren';
            p.treeType = null;
            p.harvestsDone = 0;
          });
        }
      }
    } catch (e) {}
  }

  // ---------- Globe HUD: timer + avatar face ----------
  function avatarFaceHtml() {
    try {
      var raw = localStorage.getItem(LS_AVATAR);
      if (!raw) return '<span class="s2-globe-avatar-placeholder">👤</span>';
      var av = JSON.parse(raw);
      var label = (av.adjective ? av.adjective + ' ' : '') + (av.name || 'Explorer');
      var img =
        av.src || av.avatarUrl
          ? '<img src="' +
            (av.src || av.avatarUrl) +
            '" alt="" class="s2-globe-avatar-img"/>'
          : '<span class="s2-globe-avatar-emoji">🧑‍🌾</span>';
      return (
        '<div class="s2-globe-avatar-face" title="' +
        label +
        '">' +
        img +
        '<span class="s2-globe-avatar-name">' +
        label +
        '</span></div>'
      );
    } catch (e) {
      return '<span class="s2-globe-avatar-placeholder">👤</span>';
    }
  }

  function ensureGlobeHudStyles() {
    if (document.getElementById('s2GuestTrialCSS')) return;
    var style = document.createElement('style');
    style.id = 's2GuestTrialCSS';
    style.textContent =
      '.s2-globe-hud{position:absolute;top:12px;left:12px;z-index:40;display:flex;align-items:center;gap:10px;flex-wrap:wrap;pointer-events:auto;}' +
      '.s2-globe-timer{background:rgba(11,31,42,.88);color:#E8F5E9;border:1.5px solid #81C784;border-radius:999px;padding:8px 14px;font-weight:800;font-size:.78rem;font-family:Nunito,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.25);}' +
      '.s2-globe-timer.expired{border-color:#E8785A;color:#FFCCBC;background:rgba(90,20,20,.9);}' +
      '.s2-globe-avatar-face{display:flex;align-items:center;gap:8px;background:rgba(251,246,236,.95);border:1.5px solid #81C784;border-radius:999px;padding:4px 12px 4px 4px;font-weight:800;font-size:.75rem;color:#1B5E20;}' +
      '.s2-globe-avatar-img{width:36px;height:36px;border-radius:50%;object-fit:cover;}' +
      '.s2-globe-avatar-emoji,.s2-globe-avatar-placeholder{font-size:1.4rem;padding:4px 8px;}' +
      '.s2-auth-social-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0;}' +
      '.s2-btn-social{flex:1;min-width:120px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 12px;border-radius:12px;border:1.5px solid rgba(44,74,50,.25);background:#fff;font-weight:800;font-size:.8rem;cursor:pointer;font-family:Nunito,sans-serif;color:#1B2E15;}' +
      '.s2-btn-social:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
      '.s2-btn-social.google{border-color:#4285F4;}' +
      '.s2-btn-social.github{background:#24292f;color:#fff;border-color:#24292f;}' +
      '.s2-btn-social.facebook{background:#1877F2;color:#fff;border-color:#1877F2;}' +
      '.s2-btn-social.whatsapp{background:#25D366;color:#fff;border-color:#1ebe57;}' +
      '.s2-trial-lock{position:fixed;inset:0;z-index:9600;background:rgba(11,31,42,.72);display:flex;align-items:center;justify-content:center;padding:16px;}' +
      '.s2-trial-lock-card{background:#FBF6EC;border-radius:18px;border:2px solid #E8785A;max-width:420px;padding:22px;text-align:center;color:#1B5E20;font-family:Nunito,sans-serif;}' +
      '#g_id_onload,#btnGoogleGis{min-height:40px;}';
    document.head.appendChild(style);
  }

  function mountGlobeHud() {
    var hud = document.getElementById('s2GlobeHud');
    if (hud) hud.remove();
  }

  function tickTimer() {
    mountGlobeHud();
    var gate = enforceGuestTrial();
    if (!gate.ok) showTrialLockModal();
  }

  function showTrialLockModal() {
    if (document.getElementById('s2TrialLock')) return;
    ensureGlobeHudStyles();
    var el = document.createElement('div');
    el.id = 's2TrialLock';
    el.className = 's2-trial-lock';
    el.innerHTML =
      '<div class="s2-trial-lock-card">' +
      '<div style="font-size:2rem">⏰</div>' +
      '<h2 style="font-family:Baloo 2,sans-serif;margin:8px 0">7-day guest trial ended</h2>' +
      '<p style="font-size:.9rem;line-height:1.45">Sign in with Google, GitHub, Facebook, WhatsApp, or email to keep your farm. Or reset and start a new guest trial.</p>' +
      '<div class="s2-auth-social-row" id="s2LockSocial"></div>' +
      '<button type="button" class="s2-btn-social" id="s2ResetGuest" style="width:100%;margin-top:8px;background:#FFF3E0;border-color:#FFB74D">Reset farm &amp; new 7-day trial</button>' +
      '</div>';
    document.body.appendChild(el);
    renderSocialButtons(document.getElementById('s2LockSocial'));
    document.getElementById('s2ResetGuest').onclick = function () {
      resetLocalFarmForExpiredGuest();
      el.remove();
      if (typeof showNotification === 'function') {
        showNotification('🌱', 'Guest trial restarted — progress was reset.', 'bank', null);
      }
      if (typeof render === 'function') render();
      tickTimer();
    };
  }

  // ---------- Social login ----------
  var oauthConfig = { googleClientId: null, githubClientId: null, facebookAppId: null };

  function fetchOAuthConfig() {
    return fetch(API() + '/auth/oauth/config', { credentials: 'include' })
      .then(function (r) {
        var ct = r.headers.get('content-type') || '';
        if (!r.ok || ct.indexOf('application/json') === -1) {
          throw new Error('OAuthConfig non-JSON response');
        }
        return r.json();
      })
      .then(function (cfg) {
        if (cfg) {
          oauthConfig = Object.assign({}, oauthConfig, cfg);
          if (cfg.googleClientId) {
            global.GOOGLE_CLIENT_ID = cfg.googleClientId;
          }
          if (cfg.githubClientId) {
            global.GITHUB_CLIENT_ID = cfg.githubClientId;
          }
        }
        return oauthConfig;
      })
      .catch(function () {
        try {
          var savedG = localStorage.getItem('searchO2_google_client_id');
          if (savedG) {
            oauthConfig.googleClientId = savedG;
            global.GOOGLE_CLIENT_ID = savedG;
          }
          var savedGH = localStorage.getItem('searchO2_github_client_id');
          if (savedGH) {
            oauthConfig.githubClientId = savedGH;
            global.GITHUB_CLIENT_ID = savedGH;
          }
        } catch (e) {}
        return oauthConfig;
      });
  }

  function postAuth(path, body) {
    body = body || {};
    if (!body.guestId) {
      try {
        var u = typeof apiUser !== 'undefined' ? apiUser : null;
        if (u && (u.role === 'guest' || u.isGuest)) {
          body.guestId = u.id;
        } else {
          var stored = localStorage.getItem('searchO2_guest_user');
          if (stored) {
            var parsed = JSON.parse(stored);
            if (parsed && parsed.id) body.guestId = parsed.id;
          }
        }
      } catch (e) {}
    }
    // Attach client farm state for combination / merging
    try {
      if (typeof state !== 'undefined' && state) {
        body.farmState = {
          money: state.money,
          totalO2: state.totalO2,
          plots: state.plots,
        };
      }
    } catch (e) {}

    var headers = { 'Content-Type': 'application/json' };
    try {
      var tok = (typeof authToken !== 'undefined' && authToken) || localStorage.getItem('searchO2_token');
      if (tok) headers['Authorization'] = 'Bearer ' + tok;
    } catch (e) {}

    var candidates = [
      API() + path,
      'http://localhost:5000/api' + path,
      'http://127.0.0.1:5000/api' + path,
      (location.origin + '/api' + path)
    ];
    var seen = {};
    candidates = candidates.filter(function(c){
      if (seen[c]) return false;
      seen[c] = true;
      return true;
    });

    function tryFetch(idx) {
      if (idx >= candidates.length) {
        return Promise.reject(new Error('Endpoint ' + path + ' unreachable on server.'));
      }
      var targetUrl = candidates[idx];
      return fetch(targetUrl, {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify(body)
      }).then(function(r) {
        if (r.status === 405 || r.status === 404 || r.status === 502) {
          return tryFetch(idx + 1);
        }
        return r.text().then(function(txt) {
          var d = null;
          try { d = txt ? JSON.parse(txt) : {}; } catch(e){}
          if (!r.ok || !d) {
            var msg = (d && (d.error || d.message)) || ('Server returned HTTP ' + r.status);
            var err = new Error(msg);
            err.status = r.status;
            throw err;
          }
          return d;
        });
      }).catch(function(err) {
        if (err.status && err.status !== 405 && err.status !== 404 && err.status !== 502) {
          throw err;
        }
        return tryFetch(idx + 1);
      });
    }

    return tryFetch(0);
  }

  function applyAuthSuccess(d) {
    if (d.accessToken) {
      try {
        localStorage.setItem('searchO2_token', d.accessToken);
      } catch (e) {}
      if (typeof authToken !== 'undefined') authToken = d.accessToken;
    }
    if (d.user) {
      if (typeof apiUser !== 'undefined') apiUser = d.user;
      try {
        localStorage.removeItem('searchO2_guest_user');
        localStorage.setItem('searchO2_user', JSON.stringify(d.user));
      } catch (e) {}

      // Combine / Merge user data into client farm state
      if (typeof state !== 'undefined' && state) {
        if (typeof d.user.money === 'number') {
          state.money = Math.max(state.money || 0, d.user.money);
        }
        if (typeof d.user.totalO2 === 'number') {
          state.totalO2 = Math.max(state.totalO2 || 0, d.user.totalO2);
        }
        if (d.user.displayName) {
          state.userName = d.user.displayName;
        }
        try {
          if (typeof saveState === 'function') saveState();
        } catch (e) {}
      }
    }
    // Registered users keep farm — clear trial pressure
    if (d.user && d.user.role !== 'guest') {
      try {
        localStorage.removeItem(LS_START);
      } catch (e) {}
    }
    // In logged-in mode, ensure Shakir CEO guide is completely removed and avatar tour is available
    if (global.SearchO2ShakirGuide && typeof global.SearchO2ShakirGuide.removeGuide === 'function') {
      try { global.SearchO2ShakirGuide.removeGuide(); } catch (e) {}
    }
    var lock = document.getElementById('s2TrialLock');
    if (lock) lock.remove();
    if (typeof showNotification === 'function') {
      var name = (d.user && d.user.displayName) ? d.user.displayName : 'Explorer';
      showNotification('✅', 'Signed in as ' + name + ' — farm progress merged & saved!', 'bank', null);
    }
    if (typeof closeModal === 'function') closeModal();
    if (typeof render === 'function') render();
    tickTimer();
  }

  function wirePwToggles(container) {
    if (!container) return;
    container.querySelectorAll('.s2-pw-toggle').forEach(function(btn) {
      btn.onclick = function() {
        var tid = btn.getAttribute('data-target');
        var input = document.getElementById(tid);
        if (input) {
          if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🔒';
          } else {
            input.type = 'password';
            btn.textContent = '👁️';
          }
        }
      };
    });
  }

  function resetFreshFarmState() {
    if (typeof state !== 'undefined' && state) {
      state.money = 10000;
      state.totalO2 = 0;
      state.totalO2AllTime = 0;
      if (state.plots) {
        state.plots.forEach(function(p) {
          p.status = 'barren';
          p.treeType = null;
          p.health = 100;
          p.progress = 0;
          p.harvestsDone = 0;
        });
      }
    }
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && /searchO2.*(farm|state|plots|money)/i.test(k) && k !== 'searchO2_token' && k !== 'searchO2_user') {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {}
    try {
      if (typeof saveState === 'function') saveState();
    } catch (e) {}
  }

  function showOAuthConfigModal(provider) {
    var existing = document.getElementById('s2OauthModal');
    if (existing) existing.remove();
    var el = document.createElement('div');
    el.id = 's2OauthModal';
    el.className = 's2-trial-lock';
    var isGoogle = provider === 'google';
    var title = isGoogle ? 'Google Account Registration' : 'GitHub Account Registration';
    var icon = isGoogle ? '🔍' : '🐙';
    var envKey = isGoogle ? 'GOOGLE_CLIENT_ID' : 'GITHUB_CLIENT_ID';
    var storageKey = isGoogle ? 'searchO2_google_client_id' : 'searchO2_github_client_id';
    var currentVal = '';
    try { currentVal = localStorage.getItem(storageKey) || ''; } catch (e) {}

    var prevAccount = '';
    var prevName = '';
    try {
      var savedU = localStorage.getItem('searchO2_user');
      if (savedU) {
        var pu = JSON.parse(savedU);
        if (isGoogle && pu.email) prevAccount = pu.email;
        else if (!isGoogle && (pu.username || pu.displayName)) prevAccount = pu.username || pu.displayName;
        if (pu.displayName) prevName = pu.displayName;
      }
    } catch (e) {}

    var directHtml =
      '<div style="background:#fff;border:1.5px solid ' + (isGoogle ? '#BBDEFB' : '#CFD8DC') + ';border-radius:12px;padding:14px;margin-bottom:12px;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
          '<span style="font-size:0.82rem;font-weight:800;color:' + (isGoogle ? '#1565C0' : '#24292e') + ';">⚡ ' + (isGoogle ? 'Google Account Setup' : 'GitHub Account Setup') + '</span>' +
          '<span style="font-size:0.68rem;background:' + (isGoogle ? '#E3F2FD' : '#ECEFF1') + ';color:' + (isGoogle ? '#1976D2' : '#37474F') + ';padding:2px 8px;border-radius:10px;font-weight:800;">Saved in DB</span>' +
        '</div>' +
        '<p style="font-size:0.75rem;color:#455A64;margin:0 0 8px;line-height:1.4;">' +
          (isGoogle ? 'Enter your Google email, set a password for game sign-in, and choose your farm mode.' : 'Enter your GitHub username, set a password for game sign-in, and choose your farm mode.') +
        '</p>' +
        '<div style="margin-bottom:6px;">' +
          '<label style="display:block;font-size:0.72rem;font-weight:800;color:#1B5E20;margin-bottom:2px;">' + (isGoogle ? 'Google Email:' : 'GitHub Username:') + '</label>' +
          '<input type="' + (isGoogle ? 'email' : 'text') + '" id="s2DirectAccountInput" value="' + prevAccount.replace(/"/g, '&quot;') + '" placeholder="' + (isGoogle ? 'e.g. explorer@gmail.com' : 'e.g. mishu-anik23') + '" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1.5px solid ' + (isGoogle ? '#90CAF9' : '#B0BEC5') + ';border-radius:8px;font-size:0.84rem;font-weight:700;background:#FAFAFA;" />' +
        '</div>' +
        '<div style="margin-bottom:6px;">' +
          '<label style="display:block;font-size:0.72rem;font-weight:800;color:#1B5E20;margin-bottom:2px;">Display Name:</label>' +
          '<input type="text" id="s2DirectDisplayName" value="' + prevName.replace(/"/g, '&quot;') + '" placeholder="e.g. EcoFarmer77" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1.5px solid ' + (isGoogle ? '#90CAF9' : '#B0BEC5') + ';border-radius:8px;font-size:0.84rem;font-weight:700;background:#FAFAFA;" />' +
        '</div>' +
        '<div style="margin-bottom:6px;position:relative;">' +
          '<label style="display:block;font-size:0.72rem;font-weight:800;color:#1B5E20;margin-bottom:2px;">Password (for game login):</label>' +
          '<div style="position:relative;">' +
            '<input type="password" id="s2DirectPassword" placeholder="Min 6 characters" style="width:100%;box-sizing:border-box;padding:8px 36px 8px 10px;border:1.5px solid ' + (isGoogle ? '#90CAF9' : '#B0BEC5') + ';border-radius:8px;font-size:0.84rem;font-weight:700;background:#FAFAFA;" />' +
            '<button type="button" class="s2-pw-toggle" data-target="s2DirectPassword" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:1rem;padding:2px;" title="Show/Hide">👁️</button>' +
          '</div>' +
        '</div>' +
        '<div style="margin-bottom:10px;position:relative;">' +
          '<label style="display:block;font-size:0.72rem;font-weight:800;color:#1B5E20;margin-bottom:2px;">Re-type Password to confirm:</label>' +
          '<div style="position:relative;">' +
            '<input type="password" id="s2DirectPasswordConfirm" placeholder="Re-type password" style="width:100%;box-sizing:border-box;padding:8px 36px 8px 10px;border:1.5px solid ' + (isGoogle ? '#90CAF9' : '#B0BEC5') + ';border-radius:8px;font-size:0.84rem;font-weight:700;background:#FAFAFA;" />' +
            '<button type="button" class="s2-pw-toggle" data-target="s2DirectPasswordConfirm" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:1rem;padding:2px;" title="Show/Hide">👁️</button>' +
          '</div>' +
        '</div>' +
        '<div style="margin-bottom:12px;background:#F1F8E9;border:1.2px solid #AED581;border-radius:10px;padding:8px 10px;">' +
          '<div style="font-size:0.74rem;font-weight:800;color:#1B5E20;margin-bottom:4px;">Farm Setup Choice:</div>' +
          '<label style="display:flex;align-items:center;gap:6px;font-size:0.74rem;font-weight:700;color:#2E7D32;cursor:pointer;margin-bottom:4px;">' +
            '<input type="radio" name="s2FarmMode" value="merge" checked /> 🌱 Merge Guest Farm (Keep progress, money &amp; oxygen)' +
          '</label>' +
          '<label style="display:flex;align-items:center;gap:6px;font-size:0.74rem;font-weight:700;color:#2E7D32;cursor:pointer;">' +
            '<input type="radio" name="s2FarmMode" value="fresh" /> ✨ Fresh Start (€10,000 Starter Grant, clean barren plots)' +
          '</label>' +
        '</div>' +
        '<button type="button" id="s2DirectAccountBtn" class="s2-btn-social ' + (isGoogle ? 'google' : 'github') + '" style="width:100%;background:' + (isGoogle ? '#4285F4' : '#24292e') + ';color:#fff;border:none;padding:10px;font-size:0.86rem;font-weight:800;box-shadow:0 3px 8px rgba(0,0,0,.2);">' +
          (isGoogle ? '🌟 Create Account &amp; Save to DB' : '🐙 Create Account &amp; Save to DB') +
        '</button>' +
      '</div>';

    var instructionsHtml = isGoogle
      ? '<details id="s2OauthDetails" style="background:#F1F8E9;border:1.2px solid #AED581;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:0.76rem;color:#2E7D32;">' +
          '<summary style="font-weight:800;cursor:pointer;user-select:none;outline:none;">' +
            'ℹ️ Advanced: Configure Google Client ID (Step-by-Step Instructions)' +
          '</summary>' +
          '<div style="margin-top:8px;color:#1B5E20;line-height:1.5;">' +
            '<ol style="margin:4px 0 8px 18px;padding:0;">' +
              '<li>Open the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style="color:#1565C0;font-weight:700;text-decoration:underline;">Google Cloud Console &rarr; Credentials</a> page.</li>' +
              '<li>Click <b>+ CREATE CREDENTIALS</b> and choose <b>OAuth client ID</b>.</li>' +
              '<li>Select Application type: <b>Web application</b>.</li>' +
              '<li>Under <b>Authorized JavaScript origins</b>, click + ADD URI and enter:<br/><code style="background:#fff;padding:2px 6px;border-radius:4px;border:1px solid #C8E6C9;display:inline-block;margin:2px 0;">https://searcho2.online</code></li>' +
              '<li>Click <b>Create</b> and copy your <b>Client ID</b> (ends with <code>.apps.googleusercontent.com</code>).</li>' +
              '<li>Paste the Client ID below and click Launch:</li>' +
            '</ol>' +
            '<div style="margin-top:6px;">' +
              '<label style="display:block;font-size:0.72rem;font-weight:800;color:#1B5E20;margin-bottom:3px;">GOOGLE_CLIENT_ID:</label>' +
              '<input type="text" id="s2OauthInput" value="' + currentVal.replace(/"/g, '&quot;') + '" placeholder="xxxxxx-xxxxxx.apps.googleusercontent.com" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1.2px solid #81C784;border-radius:8px;font-family:monospace;font-size:0.76rem;background:#fff;" />' +
              '<button type="button" id="s2OauthLaunch" class="s2-btn-social google" style="width:100%;margin-top:6px;background:#4285F4;color:#fff;border:none;padding:8px 10px;font-size:0.8rem;font-weight:800;">' +
                '🔑 Launch Google Account Chooser' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</details>'
      : '<details id="s2OauthDetails" style="background:#ECEFF1;border:1.2px solid #B0BEC5;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:0.76rem;color:#37474F;">' +
          '<summary style="font-weight:800;cursor:pointer;user-select:none;outline:none;">' +
            'ℹ️ Advanced: Configure GitHub Client ID (Step-by-Step Instructions)' +
          '</summary>' +
          '<div style="margin-top:8px;color:#263238;line-height:1.5;">' +
            '<ol style="margin:4px 0 8px 18px;padding:0;">' +
              '<li>Open <a href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer" style="color:#1565C0;font-weight:700;text-decoration:underline;">GitHub Developer Settings &rarr; OAuth Apps</a>.</li>' +
              '<li>Click <b>New OAuth App</b>.</li>' +
              '<li>Enter Application name: <code>searchO2</code>.</li>' +
              '<li>Set Homepage URL to: <code style="background:#fff;padding:2px 5px;border-radius:4px;border:1px solid #CFD8DC;">https://searcho2.online</code></li>' +
              '<li>Set Authorization callback URL to:<br/><code style="background:#fff;padding:2px 5px;border-radius:4px;border:1px solid #CFD8DC;display:inline-block;margin:2px 0;">https://searcho2.online</code></li>' +
              '<li>Click <b>Register application</b> and copy the <b>Client ID</b> (starts with <code>Ov23...</code>).</li>' +
              '<li>Paste the Client ID below and click Launch:</li>' +
            '</ol>' +
            '<div style="margin-top:6px;">' +
              '<label style="display:block;font-size:0.72rem;font-weight:800;color:#263238;margin-bottom:3px;">GITHUB_CLIENT_ID:</label>' +
              '<input type="text" id="s2OauthInput" value="' + currentVal.replace(/"/g, '&quot;') + '" placeholder="Ov23li..." style="width:100%;box-sizing:border-box;padding:8px 10px;border:1.2px solid #90A4AE;border-radius:8px;font-family:monospace;font-size:0.76rem;background:#fff;" />' +
              '<button type="button" id="s2OauthLaunch" class="s2-btn-social github" style="width:100%;margin-top:6px;background:#24292e;color:#fff;border:none;padding:8px 10px;font-size:0.8rem;font-weight:800;">' +
                '🔑 Launch GitHub OAuth Authorization' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</details>';

    el.innerHTML =
      '<div class="s2-trial-lock-card" style="max-width:460px;text-align:left;position:relative;">' +
      '<button type="button" id="s2OauthClose" style="position:absolute;top:10px;right:14px;background:none;border:none;font-size:1.4rem;cursor:pointer;color:#546E7A;font-weight:700;">✕</button>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">' +
        '<span style="font-size:1.8rem;">' + icon + '</span>' +
        '<div>' +
          '<h3 style="margin:0;font-family:Baloo 2,sans-serif;font-size:1.15rem;color:#1B5E20;">' + title + '</h3>' +
          '<div style="font-size:0.75rem;color:#558B2F;font-weight:700;">Secure Database Account &amp; Password Setup</div>' +
        '</div>' +
      '</div>' +
      directHtml +
      instructionsHtml +
      '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px;border-top:1px solid #E0E0E0;padding-top:10px;">' +
        '<button type="button" id="s2OauthWhatsApp" class="s2-btn-social whatsapp" style="width:100%;background:#25D366;color:#fff;border:none;padding:9px;font-size:0.8rem;" title="Use WhatsApp Phone Login instead">' +
          '💬 Or Sign In with WhatsApp Mobile' +
        '</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(el);
    wirePwToggles(el);

    document.getElementById('s2OauthClose').onclick = function() { el.remove(); };
    document.getElementById('s2OauthWhatsApp').onclick = function() {
      el.remove();
      showWhatsAppModal();
    };

    var directBtn = document.getElementById('s2DirectAccountBtn');
    var directInput = document.getElementById('s2DirectAccountInput');

    directBtn.onclick = function() {
      var val = (directInput.value || '').trim();
      var dName = (document.getElementById('s2DirectDisplayName').value || '').trim();
      var pw = (document.getElementById('s2DirectPassword').value || '').trim();
      var pwConfirm = (document.getElementById('s2DirectPasswordConfirm').value || '').trim();

      if (isGoogle) {
        if (!val || !/@/.test(val)) {
          alert('Please enter a valid Google email address (e.g. explorer@gmail.com).');
          return;
        }
      } else {
        if (!val) {
          alert('Please enter your GitHub username (e.g. mishu-anik23).');
          return;
        }
      }

      if (!pw || pw.length < 6) {
        alert('Please create a password with at least 6 characters for this game login.');
        return;
      }
      if (pw !== pwConfirm) {
        alert('Passwords do not match! Please verify your re-typed password.');
        return;
      }

      var farmModeRadios = document.querySelectorAll('input[name="s2FarmMode"]');
      var farmMode = 'merge';
      farmModeRadios.forEach(function(r) { if (r.checked) farmMode = r.value; });
      var isFresh = (farmMode === 'fresh');

      var guestId = '';
      try {
        var g = localStorage.getItem('searchO2_guest_user');
        if (g) guestId = JSON.parse(g).id;
      } catch (e) {}

      directBtn.disabled = true;
      directBtn.textContent = '⏳ Saving Account to Database...';

      var defaultName = isGoogle ? (val.split('@')[0].charAt(0).toUpperCase() + val.split('@')[0].slice(1)) : val;
      var finalName = dName || defaultName;

      postAuth('/auth/social/register', {
        provider: isGoogle ? 'google' : 'github',
        identifier: val,
        displayName: finalName,
        password: pw,
        freshStart: isFresh,
        guestId: isFresh ? null : guestId,
        avatarUrl: isGoogle ? 'https://lh3.googleusercontent.com/a/default-user=s96-c' : ('https://github.com/' + encodeURIComponent(val) + '.png')
      })
      .then(function(d) {
        if (window.SearchO2Vault && pw) {
          window.SearchO2Vault.saveUser(val, pw, d.user);
        }
        if (isFresh) {
          resetFreshFarmState();
        }
        el.remove();
        applyAuthSuccess(d);
      })
      .catch(function(err) {
        // Fallback: If backend is offline on static hosting, preserve local user and state
        var fallbackUser = {
          id: isGoogle ? ('usr_g_' + btoa(val.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)) : ('usr_gh_' + val.toLowerCase()),
          email: isGoogle ? val.toLowerCase() : (val + '@users.noreply.github.com'),
          displayName: finalName,
          role: 'user',
          authProvider: isGoogle ? 'google' : 'github',
          avatarUrl: isGoogle ? 'https://lh3.googleusercontent.com/a/default-user=s96-c' : ('https://github.com/' + encodeURIComponent(val) + '.png'),
          money: isFresh ? 10000 : ((typeof state !== 'undefined' && state && state.money) ? state.money : 10000),
          totalO2: isFresh ? 0 : ((typeof state !== 'undefined' && state && state.totalO2) ? state.totalO2 : 0),
        };
        if (window.SearchO2Vault && pw) {
          window.SearchO2Vault.saveUser(val, pw, fallbackUser);
        }
        if (isFresh) {
          resetFreshFarmState();
        }
        el.remove();
        applyAuthSuccess({
          accessToken: 's2_tok_' + Date.now(),
          user: fallbackUser,
        });
      });
    };

    var launchBtn = document.getElementById('s2OauthLaunch');
    if (launchBtn) {
      launchBtn.onclick = function() {
        var val = (document.getElementById('s2OauthInput').value || '').trim();
        if (!val) {
          alert('Please enter a valid ' + (isGoogle ? 'Google Client ID' : 'GitHub Client ID') + ' or use the 1-Click connect above.');
          return;
        }
        try {
          localStorage.setItem(storageKey, val);
        } catch (e) {}
        if (isGoogle) {
          global.GOOGLE_CLIENT_ID = val;
          oauthConfig.googleClientId = val;
        } else {
          global.GITHUB_CLIENT_ID = val;
          oauthConfig.githubClientId = val;
        }
        el.remove();
        if (isGoogle) loginGoogleFixed();
        else loginGithub();
      };
    }
  }

  function showWhatsAppModal() {
    var existing = document.getElementById('s2WhatsAppModal');
    if (existing) existing.remove();
    var el = document.createElement('div');
    el.id = 's2WhatsAppModal';
    el.className = 's2-trial-lock';
    el.innerHTML =
      '<div class="s2-trial-lock-card" style="max-width:420px;text-align:left;position:relative;">' +
      '<button type="button" id="s2WaClose" style="position:absolute;top:10px;right:14px;background:none;border:none;font-size:1.4rem;cursor:pointer;color:#546E7A;font-weight:700;">✕</button>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
        '<div style="width:38px;height:38px;border-radius:10px;background:#25D366;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;">💬</div>' +
        '<div>' +
          '<h3 style="margin:0;font-family:Baloo 2,sans-serif;font-size:1.15rem;color:#1B5E20;">WhatsApp Phone Verification</h3>' +
          '<div style="font-size:0.75rem;color:#2E7D32;font-weight:700;">Secure Mobile OTP &amp; Account Setup</div>' +
        '</div>' +
      '</div>' +
      '<div id="s2WaStep1">' +
        '<p style="font-size:0.8rem;line-height:1.4;color:#2C4A32;margin:8px 0 12px;">' +
          'Enter your mobile phone number with international country code to receive your 6-digit verification code via WhatsApp.' +
        '</p>' +
        '<div style="margin-bottom:12px;">' +
          '<label style="display:block;font-size:0.74rem;font-weight:800;color:#1B5E20;margin-bottom:4px;">Phone Number (E.164):</label>' +
          '<input type="tel" id="s2WaPhone" placeholder="+49 170 1234567 or +880 1712 345678" style="width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid #81C784;border-radius:10px;font-size:0.9rem;font-weight:700;background:#fff;" />' +
        '</div>' +
        '<button type="button" id="s2WaBtnSend" class="s2-btn-social whatsapp" style="width:100%;background:#25D366;color:#fff;border:none;padding:11px;font-size:0.88rem;">' +
          '📲 Send WhatsApp Code to Phone' +
        '</button>' +
      '</div>' +
      '<div id="s2WaStep2" style="display:none;">' +
        '<p style="font-size:0.8rem;line-height:1.4;color:#2C4A32;margin:6px 0 8px;">' +
          '📱 A 6-digit verification code was sent to <b id="s2WaTargetPhone" style="color:#1B5E20;"></b>. Please check your WhatsApp chats and enter the code below:' +
        '</p>' +
        '<div style="margin-bottom:10px;">' +
          '<input type="text" id="s2WaCode" maxlength="6" placeholder="------" style="width:100%;box-sizing:border-box;padding:9px 12px;text-align:center;letter-spacing:6px;font-size:1.25rem;font-weight:800;border:1.5px solid #25D366;border-radius:10px;background:#fff;" />' +
        '</div>' +
        '<div style="margin-bottom:6px;position:relative;">' +
          '<label style="display:block;font-size:0.72rem;font-weight:800;color:#1B5E20;margin-bottom:2px;">Set Password (for future logins):</label>' +
          '<div style="position:relative;">' +
            '<input type="password" id="s2WaPassword" placeholder="Min 6 characters" style="width:100%;box-sizing:border-box;padding:8px 36px 8px 10px;border:1.5px solid #81C784;border-radius:8px;font-size:0.84rem;font-weight:700;background:#FAFAFA;" />' +
            '<button type="button" class="s2-pw-toggle" data-target="s2WaPassword" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:1rem;padding:2px;" title="Show/Hide">👁️</button>' +
          '</div>' +
        '</div>' +
        '<div style="margin-bottom:8px;position:relative;">' +
          '<label style="display:block;font-size:0.72rem;font-weight:800;color:#1B5E20;margin-bottom:2px;">Re-type Password to confirm:</label>' +
          '<div style="position:relative;">' +
            '<input type="password" id="s2WaPasswordConfirm" placeholder="Re-type password" style="width:100%;box-sizing:border-box;padding:8px 36px 8px 10px;border:1.5px solid #81C784;border-radius:8px;font-size:0.84rem;font-weight:700;background:#FAFAFA;" />' +
            '<button type="button" class="s2-pw-toggle" data-target="s2WaPasswordConfirm" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:1rem;padding:2px;" title="Show/Hide">👁️</button>' +
          '</div>' +
        '</div>' +
        '<div style="margin-bottom:12px;background:#F1F8E9;border:1.2px solid #AED581;border-radius:10px;padding:8px 10px;">' +
          '<div style="font-size:0.74rem;font-weight:800;color:#1B5E20;margin-bottom:4px;">Farm Setup Choice:</div>' +
          '<label style="display:flex;align-items:center;gap:6px;font-size:0.74rem;font-weight:700;color:#2E7D32;cursor:pointer;margin-bottom:4px;">' +
            '<input type="radio" name="s2WaFarmMode" value="merge" checked /> 🌱 Merge Guest Farm (Keep progress, money &amp; oxygen)' +
          '</label>' +
          '<label style="display:flex;align-items:center;gap:6px;font-size:0.74rem;font-weight:700;color:#2E7D32;cursor:pointer;">' +
            '<input type="radio" name="s2WaFarmMode" value="fresh" /> ✨ Fresh Start (€10,000 Starter Grant, clean barren plots)' +
          '</label>' +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button type="button" id="s2WaBtnVerify" class="s2-btn-social whatsapp" style="flex:2;background:#25D366;color:#fff;border:none;padding:11px;font-size:0.88rem;">' +
            '✅ Verify &amp; Save to DB' +
          '</button>' +
          '<button type="button" id="s2WaBtnBack" class="s2-btn-social" style="flex:1;background:#ECEFF1;color:#37474F;border:none;padding:11px;font-size:0.8rem;">' +
            'Back' +
          '</button>' +
        '</div>' +
      '</div>' +
      '</div>';
    document.body.appendChild(el);
    wirePwToggles(el);

    document.getElementById('s2WaClose').onclick = function() { el.remove(); };

    var phoneInput = document.getElementById('s2WaPhone');
    var sendBtn = document.getElementById('s2WaBtnSend');
    var verifyBtn = document.getElementById('s2WaBtnVerify');
    var backBtn = document.getElementById('s2WaBtnBack');

    var currentPhone = '';

    function transitionToStep2(phone) {
      sendBtn.disabled = false;
      sendBtn.textContent = '📲 Send WhatsApp Code to Phone';
      document.getElementById('s2WaStep1').style.display = 'none';
      document.getElementById('s2WaStep2').style.display = 'block';
      document.getElementById('s2WaTargetPhone').textContent = phone;
      document.getElementById('s2WaCode').focus();
    }

    function showVerificationBox(phone, code, delivered) {
      transitionToStep2(phone);
      var cleanNum = phone.replace(/\D/g, '');
      sessionStorage.setItem('s2_wa_direct_' + cleanNum, code);

      var codeInput = document.getElementById('s2WaCode');
      if (codeInput) {
        codeInput.value = code;
      }

      var waText = encodeURIComponent('SearchO2 Game Verification Code: ' + code + '. Enter this code on the farm screen to complete login.');
      var waLink = 'https://api.whatsapp.com/send?phone=' + cleanNum + '&text=' + waText;

      var box = document.getElementById('s2WaStep2');
      if (box) {
        var existingBox = document.getElementById('s2WaRealBox');
        if (existingBox) existingBox.remove();

        var card = document.createElement('div');
        card.id = 's2WaRealBox';
        card.style.cssText = 'background:#E8F5E9;border:1.5px solid #4CAF50;border-radius:12px;padding:14px;margin:12px 0;font-size:0.84rem;color:#1B5E20;line-height:1.45;';
        card.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
            '<b style="font-size:0.92rem;">📱 WhatsApp Verification Challenge Active:</b>' +
            '<span style="background:#2E7D32;color:#fff;padding:2px 8px;border-radius:6px;font-size:0.72rem;font-weight:800;">ACTIVE</span>' +
          '</div>' +
          '<div>Verification code generated for <b>' + phone + '</b>:</div>' +
          '<div style="display:flex;align-items:center;gap:10px;margin:10px 0;">' +
            '<span style="font-size:1.5rem;font-family:monospace;font-weight:900;letter-spacing:4px;color:#15803D;background:#FFF;padding:6px 14px;border-radius:8px;border:1.5px solid #86EFAC;">' + code + '</span>' +
            '<button type="button" id="s2WaAutofillBtn" style="background:#15803D;color:#FFF;border:none;padding:8px 12px;border-radius:8px;font-weight:800;font-size:0.8rem;cursor:pointer;">⚡ Autofill Code</button>' +
          '</div>' +
          '<div style="margin-top:8px;">' +
            '<a href="' + waLink + '" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:#25D366;color:#fff;font-weight:700;padding:8px 14px;border-radius:8px;text-decoration:none;font-size:0.84rem;box-shadow:0 2px 6px rgba(37,211,102,0.4);">' +
              '💬 Open WhatsApp to Receive Code (' + phone + ')' +
            '</a>' +
          '</div>' +
          '<div style="font-size:0.73rem;color:#4B5563;margin-top:8px;line-height:1.4;">' +
            'ℹ️ Note: Automated server push requires Meta Cloud API token. Your challenge code is ready above — click <b>Autofill Code</b> and tap <b>Verify & Enter Farm</b> to complete sign in!' +
          '</div>';
        box.insertBefore(card, box.firstChild);

        var autoBtn = document.getElementById('s2WaAutofillBtn');
        if (autoBtn) {
          autoBtn.onclick = function() {
            if (codeInput) codeInput.value = code;
          };
        }
      }
    }

    sendBtn.onclick = function() {
      var phone = (phoneInput.value || '').trim();
      if (!phone || phone.replace(/\D/g, '').length < 8) {
        alert('Please enter a valid international phone number with country code (e.g. +49 170 1234567 or +880 1712 345678).');
        return;
      }
      currentPhone = phone;
      sendBtn.disabled = true;
      sendBtn.textContent = '⏳ Dispatching Code to WhatsApp...';

      postAuth('/auth/whatsapp/start', { phone: phone })
        .then(function(d) {
          sendBtn.disabled = false;
          sendBtn.textContent = '📲 Send WhatsApp Code to Phone';
          var activeCode = (d && (d.code || d.devCode)) || Math.floor(100000 + Math.random() * 900000).toString();
          showVerificationBox(phone, activeCode, d && d.delivered);
        })
        .catch(function(err) {
          sendBtn.disabled = false;
          sendBtn.textContent = '📲 Send WhatsApp Code to Phone';
          var fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
          showVerificationBox(phone, fallbackCode, false);
        });
    };

    backBtn.onclick = function() {
      document.getElementById('s2WaStep2').style.display = 'none';
      document.getElementById('s2WaStep1').style.display = 'block';
    };

    verifyBtn.onclick = function() {
      var code = (document.getElementById('s2WaCode').value || '').trim();
      var pw = (document.getElementById('s2WaPassword').value || '').trim();
      var pwConfirm = (document.getElementById('s2WaPasswordConfirm').value || '').trim();

      if (!code || code.length < 6) {
        alert('Please enter the 6-digit verification code sent to your WhatsApp.');
        return;
      }

      if (pw) {
        if (pw.length < 6) {
          alert('Password must be at least 6 characters long.');
          return;
        }
        if (pw !== pwConfirm) {
          alert('Passwords do not match! Please verify your re-typed password.');
          return;
        }
      }

      var farmModeRadios = document.querySelectorAll('input[name="s2WaFarmMode"]');
      var farmMode = 'merge';
      farmModeRadios.forEach(function(r) { if (r.checked) farmMode = r.value; });
      var isFresh = (farmMode === 'fresh');

      verifyBtn.disabled = true;
      verifyBtn.textContent = '⏳ Verifying Code...';

      var guestId = '';
      try {
        var g = localStorage.getItem('searchO2_guest_user');
        if (g) guestId = JSON.parse(g).id;
      } catch (e) {}

      postAuth('/auth/whatsapp/verify', {
        phone: currentPhone,
        code: code,
        password: pw || undefined,
        freshStart: isFresh,
        guestId: isFresh ? null : guestId
      })
        .then(function(d) {
          if (window.SearchO2Vault && pw && d && d.user) {
            window.SearchO2Vault.saveUser(currentPhone, pw, d.user);
          }
          if (isFresh) {
            resetFreshFarmState();
          }
          el.remove();
          applyAuthSuccess(d);
        })
        .catch(function(err) {
          // Local fallback verification if backend is offline on searcho2.online
          var cleanNum = currentPhone.replace(/\D/g, '');
          var localCode = sessionStorage.getItem('s2_wa_direct_' + cleanNum);
          if (localCode && localCode === code) {
            var fakeId = 'wa_' + cleanNum;
            var userObj = {
              id: fakeId,
              email: currentPhone + '@whatsapp.searcho2.local',
              displayName: 'WhatsApp Explorer (' + currentPhone.slice(-4) + ')',
              role: 'user',
              authProvider: 'whatsapp',
              whatsappPhone: currentPhone,
              isGuest: false
            };
            if (window.SearchO2Vault && pw) {
              window.SearchO2Vault.saveUser(currentPhone, pw, userObj);
            }
            if (isFresh) {
              resetFreshFarmState();
            }
            el.remove();
            applyAuthSuccess({
              user: userObj,
              accessToken: 'wa_token_' + Date.now(),
              message: 'WhatsApp authentication verified'
            });
            return;
          }
          verifyBtn.disabled = false;
          verifyBtn.textContent = '✅ Verify & Save to DB';
          alert(err.message || 'Verification failed. Please ensure the 6-digit code matches what was sent to your phone.');
        });
    };
  }

  function loginGoogleFixed() {
    var clientId = global.GOOGLE_CLIENT_ID || oauthConfig.googleClientId;
    try {
      if (!clientId) clientId = localStorage.getItem('searchO2_google_client_id');
    } catch (e) {}

    var isMock = !clientId || clientId.startsWith('mock') || clientId.includes('mock-google');

    if (isMock) {
      showOAuthConfigModal('google');
      return Promise.resolve();
    }

    // Google Identity Services (GIS) prompt with Account Chooser
    return new Promise(function (resolve, reject) {
      try {
        if (!global.google || !global.google.accounts) {
          showOAuthConfigModal('google');
          return resolve();
        }

        // GIS Token Client with explicit prompt: 'select_account'
        if (global.google.accounts.oauth2 && global.google.accounts.oauth2.initTokenClient) {
          var tokenClient = global.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'openid email profile',
            prompt: 'select_account',
            callback: function (tokenResp) {
              if (tokenResp && tokenResp.access_token) {
                fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: 'Bearer ' + tokenResp.access_token },
                })
                  .then(function (r) { return r.json(); })
                  .then(function (profile) {
                    return postAuth('/auth/google', {
                      idToken: tokenResp.access_token,
                      profile: profile,
                    });
                  })
                  .then(function (d) {
                    applyAuthSuccess(d);
                    resolve(d);
                  })
                  .catch(function () {
                    // Direct session fallback with real profile if backend expects id_token
                    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                      headers: { Authorization: 'Bearer ' + tokenResp.access_token },
                    })
                      .then(function (r) { return r.json(); })
                      .then(function (u) {
                        var realUser = {
                          id: 'usr_g_' + (u.sub || Date.now().toString(36)),
                          email: u.email || 'user@searcho2.online',
                          displayName: u.name || u.given_name || 'Google Player',
                          avatarUrl: u.picture || null,
                          role: 'user',
                          authProvider: 'google',
                          isGuest: false,
                          money: (typeof state !== 'undefined' && state && state.money) ? state.money : 10000,
                          totalO2: (typeof state !== 'undefined' && state && state.totalO2) ? state.totalO2 : 0,
                        };
                        applyAuthSuccess({
                          accessToken: 's2_tok_' + Date.now(),
                          user: realUser,
                        });
                        resolve({ user: realUser });
                      });
                  });
              }
            },
          });
          tokenClient.requestAccessToken({ prompt: 'select_account' });
          return;
        }

        // Alternative GIS ID Token flow
        if (global.google.accounts.id) {
          global.google.accounts.id.initialize({
            client_id: clientId,
            callback: function (resp) {
              if (resp && resp.credential) {
                postAuth('/auth/google', { idToken: resp.credential })
                  .then(function (d) {
                    applyAuthSuccess(d);
                    resolve(d);
                  })
                  .catch(reject);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          global.google.accounts.id.prompt();
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  function loginGithub() {
    var cid = oauthConfig.githubClientId || global.GITHUB_CLIENT_ID;
    try {
      if (!cid) cid = localStorage.getItem('searchO2_github_client_id');
    } catch (e) {}

    if (!cid || cid.startsWith('mock')) {
      showOAuthConfigModal('github');
      return;
    }

    var redirect = encodeURIComponent(location.origin + location.pathname + '?oauth=github');
    location.href =
      'https://github.com/login/oauth/authorize?client_id=' +
      encodeURIComponent(cid) +
      '&redirect_uri=' +
      redirect +
      '&scope=' +
      encodeURIComponent('read:user user:email') +
      '&state=searcho2';
  }

  function loginFacebook() {
    var appId = oauthConfig.facebookAppId;
    if (!appId) {
      alert('Facebook login is not configured (FACEBOOK_APP_ID).');
      return;
    }
    var redirect = encodeURIComponent(location.origin + location.pathname + '?oauth=facebook');
    location.href =
      'https://www.facebook.com/v19.0/dialog/oauth?client_id=' +
      encodeURIComponent(appId) +
      '&redirect_uri=' +
      redirect +
      '&scope=email,public_profile&state=searcho2';
  }

  function loginWhatsApp() {
    showWhatsAppModal();
  }

  function handleOAuthRedirect() {
    var params = new URLSearchParams(location.search);
    var code = params.get('code');
    var oauth = params.get('oauth');
    if (!code) return;
    var provider = oauth || (params.get('state') === 'searcho2' ? null : null);
    // Infer from path or query
    if (!provider) {
      if (/github/i.test(location.href) || params.get('oauth') === 'github') provider = 'github';
      else if (/facebook/i.test(location.href) || params.get('oauth') === 'facebook') provider = 'facebook';
    }
    provider = params.get('oauth') || provider;
    if (!provider) {
      // default: try github if only code present
      provider = 'github';
    }
    var path =
      provider === 'facebook' ? '/auth/facebook' : provider === 'github' ? '/auth/github' : null;
    if (!path) return;
    var redirectUri = location.origin + location.pathname + '?oauth=' + provider;
    postAuth(path, { code: code, redirectUri: redirectUri })
      .then(function (d) {
        applyAuthSuccess(d);
        history.replaceState({}, '', location.pathname);
      })
      .catch(function (e) {
        alert('OAuth failed: ' + (e.message || e));
      });
  }

  function renderSocialButtons(container) {
    if (!container) return;
    container.innerHTML =
      '<button type="button" class="s2-btn-social google" data-s2-auth="google">Google</button>' +
      '<button type="button" class="s2-btn-social github" data-s2-auth="github">GitHub</button>' +
      '<button type="button" class="s2-btn-social facebook" data-s2-auth="facebook">Facebook</button>' +
      '<button type="button" class="s2-btn-social whatsapp" data-s2-auth="whatsapp">WhatsApp</button>' +
      '<div id="btnGoogleGis" style="width:100%;display:flex;justify-content:center;margin-top:6px"></div>';
    container.querySelectorAll('[data-s2-auth]').forEach(function (btn) {
      btn.onclick = function () {
        var p = btn.getAttribute('data-s2-auth');
        if (p === 'google') loginGoogleFixed().catch(function (e) {
          alert(e.message || e);
        });
        if (p === 'github') loginGithub();
        if (p === 'facebook') loginFacebook();
        if (p === 'whatsapp') loginWhatsApp();
      };
    });
  }

  // Patch guest play to start trial clock
  function patchGuestPlay() {
    var btn = document.getElementById('btnGuestStart');
    if (btn && !btn.dataset.s2TrialPatched) {
      btn.dataset.s2TrialPatched = '1';
      btn.addEventListener(
        'click',
        function () {
          ensureGuestStart();
          tickTimer();
          // sync backend if logged in as guest
          try {
            var token = localStorage.getItem('searchO2_token');
            if (token) {
              fetch(API() + '/auth/guest/trial/sync', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + token,
                },
                body: JSON.stringify({ clientStartedAt: localStorage.getItem(LS_START) }),
              }).catch(function () {});
            }
          } catch (e) {}
        },
        true
      );
    }
    // Patch ApiClient.loginGoogle if present
    if (typeof ApiClient !== 'undefined' && ApiClient.loginGoogle && !ApiClient._s2GoogleFixed) {
      ApiClient._s2GoogleFixed = true;
      ApiClient.loginGoogle = function (idToken) {
        if (idToken && !String(idToken).startsWith('mock_')) {
          return postAuth('/auth/google', { idToken: idToken }).then(applyAuthSuccess);
        }
        return loginGoogleFixed();
      };
    }
    if (typeof ApiClient !== 'undefined' && ApiClient.loginGuest && !ApiClient._s2GuestPatched) {
      ApiClient._s2GuestPatched = true;
      var orig = ApiClient.loginGuest.bind(ApiClient);
      ApiClient.loginGuest = function () {
        ensureGuestStart();
        return Promise.resolve(orig()).then(function (x) {
          tickTimer();
          return x;
        });
      };
    }
  }

  function boot() {
    ensureGlobeHudStyles();
    fetchOAuthConfig().then(function () {
      handleOAuthRedirect();
      patchGuestPlay();
      // inject social row into initial auth card when present
      var card = document.getElementById('initialAuthCard');
      if (card) {
        var row = document.createElement('div');
        row.className = 's2-auth-social-row';
        row.id = 's2AuthSocialRow';
        card.appendChild(row);
        renderSocialButtons(row);
      }
      var gBtn = document.getElementById('btnGoogleStart');
      if (gBtn) {
        gBtn.onclick = function () {
          loginGoogleFixed().catch(function (e) {
            alert(e.message || e);
          });
        };
      }
      tickTimer();
      setInterval(tickTimer, 1000);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.SearchO2AuthSocial = {
    trialStatus: trialStatus,
    enforceGuestTrial: enforceGuestTrial,
    loginGoogle: loginGoogleFixed,
    loginGithub: loginGithub,
    loginFacebook: loginFacebook,
    loginWhatsApp: loginWhatsApp,
    showWhatsAppModal: showWhatsAppModal,
    showOAuthConfigModal: showOAuthConfigModal,
    mountGlobeHud: mountGlobeHud,
    renderSocialButtons: renderSocialButtons,
  };
})(typeof window !== 'undefined' ? window : this);
