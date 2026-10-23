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
    return (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ||
      (global.SEARCHO2_API_URL || '') + '/api' ||
      '/api';
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
    ensureGlobeHudStyles();
    var host =
      document.getElementById('regionScreen') ||
      document.getElementById('globeStage') ||
      document.querySelector('.globe-stage-wrapper') ||
      document.getElementById('regionMainWrapper');
    if (!host) return;
    var hud = document.getElementById('s2GlobeHud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 's2GlobeHud';
      hud.className = 's2-globe-hud';
      host.style.position = host.style.position || 'relative';
      host.appendChild(hud);
    }
    var st = trialStatus();
    var timerClass = 's2-globe-timer' + (st.expired ? ' expired' : '');
    var timerText = isRegisteredUser()
      ? '✅ Account saved'
      : st.active
        ? st.expired
          ? '⏰ Trial ended — login required'
          : '⏳ Guest trial · ' + formatRemaining(st.remainingMs)
        : '🌱 Guest trial starts on play';
    hud.innerHTML = avatarFaceHtml() + '<div class="' + timerClass + '" id="s2GlobeTimer">' + timerText + '</div>';
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
        return r.json();
      })
      .then(function (cfg) {
        oauthConfig = cfg || oauthConfig;
        if (cfg.googleClientId) {
          global.GOOGLE_CLIENT_ID = cfg.googleClientId;
        }
        return cfg;
      })
      .catch(function () {
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
      } catch (e) {}
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
      showNotification('✅', 'Signed in — farm progress is saved.', 'bank', null);
    }
    if (typeof closeModal === 'function') closeModal();
    if (typeof render === 'function') render();
    tickTimer();
  }

  function loginGoogleFixed() {
    var clientId = global.GOOGLE_CLIENT_ID || oauthConfig.googleClientId;
    if (global.google && global.google.accounts && global.google.accounts.id && clientId) {
      return new Promise(function (resolve, reject) {
        try {
          global.google.accounts.id.initialize({
            client_id: clientId,
            callback: function (resp) {
              if (!resp || !resp.credential) {
                reject(new Error('No Google credential'));
                return;
              }
              postAuth('/auth/google', { idToken: resp.credential })
                .then(function (d) {
                  applyAuthSuccess(d);
                  resolve(d);
                })
                .catch(reject);
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          global.google.accounts.id.prompt(function (notification) {
            if (notification && notification.isNotDisplayed && notification.isNotDisplayed()) {
              // Render button fallback
              var host = document.getElementById('g_id_onload') || document.getElementById('btnGoogleGis');
              if (host) {
                host.innerHTML = '';
                global.google.accounts.id.renderButton(host, {
                  theme: 'outline',
                  size: 'large',
                  shape: 'pill',
                  text: 'continue_with',
                  width: 280,
                });
              }
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    }
    return Promise.reject(
      new Error('Google Identity Services not loaded or GOOGLE_CLIENT_ID missing. Set backend GOOGLE_CLIENT_ID.')
    );
  }

  function loginGithub() {
    var cid = oauthConfig.githubClientId;
    if (!cid) {
      alert('GitHub login is not configured (GITHUB_CLIENT_ID).');
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
    var phone = prompt('WhatsApp number with country code (e.g. +491701234567):');
    if (!phone) return;
    postAuth('/auth/whatsapp/start', { phone: phone })
      .then(function (d) {
        var hint = d.devCode ? ' Dev code: ' + d.devCode : '';
        var code = prompt('Enter the 6-digit code sent to WhatsApp.' + hint);
        if (!code) return;
        return postAuth('/auth/whatsapp/verify', { phone: phone, code: code });
      })
      .then(function (d) {
        if (d) applyAuthSuccess(d);
      })
      .catch(function (e) {
        alert(e.message || String(e));
      });
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
    mountGlobeHud: mountGlobeHud,
    renderSocialButtons: renderSocialButtons,
  };
})(typeof window !== 'undefined' ? window : this);
