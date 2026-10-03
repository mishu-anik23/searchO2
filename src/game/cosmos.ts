/** Compressed inner solar system + sky catalog for the flight camera. */

export type V = { x: number; y: number; z: number };
export type BodyKind = "sun" | "planet" | "moon" | "star" | "galaxy";

export type SkyBody = {
  id: string;
  name: string;
  kind: BodyKind;
  r: number;
  color: string;
  orbit?: number;
  period: number;
  phase: number;
  tilt: number;
  parent?: string;
  dist: string;
  blurb: string;
  fact: string;
};

export type LessonId = "hohmann" | "visviva" | "burn" | "gravity" | "coast" | "window";

export const LESSONS: Record<LessonId, { title: string; body: string; libraryId: string; formula: string }> = {
  hohmann: {
    title: "Hohmann transfer",
    body: "Burn once to leave Earth’s circle, coast on a long oval that kisses the next orbit, burn again to stay. Two burns, lots of waiting — the cheap path.",
    libraryId: "hohmann",
    formula: "Transfer oval a = (r₁ + r₂) / 2. Two Δv burns, one long coast.",
  },
  visviva: {
    title: "Closer means faster",
    body: "A planet (or a ship) speeds up as it falls toward the Sun and slows as it climbs away. Kepler saw this in Mars’s path 400 years ago.",
    libraryId: "orbits",
    formula: "vis-viva: v² = GM (2/r − 1/a). Small r → large v.",
  },
  burn: {
    title: "Burns change the oval",
    body: "In vacuum, engines do not ‘keep you going.’ They change your orbit. Fire along the nose (prograde) and the far side of the oval rises.",
    libraryId: "orbits",
    formula: "Prograde burn raises apoapsis. Retrograde lowers it.",
  },
  gravity: {
    title: "An orbit is a fall",
    body: "The Sun pulls, and worlds fall — forever missing it. That curved miss is an orbit. No air, no wings, no engine required to stay on the path.",
    libraryId: "orbits",
    formula: "Gravity provides the inward acceleration; sideways speed keeps you missing the Sun.",
  },
  coast: {
    title: "Coast is the point",
    body: "Most of a transfer is engines off. Speed stays the same until the next burn. That is why a sideways nudge is expensive: it is extra speed you must cancel later.",
    libraryId: "hohmann",
    formula: "No thrust → velocity is constant. The path is still a curve because the Sun keeps pulling.",
  },
  window: {
    title: "Where the planet will be",
    body: "We do not aim at where Mars is. We aim at where Mars will be months from now. Miss the window, wait ~26 months or spend a lot more fuel.",
    libraryId: "windows",
    formula: "Lead the target: intercept = where it will be after the coast, not where it is now.",
  },
};

/** Compressed units: Earth's orbit radius = 72 = 1 AU. */
export const AU = 72;

export const BODIES: SkyBody[] = [
  {
    id: "sun",
    name: "Sun",
    kind: "sun",
    r: 20,
    color: "#fff4d0",
    period: 0,
    phase: 0,
    tilt: 0,
    dist: "1 AU from Earth (150 million km)",
    blurb: "G2 star · the only engine this neighborhood has",
    fact: "Every orbit in this view is a long fall around this one star. Its gravity is the reason Earth, the Moon, and Mars stay on their ovals.",
  },
  {
    id: "mercury",
    name: "Mercury",
    kind: "planet",
    r: 2.1,
    color: "#9a9086",
    orbit: 34,
    period: 88,
    phase: 1.2,
    tilt: 0.02,
    dist: "0.39 AU",
    blurb: "Rocky · no air · 59-day spin",
    fact: "Closest world to the Sun. Days are longer than its year. The surface swings from oven-hot to night-cold because there is almost no air to hold heat.",
  },
  {
    id: "venus",
    name: "Venus",
    kind: "planet",
    r: 5.2,
    color: "#d9c7a0",
    orbit: 52,
    period: 225,
    phase: 4.0,
    tilt: 0.03,
    dist: "0.72 AU",
    blurb: "Earth’s size · toxic CO₂ air",
    fact: "A twin of Earth by size, but a runaway greenhouse. The clouds are sulfuric acid. Surface pressure is like 900 m under Earth’s sea.",
  },
  {
    id: "earth",
    name: "Earth",
    kind: "planet",
    r: 6.4,
    color: "#3d7ab0",
    orbit: 72,
    period: 365,
    phase: 0.15,
    tilt: 0.04,
    dist: "1 AU · home",
    blurb: "The only world we know with liquid oceans and free oxygen",
    fact: "Blue because of oceans and a thick N₂/O₂ sky. That oxygen is why this whole program exists — we have to remake it on the Moon and Mars.",
  },
  {
    id: "moon",
    name: "Moon",
    kind: "moon",
    r: 2.6,
    color: "#c5d0dc",
    orbit: 16,
    period: 27,
    phase: 2.15,
    tilt: 0.08,
    parent: "earth",
    dist: "384,400 km from Earth",
    blurb: "1/6 g · 1.3 light-seconds",
    fact: "Light takes 1.3 seconds. A coasting stack takes about three days. Polar craters hold ice — the oxygen plant’s first ingredient.",
  },
  {
    id: "mars",
    name: "Mars",
    kind: "planet",
    r: 4.6,
    color: "#c4896a",
    orbit: 102,
    period: 687,
    phase: 3.5,
    tilt: 0.06,
    dist: "1.52 AU",
    blurb: "0.38 g · thin CO₂ air · months away",
    fact: "A Hohmann coast is ~7 months. Air is 95% CO₂ — the feedstock for MOXIE. Ice hides under dust. That is why a Mars ticket costs more than a Moon ticket.",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "planet",
    r: 13,
    color: "#d4b48a",
    orbit: 168,
    period: 4333,
    phase: 5.4,
    tilt: 0.02,
    dist: "5.2 AU",
    blurb: "Gas giant · no solid ground",
    fact: "More mass than all the other planets together. Its gravity herds asteroids. The stripes are fast winds in hydrogen and helium.",
  },
  {
    id: "saturn",
    name: "Saturn",
    kind: "planet",
    r: 10,
    color: "#e3d0a8",
    orbit: 218,
    period: 10759,
    phase: 0.7,
    tilt: 0.05,
    dist: "9.5 AU",
    blurb: "Rings of ice and rock",
    fact: "The rings are ice and dust on countless tiny orbits — a miniature solar system. Density is so low Saturn would float in a (huge) bathtub.",
  },
  {
    id: "uranus",
    name: "Uranus",
    kind: "planet",
    r: 6.2,
    color: "#9fd0d4",
    orbit: 268,
    period: 30687,
    phase: 2.1,
    tilt: 0.9,
    dist: "19.2 AU",
    blurb: "Ice giant · tipped on its side",
    fact: "It rolls around the Sun on its side — seasons last decades. Methane in the air makes it pale cyan. Rings are faint and almost upright.",
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "planet",
    r: 6.0,
    color: "#3d6fbf",
    orbit: 318,
    period: 60190,
    phase: 4.8,
    tilt: 0.05,
    dist: "30 AU",
    blurb: "Ice giant · fastest winds in the system",
    fact: "Farthest true planet. Winds scream past 1,000 km/h. It was found with math before anyone saw it — gravity tugging Uranus gave it away.",
  },
];

/** Convert approximate RA (hours) / Dec (degrees) to a unit direction vector.
 *  Coordinate frame: +Y ≈ north celestial pole, +Z ≈ vernal equinox-ish for cockpit view. */
export function raDecToDir(raHours: number, decDeg: number): V {
  const ra = (raHours / 24) * Math.PI * 2;
  const dec = (decDeg * Math.PI) / 180;
  const cosD = Math.cos(dec);
  return {
    x: cosD * Math.sin(ra),
    y: Math.sin(dec),
    z: cosD * Math.cos(ra),
  };
}

/** Approximate RGB from spectral class letter. */
export function spectralColor(sp: string): { r: number; g: number; b: number; hex: string } {
  const c = (sp[0] || "G").toUpperCase();
  const map: Record<string, [number, number, number]> = {
    O: [155, 176, 255],
    B: [170, 191, 255],
    A: [202, 216, 255],
    F: [248, 247, 255],
    G: [255, 244, 234],
    K: [255, 210, 161],
    M: [255, 160, 100],
  };
  const [r, g, b] = map[c] ?? map.G;
  const hex = `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  return { r, g, b, hex };
}

export type NamedStar = {
  id: string;
  name: string;
  catalogNames?: string[];
  dir: V;
  color: string;
  mag: number; // apparent magnitude scale for render (higher = brighter in our UI)
  appMag: number; // real apparent magnitude (lower = brighter)
  spectral: string;
  distLy: number;
  constellation?: string;
  blurb: string;
  fact: string;
  dist: string;
  ra?: number;
  dec?: number;
};

/** Bright recognizable stars with approximate real sky positions (RA hours, Dec deg). */
export const NAMED_STARS: NamedStar[] = [
  { id: "alpheratz", name: "Alpheratz", catalogNames: ["Alpheratz"], dir: raDecToDir(0.139, 29.09), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 97, constellation: "Andromeda", dist: "97 ly", blurb: "Key star of Andromeda", fact: "Mapped for OxyForge constellation atlas · Andromeda · ~97 ly from the Sun." },
  { id: "alpha-ant", name: "Alpha Antliae", catalogNames: ["Alpha Antliae"], dir: raDecToDir(10.452, -31.07), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 366, constellation: "Antlia", dist: "366 ly", blurb: "Key star of Antlia", fact: "Mapped for OxyForge constellation atlas · Antlia · ~366 ly from the Sun." },
  { id: "alpha-aps", name: "Alpha Apodis", catalogNames: ["Alpha Apodis"], dir: raDecToDir(14.798, -79.04), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 411, constellation: "Apus", dist: "411 ly", blurb: "Key star of Apus", fact: "Mapped for OxyForge constellation atlas · Apus · ~411 ly from the Sun." },
  { id: "sadalsuud", name: "Sadalsuud", catalogNames: ["Sadalsuud"], dir: raDecToDir(21.526, -5.57), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 540, constellation: "Aquarius", dist: "540 ly", blurb: "Key star of Aquarius", fact: "Mapped for OxyForge constellation atlas · Aquarius · ~540 ly from the Sun." },
  { id: "altair", name: "Altair", catalogNames: ["Altair"], dir: raDecToDir(19.846, 8.87), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 16.7, constellation: "Aquila", dist: "16.7 ly", blurb: "Key star of Aquila", fact: "Mapped for OxyForge constellation atlas · Aquila · ~16.7 ly from the Sun." },
  { id: "beta-ara", name: "Beta Arae", catalogNames: ["Beta Arae"], dir: raDecToDir(17.421, -55.53), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 600, constellation: "Ara", dist: "600 ly", blurb: "Key star of Ara", fact: "Mapped for OxyForge constellation atlas · Ara · ~600 ly from the Sun." },
  { id: "hamal", name: "Hamal", catalogNames: ["Hamal"], dir: raDecToDir(2.119, 23.46), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 66, constellation: "Aries", dist: "66 ly", blurb: "Key star of Aries", fact: "Mapped for OxyForge constellation atlas · Aries · ~66 ly from the Sun." },
  { id: "capella", name: "Capella", catalogNames: ["Capella"], dir: raDecToDir(5.278, 46.0), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 43, constellation: "Auriga", dist: "43 ly", blurb: "Key star of Auriga", fact: "Mapped for OxyForge constellation atlas · Auriga · ~43 ly from the Sun." },
  { id: "arcturus", name: "Arcturus", catalogNames: ["Arcturus"], dir: raDecToDir(14.261, 19.18), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 37, constellation: "Boötes", dist: "37 ly", blurb: "Key star of Boötes", fact: "Mapped for OxyForge constellation atlas · Boötes · ~37 ly from the Sun." },
  { id: "alpha-cae", name: "Alpha Caeli", catalogNames: ["Alpha Caeli"], dir: raDecToDir(4.676, -41.86), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 66, constellation: "Caelum", dist: "66 ly", blurb: "Key star of Caelum", fact: "Mapped for OxyForge constellation atlas · Caelum · ~66 ly from the Sun." },
  { id: "beta-cam", name: "Beta Camelopardalis", catalogNames: ["Beta Camelopardalis"], dir: raDecToDir(5.056, 60.44), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 1000, constellation: "Camelopardalis", dist: "1000 ly", blurb: "Key star of Camelopardalis", fact: "Mapped for OxyForge constellation atlas · Camelopardalis · ~1000 ly from the Sun." },
  { id: "tarf", name: "Tarf", catalogNames: ["Tarf"], dir: raDecToDir(8.275, 9.19), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 290, constellation: "Cancer", dist: "290 ly", blurb: "Key star of Cancer", fact: "Mapped for OxyForge constellation atlas · Cancer · ~290 ly from the Sun." },
  { id: "cor-caroli", name: "Cor Caroli", catalogNames: ["Cor Caroli"], dir: raDecToDir(12.933, 38.32), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 110, constellation: "Canes Venatici", dist: "110 ly", blurb: "Key star of Canes Venatici", fact: "Mapped for OxyForge constellation atlas · Canes Venatici · ~110 ly from the Sun." },
  { id: "sirius", name: "Sirius", catalogNames: ["Sirius"], dir: raDecToDir(6.752, -16.72), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 8.6, constellation: "Canis Major", dist: "8.6 ly", blurb: "Key star of Canis Major", fact: "Mapped for OxyForge constellation atlas · Canis Major · ~8.6 ly from the Sun." },
  { id: "procyon", name: "Procyon", catalogNames: ["Procyon"], dir: raDecToDir(7.655, 5.22), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 11.5, constellation: "Canis Minor", dist: "11.5 ly", blurb: "Key star of Canis Minor", fact: "Mapped for OxyForge constellation atlas · Canis Minor · ~11.5 ly from the Sun." },
  { id: "deneb-algedi", name: "Deneb Algedi", catalogNames: ["Deneb Algedi"], dir: raDecToDir(21.784, -16.13), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 39, constellation: "Capricornus", dist: "39 ly", blurb: "Key star of Capricornus", fact: "Mapped for OxyForge constellation atlas · Capricornus · ~39 ly from the Sun." },
  { id: "canopus", name: "Canopus", catalogNames: ["Canopus"], dir: raDecToDir(6.399, -52.7), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 310, constellation: "Carina", dist: "310 ly", blurb: "Key star of Carina", fact: "Mapped for OxyForge constellation atlas · Carina · ~310 ly from the Sun." },
  { id: "schedar", name: "Schedar", catalogNames: ["Schedar"], dir: raDecToDir(0.675, 56.54), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 228, constellation: "Cassiopeia", dist: "228 ly", blurb: "Key star of Cassiopeia", fact: "Mapped for OxyForge constellation atlas · Cassiopeia · ~228 ly from the Sun." },
  { id: "acen", name: "Alpha Centauri", catalogNames: ["Alpha Centauri"], dir: raDecToDir(14.661, -60.84), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 4.4, constellation: "Centaurus", dist: "4.4 ly", blurb: "Key star of Centaurus", fact: "Mapped for OxyForge constellation atlas · Centaurus · ~4.4 ly from the Sun." },
  { id: "alderamin", name: "Alderamin", catalogNames: ["Alderamin"], dir: raDecToDir(21.309, 62.59), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 49, constellation: "Cepheus", dist: "49 ly", blurb: "Key star of Cepheus", fact: "Mapped for OxyForge constellation atlas · Cepheus · ~49 ly from the Sun." },
  { id: "diphda", name: "Diphda", catalogNames: ["Diphda"], dir: raDecToDir(0.726, -17.99), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 96, constellation: "Cetus", dist: "96 ly", blurb: "Key star of Cetus", fact: "Mapped for OxyForge constellation atlas · Cetus · ~96 ly from the Sun." },
  { id: "alpha-cha", name: "Alpha Chamaeleontis", catalogNames: ["Alpha Chamaeleontis"], dir: raDecToDir(8.309, -76.92), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 63, constellation: "Chamaeleon", dist: "63 ly", blurb: "Key star of Chamaeleon", fact: "Mapped for OxyForge constellation atlas · Chamaeleon · ~63 ly from the Sun." },
  { id: "alpha-cir", name: "Alpha Circini", catalogNames: ["Alpha Circini"], dir: raDecToDir(14.708, -64.97), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 54, constellation: "Circinus", dist: "54 ly", blurb: "Key star of Circinus", fact: "Mapped for OxyForge constellation atlas · Circinus · ~54 ly from the Sun." },
  { id: "phact", name: "Phact", catalogNames: ["Phact"], dir: raDecToDir(5.66, -34.07), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 261, constellation: "Columba", dist: "261 ly", blurb: "Key star of Columba", fact: "Mapped for OxyForge constellation atlas · Columba · ~261 ly from the Sun." },
  { id: "beta-com", name: "Beta Comae Berenices", catalogNames: ["Beta Comae Berenices"], dir: raDecToDir(13.198, 27.88), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 30, constellation: "Coma Berenices", dist: "30 ly", blurb: "Key star of Coma Berenices", fact: "Mapped for OxyForge constellation atlas · Coma Berenices · ~30 ly from the Sun." },
  { id: "beta-cra", name: "Beta Coronae Australis", catalogNames: ["Beta Coronae Australis"], dir: raDecToDir(19.167, -39.34), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 508, constellation: "Corona Australis", dist: "508 ly", blurb: "Key star of Corona Australis", fact: "Mapped for OxyForge constellation atlas · Corona Australis · ~508 ly from the Sun." },
  { id: "alphecca", name: "Alphecca", catalogNames: ["Alphecca"], dir: raDecToDir(15.578, 26.71), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 75, constellation: "Corona Borealis", dist: "75 ly", blurb: "Key star of Corona Borealis", fact: "Mapped for OxyForge constellation atlas · Corona Borealis · ~75 ly from the Sun." },
  { id: "gienah", name: "Gienah", catalogNames: ["Gienah"], dir: raDecToDir(12.497, -16.52), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 154, constellation: "Corvus", dist: "154 ly", blurb: "Key star of Corvus", fact: "Mapped for OxyForge constellation atlas · Corvus · ~154 ly from the Sun." },
  { id: "delta-crt", name: "Delta Crateris", catalogNames: ["Delta Crateris"], dir: raDecToDir(11.326, -14.78), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 195, constellation: "Crater", dist: "195 ly", blurb: "Key star of Crater", fact: "Mapped for OxyForge constellation atlas · Crater · ~195 ly from the Sun." },
  { id: "acrux", name: "Acrux", catalogNames: ["Acrux"], dir: raDecToDir(12.443, -63.1), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 321, constellation: "Crux", dist: "321 ly", blurb: "Key star of Crux", fact: "Mapped for OxyForge constellation atlas · Crux · ~321 ly from the Sun." },
  { id: "deneb", name: "Deneb", catalogNames: ["Deneb"], dir: raDecToDir(20.69, 45.28), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 1425, constellation: "Cygnus", dist: "1425 ly", blurb: "Key star of Cygnus", fact: "Mapped for OxyForge constellation atlas · Cygnus · ~1425 ly from the Sun." },
  { id: "rotanev", name: "Rotanev", catalogNames: ["Rotanev"], dir: raDecToDir(20.66, 14.6), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 97, constellation: "Delphinus", dist: "97 ly", blurb: "Key star of Delphinus", fact: "Mapped for OxyForge constellation atlas · Delphinus · ~97 ly from the Sun." },
  { id: "alpha-dor", name: "Alpha Doradus", catalogNames: ["Alpha Doradus"], dir: raDecToDir(4.567, -55.04), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 176, constellation: "Dorado", dist: "176 ly", blurb: "Key star of Dorado", fact: "Mapped for OxyForge constellation atlas · Dorado · ~176 ly from the Sun." },
  { id: "eltanin", name: "Eltanin", catalogNames: ["Eltanin"], dir: raDecToDir(17.943, 51.49), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 148, constellation: "Draco", dist: "148 ly", blurb: "Key star of Draco", fact: "Mapped for OxyForge constellation atlas · Draco · ~148 ly from the Sun." },
  { id: "kitalpha", name: "Kitalpha", catalogNames: ["Kitalpha"], dir: raDecToDir(21.263, 5.25), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 187, constellation: "Equuleus", dist: "187 ly", blurb: "Key star of Equuleus", fact: "Mapped for OxyForge constellation atlas · Equuleus · ~187 ly from the Sun." },
  { id: "achernar", name: "Achernar", catalogNames: ["Achernar"], dir: raDecToDir(1.629, -57.24), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 140, constellation: "Eridanus", dist: "140 ly", blurb: "Key star of Eridanus", fact: "Mapped for OxyForge constellation atlas · Eridanus · ~140 ly from the Sun." },
  { id: "alpha-for", name: "Alpha Fornacis", catalogNames: ["Alpha Fornacis"], dir: raDecToDir(3.199, -28.99), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 46, constellation: "Fornax", dist: "46 ly", blurb: "Key star of Fornax", fact: "Mapped for OxyForge constellation atlas · Fornax · ~46 ly from the Sun." },
  { id: "pollux", name: "Pollux", catalogNames: ["Pollux"], dir: raDecToDir(7.755, 28.03), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 34, constellation: "Gemini", dist: "34 ly", blurb: "Key star of Gemini", fact: "Mapped for OxyForge constellation atlas · Gemini · ~34 ly from the Sun." },
  { id: "alnair", name: "Alnair", catalogNames: ["Alnair"], dir: raDecToDir(22.137, -46.96), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 101, constellation: "Grus", dist: "101 ly", blurb: "Key star of Grus", fact: "Mapped for OxyForge constellation atlas · Grus · ~101 ly from the Sun." },
  { id: "kornephoros", name: "Kornephoros", catalogNames: ["Kornephoros"], dir: raDecToDir(16.503, 21.49), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 139, constellation: "Hercules", dist: "139 ly", blurb: "Key star of Hercules", fact: "Mapped for OxyForge constellation atlas · Hercules · ~139 ly from the Sun." },
  { id: "alpha-hor", name: "Alpha Horologii", catalogNames: ["Alpha Horologii"], dir: raDecToDir(4.233, -42.29), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 117, constellation: "Horologium", dist: "117 ly", blurb: "Key star of Horologium", fact: "Mapped for OxyForge constellation atlas · Horologium · ~117 ly from the Sun." },
  { id: "alphard", name: "Alphard", catalogNames: ["Alphard"], dir: raDecToDir(9.459, -8.66), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 177, constellation: "Hydra", dist: "177 ly", blurb: "Key star of Hydra", fact: "Mapped for OxyForge constellation atlas · Hydra · ~177 ly from the Sun." },
  { id: "alpha-hyi", name: "Alpha Hydri", catalogNames: ["Alpha Hydri"], dir: raDecToDir(1.979, -61.57), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 71, constellation: "Hydrus", dist: "71 ly", blurb: "Key star of Hydrus", fact: "Mapped for OxyForge constellation atlas · Hydrus · ~71 ly from the Sun." },
  { id: "alpha-ind", name: "Alpha Indi", catalogNames: ["Alpha Indi"], dir: raDecToDir(20.626, -47.29), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 98, constellation: "Indus", dist: "98 ly", blurb: "Key star of Indus", fact: "Mapped for OxyForge constellation atlas · Indus · ~98 ly from the Sun." },
  { id: "alpha-lac", name: "Alpha Lacertae", catalogNames: ["Alpha Lacertae"], dir: raDecToDir(22.521, 50.28), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 102, constellation: "Lacerta", dist: "102 ly", blurb: "Key star of Lacerta", fact: "Mapped for OxyForge constellation atlas · Lacerta · ~102 ly from the Sun." },
  { id: "regulus", name: "Regulus", catalogNames: ["Regulus"], dir: raDecToDir(10.139, 11.97), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 79, constellation: "Leo", dist: "79 ly", blurb: "Key star of Leo", fact: "Mapped for OxyForge constellation atlas · Leo · ~79 ly from the Sun." },
  { id: "praecipua", name: "Praecipua", catalogNames: ["Praecipua"], dir: raDecToDir(10.888, 34.39), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 95, constellation: "Leo Minor", dist: "95 ly", blurb: "Key star of Leo Minor", fact: "Mapped for OxyForge constellation atlas · Leo Minor · ~95 ly from the Sun." },
  { id: "arneb", name: "Arneb", catalogNames: ["Arneb"], dir: raDecToDir(5.545, -17.82), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 2200, constellation: "Lepus", dist: "2200 ly", blurb: "Key star of Lepus", fact: "Mapped for OxyForge constellation atlas · Lepus · ~2200 ly from the Sun." },
  { id: "zubeneschamali", name: "Zubeneschamali", catalogNames: ["Zubeneschamali"], dir: raDecToDir(15.283, -9.38), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 185, constellation: "Libra", dist: "185 ly", blurb: "Key star of Libra", fact: "Mapped for OxyForge constellation atlas · Libra · ~185 ly from the Sun." },
  { id: "alpha-lup", name: "Alpha Lupi", catalogNames: ["Alpha Lupi"], dir: raDecToDir(14.699, -47.39), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 460, constellation: "Lupus", dist: "460 ly", blurb: "Key star of Lupus", fact: "Mapped for OxyForge constellation atlas · Lupus · ~460 ly from the Sun." },
  { id: "alpha-lyn", name: "Alpha Lyncis", catalogNames: ["Alpha Lyncis"], dir: raDecToDir(9.351, 34.39), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 203, constellation: "Lynx", dist: "203 ly", blurb: "Key star of Lynx", fact: "Mapped for OxyForge constellation atlas · Lynx · ~203 ly from the Sun." },
  { id: "vega", name: "Vega", catalogNames: ["Vega"], dir: raDecToDir(18.616, 38.78), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 25, constellation: "Lyra", dist: "25 ly", blurb: "Key star of Lyra", fact: "Mapped for OxyForge constellation atlas · Lyra · ~25 ly from the Sun." },
  { id: "alpha-men", name: "Alpha Mensae", catalogNames: ["Alpha Mensae"], dir: raDecToDir(6.171, -74.75), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 33, constellation: "Mensa", dist: "33 ly", blurb: "Key star of Mensa", fact: "Mapped for OxyForge constellation atlas · Mensa · ~33 ly from the Sun." },
  { id: "gamma-mic", name: "Gamma Microscopii", catalogNames: ["Gamma Microscopii"], dir: raDecToDir(21.01, -32.26), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 223, constellation: "Microscopium", dist: "223 ly", blurb: "Key star of Microscopium", fact: "Mapped for OxyForge constellation atlas · Microscopium · ~223 ly from the Sun." },
  { id: "beta-mon", name: "Beta Monocerotis", catalogNames: ["Beta Monocerotis"], dir: raDecToDir(6.481, -7.03), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 700, constellation: "Monoceros", dist: "700 ly", blurb: "Key star of Monoceros", fact: "Mapped for OxyForge constellation atlas · Monoceros · ~700 ly from the Sun." },
  { id: "alpha-mus", name: "Alpha Muscae", catalogNames: ["Alpha Muscae"], dir: raDecToDir(12.619, -69.14), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 315, constellation: "Musca", dist: "315 ly", blurb: "Key star of Musca", fact: "Mapped for OxyForge constellation atlas · Musca · ~315 ly from the Sun." },
  { id: "gamma-nor", name: "Gamma Normae", catalogNames: ["Gamma Normae"], dir: raDecToDir(16.33, -50.09), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 127, constellation: "Norma", dist: "127 ly", blurb: "Key star of Norma", fact: "Mapped for OxyForge constellation atlas · Norma · ~127 ly from the Sun." },
  { id: "nu-oct", name: "Nu Octantis", catalogNames: ["Nu Octantis"], dir: raDecToDir(21.68, -77.39), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 69, constellation: "Octans", dist: "69 ly", blurb: "Key star of Octans", fact: "Mapped for OxyForge constellation atlas · Octans · ~69 ly from the Sun." },
  { id: "rasalhague", name: "Rasalhague", catalogNames: ["Rasalhague"], dir: raDecToDir(17.582, 12.56), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 49, constellation: "Ophiuchus", dist: "49 ly", blurb: "Key star of Ophiuchus", fact: "Mapped for OxyForge constellation atlas · Ophiuchus · ~49 ly from the Sun." },
  { id: "rigel", name: "Rigel", catalogNames: ["Rigel"], dir: raDecToDir(5.242, -8.2), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 860, constellation: "Orion", dist: "860 ly", blurb: "Key star of Orion", fact: "Mapped for OxyForge constellation atlas · Orion · ~860 ly from the Sun." },
  { id: "peacock", name: "Peacock", catalogNames: ["Peacock"], dir: raDecToDir(20.427, -56.74), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 179, constellation: "Pavo", dist: "179 ly", blurb: "Key star of Pavo", fact: "Mapped for OxyForge constellation atlas · Pavo · ~179 ly from the Sun." },
  { id: "enif", name: "Enif", catalogNames: ["Enif"], dir: raDecToDir(21.736, 9.88), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 672, constellation: "Pegasus", dist: "672 ly", blurb: "Key star of Pegasus", fact: "Mapped for OxyForge constellation atlas · Pegasus · ~672 ly from the Sun." },
  { id: "mirfak", name: "Mirfak", catalogNames: ["Mirfak"], dir: raDecToDir(3.405, 49.86), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 510, constellation: "Perseus", dist: "510 ly", blurb: "Key star of Perseus", fact: "Mapped for OxyForge constellation atlas · Perseus · ~510 ly from the Sun." },
  { id: "ankaa", name: "Ankaa", catalogNames: ["Ankaa"], dir: raDecToDir(0.438, -42.31), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 77, constellation: "Phoenix", dist: "77 ly", blurb: "Key star of Phoenix", fact: "Mapped for OxyForge constellation atlas · Phoenix · ~77 ly from the Sun." },
  { id: "alpha-pic", name: "Alpha Pictoris", catalogNames: ["Alpha Pictoris"], dir: raDecToDir(6.803, -61.94), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 97, constellation: "Pictor", dist: "97 ly", blurb: "Key star of Pictor", fact: "Mapped for OxyForge constellation atlas · Pictor · ~97 ly from the Sun." },
  { id: "eta-psc", name: "Eta Piscium", catalogNames: ["Eta Piscium"], dir: raDecToDir(1.524, 15.35), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 294, constellation: "Pisces", dist: "294 ly", blurb: "Key star of Pisces", fact: "Mapped for OxyForge constellation atlas · Pisces · ~294 ly from the Sun." },
  { id: "fomalhaut", name: "Fomalhaut", catalogNames: ["Fomalhaut"], dir: raDecToDir(22.96, -29.62), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 25, constellation: "Piscis Austrinus", dist: "25 ly", blurb: "Key star of Piscis Austrinus", fact: "Mapped for OxyForge constellation atlas · Piscis Austrinus · ~25 ly from the Sun." },
  { id: "naos", name: "Naos", catalogNames: ["Naos"], dir: raDecToDir(8.059, -40.0), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 1400, constellation: "Puppis", dist: "1400 ly", blurb: "Key star of Puppis", fact: "Mapped for OxyForge constellation atlas · Puppis · ~1400 ly from the Sun." },
  { id: "alpha-pyx", name: "Alpha Pyxidis", catalogNames: ["Alpha Pyxidis"], dir: raDecToDir(8.726, -33.19), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 880, constellation: "Pyxis", dist: "880 ly", blurb: "Key star of Pyxis", fact: "Mapped for OxyForge constellation atlas · Pyxis · ~880 ly from the Sun." },
  { id: "alpha-ret", name: "Alpha Reticuli", catalogNames: ["Alpha Reticuli"], dir: raDecToDir(4.242, -62.47), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 162, constellation: "Reticulum", dist: "162 ly", blurb: "Key star of Reticulum", fact: "Mapped for OxyForge constellation atlas · Reticulum · ~162 ly from the Sun." },
  { id: "gamma-sge", name: "Gamma Sagittae", catalogNames: ["Gamma Sagittae"], dir: raDecToDir(19.981, 19.49), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 258, constellation: "Sagitta", dist: "258 ly", blurb: "Key star of Sagitta", fact: "Mapped for OxyForge constellation atlas · Sagitta · ~258 ly from the Sun." },
  { id: "kaus-australis", name: "Kaus Australis", catalogNames: ["Kaus Australis"], dir: raDecToDir(18.402, -34.38), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 143, constellation: "Sagittarius", dist: "143 ly", blurb: "Key star of Sagittarius", fact: "Mapped for OxyForge constellation atlas · Sagittarius · ~143 ly from the Sun." },
  { id: "antares", name: "Antares", catalogNames: ["Antares"], dir: raDecToDir(16.49, -26.43), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 550, constellation: "Scorpius", dist: "550 ly", blurb: "Key star of Scorpius", fact: "Mapped for OxyForge constellation atlas · Scorpius · ~550 ly from the Sun." },
  { id: "alpha-scl", name: "Alpha Sculptoris", catalogNames: ["Alpha Sculptoris"], dir: raDecToDir(0.976, -29.36), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 780, constellation: "Sculptor", dist: "780 ly", blurb: "Key star of Sculptor", fact: "Mapped for OxyForge constellation atlas · Sculptor · ~780 ly from the Sun." },
  { id: "alpha-sct", name: "Alpha Scuti", catalogNames: ["Alpha Scuti"], dir: raDecToDir(18.586, -8.24), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 174, constellation: "Scutum", dist: "174 ly", blurb: "Key star of Scutum", fact: "Mapped for OxyForge constellation atlas · Scutum · ~174 ly from the Sun." },
  { id: "unukalhai", name: "Unukalhai", catalogNames: ["Unukalhai"], dir: raDecToDir(15.737, 6.43), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 74, constellation: "Serpens", dist: "74 ly", blurb: "Key star of Serpens", fact: "Mapped for OxyForge constellation atlas · Serpens · ~74 ly from the Sun." },
  { id: "alpha-sex", name: "Alpha Sextantis", catalogNames: ["Alpha Sextantis"], dir: raDecToDir(10.132, -0.37), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 287, constellation: "Sextans", dist: "287 ly", blurb: "Key star of Sextans", fact: "Mapped for OxyForge constellation atlas · Sextans · ~287 ly from the Sun." },
  { id: "aldebaran", name: "Aldebaran", catalogNames: ["Aldebaran"], dir: raDecToDir(4.599, 16.51), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 67, constellation: "Taurus", dist: "67 ly", blurb: "Key star of Taurus", fact: "Mapped for OxyForge constellation atlas · Taurus · ~67 ly from the Sun." },
  { id: "alpha-tel", name: "Alpha Telescopii", catalogNames: ["Alpha Telescopii"], dir: raDecToDir(18.45, -45.97), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 278, constellation: "Telescopium", dist: "278 ly", blurb: "Key star of Telescopium", fact: "Mapped for OxyForge constellation atlas · Telescopium · ~278 ly from the Sun." },
  { id: "beta-tri", name: "Beta Trianguli", catalogNames: ["Beta Trianguli"], dir: raDecToDir(2.159, 34.99), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 127, constellation: "Triangulum", dist: "127 ly", blurb: "Key star of Triangulum", fact: "Mapped for OxyForge constellation atlas · Triangulum · ~127 ly from the Sun." },
  { id: "atria", name: "Atria", catalogNames: ["Atria"], dir: raDecToDir(16.811, -69.03), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 391, constellation: "Triangulum Australe", dist: "391 ly", blurb: "Key star of Triangulum Australe", fact: "Mapped for OxyForge constellation atlas · Triangulum Australe · ~391 ly from the Sun." },
  { id: "alpha-tuc", name: "Alpha Tucanae", catalogNames: ["Alpha Tucanae"], dir: raDecToDir(22.309, -60.26), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 200, constellation: "Tucana", dist: "200 ly", blurb: "Key star of Tucana", fact: "Mapped for OxyForge constellation atlas · Tucana · ~200 ly from the Sun." },
  { id: "alioth", name: "Alioth", catalogNames: ["Alioth"], dir: raDecToDir(12.9, 55.96), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 83, constellation: "Ursa Major", dist: "83 ly", blurb: "Key star of Ursa Major", fact: "Mapped for OxyForge constellation atlas · Ursa Major · ~83 ly from the Sun." },
  { id: "polaris", name: "Polaris", catalogNames: ["Polaris"], dir: raDecToDir(2.53, 89.26), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 433, constellation: "Ursa Minor", dist: "433 ly", blurb: "Key star of Ursa Minor", fact: "Mapped for OxyForge constellation atlas · Ursa Minor · ~433 ly from the Sun." },
  { id: "suhail", name: "Suhail", catalogNames: ["Suhail"], dir: raDecToDir(9.133, -43.43), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 545, constellation: "Vela", dist: "545 ly", blurb: "Key star of Vela", fact: "Mapped for OxyForge constellation atlas · Vela · ~545 ly from the Sun." },
  { id: "spica", name: "Spica", catalogNames: ["Spica"], dir: raDecToDir(13.42, -11.16), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 250, constellation: "Virgo", dist: "250 ly", blurb: "Key star of Virgo", fact: "Mapped for OxyForge constellation atlas · Virgo · ~250 ly from the Sun." },
  { id: "beta-vol", name: "Beta Volantis", catalogNames: ["Beta Volantis"], dir: raDecToDir(8.428, -66.14), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 108, constellation: "Volans", dist: "108 ly", blurb: "Key star of Volans", fact: "Mapped for OxyForge constellation atlas · Volans · ~108 ly from the Sun." },
  { id: "anser", name: "Anser", catalogNames: ["Anser"], dir: raDecToDir(19.479, 24.66), color: spectralColor("A").hex, mag: 1.1, appMag: 1.5, spectral: "A", distLy: 297, constellation: "Vulpecula", dist: "297 ly", blurb: "Key star of Vulpecula", fact: "Mapped for OxyForge constellation atlas · Vulpecula · ~297 ly from the Sun." },
  { id: "betelgeuse", name: "Betelgeuse", catalogNames: ["Betelgeuse"], dir: raDecToDir(5.919, 7.41), color: spectralColor("M").hex, mag: 1.15, appMag: 1.5, spectral: "M", distLy: 640, constellation: "Orion", dist: "640 ly", blurb: "Key star of Orion", fact: "Mapped for OxyForge constellation atlas · Orion · ~640 ly from the Sun." },
  { id: "bellatrix", name: "Bellatrix", catalogNames: ["Bellatrix"], dir: raDecToDir(5.418, 6.35), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 250, constellation: "Orion", dist: "250 ly", blurb: "Key star of Orion", fact: "Mapped for OxyForge constellation atlas · Orion · ~250 ly from the Sun." },
  { id: "alnitak", name: "Alnitak", catalogNames: ["Alnitak"], dir: raDecToDir(5.679, -1.94), color: spectralColor("O").hex, mag: 1.15, appMag: 1.5, spectral: "O", distLy: 1260, constellation: "Orion", dist: "1260 ly", blurb: "Key star of Orion", fact: "Mapped for OxyForge constellation atlas · Orion · ~1260 ly from the Sun." },
  { id: "alnilam", name: "Alnilam", catalogNames: ["Alnilam"], dir: raDecToDir(5.603, -1.2), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 2000, constellation: "Orion", dist: "2000 ly", blurb: "Key star of Orion", fact: "Mapped for OxyForge constellation atlas · Orion · ~2000 ly from the Sun." },
  { id: "mintaka", name: "Mintaka", catalogNames: ["Mintaka"], dir: raDecToDir(5.532, -0.3), color: spectralColor("O").hex, mag: 1.15, appMag: 1.5, spectral: "O", distLy: 1200, constellation: "Orion", dist: "1200 ly", blurb: "Key star of Orion", fact: "Mapped for OxyForge constellation atlas · Orion · ~1200 ly from the Sun." },
  { id: "dubhe", name: "Dubhe", catalogNames: ["Dubhe"], dir: raDecToDir(11.062, 61.75), color: spectralColor("K").hex, mag: 1.15, appMag: 1.5, spectral: "K", distLy: 123, constellation: "Ursa Major", dist: "123 ly", blurb: "Key star of Ursa Major", fact: "Mapped for OxyForge constellation atlas · Ursa Major · ~123 ly from the Sun." },
  { id: "merak", name: "Merak", catalogNames: ["Merak"], dir: raDecToDir(11.03, 56.38), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 80, constellation: "Ursa Major", dist: "80 ly", blurb: "Key star of Ursa Major", fact: "Mapped for OxyForge constellation atlas · Ursa Major · ~80 ly from the Sun." },
  { id: "phecda", name: "Phecda", catalogNames: ["Phecda"], dir: raDecToDir(11.897, 53.69), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 83, constellation: "Ursa Major", dist: "83 ly", blurb: "Key star of Ursa Major", fact: "Mapped for OxyForge constellation atlas · Ursa Major · ~83 ly from the Sun." },
  { id: "megrez", name: "Megrez", catalogNames: ["Megrez"], dir: raDecToDir(12.257, 57.03), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 81, constellation: "Ursa Major", dist: "81 ly", blurb: "Key star of Ursa Major", fact: "Mapped for OxyForge constellation atlas · Ursa Major · ~81 ly from the Sun." },
  { id: "mizar", name: "Mizar", catalogNames: ["Mizar"], dir: raDecToDir(13.399, 54.93), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 86, constellation: "Ursa Major", dist: "86 ly", blurb: "Key star of Ursa Major", fact: "Mapped for OxyForge constellation atlas · Ursa Major · ~86 ly from the Sun." },
  { id: "alkaid", name: "Alkaid", catalogNames: ["Alkaid"], dir: raDecToDir(13.792, 49.31), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 104, constellation: "Ursa Major", dist: "104 ly", blurb: "Key star of Ursa Major", fact: "Mapped for OxyForge constellation atlas · Ursa Major · ~104 ly from the Sun." },
  { id: "caph", name: "Caph", catalogNames: ["Caph"], dir: raDecToDir(0.153, 59.15), color: spectralColor("F").hex, mag: 1.15, appMag: 1.5, spectral: "F", distLy: 54, constellation: "Cassiopeia", dist: "54 ly", blurb: "Key star of Cassiopeia", fact: "Mapped for OxyForge constellation atlas · Cassiopeia · ~54 ly from the Sun." },
  { id: "gamma-cas", name: "Gamma Cas", catalogNames: ["Gamma Cas"], dir: raDecToDir(0.945, 60.72), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 550, constellation: "Cassiopeia", dist: "550 ly", blurb: "Key star of Cassiopeia", fact: "Mapped for OxyForge constellation atlas · Cassiopeia · ~550 ly from the Sun." },
  { id: "ruchbah", name: "Ruchbah", catalogNames: ["Ruchbah"], dir: raDecToDir(1.43, 60.24), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 99, constellation: "Cassiopeia", dist: "99 ly", blurb: "Key star of Cassiopeia", fact: "Mapped for OxyForge constellation atlas · Cassiopeia · ~99 ly from the Sun." },
  { id: "segin", name: "Segin", catalogNames: ["Segin"], dir: raDecToDir(1.907, 63.67), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 99, constellation: "Cassiopeia", dist: "99 ly", blurb: "Key star of Cassiopeia", fact: "Mapped for OxyForge constellation atlas · Cassiopeia · ~99 ly from the Sun." },
  { id: "castor", name: "Castor", catalogNames: ["Castor"], dir: raDecToDir(7.576, 31.89), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 51, constellation: "Gemini", dist: "51 ly", blurb: "Key star of Gemini", fact: "Mapped for OxyForge constellation atlas · Gemini · ~51 ly from the Sun." },
  { id: "el-nath", name: "El Nath", catalogNames: ["El Nath"], dir: raDecToDir(5.438, 28.61), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 134, constellation: "Taurus", dist: "134 ly", blurb: "Key star of Taurus", fact: "Mapped for OxyForge constellation atlas · Taurus · ~134 ly from the Sun." },
  { id: "shaula", name: "Shaula", catalogNames: ["Shaula"], dir: raDecToDir(17.56, -37.1), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 570, constellation: "Scorpius", dist: "570 ly", blurb: "Key star of Scorpius", fact: "Mapped for OxyForge constellation atlas · Scorpius · ~570 ly from the Sun." },
  { id: "sargas", name: "Sargas", catalogNames: ["Sargas"], dir: raDecToDir(17.621, -43.0), color: spectralColor("F").hex, mag: 1.15, appMag: 1.5, spectral: "F", distLy: 270, constellation: "Scorpius", dist: "270 ly", blurb: "Key star of Scorpius", fact: "Mapped for OxyForge constellation atlas · Scorpius · ~270 ly from the Sun." },
  { id: "dsco", name: "Dschubba", catalogNames: ["Dschubba"], dir: raDecToDir(16.005, -22.62), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 470, constellation: "Scorpius", dist: "470 ly", blurb: "Key star of Scorpius", fact: "Mapped for OxyForge constellation atlas · Scorpius · ~470 ly from the Sun." },
  { id: "denebola", name: "Denebola", catalogNames: ["Denebola"], dir: raDecToDir(11.818, 14.57), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 36, constellation: "Leo", dist: "36 ly", blurb: "Key star of Leo", fact: "Mapped for OxyForge constellation atlas · Leo · ~36 ly from the Sun." },
  { id: "algieba", name: "Algieba", catalogNames: ["Algieba"], dir: raDecToDir(10.333, 19.84), color: spectralColor("K").hex, mag: 1.15, appMag: 1.5, spectral: "K", distLy: 130, constellation: "Leo", dist: "130 ly", blurb: "Key star of Leo", fact: "Mapped for OxyForge constellation atlas · Leo · ~130 ly from the Sun." },
  { id: "sadr", name: "Sadr", catalogNames: ["Sadr"], dir: raDecToDir(20.37, 40.26), color: spectralColor("F").hex, mag: 1.15, appMag: 1.5, spectral: "F", distLy: 1800, constellation: "Cygnus", dist: "1800 ly", blurb: "Key star of Cygnus", fact: "Mapped for OxyForge constellation atlas · Cygnus · ~1800 ly from the Sun." },
  { id: "gienah-cyg", name: "Gienah Cyg", catalogNames: ["Gienah Cyg"], dir: raDecToDir(20.77, 33.97), color: spectralColor("K").hex, mag: 1.15, appMag: 1.5, spectral: "K", distLy: 72, constellation: "Cygnus", dist: "72 ly", blurb: "Key star of Cygnus", fact: "Mapped for OxyForge constellation atlas · Cygnus · ~72 ly from the Sun." },
  { id: "markab", name: "Markab", catalogNames: ["Markab"], dir: raDecToDir(23.079, 15.21), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 140, constellation: "Pegasus", dist: "140 ly", blurb: "Key star of Pegasus", fact: "Mapped for OxyForge constellation atlas · Pegasus · ~140 ly from the Sun." },
  { id: "scheat", name: "Scheat", catalogNames: ["Scheat"], dir: raDecToDir(23.063, 28.08), color: spectralColor("M").hex, mag: 1.15, appMag: 1.5, spectral: "M", distLy: 196, constellation: "Pegasus", dist: "196 ly", blurb: "Key star of Pegasus", fact: "Mapped for OxyForge constellation atlas · Pegasus · ~196 ly from the Sun." },
  { id: "algenib", name: "Algenib", catalogNames: ["Algenib"], dir: raDecToDir(0.22, 15.18), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 390, constellation: "Pegasus", dist: "390 ly", blurb: "Key star of Pegasus", fact: "Mapped for OxyForge constellation atlas · Pegasus · ~390 ly from the Sun." },
  { id: "mimosa", name: "Mimosa", catalogNames: ["Mimosa"], dir: raDecToDir(12.795, -59.69), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 280, constellation: "Crux", dist: "280 ly", blurb: "Key star of Crux", fact: "Mapped for OxyForge constellation atlas · Crux · ~280 ly from the Sun." },
  { id: "gacrux", name: "Gacrux", catalogNames: ["Gacrux"], dir: raDecToDir(12.519, -57.11), color: spectralColor("M").hex, mag: 1.15, appMag: 1.5, spectral: "M", distLy: 88, constellation: "Crux", dist: "88 ly", blurb: "Key star of Crux", fact: "Mapped for OxyForge constellation atlas · Crux · ~88 ly from the Sun." },
  { id: "delta-cru", name: "Delta Crucis", catalogNames: ["Delta Crucis"], dir: raDecToDir(12.252, -58.75), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 345, constellation: "Crux", dist: "345 ly", blurb: "Key star of Crux", fact: "Mapped for OxyForge constellation atlas · Crux · ~345 ly from the Sun." },
  { id: "zubenelgenubi", name: "Zubenelgenubi", catalogNames: ["Zubenelgenubi"], dir: raDecToDir(14.848, -16.04), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 77, constellation: "Libra", dist: "77 ly", blurb: "Key star of Libra", fact: "Mapped for OxyForge constellation atlas · Libra · ~77 ly from the Sun." },
  { id: "nunki", name: "Nunki", catalogNames: ["Nunki"], dir: raDecToDir(18.921, -26.3), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 228, constellation: "Sagittarius", dist: "228 ly", blurb: "Key star of Sagittarius", fact: "Mapped for OxyForge constellation atlas · Sagittarius · ~228 ly from the Sun." },
  { id: "ascella", name: "Ascella", catalogNames: ["Ascella"], dir: raDecToDir(19.043, -29.88), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 89, constellation: "Sagittarius", dist: "89 ly", blurb: "Key star of Sagittarius", fact: "Mapped for OxyForge constellation atlas · Sagittarius · ~89 ly from the Sun." },
  { id: "tarazed", name: "Tarazed", catalogNames: ["Tarazed"], dir: raDecToDir(19.771, 10.61), color: spectralColor("K").hex, mag: 1.15, appMag: 1.5, spectral: "K", distLy: 380, constellation: "Aquila", dist: "380 ly", blurb: "Key star of Aquila", fact: "Mapped for OxyForge constellation atlas · Aquila · ~380 ly from the Sun." },
  { id: "nekkar", name: "Nekkar", catalogNames: ["Nekkar"], dir: raDecToDir(15.032, 40.39), color: spectralColor("G").hex, mag: 1.15, appMag: 1.5, spectral: "G", distLy: 225, constellation: "Boötes", dist: "225 ly", blurb: "Key star of Boötes", fact: "Mapped for OxyForge constellation atlas · Boötes · ~225 ly from the Sun." },
  { id: "sheliak", name: "Sheliak", catalogNames: ["Sheliak"], dir: raDecToDir(18.834, 33.36), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 960, constellation: "Lyra", dist: "960 ly", blurb: "Key star of Lyra", fact: "Mapped for OxyForge constellation atlas · Lyra · ~960 ly from the Sun." },
  { id: "sulafat", name: "Sulafat", catalogNames: ["Sulafat"], dir: raDecToDir(18.982, 32.69), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 620, constellation: "Lyra", dist: "620 ly", blurb: "Key star of Lyra", fact: "Mapped for OxyForge constellation atlas · Lyra · ~620 ly from the Sun." },
  { id: "hadar", name: "Hadar", catalogNames: ["Hadar"], dir: raDecToDir(14.063, -60.37), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 390, constellation: "Centaurus", dist: "390 ly", blurb: "Key star of Centaurus", fact: "Mapped for OxyForge constellation atlas · Centaurus · ~390 ly from the Sun." },
  { id: "menkent", name: "Menkent", catalogNames: ["Menkent"], dir: raDecToDir(14.111, -36.37), color: spectralColor("K").hex, mag: 1.15, appMag: 1.5, spectral: "K", distLy: 61, constellation: "Centaurus", dist: "61 ly", blurb: "Key star of Centaurus", fact: "Mapped for OxyForge constellation atlas · Centaurus · ~61 ly from the Sun." },
  { id: "porrima", name: "Porrima", catalogNames: ["Porrima"], dir: raDecToDir(12.692, -1.45), color: spectralColor("F").hex, mag: 1.15, appMag: 1.5, spectral: "F", distLy: 38, constellation: "Virgo", dist: "38 ly", blurb: "Key star of Virgo", fact: "Mapped for OxyForge constellation atlas · Virgo · ~38 ly from the Sun." },
  { id: "mirach", name: "Mirach", catalogNames: ["Mirach"], dir: raDecToDir(1.162, 35.62), color: spectralColor("M").hex, mag: 1.15, appMag: 1.5, spectral: "M", distLy: 197, constellation: "Andromeda", dist: "197 ly", blurb: "Key star of Andromeda", fact: "Mapped for OxyForge constellation atlas · Andromeda · ~197 ly from the Sun." },
  { id: "alamak", name: "Alamak", catalogNames: ["Alamak"], dir: raDecToDir(2.065, 42.33), color: spectralColor("K").hex, mag: 1.15, appMag: 1.5, spectral: "K", distLy: 355, constellation: "Andromeda", dist: "355 ly", blurb: "Key star of Andromeda", fact: "Mapped for OxyForge constellation atlas · Andromeda · ~355 ly from the Sun." },
  { id: "algol", name: "Algol", catalogNames: ["Algol"], dir: raDecToDir(3.136, 40.96), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 90, constellation: "Perseus", dist: "90 ly", blurb: "Key star of Perseus", fact: "Mapped for OxyForge constellation atlas · Perseus · ~90 ly from the Sun." },
  { id: "menkalinan", name: "Menkalinan", catalogNames: ["Menkalinan"], dir: raDecToDir(5.992, 44.95), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 81, constellation: "Auriga", dist: "81 ly", blurb: "Key star of Auriga", fact: "Mapped for OxyForge constellation atlas · Auriga · ~81 ly from the Sun." },
  { id: "adone", name: "Adhara", catalogNames: ["Adhara"], dir: raDecToDir(6.977, -28.97), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 430, constellation: "Canis Major", dist: "430 ly", blurb: "Key star of Canis Major", fact: "Mapped for OxyForge constellation atlas · Canis Major · ~430 ly from the Sun." },
  { id: "wezen", name: "Wezen", catalogNames: ["Wezen"], dir: raDecToDir(7.139, -26.39), color: spectralColor("F").hex, mag: 1.15, appMag: 1.5, spectral: "F", distLy: 1600, constellation: "Canis Major", dist: "1600 ly", blurb: "Key star of Canis Major", fact: "Mapped for OxyForge constellation atlas · Canis Major · ~1600 ly from the Sun." },
  { id: "kochab", name: "Kochab", catalogNames: ["Kochab"], dir: raDecToDir(14.845, 74.16), color: spectralColor("K").hex, mag: 1.15, appMag: 1.5, spectral: "K", distLy: 131, constellation: "Ursa Minor", dist: "131 ly", blurb: "Key star of Ursa Minor", fact: "Mapped for OxyForge constellation atlas · Ursa Minor · ~131 ly from the Sun." },
  { id: "pherkad", name: "Pherkad", catalogNames: ["Pherkad"], dir: raDecToDir(15.345, 71.83), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 480, constellation: "Ursa Minor", dist: "480 ly", blurb: "Key star of Ursa Minor", fact: "Mapped for OxyForge constellation atlas · Ursa Minor · ~480 ly from the Sun." },
  { id: "rastaban", name: "Rastaban", catalogNames: ["Rastaban"], dir: raDecToDir(17.507, 52.3), color: spectralColor("G").hex, mag: 1.15, appMag: 1.5, spectral: "G", distLy: 380, constellation: "Draco", dist: "380 ly", blurb: "Key star of Draco", fact: "Mapped for OxyForge constellation atlas · Draco · ~380 ly from the Sun." },
  { id: "thuban", name: "Thuban", catalogNames: ["Thuban"], dir: raDecToDir(14.073, 64.38), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 303, constellation: "Draco", dist: "303 ly", blurb: "Key star of Draco", fact: "Mapped for OxyForge constellation atlas · Draco · ~303 ly from the Sun." },
  { id: "zeta-her", name: "Zeta Herculis", catalogNames: ["Zeta Herculis"], dir: raDecToDir(16.688, 31.6), color: spectralColor("G").hex, mag: 1.15, appMag: 1.5, spectral: "G", distLy: 35, constellation: "Hercules", dist: "35 ly", blurb: "Key star of Hercules", fact: "Mapped for OxyForge constellation atlas · Hercules · ~35 ly from the Sun." },
  { id: "eta-her", name: "Eta Herculis", catalogNames: ["Eta Herculis"], dir: raDecToDir(16.714, 38.92), color: spectralColor("G").hex, mag: 1.15, appMag: 1.5, spectral: "G", distLy: 112, constellation: "Hercules", dist: "112 ly", blurb: "Key star of Hercules", fact: "Mapped for OxyForge constellation atlas · Hercules · ~112 ly from the Sun." },
  { id: "epsilon-her", name: "Epsilon Herculis", catalogNames: ["Epsilon Herculis"], dir: raDecToDir(17.005, 30.93), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 155, constellation: "Hercules", dist: "155 ly", blurb: "Key star of Hercules", fact: "Mapped for OxyForge constellation atlas · Hercules · ~155 ly from the Sun." },
  { id: "sabik", name: "Sabik", catalogNames: ["Sabik"], dir: raDecToDir(17.172, -15.72), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 82, constellation: "Ophiuchus", dist: "82 ly", blurb: "Key star of Ophiuchus", fact: "Mapped for OxyForge constellation atlas · Ophiuchus · ~82 ly from the Sun." },
  { id: "gamma-hya", name: "Gamma Hydrae", catalogNames: ["Gamma Hydrae"], dir: raDecToDir(13.315, -23.17), color: spectralColor("G").hex, mag: 1.15, appMag: 1.5, spectral: "G", distLy: 134, constellation: "Hydra", dist: "134 ly", blurb: "Key star of Hydra", fact: "Mapped for OxyForge constellation atlas · Hydra · ~134 ly from the Sun." },
  { id: "menkar", name: "Menkar", catalogNames: ["Menkar"], dir: raDecToDir(3.038, 4.09), color: spectralColor("M").hex, mag: 1.15, appMag: 1.5, spectral: "M", distLy: 249, constellation: "Cetus", dist: "249 ly", blurb: "Key star of Cetus", fact: "Mapped for OxyForge constellation atlas · Cetus · ~249 ly from the Sun." },
  { id: "cursa", name: "Cursa", catalogNames: ["Cursa"], dir: raDecToDir(5.13, -5.09), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 67, constellation: "Eridanus", dist: "67 ly", blurb: "Key star of Eridanus", fact: "Mapped for OxyForge constellation atlas · Eridanus · ~67 ly from the Sun." },
  { id: "beta-phe", name: "Beta Phoenicis", catalogNames: ["Beta Phoenicis"], dir: raDecToDir(1.106, -46.72), color: spectralColor("G").hex, mag: 1.15, appMag: 1.5, spectral: "G", distLy: 185, constellation: "Phoenix", dist: "185 ly", blurb: "Key star of Phoenix", fact: "Mapped for OxyForge constellation atlas · Phoenix · ~185 ly from the Sun." },
  { id: "beta-gru", name: "Beta Gruis", catalogNames: ["Beta Gruis"], dir: raDecToDir(22.711, -46.88), color: spectralColor("M").hex, mag: 1.15, appMag: 1.5, spectral: "M", distLy: 177, constellation: "Grus", dist: "177 ly", blurb: "Key star of Grus", fact: "Mapped for OxyForge constellation atlas · Grus · ~177 ly from the Sun." },
  { id: "beta-pav", name: "Beta Pavonis", catalogNames: ["Beta Pavonis"], dir: raDecToDir(20.749, -66.2), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 135, constellation: "Pavo", dist: "135 ly", blurb: "Key star of Pavo", fact: "Mapped for OxyForge constellation atlas · Pavo · ~135 ly from the Sun." },
  { id: "beta-tuc", name: "Beta Tucanae", catalogNames: ["Beta Tucanae"], dir: raDecToDir(0.531, -62.96), color: spectralColor("B").hex, mag: 1.15, appMag: 1.5, spectral: "B", distLy: 140, constellation: "Tucana", dist: "140 ly", blurb: "Key star of Tucana", fact: "Mapped for OxyForge constellation atlas · Tucana · ~140 ly from the Sun." },
  { id: "miaplacidus", name: "Miaplacidus", catalogNames: ["Miaplacidus"], dir: raDecToDir(9.22, -69.72), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 113, constellation: "Carina", dist: "113 ly", blurb: "Key star of Carina", fact: "Mapped for OxyForge constellation atlas · Carina · ~113 ly from the Sun." },
  { id: "avior", name: "Avior", catalogNames: ["Avior"], dir: raDecToDir(8.375, -59.51), color: spectralColor("K").hex, mag: 1.15, appMag: 1.5, spectral: "K", distLy: 630, constellation: "Carina", dist: "630 ly", blurb: "Key star of Carina", fact: "Mapped for OxyForge constellation atlas · Carina · ~630 ly from the Sun." },
  { id: "regor", name: "Regor", catalogNames: ["Regor"], dir: raDecToDir(8.158, -47.34), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 840, constellation: "Vela", dist: "840 ly", blurb: "Key star of Vela", fact: "Mapped for OxyForge constellation atlas · Vela · ~840 ly from the Sun." },
  { id: "azmidiske", name: "Azmidiske", catalogNames: ["Azmidiske"], dir: raDecToDir(7.821, -24.86), color: spectralColor("K").hex, mag: 1.15, appMag: 1.5, spectral: "K", distLy: 1400, constellation: "Puppis", dist: "1400 ly", blurb: "Key star of Puppis", fact: "Mapped for OxyForge constellation atlas · Puppis · ~1400 ly from the Sun." },
  { id: "sheratan", name: "Sheratan", catalogNames: ["Sheratan"], dir: raDecToDir(1.91, 20.81), color: spectralColor("A").hex, mag: 1.15, appMag: 1.5, spectral: "A", distLy: 60, constellation: "Aries", dist: "60 ly", blurb: "Key star of Aries", fact: "Mapped for OxyForge constellation atlas · Aries · ~60 ly from the Sun." },
  { id: "dabih", name: "Dabih", catalogNames: ["Dabih"], dir: raDecToDir(20.35, -14.78), color: spectralColor("K").hex, mag: 1.15, appMag: 1.5, spectral: "K", distLy: 340, constellation: "Capricornus", dist: "340 ly", blurb: "Key star of Capricornus", fact: "Mapped for OxyForge constellation atlas · Capricornus · ~340 ly from the Sun." },
  { id: "sadalmelik", name: "Sadalmelik", catalogNames: ["Sadalmelik"], dir: raDecToDir(22.096, -0.32), color: spectralColor("G").hex, mag: 1.15, appMag: 1.5, spectral: "G", distLy: 520, constellation: "Aquarius", dist: "520 ly", blurb: "Key star of Aquarius", fact: "Mapped for OxyForge constellation atlas · Aquarius · ~520 ly from the Sun." },
  { id: "alpherg", name: "Alpherg", catalogNames: ["Alpherg"], dir: raDecToDir(1.524, 15.35), color: spectralColor("G").hex, mag: 1.15, appMag: 1.5, spectral: "G", distLy: 294, constellation: "Pisces", dist: "294 ly", blurb: "Key star of Pisces", fact: "Mapped for OxyForge constellation atlas · Pisces · ~294 ly from the Sun." },
  { id: "asellus-australis", name: "Asellus Australis", catalogNames: ["Asellus Australis"], dir: raDecToDir(8.745, 18.15), color: spectralColor("K").hex, mag: 1.15, appMag: 1.5, spectral: "K", distLy: 160, constellation: "Cancer", dist: "160 ly", blurb: "Key star of Cancer", fact: "Mapped for OxyForge constellation atlas · Cancer · ~160 ly from the Sun." },
];

/** Stick figures + key-star anchors for all 88 IAU constellations (deep-sky lines). */
export type ConstellationFigure = { name: string; constellation: string; ids: string[] };
export const CONSTELLATIONS: ConstellationFigure[] = [
  { name: "Orion", constellation: "Orion", ids: ["betelgeuse", "bellatrix", "mintaka", "alnitak", "rigel"] },
  { name: "Orion · 2", constellation: "Orion", ids: ["alnitak", "alnilam", "mintaka"] },
  { name: "Orion · 3", constellation: "Orion", ids: ["betelgeuse", "alnitak"] },
  { name: "Orion · 4", constellation: "Orion", ids: ["bellatrix", "mintaka"] },
  { name: "Ursa Major", constellation: "Ursa Major", ids: ["dubhe", "merak", "phecda", "megrez", "alioth", "mizar", "alkaid"] },
  { name: "Ursa Major · 2", constellation: "Ursa Major", ids: ["dubhe", "megrez"] },
  { name: "Ursa Minor", constellation: "Ursa Minor", ids: ["polaris", "kochab", "pherkad"] },
  { name: "Cassiopeia", constellation: "Cassiopeia", ids: ["caph", "schedar", "gamma-cas", "ruchbah", "segin"] },
  { name: "Cygnus", constellation: "Cygnus", ids: ["deneb", "sadr", "gienah-cyg"] },
  { name: "Lyra", constellation: "Lyra", ids: ["vega", "sheliak", "sulafat", "vega"] },
  { name: "Aquila", constellation: "Aquila", ids: ["tarazed", "altair"] },
  { name: "Taurus", constellation: "Taurus", ids: ["aldebaran", "el-nath"] },
  { name: "Gemini", constellation: "Gemini", ids: ["castor", "pollux"] },
  { name: "Leo", constellation: "Leo", ids: ["regulus", "algieba", "denebola"] },
  { name: "Scorpius", constellation: "Scorpius", ids: ["dsco", "antares", "sargas", "shaula"] },
  { name: "Crux", constellation: "Crux", ids: ["acrux", "gacrux"] },
  { name: "Crux · 2", constellation: "Crux", ids: ["mimosa", "delta-cru"] },
  { name: "Centaurus", constellation: "Centaurus", ids: ["acen", "hadar", "menkent"] },
  { name: "Pegasus", constellation: "Pegasus", ids: ["markab", "scheat", "alpheratz", "algenib", "markab"] },
  { name: "Andromeda", constellation: "Andromeda", ids: ["alpheratz", "mirach", "alamak"] },
  { name: "Perseus", constellation: "Perseus", ids: ["mirfak", "algol"] },
  { name: "Auriga", constellation: "Auriga", ids: ["capella", "menkalinan"] },
  { name: "Boötes", constellation: "Boötes", ids: ["arcturus", "nekkar"] },
  { name: "Hercules", constellation: "Hercules", ids: ["kornephoros", "zeta-her", "eta-her", "epsilon-her", "kornephoros"] },
  { name: "Draco", constellation: "Draco", ids: ["thuban", "eltanin", "rastaban"] },
  { name: "Virgo", constellation: "Virgo", ids: ["spica", "porrima"] },
  { name: "Libra", constellation: "Libra", ids: ["zubenelgenubi", "zubeneschamali"] },
  { name: "Sagittarius", constellation: "Sagittarius", ids: ["kaus-australis", "nunki", "ascella"] },
  { name: "Canis Major", constellation: "Canis Major", ids: ["sirius", "adone", "wezen"] },
  { name: "Canis Minor", constellation: "Canis Minor", ids: ["procyon"] },
  { name: "Hydra", constellation: "Hydra", ids: ["alphard", "gamma-hya"] },
  { name: "Cetus", constellation: "Cetus", ids: ["diphda", "menkar"] },
  { name: "Eridanus", constellation: "Eridanus", ids: ["cursa", "achernar"] },
  { name: "Carina", constellation: "Carina", ids: ["canopus", "miaplacidus", "avior"] },
  { name: "Vela", constellation: "Vela", ids: ["suhail", "regor"] },
  { name: "Puppis", constellation: "Puppis", ids: ["naos", "azmidiske"] },
  { name: "Aries", constellation: "Aries", ids: ["hamal", "sheratan"] },
  { name: "Capricornus", constellation: "Capricornus", ids: ["dabih", "deneb-algedi"] },
  { name: "Aquarius", constellation: "Aquarius", ids: ["sadalsuud", "sadalmelik"] },
  { name: "Pisces", constellation: "Pisces", ids: ["eta-psc", "alpherg"] },
  { name: "Cancer", constellation: "Cancer", ids: ["tarf", "asellus-australis"] },
  { name: "Ophiuchus", constellation: "Ophiuchus", ids: ["rasalhague", "sabik"] },
  { name: "Phoenix", constellation: "Phoenix", ids: ["ankaa", "beta-phe"] },
  { name: "Grus", constellation: "Grus", ids: ["alnair", "beta-gru"] },
  { name: "Pavo", constellation: "Pavo", ids: ["peacock", "beta-pav"] },
  { name: "Tucana", constellation: "Tucana", ids: ["alpha-tuc", "beta-tuc"] },
  { name: "Piscis Austrinus", constellation: "Piscis Austrinus", ids: ["fomalhaut"] },
  { name: "Antlia", constellation: "Antlia", ids: ["alpha-ant"] },
  { name: "Apus", constellation: "Apus", ids: ["alpha-aps"] },
  { name: "Ara", constellation: "Ara", ids: ["beta-ara"] },
  { name: "Caelum", constellation: "Caelum", ids: ["alpha-cae"] },
  { name: "Camelopardalis", constellation: "Camelopardalis", ids: ["beta-cam"] },
  { name: "Canes Venatici", constellation: "Canes Venatici", ids: ["cor-caroli"] },
  { name: "Cepheus", constellation: "Cepheus", ids: ["alderamin"] },
  { name: "Chamaeleon", constellation: "Chamaeleon", ids: ["alpha-cha"] },
  { name: "Circinus", constellation: "Circinus", ids: ["alpha-cir"] },
  { name: "Columba", constellation: "Columba", ids: ["phact"] },
  { name: "Coma Berenices", constellation: "Coma Berenices", ids: ["beta-com"] },
  { name: "Corona Australis", constellation: "Corona Australis", ids: ["beta-cra"] },
  { name: "Corona Borealis", constellation: "Corona Borealis", ids: ["alphecca"] },
  { name: "Corvus", constellation: "Corvus", ids: ["gienah"] },
  { name: "Crater", constellation: "Crater", ids: ["delta-crt"] },
  { name: "Delphinus", constellation: "Delphinus", ids: ["rotanev"] },
  { name: "Dorado", constellation: "Dorado", ids: ["alpha-dor"] },
  { name: "Equuleus", constellation: "Equuleus", ids: ["kitalpha"] },
  { name: "Fornax", constellation: "Fornax", ids: ["alpha-for"] },
  { name: "Horologium", constellation: "Horologium", ids: ["alpha-hor"] },
  { name: "Hydrus", constellation: "Hydrus", ids: ["alpha-hyi"] },
  { name: "Indus", constellation: "Indus", ids: ["alpha-ind"] },
  { name: "Lacerta", constellation: "Lacerta", ids: ["alpha-lac"] },
  { name: "Leo Minor", constellation: "Leo Minor", ids: ["praecipua"] },
  { name: "Lepus", constellation: "Lepus", ids: ["arneb"] },
  { name: "Lupus", constellation: "Lupus", ids: ["alpha-lup"] },
  { name: "Lynx", constellation: "Lynx", ids: ["alpha-lyn"] },
  { name: "Mensa", constellation: "Mensa", ids: ["alpha-men"] },
  { name: "Microscopium", constellation: "Microscopium", ids: ["gamma-mic"] },
  { name: "Monoceros", constellation: "Monoceros", ids: ["beta-mon"] },
  { name: "Musca", constellation: "Musca", ids: ["alpha-mus"] },
  { name: "Norma", constellation: "Norma", ids: ["gamma-nor"] },
  { name: "Octans", constellation: "Octans", ids: ["nu-oct"] },
  { name: "Pictor", constellation: "Pictor", ids: ["alpha-pic"] },
  { name: "Pyxis", constellation: "Pyxis", ids: ["alpha-pyx"] },
  { name: "Reticulum", constellation: "Reticulum", ids: ["alpha-ret"] },
  { name: "Sagitta", constellation: "Sagitta", ids: ["gamma-sge"] },
  { name: "Sculptor", constellation: "Sculptor", ids: ["alpha-scl"] },
  { name: "Scutum", constellation: "Scutum", ids: ["alpha-sct"] },
  { name: "Serpens", constellation: "Serpens", ids: ["unukalhai"] },
  { name: "Sextans", constellation: "Sextans", ids: ["alpha-sex"] },
  { name: "Telescopium", constellation: "Telescopium", ids: ["alpha-tel"] },
  { name: "Triangulum", constellation: "Triangulum", ids: ["beta-tri"] },
  { name: "Triangulum Australe", constellation: "Triangulum Australe", ids: ["atria"] },
  { name: "Volans", constellation: "Volans", ids: ["beta-vol"] },
  { name: "Vulpecula", constellation: "Vulpecula", ids: ["anser"] },
];

export type DeepSkyObject = {
  id: string;
  name: string;
  catalogNames?: string[];
  type: "galaxy" | "nebula" | "open-cluster" | "globular-cluster" | "supernova-remnant";
  dir: V;
  ra?: number;
  dec?: number;
  distanceLy?: number;
  magnitude?: number;
  constellation?: string;
  angularSize?: number;
  description?: string;
  origin?: string;
  // legacy render fields
  rx: number;
  ry: number;
  color: string;
  dist: string;
  blurb: string;
  fact: string;
};

export const GALAXIES: DeepSkyObject[] = [
  { id: "andromeda", name: "Andromeda Galaxy", catalogNames: ["M31", "NGC 224"], type: "galaxy", dir: raDecToDir(0.71, 41.3), ra: 0.71, dec: 41.3, distanceLy: 2.54e6, magnitude: 3.4, constellation: "Andromeda", angularSize: 3.2, description: "Nearest major spiral galaxy", origin: "Named for the mythical princess; catalogued by Messier as M31.", rx: 1.15, ry: 0.42, color: "#d8c8f0", dist: "2.5 million ly", blurb: "Nearest big spiral galaxy", fact: "On a long collision course with the Milky Way; they will merge in a few billion years." },
  { id: "m33", name: "Triangulum Galaxy", catalogNames: ["M33", "NGC 598"], type: "galaxy", dir: raDecToDir(1.56, 30.7), ra: 1.56, dec: 30.7, distanceLy: 2.73e6, magnitude: 5.7, constellation: "Triangulum", angularSize: 0.9, description: "Third-largest member of the Local Group", origin: "Messier 33; visible under dark skies as a faint patch.", rx: 0.7, ry: 0.55, color: "#c8d0f0", dist: "2.7 million ly", blurb: "Local Group spiral", fact: "Face-on spiral rich in star-forming regions; a quiet neighbor of Andromeda." },
  { id: "lmc", name: "Large Magellanic Cloud", catalogNames: ["LMC", "Nubecula Major"], type: "galaxy", dir: raDecToDir(5.39, -69.8), ra: 5.39, dec: -69.8, distanceLy: 163000, magnitude: 0.9, constellation: "Dorado", angularSize: 10, description: "Satellite galaxy of the Milky Way", origin: "Named for Ferdinand Magellan’s voyage; visible from the southern hemisphere.", rx: 0.55, ry: 0.28, color: "#f0d8c8", dist: "160,000 ly", blurb: "Milky Way satellite", fact: "Still forming stars; home to the Tarantula Nebula, one of the most active starburst regions nearby." },
  { id: "smc", name: "Small Magellanic Cloud", catalogNames: ["SMC", "Nubecula Minor"], type: "galaxy", dir: raDecToDir(0.88, -72.8), ra: 0.88, dec: -72.8, distanceLy: 200000, magnitude: 2.7, constellation: "Tucana", angularSize: 5, description: "Smaller Magellanic companion", origin: "Companion of the LMC; both are being tidally distorted by the Milky Way.", rx: 0.35, ry: 0.22, color: "#e8d0c0", dist: "200,000 ly", blurb: "Smaller Magellanic Cloud", fact: "Irregular dwarf galaxy; a stream of gas links it to the LMC and the Milky Way." },
  { id: "m51", name: "Whirlpool Galaxy", catalogNames: ["M51", "NGC 5194"], type: "galaxy", dir: raDecToDir(13.5, 47.2), ra: 13.5, dec: 47.2, distanceLy: 23e6, magnitude: 8.4, constellation: "Canes Venatici", angularSize: 0.18, description: "Classic face-on spiral with companion", origin: "Messier 51; the spiral structure was first noted by Lord Rosse in 1845.", rx: 0.5, ry: 0.45, color: "#d0c8e8", dist: "23 million ly", blurb: "Grand-design spiral", fact: "Interacting with NGC 5195; a textbook face-on spiral for amateur telescopes." },
  { id: "m104", name: "Sombrero Galaxy", catalogNames: ["M104", "NGC 4594"], type: "galaxy", dir: raDecToDir(12.67, -11.6), ra: 12.67, dec: -11.6, distanceLy: 31e6, magnitude: 8.0, constellation: "Virgo", angularSize: 0.15, description: "Edge-on spiral with a bright dust lane", origin: "Named for its hat-like appearance; Messier 104.", rx: 0.55, ry: 0.2, color: "#e0d0b8", dist: "31 million ly", blurb: "Edge-on spiral with dust lane", fact: "Huge central bulge and dark equatorial dust lane give the famous ‘sombrero’ silhouette." },
  { id: "m81", name: "Bode's Galaxy", catalogNames: ["M81", "NGC 3031"], type: "galaxy", dir: raDecToDir(9.93, 69.1), ra: 9.93, dec: 69.1, distanceLy: 12e6, magnitude: 6.9, constellation: "Ursa Major", angularSize: 0.35, description: "Bright spiral near the Big Dipper", origin: "Discovered by Johann Bode in 1774; Messier 81.", rx: 0.6, ry: 0.4, color: "#d8d0e8", dist: "12 million ly", blurb: "Grand spiral in Ursa Major", fact: "Pairs with M82; one of the brightest galaxies in the northern sky." },
  { id: "m82", name: "Cigar Galaxy", catalogNames: ["M82", "NGC 3034"], type: "galaxy", dir: raDecToDir(9.93, 69.7), ra: 9.93, dec: 69.7, distanceLy: 12e6, magnitude: 8.4, constellation: "Ursa Major", angularSize: 0.18, description: "Starburst galaxy with outflows", origin: "Messier 82; the ‘cigar’ shape comes from edge-on orientation and dust.", rx: 0.45, ry: 0.18, color: "#e8c8a0", dist: "12 million ly", blurb: "Starburst edge-on galaxy", fact: "Violent star formation driven by interaction with M81; spectacular in infrared." },
  { id: "cena", name: "Centaurus A", catalogNames: ["NGC 5128", "Cen A"], type: "galaxy", dir: raDecToDir(13.42, -43.0), ra: 13.42, dec: -43.0, distanceLy: 13e6, magnitude: 6.8, constellation: "Centaurus", angularSize: 0.4, description: "Peculiar galaxy with a dark dust lane", origin: "Brightest galaxy in Centaurus; strong radio source.", rx: 0.55, ry: 0.35, color: "#e0c8a8", dist: "13 million ly", blurb: "Radio galaxy with dust lane", fact: "Hosts a supermassive black hole powering radio jets; a merger remnant." },
  { id: "m101", name: "Pinwheel Galaxy", catalogNames: ["M101", "NGC 5457"], type: "galaxy", dir: raDecToDir(14.05, 54.3), ra: 14.05, dec: 54.3, distanceLy: 21e6, magnitude: 7.9, constellation: "Ursa Major", angularSize: 0.4, description: "Face-on grand-design spiral", origin: "Messier 101; classic pinwheel appearance.", rx: 0.55, ry: 0.5, color: "#d0d8f0", dist: "21 million ly", blurb: "Face-on spiral pinwheel", fact: "Large, face-on spiral with prominent H II regions; a favorite deep-sky target." },
  { id: "m42", name: "Orion Nebula", catalogNames: ["M42", "NGC 1976"], type: "nebula", dir: raDecToDir(5.59, -5.4), ra: 5.59, dec: -5.4, distanceLy: 1340, magnitude: 4.0, constellation: "Orion", angularSize: 1.0, description: "Brightest emission nebula in the sky", origin: "The ‘sword’ of Orion; known since antiquity, catalogued as M42.", rx: 0.4, ry: 0.35, color: "#a0d0ff", dist: "1,340 ly", blurb: "Emission / reflection nebula", fact: "A stellar nursery lit by the Trapezium cluster; the nearest massive star-forming region." },
  { id: "m8", name: "Lagoon Nebula", catalogNames: ["M8", "NGC 6523"], type: "nebula", dir: raDecToDir(18.06, -24.4), ra: 18.06, dec: -24.4, distanceLy: 4100, magnitude: 6.0, constellation: "Sagittarius", angularSize: 0.5, description: "Bright emission nebula in the summer Milky Way", origin: "Named for the dark lagoon of dust bisecting the glow; Messier 8.", rx: 0.45, ry: 0.3, color: "#f0a0b0", dist: "4,100 ly", blurb: "Emission nebula", fact: "H II region in Sagittarius; a dark dust lane creates the lagoon appearance." },
  { id: "m20", name: "Trifid Nebula", catalogNames: ["M20", "NGC 6514"], type: "nebula", dir: raDecToDir(18.04, -23.0), ra: 18.04, dec: -23.0, distanceLy: 5200, magnitude: 6.3, constellation: "Sagittarius", angularSize: 0.3, description: "Emission and reflection nebula with dark lanes", origin: "Named ‘trifid’ for the three dark dust lanes that trisect it; Messier 20.", rx: 0.35, ry: 0.3, color: "#e0a0d0", dist: "5,200 ly", blurb: "Emission + reflection nebula", fact: "Pink emission and blue reflection regions divided by dark dust lanes." },
  { id: "m16", name: "Eagle Nebula", catalogNames: ["M16", "NGC 6611"], type: "nebula", dir: raDecToDir(18.31, -13.8), ra: 18.31, dec: -13.8, distanceLy: 7000, magnitude: 6.0, constellation: "Serpens", angularSize: 0.3, description: "Star-forming pillars of gas and dust", origin: "Messier 16; famous for the ‘Pillars of Creation’ imaged by Hubble.", rx: 0.35, ry: 0.32, color: "#d0b0a0", dist: "7,000 ly", blurb: "Emission nebula · pillars", fact: "Pillars of dust and gas where new stars are forming; a Hubble icon." },
  { id: "carina", name: "Carina Nebula", catalogNames: ["NGC 3372", "η Carinae Nebula"], type: "nebula", dir: raDecToDir(10.75, -59.9), ra: 10.75, dec: -59.9, distanceLy: 7500, magnitude: 1.0, constellation: "Carina", angularSize: 2.0, description: "Huge southern emission nebula", origin: "Surrounds the unstable star η Carinae; among the brightest nebulae.", rx: 0.7, ry: 0.4, color: "#f0c0a0", dist: "7,500 ly", blurb: "Southern emission complex", fact: "Home to η Carinae and the Keyhole Nebula; far brighter than Orion from the south." },
  { id: "rosette", name: "Rosette Nebula", catalogNames: ["NGC 2237", "Caldwell 49"], type: "nebula", dir: raDecToDir(6.53, 4.9), ra: 6.53, dec: 4.9, distanceLy: 5200, magnitude: 9.0, constellation: "Monoceros", angularSize: 1.3, description: "Circular emission nebula with open cluster", origin: "Named for its rose-like shape; surrounds the cluster NGC 2244.", rx: 0.4, ry: 0.38, color: "#f0a0b8", dist: "5,200 ly", blurb: "Rose-shaped H II region", fact: "Young cluster winds have carved a cavity; a classic rose in monochrome photos." },
  { id: "m1", name: "Crab Nebula", catalogNames: ["M1", "NGC 1952"], type: "supernova-remnant", dir: raDecToDir(5.58, 22.0), ra: 5.58, dec: 22.0, distanceLy: 6500, magnitude: 8.4, constellation: "Taurus", angularSize: 0.1, description: "Remnant of the 1054 supernova", origin: "Messier’s first object; the guest star of 1054 recorded in Chinese chronicles.", rx: 0.25, ry: 0.22, color: "#c0d0f0", dist: "6,500 ly", blurb: "Supernova remnant", fact: "Pulsar at the center spins 30 times per second; the expanding shell is the Crab." },
  { id: "m45", name: "Pleiades", catalogNames: ["M45", "Seven Sisters"], type: "open-cluster", dir: raDecToDir(3.79, 24.1), ra: 3.79, dec: 24.1, distanceLy: 444, magnitude: 1.6, constellation: "Taurus", angularSize: 1.8, description: "Bright open cluster", origin: "Known since antiquity; Messier 45. Reflection nebulosity surrounds the stars.", rx: 0.5, ry: 0.45, color: "#c8e0ff", dist: "444 ly", blurb: "Open cluster · Seven Sisters", fact: "Young hot stars still wrapped in reflection nebulosity; a naked-eye landmark." },
  { id: "omega", name: "Omega Centauri", catalogNames: ["NGC 5139", "ω Cen"], type: "globular-cluster", dir: raDecToDir(13.45, -47.5), ra: 13.45, dec: -47.5, distanceLy: 15800, magnitude: 3.9, constellation: "Centaurus", angularSize: 0.6, description: "Brightest globular cluster", origin: "Once thought a star; largest and brightest globular in the Milky Way.", rx: 0.35, ry: 0.35, color: "#f0e0c0", dist: "16,000 ly", blurb: "Brightest globular cluster", fact: "May be the remnant core of a disrupted dwarf galaxy; ~10 million stars." },
];

export type Star = {
  x: number;
  y: number;
  z: number;
  b: number;
  s: number;
  cr: number;
  cg: number;
  cb: number;
  mag?: number;
  spectral?: string;
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function onSphere(rnd: () => number): V {
  const a = rnd() * Math.PI * 2;
  const z = rnd() * 2 - 1;
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  return { x: r * Math.cos(a), y: z, z: r * Math.sin(a) };
}

/** Deterministic field with magnitude-weighted brightness and spectral colors. */
export function makeField(n: number, seed: number): Star[] {
  const rnd = rng(seed);
  const out: Star[] = [];
  const spectralWeights = [
    { sp: "O", w: 0.01 },
    { sp: "B", w: 0.05 },
    { sp: "A", w: 0.1 },
    { sp: "F", w: 0.15 },
    { sp: "G", w: 0.2 },
    { sp: "K", w: 0.25 },
    { sp: "M", w: 0.24 },
  ];
  for (let i = 0; i < n; i++) {
    const d = onSphere(rnd);
    // Power-law-ish magnitude distribution (more faint stars)
    const u = rnd();
    const appMag = 1.8 + Math.pow(u, 0.55) * 5.2; // brighter overall
    const bright = Math.max(0.22, Math.min(1, Math.pow(2.512, 4.8 - appMag) * 0.55));
    let roll = rnd();
    let sp = "G";
    for (const s of spectralWeights) {
      roll -= s.w;
      if (roll <= 0) {
        sp = s.sp;
        break;
      }
    }
    const col = spectralColor(sp);
    out.push({
      ...d,
      b: bright,
      s: Math.max(0.55, Math.min(3.2, 0.55 + (6.2 - appMag) * 0.42)),
      cr: col.r,
      cg: col.g,
      cb: col.b,
      mag: appMag,
      spectral: sp,
    });
  }
  return out;
}

export function makeMilkyWay(n: number): Star[] {
  const rnd = rng(91);
  const out: Star[] = [];
  for (let i = 0; i < n; i++) {
    const along = (rnd() - 0.5) * Math.PI * 1.7;
    const off = (rnd() - 0.5) * 0.2;
    const x = Math.cos(along);
    const z = Math.sin(along);
    const y = off + (rnd() - 0.5) * 0.07;
    const len = Math.hypot(x, y, z) || 1;
    const warm = rnd();
    const appMag = 3.2 + rnd() * 3.8;
    const bright = Math.max(0.18, Math.min(0.95, Math.pow(2.512, 5.2 - appMag) * 0.4));
    out.push({
      x: x / len,
      y: y / len,
      z: z / len,
      b: bright,
      s: 0.5 + rnd() * 1.4,
      cr: 230 + warm * 25,
      cg: 215 + (1 - warm) * 30,
      cb: 195 + rnd() * 45,
      mag: appMag,
    });
  }
  return out;
}

/** ~5,000+ catalog stars for a dense but readable sky. Architecture scales further. */
export const FIELD = makeField(3600, 17);
export const MILKY = makeMilkyWay(1800);

export type Rock = { x: number; y: number; z: number; r: number };
export const ASTEROIDS: Rock[] = (() => {
  const rnd = rng(44);
  const out: Rock[] = [];
  for (let i = 0; i < 160; i++) {
    const a = rnd() * Math.PI * 2;
    const rad = 128 + rnd() * 18;
    out.push({
      x: Math.cos(a) * rad,
      y: (rnd() - 0.5) * 3.2,
      z: Math.sin(a) * rad,
      r: 0.12 + rnd() * 0.35,
    });
  }
  return out;
})();

export function posOf(id: string, t: number, cache: Map<string, V>): V {
  const hit = cache.get(id);
  if (hit) return hit;
  const b = BODIES.find((x) => x.id === id);
  if (!b) return { x: 0, y: 0, z: 0 };
  let p: V;
  if (b.kind === "sun" || !b.orbit) p = { x: 0, y: 0, z: 0 };
  else if (b.parent) {
    const parent = posOf(b.parent, t, cache);
    const ang = b.phase + t * ((Math.PI * 2) / Math.max(1, b.period * 0.55));
    p = {
      x: parent.x + Math.cos(ang) * b.orbit,
      y: parent.y + Math.sin(ang * 0.4) * b.tilt * 8,
      z: parent.z + Math.sin(ang) * b.orbit,
    };
  } else {
    const ang = b.phase + t * ((Math.PI * 2) / Math.max(1, b.period * 0.55));
    p = {
      x: Math.cos(ang) * b.orbit,
      y: Math.sin(ang * 0.5) * b.tilt * 10,
      z: Math.sin(ang) * b.orbit,
    };
  }
  cache.set(id, p);
  return p;
}

export function angOf(id: string, t: number): number {
  const b = BODIES.find((x) => x.id === id);
  if (!b) return 0;
  return b.phase + t * ((Math.PI * 2) / Math.max(1, b.period * 0.55));
}

export function startPose(dest: "moon" | "mars"): { pos: V; vel: V; pitch: number } {
  const cache = new Map<string, V>();
  const earth = posOf("earth", 0, cache);
  const moon = posOf("moon", 0, cache);
  const mars = posOf("mars", 0, cache);
  if (dest === "moon") {
    return {
      pos: { x: earth.x + 1.1, y: earth.y + 2.4, z: earth.z + 15.5 },
      vel: { x: (moon.x - earth.x) * 0.035, y: 0.04, z: (moon.z - earth.z) * 0.035 - 1.8 },
      pitch: 0.04,
    };
  }
  return {
    pos: {
      x: earth.x * 0.62 + mars.x * 0.18,
      y: 28,
      z: earth.z * 0.62 + mars.z * 0.18 + 42,
    },
    vel: { x: (mars.x - earth.x) * 0.01, y: -0.35, z: (mars.z - earth.z) * 0.01 - 2.8 },
    pitch: -0.42,
  };
}

/**
 * Predicted transfer corridor.
 * Moon: simplified translunar intercept — aim at where the Moon will be at arrival,
 * with a slight out-of-plane arc (not a straight chord).
 * Mars: heliocentric transfer arc inspired by a Hohmann half-ellipse (sun at focus),
 * evaluated at current simulation time so both planets keep moving.
 * Units: same compressed world units as BODIES (AU = 72).
 */
export function transferPath(dest: "moon" | "mars", t: number, n = 64): V[] {
  const cache = new Map<string, V>();
  const earth = posOf("earth", t, cache);
  const out: V[] = [];

  if (dest === "moon") {
    // Lead the Moon: intercept at ~3 days of lunar motion (period ~27 sim units scaled)
    const leadT = t + 1.6;
    const moonLead = posOf("moon", leadT, new Map());
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      // Cubic-ish smooth with a gentle vertical arc (translunar coast)
      const rise = Math.sin(u * Math.PI) * 2.2;
      out.push({
        x: earth.x + (moonLead.x - earth.x) * u,
        y: earth.y + (moonLead.y - earth.y) * u + rise,
        z: earth.z + (moonLead.z - earth.z) * u,
      });
    }
    return out;
  }

  // Mars: Hohmann-like transfer ellipse from Earth's current angle
  const fromAng = angOf("earth", t);
  const r1 = AU;
  const r2 = 102;
  const a = (r1 + r2) / 2;
  const e = Math.abs(r2 - r1) / (r1 + r2);
  // Phase of Mars at departure for intercept (simplified lead)
  const marsAng0 = angOf("mars", t);
  // Transfer true anomaly 0 → π
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const th = u * Math.PI;
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(th));
    const ang = fromAng + th;
    // Slight inclination for visibility
    const y = Math.sin(u * Math.PI) * 4.5;
    out.push({ x: Math.cos(ang) * r, y, z: Math.sin(ang) * r });
  }
  // Nudge endpoint toward current Mars position so the corridor stays relevant
  const marsNow = posOf("mars", t, cache);
  const last = out[out.length - 1];
  if (last) {
    const blend = 0.35;
    last.x = last.x * (1 - blend) + marsNow.x * blend;
    last.y = last.y * (1 - blend) + marsNow.y * blend;
    last.z = last.z * (1 - blend) + marsNow.z * blend;
  }
  void marsAng0;
  return out;
}

/** Cumulative path length of a polyline in world units. */
export function pathLength(pts: V[]): number {
  let sum = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    sum += Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  }
  return sum;
}

/** Format a distance in world units for HUD (Moon scale vs AU scale). */
export function formatDistSmart(units: number, dest: "moon" | "mars"): string {
  if (dest === "moon" || units < 50) {
    const km = units * (384400 / 16);
    if (km >= 1e6) return `${(km / 1e6).toFixed(2)} million km`;
    if (km >= 1000) return `${(km / 1000).toFixed(0)} thousand km`;
    return `${km.toFixed(0)} km`;
  }
  const au = units / AU;
  if (au < 0.01) {
    const km = au * 1.496e8;
    return `${(km / 1000).toFixed(0)} thousand km`;
  }
  if (au < 0.5) return `${(au * 1.496e8 / 1e6).toFixed(1)} million km`;
  return `${au.toFixed(2)} AU`;
}

/** Azimuth (0–360°) and elevation (−90…+90°) of a world direction relative to ship frame.
 *  Azimuth: 0 = +Z projected, increasing clockwise when viewed from above (+Y).
 *  Elevation: angle above the local horizontal plane of the ship. */
export function azElFromCam(cam: V): { az: number; el: number } {
  const horiz = Math.hypot(cam.x, cam.z) || 1e-9;
  const el = (Math.atan2(cam.y, horiz) * 180) / Math.PI;
  let az = (Math.atan2(cam.x, -cam.z) * 180) / Math.PI;
  if (az < 0) az += 360;
  return { az, el };
}

/** Hohmann ellipse in the ecliptic, sun at a focus, periapsis aligned with `fromAng`. */
export function hohmannEllipse(r1: number, r2: number, fromAng: number, n = 72): V[] {
  const a = (r1 + r2) / 2;
  const e = Math.abs(r2 - r1) / (r1 + r2);
  const out: V[] = [];
  for (let i = 0; i <= n; i++) {
    const th = (i / n) * Math.PI; // 0 at periapsis → π at apoapsis (the transfer half)
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(th));
    const ang = fromAng + th;
    out.push({ x: Math.cos(ang) * r, y: 0, z: Math.sin(ang) * r });
  }
  return out;
}

export function orbitSpeedHint(orbit: number): number {
  // vis-viva analog for near-circular: v ∝ 1/√r
  return 1 / Math.sqrt(Math.max(8, orbit) / AU);
}

const textures = new Map<string, HTMLCanvasElement>();
const photos = new Map<string, HTMLImageElement>();
let photosStarted = false;

const PHOTO_IDS = ["earth", "moon", "mars", "jupiter", "saturn", "sun", "venus", "uranus", "andromeda"] as const;

export function warmupPhotos() {
  if (photosStarted || typeof Image === "undefined") return;
  photosStarted = true;
  for (const id of PHOTO_IDS) {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.decoding = "async";
    im.src = `/cosmos/${id}.webp`;
    im.onerror = () => { im.dataset.failed = "1"; };
    photos.set(id, im);
  }
}

export function photoOf(id: string): HTMLImageElement | null {
  const im = photos.get(id);
  if (im && im.dataset.failed !== "1" && im.complete && im.naturalWidth > 1 && im.naturalHeight > 1) return im;
  return null;
}

/** Return a warmed image while it is still loading so renderers can subscribe to load/error. */
export function photoImage(id: string): HTMLImageElement | null {
  return photos.get(id) ?? null;
}

function bake(id: string, paint: (g: CanvasRenderingContext2D, w: number, h: number) => void, size = 384) {
  if (textures.has(id)) return textures.get(id)!;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d")!;
  paint(g, size, size);
  textures.set(id, c);
  return c;
}

export function bodyTexture(id: string): HTMLCanvasElement {
  if (id === "earth") {
    return bake(id, (g, w, h) => {
      g.fillStyle = "#123a68";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#1f5f8c";
      g.fillRect(0, h * 0.42, w, h * 0.18);
      const land = (x: number, y: number, rw: number, rh: number, rot: number) => {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.beginPath();
        g.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
        g.fill();
        g.restore();
      };
      g.fillStyle = "#2f7a4e";
      land(w * 0.22, h * 0.38, 48, 28, -0.4);
      land(w * 0.28, h * 0.62, 32, 48, 0.3);
      g.fillStyle = "#c2a46a";
      land(w * 0.52, h * 0.48, 58, 38, 0.15);
      g.fillStyle = "#2f7a4e";
      land(w * 0.55, h * 0.32, 70, 24, 0.1);
      land(w * 0.78, h * 0.4, 54, 30, -0.2);
      land(w * 0.82, h * 0.62, 28, 16, 0.4);
      g.fillStyle = "rgba(232,237,244,0.95)";
      g.fillRect(0, 0, w, 28);
      g.fillRect(0, h - 26, w, 26);
      g.fillStyle = "rgba(255,255,255,0.32)";
      for (let i = 0; i < 14; i++) {
        g.beginPath();
        g.ellipse((i * 90) % w, 70 + ((i * 29) % 160), 34, 7, i, 0, Math.PI * 2);
        g.fill();
      }
    });
  }
  if (id === "moon") {
    return bake(id, (g, w, h) => {
      g.fillStyle = "#b7c0ca";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#8b95a1";
      for (let i = 0; i < 48; i++) {
        g.beginPath();
        g.arc((i * 73) % w, (i * 51) % h, 4 + (i % 16), 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = "#6f7884";
      for (let i = 0; i < 8; i++) {
        g.beginPath();
        g.ellipse((i * 83) % w, (i * 59) % h, 26, 16, 0, 0, Math.PI * 2);
        g.fill();
      }
    });
  }
  if (id === "mars") {
    return bake(id, (g, w, h) => {
      g.fillStyle = "#b35a3a";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#c4896a";
      for (let i = 0; i < 16; i++) {
        g.beginPath();
        g.ellipse((i * 55) % w, (i * 41) % h, 28, 10, i, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = "#6a4030";
      g.fillRect(40, 150, 180, 16);
      g.fillStyle = "#e8edf4";
      g.fillRect(0, 0, w, 22);
      g.fillRect(0, h - 18, w, 18);
    });
  }
  if (id === "jupiter") {
    return bake(id, (g, w, h) => {
      const bands = ["#e6d3b0", "#c9a078", "#efe0c4", "#b8875c", "#e2c79a", "#d4a878"];
      for (let i = 0; i < 14; i++) {
        g.fillStyle = bands[i % bands.length];
        g.fillRect(0, (h / 14) * i, w, h / 14 + 1);
      }
      g.fillStyle = "#c45a3a";
      g.beginPath();
      g.ellipse(240, 220, 36, 20, -0.3, 0, Math.PI * 2);
      g.fill();
    });
  }
  if (id === "saturn") {
    return bake(id, (g, w, h) => {
      const bands = ["#e8d7b0", "#d7c394", "#efe4c4", "#cbb888"];
      for (let i = 0; i < 10; i++) {
        g.fillStyle = bands[i % bands.length];
        g.fillRect(0, (h / 10) * i, w, h / 10 + 1);
      }
    });
  }
  if (id === "venus") {
    return bake(id, (g, w, h) => {
      g.fillStyle = "#e4d2a8";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(255,255,255,0.25)";
      g.lineWidth = 6;
      for (let i = 0; i < 8; i++) {
        g.beginPath();
        g.ellipse(w / 2, (i * 48) % h, 140, 12, 0.4, 0, Math.PI * 2);
        g.stroke();
      }
    });
  }
  if (id === "mercury") {
    return bake(id, (g, w, h) => {
      g.fillStyle = "#8e8680";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#6d6762";
      for (let i = 0; i < 40; i++) {
        g.beginPath();
        g.arc((i * 67) % w, (i * 43) % h, 3 + (i % 12), 0, Math.PI * 2);
        g.fill();
      }
    });
  }
  if (id === "uranus") {
    return bake(id, (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, "#cfe8ea");
      grd.addColorStop(0.5, "#9fd0d4");
      grd.addColorStop(1, "#6aa8b0");
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
    });
  }
  if (id === "neptune") {
    return bake(id, (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, "#6aa0e0");
      grd.addColorStop(0.5, "#2f5fbf");
      grd.addColorStop(1, "#1a3a80");
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#1a2a55";
      g.beginPath();
      g.ellipse(220, 180, 40, 22, 0.2, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,0.35)";
      g.lineWidth = 4;
      g.beginPath();
      g.ellipse(w / 2, h * 0.4, 160, 10, -0.2, 0, Math.PI * 2);
      g.stroke();
    });
  }
  return bake(id, (g, w, h) => {
    g.fillStyle = "#8899aa";
    g.fillRect(0, 0, w, h);
  });
}

export function pickLesson(args: {
  dest: "moon" | "mars";
  thrusting: boolean;
  drifted: boolean;
  looking: string | null;
}): LessonId {
  if (args.thrusting) return "burn";
  if (args.drifted) return "coast";
  if (args.looking === "sun") return "gravity";
  if (args.looking === "mars") return "window";
  if (args.looking === "earth" || args.looking === "moon") return "visviva";
  return args.dest === "mars" ? "hohmann" : "visviva";
}

export function formatRange(units: number, dest: "moon" | "mars"): string {
  if (dest === "moon" || units < 40) {
    const km = units * (384400 / 16);
    if (km > 12000) return `${(km / 1000).toFixed(0)} thousand km`;
    return `${km.toFixed(0)} km`;
  }
  const au = units / AU;
  if (au < 0.08) return `${(au * 1.496e8 / 1000).toFixed(0)} thousand km`;
  return `${au.toFixed(2)} AU`;
}
