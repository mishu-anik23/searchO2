# Saint Martin's Island: Blue Lab (`saint\_martin`)

## Game Architecture, Tree Lifecycle Engine \& Mission Specification

This document provides complete implementation specifications for the **Saint Martin's Blue Lab** zone. It integrates the twin decagonal orchards (`dec1` and `dec2`), species growth engines (Coconut, Palmyra Palm, Keya, Mangrove, Casuarina), offshore aquaculture, zero-carbon seafood/seaweed processing, wind/solar/BESS microgrid, and the algae scrubbing pipeline for German restaurant trade export.

\---

## 1\. System Architecture \& Globe Navigation

\[Germany: Active Farm]
│
▼ (Requirement: 5,000 O2 + "germany\_c4\_complete")
\[Saint Martin's: Blue Lab] (Coordinates: 20.6272° N, 92.3225° E)
│
▼ (Requirement: 12,500 O2 + "Global Trade Passport Verified")
\[Brazil: Amazonian Agroforestry \& Cerrado]



### File Tree

src/features/zones/saint\_martin/
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
├── 2d\_orchards/
│   ├── DecagonalOrchardView.tsx
│   ├── PlotTileInteractive.tsx
│   └── TreeSpriteRenderer.tsx
├── 3d\_marine/
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



\---

## 2\. Tree Species Lifecycle \& Growth Progression

Trees in `dec1` and `dec2` progress through 5 discrete stages:

* `STAGE\_0\_SEEDLING`: Newly planted propagule, seed, or nut. High vulnerability to salt spray and dry sand.
* `STAGE\_1\_SPROUT`: Emerging taproot and foliage. Begins minor moisture retention.
* `STAGE\_2\_SAPLING`: Intermediate trunk development. Starts contributing to windbreak shelter and erosion resistance.
* `STAGE\_3\_MATURE`: Full canopy. Produces harvestable resources (nuts, fruit, fibers, leaf mulch), releases maximum $\\text{O}\_2$, and casts wind shadows on adjacent sub-plots.
* `STAGE\_4\_ANCIENT`: Deep-root mycorrhizal network established. Yields bonus bio-resilience, maximum soil stabilization, and seed propagation stock.

### Species Growth Parameters (`plantCatalog.json`)

|Species ID|Common Name|Native Zone Affinity|Growth Time (Sec)|Water Demand / Tick|Max Salinity Tolerance|Primary Yield|Soil Stability / $\\text{O}\_2$ Bonus|
|-|-|-|-|-|-|-|-|
|`tree\_coconut`|Coastal Coconut Palm (*Cocos nucifera*)|`dec2.plot1`, `dec2.plot3`|180s|1.8 L|22 ppt|Green Coconuts, Husk Fiber|+18 Stability / +35 $\\text{O}\_2$|
|`tree\_palmyra`|Palmyra Palm (*Borassus flabellifer*)|`dec2.plot2`, `dec2.plot3`|240s|1.0 L|28 ppt|Palmyra Fruit, Sap, Leaf Thatch|+25 Stability / +40 $\\text{O}\_2$|
|`tree\_kewra`|Screw Pine / Keya (*Pandanus odorifer*)|`dec1.plot2`, `dec2.plot1`|120s|0.8 L|35 ppt|Kewra Blossoms, Stabilizing Stilt-Roots|+40 Stability / +25 $\\text{O}\_2$|
|`tree\_casuarina`|Ironwood / Jhau (*Casuarina equisetifolia*)|`dec2.plot2`|150s|0.6 L|30 ppt|Needle Mulch, Coastal Windbreak Timber|+30 Stability / +50 $\\text{O}\_2$|
|`tree\_mangrove`|Sundari / Red Mangrove (*Rhizophora mangle*)|`dec1.plot1`, `dec1.plot3`|200s|Brackish Seepage|42 ppt|Propagules, Bio-Filter Biofilm|+50 Stability / +45 $\\text{O}\_2$|

\---

## 3\. Decagonal Geometry \& Plot Mapping Engine

The island features two 10-sided orchards separated by a freshwater-brackish lake:

\[WEST WARD: dec1 - Saline \& Lagoon Buffer]
├── dec1.plot1 : Intertidal Fringe (Mangrove / Littoral Silt Trapping)
├── dec1.plot2 : Primary Windbreak (Keya / Pandanus Stilt Formations)
└── dec1.plot3 : Lake Boundary Strip (Brackish Halo Planting)

\[EAST WARD: dec2 - Sand Dune \& Canopy Zone]
├── dec2.plot1 : Outer Dune Shield (Coconut \& Keya Permaculture)
├── dec2.plot2 : Canopy Windbreak (Casuarina \& Palmyra Heavy Anchors)
└── dec2.plot3 : Interior Agro-Orchard (Freshwater Drip Fruit Production)





Spatial Topology \& Master Grid MappingBased on the provided blank background plate, the landmass divides naturally into functional environmental zones:   The South-West Inshore Lagoon (Bottom-Left): Shallow crystalline turquoise waters with exposed coral heads—the dedicated Coral Reef Nursery \& Snorkel Exploration Basin.   The East Deepwater Jet Pier (Right): Concrete marine jetty structures—the Harbor, Cargo Dispatch \& German Export Terminal.   The Central Open Meadow (Center \& North): Sandy loam terrain providing ample room for the Central Freshwater Lake, Twin Decagonal Orchards (dec1 \& dec2), German-Style Botanical Raised Beds, and the Onshore Eco-Campus.   (North Deep Ocean / Distant Atolls)

┌────────────────────────────────────────────────────────────────────────────────────────┐

│ \[TOP NORTH BUFFER: Wind Turbine Ridge \& Offshore Seaweed Rafts / Pelagic Fish Cages]   │

├────────────────────────────────────────────────────────────────────────────────────────┤

│                                                                                        │

│   ┌────────────────────────┐      (Central Lake)      ┌────────────────────────┐       │

│   │   DECAGON 1 (`dec1`)   │  \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~  │   DECAGON 2 (`dec2`)   │       │

│   │    West Coastal Ward   │  \[Solar Desal Stills]    │     East Dune Ward     │       │

│   │  dec1.plot1 dec1.plot2 │  \[Salt Crystallization]  │  dec2.plot1 dec2.plot2 │       │

│   │       dec1.plot3       │                          │       dec2.plot3       │       │

│   └───────────┬────────────┘                          └───────────┬────────────┘       │

│               │                                                   │                    │

│    ═══════════╧═══════════════════════════════════════════════════╧═══════════         │

│                        \[ARTERIAL SPINE ROADWAY]                                        │

│    ═══════════╤═══════════════════════════════════════════════════╤═══════════         │

│               │                                                   │                    │

│   ┌───────────┴────────────┐                          ┌───────────┴────────────┐  ═══  │

│   │ REUSED BOTANICAL \&     │                          │ ECO-PROCESSING HUB:    │  ║ ║  │

│   │ VEGETABLE RAISED BEDS  │                          │ • Crab/Prawn RAS Tanks │  ║J║  │

│   │ (German Farm Engine)   │                          │ • -40°C IQF Tunnel     │  ║E║  │

│   └────────────────────────┘                          │ • Coconut Oil Expeller │  ║T║  │

│                                                       │ • Big Jar Algae Scrub  │  ║T║  │

│                                                       └───────────┬────────────┘  ║Y║  │

│                                                                   │ (Pier Spur)    ║ ║  │

│                                                                   └═══════════════►║ ║  │

├────────────────────────────────────────────────────────────────────────────────────╫─╫──┤

│ \[SHALLOW REEF BASIN: 3D Diving / Corals]                         \[DEEP HARBOR JETTY]    │

└─────────────────────────────────────────────────────────────────────────────────────────┘

The Road \& Conduit NetworkThe island requires a functional transit and pipeline spine to connect agriculture, processing, energy, and export docks:Arterial Spine Road (Route-A: The Coral Spine):Extends east-to-west across the central plateau.Connects the deepwater jetty on the right directly to the western edge of dec1.Jetty Industrial Spur (Spur-J):Links the concrete cargo pier directly to the Eco-Processing Facility \& IQF Freezer Warehouse, allowing automated electric forklifts to transfer frozen export crates.Lake Bypass Loop (Loop-L):Circles the central freshwater lake, connecting the solar desalination stills to the irrigation inputs of both dec1 and dec2.Agricultural Utility Runways (Runway-G):Compact gravel pathways running south of the spine road to service the raised botanical beds and compost delivery points.Conduit Network (Sub-surface):Brine Channel: Directs concentrated desalination brine directly into sun-drying salt pans.Freshwater Line: Delivers pure condensed water from the solar stills to the vegetable beds and coconut drip loops.Microgrid Cable: Runs along the northern road shoulder from the wind turbines and battery storage (BESS) to the IQF processing plant.Chapter Progression \& Clear Task DefinitionsChapter 1: Arrival, Port Handshake \& The Reef SentinelNarrative: Dock the research vessel Keari Explorer at the eastern concrete jetty. Set up the baseline road, map the reef basin, and stabilize the wet western coastline.   Task 1.1 — Dock \& Connect Port Logistics:Build the initial paved connection from the concrete jetty into the main plateau (Spur-J).   Establish the cargo staging pad at Jetty Terminal Alpha.   Task 1.2 — Coral Baseline Snorkel Dive:Dive into the south-west shallow reef basin (bottom-left).   Scan and log 4 non-target organisms (Staghorn Coral, Brain Coral, Olive Ridley Turtle, Parrotfish).   Deploy floating silt curtains around the reef channel to isolate runoff.   Task 1.3 — Break Ground on Decagon 1 (dec1):Grade and lay the 10-sided boundary frame for Decagon 1 on the western plateau.   Plant 3 tree\_mangrove propagules in dec1.plot1 along the tidal fringe.   Plant 3 tree\_kewra (Screw Pine) saplings in dec1.plot2 as a windward storm shield.   Rewards: 900 $\\text{O}\_2$, 300 Eco-Tokens, Badge: Reef Sentinel.Chapter 2: The Divide – Desalination Stills \& Dual OrchardsNarrative: Excavate the central freshwater transition lake, install simultaneous solar desalination and salt pans, and build Decagon 2 on the eastern dune.   Task 2.1 — Establish Lake Corridor \& Solar Desalination:Excavate the central dividing lake between the orchards.   Install 4 multi-stage solar desalination panels along Loop-L.   Connect intake pumps from non-reef seawater; initiate condensation at 200 L/hr pure freshwater.   Task 2.2 — Salt Brine Harvest:Direct effluent brine away from living corals into shallow evaporation crystallization pans.   Harvest the first yield of 25 kg mineral sea salt flakes.   Task 2.3 — Construct Decagon 2 (dec2):Build the eastern 10-sided decagonal frame (dec2) adjacent to the port access road.   Plant 4 tree\_coconut in dec2.plot1 and 3 tree\_palmyra in dec2.plot2.   Interplant 2 tree\_casuarina along dec2.plot2 as an aerosol salt-spray shield.   Lay sub-surface drip pipes from the solar stills to dec2.plot3, advancing trees to Stage 2 (Sapling).   Rewards: 1,300 $\\text{O}\_2$, 600 Eco-Tokens, Badge: Water Architect.Chapter 3: German Botanical Re-Use \& Sub-Sea CultivationNarrative: Adapt the German Farm raised-bed vegetable engine to the island's sandy soil, activate offshore seaweed lines, and wire the wind/BESS microgrid.   Task 3.1 — Raised Botanical \& Vegetable Garden Beds:Construct 4 raised vegetable beds along Runway-G in the sheltered lee-side of dec2.   Amend native beach sand with stabilized compost; plant crop\_sea\_kale and crop\_coastal\_spinach.   Route freshwater drip lines from the lake stills; complete a harvest of 50 kg fresh greens.   Task 3.2 — Offshore Seaweed \& Seafood Nursery:Install 4 submerged longlines for Gracilaria and Ulva in the northern waters; harvest 100 kg thallus.   Stock closed onshore nursery tanks with Mud Crab (Scylla serrata) and Black Tiger Prawn (Penaeus monodon).   Route RAS waste through drum filters to create nutrient-rich compost for the vegetable beds.   Task 3.3 — Wind \& BESS Microgrid Commissioning:Erect 3 coastal micro-wind turbines on the northern ridge.   Install a 500 kWh Battery Energy Storage System (BESS) station along Route-A to stabilize power delivery.   Rewards: 1,600 $\\text{O}\_2$, 850 Eco-Tokens, Badge: Integrated Steward.Chapter 4: Industrial Seafood Processing, IQF Tunnel \& Coconut ExpellerNarrative: Construct the onshore processing facility at the jetty junction. Process crabs, prawns, seaweed snacks, and cold-pressed coconut oil while scrubbing carbon emissions.   Task 4.1 — Seafood Processing \& IQF Freezing:Construct the processing plant at the Spur-J intersection; wire rooftop solar and BESS lines.   Commission the Individual Quick Freezing (IQF) tunnel down to -40°C.   Process, clean, and IQF-freeze 200 kg of harvested prawns and whole mud crabs into vacuum-sealed export cartons.   Task 4.2 — Hydraulic Cold-Press Coconut Oil Expeller:Harvest 120 mature coconuts from dec2 (Stage 3 Mature).   Feed dried copra into the cold-press expeller; bottle 50 liters of extra-virgin cold-pressed coconut oil.   Recycle residual copra press-cake into the prawn/crab nursery tanks as zero-waste supplemental feed.   Task 4.3 — Seaweed Solar Dehydration:Wash harvested seaweed with pure desalination water.   Dehydrate and mill 100 boxes of savory Seaweed Bio-Chips seasoned with island mineral sea salt.   Task 4.4 — Big Jar Algae Bioreactor Installation:Mount 3 transparent 1,000 L Big Jar Bioreactors adjacent to the freezer compressors and loading docks.   Inoculate with Spirulina; route facility exhaust gas through micro-bubble diffusers to capture 95% of operational $\\text{CO}\_2$ and produce $+120\\text{ O}\_2$/hr.   Rewards: 2,100 $\\text{O}\_2$, 1,400 Eco-Tokens, Badge: Zero-Footprint Manufacturer.Chapter 5: Global Green Passport \& The German Farm CorridorNarrative: Maintain island ecological equilibrium, assemble the reefer export consignment, ship to the German Active Farm restaurant, and unlock Brazil.   Task 5.1 — Sea Health Index (SHI) Equilibrium:Run all systems concurrently (orchards, raised beds, seaweed rafts, aquaculture, desal, and processing) for 3 continuous game days with $\\text{SHI} \\ge 90$.   Task 5.2 — Assemble International Cargo Consignment:Stage the reefer shipment at the jetty terminal:   100x IQF Frozen Black Tiger Prawn Master Cartons   80x IQF Frozen Mud Crab Whole Cartons   150x Dried Seaweed Sheets \& 120x Seaweed Crunch Chips   80x Cold-Pressed Coconut Oil Bottles   40x Mineral Sea Salt Flake Bags   60x Fresh Coastal Greens Crates   Validate zero-carbon supply telemetry via the Algae Scrubber logs to seal the cargo with the Green Export Stamp.   Task 5.3 — Dispatch to Germany \& Unlock Brazil:Transmit the shipment through the Global Cargo Terminal to supply the German Active Farm restaurant.   Earn 4,500 Eco-Tokens and unlock the official Global Green Trade Passport.   Reach cumulative score $\\ge 12,500\\text{ O}\_2$ to unlock the Brazil Amazonia Agroforestry node on the 3D Globe.   Rewards: Unlocks Brazil Globe Station, Global Title: Biosphere Champion.   Implementation Mapping (index.html Overlay Blueprint)To align this layout with index.html, register the following interactive pixel anchors against the master background image:   JavaScriptexport const SAINT\_MARTIN\_STAGE\_COORDINATES = {

&#x20; // Background Image Dimensions: 1920 x 1080

&#x20; baseResolution: { width: 1920, height: 1080 },



&#x20; // Roadway Network Splines

&#x20; roads: {

&#x20;   spineRoadA: \[

&#x20;     { x: 380, y: 530 }, // West boundary near dec1

&#x20;     { x: 960, y: 530 }, // Central junction

&#x20;     { x: 1350, y: 530 } // East junction near jetty spur

&#x20;   ],

&#x20;   jettySpurJ: \[

&#x20;     { x: 1350, y: 530 }, // Spine connection

&#x20;     { x: 1420, y: 490 }, // Pier approach

&#x20;     { x: 1560, y: 450 }  // Concrete loading dock

&#x20;   ],

&#x20;   lakeLoopL: \[

&#x20;     { x: 860, y: 380 }, { x: 1060, y: 380 },

&#x20;     { x: 1060, y: 490 }, { x: 860, y: 490 }

&#x20;   ]

&#x20; },



&#x20; // Interactive Zones \& Anchors

&#x20; zones: {

&#x20;   reefBasin: { x: 420, y: 880, radius: 240, label: "3D Coral Dive Basin" },

&#x20;   jettyTerminal: { x: 1580, y: 440, width: 220, height: 140, label: "Cargo Pier" },

&#x20;   

&#x20;   // Twin Decagonal Orchards

&#x20;   decagon1: {

&#x20;     center: { x: 520, y: 340 },

&#x20;     radius: 170,

&#x20;     plots: {

&#x20;       "dec1.plot1": { x: 450, y: 300, type: "tree\_mangrove" },

&#x20;       "dec1.plot2": { x: 590, y: 300, type: "tree\_kewra" },

&#x20;       "dec1.plot3": { x: 520, y: 390, type: "tree\_kewra" }

&#x20;     }

&#x20;   },

&#x20;   centralLake: { x: 960, y: 360, rx: 120, ry: 65, label: "Freshwater Lake" },

&#x20;   decagon2: {

&#x20;     center: { x: 1380, y: 340 },

&#x20;     radius: 170,

&#x20;     plots: {

&#x20;       "dec2.plot1": { x: 1310, y: 300, type: "tree\_coconut" },

&#x20;       "dec2.plot2": { x: 1450, y: 300, type: "tree\_palmyra" },

&#x20;       "dec2.plot3": { x: 1380, y: 390, type: "tree\_casuarina" }

&#x20;     }

&#x20;   },



&#x20;   // Facilities \& Raised Beds

&#x20;   botanicalGarden: { x: 520, y: 580, width: 260, height: 110, label: "Raised Vegetable Beds" },

&#x20;   solarDesalPlant: { x: 960, y: 450, width: 180, height: 80, label: "Solar Stills \& Salt Pans" },

&#x20;   processingFacility: { x: 1240, y: 580, width: 280, height: 140, label: "IQF \& Oil Processing" },

&#x20;   algaeJarsPad: { x: 1240, y: 730, width: 140, height: 70, label: "Big Jar Scrubbers" }

&#x20; }

};







### TypeScript Data Definitions (`types.ts`)

```typescript
export type GrowthStage = 0 | 1 | 2 | 3 | 4;

export interface TreeInstance {
  instanceId: string;
  speciesId: 'tree\_coconut' | 'tree\_palmyra' | 'tree\_kewra' | 'tree\_casuarina' | 'tree\_mangrove';
  stage: GrowthStage;
  progressPercent: number; // 0 to 100 within current stage
  health: number;          // 0 to 100
  harvestReady: boolean;
  rootDepthMeters: number;
}

export interface OrchardPlot {
  plotId: 'dec1.plot1' | 'dec1.plot2' | 'dec1.plot3' | 'dec2.plot1' | 'dec2.plot2' | 'dec2.plot3';
  maxCapacity: number;     // Maximum tree slots (e.g., 6 trees per plot)
  trees: TreeInstance\[];
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
Chapter 1: Reef Survey \& The First Decagon (dec1)
Focus: Underwater species discovery, baseline reef preservation, and coastal fringe planting.

Mission 1.1: Reef Baseline Dive \& Polyp Diagnostics

Sub-process 1.1.1: Dive into the 3D marine view. Scan 4 non-target organisms (Parrotfish, Olive Ridley Turtle, Sea Fan, Clam). Tap to log classification badges without physical collection.

Sub-process 1.1.2: Open the 3D Coral Inspector. Identify and calibrate polyp tentacles, zooxanthellae symbionts, and calcium carbonate skeleton.

Sub-process 1.1.3: Deploy floating silt turbidity barriers to shield inshore corals from storm sediment.

Mission 1.2: Grounding Decagon 1 (dec1.plot1 \& dec1.plot2)

Sub-process 1.2.1: Navigate to dec1.plot1. Plant 3 tree\_mangrove propagules. Align stilt roots to interlock with the tidal baseline.

Sub-process 1.2.2: Move to dec1.plot2. Plant 3 tree\_kewra (Screw Pine) saplings on the windward rim.

Sub-process 1.2.3: Regulate the tidal sluice gate to keep dec1.plot1 water salinity between 20–35 ppt to trigger Stage 1 sprouting.

Mission 1.3: Freshwater Lake Filtration Link

Sub-process 1.3.1: Populate dec1.plot3 with 2 salt-tolerant trees.

Sub-process 1.3.2: Verify that water passing from the intertidal zone through dec1 into the central lake has a turbidity reduction ≥40%.

Chapter 2: Sub-Sea Agriculture \& East Dune Orchard (dec2)
Focus: Seaweed raft farming, pelagic seafood cages, and deep-root dune palm agroforestry.

Mission 2.1: Seaweed Raft Deployment \& Propagation

Sub-process 2.1.1: Install 4 offshore submerged longlines for red seaweed (Gracilaria) and green sea lettuce (Ulva).

Sub-process 2.1.2: Dive with the underwater cutter tool to prune epiphytic micro-pests from the lines.

Sub-process 2.1.3: Harvest 100 kg of mature seaweed biothallus and hoist it to the boat pontoon.

Mission 2.2: Contained Seafood Cages \& RAS Hatchery

Sub-process 2.2.1: Stock closed nursery tanks with Mud Crab (Scylla serrata) and Black Tiger Prawn (Penaeus monodon).

Sub-process 2.2.2: Calibrate automated feeder to match biomass appetite, maintaining zero unconsumed pellet rot.

Sub-process 2.2.3: Route nursery bio-sludge through settleable solid separators to prevent any open-lagoon discharge.

Mission 2.3: Palm Canopy Construction in dec2

Sub-process 2.3.1: Plant 4 tree\_coconut in dec2.plot1 and 3 tree\_palmyra in dec2.plot2.

Sub-process 2.3.2: Interplant 2 tree\_casuarina along dec2.plot2 to act as an aerosol salt-spray shield.

Sub-process 2.3.3: Run solar desalination condensate lines to dec2.plot3 to supply fresh drip moisture, advancing trees to Stage 2.

Chapter 3: Off-Grid Microgrid \& Agro-Canopy Maturation
Focus: Wind energy, BESS deployment, tree harvesting, and sustainable composting.

Mission 3.1: Hybrid Wind \& BESS Grid Activation

Sub-process 3.1.1: Place 3 coastal wind micro-turbines along high-elevation bluffs.

Sub-process 3.1.2: Construct a 500 kWh Battery Energy Storage System (BESS) substation. Wire charging relays from wind and rooftop solar.

Sub-process 3.1.3: Balance variable nighttime wind drops using the BESS buffer, ensuring zero brownouts across aquaculture tank aeration systems.

Mission 3.2: Tree Maturation \& Nutrient Cycling

Sub-process 3.2.1: Tend dec2.plot1 and dec2.plot2 until trees reach STAGE\_3\_MATURE.

Sub-process 3.2.2: Harvest first yield: 30 green coconuts and 15 palmyra sap containers.

Sub-process 3.2.3: Process coconut husk fiber and fallen casuarina needles into moisture-retaining mulch, applying it across dec2.plot3 to reduce water evaporation by 50%.

Mission 3.3: Marine Life Biosphere Inspection

Sub-process 3.3.1: Conduct an underwater survey of the seaweed beds. Confirm that nursery fingerling biodiversity increased by +25% beneath the seaweed canopy.

Chapter 4: Zero-Carbon Processing \& The Big Jar Algae Scrubber
Focus: Food processing, seaweed transformation, and carbon abatement through algae bioreactors.

Mission 4.1: Processing Plant Operations

Sub-process 4.1.1: Install rooftop solar panels (120 kW capacity) on the onshore processing facility.

Sub-process 4.1.2: Process and rapid-freeze 200 kg of harvested prawns and mud crabs using clean electric refrigeration.

Sub-process 4.1.3: Run harvested seaweed through the solar dehydration racks; mill into dried seaweed sheets and seaweed snack chips.

Mission 4.2: Machine \& Transport Emissions Tracking

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

Chapter 5: Global Trade Passport \& The German Farm Corridor
Focus: Global trade certification, international supply chain execution, and unlocking Brazil.

Mission 5.1: Sea Health Index Equilibrium

Sub-process 5.1.1: Maintain SHI≥90 continuously across 3 consecutive game days while operating all facilities (both orchards dec1 and dec2 at Stage 3/4, seaweed lines, fish cages, and processing plant).

Mission 5.2: Product Certification \& Packing

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



