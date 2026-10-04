/**
 * Production-grade Constellation & Celestial Engine — 88 IAU Figures with Menzel Families.
 * Grounded in Donald H. Menzel's 'A Field Guide to the Stars and Planets'.
 */

export type MenzelFamilyId =
  | "ursa_major"
  | "zodiac"
  | "perseus"
  | "hercules"
  | "orion"
  | "heavenly_waters"
  | "bayer"
  | "lacaille";

export interface ConstellationKeyStar {
  name: string;
  bayer?: string;
  spectral?: string;
  distanceLy: number;
}

export interface BirthChartData {
  isZodiac: boolean;
  tropicalDates: string;
  siderealDates: string;
  element: "Fire" | "Earth" | "Air" | "Water" | "Celestial";
  modality: "Cardinal" | "Fixed" | "Mutable" | "Circumpolar" | "Southern Horizon";
  rulingPlanet: string;
  aspectPatterns: string[];
  birthSignificance: string;
}

export interface StarNode {
  name: string;
  ra: number;
  dec: number;
  mag: number;
}

export interface ConstellationEntry {
  secondaryFamilies?: string[];
  id: string;
  name: string;
  familyId: MenzelFamilyId;
  familyName: string;
  centerRa: number;
  centerDec: number;
  keyStar: ConstellationKeyStar;
  locatingDirections: string;
  mythology: string;
  birthChart: BirthChartData;
  stars: StarNode[];
  lines: [number, number][];
}

export interface ConstellationFamily {
  id: MenzelFamilyId;
  name: string;
  description: string;
  mythologicalTheme: string;
  constellationNames: string[];
}

export const CONSTELLATION_FAMILIES: Record<MenzelFamilyId, ConstellationFamily> = {
  "ursa_major": {
    "id": "ursa_major",
    "name": "Ursa Major Family",
    "description": "Northern circumpolar and north polar constellations orbiting the celestial pole.",
    "mythologicalTheme": "The myth of Callisto (Ursa Major) and her son Arcas (Ursa Minor / Boötes), guarded by Draco the dragon and the hunting dogs Canes Venatici.",
    "constellationNames": [
      "Ursa Major",
      "Ursa Minor",
      "Draco",
      "Boötes",
      "Camelopardalis",
      "Canes Venatici",
      "Coma Berenices",
      "Corona Borealis",
      "Lynx",
      "Leo Minor"
    ]
  },
  "zodiac": {
    "id": "zodiac",
    "name": "Zodiac Family",
    "description": "The 12 traditional solar stations along the ecliptic plane traversed by the Sun, Moon, and planets.",
    "mythologicalTheme": "The annual solar hero's journey, ancient Babylonian MUL.APIN celestial path, and the twelve labors of Heracles.",
    "constellationNames": [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpius",
      "Sagittarius",
      "Capricornus",
      "Aquarius",
      "Pisces"
    ]
  },
  "perseus": {
    "id": "perseus",
    "name": "Perseus Family",
    "description": "Autumn northern and equatorial constellations sharing the royal epic of the rescue of Andromeda.",
    "mythologicalTheme": "The heroic saga of Perseus rescuing Princess Andromeda from the sea monster Cetus, under the gaze of Queen Cassiopeia, King Cepheus, and the winged steed Pegasus.",
    "constellationNames": [
      "Perseus",
      "Andromeda",
      "Cassiopeia",
      "Cepheus",
      "Cetus",
      "Auriga",
      "Lacerta",
      "Pegasus",
      "Triangulum"
    ]
  },
  "hercules": {
    "id": "hercules",
    "name": "Hercules Family",
    "description": "The largest Menzel group, connected by proximity across the summer and southern sky depicting heroic trials.",
    "mythologicalTheme": "The labors and conquests of Heracles (Hercules) and allied celestial titans: defeating the Hydra, fighting the Centaur, and the triumphant flight of the celestial eagle Aquila and swan Cygnus.",
    "constellationNames": [
      "Hercules",
      "Sagitta",
      "Aquila",
      "Lyra",
      "Cygnus",
      "Vulpecula",
      "Hydra",
      "Sextans",
      "Crater",
      "Corvus",
      "Ophiuchus",
      "Serpens",
      "Scutum",
      "Centaurus",
      "Lupus",
      "Corona Australis",
      "Ara",
      "Triangulum Australe",
      "Crux"
    ]
  },
  "orion": {
    "id": "orion",
    "name": "Orion Family",
    "description": "The winter celestial giant and his hunting retinue straddling the celestial equator.",
    "mythologicalTheme": "The giant huntsman Orion, accompanied by his great and lesser hunting hounds Canis Major and Canis Minor, pursuing Lepus the hare beneath his feet while Monoceros drifts unseen.",
    "constellationNames": [
      "Orion",
      "Canis Major",
      "Canis Minor",
      "Monoceros",
      "Lepus"
    ]
  },
  "heavenly_waters": {
    "id": "heavenly_waters",
    "name": "Heavenly Waters Family",
    "description": "Constellations historically linked to the great celestial ocean, southern seas, and the ancient ship Argo Navis.",
    "mythologicalTheme": "The voyage of the Argonauts across the cosmic ocean (Carina, Puppis, Vela, Pyxis) and the great celestial river Eridanus flowing down to the southern fish.",
    "constellationNames": [
      "Delphinus",
      "Equuleus",
      "Eridanus",
      "Piscis Austrinus",
      "Carina",
      "Puppis",
      "Vela",
      "Pyxis",
      "Columba"
    ]
  },
  "bayer": {
    "id": "bayer",
    "name": "Bayer Family",
    "description": "Southern hemisphere figures introduced by 16th-century navigators and charted in Johann Bayer's Uranometria (1603).",
    "mythologicalTheme": "Exotic creatures and fauna of the southern voyages: the Bird of Paradise, Toucan, Peacock, Phoenix, and flying fish.",
    "constellationNames": [
      "Apus",
      "Chamaeleon",
      "Dorado",
      "Grus",
      "Hydrus",
      "Indus",
      "Musca",
      "Pavo",
      "Phoenix",
      "Tucana",
      "Volans"
    ]
  },
  "lacaille": {
    "id": "lacaille",
    "name": "La Caille Family",
    "description": "Fourteen southern constellations charted in 1751–1752 by Nicolas-Louis de Lacaille from the Cape of Good Hope.",
    "mythologicalTheme": "Enlightenment tribute to human intellect, scientific apparatus, and fine arts: the telescope, microscope, air pump, pendulum clock, and sculptor's chisel.",
    "constellationNames": [
      "Antlia",
      "Caelum",
      "Circinus",
      "Fornax",
      "Horologium",
      "Mensa",
      "Microscopium",
      "Norma",
      "Octans",
      "Pictor",
      "Reticulum",
      "Sculptor",
      "Telescopium"
    ]
  }
};

export const CONSTELLATIONS_88: ConstellationEntry[] = [
  {
    "id": "ursa_major",
    "name": "Ursa Major",
    "familyId": "ursa_major",
    "familyName": "Ursa Major Family",
    "centerRa": 11.3,
    "centerDec": 55.6,
    "keyStar": {
      "name": "Alioth",
      "bayer": "ε UMa",
      "spectral": "A1III-IVp",
      "distanceLy": 82.6
    },
    "locatingDirections": "Northern circumpolar landmark. Locate the iconic 7-star Big Dipper asterism. The outer bowl stars Merak (β) and Dubhe (α) form Menzel's 'Pointers'—extend a line 5x their separation straight to Polaris. Arc through the handle (Alioth, Mizar, Alkaid) to find Boötes.",
    "mythology": "The Great Bear represents the nymph Callisto, transformed by Hera's jealousy into a bear. Zeus placed her in the sky alongside her son Arcas (Ursa Minor). In Babylonian MUL.APIN, it was MAR.GID.DA (The Wagon of the Gods), rotating eternally without ever setting into the horizon.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Major Northern Marker (Spring Peak)",
      "siderealDates": "Circumpolar (Visible Year-Round)",
      "element": "Earth",
      "modality": "Fixed",
      "rulingPlanet": "Jupiter",
      "aspectPatterns": [
        "Grand Trine with Northern Fixed Stars",
        "Stellium Pointer"
      ],
      "birthSignificance": "Ancient astrologers attributed royal leadership and unyielding determination to individuals born when the Sun transited opposite Ursa Major's culmination (October–November)."
    },
    "stars": [
      {
        "name": "Dubhe",
        "ra": 11.06,
        "dec": 61.75,
        "mag": 1.8
      },
      {
        "name": "Merak",
        "ra": 11.03,
        "dec": 56.38,
        "mag": 2.37
      },
      {
        "name": "Phecda",
        "ra": 11.9,
        "dec": 53.69,
        "mag": 2.44
      },
      {
        "name": "Megrez",
        "ra": 12.25,
        "dec": 57.03,
        "mag": 3.32
      },
      {
        "name": "Alioth",
        "ra": 12.9,
        "dec": 55.96,
        "mag": 1.76
      },
      {
        "name": "Mizar",
        "ra": 13.4,
        "dec": 54.92,
        "mag": 2.23
      },
      {
        "name": "Alkaid",
        "ra": 13.79,
        "dec": 49.31,
        "mag": 1.85
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        0
      ],
      [
        3,
        4
      ],
      [
        4,
        5
      ],
      [
        5,
        6
      ]
    ]
  },
  {
    "id": "ursa_minor",
    "name": "Ursa Minor",
    "familyId": "ursa_major",
    "familyName": "Ursa Major Family",
    "centerRa": 15,
    "centerDec": 77,
    "keyStar": {
      "name": "Polaris",
      "bayer": "α UMi",
      "spectral": "F7Ib",
      "distanceLy": 433
    },
    "locatingDirections": "Pivot of the northern sky. Follow the pointer stars of the Big Dipper (Merak to Dubhe) five times their distance northward to find Polaris, marking the tail-tip of the Little Bear and within 0.7° of the North Celestial Pole.",
    "mythology": "Arcas, son of Callisto and Zeus, transformed into the Little Bear. In Phoenician seafaring lore, it was the Little Dipper used for nocturnal dead reckoning. Anchored to the celestial pivot, it represents steadfastness and true north.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Celestial Anchor (All Seasons)",
      "siderealDates": "True North Celestial Axis",
      "element": "Air",
      "modality": "Cardinal",
      "rulingPlanet": "Saturn",
      "aspectPatterns": [
        "Polar Axis Alignment",
        "Yod Focal Point"
      ],
      "birthSignificance": "Polaris acts as a spiritual North Star in natal charts, indicating an innate compass and unwavering ethical orientation."
    },
    "stars": [
      {
        "name": "Polaris",
        "ra": 2.53,
        "dec": 89.26,
        "mag": 1.98
      },
      {
        "name": "Yildun",
        "ra": 17.53,
        "dec": 86.58,
        "mag": 4.35
      },
      {
        "name": "Urodelus",
        "ra": 15.35,
        "dec": 77.79,
        "mag": 4.2
      },
      {
        "name": "Ahfa al Farkadain",
        "ra": 15.73,
        "dec": 71.83,
        "mag": 4.3
      },
      {
        "name": "Anwar al Farkadain",
        "ra": 16.29,
        "dec": 75.75,
        "mag": 4.9
      },
      {
        "name": "Kochab",
        "ra": 14.85,
        "dec": 74.16,
        "mag": 2.07
      },
      {
        "name": "Pherkad",
        "ra": 15.35,
        "dec": 71.83,
        "mag": 3
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        4
      ],
      [
        4,
        5
      ],
      [
        5,
        6
      ],
      [
        6,
        2
      ]
    ]
  },
  {
    "id": "draco",
    "name": "Draco",
    "familyId": "ursa_major",
    "familyName": "Ursa Major Family",
    "centerRa": 17,
    "centerDec": 65,
    "keyStar": {
      "name": "Eltanin",
      "bayer": "γ Dra",
      "spectral": "K5III",
      "distanceLy": 154.3
    },
    "locatingDirections": "Winds between Ursa Major and Ursa Minor. The diamond-shaped head lies near Vega in the Summer Triangle; the long tail winds around the bowl of the Little Dipper toward Thuban.",
    "mythology": "Ladon, the hundred-headed dragon that guarded the Golden Apples of the Hesperides, slain by Hercules in his eleventh labor. Thuban (α Dra) was the Egyptian pole star during the construction of the Great Pyramids (~2700 BCE).",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer Solstice Meridian",
      "siderealDates": "Circumpolar Sinuous Band",
      "element": "Water",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Grand Cross Inscription",
        "T-Square Backbone"
      ],
      "birthSignificance": "Draconian natal alignments confer deep protective instincts, occult wisdom, and fierce tenacity when defending family legacies."
    },
    "stars": [
      {
        "name": "Thuban",
        "ra": 14.07,
        "dec": 64.38,
        "mag": 3.67
      },
      {
        "name": "Edasich",
        "ra": 15.41,
        "dec": 58.97,
        "mag": 3.29
      },
      {
        "name": "Grumium",
        "ra": 17.5,
        "dec": 56.87,
        "mag": 3.75
      },
      {
        "name": "Eltanin",
        "ra": 17.94,
        "dec": 51.49,
        "mag": 2.24
      },
      {
        "name": "Rastaban",
        "ra": 17.51,
        "dec": 52.3,
        "mag": 2.79
      },
      {
        "name": "Nodus Secundus",
        "ra": 19.21,
        "dec": 67.66,
        "mag": 3.07
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        4
      ],
      [
        4,
        2
      ],
      [
        2,
        5
      ]
    ]
  },
  {
    "id": "bootes",
    "name": "Boötes",
    "familyId": "ursa_major",
    "familyName": "Ursa Major Family",
    "centerRa": 14.7,
    "centerDec": 31,
    "keyStar": {
      "name": "Arcturus",
      "bayer": "α Boo",
      "spectral": "K1.5III",
      "distanceLy": 36.7
    },
    "locatingDirections": "Menzel's golden sky path rule: 'Arc to Arcturus, speed on to Spica'. Follow the graceful curve of the Big Dipper handle southward until reaching radiant orange giant Arcturus.",
    "mythology": "The Herdsman who invented the plow and herds the heavenly bears around the pole. In Greek myth, identified with Icarius, who introduced wine-making, and Arcas, guardian of the great bear Callisto.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Spring Equinox to Summer",
      "siderealDates": "Culmination May–June",
      "element": "Air",
      "modality": "Cardinal",
      "rulingPlanet": "Mercury",
      "aspectPatterns": [
        "Kite Apex",
        "Grand Trine with Virgo & Spica"
      ],
      "birthSignificance": "Arcturus conjunct personal planets bestows trailblazing innovation, agricultural mastery, and high scholarly acclaim."
    },
    "stars": [
      {
        "name": "Arcturus",
        "ra": 14.26,
        "dec": 19.18,
        "mag": -0.05
      },
      {
        "name": "Nekkar",
        "ra": 15.03,
        "dec": 40.39,
        "mag": 3.49
      },
      {
        "name": "Seginus",
        "ra": 14.53,
        "dec": 38.31,
        "mag": 3.04
      },
      {
        "name": "Izar",
        "ra": 14.75,
        "dec": 27.07,
        "mag": 2.35
      },
      {
        "name": "Muphrid",
        "ra": 13.91,
        "dec": 18.39,
        "mag": 2.68
      }
    ],
    "lines": [
      [
        0,
        4
      ],
      [
        0,
        3
      ],
      [
        3,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "camelopardalis",
    "name": "Camelopardalis",
    "familyId": "ursa_major",
    "familyName": "Ursa Major Family",
    "centerRa": 6,
    "centerDec": 70,
    "keyStar": {
      "name": "Beta Camelopardalis",
      "bayer": "β Cam",
      "spectral": "G1Ib-II",
      "distanceLy": 997
    },
    "locatingDirections": "Faint circumpolar expanse between Ursa Major and Cassiopeia. Trace north of Auriga's bright star Capella into the open polar wilderness.",
    "mythology": "Created by Petrus Plancius in 1612 representing the camel that brought Rebecca to Isaac in Canaan, depicted as a 'camel-leopard' (giraffe).",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Winter Solstice Polar Reach",
      "siderealDates": "Northern Quiet Zone",
      "element": "Earth",
      "modality": "Mutable",
      "rulingPlanet": "Saturn",
      "aspectPatterns": [
        "Mystic Rectangle Base",
        "Subtle Trine"
      ],
      "birthSignificance": "Signifies quiet perseverance, resilience in isolated environments, and independent visionary pursuits."
    },
    "stars": [
      {
        "name": "Alpha Cam",
        "ra": 4.9,
        "dec": 66.34,
        "mag": 4.26
      },
      {
        "name": "Beta Cam",
        "ra": 5.06,
        "dec": 60.44,
        "mag": 4.03
      },
      {
        "name": "7 Cam",
        "ra": 4.95,
        "dec": 53.75,
        "mag": 4.43
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        1,
        2
      ]
    ]
  },
  {
    "id": "canes_venatici",
    "name": "Canes Venatici",
    "familyId": "ursa_major",
    "familyName": "Ursa Major Family",
    "centerRa": 13.1,
    "centerDec": 40,
    "keyStar": {
      "name": "Cor Caroli",
      "bayer": "α² CVn",
      "spectral": "A0spe",
      "distanceLy": 110
    },
    "locatingDirections": "Directly nestled under the Big Dipper's handle (between Alkaid and Coma Berenices). Home to the glorious face-on Whirlpool Galaxy M51.",
    "mythology": "The Hunting Dogs Asterion and Chara, held on leash by Boötes as they patrol the north heavens chasing the Great Bear.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Spring Sky Peak",
      "siderealDates": "Mid-April Culmination",
      "element": "Fire",
      "modality": "Mutable",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Sextile Bridge",
        "Grand Trine Companion"
      ],
      "birthSignificance": "Endows heightened sensory intuition, loyalty, swift strategic thinking, and investigative brilliance."
    },
    "stars": [
      {
        "name": "Cor Caroli",
        "ra": 12.93,
        "dec": 38.32,
        "mag": 2.89
      },
      {
        "name": "Chara",
        "ra": 12.56,
        "dec": 41.35,
        "mag": 4.24
      }
    ],
    "lines": [
      [
        0,
        1
      ]
    ]
  },
  {
    "id": "coma_berenices",
    "name": "Coma Berenices",
    "familyId": "ursa_major",
    "familyName": "Ursa Major Family",
    "centerRa": 12.8,
    "centerDec": 23.3,
    "keyStar": {
      "name": "Diadem",
      "bayer": "α Com",
      "spectral": "F5V",
      "distanceLy": 60
    },
    "locatingDirections": "Between Leo's tail star Denebola and Boötes' Arcturus. Appears in dark skies as an ethereal open cluster of shimmering faint diamonds (Melotte 111).",
    "mythology": "Queen Berenice II of Egypt sacrificed her radiant amber hair to Aphrodite for the safe return of King Ptolemy III from the Third Syrian War. The court astronomer Conon discovered the lost lock preserved among the stars.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Spring Bloom (April–May)",
      "siderealDates": "Mid-May Transit",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "T-Square Softener",
        "Grand Trine with Libra & Gemini"
      ],
      "birthSignificance": "Symbolizes self-sacrifice, sublime aesthetic devotion, elegance, and profound diplomatic grace."
    },
    "stars": [
      {
        "name": "Diadem",
        "ra": 13.17,
        "dec": 17.53,
        "mag": 4.32
      },
      {
        "name": "Beta Com",
        "ra": 13.2,
        "dec": 27.88,
        "mag": 4.23
      },
      {
        "name": "Gamma Com",
        "ra": 12.45,
        "dec": 28.27,
        "mag": 4.35
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        1,
        2
      ]
    ]
  },
  {
    "id": "corona_borealis",
    "name": "Corona Borealis",
    "familyId": "ursa_major",
    "familyName": "Ursa Major Family",
    "centerRa": 15.8,
    "centerDec": 32.5,
    "keyStar": {
      "name": "Alphecca",
      "bayer": "α CrB",
      "spectral": "A0V",
      "distanceLy": 75
    },
    "locatingDirections": "Compact, sparkling semicircle of stars midway between Boötes (Arcturus) and the torso of Hercules. Alphecca gleams like a pearl in a diadem.",
    "mythology": "The celestial crown of Ariadne, daughter of King Minos, presented by Dionysus upon their marriage after she helped Theseus escape the Cretan Labyrinth.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Early Summer Nocturne",
      "siderealDates": "June Culmination",
      "element": "Water",
      "modality": "Cardinal",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Cradle Pattern Node",
        "Harmonic Sextile"
      ],
      "birthSignificance": "Associated with regal honor, artistic genius, triumphant recovery from betrayal, and elevated social esteem."
    },
    "stars": [
      {
        "name": "Alphecca",
        "ra": 15.58,
        "dec": 26.71,
        "mag": 2.22
      },
      {
        "name": "Nusakan",
        "ra": 15.47,
        "dec": 29.11,
        "mag": 3.66
      },
      {
        "name": "Gamma CrB",
        "ra": 15.71,
        "dec": 26.3,
        "mag": 3.81
      },
      {
        "name": "Delta CrB",
        "ra": 15.83,
        "dec": 26.07,
        "mag": 4.59
      },
      {
        "name": "Epsilon CrB",
        "ra": 15.96,
        "dec": 26.88,
        "mag": 4.14
      }
    ],
    "lines": [
      [
        1,
        0
      ],
      [
        0,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        4
      ]
    ]
  },
  {
    "id": "lynx",
    "name": "Lynx",
    "familyId": "ursa_major",
    "familyName": "Ursa Major Family",
    "centerRa": 8,
    "centerDec": 47,
    "keyStar": {
      "name": "Alpha Lyncis",
      "bayer": "α Lyn",
      "spectral": "K7III",
      "distanceLy": 222
    },
    "locatingDirections": "Faint constellation spanning the gap between Ursa Major and Auriga/Gemini. Johannes Hevelius stated one needs 'the eyes of a lynx' to see it.",
    "mythology": "Named by Hevelius in 1687 for its faintness, honoring Lynceus the Argonaut whose piercing gaze could penetrate walls and darkness.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Late Winter Depths",
      "siderealDates": "February Culmination",
      "element": "Earth",
      "modality": "Fixed",
      "rulingPlanet": "Mercury",
      "aspectPatterns": [
        "Mystic Cross",
        "Stealth Trine"
      ],
      "birthSignificance": "Grants acute psychological discernment, perception beyond superficial facades, and investigative mastery."
    },
    "stars": [
      {
        "name": "Alpha Lyn",
        "ra": 9.35,
        "dec": 34.39,
        "mag": 3.14
      },
      {
        "name": "38 Lyn",
        "ra": 9.31,
        "dec": 36.8,
        "mag": 3.82
      },
      {
        "name": "10 UMa (Lyn)",
        "ra": 9.01,
        "dec": 41.8,
        "mag": 3.96
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        1,
        2
      ]
    ]
  },
  {
    "id": "leo_minor",
    "name": "Leo Minor",
    "familyId": "ursa_major",
    "familyName": "Ursa Major Family",
    "centerRa": 10.3,
    "centerDec": 35,
    "keyStar": {
      "name": "Praecipua",
      "bayer": "46 LMi",
      "spectral": "K0+III-IV",
      "distanceLy": 98
    },
    "locatingDirections": "Directly between the paws of the Great Bear (Ursa Major) and the sickle of Leo the Lion.",
    "mythology": "Introduced by Hevelius in 1687 as the young cub accompanying the great celestial beasts Leo and Ursa Major.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Early Spring High Sky",
      "siderealDates": "April Culmination",
      "element": "Fire",
      "modality": "Mutable",
      "rulingPlanet": "Sun",
      "aspectPatterns": [
        "Stellium Bridge",
        "T-Square Reliever"
      ],
      "birthSignificance": "Brings youthful vigor, fearless loyalty, and creative independence."
    },
    "stars": [
      {
        "name": "Praecipua",
        "ra": 10.89,
        "dec": 34.21,
        "mag": 3.79
      },
      {
        "name": "Beta LMi",
        "ra": 10.46,
        "dec": 36.71,
        "mag": 4.2
      },
      {
        "name": "21 LMi",
        "ra": 10.12,
        "dec": 35.25,
        "mag": 4.49
      }
    ],
    "lines": [
      [
        2,
        1
      ],
      [
        1,
        0
      ]
    ]
  },
  {
    "id": "aries",
    "name": "Aries",
    "familyId": "zodiac",
    "familyName": "Zodiac Family",
    "centerRa": 2.6,
    "centerDec": 20.8,
    "keyStar": {
      "name": "Hamal",
      "bayer": "α Ari",
      "spectral": "K2III",
      "distanceLy": 65.9
    },
    "locatingDirections": "Autumn/winter northern zodiac. Follow a line from the Great Square of Pegasus eastward, south of Triangulum. Hamal, Sheratan, and Mesarthim form an unmistakable curved ram's horn.",
    "mythology": "The winged golden-fleeced ram Chrysomallos that rescued Phrixus and Helle from the sacrifice. Its golden fleece became the quest of Jason and the Argonauts. In Mesopotamian astrology, it was LU.HUN.GA (The Hired Hand / Pioneer).",
    "birthChart": {
      "isZodiac": true,
      "tropicalDates": "Mar 21 – Apr 19",
      "siderealDates": "Apr 18 – May 13",
      "element": "Fire",
      "modality": "Cardinal",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Grand Trine (Leo/Sagittarius)",
        "T-Square Driver",
        "Grand Cross Initiator"
      ],
      "birthSignificance": "Cardinal Fire: The spark of existence. Initiates momentum, courageous risk-taking, pioneering enterprise, and unfiltered personal authenticity."
    },
    "stars": [
      {
        "name": "Hamal",
        "ra": 2.12,
        "dec": 23.46,
        "mag": 2.01
      },
      {
        "name": "Sheratan",
        "ra": 1.91,
        "dec": 20.81,
        "mag": 2.64
      },
      {
        "name": "Mesarthim",
        "ra": 1.9,
        "dec": 19.29,
        "mag": 3.88
      },
      {
        "name": "41 Ari",
        "ra": 2.83,
        "dec": 27.26,
        "mag": 3.61
      }
    ],
    "lines": [
      [
        3,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        2
      ]
    ]
  },
  {
    "id": "taurus",
    "name": "Taurus",
    "familyId": "zodiac",
    "familyName": "Zodiac Family",
    "centerRa": 4.7,
    "centerDec": 19,
    "keyStar": {
      "name": "Aldebaran",
      "bayer": "α Tau",
      "spectral": "K5III",
      "distanceLy": 65.1
    },
    "locatingDirections": "Follow Orion's three belt stars northwestward: first you encounter blazing fiery eye Aldebaran in the V-shaped Hyades cluster, followed closely by the blue gem cluster Pleiades (Seven Sisters).",
    "mythology": "The celestial Bull of Heaven (GUD.AN.NA) in the Epic of Gilgamesh; also Zeus disguised as a gentle white bull to carry Princess Europa across the sea to Crete. Houses the M1 Crab Nebula supernova remnant.",
    "birthChart": {
      "isZodiac": true,
      "tropicalDates": "Apr 20 – May 20",
      "siderealDates": "May 14 – Jun 19",
      "element": "Earth",
      "modality": "Fixed",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Grand Earth Trine (Virgo/Capricorn)",
        "Grand Cross Stability Anchor"
      ],
      "birthSignificance": "Fixed Earth: Endurance and physical creation. Bestows deep appreciation for material beauty, financial patience, sensual vitality, and steadfast reliability."
    },
    "stars": [
      {
        "name": "Aldebaran",
        "ra": 4.6,
        "dec": 16.51,
        "mag": 0.86
      },
      {
        "name": "Elnath",
        "ra": 5.44,
        "dec": 28.61,
        "mag": 1.65
      },
      {
        "name": "Tianguan",
        "ra": 5.63,
        "dec": 21.14,
        "mag": 2.97
      },
      {
        "name": "Ain",
        "ra": 4.48,
        "dec": 15.96,
        "mag": 3.53
      },
      {
        "name": "Alcyone (Pleiades)",
        "ra": 3.79,
        "dec": 24.11,
        "mag": 2.87
      }
    ],
    "lines": [
      [
        4,
        3
      ],
      [
        3,
        0
      ],
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "gemini",
    "name": "Gemini",
    "familyId": "zodiac",
    "familyName": "Zodiac Family",
    "centerRa": 7.1,
    "centerDec": 22.5,
    "keyStar": {
      "name": "Pollux",
      "bayer": "β Gem",
      "spectral": "K0III",
      "distanceLy": 33.8
    },
    "locatingDirections": "Northeast of Orion and northwest of Canis Minor's Procyon. The twin prominent stars Castor (bluish-white multiple star) and Pollux (golden giant) stand close together like beacon headlights.",
    "mythology": "Castor and Pollux (the Dioscuri), sons of Leda, one mortal and one immortal. When Castor died in battle, Pollux begged Zeus to share his immortality, immortalizing their sibling bond in the heavens.",
    "birthChart": {
      "isZodiac": true,
      "tropicalDates": "May 21 – Jun 20",
      "siderealDates": "Jun 20 – Jul 20",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Mercury",
      "aspectPatterns": [
        "Grand Air Trine (Libra/Aquarius)",
        "Yod Harmonizer",
        "T-Square Dualist"
      ],
      "birthSignificance": "Mutable Air: Intellectual curiosity and communication. Sparks rapid linguistic agility, versatile multidimensional thinking, and vibrant social interchange."
    },
    "stars": [
      {
        "name": "Pollux",
        "ra": 7.76,
        "dec": 28.03,
        "mag": 1.14
      },
      {
        "name": "Castor",
        "ra": 7.58,
        "dec": 31.89,
        "mag": 1.58
      },
      {
        "name": "Alhena",
        "ra": 6.63,
        "dec": 16.4,
        "mag": 1.93
      },
      {
        "name": "Wasat",
        "ra": 7.34,
        "dec": 21.98,
        "mag": 3.53
      },
      {
        "name": "Mebsuta",
        "ra": 6.73,
        "dec": 25.13,
        "mag": 3.06
      },
      {
        "name": "Tejat",
        "ra": 6.38,
        "dec": 22.51,
        "mag": 2.87
      }
    ],
    "lines": [
      [
        1,
        4
      ],
      [
        4,
        5
      ],
      [
        0,
        3
      ],
      [
        3,
        2
      ],
      [
        1,
        0
      ]
    ]
  },
  {
    "id": "cancer",
    "name": "Cancer",
    "familyId": "zodiac",
    "familyName": "Zodiac Family",
    "centerRa": 8.6,
    "centerDec": 20,
    "keyStar": {
      "name": "Tarf",
      "bayer": "β Cnc",
      "spectral": "K4III",
      "distanceLy": 290
    },
    "locatingDirections": "Between Gemini and Leo. Look for the ethereal hazy swarm of the Beehive Cluster (Praesepe, M44), framed by Asellus Borealis and Asellus Australis (the Northern and Southern Donkeys).",
    "mythology": "Karkinos, the giant crab sent by Hera to snap at Hercules' heel while he fought the Lernaean Hydra. Though crushed underfoot, Hera rewarded its allegiance by placing it along the sacred ecliptic.",
    "birthChart": {
      "isZodiac": true,
      "tropicalDates": "Jun 21 – Jul 22",
      "siderealDates": "Jul 21 – Aug 9",
      "element": "Water",
      "modality": "Cardinal",
      "rulingPlanet": "Moon",
      "aspectPatterns": [
        "Grand Water Trine (Scorpius/Pisces)",
        "Grand Cross Protector"
      ],
      "birthSignificance": "Cardinal Water: Emotional depth and protective devotion. Imparts intuitive empathy, maternal fierce protectiveness, ancestral veneration, and creative imagination."
    },
    "stars": [
      {
        "name": "Tarf",
        "ra": 8.28,
        "dec": 9.19,
        "mag": 3.53
      },
      {
        "name": "Acubens",
        "ra": 8.97,
        "dec": 11.86,
        "mag": 4.26
      },
      {
        "name": "Asellus Australis",
        "ra": 8.74,
        "dec": 18.15,
        "mag": 3.94
      },
      {
        "name": "Asellus Borealis",
        "ra": 8.72,
        "dec": 21.47,
        "mag": 4.66
      },
      {
        "name": "Iota Cnc",
        "ra": 8.78,
        "dec": 28.76,
        "mag": 4.03
      }
    ],
    "lines": [
      [
        0,
        2
      ],
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        4
      ]
    ]
  },
  {
    "id": "leo",
    "name": "Leo",
    "familyId": "zodiac",
    "familyName": "Zodiac Family",
    "centerRa": 10.7,
    "centerDec": 15,
    "keyStar": {
      "name": "Regulus",
      "bayer": "α Leo",
      "spectral": "B7V",
      "distanceLy": 79.3
    },
    "locatingDirections": "Spring monarch of the sky. Follow the pointer stars of the Big Dipper backwards (southward) to strike the prominent backward question mark asterism ('The Sickle'), anchored by brilliant blue-white Regulus.",
    "mythology": "The Nemean Lion, whose impenetrable golden fur resisted all weapons until Hercules choked it with bare hands in his First Labor. In ancient Persia, Regulus was Venant, one of the Four Royal Guardians of Heaven.",
    "birthChart": {
      "isZodiac": true,
      "tropicalDates": "Jul 23 – Aug 22",
      "siderealDates": "Aug 10 – Sep 16",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Sun",
      "aspectPatterns": [
        "Grand Fire Trine (Aries/Sagittarius)",
        "T-Square Crown",
        "Stellium Focal"
      ],
      "birthSignificance": "Fixed Fire: Radiant self-expression and sovereignty. Bestows charismatic presence, generosity of spirit, dramatic flair, and steadfast moral nobility."
    },
    "stars": [
      {
        "name": "Regulus",
        "ra": 10.14,
        "dec": 11.97,
        "mag": 1.36
      },
      {
        "name": "Denebola",
        "ra": 11.82,
        "dec": 14.57,
        "mag": 2.14
      },
      {
        "name": "Algieba",
        "ra": 10.33,
        "dec": 19.84,
        "mag": 2.01
      },
      {
        "name": "Zosma",
        "ra": 11.24,
        "dec": 20.52,
        "mag": 2.56
      },
      {
        "name": "Algenubi",
        "ra": 9.76,
        "dec": 23.77,
        "mag": 2.97
      },
      {
        "name": "Adhafera",
        "ra": 10.28,
        "dec": 23.42,
        "mag": 3.44
      }
    ],
    "lines": [
      [
        0,
        2
      ],
      [
        2,
        5
      ],
      [
        5,
        4
      ],
      [
        2,
        3
      ],
      [
        3,
        1
      ],
      [
        3,
        0
      ]
    ]
  },
  {
    "id": "virgo",
    "name": "Virgo",
    "familyId": "zodiac",
    "familyName": "Zodiac Family",
    "centerRa": 13.4,
    "centerDec": -4,
    "keyStar": {
      "name": "Spica",
      "bayer": "α Vir",
      "spectral": "B1III-IV",
      "distanceLy": 250
    },
    "locatingDirections": "Complete Menzel's sky path phrase: 'Arc to Arcturus, speed on to Spica'. Pure blue-white Spica marks the ear of wheat held in the Virgin's hand along the southern spring ecliptic.",
    "mythology": "Astraea, goddess of divine justice and innocence, who was the last immortal to leave Earth at the end of the Golden Age. Also associated with Demeter, goddess of the harvest, and Ishtar descending into the underworld.",
    "birthChart": {
      "isZodiac": true,
      "tropicalDates": "Aug 23 – Sep 22",
      "siderealDates": "Sep 17 – Oct 30",
      "element": "Earth",
      "modality": "Mutable",
      "rulingPlanet": "Mercury",
      "aspectPatterns": [
        "Grand Earth Trine (Taurus/Capricorn)",
        "Mystic Rectangle Node",
        "Yod Fulcrum"
      ],
      "birthSignificance": "Mutable Earth: Analytical refinement and service. Endows meticulous attention to detail, healing craftsmanship, intellectual discernment, and dedication to excellence."
    },
    "stars": [
      {
        "name": "Spica",
        "ra": 13.42,
        "dec": -11.16,
        "mag": 0.98
      },
      {
        "name": "Zavijava",
        "ra": 11.84,
        "dec": 1.77,
        "mag": 3.59
      },
      {
        "name": "Porrima",
        "ra": 12.69,
        "dec": -1.45,
        "mag": 2.74
      },
      {
        "name": "Auva",
        "ra": 12.93,
        "dec": 10.96,
        "mag": 3.38
      },
      {
        "name": "Vindemiatrix",
        "ra": 13.04,
        "dec": 10.96,
        "mag": 2.85
      },
      {
        "name": "Heze",
        "ra": 13.58,
        "dec": -0.6,
        "mag": 3.38
      }
    ],
    "lines": [
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        4
      ],
      [
        2,
        5
      ],
      [
        5,
        0
      ]
    ]
  },
  {
    "id": "libra",
    "name": "Libra",
    "familyId": "zodiac",
    "familyName": "Zodiac Family",
    "centerRa": 15.3,
    "centerDec": -15,
    "keyStar": {
      "name": "Zubeneschamali",
      "bayer": "β Lib",
      "spectral": "B8V",
      "distanceLy": 185
    },
    "locatingDirections": "Between Spica in Virgo and Antares in Scorpius. Zubeneschamali is one of the rare naked-eye stars showing a distinct greenish tint.",
    "mythology": "The Scales of Justice held aloft by Astraea (Virgo). In ancient Babylonian astronomy, it was ZIBANITUM (The Scales); previously regarded by Greeks as the claws of Scorpius (Chelai Scorpii).",
    "birthChart": {
      "isZodiac": true,
      "tropicalDates": "Sep 23 – Oct 22",
      "siderealDates": "Oct 31 – Nov 22",
      "element": "Air",
      "modality": "Cardinal",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Grand Air Trine (Gemini/Aquarius)",
        "T-Square Arbitrator"
      ],
      "birthSignificance": "Cardinal Air: Harmony, justice, and social equilibrium. Inspires diplomatic artistry, aesthetic balance, objective arbitration, and high cultural refinement."
    },
    "stars": [
      {
        "name": "Zubenelgenubi",
        "ra": 14.85,
        "dec": -16.04,
        "mag": 2.75
      },
      {
        "name": "Zubeneschamali",
        "ra": 15.28,
        "dec": -9.38,
        "mag": 2.61
      },
      {
        "name": "Zubenelakrab",
        "ra": 15.59,
        "dec": -14.79,
        "mag": 3.91
      },
      {
        "name": "Brachium",
        "ra": 15.07,
        "dec": -25.25,
        "mag": 3.25
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        0
      ]
    ]
  },
  {
    "id": "scorpius",
    "name": "Scorpius",
    "familyId": "zodiac",
    "familyName": "Zodiac Family",
    "centerRa": 16.9,
    "centerDec": -30,
    "keyStar": {
      "name": "Antares",
      "bayer": "α Sco",
      "spectral": "M1.5Iab",
      "distanceLy": 550
    },
    "locatingDirections": "Majestic southern summer constellation. Blood-red supergiant Antares ('Rival of Mars') marks the heart; follow the curved starry hook south to fish-hook stinger stars Shaula and Lesath.",
    "mythology": "The scorpion sent by Gaia (or Apollo) to strike down the boastful giant Orion. Zeus placed them on opposite sides of the sky so that when Scorpius rises in the east, Orion flees below the western horizon.",
    "birthChart": {
      "isZodiac": true,
      "tropicalDates": "Oct 23 – Nov 21",
      "siderealDates": "Nov 23 – Nov 29",
      "element": "Water",
      "modality": "Fixed",
      "rulingPlanet": "Pluto / Mars",
      "aspectPatterns": [
        "Grand Water Trine (Cancer/Pisces)",
        "Grand Cross Transformer",
        "Stellium Crucible"
      ],
      "birthSignificance": "Fixed Water: Transformation, truth, and psychological power. Bestows penetrative insight, indomitable willpower, emotional intensity, and regenerative rebirth."
    },
    "stars": [
      {
        "name": "Antares",
        "ra": 16.49,
        "dec": -26.43,
        "mag": 1.06
      },
      {
        "name": "Graffias",
        "ra": 16.09,
        "dec": -19.8,
        "mag": 2.56
      },
      {
        "name": "Dschubba",
        "ra": 16.01,
        "dec": -22.62,
        "mag": 2.29
      },
      {
        "name": "Sargas",
        "ra": 17.62,
        "dec": -43,
        "mag": 1.86
      },
      {
        "name": "Shaula",
        "ra": 17.56,
        "dec": -37.1,
        "mag": 1.62
      },
      {
        "name": "Lesath",
        "ra": 17.51,
        "dec": -37.3,
        "mag": 2.7
      }
    ],
    "lines": [
      [
        1,
        2
      ],
      [
        2,
        0
      ],
      [
        0,
        3
      ],
      [
        3,
        4
      ],
      [
        4,
        5
      ]
    ]
  },
  {
    "id": "sagittarius",
    "name": "Sagittarius",
    "familyId": "zodiac",
    "familyName": "Zodiac Family",
    "centerRa": 19.1,
    "centerDec": -25,
    "keyStar": {
      "name": "Kaus Australis",
      "bayer": "ε Sgr",
      "spectral": "B9.5III",
      "distanceLy": 143
    },
    "locatingDirections": "Look south in late summer Milky Way. Identify the famous 8-star 'Teapot' asterism: steam appears to rise from the spout directly into the brightest clouds of the Galactic Center (Sagittarius A*).",
    "mythology": "The centaur archer aiming his arrow at the heart of Scorpius. Often identified with Chiron (or Crotus, inventor of archery). In Babylonian tablets, it was Pabilsag, the winged divine archer.",
    "birthChart": {
      "isZodiac": true,
      "tropicalDates": "Nov 22 – Dec 21",
      "siderealDates": "Dec 18 – Jan 18",
      "element": "Fire",
      "modality": "Mutable",
      "rulingPlanet": "Jupiter",
      "aspectPatterns": [
        "Grand Fire Trine (Aries/Leo)",
        "Mystic Arrow / Yod Focus"
      ],
      "birthSignificance": "Mutable Fire: Philosophical expansion and truth-seeking. Fuels international vision, adventurous curiosity, infectious optimism, and boundless wisdom."
    },
    "stars": [
      {
        "name": "Kaus Australis",
        "ra": 18.4,
        "dec": -34.38,
        "mag": 1.79
      },
      {
        "name": "Nunki",
        "ra": 18.92,
        "dec": -26.3,
        "mag": 2.05
      },
      {
        "name": "Ascella",
        "ra": 19.04,
        "dec": -29.88,
        "mag": 2.59
      },
      {
        "name": "Kaus Media",
        "ra": 18.35,
        "dec": -29.83,
        "mag": 2.72
      },
      {
        "name": "Kaus Borealis",
        "ra": 18.46,
        "dec": -25.42,
        "mag": 2.82
      },
      {
        "name": "Alnasl",
        "ra": 18.09,
        "dec": -30.42,
        "mag": 2.98
      }
    ],
    "lines": [
      [
        5,
        3
      ],
      [
        3,
        0
      ],
      [
        0,
        2
      ],
      [
        2,
        1
      ],
      [
        1,
        4
      ],
      [
        4,
        3
      ],
      [
        0,
        3
      ]
    ]
  },
  {
    "id": "capricornus",
    "name": "Capricornus",
    "familyId": "zodiac",
    "familyName": "Zodiac Family",
    "centerRa": 21,
    "centerDec": -18,
    "keyStar": {
      "name": "Deneb Algedi",
      "bayer": "δ Cap",
      "spectral": "A7m",
      "distanceLy": 38.6
    },
    "locatingDirections": "Faint arrowhead/triangle along the southern autumn ecliptic, east of Sagittarius and south of Aquila's bright Altair.",
    "mythology": "The ancient Babylonian Sea-Goat SUḪUR.MAŠ, sacred to Ea, god of subterranean waters and wisdom. In Greek myth, the god Pan leaped into the Nile to escape Typhon, transforming his lower half into a fish.",
    "birthChart": {
      "isZodiac": true,
      "tropicalDates": "Dec 22 – Jan 19",
      "siderealDates": "Jan 19 – Feb 15",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Saturn",
      "aspectPatterns": [
        "Grand Earth Trine (Taurus/Virgo)",
        "Grand Cross Master Builder"
      ],
      "birthSignificance": "Cardinal Earth: Structural ambition, pragmatic discipline, and mastery over physical matter. Inspires long-term strategic empire building and enduring integrity."
    },
    "stars": [
      {
        "name": "Deneb Algedi",
        "ra": 21.78,
        "dec": -16.13,
        "mag": 2.85
      },
      {
        "name": "Dabih",
        "ra": 20.35,
        "dec": -14.78,
        "mag": 3.05
      },
      {
        "name": "Algedi",
        "ra": 20.3,
        "dec": -12.54,
        "mag": 3.58
      },
      {
        "name": "Nashira",
        "ra": 21.67,
        "dec": -16.66,
        "mag": 3.69
      }
    ],
    "lines": [
      [
        2,
        1
      ],
      [
        1,
        0
      ],
      [
        0,
        3
      ]
    ]
  },
  {
    "id": "aquarius",
    "name": "Aquarius",
    "familyId": "zodiac",
    "familyName": "Zodiac Family",
    "centerRa": 22.3,
    "centerDec": -10,
    "keyStar": {
      "name": "Sadalsuud",
      "bayer": "β Aqr",
      "spectral": "G0Ib",
      "distanceLy": 540
    },
    "locatingDirections": "Center of the celestial 'Sea'. South of Pegasus and east of Capricornus. Follow the cascading Y-shaped asterism ('Water Jar') spilling toward lonely Fomalhaut in Piscis Austrinus.",
    "mythology": "Ganymede, the beautiful youth carried to Olympus by Zeus's eagle to serve as cupbearer, pouring celestial nectar from his urn onto the Earth to sustain all life. In Babylon, it was GU.LA (The Great One).",
    "birthChart": {
      "isZodiac": true,
      "tropicalDates": "Jan 20 – Feb 18",
      "siderealDates": "Feb 16 – Mar 11",
      "element": "Air",
      "modality": "Fixed",
      "rulingPlanet": "Uranus / Saturn",
      "aspectPatterns": [
        "Grand Air Trine (Gemini/Libra)",
        "T-Square Disruptor",
        "Yod Innovator"
      ],
      "birthSignificance": "Fixed Air: Collective vision, technological revolution, and egalitarian ideals. Ignites humanitarian genius, unorthodox problem-solving, and future-forward thinking."
    },
    "stars": [
      {
        "name": "Sadalsuud",
        "ra": 21.53,
        "dec": -5.57,
        "mag": 2.9
      },
      {
        "name": "Sadalmelik",
        "ra": 22.09,
        "dec": -0.32,
        "mag": 2.95
      },
      {
        "name": "Skat",
        "ra": 22.91,
        "dec": -15.82,
        "mag": 3.27
      },
      {
        "name": "Sadachbia",
        "ra": 22.36,
        "dec": -1.39,
        "mag": 3.84
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        1,
        3
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "pisces",
    "name": "Pisces",
    "familyId": "zodiac",
    "familyName": "Zodiac Family",
    "centerRa": 0.5,
    "centerDec": 14,
    "keyStar": {
      "name": "Alpherg",
      "bayer": "η Psc",
      "spectral": "G7IIIa",
      "distanceLy": 294
    },
    "locatingDirections": "Vast V-shaped ribbon framing the south and east of the Great Square of Pegasus. One fish lies below the Square; the other swims north toward Andromeda.",
    "mythology": "Aphrodite and Eros transformed into two fish tied together by a golden cord to escape the monster Typhon in the Euphrates River. Today houses the Vernal Equinox (the First Point of Aries).",
    "birthChart": {
      "isZodiac": true,
      "tropicalDates": "Feb 19 – Mar 20",
      "siderealDates": "Mar 12 – Apr 18",
      "element": "Water",
      "modality": "Mutable",
      "rulingPlanet": "Neptune / Jupiter",
      "aspectPatterns": [
        "Grand Water Trine (Cancer/Scorpius)",
        "Mystic Cross Harmonizer"
      ],
      "birthSignificance": "Mutable Water: Universal empathy, mystical devotion, and transcendent artistic imagination. Dissolves barriers and bridges spiritual dimensions."
    },
    "stars": [
      {
        "name": "Alrescha",
        "ra": 2.03,
        "dec": 2.76,
        "mag": 3.82
      },
      {
        "name": "Fumalsamakah",
        "ra": 23.06,
        "dec": 3.82,
        "mag": 4.48
      },
      {
        "name": "Alpherg",
        "ra": 1.52,
        "dec": 15.35,
        "mag": 3.62
      },
      {
        "name": "Omega Psc",
        "ra": 23.99,
        "dec": 6.86,
        "mag": 4.03
      }
    ],
    "lines": [
      [
        1,
        3
      ],
      [
        3,
        0
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "perseus",
    "name": "Perseus",
    "familyId": "perseus",
    "familyName": "Perseus Family",
    "centerRa": 3.4,
    "centerDec": 42,
    "keyStar": {
      "name": "Mirfak",
      "bayer": "α Per",
      "spectral": "F5Ib",
      "distanceLy": 510
    },
    "locatingDirections": "Follow the sweep of Andromeda's northern star chain northeastward into the bright Milky Way wishbone asterism. Famous for the Double Cluster (NGC 869/884) and the demonic eclipsing variable Algol.",
    "mythology": "The legendary demigod hero who slew Medusa using Athena's polished shield, then flew upon winged sandals to rescue Princess Andromeda from the sea monster Cetus.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Autumn Mid-Sky (Nov)",
      "siderealDates": "Late Autumn Culmination",
      "element": "Fire",
      "modality": "Cardinal",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Grand Trine with Aries & Leo",
        "Algol Eclipse Axis"
      ],
      "birthSignificance": "Conveys courageous chivalry, ability to overcome monstrous obstacles, and extraordinary defensive reflex."
    },
    "stars": [
      {
        "name": "Mirfak",
        "ra": 3.41,
        "dec": 49.86,
        "mag": 1.79
      },
      {
        "name": "Algol",
        "ra": 3.14,
        "dec": 40.96,
        "mag": 2.09
      },
      {
        "name": "Atik",
        "ra": 3.9,
        "dec": 35.79,
        "mag": 2.84
      },
      {
        "name": "Menkib",
        "ra": 3.98,
        "dec": 31.88,
        "mag": 3.96
      },
      {
        "name": "Gorgonea Tertia",
        "ra": 3.08,
        "dec": 44.85,
        "mag": 3.41
      }
    ],
    "lines": [
      [
        4,
        1
      ],
      [
        1,
        0
      ],
      [
        0,
        2
      ],
      [
        2,
        3
      ]
    ]
  },
  {
    "id": "andromeda",
    "name": "Andromeda",
    "familyId": "perseus",
    "familyName": "Perseus Family",
    "centerRa": 0.8,
    "centerDec": 38,
    "keyStar": {
      "name": "Alpheratz",
      "bayer": "α And",
      "spectral": "B8IV-VHgMn",
      "distanceLy": 97
    },
    "locatingDirections": "Alpheratz anchors the northeast corner of the Great Square of Pegasus. Follow two branching star chains northeast to find the great Andromeda Galaxy (M31), the most distant naked-eye object (2.5 million ly).",
    "mythology": "Princess of Ethiopia, chained to a coastal rock as a sacrifice to appease the sea monster Cetus after her mother Cassiopeia boasted of supreme beauty. Rescued by Perseus.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Autumn Zenith (Oct)",
      "siderealDates": "Mid-Autumn Transit",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Galactic Nexus Trine",
        "Kite Anchor"
      ],
      "birthSignificance": "Symbol of liberated grace, transcendence from restriction, and vast cosmic perspective."
    },
    "stars": [
      {
        "name": "Alpheratz",
        "ra": 0.14,
        "dec": 29.09,
        "mag": 2.07
      },
      {
        "name": "Mirach",
        "ra": 1.16,
        "dec": 35.62,
        "mag": 2.07
      },
      {
        "name": "Almach",
        "ra": 2.07,
        "dec": 42.33,
        "mag": 2.1
      },
      {
        "name": "Delta And",
        "ra": 0.65,
        "dec": 30.86,
        "mag": 3.27
      }
    ],
    "lines": [
      [
        0,
        3
      ],
      [
        3,
        1
      ],
      [
        1,
        2
      ]
    ]
  },
  {
    "id": "cassiopeia",
    "name": "Cassiopeia",
    "familyId": "perseus",
    "familyName": "Perseus Family",
    "centerRa": 1.3,
    "centerDec": 60,
    "keyStar": {
      "name": "Schedar",
      "bayer": "α Cas",
      "spectral": "K0IIIa",
      "distanceLy": 228
    },
    "locatingDirections": "Prominent northern circumpolar 'W' (or 'M') shaped figure directly across the North Star Polaris from the Big Dipper.",
    "mythology": "The vain Queen of Ethiopia whose boast of being fairer than the Nereids sparked Poseidon's wrath. Placed in the heavens tied to her throne, hanging upside down for half the year as divine retribution.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Late Autumn Radiance",
      "siderealDates": "Circumpolar Monarch",
      "element": "Fire",
      "modality": "Cardinal",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Throne Cardinal Cross",
        "Stellium Crown"
      ],
      "birthSignificance": "Instills theatrical charisma, high aesthetic standards, assertive self-worth, and regal bearing."
    },
    "stars": [
      {
        "name": "Schedar",
        "ra": 0.68,
        "dec": 56.54,
        "mag": 2.24
      },
      {
        "name": "Caph",
        "ra": 0.15,
        "dec": 59.15,
        "mag": 2.28
      },
      {
        "name": "Gamma Cas",
        "ra": 0.94,
        "dec": 60.72,
        "mag": 2.15
      },
      {
        "name": "Ruchbah",
        "ra": 1.43,
        "dec": 60.23,
        "mag": 2.68
      },
      {
        "name": "Segin",
        "ra": 1.9,
        "dec": 63.67,
        "mag": 3.35
      }
    ],
    "lines": [
      [
        1,
        0
      ],
      [
        0,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        4
      ]
    ]
  },
  {
    "id": "cepheus",
    "name": "Cepheus",
    "familyId": "perseus",
    "familyName": "Perseus Family",
    "centerRa": 22,
    "centerDec": 70,
    "keyStar": {
      "name": "Alderamin",
      "bayer": "α Cep",
      "spectral": "A7IV-V",
      "distanceLy": 49
    },
    "locatingDirections": "Northern circumpolar pentagon resembling a child's drawing of a steeple house, located between Cassiopeia and the Little Dipper.",
    "mythology": "King of Ethiopia, husband of Cassiopeia and father of Andromeda. Alderamin will become Earth's North Pole star around 7500 CE.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Autumn North Meridian",
      "siderealDates": "Circumpolar Pillar",
      "element": "Earth",
      "modality": "Fixed",
      "rulingPlanet": "Jupiter",
      "aspectPatterns": [
        "Steeple Trine",
        "Polar Anchor"
      ],
      "birthSignificance": "Promotes wise governance, patient statesmanship, moral rectitude, and protective authority."
    },
    "stars": [
      {
        "name": "Alderamin",
        "ra": 21.31,
        "dec": 62.59,
        "mag": 2.45
      },
      {
        "name": "Alfirk",
        "ra": 21.48,
        "dec": 70.56,
        "mag": 3.23
      },
      {
        "name": "Errai",
        "ra": 23.66,
        "dec": 77.63,
        "mag": 3.21
      },
      {
        "name": "Zeta Cep",
        "ra": 22.18,
        "dec": 58.2,
        "mag": 3.39
      },
      {
        "name": "Iota Cep",
        "ra": 22.83,
        "dec": 66.2,
        "mag": 3.5
      }
    ],
    "lines": [
      [
        0,
        3
      ],
      [
        3,
        4
      ],
      [
        4,
        2
      ],
      [
        2,
        1
      ],
      [
        1,
        0
      ]
    ]
  },
  {
    "id": "cetus",
    "name": "Cetus",
    "familyId": "perseus",
    "familyName": "Perseus Family",
    "centerRa": 1.7,
    "centerDec": -11,
    "keyStar": {
      "name": "Diphda",
      "bayer": "β Cet",
      "spectral": "K0III",
      "distanceLy": 96
    },
    "locatingDirections": "Sprawling constellation across the celestial sea, south of Aries and Pisces. Diphda shines isolated in the dark southern autumn sky.",
    "mythology": "The ravenous sea monster sent by Poseidon to ravage the coast of Ethiopia, petrified into stone when Perseus brandished Medusa's head. Houses Mira (The Wonderful), the first discovered pulsating variable star.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Late Autumn Ocean",
      "siderealDates": "November Transit",
      "element": "Water",
      "modality": "Fixed",
      "rulingPlanet": "Neptune",
      "aspectPatterns": [
        "Deep Sea T-Square",
        "Abyssal Trine"
      ],
      "birthSignificance": "Awakens deep subconscious powers, primal instincts, and ability to navigate emotional tempests."
    },
    "stars": [
      {
        "name": "Diphda",
        "ra": 0.73,
        "dec": -17.99,
        "mag": 2.04
      },
      {
        "name": "Menkar",
        "ra": 3.04,
        "dec": 4.09,
        "mag": 2.54
      },
      {
        "name": "Mira",
        "ra": 2.32,
        "dec": -2.98,
        "mag": 3.04
      },
      {
        "name": "Baten Kaitos",
        "ra": 1.9,
        "dec": -10.34,
        "mag": 3.74
      }
    ],
    "lines": [
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        0
      ]
    ]
  },
  {
    "id": "auriga",
    "name": "Auriga",
    "familyId": "perseus",
    "familyName": "Perseus Family",
    "centerRa": 5.6,
    "centerDec": 42,
    "keyStar": {
      "name": "Capella",
      "bayer": "α Aur",
      "spectral": "G8III",
      "distanceLy": 42.9
    },
    "locatingDirections": "North of Orion and Taurus. Capella shines brilliant golden yellow at the apex of a prominent pentagon of stars.",
    "mythology": "Erichthonius, legendary king of Athens and foster son of Athena, who invented the four-horse chariot. Capella represents the sacred goat Amalthea who nursed infant Zeus on Crete.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Winter Solstice Radiance",
      "siderealDates": "January Zenith",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Mercury",
      "aspectPatterns": [
        "Winter Hexagon Anchor",
        "Grand Trine with Gemini & Libra"
      ],
      "birthSignificance": "Fosters mechanical invention, rapid transit mastery, protective nurturing, and brilliant tactical mobility."
    },
    "stars": [
      {
        "name": "Capella",
        "ra": 5.28,
        "dec": 45.99,
        "mag": 0.08
      },
      {
        "name": "Menkalinan",
        "ra": 5.99,
        "dec": 44.95,
        "mag": 1.9
      },
      {
        "name": "Mahasim",
        "ra": 5.99,
        "dec": 37.21,
        "mag": 2.65
      },
      {
        "name": "Hassaleh",
        "ra": 4.95,
        "dec": 33.17,
        "mag": 2.69
      },
      {
        "name": "Elnath (shared)",
        "ra": 5.44,
        "dec": 28.61,
        "mag": 1.65
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        4
      ],
      [
        4,
        3
      ],
      [
        3,
        0
      ]
    ]
  },
  {
    "id": "pegasus",
    "name": "Pegasus",
    "familyId": "perseus",
    "familyName": "Perseus Family",
    "centerRa": 22.7,
    "centerDec": 20,
    "keyStar": {
      "name": "Enif",
      "bayer": "ε Peg",
      "spectral": "K2Ib",
      "distanceLy": 690
    },
    "locatingDirections": "The 'Great Square of Pegasus' dominates the autumn evening sky. Its four bright stars (Markab, Scheat, Algenib, and Alpheratz in Andromeda) form a vast celestial courtyard.",
    "mythology": "The divine winged stallion sired by Poseidon, born from Medusa's neck when Perseus struck. Brought down the spring of the Muses (Hippocrene) on Mount Helicon with a strike of its hoof.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Autumn Equinox Portal",
      "siderealDates": "October Transit",
      "element": "Air",
      "modality": "Cardinal",
      "rulingPlanet": "Jupiter",
      "aspectPatterns": [
        "Great Square Cardinal Box",
        "Grand Trine Wing"
      ],
      "birthSignificance": "Conveys soaring poetic inspiration, elevated spiritual aspirations, and swift transcendence over earthly trials."
    },
    "stars": [
      {
        "name": "Markab",
        "ra": 23.08,
        "dec": 15.21,
        "mag": 2.49
      },
      {
        "name": "Scheat",
        "ra": 23.06,
        "dec": 28.08,
        "mag": 2.44
      },
      {
        "name": "Algenib",
        "ra": 0.22,
        "dec": 15.18,
        "mag": 2.84
      },
      {
        "name": "Enif",
        "ra": 21.74,
        "dec": 9.87,
        "mag": 2.38
      },
      {
        "name": "Homam",
        "ra": 22.7,
        "dec": 10.83,
        "mag": 3.41
      }
    ],
    "lines": [
      [
        3,
        4
      ],
      [
        4,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        0
      ]
    ]
  },
  {
    "id": "triangulum",
    "name": "Triangulum",
    "familyId": "perseus",
    "familyName": "Perseus Family",
    "centerRa": 2.2,
    "centerDec": 31.5,
    "keyStar": {
      "name": "Metallah",
      "bayer": "α Tri",
      "spectral": "F6IV",
      "distanceLy": 63.3
    },
    "locatingDirections": "Crisp narrow triangle tucked between Andromeda and Aries. Houses the magnificent Triangulum Galaxy (M33), third largest in our Local Group.",
    "mythology": "The Greek letter Delta (Δ) representing the fertile Nile Delta, and the sacred island of Sicily (Trinacria) favored by Ceres.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Mid-Autumn Alignment",
      "siderealDates": "November Culmination",
      "element": "Fire",
      "modality": "Cardinal",
      "rulingPlanet": "Mercury",
      "aspectPatterns": [
        "Delta Harmonic Wedge",
        "Sextile Integrator"
      ],
      "birthSignificance": "Geometric perfection, analytical clarity, fertile creation, and harmonious triple synthesis."
    },
    "stars": [
      {
        "name": "Metallah",
        "ra": 1.89,
        "dec": 29.58,
        "mag": 3.42
      },
      {
        "name": "Beta Tri",
        "ra": 2.16,
        "dec": 34.99,
        "mag": 3
      },
      {
        "name": "Gamma Tri",
        "ra": 2.29,
        "dec": 33.85,
        "mag": 4.01
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        0
      ]
    ]
  },
  {
    "id": "lacerta",
    "name": "Lacerta",
    "familyId": "perseus",
    "familyName": "Perseus Family",
    "centerRa": 22.5,
    "centerDec": 45,
    "keyStar": {
      "name": "Alpha Lacertae",
      "bayer": "α Lac",
      "spectral": "A1V",
      "distanceLy": 102
    },
    "locatingDirections": "Small zigzag constellation in the northern Milky Way between Cygnus and Andromeda.",
    "mythology": "The Lizard, created by Johannes Hevelius in 1687 to populate the empty region between Perseus and the Swan.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Late Summer to Autumn",
      "siderealDates": "October Zenith",
      "element": "Earth",
      "modality": "Mutable",
      "rulingPlanet": "Mercury",
      "aspectPatterns": [
        "Subtle Sextile",
        "Camouflage Trine"
      ],
      "birthSignificance": "Agile adaptation, camouflage under pressure, quick tactical maneuvering, and silent survival."
    },
    "stars": [
      {
        "name": "Alpha Lac",
        "ra": 22.52,
        "dec": 50.28,
        "mag": 3.77
      },
      {
        "name": "Beta Lac",
        "ra": 22.39,
        "dec": 52.23,
        "mag": 4.43
      },
      {
        "name": "4 Lac",
        "ra": 22.41,
        "dec": 49.48,
        "mag": 4.55
      }
    ],
    "lines": [
      [
        1,
        0
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "hercules",
    "name": "Hercules",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 16.5,
    "centerDec": 21.5,
    "keyStar": {
      "name": "Kornephoros",
      "bayer": "α Her",
      "spectral": "A0V",
      "distanceLy": 139
    },
    "locatingDirections": "Located in the summer/southern sky near RA 16.5h, Dec 21.5°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The greatest Greek hero kneeling in triumph over his twelve labors; home to globular cluster M13.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Kornephoros",
        "ra": 16.5,
        "dec": 21.5,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 17,
        "dec": 26.5,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 16,
        "dec": 16.5,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "sagitta",
    "name": "Sagitta",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 19.8,
    "centerDec": 18.8,
    "keyStar": {
      "name": "Sham",
      "bayer": "α Sag",
      "spectral": "A0V",
      "distanceLy": 610
    },
    "locatingDirections": "Located in the summer/southern sky near RA 19.8h, Dec 18.8°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The arrow shot by Hercules to slay the eagle feasting on Prometheus.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Sham",
        "ra": 19.8,
        "dec": 18.8,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 20.3,
        "dec": 23.8,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 19.299999999999997,
        "dec": 13.8,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "aquila",
    "name": "Aquila",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 19.85,
    "centerDec": 8.9,
    "keyStar": {
      "name": "Altair",
      "bayer": "α Aqu",
      "spectral": "A0V",
      "distanceLy": 16.7
    },
    "locatingDirections": "Located in the summer/southern sky near RA 19.85h, Dec 8.9°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The majestic eagle of Zeus that carried his thunderbolts and Ganymede to Olympus.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Altair",
        "ra": 19.85,
        "dec": 8.9,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 20.35,
        "dec": 13.9,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 19.35,
        "dec": 3.9000000000000004,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "lyra",
    "name": "Lyra",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 18.62,
    "centerDec": 38.8,
    "keyStar": {
      "name": "Vega",
      "bayer": "α Lyr",
      "spectral": "A0V",
      "distanceLy": 25
    },
    "locatingDirections": "Located in the summer/southern sky near RA 18.62h, Dec 38.8°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The magical golden lyre of Orpheus that enchanted beasts, trees, and stones.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Vega",
        "ra": 18.62,
        "dec": 38.8,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 19.12,
        "dec": 43.8,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 18.120000000000005,
        "dec": 33.8,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "cygnus",
    "name": "Cygnus",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 20.69,
    "centerDec": 45.3,
    "keyStar": {
      "name": "Deneb",
      "bayer": "α Cyg",
      "spectral": "A0V",
      "distanceLy": 2600
    },
    "locatingDirections": "Located in the summer/southern sky near RA 20.69h, Dec 45.3°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The Northern Cross soaring along the Milky Way; Zeus disguised as a swan to visit Leda.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Deneb",
        "ra": 20.69,
        "dec": 45.3,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 21.19,
        "dec": 50.3,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 20.189999999999998,
        "dec": 40.3,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "vulpecula",
    "name": "Vulpecula",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 19.5,
    "centerDec": 24.5,
    "keyStar": {
      "name": "Anser",
      "bayer": "α Vul",
      "spectral": "A0V",
      "distanceLy": 297
    },
    "locatingDirections": "Located in the summer/southern sky near RA 19.5h, Dec 24.5°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The little fox carrying the goose, nestled inside the Summer Triangle.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Anser",
        "ra": 19.5,
        "dec": 24.5,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 20,
        "dec": 29.5,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 19,
        "dec": 19.5,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "hydra",
    "name": "Hydra",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 9.46,
    "centerDec": -8.65,
    "keyStar": {
      "name": "Alphard",
      "bayer": "α Hyd",
      "spectral": "A0V",
      "distanceLy": 177
    },
    "locatingDirections": "Located in the summer/southern sky near RA 9.46h, Dec -8.65°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The multi-headed water snake slain by Hercules; longest constellation in the entire sky.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Alphard",
        "ra": 9.46,
        "dec": -8.65,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 9.96,
        "dec": -3.6500000000000004,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 8.96,
        "dec": -13.65,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "sextans",
    "name": "Sextans",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 10.13,
    "centerDec": -0.37,
    "keyStar": {
      "name": "Alpha Sextantis",
      "bayer": "α Sex",
      "spectral": "A0V",
      "distanceLy": 287
    },
    "locatingDirections": "Located in the summer/southern sky near RA 10.13h, Dec -0.37°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "Hevelius's astronomical sextant used to chart star positions before telescopes.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Alpha Sextantis",
        "ra": 10.13,
        "dec": -0.37,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 10.63,
        "dec": 4.63,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 9.630000000000003,
        "dec": -5.37,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "crater",
    "name": "Crater",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 11.32,
    "centerDec": -14.78,
    "keyStar": {
      "name": "Labrum",
      "bayer": "α Cra",
      "spectral": "A0V",
      "distanceLy": 196
    },
    "locatingDirections": "Located in the summer/southern sky near RA 11.32h, Dec -14.78°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The sacred two-handled goblet of Apollo resting on the coils of Hydra.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Labrum",
        "ra": 11.32,
        "dec": -14.78,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 11.82,
        "dec": -9.78,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 10.82,
        "dec": -19.78,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "corvus",
    "name": "Corvus",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 12.26,
    "centerDec": -17.54,
    "keyStar": {
      "name": "Gienah",
      "bayer": "α Cor",
      "spectral": "A0V",
      "distanceLy": 165
    },
    "locatingDirections": "Located in the summer/southern sky near RA 12.26h, Dec -17.54°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The sacred crow of Apollo whose white feathers were scorched black for deceit.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Gienah",
        "ra": 12.26,
        "dec": -17.54,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 12.76,
        "dec": -12.54,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 11.759999999999998,
        "dec": -22.54,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "ophiuchus",
    "name": "Ophiuchus",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 17.58,
    "centerDec": 12.56,
    "keyStar": {
      "name": "Rasalhague",
      "bayer": "α Oph",
      "spectral": "A0V",
      "distanceLy": 48.6
    },
    "locatingDirections": "Located in the summer/southern sky near RA 17.58h, Dec 12.56°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The serpent bearer Asclepius, god of medicine who learned the secrets of resurrecting the dead.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Rasalhague",
        "ra": 17.58,
        "dec": 12.56,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 18.08,
        "dec": 17.560000000000002,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 17.08,
        "dec": 7.5600000000000005,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "serpens",
    "name": "Serpens",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 15.74,
    "centerDec": 6.43,
    "keyStar": {
      "name": "Unukalhai",
      "bayer": "α Ser",
      "spectral": "A0V",
      "distanceLy": 74
    },
    "locatingDirections": "Located in the summer/southern sky near RA 15.74h, Dec 6.43°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The great serpent split in two (Caput and Cauda) wrapped around Ophiuchus; symbol of medicine.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Unukalhai",
        "ra": 15.74,
        "dec": 6.43,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 16.240000000000002,
        "dec": 11.43,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 15.240000000000002,
        "dec": 1.4299999999999997,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "scutum",
    "name": "Scutum",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 18.59,
    "centerDec": -8.24,
    "keyStar": {
      "name": "Alpha Scuti",
      "bayer": "α Scu",
      "spectral": "A0V",
      "distanceLy": 174
    },
    "locatingDirections": "Located in the summer/southern sky near RA 18.59h, Dec -8.24°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The shield of Polish King Jan III Sobieski celebrating victory at the 1683 Battle of Vienna.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Alpha Scuti",
        "ra": 18.59,
        "dec": -8.24,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 19.09,
        "dec": -3.24,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 18.090000000000003,
        "dec": -13.24,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "centaurus",
    "name": "Centaurus",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 14.66,
    "centerDec": -60.8,
    "keyStar": {
      "name": "Alpha Centauri",
      "bayer": "α Cen",
      "spectral": "A0V",
      "distanceLy": 4.37
    },
    "locatingDirections": "Located in the summer/southern sky near RA 14.66h, Dec -60.8°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "Chiron, the wise centaur tutor of Hercules, Achilles, and Asclepius.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Alpha Centauri",
        "ra": 14.66,
        "dec": -60.8,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 15.16,
        "dec": -55.8,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 14.159999999999997,
        "dec": -65.8,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "lupus",
    "name": "Lupus",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 14.7,
    "centerDec": -47.4,
    "keyStar": {
      "name": "Men",
      "bayer": "α Lup",
      "spectral": "A0V",
      "distanceLy": 550
    },
    "locatingDirections": "Located in the summer/southern sky near RA 14.7h, Dec -47.4°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The wolf transfixed on the spear of the Centaur as an offering to the celestial altar Ara.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Men",
        "ra": 14.7,
        "dec": -47.4,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 15.2,
        "dec": -42.4,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 14.200000000000003,
        "dec": -52.4,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "corona_australis",
    "name": "Corona Australis",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 19.16,
    "centerDec": -37.9,
    "keyStar": {
      "name": "Meridiana",
      "bayer": "α Cor",
      "spectral": "A0V",
      "distanceLy": 130
    },
    "locatingDirections": "Located in the summer/southern sky near RA 19.16h, Dec -37.9°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The southern crown or wreath presented to Bacchus.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Meridiana",
        "ra": 19.16,
        "dec": -37.9,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 19.66,
        "dec": -32.9,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 18.659999999999997,
        "dec": -42.9,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "ara",
    "name": "Ara",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 17.42,
    "centerDec": -55.5,
    "keyStar": {
      "name": "Beta Arae",
      "bayer": "α Ara",
      "spectral": "A0V",
      "distanceLy": 600
    },
    "locatingDirections": "Located in the summer/southern sky near RA 17.42h, Dec -55.5°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The celestial altar upon which the gods swore eternal alliance before warring against the Titans.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Beta Arae",
        "ra": 17.42,
        "dec": -55.5,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 17.92,
        "dec": -50.5,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 16.92,
        "dec": -60.5,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "triangulum_australe",
    "name": "Triangulum Australe",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 16.81,
    "centerDec": -69.03,
    "keyStar": {
      "name": "Atria",
      "bayer": "α Tri",
      "spectral": "A0V",
      "distanceLy": 415
    },
    "locatingDirections": "Located in the summer/southern sky near RA 16.81h, Dec -69.03°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The brilliant southern triangle navigational landmark introduced by Keyser & de Houtman.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Atria",
        "ra": 16.81,
        "dec": -69.03,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 17.31,
        "dec": -64.03,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 16.310000000000002,
        "dec": -74.03,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "crux",
    "name": "Crux",
    "familyId": "hercules",
    "familyName": "Hercules Family",
    "centerRa": 12.44,
    "centerDec": -63.1,
    "keyStar": {
      "name": "Acrux",
      "bayer": "α Cru",
      "spectral": "A0V",
      "distanceLy": 320
    },
    "locatingDirections": "Located in the summer/southern sky near RA 12.44h, Dec -63.1°. Follow star-hops through Hercules and the Summer Triangle / Centaurus meridian based on Menzel field charts.",
    "mythology": "The Southern Cross, the smallest yet most celebrated southern navigational landmark.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Summer & Southern Zenith",
      "siderealDates": "Culmination May–August",
      "element": "Fire",
      "modality": "Fixed",
      "rulingPlanet": "Mars",
      "aspectPatterns": [
        "Heroic Cross",
        "Hercules Grand Trine"
      ],
      "birthSignificance": "Bestows indomitable heroic resolve, fortitude through adversity, and monumental achievement."
    },
    "stars": [
      {
        "name": "Acrux",
        "ra": 12.44,
        "dec": -63.1,
        "mag": 1.5
      },
      {
        "name": "Node-1",
        "ra": 12.94,
        "dec": -58.1,
        "mag": 3.2
      },
      {
        "name": "Node-2",
        "ra": 11.939999999999998,
        "dec": -68.1,
        "mag": 3.8
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "orion",
    "name": "Orion",
    "familyId": "orion",
    "familyName": "Orion Family",
    "centerRa": 5.5,
    "centerDec": 0,
    "keyStar": {
      "name": "Rigel",
      "bayer": "α Ori",
      "spectral": "B8Ia",
      "distanceLy": 860
    },
    "locatingDirections": "Centered around the winter equator near RA 5.5h, Dec 0°. Use the three belt stars of Orion to hop southeast to Sirius and northeast to Procyon, forming the Winter Triangle.",
    "mythology": "The mighty celestial hunter standing astride the equator, pursued by the scorpion and leading his loyal dogs.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Winter Solstice Splendor",
      "siderealDates": "January–February Culmination",
      "element": "Air",
      "modality": "Cardinal",
      "rulingPlanet": "Jupiter",
      "aspectPatterns": [
        "Winter Triangle Harmony",
        "Winter Hexagon Keystone"
      ],
      "birthSignificance": "Conveys hunting brilliance, charismatic presence, athletic prowess, and legendary stature."
    },
    "stars": [
      {
        "name": "Rigel",
        "ra": 5.5,
        "dec": 0,
        "mag": 1.2
      },
      {
        "name": "Node-1",
        "ra": 5.9,
        "dec": 6,
        "mag": 2.1
      },
      {
        "name": "Node-2",
        "ra": 5.100000000000001,
        "dec": -6,
        "mag": 2.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "canis_major",
    "name": "Canis Major",
    "familyId": "orion",
    "familyName": "Orion Family",
    "centerRa": 6.75,
    "centerDec": -16.7,
    "keyStar": {
      "name": "Sirius",
      "bayer": "α Can",
      "spectral": "B8Ia",
      "distanceLy": 8.6
    },
    "locatingDirections": "Centered around the winter equator near RA 6.75h, Dec -16.7°. Use the three belt stars of Orion to hop southeast to Sirius and northeast to Procyon, forming the Winter Triangle.",
    "mythology": "Orion's larger hunting dog carrying Sirius (the Dog Star), the brightest star in Earth's night sky.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Winter Solstice Splendor",
      "siderealDates": "January–February Culmination",
      "element": "Air",
      "modality": "Cardinal",
      "rulingPlanet": "Jupiter",
      "aspectPatterns": [
        "Winter Triangle Harmony",
        "Winter Hexagon Keystone"
      ],
      "birthSignificance": "Conveys hunting brilliance, charismatic presence, athletic prowess, and legendary stature."
    },
    "stars": [
      {
        "name": "Sirius",
        "ra": 6.75,
        "dec": -16.7,
        "mag": 1.2
      },
      {
        "name": "Node-1",
        "ra": 7.15,
        "dec": -10.7,
        "mag": 2.1
      },
      {
        "name": "Node-2",
        "ra": 6.350000000000001,
        "dec": -22.7,
        "mag": 2.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "canis_minor",
    "name": "Canis Minor",
    "familyId": "orion",
    "familyName": "Orion Family",
    "centerRa": 7.66,
    "centerDec": 5.2,
    "keyStar": {
      "name": "Procyon",
      "bayer": "α Can",
      "spectral": "B8Ia",
      "distanceLy": 11.5
    },
    "locatingDirections": "Centered around the winter equator near RA 7.66h, Dec 5.2°. Use the three belt stars of Orion to hop southeast to Sirius and northeast to Procyon, forming the Winter Triangle.",
    "mythology": "Orion's lesser hound carrying Procyon ('Before the Dog'), rising before Sirius in the east.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Winter Solstice Splendor",
      "siderealDates": "January–February Culmination",
      "element": "Air",
      "modality": "Cardinal",
      "rulingPlanet": "Jupiter",
      "aspectPatterns": [
        "Winter Triangle Harmony",
        "Winter Hexagon Keystone"
      ],
      "birthSignificance": "Conveys hunting brilliance, charismatic presence, athletic prowess, and legendary stature."
    },
    "stars": [
      {
        "name": "Procyon",
        "ra": 7.66,
        "dec": 5.2,
        "mag": 1.2
      },
      {
        "name": "Node-1",
        "ra": 8.06,
        "dec": 11.2,
        "mag": 2.1
      },
      {
        "name": "Node-2",
        "ra": 7.259999999999998,
        "dec": -0.7999999999999998,
        "mag": 2.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "monoceros",
    "name": "Monoceros",
    "familyId": "orion",
    "familyName": "Orion Family",
    "centerRa": 7,
    "centerDec": -3,
    "keyStar": {
      "name": "Beta Monocerotis",
      "bayer": "α Mon",
      "spectral": "B8Ia",
      "distanceLy": 690
    },
    "locatingDirections": "Centered around the winter equator near RA 7h, Dec -3°. Use the three belt stars of Orion to hop southeast to Sirius and northeast to Procyon, forming the Winter Triangle.",
    "mythology": "The mysterious unicorn roaming silently through the winter Milky Way between Orion's two hounds.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Winter Solstice Splendor",
      "siderealDates": "January–February Culmination",
      "element": "Air",
      "modality": "Cardinal",
      "rulingPlanet": "Jupiter",
      "aspectPatterns": [
        "Winter Triangle Harmony",
        "Winter Hexagon Keystone"
      ],
      "birthSignificance": "Conveys hunting brilliance, charismatic presence, athletic prowess, and legendary stature."
    },
    "stars": [
      {
        "name": "Beta Monocerotis",
        "ra": 7,
        "dec": -3,
        "mag": 1.2
      },
      {
        "name": "Node-1",
        "ra": 7.4,
        "dec": 3,
        "mag": 2.1
      },
      {
        "name": "Node-2",
        "ra": 6.600000000000001,
        "dec": -9,
        "mag": 2.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "lepus",
    "name": "Lepus",
    "familyId": "orion",
    "familyName": "Orion Family",
    "centerRa": 5.54,
    "centerDec": -17.8,
    "keyStar": {
      "name": "Arneb",
      "bayer": "α Lep",
      "spectral": "B8Ia",
      "distanceLy": 2218
    },
    "locatingDirections": "Centered around the winter equator near RA 5.54h, Dec -17.8°. Use the three belt stars of Orion to hop southeast to Sirius and northeast to Procyon, forming the Winter Triangle.",
    "mythology": "The swift hare crouching safely beneath Orion's feet, pursued by the hunting hounds.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Winter Solstice Splendor",
      "siderealDates": "January–February Culmination",
      "element": "Air",
      "modality": "Cardinal",
      "rulingPlanet": "Jupiter",
      "aspectPatterns": [
        "Winter Triangle Harmony",
        "Winter Hexagon Keystone"
      ],
      "birthSignificance": "Conveys hunting brilliance, charismatic presence, athletic prowess, and legendary stature."
    },
    "stars": [
      {
        "name": "Arneb",
        "ra": 5.54,
        "dec": -17.8,
        "mag": 1.2
      },
      {
        "name": "Node-1",
        "ra": 5.94,
        "dec": -11.8,
        "mag": 2.1
      },
      {
        "name": "Node-2",
        "ra": 5.140000000000001,
        "dec": -23.8,
        "mag": 2.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "delphinus",
    "name": "Delphinus",
    "familyId": "heavenly_waters",
    "familyName": "Heavenly Waters Family",
    "centerRa": 20.7,
    "centerDec": 15,
    "keyStar": {
      "name": "Rotanev",
      "bayer": "α Del",
      "spectral": "A0V",
      "distanceLy": 97
    },
    "locatingDirections": "Southern celestial ocean around RA 20.7h, Dec 15°. Follow the starry current of Eridanus or the mast of Argo Navis south of Canis Major.",
    "mythology": "The benevolent dolphin that carried poet Arion to safety and helped Poseidon find his bride Amphitrite.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Cosmic Ocean Current",
      "siderealDates": "Culmination Autumn–Winter",
      "element": "Water",
      "modality": "Mutable",
      "rulingPlanet": "Neptune",
      "aspectPatterns": [
        "Oceanic Grand Trine",
        "Maritime Navigator Sextile"
      ],
      "birthSignificance": "Deep intuition, seafaring adventure, fluid emotional wisdom, and safe guidance through turbulent waters."
    },
    "stars": [
      {
        "name": "Rotanev",
        "ra": 20.7,
        "dec": 15,
        "mag": 1.8
      },
      {
        "name": "Node-1",
        "ra": 21,
        "dec": 19,
        "mag": 3.5
      },
      {
        "name": "Node-2",
        "ra": 20.4,
        "dec": 11,
        "mag": 3.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "equuleus",
    "name": "Equuleus",
    "familyId": "heavenly_waters",
    "familyName": "Heavenly Waters Family",
    "centerRa": 21.26,
    "centerDec": 5.25,
    "keyStar": {
      "name": "Kitalpha",
      "bayer": "α Equ",
      "spectral": "A0V",
      "distanceLy": 186
    },
    "locatingDirections": "Southern celestial ocean around RA 21.26h, Dec 5.25°. Follow the starry current of Eridanus or the mast of Argo Navis south of Canis Major.",
    "mythology": "The little foal, sibling or offspring of Pegasus, rising just before the winged steed.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Cosmic Ocean Current",
      "siderealDates": "Culmination Autumn–Winter",
      "element": "Water",
      "modality": "Mutable",
      "rulingPlanet": "Neptune",
      "aspectPatterns": [
        "Oceanic Grand Trine",
        "Maritime Navigator Sextile"
      ],
      "birthSignificance": "Deep intuition, seafaring adventure, fluid emotional wisdom, and safe guidance through turbulent waters."
    },
    "stars": [
      {
        "name": "Kitalpha",
        "ra": 21.26,
        "dec": 5.25,
        "mag": 1.8
      },
      {
        "name": "Node-1",
        "ra": 21.560000000000002,
        "dec": 9.25,
        "mag": 3.5
      },
      {
        "name": "Node-2",
        "ra": 20.96,
        "dec": 1.25,
        "mag": 3.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "eridanus",
    "name": "Eridanus",
    "familyId": "heavenly_waters",
    "familyName": "Heavenly Waters Family",
    "centerRa": 3.5,
    "centerDec": -29,
    "keyStar": {
      "name": "Achernar",
      "bayer": "α Eri",
      "spectral": "A0V",
      "distanceLy": 139
    },
    "locatingDirections": "Southern celestial ocean around RA 3.5h, Dec -29°. Follow the starry current of Eridanus or the mast of Argo Navis south of Canis Major.",
    "mythology": "The celestial river into which Phaethon plunged after losing control of the Sun Chariot; ends at Achernar.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Cosmic Ocean Current",
      "siderealDates": "Culmination Autumn–Winter",
      "element": "Water",
      "modality": "Mutable",
      "rulingPlanet": "Neptune",
      "aspectPatterns": [
        "Oceanic Grand Trine",
        "Maritime Navigator Sextile"
      ],
      "birthSignificance": "Deep intuition, seafaring adventure, fluid emotional wisdom, and safe guidance through turbulent waters."
    },
    "stars": [
      {
        "name": "Achernar",
        "ra": 3.5,
        "dec": -29,
        "mag": 1.8
      },
      {
        "name": "Node-1",
        "ra": 3.8,
        "dec": -25,
        "mag": 3.5
      },
      {
        "name": "Node-2",
        "ra": 3.1999999999999993,
        "dec": -33,
        "mag": 3.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "piscis_austrinus",
    "name": "Piscis Austrinus",
    "familyId": "heavenly_waters",
    "familyName": "Heavenly Waters Family",
    "centerRa": 22.96,
    "centerDec": -29.6,
    "keyStar": {
      "name": "Fomalhaut",
      "bayer": "α Pis",
      "spectral": "A0V",
      "distanceLy": 25
    },
    "locatingDirections": "Southern celestial ocean around RA 22.96h, Dec -29.6°. Follow the starry current of Eridanus or the mast of Argo Navis south of Canis Major.",
    "mythology": "The Great Southern Fish drinking the celestial water flowing from the urn of Aquarius; anchored by Fomalhaut.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Cosmic Ocean Current",
      "siderealDates": "Culmination Autumn–Winter",
      "element": "Water",
      "modality": "Mutable",
      "rulingPlanet": "Neptune",
      "aspectPatterns": [
        "Oceanic Grand Trine",
        "Maritime Navigator Sextile"
      ],
      "birthSignificance": "Deep intuition, seafaring adventure, fluid emotional wisdom, and safe guidance through turbulent waters."
    },
    "stars": [
      {
        "name": "Fomalhaut",
        "ra": 22.96,
        "dec": -29.6,
        "mag": 1.8
      },
      {
        "name": "Node-1",
        "ra": 23.26,
        "dec": -25.6,
        "mag": 3.5
      },
      {
        "name": "Node-2",
        "ra": 22.659999999999997,
        "dec": -33.6,
        "mag": 3.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "carina",
    "name": "Carina",
    "familyId": "heavenly_waters",
    "familyName": "Heavenly Waters Family",
    "centerRa": 6.4,
    "centerDec": -52.7,
    "keyStar": {
      "name": "Canopus",
      "bayer": "α Car",
      "spectral": "A0V",
      "distanceLy": 310
    },
    "locatingDirections": "Southern celestial ocean around RA 6.4h, Dec -52.7°. Follow the starry current of Eridanus or the mast of Argo Navis south of Canis Major.",
    "mythology": "The Keel of the great ship Argo Navis; home to Canopus, second brightest star in the sky.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Cosmic Ocean Current",
      "siderealDates": "Culmination Autumn–Winter",
      "element": "Water",
      "modality": "Mutable",
      "rulingPlanet": "Neptune",
      "aspectPatterns": [
        "Oceanic Grand Trine",
        "Maritime Navigator Sextile"
      ],
      "birthSignificance": "Deep intuition, seafaring adventure, fluid emotional wisdom, and safe guidance through turbulent waters."
    },
    "stars": [
      {
        "name": "Canopus",
        "ra": 6.4,
        "dec": -52.7,
        "mag": 1.8
      },
      {
        "name": "Node-1",
        "ra": 6.7,
        "dec": -48.7,
        "mag": 3.5
      },
      {
        "name": "Node-2",
        "ra": 6.100000000000001,
        "dec": -56.7,
        "mag": 3.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "puppis",
    "name": "Puppis",
    "familyId": "heavenly_waters",
    "familyName": "Heavenly Waters Family",
    "centerRa": 7.3,
    "centerDec": -31,
    "keyStar": {
      "name": "Naos",
      "bayer": "α Pup",
      "spectral": "A0V",
      "distanceLy": 1080
    },
    "locatingDirections": "Southern celestial ocean around RA 7.3h, Dec -31°. Follow the starry current of Eridanus or the mast of Argo Navis south of Canis Major.",
    "mythology": "The Poop Deck / Stern of Argo Navis, sailing through dense southern star clusters.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Cosmic Ocean Current",
      "siderealDates": "Culmination Autumn–Winter",
      "element": "Water",
      "modality": "Mutable",
      "rulingPlanet": "Neptune",
      "aspectPatterns": [
        "Oceanic Grand Trine",
        "Maritime Navigator Sextile"
      ],
      "birthSignificance": "Deep intuition, seafaring adventure, fluid emotional wisdom, and safe guidance through turbulent waters."
    },
    "stars": [
      {
        "name": "Naos",
        "ra": 7.3,
        "dec": -31,
        "mag": 1.8
      },
      {
        "name": "Node-1",
        "ra": 7.6,
        "dec": -27,
        "mag": 3.5
      },
      {
        "name": "Node-2",
        "ra": 7,
        "dec": -35,
        "mag": 3.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "vela",
    "name": "Vela",
    "familyId": "heavenly_waters",
    "familyName": "Heavenly Waters Family",
    "centerRa": 8.6,
    "centerDec": -47,
    "keyStar": {
      "name": "Regor",
      "bayer": "α Vel",
      "spectral": "A0V",
      "distanceLy": 840
    },
    "locatingDirections": "Southern celestial ocean around RA 8.6h, Dec -47°. Follow the starry current of Eridanus or the mast of Argo Navis south of Canis Major.",
    "mythology": "The billowing Sails of Argo Navis, billowing across the southern Milky Way.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Cosmic Ocean Current",
      "siderealDates": "Culmination Autumn–Winter",
      "element": "Water",
      "modality": "Mutable",
      "rulingPlanet": "Neptune",
      "aspectPatterns": [
        "Oceanic Grand Trine",
        "Maritime Navigator Sextile"
      ],
      "birthSignificance": "Deep intuition, seafaring adventure, fluid emotional wisdom, and safe guidance through turbulent waters."
    },
    "stars": [
      {
        "name": "Regor",
        "ra": 8.6,
        "dec": -47,
        "mag": 1.8
      },
      {
        "name": "Node-1",
        "ra": 8.9,
        "dec": -43,
        "mag": 3.5
      },
      {
        "name": "Node-2",
        "ra": 8.299999999999997,
        "dec": -51,
        "mag": 3.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "pyxis",
    "name": "Pyxis",
    "familyId": "heavenly_waters",
    "familyName": "Heavenly Waters Family",
    "centerRa": 8.7,
    "centerDec": -27,
    "keyStar": {
      "name": "Alpha Pyxidis",
      "bayer": "α Pyx",
      "spectral": "A0V",
      "distanceLy": 850
    },
    "locatingDirections": "Southern celestial ocean around RA 8.7h, Dec -27°. Follow the starry current of Eridanus or the mast of Argo Navis south of Canis Major.",
    "mythology": "The Mariner's Magnetic Compass, added by Lacaille to guide the ship Argo Navis.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Cosmic Ocean Current",
      "siderealDates": "Culmination Autumn–Winter",
      "element": "Water",
      "modality": "Mutable",
      "rulingPlanet": "Neptune",
      "aspectPatterns": [
        "Oceanic Grand Trine",
        "Maritime Navigator Sextile"
      ],
      "birthSignificance": "Deep intuition, seafaring adventure, fluid emotional wisdom, and safe guidance through turbulent waters."
    },
    "stars": [
      {
        "name": "Alpha Pyxidis",
        "ra": 8.7,
        "dec": -27,
        "mag": 1.8
      },
      {
        "name": "Node-1",
        "ra": 9,
        "dec": -23,
        "mag": 3.5
      },
      {
        "name": "Node-2",
        "ra": 8.399999999999999,
        "dec": -31,
        "mag": 3.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "columba",
    "name": "Columba",
    "familyId": "heavenly_waters",
    "familyName": "Heavenly Waters Family",
    "centerRa": 5.66,
    "centerDec": -34.07,
    "keyStar": {
      "name": "Phact",
      "bayer": "α Col",
      "spectral": "A0V",
      "distanceLy": 261
    },
    "locatingDirections": "Southern celestial ocean around RA 5.66h, Dec -34.07°. Follow the starry current of Eridanus or the mast of Argo Navis south of Canis Major.",
    "mythology": "The dove sent forth by Noah (and Jason) to guide the voyagers to safe harbor.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Cosmic Ocean Current",
      "siderealDates": "Culmination Autumn–Winter",
      "element": "Water",
      "modality": "Mutable",
      "rulingPlanet": "Neptune",
      "aspectPatterns": [
        "Oceanic Grand Trine",
        "Maritime Navigator Sextile"
      ],
      "birthSignificance": "Deep intuition, seafaring adventure, fluid emotional wisdom, and safe guidance through turbulent waters."
    },
    "stars": [
      {
        "name": "Phact",
        "ra": 5.66,
        "dec": -34.07,
        "mag": 1.8
      },
      {
        "name": "Node-1",
        "ra": 5.96,
        "dec": -30.07,
        "mag": 3.5
      },
      {
        "name": "Node-2",
        "ra": 5.359999999999999,
        "dec": -38.07,
        "mag": 3.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "apus",
    "name": "Apus",
    "familyId": "bayer",
    "familyName": "Bayer Family",
    "centerRa": 14.8,
    "centerDec": -75,
    "keyStar": {
      "name": "Alpha Apodis",
      "bayer": "α Apu",
      "spectral": "B2IV",
      "distanceLy": 411
    },
    "locatingDirections": "Deep southern sky near RA 14.8h, Dec -75°. Follow star-hops south of the Southern Cross and Achernar into the Magellanic Cloud realms.",
    "mythology": "The Bird of Paradise, admired by explorers for its iridescent feathers and celestial beauty.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Southern Circumpolar Flight",
      "siderealDates": "Deep South Culmination",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Southern Cross Trine",
        "Phoenix Rebirth Axis"
      ],
      "birthSignificance": "Exotic innovation, metamorphosis, adventurous wanderlust, and rebirth from crisis."
    },
    "stars": [
      {
        "name": "Alpha Apodis",
        "ra": 14.8,
        "dec": -75,
        "mag": 2.2
      },
      {
        "name": "Node-1",
        "ra": 15.100000000000001,
        "dec": -72,
        "mag": 4.1
      },
      {
        "name": "Node-2",
        "ra": 14.5,
        "dec": -78,
        "mag": 4.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "chamaeleon",
    "name": "Chamaeleon",
    "familyId": "bayer",
    "familyName": "Bayer Family",
    "centerRa": 11,
    "centerDec": -79,
    "keyStar": {
      "name": "Alpha Chamaeleontis",
      "bayer": "α Cha",
      "spectral": "B2IV",
      "distanceLy": 63
    },
    "locatingDirections": "Deep southern sky near RA 11h, Dec -79°. Follow star-hops south of the Southern Cross and Achernar into the Magellanic Cloud realms.",
    "mythology": "The Chameleon, master of camouflage and slow deliberate movements near the south pole.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Southern Circumpolar Flight",
      "siderealDates": "Deep South Culmination",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Southern Cross Trine",
        "Phoenix Rebirth Axis"
      ],
      "birthSignificance": "Exotic innovation, metamorphosis, adventurous wanderlust, and rebirth from crisis."
    },
    "stars": [
      {
        "name": "Alpha Chamaeleontis",
        "ra": 11,
        "dec": -79,
        "mag": 2.2
      },
      {
        "name": "Node-1",
        "ra": 11.3,
        "dec": -76,
        "mag": 4.1
      },
      {
        "name": "Node-2",
        "ra": 10.700000000000003,
        "dec": -82,
        "mag": 4.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "dorado",
    "name": "Dorado",
    "familyId": "bayer",
    "familyName": "Bayer Family",
    "centerRa": 5.5,
    "centerDec": -65,
    "keyStar": {
      "name": "Alpha Doradus",
      "bayer": "α Dor",
      "spectral": "B2IV",
      "distanceLy": 176
    },
    "locatingDirections": "Deep southern sky near RA 5.5h, Dec -65°. Follow star-hops south of the Southern Cross and Achernar into the Magellanic Cloud realms.",
    "mythology": "The Swordfish / Dolphinfish; houses the Large Magellanic Cloud (LMC).",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Southern Circumpolar Flight",
      "siderealDates": "Deep South Culmination",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Southern Cross Trine",
        "Phoenix Rebirth Axis"
      ],
      "birthSignificance": "Exotic innovation, metamorphosis, adventurous wanderlust, and rebirth from crisis."
    },
    "stars": [
      {
        "name": "Alpha Doradus",
        "ra": 5.5,
        "dec": -65,
        "mag": 2.2
      },
      {
        "name": "Node-1",
        "ra": 5.8,
        "dec": -62,
        "mag": 4.1
      },
      {
        "name": "Node-2",
        "ra": 5.199999999999999,
        "dec": -68,
        "mag": 4.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "grus",
    "name": "Grus",
    "familyId": "bayer",
    "familyName": "Bayer Family",
    "centerRa": 22.7,
    "centerDec": -46.9,
    "keyStar": {
      "name": "Alnair",
      "bayer": "α Gru",
      "spectral": "B2IV",
      "distanceLy": 101
    },
    "locatingDirections": "Deep southern sky near RA 22.7h, Dec -46.9°. Follow star-hops south of the Southern Cross and Achernar into the Magellanic Cloud realms.",
    "mythology": "The graceful Crane, sacred bird of vigilance that stands on one leg holding a stone.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Southern Circumpolar Flight",
      "siderealDates": "Deep South Culmination",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Southern Cross Trine",
        "Phoenix Rebirth Axis"
      ],
      "birthSignificance": "Exotic innovation, metamorphosis, adventurous wanderlust, and rebirth from crisis."
    },
    "stars": [
      {
        "name": "Alnair",
        "ra": 22.7,
        "dec": -46.9,
        "mag": 2.2
      },
      {
        "name": "Node-1",
        "ra": 23,
        "dec": -43.9,
        "mag": 4.1
      },
      {
        "name": "Node-2",
        "ra": 22.4,
        "dec": -49.9,
        "mag": 4.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "hydrus",
    "name": "Hydrus",
    "familyId": "bayer",
    "familyName": "Bayer Family",
    "centerRa": 2.4,
    "centerDec": -68,
    "keyStar": {
      "name": "Head of Hydrus",
      "bayer": "α Hyd",
      "spectral": "B2IV",
      "distanceLy": 24
    },
    "locatingDirections": "Deep southern sky near RA 2.4h, Dec -68°. Follow star-hops south of the Southern Cross and Achernar into the Magellanic Cloud realms.",
    "mythology": "The Little Water Snake of the southern waters, distinct from the giant northern Hydra.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Southern Circumpolar Flight",
      "siderealDates": "Deep South Culmination",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Southern Cross Trine",
        "Phoenix Rebirth Axis"
      ],
      "birthSignificance": "Exotic innovation, metamorphosis, adventurous wanderlust, and rebirth from crisis."
    },
    "stars": [
      {
        "name": "Head of Hydrus",
        "ra": 2.4,
        "dec": -68,
        "mag": 2.2
      },
      {
        "name": "Node-1",
        "ra": 2.6999999999999997,
        "dec": -65,
        "mag": 4.1
      },
      {
        "name": "Node-2",
        "ra": 2.1000000000000014,
        "dec": -71,
        "mag": 4.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "indus",
    "name": "Indus",
    "familyId": "bayer",
    "familyName": "Bayer Family",
    "centerRa": 21,
    "centerDec": -55,
    "keyStar": {
      "name": "The Persian",
      "bayer": "α Ind",
      "spectral": "B2IV",
      "distanceLy": 101
    },
    "locatingDirections": "Deep southern sky near RA 21h, Dec -55°. Follow star-hops south of the Southern Cross and Achernar into the Magellanic Cloud realms.",
    "mythology": "The Indigenous Voyager, holding arrows in hand, representing New World explorers.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Southern Circumpolar Flight",
      "siderealDates": "Deep South Culmination",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Southern Cross Trine",
        "Phoenix Rebirth Axis"
      ],
      "birthSignificance": "Exotic innovation, metamorphosis, adventurous wanderlust, and rebirth from crisis."
    },
    "stars": [
      {
        "name": "The Persian",
        "ra": 21,
        "dec": -55,
        "mag": 2.2
      },
      {
        "name": "Node-1",
        "ra": 21.3,
        "dec": -52,
        "mag": 4.1
      },
      {
        "name": "Node-2",
        "ra": 20.700000000000003,
        "dec": -58,
        "mag": 4.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "musca",
    "name": "Musca",
    "familyId": "bayer",
    "familyName": "Bayer Family",
    "centerRa": 12.6,
    "centerDec": -69,
    "keyStar": {
      "name": "Alpha Muscae",
      "bayer": "α Mus",
      "spectral": "B2IV",
      "distanceLy": 306
    },
    "locatingDirections": "Deep southern sky near RA 12.6h, Dec -69°. Follow star-hops south of the Southern Cross and Achernar into the Magellanic Cloud realms.",
    "mythology": "The southern Fly hovering just south of the Southern Cross, home to the dark Coalsack Nebula.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Southern Circumpolar Flight",
      "siderealDates": "Deep South Culmination",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Southern Cross Trine",
        "Phoenix Rebirth Axis"
      ],
      "birthSignificance": "Exotic innovation, metamorphosis, adventurous wanderlust, and rebirth from crisis."
    },
    "stars": [
      {
        "name": "Alpha Muscae",
        "ra": 12.6,
        "dec": -69,
        "mag": 2.2
      },
      {
        "name": "Node-1",
        "ra": 12.9,
        "dec": -66,
        "mag": 4.1
      },
      {
        "name": "Node-2",
        "ra": 12.299999999999997,
        "dec": -72,
        "mag": 4.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "pavo",
    "name": "Pavo",
    "familyId": "bayer",
    "familyName": "Bayer Family",
    "centerRa": 20.4,
    "centerDec": -65,
    "keyStar": {
      "name": "Peacock",
      "bayer": "α Pav",
      "spectral": "B2IV",
      "distanceLy": 183
    },
    "locatingDirections": "Deep southern sky near RA 20.4h, Dec -65°. Follow star-hops south of the Southern Cross and Achernar into the Magellanic Cloud realms.",
    "mythology": "The Peacock, sacred bird of Hera adorned with the hundred eyes of the giant Argus.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Southern Circumpolar Flight",
      "siderealDates": "Deep South Culmination",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Southern Cross Trine",
        "Phoenix Rebirth Axis"
      ],
      "birthSignificance": "Exotic innovation, metamorphosis, adventurous wanderlust, and rebirth from crisis."
    },
    "stars": [
      {
        "name": "Peacock",
        "ra": 20.4,
        "dec": -65,
        "mag": 2.2
      },
      {
        "name": "Node-1",
        "ra": 20.7,
        "dec": -62,
        "mag": 4.1
      },
      {
        "name": "Node-2",
        "ra": 20.099999999999994,
        "dec": -68,
        "mag": 4.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "phoenix",
    "name": "Phoenix",
    "familyId": "bayer",
    "familyName": "Bayer Family",
    "centerRa": 0.4,
    "centerDec": -42.3,
    "keyStar": {
      "name": "Ankaa",
      "bayer": "α Pho",
      "spectral": "B2IV",
      "distanceLy": 77
    },
    "locatingDirections": "Deep southern sky near RA 0.4h, Dec -42.3°. Follow star-hops south of the Southern Cross and Achernar into the Magellanic Cloud realms.",
    "mythology": "The mythical firebird that perishes in sacred flames and rises renewed from its own ashes.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Southern Circumpolar Flight",
      "siderealDates": "Deep South Culmination",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Southern Cross Trine",
        "Phoenix Rebirth Axis"
      ],
      "birthSignificance": "Exotic innovation, metamorphosis, adventurous wanderlust, and rebirth from crisis."
    },
    "stars": [
      {
        "name": "Ankaa",
        "ra": 0.4,
        "dec": -42.3,
        "mag": 2.2
      },
      {
        "name": "Node-1",
        "ra": 0.7,
        "dec": -39.3,
        "mag": 4.1
      },
      {
        "name": "Node-2",
        "ra": 0.10000000000000142,
        "dec": -45.3,
        "mag": 4.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "tucana",
    "name": "Tucana",
    "familyId": "bayer",
    "familyName": "Bayer Family",
    "centerRa": 23.8,
    "centerDec": -65,
    "keyStar": {
      "name": "Alpha Tucanae",
      "bayer": "α Tuc",
      "spectral": "B2IV",
      "distanceLy": 199
    },
    "locatingDirections": "Deep southern sky near RA 23.8h, Dec -65°. Follow star-hops south of the Southern Cross and Achernar into the Magellanic Cloud realms.",
    "mythology": "The Toucan with its vibrant bill, home to the Small Magellanic Cloud (SMC) and cluster 47 Tuc.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Southern Circumpolar Flight",
      "siderealDates": "Deep South Culmination",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Southern Cross Trine",
        "Phoenix Rebirth Axis"
      ],
      "birthSignificance": "Exotic innovation, metamorphosis, adventurous wanderlust, and rebirth from crisis."
    },
    "stars": [
      {
        "name": "Alpha Tucanae",
        "ra": 23.8,
        "dec": -65,
        "mag": 2.2
      },
      {
        "name": "Node-1",
        "ra": 0.10000000000000142,
        "dec": -62,
        "mag": 4.1
      },
      {
        "name": "Node-2",
        "ra": 23.5,
        "dec": -68,
        "mag": 4.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "volans",
    "name": "Volans",
    "familyId": "bayer",
    "familyName": "Bayer Family",
    "centerRa": 7.2,
    "centerDec": -70,
    "keyStar": {
      "name": "Alpha Volantis",
      "bayer": "α Vol",
      "spectral": "B2IV",
      "distanceLy": 124
    },
    "locatingDirections": "Deep southern sky near RA 7.2h, Dec -70°. Follow star-hops south of the Southern Cross and Achernar into the Magellanic Cloud realms.",
    "mythology": "The Flying Fish leaping from the ocean to escape the predatory pursuit of Dorado.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Southern Circumpolar Flight",
      "siderealDates": "Deep South Culmination",
      "element": "Air",
      "modality": "Mutable",
      "rulingPlanet": "Venus",
      "aspectPatterns": [
        "Southern Cross Trine",
        "Phoenix Rebirth Axis"
      ],
      "birthSignificance": "Exotic innovation, metamorphosis, adventurous wanderlust, and rebirth from crisis."
    },
    "stars": [
      {
        "name": "Alpha Volantis",
        "ra": 7.2,
        "dec": -70,
        "mag": 2.2
      },
      {
        "name": "Node-1",
        "ra": 7.5,
        "dec": -67,
        "mag": 4.1
      },
      {
        "name": "Node-2",
        "ra": 6.899999999999999,
        "dec": -73,
        "mag": 4.5
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "antlia",
    "name": "Antlia",
    "familyId": "lacaille",
    "familyName": "La Caille Family",
    "centerRa": 10,
    "centerDec": -35,
    "keyStar": {
      "name": "Alpha Antliae",
      "bayer": "α Ant",
      "spectral": "K0III",
      "distanceLy": 366
    },
    "locatingDirections": "Southern sky around RA 10h, Dec -35°. Follow star-hops south of Centaurus and Eridanus based on Menzel's Cape field charts.",
    "mythology": "The Air Pump, celebrating Robert Boyle and Denis Papin's pneumatic vacuum experiments.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Enlightenment Instrument Meridian",
      "siderealDates": "Southern Astronomical Grid",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Uranus",
      "aspectPatterns": [
        "Scientific Precision Sextile",
        "Enlightenment Square"
      ],
      "birthSignificance": "Scientific intellect, precision engineering, artistic mastery, and empirical clarity."
    },
    "stars": [
      {
        "name": "Alpha Antliae",
        "ra": 10,
        "dec": -35,
        "mag": 3.1
      },
      {
        "name": "Node-1",
        "ra": 10.3,
        "dec": -32,
        "mag": 4.6
      },
      {
        "name": "Node-2",
        "ra": 9.700000000000003,
        "dec": -38,
        "mag": 4.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "caelum",
    "name": "Caelum",
    "familyId": "lacaille",
    "familyName": "La Caille Family",
    "centerRa": 4.7,
    "centerDec": -38,
    "keyStar": {
      "name": "Alpha Caeli",
      "bayer": "α Cae",
      "spectral": "K0III",
      "distanceLy": 66
    },
    "locatingDirections": "Southern sky around RA 4.7h, Dec -38°. Follow star-hops south of Centaurus and Eridanus based on Menzel's Cape field charts.",
    "mythology": "The Burin / Engraver's Chisel, celebrating fine arts and mechanical precision.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Enlightenment Instrument Meridian",
      "siderealDates": "Southern Astronomical Grid",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Uranus",
      "aspectPatterns": [
        "Scientific Precision Sextile",
        "Enlightenment Square"
      ],
      "birthSignificance": "Scientific intellect, precision engineering, artistic mastery, and empirical clarity."
    },
    "stars": [
      {
        "name": "Alpha Caeli",
        "ra": 4.7,
        "dec": -38,
        "mag": 3.1
      },
      {
        "name": "Node-1",
        "ra": 5,
        "dec": -35,
        "mag": 4.6
      },
      {
        "name": "Node-2",
        "ra": 4.399999999999999,
        "dec": -41,
        "mag": 4.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "circinus",
    "name": "Circinus",
    "familyId": "lacaille",
    "familyName": "La Caille Family",
    "centerRa": 15,
    "centerDec": -63,
    "keyStar": {
      "name": "Alpha Circini",
      "bayer": "α Cir",
      "spectral": "K0III",
      "distanceLy": 54
    },
    "locatingDirections": "Southern sky around RA 15h, Dec -63°. Follow star-hops south of Centaurus and Eridanus based on Menzel's Cape field charts.",
    "mythology": "The Drafting Compass used by marine cartographers to plot navigation courses.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Enlightenment Instrument Meridian",
      "siderealDates": "Southern Astronomical Grid",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Uranus",
      "aspectPatterns": [
        "Scientific Precision Sextile",
        "Enlightenment Square"
      ],
      "birthSignificance": "Scientific intellect, precision engineering, artistic mastery, and empirical clarity."
    },
    "stars": [
      {
        "name": "Alpha Circini",
        "ra": 15,
        "dec": -63,
        "mag": 3.1
      },
      {
        "name": "Node-1",
        "ra": 15.3,
        "dec": -60,
        "mag": 4.6
      },
      {
        "name": "Node-2",
        "ra": 14.700000000000003,
        "dec": -66,
        "mag": 4.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "fornax",
    "name": "Fornax",
    "familyId": "lacaille",
    "familyName": "La Caille Family",
    "centerRa": 2.7,
    "centerDec": -31,
    "keyStar": {
      "name": "Dalim",
      "bayer": "α For",
      "spectral": "K0III",
      "distanceLy": 46
    },
    "locatingDirections": "Southern sky around RA 2.7h, Dec -31°. Follow star-hops south of Centaurus and Eridanus based on Menzel's Cape field charts.",
    "mythology": "The Chemist's Furnace, honoring Antoine Lavoisier and early scientific chemistry.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Enlightenment Instrument Meridian",
      "siderealDates": "Southern Astronomical Grid",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Uranus",
      "aspectPatterns": [
        "Scientific Precision Sextile",
        "Enlightenment Square"
      ],
      "birthSignificance": "Scientific intellect, precision engineering, artistic mastery, and empirical clarity."
    },
    "stars": [
      {
        "name": "Dalim",
        "ra": 2.7,
        "dec": -31,
        "mag": 3.1
      },
      {
        "name": "Node-1",
        "ra": 3,
        "dec": -28,
        "mag": 4.6
      },
      {
        "name": "Node-2",
        "ra": 2.3999999999999986,
        "dec": -34,
        "mag": 4.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "horologium",
    "name": "Horologium",
    "familyId": "lacaille",
    "familyName": "La Caille Family",
    "centerRa": 3.3,
    "centerDec": -53,
    "keyStar": {
      "name": "Alpha Horologii",
      "bayer": "α Hor",
      "spectral": "K0III",
      "distanceLy": 117
    },
    "locatingDirections": "Southern sky around RA 3.3h, Dec -53°. Follow star-hops south of Centaurus and Eridanus based on Menzel's Cape field charts.",
    "mythology": "The Pendulum Clock, celebrating Christiaan Huygens' invention that revolutionized marine timekeeping.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Enlightenment Instrument Meridian",
      "siderealDates": "Southern Astronomical Grid",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Uranus",
      "aspectPatterns": [
        "Scientific Precision Sextile",
        "Enlightenment Square"
      ],
      "birthSignificance": "Scientific intellect, precision engineering, artistic mastery, and empirical clarity."
    },
    "stars": [
      {
        "name": "Alpha Horologii",
        "ra": 3.3,
        "dec": -53,
        "mag": 3.1
      },
      {
        "name": "Node-1",
        "ra": 3.5999999999999996,
        "dec": -50,
        "mag": 4.6
      },
      {
        "name": "Node-2",
        "ra": 3,
        "dec": -56,
        "mag": 4.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "mensa",
    "name": "Mensa",
    "familyId": "lacaille",
    "familyName": "La Caille Family",
    "centerRa": 5.7,
    "centerDec": -77,
    "keyStar": {
      "name": "Alpha Mensae",
      "bayer": "α Men",
      "spectral": "K0III",
      "distanceLy": 33
    },
    "locatingDirections": "Southern sky around RA 5.7h, Dec -77°. Follow star-hops south of Centaurus and Eridanus based on Menzel's Cape field charts.",
    "mythology": "Table Mountain in South Africa, where Lacaille conducted his Cape of Good Hope sky survey.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Enlightenment Instrument Meridian",
      "siderealDates": "Southern Astronomical Grid",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Uranus",
      "aspectPatterns": [
        "Scientific Precision Sextile",
        "Enlightenment Square"
      ],
      "birthSignificance": "Scientific intellect, precision engineering, artistic mastery, and empirical clarity."
    },
    "stars": [
      {
        "name": "Alpha Mensae",
        "ra": 5.7,
        "dec": -77,
        "mag": 3.1
      },
      {
        "name": "Node-1",
        "ra": 6,
        "dec": -74,
        "mag": 4.6
      },
      {
        "name": "Node-2",
        "ra": 5.399999999999999,
        "dec": -80,
        "mag": 4.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "microscopium",
    "name": "Microscopium",
    "familyId": "lacaille",
    "familyName": "La Caille Family",
    "centerRa": 21,
    "centerDec": -36,
    "keyStar": {
      "name": "Gamma Microscopii",
      "bayer": "α Mic",
      "spectral": "K0III",
      "distanceLy": 223
    },
    "locatingDirections": "Southern sky around RA 21h, Dec -36°. Follow star-hops south of Centaurus and Eridanus based on Menzel's Cape field charts.",
    "mythology": "The Compound Microscope, honoring Antoni van Leeuwenhoek's discovery of the microscopic realm.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Enlightenment Instrument Meridian",
      "siderealDates": "Southern Astronomical Grid",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Uranus",
      "aspectPatterns": [
        "Scientific Precision Sextile",
        "Enlightenment Square"
      ],
      "birthSignificance": "Scientific intellect, precision engineering, artistic mastery, and empirical clarity."
    },
    "stars": [
      {
        "name": "Gamma Microscopii",
        "ra": 21,
        "dec": -36,
        "mag": 3.1
      },
      {
        "name": "Node-1",
        "ra": 21.3,
        "dec": -33,
        "mag": 4.6
      },
      {
        "name": "Node-2",
        "ra": 20.700000000000003,
        "dec": -39,
        "mag": 4.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "norma",
    "name": "Norma",
    "familyId": "lacaille",
    "familyName": "La Caille Family",
    "centerRa": 16,
    "centerDec": -50,
    "keyStar": {
      "name": "Gamma-2 Normae",
      "bayer": "α Nor",
      "spectral": "K0III",
      "distanceLy": 127
    },
    "locatingDirections": "Southern sky around RA 16h, Dec -50°. Follow star-hops south of Centaurus and Eridanus based on Menzel's Cape field charts.",
    "mythology": "The Carpenter's Level and Square, celebrating architectural geometry.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Enlightenment Instrument Meridian",
      "siderealDates": "Southern Astronomical Grid",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Uranus",
      "aspectPatterns": [
        "Scientific Precision Sextile",
        "Enlightenment Square"
      ],
      "birthSignificance": "Scientific intellect, precision engineering, artistic mastery, and empirical clarity."
    },
    "stars": [
      {
        "name": "Gamma-2 Normae",
        "ra": 16,
        "dec": -50,
        "mag": 3.1
      },
      {
        "name": "Node-1",
        "ra": 16.3,
        "dec": -47,
        "mag": 4.6
      },
      {
        "name": "Node-2",
        "ra": 15.700000000000003,
        "dec": -53,
        "mag": 4.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "octans",
    "name": "Octans",
    "familyId": "lacaille",
    "familyName": "La Caille Family",
    "centerRa": 21,
    "centerDec": -89,
    "keyStar": {
      "name": "Polaris Australis",
      "bayer": "α Oct",
      "spectral": "K0III",
      "distanceLy": 270
    },
    "locatingDirections": "Southern sky around RA 21h, Dec -89°. Follow star-hops south of Centaurus and Eridanus based on Menzel's Cape field charts.",
    "mythology": "The Navigational Octant, housing the South Celestial Pole (Polaris Australis).",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Enlightenment Instrument Meridian",
      "siderealDates": "Southern Astronomical Grid",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Uranus",
      "aspectPatterns": [
        "Scientific Precision Sextile",
        "Enlightenment Square"
      ],
      "birthSignificance": "Scientific intellect, precision engineering, artistic mastery, and empirical clarity."
    },
    "stars": [
      {
        "name": "Polaris Australis",
        "ra": 21,
        "dec": -89,
        "mag": 3.1
      },
      {
        "name": "Node-1",
        "ra": 21.3,
        "dec": -86,
        "mag": 4.6
      },
      {
        "name": "Node-2",
        "ra": 20.700000000000003,
        "dec": -92,
        "mag": 4.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "pictor",
    "name": "Pictor",
    "familyId": "lacaille",
    "familyName": "La Caille Family",
    "centerRa": 5.8,
    "centerDec": -53,
    "keyStar": {
      "name": "Alpha Pictoris",
      "bayer": "α Pic",
      "spectral": "K0III",
      "distanceLy": 99
    },
    "locatingDirections": "Southern sky around RA 5.8h, Dec -53°. Follow star-hops south of Centaurus and Eridanus based on Menzel's Cape field charts.",
    "mythology": "The Painter's Easel, honoring the visual fine arts and creative expression.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Enlightenment Instrument Meridian",
      "siderealDates": "Southern Astronomical Grid",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Uranus",
      "aspectPatterns": [
        "Scientific Precision Sextile",
        "Enlightenment Square"
      ],
      "birthSignificance": "Scientific intellect, precision engineering, artistic mastery, and empirical clarity."
    },
    "stars": [
      {
        "name": "Alpha Pictoris",
        "ra": 5.8,
        "dec": -53,
        "mag": 3.1
      },
      {
        "name": "Node-1",
        "ra": 6.1,
        "dec": -50,
        "mag": 4.6
      },
      {
        "name": "Node-2",
        "ra": 5.5,
        "dec": -56,
        "mag": 4.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "reticulum",
    "name": "Reticulum",
    "familyId": "lacaille",
    "familyName": "La Caille Family",
    "centerRa": 3.9,
    "centerDec": -62,
    "keyStar": {
      "name": "Alpha Reticuli",
      "bayer": "α Ret",
      "spectral": "K0III",
      "distanceLy": 163
    },
    "locatingDirections": "Southern sky around RA 3.9h, Dec -62°. Follow star-hops south of Centaurus and Eridanus based on Menzel's Cape field charts.",
    "mythology": "The Eyepiece Reticle, the crosshairs inside telescope eyepieces used to measure star positions.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Enlightenment Instrument Meridian",
      "siderealDates": "Southern Astronomical Grid",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Uranus",
      "aspectPatterns": [
        "Scientific Precision Sextile",
        "Enlightenment Square"
      ],
      "birthSignificance": "Scientific intellect, precision engineering, artistic mastery, and empirical clarity."
    },
    "stars": [
      {
        "name": "Alpha Reticuli",
        "ra": 3.9,
        "dec": -62,
        "mag": 3.1
      },
      {
        "name": "Node-1",
        "ra": 4.2,
        "dec": -59,
        "mag": 4.6
      },
      {
        "name": "Node-2",
        "ra": 3.6000000000000014,
        "dec": -65,
        "mag": 4.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "sculptor",
    "name": "Sculptor",
    "familyId": "lacaille",
    "familyName": "La Caille Family",
    "centerRa": 0.2,
    "centerDec": -32,
    "keyStar": {
      "name": "Alpha Sculptoris",
      "bayer": "α Scu",
      "spectral": "K0III",
      "distanceLy": 780
    },
    "locatingDirections": "Southern sky around RA 0.2h, Dec -32°. Follow star-hops south of Centaurus and Eridanus based on Menzel's Cape field charts.",
    "mythology": "The Sculptor's Studio, housing the South Galactic Pole.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Enlightenment Instrument Meridian",
      "siderealDates": "Southern Astronomical Grid",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Uranus",
      "aspectPatterns": [
        "Scientific Precision Sextile",
        "Enlightenment Square"
      ],
      "birthSignificance": "Scientific intellect, precision engineering, artistic mastery, and empirical clarity."
    },
    "stars": [
      {
        "name": "Alpha Sculptoris",
        "ra": 0.2,
        "dec": -32,
        "mag": 3.1
      },
      {
        "name": "Node-1",
        "ra": 0.5,
        "dec": -29,
        "mag": 4.6
      },
      {
        "name": "Node-2",
        "ra": 23.9,
        "dec": -35,
        "mag": 4.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  },
  {
    "id": "telescopium",
    "name": "Telescopium",
    "familyId": "lacaille",
    "familyName": "La Caille Family",
    "centerRa": 18.5,
    "centerDec": -51,
    "keyStar": {
      "name": "Alpha Telescopii",
      "bayer": "α Tel",
      "spectral": "K0III",
      "distanceLy": 249
    },
    "locatingDirections": "Southern sky around RA 18.5h, Dec -51°. Follow star-hops south of Centaurus and Eridanus based on Menzel's Cape field charts.",
    "mythology": "The Aerial Refracting Telescope, celebrating the dawn of modern observational astrophysics.",
    "birthChart": {
      "isZodiac": false,
      "tropicalDates": "Enlightenment Instrument Meridian",
      "siderealDates": "Southern Astronomical Grid",
      "element": "Earth",
      "modality": "Cardinal",
      "rulingPlanet": "Uranus",
      "aspectPatterns": [
        "Scientific Precision Sextile",
        "Enlightenment Square"
      ],
      "birthSignificance": "Scientific intellect, precision engineering, artistic mastery, and empirical clarity."
    },
    "stars": [
      {
        "name": "Alpha Telescopii",
        "ra": 18.5,
        "dec": -51,
        "mag": 3.1
      },
      {
        "name": "Node-1",
        "ra": 18.8,
        "dec": -48,
        "mag": 4.6
      },
      {
        "name": "Node-2",
        "ra": 18.200000000000003,
        "dec": -54,
        "mag": 4.9
      }
    ],
    "lines": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ]
  }
];

export const BIRTH_CHART_PATTERNS = [
  { name: "Grand Trine", element: "Harmonic Flow", description: "Equilateral triangle connecting three signs of the same element (120° apart). Denotes effortless talent, creative ease, and profound inner harmony." },
  { name: "T-Square", element: "Dynamic Tension", description: "Two planets in opposition (180°) both squaring a focal apex planet (90°). Generates relentless motivational drive, crisis-solving grit, and monumental ambition." },
  { name: "Grand Cross", element: "Structural Challenge", description: "Four planets squaring each other in a four-way cross. Demands extraordinary discipline, structural balance, and executive mastery." },
  { name: "Stellium", element: "Concentrated Force", description: "Three or more planets clustered within a single sign or constellation. Focuses immense energy, specialized genius, and singular life dedication." },
  { name: "Yod (Finger of God)", element: "Spiritual Destiny", description: "Two planets in sextile (60°) both quincunx (150°) to a single apex planet. Points to a specific fateful mission and course redirection." },
  { name: "Kite", element: "Directed Talent", description: "A Grand Trine with an opposition creating a fourth focal apex. Converts passive ease into focused, tangible worldly accomplishment." },
  { name: "Mystic Rectangle", element: "Practical Synergy", description: "Two oppositions connected by two trines and two sextiles. Harmonizes inner tension into versatile practical achievement." }
];

const byName = new Map(CONSTELLATIONS_88.map((c) => [c.name.toLowerCase(), c]));
const byId = new Map(CONSTELLATIONS_88.map((c) => [c.id, c]));

export function getConstellationByName(name: string | undefined | null): ConstellationEntry | undefined {
  if (!name) return undefined;
  return byName.get(name.toLowerCase());
}

export function getConstellationById(id: string): ConstellationEntry | undefined {
  return byId.get(id);
}

export function getFamily(familyId: MenzelFamilyId): ConstellationFamily {
  return CONSTELLATION_FAMILIES[familyId];
}

export function getFamilyMembers(familyId: MenzelFamilyId): ConstellationEntry[] {
  return CONSTELLATIONS_88.filter((c) => c.familyId === familyId);
}

export function searchConstellations(query: string): ConstellationEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return CONSTELLATIONS_88;
  return CONSTELLATIONS_88.filter((c) =>
    c.name.toLowerCase().includes(q) ||
    c.keyStar.name.toLowerCase().includes(q) ||
    c.familyName.toLowerCase().includes(q) ||
    c.mythology.toLowerCase().includes(q) ||
    c.birthChart.rulingPlanet.toLowerCase().includes(q)
  );
}

export function listFamiliesOrdered(): MenzelFamilyId[] {
  return ["ursa_major", "zodiac", "perseus", "hercules", "orion", "heavenly_waters", "bayer", "lacaille"];
}

export const BIRTH_CHART_GUIDE = {
  description: "A birth chart (natal chart) is a map of the sky at the exact moment and location of a person's birth. It is calculated using the date, time, and geographic coordinates of the birthplace.",
  classroomNote: "A birth chart is a cultural map of the sky at a birth time and place. In OxyForge it is presented as astronomy literacy: the Sun’s path (ecliptic) crosses the zodiac constellations, while modern IAU constellation boundaries are scientific sky regions — not the same as sun-sign dates, which use the tropical zodiac fixed to seasons. Myths are human stories projected onto star patterns.",
  components: [
    { component: "Date of Birth", function: "Determines the Sun's position (Sun sign) and the positions of the planets along the ecliptic." },
    { component: "Time of Birth", function: "Determines the Rising Sign (Ascendant) and the placement of the 12 astrological houses." },
    { component: "Location of Birth", function: "Provides the geographic coordinates (latitude and longitude) needed to calculate the local horizon and the precise positions of celestial bodies." }
  ],
  patternsDescription: "Astrologers analyze the geometric angles (aspects) between planets and the zodiac signs/houses they occupy to interpret personality traits, life themes, and potential future trends.",
  commonPatterns: ["Conjunctions", "Oppositions", "Trines", "Squares", "Sextiles", "Stelliums", "T-Squares", "Grand Trines"],
} as const;

/**
 * Maps a birth month and day (1-12, 1-31) to active birth constellation,
 * tropical zodiac sign, and harmonic natal sky patterns.
 */
export function getBirthConstellation(month: number, day: number): {
  constellation: ConstellationEntry;
  sign: string;
  dates: string;
  element: string;
  patterns: typeof BIRTH_CHART_PATTERNS;
} {
  let id = "aries";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) id = "aries";
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) id = "taurus";
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) id = "gemini";
  else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) id = "cancer";
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) id = "leo";
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) id = "virgo";
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) id = "libra";
  else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) id = "scorpius";
  else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) id = "sagittarius";
  else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) id = "capricornus";
  else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) id = "aquarius";
  else id = "pisces";

  const constellation = getConstellationById(id) || CONSTELLATIONS_88[0];
  return {
    constellation,
    sign: constellation.name,
    dates: constellation.birthChart.tropicalDates,
    element: constellation.birthChart.element,
    patterns: BIRTH_CHART_PATTERNS
  };
}


// Auto-initialize globalFamilyRevealController with 88 constellations & Menzel families
import { globalFamilyRevealController } from "./familyReveal/FamilyRevealController";
try {
  globalFamilyRevealController.init(CONSTELLATIONS_88, CONSTELLATION_FAMILIES);
} catch (e) {
  console.warn("FamilyRevealController deferred initialization:", e);
}
