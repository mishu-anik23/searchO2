import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

console.log("====================================================");
console.log("  Menzel Family Reveal Engine: Test Suite (FR1-FR7) ");
console.log("====================================================");

// Load JSON data directly
const rawJson = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "public/data/menzel_constellations.json"), "utf8")
);

import { DEFAULT_FAMILY_CONFIG } from "../src/game/familyReveal/config";
import { FamilyGraph } from "../src/game/familyReveal/FamilyGraph";
import { HullBuilder } from "../src/game/familyReveal/HullBuilder";
import { FamilyRevealController } from "../src/game/familyReveal/FamilyRevealController";

// Test 1: Data Caveats Normalization
console.log("\n--- Test 1: Data Caveats Normalization ---");
const graph = new FamilyGraph(DEFAULT_FAMILY_CONFIG);
graph.initialize(rawJson.constellations, rawJson.families);

const hydrus = graph.nodes.get("hydrus");
assert(hydrus, "Hydrus node must exist");
assert.strictEqual(hydrus.familyId, "bayer", "Hydrus primary family must be bayer");
assert(hydrus.secondaryFamilies.includes("heavenly_waters"), "Hydrus secondaryFamilies must include heavenly_waters");
console.log("[✓ PASSED] Hydrus normalized to bayer with secondary heavenly_waters");

const triAustrale = graph.nodes.get("triangulum_australe");
assert(triAustrale, "Triangulum Australe node must exist");
assert.strictEqual(triAustrale.familyId, "hercules", "Triangulum Australe primary family must be hercules");
assert(triAustrale.secondaryFamilies.includes("bayer"), "Triangulum Australe secondaryFamilies must include bayer");
console.log("[✓ PASSED] Triangulum Australe normalized to hercules with secondary bayer");

const volans = graph.nodes.get("volans");
assert(volans, "Volans node must exist");
assert.strictEqual(volans.familyId, "bayer", "Volans primary family must be bayer");
assert(volans.secondaryFamilies.includes("lacaille"), "Volans secondaryFamilies must include lacaille");
console.log("[✓ PASSED] Volans normalized to bayer with secondary lacaille");

// Test 2: Primary Partitioning Total Equals Exactly 88
console.log("\n--- Test 2: Family Partitioning Check ---");
let totalCount = 0;
for (const [fId, fam] of graph.families.entries()) {
  totalCount += fam.memberIds.length;
}
assert.strictEqual(totalCount, 88, `Total partitioned members must equal 88, got ${totalCount}`);
console.log(`[✓ PASSED] All 8 Menzel families partition exactly 88 unique constellations (sum: ${totalCount})`);

// Test 3: FR5 Sequence Independence (Hard Requirement)
// Clicking constellations in 100 shuffled orders MUST yield byte-identical edge sets and hulls
console.log("\n--- Test 3: FR5 Sequence Independence (100 Random Shuffles) ---");
const herculesFamily = graph.families.get("hercules");
assert(herculesFamily, "Hercules family must exist");
const herculesMembers = [...herculesFamily.memberIds]; // 19 members

function shuffle(array: string[]) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Baseline state
const baselineController = new FamilyRevealController(DEFAULT_FAMILY_CONFIG);
baselineController.init(rawJson.constellations, rawJson.families);
for (const id of herculesMembers) {
  baselineController.selectConstellation(id);
}
const baselineState = baselineController.getState();
const baselineEdgeJson = JSON.stringify(baselineState.activeEdges);
assert(baselineState.hullData, "Hull data must be generated when threshold is met");
const baselinePositions = Buffer.from(baselineState.hullData.positions.buffer).toString("hex");
const baselineIndices = Buffer.from(baselineState.hullData.indices.buffer).toString("hex");

for (let trial = 1; trial <= 100; trial++) {
  const shuffledOrder = shuffle(herculesMembers);
  const testController = new FamilyRevealController(DEFAULT_FAMILY_CONFIG);
  testController.init(rawJson.constellations, rawJson.families);

  for (const id of shuffledOrder) {
    testController.selectConstellation(id);
  }

  const testState = testController.getState();
  const testEdgeJson = JSON.stringify(testState.activeEdges);
  const testPositions = Buffer.from(testState.hullData!.positions.buffer).toString("hex");
  const testIndices = Buffer.from(testState.hullData!.indices.buffer).toString("hex");

  assert.strictEqual(
    testEdgeJson,
    baselineEdgeJson,
    `Trial ${trial}: Active edges JSON mismatch with shuffle order!`
  );
  assert.strictEqual(
    testPositions,
    baselinePositions,
    `Trial ${trial}: Hull positions buffer mismatch with shuffle order!`
  );
  assert.strictEqual(
    testIndices,
    baselineIndices,
    `Trial ${trial}: Hull indices buffer mismatch with shuffle order!`
  );
}
console.log("[✓ PASSED] FR5 Validated: 100/100 random click order shuffles produced byte-identical edge sets and hull geometry!");

// Test 4: HullBuilder Caching & Zero Allocation
console.log("\n--- Test 4: HullBuilder Caching & Zero Allocations ---");
const hullBuilder = new HullBuilder(2340);
const memberCentroids = herculesMembers.map((id) => graph.nodes.get(id)!.centroid);

const hull1 = hullBuilder.getOrCreateFamilyHull("hercules", memberCentroids, 2340);
const hull2 = hullBuilder.getOrCreateFamilyHull("hercules", memberCentroids, 2340);
assert.strictEqual(hull1, hull2, "Second hull call must return identical cached reference");
console.log("[✓ PASSED] HullBuilder correctly caches and returns identical instance without reallocation");

// Test 5: Navigation & Reset (FR6, FR7)
console.log("\n--- Test 5: Navigation & Reset Controls ---");
baselineController.reset();
const emptyState = baselineController.getState();
assert.strictEqual(emptyState.activeFamilyId, null, "Reset must clear active family");
assert.strictEqual(emptyState.activeMemberSet.size, 0, "Reset must clear active members");

// Select Ursa Major
baselineController.selectConstellation("ursa_major");
const umState = baselineController.getState();
assert.strictEqual(umState.activeFamilyId, "ursa_major");
assert.strictEqual(umState.revealedCount, 1);

// Next member
baselineController.nextMember();
const nextState = baselineController.getState();
assert(nextState.revealedCount >= 1);
assert.notStrictEqual(nextState.selectedConstellationId, "ursa_major", "Next member must cycle selection");

console.log("[✓ PASSED] Navigation nextMember and reset cycle correctly");

console.log("\n====================================================");
console.log("  ALL TESTS PASSED SUCCESSFULLY (100%)");
console.log("====================================================");
