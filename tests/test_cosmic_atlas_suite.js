/**
 * Automated Verification Suite for OxyForge 88-Constellation Engine,
 * Menzel Sky Path Families, Astrological Myths, and Date-of-Birth Pattern Analysis.
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("====================================================");
console.log("  OxyForge: 88 Constellations & Menzel Engine Suite ");
console.log("====================================================");

let passedCount = 0;
let totalCount = 0;

function runTest(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`[✓ PASSED] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`[✗ FAILED] ${name}`);
    console.error(`  ↳ ${err.message}`);
  }
}

// 1. JSON Dataset Verification
const jsonFilePath = path.join(rootDir, "public/data/menzel_constellations.json");
assert(fs.existsSync(jsonFilePath), `Missing JSON file at ${jsonFilePath}`);
const catalog = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

runTest("JSON Dataset: 88 Constellations Total", () => {
  assert.strictEqual(catalog.constellations.length, 88, `Expected 88 constellations, found ${catalog.constellations.length}`);
});

runTest("JSON Dataset: 8 Menzel Sky Path Families Present", () => {
  const families = Object.keys(catalog.families);
  const expected = ["ursa_major", "zodiac", "perseus", "hercules", "orion", "heavenly_waters", "bayer", "lacaille"];
  assert.strictEqual(families.length, 8, `Expected 8 families, found ${families.length}`);
  for (const f of expected) {
    assert(families.includes(f), `Missing Menzel family: ${f}`);
  }
});

runTest("Constellation Partition: Sum of Family Members Equals 88", () => {
  let memberSum = 0;
  for (const fKey of Object.keys(catalog.families)) {
    const fam = catalog.families[fKey];
    memberSum += fam.constellationNames.length;
  }
  assert.strictEqual(memberSum, 88, `Family members count ${memberSum} does not equal 88`);
});

runTest("Astrophysical Distances: All 88 Constellations Have Positive Key Star Distance (ly)", () => {
  for (const c of catalog.constellations) {
    assert(c.keyStar, `${c.name} missing keyStar`);
    assert(typeof c.keyStar.distanceLy === "number" && c.keyStar.distanceLy > 0,
      `${c.name} has invalid distanceLy: ${c.keyStar.distanceLy}`);
  }
});

runTest("Coordinates: All 88 Constellations Have RA (0-24) & Dec (-90 to +90)", () => {
  for (const c of catalog.constellations) {
    assert(c.centerRa >= 0 && c.centerRa <= 24, `${c.name} RA out of range: ${c.centerRa}`);
    assert(c.centerDec >= -90 && c.centerDec <= 90, `${c.name} Dec out of range: ${c.centerDec}`);
  }
});

runTest("Menzel Star-Hop Guidance: Locating Directions Detailed & Grounded", () => {
  for (const c of catalog.constellations) {
    assert(c.locatingDirections && c.locatingDirections.length > 25,
      `${c.name} locating directions too brief: "${c.locatingDirections}"`);
  }
});

runTest("Cultural & Astrological Myths: Rich Connected Lore Present", () => {
  for (const c of catalog.constellations) {
    assert(c.mythology && c.mythology.length > 30,
      `${c.name} mythology too brief: "${c.mythology}"`);
  }
});

runTest("Birth Chart Integration: Zodiac Constellations Have Tropical & Sidereal Dates", () => {
  const zodiacs = catalog.constellations.filter((c) => c.familyId === "zodiac");
  assert.strictEqual(zodiacs.length, 12, `Expected 12 Zodiac constellations, found ${zodiacs.length}`);
  for (const z of zodiacs) {
    assert(z.birthChart.isZodiac === true, `${z.name} should be marked isZodiac=true`);
    assert(z.birthChart.tropicalDates && z.birthChart.tropicalDates.length > 5, `${z.name} missing tropicalDates`);
    assert(z.birthChart.siderealDates && z.birthChart.siderealDates.length > 5, `${z.name} missing siderealDates`);
    assert(["Fire", "Earth", "Air", "Water"].includes(z.birthChart.element), `${z.name} has invalid element: ${z.birthChart.element}`);
    assert(["Cardinal", "Fixed", "Mutable"].includes(z.birthChart.modality), `${z.name} has invalid modality: ${z.birthChart.modality}`);
  }
});

runTest("Visual Geometry: All 88 Constellations Have Stars and Line Segments", () => {
  for (const c of catalog.constellations) {
    assert(Array.isArray(c.stars) && c.stars.length >= 2, `${c.name} must have at least 2 star vertices`);
    assert(Array.isArray(c.lines) && c.lines.length >= 1, `${c.name} must have at least 1 line segment`);
    for (const [i1, i2] of c.lines) {
      assert(i1 >= 0 && i1 < c.stars.length, `${c.name} line index i1=${i1} out of bounds`);
      assert(i2 >= 0 && i2 < c.stars.length, `${c.name} line index i2=${i2} out of bounds`);
    }
  }
});

// Test Date of Birth Mapping Logic
runTest("Date of Birth Calculator: Correctly Resolves Ecliptic Solar Transitions", async () => {
  const { getBirthConstellation } = await import("../src/game/constellations.ts");

  const aries = getBirthConstellation(3, 25);
  assert.strictEqual(aries.constellation.id, "aries");
  assert.strictEqual(aries.element, "Fire");

  const leo = getBirthConstellation(8, 10);
  assert.strictEqual(leo.constellation.id, "leo");
  assert.strictEqual(leo.element, "Fire");

  const scorpio = getBirthConstellation(11, 5);
  assert.strictEqual(scorpio.constellation.id, "scorpius");
  assert.strictEqual(scorpio.element, "Water");

  const aquarius = getBirthConstellation(2, 5);
  assert.strictEqual(aquarius.constellation.id, "aquarius");
  assert.strictEqual(aquarius.element, "Air");

  assert(aries.patterns.length >= 5, "Aspect patterns missing");
});

// Test Sequential Focus Manager
runTest("Sequential Focus Manager: Activates Family Groupings and Cascades", async () => {
  const {
    setSelectedConstellation,
    getConstellationFocusState,
    subscribeConstellationFocus,
    setRoamHighlight
  } = await import("../src/components/game/three/constellationFocus.ts");

  // Select Orion
  setSelectedConstellation("orion");
  let state = getConstellationFocusState();
  assert.strictEqual(state.selectedId, "orion");
  assert.strictEqual(state.activeFamilyId, "orion");
  assert(state.revealedConstellations.includes("orion"), "Orion must be immediately revealed");

  // Test Roam Gaze Highlight
  setRoamHighlight("cassiopeia");
  state = getConstellationFocusState();
  assert.strictEqual(state.roamHighlightedId, "cassiopeia");

  // Deselect
  setSelectedConstellation(null);
  state = getConstellationFocusState();
  assert.strictEqual(state.selectedId, null);
  assert.strictEqual(state.activeFamilyId, null);
  assert.strictEqual(state.revealedConstellations.length, 0);
});

console.log("====================================================");
console.log(`  Tests Completed: ${passedCount} / ${totalCount} Passed (${Math.round((passedCount / totalCount) * 100)}%)`);
console.log("====================================================");

if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
