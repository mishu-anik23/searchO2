import assert from "node:assert";
import { ZODIAC_SIGNS, signAtLambda } from "../src/game/astro-core/zodiacSigns";
import { julianDay, gmstDeg, lstDeg } from "../src/game/astro-core/time";
import { computeChart } from "../src/game/astro-core/chart";
import { runNullSanityCheck, runDemoRuleTest } from "../src/game/astro-core/predictionLab";
import { COMMANDERS, SUCCESS_SLIDES } from "../src/game/data";

console.log("================================================================");
console.log("  OxyForge Sky Lab: Tropical Zodiac & Prediction Engine Tests  ");
console.log("================================================================");

let passed = 0;
let total = 0;

function test(name: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`[✓ PASSED] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`[✗ FAILED] ${name}`);
    console.error(`  ↳ ${err.message}`);
  }
}

// 1. Tropical Zodiac Sectors Check
test("Tropical 12x30° sectors: Exact boundaries & continuity", () => {
  assert.strictEqual(ZODIAC_SIGNS.length, 12, "Must have exactly 12 signs");
  for (let i = 0; i < 12; i++) {
    const s = ZODIAC_SIGNS[i];
    assert.strictEqual(s.index, i, `Sign index must match ${i}`);
    assert.strictEqual(s.startDeg, i * 30, `Sign ${s.name} start must be ${i * 30}°`);
    assert.strictEqual(s.endDeg, (i + 1) * 30, `Sign ${s.name} end must be ${(i + 1) * 30}°`);
    assert(s.geometryNote && s.geometryNote.length > 10, `Sign ${s.name} must have geometry note`);
    assert(s.symbolic && s.symbolic.keywords.length > 0, `Sign ${s.name} must have keywords`);
    assert(s.symbolic && s.symbolic.mythology.length > 10, `Sign ${s.name} must have mythology`);
  }
  // Sector mapping lookup
  assert.strictEqual(signAtLambda(0)?.name, "Aries");
  assert.strictEqual(signAtLambda(29.99)?.name, "Aries");
  assert.strictEqual(signAtLambda(30)?.name, "Taurus");
  assert.strictEqual(signAtLambda(359.99)?.name, "Pisces");
});

// 2. Astronomy Time Transforms
test("Time transforms: Julian Day, GMST & LST", () => {
  // J2000.0 epoch: 2000-01-01 12:00:00 UTC = JD 2451545.0
  const j2000 = new Date("2000-01-01T12:00:00Z");
  const jd = julianDay(j2000);
  assert(Math.abs(jd - 2451545.0) < 1e-4, `Expected JD 2451545.0, got ${jd}`);

  const gmst = gmstDeg(jd);
  assert(gmst >= 0 && gmst < 360, `GMST must be in [0, 360), got ${gmst}`);

  const lst = lstDeg(jd, 15); // 15° East = +1 hour
  assert(lst >= 0 && lst < 360, `LST must be in [0, 360), got ${lst}`);
});

// 3. On-Demand Chart Computation & LRU Caching
test("Chart Engine: On-demand evaluation with L1 LRU caching", () => {
  const utc = new Date("2024-03-20T03:06:00Z"); // Equinox
  const params = { utc, latDeg: 51.5, lonEastDeg: -0.1, houseSystem: "equal" as const };

  const startCold = performance.now();
  const c1 = computeChart(params);
  const coldMs = performance.now() - startCold;

  assert(c1.positions.length >= 10, "Must calculate Sun, Moon, and 8 planets");
  assert(c1.houseCusps.length === 12, "Must calculate 12 house cusps");
  assert(c1.ascendant >= 0 && c1.ascendant < 360, "Ascendant must be valid degree");
  assert(c1.midheaven >= 0 && c1.midheaven < 360, "Midheaven must be valid degree");
  assert(c1.precessionOffsetDeg > 20 && c1.precessionOffsetDeg < 30, "Precession offset ~24°");

  // Warm cache repeat query
  const startWarm = performance.now();
  const c2 = computeChart(params);
  const warmMs = performance.now() - startWarm;

  assert.strictEqual(c2.meta.cacheHit, true, "Second call with same params must be a cache hit");
  assert(warmMs < 5, `Warm cache latency should be < 5ms, was ${warmMs.toFixed(3)}ms`);
  assert.strictEqual(c1.ascendant, c2.ascendant, "Cached chart must have identical ascendant");
});

// 4. House Systems Support (Equal, Whole, Placidus)
test("House Systems: Equal, Whole-Sign, and Placidus", () => {
  const utc = new Date("2024-06-21T12:00:00Z");
  const cEqual = computeChart({ utc, latDeg: 40.7, lonEastDeg: -74.0, houseSystem: "equal" });
  const cWhole = computeChart({ utc, latDeg: 40.7, lonEastDeg: -74.0, houseSystem: "whole" });
  const cPlacidus = computeChart({ utc, latDeg: 40.7, lonEastDeg: -74.0, houseSystem: "placidus" });

  assert.strictEqual(cEqual.houseCusps.length, 12);
  assert.strictEqual(cWhole.houseCusps.length, 12);
  assert.strictEqual(cPlacidus.houseCusps.length, 12);

  // Equal house cusps are exactly 30° apart
  for (let i = 0; i < 11; i++) {
    const diff = (cEqual.houseCusps[i + 1] - cEqual.houseCusps[i] + 360) % 360;
    assert(Math.abs(diff - 30) < 1e-4, "Equal house cusps must be 30° apart");
  }
});

// 5. Prediction Lab: Blinded Null Hypothesis & Demo Rule
test("Prediction Lab: Honest null hypothesis & effect reporting", () => {
  const nullResult = runNullSanityCheck(240);
  assert.strictEqual(nullResult.n, 240, "Null check sample size must be 240");
  assert(nullResult.pValue >= 0 && nullResult.pValue <= 1, "P-value must be in [0, 1]");
  assert(Math.abs(nullResult.chanceRate - (1 / 12)) < 1e-4, "Chance rate must be 1/12 for 12 zodiac signs");
  assert(nullResult.interpretation.includes("Under random labeling, results stay near chance"), "Must report chance without spin");

  const demoResult = runDemoRuleTest(240);
  assert.strictEqual(demoResult.n, 240, "Demo rule sample size must be 240");
  assert(typeof demoResult.chiSquare === "number", "Chi-square must be numeric");
  assert(typeof demoResult.cohensH === "number", "Cohen's h must be numeric");
});

// 6. Game Data Integration
test("Game Data: Screen union, Commanders & Debrief Slides preserved", () => {
  assert(COMMANDERS.length >= 10, "COMMANDERS catalog preserved intact");
  assert(SUCCESS_SLIDES.length >= 4, "SUCCESS_SLIDES catalog preserved intact");
});

console.log("================================================================");
console.log(`  Tests Completed: ${passed} / ${total} Passed (${Math.round((passed / total) * 100)}%)`);
console.log("================================================================");

if (passed !== total) process.exit(1);
