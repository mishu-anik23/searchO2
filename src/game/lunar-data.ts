export interface ScienceSource {
  title: string;
  organization: string;
  url: string;
}

export interface LunarFeature {
  id: string;
  name: string;
  type: "pole" | "crater" | "basin" | "psr" | "mountain" | "ridge" | "centralPeak" | "resource" | "science";
  latitude: number;
  longitude: number;
  diameterKm?: number;
  depthKm?: number;
  region?: string;
  resourceInterest?: string;
  illuminationStatus?: string;
  waterIceEvidence?: string;
  scientificImportance?: string;
  status: "OBSERVED" | "STUDIED" | "PROPOSED" | "FUTURE CONCEPT";
  evidence: string;
  summary: string;
  why: string;
  limitation: string;
  sources: ScienceSource[];
}

const water: ScienceSource = {
  title: "Moon Water and Ices",
  organization: "NASA Science",
  url: "https://science.nasa.gov/moon/moon-water-and-ices/",
};
const southPole: ScienceSource = {
  title: "The Lunar South Pole Region",
  organization: "NASA",
  url: "https://www.nasa.gov/reference/moonbase-environment/",
};
const shackleton: ScienceSource = {
  title: "Shackleton Crater’s Illuminated Rim & Shadowed Interior",
  organization: "NASA Science",
  url: "https://science.nasa.gov/resource/shackleton-craters-illuminated-rim-shadowed-interior/",
};
const psr: ScienceSource = {
  title: "LRO Permanently Shadowed Regions",
  organization: "NASA Lunar Reconnaissance Orbiter",
  url: "https://science.nasa.gov/wp-content/uploads/2024/01/lro-litho5-shadowed.pdf",
};
const basin: ScienceSource = {
  title: "What is the South Pole-Aitken Basin?",
  organization: "NASA Science",
  url: "https://science.nasa.gov/moon/lunar-craters/what-is-the-south-pole-aitken-basin/",
};
const regolith: ScienceSource = {
  title: "How Ingredients for Water Could Be Made on the Surface of Moon",
  organization: "NASA Science",
  url: "https://science.nasa.gov/solar-system/how-ingredients-for-water-could-be-made-on-the-surface-of-moon/",
};
const electrolysis: ScienceSource = {
  title: "Production of Oxygen from Lunar Regolith by Molten Oxide Electrolysis",
  organization: "NASA Technical Reports Server",
  url: "https://ntrs.nasa.gov/citations/20090017897",
};
const recentMre: ScienceSource = {
  title: "Large-Scale Demonstration of Molten Regolith Electrolysis for Oxygen Production in a Relevant Environment",
  organization: "NASA Technical Reports Server",
  url: "https://ntrs.nasa.gov/citations/20260006167",
};
const hydrogenReduction: ScienceSource = {
  title: "Lunar Regolith Simulant Feed System for a Hydrogen Reduction Reactor System",
  organization: "NASA Technical Reports Server",
  url: "https://ntrs.nasa.gov/citations/20110011479",
};
const carbothermal: ScienceSource = {
  title: "Prototype Demonstration of Solar Carbothermal System to Extract Oxygen from Regolith",
  organization: "NASA Technical Reports Server",
  url: "https://ntrs.nasa.gov/citations/20260004073",
};
const waterElectrolysis: ScienceSource = {
  title: "ISRU Advanced Alkaline Electrolyzer",
  organization: "NASA TechPort",
  url: "https://techport.nasa.gov/projects/116371",
};
const usgsNames: ScienceSource = {
  title: "Mons Mouton — Gazetteer of Planetary Nomenclature",
  organization: "USGS / IAU",
  url: "https://planetarynames.wr.usgs.gov/Feature/16070",
};
const tychoPeak: ScienceSource = {
  title: "Tycho Crater’s Central Peak on the Moon",
  organization: "NASA Science",
  url: "https://science.nasa.gov/resource/tycho-craters-central-peak-on-the-moon/",
};

export const LUNAR_FEATURES: LunarFeature[] = [
  {
    id: "north-pole",
    name: "North Pole",
    type: "pole",
    latitude: 90,
    longitude: 0,
    status: "OBSERVED",
    evidence: "Polar illumination and shadowing studied by orbiters",
    summary: "The lunar pole sits in a complex landscape of crater rims and deep shadows.",
    why: "Illumination changes sharply with local topography; permanently shadowed terrain is of interest for volatile research.",
    limitation: "This globe marker is a geographic locator, not a resource map.",
    sources: [southPole, psr],
  },
  {
    id: "south-pole",
    name: "South Pole",
    type: "pole",
    latitude: -90,
    longitude: 0,
    status: "OBSERVED",
    evidence: "Orbital topography and illumination observations",
    summary: "A rugged polar region with nearby dark cold traps and elevated terrain that can receive sunlight.",
    why: "Some exploration concepts seek to pair access to shadowed terrain with power and communications on illuminated high ground.",
    limitation: "Lighting and access vary locally and over time; this view is not a landing-site assessment.",
    sources: [southPole, psr],
  },
  {
    id: "shackleton",
    name: "Shackleton Crater",
    type: "crater",
    latitude: -89.9,
    longitude: 0,
    diameterKm: 21,
    region: "South Pole",
    status: "OBSERVED",
    evidence: "Lunar orbit observations of illuminated rim and shadowed interior",
    summary:
      "A ~21 km impact crater close to the South Pole, with a permanently shadowed interior and portions of its rim receiving sunlight.",
    why: "It is scientifically interesting for polar volatile studies and highlights the engineering trade-off between light and cold traps.",
    limitation: "A potential ice target is not a proven commercially exploitable reserve.",
    sources: [shackleton, water],
  },
  {
    id: "cabeus",
    name: "Cabeus Crater",
    type: "crater",
    latitude: -84.9,
    longitude: -35.5,
    status: "OBSERVED",
    evidence: "LCROSS impact plume observations and orbital measurements",
    summary: "A permanently shadowed polar crater studied for water and other volatile signatures.",
    why: "LCROSS observations detected water in material excavated from the crater's shadowed region.",
    limitation: "Detection does not establish a uniform concentration or ease of extraction across the crater.",
    sources: [water],
  },
  {
    id: "haworth",
    name: "Haworth Crater",
    type: "crater",
    latitude: -87.4,
    longitude: 5.2,
    status: "OBSERVED",
    evidence: "Polar terrain and illumination observations",
    summary: "A high-latitude crater in the South Pole region.",
    why: "Its polar setting makes it relevant to studies of extreme illumination and cold-trap environments.",
    limitation: "Marker position is approximate; no local resource abundance is asserted.",
    sources: [southPole, psr],
  },
  {
    id: "shoemaker",
    name: "Shoemaker Crater",
    type: "crater",
    latitude: -88.1,
    longitude: 45.0,
    status: "OBSERVED",
    evidence: "Lunar orbital observations",
    summary: "A crater near the lunar South Pole with permanently shadowed terrain.",
    why: "Polar craters help scientists investigate how volatiles may be delivered, trapped, and altered.",
    limitation: "The marker indicates a feature location, not confirmed ice at a specific point.",
    sources: [water, psr],
  },
  {
    id: "faustini",
    name: "Faustini Crater",
    type: "crater",
    latitude: -87.3,
    longitude: 77.1,
    status: "OBSERVED",
    evidence: "Lunar orbital observations",
    summary: "A South Pole crater with shadowed portions.",
    why: "Its terrain is part of the broader polar cold-trap science region.",
    limitation: "Resource quantity, depth, and accessibility remain location-dependent and uncertain.",
    sources: [southPole, psr],
  },
  {
    id: "mons-mouton",
    name: "Mons Mouton",
    type: "mountain",
    latitude: -84.6,
    longitude: 31,
    diameterKm: 130,
    region: "South Pole / Nobile crater",
    status: "OBSERVED",
    evidence: "Named and mapped by the USGS/IAU Gazetteer; terrain imaged by NASA",
    summary: "A broad, flat-topped mountain near the South Pole, adjacent to Nobile Crater.",
    why: "Polar high ground can combine illuminated terrain with nearby shadowed areas, making topography important for exploration planning.",
    limitation:
      "This marker identifies a landform; it does not rate landing safety, illumination duration, or ice abundance.",
    sources: [
      usgsNames,
      {
        title: "Moon Mountain Name Honors NASA Mathematician Melba Mouton",
        organization: "NASA",
        url: "https://www.nasa.gov/people-of-nasa/moon-mountain-name-honors-nasa-mathematician-melba-mouton/",
      },
    ],
  },
  {
    id: "tycho",
    name: "Tycho Crater",
    type: "crater",
    latitude: -43.37,
    longitude: -11.32,
    diameterKm: 82,
    region: "Southern highlands",
    status: "OBSERVED",
    evidence: "Mapped by NASA’s Lunar Reconnaissance Orbiter",
    summary: "A prominent, relatively young impact crater in the southern lunar highlands.",
    why: "Its fresh ejecta and central peak expose geology shaped by a large impact.",
    limitation: "The marker is a geographic locator, not an assessment of resources or landing conditions.",
    sources: [tychoPeak],
  },
  {
    id: "tycho-peak",
    name: "Tycho central peak",
    type: "centralPeak",
    latitude: -43.37,
    longitude: -11.32,
    region: "Tycho Crater",
    status: "OBSERVED",
    evidence: "Lunar Reconnaissance Orbiter images and topography",
    summary: "A peak complex uplifted in Tycho’s impact structure, with exposed rock fragments along its slopes.",
    why: "Central peaks bring material from depth into view and help scientists study impact processes.",
    limitation: "The marker points to the crater center; the peak complex spans a broader area.",
    sources: [tychoPeak],
  },
  {
    id: "spa",
    name: "South Pole–Aitken Basin",
    type: "basin",
    latitude: -53,
    longitude: 180,
    diameterKm: 2500,
    region: "Far-side southern highlands",
    status: "OBSERVED",
    evidence: "Global lunar topography and geologic mapping",
    summary: "An enormous ~2,500 km ancient impact basin spanning much of the Moon’s far-side southern highlands.",
    why: "Its scale and exposed deep crustal and possibly mantle materials make it a major geological science target.",
    limitation: "This locator is schematic; basin boundaries require authoritative geologic map layers.",
    sources: [basin],
  },
  {
    id: "psr-shackleton",
    name: "Permanently shadowed terrain",
    type: "psr",
    latitude: -89.6,
    longitude: 16,
    region: "South Pole",
    illuminationStatus: "Essentially no direct sunlight",
    waterIceEvidence: "Volatile interest; not an ice map",
    status: "OBSERVED",
    evidence: "Modeled illumination constrained by lunar topography",
    summary:
      "The Moon’s axial tilt is only about 1.5°. Near the poles, crater walls can block the low Sun and leave some ground in persistent shadow.",
    why: "Very cold conditions can preserve volatile materials over geologic time.",
    limitation: "The shaded overlay here is illustrative, not a pixel-accurate PSR dataset or ice detection map.",
    sources: [psr, water],
  },
  {
    id: "illum-ridge",
    name: "High-illumination ridge",
    type: "ridge",
    latitude: -89.0,
    longitude: 25,
    status: "OBSERVED",
    evidence: "Polar illumination varies with terrain and time",
    summary: "Elevated polar terrain can receive more sunlight than nearby crater floors.",
    why: "Illumination can support solar-power concepts near shadowed science targets.",
    limitation: "No site here is claimed to receive permanent sunlight; this marker is qualitative.",
    sources: [southPole],
  },
  {
    id: "regolith",
    name: "Lunar regolith",
    type: "resource",
    latitude: -86,
    longitude: -15,
    region: "Widespread surface layer",
    resourceInterest: "Oxygen-bearing minerals",
    status: "OBSERVED",
    evidence: "Samples returned by lunar missions and remote sensing",
    summary: "A layer of impact-fragmented dust, soil-like grains, glass, and rock covering the Moon.",
    why: "Oxygen is chemically bound in minerals such as silica and iron oxides, so regolith is a potential feedstock for future oxygen-extraction processes.",
    limitation:
      "Regolith composition varies by location; oxygen is not freely available as breathable air. This is a broad resource class, not a measured local reserve.",
    sources: [regolith, electrolysis],
  },
  {
    id: "water-ice",
    name: "Polar water-ice research",
    type: "resource",
    latitude: -86.5,
    longitude: 44,
    region: "Polar cold traps",
    resourceInterest: "Water and other volatiles",
    waterIceEvidence: "Evidence varies by site and instrument",
    status: "OBSERVED",
    evidence: "Water detected by multiple lunar missions; distribution and form vary",
    summary:
      "Orbital and impact experiments provide evidence for lunar water, including ice in some permanently shadowed polar regions.",
    why: "If accessible and recoverable, water could support science, life-support research, and a possible feedstock for electrolysis.",
    limitation:
      "This marker denotes a regional research topic, not confirmed ice at this coordinate, concentration, depth, or an exploitable reserve.",
    sources: [water, psr],
  },
  {
    id: "science-site",
    name: "Lunar science target",
    type: "science",
    latitude: 20,
    longitude: -30,
    status: "OBSERVED",
    evidence: "Global lunar geology",
    summary: "The Moon preserves impact and volcanic history in its surface geology.",
    why: "Comparing highlands, basins, and maria helps reconstruct lunar evolution.",
    limitation: "Generic locator only; consult mission datasets for named geological units.",
    sources: [southPole],
  },
];

export const OXYGEN_STEPS = [
  {
    title: "Find resources",
    detail: "Map terrain, mineralogy, temperatures, and local illumination before selecting a site.",
    label: "SURVEY",
  },
  {
    title: "Excavate regolith",
    detail: "A conceptual mining rover gathers a selected feed. Lunar dust and rough terrain complicate machinery.",
    label: "COLLECT",
  },
  {
    title: "Prepare feed",
    detail: "Crushing, screening, or beneficiation may be needed; the best preparation depends on the chosen process.",
    label: "PREPARE",
  },
  {
    title: "Heat the oxides",
    detail:
      "For molten oxide electrolysis, oxide-rich material must be heated until molten. This demands substantial energy.",
    label: "HEAT",
  },
  {
    title: "Electrochemical separation",
    detail:
      "Electrical current drives oxygen ions from molten oxides toward an electrode, leaving metal-rich products.",
    label: "SEPARATE",
  },
  {
    title: "Collect and condition O₂",
    detail: "Conceptual equipment captures oxygen gas, removes contaminants, and manages pressure and temperature.",
    label: "COLLECT O₂",
  },
  {
    title: "Store for later use",
    detail:
      "Storage design depends on the intended use and thermal control. A lunar production plant is a future concept.",
    label: "STORE",
  },
];

export const WATER_STEPS = [
  {
    title: "Map a polar cold trap",
    detail: "Identify shadowed terrain and assess temperature, slope, and access. A shadow map is not an ice map.",
    label: "LOCATE",
  },
  {
    title: "Collect icy regolith",
    detail:
      "A future rover or excavator would gather a selected sample; abundance and depth must be measured in place.",
    label: "EXCAVATE",
  },
  {
    title: "Warm and capture vapor",
    detail: "Apply heat in a contained system so released water vapor can be captured rather than lost to vacuum.",
    label: "EXTRACT",
  },
  {
    title: "Condense and purify water",
    detail: "Trap and condition the water. Real polar material may contain other volatiles and contaminants.",
    label: "PURIFY",
  },
  {
    title: "Split water by electrolysis",
    detail: "Electrical current separates water into hydrogen and oxygen: 2 H₂O → 2 H₂ + O₂.",
    label: "ELECTROLYZE",
  },
  {
    title: "Manage both products",
    detail: "Hydrogen can be stored or reused in compatible processes; losses and makeup supply still matter.",
    label: "SEPARATE",
  },
  {
    title: "Condition and store O₂",
    detail:
      "Purify and store oxygen for a future life-support or propellant system; this complete lunar plant is conceptual.",
    label: "STORE",
  },
];

export const TECHNOLOGIES = [
  {
    id: "mre",
    name: "Molten regolith electrolysis",
    status: "LABORATORY DEMONSTRATION / TECHNOLOGY DEVELOPMENT",
    summary:
      "Melt oxide-rich feed and use electrical current to separate oxygen; metal-rich by-products may be recovered. A recent test used lunar regolith simulant in a relevant environment; no lunar plant is operating.",
    source: recentMre,
  },
  {
    id: "hydrogen",
    name: "Hydrogen reduction",
    status: "LABORATORY / TECHNOLOGY DEVELOPMENT",
    summary:
      "Hot hydrogen can reduce some minerals to water vapor, which is condensed and electrolyzed. Hydrogen recycle is possible in principle; process losses and replenishment still matter.",
    source: hydrogenReduction,
  },
  {
    id: "carbothermal",
    name: "Carbothermal reduction",
    status: "LABORATORY DEMONSTRATION / TECHNOLOGY DEVELOPMENT",
    summary:
      "Carbon-based reduction transfers oxygen from mineral feed into gases such as CO; later separation is needed. Tests with simulated regolith do not demonstrate an operating lunar plant.",
    source: carbothermal,
  },
  {
    id: "water",
    name: "Water electrolysis",
    status: "LABORATORY / TECHNOLOGY DEVELOPMENT",
    summary:
      "If water is located, extracted, and conditioned: 2 H₂O → 2 H₂ + O₂. Electrolyzer hardware has been tested with lunar-ice-like contaminants; the full mining-to-storage chain is a future lunar application.",
    source: waterElectrolysis,
  },
];
