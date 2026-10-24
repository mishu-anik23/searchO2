#!/usr/bin/env node
/**
 * scripts/build-hub-data.mjs
 *
 * Extracts the game's own content tables out of index.html and writes
 * hub/data/content.json (+ hub/data/content.js for file:// use), so the
 * Learning Hub always reflects what the game actually ships.
 *
 * Nothing from the game runs: each `var NAME = <literal>;` is brace-matched
 * (string/comment aware) and evaluated alone inside an empty vm context.
 *
 * Usage:  node scripts/build-hub-data.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = readFileSync(resolve(ROOT, 'index.html'), 'utf8');

/** Return the source text of the first `var|const|let NAME = <literal>` initialiser. */
function extractLiteral(name) {
  const re = new RegExp(`(?:^|\\n)\\s*(?:var|const|let)\\s+${name}\\s*=\\s*`, 'm');
  const m = re.exec(SRC);
  if (!m) throw new Error(`Cannot find "${name}" in index.html`);
  const start = m.index + m[0].length;
  const open = SRC[start];
  const close = open === '{' ? '}' : open === '[' ? ']' : null;
  if (!close) throw new Error(`"${name}" does not start with { or [`);

  let depth = 0;
  for (let i = start; i < SRC.length; i++) {
    const c = SRC[i];
    const n = SRC[i + 1];
    if (c === '/' && n === '/') { i = SRC.indexOf('\n', i); if (i < 0) break; continue; }
    if (c === '/' && n === '*') { i = SRC.indexOf('*/', i + 2) + 1; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const q = c;
      for (i++; i < SRC.length; i++) {
        if (SRC[i] === '\\') { i++; continue; }
        if (SRC[i] === q) break;
      }
      continue;
    }
    if (c === open) depth++;
    else if (c === close && --depth === 0) return SRC.slice(start, i + 1);
  }
  throw new Error(`Unbalanced literal for "${name}"`);
}

function evalLiteral(name) {
  const code = extractLiteral(name);
  // Empty context: only plain data (functions inside are created, never called).
  return vm.runInNewContext(`(${code})`, Object.create(null), { timeout: 2000 });
}

const plain = (v) => JSON.parse(JSON.stringify(v)); // drops functions, keeps data

/* ---------- Regional species ---------- */
const regionalTrees = {
  germany: evalLiteral('TREE_TYPES'),
  sweden: evalLiteral('NORDIC_TREE_TYPES'),
  brazil: evalLiteral('BRAZIL_TREE_TYPES'),
  spain: evalLiteral('SPAIN_TREE_TYPES'),
  saint_martin: evalLiteral('SAINT_MARTIN_TREE_TYPES'),
};
const treeLibrary = evalLiteral('TREE_LIBRARY');

const species = {};
for (const [region, defs] of Object.entries(regionalTrees)) {
  for (const [key, t] of Object.entries(defs)) {
    const lib = treeLibrary[key] || null;
    if (!species[key]) {
      species[key] = {
        key,
        label: t.label,
        sciName: t.sciName || null,
        category: t.category || 'Other',
        icon: t.icon || '🌱',
        cost: t.cost ?? null,
        canopy: t.canopy || null,
        trunk: t.trunk || null,
        shape: t.shape || 'round',
        dotColor: t.dotColor || null,
        fact: t.fact || null,
        stages: (t.stages || []).map((s) => s.n),
        o2AtStage: t.o2AtStage || [],
        regions: [],
        lib: lib && {
          firstFound: lib.firstFound,
          maxAgeYears: lib.maxAgeYears,
          fruitingTime: lib.fruitingTime,
          photosynthesis: lib.photosynthesis,
          disease: lib.disease,
          cure: lib.cure,
        },
      };
    }
    species[key].regions.push(region);
  }
}

/* ---------- Components (buildings, roads, crew) ---------- */
const buildings = Object.entries(evalLiteral('BUILDING_TYPES')).map(([key, b]) => ({
  key, label: b.label, icon: b.icon, cost: b.cost, buildHours: b.buildHours,
  category: b.category, reputationBonus: b.reputationBonus ?? null, desc: b.desc,
  requiresRoad: !!b.requiresRoad, requiresEngineer: !!b.requiresEngineer,
  upkeep: b.upkeep ?? null,
}));
const roads = Object.entries(evalLiteral('ROAD_SEGMENTS')).map(([key, r]) => ({
  key, label: r.label, icon: r.icon, cost: r.cost, buildHours: r.buildHours, desc: r.desc,
}));
const workers = Object.entries(evalLiteral('WORKER_TYPES')).map(([key, w]) => ({
  key, label: w.label, wage: w.wage, role: w.role, desc: w.desc,
}));

/* ---------- Chapters, levels ---------- */
const chapters = plain(evalLiteral('CHAPTER_DEFINITIONS')).map((c) => ({
  chapter: c.chapter, icon: c.icon, title: c.title, fantasy: c.fantasy,
  desc: c.desc, keySystems: c.keySystems || [], unlockReward: c.unlockReward || null,
}));
const levels = plain(evalLiteral('KNOWLEDGE_LEVELS'));

/* ---------- Achievements (ids + labels only; check() functions are dropped) ---------- */
const achievements = plain(evalLiteral('ACHIEVEMENTS')).map((a) => ({ id: a.id, label: a.label }));

/* ---------- Land dots: the same lat/lon boxes the in-game globe uses ---------- */
const landStart = SRC.indexOf('function initLandPoints');
if (landStart < 0) throw new Error('initLandPoints not found in index.html');
const landSrc = SRC.slice(landStart, landStart + 8000);
const num = '(-?\\d+(?:\\.\\d+)?)';
const boxRe = new RegExp(`addBox\\(\\s*${[num,num,num,num,num,num].join('\\s*,\\s*')}\\s*\\)`, 'g');
const landBoxes = [...landSrc.matchAll(boxRe)].map((m) => m.slice(1).map(Number));
if (landBoxes.length < 20) throw new Error(`Only found ${landBoxes.length} land boxes; index.html changed shape?`);

/* ---------- Concepts & "Why?" topics ---------- */
const theory = Object.values(plain(evalLiteral('ECOLOGICAL_THEORY_CONCEPTS')));
const why = Object.values(plain(evalLiteral('WHY_TOPICS')));

/* ---------- Biomes (global map) ---------- */
const biomes = plain(evalLiteral('REGIONAL_BIOMES')).map((b) => ({
  id: b.id, country: b.country, flag: b.flag, lat: b.lat, lon: b.lon,
  title: b.title, biomeType: b.biomeType, climate: b.climate, soilQuality: b.soilQuality,
  nativeSpecies: b.nativeSpecies, specialTrait: b.specialTrait,
  unlockO2: b.unlockO2 ?? 0, unlocked: !!b.unlocked, plotsCount: b.plotsCount,
}));

const out = {
  generatedAt: new Date().toISOString(),
  source: 'index.html',
  counts: {
    species: Object.keys(species).length,
    buildings: buildings.length, roads: roads.length, workers: workers.length,
    chapters: chapters.length, theory: theory.length, why: why.length, biomes: biomes.length,
    achievements: achievements.length, landBoxes: landBoxes.length,
  },
  biomes, landBoxes, chapters, levels, achievements,
  components: { buildings, roads, workers },
  species: Object.values(species),
  theory, why,
};

const dir = resolve(ROOT, 'hub/data');
mkdirSync(dir, { recursive: true });
const json = JSON.stringify(out);
writeFileSync(resolve(dir, 'content.json'), json);
// Script twin so hub/index.html also works when opened straight from disk (file://).
writeFileSync(resolve(dir, 'content.js'), `window.HUB_CONTENT=${json};\n`);

console.log('hub/data written:', out.counts);
