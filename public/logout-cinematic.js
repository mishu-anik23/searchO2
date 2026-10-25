/**
 * SearchO2 - Cinematic Logout & Power Nap Alert Background Animation
 *
 * Implements an isometric 3D diorama:
 * - A wise cat wearing black-framed glasses taking a power nap at a desk running SearchO2.
 * - A cheeky cute mouse pulling and tugging the cat's paw to provoke login.
 * - Cat stirs, opens glowing eyes behind glasses, glares down at the mouse, slow-blinks, and falls back asleep.
 * - Continuous 10-second loop with abstract planetary gameplay narrative text.
 * - Preserved isometric camera presets: [Isometric], [Desk View], [Focus View] + [Lamp Toggle].
 * - Integrated, right-docked glassmorphism Login Modal matching the twilight cyan/emerald/amber palette.
 * - Prominent "Continue as Guest Explorer" button routing to the Guest Homepage.
 */

(function (window, document) {
  'use strict';

  var instance = null;

  var PHASES = [
    { start: 0.0, end: 3.2, title: '💤 Ecosystem Hibernation', text: 'Planetary biostation enters dormant energy-saving equilibrium.' },
    { start: 3.2, end: 6.0, title: '⚡ Atmospheric Pulse Alert', text: 'Kinetic signal detected: micro-custodian triggers urgent atmospheric login probe!' },
    { start: 6.0, end: 8.2, title: '👁️ Custodian Awareness', text: 'Sensors awaken behind polarized lenses; biological surveillance verifies the incoming request.' },
    { start: 8.2, end: 10.0, title: '🌱 Deep Regenerative Standby', text: 'System registers standby protocol; restorative biostimulation cycles resume until your next command.' }
  ];

  function ensureStyles() {
    if (document.getElementById('so2-logout-cinematic-styles')) return;
    var style = document.createElement('style');
    style.id = 'so2-logout-cinematic-styles';
    style.textContent = [
      '#so2LogoutRoot {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 99995;',
      '  background: radial-gradient(circle at 50% 40%, #1e1e38 0%, #0d0c1d 100%);',
      '  color: #f8fafc;',
      '  font-family: Inter, system-ui, -apple-system, sans-serif;',
      '  overflow: hidden;',
      '  user-select: none;',
      '}',
      '#so2LogoutCanvas {',
      '  position: absolute;',
      '  inset: 0;',
      '  width: 100vw;',
      '  height: 100vh;',
      '  display: block;',
      '  z-index: 1;',
      '  outline: none;',
      '}',
      '.so2-logout-header {',
      '  position: absolute;',
      '  top: 14px;',
      '  left: 16px;',
      '  right: 16px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 12px;',
      '  z-index: 20;',
      '  pointer-events: none;',
      '}',
      '.so2-logout-brand {',
      '  background: rgba(15, 23, 42, 0.88);',
      '  backdrop-filter: blur(12px);',
      '  -webkit-backdrop-filter: blur(12px);',
      '  border: 1px solid rgba(56, 189, 248, 0.35);',
      '  border-radius: 18px;',
      '  padding: 10px 16px;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 12px;',
      '  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);',
      '  pointer-events: auto;',
      '}',
      '.so2-logout-brand-icon {',
      '  width: 38px;',
      '  height: 38px;',
      '  border-radius: 12px;',
      '  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: 1.3rem;',
      '  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);',
      '}',
      '.so2-logout-brand-title {',
      '  font-size: 1.05rem;',
      '  font-weight: 800;',
      '  color: #fff;',
      '  letter-spacing: 0.3px;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '}',
      '.so2-logout-brand-title span.cyan { color: #38bdf8; }',
      '.so2-logout-brand-badge {',
      '  font-size: 0.68rem;',
      '  padding: 2px 8px;',
      '  border-radius: 999px;',
      '  background: rgba(16, 185, 129, 0.2);',
      '  color: #34d399;',
      '  border: 1px solid rgba(16, 185, 129, 0.35);',
      '  font-family: monospace;',
      '}',
      '.so2-logout-brand-sub {',
      '  font-size: 0.72rem;',
      '  color: #94a3b8;',
      '  margin-top: 2px;',
      '}',
      '.so2-logout-cam-dock {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  pointer-events: auto;',
      '}',
      '.so2-btn-pill {',
      '  background: rgba(15, 23, 42, 0.88);',
      '  backdrop-filter: blur(10px);',
      '  border: 1px solid rgba(56, 189, 248, 0.25);',
      '  color: #e2e8f0;',
      '  font-size: 0.76rem;',
      '  font-weight: 700;',
      '  padding: 8px 12px;',
      '  border-radius: 12px;',
      '  cursor: pointer;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);',
      '  transition: all 0.15s ease;',
      '}',
      '.so2-btn-pill:hover {',
      '  background: rgba(30, 41, 59, 0.95);',
      '  border-color: #38bdf8;',
      '  color: #38bdf8;',
      '  transform: translateY(-1px);',
      '}',
      '.so2-btn-pill.active {',
      '  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);',
      '  color: #fff;',
      '  border-color: #38bdf8;',
      '}',
      '.so2-btn-lamp.active { color: #f59e0b; border-color: rgba(245, 158, 11, 0.4); }',
      '.so2-logout-narrative-hud {',
      '  position: absolute;',
      '  top: 76px;',
      '  left: 20px;',
      '  max-width: 520px;',
      '  width: calc(100% - 40px);',
      '  z-index: 20;',
      '  pointer-events: none;',
      '}',
      '.so2-pills-row {',
      '  background: rgba(15, 23, 42, 0.88);',
      '  backdrop-filter: blur(10px);',
      '  border: 1px solid rgba(56, 189, 248, 0.25);',
      '  border-radius: 16px;',
      '  padding: 6px;',
      '  display: flex;',
      '  gap: 4px;',
      '  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);',
      '  pointer-events: auto;',
      '}',
      '.so2-phase-item {',
      '  flex: 1;',
      '  text-align: center;',
      '  padding: 6px 4px;',
      '  border-radius: 10px;',
      '  font-size: 0.68rem;',
      '  font-weight: 700;',
      '  color: #94a3b8;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  border: 1px solid transparent;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '}',
      '.so2-phase-item.active {',
      '  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);',
      '  color: #ffffff;',
      '  border-color: rgba(56, 189, 248, 0.5);',
      '  box-shadow: 0 0 14px rgba(56, 189, 248, 0.4);',
      '}',
      '.so2-story-caption-box {',
      '  margin-top: 8px;',
      '  padding: 6px 12px;',
      '  border-radius: 12px;',
      '  background: rgba(15, 23, 42, 0.75);',
      '  border: 1px solid rgba(56, 189, 248, 0.15);',
      '  font-size: 0.75rem;',
      '  color: #7dd3fc;',
      '  line-height: 1.4;',
      '  backdrop-filter: blur(8px);',
      '  box-shadow: 0 4px 14px rgba(0,0,0,0.4);',
      '}',
      '.so2-bottom-dock {',
      '  position: absolute;',
      '  bottom: 18px;',
      '  left: 20px;',
      '  z-index: 20;',
      '  background: rgba(15, 23, 42, 0.88);',
      '  backdrop-filter: blur(12px);',
      '  border: 1px solid rgba(56, 189, 248, 0.3);',
      '  border-radius: 18px;',
      '  padding: 8px 14px;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 12px;',
      '  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);',
      '}',
      '.so2-btn-play {',
      '  width: 36px;',
      '  height: 36px;',
      '  border-radius: 10px;',
      '  background: #0284c7;',
      '  color: #fff;',
      '  border: none;',
      '  font-size: 1rem;',
      '  font-weight: 800;',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  transition: transform 0.1s;',
      '}',
      '.so2-btn-play:active { transform: scale(0.92); }',
      '.so2-btn-pulse {',
      '  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);',
      '  color: #fff;',
      '  border: none;',
      '  padding: 7px 12px;',
      '  border-radius: 10px;',
      '  font-size: 0.74rem;',
      '  font-weight: 800;',
      '  cursor: pointer;',
      '  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);',
      '  transition: transform 0.1s;',
      '}',
      '.so2-btn-pulse:active { transform: scale(0.92); }',
      '/* LOGIN MODAL (RIGHT DOCKED ON DESKTOP, RESPONSIVE) */',
      '.so2-login-card-dock {',
      '  position: absolute;',
      '  top: 76px;',
      '  right: 20px;',
      '  width: 410px;',
      '  max-height: calc(100vh - 96px);',
      '  background: linear-gradient(145deg, rgba(30, 30, 56, 0.94) 0%, rgba(13, 12, 29, 0.97) 100%);',
      '  backdrop-filter: blur(16px);',
      '  -webkit-backdrop-filter: blur(16px);',
      '  border: 1.5px solid rgba(56, 189, 248, 0.35);',
      '  border-radius: 22px;',
      '  padding: 22px 20px;',
      '  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 25px rgba(56, 189, 248, 0.15);',
      '  z-index: 30;',
      '  display: flex;',
      '  flex-direction: column;',
      '  overflow-y: auto;',
      '  -webkit-overflow-scrolling: touch;',
      '  overscroll-behavior: contain;',
      '  box-sizing: border-box;',
      '  animation: so2CardSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);',
      '}',
      '@keyframes so2CardSlideIn {',
      '  from { transform: translateX(20px); opacity: 0; }',
      '  to { transform: translateX(0); opacity: 1; }',
      '}',
      '.so2-login-card-dock.minimized {',
      '  display: none !important;',
      '}',
      '.so2-login-header {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  margin-bottom: 12px;',
      '}',
      '.so2-login-title {',
      '  font-size: 1.15rem;',
      '  font-weight: 800;',
      '  color: #fff;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '}',
      '.so2-login-sub {',
      '  font-size: 0.74rem;',
      '  color: #94a3b8;',
      '  margin-bottom: 12px;',
      '  line-height: 1.4;',
      '}',
      '.so2-guest-hero-btn {',
      '  width: 100%;',
      '  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);',
      '  color: #ffffff;',
      '  border: none;',
      '  border-radius: 14px;',
      '  padding: 12px 14px;',
      '  font-size: 0.92rem;',
      '  font-weight: 800;',
      '  cursor: pointer;',
      '  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  gap: 2px;',
      '  margin-bottom: 14px;',
      '  transition: transform 0.15s, box-shadow 0.15s;',
      '}',
      '.so2-guest-hero-btn:hover {',
      '  transform: translateY(-1px);',
      '  box-shadow: 0 12px 28px rgba(16, 185, 129, 0.45);',
      '}',
      '.so2-guest-hero-btn span.sub {',
      '  font-size: 0.68rem;',
      '  font-weight: 600;',
      '  opacity: 0.9;',
      '}',
      '.so2-login-tabs {',
      '  display: flex;',
      '  gap: 6px;',
      '  background: rgba(15, 23, 42, 0.85);',
      '  border-radius: 12px;',
      '  padding: 4px;',
      '  margin-bottom: 12px;',
      '  border: 1px solid rgba(56, 189, 248, 0.2);',
      '}',
      '.so2-login-tab {',
      '  flex: 1;',
      '  padding: 7px;',
      '  text-align: center;',
      '  background: transparent;',
      '  border: none;',
      '  border-radius: 8px;',
      '  font-size: 0.78rem;',
      '  font-weight: 700;',
      '  color: #94a3b8;',
      '  cursor: pointer;',
      '  transition: all 0.15s;',
      '}',
      '.so2-login-tab.active {',
      '  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);',
      '  color: #fff;',
      '  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);',
      '}',
      '.so2-input-group {',
      '  margin-bottom: 10px;',
      '  position: relative;',
      '}',
      '.so2-input {',
      '  width: 100%;',
      '  background: rgba(15, 23, 42, 0.85);',
      '  border: 1.5px solid rgba(56, 189, 248, 0.25);',
      '  border-radius: 12px;',
      '  padding: 10px 12px;',
      '  color: #f8fafc;',
      '  font-size: 0.82rem;',
      '  box-sizing: border-box;',
      '  outline: none;',
      '  transition: border-color 0.15s, box-shadow 0.15s;',
      '}',
      '.so2-input:focus {',
      '  border-color: #38bdf8;',
      '  box-shadow: 0 0 10px rgba(56, 189, 248, 0.35);',
      '}',
      '.so2-btn-eye {',
      '  position: absolute;',
      '  right: 10px;',
      '  top: 50%;',
      '  transform: translateY(-50%);',
      '  background: none;',
      '  border: none;',
      '  color: #94a3b8;',
      '  cursor: pointer;',
      '  font-size: 1rem;',
      '  padding: 4px;',
      '}',
      '.so2-btn-submit {',
      '  width: 100%;',
      '  background: linear-gradient(135deg, #0284c7 0%, #10b981 100%);',
      '  color: #fff;',
      '  border: none;',
      '  border-radius: 12px;',
      '  padding: 11px;',
      '  font-size: 0.88rem;',
      '  font-weight: 800;',
      '  cursor: pointer;',
      '  margin-top: 4px;',
      '  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.35);',
      '  transition: transform 0.15s;',
      '}',
      '.so2-btn-submit:hover { transform: translateY(-1px); }',
      '.so2-social-strip {',
      '  display: flex;',
      '  gap: 8px;',
      '  margin-top: 10px;',
      '}',
      '.so2-btn-soc {',
      '  flex: 1;',
      '  background: rgba(15, 23, 42, 0.85);',
      '  border: 1px solid rgba(56, 189, 248, 0.25);',
      '  color: #fff;',
      '  border-radius: 10px;',
      '  padding: 8px 6px;',
      '  font-size: 0.74rem;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 4px;',
      '  transition: all 0.15s;',
      '}',
      '.so2-btn-soc:hover { border-color: #38bdf8; transform: translateY(-1px); }',
      '.so2-btn-soc.google { border-color: rgba(66, 133, 244, 0.4); }',
      '.so2-btn-soc.whatsapp { border-color: rgba(37, 211, 102, 0.4); color: #25d366; }',
      '.so2-status-alert {',
      '  padding: 8px 10px;',
      '  border-radius: 10px;',
      '  font-size: 0.74rem;',
      '  margin-bottom: 10px;',
      '  display: none;',
      '  line-height: 1.4;',
      '}',
      '.so2-status-alert.error { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; display: block; }',
      '.so2-status-alert.success { background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #6ee7b7; display: block; }',
      '@media (max-width: 1023px) {',
      '  .so2-logout-header { flex-wrap: wrap; }',
      '  .so2-logout-narrative-hud { top: 120px; left: 10px; width: calc(100% - 20px); }',
      '  .so2-login-card-dock {',
      '    top: 50%;',
      '    left: 50%;',
      '    right: auto;',
      '    transform: translate(-50%, -50%);',
      '    width: min(420px, calc(100vw - 24px));',
      '    max-height: calc(100dvh - 32px);',
      '  }',
      '  .so2-bottom-dock { bottom: 10px; left: 10px; padding: 6px 10px; font-size: 0.75rem; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // Load Three.js module and OrbitControls
  async function loadThree() {
    if (window.THREE && window.THREE.OrbitControls) {
      return { THREE: window.THREE, OrbitControls: window.THREE.OrbitControls };
    }
    var threeMod;
    try {
      threeMod = await import('https://unpkg.com/three@0.160.0/build/three.module.js');
    } catch (e) {
      threeMod = await import('./node_modules/three/build/three.module.js');
    }
    var controlsMod;
    try {
      controlsMod = await import('https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js');
    } catch (e2) {
      controlsMod = await import('./node_modules/three/examples/jsm/controls/OrbitControls.js');
    }
    return { THREE: threeMod, OrbitControls: controlsMod.OrbitControls };
  }

  function SearchO2LogoutCinematic() {
    this.root = null;
    this.renderer = null;
    this.animFrameId = null;
    this.isDestroyed = false;
    this.state = {
      isPlaying: true,
      timeScale: 1.0,
      loopDuration: 10.0,
      currentLoopTime: 0,
      lampOn: true,
      authTab: 'signin'
    };
  }

  SearchO2LogoutCinematic.prototype.open = async function () {
    if (this.root) {
      this.root.style.display = 'block';
      return;
    }

    ensureStyles();

    var root = document.createElement('div');
    root.id = 'so2LogoutRoot';
    this.root = root;

    // Structure HTML
    root.innerHTML = [
      '<div id="so2LogoutCanvasContainer" style="position:absolute;inset:0;"></div>',
      '<canvas id="so2LogoutCanvas"></canvas>',
      // Top bar
      '<header class="so2-logout-header">',
      '  <div class="so2-logout-brand">',
      '    <div class="so2-logout-brand-icon">🌱</div>',
      '    <div>',
      '      <div class="so2-logout-brand-title">',
      '        Search<span class="cyan">O₂</span> : Power Nap Alert',
      '        <span class="so2-logout-brand-badge">Isometric 3D</span>',
      '      </div>',
      '      <div class="so2-logout-brand-sub">Atmospheric biostation enters standby mode while active lifeforms stimulate system reactivation.</div>',
      '    </div>',
      '  </div>',
      '  <div class="so2-logout-cam-dock">',
      '    <button type="button" class="so2-btn-pill active" id="btnCamIso"><span>📐</span> Isometric</button>',
      '    <button type="button" class="so2-btn-pill" id="btnCamDesk"><span>👀</span> Desk View</button>',
      '    <button type="button" class="so2-btn-pill" id="btnCamFocus"><span>🔍</span> Focus View</button>',
      '    <button type="button" class="so2-btn-pill so2-btn-lamp active" id="btnLampToggle"><span>💡</span> Lamp</button>',
      '    <button type="button" class="so2-btn-pill" id="btnToggleLoginCard" style="background:#0284c7;color:#fff;"><span>🔑</span> Sign In</button>',
      '    <button type="button" class="so2-btn-pill" id="btnCloseCinematic" style="background:#1e293b;" title="Explore Farm as Guest"><span>✕</span> Close</button>',
      '  </div>',
      '</header>',
      // Narrative Hud
      '<div class="so2-logout-narrative-hud">',
      '  <div class="so2-pills-row">',
      '    <div class="so2-phase-item active" id="so2Phase0">' + PHASES[0].title + '</div>',
      '    <div class="so2-phase-item" id="so2Phase1">' + PHASES[1].title + '</div>',
      '    <div class="so2-phase-item" id="so2Phase2">' + PHASES[2].title + '</div>',
      '    <div class="so2-phase-item" id="so2Phase3">' + PHASES[3].title + '</div>',
      '  </div>',
      '  <div class="so2-story-caption-box" id="so2StoryCaption">' + PHASES[0].text + '</div>',
      '</div>',
      // Bottom Dock
      '<div class="so2-bottom-dock">',
      '  <button type="button" class="so2-btn-play" id="btnPlayPause" title="Play / Pause">⏸️</button>',
      '  <div style="display:flex;align-items:center;gap:6px;">',
      '    <span style="font-size:0.7rem;color:#94a3b8;font-family:monospace;">Speed</span>',
      '    <input type="range" id="sliderSpeed" min="0.3" max="2.0" step="0.1" value="1.0" style="width:70px;cursor:pointer;accent-color:#38bdf8;">',
      '    <span id="labelSpeed" style="font-size:0.7rem;color:#38bdf8;font-family:monospace;width:28px;">1.0x</span>',
      '  </div>',
      '  <div style="display:flex;align-items:center;gap:6px;border-left:1px solid #334155;padding-left:10px;">',
      '    <span style="font-size:0.7rem;color:#94a3b8;font-family:monospace;">Loop</span>',
      '    <input type="range" id="sliderTimeline" min="0" max="1" step="0.002" value="0" style="width:90px;cursor:pointer;accent-color:#10b981;">',
      '  </div>',
      '  <button type="button" class="so2-btn-pulse" id="btnPulseTrigger"><span>⚡</span> Trigger Pulse</button>',
      '  <div style="font-size:0.68rem;color:#64748b;margin-left:4px;" class="hidden-mobile">🖱️ Drag to Orbit • Scroll to Zoom</div>',
      '</div>',
      // Login Card Docked on Right
      '<div class="so2-login-card-dock" id="so2LoginCardDock">',
      '  <div class="so2-login-header">',
      '    <div class="so2-login-title">🌱 SearchO₂ Biome Access</div>',
      '    <button type="button" id="btnHideLoginCard" style="background:none;border:none;color:#64748b;font-size:1.1rem;cursor:pointer;" title="Hide form to inspect 3D scene">✕</button>',
      '  </div>',
      '  <div class="so2-login-sub">Atmospheric biostation session suspended. Reconnect credentials to synchronize planetary biomes or continue as a guest explorer:</div>',
      '  <button type="button" class="so2-guest-hero-btn" id="btnCinematicContinueGuest">',
      '    <span>🌿 Continue as Guest Explorer ➔</span>',
      '    <span class="sub">Jump directly to the German Biome Farm · No signup needed</span>',
      '  </button>',
      '  <div class="so2-login-tabs">',
      '    <button type="button" class="so2-login-tab active" data-tab="signin">Sign In</button>',
      '    <button type="button" class="so2-login-tab" data-tab="register">Create Account</button>',
      '  </div>',
      '  <div id="so2AuthAlert" class="so2-status-alert"></div>',
      '  <div id="so2GroupDisplay" class="so2-input-group" style="display:none;">',
      '    <input type="text" id="so2InputDisplay" class="so2-input" placeholder="Display Name (e.g. EcoFarmer77)" autocomplete="name">',
      '  </div>',
      '  <div class="so2-input-group">',
      '    <input type="text" id="so2InputIdentifier" class="so2-input" placeholder="Email, WhatsApp Phone, or Username" autocomplete="username">',
      '  </div>',
      '  <div class="so2-input-group">',
      '    <input type="password" id="so2InputPassword" class="so2-input" placeholder="Password (min 6 chars)" autocomplete="current-password" style="padding-right:38px;">',
      '    <button type="button" class="so2-btn-eye" id="btnEyeToggle">👁️</button>',
      '  </div>',
      '  <div id="so2GroupConfirmPw" class="so2-input-group" style="display:none;">',
      '    <input type="password" id="so2InputConfirmPw" class="so2-input" placeholder="Confirm Password" autocomplete="new-password">',
      '  </div>',
      '  <label style="display:flex;align-items:center;gap:6px;font-size:0.72rem;color:#94a3b8;margin:4px 0 10px;cursor:pointer;">',
      '    <input type="checkbox" id="so2CheckSavePw" checked style="accent-color:#10b981;cursor:pointer;">',
      '    <span>💾 Save password and auto-restore farm session</span>',
      '  </label>',
      '  <button type="button" class="so2-btn-submit" id="btnCinematicSubmit">Sign In to Station</button>',
      '  <div class="so2-social-strip">',
      '    <button type="button" class="so2-btn-soc google" id="btnCinematicGoogle">🔍 Google</button>',
      '    <button type="button" class="so2-btn-soc whatsapp" id="btnCinematicWhatsApp">💬 WhatsApp</button>',
      '    <button type="button" class="so2-btn-soc github" id="btnCinematicGithub">🐙 GitHub</button>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(root);

    // Initialize 3D Engine & Animation
    try {
      var libs = await loadThree();
      if (!this.isDestroyed) {
        this._initThree(libs.THREE, libs.OrbitControls);
      }
    } catch (err) {
      console.error('Failed to initialize Three.js for cinematic logout:', err);
    }

    this._bindEvents();
  };

  SearchO2LogoutCinematic.prototype.close = function () {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.isDestroyed = true;
    if (this.root) {
      this.root.remove();
      this.root = null;
    }
    if (this.renderer) {
      try { this.renderer.dispose(); } catch (e) {}
      this.renderer = null;
    }
  };

  SearchO2LogoutCinematic.prototype._initThree = function (THREE, OrbitControls) {
    var self = this;
    var canvas = document.getElementById('so2LogoutCanvas');
    if (!canvas) return;

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131326);
    scene.fog = new THREE.FogExp2(0x131326, 0.035);

    var aspect = window.innerWidth / window.innerHeight;
    var viewSize = 4.8;
    var camera = new THREE.OrthographicCamera(
      -viewSize * aspect, viewSize * aspect,
      viewSize, -viewSize,
      -30, 100
    );

    // Camera preset isometric positioned so cat and mouse are centered in left 65% of screen
    camera.position.set(11, 10, 11);
    camera.lookAt(-0.35, 1.15, 0.15);

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    this.renderer = renderer;

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(-0.35, 1.15, 0.15);
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minZoom = 0.55;
    controls.maxZoom = 2.4;
    this.controls = controls;
    this.camera = camera;

    // Lighting
    var ambientLight = new THREE.AmbientLight(0x7682a8, 0.95);
    scene.add(ambientLight);

    var sunLight = new THREE.DirectionalLight(0xfff1dc, 1.6);
    sunLight.position.set(12, 20, 9);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.bias = -0.0006;
    scene.add(sunLight);

    var rimLight = new THREE.DirectionalLight(0x4a77b8, 0.85);
    rimLight.position.set(-10, 12, -10);
    scene.add(rimLight);

    var deskLampLight = new THREE.PointLight(0xff9944, 2.8, 4.5, 1.8);
    deskLampLight.position.set(-1.1, 2.3, -0.4);
    deskLampLight.castShadow = true;
    deskLampLight.shadow.bias = -0.001;
    deskLampLight.shadow.mapSize.set(512, 512);
    scene.add(deskLampLight);
    this.deskLampLight = deskLampLight;

    var monitorGlow = new THREE.PointLight(0x38bdf8, 1.5, 3.2, 2);
    monitorGlow.position.set(-0.2, 1.9, -0.7);
    scene.add(monitorGlow);

    var mouseSpotlight = new THREE.SpotLight(0xffeedd, 2.2, 4.0, Math.PI / 5, 0.4, 1.5);
    mouseSpotlight.position.set(1.0, 3.0, 0.5);
    scene.add(mouseSpotlight);

    // Materials Palette
    var M = {
      roomFloor: new THREE.MeshStandardMaterial({ color: 0x824b2b, roughness: 0.55 }),
      roomBase: new THREE.MeshStandardMaterial({ color: 0x222034, roughness: 0.8 }),
      wallPastel: new THREE.MeshStandardMaterial({ color: 0x4a5472, roughness: 0.7 }),
      rug: new THREE.MeshStandardMaterial({ color: 0x3d7078, roughness: 0.9 }),
      woodDesk: new THREE.MeshStandardMaterial({ color: 0x935b36, roughness: 0.45 }),
      deskLegs: new THREE.MeshStandardMaterial({ color: 0x261e19, roughness: 0.6 }),
      chairFabric: new THREE.MeshStandardMaterial({ color: 0xa84838, roughness: 0.6 }),
      chairPlastic: new THREE.MeshStandardMaterial({ color: 0x23272e, roughness: 0.35 }),
      catFurMain: new THREE.MeshStandardMaterial({ color: 0xd97736, roughness: 0.65 }),
      catFurCream: new THREE.MeshStandardMaterial({ color: 0xffe6cb, roughness: 0.7 }),
      catSweater: new THREE.MeshStandardMaterial({ color: 0x29606d, roughness: 0.8 }),
      catNose: new THREE.MeshStandardMaterial({ color: 0xee7f8a, roughness: 0.4 }),
      glassesFrame: new THREE.MeshStandardMaterial({ color: 0x09090d, roughness: 0.2, metalness: 0.2 }),
      glassesLens: new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.1, transmission: 0.8 }),
      catEyeGold: new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
      catPupil: new THREE.MeshBasicMaterial({ color: 0x050508 }),
      mouseFur: new THREE.MeshStandardMaterial({ color: 0xf5cf96, roughness: 0.5 }),
      mouseBelly: new THREE.MeshStandardMaterial({ color: 0xfff3e0, roughness: 0.6 }),
      mousePink: new THREE.MeshStandardMaterial({ color: 0xff708f, roughness: 0.4, emissive: 0x44111f, emissiveIntensity: 0.2 }),
      mouseEye: new THREE.MeshBasicMaterial({ color: 0x111111 }),
      mouseWhiskers: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      questCard: new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x10b981, emissiveIntensity: 0.6 }),
      compCase: new THREE.MeshStandardMaterial({ color: 0xdfe3e6, roughness: 0.4 }),
      compStand: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.3 }),
      lampBrass: new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3, metalness: 0.6 }),
      lampShade: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 }),
      mugCeramic: new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3 }),
      coffeeLiquid: new THREE.MeshStandardMaterial({ color: 0x2c1d11, roughness: 0.2 })
    };

    // Diorama Slab & Walls
    var dioramaGroup = new THREE.Group();
    scene.add(dioramaGroup);
    this.dioramaGroup = dioramaGroup;

    var slabSize = 5.6;
    var slabHeight = 0.5;
    var baseMesh = new THREE.Mesh(new THREE.BoxGeometry(slabSize, slabHeight, slabSize), M.roomBase);
    baseMesh.position.y = -slabHeight / 2;
    baseMesh.receiveShadow = true;
    dioramaGroup.add(baseMesh);

    var floorMesh = new THREE.Mesh(new THREE.BoxGeometry(slabSize - 0.05, 0.02, slabSize - 0.05), M.roomFloor);
    floorMesh.position.y = 0.01;
    floorMesh.receiveShadow = true;
    dioramaGroup.add(floorMesh);

    var rugMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.02, 32), M.rug);
    rugMesh.position.set(0.1, 0.02, 0.4);
    rugMesh.receiveShadow = true;
    dioramaGroup.add(rugMesh);

    var wallHeight = 3.6;
    var wallThick = 0.25;
    var wallL = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, slabSize), M.wallPastel);
    wallL.position.set(-slabSize / 2 + wallThick / 2, wallHeight / 2, 0);
    wallL.receiveShadow = true;
    dioramaGroup.add(wallL);

    var wallR = new THREE.Mesh(new THREE.BoxGeometry(slabSize, wallHeight, wallThick), M.wallPastel);
    wallR.position.set(0, wallHeight / 2, -slabSize / 2 + wallThick / 2);
    wallR.receiveShadow = true;
    dioramaGroup.add(wallR);

    // SearchO2 Poster
    var posterGeo = new THREE.BoxGeometry(1.2, 1.6, 0.04);
    var posterCanvas = document.createElement('canvas');
    posterCanvas.width = 256;
    posterCanvas.height = 340;
    var pctx = posterCanvas.getContext('2d');
    pctx.fillStyle = '#0f172a';
    pctx.fillRect(0, 0, 256, 340);
    pctx.fillStyle = '#10b981';
    pctx.beginPath();
    pctx.arc(128, 140, 60, 0, Math.PI * 2);
    pctx.fill();
    pctx.fillStyle = '#ffffff';
    pctx.font = 'bold 30px sans-serif';
    pctx.textAlign = 'center';
    pctx.fillText('SearchO₂', 128, 240);
    pctx.fillStyle = '#38bdf8';
    pctx.font = '16px sans-serif';
    pctx.fillText('Clean Green World', 128, 270);
    var posterTex = new THREE.CanvasTexture(posterCanvas);
    var posterMesh = new THREE.Mesh(posterGeo, new THREE.MeshBasicMaterial({ map: posterTex }));
    posterMesh.position.set(0.6, 2.3, -slabSize / 2 + wallThick + 0.02);
    dioramaGroup.add(posterMesh);

    // Bookshelf
    var shelf = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 1.8), M.woodDesk);
    shelf.position.set(-slabSize / 2 + wallThick + 0.15, 2.6, 0.1);
    shelf.castShadow = true;
    dioramaGroup.add(shelf);

    var bookColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6];
    bookColors.forEach(function (col, i) {
      var bMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35 + (i % 3) * 0.06, 0.1), new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 }));
      bMesh.position.set(-slabSize / 2 + wallThick + 0.15, 2.6 + 0.04 + 0.2, -0.6 + i * 0.14);
      bMesh.castShadow = true;
      dioramaGroup.add(bMesh);
    });

    // Office Desk
    var deskGroup = new THREE.Group();
    deskGroup.position.set(0, 0, -0.3);
    dioramaGroup.add(deskGroup);

    var deskTop = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.12, 1.6), M.woodDesk);
    deskTop.position.set(0, 1.35, 0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    deskGroup.add(deskTop);

    var sideLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.35, 1.4), M.deskLegs);
    sideLeft.position.set(-1.38, 1.35 / 2, 0);
    sideLeft.castShadow = true;
    var sideRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.35, 1.4), M.deskLegs);
    sideRight.position.set(1.38, 1.35 / 2, 0);
    sideRight.castShadow = true;
    deskGroup.add(sideLeft, sideRight);

    var drawerBlock = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 1.3), M.woodDesk);
    drawerBlock.position.set(0.95, 0.9 / 2 + 0.45, 0);
    drawerBlock.castShadow = true;
    deskGroup.add(drawerBlock);

    var deskMat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.015, 0.95), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 }));
    deskMat.position.set(-0.1, 1.415, 0.1);
    deskMat.receiveShadow = true;
    deskGroup.add(deskMat);

    // Mug & Coffee
    var mug = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.18, 16), M.mugCeramic);
    mug.position.set(1.1, 1.5, 0.35);
    mug.castShadow = true;
    var coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), M.coffeeLiquid);
    coffee.position.set(1.1, 1.58, 0.35);
    deskGroup.add(mug, coffee);

    // Lamp
    var lampGroup = new THREE.Group();
    lampGroup.position.set(-1.15, 1.41, -0.4);
    var lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.04, 16), M.lampBrass);
    lampBase.castShadow = true;
    var lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.65, 8), M.lampBrass);
    lampStem.position.set(0, 0.34, 0);
    lampStem.castShadow = true;
    var lampHead = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.36, 16, 1, false, 0, Math.PI), M.lampShade);
    lampHead.rotation.z = Math.PI / 2;
    lampHead.rotation.y = Math.PI / 4;
    lampHead.position.set(0.12, 0.65, 0.1);
    lampHead.castShadow = true;
    lampGroup.add(lampBase, lampStem, lampHead);
    deskGroup.add(lampGroup);

    // Plant
    var pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.15, 12), M.compCase);
    pot.position.set(-1.1, 1.48, 0.3);
    var plantMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11), new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 }));
    plantMesh.position.set(-1.1, 1.6, 0.3);
    deskGroup.add(pot, plantMesh);

    // Office Chair
    var chairGroup = new THREE.Group();
    chairGroup.position.set(0.0, 0, 0.85);
    dioramaGroup.add(chairGroup);

    var chairSeat = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.16, 1.0), M.chairFabric);
    chairSeat.position.set(0, 0.82, 0);
    chairSeat.castShadow = true;
    chairGroup.add(chairSeat);

    var chairBack = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 0.18), M.chairFabric);
    chairBack.position.set(0, 1.4, 0.45);
    chairBack.rotation.x = 0.08;
    chairBack.castShadow = true;
    chairGroup.add(chairBack);

    var chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.65, 12), M.chairPlastic);
    chairStem.position.set(0, 0.4, 0);
    chairStem.castShadow = true;
    chairGroup.add(chairStem);

    for (var c = 0; c < 5; c++) {
      var legAngle = (c / 5) * Math.PI * 2;
      var cLeg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.48), M.chairPlastic);
      cLeg.position.set(Math.sin(legAngle) * 0.24, 0.1, Math.cos(legAngle) * 0.24);
      cLeg.rotation.y = legAngle;
      chairGroup.add(cLeg);
    }

    // Monitor with Running Canvas (Abstract Bio-Station Text)
    var monitorGroup = new THREE.Group();
    monitorGroup.position.set(-0.25, 1.41, -0.45);
    deskGroup.add(monitorGroup);

    var monitorStand = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.03, 16), M.compStand);
    var monitorPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 12), M.compStand);
    monitorPole.position.y = 0.2;
    var monitorBezel = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.95, 0.08), M.compCase);
    monitorBezel.position.set(0, 0.62, 0);
    monitorBezel.castShadow = true;
    monitorGroup.add(monitorStand, monitorPole, monitorBezel);

    var screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 320;
    var sctx = screenCanvas.getContext('2d');
    var screenTexture = new THREE.CanvasTexture(screenCanvas);
    var screenPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.85), new THREE.MeshBasicMaterial({ map: screenTexture }));
    screenPlane.position.set(0, 0.62, 0.042);
    monitorGroup.add(screenPlane);

    var keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.03, 0.3), M.compCase);
    keyboard.position.set(-0.25, 1.43, -0.05);
    keyboard.castShadow = true;
    deskGroup.add(keyboard);

    function updateScreenCanvas(time) {
      var grad = sctx.createLinearGradient(0, 0, 512, 320);
      grad.addColorStop(0, '#06283d');
      grad.addColorStop(1, '#1363df');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 512, 320);

      sctx.fillStyle = '#0f172a';
      sctx.fillRect(0, 0, 512, 48);

      sctx.fillStyle = '#22c55e';
      sctx.beginPath();
      sctx.arc(36, 24, 14, 0, Math.PI * 2);
      sctx.fill();

      sctx.fillStyle = '#ffffff';
      sctx.font = 'bold 22px Inter, sans-serif';
      sctx.textAlign = 'left';
      sctx.fillText('SearchO₂ Live Station', 62, 31);

      sctx.fillStyle = 'rgba(255,255,255,0.12)';
      sctx.fillRect(24, 64, 464, 168);

      var pulse = (Math.sin(time * 4) + 1) * 0.5;
      sctx.fillStyle = '#38bdf8';
      sctx.font = '15px Inter, sans-serif';
      sctx.fillText('⚡ Oxygen Grid Status: 42% (Standby)', 42, 98);

      sctx.fillStyle = '#0f172a';
      sctx.fillRect(42, 110, 420, 16);
      sctx.fillStyle = '#10b981';
      sctx.fillRect(44, 112, 220 + pulse * 70, 12);

      var btnGlow = Math.sin(time * 6) * 4;
      sctx.fillStyle = '#f59e0b';
      sctx.fillRect(100 - btnGlow / 2, 145 - btnGlow / 2, 312 + btnGlow, 52 + btnGlow);

      sctx.fillStyle = '#ffffff';
      sctx.font = 'bold 20px Inter, sans-serif';
      sctx.textAlign = 'center';
      sctx.fillText('⚡ ENTER CREDENTIALS / LOGIN NOW!', 256, 178);

      sctx.fillStyle = '#cbd5e1';
      sctx.font = '13px Inter, sans-serif';
      sctx.fillText('Active Quest: Planetary Bio-Network • Awaiting Custodian Login...', 256, 275);

      screenTexture.needsUpdate = true;
    }

    // THE CAT (FACING DESK TOWARDS -Z)
    var catRoot = new THREE.Group();
    catRoot.position.set(0.0, 0.85, 0.7);
    dioramaGroup.add(catRoot);

    var catTorso = new THREE.Group();
    catTorso.position.set(0, 0.35, 0);
    catRoot.add(catTorso);

    var sweaterBody = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.85, 20), M.catSweater);
    sweaterBody.castShadow = true;
    sweaterBody.scale.set(1.1, 1, 0.95);
    catTorso.add(sweaterBody);

    var bellyPatch = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), M.catFurCream);
    bellyPatch.position.set(0, -0.05, -0.42);
    bellyPatch.scale.set(1, 1.2, 0.3);
    catTorso.add(bellyPatch);

    var catTail = new THREE.Group();
    catTail.position.set(0, -0.25, 0.42);
    for (var t = 0; t < 5; t++) {
      var seg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 10), (t === 4 ? M.catFurCream : M.catFurMain));
      seg.position.set(0, -t * 0.12, t * 0.08);
      seg.rotation.x = 0.4;
      catTail.add(seg);
    }
    catTorso.add(catTail);

    var leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.48, 0.28, -0.15);
    catTorso.add(leftArmGroup);

    var lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.52, 12), M.catSweater);
    lSleeve.position.set(-0.12, 0.08, -0.22);
    lSleeve.rotation.x = Math.PI / 3.2;
    lSleeve.rotation.z = 0.3;
    leftArmGroup.add(lSleeve);

    var lPaw = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), M.catFurCream);
    lPaw.position.set(-0.22, 0.25, -0.5);
    lPaw.scale.set(1.1, 0.7, 1.2);
    lPaw.castShadow = true;
    leftArmGroup.add(lPaw);

    // Right Arm (Extended on desk next to mouse)
    var rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.42, 0.28, -0.12);
    catTorso.add(rightArmGroup);

    var rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.44, 12), M.catSweater);
    rUpperArm.position.set(0.1, 0.06, -0.16);
    rUpperArm.rotation.x = Math.PI / 3.4;
    rUpperArm.rotation.z = -0.25;
    rUpperArm.castShadow = true;
    rightArmGroup.add(rUpperArm);

    var rForearmGroup = new THREE.Group();
    rForearmGroup.position.set(0.18, 0.23, -0.36);
    rightArmGroup.add(rForearmGroup);

    var rForearmSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.38, 12), M.catSweater);
    rForearmSleeve.position.set(0, 0, -0.14);
    rForearmSleeve.rotation.x = Math.PI / 2.3;
    rForearmGroup.add(rForearmSleeve);

    var rPaw = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), M.catFurCream);
    rPaw.position.set(0.02, 0.02, -0.35);
    rPaw.scale.set(1.2, 0.75, 1.3);
    rPaw.castShadow = true;
    rForearmGroup.add(rPaw);

    for (var p = -1; p <= 1; p++) {
      var toePad = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), M.catNose);
      toePad.position.set(0.02 + p * 0.07, 0.06, -0.4);
      rForearmGroup.add(toePad);
    }

    // Cat Head & Neck
    var catNeck = new THREE.Group();
    catNeck.position.set(0, 0.52, -0.05);
    catTorso.add(catNeck);

    var catHeadGroup = new THREE.Group();
    catNeck.add(catHeadGroup);

    var headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), M.catFurMain);
    headSphere.scale.set(1.15, 0.95, 1.05);
    headSphere.castShadow = true;
    catHeadGroup.add(headSphere);

    var lMuzzle = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), M.catFurCream);
    lMuzzle.position.set(-0.14, -0.15, -0.42);
    lMuzzle.scale.set(1.1, 0.85, 0.8);
    var rMuzzle = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), M.catFurCream);
    rMuzzle.position.set(0.14, -0.15, -0.42);
    rMuzzle.scale.set(1.1, 0.85, 0.8);
    catHeadGroup.add(lMuzzle, rMuzzle);

    var catNose = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.06, 4), M.catNose);
    catNose.position.set(0, -0.08, -0.54);
    catHeadGroup.add(catNose);

    var whiskerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-1, 1].forEach(function (side) {
      for (var w = -1; w <= 1; w++) {
        var whisker = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.004, 0.4), whiskerMat);
        whisker.position.set(side * 0.32, -0.14 + w * 0.04, -0.46);
        whisker.rotation.z = Math.PI / 2 + side * 0.15 + w * 0.2;
        whisker.rotation.y = -side * 0.25;
        catHeadGroup.add(whisker);
      }
    });

    var leftEar = new THREE.Group();
    leftEar.position.set(-0.35, 0.46, -0.05);
    leftEar.rotation.z = 0.28;
    leftEar.add(
      new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.46, 4), M.catFurMain),
      new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 4), M.catNose)
    );
    catHeadGroup.add(leftEar);

    var rightEar = new THREE.Group();
    rightEar.position.set(0.35, 0.46, -0.05);
    rightEar.rotation.z = -0.28;
    rightEar.add(
      new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.46, 4), M.catFurMain),
      new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 4), M.catNose)
    );
    catHeadGroup.add(rightEar);

    // Open & Closed Eyes
    var openEyesGroup = new THREE.Group();
    openEyesGroup.position.set(0, 0.04, -0.48);
    catHeadGroup.add(openEyesGroup);

    [-0.2, 0.2].forEach(function (posX) {
      var eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), M.catEyeGold);
      eyeBall.position.set(posX, 0, 0);
      eyeBall.scale.set(1.1, 0.95, 0.6);
      var pupil = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.18, 8), M.catPupil);
      pupil.position.set(posX, 0, -0.08);
      openEyesGroup.add(eyeBall, pupil);
    });

    var closedEyesGroup = new THREE.Group();
    closedEyesGroup.position.set(0, 0.04, -0.52);
    catHeadGroup.add(closedEyesGroup);

    [-0.2, 0.2].forEach(function (posX) {
      var sleepyArc = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.024, 8, 16, Math.PI), M.glassesFrame);
      sleepyArc.position.set(posX, 0.02, 0);
      closedEyesGroup.add(sleepyArc);
    });

    // Black-framed glasses
    var glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.05, -0.52);
    catHeadGroup.add(glassesGroup);

    var rimL = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.034, 10, 24), M.glassesFrame);
    rimL.position.set(-0.22, 0, 0);
    var rimR = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.034, 10, 24), M.glassesFrame);
    rimR.position.set(0.22, 0, 0);

    var lensL = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.015, 16), M.glassesLens);
    lensL.position.set(-0.22, 0, 0);
    lensL.rotation.x = Math.PI / 2;
    var lensR = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.015, 16), M.glassesLens);
    lensR.position.set(0.22, 0, 0);
    lensR.rotation.x = Math.PI / 2;

    var bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.03), M.glassesFrame);
    bridge.position.set(0, 0.05, 0);

    var templeL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.48), M.glassesFrame);
    templeL.position.set(-0.42, 0.04, 0.24);
    var templeR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.48), M.glassesFrame);
    templeR.position.set(0.42, 0.04, 0.24);

    glassesGroup.add(rimL, rimR, lensL, lensR, bridge, templeL, templeR);

    // THE PROVOKING CUTE MOUSE
    var mouseRoot = new THREE.Group();
    mouseRoot.position.set(0.68, 1.42, -0.25);
    mouseRoot.scale.set(1.45, 1.45, 1.45);
    dioramaGroup.add(mouseRoot);

    mouseSpotlight.target = mouseRoot;

    var mouseBody = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), M.mouseFur);
    mouseBody.position.set(0, 0.16, 0);
    mouseBody.scale.set(0.95, 1.25, 0.9);
    mouseBody.castShadow = true;
    mouseRoot.add(mouseBody);

    var mouseBellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 14), M.mouseBelly);
    mouseBellyMesh.position.set(-0.04, 0.15, 0.02);
    mouseBellyMesh.scale.set(0.7, 1.1, 0.5);
    mouseRoot.add(mouseBellyMesh);

    var mouseHead = new THREE.Group();
    mouseHead.position.set(0, 0.32, 0.04);
    mouseRoot.add(mouseHead);

    var mHeadMesh = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.22, 16), M.mouseFur);
    mHeadMesh.rotation.x = -Math.PI / 2.3;
    mHeadMesh.castShadow = true;
    mouseHead.add(mHeadMesh);

    var mNose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), M.mousePink);
    mNose.position.set(0, -0.02, 0.18);
    mouseHead.add(mNose);

    [-0.13, 0.13].forEach(function (x, i) {
      var earOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.025, 16), M.mouseFur);
      earOuter.position.set(x, 0.12, -0.02);
      earOuter.rotation.x = Math.PI / 4;
      earOuter.rotation.z = (i === 0 ? 0.3 : -0.3);
      var earInner = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 16), M.mousePink);
      earInner.position.set(x, 0.12, -0.01);
      earInner.rotation.copy(earOuter.rotation);
      mouseHead.add(earOuter, earInner);
    });

    [-0.075, 0.075].forEach(function (x) {
      var mEye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), M.mouseEye);
      mEye.position.set(x, 0.04, 0.11);
      var glint = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      glint.position.set(x + 0.01, 0.05, 0.135);
      mouseHead.add(mEye, glint);
    });

    [-1, 1].forEach(function (side) {
      for (var mw = -1; mw <= 1; mw++) {
        var mWhisk = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.002, 0.16), M.mouseWhiskers);
        mWhisk.position.set(side * 0.08, -0.03 + mw * 0.02, 0.15);
        mWhisk.rotation.z = Math.PI / 2 + side * 0.2 + mw * 0.15;
        mouseHead.add(mWhisk);
      }
    });

    // Left Tugging Arm
    var mArmL = new THREE.Group();
    mArmL.position.set(-0.1, 0.22, 0.05);
    mouseRoot.add(mArmL);

    var mArmLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.024, 0.22, 8), M.mouseFur);
    mArmLMesh.position.set(-0.06, 0.0, -0.04);
    mArmLMesh.rotation.z = Math.PI / 3;
    mArmLMesh.rotation.y = -Math.PI / 4;
    var mPawL = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), M.mousePink);
    mPawL.position.set(-0.14, -0.05, -0.08);
    mArmL.add(mArmLMesh, mPawL);

    // Right Arm with Quest Card
    var mArmR = new THREE.Group();
    mArmR.position.set(0.1, 0.22, 0.05);
    mouseRoot.add(mArmR);

    var mArmRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.024, 0.22, 8), M.mouseFur);
    mArmRMesh.position.set(0.06, 0.05, 0.06);
    mArmRMesh.rotation.z = -Math.PI / 4;
    mArmRMesh.rotation.x = -Math.PI / 4;
    mArmR.add(mArmRMesh);

    var questCard = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.13, 0.015), M.questCard);
    questCard.position.set(0.12, 0.16, 0.12);
    questCard.rotation.y = -0.4;
    mArmR.add(questCard);

    var mFootL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.12), M.mousePink);
    mFootL.position.set(-0.07, 0.018, 0.02);
    var mFootR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.12), M.mousePink);
    mFootR.position.set(0.07, 0.018, 0.02);
    mouseRoot.add(mFootL, mFootR);

    var mouseTailGroup = new THREE.Group();
    mouseTailGroup.position.set(0, 0.08, -0.1);
    for (var mt = 0; mt < 6; mt++) {
      var tailSeg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.09, 6), M.mousePink);
      tailSeg.position.set(0, mt * 0.055, -mt * 0.065);
      tailSeg.rotation.x = 0.5 + mt * 0.1;
      mouseTailGroup.add(tailSeg);
    }
    mouseRoot.add(mouseTailGroup);

    var alertBubble = new THREE.Group();
    alertBubble.position.set(0, 0.68, 0);
    var bubbleMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    var exclMark = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.11, 0.02), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    exclMark.position.set(0, 0.02, 0.13);
    var exclDot = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.02), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    exclDot.position.set(0, -0.07, 0.13);
    alertBubble.add(bubbleMesh, exclMark, exclDot);
    alertBubble.scale.set(0, 0, 0);
    mouseHead.add(alertBubble);

    // Zzz Particles
    var zGroup = new THREE.Group();
    dioramaGroup.add(zGroup);

    var zParticles = [];
    var zMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.85 });

    function createZMesh() {
      var zG = new THREE.Group();
      var top = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.02), zMat);
      top.position.y = 0.06;
      var diag = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.02), zMat);
      diag.rotation.z = -0.7;
      var bot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.02), zMat);
      bot.position.y = -0.06;
      zG.add(top, diag, bot);
      return zG;
    }

    for (var zi = 0; zi < 4; zi++) {
      var zMesh = createZMesh();
      zGroup.add(zMesh);
      zParticles.push({
        mesh: zMesh,
        phaseOffset: zi * 0.25,
        basePos: new THREE.Vector3(0.0, 1.85, 0.25)
      });
    }

    // Animation Update Logic
    function updateAnimation(t) {
      var activeIndex = 0;
      for (var pi = 0; pi < PHASES.length; pi++) {
        if (t >= PHASES[pi].start && t < PHASES[pi].end) {
          activeIndex = pi;
          break;
        }
      }

      for (var pIdx = 0; pIdx < 4; pIdx++) {
        var pill = document.getElementById('so2Phase' + pIdx);
        if (pill) {
          if (pIdx === activeIndex) pill.classList.add('active');
          else pill.classList.remove('active');
        }
      }
      var captionEl = document.getElementById('so2StoryCaption');
      if (captionEl) captionEl.innerText = PHASES[activeIndex].text;

      // Phase 1: Ecosystem Hibernation (0 -> 3.2s)
      if (t < 3.2) {
        var breathe = Math.sin(t * 3.0);
        catTorso.position.set(0, 0.35 + breathe * 0.02, 0);
        catTorso.rotation.set(-0.25 - breathe * 0.03, 0, 0);

        catHeadGroup.position.set(0, 0.58, -0.15);
        catHeadGroup.rotation.set(-0.35 - breathe * 0.04, -0.08, -0.05);
        glassesGroup.position.set(0, 0.03, -0.52);

        openEyesGroup.visible = false;
        closedEyesGroup.visible = true;

        rForearmGroup.position.set(0.18, 0.23, -0.36);
        rForearmGroup.rotation.set(0, 0, 0);
        rightArmGroup.rotation.set(0, 0, 0);

        mouseRoot.position.set(0.68, 1.42, -0.28 + Math.sin(t * 4) * 0.02);
        mouseRoot.rotation.y = -Math.PI / 2.2;
        mouseRoot.rotation.x = 0;
        mouseHead.rotation.set(0.1, 0, 0);
        alertBubble.scale.set(0, 0, 0);

        zGroup.visible = true;
        zParticles.forEach(function (zp) {
          var zt = (t * 0.6 + zp.phaseOffset) % 1.0;
          zp.mesh.position.set(
            zp.basePos.x + Math.sin(zt * 5 + zp.phaseOffset * 10) * 0.18,
            zp.basePos.y + zt * 0.7,
            zp.basePos.z - zt * 0.3
          );
          var sc = 0.5 + zt * 0.6;
          zp.mesh.scale.set(sc, sc, sc);
          zMat.opacity = Math.sin(zt * Math.PI) * 0.9;
        });
      }
      // Phase 2: Atmospheric Pulse Alert (3.2 -> 6.0s)
      else if (t < 6.0) {
        var pTime = t - 3.2;
        zGroup.visible = false;

        var knockFreq = 16.0;
        var knock = Math.sin(pTime * knockFreq);
        var tugPull = Math.max(0, knock);

        mouseRoot.position.set(
          0.66 + tugPull * 0.05,
          1.42 + Math.abs(Math.sin(pTime * 12)) * 0.08,
          -0.25 - tugPull * 0.04
        );
        mouseRoot.rotation.y = -Math.PI / 2.2;
        mouseRoot.rotation.x = 0.25 + tugPull * 0.2;

        mouseHead.rotation.y = -0.3 + Math.sin(pTime * 8) * 0.2;
        mArmL.rotation.set(0, 0, knock * 0.5);
        mArmR.rotation.set(Math.sin(pTime * 10) * 0.4, 0, -0.4);

        alertBubble.scale.set(1, 1, 1);
        alertBubble.rotation.z = Math.sin(pTime * 14) * 0.2;

        rForearmGroup.position.set(0.18 + tugPull * 0.06, 0.23, -0.36 + tugPull * 0.03);
        rForearmGroup.rotation.z = tugPull * 0.15;
        rightArmGroup.rotation.y = -tugPull * 0.1;

        leftEar.rotation.z = 0.28 + Math.sin(pTime * 14) * 0.15;
        rightEar.rotation.z = -0.28 - Math.sin(pTime * 12) * 0.15;

        catTorso.rotation.x = -0.25 + (pTime / 2.8) * 0.1;
        catHeadGroup.rotation.x = -0.35 + (pTime / 2.8) * 0.15;

        if (pTime > 2.4) {
          openEyesGroup.visible = true;
          closedEyesGroup.visible = false;
          openEyesGroup.scale.set(1, 0.35, 1);
        } else {
          openEyesGroup.visible = false;
          closedEyesGroup.visible = true;
        }
      }
      // Phase 3: Custodian Awareness (6.0 -> 8.2s)
      else if (t < 8.2) {
        var pTime3 = t - 6.0;
        zGroup.visible = false;

        var sitUp = Math.min(1, pTime3 * 1.6);
        catTorso.rotation.set(-0.15 + sitUp * 0.15, 0, 0);
        catTorso.position.y = 0.35 + sitUp * 0.04;

        catHeadGroup.position.set(0, 0.65 + sitUp * 0.06, -0.05);
        catHeadGroup.rotation.set(-0.12, 0.48, 0.05);

        glassesGroup.position.set(0, 0.05, -0.52);

        openEyesGroup.visible = true;
        closedEyesGroup.visible = false;
        openEyesGroup.scale.set(1.15, 1.1, 1.0);

        catNose.position.z = -0.54 - Math.sin(pTime3 * 6) * 0.01;

        alertBubble.scale.set(0, 0, 0);
        mouseRoot.position.set(0.68, 1.42, -0.25);
        mouseRoot.rotation.x = -0.15;
        mouseRoot.rotation.y = -Math.PI / 2.4;

        mArmR.rotation.set(-Math.PI / 2.5, 0, -0.5);
        mArmL.rotation.set(0.2, 0, 0.3);
        mouseHead.rotation.set(-0.25, 0.3, 0);
      }
      // Phase 4: Deep Regenerative Standby (8.2 -> 10.0s)
      else {
        var pTime4 = t - 8.2;

        if (pTime4 < 0.65) {
          var blinkProgress = pTime4 / 0.65;
          openEyesGroup.scale.set(1.1, Math.max(0.05, 1.0 - blinkProgress * 1.6), 1.0);
          openEyesGroup.visible = true;
          closedEyesGroup.visible = false;
          catHeadGroup.rotation.y = 0.48 - blinkProgress * 0.2;
        } else {
          openEyesGroup.visible = false;
          closedEyesGroup.visible = true;

          var slump = (pTime4 - 0.65) / 1.15;
          catTorso.rotation.set(-slump * 0.25, 0, 0);
          catTorso.position.y = 0.39 - slump * 0.04;

          catHeadGroup.position.set(0, 0.71 - slump * 0.13, -0.05 - slump * 0.1);
          catHeadGroup.rotation.set(-0.12 - slump * 0.23, 0.28 - slump * 0.36, -slump * 0.05);

          glassesGroup.position.set(0, 0.05 - slump * 0.02, -0.52);
        }

        rForearmGroup.position.set(0.18, 0.23, -0.36);
        rForearmGroup.rotation.set(0, 0, 0);
        rightArmGroup.rotation.set(0, 0, 0);

        mArmL.rotation.set(0.4, 0, 0.2);
        mArmR.rotation.set(0.4, 0, -0.2);
        mouseHead.rotation.set(0.3, 0, 0);
        mouseRoot.rotation.x = 0.1;

        if (pTime4 > 1.1) {
          zGroup.visible = true;
          var zProgress = (pTime4 - 1.1) / 0.7;
          zParticles[0].mesh.position.set(0.0, 1.85 + zProgress * 0.4, 0.25 - zProgress * 0.2);
          zMat.opacity = zProgress * 0.85;
        } else {
          zGroup.visible = false;
        }
      }

      catTail.rotation.y = Math.sin(t * 2.5) * 0.2;
      catTail.rotation.z = Math.cos(t * 2.0) * 0.12;
      mouseTailGroup.rotation.z = Math.sin(t * 12) * 0.25;
    }

    var clock = new THREE.Clock();

    function animate() {
      if (self.isDestroyed) return;
      self.animFrameId = requestAnimationFrame(animate);

      var delta = clock.getDelta();

      if (self.state.isPlaying) {
        self.state.currentLoopTime = (self.state.currentLoopTime + delta * self.state.timeScale) % self.state.loopDuration;
        var sliderTl = document.getElementById('sliderTimeline');
        if (sliderTl) sliderTl.value = self.state.currentLoopTime / self.state.loopDuration;
      }

      updateScreenCanvas(self.state.currentLoopTime);
      updateAnimation(self.state.currentLoopTime);

      dioramaGroup.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.02;

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    var onResize = function () {
      if (self.isDestroyed || !renderer) return;
      var w = window.innerWidth;
      var h = window.innerHeight;
      var asp = w / h;

      camera.left = -viewSize * asp;
      camera.right = viewSize * asp;
      camera.top = viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);
    this._onResize = onResize;
  };

  SearchO2LogoutCinematic.prototype._bindEvents = function () {
    var self = this;

    // Camera Presets
    var btnIso = document.getElementById('btnCamIso');
    var btnDesk = document.getElementById('btnCamDesk');
    var btnFocus = document.getElementById('btnCamFocus');

    function setActiveCamBtn(btn) {
      [btnIso, btnDesk, btnFocus].forEach(function (b) { if (b) b.classList.remove('active'); });
      if (btn) btn.classList.add('active');
    }

    if (btnIso) {
      btnIso.addEventListener('click', function () {
        setActiveCamBtn(btnIso);
        if (self.camera && self.controls) {
          self.camera.position.set(11, 10, 11);
          self.camera.zoom = 1.0;
          self.camera.updateProjectionMatrix();
          self.controls.target.set(-0.35, 1.15, 0.15);
        }
      });
    }

    if (btnDesk) {
      btnDesk.addEventListener('click', function () {
        setActiveCamBtn(btnDesk);
        if (self.camera && self.controls) {
          self.camera.position.set(2.0, 4.5, -9.5);
          self.camera.zoom = 1.25;
          self.camera.updateProjectionMatrix();
          self.controls.target.set(-0.1, 1.35, -0.2);
        }
      });
    }

    if (btnFocus) {
      btnFocus.addEventListener('click', function () {
        setActiveCamBtn(btnFocus);
        if (self.camera && self.controls) {
          self.camera.position.set(5.0, 4.0, 3.5);
          self.camera.zoom = 2.0;
          self.camera.updateProjectionMatrix();
          self.controls.target.set(0.45, 1.45, -0.25);
        }
      });
    }

    var btnLamp = document.getElementById('btnLampToggle');
    if (btnLamp) {
      btnLamp.addEventListener('click', function () {
        self.state.lampOn = !self.state.lampOn;
        if (self.deskLampLight) {
          self.deskLampLight.intensity = self.state.lampOn ? 2.8 : 0.0;
        }
        btnLamp.classList.toggle('active', self.state.lampOn);
      });
    }

    // Toggle Login Form visibility
    var btnToggleLogin = document.getElementById('btnToggleLoginCard');
    var btnHideLogin = document.getElementById('btnHideLoginCard');
    var loginCard = document.getElementById('so2LoginCardDock');

    if (btnToggleLogin && loginCard) {
      btnToggleLogin.addEventListener('click', function () {
        loginCard.classList.toggle('minimized');
      });
    }
    if (btnHideLogin && loginCard) {
      btnHideLogin.addEventListener('click', function () {
        loginCard.classList.add('minimized');
      });
    }

    // Close button
    var btnClose = document.getElementById('btnCloseCinematic');
    if (btnClose) {
      btnClose.addEventListener('click', function () {
        self.close();
        if (window.ApiClient && window.ApiClient.loginGuest) {
          window.ApiClient.loginGuest();
        }
      });
    }

    // Continue as guest button
    var btnGuest = document.getElementById('btnCinematicContinueGuest');
    if (btnGuest) {
      btnGuest.addEventListener('click', function () {
        self.close();
        if (window.ApiClient && window.ApiClient.loginGuest) {
          window.ApiClient.loginGuest();
        }
      });
    }

    // Play / Pause
    var btnPlay = document.getElementById('btnPlayPause');
    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        self.state.isPlaying = !self.state.isPlaying;
        btnPlay.innerText = self.state.isPlaying ? '⏸️' : '▶️';
      });
    }

    // Speed Slider
    var sliderSpeed = document.getElementById('sliderSpeed');
    var labelSpeed = document.getElementById('labelSpeed');
    if (sliderSpeed && labelSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        self.state.timeScale = parseFloat(e.target.value);
        labelSpeed.innerText = self.state.timeScale.toFixed(1) + 'x';
      });
    }

    // Loop Scrubber
    var sliderTimeline = document.getElementById('sliderTimeline');
    if (sliderTimeline) {
      sliderTimeline.addEventListener('input', function (e) {
        self.state.currentLoopTime = parseFloat(e.target.value) * self.state.loopDuration;
      });
    }

    // Phase Pills click to jump
    PHASES.forEach(function (p, idx) {
      var pill = document.getElementById('so2Phase' + idx);
      if (pill) {
        pill.addEventListener('click', function () {
          self.state.currentLoopTime = p.start + 0.05;
          if (sliderTimeline) sliderTimeline.value = self.state.currentLoopTime / self.state.loopDuration;
        });
      }
    });

    // Trigger Pulse button
    var btnPulse = document.getElementById('btnPulseTrigger');
    if (btnPulse) {
      btnPulse.addEventListener('click', function () {
        self.state.currentLoopTime = 3.3;
        if (sliderTimeline) sliderTimeline.value = 3.3 / self.state.loopDuration;
        if (!self.state.isPlaying) {
          self.state.isPlaying = true;
          if (btnPlay) btnPlay.innerText = '⏸️';
        }
      });
    }

    // Password visibility toggle
    var btnEye = document.getElementById('btnEyeToggle');
    var inputPw = document.getElementById('so2InputPassword');
    if (btnEye && inputPw) {
      btnEye.addEventListener('click', function () {
        var isText = inputPw.type === 'text';
        inputPw.type = isText ? 'password' : 'text';
        btnEye.innerText = isText ? '👁️' : '🔒';
      });
    }

    // Tabs: Sign In / Create Account
    var tabBtns = document.querySelectorAll('.so2-login-tab');
    var groupDisplay = document.getElementById('so2GroupDisplay');
    var groupConfirmPw = document.getElementById('so2GroupConfirmPw');
    var btnSubmit = document.getElementById('btnCinematicSubmit');
    var authAlert = document.getElementById('so2AuthAlert');

    tabBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        tabBtns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var isReg = b.getAttribute('data-tab') === 'register';
        self.state.authTab = isReg ? 'register' : 'signin';
        if (groupDisplay) groupDisplay.style.display = isReg ? 'block' : 'none';
        if (groupConfirmPw) groupConfirmPw.style.display = isReg ? 'block' : 'none';
        if (btnSubmit) btnSubmit.innerText = isReg ? 'Create Custodian Account & Save' : 'Sign In to Station';
        if (authAlert) { authAlert.className = 'so2-status-alert'; authAlert.innerText = ''; }
      });
    });

    function showAlert(msg, isError) {
      if (!authAlert) return;
      authAlert.className = 'so2-status-alert ' + (isError ? 'error' : 'success');
      authAlert.innerText = msg;
    }

    // Submit authentication
    if (btnSubmit) {
      btnSubmit.addEventListener('click', async function () {
        var isReg = self.state.authTab === 'register';
        var identifier = (document.getElementById('so2InputIdentifier').value || '').trim();
        var password = (document.getElementById('so2InputPassword').value || '').trim();
        var displayName = (document.getElementById('so2InputDisplay').value || '').trim();
        var confirmPw = (document.getElementById('so2InputConfirmPw').value || '').trim();
        var savePw = document.getElementById('so2CheckSavePw') ? document.getElementById('so2CheckSavePw').checked : true;

        if (!identifier) return showAlert('Please enter your email, phone, or username.', true);
        if (!password || password.length < 6) return showAlert('Password must be at least 6 characters.', true);

        if (isReg) {
          if (!displayName) return showAlert('Please choose a display name.', true);
          if (password !== confirmPw) return showAlert('Passwords do not match.', true);
        }

        btnSubmit.disabled = true;
        btnSubmit.innerText = isReg ? 'Creating account...' : 'Signing in...';

        try {
          if (!window.ApiClient) throw new Error('SearchO2 API Client unavailable');

          if (isReg) {
            await window.ApiClient.register(identifier, password, displayName, 'fresh', '', savePw);
          } else {
            await window.ApiClient.login(identifier, password, savePw);
          }
          showAlert('✓ Authentication successful! Loading biomes...', false);
          setTimeout(function () {
            self.close();
          }, 400);
        } catch (err) {
          showAlert(err.message || 'Authentication error occurred.', true);
          btnSubmit.disabled = false;
          btnSubmit.innerText = isReg ? 'Create Custodian Account & Save' : 'Sign In to Station';
        }
      });
    }

    // Social buttons
    var btnGoogle = document.getElementById('btnCinematicGoogle');
    if (btnGoogle) {
      btnGoogle.addEventListener('click', function () {
        if (window.ApiClient && window.ApiClient.loginGoogle) {
          self.close();
          window.ApiClient.loginGoogle();
        }
      });
    }

    var btnWhatsApp = document.getElementById('btnCinematicWhatsApp');
    if (btnWhatsApp) {
      btnWhatsApp.addEventListener('click', function () {
        if (window.SearchO2AuthSocial && window.SearchO2AuthSocial.showWhatsAppModal) {
          self.close();
          window.SearchO2AuthSocial.showWhatsAppModal();
        } else if (window.ApiClient && window.ApiClient.loginWhatsApp) {
          self.close();
          window.ApiClient.loginWhatsApp();
        }
      });
    }

    var btnGithub = document.getElementById('btnCinematicGithub');
    if (btnGithub) {
      btnGithub.addEventListener('click', function () {
        if (window.ApiClient && window.ApiClient.loginGithub) {
          self.close();
          window.ApiClient.loginGithub();
        }
      });
    }
  };

  // Global Singleton
  window.SearchO2LogoutCinematic = {
    open: function (options) {
      if (!instance) {
        instance = new SearchO2LogoutCinematic();
      }
      return instance.open(options);
    },
    close: function () {
      if (instance) {
        instance.close();
        instance = null;
      }
    },
    isOpen: function () {
      return !!(instance && instance.root);
    }
  };

})(window, document);
