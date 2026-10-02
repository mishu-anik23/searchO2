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

export function nrm(v: V): V {
  const l = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

function cross(a: V, b: V): V {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}

/** Place a star in the tangent plane of `center` so figures stay readable. */
function offsetDir(center: V, u: number, v: number, scale = 0.16): V {
  const f = nrm(center);
  const worldUp = Math.abs(f.y) > 0.92 ? { x: 0, y: 0, z: 1 } : { x: 0, y: 1, z: 0 };
  const r = nrm(cross(worldUp, f));
  const up = nrm(cross(f, r));
  return nrm({
    x: f.x + (r.x * u + up.x * v) * scale,
    y: f.y + (r.y * u + up.y * v) * scale,
    z: f.z + (r.z * u + up.z * v) * scale,
  });
}

const DIPPER = nrm({ x: 0.48, y: 0.68, z: -0.55 });
const CASS = nrm({ x: -0.5, y: 0.74, z: 0.45 });

export type NamedStar = {
  id: string;
  name: string;
  dir: V;
  color: string;
  mag: number;
  spec: string;
  blurb: string;
  fact: string;
  dist: string;
};

export const NAMED_STARS: NamedStar[] = [
  {
    id: "sirius",
    name: "Sirius",
    dir: nrm({ x: 0.55, y: -0.25, z: -0.8 }),
    color: "#cfe8ff",
    mag: 1.85,
    spec: "A1V",
    dist: "8.6 light-years",
    blurb: "Brightest star in our night sky",
    fact: "A nearby A-type star, hotter and bigger than the Sun. The belt of Orion points almost straight at it.",
  },
  {
    id: "vega",
    name: "Vega",
    dir: nrm({ x: -0.4, y: 0.72, z: -0.55 }),
    color: "#e8f2ff",
    mag: 1.35,
    spec: "A0V",
    dist: "25 light-years",
    blurb: "Summer triangle · white-hot",
    fact: "Once the north star, and it will be again as Earth wobbles on its axis (precession) over 26,000 years.",
  },
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    dir: nrm({ x: 0.72, y: 0.18, z: 0.67 }),
    color: "#ffb080",
    mag: 1.55,
    spec: "M1-2 Ia",
    dist: "640 light-years",
    blurb: "Red supergiant · Orion’s shoulder",
    fact: "A dying giant. If it sat where the Sun is, it would swallow Earth. Its light left around the time of Galileo.",
  },
  {
    id: "rigel",
    name: "Rigel",
    dir: nrm({ x: 0.58, y: -0.22, z: 0.78 }),
    color: "#c8dcff",
    mag: 1.45,
    spec: "B8 Ia",
    dist: "860 light-years",
    blurb: "Orion’s blue foot",
    fact: "A blue supergiant — far hotter than the Sun. With Betelgeuse it frames the hunter you can still read from a cockpit.",
  },
  {
    id: "bellatrix",
    name: "Bellatrix",
    dir: nrm({ x: 0.62, y: 0.28, z: 0.72 }),
    color: "#d0e4ff",
    mag: 1.08,
    spec: "B2 III",
    dist: "250 light-years",
    blurb: "Orion’s left shoulder",
    fact: "A hot B-star. Shoulders, belt, and feet make Orion the easiest figure in this sky.",
  },
  {
    id: "alnitak",
    name: "Alnitak",
    dir: nrm({ x: 0.66, y: 0.02, z: 0.75 }),
    color: "#bcd4ff",
    mag: 0.98,
    spec: "O9.5 Ib",
    dist: "1,200 light-years",
    blurb: "East star of Orion’s belt",
    fact: "One of three belt stars in a straight line. The Horsehead Nebula sits just south of it, too faint for unaided eyes.",
  },
  {
    id: "alnilam",
    name: "Alnilam",
    dir: nrm({ x: 0.68, y: 0.04, z: 0.73 }),
    color: "#c4d8ff",
    mag: 1.08,
    spec: "B0 Ia",
    dist: "2,000 light-years",
    blurb: "Middle of Orion’s belt",
    fact: "A blue supergiant about 375,000 times as luminous as the Sun. The belt is a ruler in the sky.",
  },
  {
    id: "mintaka",
    name: "Mintaka",
    dir: nrm({ x: 0.64, y: 0.08, z: 0.76 }),
    color: "#d0e0ff",
    mag: 0.92,
    spec: "O9.5 II",
    dist: "1,200 light-years",
    blurb: "West star of Orion’s belt",
    fact: "Sits almost on the celestial equator, so from Earth it rises due east and sets due west.",
  },
  {
    id: "saiph",
    name: "Saiph",
    dir: nrm({ x: 0.7, y: -0.18, z: 0.69 }),
    color: "#c4d4ff",
    mag: 0.95,
    spec: "B0.5 Ia",
    dist: "720 light-years",
    blurb: "Orion’s other foot",
    fact: "Closes the hunter’s rectangle with Rigel. Less famous, same class of blue giant.",
  },
  {
    id: "polaris",
    name: "Polaris",
    dir: nrm({ x: 0.05, y: 0.98, z: -0.18 }),
    color: "#fff6e0",
    mag: 1.18,
    spec: "F7 Ib",
    dist: "430 light-years",
    blurb: "The pole star · north on Earth",
    fact: "Earth’s axis points near Polaris, so it barely moves in our sky. In a cockpit it is a quiet north-reference, not a destination.",
  },
  {
    id: "acen",
    name: "α Centauri",
    dir: nrm({ x: -0.62, y: -0.48, z: -0.62 }),
    color: "#fff0d2",
    mag: 1.28,
    spec: "G2V + K1V",
    dist: "4.37 light-years",
    blurb: "Nearest star system to the Sun",
    fact: "Three stars, including Proxima with a small planet in the goldilocks zone. Still about 9,000 times farther than Neptune.",
  },
  {
    id: "dubhe",
    name: "Dubhe",
    dir: offsetDir(DIPPER, 0.25, 0.7),
    color: "#ffe2b8",
    mag: 1.12,
    spec: "K0 III",
    dist: "123 light-years",
    blurb: "Pointer star of the Big Dipper",
    fact: "A line from Merak through Dubhe points to Polaris. That is how you find north without a compass.",
  },
  {
    id: "merak",
    name: "Merak",
    dir: offsetDir(DIPPER, -0.7, 0.45),
    color: "#e8f0ff",
    mag: 1.0,
    spec: "A1V",
    dist: "80 light-years",
    blurb: "Other pointer of the Dipper",
    fact: "With Dubhe it makes the ‘pointers.’ Follow them five dipper-lengths to Polaris.",
  },
  {
    id: "phecda",
    name: "Phecda",
    dir: offsetDir(DIPPER, -0.7, -0.55),
    color: "#e4ecff",
    mag: 0.88,
    spec: "A0 Ve",
    dist: "83 light-years",
    blurb: "Dipper bowl, south-east corner",
    fact: "Part of the bowl of Ursa Major. The whole dipper is nearby — tens of light-years, not thousands.",
  },
  {
    id: "megrez",
    name: "Megrez",
    dir: offsetDir(DIPPER, 0.2, -0.3),
    color: "#e8eeff",
    mag: 0.72,
    spec: "A3 V",
    dist: "81 light-years",
    blurb: "Dim joint of bowl and handle",
    fact: "The faintest of the seven. The handle attaches here.",
  },
  {
    id: "alioth",
    name: "Alioth",
    dir: offsetDir(DIPPER, 0.85, -0.15),
    color: "#e6eeff",
    mag: 1.1,
    spec: "A1 III-IV",
    dist: "83 light-years",
    blurb: "Brightest of the Dipper",
    fact: "Start of the handle. Ursa Major is a real family of stars moving together — a leftover cluster.",
  },
  {
    id: "mizar",
    name: "Mizar",
    dir: offsetDir(DIPPER, 1.4, 0.2),
    color: "#e8f0ff",
    mag: 1.05,
    spec: "A2 V",
    dist: "83 light-years",
    blurb: "The double in the handle",
    fact: "Keen eyes see a companion, Alcor. A telescope splits Mizar itself into two — a teaching double.",
  },
  {
    id: "alkaid",
    name: "Alkaid",
    dir: offsetDir(DIPPER, 2.05, 0.05),
    color: "#c8d8ff",
    mag: 1.08,
    spec: "B3 V",
    dist: "104 light-years",
    blurb: "Tip of the Dipper handle",
    fact: "Not part of the moving family — a hotter, independent star at the end of the handle.",
  },
  {
    id: "schedar",
    name: "Schedar",
    dir: offsetDir(CASS, -0.55, 0.55),
    color: "#ffd8b0",
    mag: 0.95,
    spec: "K0 IIIa",
    dist: "228 light-years",
    blurb: "Brightest of Cassiopeia",
    fact: "The W (or M) of Cassiopeia sits opposite the Dipper across Polaris. Both circle the pole.",
  },
  {
    id: "caph",
    name: "Caph",
    dir: offsetDir(CASS, -1.2, -0.2),
    color: "#e8f2ff",
    mag: 0.9,
    spec: "F2 III-IV",
    dist: "54 light-years",
    blurb: "West end of Cassiopeia’s W",
    fact: "A nearby white giant. The W is five stars; follow the zigzag.",
  },
  {
    id: "nachi",
    name: "γ Cas",
    dir: offsetDir(CASS, 0.05, -0.1),
    color: "#dce8ff",
    mag: 0.95,
    spec: "B0.5 IVe",
    dist: "550 light-years",
    blurb: "Middle of the W",
    fact: "An eruptive hot star. It is the peak of Cassiopeia’s zigzag.",
  },
  {
    id: "ruchbah",
    name: "Ruchbah",
    dir: offsetDir(CASS, 0.65, 0.5),
    color: "#e4ecff",
    mag: 0.82,
    spec: "A5 V",
    dist: "99 light-years",
    blurb: "Fourth star of the W",
    fact: "A quiet A-star. Cassiopeia never sets from mid-northern Earth.",
  },
  {
    id: "segin",
    name: "Segin",
    dir: offsetDir(CASS, 1.25, -0.25),
    color: "#c8d8ff",
    mag: 0.78,
    spec: "B3 III",
    dist: "440 light-years",
    blurb: "East end of the W",
    fact: "Closes Cassiopeia. The whole W is a polar landmark, like the Dipper on the other side.",
  },
  {
    id: "acrux",
    name: "Acrux",
    dir: nrm({ x: -0.15, y: -0.92, z: 0.35 }),
    color: "#c4d4ff",
    mag: 1.2,
    spec: "B0.5 IV",
    dist: "320 light-years",
    blurb: "Foot of the Southern Cross",
    fact: "The bright foot of Crux. The long axis of the Cross points toward the south celestial pole.",
  },
  {
    id: "mimosa",
    name: "Mimosa",
    dir: nrm({ x: -0.05, y: -0.9, z: 0.42 }),
    color: "#c8d8ff",
    mag: 1.15,
    spec: "B0.5 III",
    dist: "280 light-years",
    blurb: "East arm of the Cross",
    fact: "With Acrux, Gacrux and δ Cru it makes the smallest of the 88 constellations — and one of the clearest.",
  },
  {
    id: "gacrux",
    name: "Gacrux",
    dir: nrm({ x: -0.12, y: -0.86, z: 0.5 }),
    color: "#ffc8a0",
    mag: 1.05,
    spec: "M3.5 III",
    dist: "89 light-years",
    blurb: "Head of the Southern Cross",
    fact: "The red head. A line from Gacrux through Acrux aims at the south pole of the sky — no bright pole star there.",
  },
  {
    id: "delcru",
    name: "δ Cru",
    dir: nrm({ x: -0.22, y: -0.88, z: 0.42 }),
    color: "#c8d4ff",
    mag: 0.9,
    spec: "B2 IV",
    dist: "345 light-years",
    blurb: "West arm of the Cross",
    fact: "Completes the kite. Crux sits in a rich Milky Way band, so the background is crowded.",
  },
];

export type Constel = {
  id: string;
  name: string;
  segs: [string, string][];
  blurb: string;
  fact: string;
  dist: string;
  meaning: string;
};

export const CONSTELLATIONS: Constel[] = [
  {
    id: "orion",
    name: "Orion",
    segs: [
      ["betelgeuse", "bellatrix"],
      ["betelgeuse", "alnitak"],
      ["bellatrix", "mintaka"],
      ["alnitak", "alnilam"],
      ["alnilam", "mintaka"],
      ["alnitak", "saiph"],
      ["mintaka", "rigel"],
      ["saiph", "rigel"],
    ],
    blurb: "The Hunter · winter’s brightest figure",
    meaning: "Shoulders, a three-star belt, two feet. The belt points toward Sirius.",
    dist: "250–2,000 ly (stars at very different distances)",
    fact: "The lines are a drawing, not a place. Betelgeuse is hundreds of light-years closer than Alnilam. From a cockpit the figure still works as a ruler.",
  },
  {
    id: "ursa-major",
    name: "Ursa Major",
    segs: [
      ["dubhe", "merak"],
      ["merak", "phecda"],
      ["phecda", "megrez"],
      ["megrez", "dubhe"],
      ["megrez", "alioth"],
      ["alioth", "mizar"],
      ["mizar", "alkaid"],
    ],
    blurb: "The Big Dipper · northern ladle",
    meaning: "A saucepan in the north. Pointers (Merak → Dubhe) run to Polaris.",
    dist: "80–120 light-years (a real star family)",
    fact: "Most of these stars were born together and still drift as a group. Follow the pointers five lengths to find north.",
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    segs: [
      ["caph", "schedar"],
      ["schedar", "nachi"],
      ["nachi", "ruchbah"],
      ["ruchbah", "segin"],
    ],
    blurb: "The W · queen on her throne",
    meaning: "A zigzag W (or M) opposite the Dipper, across Polaris.",
    dist: "54–550 light-years",
    fact: "It never sets from mid-northern Earth. When the Dipper is low, Cassiopeia is high — a backup north mark.",
  },
  {
    id: "crux",
    name: "Crux",
    segs: [
      ["gacrux", "acrux"],
      ["mimosa", "delcru"],
    ],
    blurb: "Southern Cross · smallest constellation",
    meaning: "A kite. The long axis (Gacrux → Acrux) aims at the south celestial pole.",
    dist: "89–345 light-years",
    fact: "There is no bright south pole star. The Cross is how southern navigators found south. It sits in a rich Milky Way band.",
  },
];

export const STAR_BY_ID = new Map(NAMED_STARS.map((s) => [s.id, s]));

export const NEBULAE: {
  id: string;
  name: string;
  dir: V;
  color: string;
  rx: number;
  ry: number;
  blurb: string;
  fact: string;
  dist: string;
}[] = [
  {
    id: "m42",
    name: "Orion Nebula",
    dir: nrm({ x: 0.67, y: -0.08, z: 0.74 }),
    color: "255,168,196",
    rx: 0.55,
    ry: 0.32,
    dist: "1,350 light-years",
    blurb: "A star factory under Orion’s belt",
    fact: "A cloud of gas where new stars are lighting up. Pink in photos from hydrogen; your eye sees it as a faint mist.",
  },
];

export const GALAXIES: {
  id: string;
  name: string;
  dir: V;
  rx: number;
  ry: number;
  color: string;
  dist: string;
  blurb: string;
  fact: string;
}[] = [
  {
    id: "andromeda",
    name: "Andromeda",
    dir: nrm({ x: -0.58, y: 0.36, z: -0.73 }),
    rx: 1.15,
    ry: 0.42,
    color: "#d8c8f0",
    dist: "2.5 million light-years",
    blurb: "Nearest big spiral galaxy",
    fact: "The closest giant spiral — about 2.5 million light-years. It is on a long fall toward the Milky Way. They will mix in a few billion years.",
  },
  {
    id: "lmc",
    name: "Large Magellanic Cloud",
    dir: nrm({ x: 0.2, y: -0.86, z: 0.47 }),
    rx: 0.72,
    ry: 0.38,
    color: "#f0d8c8",
    dist: "160,000 light-years",
    blurb: "A satellite galaxy of the Milky Way",
    fact: "A companion galaxy you can see from Earth’s south. New stars are still lighting up inside it — a factory next door, on galaxy terms.",
  },
];

export type Star = { x: number; y: number; z: number; b: number; s: number; cr: number; cg: number; cb: number };

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

export function makeField(n: number, seed: number): Star[] {
  const rnd = rng(seed);
  const out: Star[] = [];
  for (let i = 0; i < n; i++) {
    const d = onSphere(rnd);
    const mag = Math.pow(rnd(), 2.6);
    const warm = rnd();
    out.push({
      ...d,
      b: 0.1 + mag * 0.9,
      s: 0.32 + mag * 2.1,
      cr: 210 + warm * 45,
      cg: 220 + (1 - warm) * 22,
      cb: 255 - warm * 70,
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
    const mag = Math.pow(rnd(), 2.2);
    out.push({
      x: x / len,
      y: y / len,
      z: z / len,
      b: 0.12 + mag * 0.62,
      s: 0.35 + mag * 1.35,
      cr: 235 + rnd() * 20,
      cg: 205 + rnd() * 30,
      cb: 175 + rnd() * 50,
    });
  }
  return out;
}

export const FIELD = makeField(1200, 17);
export const MILKY = makeMilkyWay(1700);

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

export function transferPath(dest: "moon" | "mars", t: number, n = 48): V[] {
  const cache = new Map<string, V>();
  const earth = posOf("earth", t, cache);
  const destP = posOf(dest, t, cache);
  const out: V[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    if (dest === "moon") {
      out.push({
        x: earth.x + (destP.x - earth.x) * u,
        y: earth.y + (destP.y - earth.y) * u + Math.sin(u * Math.PI) * 1.6,
        z: earth.z + (destP.z - earth.z) * u,
      });
    } else {
      out.push({
        x: earth.x * (1 - u) + destP.x * u,
        y: 5 * Math.sin(u * Math.PI) + earth.y * (1 - u) + destP.y * u,
        z: earth.z * (1 - u) + destP.z * u,
      });
    }
  }
  return out;
}

/** Hohmann ellipse in the ecliptic, sun at a focus, periapsis aligned with `fromAng`. */
export function hohmannEllipse(r1: number, r2: number, fromAng: number, n = 72): V[] {
  const a = (r1 + r2) / 2;
  const e = Math.abs(r2 - r1) / (r1 + r2);
  const out: V[] = [];
  for (let i = 0; i <= n; i++) {
    const th = (i / n) * Math.PI;
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(th));
    const ang = fromAng + th;
    out.push({ x: Math.cos(ang) * r, y: 0, z: Math.sin(ang) * r });
  }
  return out;
}

export function orbitSpeedHint(orbit: number): number {
  return 1 / Math.sqrt(Math.max(8, orbit) / AU);
}

const textures = new Map<string, HTMLCanvasElement>();
const photos = new Map<string, HTMLImageElement>();
let photosStarted = false;

const PHOTO_IDS = [
  "earth",
  "moon",
  "mars",
  "jupiter",
  "saturn",
  "sun",
  "venus",
  "uranus",
  "andromeda",
  "mercury",
  "neptune",
  "lmc",
] as const;

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
  if (au < 0.08) return `${((au * 1.496e8) / 1000).toFixed(0)} thousand km`;
  return `${au.toFixed(2)} AU`;
}

export function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const vx = bx - ax;
  const vy = by - ay;
  const l2 = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2));
  return Math.hypot(px - (ax + t * vx), py - (ay + t * vy));
}
