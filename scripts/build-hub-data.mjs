#!/usr/bin/env node
/**
 * scripts/build-hub-data.mjs
 *
 * Extracts the game's own content tables out of index.html and writes
 * hub/data/content.json (+ hub/data/content.js for file:// use), so the
 * Learning Hub always reflects what the game actually ships.
 *
 * Nothing from the game runs: each `var NAME = <literal>;` is brace-matched
 * (string/comment aware) and evaluated alone inside an empty vm context.
 *
 * Usage:  node scripts/build-hub-data.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = readFileSync(resolve(ROOT, 'index.html'), 'utf8');

/** Return the source text of the first `var|const|let NAME = <literal>` initialiser. */
function extractLiteral(name) {
  const re = new RegExp(`(?:^|\\n)\\s*(?:var|const|let)\\s+${name}\\s*=\\s*`, 'm');
  const m = re.exec(SRC);
  if (!m) throw new Error(`Cannot find "${name}" in index.html`);
  const start = m.index + m[0].length;
  const open = SRC[start];
  const close = open === '{' ? '}' : open === '[' ? ']' : null;
  if (!close) throw new Error(`"${name}" does not start with { or [`);

  let depth = 0;
  for (let i = start; i < SRC.length; i++) {
    const c = SRC[i];
    const n = SRC[i + 1];
    if (c === '/' && n === '/') { i = SRC.indexOf('\n', i); if (i < 0) break; continue; }
    if (c === '/' && n === '*') { i = SRC.indexOf('*/', i + 2) + 1; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const q = c;
      for (i++; i < SRC.length; i++) {
        if (SRC[i] === '\\') { i++; continue; }
        if (SRC[i] === q) break;
      }
      continue;
    }
    if (c === open) depth++;
    else if (c === close && --depth === 0) return SRC.slice(start, i + 1);
  }
  throw new Error(`Unbalanced literal for "${name}"`);
}

function evalLiteral(name) {
  const code = extractLiteral(name);
  // Empty context: only plain data (functions inside are created, never called).
  return vm.runInNewContext(`(${code})`, Object.create(null), { timeout: 2000 });
}

const plain = (v) => JSON.parse(JSON.stringify(v)); // drops functions, keeps data

/* ---------- Regional species ---------- */

/* ---------- Alpenhof Bavarian Alpine Flora & Botanical Library ---------- */
const ALPENHOF_SPECIES_TYPES = {
  // Streuobst Fruit & Timber Trees
  alp_apple: {
    label: 'Boskoop Apple', sciName: 'Malus domestica', category: 'Fruit Tree', icon: '🍎', cost: 22,
    canopy: '#B71C1C', trunk: '#4E342E', shape: 'round', dotColor: '#D32F2F',
    fact: 'Heirloom tart winter cooking apple with textured russet-red blush. Dense applewood prized for culinary smoking.',
    stages: [{ n: 'Sprout (1.2h)' }, { n: 'Vegetative (2.3h)' }, { n: 'Flowering (1.8h)' }, { n: 'Mature (1.7h)' }],
    o2AtStage: [1, 3, 6, 8]
  },
  alp_pear: {
    label: 'Williams Pear', sciName: 'Pyrus communis', category: 'Fruit Tree', icon: '🍐', cost: 24,
    canopy: '#C0CA33', trunk: '#4E342E', shape: 'conical', dotColor: '#FBC02D',
    fact: 'Teardrop golden-chartreuse speckled pears on upright pyramidal boughs. Luxury fine-grained Swiss pearwood.',
    stages: [{ n: 'Sprout (1.1h)' }, { n: 'Vegetative (2.2h)' }, { n: 'Flowering (1.6h)' }, { n: 'Mature (1.6h)' }],
    o2AtStage: [1, 3, 5, 7]
  },
  alp_cherry: {
    label: 'Sweet Mountain Cherry', sciName: 'Prunus avium', category: 'Fruit Tree', icon: '🍒', cost: 20,
    canopy: '#880E4F', trunk: '#3E2723', shape: 'round', dotColor: '#AD1457',
    fact: 'Glossy ruby-black heart cherries clustered on dark lenticel bark. Rich red heartwood cabinetry timber.',
    stages: [{ n: 'Sprout (1.0h)' }, { n: 'Vegetative (2.0h)' }, { n: 'Flowering (1.5h)' }, { n: 'Mature (1.5h)' }],
    o2AtStage: [1, 2, 4, 6]
  },
  alp_plum: {
    label: 'Bavarian Damson Plum', sciName: 'Prunus domestica', category: 'Fruit Tree', icon: '🫐', cost: 18,
    canopy: '#4A148C', trunk: '#3E2723', shape: 'round', dotColor: '#7E57C2',
    fact: 'Deep indigo-purple damson plums with frosty powdery-blue wax bloom. Classic Bavarian Zwetschgenkuchen fruit.',
    stages: [{ n: 'Sprout (1.0h)' }, { n: 'Vegetative (2.0h)' }, { n: 'Flowering (1.5h)' }, { n: 'Mature (1.5h)' }],
    o2AtStage: [1, 2, 4, 6]
  },
  alp_beech: {
    label: 'European Red Beech', sciName: 'Fagus sylvatica', category: 'Oxygen Tree', icon: '🍃', cost: 35,
    canopy: '#2E7D32', trunk: '#78909C', shape: 'round', dotColor: '#1B5E20',
    fact: 'Majestic silver-grey columnar trunk with horizontal layered leaf canopies. Heavy structural alpine timber (+28 O₂/s).',
    stages: [{ n: 'Sprout (2.0h)' }, { n: 'Vegetative (4.5h)' }, { n: 'Flowering (2.5h)' }, { n: 'Mature (3.0h)' }],
    o2AtStage: [4, 10, 20, 28]
  },
  alp_oak: {
    label: 'Ancient English Oak', sciName: 'Quercus robur', category: 'Oxygen Tree', icon: '🌳', cost: 45,
    canopy: '#1B5E20', trunk: '#4E342E', shape: 'round', dotColor: '#8D6E63',
    fact: 'Ancient rugged fissured bark with heavy gnarled limbs and golden acorns. Weatherproof timber beams (+32 O₂/s).',
    stages: [{ n: 'Sprout (2.5h)' }, { n: 'Vegetative (5.5h)' }, { n: 'Flowering (3.0h)' }, { n: 'Mature (3.0h)' }],
    o2AtStage: [5, 12, 24, 32]
  },
  alp_linden: {
    label: 'Small-Leaved Linden', sciName: 'Tilia cordata', category: 'Oxygen Tree', icon: '🌿', cost: 30,
    canopy: '#558B2F', trunk: '#4E342E', shape: 'round', dotColor: '#FFF9C4',
    fact: 'Heart-shaped crown with intensely fragrant cream-yellow blossom bracts. Traditional Bavarian village honey tree.',
    stages: [{ n: 'Sprout (1.5h)' }, { n: 'Vegetative (3.5h)' }, { n: 'Flowering (2.0h)' }, { n: 'Mature (2.0h)' }],
    o2AtStage: [3, 8, 16, 22]
  },
  alp_spruce: {
    label: 'Norway Spruce', sciName: 'Picea abies', category: 'Biodiversity Tree', icon: '🌲', cost: 25,
    canopy: '#1B5E20', trunk: '#5D4037', shape: 'conical', dotColor: '#388E3C',
    fact: 'Tiered pyramidal alpine conifer with drooping needle sprays and hanging cones. Crucial mountain storm windbreak.',
    stages: [{ n: 'Sprout (1.5h)' }, { n: 'Vegetative (3.0h)' }, { n: 'Flowering (2.0h)' }, { n: 'Mature (2.5h)' }],
    o2AtStage: [2, 6, 12, 18]
  },
  alp_fir: {
    label: 'European Silver Fir', sciName: 'Abies alba', category: 'Biodiversity Tree', icon: '🌲', cost: 28,
    canopy: '#33691E', trunk: '#4E342E', shape: 'conical', dotColor: '#558B2F',
    fact: 'Deep taproot evergreen with silver-banded needles. Resists heavy mountain snow and anchors steep slopes against avalanches.',
    stages: [{ n: 'Sprout (1.5h)' }, { n: 'Vegetative (3.2h)' }, { n: 'Flowering (2.0h)' }, { n: 'Mature (2.5h)' }],
    o2AtStage: [2, 6, 11, 17]
  },
  alp_cembra: {
    label: 'Swiss Stone Pine (Zirbelkiefer)', sciName: 'Pinus cembra', category: 'Biodiversity Tree', icon: '🌲', cost: 55,
    canopy: '#1B5E20', trunk: '#4E342E', shape: 'conical', dotColor: '#2E7D32',
    fact: 'The revered "Queen of the Alps". Thrives in rocky soil up to the timberline, emitting soothing essential pinosylvin terpenes.',
    stages: [{ n: 'Sprout (2.0h)' }, { n: 'Vegetative (5.0h)' }, { n: 'Flowering (3.0h)' }, { n: 'Mature (3.0h)' }],
    o2AtStage: [4, 12, 24, 35]
  },
  alp_aucuparia: {
    label: 'Mountain Ash (Vogelbeere)', sciName: 'Sorbus aucuparia', category: 'Biodiversity Tree', icon: '🌳', cost: 45,
    canopy: '#2E7D32', trunk: '#5D4037', shape: 'round', dotColor: '#FF3D00',
    fact: 'Crucial keystone species for alpine birds. Dense scarlet berry clusters feed over 63 native mountain avian species.',
    stages: [{ n: 'Sprout (1.2h)' }, { n: 'Vegetative (3.0h)' }, { n: 'Flowering (2.0h)' }, { n: 'Mature (2.0h)' }],
    o2AtStage: [3, 8, 18, 28]
  },
  alp_pseudoplatanus: {
    label: 'Sycamore Maple (Berg-Ahorn)', sciName: 'Acer pseudoplatanus', category: 'Oxygen Tree', icon: '🌳', cost: 50,
    canopy: '#1B5E20', trunk: '#3E2723', shape: 'round', dotColor: '#4CAF50',
    fact: 'Majestic Bavarian alpine giant living 500 years. Forms grand shade canopies that cool ground temperatures by up to 5°C.',
    stages: [{ n: 'Sprout (2.0h)' }, { n: 'Vegetative (5.0h)' }, { n: 'Flowering (3.0h)' }, { n: 'Mature (3.0h)' }],
    o2AtStage: [5, 14, 28, 40]
  },
  alp_decidua: {
    label: 'European Larch (Lärche)', sciName: 'Larix decidua', category: 'Biodiversity Tree', icon: '🌲', cost: 48,
    canopy: '#33691E', trunk: '#3E2723', shape: 'conical', dotColor: '#FBC02D',
    fact: 'The only deciduous alpine conifer. Light needle rosettes turn brilliant molten gold in October with deep storm-resistant taproots.',
    stages: [{ n: 'Sprout (1.8h)' }, { n: 'Vegetative (4.2h)' }, { n: 'Flowering (2.5h)' }, { n: 'Mature (2.5h)' }],
    o2AtStage: [4, 12, 25, 36]
  },

  // Alpine Flowers
  alp_edelweiss: {
    label: 'Alpen-Edelweiß', sciName: 'Leontopodium nivale', category: 'Alpine Flower', icon: '⭐', cost: 14,
    canopy: '#ECEFF1', trunk: '#78909C', shape: 'round', dotColor: '#FFD54F',
    fact: 'Silvery star velvet petals with high-altitude UV shielding. The legendary symbol of alpine purity and pollinator vigor.',
    stages: [{ n: 'Sprout (0.5h)' }, { n: 'Vegetative (1.0h)' }, { n: 'Budding (0.8h)' }, { n: 'Full Bloom (0.7h)' }],
    o2AtStage: [2, 4, 8, 12]
  },
  alp_enzian: {
    label: 'Frühlings-Enzian', sciName: 'Gentiana verna', category: 'Alpine Flower', icon: '🔔', cost: 15,
    canopy: '#0D47A1', trunk: '#1976D2', shape: 'round', dotColor: '#82B1FF',
    fact: 'Deep alpine cobalt trumpet blossoms with medicinal bitter roots. An irresistible magnet for wild mountain bumblebees.',
    stages: [{ n: 'Sprout (0.5h)' }, { n: 'Vegetative (1.0h)' }, { n: 'Budding (0.8h)' }, { n: 'Full Bloom (0.7h)' }],
    o2AtStage: [2, 5, 9, 14]
  },
  alp_alpenrose: {
    label: 'Rostblättrige Alpenrose', sciName: 'Rhododendron ferrugineum', category: 'Alpine Flower', icon: '🌺', cost: 16,
    canopy: '#C2185B', trunk: '#880E4F', shape: 'round', dotColor: '#F48FB1',
    fact: 'Crimson subalpine rhododendron shrub covering rocky mountainsides. Provides dense forest-edge shelter for mountain grouse.',
    stages: [{ n: 'Sprout (0.6h)' }, { n: 'Vegetative (1.2h)' }, { n: 'Budding (1.0h)' }, { n: 'Full Bloom (0.8h)' }],
    o2AtStage: [2, 5, 10, 15]
  },
  alp_arnika: {
    label: 'Echte Berg-Arnika', sciName: 'Arnica montana', category: 'Alpine Flower', icon: '🌼', cost: 12,
    canopy: '#FFB300', trunk: '#FFA000', shape: 'round', dotColor: '#FF6F00',
    fact: 'Golden solar healer flower renowned for soothing herbal remedies. Attracts over 40 species of native alpine hoverflies.',
    stages: [{ n: 'Sprout (0.4h)' }, { n: 'Vegetative (0.8h)' }, { n: 'Budding (0.6h)' }, { n: 'Full Bloom (0.6h)' }],
    o2AtStage: [1, 3, 6, 10]
  },
  alp_bergaster: {
    label: 'Kalk-Alpenaster', sciName: 'Aster alpinus', category: 'Alpine Flower', icon: '🌸', cost: 12,
    canopy: '#AB47BC', trunk: '#7B1FA2', shape: 'round', dotColor: '#FFD54F',
    fact: 'Lavender mountain daisy thriving in rocky limestone fissures. Staple late-season autumn nectar source before alpine winter.',
    stages: [{ n: 'Sprout (0.4h)' }, { n: 'Vegetative (0.8h)' }, { n: 'Budding (0.6h)' }, { n: 'Full Bloom (0.6h)' }],
    o2AtStage: [1, 3, 6, 10]
  },
  alp_alpenmohn: {
    label: 'Weißer Alpen-Mohn', sciName: 'Papaver alpinum', category: 'Alpine Flower', icon: '🏵️', cost: 11,
    canopy: '#FFF59D', trunk: '#FBC02D', shape: 'round', dotColor: '#F57F17',
    fact: 'Delicate papery alpine poppy with flexible fibrous roots that physically stabilize steep scree slopes against erosion.',
    stages: [{ n: 'Sprout (0.4h)' }, { n: 'Vegetative (0.7h)' }, { n: 'Budding (0.5h)' }, { n: 'Full Bloom (0.5h)' }],
    o2AtStage: [1, 3, 5, 9]
  },

  // Bauerngarten Vegetables & Crops
  alp_kuerbis: {
    label: 'Alpen-Hokkaido Kürbis', sciName: 'Cucurbita maxima', category: 'Vegetable', icon: '🎃', cost: 12,
    canopy: '#F57C00', trunk: '#E65100', shape: 'round', dotColor: '#FFE082',
    fact: 'Vigorous sprawling squash with edible orange skin and nutty chestnut flavor. Thrives climbing supported bamboo trellis beds.',
    stages: [{ n: 'Sprout (0.6h)' }, { n: 'Vine Growth (1.2h)' }, { n: 'Flowering (0.9h)' }, { n: 'Mature Squash (0.8h)' }],
    o2AtStage: [1, 3, 7, 10]
  },
  alp_zucchini: {
    label: 'Bayerische Zucchini', sciName: 'Cucurbita pepo', category: 'Vegetable', icon: '🥒', cost: 10,
    canopy: '#2E7D32', trunk: '#1B5E20', shape: 'round', dotColor: '#81C784',
    fact: 'Crisp emerald summer squash with tender edible golden blossoms. High daily vegetative water uptake promotes soil hydration.',
    stages: [{ n: 'Sprout (0.5h)' }, { n: 'Leaf Canopy (1.0h)' }, { n: 'Blossoms (0.7h)' }, { n: 'Harvest (0.6h)' }],
    o2AtStage: [1, 3, 5, 8]
  },
  alp_spargel: {
    label: 'Königs-Spargel', sciName: 'Asparagus officinalis', category: 'Vegetable', icon: '🎋', cost: 16,
    canopy: '#7CB342', trunk: '#558B2F', shape: 'conical', dotColor: '#C8E6C9',
    fact: 'Purple-tipped perennial spears harvested from deep sandy-loam raised trenches. High mineral and nitrogen soil accumulator.',
    stages: [{ n: 'Crown Root (0.8h)' }, { n: 'Spear Growth (1.5h)' }, { n: 'Fern Foliage (1.2h)' }, { n: 'Harvest (0.9h)' }],
    o2AtStage: [2, 5, 9, 14]
  },
  alp_rotkohl: {
    label: 'Bayerischer Rotkohl', sciName: 'Brassica oleracea var. capitata', category: 'Vegetable', icon: '🥬', cost: 10,
    canopy: '#C2185B', trunk: '#880E4F', shape: 'round', dotColor: '#F8BBD0',
    fact: 'Dense purple-red cabbage head rich in anthocyanin antioxidants. Traditional accompaniment to hearty Bavarian farm dumplings.',
    stages: [{ n: 'Sprout (0.5h)' }, { n: 'Foliage (1.1h)' }, { n: 'Heading (0.9h)' }, { n: 'Tight Head (0.7h)' }],
    o2AtStage: [1, 3, 6, 9]
  },
  alp_karotte: {
    label: 'Ochsenherz-Karotte', sciName: 'Daucus carota subsp. sativus', category: 'Vegetable', icon: '🥕', cost: 8,
    canopy: '#388E3C', trunk: '#FF6F00', shape: 'conical', dotColor: '#FFA000',
    fact: 'Thick, sweet, heart-shaped heirloom carrot that pierces through stony alpine soil to loosen hardpan clay crusts.',
    stages: [{ n: 'Feather Foliage (0.4h)' }, { n: 'Root Tap (0.9h)' }, { n: 'Root Swell (0.7h)' }, { n: 'Mature Taproot (0.6h)' }],
    o2AtStage: [1, 2, 5, 8]
  },
  alp_radi: {
    label: 'Münchner Bier-Radi', sciName: 'Raphanus sativus', category: 'Vegetable', icon: '🌱', cost: 8,
    canopy: '#43A047', trunk: '#E0E0E0', shape: 'conical', dotColor: '#E91E63',
    fact: 'Crisp, spicy white winter radish spiraled into traditional beer-garden garlands. Fast-cycling soil aerator crop.',
    stages: [{ n: 'Seedling (0.3h)' }, { n: 'Leaf Rosette (0.7h)' }, { n: 'Bulb Swell (0.6h)' }, { n: 'Crisp Harvest (0.5h)' }],
    o2AtStage: [1, 2, 4, 7]
  },
  alp_dinkel: {
    label: 'Allgäuer Ur-Dinkel (Spelt)', sciName: 'Triticum spelta', category: 'Crop & Grain', icon: '🌾', cost: 12,
    canopy: '#FFA000', trunk: '#FF8F00', shape: 'conical', dotColor: '#FFE082',
    fact: 'Ancient heritage hulled spelt wheat cultivated in the Alps for 3,000 years. Heavy fibrous husk resists harsh alpine frosts.',
    stages: [{ n: 'Tillering (0.7h)' }, { n: 'Stem Extension (1.3h)' }, { n: 'Heading (1.0h)' }, { n: 'Golden Harvest (0.8h)' }],
    o2AtStage: [2, 5, 9, 14]
  },
  alp_roggen: {
    label: 'Alpen-Bergroggen (Rye)', sciName: 'Secale cereale', category: 'Crop & Grain', icon: '🌾', cost: 10,
    canopy: '#8D6E63', trunk: '#6D4C41', shape: 'conical', dotColor: '#D7CCC8',
    fact: 'Hardy alpine mountain rye that germinates at near-freezing temperatures. Gives traditional farmhouse loaves their crusty chew.',
    stages: [{ n: 'Tillering (0.6h)' }, { n: 'Stem Extension (1.2h)' }, { n: 'Heading (0.9h)' }, { n: 'Golden Harvest (0.7h)' }],
    o2AtStage: [2, 4, 8, 11]
  }
};

const ALPENHOF_SPECIES_LIB = {
  alp_apple: { firstFound: 'Boskoop, Netherlands / Cultivated widely in Bavarian Alps', maxAgeYears: 120, fruitingTime: 'Autumn (October)', photosynthesis: 'High canopy leaf area index yielding up to 8 kg O₂/hr', disease: 'Apple Scab', cure: 'Canopy pruning to increase airflow' },
  alp_pear: { firstFound: 'Berkshire, UK / Swiss Alpine Selection', maxAgeYears: 140, fruitingTime: 'Late Summer (September)', photosynthesis: 'Dense pyramidal foliage transpiring up to 7 kg O₂/hr', disease: 'Pear Rust', cure: 'Remove nearby juniper hosts & spray horsetail tea' },
  alp_cherry: { firstFound: 'Eurasia / Bavarian Foothills', maxAgeYears: 90, fruitingTime: 'Early Summer (July)', photosynthesis: 'Glossy leaves pumping 6 kg O₂/hr', disease: 'Cherry Leaf Spot', cure: 'Copper fungicide & autumn leaf removal' },
  alp_plum: { firstFound: 'Damascus / Franconian Valleys', maxAgeYears: 70, fruitingTime: 'Late Summer (August)', photosynthesis: 'Compact canopy releasing 6 kg O₂/hr', disease: 'Pocket Plum Fungus', cure: 'Prune infected fruit shoots before spore release' },
  alp_beech: { firstFound: 'Central Europe / Bavarian Forest National Park', maxAgeYears: 400, fruitingTime: 'Autumn Beech Mast (October)', photosynthesis: 'Layered horizontal shade canopies releasing 28 kg O₂/hr', disease: 'Beech Bark Disease', cure: 'Maintain balanced soil humus and avoid trunk mechanical wounds' },
  alp_oak: { firstFound: 'European Old-Growth Woodlands', maxAgeYears: 800, fruitingTime: 'Autumn Acorns (October)', photosynthesis: 'Massive photosynthetic leaf surface generating 32 kg O₂/hr', disease: 'Oak Powdery Mildew', cure: 'Sulfur wash & increase mycorrhizal root aeration' },
  alp_linden: { firstFound: 'Central & Eastern European River Valleys', maxAgeYears: 600, fruitingTime: 'Summer Blossoms (July)', photosynthesis: 'High transpiration rate exhaling 22 kg O₂/hr', disease: 'Linden Gall Mite', cure: 'Encourage predatory beneficial mites & ladybugs' },
  alp_spruce: { firstFound: 'Boreal Taiga & High Alps', maxAgeYears: 500, fruitingTime: 'Autumn Seed Cones (October)', photosynthesis: 'Year-round evergreen photosynthesis producing 18 kg O₂/hr', disease: 'Spruce Bark Beetle', cure: 'Timely felling of dead snags & pheromone traps' },
  alp_fir: { firstFound: 'European Montane Mountain Forests', maxAgeYears: 450, fruitingTime: 'Upright Cones (October)', photosynthesis: 'Resinous deep needle canopy yielding 17 kg O₂/hr', disease: 'Fir Aphids', cure: 'Encourage hoverfly larvae & lacewings' },
  alp_cembra: { firstFound: 'Central Alps Timberline (1,500m - 2,200m)', maxAgeYears: 1000, fruitingTime: 'Late Autumn Cones (November)', photosynthesis: 'Dense 5-needle fascicles generating 35 kg O₂/hr at freezing temps', disease: 'Blister Rust', cure: 'Prune lower infected limbs & plant on gravel mounds' },
  alp_aucuparia: { firstFound: 'High Alpine Escarpments & Hedgerows', maxAgeYears: 120, fruitingTime: 'Autumn Berries (September)', photosynthesis: 'Feathery pinnate foliage producing 28 kg O₂/hr', disease: 'Fireblight', cure: 'Sterilize pruning tools and cut 30cm below infected branch' },
  alp_pseudoplatanus: { firstFound: 'Bavarian Alps Mountain Screes', maxAgeYears: 500, fruitingTime: 'Winged Samaras (September)', photosynthesis: 'Immense architectural leaves pumping 40 kg O₂/hr', disease: 'Tar Spot Fungus', cure: 'Rake and compost fallen autumn leaves' },
  alp_decidua: { firstFound: 'European Alps & Carpathians', maxAgeYears: 600, fruitingTime: 'Spring Cones (May)', photosynthesis: 'Delicate light-green needle rosettes producing 36 kg O₂/hr', disease: 'Larch Canker', cure: 'Plant on sun-exposed well-drained hillsides' },
  alp_edelweiss: { firstFound: 'Limestone Crags of the European Alps', maxAgeYears: 8, fruitingTime: 'Summer (July - August)', photosynthesis: 'UV-reflective felted leaves producing 12 kg O₂/hr', disease: 'Root Rot from Waterlogging', cure: 'Plant in coarse mineral scree with excellent drainage' },
  alp_enzian: { firstFound: 'High Alpine Meadows & Calcareous Turf', maxAgeYears: 15, fruitingTime: 'Spring (May - June)', photosynthesis: 'Deep blue trumpet petals yielding 14 kg O₂/hr', disease: 'Gentian Rust', cure: 'Maintain diverse companion grasses and avoid over-fertilizing' },
  alp_alpenrose: { firstFound: 'Subalpine Acidic Moorlands', maxAgeYears: 25, fruitingTime: 'Early Summer (June)', photosynthesis: 'Evergreen leathery foliage generating 15 kg O₂/hr', disease: 'Leaf Gall Fungus', cure: 'Hand-pick galls before spore release' },
  alp_arnika: { firstFound: 'Unfertilized Alpine Mountain Pastures', maxAgeYears: 12, fruitingTime: 'Mid Summer (July)', photosynthesis: 'Sun-tracking golden rays producing 10 kg O₂/hr', disease: 'Soil Silt Scurf', cure: 'Avoid heavy nitrogen fertilizers; maintain acidic humus' },
  alp_bergaster: { firstFound: 'Limestone Ledges & Scree Slopes', maxAgeYears: 10, fruitingTime: 'Late Summer (August)', photosynthesis: 'Compact daisy discs generating 10 kg O₂/hr', disease: 'Powdery Mildew', cure: 'Ensure full sun exposure and good air circulation' },
  alp_alpenmohn: { firstFound: 'Active Alpine Scree & Gravel Terraces', maxAgeYears: 6, fruitingTime: 'Summer (June - August)', photosynthesis: 'Delicate papery petals producing 9 kg O₂/hr', disease: 'Damping Off', cure: 'Use coarse sharp sand and avoid surface mulch' },
  alp_kuerbis: { firstFound: 'Mesoamerica / Alpine Heirloom Selection', maxAgeYears: 1, fruitingTime: 'Autumn (October)', photosynthesis: 'Massive solar collector leaves yielding 10 kg O₂/hr', disease: 'Powdery Mildew', cure: 'Elevate vines on bamboo trellises off wet soil' },
  alp_zucchini: { firstFound: 'Central Europe Heirloom', maxAgeYears: 1, fruitingTime: 'Summer (July - September)', photosynthesis: 'Fast-expanding palm leaves generating 8 kg O₂/hr', disease: 'Blossom End Rot', cure: 'Ensure consistent soil watering and adequate calcium' },
  alp_spargel: { firstFound: 'Bavarian River Plains (Schrobenhausen)', maxAgeYears: 20, fruitingTime: 'Spring (April - June)', photosynthesis: 'Feathery fern foliage producing 14 kg O₂/hr', disease: 'Asparagus Beetle', cure: 'Dust with rock flour and hand-pick larvae' },
  alp_rotkohl: { firstFound: 'European Atlantic Coasts / Southern Germany', maxAgeYears: 1, fruitingTime: 'Autumn (October)', photosynthesis: 'Waxy anthocyanin-rich heads producing 9 kg O₂/hr', disease: 'Cabbage White Butterfly', cure: 'Companion plant with pungent lavender and thyme' },
  alp_karotte: { firstFound: 'Central Asia / European Selection', maxAgeYears: 1, fruitingTime: 'Late Summer (August)', photosynthesis: 'Fine lace foliage producing 8 kg O₂/hr', disease: 'Carrot Rust Fly', cure: 'Intercrop with onions and radishes to mask scent' },
  alp_radi: { firstFound: 'Munich & Upper Bavaria', maxAgeYears: 1, fruitingTime: 'Summer (June - August)', photosynthesis: 'Quick-growing green rosette generating 7 kg O₂/hr', disease: 'Flea Beetles', cure: 'Keep soil moist and use fleece insect netting' },
  alp_dinkel: { firstFound: 'Swabian & Allgäu Alpine Foothills', maxAgeYears: 1, fruitingTime: 'Late Summer (August)', photosynthesis: 'Slender wind-resistant stalks producing 14 kg O₂/hr', disease: 'Stripe Rust', cure: 'Rotate fields with nitrogen-fixing clover' },
  alp_roggen: { firstFound: 'High Alpine Alpine Valleys', maxAgeYears: 1, fruitingTime: 'Late Summer (August)', photosynthesis: 'Deep-rooting mountain stalks producing 11 kg O₂/hr', disease: 'Ergot Fungus', cure: 'Deep ploughing and clean certified heirloom seed' }
};

const regionalTrees = {
  alpenhof: ALPENHOF_SPECIES_TYPES,
  germany: evalLiteral('TREE_TYPES'),
  sweden: evalLiteral('NORDIC_TREE_TYPES'),
  brazil: evalLiteral('BRAZIL_TREE_TYPES'),
  spain: evalLiteral('SPAIN_TREE_TYPES'),
  saint_martin: evalLiteral('SAINT_MARTIN_TREE_TYPES'),
};
const treeLibrary = Object.assign(evalLiteral('TREE_LIBRARY'), ALPENHOF_SPECIES_LIB);

const species = {};
for (const [region, defs] of Object.entries(regionalTrees)) {
  for (const [key, t] of Object.entries(defs)) {
    const lib = treeLibrary[key] || null;
    if (!species[key]) {
      species[key] = {
        key,
        label: t.label,
        sciName: t.sciName || null,
        category: t.category || 'Other',
        icon: t.icon || '🌱',
        cost: t.cost ?? null,
        canopy: t.canopy || null,
        trunk: t.trunk || null,
        shape: t.shape || 'round',
        dotColor: t.dotColor || null,
        fact: t.fact || null,
        stages: (t.stages || []).map((s) => s.n),
        o2AtStage: t.o2AtStage || [],
        regions: [],
        lib: lib && {
          firstFound: lib.firstFound,
          maxAgeYears: lib.maxAgeYears,
          fruitingTime: lib.fruitingTime,
          photosynthesis: lib.photosynthesis,
          disease: lib.disease,
          cure: lib.cure,
        },
      };
    }
    species[key].regions.push(region);
  }
}

/* ---------- Components (buildings, roads, crew) ---------- */
const buildings = Object.entries(evalLiteral('BUILDING_TYPES')).map(([key, b]) => ({
  key, label: b.label, icon: b.icon, cost: b.cost, buildHours: b.buildHours,
  category: b.category, reputationBonus: b.reputationBonus ?? null, desc: b.desc,
  requiresRoad: !!b.requiresRoad, requiresEngineer: !!b.requiresEngineer,
  upkeep: b.upkeep ?? null,
}));
const roads = Object.entries(evalLiteral('ROAD_SEGMENTS')).map(([key, r]) => ({
  key, label: r.label, icon: r.icon, cost: r.cost, buildHours: r.buildHours, desc: r.desc,
}));
const workers = Object.entries(evalLiteral('WORKER_TYPES')).map(([key, w]) => ({
  key, label: w.label, wage: w.wage, role: w.role, desc: w.desc,
}));

/* ---------- Chapters, levels ---------- */
const chapters = plain(evalLiteral('CHAPTER_DEFINITIONS')).map((c) => ({
  chapter: c.chapter, icon: c.icon, title: c.title, fantasy: c.fantasy,
  desc: c.desc, keySystems: c.keySystems || [], unlockReward: c.unlockReward || null,
}));
const levels = plain(evalLiteral('KNOWLEDGE_LEVELS'));

/* ---------- Achievements (ids + labels only; check() functions are dropped) ---------- */
const achievements = plain(evalLiteral('ACHIEVEMENTS')).map((a) => ({ id: a.id, label: a.label }));

/* ---------- Land dots: the same lat/lon boxes the in-game globe uses ---------- */
const landStart = SRC.indexOf('function initLandPoints');
if (landStart < 0) throw new Error('initLandPoints not found in index.html');
const landSrc = SRC.slice(landStart, landStart + 8000);
const num = '(-?\\d+(?:\\.\\d+)?)';
const boxRe = new RegExp(`addBox\\(\\s*${[num,num,num,num,num,num].join('\\s*,\\s*')}\\s*\\)`, 'g');
const landBoxes = [...landSrc.matchAll(boxRe)].map((m) => m.slice(1).map(Number));
if (landBoxes.length < 20) throw new Error(`Only found ${landBoxes.length} land boxes; index.html changed shape?`);

/* ---------- Concepts & "Why?" topics ---------- */
const theory = Object.values(plain(evalLiteral('ECOLOGICAL_THEORY_CONCEPTS')));
const why = Object.values(plain(evalLiteral('WHY_TOPICS')));

/* ---------- Biomes (global map) ---------- */
const biomes = plain(evalLiteral('REGIONAL_BIOMES')).map((b) => ({
  id: b.id, country: b.country, flag: b.flag, lat: b.lat, lon: b.lon,
  title: b.title, biomeType: b.biomeType, climate: b.climate, soilQuality: b.soilQuality,
  nativeSpecies: b.nativeSpecies, specialTrait: b.specialTrait,
  unlockO2: b.unlockO2 ?? 0, unlocked: !!b.unlocked, plotsCount: b.plotsCount,
}));

const out = {
  generatedAt: new Date().toISOString(),
  source: 'index.html',
  counts: {
    species: Object.keys(species).length,
    buildings: buildings.length, roads: roads.length, workers: workers.length,
    chapters: chapters.length, theory: theory.length, why: why.length, biomes: biomes.length,
    achievements: achievements.length, landBoxes: landBoxes.length,
  },
  biomes, landBoxes, chapters, levels, achievements,
  components: { buildings, roads, workers },
  species: Object.values(species),
  theory, why,
};

const dir = resolve(ROOT, 'hub/data');
mkdirSync(dir, { recursive: true });
const json = JSON.stringify(out);
writeFileSync(resolve(dir, 'content.json'), json);
// Script twin so hub/index.html also works when opened straight from disk (file://).
writeFileSync(resolve(dir, 'content.js'), `window.HUB_CONTENT=${json};\n`);

console.log('hub/data written:', out.counts);
