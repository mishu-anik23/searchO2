import fs from 'fs';
import path from 'path';
import vm from 'vm';
import assert from 'assert';

console.log('========================================================================');
console.log('🧪 SEARCHO2 LIVING ASSISTANT & PAID FARM MANAGER NODE VERIFICATION');
console.log('========================================================================\n');

// 1. Verify Byte Parity
console.log('▶ Test 1: Byte Parity Between Root and Public Files');
const filesToVerify = [
  'home-avatar-tour.js',
  'home-avatar-tour.css',
  'kids-sustainability-academy.js',
  'shakir-guide-tour.js'
];
for (const file of filesToVerify) {
  const rootBuf = fs.readFileSync(file);
  const pubBuf = fs.readFileSync(path.join('public', file));
  assert(rootBuf.equals(pubBuf), `File ${file} must be byte-identical to public/${file}`);
  console.log(`  ✅ ${file} <===> public/${file} (100% Byte Parity)`);
}

// 2. Setup Mock DOM Environment
const elements = new Map();
class MockElement {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = '';
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c, val) => {
        if (val === undefined) val = !this.classList.contains(c);
        if (val) this.classList.add(c);
        else this.classList.remove(c);
        return val;
      }
    };
    this.attributes = new Map();
    this.children = [];
    this.parentNode = null;
    this._innerHTML = '';
    this.style = {};
    this.disabled = false;
    this.checked = false;
    this.onclick = null;
    this.onchange = null;
    if (id) elements.set(id, this);
  }

  setAttribute(k, v) { this.attributes.set(k, String(v)); }
  getAttribute(k) { return this.attributes.get(k) || null; }
  removeAttribute(k) { this.attributes.delete(k); }
  addEventListener() {}
  removeEventListener() {}
  getBoundingClientRect() { return { left: 0, top: 0, width: 320, height: 320 }; }
  getContext() {
    const dummyCtx = {
      measureText: () => ({ width: 50 }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} })
    };
    return new Proxy(dummyCtx, {
      get(target, prop) {
        if (prop in target) return target[prop];
        return () => {};
      }
    });
  }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(val) {
    this._innerHTML = val;
    // Auto-detect and register elements with id in mock
    const idMatches = val.match(/id="([^"]+)"/g) || [];
    idMatches.forEach(m => {
      const id = m.replace('id="', '').replace('"', '');
      if (!elements.has(id)) {
        elements.set(id, new MockElement('div', id));
      }
    });
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  insertBefore(newNode, refNode) {
    newNode.parentNode = this;
    const idx = this.children.indexOf(refNode);
    if (idx >= 0) this.children.splice(idx, 0, newNode);
    else this.children.push(newNode);
    return newNode;
  }

  querySelectorAll(selector) {
    const res = [];
    const searchString = this._innerHTML || '';
    if (selector === '.s2-avatar-card') {
      const matches = searchString.match(/class="[^"]*s2-avatar-card[^"]*"/g) || [];
      matches.forEach((_, idx) => {
        const el = new MockElement('button');
        el.className = 's2-avatar-card';
        res.push(el);
      });
    } else if (selector === '[data-avatar]') {
      const regex = /data-avatar="([^"]+)"/g;
      let m;
      while ((m = regex.exec(searchString)) !== null) {
        const el = new MockElement('button');
        el.setAttribute('data-avatar', m[1]);
        res.push(el);
      }
    } else if (selector === '[data-mtab]') {
      const regex = /data-mtab="([^"]+)"/g;
      let m;
      while ((m = regex.exec(searchString)) !== null) {
        const el = new MockElement('button');
        el.setAttribute('data-mtab', m[1]);
        res.push(el);
      }
    } else if (selector === '[data-directive]') {
      const regex = /data-directive="([^"]+)"/g;
      let m;
      while ((m = regex.exec(searchString)) !== null) {
        const el = new MockElement('button');
        el.setAttribute('data-directive', m[1]);
        res.push(el);
      }
    }
    return res;
  }

  querySelector(selector) {
    const list = this.querySelectorAll(selector);
    return list.length > 0 ? list[0] : null;
  }
}

const mockStorage = new Map();
const localStorageMock = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

const windowMock = {
  location: { search: '', href: '' },
  localStorage: localStorageMock,
  addEventListener: () => {},
  removeEventListener: () => {},
  document: {
    readyState: 'complete',
    head: new MockElement('head', 'head'),
    body: new MockElement('body', 'body'),
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: (tag) => new MockElement(tag),
    getElementById: (id) => elements.get(id) || null,
    querySelector: (sel) => {
      if (sel.startsWith('#')) return elements.get(sel.slice(1)) || null;
      return null;
    },
    querySelectorAll: (sel) => []
  },
  innerWidth: 1200,
  innerHeight: 800,
  matchMedia: () => ({ matches: false }),
  speechSynthesis: {
    cancel: () => {},
    getVoices: () => [],
    addEventListener: () => {},
    speak: (u) => { windowMock._lastSpeech = u.text; }
  },
  SpeechSynthesisUtterance: function(text) {
    this.text = text;
    this.pitch = 1.0;
    this.rate = 1.0;
  },
  requestAnimationFrame: (cb) => setTimeout(cb, 10),
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};
windowMock.window = windowMock;
windowMock.global = windowMock;
windowMock.globalThis = windowMock;

// Contextual state for farm
const mockState = {
  plots: [
    { id: 0, status: 'growing', health: 40, waterHours: 1, weedHours: 3 },
    { id: 1, status: 'overgrown', health: 60, waterHours: 0, weedHours: 5 }
  ],
  cattle: { fed: false, hunger: 80, health: 60 },
  balance: 500,
  totalO2: 120,
  seedlings: 5,
  exploredChapters: {}
};
windowMock.state = mockState;
windowMock.apiUser = {
  id: 'usr_priya_test',
  displayName: 'Priya Farmer',
  role: 'registered',
  isGuest: false
};

const context = vm.createContext(windowMock);

// Load Kids Sustainability Academy first
console.log('\n▶ Test 2: Loading Kids Sustainability Academy and Checking Voice/SVG exports');
const kidsAcademyCode = fs.readFileSync('kids-sustainability-academy.js', 'utf8');
vm.runInContext(kidsAcademyCode, context);
assert(context.KidsSustainabilityAcademy, 'KidsSustainabilityAcademy must be loaded');
const puffSvg = context.KidsSustainabilityAcademy.getWhiskerPuffSvg(100, 125);
const pipSvg = context.KidsSustainabilityAcademy.getPipSvg(85, 110);
assert(puffSvg.includes('whisker-puff-svg'), 'Professor Puff SVG must be valid');
assert(pipSvg.includes('pip-mouse-svg'), 'Pip SVG must be valid');
console.log('  ✅ KidsSustainabilityAcademy SVG renderers valid');

// Load Home Avatar Tour
console.log('\n▶ Test 3: Loading Home Avatar Tour and Initializing Station');
const homeTourCode = fs.readFileSync('home-avatar-tour.js', 'utf8');
vm.runInContext(homeTourCode, context);
assert(context.SearchO2HomeAvatar, 'SearchO2HomeAvatar must be exported globally');

// Check Roster
const roster = context.SearchO2HomeAvatar.AVATAR_ROSTER;
assert.strictEqual(roster.length, 12, 'Must have 12 avatars');
const priya = roster.find(a => a.id === 'av_priya_woman');
assert(priya, 'Priya must exist in roster');
assert.strictEqual(priya.name, 'Priya');
assert.strictEqual(priya.dailyWage, 35);
assert.strictEqual(priya.managerTitle, 'Senior Agronomy Director & Living Estate Manager');
console.log('  ✅ 12 Diverse Avatars present in roster. Priya correctly configured: €35/day');

// Test 4: Open Station Overlay in Logged-In Mode
console.log('\n▶ Test 4: Open Living Assistant / Manager Station in Logged-in Mode');
context.SearchO2HomeAvatar.showHomeOverlay(true);
const overlayEl = context.document.getElementById('s2HomeOverlay');
assert(overlayEl, '#s2HomeOverlay must be created in document');
const managerHost = context.document.getElementById('s2ManagerHost');
assert(managerHost, '#s2ManagerHost must exist');
console.log('  ✅ #s2HomeOverlay and #s2ManagerHost rendered without crashing');

// Test 5: Verify Locked State initially (before Eco-Passport)
console.log('\n▶ Test 5: Eco-Passport Locked Modal with Whisker Puff & Pip SVGs');
assert.strictEqual(context.SearchO2HomeAvatar.isEcoPassportUnlocked(), false, 'Must be locked before Eco-Passport');
assert(managerHost.innerHTML.includes('s2-manager-locked-card'), 'Must render s2-manager-locked-card when locked');
assert(managerHost.innerHTML.includes('whisker-puff-svg'), 'Must render Professor Whisker Puff SVG');
assert(managerHost.innerHTML.includes('pip-mouse-svg'), 'Must render Pip Squeak-a-Link SVG');
assert(managerHost.innerHTML.includes('s2-btn-preview-unlock'), 'Must render Preview/Test Mode button');
console.log('  ✅ Locked modal rendered with interactive Puff & Pip animation stage');

// Test 6: Priya Selection
console.log('\n▶ Test 6: Selecting Priya as Living Assistant & Paid Farm Manager');
context.SearchO2HomeAvatar.setActiveManager(priya);
const activeMgr = context.SearchO2HomeAvatar.getActiveManager();
assert.strictEqual(activeMgr.id, 'av_priya_woman', 'Active manager must be Priya');
assert.strictEqual(activeMgr.name, 'Priya');
console.log('  ✅ Priya successfully hired as active living assistant');

// Test 7: Unlock Manager Dashboard via Preview Mode
console.log('\n▶ Test 7: Unlocking Dashboard via Preview/Test Mode');
context.SearchO2HomeAvatar.previewUnlockManager(true);
assert.strictEqual(context.SearchO2HomeAvatar.isEcoPassportUnlocked(), true, 'Must report unlocked in preview mode');
assert(managerHost.innerHTML.includes('s2-manager-dashboard'), 'Must render s2-manager-dashboard');
assert(managerHost.innerHTML.includes('Priya'), 'Must display active manager Priya');
assert(managerHost.innerHTML.includes('€35 / day'), 'Must display €35/day daily wage');
console.log('  ✅ Manager dashboard unlocked and displaying Priya hero card');

// Test 8: Semi-Automation Sweep
console.log('\n▶ Test 8: Executing Semi-Automation Sweep (Pruning, Watering, Feeding, Labor)');
context.SearchO2HomeAvatar.executeSemiAutomationSweep(true);
assert(mockState.plots[0].health >= 55, 'Thirsty plot must be rehydrated');
assert(mockState.plots[0].waterHours >= 3, 'Plot waterHours restored to >= 3');
assert.strictEqual(mockState.plots[1].weedHours, 0, 'Weeds pruned');
assert.strictEqual(mockState.cattle.fed, true, 'Cattle must be fed');
assert(mockState.totalO2 > 120, 'O2 must increase from pruning');

const tasks = context.SearchO2HomeAvatar.getManagerTasks();
assert(tasks.length >= 4, 'Must have recorded automated tasks in taskboard');
console.log('  ✅ Semi-automation sweep executed: plots hydrated, weeds pruned, cattle fed, O2 increased');
console.log('  ✅ Taskboard logged actions:', tasks.slice(0, 4).map(t => t.text).join(' | '));

// Test 9: Executive Directives
console.log('\n▶ Test 9: Executing Administrative Directives');
const initialBalance = mockState.balance;
context.SearchO2HomeAvatar.forwardDirective('outside_selling');
assert.strictEqual(mockState.balance, initialBalance + 350, 'Outside selling must add +€350');

context.SearchO2HomeAvatar.forwardDirective('wholesale');
assert.strictEqual(mockState.balance, initialBalance + 350 + 600, 'Wholesale must add +€600');

const o2Before = mockState.totalO2;
context.SearchO2HomeAvatar.forwardDirective('energy_trade');
assert.strictEqual(mockState.balance, initialBalance + 350 + 600 + 200, 'Energy trade must add +€200');
assert.strictEqual(mockState.totalO2, o2Before + 15, 'Energy trade must add +15 O2');

const seedlingsBefore = mockState.seedlings;
context.SearchO2HomeAvatar.forwardDirective('procurement');
assert.strictEqual(mockState.seedlings, seedlingsBefore + 10, 'Procurement must add +10 Heirloom saplings');

console.log('  ✅ Outside selling directive: +€350.00 cash');
console.log('  ✅ Wholesale contract directive: +€600.00 cash');
console.log('  ✅ Clean energy microgrid trade directive: +€200.00 cash & +15 O₂');
console.log('  ✅ Heirloom seedling procurement directive: +10 saplings');

// Test 10: Eco Academy Icon CSS Sizing Check
console.log('\n▶ Test 10: Eco Academy Icon CSS Sizing Verification');
const cssContent = fs.readFileSync('kids-sustainability-academy.js', 'utf8');
assert(cssContent.includes('.instruction-point-icon-btn') && cssContent.includes('width: 36px;') && cssContent.includes('height: 36px;'), 'Desktop icon must be 36px');
assert(cssContent.includes('width: 32px; height: 32px;'), 'Mobile icon must be 32px');
console.log('  ✅ Eco Academy floating icon size reduced to 36px (desktop) / 32px (mobile)');

console.log('\n========================================================================');
console.log('🎉 ALL 10 TESTS PASSED WITH 100% SUCCESS!');
console.log('========================================================================');
process.exit(0);
