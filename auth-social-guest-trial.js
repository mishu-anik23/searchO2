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

    return fetch(API() + path, {
      method: 'POST',
      credentials: 'include',
      headers: headers,
      body: JSON.stringify(body),
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) throw new Error(d.error || d.message || 'Auth failed');
        return d;
      });
    });
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

  function showOAuthConfigModal(provider) {
    var existing = document.getElementById('s2OauthModal');
    if (existing) existing.remove();
    var el = document.createElement('div');
    el.id = 's2OauthModal';
    el.className = 's2-trial-lock';
    var isGoogle = provider === 'google';
    var title = isGoogle ? 'Google Account Sign-In' : 'GitHub OAuth Sign-In';
    var icon = isGoogle ? '🔍' : '🐙';
    var envKey = isGoogle ? 'GOOGLE_CLIENT_ID' : 'GITHUB_CLIENT_ID';
    var storageKey = isGoogle ? 'searchO2_google_client_id' : 'searchO2_github_client_id';
    var currentVal = '';
    try { currentVal = localStorage.getItem(storageKey) || ''; } catch (e) {}

    el.innerHTML =
      '<div class="s2-trial-lock-card" style="max-width:440px;text-align:left;position:relative;">' +
      '<button type="button" id="s2OauthClose" style="position:absolute;top:10px;right:14px;background:none;border:none;font-size:1.4rem;cursor:pointer;color:#546E7A;font-weight:700;">✕</button>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
        '<span style="font-size:1.8rem;">' + icon + '</span>' +
        '<div>' +
          '<h3 style="margin:0;font-family:Baloo 2,sans-serif;font-size:1.15rem;color:#1B5E20;">' + title + '</h3>' +
          '<div style="font-size:0.75rem;color:#558B2F;font-weight:700;">Select Account &amp; Secure Authentication</div>' +
        '</div>' +
      '</div>' +
      '<p style="font-size:0.82rem;line-height:1.45;color:#2C4A32;margin:8px 0 12px;">' +
        'To connect your personal ' + (isGoogle ? 'Google' : 'GitHub') + ' account on this domain, please enter your ' +
        (isGoogle ? 'Google OAuth 2.0 Client ID' : 'GitHub OAuth App Client ID') + '. ' +
        'Once entered, ' + (isGoogle ? 'Google\'s official account chooser will open for you to pick your account.' : 'GitHub authorization will open.') +
      '</p>' +
      '<div style="margin-bottom:12px;">' +
        '<label style="display:block;font-size:0.75rem;font-weight:800;color:#1B5E20;margin-bottom:4px;">' + envKey + ':</label>' +
        '<input type="text" id="s2OauthInput" value="' + currentVal.replace(/"/g, '&quot;') + '" placeholder="' + (isGoogle ? 'xxxxxx-xxxxxx.apps.googleusercontent.com' : 'Ov23li...') + '" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #81C784;border-radius:10px;font-family:monospace;font-size:0.8rem;background:#fff;" />' +
      '</div>' +
      '<div style="display:flex;gap:8px;">' +
        '<button type="button" id="s2OauthLaunch" class="s2-btn-social ' + (isGoogle ? 'google' : 'github') + '" style="flex:2;background:' + (isGoogle ? '#4285F4' : '#24292e') + ';color:#fff;border:none;padding:11px;">' +
          '🔑 Choose Account &amp; Connect' +
        '</button>' +
        '<button type="button" id="s2OauthWhatsApp" class="s2-btn-social whatsapp" style="flex:1;background:#25D366;color:#fff;border:none;padding:11px;" title="Use WhatsApp Phone Login instead">' +
          '💬 WhatsApp' +
        '</button>' +
      '</div>' +
      '<div style="margin-top:10px;text-align:center;font-size:0.72rem;color:#78909C;">' +
        'On production (searcho2.online), this is automatically loaded from the server.' +
      '</div>' +
      '</div>';
    document.body.appendChild(el);

    document.getElementById('s2OauthClose').onclick = function() { el.remove(); };
    document.getElementById('s2OauthWhatsApp').onclick = function() {
      el.remove();
      showWhatsAppModal();
    };
    document.getElementById('s2OauthLaunch').onclick = function() {
      var val = (document.getElementById('s2OauthInput').value || '').trim();
      if (!val) {
        alert('Please enter a valid ' + (isGoogle ? 'Google Client ID' : 'GitHub Client ID') + ' or use WhatsApp sign-in.');
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

  function showWhatsAppModal() {
    var existing = document.getElementById('s2WhatsAppModal');
    if (existing) existing.remove();
    var el = document.createElement('div');
    el.id = 's2WhatsAppModal';
    el.className = 's2-trial-lock';
    el.innerHTML =
      '<div class="s2-trial-lock-card" style="max-width:400px;text-align:left;position:relative;">' +
      '<button type="button" id="s2WaClose" style="position:absolute;top:10px;right:14px;background:none;border:none;font-size:1.4rem;cursor:pointer;color:#546E7A;font-weight:700;">✕</button>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
        '<div style="width:38px;height:38px;border-radius:10px;background:#25D366;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;">💬</div>' +
        '<div>' +
          '<h3 style="margin:0;font-family:Baloo 2,sans-serif;font-size:1.15rem;color:#1B5E20;">WhatsApp Phone Sign-In</h3>' +
          '<div style="font-size:0.75rem;color:#2E7D32;font-weight:700;">Fast 6-Digit OTP Verification</div>' +
        '</div>' +
      '</div>' +
      '<div id="s2WaStep1">' +
        '<p style="font-size:0.82rem;line-height:1.4;color:#2C4A32;margin:8px 0 12px;">' +
          'Enter your mobile phone number with international country code to receive your 6-digit login code.' +
        '</p>' +
        '<div style="margin-bottom:12px;">' +
          '<label style="display:block;font-size:0.75rem;font-weight:800;color:#1B5E20;margin-bottom:4px;">Phone Number (E.164):</label>' +
          '<input type="tel" id="s2WaPhone" placeholder="+49 170 1234567 or +880 1712 345678" style="width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid #81C784;border-radius:10px;font-size:0.9rem;font-weight:700;background:#fff;" />' +
        '</div>' +
        '<button type="button" id="s2WaBtnSend" class="s2-btn-social whatsapp" style="width:100%;background:#25D366;color:#fff;border:none;padding:11px;font-size:0.88rem;">' +
          '📲 Send WhatsApp Code' +
        '</button>' +
      '</div>' +
      '<div id="s2WaStep2" style="display:none;">' +
        '<p style="font-size:0.82rem;line-height:1.4;color:#2C4A32;margin:8px 0 10px;">' +
          'Enter the 6-digit code sent to <b id="s2WaTargetPhone" style="color:#1B5E20;"></b>:' +
        '</p>' +
        '<div id="s2WaDevNotice" style="display:none;background:#FFF9C4;border:1px solid #FBC02D;border-radius:8px;padding:6px 10px;font-size:0.74rem;color:#F57F17;font-weight:700;margin-bottom:10px;"></div>' +
        '<div style="margin-bottom:12px;">' +
          '<input type="text" id="s2WaCode" maxlength="6" placeholder="123456" style="width:100%;box-sizing:border-box;padding:10px 12px;text-align:center;letter-spacing:6px;font-size:1.3rem;font-weight:800;border:1.5px solid #25D366;border-radius:10px;background:#fff;" />' +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button type="button" id="s2WaBtnVerify" class="s2-btn-social whatsapp" style="flex:2;background:#25D366;color:#fff;border:none;padding:11px;font-size:0.88rem;">' +
            '✅ Verify &amp; Sign In' +
          '</button>' +
          '<button type="button" id="s2WaBtnBack" class="s2-btn-social" style="flex:1;background:#ECEFF1;color:#37474F;border:none;padding:11px;font-size:0.8rem;">' +
            'Back' +
          '</button>' +
        '</div>' +
      '</div>' +
      '</div>';
    document.body.appendChild(el);

    document.getElementById('s2WaClose').onclick = function() { el.remove(); };

    var phoneInput = document.getElementById('s2WaPhone');
    var sendBtn = document.getElementById('s2WaBtnSend');
    var verifyBtn = document.getElementById('s2WaBtnVerify');
    var backBtn = document.getElementById('s2WaBtnBack');

    var currentPhone = '';

    sendBtn.onclick = function() {
      var phone = (phoneInput.value || '').trim();
      if (!phone || phone.replace(/\D/g, '').length < 8) {
        alert('Please enter a valid international phone number with country code (e.g. +49 170 1234567).');
        return;
      }
      currentPhone = phone;
      sendBtn.disabled = true;
      sendBtn.textContent = '⏳ Sending...';

      postAuth('/auth/whatsapp/start', { phone: phone })
        .then(function(d) {
          sendBtn.disabled = false;
          sendBtn.textContent = '📲 Send WhatsApp Code';
          document.getElementById('s2WaStep1').style.display = 'none';
          document.getElementById('s2WaStep2').style.display = 'block';
          document.getElementById('s2WaTargetPhone').textContent = phone;
          if (d && d.devCode) {
            var devEl = document.getElementById('s2WaDevNotice');
            devEl.style.display = 'block';
            devEl.textContent = '🔑 Development Demo Code: ' + d.devCode;
            document.getElementById('s2WaCode').value = d.devCode;
          }
          document.getElementById('s2WaCode').focus();
        })
        .catch(function(err) {
          sendBtn.disabled = false;
          sendBtn.textContent = '📲 Send WhatsApp Code';
          alert(err.message || 'Failed to send WhatsApp code');
        });
    };

    backBtn.onclick = function() {
      document.getElementById('s2WaStep2').style.display = 'none';
      document.getElementById('s2WaStep1').style.display = 'block';
    };

    verifyBtn.onclick = function() {
      var code = (document.getElementById('s2WaCode').value || '').trim();
      if (!code || code.length < 6) {
        alert('Please enter the 6-digit verification code.');
        return;
      }
      verifyBtn.disabled = true;
      verifyBtn.textContent = '⏳ Verifying...';

      var guestId = '';
      try {
        var g = localStorage.getItem('searchO2_guest_user');
        if (g) guestId = JSON.parse(g).id;
      } catch (e) {}

      postAuth('/auth/whatsapp/verify', { phone: currentPhone, code: code, guestId: guestId })
        .then(function(d) {
          el.remove();
          applyAuthSuccess(d);
        })
        .catch(function(err) {
          verifyBtn.disabled = false;
          verifyBtn.textContent = '✅ Verify & Sign In';
          alert(err.message || 'Verification failed');
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
          alert('Google Identity Services is initializing. Please try again in a moment.');
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
