/**
 * Public Earth (and sample Mars) satellites for FPV — LEO / MEO / GEO regimes.
 * Mission blurbs are classroom-safe summaries of publicly described programs.
 */

export type OrbitRegime = "LEO" | "MEO" | "GEO" | "HEO";
export type AgencyId = "NASA" | "ESA" | "Roscosmos" | "CNSA" | "JAXA" | "ISRO" | "CSA" | "Commercial" | "International";

export type SatelliteEntry = {
  id: string;
  name: string;
  agency: AgencyId;
  /** Cospar-style or common designator */
  catalogId: string;
  regime: OrbitRegime;
  /** Typical altitude above surface, km (approximate, public figures) */
  altitudeKm: number;
  /** Inclination degrees (approx) */
  inclinationDeg: number;
  periodMin: number;
  parent: "earth" | "mars";
  /** Phase offset on the ring [0, 2π) */
  phase: number;
  /** Mission / program */
  mission: string;
  status: "Operational" | "Retired" | "Assembly" | "Science";
  launched: string;
  blurb: string;
  fact: string;
  /** Public mission highlight */
  missionDetail: string;
  /** Operating / leading country or union for flag display */
  operatorCountry: string;
  /** Emoji flag for HUD / 2D marker */
  flag: string;
  /** Bus body color (metal / insulation) */
  bodyColor: string;
  /** Gold / blue solar array tone */
  arrayColor: string;
  hasSolarArrays: boolean;
  /** Spacecraft class for drawing */
  craftType: "station" | "telescope" | "bus" | "constellation" | "probe";
  /** Library article for Read more */
  libraryId: string;
};

/** Regime colorimetry — consistent HUD / marker palette */
export const REGIME_STYLE: Record<
  OrbitRegime,
  { color: string; glow: string; label: string; bandKm: string }
> = {
  LEO: {
    color: "#6FBF9A",
    glow: "rgba(111,191,154,0.45)",
    label: "LEO",
    bandKm: "~160–2,000 km",
  },
  MEO: {
    color: "#7EB8C9",
    glow: "rgba(126,184,201,0.45)",
    label: "MEO",
    bandKm: "~2,000–35,786 km",
  },
  GEO: {
    color: "#E8C070",
    glow: "rgba(232,192,112,0.5)",
    label: "GEO",
    bandKm: "~35,786 km (geostationary)",
  },
  HEO: {
    color: "#C4896A",
    glow: "rgba(196,137,106,0.45)",
    label: "HEO",
    bandKm: "Highly elliptical",
  },
};

export const AGENCY_STYLE: Record<AgencyId, { color: string; short: string }> = {
  NASA: { color: "#4a9eff", short: "NASA" },
  ESA: { color: "#0066b3", short: "ESA" },
  Roscosmos: { color: "#e8b84a", short: "Roscosmos" },
  CNSA: { color: "#e85d4c", short: "CNSA" },
  JAXA: { color: "#c04040", short: "JAXA" },
  ISRO: { color: "#ff9933", short: "ISRO" },
  CSA: { color: "#d52b1e", short: "CSA" },
  Commercial: { color: "#a0a8b8", short: "Commercial" },
  International: { color: "#e8edf4", short: "Int'l" },
};

/**
 * Visual radius multipliers from planet surface radius in game units.
 * Exaggerated slightly so rings read clearly when Earth is large on-screen.
 * Real GEO ≈ 6.6 R⊕ from center; we use readable game proportions.
 */
export const REGIME_RADIUS_MULT: Record<OrbitRegime, number> = {
  LEO: 1.22,
  MEO: 2.1,
  GEO: 3.55,
  HEO: 4.2,
};

export const PUBLIC_SATELLITES: SatelliteEntry[] = [
  // —— LEO ——
  {
    id: "iss",
    name: "International Space Station",
    agency: "International",
    catalogId: "1998-067A",
    regime: "LEO",
    altitudeKm: 420,
    inclinationDeg: 51.6,
    periodMin: 93,
    parent: "earth",
    phase: 0.4,
    mission: "ISS Program",
    status: "Operational",
    launched: "1998– (assembly)",
    blurb: "Crewed laboratory in low Earth orbit",
    fact: "A football-field-scale station. Nations share modules, crews, and science. Continuous human presence since 2000.",
    missionDetail:
      "Joint NASA, Roscosmos, ESA, JAXA, and CSA program. Microgravity research, Earth observation, and a stepping stone for deep-space techniques.",
    operatorCountry: "International (NASA, Roscosmos, ESA, JAXA, CSA)",
    flag: "🌍",
    bodyColor: "#d8dee8",
    arrayColor: "#2a4a8a",
    hasSolarArrays: true,
    craftType: "station" as const,
    libraryId: "orbits",
  },
  {
    id: "css-tiangong",
    name: "Tiangong (CSS)",
    agency: "CNSA",
    catalogId: "2021-035A",
    regime: "LEO",
    altitudeKm: 390,
    inclinationDeg: 41.5,
    periodMin: 92,
    parent: "earth",
    phase: 2.1,
    mission: "China Space Station",
    status: "Operational",
    launched: "2021–",
    blurb: "Chinese multi-module space station",
    fact: "Tianhe core with Wentian and Mengtian labs. Crewed by Shenzhou; cargo by Tianzhou.",
    missionDetail:
      "CNSA’s permanent LEO outpost for life sciences, materials, and technology demonstrations under national human spaceflight plans.",
    operatorCountry: "China",
    flag: "🇨🇳",
    bodyColor: "#e8e0d8",
    arrayColor: "#1a3a6a",
    hasSolarArrays: true,
    craftType: "station" as const,
    libraryId: "orbits",
  },
  {
    id: "hubble",
    name: "Hubble Space Telescope",
    agency: "NASA",
    catalogId: "1990-037B",
    regime: "LEO",
    altitudeKm: 540,
    inclinationDeg: 28.5,
    periodMin: 95,
    parent: "earth",
    phase: 3.6,
    mission: "HST",
    status: "Operational",
    launched: "1990",
    blurb: "NASA/ESA optical observatory in LEO",
    fact: "Above the atmosphere for sharp UV/optical images. Serviced by astronauts; still producing science decades later.",
    missionDetail:
      "NASA flagship with ESA partnership. Famous for deep fields, exoplanet atmospheres, and tracking solar-system targets.",
    operatorCountry: "United States",
    flag: "🇺🇸",
    bodyColor: "#c0c8d4",
    arrayColor: "#3a5a9a",
    hasSolarArrays: true,
    craftType: "telescope" as const,
    libraryId: "orbits",
  },
  {
    id: "sentinel1",
    name: "Sentinel-1",
    agency: "ESA",
    catalogId: "2014-016A",
    regime: "LEO",
    altitudeKm: 693,
    inclinationDeg: 98.2,
    periodMin: 99,
    parent: "earth",
    phase: 5.0,
    mission: "Copernicus",
    status: "Operational",
    launched: "2014+",
    blurb: "ESA radar Earth observers",
    fact: "C-band SAR sees through clouds — ice, floods, ships, and ground motion for the Copernicus program.",
    missionDetail:
      "Part of EU Copernicus. Provides free open data for climate, disaster response, and maritime awareness.",
    operatorCountry: "European Union / ESA states",
    flag: "🇪🇺",
    bodyColor: "#b8c0cc",
    arrayColor: "#1a4a7a",
    hasSolarArrays: true,
    craftType: "bus" as const,
    libraryId: "orbits",
  },
  {
    id: "starlink-cluster",
    name: "Starlink (constellation)",
    agency: "Commercial",
    catalogId: "Starlink",
    regime: "LEO",
    altitudeKm: 550,
    inclinationDeg: 53,
    periodMin: 95,
    parent: "earth",
    phase: 1.2,
    mission: "Broadband constellation",
    status: "Operational",
    launched: "2019–",
    blurb: "Large LEO internet constellation",
    fact: "Thousands of small sats in shells around ~500–600 km. Represents modern commercial mega-constellations.",
    missionDetail:
      "SpaceX commercial broadband. Shown as a representative shell marker — not individual vehicles.",
    operatorCountry: "United States (SpaceX)",
    flag: "🇺🇸",
    bodyColor: "#a8b0bc",
    arrayColor: "#2a5080",
    hasSolarArrays: true,
    craftType: "constellation" as const,
    libraryId: "orbits",
  },
  {
    id: "terra",
    name: "Terra",
    agency: "NASA",
    catalogId: "1999-068A",
    regime: "LEO",
    altitudeKm: 705,
    inclinationDeg: 98.2,
    periodMin: 99,
    parent: "earth",
    phase: 4.4,
    mission: "EOS Terra",
    status: "Operational",
    launched: "1999",
    blurb: "NASA Earth Observing System flagship",
    fact: "Sun-synchronous polar orbit. MODIS and other instruments track climate, vegetation, and fires.",
    missionDetail: "Long-running NASA Earth science mission in the A-Train era of coordinated polar orbiters.",
    operatorCountry: "United States",
    flag: "🇺🇸",
    bodyColor: "#c8d0dc",
    arrayColor: "#2a5a9a",
    hasSolarArrays: true,
    craftType: "bus" as const,
    libraryId: "orbits",
  },
  // —— MEO ——
  {
    id: "gps-block",
    name: "GPS (Navstar)",
    agency: "NASA",
    catalogId: "GPS constellation",
    regime: "MEO",
    altitudeKm: 20180,
    inclinationDeg: 55,
    periodMin: 718,
    parent: "earth",
    phase: 0.8,
    mission: "Global Positioning System",
    status: "Operational",
    launched: "1978–",
    blurb: "U.S. GNSS constellation in MEO",
    fact: "About 12-hour orbits. Timing signals enable navigation worldwide. Operated by the U.S. Space Force.",
    missionDetail:
      "Representative GPS plane marker. Civil signals are free; precise timing underpins science and logistics.",
    operatorCountry: "United States",
    flag: "🇺🇸",
    bodyColor: "#bcc4d0",
    arrayColor: "#3a6aaa",
    hasSolarArrays: true,
    craftType: "bus" as const,
    libraryId: "orbits",
  },
  {
    id: "galileo",
    name: "Galileo",
    agency: "ESA",
    catalogId: "Galileo constellation",
    regime: "MEO",
    altitudeKm: 23222,
    inclinationDeg: 56,
    periodMin: 676,
    parent: "earth",
    phase: 2.5,
    mission: "European GNSS",
    status: "Operational",
    launched: "2011–",
    blurb: "ESA/EU civilian navigation system",
    fact: "Independent European GNSS in MEO with high-accuracy civil services.",
    missionDetail: "Operated for the EU. Complements GPS/GLONASS/BeiDou for resilient PNT.",
    operatorCountry: "European Union / ESA states",
    flag: "🇪🇺",
    bodyColor: "#b0b8c8",
    arrayColor: "#1a5080",
    hasSolarArrays: true,
    craftType: "bus" as const,
    libraryId: "orbits",
  },
  {
    id: "glonass",
    name: "GLONASS",
    agency: "Roscosmos",
    catalogId: "GLONASS constellation",
    regime: "MEO",
    altitudeKm: 19140,
    inclinationDeg: 64.8,
    periodMin: 676,
    parent: "earth",
    phase: 4.0,
    mission: "Russian GNSS",
    status: "Operational",
    launched: "1982–",
    blurb: "Russian global navigation constellation",
    fact: "MEO planes with higher inclination — strong high-latitude coverage.",
    missionDetail: "Roscosmos-operated GNSS. Dual-use civil/military timing and navigation.",
    operatorCountry: "Russia",
    flag: "🇷🇺",
    bodyColor: "#c4b8a8",
    arrayColor: "#4a6090",
    hasSolarArrays: true,
    craftType: "bus" as const,
    libraryId: "orbits",
  },
  {
    id: "beidou",
    name: "BeiDou",
    agency: "CNSA",
    catalogId: "BeiDou constellation",
    regime: "MEO",
    altitudeKm: 21528,
    inclinationDeg: 55,
    periodMin: 773,
    parent: "earth",
    phase: 5.5,
    mission: "BeiDou Navigation",
    status: "Operational",
    launched: "2000–",
    blurb: "Chinese GNSS (MEO + GEO/IGSO mix)",
    fact: "Global service uses MEO craft; regional coverage also uses GEO/IGSO satellites.",
    missionDetail: "CNSA system with global PNT and messaging services — shown here on a MEO ring.",
    operatorCountry: "China",
    flag: "🇨🇳",
    bodyColor: "#d0c4b8",
    arrayColor: "#8a3030",
    hasSolarArrays: true,
    craftType: "bus" as const,
    libraryId: "orbits",
  },
  // —— GEO ——
  {
    id: "goes16",
    name: "GOES-16",
    agency: "NASA",
    catalogId: "2016-071A",
    regime: "GEO",
    altitudeKm: 35786,
    inclinationDeg: 0,
    periodMin: 1436,
    parent: "earth",
    phase: 0.2,
    mission: "GOES-R series",
    status: "Operational",
    launched: "2016",
    blurb: "NOAA weather satellite (NASA launch partnership)",
    fact: "Geostationary — appears fixed over the Americas. Watches storms and space weather continuously.",
    missionDetail: "NOAA operational weather bird; NASA supported development/launch of GOES-R class.",
    operatorCountry: "United States",
    flag: "🇺🇸",
    bodyColor: "#d0d8e0",
    arrayColor: "#2a6090",
    hasSolarArrays: true,
    craftType: "bus" as const,
    libraryId: "orbits",
  },
  {
    id: "mtg",
    name: "Meteosat (MTG class)",
    agency: "ESA",
    catalogId: "Meteosat / MTG",
    regime: "GEO",
    altitudeKm: 35786,
    inclinationDeg: 0,
    periodMin: 1436,
    parent: "earth",
    phase: 1.9,
    mission: "EUMETSAT / ESA weather",
    status: "Operational",
    launched: "1977– (series)",
    blurb: "European geostationary weather watch",
    fact: "Fixed over Africa/Europe longitude. Foundation of European severe-weather monitoring.",
    missionDetail: "EUMETSAT operates; ESA develops next-gen MTG imagers and sounders.",
    operatorCountry: "European Union / ESA states",
    flag: "🇪🇺",
    bodyColor: "#c8d0e0",
    arrayColor: "#1a4880",
    hasSolarArrays: true,
    craftType: "bus" as const,
    libraryId: "orbits",
  },
  {
    id: "elektro-l",
    name: "Elektro-L",
    agency: "Roscosmos",
    catalogId: "Elektro-L",
    regime: "GEO",
    altitudeKm: 35786,
    inclinationDeg: 0,
    periodMin: 1436,
    parent: "earth",
    phase: 3.3,
    mission: "Russian weather GEO",
    status: "Operational",
    launched: "2011+",
    blurb: "Roscosmos geostationary weather series",
    fact: "Views the full Earth disk for hydrometeorology and space weather from GEO.",
    missionDetail: "Russian Federal Space Agency weather program in the GEO belt.",
    operatorCountry: "Russia",
    flag: "🇷🇺",
    bodyColor: "#d4c8b8",
    arrayColor: "#506080",
    hasSolarArrays: true,
    craftType: "bus" as const,
    libraryId: "orbits",
  },
  {
    id: "fy4",
    name: "Fengyun-4",
    agency: "CNSA",
    catalogId: "FY-4",
    regime: "GEO",
    altitudeKm: 35786,
    inclinationDeg: 0,
    periodMin: 1436,
    parent: "earth",
    phase: 4.8,
    mission: "Chinese weather GEO",
    status: "Operational",
    launched: "2016+",
    blurb: "CNSA/CMA geostationary meteorology",
    fact: "High-cadence full-disk imaging for Asia-Pacific weather.",
    missionDetail: "China Meteorological Administration operates; CNSA launch heritage.",
    operatorCountry: "China",
    flag: "🇨🇳",
    bodyColor: "#e0d4c8",
    arrayColor: "#903030",
    hasSolarArrays: true,
    craftType: "bus" as const,
    libraryId: "orbits",
  },
  {
    id: "jwst",
    name: "James Webb Space Telescope",
    agency: "NASA",
    catalogId: "2021-130A",
    regime: "HEO",
    altitudeKm: 1500000,
    inclinationDeg: 0,
    periodMin: 0,
    parent: "earth",
    phase: 0.6,
    mission: "JWST (Sun–Earth L2)",
    status: "Science",
    launched: "2021",
    blurb: "Infrared observatory near Sun–Earth L2",
    fact: "Not LEO — about 1.5 million km from Earth at L2. NASA/ESA/CSA partnership.",
    missionDetail:
      "Shown near Earth for navigation context; true station is Sun–Earth L2 halo, not a closed LEO ring.",
    operatorCountry: "United States",
    flag: "🇺🇸",
    bodyColor: "#e8dcc8",
    arrayColor: "#c9a86f",
    hasSolarArrays: true,
    craftType: "telescope" as const,
    libraryId: "distance",
  },
  // —— Mars sample markers ——
  {
    id: "mro",
    name: "Mars Reconnaissance Orbiter",
    agency: "NASA",
    catalogId: "2005-029A",
    regime: "LEO",
    altitudeKm: 300,
    inclinationDeg: 93,
    periodMin: 112,
    parent: "mars",
    phase: 1.0,
    mission: "MRO",
    status: "Operational",
    launched: "2005",
    blurb: "NASA high-resolution Mars orbiter",
    fact: "HiRISE camera maps landing sites and climate. Relay for surface rovers.",
    missionDetail: "Critical infrastructure for Perseverance/Curiosity data relay and site certification.",
    operatorCountry: "United States",
    flag: "🇺🇸",
    bodyColor: "#c4896a",
    arrayColor: "#2a5080",
    hasSolarArrays: true,
    craftType: "probe" as const,
    libraryId: "moxie",
  },
  {
    id: "tgo",
    name: "Trace Gas Orbiter",
    agency: "ESA",
    catalogId: "2016-017A",
    regime: "LEO",
    altitudeKm: 400,
    inclinationDeg: 74,
    periodMin: 120,
    parent: "mars",
    phase: 2.8,
    mission: "ExoMars TGO",
    status: "Operational",
    launched: "2016",
    blurb: "ESA–Roscosmos Mars atmosphere orbiter",
    fact: "Hunts trace gases (including methane) and relays lander data.",
    missionDetail: "ExoMars program partnership; aerobraked into science orbit.",
    operatorCountry: "European Union / ESA states",
    flag: "🇪🇺",
    bodyColor: "#b07050",
    arrayColor: "#1a4880",
    hasSolarArrays: true,
    craftType: "probe" as const,
    libraryId: "moxie",
  },
];

export function satellitesForParent(parent: "earth" | "mars"): SatelliteEntry[] {
  return PUBLIC_SATELLITES.filter((s) => s.parent === parent);
}

export function getSatellite(id: string): SatelliteEntry | undefined {
  return PUBLIC_SATELLITES.find((s) => s.id === id);
}

/** World position of a satellite given parent planet world position and planet radius. */
export function satWorldPos(
  sat: SatelliteEntry,
  parentPos: { x: number; y: number; z: number },
  parentRadius: number,
  simT: number,
): { x: number; y: number; z: number } {
  const mult = REGIME_RADIUS_MULT[sat.regime];
  // JWST-style HEO: push farther on a slow halo-like offset
  const R = parentRadius * (sat.regime === "HEO" ? 5.5 : mult);
  const incl = (sat.inclinationDeg * Math.PI) / 180;
  // Angular rate: faster in LEO
  const rate =
    sat.regime === "LEO" ? 0.55 : sat.regime === "MEO" ? 0.18 : sat.regime === "GEO" ? 0.04 : 0.02;
  const ang = sat.phase + simT * rate;
  const x = Math.cos(ang) * R;
  const z = Math.sin(ang) * R;
  const y = Math.sin(ang * 0.5) * Math.sin(incl) * R * 0.35;
  return {
    x: parentPos.x + x,
    y: parentPos.y + y,
    z: parentPos.z + z,
  };
}

export function regimeLesson(regime: OrbitRegime): string {
  switch (regime) {
    case "LEO":
      return "Low Earth Orbit: short periods (~90 min), atmospheric drag matters, Earth fills the view. ISS and many Earth-observers live here.";
    case "MEO":
      return "Medium Earth Orbit: home of GNSS (GPS, Galileo, GLONASS, BeiDou). Periods ~12 h; Earth is smaller, coverage is global.";
    case "GEO":
      return "Geostationary Orbit: period matches Earth’s day so the sat stays over one longitude. Weather and telecom birds prefer this belt.";
    case "HEO":
      return "Highly elliptical / special orbits: long dwell over high latitudes or Lagrange-region stations like JWST at Sun–Earth L2.";
  }
}
