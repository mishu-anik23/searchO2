/** Mars geography + Perseverance / Jezero teaching markers (classroom-safe summaries). */

export interface MarsSource {
  title: string;
  organization: string;
  url: string;
}

export interface MarsFeature {
  id: string;
  name: string;
  type:
    | "landing"
    | "crater"
    | "delta"
    | "mountain"
    | "canyon"
    | "pole"
    | "basin"
    | "rover"
    | "isru"
    | "science";
  latitude: number;
  longitude: number;
  diameterKm?: number;
  elevationKm?: number;
  region?: string;
  mission?: string;
  status: "OBSERVED" | "EXPLORED" | "ACTIVE ROVER" | "COMPLETED" | "CONCEPT";
  summary: string;
  why: string;
  limitation: string;
  kidFriendly: string;
  sources: MarsSource[];
}

const nasaMars = {
  title: "Mars Exploration",
  organization: "NASA Science",
  url: "https://science.nasa.gov/mars/",
};
const perseverance = {
  title: "Perseverance Rover",
  organization: "NASA / JPL",
  url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
};
const jezero = {
  title: "Jezero Crater",
  organization: "NASA Science",
  url: "https://science.nasa.gov/mars/mars-exploration-program/",
};
const moxie = {
  title: "MOXIE — Making Oxygen on Mars",
  organization: "NASA / MIT",
  url: "https://science.nasa.gov/mission/mars-2020-perseverance/moxie/",
};
const olympus = {
  title: "Olympus Mons",
  organization: "NASA Science",
  url: "https://science.nasa.gov/resource/olympus-mons/",
};
const valles = {
  title: "Valles Marineris",
  organization: "NASA Science",
  url: "https://science.nasa.gov/resource/valles-marineris/",
};

/** Shared classroom facts about Mars as a place. */
export const MARS_GEOGRAPHY_BASICS = {
  title: "What is Mars like?",
  atmosphere:
    "Mars has a thin atmosphere, mostly carbon dioxide (CO₂). Air pressure is less than 1% of Earth’s at the surface — you could not breathe it, and liquid water is unstable in most places today.",
  gravity: "Surface gravity is about 38% of Earth’s. You would weigh less, but a spacesuit and oxygen supply are still required.",
  dayNight:
    "A Martian day (“sol”) is about 24 hours 39 minutes. Seasons last longer because a Mars year is about 687 Earth days.",
  surface:
    "Much of the surface is dusty, rocky, and iron-rich — that rust-like iron oxide gives Mars its reddish color. Dust storms can cover large regions.",
  sky: "The daytime sky can look butterscotch or pinkish from fine dust; sunsets on Mars often appear blue near the Sun.",
  water:
    "Today most water is frozen in polar ice and ground ice. Ancient river deltas and lakebeds (like in Jezero) show water once flowed more freely.",
};

export function marsTypeLabel(type: MarsFeature["type"]): string {
  const map: Record<MarsFeature["type"], string> = {
    landing: "Landing site",
    crater: "Crater",
    delta: "River delta",
    mountain: "Volcano / mountain",
    canyon: "Canyon system",
    pole: "Polar region",
    basin: "Impact basin",
    rover: "Rover traverse",
    isru: "ISRU / oxygen",
    science: "Science target",
  };
  return map[type];
}

export function formatMarsLatLon(lat: number, lon: number): { lat: string; lon: string } {
  return {
    lat: `${Math.abs(lat).toFixed(1)}°${lat < 0 ? "S" : "N"}`,
    lon: `${Math.abs(lon).toFixed(1)}°${lon < 0 ? "W" : "E"}`,
  };
}

export const MARS_FEATURES: MarsFeature[] = [
  {
    id: "jezero",
    name: "Jezero Crater",
    type: "crater",
    latitude: 18.4,
    longitude: 77.5,
    diameterKm: 45,
    region: "Syrtis Major / Isidis rim",
    mission: "Mars 2020 Perseverance",
    status: "ACTIVE ROVER",
    summary:
      "A ~45 km crater that once held a lake fed by a river. The western inlet shows a preserved delta fan — a prime target for ancient habitability clues.",
    why: "Sediments in a former lake–delta system can trap organic molecules and record environmental change over time.",
    limitation: "Orbital maps and rover data sample limited areas; this globe marker is a locator, not a full geologic map.",
    kidFriendly:
      "Long ago, Jezero was like a lake with a river mouth. Perseverance explores the dried-up delta for clues that water — and maybe tiny life chemistry — once existed here.",
    sources: [jezero, perseverance],
  },
  {
    id: "butler-landing",
    name: "Octavia E. Butler Landing",
    type: "landing",
    latitude: 18.44,
    longitude: 77.45,
    region: "Jezero Crater floor",
    mission: "Mars 2020 Perseverance",
    status: "ACTIVE ROVER",
    summary:
      "Perseverance’s touchdown site (February 2021), named for author Octavia E. Butler. The rover began its science mission on the crater floor before climbing toward the delta.",
    why: "A safe, accessible starting point for traversing toward the western fan and collecting core samples for a future return concept.",
    limitation: "Landing coordinates are approximate teaching markers; exact telemetry is in mission archives.",
    kidFriendly:
      "This is where the Perseverance rover “touched down.” From here it drives, takes pictures, and drills rock samples to study Mars up close.",
    sources: [perseverance],
  },
  {
    id: "western-delta",
    name: "Jezero western delta",
    type: "delta",
    latitude: 18.5,
    longitude: 77.35,
    region: "Jezero Crater",
    mission: "Mars 2020 Perseverance",
    status: "EXPLORED",
    summary:
      "A fan-shaped pile of sediments left where an ancient river entered the crater lake. Layered rocks record changing water energy and chemistry.",
    why: "Deltas on Earth often preserve organics; Jezero’s fan is a high-priority sampling region for the Mars Sample Return concept.",
    limitation: "Not every layer is sampled; rover paths cover only narrow corridors.",
    kidFriendly:
      "Think of a river dumping mud and sand into a lake. When the water disappeared, the fan of sediments stayed — a history book written in rock.",
    sources: [jezero, perseverance],
  },
  {
    id: "seitah",
    name: "Séítah",
    type: "rover",
    latitude: 18.43,
    longitude: 77.42,
    region: "Jezero Crater floor",
    mission: "Mars 2020 Perseverance",
    status: "EXPLORED",
    summary:
      "A region of darker, rough terrain on the crater floor studied early in the mission; linked to igneous and altered materials.",
    why: "Comparing floor rocks with delta sediments helps separate volcanic, impact, and water-altered histories.",
    limitation: "Names and unit boundaries evolve as the science team publishes new maps.",
    kidFriendly:
      "Séítah is a rocky neighborhood Perseverance visited early on. Different rocks tell different stories about fire, impacts, and water.",
    sources: [perseverance],
  },
  {
    id: "moxie-site",
    name: "MOXIE (on Perseverance)",
    type: "isru",
    latitude: 18.44,
    longitude: 77.45,
    region: "Jezero Crater",
    mission: "Mars 2020 Perseverance",
    status: "COMPLETED",
    summary:
      "MOXIE converted Martian CO₂ into oxygen gas on the surface — a proof that in-situ resource utilization (ISRU) can work on Mars.",
    why: "Future crews would need oxygen for propellant and life support; importing all of it from Earth is extremely expensive.",
    limitation: "MOXIE produced small demonstration amounts, not crew-scale oxygen. Scaling up needs far more power and hardware.",
    kidFriendly:
      "MOXIE is a box on Perseverance that breathed in Mars air (mostly CO₂) and made oxygen — like a tiny practice plant for future astronauts.",
    sources: [moxie, perseverance],
  },
  {
    id: "olympus-mons",
    name: "Olympus Mons",
    type: "mountain",
    latitude: 18.65,
    longitude: -133.8,
    elevationKm: 21.9,
    diameterKm: 600,
    region: "Tharsis",
    status: "OBSERVED",
    summary:
      "The tallest known volcano in the Solar System, about 22 km high with a vast basal scarp and caldera complex.",
    why: "Shows how large volcanic edifices can grow under lower gravity and a long-lived magma system.",
    limitation: "Globe marker is schematic; slopes and landing hazards are extreme and not rated here.",
    kidFriendly:
      "Olympus Mons is a giant shield volcano — much taller than any mountain on Earth. Low gravity helped it grow so huge.",
    sources: [olympus, nasaMars],
  },
  {
    id: "valles-marineris",
    name: "Valles Marineris",
    type: "canyon",
    latitude: -14,
    longitude: -59,
    region: "Equatorial Mars",
    status: "OBSERVED",
    summary:
      "A system of canyons thousands of kilometres long and up to ~7 km deep — far larger than Earth’s Grand Canyon.",
    why: "Exposes layered crust and tectonic history; a landmark for understanding Mars’s interior and surface evolution.",
    limitation: "The system spans a huge area; one pin only marks a central teaching location.",
    kidFriendly:
      "Imagine a canyon so long it could stretch across an entire continent. Valles Marineris is one of the biggest canyon systems we know.",
    sources: [valles, nasaMars],
  },
  {
    id: "gale",
    name: "Gale Crater (Curiosity)",
    type: "crater",
    latitude: -5.4,
    longitude: 137.8,
    diameterKm: 154,
    region: "Aeolis",
    mission: "Curiosity (MSL)",
    status: "ACTIVE ROVER",
    summary:
      "Home of the Curiosity rover since 2012. Mount Sharp (Aeolis Mons) in the center preserves stacked layers of ancient environments.",
    why: "Long-lived rover data show lakes, streams, and changing chemistry in Gale’s past — complementary to Perseverance at Jezero.",
    limitation: "Different crater, different mission; not Perseverance’s path.",
    kidFriendly:
      "Curiosity is another NASA rover exploring a different crater. Together, the rovers help us compare many ancient environments on Mars.",
    sources: [nasaMars],
  },
  {
    id: "hellas",
    name: "Hellas Basin",
    type: "basin",
    latitude: -42.4,
    longitude: 70.5,
    diameterKm: 2300,
    region: "Southern hemisphere",
    status: "OBSERVED",
    summary:
      "One of the largest impact basins on Mars, with some of the lowest elevations on the planet.",
    why: "Deep basins affect atmosphere, dust, and climate patterns; a major geographic landmark.",
    limitation: "Marker is approximate center; the basin rim is vast.",
    kidFriendly:
      "Hellas is a gigantic dent from an ancient asteroid hit. Parts of it sit so low that the air is a bit thicker than on high volcanoes.",
    sources: [nasaMars],
  },
  {
    id: "north-cap",
    name: "North polar ice cap",
    type: "pole",
    latitude: 90,
    longitude: 0,
    region: "Planum Boreum",
    status: "OBSERVED",
    summary:
      "A permanent water-ice cap with seasonal carbon-dioxide frost. Spiral troughs and layered deposits record climate cycles.",
    why: "Polar ice is a major water reservoir and a climate archive.",
    limitation: "Seasonal CO₂ cover changes; this pin is a polar locator.",
    kidFriendly:
      "The north pole of Mars has ice like Earth’s poles — mostly water ice under changing dry-ice frost in winter.",
    sources: [nasaMars],
  },
  {
    id: "south-cap",
    name: "South polar ice cap",
    type: "pole",
    latitude: -90,
    longitude: 0,
    region: "Planum Australe",
    status: "OBSERVED",
    summary:
      "A permanent ice residual cap with complex seasonal CO₂ behavior and layered deposits.",
    why: "Together with the north, polar caps store volatiles key to Mars climate history.",
    limitation: "Teaching locator only.",
    kidFriendly:
      "Mars’s south pole also holds ice. In winter, carbon dioxide from the air freezes as dry ice on top of deeper ice layers.",
    sources: [nasaMars],
  },
  {
    id: "ingenuity-region",
    name: "Ingenuity flight region",
    type: "science",
    latitude: 18.43,
    longitude: 77.44,
    region: "Jezero Crater",
    mission: "Mars Helicopter Ingenuity",
    status: "COMPLETED",
    summary:
      "Ingenuity demonstrated powered flight in Mars’s thin air, scouting terrain and expanding how we explore other worlds.",
    why: "Aerial scouting can guide rovers and future crews around hazards.",
    limitation: "Helicopter operations have ended; marker represents the early flight zone near the landing area.",
    kidFriendly:
      "Ingenuity was a small helicopter that flew on Mars — the first powered aircraft to fly on another planet.",
    sources: [perseverance],
  },
];

/** Ordered stops for the guided classroom tour. */
export const MARS_TOUR_IDS = [
  "butler-landing",
  "jezero",
  "western-delta",
  "moxie-site",
  "ingenuity-region",
  "olympus-mons",
  "valles-marineris",
  "gale",
] as const;
