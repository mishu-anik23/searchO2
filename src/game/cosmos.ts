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
  { id: "sirius", name: "Sirius", catalogNames: ["α CMa", "HIP 32349"], dir: raDecToDir(6.75, -16.7), color: spectralColor("A").hex, mag: 1.9, appMag: -1.46, spectral: "A1V", distLy: 8.6, constellation: "Canis Major", dist: "8.6 ly", blurb: "Brightest star in the night sky", fact: "A nearby A-type star with a white-dwarf companion. Light-year ≈ 9.46 trillion km." },
  { id: "canopus", name: "Canopus", catalogNames: ["α Car", "HIP 30438"], dir: raDecToDir(6.4, -52.7), color: spectralColor("F").hex, mag: 1.7, appMag: -0.74, spectral: "A9II", distLy: 310, constellation: "Carina", dist: "310 ly", blurb: "Second-brightest star", fact: "A southern giant used by spacecraft for attitude reference." },
  { id: "acen", name: "α Centauri", catalogNames: ["Rigil Kentaurus", "HIP 71683"], dir: raDecToDir(14.66, -60.8), color: spectralColor("G").hex, mag: 1.55, appMag: -0.27, spectral: "G2V", distLy: 4.37, constellation: "Centaurus", dist: "4.37 ly", blurb: "Nearest star system to the Sun", fact: "Triple system; Proxima hosts a small planet in the habitable zone. Still ~9,000× farther than Neptune." },
  { id: "arcturus", name: "Arcturus", catalogNames: ["α Boo", "HIP 69673"], dir: raDecToDir(14.26, 19.2), color: spectralColor("K").hex, mag: 1.5, appMag: -0.05, spectral: "K1.5III", distLy: 36.7, constellation: "Boötes", dist: "37 ly", blurb: "Orange giant · spring sky", fact: "An aging K-giant racing through the galaxy; one of the brightest northern stars." },
  { id: "vega", name: "Vega", catalogNames: ["α Lyr", "HIP 91262"], dir: raDecToDir(18.62, 38.8), color: spectralColor("A").hex, mag: 1.45, appMag: 0.03, spectral: "A0V", distLy: 25, constellation: "Lyra", dist: "25 ly", blurb: "Summer Triangle · white-hot", fact: "Former and future pole star as Earth precesses over ~26,000 years." },
  { id: "capella", name: "Capella", catalogNames: ["α Aur", "HIP 24608"], dir: raDecToDir(5.28, 46.0), color: spectralColor("G").hex, mag: 1.4, appMag: 0.08, spectral: "G8III", distLy: 42.9, constellation: "Auriga", dist: "43 ly", blurb: "Yellow giant pair", fact: "Actually a quadruple system; two bright G-giants dominate the light." },
  { id: "rigel", name: "Rigel", catalogNames: ["β Ori", "HIP 24436"], dir: raDecToDir(5.24, -8.2), color: spectralColor("B").hex, mag: 1.5, appMag: 0.13, spectral: "B8Ia", distLy: 860, constellation: "Orion", dist: "860 ly", blurb: "Orion’s blue foot", fact: "Blue supergiant ~120,000× the Sun’s luminosity. Frames Orion with Betelgeuse." },
  { id: "procyon", name: "Procyon", catalogNames: ["α CMi", "HIP 37279"], dir: raDecToDir(7.66, 5.2), color: spectralColor("F").hex, mag: 1.35, appMag: 0.34, spectral: "F5IV", distLy: 11.5, constellation: "Canis Minor", dist: "11.5 ly", blurb: "Before the dog", fact: "F-type subgiant with a white-dwarf companion; rises before Sirius." },
  { id: "achernar", name: "Achernar", catalogNames: ["α Eri", "HIP 7588"], dir: raDecToDir(1.63, -57.3), color: spectralColor("B").hex, mag: 1.35, appMag: 0.46, spectral: "B6Vep", distLy: 139, constellation: "Eridanus", dist: "139 ly", blurb: "End of the river", fact: "One of the flattest stars known — spinning so fast it is strongly oblate." },
  { id: "betelgeuse", name: "Betelgeuse", catalogNames: ["α Ori", "HIP 27989"], dir: raDecToDir(5.92, 7.4), color: spectralColor("M").hex, mag: 1.55, appMag: 0.5, spectral: "M1–2Ia", distLy: 640, constellation: "Orion", dist: "640 ly", blurb: "Red supergiant in Orion", fact: "A dying giant. Placed at the Sun it would swallow Earth. Light left ~when Galileo was young." },
  { id: "altair", name: "Altair", catalogNames: ["α Aql", "HIP 97649"], dir: raDecToDir(19.85, 8.9), color: spectralColor("A").hex, mag: 1.25, appMag: 0.76, spectral: "A7V", distLy: 16.7, constellation: "Aquila", dist: "17 ly", blurb: "Summer Triangle · rapid rotator", fact: "Spins in under 10 hours; noticeably flattened at the poles." },
  { id: "aldebaran", name: "Aldebaran", catalogNames: ["α Tau", "HIP 21421"], dir: raDecToDir(4.6, 16.5), color: spectralColor("K").hex, mag: 1.3, appMag: 0.86, spectral: "K5III", distLy: 65, constellation: "Taurus", dist: "65 ly", blurb: "The follower · bull’s eye", fact: "Orange giant that appears to follow the Pleiades across the sky." },
  { id: "antares", name: "Antares", catalogNames: ["α Sco", "HIP 80763"], dir: raDecToDir(16.49, -26.4), color: spectralColor("M").hex, mag: 1.35, appMag: 0.96, spectral: "M1.5Iab", distLy: 550, constellation: "Scorpius", dist: "550 ly", blurb: "Rival of Mars", fact: "Red supergiant whose color rivaled Mars to ancient observers — hence the name." },
  { id: "spica", name: "Spica", catalogNames: ["α Vir", "HIP 65474"], dir: raDecToDir(13.42, -11.2), color: spectralColor("B").hex, mag: 1.2, appMag: 0.97, spectral: "B1III–IV", distLy: 250, constellation: "Virgo", dist: "250 ly", blurb: "Ear of wheat", fact: "Close binary of two hot B-stars; the brightest in Virgo." },
  { id: "pollux", name: "Pollux", catalogNames: ["β Gem", "HIP 37826"], dir: raDecToDir(7.76, 28.0), color: spectralColor("K").hex, mag: 1.15, appMag: 1.14, spectral: "K0III", distLy: 33.8, constellation: "Gemini", dist: "34 ly", blurb: "The immortal twin", fact: "Orange giant with a known exoplanet; Castor’s brighter companion in myth." },
  { id: "fomalhaut", name: "Fomalhaut", catalogNames: ["α PsA", "HIP 113368"], dir: raDecToDir(22.96, -29.6), color: spectralColor("A").hex, mag: 1.15, appMag: 1.16, spectral: "A4V", distLy: 25, constellation: "Piscis Austrinus", dist: "25 ly", blurb: "Mouth of the southern fish", fact: "Hosts a dusty debris disk; one of the first stars imaged with a candidate planet." },
  { id: "deneb", name: "Deneb", catalogNames: ["α Cyg", "HIP 102098"], dir: raDecToDir(20.69, 45.3), color: spectralColor("A").hex, mag: 1.35, appMag: 1.25, spectral: "A2Ia", distLy: 2600, constellation: "Cygnus", dist: "~2,600 ly", blurb: "Tail of the swan", fact: "Luminous supergiant — among the most distant first-magnitude stars." },
  { id: "regulus", name: "Regulus", catalogNames: ["α Leo", "HIP 49669"], dir: raDecToDir(10.14, 11.97), color: spectralColor("B").hex, mag: 1.1, appMag: 1.35, spectral: "B7V", distLy: 79, constellation: "Leo", dist: "79 ly", blurb: "Heart of the lion", fact: "Rapid rotator nearly at breakup speed; lies almost on the ecliptic." },
  { id: "bellatrix", name: "Bellatrix", catalogNames: ["γ Ori", "HIP 25336"], dir: raDecToDir(5.42, 6.35), color: spectralColor("B").hex, mag: 1.05, appMag: 1.64, spectral: "B2III", distLy: 250, constellation: "Orion", dist: "250 ly", blurb: "Orion’s left shoulder", fact: "Hot B-giant completing the hunter’s outline with Betelgeuse, Rigel and the belt." },
  { id: "alnitak", name: "Alnitak", catalogNames: ["ζ Ori", "HIP 26727"], dir: raDecToDir(5.68, -1.94), color: spectralColor("O").hex, mag: 1.0, appMag: 1.77, spectral: "O9.5Ib", distLy: 1260, constellation: "Orion", dist: "1,260 ly", blurb: "East star of Orion’s belt", fact: "Triple system; the Horsehead Nebula lies just south of it." },
  { id: "alnilam", name: "Alnilam", catalogNames: ["ε Ori", "HIP 26311"], dir: raDecToDir(5.6, -1.2), color: spectralColor("B").hex, mag: 1.05, appMag: 1.69, spectral: "B0Ia", distLy: 2000, constellation: "Orion", dist: "2,000 ly", blurb: "Middle of Orion’s belt", fact: "Blue supergiant ~375,000× as luminous as the Sun." },
  { id: "mintaka", name: "Mintaka", catalogNames: ["δ Ori", "HIP 25930"], dir: raDecToDir(5.53, -0.3), color: spectralColor("O").hex, mag: 0.95, appMag: 2.23, spectral: "O9.5II", distLy: 1200, constellation: "Orion", dist: "1,200 ly", blurb: "West star of Orion’s belt", fact: "Near the celestial equator — rises due east, sets due west." },
  { id: "polaris", name: "Polaris", catalogNames: ["α UMi", "HIP 11767"], dir: raDecToDir(2.53, 89.26), color: spectralColor("F").hex, mag: 1.15, appMag: 1.98, spectral: "F7Ib", distLy: 433, constellation: "Ursa Minor", dist: "430 ly", blurb: "The pole star", fact: "Earth’s axis points near Polaris; a quiet north reference in the cockpit." },
  { id: "castor", name: "Castor", catalogNames: ["α Gem", "HIP 36850"], dir: raDecToDir(7.58, 31.9), color: spectralColor("A").hex, mag: 1.0, appMag: 1.58, spectral: "A1V", distLy: 51, constellation: "Gemini", dist: "51 ly", blurb: "The mortal twin", fact: "Sextuple star system; appears as a single bright point to the eye." },
  { id: "shaula", name: "Shaula", catalogNames: ["λ Sco", "HIP 85927"], dir: raDecToDir(17.56, -37.1), color: spectralColor("B").hex, mag: 1.05, appMag: 1.62, spectral: "B2IV", distLy: 570, constellation: "Scorpius", dist: "570 ly", blurb: "Stinger of the scorpion", fact: "Hot B-star marking the scorpion’s tail tip." },
];

export const CONSTELLATIONS: { name: string; ids: string[] }[] = [
  { name: "Orion belt", ids: ["alnitak", "alnilam", "mintaka"] },
  { name: "Orion west", ids: ["betelgeuse", "alnitak", "rigel"] },
  { name: "Orion east", ids: ["bellatrix", "mintaka", "rigel"] },
  { name: "Summer Triangle", ids: ["vega", "altair", "deneb"] },
  { name: "Winter Triangle", ids: ["sirius", "procyon", "betelgeuse"] },
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
    const appMag = 2.5 + Math.pow(u, 0.55) * 5.5; // ~2.5 to 8
    const bright = Math.max(0.08, Math.min(1, Math.pow(2.512, 4.5 - appMag) * 0.35));
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
      s: Math.max(0.35, Math.min(2.4, 0.35 + (6 - appMag) * 0.35)),
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
    const appMag = 4 + rnd() * 4;
    const bright = Math.max(0.06, Math.min(0.7, Math.pow(2.512, 5 - appMag) * 0.25));
    out.push({
      x: x / len,
      y: y / len,
      z: z / len,
      b: bright,
      s: 0.35 + rnd() * 1.1,
      cr: 220 + warm * 30,
      cg: 205 + (1 - warm) * 25,
      cb: 185 + rnd() * 40,
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
    photos.set(id, im);
  }
}

export function photoOf(id: string): HTMLImageElement | null {
  const im = photos.get(id);
  if (im && im.complete && im.naturalWidth > 1) return im;
  return null;
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
