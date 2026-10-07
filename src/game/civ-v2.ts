/**
 * Mars civilization v2 — student-first loop data.
 * LOOK → WHY? → LIBRARY (exit ticket) → FIELD TASK → BUILD + RXP
 */
import type { MarsSiteId } from "./mars";

export type CivPhase = "why" | "library" | "field" | "ready" | "done";

export interface WhyCard {
  id: string;
  text: string;
  correct: boolean;
  /** Shown for 15s comic-style hold-on when wrong */
  holdOn?: string;
}

export interface ExitTicketQ {
  q: string;
  choices: string[];
  answer: number; // index
}

export type FieldTaskKind =
  | "survey"
  | "power"
  | "ice"
  | "air"
  | "hall"
  | "shield"
  | "green"
  | "loop"
  | "brick"
  | "fuel";

export interface FieldTaskDef {
  kind: FieldTaskKind;
  title: string;
  hint: string;
  /** Kid-facing success message */
  success: string;
}

export interface CivLayerV2 {
  stepId: string;
  label: string; // POWER, ICE, AIR…
  gloss: string;
  whyCards: WhyCard[];
  /** Site-specific overrides keyed by site id; merges/replaces whyCards when present */
  whyBySite?: Partial<Record<MarsSiteId, WhyCard[]>>;
  exitTicket: ExitTicketQ[];
  field: FieldTaskDef;
  rxp: {
    whyFirstTry: number;
    library: number;
    field: number;
    siteBonus?: number;
  };
}

export const RXP_RANKS: { min: number; id: string; title: string }[] = [
  { min: 0, id: "cadet", title: "Cadet" },
  { min: 150, id: "surveyor", title: "Surveyor" },
  { min: 300, id: "plant-tech", title: "Plant tech" },
  { min: 450, id: "town-planner", title: "Town planner" },
  { min: 600, id: "refueler", title: "Refueler" },
];

export function rankForRxp(rxp: number) {
  let r = RXP_RANKS[0];
  for (const row of RXP_RANKS) {
    if (rxp >= row.min) r = row;
  }
  return r;
}

export const CIV_LAYERS_V2: CivLayerV2[] = [
  {
    stepId: "survey",
    label: "PAD",
    gloss: "Pick flat, safe ground for the town",
    whyCards: [
      {
        id: "s1",
        text: "Stamp a pad on ground flatter than ~15°. Rocks and rims are vetoes.",
        correct: true,
      },
      {
        id: "s2",
        text: "Build on the steepest rim so the view is cool.",
        correct: false,
        holdOn: "Hold on… steep ground tips landers and rovers. Flat first, postcard later.",
      },
      {
        id: "s3",
        text: "Skip the survey — the parachute already picked the best spot.",
        correct: false,
        holdOn: "Hold on… the chute lands you in the ellipse. You still walk it and pick a pad.",
      },
    ],
    exitTicket: [
      {
        q: "A safe pad on Mars needs slopes under about…",
        choices: ["15°", "45°", "90°"],
        answer: 0,
      },
      {
        q: "Why walk the site after landing?",
        choices: ["To pick ice, sun, and a second-lander pad", "To plant a flag only", "Because Earth told us to"],
        answer: 0,
      },
    ],
    field: {
      kind: "survey",
      title: "Stamp a safe pad",
      hint: "Drag the stamp onto flat ground. Red = too steep or rocky.",
      success: "Pad locked. Second lander can aim here.",
    },
    rxp: { whyFirstTry: 15, library: 20, field: 25, siteBonus: 5 },
  },
  {
    stepId: "power",
    label: "POWER",
    gloss: "No watts means no heat, no pump, no oxygen",
    whyCards: [
      {
        id: "p1",
        text: "Put solar (or a reactor at the pole) up first. Nothing else runs without watts.",
        correct: true,
      },
      {
        id: "p2",
        text: "Inflate the hall first so people can sit down.",
        correct: false,
        holdOn: "Hold on… a hall without power is a dark balloon. Watts before walls.",
      },
      {
        id: "p3",
        text: "Start methane now so we can leave sooner.",
        correct: false,
        holdOn: "Hold on… Sabatier needs hydrogen from ice and leftover CO₂. Both come later.",
      },
    ],
    whyBySite: {
      boreum: [
        {
          id: "pb1",
          text: "At the pole, drop a small reactor — polar night kills solar for months.",
          correct: true,
        },
        {
          id: "pb2",
          text: "Solar only — the midnight sun lasts all year here.",
          correct: false,
          holdOn: "Hold on… summer has 24-hour sun, winter has months of night. Reactor is the safe bet.",
        },
        {
          id: "pb3",
          text: "Skip power; the ice will keep the town warm.",
          correct: false,
          holdOn: "Hold on… ice is cold, not a heater. You need kilowatts.",
        },
      ],
    },
    exitTicket: [
      {
        q: "Mars gets about how much of Earth’s sunlight?",
        choices: ["43%", "100%", "10%"],
        answer: 0,
      },
      {
        q: "Why is power the first wall of a town?",
        choices: ["Heat, pumps, and oxygen all need watts", "It looks shiny from orbit", "NASA said so once"],
        answer: 0,
      },
    ],
    field: {
      kind: "power",
      title: "Place the power farm",
      hint: "Drop 4 panels on high sunny tiles — or a reactor at the pole. Dust cuts watts.",
      success: "Grid online. Kilowatts are flowing.",
    },
    rxp: { whyFirstTry: 15, library: 20, field: 25, siteBonus: 10 },
  },
  {
    stepId: "ice",
    label: "ICE",
    gloss: "Water for drink, air, and later rocket fuel",
    whyCards: [
      {
        id: "i1",
        text: "Mine ice where it is shallow (Utopia/Arcadia) or heat clay where it is locked (Jezero/Oxia).",
        correct: true,
      },
      {
        id: "i2",
        text: "Skip water; MOXIE alone is enough for everything.",
        correct: false,
        holdOn: "Hold on… MOXIE makes O₂ from air. Drink and hydrogen for fuel still need water or ice.",
      },
      {
        id: "i3",
        text: "Ship every litre from Earth — the ground is dry everywhere.",
        correct: false,
        holdOn: "Hold on… mid-latitude and polar ice are real. Shipping water ships hydrogen you already have.",
      },
    ],
    whyBySite: {
      jezero: [
        {
          id: "ij1",
          text: "Jezero’s water is locked in clay. We heat rock; we don’t scoop a glacier.",
          correct: true,
        },
        {
          id: "ij2",
          text: "Dig three metres — the glacier is right there.",
          correct: false,
          holdOn: "Hold on… true at Utopia/Arcadia. At Jezero the water is mineral-bound.",
        },
        {
          id: "ij3",
          text: "Skip water; MOXIE makes oxygen from air, that’s enough.",
          correct: false,
          holdOn: "Hold on… O₂ yes, drink and fuel hydrogen no.",
        },
      ],
      oxia: [
        {
          id: "io1",
          text: "Oxia is a clay lab. Heat the dirt for water and ceramics.",
          correct: true,
        },
        {
          id: "io2",
          text: "Scoop the white polar cap from here.",
          correct: false,
          holdOn: "Hold on… the polar cap is at Planum Boreum, not Oxia.",
        },
        {
          id: "io3",
          text: "Ice is three metres down everywhere on Mars.",
          correct: false,
          holdOn: "Hold on… only at some mid-latitude plains. Here you cook clay.",
        },
      ],
      utopia: [
        {
          id: "iu1",
          text: "Utopia has subsurface ice. Dig the lag, mine the ice.",
          correct: true,
        },
        {
          id: "iu2",
          text: "Only heat clay — there is no ice here.",
          correct: false,
          holdOn: "Hold on… radar sees glacier-like ice tens of metres down. Dig.",
        },
        {
          id: "iu3",
          text: "Skip mining; rain will fill the tanks.",
          correct: false,
          holdOn: "Hold on… Mars has no rain. Ice or ship it.",
        },
      ],
      arcadia: [
        {
          id: "ia1",
          text: "Arcadia has shallow dirty ice. Mine it for drink, air, and fuel hydrogen.",
          correct: true,
        },
        {
          id: "ia2",
          text: "Build only on the rim where there is no ice.",
          correct: false,
          holdOn: "Hold on… the ice is the prize. Pick a smooth ice patch.",
        },
        {
          id: "ia3",
          text: "Ice is only at the south pole.",
          correct: false,
          holdOn: "Hold on… mid-latitude ice sheets are widespread here.",
        },
      ],
      boreum: [
        {
          id: "ib1",
          text: "Scoop the polar cap in summer. Watch the season clock in winter.",
          correct: true,
        },
        {
          id: "ib2",
          text: "Solar alone will melt all the ice you need year-round.",
          correct: false,
          holdOn: "Hold on… polar night lasts months. Plan power and mining seasons.",
        },
        {
          id: "ib3",
          text: "There is no water ice at the pole — only dry CO₂ snow.",
          correct: false,
          holdOn: "Hold on… the residual polar caps hold water ice under seasonal CO₂ frost.",
        },
      ],
      hellas: [
        {
          id: "ih1",
          text: "Hellas is deep and dusty. Hunt frost and margin ice; lean on nuclear power.",
          correct: true,
        },
        {
          id: "ih2",
          text: "Ice is guaranteed under every rock here.",
          correct: false,
          holdOn: "Hold on… ice is less sure than Utopia. Plan for frost and margins.",
        },
        {
          id: "ih3",
          text: "Skip ice — the thick air is drinkable.",
          correct: false,
          holdOn: "Hold on… thick air helps the chute, not your lungs. Still mostly CO₂.",
        },
      ],
    },
    exitTicket: [
      {
        q: "Why mine ice instead of shipping water?",
        choices: ["Shipping water ships hydrogen you already have in the ground", "Ice looks pretty", "It is free Wi-Fi"],
        answer: 0,
      },
      {
        q: "2 H₂O electrolysis makes…",
        choices: ["2 H₂ + O₂", "Only CO₂", "Only methane"],
        answer: 0,
      },
    ],
    field: {
      kind: "ice",
      title: "Open the ice mine",
      hint: "Drag the drill to the right depth — or heat clay at Jezero/Oxia.",
      success: "Water bank open. Drink, air, and fuel hydrogen unlocked.",
    },
    rxp: { whyFirstTry: 15, library: 20, field: 25, siteBonus: 10 },
  },
  {
    stepId: "air",
    label: "AIR",
    gloss: "Split Mars CO₂ into the oxygen we breathe",
    whyCards: [
      {
        id: "a1",
        text: "Run MOXIE-class cells: heat ceramic, split CO₂, tank the O₂.",
        correct: true,
      },
      {
        id: "a2",
        text: "Just open a window — Mars air is almost breathable.",
        correct: false,
        holdOn: "Hold on… Mars air is ~95% CO₂. You split it; you do not breathe it.",
      },
      {
        id: "a3",
        text: "Grow plants first; skip the mechanical plant.",
        correct: false,
        holdOn: "Hold on… plants are a bonus. Three crew need kilograms of O₂ a day from day one.",
      },
    ],
    exitTicket: [
      {
        q: "Mars air is mostly…",
        choices: ["CO₂", "oxygen", "nitrogen"],
        answer: 0,
      },
      {
        q: "MOXIE makes oxygen by…",
        choices: ["splitting CO₂", "melting ice", "growing plants"],
        answer: 0,
      },
    ],
    field: {
      kind: "air",
      title: "Scale the oxygen plant",
      hint: "Spin the compressor and heat the cell to ~800 °C. Watch the O₂ tank fill.",
      success: "O₂ tanks climbing. Crew can breathe without Earth crates.",
    },
    rxp: { whyFirstTry: 15, library: 20, field: 25 },
  },
  {
    stepId: "pressure",
    label: "HOME",
    gloss: "A hall with safe mixed air — not pure oxygen",
    whyCards: [
      {
        id: "h1",
        text: "Mix O₂ with argon/nitrogen from Mars air. Pure O₂ is a fire risk.",
        correct: true,
      },
      {
        id: "h2",
        text: "Fill with pure oxygen at Earth pressure — simplest chemistry.",
        correct: false,
        holdOn: "Hold on… pure O₂ turns one spark into a fire. Dilute it.",
      },
      {
        id: "h3",
        text: "Leave the hall unpressurized; suits are enough forever.",
        correct: false,
        holdOn: "Hold on… a town needs a place to take the helmet off.",
      },
    ],
    exitTicket: [
      {
        q: "Why dilute cabin oxygen?",
        choices: ["Fire risk of pure O₂", "It tastes better", "To save money on tanks only"],
        answer: 0,
      },
      {
        q: "Mars air buffer gases you can sieve include…",
        choices: ["N₂ and Ar", "Only pure O₂", "Liquid methane"],
        answer: 0,
      },
    ],
    field: {
      kind: "hall",
      title: "Pressurize the hall",
      hint: "Mix O₂ with Mars leftover air. Keep the fire-risk meter out of the red.",
      success: "Hall holds pressure. Helmets can come off inside.",
    },
    rxp: { whyFirstTry: 15, library: 20, field: 25 },
  },
  {
    stepId: "shield",
    label: "DIRT",
    gloss: "Two metres of local dirt is a radiation hospital",
    whyCards: [
      {
        id: "d1",
        text: "Pile ~2 m of regolith on the hall. Free mass beats shipping concrete.",
        correct: true,
      },
      {
        id: "d2",
        text: "Leave the shell bare so solar panels on the roof get more light.",
        correct: false,
        holdOn: "Hold on… radiation and micrometeoroids do not care about the view. Bury it.",
      },
      {
        id: "d3",
        text: "Paint the hall lead-colored; that is enough shielding.",
        correct: false,
        holdOn: "Hold on… paint is not mass. Dirt is the cheap blanket.",
      },
    ],
    exitTicket: [
      {
        q: "About how much dirt shields a Mars hall?",
        choices: ["~2 metres", "2 centimetres", "None — Mars has a thick ozone layer"],
        answer: 0,
      },
      {
        q: "Why use local dirt?",
        choices: ["Mass from Earth is expensive; dirt is free", "Dirt is magnetic", "It grows faster"],
        answer: 0,
      },
    ],
    field: {
      kind: "shield",
      title: "Bury the hall",
      hint: "Scoop dirt onto the hall until the radiation bar leaves the red.",
      success: "Buried. Dose drops. Storm shutters ready.",
    },
    rxp: { whyFirstTry: 15, library: 20, field: 25 },
  },
  {
    stepId: "green",
    label: "FOOD",
    gloss: "Plants eat CO₂, give O₂ and salad — a bonus loop",
    whyCards: [
      {
        id: "g1",
        text: "Grow a small bay for food and morale. Plants are a bonus, not the main O₂ plant.",
        correct: true,
      },
      {
        id: "g2",
        text: "Replace MOXIE entirely with a forest of lettuce.",
        correct: false,
        holdOn: "Hold on… plants fail slow and need care. Keep the mechanical plant.",
      },
      {
        id: "g3",
        text: "Skip plants — tablets are enough forever.",
        correct: false,
        holdOn: "Hold on… crew need real food and a green loop for the long haul.",
      },
    ],
    exitTicket: [
      {
        q: "Photosynthesis takes in CO₂ and gives back…",
        choices: ["O₂ (and sugar)", "Only methane", "Only dust"],
        answer: 0,
      },
      {
        q: "Is the greenhouse the main oxygen plant?",
        choices: ["No — it is a bonus beside MOXIE/electrolysis", "Yes — turn off MOXIE", "Only at night"],
        answer: 0,
      },
    ],
    field: {
      kind: "green",
      title: "Grow the first calories",
      hint: "Aim the sun lamp. Watch CO₂ go in and a leaf + tiny O₂ bubble come out.",
      success: "First leaves. Salad and a little extra O₂.",
    },
    rxp: { whyFirstTry: 15, library: 20, field: 25 },
  },
  {
    stepId: "loop",
    label: "WATER",
    gloss: "Close the loop or plan a drought between windows",
    whyCards: [
      {
        id: "w1",
        text: "Filter cabin, wash, and waste water. Launch windows are ~26 months apart.",
        correct: true,
      },
      {
        id: "w2",
        text: "Dump grey water outside — Mars will recycle it as rain.",
        correct: false,
        holdOn: "Hold on… no rain. A leaky loop is a planned drought.",
      },
      {
        id: "w3",
        text: "Only drink shipped bottles; ignore the pipes.",
        correct: false,
        holdOn: "Hold on… bottles run out. Close the loop.",
      },
    ],
    exitTicket: [
      {
        q: "Mars cargo windows open about every…",
        choices: ["26 months", "26 days", "26 years"],
        answer: 0,
      },
      {
        q: "A closed water loop means…",
        choices: ["Almost no water leaves the base", "You open the hatch when it rains", "You only use ice once"],
        answer: 0,
      },
    ],
    field: {
      kind: "loop",
      title: "Close water and waste",
      hint: "Connect cabin / wash / waste pipes into the filter. Fix the leaky joint.",
      success: "Loop closed. Days-until-drought clock stops climbing.",
    },
    rxp: { whyFirstTry: 15, library: 20, field: 25 },
  },
  {
    stepId: "brick",
    label: "BRICKS",
    gloss: "Local walls so the next hall is not an Earth crate",
    whyCards: [
      {
        id: "b1",
        text: "Sinter dirt or use sulfur concrete. The second building should be local mass.",
        correct: true,
      },
      {
        id: "b2",
        text: "Wait for every wall to ship from Earth.",
        correct: false,
        holdOn: "Hold on… mass from Earth is the tax. Local rock is free.",
      },
      {
        id: "b3",
        text: "3D-print plastic from the lander seats only.",
        correct: false,
        holdOn: "Hold on… that runs out. Bake the dirt.",
      },
    ],
    exitTicket: [
      {
        q: "Why bake local bricks?",
        choices: ["So the next hall is not a crate from Earth", "Bricks are lighter than air", "For decoration only"],
        answer: 0,
      },
      {
        q: "Sintering means…",
        choices: ["Heating grains until they stick", "Freezing water into blocks", "Painting rocks"],
        answer: 0,
      },
    ],
    field: {
      kind: "brick",
      title: "Bake bricks and metal",
      hint: "Hold-to-heat a dirt pile. Drop a second hall that is not a crate.",
      success: "Local wall up. Civilization starts when building #2 is home-made.",
    },
    rxp: { whyFirstTry: 15, library: 20, field: 25 },
  },
  {
    stepId: "fuel",
    label: "FUEL",
    gloss: "Sabatier: ice hydrogen + air CO₂ → methane home ticket",
    whyCards: [
      {
        id: "f1",
        text: "Drag H₂ from ice and CO₂ from air into a ~400 °C Sabatier pot. Tank CH₄.",
        correct: true,
      },
      {
        id: "f2",
        text: "Ship the entire return propellant from Earth — simpler.",
        correct: false,
        holdOn: "Hold on… that is the expensive one-way plan. Cook fuel on Mars.",
      },
      {
        id: "f3",
        text: "Burn the greenhouse plants for methane.",
        correct: false,
        holdOn: "Hold on… Sabatier uses CO₂ + H₂, not salad.",
      },
    ],
    exitTicket: [
      {
        q: "Sabatier needs which two inputs?",
        choices: ["CO₂ + H₂", "Only pure oxygen", "Only sunlight"],
        answer: 0,
      },
      {
        q: "Where does the hydrogen come from on Mars?",
        choices: ["Electrolysis of ice/water", "The solar wind alone", "Opening the hatch"],
        answer: 0,
      },
    ],
    field: {
      kind: "fuel",
      title: "Make methane for the ride home",
      hint: "Feed H₂ + CO₂ into the 400 °C pot. Watch CH₄ and recycle water.",
      success: "Methane tanked. Return ticket is local now.",
    },
    rxp: { whyFirstTry: 15, library: 20, field: 25, siteBonus: 10 },
  },
];

export function layerV2ForStep(stepId: string): CivLayerV2 | undefined {
  return CIV_LAYERS_V2.find((l) => l.stepId === stepId);
}

export function whyCardsFor(layer: CivLayerV2, siteId: MarsSiteId | null | undefined): WhyCard[] {
  if (siteId && layer.whyBySite?.[siteId]) return layer.whyBySite[siteId]!;
  return layer.whyCards;
}
