export type DestinationId = "moon" | "mars";
export type RocketId = "hauler" | "crewmark";
export type Screen =
  | "briefing"
  | "hq"
  | "plan"
  | "pad"
  | "launch"
  | "cruise"
  | "landing"
  | "surface"
  | "explore"
  | "explore-mars"
  | "habitat"
  | "debrief"
  | "zodiac-lab";

export const STARTING_CREDITS = 2_500_000;
export const FPV_RATE_PER_SEC = 180;
export const OXYGEN_PRICE_PER_KG = 40;
export const SAVE_VERSION = 3;
export const SAVE_KEY = "oxyforge-save-v1";

export interface Rocket {
  id: RocketId;
  name: string;
  role: "Cargo only" | "Crew + cargo";
  blurb: string;
  payloadKg: number;
  crew: number;
  dryMassT: number;
}

export interface Destination {
  id: DestinationId;
  name: string;
  distanceKm: string;
  travelDays: number;
  travelLabel: string;
  gravity: string;
  air: string;
  whyHarder: string;
  plantName: string;
}

export const ROCKETS: Record<RocketId, Rocket> = {
  hauler: {
    id: "hauler",
    name: "Hauler-9",
    role: "Cargo only",
    blurb:
      "A workhorse with a big fairing and no seats. It flies machines, solar arrays, and tanks. Cheaper because it skips life support and an abort tower.",
    payloadKg: 8200,
    crew: 0,
    dryMassT: 28,
  },
  crewmark: {
    id: "crewmark",
    name: "Crewmark-3",
    role: "Crew + cargo",
    blurb:
      "A capsule on top of a cargo trunk. It carries people, air, water, and an abort motor. Extra mass means extra fuel — that is why it costs more.",
    payloadKg: 4100,
    crew: 3,
    dryMassT: 41,
  },
};

export const DESTINATIONS: Record<DestinationId, Destination> = {
  moon: {
    id: "moon",
    name: "Moon",
    distanceKm: "384,400",
    travelDays: 3,
    travelLabel: "about 3 days",
    gravity: "1/6 of Earth",
    air: "None. Vacuum.",
    whyHarder:
      "Close, but there is no air to breathe and nights last two weeks. Ice hides in dark polar craters.",
    plantName: "Polar ice electrolysis",
  },
  mars: {
    id: "mars",
    name: "Mars",
    distanceKm: "78–400 million",
    travelDays: 210,
    travelLabel: "about 7 months",
    gravity: "about 3/8 of Earth",
    air: "Thin CO₂ — 1% as thick as Earth's air",
    whyHarder:
      "Far away. Launch windows come about every 26 months. You need more food, power, shielding, and a bigger burn to get there.",
    plantName: "MOXIE-class CO₂ splitter",
  },
};

/** Nominal transfer used by the cockpit nav computer. */
export const TRANSFER: Record<DestinationId, { km: number; hours: number; vKms: number }> = {
  moon: { km: 384_400, hours: 72, vKms: 1.48 },
  mars: { km: 225_000_000, hours: 210 * 24, vKms: 12.4 },
};

export function navFromProgress(dest: DestinationId, pathPct: number) {
  const spec = TRANSFER[dest];
  const p = Math.min(1, Math.max(0, pathPct));
  const travelledKm = spec.km * p;
  const remainKm = spec.km * (1 - p);
  const etaHours = spec.hours * (1 - p);
  return { travelledKm, remainKm, etaHours, vKms: spec.vKms, totalKm: spec.km, totalHours: spec.hours };
}

/** Launch price in USD: rocket × destination. */
export const LAUNCH_PRICE: Record<RocketId, Record<DestinationId, number>> = {
  hauler: { moon: 185_000, mars: 920_000 },
  crewmark: { moon: 465_000, mars: 1_780_000 },
};

export const CONTRACT_PAY: Record<RocketId, Record<DestinationId, number>> = {
  hauler: { moon: 280_000, mars: 1_350_000 },
  crewmark: { moon: 720_000, mars: 2_650_000 },
};

export function launchPrice(rocket: RocketId, dest: DestinationId): number {
  return LAUNCH_PRICE[rocket][dest];
}

export function contractPay(rocket: RocketId, dest: DestinationId): number {
  return CONTRACT_PAY[rocket][dest];
}

export type CommanderId =
  | "kai"
  | "nia"
  | "rafa"
  | "amira"
  | "elena"
  | "haru"
  | "cmd-self"
  | "pilot-nova"
  | "sys-kade"
  | "sci-mira"
  | "med-sol"
  | "pilot-jax";

export interface CommanderProfile {
  id: CommanderId;
  name: string;
  callsign: string;
  age: number;
  gender: "male" | "female";
  role: string;
  bio: string;
  src: string;
}

export const COMMANDERS: CommanderProfile[] = [
  {
    id: "cmd-self",
    name: "You",
    callsign: "Director",
    age: 32,
    gender: "male",
    role: "Flight Director",
    bio: "You run the program from HQ. On Crewmark flights you still sit the commander seat.",
    src: "/commanders/cmd-self.webp",
  },
  {
    id: "kai",
    name: "Kai Mori",
    callsign: "Vector",
    age: 24,
    gender: "male",
    role: "Guidance cadet",
    bio: "Fresh from flight school. Treats every burn as a vis-viva problem you can feel.",
    src: "/commanders/kai.webp",
  },
  {
    id: "nia",
    name: "Nia Okoye",
    callsign: "Ember",
    age: 27,
    gender: "female",
    role: "Plant engineer",
    bio: "Splits water in her sleep. Ice is not scenery to her — it is 89% oxygen by mass.",
    src: "/commanders/nia.webp",
  },
  {
    id: "rafa",
    name: "Rafael Soto",
    callsign: "Ballast",
    age: 36,
    gender: "male",
    role: "Pad chief",
    bio: "Counts mass like money. Crew costs more because people have seats, air, and an abort tower.",
    src: "/commanders/rafa.webp",
  },
  {
    id: "amira",
    name: "Amira Haddad",
    callsign: "Window",
    age: 44,
    gender: "female",
    role: "Flight director",
    bio: "Does not aim at where Mars is. Aims at where Mars will be after seven months of coast.",
    src: "/commanders/amira.webp",
  },
  {
    id: "elena",
    name: "Elena Voss",
    callsign: "Ridge",
    age: 56,
    gender: "female",
    role: "Habitat lead",
    bio: "Two metres of dirt is a cheaper roof than any metal from Earth. She has buried more than one home.",
    src: "/commanders/elena.webp",
  },
  {
    id: "haru",
    name: "Haru Tanabe",
    callsign: "Apsis",
    age: 63,
    gender: "male",
    role: "Veteran skipper",
    bio: "Flew the long ovals before the plants existed. Still says the quiet part: most of the trip is engines off.",
    src: "/commanders/haru.webp",
  },
  {
    id: "pilot-nova",
    name: "Nova Reyes",
    callsign: "Vanguard",
    age: 29,
    gender: "female",
    role: "Ascent / descent pilot",
    bio: "Hands on the stick for Max-Q and the last kilometres of powered descent.",
    src: "/commanders/nova.webp",
  },
  {
    id: "sys-kade",
    name: "Kade Okonkwo",
    callsign: "Circuit",
    age: 34,
    gender: "male",
    role: "Vehicle systems",
    bio: "Watches power, thermal, and propellant margins from the capsule screens.",
    src: "/commanders/kade.webp",
  },
  {
    id: "sci-mira",
    name: "Mira Chen",
    callsign: "Catalyst",
    age: 31,
    gender: "female",
    role: "ISRU science",
    bio: "Owns the oxygen plant plan — ice, electrolysis, or MOXIE stacks.",
    src: "/commanders/mira.webp",
  },
  {
    id: "med-sol",
    name: "Dr. Sol Park",
    callsign: "Pulse",
    age: 38,
    gender: "female",
    role: "Crew health",
    bio: "Radiation, sleep, and the closed air loop when people are on board.",
    src: "/commanders/sol.webp",
  },
  {
    id: "pilot-jax",
    name: "Jax Moreau",
    callsign: "Drift",
    age: 41,
    gender: "male",
    role: "Transfer pilot",
    bio: "Specialist for long coasts and mid-course burns on Mars paths.",
    src: "/commanders/jax.webp",
  },
];

export function commanderById(id: string | undefined | null): CommanderProfile {
  return COMMANDERS.find((c) => c.id === id) ?? COMMANDERS[0];
}

export interface SuccessSlide {
  id: string;
  title: string;
  kicker: string;
  body: string;
  fact: string;
  src: string;
  libraryId: string;
}

export const SUCCESS_SLIDES: SuccessSlide[] = [
  {
    id: "earth-moon",
    title: "Earth to Moon coast",
    kicker: "Success path · 384,400 km",
    body: "Leave low Earth orbit with a trans-lunar injection. Most of the three days the engines stay off. The Moon’s gravity does the last capture.",
    fact: "Free-return trajectories loop home if the capture burn fails — a built-in abort.",
    src: "/missions/earth-moon.webp",
    libraryId: "hohmann",
  },
  {
    id: "pole",
    title: "South-pole touchdown",
    kicker: "Landing · 1/6 g",
    body: "Long shadows, no air, Earth hanging in a black sky. Solar arrays live on the rim. Ice waits in craters that have not seen the Sun in a billion years.",
    fact: "Descent is a powered fall. There is no atmosphere to brake against.",
    src: "/missions/moon-landing.webp",
    libraryId: "landing",
  },
  {
    id: "earth-mars",
    title: "Hohmann to Mars",
    kicker: "Success path · ~225 million km",
    body: "The cheap oval kisses Mars’ orbit on the far side. You launch when Earth and Mars line up — about every 26 months — or you pay in propellant.",
    fact: "vis-viva: closer to the Sun you go faster; climbing out, you slow. That is the coast.",
    src: "/missions/earth-mars.webp",
    libraryId: "windows",
  },
  {
    id: "moxie",
    title: "Oxygen from Martian air",
    kicker: "Plant · NASA-proven 2021",
    body: "A compressor inhales thin CO₂. Solid-oxide cells at 800 °C let oxide ions walk one way through ceramic. Oxygen tanks fill. Carbon monoxide is vented or saved as fuel stock.",
    fact: "A crew of three needs ~2.4 kg of O₂ per day, plus leaks. Scale is the real exam.",
    src: "/missions/mars-plant.webp",
    libraryId: "moxie",
  },
];


export interface ChecklistItem {
  id: string;
  title: string;
  why: string;
  action: string;
  kind:
    | "confirm"
    | "fuel"
    | "gyro"
    | "weather"
    | "toggle"
    | "radio"
    | "secure";
  libraryId?: string;
}

export const CHECKLIST: ChecklistItem[] = [
  {
    id: "window",
    title: "Launch window",
    why: "We wait until Earth, the rocket, and the Moon or Mars line up. A good window uses less fuel. A poor window can miss the destination.",
    action: "Confirm the window is open",
    kind: "confirm",
    libraryId: "windows",
  },
  {
    id: "fuel",
    title: "Propellant load",
    why: "Space has no air. The rocket must carry fuel and oxidizer (liquid oxygen). Methane + LOX burn clean and can be made on Mars later.",
    action: "Pump LOX and methane to 100%",
    kind: "fuel",
    libraryId: "oxidizer",
  },
  {
    id: "mass",
    title: "Mass and balance",
    why: "Heavier rockets need more fuel. This is the rocket equation: extra mass costs extra propellant, which is itself mass.",
    action: "Confirm cargo and crew mass",
    kind: "confirm",
    libraryId: "equation",
  },
  {
    id: "guidance",
    title: "Guidance align",
    why: "Gyroscopes tell the computer which way the nose is pointing. If they are off, the rocket flies the wrong path.",
    action: "Hold to spin up gyros",
    kind: "gyro",
  },
  {
    id: "range",
    title: "Range safety",
    why: "If a rocket heads toward people or towns, range safety can shut the engines down. We arm this only when the path is clear.",
    action: "Arm range safety",
    kind: "toggle",
  },
  {
    id: "weather",
    title: "Winds and weather",
    why: "A tall rocket is like a giant weather vane. Strong wind can push it sideways while it is still in the air.",
    action: "Poll until winds are under 20 knots",
    kind: "weather",
  },
  {
    id: "secure",
    title: "Cargo / crew secure",
    why: "Cargo is bolted so it cannot shift. Crew need seats, suits, and a way off the rocket if the launch aborts.",
    action: "Secure the payload",
    kind: "secure",
  },
  {
    id: "comm",
    title: "Communications",
    why: "Mission control must hear the rocket the whole way. A radio check proves the link is alive before we light the engines.",
    action: "Run radio check",
    kind: "radio",
  },
];

export interface PlantStep {
  id: string;
  title: string;
  body: string;
  math?: string;
  libraryId?: string;
  oxygenKg: number;
  /** Classroom-friendly one-liner */
  kidFriendly?: string;
  /** XP awarded when the step is completed */
  xp?: number;
  /** Badge label shown in the gamified UI */
  badge?: string;
  /** Accent color for the step card / 3D highlight */
  color?: string;
}

export const MOON_STEPS: PlantStep[] = [
  {
    id: "site",
    title: "Pick the south pole",
    body: "Some craters never see sunlight. Ice can wait there for billions of years. We land near those shadows, with solar arrays on a ridge that does see the Sun.",
    kidFriendly: "Mission: choose a polar “freezer” crater for ice and a sunny ridge for solar power.",
    libraryId: "moon-ice",
    oxygenKg: 0,
    xp: 40,
    badge: "Site Scout",
    color: "#7EB8C9",
  },
  {
    id: "solar",
    title: "Unfold solar arrays",
    body: "The factory runs on electricity. No coal, no gas — just sunlight. On the Moon the sky is black even at noon, but the Sun is harsh and reliable at the poles.",
    kidFriendly: "Unfold the solar wings! On the Moon the sky stays black, but sunlight is strong and clean.",
    oxygenKg: 0,
    xp: 50,
    badge: "Power Up",
    color: "#E8C070",
  },
  {
    id: "mine",
    title: "Mine ice and regolith",
    body: "A small rover scoops frozen soil. Some of it is water ice mixed with dust. Some grains are ilmenite, a mineral that also holds oxygen in its crystal.",
    kidFriendly: "Rover scoop time: dig dusty ice and special rocks that hide oxygen inside their crystals.",
    libraryId: "moon-ice",
    oxygenKg: 0,
    xp: 60,
    badge: "Regolith Miner",
    color: "#C9A86F",
  },
  {
    id: "heat",
    title: "Warm ice into water",
    body: "We seal the scoops in a drum and heat them. Ice becomes liquid water. Dust stays behind. Water is heavy to ship from Earth, so making it here is a big win.",
    kidFriendly: "Heat the frozen dirt carefully — ice melts into water while dusty rocks stay behind.",
    oxygenKg: 0,
    xp: 55,
    badge: "Ice Melter",
    color: "#9FD0D4",
  },
  {
    id: "electrolysis",
    title: "Split water with electricity",
    body: "Two electrodes in the water. Current in, gases out. This is the same idea as a school electrolysis demo — just bigger, and the oxygen is for breathing.",
    kidFriendly: "Zap the water with electricity: hydrogen bubbles one way, oxygen the other — like a school science demo, but for rockets!",
    math: "2 H₂O → 2 H₂ + O₂. Water is 18 g/mol; oxygen is 16 of those 18 grams. About 89% of the mass of water is oxygen.",
    libraryId: "electrolysis",
    oxygenKg: 180,
    xp: 100,
    badge: "O₂ Maker",
    color: "#6FBF9A",
  },
  {
    id: "store",
    title: "Store oxygen, recycle hydrogen",
    body: "Oxygen goes into cold tanks. Hydrogen is too useful to throw away — we can pipe it back to help pull more oxygen out of ilmenite rock.",
    kidFriendly: "Chill the oxygen into cold tanks. Keep the hydrogen — it helps unlock even more oxygen from rock!",
    oxygenKg: 40,
    xp: 70,
    badge: "Tank Captain",
    color: "#80C29B",
  },
  {
    id: "ilmenite",
    title: "Squeeze oxygen from rock",
    body: "Ilmenite is FeTiO₃. Hot hydrogen steals oxygen from the mineral and makes more water, which we split again. The Moon’s dirt is a giant oxygen bank.",
    kidFriendly: "Bonus level: hot hydrogen pulls oxygen out of lunar rock (ilmenite). Moon dirt is basically an oxygen treasure chest!",
    math: "FeTiO₃ + H₂ → Fe + TiO₂ + H₂O, then split the water as before.",
    libraryId: "moon-ice",
    oxygenKg: 90,
    xp: 120,
    badge: "Rock Alchemist",
    color: "#C4896A",
  },
];

export const MARS_STEPS: PlantStep[] = [
  {
    id: "deploy",
    title: "Deploy the compressor",
    body: "Mars air is thin — about 1% as thick as Earth’s — but it is 95% carbon dioxide. We need a pump to gather enough of it.",
    kidFriendly: "Switch on the air pump! Mars air is thin, but packed with CO₂ we can use.",
    libraryId: "moxie",
    oxygenKg: 0,
    xp: 40,
    badge: "Air Scout",
    color: "#C4896A",
  },
  {
    id: "inhale",
    title: "Inhale carbon dioxide",
    body: "Filters take out dust. The compressor squeezes CO₂ into the cell stack. You can think of it as the base taking a slow, mechanical breath.",
    kidFriendly: "The base takes a slow mechanical breath — filter dust, squeeze CO₂ into the machine.",
    oxygenKg: 0,
    xp: 45,
    badge: "Dust Fighter",
    color: "#E8A070",
  },
  {
    id: "heat",
    title: "Heat the ceramic cells",
    body: "Solid-oxide cells work around 800 °C. Heat is not a bug — it is how oxide ions can move through the ceramic like a one-way street.",
    kidFriendly: "Heat the ceramic cells until they glow — hot chemistry is ready to make oxygen!",
    libraryId: "moxie",
    oxygenKg: 0,
    xp: 55,
    badge: "Cell Chef",
    color: "#E8C070",
  },
  {
    id: "split",
    title: "Split CO₂ into O₂",
    body: "This is the MOXIE trick NASA proved on Mars in 2021. Carbon dioxide in, oxygen and carbon monoxide out. No plants required — though we will add those later.",
    kidFriendly: "MOXIE magic: CO₂ in, oxygen out for tanks. NASA proved it on the real Perseverance rover!",
    math: "2 CO₂ → 2 CO + O₂. One oxygen molecule from two carbon dioxide molecules.",
    libraryId: "moxie",
    oxygenKg: 160,
    xp: 100,
    badge: "MOXIE Hero",
    color: "#6FBF9A",
  },
  {
    id: "store",
    title: "Tank the oxygen",
    body: "We store O₂ as a cold liquid to save volume. Carbon monoxide is vented, or saved as a fuel ingredient for later trips home.",
    kidFriendly: "Chill oxygen into liquid form and lock it in the tanks — fuel and air for later!",
    oxygenKg: 50,
    xp: 70,
    badge: "Cryo Keeper",
    color: "#80C29B",
  },
  {
    id: "ice",
    title: "Mine subsurface ice",
    body: "Mars hides water ice under dust at mid-latitudes and in the poles. Mining it gives drinking water and a second oxygen path through electrolysis.",
    kidFriendly: "Dig for buried ice! Melt it for water — and more oxygen through electrolysis.",
    libraryId: "electrolysis",
    oxygenKg: 70,
    xp: 80,
    badge: "Ice Digger",
    color: "#7EB8C9",
  },
  {
    id: "scale",
    title: "Scale the plant",
    body: "NASA’s MOXIE made about 12 grams of oxygen per hour — a proof. A crew needs kilograms per hour. We add more cell stacks and more solar power.",
    kidFriendly: "Level up! More cells and solar power so a whole crew gets enough oxygen every day.",
    math: "A person uses roughly 0.8 kg of oxygen a day. Three crew ≈ 2.4 kg/day, plus leaks and extra for the habitat.",
    oxygenKg: 80,
    xp: 110,
    badge: "Plant Boss",
    color: "#9FD0D4",
  },
];

export interface HabitatStep {
  id: string;
  title: string;
  body: string;
  why?: string;
  math?: string;
  libraryId?: string;
  powerKw?: number;
  waterKgDay?: number;
  o2KgDay?: number;
  ch4Kg?: number;
}

export const HABITAT_STEPS: HabitatStep[] = [
  {
    id: "land",
    title: "Land the module",
    body: "An inflatable shell packs small for launch and opens on the surface. Soft goods, hard airlock. Crew stay in the lander until it holds pressure.",
  },
  {
    id: "pressure",
    title: "Fill with breathable air",
    body: "We mix our stored oxygen with a buffer gas. On Mars we can sieve argon and nitrogen from the air. Pure oxygen at Earth pressure is a fire risk, so we dilute it.",
    libraryId: "why-oxygen",
  },
  {
    id: "shield",
    title: "Burial under regolith",
    body: "Space radiation and tiny meteoroids are the quiet dangers. About two metres of local dirt is a cheap, heavy blanket. Robots pile it on the shell.",
    libraryId: "habitat",
  },
  {
    id: "green",
    title: "Start the greenhouse",
    body: "Leafy plants eat carbon dioxide and give back oxygen. They also grow food and make the air smell like a place people can live, not just survive.",
    libraryId: "habitat",
  },
  {
    id: "water",
    title: "Close the water loop",
    body: "Humidity, wash water, and even urine are filtered and cleaned. On a world with no rain, every cup is treasure. This is how a base stops needing Earth.",
    libraryId: "habitat",
  },
];

export const MARS_CIV_STEPS: HabitatStep[] = [
  {
    id: "survey",
    title: "Survey the ellipse",
    body: "Walk the landing site with radar, a shovel, and a slope map. Rocks bigger than a wheel, slopes over ~15°, and dust pits are vetoes. Geography is the building code, not the postcard.",
    why: "Perseverance proved cameras can match craters to a map in the last kilometres. A town still has to pick a pad by hand: ice depth, sun, and a place a second lander can aim at.",
    math: "Safe ellipse: slope ≲ 15°, rocks ≳ 0.5 m rarer than ~1%, elevation as low as you can get (more air for the next cargo).",
    libraryId: "sites",
  },
  {
    id: "power",
    title: "Plant the power farm",
    body: "Solar on high ground, dusted weekly — or a small reactor if you picked the pole. No watts, no heat, no oxygen, no town. Civilization is measured in kilowatts per person.",
    why: "Mars gets about 43% of Earth’s sunlight, then dust steals more. Polar night lasts months. Power is the first wall you build, even before the hall.",
    math: "Solar constant at Mars ≈ 590 W/m². A dusty 30% efficient array yields ~80–150 W/m² at noon. Three crew + plant ≈ 40 kW class.",
    libraryId: "habitat",
    powerKw: 40,
  },
  {
    id: "ice",
    title: "Open the ice mine",
    body: "At Utopia or Arcadia you dig a few metres to dirty ice. At Jezero or Oxia you heat clay. At the pole you scoop the cap. Water is drink, air (split it), and later rocket fuel.",
    why: "Shipping water from Earth is shipping hydrogen you already have in the ground. SHARAD radar and Phoenix 2008 proved the ice is real — just usually under a dry lag.",
    math: "2 H₂O → 2 H₂ + O₂. 18 g water → 16 g oxygen. A tonne of dirty ice is a breathable bank plus hydrogen for Sabatier.",
    libraryId: "electrolysis",
    waterKgDay: 40,
    powerKw: 12,
  },
  {
    id: "air",
    title: "Scale the oxygen plant",
    body: "MOXIE-class ceramic cells split the thin CO₂ air. Electrolysis of meltwater adds a second stream. A crew of three needs ~2.4 kg of O₂ a day — plus leaks, EVA, and a buffer tank.",
    why: "NASA’s MOXIE made grams per hour in 2021. That was the exam question. A town answers it with stacks and kilowatts, not a lab demo.",
    math: "2 CO₂ → 2 CO + O₂ at ~800 °C. Three crew ≈ 2.4 kg O₂/day. Add ~50% for leaks and EVA. That is ~3.6 kg/day, every day.",
    libraryId: "moxie",
    o2KgDay: 3.6,
    powerKw: 18,
  },
  {
    id: "pressure",
    title: "Pressurize the first hall",
    body: "Inflatable shell, hard airlock, mix of O₂ with argon and nitrogen sieved from Mars air. 30 kPa oxygen-rich mix can work; 101 kPa Earth-air wastes mass and needs a fatter hull.",
    why: "The hall is a balloon you live in. Fire is the enemy of pure oxygen. Dilute it. Keep a second, smaller refuge you can seal in minutes.",
    math: "Mars air ≈ 95% CO₂, 3% N₂, 2% Ar. Sieve the N₂/Ar; dump CO₂ or feed it to Sabatier. Target: Earth-like O₂ partial pressure, lower total P.",
    libraryId: "why-oxygen",
    o2KgDay: 0.4,
  },
  {
    id: "shield",
    title: "Bury the hall",
    body: "Two metres of local dirt cuts galactic cosmic rays and micrometeoroids. Free mass. Robots pile it. Windows are a luxury you cover at night and during a solar storm.",
    why: "Mars has no magnetic umbrella and a whisper of air. Dose adds up over months. Dirt is the cheapest hospital you will ever build.",
    math: "≈2 m of ~1.5 g/cm³ regolith ≈ 300 g/cm² — enough to knock solar-particle events down and take the edge off GCR.",
    libraryId: "habitat",
  },
  {
    id: "green",
    title: "Grow the first calories",
    body: "A greenhouse eats CO₂, gives back O₂, and makes salad. It does not replace the mechanical plant, but it teaches the loop: light in, food out, water reused. Crew morale is a life-support number.",
    why: "Plants fail slow, machines fail fast. You want both. The greenhouse is a classroom: carbon in, sugar out, oxygen as the receipt.",
    math: "Photosynthesis: 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂. A small salad bay might return 0.3 kg O₂/day — a bonus, not the plant.",
    libraryId: "habitat",
    o2KgDay: 0.3,
    powerKw: 10,
  },
  {
    id: "loop",
    title: "Close water and waste",
    body: "Every cup is treasure. Condensate, wash water, urine — filtered, not dumped. A town that dumps water is still a picnic that will run out between cargo windows.",
    why: "Launch windows to Mars open about every 26 months. If your water loop leaks 10%, you are planning a drought, not a city.",
    math: "ISS recovers >80% of wastewater. A Mars town should beat that. 3 crew × ~4 L/day use ≈ 12 L if the loop is closed; tonnes if it is not.",
    libraryId: "habitat",
    waterKgDay: 12,
  },
  {
    id: "brick",
    title: "Bake bricks and metal",
    body: "Sulfur concrete, sintered regolith, or clay ceramics from Oxia and Jezero. Iron from dust. The second hall should not wait for a hull from Earth — the next lander should dock to a wall you already made.",
    why: "Mass from Earth is the tax. Local rock is free. A civilization starts the day the second building is not a crate.",
    math: "Sintering: heat regolith toward melting (~1,000–1,200 °C) so grains stick. Sulfur concrete: melt S, mix with dirt, cool. No water required.",
    libraryId: "sites",
    powerKw: 15,
  },
  {
    id: "fuel",
    title: "Make methane for the ride home",
    body: "Sabatier: CO₂ + 4 H₂ → CH₄ + 2 H₂O at ~400 °C with a nickel catalyst. Hydrogen from ice, carbon from the air. A cargo lander that can refuel is a civilization, not a one-way crate.",
    why: "This is the trick SpaceX, NASA, and every serious Mars plan agree on. You do not ship the return propellant if the planet will cook it for you.",
    math: "CO₂ + 4 H₂ → CH₄ + 2 H₂O. Recycle the water through electrolysis to recover H₂ and bank more O₂. Methane + oxygen is a clean, storable pair.",
    libraryId: "civ",
    ch4Kg: 24,
    o2KgDay: 1.2,
    powerKw: 20,
  },
];


export function habitatSteps(dest: DestinationId): HabitatStep[] {
  return dest === "mars" ? MARS_CIV_STEPS : HABITAT_STEPS;
}

export function civLedger(steps: HabitatStep[], completed: number) {
  const slice = steps.slice(0, Math.max(0, completed));
  return {
    powerKw: slice.reduce((a, s) => a + (s.powerKw ?? 0), 0),
    waterKgDay: slice.reduce((a, s) => a + (s.waterKgDay ?? 0), 0),
    o2KgDay: slice.reduce((a, s) => a + (s.o2KgDay ?? 0), 0),
    ch4Kg: slice.reduce((a, s) => a + (s.ch4Kg ?? 0), 0),
  };
}



export interface LibraryArticle {
  id: string;
  title: string;
  kicker: string;
  body: string[];
  math?: string;
}

export const LIBRARY: LibraryArticle[] = [
  {
    id: "why-oxygen",
    title: "Why we need oxygen off Earth",
    kicker: "Breathing, rockets, and rust",
    body: [
      "Your cells use oxygen to unlock energy from food. Without it, you have minutes, not days.",
      "A person uses about 0.8 kilograms of oxygen each day at rest — more when working. Shipping that from Earth is possible, but it is like mailing air across the solar system.",
      "Oxygen is also the oxidizer in many rocket engines. A base that can make O₂ can refuel, not just breathe.",
      "On the Moon there is no air at all. On Mars the air is almost all carbon dioxide. In both places, oxygen is something we manufacture.",
    ],
  },
  {
    id: "oxidizer",
    title: "Rockets carry their own air",
    kicker: "Fuel is not enough",
    body: [
      "A candle needs oxygen from the room. A rocket leaves the room behind.",
      "That is why tanks hold two things: fuel (we use methane) and oxidizer (liquid oxygen, LOX). They mix in the engine and burn even in vacuum.",
      "LOX is pale blue and about −183 °C. The tanks frost over on the pad. That frost is a clue the oxidizer is ready.",
      "Methane + oxygen is a clean pair, and both can be made on Mars from CO₂ and ice. That is a reason engineers like them.",
    ],
  },
  {
    id: "equation",
    title: "The rocket equation, gently",
    kicker: "Mass is expensive",
    body: [
      "To go faster, a rocket throws mass backwards. The leftover mass (the ship) speeds up the other way. That is Newton’s third law.",
      "If you add a heavier capsule, you need more fuel. That fuel has mass, so you need still more fuel to lift the fuel. Costs rise fast.",
      "This is why cargo-only rockets are cheaper: no seats, no abort tower, no weeks of food. Less mass, less propellant, smaller bill.",
      "You do not need the formula to use the idea: every kilogram you take is a kilogram you must pay to accelerate.",
    ],
    math: "Δv = ve ln(m_full / m_empty). Bigger mass ratio → more change in speed. ve is how fast exhaust leaves the nozzle.",
  },
  {
    id: "windows",
    title: "Launch windows",
    kicker: "Waiting is a kind of fuel",
    body: [
      "The Moon is not a fixed spot in the sky. It moves, and Earth spins. We wait for a heading that points us at where the Moon will be when we arrive.",
      "Mars is harder. Good transfers (Hohmann paths) open about every 26 months. Miss the window and you wait, or you burn a lot more fuel.",
      "A window is a range of hours or days, not a single second. Weather and small delays still fit inside it.",
      "Kids’ takeaway: we do not always launch ‘as soon as the rocket is ready.’ We launch when the sky is ready too.",
    ],
  },
  {
    id: "maxq",
    title: "Max-Q — the hardest push of air",
    kicker: "Why engines throttle down",
    body: [
      "As a rocket climbs, it goes faster, but the air gets thinner. Dynamic pressure is ½ ρ v² — density times speed squared.",
      "There is a moment when that product peaks. We call it Max-Q. The vehicle is being squeezed the hardest by the wind.",
      "Engines often throttle down through Max-Q, then throttle up again. You may hear that in real launch commentary.",
      "Above the atmosphere, ρ is ~0, so Max-Q is over. From then on the worry is vacuum, heat, and navigation — not wind.",
    ],
    math: "q = ½ ρ v². ρ falls with height; v rises. Their product has a maximum a minute or so after liftoff.",
  },
  {
    id: "moon-ice",
    title: "Moon ice and ilmenite",
    kicker: "Water in the dark, oxygen in the dirt",
    body: [
      "Orbiters found hydrogen-rich deposits in polar craters that never see the Sun. The best explanation is water ice mixed with dust.",
      "If we heat that soil, we get water. If we split the water, we get oxygen and hydrogen.",
      "Away from the poles, the dry regolith still holds oxygen locked in minerals. Ilmenite (FeTiO₃) is a favorite target.",
      "Hot hydrogen can steal oxygen from ilmenite and make more water. The Moon is not ‘empty’ — it is a chemistry set with no air.",
    ],
  },
  {
    id: "electrolysis",
    title: "Electrolysis math",
    kicker: "The 18-gram story",
    body: [
      "Water’s formula is H₂O: two hydrogen atoms and one oxygen atom.",
      "Oxygen is much heavier than hydrogen. In 18 grams of water, 16 grams are oxygen and 2 grams are hydrogen.",
      "So a kilogram of ice is almost nine-tenths of a kilogram of breathable oxygen, once you add enough electricity.",
      "The hydrogen is not waste. It can become rocket fuel, or it can go back to pull more oxygen out of lunar rock.",
    ],
    math: "2 H₂O → 2 H₂ + O₂. 18 g water → 16 g O₂ + 2 g H₂ (about 89% oxygen by mass).",
  },
  {
    id: "moxie",
    title: "Mars air and MOXIE",
    kicker: "Breathing a planet that has the wrong air",
    body: [
      "Mars air is about 95% carbon dioxide, 3% nitrogen, 2% argon, and a whisper of oxygen. Pressure is less than 1% of Earth’s.",
      "You could not breathe it. You would not even feel it as ‘air’ the way you do at home. But CO₂ is a feedstock.",
      "MOXIE (Mars Oxygen In-Situ Resource Utilization Experiment) on NASA’s Perseverance rover heated ceramic cells and split CO₂ into O₂ and CO.",
      "It made grams per hour. That was the point: prove the chemistry on the real planet. A base scales the same trick with more cells and more power.",
    ],
    math: "2 CO₂ → 2 CO + O₂. Solid-oxide electrolysis at ~800 °C.",
  },
  {
    id: "distance",
    title: "How far is far?",
    kicker: "384,400 km versus hundreds of millions",
    body: [
      "The Moon is about 384,400 km away. Light takes 1.3 seconds. A fast crew stack takes about three days.",
      "Mars ranges from about 78 million km (close) to over 400 million km (far side of the Sun). Light takes minutes. Crews ride for months.",
      "Time is the hidden cost: food, spare parts, radiation dose, and boredom all grow with the months.",
      "That is why a Mars ticket in this sim costs more than a Moon ticket, even on the same rocket family.",
    ],
    math: "Moon: ~1.3 light-seconds. Mars: ~4–22 light-minutes depending on orbit.",
  },
  {
    id: "orbits",
    title: "Orbits are a long fall",
    kicker: "Why worlds do not fly off or fall in",
    body: [
      "The Sun pulls every planet. If a world were sitting still, it would fall in. If it were going in a straight line with no gravity, it would fly off.",
      "An orbit is both at once: the world is falling, and it is moving sideways fast enough that the ground (or the Sun) keeps missing it.",
      "Closer in, the pull is stronger, so the world must move faster. That is why Mercury zips and Neptune crawls. Kepler wrote it as equal areas in equal times.",
      "A ship in cruise is doing the same trick. Engines off is not stopped. It is still falling around the Sun, just like Earth.",
    ],
    math: "vis-viva: v² = GM (2/r − 1/a). Faster when r is small (near the Sun); slower at the far end of an oval.",
  },
  {
    id: "hohmann",
    title: "The cheap path between worlds",
    kicker: "Hohmann transfers, in one picture",
    body: [
      "A Hohmann transfer is an oval that kisses the orbit you leave and the orbit you want. Two burns, a long coast.",
      "Burn 1 (prograde, along your motion) raises the far side of your oval until it reaches the next planet’s path. Then you wait.",
      "Burn 2, at the far end, circularizes so you stay there. Miss the timing and the planet is not home — it has moved.",
      "For Mars the wait is about seven months and the window opens roughly every 26 months. For the Moon the same idea is shorter: days, not seasons.",
    ],
    math: "Transfer time ≈ π √(a³ / GM) with a = (r_earth + r_dest) / 2. Bigger oval → longer coast.",
  },
  {
    id: "habitat",
    title: "A home, not just a landing",
    kicker: "Pressure, dust, and quiet radiation",
    body: [
      "A habitat has to hold air (pressure), block radiation, recycle water, and give people a day/night they can sleep in.",
      "Regolith — the local dirt — is free mass. Pile it on an inflatable shell and you get shielding without launching concrete.",
      "Plants help: they eat CO₂, make O₂, and grow calories. They do not replace the mechanical oxygen plant at first, but they make the loop kinder.",
      "The real trick is closing loops. If water and air are reused, the base stops being a picnic that runs out.",
    ],
  },
  {
    id: "landing",
    title: "How you actually land",
    kicker: "Orbit, then kill the sideways speed",
    body: [
      "You cannot ‘fall down’ onto the Moon the way a plane lands. There is no air, so there are no wings and no parachute.",
      "First a capture burn (LOI) slows you so the Moon’s gravity holds you in a circle. Then a descent orbit drops the low point.",
      "Powered descent (PDI) is the long engine firing that cancels orbital speed — about 1.6 km/s. Only after that do you hover and pick a flat patch.",
      "Gravity is 1/6 of Earth’s, so the last meters are slow. Probes under the legs shout CONTACT, then the engine cuts.",
    ],
    math: "Moon circular speed at 100 km ≈ 1.63 km/s. No atmosphere: every metre of that speed must be burned away with propellant.",
  },
];

export function articleById(id: string): LibraryArticle | undefined {
  return LIBRARY.find((a) => a.id === id);
}

export function plantSteps(dest: DestinationId): PlantStep[] {
  return dest === "moon" ? MOON_STEPS : MARS_STEPS;
}

export function plantOxygenTotal(dest: DestinationId): number {
  return plantSteps(dest).reduce((sum, s) => sum + s.oxygenKg, 0);
}

export interface LandingStep {
  id: string;
  callsign: string;
  title: string;
  body: string;
  why: string;
  alt: string;
  speed: string;
  libraryId?: string;
}

export const MOON_LANDING: LandingStep[] = [
  {
    id: "loi",
    callsign: "LOI",
    title: "Capture burn",
    body: "Fire retrograde as you swing behind the Moon. The oval closes. Miss this burn and you fly past into solar orbit.",
    why: "The Moon’s gravity is weak. Speed that was fine for the coast is too fast to stay.",
    alt: "500 km",
    speed: "2.3 → 1.6 km/s",
    libraryId: "landing",
  },
  {
    id: "llo",
    callsign: "LLO",
    title: "Low lunar orbit",
    body: "A 100 km circle. Time to check the landing site, rest, and let Earth rise over the limb.",
    why: "An orbit is a long fall that keeps missing the ground. No engine needed to stay — only to leave.",
    alt: "100 km",
    speed: "1.63 km/s",
    libraryId: "orbits",
  },
  {
    id: "doi",
    callsign: "DOI",
    title: "Descent orbit",
    body: "A small burn drops periapsis — the low point — to about 15 km on the far side. The far side of the oval now skims the highlands.",
    why: "Starting powered descent from a lower height saves fuel. Same idea as a Hohmann, just tiny.",
    alt: "100 × 15 km",
    speed: "1.63 km/s",
    libraryId: "hohmann",
  },
  {
    id: "pdi",
    callsign: "PDI",
    title: "Powered descent",
    body: "Engine on, pitch the belly forward. Most of the 1.6 km/s of sideways speed has to go. There is no air to help.",
    why: "On Earth, air and wings steal speed. On the Moon, only the engine does.",
    alt: "15 → 3 km",
    speed: "1.6 km/s → 200 m/s",
    libraryId: "landing",
  },
  {
    id: "approach",
    callsign: "P64",
    title: "Approach and hover",
    body: "Landing radar sees the craters. Pitch upright. 1/6 g means you fall slowly — enough time to pick a flat patch and put the legs down.",
    why: "The last kilometres are about not landing on a boulder or a slope.",
    alt: "3 km → 150 m",
    speed: "200 → 8 m/s",
  },
  {
    id: "touch",
    callsign: "CONTACT",
    title: "Touchdown",
    body: "Probes under the pads shout CONTACT. Engine cuts. Dust settles in a vacuum — no breeze to carry it. Earth hangs in a black sky.",
    why: "You are down. Next job is the oxygen plant, not another burn.",
    alt: "0 m",
    speed: "0",
    libraryId: "landing",
  },
];

export const MARS_LANDING: LandingStep[] = [
  {
    id: "moi",
    callsign: "MOI",
    title: "Capture burn",
    body: "A long retrograde burn at the high point of the transfer oval. Mars grabs the stack. Without it you keep going around the Sun.",
    why: "Same capture idea as the Moon, but the speed to kill is larger and the wait was months.",
    alt: "400 km",
    speed: "5.5 → 3.4 km/s",
    libraryId: "landing",
  },
  {
    id: "entry",
    callsign: "EI",
    title: "Entry interface",
    body: "The thin CO₂ air is still useful. A heat shield takes the first beating. Plasma glows; radio may drop for a minute.",
    why: "Mars has just enough air to bleed speed — not enough to breathe, not enough for a soft parachute-only landing.",
    alt: "125 km",
    speed: "5.9 km/s",
    libraryId: "moxie",
  },
  {
    id: "chute",
    callsign: "CHUTE",
    title: "Supersonic parachute",
    body: "A huge chute opens while you are still faster than sound. It cannot finish the job — Mars air is only 1% as thick as Earth’s.",
    why: "Parachutes need air. Thin air means you still need engines for the last kilometre.",
    alt: "11 km",
    speed: "400 m/s",
  },
  {
    id: "pdi",
    callsign: "PDI",
    title: "Powered descent",
    body: "Chute cuts away. Engines light. Radar maps the rocks. Gravity here is about 3/8 of Earth’s — heavier than the Moon, still kinder than home.",
    why: "The rest of the speed is propellant, just like the lunar PDI.",
    alt: "1.5 km",
    speed: "80 m/s",
    libraryId: "landing",
  },
  {
    id: "terminal",
    callsign: "TERM",
    title: "Terminal descent",
    body: "Legs out (or a sky crane lowering the deck). Dust kicks up, but the air is so thin the cloud falls back fast.",
    why: "Last tens of metres: fly to a flat patch, then go vertical.",
    alt: "40 m",
    speed: "2 m/s",
  },
  {
    id: "touch",
    callsign: "CONTACT",
    title: "Touchdown",
    body: "Pads on ochre dirt. Engine stop. A thin wind, a salmon sky, and a long to-do list for the oxygen plant.",
    why: "You are on Mars. The air is the wrong kind — that is why MOXIE is next.",
    alt: "0 m",
    speed: "0",
    libraryId: "moxie",
  },
];

export function landingSteps(dest: DestinationId): LandingStep[] {
  return dest === "moon" ? MOON_LANDING : MARS_LANDING;
}
