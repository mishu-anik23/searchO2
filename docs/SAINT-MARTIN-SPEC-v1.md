# Saint Martin's Island: Blue Lab (`saint_martin`)
## Game Architecture, Tree Lifecycle Engine & Mission Specification

This document provides complete implementation specifications for the **Saint Martin's Blue Lab** zone. It integrates the twin decagonal orchards (`dec1` and `dec2`), species growth engines (Coconut, Palmyra Palm, Keya, Mangrove, Casuarina), offshore aquaculture, zero-carbon seafood/seaweed processing, wind/solar/BESS microgrid, and the algae scrubbing pipeline for German restaurant trade export.

---

## 1. System Architecture & Globe Navigation
[Germany: Active Farm]
│
▼ (Requirement: 5,000 O2 + "germany_c4_complete")
[Saint Martin's: Blue Lab] (Coordinates: 20.6272° N, 92.3225° E)
│
▼ (Requirement: 12,500 O2 + "Global Trade Passport Verified")
[Brazil: Amazonian Agroforestry & Cerrado]


### File Tree
src/features/zones/saint_martin/
├── data/
│   ├── missions.json
│   ├── plantCatalog.json
│   ├── recipes.json
│   └── tradeOrders.json
├── engine/
│   ├── treeProgressionEngine.ts
│   ├── orchardGridEngine.ts
│   ├── marineAquacultureEngine.ts
│   ├── processingPlantEngine.ts
│   ├── algaeScrubberEngine.ts
│   └── types.ts
├── state/
│   └── useSaintMartinStore.ts
└── components/
├── 2d_orchards/
│   ├── DecagonalOrchardView.tsx
│   ├── PlotTileInteractive.tsx
│   └── TreeSpriteRenderer.tsx
├── 3d_marine/
│   ├── UnderwaterDivingScene.tsx
│   ├── SeaweedFarmRafts.tsx
│   └── MarineLifeScanner.tsx
├── processing/
│   ├── ProcessingPlantHUD.tsx
│   ├── SolarWindBessPanel.tsx
│   └── BigJarAlgaeBioreactor.tsx
└── hud/
├── SeaHealthDashboard.tsx
└── TradePassportModal.tsx


---

## 2. Tree Species Lifecycle & Growth Progression

Trees in `dec1` and `dec2` progress through 5 discrete stages:
* `STAGE_0_SEEDLING`: Newly planted propagule, seed, or nut. High vulnerability to salt spray and dry sand.
* `STAGE_1_SPROUT`: Emerging taproot and foliage. Begins minor moisture retention.
* `STAGE_2_SAPLING`: Intermediate trunk development. Starts contributing to windbreak shelter and erosion resistance.
* `STAGE_3_MATURE`: Full canopy. Produces harvestable resources (nuts, fruit, fibers, leaf mulch), releases maximum $\text{O}_2$, and casts wind shadows on adjacent sub-plots.
* `STAGE_4_ANCIENT`: Deep-root mycorrhizal network established. Yields bonus bio-resilience, maximum soil stabilization, and seed propagation stock.

### Species Growth Parameters (`plantCatalog.json`)

| Species ID | Common Name | Native Zone Affinity | Growth Time (Sec) | Water Demand / Tick | Max Salinity Tolerance | Primary Yield | Soil Stability / $\text{O}_2$ Bonus |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `tree_coconut` | Coastal Coconut Palm (*Cocos nucifera*) | `dec2.plot1`, `dec2.plot3` | 180s | 1.8 L | 22 ppt | Green Coconuts, Husk Fiber | +18 Stability / +35 $\text{O}_2$ |
| `tree_palmyra` | Palmyra Palm (*Borassus flabellifer*) | `dec2.plot2`, `dec2.plot3` | 240s | 1.0 L | 28 ppt | Palmyra Fruit, Sap, Leaf Thatch | +25 Stability / +40 $\text{O}_2$ |
| `tree_kewra` | Screw Pine / Keya (*Pandanus odorifer*) | `dec1.plot2`, `dec2.plot1` | 120s | 0.8 L | 35 ppt | Kewra Blossoms, Stabilizing Stilt-Roots | +40 Stability / +25 $\text{O}_2$ |
| `tree_casuarina` | Ironwood / Jhau (*Casuarina equisetifolia*) | `dec2.plot2` | 150s | 0.6 L | 30 ppt | Needle Mulch, Coastal Windbreak Timber | +30 Stability / +50 $\text{O}_2$ |
| `tree_mangrove` | Sundari / Red Mangrove (*Rhizophora mangle*) | `dec1.plot1`, `dec1.plot3` | 200s | Brackish Seepage | 42 ppt | Propagules, Bio-Filter Biofilm | +50 Stability / +45 $\text{O}_2$ |

---

## 3. Decagonal Geometry & Plot Mapping Engine

The island features two 10-sided orchards separated by a freshwater-brackish lake:

[WEST WARD: dec1 - Saline & Lagoon Buffer]
├── dec1.plot1 : Intertidal Fringe (Mangrove / Littoral Silt Trapping)
├── dec1.plot2 : Primary Windbreak (Keya / Pandanus Stilt Formations)
└── dec1.plot3 : Lake Boundary Strip (Brackish Halo Planting)

[EAST WARD: dec2 - Sand Dune & Canopy Zone]
├── dec2.plot1 : Outer Dune Shield (Coconut & Keya Permaculture)
├── dec2.plot2 : Canopy Windbreak (Casuarina & Palmyra Heavy Anchors)
└── dec2.plot3 : Interior Agro-Orchard (Freshwater Drip Fruit Production)


### TypeScript Data Definitions (`types.ts`)

```typescript
export type GrowthStage = 0 | 1 | 2 | 3 | 4;

export interface TreeInstance {
  instanceId: string;
  speciesId: 'tree_coconut' | 'tree_palmyra' | 'tree_kewra' | 'tree_casuarina' | 'tree_mangrove';
  stage: GrowthStage;
  progressPercent: number; // 0 to 100 within current stage
  health: number;          // 0 to 100
  harvestReady: boolean;
  rootDepthMeters: number;
}

export interface OrchardPlot {
  plotId: 'dec1.plot1' | 'dec1.plot2' | 'dec1.plot3' | 'dec2.plot1' | 'dec2.plot2' | 'dec2.plot3';
  maxCapacity: number;     // Maximum tree slots (e.g., 6 trees per plot)
  trees: TreeInstance[];
  soilSalinityPpt: number;
  soilMoisturePercent: number;
  erosionResistanceScore: number;
  windbreakShelterPercent: number;
}

export interface DecagonalOrchard {
  decagonId: 'dec1' | 'dec2';
  plots: Record<string, OrchardPlot>;
  compositeStability: number;
}
4. Chapter-Wise Missions: In-Depth Sub-Process Breakdown
Chapter 1: Reef Survey & The First Decagon (dec1)
Focus: Underwater species discovery, baseline reef preservation, and coastal fringe planting.

Mission 1.1: Reef Baseline Dive & Polyp Diagnostics

Sub-process 1.1.1: Dive into the 3D marine view. Scan 4 non-target organisms (Parrotfish, Olive Ridley Turtle, Sea Fan, Clam). Tap to log classification badges without physical collection.

Sub-process 1.1.2: Open the 3D Coral Inspector. Identify and calibrate polyp tentacles, zooxanthellae symbionts, and calcium carbonate skeleton.

Sub-process 1.1.3: Deploy floating silt turbidity barriers to shield inshore corals from storm sediment.

Mission 1.2: Grounding Decagon 1 (dec1.plot1 & dec1.plot2)

Sub-process 1.2.1: Navigate to dec1.plot1. Plant 3 tree_mangrove propagules. Align stilt roots to interlock with the tidal baseline.

Sub-process 1.2.2: Move to dec1.plot2. Plant 3 tree_kewra (Screw Pine) saplings on the windward rim.

Sub-process 1.2.3: Regulate the tidal sluice gate to keep dec1.plot1 water salinity between 20–35 ppt to trigger Stage 1 sprouting.

Mission 1.3: Freshwater Lake Filtration Link

Sub-process 1.3.1: Populate dec1.plot3 with 2 salt-tolerant trees.

Sub-process 1.3.2: Verify that water passing from the intertidal zone through dec1 into the central lake has a turbidity reduction ≥40%.

Chapter 2: Sub-Sea Agriculture & East Dune Orchard (dec2)
Focus: Seaweed raft farming, pelagic seafood cages, and deep-root dune palm agroforestry.

Mission 2.1: Seaweed Raft Deployment & Propagation

Sub-process 2.1.1: Install 4 offshore submerged longlines for red seaweed (Gracilaria) and green sea lettuce (Ulva).

Sub-process 2.1.2: Dive with the underwater cutter tool to prune epiphytic micro-pests from the lines.

Sub-process 2.1.3: Harvest 100 kg of mature seaweed biothallus and hoist it to the boat pontoon.

Mission 2.2: Contained Seafood Cages & RAS Hatchery

Sub-process 2.2.1: Stock closed nursery tanks with Mud Crab (Scylla serrata) and Black Tiger Prawn (Penaeus monodon).

Sub-process 2.2.2: Calibrate automated feeder to match biomass appetite, maintaining zero unconsumed pellet rot.

Sub-process 2.2.3: Route nursery bio-sludge through settleable solid separators to prevent any open-lagoon discharge.

Mission 2.3: Palm Canopy Construction in dec2

Sub-process 2.3.1: Plant 4 tree_coconut in dec2.plot1 and 3 tree_palmyra in dec2.plot2.

Sub-process 2.3.2: Interplant 2 tree_casuarina along dec2.plot2 to act as an aerosol salt-spray shield.

Sub-process 2.3.3: Run solar desalination condensate lines to dec2.plot3 to supply fresh drip moisture, advancing trees to Stage 2.

Chapter 3: Off-Grid Microgrid & Agro-Canopy Maturation
Focus: Wind energy, BESS deployment, tree harvesting, and sustainable composting.

Mission 3.1: Hybrid Wind & BESS Grid Activation

Sub-process 3.1.1: Place 3 coastal wind micro-turbines along high-elevation bluffs.

Sub-process 3.1.2: Construct a 500 kWh Battery Energy Storage System (BESS) substation. Wire charging relays from wind and rooftop solar.

Sub-process 3.1.3: Balance variable nighttime wind drops using the BESS buffer, ensuring zero brownouts across aquaculture tank aeration systems.

Mission 3.2: Tree Maturation & Nutrient Cycling

Sub-process 3.2.1: Tend dec2.plot1 and dec2.plot2 until trees reach STAGE_3_MATURE.

Sub-process 3.2.2: Harvest first yield: 30 green coconuts and 15 palmyra sap containers.

Sub-process 3.2.3: Process coconut husk fiber and fallen casuarina needles into moisture-retaining mulch, applying it across dec2.plot3 to reduce water evaporation by 50%.

Mission 3.3: Marine Life Biosphere Inspection

Sub-process 3.3.1: Conduct an underwater survey of the seaweed beds. Confirm that nursery fingerling biodiversity increased by +25% beneath the seaweed canopy.

Chapter 4: Zero-Carbon Processing & The Big Jar Algae Scrubber
Focus: Food processing, seaweed transformation, and carbon abatement through algae bioreactors.

Mission 4.1: Processing Plant Operations

Sub-process 4.1.1: Install rooftop solar panels (120 kW capacity) on the onshore processing facility.

Sub-process 4.1.2: Process and rapid-freeze 200 kg of harvested prawns and mud crabs using clean electric refrigeration.

Sub-process 4.1.3: Run harvested seaweed through the solar dehydration racks; mill into dried seaweed sheets and seaweed snack chips.

Mission 4.2: Machine & Transport Emissions Tracking

Sub-process 4.2.1: Monitor the facility's carbon telemetry. Detect a 45 kg CO 
2
​
 /hr output from freezing compressors and marine cargo vessel idling.

Sub-process 4.2.2: Observe the local Sea Health Index (SHI) decrease due to local atmospheric and dissolved greenhouse gas elevation.

Mission 4.3: Big Jar Algae Bioreactor Installation (High-Yield Challenge)

Sub-process 4.3.1: Construct 3 Big Jar Bioreactors (1,000 L cylindrical transparent vessels) adjacent to processing exhaust lines.

Sub-process 4.3.2: Inoculate vessels with Spirulina / Chlorella mother cultures. Route plant flue gas and port vehicle exhaust through micro-bubble diffusers into the jars.

Sub-process 4.3.3: Tune aeration flow and LED spectrum to maximize carbon uptake. Neutralize 95% of facility CO 
2
​
  emissions while generating +120 O 
2
​
  credits/hr.

Chapter 5: Global Trade Passport & The German Farm Corridor
Focus: Global trade certification, international supply chain execution, and unlocking Brazil.

Mission 5.1: Sea Health Index Equilibrium

Sub-process 5.1.1: Maintain SHI≥90 continuously across 3 consecutive game days while operating all facilities (both orchards dec1 and dec2 at Stage 3/4, seaweed lines, fish cages, and processing plant).

Mission 5.2: Product Certification & Packing

Sub-process 5.2.1: Assemble the international cargo container:

100x Eco-Certified Frozen Black Tiger Prawn Crates

80x Mud Crab Chilled Crates

150x Premium Dried Seaweed Packs

120x Seaweed Crunch Chips

60x Cold-Pressed Coconut Oil Jars (from dec2 harvest)

Sub-process 5.2.2: Attach carbon-neutral certification seals validated by Big Jar Algae absorption metrics.

Mission 5.3: Cross-Border Delivery to German Active Farm

Sub-process 5.3.1: Execute shipping contract via the Global Terminal to the German Active Farm restaurant in Baden-Württemberg/Black Forest.

Sub-process 5.3.2: Fulfill the German restaurant culinary demand, earning 3,500 Eco-Tokens and unlocking the "Global Green Trade Passport".

Sub-process 5.3.3: Achieve cumulative global score ≥12,500 O 
2
​
 , unlocking the Brazil Amazonia Agroforestry node on the 3D Globe.

5. Coding Agent Implementation Logic
Tree Progression Engine (treeProgressionEngine.ts)
TypeScript
import { TreeInstance, OrchardPlot, GrowthStage } from './types';

const STAGE_THRESHOLDS = [0, 25, 50, 75, 100];

export function tickTreeProgression(
  tree: TreeInstance,
  plot: OrchardPlot,
  freshwaterLitersAvailable: number,
  deltaSeconds: number
): { updatedTree: TreeInstance; waterConsumed: number } {
  let progressDelta = 0;
  let healthDelta = 0;
  let waterConsumed = 0;

  // 1. Environmental tolerances
  const isSalinityStressed = plot.soilSalinityPpt > getSalinityLimit(tree.speciesId);
  const isSheltered = plot.windbreakShelterPercent > 30;

  // 2. Water consumption
  const idealWaterDemand = getWaterDemandPerSec(tree.speciesId, tree.stage) * deltaSeconds;
  if (freshwaterLitersAvailable >= idealWaterDemand) {
    waterConsumed = idealWaterDemand;
    progressDelta += (deltaSeconds / getBaseGrowthDuration(tree.speciesId)) * 100;
  } else {
    waterConsumed = freshwaterLitersAvailable;
    healthDelta -= 0.5 * deltaSeconds; // Dehydration penalty
  }

  // 3. Stress adjustments
  if (isSalinityStressed) {
    healthDelta -= 1.0 * deltaSeconds;
    progressDelta *= 0.3;
  }
  if (isSheltered) {
    progressDelta *= 1.25; // Growth bonus under windbreak
  }

  // 4. Update stages
  let newProgress = tree.progressPercent + progressDelta;
  let newStage = tree.stage;

  if (newProgress >= 100 && tree.stage < 4) {
    newStage = (tree.stage + 1) as GrowthStage;
    newProgress = 0;
  }

  const updatedTree: TreeInstance = {
    ...tree,
    stage: newStage,
    progressPercent: Math.min(100, Math.max(0, newProgress)),
    health: Math.min(100, Math.max(0, tree.health + healthDelta)),
    harvestReady: newStage >= 3 && tree.health > 70,
    rootDepthMeters: Number((newStage * 0.8 + 0.2).toFixed(2))
  };

  return { updatedTree, waterConsumed };
}

function getSalinityLimit(species: string): number {
  switch (species) {
    case 'tree_mangrove': return 45;
    case 'tree_kewra': return 35;
    case 'tree_casuarina': return 30;
    case 'tree_palmyra': return 28;
    case 'tree_coconut': return 22;
    default: return 15;
  }
}

function getWaterDemandPerSec(species: string, stage: GrowthStage): number {
  const base = species === 'tree_coconut' ? 0.02 : 0.01;
  return base * (stage + 1);
}

function getBaseGrowthDuration(species: string): number {
  switch (species) {
    case 'tree_kewra': return 120;
    case 'tree_casuarina': return 150;
    case 'tree_coconut': return 180;
    case 'tree_mangrove': return 200;
    case 'tree_palmyra': return 240;
    default: return 160;
  }
}
Big Jar Algae Scrubber Engine (algaeScrubberEngine.ts)
TypeScript
export interface AlgaeJarUnit {
  unitId: string;
  volumeLiters: number;
  co2IntakeRateKgHr: number;
  algaeDensityPercent: number; // 0 to 100%
  aerationFlowRate: number;    // Bubble rate (0.0 to 1.0)
  active: boolean;
}

export function calculateAlgaeScrubberImpact(
  jars: AlgaeJarUnit[],
  plantCo2EmissionKgHr: number
): {
  residualCo2KgHr: number;
  o2BonusPerHr: number;
  dissolvedOxygenLift: number;
} {
  let totalCo2CapturedKgHr = 0;
  let totalO2Generated = 0;

  for (const jar of jars) {
    if (!jar.active) continue;

    // Photosynthetic capture formula: Density * Aeration * Conversion
    const captureCapacity = (jar.algaeDensityPercent / 100) * jar.aerationFlowRate * 18.5;
    totalCo2CapturedKgHr += captureCapacity;

    // Direct photosynthetic O2 generation
    totalO2Generated += captureCapacity * 1.45;
  }

  const residualCo2KgHr = Math.max(0, plantCo2EmissionKgHr - totalCo2CapturedKgHr);
  const dissolvedOxygenLift = Number((totalCo2CapturedKgHr * 0.12).toFixed(2));

  return {
    residualCo2KgHr,
    o2BonusPerHr: totalO2Generated,
    dissolvedOxygenLift
  };
}
6. Coding Agent Guardrails
Explicit Visual Plot Labels: The UI Canvas must cleanly render individual clickable borders with readable text overlays matching dec1.plot1, dec1.plot2, dec1.plot3, dec2.plot1, dec2.plot2, and dec2.plot3.

Pedagogical Purity: All wild reef fish, corals, and sea turtles encountered in diving mode are strictly scan-and-observe assets. Never add hunting, wild harvesting, or bottom-trawling mechanics.

Simulation Framing: All references to Saint Martin's Island must reflect an educational research simulation.

Energy Consistency: Machinery in the processing plant must draw from the solar-wind-BESS power state; operations pause or emit warning alerts if battery reserves drop below 5%.

Cross-Zone Economy Bridge: Fulfilling the German restaurant orders is a prerequisite for unlocking Brazil on the globe map. Verify both prerequisites (globalO2 >= 12500 and tradePassportVerified === true).