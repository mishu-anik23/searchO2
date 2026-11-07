import fs from 'node:fs';

const alpenhofHtmlPath = 'bavaria/alpenhof.html';
const publicAlpenhofHtmlPath = 'public/bavaria/alpenhof.html';

let html = fs.readFileSync(alpenhofHtmlPath, 'utf8');

/* 1. Add Botanical and Concept Library CSS */
const customModalCss = `
/* Enhanced Child-Friendly Botanical & Concept Library Styling */
.botanical-lib-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.botanical-mascot-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(240, 172, 61, 0.12), rgba(76, 175, 80, 0.15));
  border: 1.5px solid rgba(240, 172, 61, 0.4);
  border-radius: 16px;
  padding: 10px 14px;
}
.botanical-mascot-bar .mascot-ico {
  font-size: 2rem;
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
  animation: pipBounce 3s infinite ease-in-out;
}
@keyframes pipBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.botanical-mascot-bar .mascot-text {
  font-size: 0.82rem;
  color: #E8F5E9;
  line-height: 1.35;
}
.botanical-mascot-bar .mascot-text b {
  color: var(--gold);
}
.botanical-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.botanical-search {
  flex: 1;
  min-width: 220px;
  background: rgba(10, 24, 16, 0.9);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 8px 14px;
  font-size: 0.82rem;
  color: #FFFFFF;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.botanical-search:focus {
  border-color: var(--teal);
}
.botanical-chip-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}
.botanical-chip-row::-webkit-scrollbar { display: none; }
.botanical-chip {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 0.74rem;
  font-weight: 800;
  color: #C8E6C9;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.botanical-chip:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #FFF;
}
.botanical-chip.active {
  background: linear-gradient(135deg, var(--gold), #D97706);
  color: #1A1200;
  border-color: var(--gold);
  box-shadow: 0 0 10px rgba(240, 172, 61, 0.4);
}
.botanical-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  max-height: 58vh;
  overflow-y: auto;
  padding-right: 4px;
}
.species-card-adv {
  background: linear-gradient(145deg, rgba(22, 42, 30, 0.95), rgba(12, 26, 18, 0.98));
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.species-card-adv:hover {
  transform: translateY(-2px);
  border-color: var(--teal);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}
.species-card-adv .hdr {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.species-card-adv .avatar {
  font-size: 2rem;
  line-height: 1;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}
.species-card-adv .title-group {
  flex: 1;
  min-width: 0;
}
.species-card-adv .title-group b {
  font-family: 'Baloo 2', sans-serif;
  font-size: 0.96rem;
  color: #FFFFFF;
  display: block;
  line-height: 1.2;
}
.species-card-adv .title-group .de-name {
  font-size: 0.76rem;
  color: var(--gold);
  font-weight: 700;
  display: block;
}
.species-card-adv .title-group .latin-name {
  font-size: 0.72rem;
  color: #81D4FA;
  font-style: italic;
  display: block;
}
.species-card-adv .pill-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}
.species-pill-tag {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}
.species-pill-tag.alpenhof {
  background: linear-gradient(135deg, #0284C7, #0369A1);
  color: #FFFFFF;
}
.species-pill-tag.base {
  background: linear-gradient(135deg, #15803D, #166534);
  color: #DCFCE7;
}
.species-pill-tag.cat {
  background: rgba(255, 255, 255, 0.12);
  color: #E2E8F0;
}
.species-pill-tag.o2 {
  background: rgba(0, 230, 118, 0.18);
  color: var(--teal);
  border: 1px solid rgba(0, 230, 118, 0.35);
}
.species-fact-box {
  font-size: 0.72rem;
  color: #CFD8DC;
  line-height: 1.35;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  padding: 6px 8px;
}
.species-stages-track {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 4px 6px;
  font-size: 0.64rem;
  color: #A5D6A7;
}
.species-stages-track .stage-step {
  flex: 1;
  text-align: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  padding: 2px 0;
  white-space: nowrap;
}
.species-econ-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.70rem;
  font-weight: 800;
  color: #FFD54F;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  padding-top: 6px;
}

/* Concept Library Enhanced Styling */
.concept-lib-card {
  background: linear-gradient(155deg, rgba(20, 38, 28, 0.96), rgba(10, 22, 16, 0.98));
  border: 1.5px solid rgba(240, 172, 61, 0.35);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.concept-dialogue-bubble {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.12), rgba(33, 150, 243, 0.12));
  border: 1.5px solid rgba(129, 199, 132, 0.4);
  border-radius: 14px;
  padding: 12px 14px;
}
.concept-dialogue-bubble .bubble-avatar {
  font-size: 2.2rem;
  line-height: 1;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}
.concept-dialogue-bubble .bubble-text {
  font-size: 0.82rem;
  color: #E8F5E9;
  line-height: 1.4;
}
.concept-dialogue-bubble .bubble-text b {
  color: var(--gold);
}
.concept-tabs-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}
.concept-tabs-row::-webkit-scrollbar { display: none; }
.concept-tab-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 0.74rem;
  font-weight: 800;
  color: #C8E6C9;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.concept-tab-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #FFF;
}
.concept-tab-btn.active {
  background: var(--gold);
  color: #1A1200;
  border-color: var(--gold);
  box-shadow: 0 0 10px rgba(240, 172, 61, 0.35);
}
.concept-body-box {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 14px;
  font-size: 0.82rem;
  color: #ECEFF1;
  line-height: 1.45;
  min-height: 200px;
}
.concept-body-box h4 {
  font-family: 'Baloo 2', sans-serif;
  color: var(--gold);
  font-size: 1.05rem;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.concept-formula-box {
  background: rgba(0, 229, 255, 0.08);
  border-left: 3px solid var(--cyan);
  padding: 8px 12px;
  border-radius: 6px;
  margin: 10px 0;
  font-size: 0.80rem;
  color: #E0F7FA;
  font-family: 'JetBrains Mono', monospace;
}
.concept-pip-tip {
  background: rgba(240, 172, 61, 0.12);
  border: 1px solid rgba(240, 172, 61, 0.35);
  border-radius: 8px;
  padding: 8px 10px;
  margin-top: 10px;
  font-size: 0.76rem;
  color: #FFF8E1;
}
`;

if (!html.includes('.botanical-lib-container')) {
  html = html.replace('</style>', customModalCss + '\n</style>');
}

/* 2. Redesign openSpecies() and species filter logic */
const fullSpeciesCollectionData = `
/* =========================================================================
   COMPREHENSIVE BOTANICAL & FLORAL CATALOGUE FOR CHILDREN (35+ SPECIES)
   ========================================================================= */
const ALPENHOF_FULL_SPECIES_COLLECTION = [
  // Streuobst Fruit & Timber Trees
  {
    key: 'apple', name: 'Boskoop Apple', de: 'Schöner von Boskoop', sciName: 'Malus domestica',
    cat: 'Fruit Tree', biome: 'alpenhof', icon: '🍎', cost: 22, rev: 40, o2: 8, matureHours: '7.0h', lifespan: '120 yrs',
    stages: ['Sprout (1.2h)', 'Vegetative (2.3h)', 'Flowering (1.8h)', 'Mature Harvest (1.7h)'],
    fact: 'Heirloom tart winter cooking apple with textured russet-red blush. Dense applewood prized for culinary smoking.',
    disease: 'Apple Scab', cure: 'Canopy pruning to increase airflow'
  },
  {
    key: 'pear', name: 'Williams Pear', de: 'Williams Christbirne', sciName: 'Pyrus communis',
    cat: 'Fruit Tree', biome: 'alpenhof', icon: '🍐', cost: 24, rev: 38, o2: 7, matureHours: '6.5h', lifespan: '140 yrs',
    stages: ['Sprout (1.1h)', 'Vegetative (2.2h)', 'Flowering (1.6h)', 'Mature Harvest (1.6h)'],
    fact: 'Teardrop golden-chartreuse speckled pears on upright pyramidal boughs. Luxury fine-grained Swiss pearwood joinery.',
    disease: 'Pear Rust', cure: 'Remove nearby juniper hosts & spray horsetail tea'
  },
  {
    key: 'cherry', name: 'Sweet Mountain Cherry', de: 'Süßkirsche (Kordia)', sciName: 'Prunus avium',
    cat: 'Fruit Tree', biome: 'alpenhof', icon: '🍒', cost: 20, rev: 35, o2: 6, matureHours: '6.0h', lifespan: '90 yrs',
    stages: ['Sprout (1.0h)', 'Vegetative (2.0h)', 'Flowering (1.5h)', 'Mature Harvest (1.5h)'],
    fact: 'Glossy ruby-black heart cherries clustered on dark lenticel bark. Rich red heartwood prized in alpine cabinetry.',
    disease: 'Cherry Leaf Spot', cure: 'Copper fungicide & autumn leaf removal'
  },
  {
    key: 'plum', name: 'Bavarian Damson Plum', de: 'Fränkische Hauszwetschge', sciName: 'Prunus domestica',
    cat: 'Fruit Tree', biome: 'alpenhof', icon: '🫐', cost: 18, rev: 36, o2: 6, matureHours: '6.0h', lifespan: '70 yrs',
    stages: ['Sprout (1.0h)', 'Vegetative (2.0h)', 'Flowering (1.5h)', 'Mature Harvest (1.5h)'],
    fact: 'Deep indigo-purple damson plums with frosty powdery-blue wax bloom. Classic Bavarian Zwetschgenkuchen fruit.',
    disease: 'Pocket Plum Fungus', cure: 'Prune infected fruit shoots before spore release'
  },
  {
    key: 'beech', name: 'European Red Beech', de: 'Rotbuche', sciName: 'Fagus sylvatica',
    cat: 'Oxygen Tree', biome: 'alpenhof', icon: '🍃', cost: 35, rev: 260, o2: 28, matureHours: '12.0h', lifespan: '400 yrs',
    stages: ['Sprout (2.0h)', 'Vegetative (4.5h)', 'Flowering (2.5h)', 'Mature Hardwood (3.0h)'],
    fact: 'Majestic silver-grey columnar trunk with horizontal layered leaf canopies. Heavy structural alpine timber (+28 O₂/s).',
    disease: 'Beech Bark Disease', cure: 'Maintain balanced soil humus and avoid trunk wounds'
  },
  {
    key: 'oak', name: 'Ancient English Oak', de: 'Stieleiche', sciName: 'Quercus robur',
    cat: 'Oxygen Tree', biome: 'alpenhof', icon: '🌳', cost: 45, rev: 310, o2: 32, matureHours: '14.0h', lifespan: '800 yrs',
    stages: ['Sprout (2.5h)', 'Vegetative (5.5h)', 'Flowering (3.0h)', 'Mature Giant (3.0h)'],
    fact: 'Ancient rugged fissured bark with heavy gnarled limbs and golden acorns. Weatherproof structural timber (+32 O₂/s).',
    disease: 'Oak Powdery Mildew', cure: 'Sulfur wash & increase mycorrhizal root aeration'
  },
  {
    key: 'linden', name: 'Small-Leaved Linden', de: 'Winterlinde', sciName: 'Tilia cordata',
    cat: 'Oxygen Tree', biome: 'alpenhof', icon: '🌿', cost: 30, rev: 210, o2: 22, matureHours: '9.0h', lifespan: '600 yrs',
    stages: ['Sprout (1.5h)', 'Vegetative (3.5h)', 'Flowering (2.0h)', 'Mature Linden (2.0h)'],
    fact: 'Heart-shaped crown with intensely fragrant cream-yellow blossom bracts. Traditional Bavarian village honey tree.',
    disease: 'Linden Gall Mite', cure: 'Encourage predatory beneficial mites & ladybugs'
  },
  {
    key: 'spruce', name: 'Norway Spruce', de: 'Gemeine Fichte', sciName: 'Picea abies',
    cat: 'Biodiversity Tree', biome: 'alpenhof', icon: '🌲', cost: 25, rev: 180, o2: 18, matureHours: '9.0h', lifespan: '500 yrs',
    stages: ['Sprout (1.5h)', 'Vegetative (3.0h)', 'Flowering (2.0h)', 'Mature Conifer (2.5h)'],
    fact: 'Tiered pyramidal alpine conifer with drooping needle sprays and hanging cones. Crucial mountain storm windbreak.',
    disease: 'Spruce Bark Beetle', cure: 'Timely felling of dead snags & pheromone traps'
  },
  {
    key: 'fir', name: 'European Silver Fir', de: 'Weißtanne', sciName: 'Abies alba',
    cat: 'Biodiversity Tree', biome: 'alpenhof', icon: '🌲', cost: 28, rev: 190, o2: 17, matureHours: '9.2h', lifespan: '450 yrs',
    stages: ['Sprout (1.5h)', 'Vegetative (3.2h)', 'Flowering (2.0h)', 'Mature Silver Fir (2.5h)'],
    fact: 'Deep taproot evergreen with silver-banded needles. Resists heavy mountain snow and anchors steep slopes against avalanches.',
    disease: 'Fir Aphids', cure: 'Encourage hoverfly larvae & lacewings'
  },

  // Alpine Keystone Biodiversity Trees
  {
    key: 'cembra', name: 'Swiss Stone Pine', de: 'Zirbelkiefer', sciName: 'Pinus cembra',
    cat: 'Biodiversity Tree', biome: 'alpenhof', icon: '🌲', cost: 55, rev: 280, o2: 35, matureHours: '13.0h', lifespan: '1000 yrs',
    stages: ['Sprout (2.0h)', 'Vegetative (5.0h)', 'Flowering (3.0h)', 'Queen of Alps (3.0h)'],
    fact: 'The revered "Queen of the Alps". Thrives in rocky soil up to the timberline, emitting soothing essential pinosylvin terpenes.',
    disease: 'Blister Rust', cure: 'Prune lower infected limbs & plant on gravel mounds'
  },
  {
    key: 'aucuparia', name: 'Mountain Ash / Rowan', de: 'Vogelbeere', sciName: 'Sorbus aucuparia',
    cat: 'Biodiversity Tree', biome: 'alpenhof', icon: '🌳', cost: 45, rev: 170, o2: 28, matureHours: '8.2h', lifespan: '120 yrs',
    stages: ['Sprout (1.2h)', 'Vegetative (3.0h)', 'Flowering (2.0h)', 'Berry Haven (2.0h)'],
    fact: 'Crucial keystone species for alpine birds. Dense scarlet berry clusters feed over 63 native mountain avian species.',
    disease: 'Fireblight', cure: 'Sterilize pruning tools and cut 30cm below infected branch'
  },
  {
    key: 'pseudoplatanus', name: 'Sycamore Maple', de: 'Berg-Ahorn', sciName: 'Acer pseudoplatanus',
    cat: 'Oxygen Tree', biome: 'alpenhof', icon: '🌳', cost: 50, rev: 320, o2: 40, matureHours: '13.0h', lifespan: '500 yrs',
    stages: ['Sprout (2.0h)', 'Vegetative (5.0h)', 'Flowering (3.0h)', 'Shade Giant (3.0h)'],
    fact: 'Majestic Bavarian alpine giant living 500 years. Forms grand shade canopies that cool ground temperatures by up to 5°C.',
    disease: 'Tar Spot Fungus', cure: 'Rake and compost fallen autumn leaves'
  },
  {
    key: 'decidua', name: 'European Larch', de: 'Europäische Lärche', sciName: 'Larix decidua',
    cat: 'Biodiversity Tree', biome: 'alpenhof', icon: '🌲', cost: 48, rev: 250, o2: 36, matureHours: '11.0h', lifespan: '600 yrs',
    stages: ['Sprout (1.8h)', 'Vegetative (4.2h)', 'Flowering (2.5h)', 'Golden Conifer (2.5h)'],
    fact: 'The only deciduous alpine conifer. Light needle rosettes turn brilliant molten gold in October with deep storm-resistant taproots.',
    disease: 'Larch Canker', cure: 'Plant on sun-exposed well-drained hillsides'
  },
  {
    key: 'campestre', name: 'Field Maple', de: 'Feldahorn', sciName: 'Acer campestre',
    cat: 'Biodiversity Tree', biome: 'alpenhof', icon: '🌳', cost: 40, rev: 190, o2: 26, matureHours: '8.5h', lifespan: '350 yrs',
    stages: ['Sprout (1.5h)', 'Vegetative (3.0h)', 'Flowering (2.0h)', 'Hedgerow Hub (2.0h)'],
    fact: 'Dense, wind-resistant hardwood native to Bavarian hedgerows. Rich spring nectar for bumblebees with erosion-stopping roots.',
    disease: 'Wilt Fungus', cure: 'Avoid root damage & ensure well-aerated loam'
  },

  // Bauerngarten Vegetables
  {
    key: 'kuerbis', name: 'Alpen-Hokkaido Pumpkin', de: 'Alpen-Hokkaido Kürbis', sciName: 'Cucurbita maxima',
    cat: 'Vegetable', biome: 'alpenhof', icon: '🎃', cost: 12, rev: 32, o2: 10, matureHours: '3.5h', lifespan: '1 season',
    stages: ['Sprout (0.6h)', 'Vine Growth (1.2h)', 'Flowering (0.9h)', 'Mature Squash (0.8h)'],
    fact: 'Vigorous sprawling squash with edible orange skin and nutty chestnut flavor. Thrives climbing supported bamboo trellis beds.',
    disease: 'Powdery Mildew', cure: 'Elevate vines on bamboo trellises off wet soil'
  },
  {
    key: 'zucchini', name: 'Bavarian Zucchini', de: 'Bayerische Zucchini', sciName: 'Cucurbita pepo',
    cat: 'Vegetable', biome: 'alpenhof', icon: '🥒', cost: 10, rev: 25, o2: 8, matureHours: '2.8h', lifespan: '1 season',
    stages: ['Sprout (0.5h)', 'Leaf Canopy (1.0h)', 'Blossoms (0.7h)', 'Harvest (0.6h)'],
    fact: 'Crisp emerald summer squash with tender edible golden blossoms. High daily vegetative water uptake promotes soil hydration.',
    disease: 'Blossom End Rot', cure: 'Ensure consistent soil watering and adequate calcium'
  },
  {
    key: 'spargel', name: 'King Asparagus', de: 'Königs-Spargel', sciName: 'Asparagus officinalis',
    cat: 'Vegetable', biome: 'alpenhof', icon: '🎋', cost: 16, rev: 40, o2: 14, matureHours: '4.4h', lifespan: '20 yrs',
    stages: ['Crown Root (0.8h)', 'Spear Growth (1.5h)', 'Fern Foliage (1.2h)', 'Harvest (0.9h)'],
    fact: 'Purple-tipped perennial spears harvested from deep sandy-loam raised trenches. High mineral and nitrogen soil accumulator.',
    disease: 'Asparagus Beetle', cure: 'Dust with rock flour and hand-pick larvae'
  },
  {
    key: 'rotkohl', name: 'Bavarian Red Cabbage', de: 'Bayerischer Rotkohl', sciName: 'Brassica oleracea var. capitata',
    cat: 'Vegetable', biome: 'alpenhof', icon: '🥬', cost: 10, rev: 24, o2: 9, matureHours: '3.2h', lifespan: '1 season',
    stages: ['Sprout (0.5h)', 'Foliage (1.1h)', 'Heading (0.9h)', 'Tight Head (0.7h)'],
    fact: 'Dense purple-red cabbage head rich in anthocyanin antioxidants. Traditional accompaniment to hearty Bavarian farm dumplings.',
    disease: 'Cabbage White Butterfly', cure: 'Companion plant with pungent lavender and thyme'
  },
  {
    key: 'karotte', name: 'Oxheart Heirloom Carrot', de: 'Ochsenherz-Karotte', sciName: 'Daucus carota subsp. sativus',
    cat: 'Vegetable', biome: 'alpenhof', icon: '🥕', cost: 8, rev: 20, o2: 8, matureHours: '2.6h', lifespan: '1 season',
    stages: ['Feather Foliage (0.4h)', 'Root Tap (0.9h)', 'Root Swell (0.7h)', 'Crisp Harvest (0.6h)'],
    fact: 'Thick, sweet, heart-shaped heirloom carrot that pierces through stony alpine soil to loosen hardpan clay crusts.',
    disease: 'Carrot Rust Fly', cure: 'Intercrop with onions and radishes to mask scent'
  },
  {
    key: 'radi', name: 'Munich Beer Radish', de: 'Münchner Bier-Radi', sciName: 'Raphanus sativus',
    cat: 'Vegetable', biome: 'alpenhof', icon: '🌱', cost: 8, rev: 18, o2: 7, matureHours: '2.1h', lifespan: '1 season',
    stages: ['Seedling (0.3h)', 'Leaf Rosette (0.7h)', 'Bulb Swell (0.6h)', 'Crisp Spiral (0.5h)'],
    fact: 'Crisp, spicy white winter radish spiraled into traditional beer-garden garlands. Fast-cycling soil aerator crop.',
    disease: 'Flea Beetles', cure: 'Keep soil moist and use fleece insect netting'
  },

  // Heritage Grains & Crops
  {
    key: 'dinkel', name: 'Allgäu Ancient Spelt', de: 'Allgäuer Ur-Dinkel', sciName: 'Triticum spelta',
    cat: 'Crop & Grain', biome: 'alpenhof', icon: '🌾', cost: 12, rev: 30, o2: 14, matureHours: '3.8h', lifespan: '1 season',
    stages: ['Tillering (0.7h)', 'Stem Extension (1.3h)', 'Heading (1.0h)', 'Golden Harvest (0.8h)'],
    fact: 'Ancient heritage hulled spelt wheat cultivated in the Alps for 3,000 years. Heavy fibrous husk resists harsh alpine frosts.',
    disease: 'Stripe Rust', cure: 'Rotate fields with nitrogen-fixing clover'
  },
  {
    key: 'roggen', name: 'Alpine Mountain Rye', de: 'Alpen-Bergroggen', sciName: 'Secale cereale',
    cat: 'Crop & Grain', biome: 'alpenhof', icon: '🌾', cost: 10, rev: 24, o2: 11, matureHours: '3.4h', lifespan: '1 season',
    stages: ['Tillering (0.6h)', 'Stem Extension (1.2h)', 'Heading (0.9h)', 'Golden Harvest (0.7h)'],
    fact: 'Hardy alpine mountain rye that germinates at near-freezing temperatures. Gives traditional farmhouse loaves their crusty chew.',
    disease: 'Ergot Fungus', cure: 'Deep ploughing and clean certified heirloom seed'
  },
  {
    key: 'weizen', name: 'Bavarian Winter Wheat', de: 'Bayerischer Winterweizen', sciName: 'Triticum aestivum',
    cat: 'Crop & Grain', biome: 'alpenhof', icon: '🌾', cost: 10, rev: 26, o2: 12, matureHours: '3.5h', lifespan: '1 season',
    stages: ['Tillering (0.6h)', 'Stem Growth (1.2h)', 'Heading (1.0h)', 'Harvest (0.7h)'],
    fact: 'Classic high-protein milling wheat ground into fresh flour for village bread ovens.',
    disease: 'Leaf Blight', cure: 'Foliar horsetail tea spray and crop rotation'
  },
  {
    key: 'gerste', name: 'Two-Row Malting Barley', de: 'Zweizeilige Braugerste', sciName: 'Hordeum vulgare',
    cat: 'Crop & Grain', biome: 'alpenhof', icon: '🌾', cost: 10, rev: 25, o2: 11, matureHours: '3.3h', lifespan: '1 season',
    stages: ['Tillering (0.5h)', 'Stem Extension (1.2h)', 'Bearded Head (0.9h)', 'Harvest (0.7h)'],
    fact: 'Traditional golden Bavarian brewing barley malted for artisan alpine beverages.',
    disease: 'Powdery Mildew', cure: 'Ensure sunny hill orientation & wider row spacing'
  },
  {
    key: 'hafer', name: 'Golden Alpine Oats', de: 'Goldener Alpen-Hafer', sciName: 'Avena sativa',
    cat: 'Crop & Grain', biome: 'alpenhof', icon: '🌾', cost: 9, rev: 22, o2: 10, matureHours: '3.0h', lifespan: '1 season',
    stages: ['Sprout (0.5h)', 'Panicle Growth (1.1h)', 'Heading (0.8h)', 'Oat Harvest (0.6h)'],
    fact: 'Hearty panicle oat grain feeding our Simmental dairy cows and making creamy morning porridge.',
    disease: 'Crown Rust', cure: 'Plant disease-resistant heritage seed lots'
  },

  // Alpine Flowers & Vineyard
  {
    key: 'edelweiss', name: 'Alpine Edelweiss', de: 'Alpen-Edelweiß', sciName: 'Leontopodium nivale',
    cat: 'Alpine Flower', biome: 'alpenhof', icon: '⭐', cost: 14, rev: 36, o2: 12, matureHours: '3.0h', lifespan: '8 yrs',
    stages: ['Sprout (0.5h)', 'Vegetative (1.0h)', 'Budding (0.8h)', 'Star Bloom (0.7h)'],
    fact: 'Silvery star velvet petals with high-altitude UV shielding. The legendary symbol of alpine purity and pollinator vigor.',
    disease: 'Root Rot from Waterlogging', cure: 'Plant in coarse mineral scree with excellent drainage'
  },
  {
    key: 'enzian', name: 'Spring Gentian', de: 'Frühlings-Enzian', sciName: 'Gentiana verna',
    cat: 'Alpine Flower', biome: 'alpenhof', icon: '🔔', cost: 15, rev: 38, o2: 14, matureHours: '3.0h', lifespan: '15 yrs',
    stages: ['Sprout (0.5h)', 'Vegetative (1.0h)', 'Budding (0.8h)', 'Cobalt Trumpet (0.7h)'],
    fact: 'Deep alpine cobalt trumpet blossoms with medicinal bitter roots. Irresistible magnet for wild mountain bumblebees.',
    disease: 'Gentian Rust', cure: 'Maintain diverse companion grasses and avoid over-fertilizing'
  },
  {
    key: 'alpenrose', name: 'Rusty-Leaved Alpenrose', de: 'Rostblättrige Alpenrose', sciName: 'Rhododendron ferrugineum',
    cat: 'Alpine Flower', biome: 'alpenhof', icon: '🌺', cost: 16, rev: 40, o2: 15, matureHours: '3.6h', lifespan: '25 yrs',
    stages: ['Sprout (0.6h)', 'Vegetative (1.2h)', 'Budding (1.0h)', 'Crimson Bloom (0.8h)'],
    fact: 'Crimson subalpine rhododendron shrub covering rocky mountainsides. Provides dense forest-edge shelter for mountain grouse.',
    disease: 'Leaf Gall Fungus', cure: 'Hand-pick galls before spore release'
  },
  {
    key: 'arnika', name: 'Mountain Arnica', de: 'Echte Berg-Arnika', sciName: 'Arnica montana',
    cat: 'Alpine Flower', biome: 'alpenhof', icon: '🌼', cost: 12, rev: 30, o2: 10, matureHours: '2.4h', lifespan: '12 yrs',
    stages: ['Sprout (0.4h)', 'Vegetative (0.8h)', 'Budding (0.6h)', 'Solar Rays (0.6h)'],
    fact: 'Golden solar healer flower renowned for soothing herbal remedies. Attracts over 40 species of native alpine hoverflies.',
    disease: 'Soil Silt Scurf', cure: 'Avoid heavy nitrogen fertilizers; maintain acidic humus'
  },
  {
    key: 'sonnenblume', name: 'Alpine Dwarf Sunflower', de: 'Alpen-Zwergsonnenblume', sciName: 'Helianthus annuus',
    cat: 'Alpine Flower', biome: 'alpenhof', icon: '🌻', cost: 10, rev: 26, o2: 12, matureHours: '2.5h', lifespan: '1 season',
    stages: ['Sprout (0.4h)', 'Stem (0.9h)', 'Bud (0.6h)', 'Golden Disc (0.6h)'],
    fact: 'Sturdy golden disc that tracks the sun, yielding heavy nectar and nutritious winter seeds for mountain finches.',
    disease: 'Sclerotinia Rot', cure: 'Wide spacing and avoid overhead watering'
  },
  {
    key: 'lavendel', name: 'Alpine Lavender', de: 'Berg-Lavendel', sciName: 'Lavandula angustifolia',
    cat: 'Alpine Flower', biome: 'alpenhof', icon: '🪻', cost: 12, rev: 28, o2: 11, matureHours: '2.5h', lifespan: '10 yrs',
    stages: ['Sprout (0.4h)', 'Rosette (0.9h)', 'Spire (0.6h)', 'Violet Bloom (0.6h)'],
    fact: 'Aromatic companion herb mounds with calming essential oils that repel orchard pests while drawing bumblebees.',
    disease: 'Root Fungus', cure: 'Ensure gritty gravel substrate'
  },
  {
    key: 'alpenmohn', name: 'White Alpine Poppy', de: 'Weißer Alpen-Mohn', sciName: 'Papaver alpinum',
    cat: 'Alpine Flower', biome: 'alpenhof', icon: '🏵️', cost: 11, rev: 28, o2: 9, matureHours: '2.1h', lifespan: '6 yrs',
    stages: ['Sprout (0.4h)', 'Vegetative (0.7h)', 'Budding (0.5h)', 'Papery Bloom (0.5h)'],
    fact: 'Delicate papery alpine poppy with flexible fibrous roots that physically stabilize steep scree slopes against erosion.',
    disease: 'Damping Off', cure: 'Use coarse sharp sand and avoid surface mulch'
  },
  {
    key: 'bergaster', name: 'Alpine Aster', de: 'Kalk-Alpenaster', sciName: 'Aster alpinus',
    cat: 'Alpine Flower', biome: 'alpenhof', icon: '🌸', cost: 12, rev: 30, o2: 10, matureHours: '2.4h', lifespan: '10 yrs',
    stages: ['Sprout (0.4h)', 'Vegetative (0.8h)', 'Budding (0.6h)', 'Lavender Star (0.6h)'],
    fact: 'Lavender mountain daisy thriving in rocky limestone fissures. Staple late-season autumn nectar source before alpine winter.',
    disease: 'Powdery Mildew', cure: 'Ensure full sun exposure and good air circulation'
  },
  {
    key: 'riesling', name: 'Riesling Grapevine', de: 'Klingelberger Riesling', sciName: 'Vitis vinifera',
    cat: 'Fruit Tree', biome: 'alpenhof', icon: '🍇', cost: 15, rev: 45, o2: 5, matureHours: '4.0h', lifespan: '80 yrs',
    stages: ['Bud Burst (0.8h)', 'Shoot Growth (1.4h)', 'Cluster Bloom (1.0h)', 'Vintage Clusters (0.8h)'],
    fact: 'Steep slate terrace grapevine absorbing mineral salts to produce internationally celebrated white wine.',
    disease: 'Downy Mildew', cure: 'Apply organic copper-sulfur wash and leaf pluck'
  },

  // Base Farm Heritage Species
  {
    key: 'base_oak', name: 'Solo Founder Oak', de: 'Basis-Bauernhof Eiche', sciName: 'Quercus robur',
    cat: 'Oxygen Tree', biome: 'base', icon: '🌳', cost: 45, rev: 310, o2: 32, matureHours: '14.0h', lifespan: '800 yrs',
    stages: ['Sprout', 'Young Sapling', 'Branching', 'Centennial Crown'],
    fact: 'The anchor species of your Solo Founder base farm. Unlocked in Chapter 1 to establish early carbon sequestration.',
    disease: 'Mildew', cure: 'Natural horsetail tea'
  },
  {
    key: 'base_beech', name: 'Solo Founder Beech', de: 'Basis-Rotbuche', sciName: 'Fagus sylvatica',
    cat: 'Oxygen Tree', biome: 'base', icon: '🍃', cost: 35, rev: 260, o2: 28, matureHours: '12.0h', lifespan: '400 yrs',
    stages: ['Sprout', 'Foliage Growth', 'Broad Canopy', 'Old Growth'],
    fact: 'Fast-growing Central European timber and oxygen powerhouse learned in your foundation farm.',
    disease: 'Aphids', cure: 'Beneficial ladybugs'
  },
  {
    key: 'base_pine', name: 'Scots Pine', de: 'Waldkiefer', sciName: 'Pinus sylvestris',
    cat: 'Oxygen Tree', biome: 'base', icon: '🌲', cost: 25, rev: 180, o2: 18, matureHours: '8.0h', lifespan: '300 yrs',
    stages: ['Sprout', 'Needle Growth', 'Cones', 'Stout Pine'],
    fact: 'Resilient sandy-soil pine from the base farm creating vital windbreaks and year-round green canopy.',
    disease: 'Needle Cast', cure: 'Increase tree spacing'
  },
  {
    key: 'base_birch', name: 'Silver Birch', de: 'Hängebirke', sciName: 'Betula pendula',
    cat: 'Biodiversity Tree', biome: 'base', icon: '🌿', cost: 20, rev: 140, o2: 15, matureHours: '6.0h', lifespan: '100 yrs',
    stages: ['Sprout', 'White Bark', 'Catkins', 'Pioneer Canopy'],
    fact: 'Pioneer tree from the base farm with white peeling bark that prepares barren soils for future hardwood forests.',
    disease: 'Birch Polypore', cure: 'Prune dead wood'
  },
  {
    key: 'base_willow', name: 'White Willow', de: 'Silberweide', sciName: 'Salix alba',
    cat: 'Biodiversity Tree', biome: 'base', icon: '🌾', cost: 22, rev: 150, o2: 19, matureHours: '6.5h', lifespan: '100 yrs',
    stages: ['Cutting', 'Rapid Shoots', 'Catkins', 'Water Anchor'],
    fact: 'Riparian wetland stabilizer from base farm Chapter 4 that filters agricultural runoff before it reaches streams.',
    disease: 'Water Rot', cure: 'Clear drainage trenches'
  }
];

let curBotanicalFilter = 'all';
let curBotanicalSearch = '';

window.filterAlpenhofSpecies = function(cat, search) {
  if (cat !== undefined) {
    curBotanicalFilter = cat;
    document.querySelectorAll('.botanical-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.cat === cat);
    });
  }
  if (search !== undefined) {
    curBotanicalSearch = search.trim().toLowerCase();
  } else {
    const input = document.getElementById('alpSpeciesSearch');
    if (input) curBotanicalSearch = input.value.trim().toLowerCase();
  }
  
  const filtered = ALPENHOF_FULL_SPECIES_COLLECTION.filter(s => {
    const matchesCat = (curBotanicalFilter === 'all') ||
      (curBotanicalFilter === 'alpenhof' && s.biome === 'alpenhof') ||
      (curBotanicalFilter === 'base' && s.biome === 'base') ||
      (curBotanicalFilter === 'orchard' && s.cat === 'Fruit Tree') ||
      (curBotanicalFilter === 'biodiv' && s.cat === 'Biodiversity Tree') ||
      (curBotanicalFilter === 'oxygen' && s.cat === 'Oxygen Tree') ||
      (curBotanicalFilter === 'veg' && s.cat === 'Vegetable') ||
      (curBotanicalFilter === 'crop' && s.cat === 'Crop & Grain') ||
      (curBotanicalFilter === 'flower' && s.cat === 'Alpine Flower');
    
    const textCorpus = (s.name + ' ' + s.de + ' ' + s.sciName + ' ' + s.cat + ' ' + (s.fact || '')).toLowerCase();
    const matchesSearch = !curBotanicalSearch || textCorpus.includes(curBotanicalSearch);
    return matchesCat && matchesSearch;
  });

  const countEl = document.getElementById('alpSpeciesCount');
  if (countEl) countEl.innerText = filtered.length + ' of ' + ALPENHOF_FULL_SPECIES_COLLECTION.length + ' Species';

  const grid = document.getElementById('alpSpeciesGrid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:36px;color:#A5D6A7;font-size:0.9rem">🔍 No botanical species match your filter. Try clearing your search term or selecting "All"!</div>';
    return;
  }

  let html = '';
  filtered.forEach(s => {
    const biomeTag = s.biome === 'alpenhof'
      ? '<span class="species-pill-tag alpenhof">🏔️ Alpenhof</span>'
      : '<span class="species-pill-tag base">🌱 Base Farm</span>';
    
    const stageDots = (s.stages || ['Sprout', 'Growth', 'Bloom', 'Harvest']).map(st => 
      '<span class="stage-step">' + st + '</span>'
    ).join('<span style="color:var(--gold);opacity:0.6">➔</span>');

    html += '<div class="species-card-adv">' +
      '<div class="hdr">' +
        '<div class="avatar" aria-hidden="true">' + s.icon + '</div>' +
        '<div class="title-group">' +
          '<b>' + s.name + '</b>' +
          '<span class="de-name">' + s.de + '</span>' +
          '<span class="latin-name">' + s.sciName + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="pill-tags">' +
        biomeTag +
        '<span class="species-pill-tag cat">' + s.cat + '</span>' +
        '<span class="species-pill-tag o2">🫁 +' + s.o2 + ' kg O₂</span>' +
      '</div>' +
      '<div class="species-fact-box">' + s.fact + '</div>' +
      '<div class="species-stages-track">' + stageDots + '</div>' +
      '<div class="species-econ-row">' +
        '<span>⏱️ ' + (s.matureHours || '3-6h') + ' · ⏳ ' + (s.lifespan || 'Multi-year') + '</span>' +
        '<span>💰 Sow: €' + s.cost + ' · Rev: +€' + s.rev + '</span>' +
      '</div>' +
    '</div>';
  });
  grid.innerHTML = html;
};

function openSpecies(){
  curBotanicalFilter = 'all';
  curBotanicalSearch = '';
  let h = '<div class="modal-hdr">' +
    '<h3>🌲 Alpenhof Living Botanical Library</h3>' +
    '<button class="btn-close" onclick="closeModal()">✕</button>' +
  '</div>' +
  '<div class="botanical-lib-container">' +
    '<div class="botanical-mascot-bar">' +
      '<span class="mascot-ico" aria-hidden="true">🐱</span>' +
      '<div class="mascot-text">' +
        '<b>Prof. Whisker Puff & Apprentice Pip\\'s Field Guide:</b> ' +
        'Explore real-life Bavarian flora! Discover Latin scientific names, oxygen curves, real-time maturation hours, and timber value!' +
      '</div>' +
    '</div>' +
    '<div class="botanical-toolbar">' +
      '<input id="alpSpeciesSearch" class="botanical-search" type="search" placeholder="🔍 Search species, German name, or Latin scientific name..." oninput="filterAlpenhofSpecies(undefined, this.value)">' +
      '<span id="alpSpeciesCount" style="font-size:0.75rem;font-weight:800;color:var(--gold);white-space:nowrap">' + ALPENHOF_FULL_SPECIES_COLLECTION.length + ' Species</span>' +
    '</div>' +
    '<div class="botanical-chip-row">' +
      '<button class="botanical-chip active" data-cat="all" onclick="filterAlpenhofSpecies(\\'all\\')">🌸 All (35+)</button>' +
      '<button class="botanical-chip" data-cat="alpenhof" onclick="filterAlpenhofSpecies(\\'alpenhof\\')">🏔️ Alpenhof (27)</button>' +
      '<button class="botanical-chip" data-cat="base" onclick="filterAlpenhofSpecies(\\'base\\')">🌱 Base Farm (8)</button>' +
      '<button class="botanical-chip" data-cat="orchard" onclick="filterAlpenhofSpecies(\\'orchard\\')">🍎 Streuobst (5)</button>' +
      '<button class="botanical-chip" data-cat="biodiv" onclick="filterAlpenhofSpecies(\\'biodiv\\')">🌲 Biodiversity (5)</button>' +
      '<button class="botanical-chip" data-cat="oxygen" onclick="filterAlpenhofSpecies(\\'oxygen\\')">🍃 Oxygen Giants (4)</button>' +
      '<button class="botanical-chip" data-cat="veg" onclick="filterAlpenhofSpecies(\\'veg\\')">🥦 Vegetables (6)</button>' +
      '<button class="botanical-chip" data-cat="crop" onclick="filterAlpenhofSpecies(\\'crop\\')">🌾 Grains (5)</button>' +
      '<button class="botanical-chip" data-cat="flower" onclick="filterAlpenhofSpecies(\\'flower\\')">🌺 Alpine Flowers (8)</button>' +
    '</div>' +
    '<div class="botanical-grid" id="alpSpeciesGrid"></div>' +
  '</div>';
  
  openModal(h, true);
  setTimeout(() => {
    filterAlpenhofSpecies('all', '');
  }, 20);
}
`;

/* 3. Redesign openWhy() and switchGlobalWhyTab() */
const redesignedConceptLibrary = `
/* =========================================================================
   CHILD-FRIENDLY ECOLOGICAL CONCEPT LIBRARY & SCIENTIFIC ACADEMY
   ========================================================================= */
const ALPENHOF_CONCEPT_TOPICS = {
  photosynthesis: {
    title: '🔬 1. Photosynthesis Superpower Equation',
    sub: 'How green leaves catch sunlight to cook sweet sugar and exhale pure oxygen!',
    icon: '☀️',
    formula: '6 CO₂ (Carbon Dioxide) + 6 H₂O (Soil Water) + Light Energy ➔ C₆H₁₂O₆ (Plant Sugar) + 6 O₂ (Pure Oxygen)',
    mascotMsg: 'Pip says: "Trees are magical solar-powered oxygen factories! Every second our leaves drink sunshine and clean our mountain atmosphere!"',
    points: [
      '<b>Breathe in Carbon Dioxide (CO₂):</b> Microscopic mouth-pores called stomata absorb carbon released by vehicles and machines.',
      '<b>Drink Glacier Water (H₂O):</b> Deep tree taproots pull cold water up through xylem straw tubes to the high canopy.',
      '<b>Sunlight Solar Panels:</b> Green chlorophyll pigment absorbs blue and red wavelengths of high-altitude Alpine sunlight.',
      '<b>Bake Sweet Plant Sugar (Glucose):</b> The tree uses this sugar energy to grow strong hardwood rings and juicy Boskoop apples.',
      '<b>Exhale Pure Clean Oxygen (O₂):</b> Pure oxygen is released into the sky for humans, dormice, and golden eagles to breathe!'
    ],
    gameTip: 'In Alpenhof, planting European Beech (+28 O₂) and English Oak (+32 O₂) rapidly fills your atmospheric Oxygen Bar!'
  },
  circular: {
    title: '🔄 2. Circular Bio-Economy & Zero-Waste Loops',
    sub: 'In nature, there is no such thing as trash! Every leftover feeds the next living system!',
    icon: '♻️',
    formula: 'Orchard Fallen Leaves ➔ Earthworm Humus ➔ Raised Bed Compost ➔ Simmental Feed ➔ Artisan Gasthof',
    mascotMsg: 'Prof. Whisker Puff purrs: "Zero waste isn\\'t just a rule—it\\'s nature\\'s secret recipe! When we cycle our farm resources, everybody thrives!"',
    points: [
      '<b>Loop 1 · Orchard Humus:</b> Fallen autumn apple and pear leaves are decomposed by earthworms into dark nutrient loam.',
      '<b>Loop 2 · Cattle & Crop Synergy:</b> Manure from our free-ranging Simmental cows naturally fertilizes our Bauerngarten vegetable trenches.',
      '<b>Loop 3 · Zero Food Miles:</b> Fresh pumpkins, radishes, and lake char trout go directly to Gasthof Stuben with ZERO fossil transport!',
      '<b>Loop 4 · Wood Pruning & Biochar:</b> Spring orchard prunings are turned into biochar that holds moisture in soil during dry summers.'
    ],
    gameTip: 'Harvesting crops directly supplies the Gasthof Stuben restaurant and Mosterei juice bar with zero spoilage!'
  },
  soil: {
    title: '🌱 3. The Living Topsoil & Underground Mycorrhizal Web',
    sub: 'The secret underground fungal internet connecting every tree in the alpine forest!',
    icon: '🍄',
    formula: 'Living Roots + Mycorrhizal Fungal Hyphae ➔ +400% Moisture Uptake & Slope Mudslide Defense',
    mascotMsg: 'Pip squeaks: "Beneath our paws lies a bustling fungal internet! Fungi share water and nutrients with trees in exchange for sweet sugar!"',
    points: [
      '<b>The Fungal Internet:</b> Delicate white threads called fungal hyphae connect root tips, trading deep minerals for tree sugars.',
      '<b>Slope Stabilization:</b> Deep taproots of Silver Fir and Swiss Stone Pine physically anchor steep gravel hillsides against mudslides.',
      '<b>Loam Crust Aeration:</b> Compacted alpine clay prevents roots from breathing. That is why aerating plots unlocks microbial respiration.',
      '<b>Soil Compaction Warning:</b> Driving tractors or heavy boots off-road squashes delicate air channels. Always stay on roads!'
    ],
    gameTip: 'Keep visitors strictly on cobblestone roads (Pip\\'s Rule #1) so delicate orchard loam remains spongy and aerated!'
  },
  waters: {
    title: '💧 4. Living Glacial Waters & Natural Hydrology',
    sub: 'From melting glacier snowpacks into sparkling springs, trout ponds, and lush reed filters!',
    icon: '🌊',
    formula: 'Alpine Snow Melt ➔ Gravel Terraces ➔ Reed Beds ➔ Living Trout Pond ➔ Natural Aquifer Recharge',
    mascotMsg: 'Prof. Whisker Puff says: "Water is the lifeblood of the Alps! Reeds and water lilies clean the pond without a drop of chemical chlorine!"',
    points: [
      '<b>Glacial Springs:</b> Pristine mountain runoff trickles into our natural gravel catchment pond, maintaining water clarity.',
      '<b>Natural Biological Filters:</b> Reeds, bulrushes, and water lilies absorb excess nitrates, creating clear water for brown trout.',
      '<b>Microclimate Cooling:</b> The pond cools summer afternoon temperatures across adjacent orchards by up to 3°C.',
      '<b>Aquifer Recharge:</b> Slow water retention recharges deep groundwater tables, keeping alpine pastures lush even in dry seasons.'
    ],
    gameTip: 'Stocking the Living Waters pond with brown trout supplies the BBQ fire pits and Gasthof kitchen with prized alpine char!'
  },
  microgrid: {
    title: '☀️ 5. Agrivoltaics & Clean Mountain Microgrids',
    sub: 'Harvesting electricity from the sun while dual-using the land for shade-loving crops!',
    icon: '⚡',
    formula: '16 High-Clearance Solar Modules + 2 High-Ridge Wind Turbines ➔ 100% Zero-Carbon Village Energy',
    mascotMsg: 'Pip exclaims: "Double harvest! The panels create clean green electricity above, while crops enjoy cool partial shade below!"',
    points: [
      '<b>Dual Land Use:</b> Elevated bifacial solar panels allow vegetables and grazing sheep to flourish underneath.',
      '<b>Drought Protection:</b> Solar panel shade reduces soil moisture evaporation during scorching mountain heatwaves.',
      '<b>Mountain Wind Turbines:</b> Two high-ridge wind turbines capture steady alpine crest breezes day and night.',
      '<b>Zero-Carbon Work:</b> Solar and wind electricity powers our electric tractor, dairy chillers, and grain milling equipment.'
    ],
    gameTip: 'Completing the 4×4 Agrivoltaic array in Chapter 5 powers all village refrigeration and dairy cold storage!'
  },
  recall: {
    title: '🇩🇪 6. Solo Founder Base Farm Recall Link',
    sub: 'How your early lessons in the Solo Founder farm laid the groundwork for Alpenhof!',
    icon: '🚜',
    formula: 'Basic Farm (Steps 1–6) ➔ Alpenhof Commercial Alpine Agroforestry & Circular Bio-Economy',
    mascotMsg: 'Prof. Whisker Puff smiles: "Look how far you\\'ve come! The 6 foundational steps you mastered in Germany now power an entire mountain village!"',
    points: [
      '<b>Ch. 1 Foundation:</b> Solo founder hand tilling ➔ Alpenhof 54-bed Streuobst meadow agroforestry.',
      '<b>Ch. 2 Infrastructure:</b> Workshop & hand tools ➔ Fendt timber tractor & granite road bridge.',
      '<b>Ch. 3 Polyculture:</b> Companion vegetable guild ➔ 4-quadrant Bauerngarten & 3-oval pollination terraces.',
      '<b>Ch. 4 Waters & Livestock:</b> Simple rainwater barrel ➔ Glacial Living Waters pond & Simmental pasture.',
      '<b>Ch. 5 Clean Energy:</b> Solo solar roof ➔ 16-panel Agrivoltaic array + twin high-ridge wind turbines.',
      '<b>Ch. 6 Village Commerce:</b> Roadside vegetable stand ➔ Gasthof Stuben, Mosterei juice bar & alpine BBQ!'
    ],
    gameTip: 'Everything you learned on the solo founder farm directly powers your success in managing Alpenhof!'
  }
};

let curConceptKey = 'photosynthesis';

window.switchGlobalWhyTab = function(btn, key) {
  curConceptKey = key;
  document.querySelectorAll('.concept-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.key === key);
  });
  const data = ALPENHOF_CONCEPT_TOPICS[key] || ALPENHOF_CONCEPT_TOPICS.photosynthesis;
  const body = document.getElementById('globalWhyBody');
  if (!body) return;

  const pointsHtml = data.points.map(p => '<li style="margin-bottom:6px">' + p + '</li>').join('');

  body.innerHTML = '<h4>' + data.title + '</h4>' +
    '<p style="color:#C8E6C9;font-size:0.80rem;margin-bottom:8px">' + data.sub + '</p>' +
    '<div class="concept-formula-box">' + data.formula + '</div>' +
    '<ul style="padding-left:18px;margin:8px 0;line-height:1.4">' + pointsHtml + '</ul>' +
    '<div class="concept-pip-tip">💡 <b>Pip\\'s In-Game Tip:</b> ' + data.gameTip + '</div>';
};

function openWhy(){
  curConceptKey = 'photosynthesis';
  const data = ALPENHOF_CONCEPT_TOPICS.photosynthesis;
  const initialPoints = data.points.map(p => '<li style="margin-bottom:6px">' + p + '</li>').join('');

  const h = '<div class="modal-hdr">' +
    '<h3>💡 Alpine Ecological Concept Library & Science Academy</h3>' +
    '<button class="btn-close" onclick="closeModal()">✕</button>' +
  '</div>' +
  '<div class="concept-lib-card">' +
    '<div class="concept-dialogue-bubble">' +
      '<span class="bubble-avatar" aria-hidden="true">🐱</span>' +
      '<div class="bubble-text">' +
        '<b>Prof. Whisker Puff & Apprentice Pip\\'s Science Briefing:</b><br/>' +
        '"Welcome, Young Eco-Scientist! Ever wondered how green leaves cook sugar from sunshine or how an entire alpine village lives with zero waste? Pick a concept below to master real ecology!"' +
      '</div>' +
    '</div>' +
    '<div class="concept-tabs-row">' +
      '<button class="concept-tab-btn active" data-key="photosynthesis" onclick="switchGlobalWhyTab(this, \\'photosynthesis\\')">🔬 1. Photosynthesis</button>' +
      '<button class="concept-tab-btn" data-key="circular" onclick="switchGlobalWhyTab(this, \\'circular\\')">🔄 2. Circular Economy</button>' +
      '<button class="concept-tab-btn" data-key="soil" onclick="switchGlobalWhyTab(this, \\'soil\\')">🌱 3. Living Topsoil</button>' +
      '<button class="concept-tab-btn" data-key="waters" onclick="switchGlobalWhyTab(this, \\'waters\\')">💧 4. Living Waters</button>' +
      '<button class="concept-tab-btn" data-key="microgrid" onclick="switchGlobalWhyTab(this, \\'microgrid\\')">☀️ 5. Agrivoltaics</button>' +
      '<button class="concept-tab-btn" data-key="recall" onclick="switchGlobalWhyTab(this, \\'recall\\')">🇩🇪 6. Base Farm Link</button>' +
    '</div>' +
    '<div class="concept-body-box" id="globalWhyBody">' +
      '<h4>' + data.title + '</h4>' +
      '<p style="color:#C8E6C9;font-size:0.80rem;margin-bottom:8px">' + data.sub + '</p>' +
      '<div class="concept-formula-box">' + data.formula + '</div>' +
      '<ul style="padding-left:18px;margin:8px 0;line-height:1.4">' + initialPoints + '</ul>' +
      '<div class="concept-pip-tip">💡 <b>Pip\\'s In-Game Tip:</b> ' + data.gameTip + '</div>' +
    '</div>' +
    '<button class="btn btn-g" style="width:100%;font-size:0.86rem;padding:12px;margin-top:4px" onclick="closeModal();grantXP({biodiversity:20});toast(\\'🏆 Science Academy Discovery Commenced! (+20 Eco-XP)\\')">' +
      'Begin Alpine Science Exploration ➔' +
    '</button>' +
  '</div>';

  openModal(h, true);
}
`;

// Perform line-based replacement to guarantee 100% precision regardless of quotes or line endings
const isCRLF = html.includes('\r\n');
const eol = isCRLF ? '\r\n' : '\n';
const lines = html.split(/\r?\n/);

// Find exact index of openSpecies
const idxSpecies = lines.findIndex(l => l.trim() === 'function openSpecies(){');
console.log('idxSpecies:', idxSpecies);
if (idxSpecies === -1) {
  console.error('Failed to find openSpecies');
  process.exit(1);
}
let idxSpeciesEnd = idxSpecies;
while (idxSpeciesEnd < lines.length && lines[idxSpeciesEnd].trim() !== '}') {
  idxSpeciesEnd++;
}
console.log('idxSpeciesEnd:', idxSpeciesEnd);

// Replace lines[idxSpecies ... idxSpeciesEnd]
lines.splice(idxSpecies, (idxSpeciesEnd - idxSpecies + 1), fullSpeciesCollectionData.trim());

// Re-split and find openWhy
let intermediateHtml = lines.join(eol);
let lines2 = intermediateHtml.split(/\r?\n/);
const idxWhy = lines2.findIndex(l => l.trim() === 'function openWhy(){');
console.log('idxWhy:', idxWhy);
if (idxWhy === -1) {
  console.error('Failed to find openWhy');
  process.exit(1);
}
// Find end of switchGlobalWhyTab which ends with `};`
let idxWhyEnd = idxWhy;
while (idxWhyEnd < lines2.length && lines2[idxWhyEnd].trim() !== '};') {
  idxWhyEnd++;
}
console.log('idxWhyEnd:', idxWhyEnd);

lines2.splice(idxWhy, (idxWhyEnd - idxWhy + 1), redesignedConceptLibrary.trim());

let finalHtml = lines2.join(eol);

fs.writeFileSync(alpenhofHtmlPath, finalHtml);
fs.writeFileSync(publicAlpenhofHtmlPath, finalHtml);
console.log('Successfully written both bavaria/alpenhof.html and public/bavaria/alpenhof.html with line replacement!');
