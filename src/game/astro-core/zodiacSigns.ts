/** Tropical zodiac sectors — geometry vs symbolic kept separate. */

export type ZodiacSign = {
  index: number;
  name: string;
  symbol: string;
  element: "fire" | "earth" | "air" | "water";
  modality: "cardinal" | "fixed" | "mutable";
  startDeg: number;
  endDeg: number;
  /** [GEOMETRY] */
  geometryNote: string;
  /** [SYMBOLIC] — tradition, not physics */
  symbolic: {
    keywords: string[];
    mythology: string;
    sourceRefs: string[];
  };
  color: string;
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    index: 0,
    name: "Aries",
    symbol: "♈",
    element: "fire",
    modality: "cardinal",
    startDeg: 0,
    endDeg: 30,
    color: "#e85d4c",
    geometryNote:
      "Tropical sector λ ∈ [0°, 30°) measured from the vernal equinox (Sun crossing celestial equator northward). Equal 30° by definition — not equal to constellation Aries boundaries.",
    symbolic: {
      keywords: ["initiative", "spark", "beginning"],
      mythology: "Ram of the Golden Fleece in Greek tradition; seasonal spring marker in Mediterranean cultures.",
      sourceRefs: ["Ptolemy Tetrabiblos (historical)", "folk zodiac primers"],
    },
  },
  {
    index: 1,
    name: "Taurus",
    symbol: "♉",
    element: "earth",
    modality: "fixed",
    startDeg: 30,
    endDeg: 60,
    color: "#6FBF9A",
    geometryNote: "Tropical λ ∈ [30°, 60). Second equal sector after the equinox anchor.",
    symbolic: {
      keywords: ["stability", "senses", "value"],
      mythology: "Bull imagery linked to agricultural seasons and Zeus/Europa tales.",
      sourceRefs: ["seasonal folklore", "classical myth anthologies"],
    },
  },
  {
    index: 2,
    name: "Gemini",
    symbol: "♊",
    element: "air",
    modality: "mutable",
    startDeg: 60,
    endDeg: 90,
    color: "#e8c070",
    geometryNote: "Tropical λ ∈ [60°, 90).",
    symbolic: {
      keywords: ["exchange", "duality", "curiosity"],
      mythology: "Castor and Pollux / twin motifs.",
      sourceRefs: ["Greek myth", "star lore"],
    },
  },
  {
    index: 3,
    name: "Cancer",
    symbol: "♋",
    element: "water",
    modality: "cardinal",
    startDeg: 90,
    endDeg: 120,
    color: "#7EB8C9",
    geometryNote: "Tropical λ ∈ [90°, 120°). Contains northern summer solstice at 90°.",
    symbolic: {
      keywords: ["care", "shell", "home"],
      mythology: "Crab of the Hydra labor; solstice season marker.",
      sourceRefs: ["Heracles cycle", "seasonal lore"],
    },
  },
  {
    index: 4,
    name: "Leo",
    symbol: "♌",
    element: "fire",
    modality: "fixed",
    startDeg: 120,
    endDeg: 150,
    color: "#f0a050",
    geometryNote: "Tropical λ ∈ [120°, 150°).",
    symbolic: {
      keywords: ["radiance", "play", "heart"],
      mythology: "Nemean lion; summer high-sun season in northern folklore.",
      sourceRefs: ["classical myth"],
    },
  },
  {
    index: 5,
    name: "Virgo",
    symbol: "♍",
    element: "earth",
    modality: "mutable",
    startDeg: 150,
    endDeg: 180,
    color: "#c5d0a0",
    geometryNote: "Tropical λ ∈ [150°, 180°).",
    symbolic: {
      keywords: ["craft", "detail", "harvest"],
      mythology: "Harvest maiden / Astraea themes.",
      sourceRefs: ["agricultural calendars"],
    },
  },
  {
    index: 6,
    name: "Libra",
    symbol: "♎",
    element: "air",
    modality: "cardinal",
    startDeg: 180,
    endDeg: 210,
    color: "#d8c8f0",
    geometryNote: "Tropical λ ∈ [180°, 210°). Autumnal equinox at 180°.",
    symbolic: {
      keywords: ["balance", "relation", "measure"],
      mythology: "Scales of justice; equinox balance metaphor.",
      sourceRefs: ["Roman symbol set"],
    },
  },
  {
    index: 7,
    name: "Scorpio",
    symbol: "♏",
    element: "water",
    modality: "fixed",
    startDeg: 210,
    endDeg: 240,
    color: "#a04050",
    geometryNote: "Tropical λ ∈ [210°, 240°).",
    symbolic: {
      keywords: ["depth", "intensity", "transform"],
      mythology: "Scorpion of Orion myths; seasonal decline motifs.",
      sourceRefs: ["Greek star lore"],
    },
  },
  {
    index: 8,
    name: "Sagittarius",
    symbol: "♐",
    element: "fire",
    modality: "mutable",
    startDeg: 240,
    endDeg: 270,
    color: "#c4896a",
    geometryNote: "Tropical λ ∈ [240°, 270°).",
    symbolic: {
      keywords: ["quest", "aim", "horizon"],
      mythology: "Archer / centaur figures; travel season metaphors.",
      sourceRefs: ["classical myth"],
    },
  },
  {
    index: 9,
    name: "Capricorn",
    symbol: "♑",
    element: "earth",
    modality: "cardinal",
    startDeg: 270,
    endDeg: 300,
    color: "#8b97a8",
    geometryNote: "Tropical λ ∈ [270°, 300°). Southern summer / northern winter solstice at 270°.",
    symbolic: {
      keywords: ["structure", "climb", "time"],
      mythology: "Sea-goat; solstice turning point in many calendars.",
      sourceRefs: ["Mesopotamian & Greek layers"],
    },
  },
  {
    index: 10,
    name: "Aquarius",
    symbol: "♒",
    element: "air",
    modality: "fixed",
    startDeg: 300,
    endDeg: 330,
    color: "#5a9fd4",
    geometryNote: "Tropical λ ∈ [300°, 330°).",
    symbolic: {
      keywords: ["network", "ideal", "pouring"],
      mythology: "Water-bearer; communal resource metaphors.",
      sourceRefs: ["classical & later esoteric lists"],
    },
  },
  {
    index: 11,
    name: "Pisces",
    symbol: "♓",
    element: "water",
    modality: "mutable",
    startDeg: 330,
    endDeg: 360,
    color: "#6a8ab8",
    geometryNote: "Tropical λ ∈ [330°, 360°).",
    symbolic: {
      keywords: ["merge", "dream", "tide"],
      mythology: "Two fish; late-winter liminal season.",
      sourceRefs: ["Hellenistic star lore"],
    },
  },
];

export function signAtLambda(lambda: number): ZodiacSign {
  const i = Math.floor((((lambda % 360) + 360) % 360) / 30) % 12;
  return ZODIAC_SIGNS[i];
}
