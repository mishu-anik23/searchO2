/**
 * SearchO2 — Pure Volumetric 3D Isometric VR Asset System
 * Diverse Avatar Picker, Biome Cards & Scout-Touching Chapter Walking Tour
 * Integrates directly with CHAPTER_PRIMARY_OBJECTS, exploreChapterObject, animateAlongWaypoints
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // 4 Global Regions & 12 Diverse Pure Volumetric 3D Isometric Avatars
  // Age bands: 8-10, 11-15, 16-25, 26-40, 41-60, 61-90
  // ---------------------------------------------------------------------------
  var REGIONS = [
    { id: 'all', name: 'All Regions', flag: '🌍', desc: '10 Planetary Biomes across Europe, Asia, Africa & Americas' },
    { id: 'europe', name: 'Europe', flag: '🇪🇺', desc: 'Central European Plains, Bavarian Alpenhof, Spanish Dehesa & Nordic Taiga' },
    { id: 'asia', name: 'Asia & Indo-Pacific', flag: '🌏', desc: 'East Asian Woodlands, Hokkaido Bamboo & Saint Martin Blue Lab' },
    { id: 'africa', name: 'Africa & Maghreb', flag: '🌍', desc: 'Sahel Great Green Wall, Maghreb Oasis & Madagascar Spiny Forest' },
    { id: 'americas', name: 'Americas', flag: '🌎', desc: 'Amazon Rainforest Basin, Andean Terraces & Pacific Northwest' }
  ];

  var AVATAR_ROSTER = [
    {
      id: 'av_rio_boy',
      name: 'Rio',
      adjective: 'Curious',
      ageBand: '8-10',
      gender: 'boy',
      region: 'americas',
      regionName: 'Americas',
      regionFlag: '🌎',
      country: 'Brazil',
      heritage: 'Brazilian riverside',
      dress: 'Bright cotton shirt & river sandals',
      skin: '#C68642',
      hair: '#2C1810',
      top: '#E53935',
      bottom: '#1565C0',
      accent: '#FFD54F'
    },
    {
      id: 'av_aisha_girl',
      name: 'Aisha',
      adjective: 'Bright',
      ageBand: '8-10',
      gender: 'girl',
      region: 'africa',
      regionName: 'Africa & Maghreb',
      regionFlag: '🌍',
      country: 'Senegal',
      heritage: 'West African print',
      dress: 'Ankara-pattern dress & coral beads',
      skin: '#5D4037',
      hair: '#1A1A1A',
      top: '#FF8F00',
      bottom: '#6A1B9A',
      accent: '#FFD54F'
    },
    {
      id: 'av_kenji_boy',
      name: 'Kenji',
      adjective: 'Steady',
      ageBand: '11-15',
      gender: 'boy',
      region: 'asia',
      regionName: 'Asia & Indo-Pacific',
      regionFlag: '🌏',
      country: 'Japan',
      heritage: 'Japanese school jacket',
      dress: 'Navy gakuran-style jacket & sneakers',
      skin: '#E0BEA0',
      hair: '#1A1A1A',
      top: '#1A237E',
      bottom: '#37474F',
      accent: '#E53935'
    },
    {
      id: 'av_sofia_girl',
      name: 'Sofia',
      adjective: 'Gentle',
      ageBand: '11-15',
      gender: 'girl',
      region: 'americas',
      regionName: 'Americas',
      regionFlag: '🌎',
      country: 'Andes / Peru',
      heritage: 'Andean scarf',
      dress: 'Woven alpaca scarf & earth-tone skirt',
      skin: '#A0522D',
      hair: '#3E2723',
      top: '#00897B',
      bottom: '#6D4C41',
      accent: '#FF7043'
    },
    {
      id: 'av_liam_man',
      name: 'Liam',
      adjective: 'Eager',
      ageBand: '16-25',
      gender: 'man',
      region: 'europe',
      regionName: 'Europe & Mediterranean',
      regionFlag: '🇪🇺',
      country: 'Ireland',
      heritage: 'Irish field kit',
      dress: 'Tweed work vest, rolled sleeves & field boots',
      skin: '#F5D0A9',
      hair: '#BF360C',
      top: '#2E7D32',
      bottom: '#455A64',
      accent: '#FFC107'
    },
    {
      id: 'av_mei_woman',
      name: 'Mei',
      adjective: 'Focused',
      ageBand: '16-25',
      gender: 'woman',
      region: 'asia',
      regionName: 'Asia & Indo-Pacific',
      regionFlag: '🌏',
      country: 'China',
      heritage: 'Chinese work tunic',
      dress: 'Indigo cotton work tunic & sash',
      skin: '#E8C4A2',
      hair: '#212121',
      top: '#283593',
      bottom: '#37474F',
      accent: '#E53935'
    },
    {
      id: 'av_omar_man',
      name: 'Omar',
      adjective: 'Patient',
      ageBand: '26-40',
      gender: 'man',
      region: 'africa',
      regionName: 'Africa & Maghreb',
      regionFlag: '🌍',
      country: 'Morocco / Maghreb',
      heritage: 'Maghrebi sash',
      dress: 'Linen tunic, desert sash & leather babouche',
      skin: '#8D6E63',
      hair: '#1A1A1A',
      top: '#FFF8E1',
      bottom: '#5D4037',
      accent: '#00897B'
    },
    {
      id: 'av_priya_woman',
      name: 'Priya',
      adjective: 'Wise',
      ageBand: '26-40',
      gender: 'woman',
      region: 'asia',
      regionName: 'Asia & Indo-Pacific',
      regionFlag: '🌏',
      country: 'Bengal / South Asia',
      heritage: 'South Asian kurta',
      dress: 'Saffron kurta, flowing dupatta & brass bangle',
      skin: '#C68642',
      hair: '#3E2723',
      top: '#FF8F00',
      bottom: '#6A1B9A',
      accent: '#FFD54F'
    },
    {
      id: 'av_jonas_man',
      name: 'Jonas',
      adjective: 'Calm',
      ageBand: '41-60',
      gender: 'man',
      region: 'europe',
      regionName: 'Europe & Mediterranean',
      regionFlag: '🇪🇺',
      country: 'Sweden / Nordic',
      heritage: 'Nordic wool vest',
      dress: 'Chunky knit wool vest, field trousers & boots',
      skin: '#F5D0A9',
      hair: '#78909C',
      top: '#546E7A',
      bottom: '#37474F',
      accent: '#81C784'
    },
    {
      id: 'av_amara_woman',
      name: 'Amara',
      adjective: 'Kind',
      ageBand: '41-60',
      gender: 'woman',
      region: 'africa',
      regionName: 'Africa & Maghreb',
      regionFlag: '🌍',
      country: 'East Africa / Madagascar',
      heritage: 'East African wrap',
      dress: 'Kitenge wrap, matching headscarf & beaded collar',
      skin: '#4E342E',
      hair: '#1A1A1A',
      top: '#C62828',
      bottom: '#F9A825',
      accent: '#00ACC1'
    },
    {
      id: 'av_haruto_man',
      name: 'Haruto',
      adjective: 'Gentle',
      ageBand: '61-90',
      gender: 'man',
      region: 'asia',
      regionName: 'Asia & Indo-Pacific',
      regionFlag: '🌏',
      country: 'Japan',
      heritage: 'Japanese happi',
      dress: 'Master indigo happi coat, bamboo staff & sandals',
      skin: '#E0BEA0',
      hair: '#ECEFF1',
      top: '#1A237E',
      bottom: '#37474F',
      accent: '#E53935'
    },
    {
      id: 'av_elena_woman',
      name: 'Elena',
      adjective: 'Warm',
      ageBand: '61-90',
      gender: 'woman',
      region: 'europe',
      regionName: 'Europe & Mediterranean',
      regionFlag: '🇪🇺',
      country: 'Spain / Mediterranean',
      heritage: 'Mediterranean shawl',
      dress: 'Olive linen dress, sun shawl & straw hat',
      skin: '#D4A574',
      hair: '#CFD8DC',
      top: '#ECEFF1',
      bottom: '#5D4037',
      accent: '#00897B'
    }
  ];

  var AGE_BANDS = ['all', '8-10', '11-15', '16-25', '26-40', '41-60', '61-90'];

  // Chapter Unlocked 3D After-Build Objects (to display sequentially as transparent locked blueprints)
  var CHAPTER_TOUR_OBJECTS = {
    1: [
      { key: 'plot', name: 'Plot 1 Soil Bed & Seedling', icon: '🌱' },
      { key: 'jute_tarp', name: 'Jute Tarpaulin Hidden Cache', icon: '📦' }
    ],
    2: [
      { key: 'gate', name: 'Main Timber Entrance Gate', icon: '⛩️' },
      { key: 'crew_shed', name: 'Crew Shed & Tool Racks', icon: '🏡' },
      { key: 'road', name: 'Main Arterial Cobblestone Road', icon: '🛤️' },
      { key: 'storage', name: 'Granary Storage Barn', icon: '🌾' },
      { key: 'garage', name: 'Tractor Garage & Fendt Tractor', icon: '🚜' }
    ],
    3: [
      { key: 'garden', name: 'Botanical Pollinator Flower Garden', icon: '🌸' },
      { key: 'crop_field', name: 'Rotational 3-Bed Crop Field', icon: '🌾' },
      { key: 'garden_walk', name: 'Heritage Garden Boardwalk', icon: '🪵' }
    ],
    4: [
      { key: 'pond', name: 'Living Waters Retention Pond', icon: '🐟' },
      { key: 'cattle_farm', name: 'Simmental Cow Shed & Pasture', icon: '🐄' }
    ],
    5: [
      { key: 'energy_storage', name: 'BESS Microgrid Substation', icon: '🔋' },
      { key: 'wt_nw', name: 'NW Ridge Wind Turbine', icon: '💨' },
      { key: 'wt_ne', name: 'NE Hilltop Wind Turbine', icon: '💨' },
      { key: 'wt_sw', name: 'SW Meadow Wind Turbine', icon: '💨' },
      { key: 'wt_se', name: 'SE Orchard Wind Turbine', icon: '💨' }
    ],
    6: [
      { key: 'juice_bar', name: 'Hof-Mosterei Juice Bar & Cider Press', icon: '🍎' },
      { key: 'coffee_shop', name: 'Alpenhof Gasthof Stuben & Terrace', icon: '🍽️' }
    ],
    7: [
      { key: 'eco_passport', name: 'Global Biome Eco-Passport Hub', icon: '🌍' }
    ],
    8: [
      { key: 'space_mission', name: 'Artemis Bioregenerative Space Center', icon: '🚀' }
    ]
  };

  // Chapter mapping for every buildable / blueprint facility on the estate
  var OBJECT_TO_CHAPTER = {
    plot: 1,
    jute_tarp: 1,
    gate: 2,
    crew_shed: 2,
    road: 2,
    storage: 2,
    garage: 2,
    garden: 3,
    crop_field: 3,
    garden_walk: 3,
    pond: 4,
    cattle_farm: 4,
    energy_storage: 5,
    wind_turbine: 5,
    wt_nw: 5,
    wt_ne: 5,
    wt_sw: 5,
    wt_se: 5,
    juice_bar: 6,
    coffee_shop: 6,
    eco_passport: 7,
    space_mission: 8
  };

  // Detailed Step-by-Step Unlock Specifications for 3D Object Mouse Hover Modal
  var OBJECT_UNLOCK_SPECS = {
    plot: {
      name: 'Plot 1 Soil Bed & Clean O₂',
      icon: '🌱',
      chapter: 1,
      cost: '€25 prep',
      prereq: 'Uncover hand tools from Jute Tarp cache',
      steps: [
        '1. Survey the 8-chapter estate masterplan (+40 XP).',
        '2. Uncover the hidden jute tarp tool cache beside the shed.',
        '3. Click Plot 1 to till compacted bedrock crust with hand spade (€25).',
        '4. Plant your first crop seedling and water it to release clean O₂.'
      ]
    },
    jute_tarp: {
      name: 'Jute Tarpaulin Hidden Tool Cache',
      icon: '📦',
      chapter: 1,
      cost: 'Free',
      prereq: 'Survey all 8 estate chapters',
      steps: [
        '1. Follow the 3D directional locator to survey all 8 chapters.',
        '2. Locate the heavy jute tarpaulin covering at the farm shed boundary.',
        '3. Click to uncover and claim hand-forged spade & broadfork (+10 XP).'
      ]
    },
    gate: {
      name: 'Grand Farm Entrance Gate',
      icon: '⛩️',
      chapter: 2,
      cost: '€120',
      prereq: 'Chapter 2 unlocked & 1 Recruited Laborer',
      steps: [
        '1. Complete Chapter 1 solo founder goals.',
        '2. Build Crew Shed & recruit at least 1 Field Laborer.',
        '3. Click the eastern estate boundary to erect timber & stone gate (€120 · 2h).'
      ]
    },
    crew_shed: {
      name: 'Crew Shed & Living Quarters',
      icon: '🏠',
      chapter: 2,
      cost: '€200',
      prereq: 'Chapter 2 unlocked ("Build the Farm")',
      steps: [
        '1. Advance to Chapter 2 after your first clean O₂ harvest.',
        '2. Open the Crew Shed plot peg in the SW wing.',
        '3. Construct living quarters (€200 · 3h with 1 laborer, 1.5h with 2 laborers).',
        '4. Recruit farm specialists (Laborer, Farmer, Botanist, Engineer).'
      ]
    },
    road: {
      name: 'Main Arterial Cobblestone Road',
      icon: '🛤️',
      chapter: 2,
      cost: '€170 total',
      prereq: 'Recruit Field Laborer & Heavy Spade/Pickaxe',
      steps: [
        '1. Recruit a Field Laborer at the Crew Shed (€15/d).',
        '2. Clear bedrock boulder corridor obstacles (€50 · 2h).',
        '3. Pave the central arterial road (€120 · 4h) for supply wagons & visitors.'
      ]
    },
    storage: {
      name: 'Granary Storage Barn',
      icon: '🌾',
      chapter: 2,
      cost: '€100',
      prereq: 'Main Arterial Road paved',
      steps: [
        '1. Complete paving the Main Arterial Road (Step 2).',
        '2. Click the central upper yard storage peg or HUD button.',
        '3. Construct Granary Barn (€100) to safeguard crops from spoilage.'
      ]
    },
    garage: {
      name: 'Agricultural Equipment Garage',
      icon: '🚜',
      chapter: 2,
      cost: '€350',
      prereq: 'Main Arterial Road paved',
      steps: [
        '1. Pave Main Arterial Road to allow heavy machinery transit.',
        '2. Click East Mechanization depot site.',
        '3. Construct Garage (€350) to deploy 2-wheel harvest carts & tractor haulage (+5 Rep).'
      ]
    },
    garden: {
      name: 'Botanical Pollinator Flower Garden',
      icon: '🌸',
      chapter: 3,
      cost: '€300',
      prereq: 'Chapter 3 unlocked & Main Road paved',
      steps: [
        '1. Advance to Chapter 3 ("Botanical Polyculture & Biodiversity").',
        '2. Ensure Main Arterial Road is paved.',
        '3. Click the south curb site opposite the pond.',
        '4. Construct Garden (€300) and cultivate Sunflowers, Roses, or Daisies to attract beneficial bees (+8 Rep).'
      ]
    },
    crop_field: {
      name: 'Rotational 3-Bed Companion Field',
      icon: '🌾',
      chapter: 3,
      cost: '€350',
      prereq: 'Chapter 3 unlocked & Main Road paved',
      steps: [
        '1. Connect south field block to estate transport via Main Road.',
        '2. Click octagonal field site in south block.',
        '3. Construct 4-bed companion planting field (€350) for grain, corn & legumes (+8 Rep).'
      ]
    },
    garden_walk: {
      name: 'Heritage Garden Nature Walkway',
      icon: '🪵',
      chapter: 3,
      cost: '€180',
      prereq: 'Storage Barn & Garden built',
      steps: [
        '1. Construct Storage Barn and Botanical Garden.',
        '2. Click road corridor between Granary and Garden.',
        '3. Pave cobblestone nature path (€180) to boost flower freshness (+25%) and farm credibility (+4 Rep).'
      ]
    },
    pond: {
      name: 'Living Waters Retention Lake',
      icon: '🐟',
      chapter: 4,
      cost: '€400',
      prereq: 'Chapter 4 unlocked ("Living Waters & Retention")',
      steps: [
        '1. Advance to Chapter 4 to study aquatic closed-loop retention.',
        '2. Ensure Main Arterial Road is paved.',
        '3. Click serene north curb site opposite Botanical Garden.',
        '4. Construct Pond (€400) and choose Trout Farm or Duck Reserve (+10 Rep).'
      ]
    },
    cattle_farm: {
      name: 'Simmental Cow Shed & Pasture',
      icon: '🐄',
      chapter: 4,
      cost: '€550 total',
      prereq: 'Chapter 4 unlocked & Main Road paved',
      steps: [
        '1. Advance to Chapter 4 ("The Circular Grazing Cycle").',
        '2. Construct 4-chamber vertical timber cattle shed (€400).',
        '3. Erect sturdy post-and-rail perimeter paddock fencing (€150).',
        '4. Adopt Simmental dairy cows & sheep to produce organic milk, wool, and rich manure (+10 Rep).'
      ]
    },
    energy_storage: {
      name: 'BESS Microgrid Battery Substation',
      icon: '🔋',
      chapter: 5,
      cost: '€400',
      prereq: 'Chapter 5 unlocked & Wind Turbines generating power',
      steps: [
        '1. Advance to Chapter 5 ("Renewable Energy & Microgrid").',
        '2. Commission primary wind turbines so clean electricity flows.',
        '3. Click Battery Substation site beside Crew Shed in SW utility yard.',
        '4. Construct 500 kWh BESS (€400) to store clean surplus power and export to regional grid (+€80/100 kWh).'
      ]
    },
    wt_nw: {
      name: 'Northwest Ridge Wind Turbine',
      icon: '💨',
      chapter: 5,
      cost: '€275',
      prereq: 'Chapter 5 unlocked & Certified Engineer hired',
      steps: [
        '1. Advance to Chapter 5 and recruit an Engineer at Crew Shed (€180/d).',
        '2. Click Northwest Ridge hilltop spot.',
        '3. Erect turbine (€275 · 4h) and perform 3-point technical safety inspection (Gearbox, Pitch, Inverter).'
      ]
    },
    wt_ne: {
      name: 'Northeast Hilltop Wind Turbine',
      icon: '💨',
      chapter: 5,
      cost: '€275',
      prereq: 'Chapter 5 unlocked & Certified Engineer hired',
      steps: [
        '1. Recruit Certified Engineer at Crew Shed.',
        '2. Click Northeast Hilltop perimeter spot.',
        '3. Erect turbine (€275 · 4h) and complete safety checklist to complete 2-turbine primary clean grid.'
      ]
    },
    wt_sw: {
      name: 'Southwest Meadow Wind Turbine',
      icon: '💨',
      chapter: 5,
      cost: '€275',
      prereq: 'Chapter 5 unlocked & Primary Turbines operational',
      steps: [
        '1. Operational NW and NE primary turbines generating power.',
        '2. Click Southwest Meadow spot beside BESS substation.',
        '3. Erect turbine (€275 · 4h) for 2+2 hot-redundant backup power during peak load.'
      ]
    },
    wt_se: {
      name: 'Southeast Orchard Wind Turbine',
      icon: '💨',
      chapter: 5,
      cost: '€275',
      prereq: 'Chapter 5 unlocked & Certified Engineer hired',
      steps: [
        '1. Recruit Certified Engineer at Crew Shed.',
        '2. Click Southeast Orchard corner spot.',
        '3. Erect turbine (€275 · 4h) to complete the 4-corner full perimeter redundant renewable microgrid (12 kWh/h).'
      ]
    },
    wind_turbine: {
      name: '4-Corner Wind Turbine Grid',
      icon: '💨',
      chapter: 5,
      cost: '€275 each',
      prereq: 'Chapter 5 unlocked & Certified Engineer hired',
      steps: [
        '1. Recruit an Engineer at the Crew Shed (€180/d).',
        '2. Erect turbines at the 4 perimeter corners (NW, NE, SW, SE).',
        '3. Execute 3-point technical safety inspection for each turbine to establish hot-redundant grid.'
      ]
    },
    juice_bar: {
      name: 'Hof-Mosterei Organic Juice & Cider Bar',
      icon: '🍎',
      chapter: 6,
      cost: '€700',
      prereq: 'Chapter 6 unlocked & Main Road paved',
      steps: [
        '1. Advance to Chapter 6 ("Eco-Village & Circular Commerce").',
        '2. Click South Promenade plot opposite the coffee shop.',
        '3. Construct Juice Bar (€700) to press orchard harvest into refreshing juices & cider (+5 Rep).'
      ]
    },
    coffee_shop: {
      name: 'Alpenhof Gasthof Stuben & Terrace Café',
      icon: '🍽️',
      chapter: 6,
      cost: '€800',
      prereq: 'Chapter 6 unlocked & Main Road paved',
      steps: [
        '1. Advance to Chapter 6 ("Eco-Village & Circular Commerce").',
        '2. Click North Promenade commercial plot.',
        '3. Construct Café (€800) to serve artisan coffee and hospitality to visitors (+5 Rep).'
      ]
    },
    eco_passport: {
      name: 'Global Biome Eco-Passport Hub',
      icon: '🌍',
      chapter: 7,
      cost: 'Free Blueprint',
      prereq: 'Chapter 7 unlocked ("World Regenerative Network")',
      steps: [
        '1. Advance to Chapter 7 after establishing your community eco-village.',
        '2. Click the Global Biome Eco-Passport site.',
        '3. Unlock planetary ecological exchange with Arctic Tundra, Amazon Rainforest, Sahel Savanna, and Indo-Pacific Coral biomes.'
      ]
    },
    space_mission: {
      name: 'Artemis Bioregenerative Launchpad',
      icon: '🚀',
      chapter: 8,
      cost: 'Free Blueprint',
      prereq: 'Chapter 8 unlocked ("Beyond Earth: The Living Cosmos")',
      steps: [
        '1. Advance to Chapter 8 after mastering planetary bioregenerative closed loops.',
        '2. Click the Artemis Space Launchpad site.',
        '3. Deploy closed-loop hydroponics, algae photobioreactors, and ISRU oxygen synthesis for Lunar and Martian colonies.'
      ]
    }
  };

  var tourState = {
    active: false,
    avatarId: null,
    avatar: null,
    currentChapter: 1,
    walkerEl: null,
    ghostLayer: null,
    skipped: false,
    regionFilter: 'all',
    ageFilter: 'all',
    cooldownActive: false,
    cooldownRemaining: 0,
    cooldownTimer: null,
    pendingNextChapter: null
  };

  // Helper: Shade color utility
  function shade(hex, amt) {
    try {
      var c = (hex || '#888888').replace('#', '');
      if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      var num = parseInt(c, 16);
      var r = Math.max(0, Math.min(255, (num >> 16) + amt));
      var g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
      var b = Math.max(0, Math.min(255, (num & 0xff) + amt));
      return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    } catch (e) {
      return hex;
    }
  }

  // ---------------------------------------------------------------------------
  // Pure Volumetric 3D Isometric SVG Human Figure
  // ---------------------------------------------------------------------------
  function avatarFigureSvg(av, opts) {
    opts = opts || {};
    var w = opts.w || 72;
    var h = opts.h || 96;
    var skin = av.skin || '#C68642';
    var hair = av.hair || '#212121';
    var top = av.top || '#2E7D32';
    var bottom = av.bottom || '#1565C0';
    var accent = av.accent || '#FFD54F';

    var isChild = av.ageBand === '8-10' || av.ageBand === '11-15';
    var isElder = av.ageBand === '61-90';

    var headR = isChild ? 12 : (isElder ? 10.5 : 11);
    var headY = isChild ? 16 : 14;
    var torsoY = isChild ? 28 : 25;
    var torsoH = isChild ? 22 : 26;
    var legY = torsoY + torsoH;
    var legH = isChild ? 18 : 24;

    var avUniqueId = av.id + '_' + (opts.unique || Math.floor(Math.random() * 10000));

    return (
      '<svg class="walker-svg" viewBox="0 0 72 96" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs>' +
      // 135° Overhead Isometric Sunlight Gradients
      '<radialGradient id="avG_' + avUniqueId + '_skin" cx="30%" cy="26%" r="72%">' +
        '<stop offset="0%" stop-color="' + shade(skin, 35) + '"/>' +
        '<stop offset="50%" stop-color="' + skin + '"/>' +
        '<stop offset="85%" stop-color="' + shade(skin, -18) + '"/>' +
        '<stop offset="100%" stop-color="' + shade(skin, -32) + '"/>' +
      '</radialGradient>' +
      '<linearGradient id="avG_' + avUniqueId + '_top" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="' + shade(top, 32) + '"/>' +
        '<stop offset="45%" stop-color="' + top + '"/>' +
        '<stop offset="80%" stop-color="' + shade(top, -22) + '"/>' +
        '<stop offset="100%" stop-color="' + shade(top, -38) + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="avG_' + avUniqueId + '_bot" x1="0" y1="0" x2="0.6" y2="1">' +
        '<stop offset="0%" stop-color="' + shade(bottom, 24) + '"/>' +
        '<stop offset="50%" stop-color="' + bottom + '"/>' +
        '<stop offset="100%" stop-color="' + shade(bottom, -35) + '"/>' +
      '</linearGradient>' +
      '<radialGradient id="avG_' + avUniqueId + '_hair" cx="32%" cy="24%" r="75%">' +
        '<stop offset="0%" stop-color="' + shade(hair, 45) + '"/>' +
        '<stop offset="50%" stop-color="' + hair + '"/>' +
        '<stop offset="100%" stop-color="' + shade(hair, -40) + '"/>' +
      '</radialGradient>' +
      '<linearGradient id="avG_' + avUniqueId + '_boot" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#5D4037"/>' +
        '<stop offset="50%" stop-color="#2E1C14"/>' +
        '<stop offset="100%" stop-color="#140D0A"/>' +
      '</linearGradient>' +
      '<linearGradient id="avG_' + avUniqueId + '_pack" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#795548"/>' +
        '<stop offset="50%" stop-color="#4E342E"/>' +
        '<stop offset="100%" stop-color="#27140E"/>' +
      '</linearGradient>' +
      '<linearGradient id="avG_' + avUniqueId + '_spade" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#ECEFF1"/>' +
        '<stop offset="40%" stop-color="#B0BEC5"/>' +
        '<stop offset="80%" stop-color="#607D8B"/>' +
        '<stop offset="100%" stop-color="#37474F"/>' +
      '</linearGradient>' +
      '</defs>' +

      // 1. Volumetric Elliptical Ground Shadow with Ambient Occlusion Core
      '<ellipse class="av-shadow" cx="36" cy="90" rx="18" ry="5.5" fill="rgba(0,0,0,0.28)"/>' +
      '<ellipse class="av-shadow-core" cx="36" cy="90.5" rx="10" ry="3" fill="rgba(0,0,0,0.20)"/>' +

      // 2. Left Leg & 3D Hiker Boot
      '<g class="av-leg-left">' +
        '<rect x="24.5" y="' + legY + '" width="8.5" height="' + (legH - 2) + '" rx="3" fill="url(#avG_' + avUniqueId + '_bot)"/>' +
        // Shaded side facet
        '<path class="av-leg-side-left" d="M24.5 ' + legY + ' L26.5 ' + legY + ' L26.5 ' + (legY + legH - 2) + ' L24.5 ' + (legY + legH - 2) + ' Z" fill="' + shade(bottom, -40) + '" opacity="0.45"/>' +
        // 3D Boot Upper Leather
        '<path d="M23.5 ' + (legY + legH - 3) + ' L33.5 ' + (legY + legH - 3) + ' L34 ' + (legY + legH + 2) + ' L22.5 ' + (legY + legH + 2) + ' Z" fill="url(#avG_' + avUniqueId + '_boot)"/>' +
        // 3D Boot Toe Cap
        '<path class="av-boot-toe-left" d="M22.5 ' + (legY + legH + 1) + ' Q28 ' + (legY + legH + 4) + ' 34 ' + (legY + legH + 1) + ' L34 ' + (legY + legH + 3.5) + ' Q28 ' + (legY + legH + 6) + ' 22.5 ' + (legY + legH + 3.5) + ' Z" fill="#3E2723" stroke="rgba(255,255,255,0.25)" stroke-width="0.5"/>' +
        // 3D Rubber Tread Sole
        '<path class="av-boot-sole-left" d="M22 ' + (legY + legH + 3.5) + ' L34.5 ' + (legY + legH + 3.5) + ' L34 ' + (legY + legH + 5.5) + ' L22.5 ' + (legY + legH + 5.5) + ' Z" fill="#140D0A"/>' +
      '</g>' +

      // 3. Right Leg & 3D Hiker Boot
      '<g class="av-leg-right">' +
        '<rect x="39" y="' + legY + '" width="8.5" height="' + (legH - 2) + '" rx="3" fill="url(#avG_' + avUniqueId + '_bot)"/>' +
        // Lit highlight facet
        '<path class="av-leg-side-right" d="M45.5 ' + legY + ' L47.5 ' + legY + ' L47.5 ' + (legY + legH - 2) + ' L45.5 ' + (legY + legH - 2) + ' Z" fill="' + shade(bottom, -40) + '" opacity="0.45"/>' +
        // 3D Boot Upper Leather
        '<path d="M38 ' + (legY + legH - 3) + ' L48 ' + (legY + legH - 3) + ' L48.5 ' + (legY + legH + 2) + ' L37.5 ' + (legY + legH + 2) + ' Z" fill="url(#avG_' + avUniqueId + '_boot)"/>' +
        // 3D Boot Toe Cap
        '<path class="av-boot-toe-right" d="M37.5 ' + (legY + legH + 1) + ' Q43 ' + (legY + legH + 4) + ' 48.5 ' + (legY + legH + 1) + ' L48.5 ' + (legY + legH + 3.5) + ' Q43 ' + (legY + legH + 6) + ' 37.5 ' + (legY + legH + 3.5) + ' Z" fill="#3E2723" stroke="rgba(255,255,255,0.25)" stroke-width="0.5"/>' +
        // 3D Rubber Tread Sole
        '<path class="av-boot-sole-right" d="M37 ' + (legY + legH + 3.5) + ' L49 ' + (legY + legH + 3.5) + ' L48.5 ' + (legY + legH + 5.5) + ' L37.5 ' + (legY + legH + 5.5) + ' Z" fill="#140D0A"/>' +
      '</g>' +

      // 4. Volumetric Torso Prism (Front & Back Views for 2.5D Isometric 360°)
      '<g class="av-torso">' +
        // Back View (Facing North / Away from camera)
        '<g class="av-torso-back">' +
          '<path d="M22 ' + (torsoY + 3) + ' L36 ' + torsoY + ' L50 ' + (torsoY + 3) + ' L47 ' + (torsoY + torsoH) + ' L25 ' + (torsoY + torsoH) + ' Z" fill="url(#avG_' + avUniqueId + '_top)" stroke="' + shade(top, -40) + '" stroke-width="0.8"/>' +
          // 3D Explorer Field Satchel / Backpack
          '<g class="av-backpack">' +
            '<rect x="25" y="' + (torsoY + 4) + '" width="22" height="18" rx="3.8" fill="rgba(0,0,0,0.28)"/>' +
            '<rect x="25.5" y="' + (torsoY + 3) + '" width="21" height="17" rx="3.5" fill="url(#avG_' + avUniqueId + '_pack)" stroke="#27140E" stroke-width="0.8"/>' +
            '<path d="M25 ' + (torsoY + 3) + ' Q36 ' + torsoY + ' 47 ' + (torsoY + 3) + ' L46 ' + (torsoY + 7.5) + ' Q36 ' + (torsoY + 5.5) + ' 26 ' + (torsoY + 7.5) + ' Z" fill="#6D4C41" stroke="#3E2723" stroke-width="0.6"/>' +
            '<path d="M25.5 ' + (torsoY + 3) + ' Q36 ' + (torsoY + 0.5) + ' 46.5 ' + (torsoY + 3) + '" stroke="rgba(255,255,255,0.35)" stroke-width="0.75" fill="none"/>' +
            '<line x1="31" y1="' + (torsoY + 4) + '" x2="31" y2="' + (torsoY + 20) + '" stroke="#FFD54F" stroke-width="1.3"/>' +
            '<line x1="41" y1="' + (torsoY + 4) + '" x2="41" y2="' + (torsoY + 20) + '" stroke="#FFD54F" stroke-width="1.3"/>' +
            '<circle cx="31" cy="' + (torsoY + 12.5) + '" r="1.4" fill="#FFC107" stroke="#FFA000" stroke-width="0.5"/>' +
            '<circle cx="41" cy="' + (torsoY + 12.5) + '" r="1.4" fill="#FFC107" stroke="#FFA000" stroke-width="0.5"/>' +
            // Bottom gear bedroll
            '<rect x="24.5" y="' + (torsoY + 19) + '" width="23" height="4.5" rx="2.2" fill="#558B2F" stroke="#33691E" stroke-width="0.6"/>' +
          '</g>' +
        '</g>' +
        // Front View (Facing South / Towards camera)
        '<g class="av-torso-front">' +
          // Base Torso Prism
          '<path d="M22 ' + (torsoY + 4) + ' L36 ' + (torsoY + 1) + ' L50 ' + (torsoY + 4) + ' L47 ' + (torsoY + torsoH) + ' L25 ' + (torsoY + torsoH) + ' Z" fill="url(#avG_' + avUniqueId + '_top)" stroke="' + shade(top, -35) + '" stroke-width="0.75"/>' +
          // Lit Upper Shoulder Yoke Facet
          '<polygon class="av-torso-yoke" points="23,' + (torsoY + 4) + ' 36,' + (torsoY + 1) + ' 49,' + (torsoY + 4) + ' 45,' + (torsoY + 8) + ' 27,' + (torsoY + 8) + '" fill="' + shade(top, 35) + '" opacity="0.6"/>' +
          // Lateral Flank Facets (Left Shade / Right Lit)
          '<polygon class="av-torso-flank-left" points="22,' + (torsoY + 4) + ' 27,' + (torsoY + 8) + ' 29,' + (torsoY + torsoH) + ' 25,' + (torsoY + torsoH) + '" fill="' + shade(top, -45) + '" opacity="0.5"/>' +
          '<polygon class="av-torso-flank-right" points="50,' + (torsoY + 4) + ' 45,' + (torsoY + 8) + ' 43,' + (torsoY + torsoH) + ' 47,' + (torsoY + torsoH) + '" fill="' + shade(top, 25) + '" opacity="0.4"/>' +
          // Specular Button/Zip Placket
          '<line x1="36" y1="' + (torsoY + 1) + '" x2="36" y2="' + (torsoY + torsoH - 5) + '" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>' +
          // Utility Belt & 3D Metallic Buckle
          '<rect x="24" y="' + (torsoY + torsoH - 5.5) + '" width="24" height="4.5" rx="1.5" fill="' + accent + '"/>' +
          '<rect x="33.5" y="' + (torsoY + torsoH - 6) + '" width="5" height="5.5" rx="1.2" fill="#FFA000" stroke="#FFF" stroke-width="0.5"/>' +
        '</g>' +
      '</g>' +

      // 5. Left Arm (Counter Swing)
      '<g class="av-arm-left">' +
        '<rect x="14.5" y="' + (torsoY + 2) + '" width="7" height="17" rx="3.5" fill="url(#avG_' + avUniqueId + '_skin)" transform="rotate(8 18.5 ' + (torsoY + 10) + ')"/>' +
        '<rect x="14.5" y="' + (torsoY + 1) + '" width="7.5" height="7.5" rx="2.5" fill="url(#avG_' + avUniqueId + '_top)"/>' +
      '</g>' +

      // 6. Right Arm (Articulated for Wonder Touch Upward Reach)
      '<g class="av-arm-right">' +
        '<rect x="50" y="' + (torsoY + 2) + '" width="7" height="17" rx="3.5" fill="url(#avG_' + avUniqueId + '_skin)" transform="rotate(-8 53.5 ' + (torsoY + 10) + ')"/>' +
        '<rect x="49.5" y="' + (torsoY + 1) + '" width="7.5" height="7.5" rx="2.5" fill="url(#avG_' + avUniqueId + '_top)"/>' +
        '<circle cx="53.5" cy="' + (torsoY + 18) + '" r="2" fill="' + shade(skin, 20) + '"/>' +
      '</g>' +

      // 6b. 3D Hand Instruments & Tools (Interchangeable for Farming Operations)
      '<g class="av-hand-instrument av-tool-slot av-tool-spade" id="avHandInstrument">' +
        // Ash wood handle shaft
        '<line x1="53.5" y1="32" x2="55" y2="76" stroke="#8D6E63" stroke-width="2.6" stroke-linecap="round"/>' +
        // Top D-grip
        '<path d="M50.5,29 Q53.5,25.5 56.5,29 L56.5,33 L50.5,33 Z" fill="#6D4C41" stroke="#3E2723" stroke-width="0.7"/>' +
        // Ferrule collar
        '<rect x="53" y="63" width="4" height="4.5" rx="1" fill="#B0BEC5" stroke="#78909C" stroke-width="0.5"/>' +
        // Steel spade blade
        '<polygon points="51,67.5 59,67.5 58,82 55,87 52,82" fill="url(#avG_' + avUniqueId + '_spade)" stroke="#263238" stroke-width="0.9"/>' +
        // Specular blade center spine
        '<line x1="55" y1="68" x2="55" y2="84" stroke="rgba(255,255,255,0.45)" stroke-width="0.8"/>' +
      '</g>' +

      '<g class="av-tool-slot av-tool-watercan" id="avHandWaterCan">' +
        // Can body
        '<ellipse cx="58" cy="46" rx="9" ry="8" fill="#4E7D6B" stroke="#264D3B" stroke-width="0.9"/>' +
        '<ellipse cx="58" cy="40" rx="7" ry="2.5" fill="#78B39B"/>' +
        // Handle
        '<path d="M51,42 Q46,45 50,52 Q53,52 52,48" fill="none" stroke="#264D3B" stroke-width="2" stroke-linecap="round"/>' +
        // Spout with rose head
        '<line x1="64" y1="44" x2="72" y2="36" stroke="#264D3B" stroke-width="2.2" stroke-linecap="round"/>' +
        '<ellipse cx="73" cy="35" rx="3.5" ry="2" fill="#FFD54F" stroke="#FFA000" stroke-width="0.7"/>' +
      '</g>' +

      '<g class="av-tool-slot av-tool-basket" id="avHandBasket">' +
        // Woven willow basket
        '<ellipse cx="56" cy="48" rx="11" ry="8" fill="#8D6E63" stroke="#5D4037" stroke-width="0.9"/>' +
        '<ellipse cx="56" cy="43" rx="9.5" ry="4" fill="#BCAAA4"/>' +
        // Handle
        '<path d="M47,44 Q56,32 65,44" fill="none" stroke="#5D4037" stroke-width="1.8"/>' +
        // Produce overflow
        '<circle cx="53" cy="42" r="3.2" fill="#E53935"/>' +
        '<circle cx="58" cy="41" r="3.4" fill="#FFB300"/>' +
        '<circle cx="61" cy="43" r="2.8" fill="#43A047"/>' +
      '</g>' +

      '<g class="av-tool-slot av-tool-scythe" id="avHandScythe">' +
        // Wooden handle
        '<line x1="52" y1="28" x2="56" y2="68" stroke="#8D6E63" stroke-width="2.2" stroke-linecap="round"/>' +
        // Curved steel blade
        '<path d="M52,30 Q66,22 72,36 Q64,28 52,32 Z" fill="#CFD8DC" stroke="#455A64" stroke-width="0.8"/>' +
      '</g>' +

      '<g class="av-tool-slot av-tool-seedbag" id="avHandSeedBag">' +
        // Canvas pouch
        '<path d="M52,40 Q57,36 62,40 L63,52 Q57,56 51,52 Z" fill="#D7CCC8" stroke="#8D6E63" stroke-width="0.9"/>' +
        '<ellipse cx="57" cy="40" rx="4" ry="2" fill="#BCAAA4"/>' +
        '<circle cx="57" cy="38" r="1.5" fill="#795548"/>' +
        // Spilling seeds
        '<circle cx="61" cy="48" r="1.2" fill="#FFD54F"/>' +
        '<circle cx="63" cy="51" r="1.1" fill="#FFC107"/>' +
      '</g>' +

      // 7. Elder Walking Staff (If Elder Haruto)
      (av.id === 'av_haruto_man' ? '<line x1="58" y1="28" x2="60" y2="92" stroke="#8D6E63" stroke-width="2.2" stroke-linecap="round"/><circle cx="58" cy="28" r="2" fill="#FFD54F"/>' : '') +

      // 8. Volumetric Head & Face (Front & Back Views for 2.5D Isometric 360° Turning)
      '<g class="av-head">' +
        // Back View (Full rear hair and neck nape)
        '<g class="av-head-back">' +
          '<path d="M32.5 ' + (headY + headR - 3) + ' L39.5 ' + (headY + headR - 3) + ' L40 ' + (torsoY + 2) + ' L32 ' + (torsoY + 2) + ' Z" fill="' + shade(skin, -25) + '"/>' +
          '<circle cx="36" cy="' + headY + '" r="' + headR + '" fill="url(#avG_' + avUniqueId + '_hair)" stroke="' + shade(hair, -38) + '" stroke-width="0.8"/>' +
          '<path d="M' + (36 - headR + 1) + ' ' + (headY + 2) + ' Q36 ' + (headY + headR + 2) + ' ' + (36 + headR - 1) + ' ' + (headY + 2) + '" fill="' + shade(hair, -25) + '" opacity="0.6"/>' +
        '</g>' +
        // Front View (Face features, ears, nose, eyes, smile)
        '<g class="av-head-front">' +
          '<path d="M32.5 ' + (headY + headR - 3) + ' L39.5 ' + (headY + headR - 3) + ' L40 ' + (torsoY + 2) + ' L32 ' + (torsoY + 2) + ' Z" fill="' + shade(skin, -16) + '"/>' +
          // 3D Isometric Ears
          '<path class="av-ear-left" d="M' + (36 - headR - 0.5) + ' ' + (headY - 2.5) + ' Q' + (36 - headR - 3.8) + ' ' + headY + ' ' + (36 - headR - 0.5) + ' ' + (headY + 3.5) + ' Z" fill="' + shade(skin, -22) + '" stroke="' + shade(skin, -38) + '" stroke-width="0.5"/>' +
          '<path class="av-ear-right" d="M' + (36 + headR + 0.5) + ' ' + (headY - 2.5) + ' Q' + (36 + headR + 3.8) + ' ' + headY + ' ' + (36 + headR + 0.5) + ' ' + (headY + 3.5) + ' Z" fill="' + shade(skin, 10) + '" stroke="' + shade(skin, -25) + '" stroke-width="0.5"/>' +
          // Main Head Dome
          '<circle cx="36" cy="' + headY + '" r="' + headR + '" fill="url(#avG_' + avUniqueId + '_skin)" stroke="' + shade(skin, -30) + '" stroke-width="0.65"/>' +
          // Lit Crown Top Facet
          '<ellipse class="av-head-top" cx="34" cy="' + (headY - headR * 0.45) + '" rx="' + (headR * 0.65) + '" ry="' + (headR * 0.35) + '" fill="rgba(255,255,255,0.28)"/>' +
          // Left Lateral Cheek Facet (Shaded)
          '<path class="av-head-side-left" d="M' + (36 - headR) + ' ' + headY + ' Q' + (36 - headR + 1) + ' ' + (headY + headR * 0.7) + ' 33 ' + (headY + headR - 1) + ' Q' + (36 - headR * 0.5) + ' ' + (headY + headR * 0.4) + ' ' + (36 - headR) + ' ' + headY + ' Z" fill="' + shade(skin, -35) + '" opacity="0.32"/>' +
          // Right Lateral Cheek Facet (Lit)
          '<path class="av-head-side-right" d="M' + (36 + headR) + ' ' + headY + ' Q' + (36 + headR - 1) + ' ' + (headY + headR * 0.7) + ' 39 ' + (headY + headR - 1) + ' Q' + (36 + headR * 0.5) + ' ' + (headY + headR * 0.4) + ' ' + (36 + headR) + ' ' + headY + ' Z" fill="rgba(255,255,255,0.25)" opacity="0.38"/>' +
          // Hair Bangs & Volume
          '<path d="M' + (36 - headR) + ' ' + (headY - 1) + ' Q36 ' + (headY - headR - 4) + ' ' + (36 + headR) + ' ' + (headY - 1) + ' Q36 ' + (headY - headR + 2) + ' ' + (36 - headR) + ' ' + (headY - 1) + ' Z" fill="url(#avG_' + avUniqueId + '_hair)"/>' +
          // Face Features
          '<g class="av-face-features">' +
            // Eyes
            '<circle cx="32" cy="' + (headY + 0.5) + '" r="1.4" fill="#1A1A1A"/>' +
            '<circle cx="40" cy="' + (headY + 0.5) + '" r="1.4" fill="#1A1A1A"/>' +
            '<circle cx="32.4" cy="' + (headY + 0.1) + '" r="0.55" fill="#FFF"/>' +
            '<circle cx="40.4" cy="' + (headY + 0.1) + '" r="0.55" fill="#FFF"/>' +
            // 3D Isometric Nose
            '<polygon class="av-nose" points="35.5,' + (headY + 2.2) + ' 37,' + (headY + 3.6) + ' 34.8,' + (headY + 3.8) + '" fill="' + shade(skin, -26) + '" stroke="' + shade(skin, 20) + '" stroke-width="0.4"/>' +
            // Smile
            '<path d="M33 ' + (headY + 5.2) + ' Q36 ' + (headY + 7.2) + ' 39 ' + (headY + 5.2) + '" fill="none" stroke="#5D4037" stroke-width="1.15" stroke-linecap="round"/>' +
            // Rosy Cheeks
            '<circle cx="30" cy="' + (headY + 4) + '" r="1.8" fill="#FF8A80" opacity="0.30"/>' +
            '<circle cx="42" cy="' + (headY + 4) + '" r="1.8" fill="#FF8A80" opacity="0.30"/>' +
          '</g>' +
        '</g>' +
      '</g>' +
      '</svg>'
    );
  }

  // ---------------------------------------------------------------------------
  // 3D Circular Planetary Map Engine with Dragging, Plot Markings & Regional Borders
  // ---------------------------------------------------------------------------
  var HomeAvatarGlobe = (function () {
    var canvas, ctx;
    var dpr = 1, width = 320, height = 320, baseRadius = 130;
    var rotY = -0.18; // Start facing Europe / Germany (lon ~10)
    var rotX = 0.52;  // Downward tilt looking at Northern Hemisphere
    var isDragging = false;
    var lastX = 0, lastY = 0;
    var velX = 0, velY = 0;
    var autoSpin = true;
    var idleTicks = 0;
    var animId = null;
    var targetRotY = null, targetRotX = null;
    var isAnimatingTo = false;
    var hoveredPlot = null;
    var activeRegionHighlight = 'all';

    var REGIONAL_BORDERS = [
      {
        id: 'europe',
        name: 'Europe',
        flag: '🇪🇺',
        borderColor: '#FFD54F',
        glowColor: 'rgba(255, 213, 79, 0.45)',
        fill: 'rgba(255, 213, 79, 0.14)',
        centroid: [50.0, 15.0],
        coords: [
          [58.0, -10.0], [68.0, 15.0], [70.0, 30.0], [55.0, 35.0], [42.0, 30.0],
          [36.0, 25.0], [36.0, -6.0], [43.0, -10.0], [50.0, -10.0], [58.0, -10.0]
        ]
      },
      {
        id: 'asia',
        name: 'Asia & Pacific',
        flag: '🌏',
        borderColor: '#00E5FF',
        glowColor: 'rgba(0, 229, 255, 0.45)',
        fill: 'rgba(0, 229, 255, 0.14)',
        centroid: [32.0, 95.0],
        coords: [
          [55.0, 50.0], [65.0, 100.0], [65.0, 145.0], [45.0, 145.0], [30.0, 135.0],
          [10.0, 110.0], [5.0, 95.0], [15.0, 75.0], [25.0, 60.0], [45.0, 50.0], [55.0, 50.0]
        ]
      },
      {
        id: 'africa',
        name: 'Africa & Maghreb',
        flag: '🌍',
        borderColor: '#FFA726',
        glowColor: 'rgba(255, 167, 38, 0.45)',
        fill: 'rgba(255, 167, 38, 0.14)',
        centroid: [8.0, 20.0],
        coords: [
          [35.0, -10.0], [35.0, 32.0], [12.0, 52.0], [-10.0, 42.0], [-25.0, 50.0],
          [-35.0, 25.0], [-34.0, 18.0], [-5.0, 10.0], [5.0, -5.0], [15.0, -17.0], [35.0, -10.0]
        ]
      },
      {
        id: 'americas',
        name: 'Americas',
        flag: '🌎',
        borderColor: '#76FF03',
        glowColor: 'rgba(118, 255, 3, 0.45)',
        fill: 'rgba(118, 255, 3, 0.14)',
        centroid: [5.0, -65.0],
        coords: [
          [60.0, -135.0], [60.0, -60.0], [30.0, -75.0], [10.0, -75.0], [5.0, -50.0],
          [-10.0, -35.0], [-35.0, -55.0], [-55.0, -68.0], [-20.0, -70.0], [5.0, -80.0],
          [20.0, -105.0], [45.0, -125.0], [60.0, -135.0]
        ]
      }
    ];

    var PLOT_MARKINGS = [
      { id: 'plot_1', num: '1', name: 'Plot 1 · Alluvial Meadow Loam', lat: 51.5, lon: 10.2, region: 'europe', icon: '🌱', status: 'Active Home Meadow', color: '#81C784', isHome: true },
      { id: 'plot_2', num: '2', name: 'Plot 2 · Field Shed & Tools', lat: 51.0, lon: 9.8, region: 'europe', icon: '🛖', status: 'Equipped Cache', color: '#A5D6A7' },
      { id: 'plot_3', num: '3', name: 'Plot 3 · Kitchen Permaculture', lat: 50.8, lon: 10.6, region: 'europe', icon: '🥕', status: 'Compost & Beds', color: '#C8E6C9' },
      { id: 'plot_4', num: '4', name: 'Plot 4 · Agroforestry Pond', lat: 51.8, lon: 10.5, region: 'europe', icon: '💧', status: 'Irrigation Basin', color: '#4DD0E1' },
      { id: 'plot_5', num: '5', name: 'Plot 5 · Clean BESS Storage', lat: 50.5, lon: 9.5, region: 'europe', icon: '⚡', status: 'Wind Turbine Grid', color: '#FFD54F' },
      { id: 'plot_6', num: '6', name: 'Plot 6 · Hofstand Village', lat: 51.2, lon: 11.2, region: 'europe', icon: '🍎', status: 'Artisan Cider Market', color: '#FF8A65' },
      { id: 'bavaria_plots', num: 'B1-12', name: 'Bavaria · Plots 1–12', lat: 47.95, lon: 11.35, region: 'europe', icon: '🏔️', status: 'Alpenhof Alpine Meadow', color: '#81C784' },
      { id: 'spain_plots', num: 'ES', name: 'Spain · Dehesa Plots', lat: 40.46, lon: -3.74, region: 'europe', icon: '🫒', status: 'Mediterranean Silvopasture', color: '#FFB74D' },
      { id: 'sweden_plots', num: 'SE', name: 'Sweden · Taiga Plots', lat: 60.12, lon: 18.64, region: 'europe', icon: '🌲', status: 'Nordic Boreal Forest', color: '#80D8FF' },
      { id: 'japan_plots', num: 'JP', name: 'Japan · Hokkaido Plots', lat: 43.06, lon: 141.35, region: 'asia', icon: '🎋', status: 'Montane Bamboo Grove', color: '#69F0AE' },
      { id: 'saint_martin_plots', num: 'SM', name: 'Saint Martin · Blue Lab', lat: 20.62, lon: 92.32, region: 'asia', icon: '🪸', status: 'Coral Lagoon & Lab', color: '#00E5FF' },
      { id: 'senegal_plots', num: 'SN', name: 'Senegal · Sahel Plots', lat: 14.49, lon: -14.45, region: 'africa', icon: '🌳', status: 'Great Green Wall', color: '#FFE082' },
      { id: 'madagascar_plots', num: 'MG', name: 'Madagascar · Spiny Plots', lat: -18.76, lon: 46.86, region: 'africa', icon: '🪵', status: 'Baobab & Spiny Thicket', color: '#FF8A80' },
      { id: 'brazil_plots', num: 'BR', name: 'Brazil · Amazon Plots', lat: -3.46, lon: -62.21, region: 'americas', icon: '🌴', status: 'Amazon Basin Canopy', color: '#B9F6CA' },
      { id: 'usa_plots', num: 'US', name: 'USA · Pacific NW Plots', lat: 47.60, lon: -122.33, region: 'americas', icon: '🌲', status: 'Cascadia Temperate Woods', color: '#A7FFEB' }
    ];

    var LAND_POINTS = [];
    (function initLand() {
      function addBox(minLat, maxLat, minLon, maxLon, stepLat, stepLon) {
        for (var lt = minLat; lt <= maxLat; lt += stepLat) {
          for (var ln = minLon; ln <= maxLon; ln += stepLon) {
            LAND_POINTS.push({ lat: lt, lon: ln });
          }
        }
      }
      addBox(44, 56, -5, 22, 2.8, 3.0);
      addBox(56, 68, 5, 28, 3.0, 3.4);
      addBox(36, 44, -9, 26, 2.8, 3.0);
      addBox(18, 36, -12, 35, 3.8, 4.2);
      addBox(5, 17, -16, 15, 3.2, 3.8);
      addBox(-4, 12, 32, 50, 3.5, 3.8);
      addBox(-34, -5, 14, 36, 3.8, 4.2);
      addBox(50, 68, 45, 135, 5.0, 6.0);
      addBox(22, 45, 35, 75, 3.8, 4.5);
      addBox(8, 32, 68, 88, 3.2, 3.8);
      addBox(20, 45, 80, 122, 3.5, 4.0);
      addBox(31, 44, 130, 143, 2.5, 2.8);
      addBox(30, 50, -124, -72, 3.5, 4.0);
      addBox(52, 68, -155, -60, 5.0, 6.5);
      addBox(15, 29, -112, -88, 3.2, 3.5);
      addBox(-8, 11, -75, -45, 3.5, 4.0);
      addBox(-24, -9, -68, -40, 3.5, 4.0);
      addBox(-54, -25, -72, -58, 3.8, 3.8);
      addBox(-38, -14, 115, 152, 4.0, 4.5);
    })();

    function project(lat, lon, r) {
      r = r || baseRadius;
      var phi = lat * Math.PI / 180;
      var lam = lon * Math.PI / 180;

      var x0 = Math.cos(phi) * Math.sin(lam);
      var y0 = -Math.sin(phi);
      var z0 = Math.cos(phi) * Math.cos(lam);

      var cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      var x1 = x0 * cosY + z0 * sinY;
      var y1 = y0;
      var z1 = -x0 * sinY + z0 * cosY;

      var cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      var x2 = x1;
      var y2 = y1 * cosX - z1 * sinX;
      var z2 = y1 * sinX + z1 * cosX;

      var cx = width / 2;
      var cy = height / 2;

      return {
        x: cx + x2 * r,
        y: cy + y2 * r,
        z: z2,
        visible: z2 > 0
      };
    }

    function resize() {
      if (!canvas || !canvas.parentElement) return;
      var rect = canvas.parentElement.getBoundingClientRect();
      var size = Math.min(rect.width || 320, rect.height || 320);
      if (size <= 0) size = 300;
      size = Math.min(size, 340);
      dpr = window.devicePixelRatio || 1;
      width = size;
      height = size;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      baseRadius = size * 0.42;
    }

    function rotateTo(lat, lon, onComplete) {
      var targetLam = -lon * Math.PI / 180;
      var targetPhi = lat * Math.PI / 180;

      var diff = (targetLam - rotY) % (Math.PI * 2);
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;

      targetRotY = rotY + diff;
      targetRotX = Math.max(-1.15, Math.min(1.15, targetPhi));
      isAnimatingTo = true;
      velX = 0;
      velY = 0;
      idleTicks = 0;
      if (onComplete) setTimeout(onComplete, 350);
    }

    function updatePhysics() {
      if (isAnimatingTo && targetRotY !== null && targetRotX !== null) {
        rotY += (targetRotY - rotY) * 0.14;
        rotX += (targetRotX - rotX) * 0.14;
        if (Math.abs(targetRotY - rotY) < 0.002 && Math.abs(targetRotX - rotX) < 0.002) {
          rotY = targetRotY;
          rotX = targetRotX;
          isAnimatingTo = false;
          targetRotY = null;
          targetRotX = null;
        }
        return;
      }
      if (!isDragging) {
        rotY += velX;
        rotX += velY;
        velX *= 0.92;
        velY *= 0.92;
        if (Math.abs(velX) < 0.0001) velX = 0;
        if (Math.abs(velY) < 0.0001) velY = 0;
        rotX = Math.max(-1.25, Math.min(1.25, rotX));

        if (autoSpin && idleTicks > 60 && !hoveredPlot) {
          rotY += 0.0018;
        } else {
          idleTicks++;
        }
      }
    }

    function draw() {
      if (!ctx || width === 0 || height === 0) return;
      updatePhysics();

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      var cx = width / 2;
      var cy = height / 2;
      var r = baseRadius;
      var now = Date.now();

      // 1. Atmosphere Halo
      var halo = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.25);
      halo.addColorStop(0, 'rgba(76, 175, 80, 0.28)');
      halo.addColorStop(0.5, 'rgba(0, 229, 255, 0.10)');
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 2. Spherical Ocean Base (Clipped)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      var oceanGrad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
      oceanGrad.addColorStop(0, '#0D47A1');
      oceanGrad.addColorStop(0.45, '#0B2848');
      oceanGrad.addColorStop(1, '#051329');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      // Graticule Lines (Latitudes & Longitudes)
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.lineWidth = 1;
      [-60, -30, 0, 30, 60].forEach(function (lat) {
        ctx.beginPath();
        var first = true;
        for (var lon = -180; lon <= 180; lon += 8) {
          var p = project(lat, lon, r);
          if (p.visible) {
            if (first) { ctx.moveTo(p.x, p.y); first = false; }
            else { ctx.lineTo(p.x, p.y); }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      });
      [0, 60, 120, 180, -120, -60].forEach(function (lon) {
        ctx.beginPath();
        var first = true;
        for (var lat = -80; lat <= 80; lat += 6) {
          var p = project(lat, lon, r);
          if (p.visible) {
            if (first) { ctx.moveTo(p.x, p.y); first = false; }
            else { ctx.lineTo(p.x, p.y); }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      });

      // 3. Continental Landmass Points
      ctx.fillStyle = '#66BB6A';
      for (var i = 0; i < LAND_POINTS.length; i++) {
        var lp = project(LAND_POINTS[i].lat, LAND_POINTS[i].lon, r);
        if (lp.visible) {
          var ptSize = (lp.z > 0.6 ? 2.5 : (lp.z > 0.2 ? 2.0 : 1.4));
          ctx.beginPath();
          ctx.arc(lp.x, lp.y, ptSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Regional Map Borders
      REGIONAL_BORDERS.forEach(function (reg) {
        var isHigh = (activeRegionHighlight === 'all' || activeRegionHighlight === reg.id);
        var visibleCount = 0;
        ctx.beginPath();
        for (var j = 0; j < reg.coords.length; j++) {
          var p = project(reg.coords[j][0], reg.coords[j][1], r);
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
          if (p.visible) visibleCount++;
        }
        ctx.closePath();

        if (visibleCount > 2) {
          ctx.fillStyle = isHigh ? reg.fill : 'rgba(255,255,255,0.03)';
          ctx.fill();
          ctx.strokeStyle = isHigh ? reg.borderColor : 'rgba(255,255,255,0.2)';
          ctx.lineWidth = isHigh ? 2.4 : 1.2;
          ctx.stroke();

          // Centroid Label Tag
          var cP = project(reg.centroid[0], reg.centroid[1], r);
          if (cP.z > 0.18) {
            ctx.save();
            ctx.font = '900 9px "Baloo 2", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            var tagText = reg.flag + ' ' + reg.name;
            var tw = ctx.measureText(tagText).width;
            ctx.fillStyle = 'rgba(5, 20, 15, 0.85)';
            ctx.strokeStyle = reg.borderColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(cP.x - tw / 2 - 5, cP.y - 7, tw + 10, 14, 6);
            else ctx.rect(cP.x - tw / 2 - 5, cP.y - 7, tw + 10, 14);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#FFF9C4';
            ctx.fillText(tagText, cP.x, cP.y);
            ctx.restore();
          }
        }
      });

      // 5. Plot Markings
      PLOT_MARKINGS.forEach(function (plot) {
        var p = project(plot.lat, plot.lon, r);
        if (p.visible) {
          var isHovered = hoveredPlot && hoveredPlot.id === plot.id;
          var pulse = (Math.sin(now * 0.005 + (plot.lat + plot.lon)) + 1) * 0.5;

          // Pulse ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6 + pulse * 6, 0, Math.PI * 2);
          ctx.strokeStyle = plot.color;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Plot marker dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, isHovered ? 6 : 4.5, 0, Math.PI * 2);
          ctx.fillStyle = plot.color;
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Plot number badge
          if (p.z > 0.12) {
            ctx.save();
            ctx.font = '900 8px "Nunito", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 3;
            var numStr = plot.isHome ? '⭐' : plot.num;
            ctx.fillText(numStr, p.x, p.y - 7);
            ctx.restore();
          }
        }
      });

      // 6. 3D Spherical Volume Highlight & Terminator Shadow
      var specLight = ctx.createRadialGradient(cx - r * 0.45, cy - r * 0.45, 0, cx, cy, r);
      specLight.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      specLight.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      specLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = specLight;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      var termShadow = ctx.createRadialGradient(cx + r * 0.6, cy + r * 0.6, r * 0.3, cx, cy, r);
      termShadow.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      termShadow.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)');
      termShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = termShadow;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      ctx.restore(); // end clip

      // Outer Metallic Ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(129, 199, 132, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.restore();
    }

    function getPointerPos(e) {
      if (!canvas) return { x: 0, y: 0 };
      var rect = canvas.getBoundingClientRect();
      var touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
      var clientX = touch ? touch.clientX : (e.clientX !== undefined ? e.clientX : 0);
      var clientY = touch ? touch.clientY : (e.clientY !== undefined ? e.clientY : 0);
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
        clientX: clientX,
        clientY: clientY
      };
    }

    function checkPlotHover(x, y) {
      if (!canvas) return;
      var closest = null;
      var minD = 18;
      for (var i = 0; i < PLOT_MARKINGS.length; i++) {
        var p = project(PLOT_MARKINGS[i].lat, PLOT_MARKINGS[i].lon);
        if (p.visible) {
          var d = Math.hypot(p.x - x, p.y - y);
          if (d < minD) {
            minD = d;
            closest = PLOT_MARKINGS[i];
          }
        }
      }
      hoveredPlot = closest;
      var tt = document.getElementById('s2GlobePlotTooltip');
      if (tt) {
        if (closest) {
          tt.innerHTML =
            '<div class="gpt-title">' + closest.icon + ' ' + closest.name + '</div>' +
            '<div class="gpt-status">' + closest.status + '</div>' +
            '<div class="gpt-coord">' + closest.lat.toFixed(1) + '°N, ' + closest.lon.toFixed(1) + '°E</div>';
          tt.classList.remove('hidden');
          tt.style.left = (x) + 'px';
          tt.style.top = (y - 12) + 'px';
        } else {
          tt.classList.add('hidden');
        }
      }
    }

    function handlePointerDown(e) {
      isDragging = true;
      var pos = getPointerPos(e);
      lastX = pos.x;
      lastY = pos.y;
      velX = 0;
      velY = 0;
      autoSpin = false;
      idleTicks = 0;
      if (canvas) canvas.style.cursor = 'grabbing';
    }

    function handlePointerMove(e) {
      var pos = getPointerPos(e);
      if (isDragging) {
        var dx = pos.x - lastX;
        var dy = pos.y - lastY;
        lastX = pos.x;
        lastY = pos.y;
        rotY += dx * 0.008;
        rotX -= dy * 0.008;
        rotX = Math.max(-1.25, Math.min(1.25, rotX));
        velX = dx * 0.008;
        velY = -dy * 0.008;
        if (e.cancelable) e.preventDefault();
      } else {
        checkPlotHover(pos.x, pos.y);
      }
    }

    function handlePointerUp() {
      if (isDragging) {
        isDragging = false;
        if (canvas) canvas.style.cursor = 'grab';
      }
    }

    function loop() {
      draw();
      animId = requestAnimationFrame(loop);
    }

    function init(canvasId) {
      canvas = document.getElementById(canvasId || 's2HomeGlobeCanvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);

      canvas.style.cursor = 'grab';
      canvas.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);

      canvas.addEventListener('mousedown', handlePointerDown);
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);

      canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
      canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
      canvas.addEventListener('touchend', handlePointerUp);

      if (animId) cancelAnimationFrame(animId);
      loop();
    }

    function setRegionHighlight(regId) {
      activeRegionHighlight = regId || 'all';
    }

    return {
      init: init,
      rotateTo: rotateTo,
      setRegionHighlight: setRegionHighlight,
      getRotation: function () { return { rotY: rotY, rotX: rotX }; },
      REGIONAL_BORDERS: REGIONAL_BORDERS,
      PLOT_MARKINGS: PLOT_MARKINGS
    };
  })();

  function worldMapSvg() {
    return (
      '<div class="s2-globe-stage" id="s2GlobeStage">' +
        '<canvas id="s2HomeGlobeCanvas" width="320" height="320" class="s2-home-globe-canvas" role="img" aria-label="Interactive 3D Planetary Map"></canvas>' +
        '<div class="s2-globe-plot-tooltip hidden" id="s2GlobePlotTooltip"></div>' +
      '</div>'
    );
  }

  var DEFAULT_FALLBACK_BIOMES = [
    { id: 'germany', country: 'Germany', flag: '🇩🇪', title: 'Central European Plains', biomeType: 'Temperate Mixed Woodland', status: 'active', unlocked: true },
    { id: 'bavaria', country: 'Germany', flag: '🇩🇪', title: 'Alpenhof Journey · Alpine Meadow', biomeType: 'Alpine Foothill Meadow', status: 'active', unlocked: true },
    { id: 'saint_martin', country: 'Bangladesh', flag: '🇧🇩', title: "Saint Martin's Island · Blue Lab", biomeType: 'Tropical Coral Shelf', status: 'active', unlocked: true },
    { id: 'brazil', country: 'Brazil', flag: '🇧🇷', title: 'Amazon Basin Rainforest', biomeType: 'Tropical Evergreen Lowland Forest', status: 'locked', unlocked: false },
    { id: 'senegal', country: 'Senegal', flag: '🇸🇳', title: 'Sahel Great Green Wall', biomeType: 'Semi-Arid Acacia Savanna', status: 'locked', unlocked: false },
    { id: 'japan', country: 'Japan', flag: '🇯🇵', title: 'Hokkaido Ancient Woodlands', biomeType: 'Boreal Conifer & Montane Bamboo', status: 'locked', unlocked: false },
    { id: 'spain', country: 'Spain', flag: '🇪🇸', title: 'Andalusian Dehesa Agroforestry', biomeType: 'Mediterranean Silvopasture', status: 'locked', unlocked: false },
    { id: 'madagascar', country: 'Madagascar', flag: '🇲🇬', title: 'Madagascar Spiny Forest', biomeType: 'Spiny Thicket Ecosystem', status: 'locked', unlocked: false }
  ];

  function getBiomesList() {
    if (typeof window !== 'undefined' && Array.isArray(window.REGIONAL_BIOMES) && window.REGIONAL_BIOMES.length) {
      return window.REGIONAL_BIOMES;
    }
    if (typeof REGIONAL_BIOMES !== 'undefined' && Array.isArray(REGIONAL_BIOMES) && REGIONAL_BIOMES.length) {
      return REGIONAL_BIOMES;
    }
    return DEFAULT_FALLBACK_BIOMES;
  }

  // ---------------------------------------------------------------------------
  // Build Full Home Overlay HTML
  // ---------------------------------------------------------------------------
  function buildHomeOverlayHtml() {
    var biomes = getBiomesList().slice(0, 8);
    var biomeCards = biomes.map(function (b) {
      var active = b.unlocked || b.status === 'active' || b.id === 'germany' || b.id === 'saint_martin' || b.id === 'bavaria';
      return (
        '<div class="s2-biome-card ' + (active ? 'is-active' : 'is-locked') + '" data-biome="' + b.id + '">' +
        '<div class="s2-biome-flag">' + (b.flag || '🌍') + '</div>' +
        '<div class="s2-biome-name">' + (b.title || b.country) + '</div>' +
        '<div class="s2-biome-type">' + (b.biomeType || '') + '</div>' +
        '<span class="s2-biome-badge">' + (active ? 'ACTIVE' : 'LOCKED') + '</span>' +
        '</div>'
      );
    }).join('');

    var regionChips = REGIONS.map(function (reg) {
      var active = (tourState.regionFilter || 'all') === reg.id;
      return '<button type="button" class="s2-region-chip' + (active ? ' active' : '') + '" data-region="' + reg.id + '">' + reg.flag + ' ' + reg.name + '</button>';
    }).join('');

    var ageChips = AGE_BANDS.map(function (band) {
      var label = band === 'all' ? 'All ages' : band + ' yrs';
      return '<button type="button" class="s2-age-chip' + (band === 'all' ? ' active' : '') + '" data-age="' + band + '">' + label + '</button>';
    }).join('');

    return (
      '<div class="s2-home-overlay" id="s2HomeOverlay" role="dialog" aria-label="Choose your explorer">' +
        '<div class="s2-home-sky" id="s2HomeSky"></div>' +
        '<div class="s2-home-header">' +
          '<h1>🌿 searchO2 · Choose Your Explorer</h1>' +
          '<div class="sub">Volumetric 3D isometric farm adventure · walk the meadow · survey every chapter</div>' +
        '</div>' +
        '<div class="s2-home-body">' +
          '<div class="s2-world-map-card s2-circular-globe-card">' +
            '<div class="s2-world-map-inner">' +
              '<div class="s2-world-map-title">' +
                '<span>🌍 3D Planetary Map · Biomes, Plots &amp; Regional Borders</span>' +
                '<span class="s2-globe-hint-pill">Drag to Rotate · Hover/Tap Plots</span>' +
              '</div>' +
              '<div class="s2-globe-stage" id="s2GlobeStage">' +
                '<canvas id="s2HomeGlobeCanvas" width="320" height="320" class="s2-home-globe-canvas" role="img" aria-label="Interactive 3D Planetary Map"></canvas>' +
                '<div class="s2-globe-plot-tooltip hidden" id="s2GlobePlotTooltip"></div>' +
              '</div>' +
              '<div class="s2-globe-quick-regions" id="s2GlobeQuickRegions">' +
                '<span class="s2-quick-label">Center Region:</span>' +
                '<button type="button" class="s2-quick-chip active" data-region="all">🌍 All</button>' +
                '<button type="button" class="s2-quick-chip" data-region="europe">🇪🇺 Europe</button>' +
                '<button type="button" class="s2-quick-chip" data-region="asia">🌏 Asia &amp; Pacific</button>' +
                '<button type="button" class="s2-quick-chip" data-region="africa">🌍 Africa</button>' +
                '<button type="button" class="s2-quick-chip" data-region="americas">🌎 Americas</button>' +
              '</div>' +
              '<div class="s2-world-map-hint">Interactive 3D circular map with farm plot markings &amp; regional borders · Drag to rotate</div>' +
            '</div>' +
          '</div>' +
          '<div class="s2-biome-row" id="s2BiomeRow">' + biomeCards + '</div>' +
          '<div class="s2-avatar-section-title">👤 Select Your 3D Explorer Avatar</div>' +
          '<div class="s2-avatar-section-sub">12 diverse characters grouped by world region · ages 8–90 · regional dress · matching adjectives</div>' +
          '<div class="s2-filter-dock">' +
            '<div class="s2-filter-label">🌍 Filter by Global Region:</div>' +
            '<div class="s2-region-filters" id="s2RegionFilters">' + regionChips + '</div>' +
            '<div class="s2-filter-label">🎂 Filter by Age Band:</div>' +
            '<div class="s2-age-filters" id="s2AgeFilters">' + ageChips + '</div>' +
          '</div>' +
          '<div class="s2-avatar-grid" id="s2AvatarGrid"></div>' +
        '</div>' +
        '<div class="s2-home-footer">' +
          '<button type="button" class="s2-btn-ghost" id="s2SkipAvatar">Skip for now</button>' +
          '<button type="button" class="s2-btn-primary" id="s2ConfirmAvatar" disabled>Enter farm through the gate ➔</button>' +
        '</div>' +
      '</div>' +
      '<div class="s2-tour-progress" id="s2TourProgress">' +
        '<span id="s2TourProgressText">🧭 Chapter tour 1 / 8</span>' +
        '<button type="button" id="s2SkipTour">Skip tour</button>' +
      '</div>' +
      '<div class="s2-tour-modal-overlay hidden" id="s2TourModal">' +
        '<div class="s2-tour-modal" id="s2TourModalCard"></div>' +
      '</div>' +
      '<div class="s2-scout-countdown-floater hidden" id="s2ScoutCountdownFloater">' +
        '<span class="scf-icon">⏳</span>' +
        '<span class="scf-text">Next scout in <b id="s2ScoutCountdownSec">45s</b></span>' +
        '<button type="button" class="scf-walk-btn" id="s2WalkNextBtn" title="Start walking now">Walk Now ➔</button>' +
      '</div>'
    );
  }

  function dockTopCapsules() {
    var stack = document.querySelector('.bottom-buttons-stack');
    var modal = document.getElementById('s2TourModal');
    if (stack && modal && modal.parentNode !== stack) {
      stack.insertBefore(modal, stack.firstChild);
    }
    var floater = document.getElementById('s2ScoutCountdownFloater');
    var fieldScene = document.getElementById('fieldScene') || document.querySelector('.field-scene');
    if (floater && fieldScene && floater.parentNode !== fieldScene) {
      fieldScene.appendChild(floater);
    }

    // Modal cleanups:
    // 1. Remove/hide explorer carousel on PC and mobile during tour
    var suggContainer = document.getElementById('idleLaborerSuggestionContainer');
    if (suggContainer && tourState.active) {
      suggContainer.style.display = 'none';
    }

    // 2. On mobile, ensure ONLY #s2TourModal (containing Next button) remains during exploration
    var isMobile = (typeof window !== 'undefined' && (window.innerWidth <= 860 || window.innerHeight <= 520 || (window.matchMedia && window.matchMedia('(max-width: 860px), (max-height: 520px), (pointer: coarse)').matches)));
    if (isMobile && tourState.active) {
      var progress = document.getElementById('s2TourProgress');
      if (progress) progress.style.display = 'none';
      if (suggContainer) suggContainer.style.display = 'none';
      var botCarousel = document.getElementById('taskCarouselDOM');
      if (botCarousel) botCarousel.style.display = 'none';
      var chapModal = document.getElementById('chapterExploreModal');
      if (chapModal) chapModal.style.display = 'none';
      document.querySelectorAll('.scout-chapter-guide-msg-box').forEach(function (b) {
        b.style.display = 'none';
      });
    }
  }

  function renderAvatarGrid() {
    var grid = document.getElementById('s2AvatarGrid');
    if (!grid) return;
    var regionFilter = tourState.regionFilter || 'all';
    var ageFilter = tourState.ageFilter || 'all';

    var filtered = AVATAR_ROSTER.filter(function (a) {
      var matchReg = (regionFilter === 'all' || a.region === regionFilter);
      var matchAge = (ageFilter === 'all' || a.ageBand === ageFilter);
      return matchReg && matchAge;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="s2-no-avatars-msg">No explorers match the current region and age filters. Try selecting "All Regions" or "All ages".</div>';
      return;
    }

    var regionsToShow = (regionFilter === 'all')
      ? ['europe', 'asia', 'africa', 'americas']
      : [regionFilter];

    var html = '';
    regionsToShow.forEach(function (rId) {
      var rAvatars = filtered.filter(function (a) { return a.region === rId; });
      if (rAvatars.length === 0) return;
      var rDef = REGIONS.find(function (r) { return r.id === rId; }) || { name: rId, flag: '🌍', desc: '' };

      html +=
        '<div class="s2-region-group-wrapper" data-region-group="' + rId + '">' +
          '<div class="s2-region-group-header">' +
            '<div class="s2-rgh-title">' +
              '<span class="s2-rgh-flag">' + rDef.flag + '</span>' +
              '<span class="s2-rgh-name">' + rDef.name + '</span>' +
              '<span class="s2-rgh-count">' + rAvatars.length + (rAvatars.length === 1 ? ' Explorer' : ' Explorers') + '</span>' +
            '</div>' +
            '<div class="s2-rgh-desc">' + rDef.desc + '</div>' +
          '</div>' +
          '<div class="s2-region-cards-row">';

      rAvatars.forEach(function (av) {
        var sel = tourState.avatarId === av.id ? ' selected' : '';
        html +=
          '<button type="button" class="s2-avatar-card' + sel + '" data-avatar="' + av.id + '" aria-pressed="' + (sel ? 'true' : 'false') + '">' +
            '<div class="s2-avatar-region-badge">' + av.regionFlag + ' ' + (av.country || av.regionName) + '</div>' +
            '<div class="s2-avatar-figure">' + avatarFigureSvg(av, { w: 72, h: 96 }) + '</div>' +
            '<div class="s2-avatar-name">' + av.name + '</div>' +
            '<div class="s2-avatar-adj">' + av.adjective + '</div>' +
            '<div class="s2-avatar-meta">' + av.gender + ' · ' + av.ageBand + ' yrs</div>' +
            '<div class="s2-avatar-heritage" title="' + av.heritage + '">Heritage: ' + av.heritage + '</div>' +
            '<div class="s2-avatar-dress" title="' + av.dress + '">' + av.dress + '</div>' +
          '</button>';
      });

      html += '</div></div>';
    });

    grid.innerHTML = html;

    var conf = document.getElementById('s2ConfirmAvatar');
    if (conf) conf.disabled = !tourState.avatarId;

    grid.querySelectorAll('[data-avatar]').forEach(function (btn) {
      btn.onclick = function () {
        tourState.avatarId = btn.getAttribute('data-avatar');
        tourState.avatar = AVATAR_ROSTER.find(function (a) { return a.id === tourState.avatarId; }) || null;
        renderAvatarGrid();
      };
    });
  }

  function sprinkleStars() {
    var sky = document.getElementById('s2HomeSky');
    if (!sky) return;
    var html = '';
    for (var i = 0; i < 45; i++) {
      html +=
        '<span class="star" style="left:' + (Math.random() * 100).toFixed(1) + '%;' +
        'top:' + (Math.random() * 55).toFixed(1) + '%;' +
        'animation-delay:' + (Math.random() * 3.5).toFixed(2) + 's"></span>';
    }
    sky.innerHTML = html;
  }

  function setAvatarRegionFilter(regId) {
    tourState.regionFilter = regId;
    document.querySelectorAll('.s2-region-chip').forEach(function (c) {
      c.classList.toggle('active', c.getAttribute('data-region') === regId);
    });
    document.querySelectorAll('.s2-quick-chip').forEach(function (c) {
      c.classList.toggle('active', c.getAttribute('data-region') === regId);
    });
    renderAvatarGrid();
    if (typeof HomeAvatarGlobe !== 'undefined' && HomeAvatarGlobe && typeof HomeAvatarGlobe.rotateTo === 'function') {
      HomeAvatarGlobe.setRegionHighlight(regId);
      if (regId === 'europe') HomeAvatarGlobe.rotateTo(50.0, 15.0);
      else if (regId === 'asia') HomeAvatarGlobe.rotateTo(30.0, 105.0);
      else if (regId === 'africa') HomeAvatarGlobe.rotateTo(8.0, 20.0);
      else if (regId === 'americas') HomeAvatarGlobe.rotateTo(-5.0, -60.0);
      else HomeAvatarGlobe.rotateTo(51.16, 10.45);
    }
  }

  function showHomeOverlay() {
    var existing = document.getElementById('s2HomeOverlay');
    if (!existing) {
      var wrap = document.createElement('div');
      wrap.innerHTML = buildHomeOverlayHtml();
      while (wrap.firstChild) {
        document.body.appendChild(wrap.firstChild);
      }
      dockTopCapsules();
    }
    var overlay = document.getElementById('s2HomeOverlay');
    if (overlay) overlay.classList.remove('hidden');
    sprinkleStars();
    renderAvatarGrid();

    // Initialize 3D Circular Globe
    setTimeout(function () {
      HomeAvatarGlobe.init('s2HomeGlobeCanvas');
    }, 50);

    var regFilters = document.getElementById('s2RegionFilters');
    if (regFilters) {
      regFilters.querySelectorAll('[data-region]').forEach(function (chip) {
        chip.onclick = function () {
          var regId = chip.getAttribute('data-region');
          setAvatarRegionFilter(regId);
        };
      });
    }

    var quickRegs = document.getElementById('s2GlobeQuickRegions');
    if (quickRegs) {
      quickRegs.querySelectorAll('[data-region]').forEach(function (chip) {
        chip.onclick = function () {
          var regId = chip.getAttribute('data-region');
          setAvatarRegionFilter(regId);
        };
      });
    }

    var filters = document.getElementById('s2AgeFilters');
    if (filters) {
      filters.querySelectorAll('[data-age]').forEach(function (chip) {
        chip.onclick = function () {
          tourState.ageFilter = chip.getAttribute('data-age');
          filters.querySelectorAll('.s2-age-chip').forEach(function (c) {
            c.classList.toggle('active', c.getAttribute('data-age') === tourState.ageFilter);
          });
          renderAvatarGrid();
        };
      });
    }

    var conf = document.getElementById('s2ConfirmAvatar');
    if (conf) {
      conf.disabled = !tourState.avatarId;
      conf.onclick = function () {
        if (!tourState.avatarId) return;
        confirmAvatarAndStartTour();
      };
    }
    var skip = document.getElementById('s2SkipAvatar');
    if (skip) {
      skip.onclick = function () {
        hideHomeOverlay();
        try {
          localStorage.setItem('searchO2_avatar_skipped', '1');
        } catch (e) {}
      };
    }
    var skipTour = document.getElementById('s2SkipTour');
    if (skipTour) {
      skipTour.onclick = function () {
        endTour(true);
      };
    }
    var walkNextBtn = document.getElementById('s2WalkNextBtn');
    if (walkNextBtn) {
      walkNextBtn.onclick = function (e) {
        if (e) e.stopPropagation();
        walkToNextScoutNow();
      };
      walkNextBtn.ontouchend = function (e) {
        if (e) e.stopPropagation();
        walkToNextScoutNow();
      };
    }
  }

  function hideHomeOverlay() {
    var overlay = document.getElementById('s2HomeOverlay');
    if (overlay) overlay.classList.add('hidden');
  }

  function persistAvatar(av) {
    try {
      localStorage.setItem('searchO2_selected_avatar', JSON.stringify(av));
    } catch (e) {}
    if (typeof state !== 'undefined' && state) {
      state.playerAvatar = {
        id: av.id,
        name: av.name,
        adjective: av.adjective,
        ageBand: av.ageBand,
        gender: av.gender
      };
      if (typeof requestSave === 'function') requestSave();
    }
  }

  function loadPersistedAvatar() {
    try {
      var raw = localStorage.getItem('searchO2_selected_avatar');
      if (!raw) return null;
      var data = JSON.parse(raw);
      return AVATAR_ROSTER.find(function (a) { return a.id === data.id; }) || data;
    } catch (e) {
      return null;
    }
  }

  function confirmAvatarAndStartTour() {
    var av = tourState.avatar;
    if (!av) return;
    persistAvatar(av);
    hideHomeOverlay();

    if (typeof switchScreen === 'function') {
      try {
        switchScreen('farm');
      } catch (e) {}
    }

    setTimeout(function () {
      startChapterTour(av);
    }, 400);
  }

  // ---------------------------------------------------------------------------
  // Farm Spatial Waypoints & Scout Marker Exact Coordinates
  // ---------------------------------------------------------------------------
  function getFacilitySpot(key) {
    if (key === 'plot' || key === 'farm_plot_1' || key === 1 || key === '1') {
      if (typeof PLOT_LAYOUT !== 'undefined' && PLOT_LAYOUT[0]) return PLOT_LAYOUT[0];
      return { top: 20, left: 18.5, w: 12, h: 22 };
    }
    if (key === 'crew_shed' || key === 'water_well' || key === 2 || key === '2') {
      if (typeof CREW_SHED_SPOT !== 'undefined') return CREW_SHED_SPOT;
      return { top: 54, left: 8.5, w: 9.5, h: 18 };
    }
    if (key === 'garden' || key === 3 || key === '3') {
      if (typeof VILLAGE_LAYOUT !== 'undefined' && VILLAGE_LAYOUT.garden) return VILLAGE_LAYOUT.garden;
      return { top: 66, left: 32, w: 12, h: 22 };
    }
    if (key === 'pond' || key === 4 || key === '4') {
      if (typeof VILLAGE_LAYOUT !== 'undefined' && VILLAGE_LAYOUT.pond) return VILLAGE_LAYOUT.pond;
      return { top: 12, left: 32, w: 12, h: 22 };
    }
    if (key === 'cattle_farm') {
      if (typeof VILLAGE_LAYOUT !== 'undefined' && VILLAGE_LAYOUT.cattle_farm) return VILLAGE_LAYOUT.cattle_farm;
      return { top: 21.5, left: 2.0, w: 7.2, h: 22.0 };
    }
    if (key === 'crop_field') {
      if (typeof VILLAGE_LAYOUT !== 'undefined' && VILLAGE_LAYOUT.crop_field) return VILLAGE_LAYOUT.crop_field;
      return { top: 76.0, left: 45.5, w: 14, h: 19.5 };
    }
    if (key === 'garden_walk') {
      return { top: 58, left: 28, w: 10, h: 14 };
    }
    if (key === 'energy_storage' || key === 5 || key === '5') {
      if (typeof ENERGY_STORAGE_SPOT !== 'undefined') return ENERGY_STORAGE_SPOT;
      if (typeof VILLAGE_LAYOUT !== 'undefined' && VILLAGE_LAYOUT.energy_storage) return VILLAGE_LAYOUT.energy_storage;
      return { top: 54, left: 1.2, w: 6.8, h: 18 };
    }
    if (key === 'wt_nw' || key === 'wt_ne' || key === 'wt_sw' || key === 'wt_se') {
      if (typeof WIND_TURBINE_SPOTS !== 'undefined' && WIND_TURBINE_SPOTS[key]) return WIND_TURBINE_SPOTS[key];
      var wtFallbacks = {
        wt_nw: { top: 2.0, left: 19.5, w: 9.0, h: 21.0 },
        wt_ne: { top: 2.0, left: 74.5, w: 9.0, h: 21.0 },
        wt_sw: { top: 73.0, left: 1.2, w: 6.8, h: 20.0 },
        wt_se: { top: 73.0, left: 88.5, w: 9.0, h: 20.0 }
      };
      if (wtFallbacks[key]) return wtFallbacks[key];
    }
    if (key === 'wind_turbine') {
      if (typeof WIND_TURBINE_SPOT !== 'undefined') return WIND_TURBINE_SPOT;
      return { top: 2.0, left: 19.5, w: 9.0, h: 21.0 };
    }
    if (key === 'juice_bar' || key === 6 || key === '6') {
      if (typeof VILLAGE_LAYOUT !== 'undefined' && VILLAGE_LAYOUT.juice_bar) return VILLAGE_LAYOUT.juice_bar;
      return { top: 66, left: 61, w: 12, h: 22 };
    }
    if (key === 'coffee_shop') {
      if (typeof VILLAGE_LAYOUT !== 'undefined' && VILLAGE_LAYOUT.coffee_shop) return VILLAGE_LAYOUT.coffee_shop;
      return { top: 12, left: 61, w: 12, h: 22 };
    }
    if (typeof VILLAGE_LAYOUT !== 'undefined' && VILLAGE_LAYOUT[key]) return VILLAGE_LAYOUT[key];
    if (key === 'gate' && typeof GATE_SPOT !== 'undefined') return GATE_SPOT;
    if (key === 'storage' && typeof STORAGE_SPOT !== 'undefined') return STORAGE_SPOT;
    if (key === 'garage' && typeof GARAGE_SPOT !== 'undefined') return GARAGE_SPOT;
    if (key === 'jute_tarp' && typeof JUTE_TARP_SPOT !== 'undefined') return JUTE_TARP_SPOT;
    if (key === 'eco_passport' || key === 7 || key === '7') return { top: 12, left: 77.5, w: 10.5, h: 22 };
    if (key === 'space_mission' || key === 8 || key === '8') return { top: 66, left: 77.5, w: 10.5, h: 22 };

    var fallbacks = {
      1: { top: 20, left: 18.5, w: 12, h: 22 },
      2: { top: 54, left: 8.5, w: 9.5, h: 18 },
      3: { top: 66, left: 32, w: 12, h: 22 },
      4: { top: 12, left: 32, w: 12, h: 22 },
      5: { top: 54, left: 1.2, w: 6.8, h: 18 },
      6: { top: 66, left: 61, w: 12, h: 22 },
      7: { top: 12, left: 77.5, w: 10.5, h: 22 },
      8: { top: 66, left: 77.5, w: 10.5, h: 22 }
    };
    return fallbacks[key] || { top: 45, left: 50, w: 10, h: 16 };
  }

  function gateEntryPoint() {
    var g = typeof GATE_SPOT !== 'undefined' ? GATE_SPOT : { top: 35.5, left: 91.5, w: 8.5, h: 23 };
    return {
      left: (g.left || 91.5) + (g.w || 8.5) * 0.2,
      top: (g.top || 35.5) + (g.h || 23) * 0.75
    };
  }

  function meadowEntryPoint() {
    var g = gateEntryPoint();
    return { left: Math.max(55, g.left - 18), top: g.top + 2 };
  }

  function isMobileViewport() {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 860 || window.innerHeight <= 520 ||
      (window.matchMedia && window.matchMedia('(max-width: 860px), (max-height: 520px), (pointer: coarse)').matches);
  }

  /**
   * Calculates the exact coordinates for the avatar to stand and touch the active scout marker.
   * On PC: Restored exact coordinates and locator behavior from commit ade3468.
   * On Mobile: Recalculated coordinates keeping avatar in clear, open spaces away from corners/cattle farm.
   */
  function getScoutMarkerTouchTarget(ch) {
    var mobile = isMobileViewport();

    // Mobile Recalculated Coordinates for accurate collision-free positioning
    if (mobile) {
      var mobileCoords = {
        // Ch 1: Central Meadow / Plot 1 (away from top-left corner and cattle farm at 2.0%, 21.5%)
        1: { standPoint: { left: 40.0, top: 32.0 }, touchPoint: { left: 40.0, top: 24.0 } },
        // Ch 2: Crew Shed (Southwest, walkway east of shed)
        2: { standPoint: { left: 15.5, top: 72.0 }, touchPoint: { left: 13.2, top: 56.0 } },
        // Ch 3: Garden (South Mid-West walkway)
        3: { standPoint: { left: 38.0, top: 88.0 }, touchPoint: { left: 38.0, top: 72.0 } },
        // Ch 4: Pond (North Mid-West pier)
        4: { standPoint: { left: 38.0, top: 36.0 }, touchPoint: { left: 38.0, top: 20.0 } },
        // Ch 5: BESS / Energy Storage (Southwest yard ground level)
        5: { standPoint: { left: 6.5, top: 74.0 }, touchPoint: { left: 4.5, top: 58.0 } },
        // Ch 6: Juice Bar (South Mid-East terrace)
        6: { standPoint: { left: 67.0, top: 88.0 }, touchPoint: { left: 67.0, top: 72.0 } },
        // Ch 7: Eco-Passport (Northeast pavilion)
        7: { standPoint: { left: 82.5, top: 36.0 }, touchPoint: { left: 82.5, top: 20.0 } },
        // Ch 8: Space Mission (Southeast launchpad)
        8: { standPoint: { left: 82.5, top: 88.0 }, touchPoint: { left: 82.5, top: 72.0 } }
      };
      if (mobileCoords[ch]) {
        return mobileCoords[ch];
      }
    }

    // PC Mode (Restores exact logic and coordinates from previous commit ade3468)
    if (ch === 5) {
      // Chapter 5 MUST walk to BESS in the SW utility yard meadow (ground level, never in the sky)
      var bessSpot = getFacilitySpot('energy_storage');
      var bLeft = (bessSpot.left || 1.2) + (bessSpot.w || 6.8) * 0.5;
      var bTop = (bessSpot.top || 54) + (bessSpot.h || 18) * 0.55;
      return {
        touchPoint: { left: Math.max(4, bLeft), top: Math.max(10, (bessSpot.top || 54) - 2) },
        standPoint: { left: Math.max(6, bLeft + 3), top: Math.min(84, bTop + 4) }
      };
    }

    var scene = document.getElementById('fieldScene');
    if (scene) {
      var sceneRect = scene.getBoundingClientRect();
      var locator = scene.querySelector('.chapter-explore-hand.chapter-explore-locator');
      if (locator) {
        var locRect = locator.getBoundingClientRect();
        if (locRect && locRect.width > 0 && locRect.height > 0) {
          var centerX = locRect.left + locRect.width / 2;
          var bottomY = locRect.bottom;
          var leftPct = ((centerX - sceneRect.left) / sceneRect.width) * 100;
          var topPct = ((bottomY - sceneRect.top) / sceneRect.height) * 100;
          // Guard against corner clamp on PC
          if (leftPct > 30) {
            return {
              touchPoint: { left: leftPct, top: Math.max(4, topPct - 3) },
              standPoint: { left: leftPct, top: Math.min(88, topPct + 4) }
            };
          }
        }
      }
    }

    // Calibrated spatial coordinates matching facility locations from ade3468
    var pcFallbacks = {
      1: { standPoint: { left: 40.5, top: 28.6 }, touchPoint: { left: 40.5, top: 21.6 } },
      2: { standPoint: { left: 13.2, top: 74.0 }, touchPoint: { left: 13.2, top: 70.0 } },
      3: { standPoint: { left: 38.0, top: 88.0 }, touchPoint: { left: 38.0, top: 86.0 } },
      4: { standPoint: { left: 38.0, top: 36.0 }, touchPoint: { left: 38.0, top: 32.0 } },
      5: { standPoint: { left: 4.6, top: 74.0 }, touchPoint: { left: 4.6, top: 70.0 } },
      6: { standPoint: { left: 67.0, top: 88.0 }, touchPoint: { left: 67.0, top: 86.0 } },
      7: { standPoint: { left: 82.7, top: 36.0 }, touchPoint: { left: 82.7, top: 32.0 } },
      8: { standPoint: { left: 82.7, top: 88.0 }, touchPoint: { left: 82.7, top: 86.0 } }
    };
    if (pcFallbacks[ch]) {
      return pcFallbacks[ch];
    }

    var keyMap = {
      1: 'plot',
      2: 'crew_shed',
      3: 'garden',
      4: 'pond',
      5: 'energy_storage',
      6: 'juice_bar',
      7: 'eco_passport',
      8: 'space_mission'
    };
    var key = keyMap[ch] || 'plot';
    var spot = getFacilitySpot(key);
    var cX = (spot.left || 0) + (spot.w || 10) / 2;
    var cY = (spot.top || 0) + (spot.h || 16) * 0.45;

    return {
      touchPoint: { left: cX, top: Math.max(4, (spot.top || 0) - 4) },
      standPoint: { left: cX, top: Math.min(88, cY) }
    };
  }

  // ---------------------------------------------------------------------------
  // Walker Entity & Animation Control
  // ---------------------------------------------------------------------------
  function ensureWalkerLayer() {
    var scene = document.getElementById('fieldScene');
    if (!scene) return null;
    var layer = document.getElementById('s2PlayerAvatarLayer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 's2PlayerAvatarLayer';
      layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:48;';
      scene.appendChild(layer);
    }
    return layer;
  }

  function spawnWalker(av, at) {
    var layer = ensureWalkerLayer();
    if (!layer) return null;
    if (tourState.walkerEl && tourState.walkerEl.parentNode) {
      tourState.walkerEl.parentNode.removeChild(tourState.walkerEl);
    }
    var el = document.createElement('div');
    el.className = 's2-player-avatar human-walker-sprite';
    el.id = 's2PlayerAvatar';
    el.innerHTML = avatarFigureSvg(av, { w: 52, h: 96, unique: 'farm' });
    el.style.left = at.left + '%';
    el.style.top = at.top + '%';
    layer.appendChild(el);
    tourState.walkerEl = el;

    // Interactive click on avatar opens explorer card
    el.onclick = function (e) {
      e.stopPropagation();
      showHomeOverlay();
    };

    return el;
  }

  var currentWalkToken = 0;
  function walkPath(el, points, durationMs, onDone) {
    if (!el || !points || points.length < 2) {
      if (onDone) onDone();
      return;
    }
    var myWalkToken = ++currentWalkToken;
    el.__walkToken = myWalkToken;
    el.classList.add('walking');
    el.classList.remove('wonder-touching');

    if (typeof animateAlongWaypoints === 'function') {
      var wps = points.map(function (p) {
        return { x: p.left, y: p.top };
      });
      animateAlongWaypoints(el, wps, durationMs || 3400, function () {
        if (el.__walkToken !== myWalkToken) return;
        el.classList.remove('walking');
        el.style.transform = 'translate(-50%, -85%)';
        if (onDone) onDone();
      });
      return;
    }

    // Smooth fallback linear interpolation
    var i = 0;
    function step() {
      if (el.__walkToken !== myWalkToken) return;
      i++;
      if (i >= points.length) {
        el.classList.remove('walking');
        el.style.transform = 'translate(-50%, -85%)';
        if (onDone) onDone();
        return;
      }
      var prev = points[i - 1];
      var curr = points[i];
      var dur = Math.max(350, (durationMs || 3400) / (points.length - 1));
      var t0 = performance.now();

      var dx = curr.left - prev.left;
      var dy = curr.top - prev.top;
      var angle = Math.atan2(dy, dx) * 180 / Math.PI;
      el.setAttribute('data-heading-angle', Math.round(angle));

      if (dy < -0.25) {
        el.classList.add('facing-north');
        el.classList.remove('facing-south');
      } else if (dy > 0.25) {
        el.classList.add('facing-south');
        el.classList.remove('facing-north');
      }

      if (dx > 0.3) {
        el.classList.add('facing-east');
        el.classList.remove('facing-west');
      } else if (dx < -0.3) {
        el.classList.add('facing-west');
        el.classList.remove('facing-east');
      }

      var prevDx = el.__lastDx || 0;
      if ((prevDx > 0.25 && dx < -0.25) || (prevDx < -0.25 && dx > 0.25)) {
        el.classList.add('turning-around');
        setTimeout(function(){ el.classList.remove('turning-around'); }, 220);
      }
      el.__lastDx = dx;

      var facing = dx < -0.3 ? 'scaleX(-1)' : 'scaleX(1)';
      el.style.transform = 'translate(-50%, -85%) ' + facing;

      function frame(now) {
        if (el.__walkToken !== myWalkToken) return;
        var t = Math.min(1, (now - t0) / dur);
        var ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        el.style.left = (prev.left + (curr.left - prev.left) * ease) + '%';
        el.style.top = (prev.top + (curr.top - prev.top) * ease) + '%';
        if (t < 1) requestAnimationFrame(frame);
        else step();
      }
      requestAnimationFrame(frame);
    }
    step();
  }

  // ---------------------------------------------------------------------------
  // Wonder Touch, Contact Ripple & Sky Heading
  // ---------------------------------------------------------------------------
  function spawnTouchRipple(at) {
    var scene = document.getElementById('fieldScene');
    if (!scene) return;
    var ripple = document.createElement('div');
    ripple.className = 's2-touch-ripple';
    ripple.style.left = at.left + '%';
    ripple.style.top = at.top + '%';
    ripple.innerHTML =
      '<svg viewBox="0 0 64 64" width="64" height="64">' +
        '<circle cx="32" cy="32" r="16" fill="none" stroke="#FFD54F" stroke-width="3" opacity="0.9"/>' +
        '<circle cx="32" cy="32" r="26" fill="none" stroke="#00E676" stroke-width="2" stroke-dasharray="4 3"/>' +
        '<polygon points="32,12 36,26 50,32 36,38 32,52 28,38 14,32 28,26" fill="#FFF9C4"/>' +
      '</svg>';
    scene.appendChild(ripple);
    setTimeout(function () {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 1300);
  }

  function showSkyHeading(text, at, icon) {
    var scene = document.getElementById('fieldScene');
    if (!scene) return;
    var old = document.getElementById('s2SkyHeading');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var el = document.createElement('div');
    el.className = 's2-sky-heading';
    el.id = 's2SkyHeading';
    el.innerHTML = (icon ? '<span style="font-size:1.25rem;">' + icon + '</span>' : '') + '<span>' + text + '</span>';
    var safeLeft = Math.max(16, Math.min(84, (at && typeof at.left === 'number') ? at.left : 50));
    var safeTop = Math.max(12, (at && typeof at.top === 'number') ? (at.top - 10) : 25);
    el.style.left = safeLeft + '%';
    el.style.top = safeTop + '%';
    scene.appendChild(el);

    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3200);
  }

  // ---------------------------------------------------------------------------
  // Transparent Locked 3D After-Build Blueprints
  // ---------------------------------------------------------------------------
  function ensureGhostLayer() {
    var scene = document.getElementById('fieldScene');
    if (!scene) return null;
    var layer = document.getElementById('s2GhostLayer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 's2GhostLayer';
      layer.className = 's2-ghost-layer';
      scene.appendChild(layer);
    }
    tourState.ghostLayer = layer;
    return layer;
  }

  function clearGhosts(animated) {
    var layer = tourState.ghostLayer || document.getElementById('s2GhostLayer');
    if (!layer) return;
    var kids = Array.prototype.slice.call(layer.children);
    if (!animated) {
      layer.innerHTML = '';
      return;
    }
    kids.forEach(function (k) {
      k.classList.add('fade-out');
      k.classList.remove('visible');
    });
    setTimeout(function () {
      if (layer) layer.innerHTML = '';
    }, 500);
  }

  function getBuildingArchitecturalSvg(key, obj, ch) {
    if (key === 'crew_shed' && typeof window !== 'undefined' && typeof window.drawCrewShedScene === 'function') {
      try { return window.drawCrewShedScene({ built: true }); } catch (e) {}
    }
    if (key === 'garden') {
      if (typeof window !== 'undefined' && typeof window.drawGardenScene === 'function') {
        try {
          var gSvg = window.drawGardenScene('roses', 100, false, false, true);
          if (gSvg && gSvg.indexOf('unbuilt-spot') === -1) return gSvg;
        } catch (e) {}
      }
      return (
        '<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;">' +
          '<polygon points="80,24 136,44 136,84 80,104 24,84 24,44" fill="#3E2723" stroke="#81C784" stroke-width="2"/>' +
          '<polygon points="80,28 130,46 130,80 80,98 30,80 30,46" fill="#4E342E"/>' +
          '<!-- Flower Beds -->' +
          '<ellipse cx="56" cy="52" rx="14" ry="9" fill="#1B5E20" stroke="#4CAF50" stroke-width="1"/>' +
          '<ellipse cx="104" cy="52" rx="14" ry="9" fill="#1B5E20" stroke="#4CAF50" stroke-width="1"/>' +
          '<ellipse cx="80" cy="74" rx="16" ry="10" fill="#1B5E20" stroke="#4CAF50" stroke-width="1"/>' +
          '<!-- Blooming Flowers: Roses, Sunflowers & Lavender -->' +
          '<circle cx="52" cy="50" r="3.5" fill="#E91E63"/><circle cx="60" cy="53" r="3.5" fill="#FF4081"/>' +
          '<circle cx="100" cy="50" r="4" fill="#FFEB3B"/><circle cx="108" cy="53" r="4" fill="#FDD835"/>' +
          '<circle cx="76" cy="72" r="3" fill="#BA68C8"/><circle cx="84" cy="74" r="3" fill="#AB47BC"/>' +
          '<!-- Stepping Stones -->' +
          '<circle cx="80" cy="54" r="4" fill="#B0BEC5"/>' +
          '<!-- Honey Bee Hive -->' +
          '<rect x="76" y="34" width="8" height="10" rx="2" fill="#FFA000" stroke="#FF6F00" stroke-width="0.8"/>' +
          '<text x="80" y="42" font-size="6" text-anchor="middle">🐝</text>' +
          '<text x="80" y="94" font-size="12" text-anchor="middle">🌸</text>' +
        '</svg>'
      );
    }
    if (key === 'pond') {
      if (typeof window !== 'undefined' && typeof window.drawPondScene === 'function') {
        try {
          var pSvg = window.drawPondScene('trout', 100, false, false, false, true);
          if (pSvg && pSvg.indexOf('unbuilt-spot') === -1) return pSvg;
        } catch (e) {}
      }
      return (
        '<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;">' +
          '<ellipse cx="80" cy="62" rx="74" ry="46" fill="#78909C" stroke="#455A64" stroke-width="2"/>' +
          '<ellipse cx="80" cy="59" rx="66" ry="40" fill="#01579B"/>' +
          '<ellipse cx="65" cy="54" rx="24" ry="12" fill="none" stroke="#4FC3F7" stroke-width="1.2" opacity="0.6"/>' +
          '<ellipse cx="102" cy="64" rx="20" ry="10" fill="none" stroke="#4FC3F7" stroke-width="1.0" opacity="0.5"/>' +
          '<!-- Wooden Viewing Pier -->' +
          '<rect x="18" y="44" width="34" height="15" rx="2" fill="#8D6E63" stroke="#4E342E" stroke-width="1.2"/>' +
          '<!-- Water Lilies & Mallard Duck -->' +
          '<ellipse cx="98" cy="48" rx="7" ry="4" fill="#2E7D32"/><circle cx="98" cy="46" r="3" fill="#F48FB1"/>' +
          '<ellipse cx="118" cy="66" rx="8" ry="4.5" fill="#2E7D32"/><circle cx="118" cy="64" r="3" fill="#FFF9C4"/>' +
          '<text x="76" y="66" font-size="14" text-anchor="middle">🦆</text>' +
        '</svg>'
      );
    }
    if (key === 'wind_turbine' || (typeof key === 'string' && key.indexOf('wt_') === 0)) {
      if (typeof window !== 'undefined' && typeof window.drawWindTurbineScene === 'function') {
        try {
          var wtSvg = window.drawWindTurbineScene({ built: true, commissioned: true });
          if (wtSvg && wtSvg.indexOf('unbuilt-spot') === -1) return wtSvg;
        } catch (e) {}
      }
      return (
        '<svg viewBox="0 0 120 180" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;">' +
          '<ellipse cx="60" cy="168" rx="34" ry="8" fill="rgba(0,229,255,0.2)"/>' +
          '<polygon points="56,165 64,165 61,45 59,45" fill="#CFD8DC" stroke="#78909C" stroke-width="1.2"/>' +
          '<circle cx="60" cy="45" r="7" fill="#37474F" stroke="#00E5FF" stroke-width="1.5"/>' +
          '<!-- 3 Rotor Blades -->' +
          '<path d="M60,45 Q56,15 60,8 Q64,15 60,45" fill="#ECEFF1" stroke="#B0BEC5" stroke-width="1"/>' +
          '<path d="M60,45 Q88,60 94,65 Q86,72 60,45" fill="#ECEFF1" stroke="#B0BEC5" stroke-width="1"/>' +
          '<path d="M60,45 Q32,60 26,65 Q34,72 60,45" fill="#ECEFF1" stroke="#B0BEC5" stroke-width="1"/>' +
          '<text x="60" y="48" font-size="7" text-anchor="middle" fill="#00E5FF">⚡</text>' +
        '</svg>'
      );
    }
    if (key === 'juice_bar' && typeof window !== 'undefined' && typeof window.drawJuiceBarScene === 'function') {
      try { return window.drawJuiceBarScene({ built: true }, false); } catch (e) {}
    }
    if (key === 'coffee_shop' && typeof window !== 'undefined' && typeof window.drawCoffeeShopScene === 'function') {
      try { return window.drawCoffeeShopScene({ built: true }, false); } catch (e) {}
    }
    if (key === 'garage' && typeof window !== 'undefined' && typeof window.drawGarageScene === 'function') {
      try { return window.drawGarageScene({ built: true }); } catch (e) {}
    }
    if (key === 'storage') {
      if (typeof window !== 'undefined' && typeof window.drawStorageScene === 'function') {
        try {
          var stSvg = window.drawStorageScene({ built: true, stored: 50, capacity: 200 });
          if (stSvg && stSvg.indexOf('unbuilt-spot') === -1) return stSvg;
        } catch (e) {}
      }
      return (
        '<svg viewBox="0 0 160 135" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;">' +
          '<ellipse cx="80" cy="118" rx="60" ry="14" fill="rgba(0,229,255,0.2)"/>' +
          '<polygon points="30,85 80,105 130,85 80,65" fill="#5D4037" stroke="#00E5FF" stroke-width="1.5"/>' +
          '<polygon points="30,85 80,105 80,118 30,98" fill="#3E2723" stroke="#00E5FF" stroke-width="1.2"/>' +
          '<polygon points="80,105 130,85 130,98 80,118" fill="#2E1C14" stroke="#00E5FF" stroke-width="1.2"/>' +
          '<polygon points="40,65 80,35 120,65 80,75" fill="#8D6E63" stroke="#80D8FF" stroke-width="1.5"/>' +
          '<polygon points="80,20 100,35 80,50 60,35" fill="#BCAAA4" stroke="#00E5FF" stroke-width="1.2"/>' +
          '<rect x="72" y="88" width="16" height="24" rx="2" fill="#D7CCC8" stroke="#5D4037" stroke-width="1"/>' +
          '<text x="80" y="55" font-size="16" text-anchor="middle">🌾</text>' +
        '</svg>'
      );
    }
    if (key === 'crop_field' && typeof window !== 'undefined' && typeof window.drawCropFieldScene === 'function') {
      try { return window.drawCropFieldScene({ built: true, beds: [{ cropKey: 'wheat', ready: true }] }); } catch (e) {}
    }
    if (key === 'cattle_farm') {
      if (typeof window !== 'undefined' && typeof window.drawCattleFarmScene === 'function') {
        try {
          var cfSvg = window.drawCattleFarmScene({
            built: true,
            chambers: [
              { id: 0, name: 'Stall 1', species: 'cow', animals: [{ species: 'cow', age: 'adult' }] },
              { id: 1, name: 'Stall 2', species: 'cow', animals: [{ species: 'cow', age: 'adult' }] },
              { id: 2, name: 'Stall 3', species: 'sheep', animals: [{ species: 'sheep', age: 'adult' }] },
              { id: 3, name: 'Stall 4', species: 'sheep', animals: [{ species: 'sheep', age: 'adult' }] }
            ]
          }, false);
          if (cfSvg && cfSvg.indexOf('unbuilt-spot') === -1) return cfSvg;
        } catch (e) {}
      }
      return (
        '<svg viewBox="0 0 90 240" preserveAspectRatio="none" style="width:100%;height:100%;">' +
          '<rect x="4" y="6" width="82" height="228" rx="4" fill="#3E2723" stroke="#261713" stroke-width="2"/>' +
          '<rect x="8" y="12" width="74" height="48" rx="2" fill="#FFFDE7"/><text x="45" y="44" font-size="16" text-anchor="middle">🐄</text>' +
          '<rect x="8" y="68" width="74" height="48" rx="2" fill="#FFFDE7"/><text x="45" y="100" font-size="16" text-anchor="middle">🐄</text>' +
          '<rect x="8" y="124" width="74" height="48" rx="2" fill="#FFFDE7"/><text x="45" y="156" font-size="16" text-anchor="middle">🐑</text>' +
          '<rect x="8" y="180" width="74" height="48" rx="2" fill="#FFFDE7"/><text x="45" y="212" font-size="16" text-anchor="middle">🐑</text>' +
        '</svg>'
      );
    }
    if (key === 'energy_storage') {
      if (typeof window !== 'undefined' && typeof window.drawEnergyStorageScene === 'function') {
        try {
          var bSvg = window.drawEnergyStorageScene({ built: true, storedKWh: 350, maxKWh: 500 });
          if (bSvg && bSvg.indexOf('unbuilt-spot') === -1) return bSvg;
        } catch (e) {}
      }
      return (
        '<svg viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;">' +
          '<ellipse cx="70" cy="122" rx="45" ry="12" fill="rgba(0,229,255,0.2)"/>' +
          '<rect x="28" y="42" width="84" height="74" rx="6" fill="#263238" stroke="#00E5FF" stroke-width="2"/>' +
          '<rect x="36" y="52" width="30" height="22" rx="3" fill="#37474F" stroke="#78909C" stroke-width="1"/>' +
          '<rect x="74" y="52" width="30" height="22" rx="3" fill="#37474F" stroke="#78909C" stroke-width="1"/>' +
          '<rect x="36" y="82" width="68" height="24" rx="3" fill="#1B5E20" stroke="#4CAF50" stroke-width="1"/>' +
          '<text x="70" y="98" font-size="10" text-anchor="middle" font-weight="900" fill="#A5D6A7">350 / 500 kWh</text>' +
          '<circle cx="44" cy="63" r="3" fill="#69F0AE"/><circle cx="54" cy="63" r="3" fill="#69F0AE"/>' +
          '<text x="70" y="34" font-size="14" text-anchor="middle">🔋</text>' +
        '</svg>'
      );
    }
    if (key === 'gate' && typeof window !== 'undefined' && typeof window.drawMainGateScene === 'function') {
      try { return window.drawMainGateScene(); } catch (e) {}
    }
    if (key === 'jute_tarp' && typeof window !== 'undefined' && typeof window.drawJuteTarpScene === 'function') {
      try { return window.drawJuteTarpScene(true); } catch (e) {}
    }

    // High-fidelity fallback 3D isometric architectural blueprints
    if (key === 'plot') {
      return (
        '<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;">' +
          '<ellipse cx="80" cy="98" rx="66" ry="16" fill="rgba(0,229,255,0.2)"/>' +
          '<polygon points="80,24 146,54 80,84 14,54" fill="#003B46" stroke="#00E5FF" stroke-width="1.8"/>' +
          '<polygon points="14,54 80,84 80,94 14,64" fill="#00222B" stroke="#00E5FF" stroke-width="1.2"/>' +
          '<polygon points="80,84 146,54 146,64 80,94" fill="#00171D" stroke="#00E5FF" stroke-width="1.2"/>' +
          '<path d="M48,50 Q52,38 56,44 Q60,34 64,48" stroke="#69F0AE" stroke-width="2.5" fill="none"/>' +
          '<path d="M72,62 Q76,50 80,56 Q84,46 88,60" stroke="#69F0AE" stroke-width="2.5" fill="none"/>' +
          '<path d="M96,74 Q100,62 104,68 Q108,58 112,72" stroke="#69F0AE" stroke-width="2.5" fill="none"/>' +
        '</svg>'
      );
    }
    if (key === 'eco_passport') {
      return (
        '<svg viewBox="0 0 160 160" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;">' +
          '<ellipse cx="80" cy="125" rx="55" ry="18" fill="rgba(0,229,255,0.2)"/>' +
          '<circle cx="80" cy="75" r="42" fill="rgba(0,137,123,0.3)" stroke="#00E5FF" stroke-width="2"/>' +
          '<ellipse cx="80" cy="75" rx="42" ry="16" fill="none" stroke="#80D8FF" stroke-width="1.5" stroke-dasharray="4 2"/>' +
          '<ellipse cx="80" cy="75" rx="18" ry="42" fill="none" stroke="#80D8FF" stroke-width="1.5" stroke-dasharray="4 2"/>' +
          '<polygon points="80,33 118,55 118,95 80,117 42,95 42,55" fill="none" stroke="#00E5FF" stroke-width="1.5"/>' +
          '<text x="80" y="80" font-size="20" text-anchor="middle">🌍</text>' +
        '</svg>'
      );
    }
    if (key === 'space_mission') {
      return (
        '<svg viewBox="0 0 160 160" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;">' +
          '<ellipse cx="80" cy="130" rx="58" ry="18" fill="rgba(0,229,255,0.2)"/>' +
          '<rect x="72" y="35" width="16" height="70" rx="6" fill="rgba(3,169,244,0.35)" stroke="#00E5FF" stroke-width="2"/>' +
          '<polygon points="80,15 72,35 88,35" fill="rgba(0,229,255,0.6)" stroke="#00E5FF" stroke-width="1.8"/>' +
          '<polygon points="62,105 72,85 72,105" fill="#0288D1" stroke="#00E5FF" stroke-width="1.5"/>' +
          '<polygon points="98,105 88,85 88,105" fill="#0288D1" stroke="#00E5FF" stroke-width="1.5"/>' +
          '<rect x="42" y="110" width="76" height="12" rx="3" fill="#37474F" stroke="#00E5FF" stroke-width="1.5"/>' +
          '<text x="80" y="75" font-size="22" text-anchor="middle">🚀</text>' +
        '</svg>'
      );
    }

    return (
      '<svg viewBox="0 0 160 140" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;">' +
        '<ellipse cx="80" cy="115" rx="55" ry="16" fill="rgba(0,229,255,0.2)"/>' +
        '<polygon points="80,25 140,55 80,85 20,55" fill="rgba(0,105,92,0.4)" stroke="#00E5FF" stroke-width="1.8"/>' +
        '<polygon points="20,55 80,85 80,115 20,85" fill="rgba(0,77,64,0.6)" stroke="#00E5FF" stroke-width="1.2"/>' +
        '<polygon points="80,85 140,55 140,85 80,115" fill="rgba(0,56,47,0.7)" stroke="#00E5FF" stroke-width="1.2"/>' +
        '<text x="80" y="75" font-size="26" text-anchor="middle">' + (obj.icon || '🏛️') + '</text>' +
      '</svg>'
    );
  }

  // ---------------------------------------------------------------------------
  // 3D Object Mouse Hover Modal System (Triggered strictly on mouse hover)
  // ---------------------------------------------------------------------------
  function ensureObjectHoverModal() {
    var modal = document.getElementById('s2ObjectHoverModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 's2ObjectHoverModal';
      modal.className = 's2-object-hover-modal hidden';
      document.body.appendChild(modal);
    }
    return modal;
  }

  function showObjectHoverModal(e, key, obj, ch, anchorEl, isTouchTrigger) {
    // Desktop: strictly mouse hover, ignore touch/pen
    if (!isTouchTrigger && e && e.pointerType && e.pointerType !== 'mouse') return;
    var modal = ensureObjectHoverModal();
    var spec = OBJECT_UNLOCK_SPECS[key] || {
      name: (obj && obj.name) || key,
      icon: (obj && obj.icon) || '🏛️',
      chapter: ch || (typeof OBJECT_TO_CHAPTER !== 'undefined' && OBJECT_TO_CHAPTER[key]) || 1,
      cost: 'Varies',
      prereq: 'Survey Chapter ' + (ch || 1) + ' masterplan',
      steps: [
        '1. Survey Chapter ' + (ch || 1) + ' directional locator.',
        '2. Advance farm infrastructure to meet prerequisites.',
        '3. Commission and activate this ecological facility.'
      ]
    };

    var miniSvg = getBuildingArchitecturalSvg(key, obj, ch);
    var chNum = (spec && spec.chapter) || ch || (typeof OBJECT_TO_CHAPTER !== 'undefined' && OBJECT_TO_CHAPTER[key]) || 1;
    var chDef = (typeof CHAPTER_DEFINITIONS !== 'undefined' && CHAPTER_DEFINITIONS[chNum - 1])
      ? CHAPTER_DEFINITIONS[chNum - 1]
      : null;
    var chTitle = chDef ? (chDef.title || ('Chapter ' + chNum)) : ('Chapter ' + chNum);

    modal.innerHTML =
      '<div class="ohm-header">' +
        '<div class="ohm-title-row">' +
          '<span class="ohm-icon">' + spec.icon + '</span>' +
          '<div class="ohm-title-wrap">' +
            '<div class="ohm-title">' + spec.name + '</div>' +
            '<div class="ohm-badge">Ch. ' + chNum + ' · ' + chTitle + '</div>' +
          '</div>' +
        '</div>' +
        (isTouchTrigger
          ? '<button type="button" class="ohm-close-btn" id="s2OhmCloseBtn" onclick="if(window.SearchO2HomeAvatar)SearchO2HomeAvatar.hideObjectHoverModal(); event.stopPropagation();" title="Close">✕</button>'
          : '<span class="ohm-status-tag">📐 Blueprint</span>') +
      '</div>' +
      '<div class="ohm-preview-card">' +
        '<div class="ohm-preview-svg">' + miniSvg + '</div>' +
      '</div>' +
      '<div class="ohm-body">' +
        '<div class="ohm-prereq-row">' +
          '<span class="ohm-prereq-label">Prerequisites:</span> ' +
          '<span class="ohm-prereq-val">' + spec.prereq + ' (' + spec.cost + ')</span>' +
        '</div>' +
        '<div class="ohm-steps-title">Steps to Unlock:</div>' +
        '<ol class="ohm-steps-list">' +
          spec.steps.map(function(s){ return '<li>' + s + '</li>'; }).join('') +
        '</ol>' +
      '</div>';

    modal.classList.remove('hidden');
    if (isTouchTrigger) {
      modal.classList.add('is-touch-mode');
    } else {
      modal.classList.remove('is-touch-mode');
    }

    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var modalW = 230;
    var modalH = modal.offsetHeight || 260;

    if (isTouchTrigger && vw <= 768) {
      modal.style.position = 'fixed';
      modal.style.left = '50%';
      modal.style.transform = 'translateX(-50%)';
      modal.style.bottom = '78px';
      modal.style.top = 'auto';
    } else {
      modal.style.transform = '';
      var rect = anchorEl ? anchorEl.getBoundingClientRect() : (e ? { left: e.clientX, right: e.clientX, top: e.clientY, bottom: e.clientY, width: 0, height: 0 } : null);
      if (rect) {
        var topPos = rect.top - modalH - 10;
        if (topPos < 14) {
          topPos = rect.bottom + 10;
        }
        var leftPos = rect.left + (rect.width / 2) - (modalW / 2);
        if (leftPos < 10) leftPos = 10;
        if (leftPos + modalW > vw - 10) leftPos = vw - modalW - 10;
        modal.style.top = Math.max(10, Math.min(vh - modalH - 10, topPos)) + 'px';
        modal.style.left = leftPos + 'px';
        modal.style.bottom = 'auto';
      }
    }
  }

  function hideObjectHoverModal() {
    var modal = document.getElementById('s2ObjectHoverModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('is-touch-mode');
    }
  }

  // Dismiss touch hover modal when clicking/tapping outside
  if (typeof document !== 'undefined') {
    document.addEventListener('pointerdown', function (e) {
      var modal = document.getElementById('s2ObjectHoverModal');
      if (modal && !modal.classList.contains('hidden') && modal.classList.contains('is-touch-mode')) {
        if (!modal.contains(e.target) && !e.target.closest('.s2-ghost-obj')) {
          hideObjectHoverModal();
        }
      }
    });
  }

  function showChapterGhosts(ch, sequential) {
    var layer = ensureGhostLayer();
    if (!layer) return;
    clearGhosts(false);

    var objs = CHAPTER_TOUR_OBJECTS[ch] || [];
    objs.forEach(function (obj, idx) {
      var spot = getFacilitySpot(obj.key);
      if (!spot) return;

      var archSvg = getBuildingArchitecturalSvg(obj.key, obj, ch);
      var el = document.createElement('div');
      el.className = 's2-ghost-obj';
      el.style.left = spot.left + '%';
      el.style.top = spot.top + '%';
      el.style.width = (spot.w || 10) + '%';
      el.style.height = (spot.h || 16) + '%';
      el.setAttribute('data-object-key', obj.key);
      el.setAttribute('data-facility-key', obj.key);
      el.innerHTML =
        '<div class="s2-ghost-structure s2-ghost-body">' +
          archSvg +
          '<span class="s2-ghost-blueprint-tag">📐 Blueprint</span>' +
          '<span class="s2-ghost-lock">🔒</span>' +
        '</div>' +
        '<div class="s2-ghost-label">Ch. ' + ch + ' · ' + obj.name + '</div>';

      // Mouse-only hover modal interaction for PC
      el.addEventListener('mouseenter', function (e) {
        showObjectHoverModal(e, obj.key, obj, ch, el, false);
      });
      el.addEventListener('mouseleave', function () {
        hideObjectHoverModal();
      });

      // Mobile finger touch: "enble cyan marked object touch by finger and then display. no touch no display."
      el.addEventListener('click', function (e) {
        var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (e.pointerType === 'touch') || (window.innerWidth <= 768);
        if (isTouch) {
          e.stopPropagation();
          showObjectHoverModal(e, obj.key, obj, ch, el, true);
        }
      });

      layer.appendChild(el);
      var delay = sequential ? 200 + idx * 260 : 60 + idx * 60;
      setTimeout(function () {
        el.classList.add('visible');
      }, delay);
    });
  }

  function renderExploredFieldBadge(ch, key) {
    // User instruction: after exploration remove all star icons
    var badgeId = 's2ExploredBadge_ch' + ch;
    var badge = document.getElementById(badgeId);
    if (badge && badge.parentNode) {
      badge.parentNode.removeChild(badge);
    }
  }

  // ---------------------------------------------------------------------------
  // Chapter Roadmap Modal & Survey Progression (Aligned beside Active Chapter Challenge)
  // ---------------------------------------------------------------------------
  function advanceTourCheckpoint(targetCh) {
    var c = targetCh || tourState.activeCheckpoint || 1;
    tourState.activeCheckpoint = null;
    var modal = document.getElementById('s2TourModal');
    if (modal) modal.classList.add('hidden');

    var keyMap = {
      1: 'plot',
      2: 'crew_shed',
      3: 'garden',
      4: 'pond',
      5: 'energy_storage',
      6: 'juice_bar',
      7: 'eco_passport',
      8: 'space_mission'
    };
    var primaryKey = keyMap[c];

    // Drive the actual SearchO2 exploration mechanics
    var exploreFn = (typeof exploreChapterObject === 'function')
      ? exploreChapterObject
      : ((typeof window !== 'undefined' && typeof window.exploreChapterObject === 'function') ? window.exploreChapterObject : null);

    if (primaryKey && exploreFn) {
      try {
        exploreFn(primaryKey);
      } catch (e) {}
    }
    if (typeof closeModal === 'function') {
      try { closeModal(); } catch(e){}
    }
    if (typeof state !== 'undefined' && state) {
      state.exploredChapters = state.exploredChapters || {};
      state.exploredChapters[c] = true;
      state.exploredChapterObjects = state.exploredChapterObjects || {};
      if (primaryKey) state.exploredChapterObjects[primaryKey] = true;
      if (typeof state.xp === 'number' && state.xp === 0) state.xp = 5;
    }

    renderExploredFieldBadge(c, primaryKey);

    if (typeof updateTaskCarouselDOM === 'function') updateTaskCarouselDOM();
    if (typeof render === 'function') render();

    var cb = tourState.onCheckpointAdvance;
    tourState.onCheckpointAdvance = null;
    if (cb) {
      cb();
    } else if (tourState.active && c < 8) {
      startScoutCooldown(c, c + 1);
    }
  }

  function openTourModal(ch, onContinue) {
    tourState.activeCheckpoint = ch;
    tourState.onCheckpointAdvance = onContinue;

    // Update existing chapter survey modal bottom left beside marketplace
    if (typeof updateTaskCarouselDOM === 'function') updateTaskCarouselDOM();
    if (typeof render === 'function') render();

    dockTopCapsules();
    var modal = document.getElementById('s2TourModal');
    var card = document.getElementById('s2TourModalCard');
    if (!modal || !card) {
      return;
    }

    var def = (typeof CHAPTER_DEFINITIONS !== 'undefined' && CHAPTER_DEFINITIONS[ch - 1])
      ? CHAPTER_DEFINITIONS[ch - 1]
      : { icon: '🧭', title: 'Chapter ' + ch, desc: 'Survey the farm masterplan.' };

    var objs = CHAPTER_TOUR_OBJECTS[ch] || [];
    var names = objs.map(function (o) { return o.name; }).join(' · ');

    card.innerHTML =
      '<span class="guide-pulse-dot"></span>' +
      '<span class="tm-icon" title="' + (names || 'Blueprint Unlocked') + '">' + (def.icon || '🧭') + '</span>' +
      '<span class="tm-text" title="Chapter ' + ch + ': ' + (def.title || '') + ' — Blueprint Unlocked"><b>Ch. ' + ch + ': ' + (def.title || 'Scout') + '</b></span>' +
      '<button type="button" class="s2-btn-primary tm-next-btn" id="s2TourContinue" title="Mark explored and continue tour">✓ Next ➔</button>' +
      '<button type="button" class="s2-modal-close-btn" id="s2TourModalClose" title="Close guidance capsule">✕</button>';

    modal.classList.remove('hidden');
    dockTopCapsules();

    function handleModalCloseAndAdvance() {
      advanceTourCheckpoint(ch);
      if (ch < 8) {
        triggerNextScoutWalk(ch + 1);
      }
    }

    var btn = document.getElementById('s2TourContinue');
    if (btn) btn.onclick = handleModalCloseAndAdvance;

    var closeBtn = document.getElementById('s2TourModalClose');
    if (closeBtn) closeBtn.onclick = handleModalCloseAndAdvance;
  }

  function isAnyExplorationModalOpen() {
    var isMobile = (typeof window !== 'undefined' && (window.innerWidth <= 860 || window.innerHeight <= 520 || (window.matchMedia && window.matchMedia('(max-width: 860px), (max-height: 520px), (pointer: coarse)').matches)));
    if (isMobile) {
      // On mobile during exploration, cooldown timer must always remain visible
      return false;
    }
    var overlay = document.getElementById('modalOverlay');
    if (overlay && !overlay.classList.contains('hidden') && overlay.style.display !== 'none' && overlay.offsetWidth > 0) return true;
    var lockedPopup = document.getElementById('stepInstructionPopupWrapper');
    if (lockedPopup && !lockedPopup.classList.contains('hidden') && lockedPopup.style.display !== 'none' && lockedPopup.offsetWidth > 0) return true;
    var tourOverlay = document.getElementById('s2HomeOverlay');
    if (tourOverlay && !tourOverlay.classList.contains('hidden') && tourOverlay.style.display !== 'none' && tourOverlay.offsetWidth > 0) return true;
    if (typeof document !== 'undefined' && document.body && document.body.classList.contains('modal-open')) return true;
    return false;
  }

  function renderScoutCountdownFloater(seconds, nextCh) {
    var floater = document.getElementById('s2ScoutCountdownFloater');
    var host = document.getElementById('fieldScene') || document.querySelector('.field-scene') || document.body;
    if (!floater) {
      floater = document.createElement('div');
      floater.id = 's2ScoutCountdownFloater';
      floater.className = 's2-scout-countdown-floater';
      host.appendChild(floater);
    } else {
      if (floater.parentElement !== host) {
        host.appendChild(floater);
      }
    }

    floater.innerHTML =
      '<div class="scf-icon-pill" id="s2CooldownIconPill" role="button" tabindex="0" title="Scout cooldown active: Click to view details / walk now">' +
        '<span class="scf-icon">⏳</span>' +
        '<span class="scf-time-tag" id="s2ScoutCountdownSec">' + seconds + 's</span>' +
      '</div>' +
      '<div class="scf-pop-modal hidden" id="s2CooldownPopModal" role="dialog" aria-modal="true" aria-label="Scout Cooldown Details">' +
        '<div class="scf-pop-header">' +
          '<span class="scf-pop-title">⏳ Scout Cooldown</span>' +
          '<button type="button" class="scf-pop-close" id="s2CooldownPopClose" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="scf-pop-body">' +
          '<div class="scf-pop-desc">Next scout in <b class="scf-sec-accent" id="s2ScoutCountdownSecPop">' + seconds + 's</b></div>' +
          '<button type="button" class="scf-walk-btn" id="s2WalkNextBtn" title="Start walking now">Walk Now ➔</button>' +
        '</div>' +
      '</div>';

    var pill = document.getElementById('s2CooldownIconPill');
    var popModal = document.getElementById('s2CooldownPopModal');
    var closeBtn = document.getElementById('s2CooldownPopClose');
    if (pill && popModal) {
      pill.onclick = function (e) {
        if (e) e.stopPropagation();
        popModal.classList.toggle('hidden');
      };
      pill.ontouchend = function (e) {
        if (e) e.stopPropagation();
        popModal.classList.toggle('hidden');
      };
    }
    if (closeBtn && popModal) {
      closeBtn.onclick = function (e) {
        if (e) e.stopPropagation();
        popModal.classList.add('hidden');
      };
      closeBtn.ontouchend = function (e) {
        if (e) e.stopPropagation();
        popModal.classList.add('hidden');
      };
    }

    var wb = document.getElementById('s2WalkNextBtn');
    if (wb) {
      wb.onclick = function (e) {
        if (e) e.stopPropagation();
        walkToNextScoutNow();
      };
      wb.ontouchend = function (e) {
        if (e) e.stopPropagation();
        walkToNextScoutNow();
      };
    }

    floater.classList.remove('hidden');

    if (isAnyExplorationModalOpen()) {
      floater.classList.add('modal-hidden');
    } else {
      floater.classList.remove('modal-hidden');
    }
  }

  function updateScoutCountdownFloater(seconds, nextCh) {
    var secSpans = document.querySelectorAll('#s2ScoutCountdownSec, .s2-scout-countdown-sec');
    secSpans.forEach(function (el) {
      el.textContent = seconds + 's';
    });
    var secPop = document.getElementById('s2ScoutCountdownSecPop');
    if (secPop) secPop.textContent = seconds + 's';

    var floater = document.getElementById('s2ScoutCountdownFloater');
    if (floater) {
      if (isAnyExplorationModalOpen()) {
        floater.classList.add('modal-hidden');
      } else {
        floater.classList.remove('modal-hidden');
      }
    }
  }

  function hideScoutCountdownFloater() {
    var floater = document.getElementById('s2ScoutCountdownFloater');
    if (floater) {
      floater.classList.add('hidden');
      var popModal = document.getElementById('s2CooldownPopModal');
      if (popModal) popModal.classList.add('hidden');
    }
  }

  function clearScoutCooldown() {
    if (tourState.cooldownTimer) {
      clearInterval(tourState.cooldownTimer);
      tourState.cooldownTimer = null;
    }
    tourState.cooldownActive = false;
    tourState.cooldownRemaining = 0;
    tourState.pendingNextChapter = null;
    hideScoutCountdownFloater();
    if (typeof updateTaskCarouselDOM === 'function') updateTaskCarouselDOM();
    if (typeof render === 'function') render();
  }

  function triggerNextScoutWalk(nextCh) {
    clearScoutCooldown();
    clearGhosts(true);
    if (tourState.walkerEl) {
      tourState.walkerEl.classList.remove('wonder-touching');
    }
    runChapterStep(nextCh);
  }

  function walkToNextScoutNow() {
    if (!tourState.active) {
      startChapterTour();
      return;
    }
    if (!tourState.cooldownActive) return;
    var nextCh = tourState.pendingNextChapter || (tourState.currentChapter ? tourState.currentChapter + 1 : 2);
    triggerNextScoutWalk(nextCh);
  }

  function startScoutCooldown(fromCh, nextCh) {
    if (!tourState.active || tourState.skipped) return;
    if (nextCh > 8) {
      endTour(false);
      return;
    }

    clearScoutCooldown();
    tourState.cooldownActive = true;
    tourState.cooldownRemaining = 45;
    tourState.pendingNextChapter = nextCh;

    renderScoutCountdownFloater(45, nextCh);
    updateTourProgress(fromCh, 45);
    if (typeof updateTaskCarouselDOM === 'function') updateTaskCarouselDOM();
    if (typeof render === 'function') render();

    tourState.cooldownTimer = setInterval(function () {
      tourState.cooldownRemaining--;
      var rem = tourState.cooldownRemaining;

      updateScoutCountdownFloater(rem, nextCh);
      updateTourProgress(fromCh, rem);
      if (typeof updateTaskCarouselDOM === 'function') updateTaskCarouselDOM();

      if (rem <= 0) {
        clearScoutCooldown();
        triggerNextScoutWalk(nextCh);
      }
    }, 1000);
  }

  function updateTourProgress(ch, cooldownSec) {
    var isMobile = (typeof window !== 'undefined' && (window.innerWidth <= 860 || window.innerHeight <= 520 || (window.matchMedia && window.matchMedia('(max-width: 860px), (max-height: 520px), (pointer: coarse)').matches)));
    var pill = document.getElementById('s2TourProgress');
    if (isMobile) {
      if (pill) {
        pill.classList.remove('visible');
        pill.style.display = 'none';
      }
      return;
    }
    var txt = document.getElementById('s2TourProgressText');
    if (pill) pill.classList.add('visible');
    if (txt) {
      var avName = tourState.avatar ? (tourState.avatar.adjective + ' ' + tourState.avatar.name) : 'Explorer';
      if (typeof cooldownSec === 'number' && cooldownSec > 0) {
        txt.textContent = '🧭 Ch. ' + ch + ' / 8 Surveyed · Next scout in ' + cooldownSec + 's (' + avName + ')';
      } else {
        txt.textContent = '🧭 Chapter ' + ch + ' / 8 · ' + avName;
      }
    }
  }

  function endTour(skipped) {
    tourState.active = false;
    tourState.skipped = !!skipped;
    clearScoutCooldown();
    clearGhosts(true);

    var pill = document.getElementById('s2TourProgress');
    if (pill) pill.classList.remove('visible');

    var modal = document.getElementById('s2TourModal');
    if (modal) modal.classList.add('hidden');

    var heading = document.getElementById('s2SkyHeading');
    if (heading && heading.parentNode) heading.parentNode.removeChild(heading);

    // After exploration remove all star icons
    var stars = document.querySelectorAll('.chapter-explore-tick, .s2-field-survey-tick, .tick-star');
    stars.forEach(function (s) {
      if (s && s.parentNode) s.parentNode.removeChild(s);
    });

    // After exploration avatar stands still
    if (tourState.walkerEl) {
      tourState.walkerEl.classList.remove('walking', 'wonder-touching');
      tourState.walkerEl.classList.add('idle-standing');
      tourState.walkerEl.style.transform = 'translate(-50%, -85%)';
    }

    if (typeof showNotification === 'function') {
      var avName = tourState.avatar ? (tourState.avatar.adjective + ' ' + tourState.avatar.name) : 'Explorer';
      if (skipped) {
        showNotification('👋', 'Tour skipped — explore the farm freely!', 'task');
      } else {
        showNotification(
          '🎉',
          avName + ' completed the Masterplan Survey! All 8 chapters surveyed (+40 XP)',
          'achievement'
        );
      }
    }

    try {
      localStorage.setItem('searchO2_chapter_tour_done', skipped ? 'skipped' : '1');
    } catch (e) {}

    // When all 8 chapters explored, trigger 20s cooldown with unlock celebration modal
    if (!skipped) {
      setTimeout(function () {
        startPostExploration20sCooldown(function () {
          triggerJuteTarpDiggingSequence();
        });
      }, 700);
    }
  }

  // ---------------------------------------------------------------------------
  // Calibrated On-Plot Soil Terrace Work Spot (PC & Mobile)
  // ---------------------------------------------------------------------------
  function getPlotWorkSpot(plotId) {
    plotId = parseInt(plotId, 10) || 0;
    var scene = document.getElementById('fieldScene');
    if (scene) {
      var sRect = scene.getBoundingClientRect();
      var plotEl = document.querySelector('[data-plot="' + plotId + '"]');
      if (plotEl && sRect.width > 0 && sRect.height > 0) {
        var r = plotEl.getBoundingClientRect();
        // Exact center of the 3D isometric loam soil terrace
        var leftPct = ((r.left + r.width * 0.65 - sRect.left) / sRect.width) * 100;
        var topPct = ((r.top + r.height * 0.58 - sRect.top) / sRect.height) * 100;
        return {
          left: Math.max(10, Math.min(90, leftPct)),
          top: Math.max(15, Math.min(88, topPct))
        };
      }
    }
    // Verified calibrated soil terrace spots matching the 6 isometric loam beds
    var fallbacks = {
      0: { left: 26.3, top: 32.8 },
      1: { left: 54.6, top: 34.4 },
      2: { left: 82.3, top: 32.8 },
      3: { left: 26.3, top: 79.9 },
      4: { left: 54.6, top: 63.9 },
      5: { left: 82.3, top: 79.9 }
    };
    return fallbacks[plotId] || { left: 26.3, top: 32.8 };
  }

  // ---------------------------------------------------------------------------
  // Post-Exploration 20s Cooldown & Unlock Celebration Modal
  // ---------------------------------------------------------------------------
  function showUnlockCelebrationModal(totalSec, onDone) {
    var modal = document.getElementById('s2UnlockCelebrationModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 's2UnlockCelebrationModal';
      modal.className = 's2-unlock-modal';
      document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');

    var avName = tourState.avatar ? (tourState.avatar.adjective + ' ' + tourState.avatar.name) : 'Explorer';
    modal.innerHTML =
      '<div class="s2-unlock-card">' +
        '<div class="s2-unlock-badge">📜 ⛏️ 🌾</div>' +
        '<div class="s2-unlock-title">All 8 Chapters Explored!</div>' +
        '<div class="s2-unlock-subtitle">Ancestral Jute Tarpaulin &amp; Tools Unlocked (+40 XP)</div>' +
        '<p class="s2-unlock-desc">' + avName + ' successfully surveyed the entire farm masterplan. Prepare to uncover the historic Jute Tarpaulin cache to equip traditional hand tools.</p>' +
        '<div class="s2-unlock-timer-bar"><div class="s2-unlock-timer-fill" id="s2UnlockFill" style="width:100%;"></div></div>' +
        '<div class="s2-unlock-timer-label"><span>⏳ Tool collection in:</span> <b id="s2UnlockSec">' + totalSec + 's</b></div>' +
        '<button type="button" class="s2-unlock-now-btn" id="s2UnlockNowBtn">Collect Tools Now ➔</button>' +
      '</div>';

    var btn = document.getElementById('s2UnlockNowBtn');
    if (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        dismissUnlockModal();
        if (onDone) onDone();
      };
    }
  }

  function dismissUnlockModal() {
    var modal = document.getElementById('s2UnlockCelebrationModal');
    if (modal) modal.classList.add('hidden');
  }

  function startPostExploration20sCooldown(onReadyToWalk) {
    clearScoutCooldown();
    hideScoutCountdownFloater();
    tourState.postTourCooldownActive = true;
    var remaining = 20;

    renderScoutCountdownFloater(remaining, 'tarp');
    var timer = null;

    showUnlockCelebrationModal(remaining, function () {
      if (timer) clearInterval(timer);
      tourState.postTourCooldownActive = false;
      hideScoutCountdownFloater();
      if (onReadyToWalk) onReadyToWalk();
    });

    var fill = document.getElementById('s2UnlockFill');
    var secSpan = document.getElementById('s2UnlockSec');

    timer = setInterval(function () {
      remaining--;
      updateScoutCountdownFloater(remaining, 'tarp');
      if (secSpan) secSpan.textContent = remaining + 's';
      if (fill) fill.style.width = ((remaining / 20) * 100) + '%';

      if (remaining <= 0) {
        clearInterval(timer);
        tourState.postTourCooldownActive = false;
        hideScoutCountdownFloater();
        dismissUnlockModal();
        if (onReadyToWalk) onReadyToWalk();
      }
    }, 1000);
  }

  // ---------------------------------------------------------------------------
  // 3D Farming Particle Systems: Dirt, Water, Seed, Harvest
  // ---------------------------------------------------------------------------
  function spawnDirtParticles(at) {
    var scene = document.getElementById('fieldScene');
    if (!scene) return;
    var colors = ['#5D4037', '#4E342E', '#3E2723', '#795548', '#8D6E63'];
    for (var i = 0; i < 6; i++) {
      var p = document.createElement('div');
      p.className = 's2-dirt-particle';
      var dx = (Math.random() * 34 - 17) + 'px';
      var dy = -(Math.random() * 26 + 10) + 'px';
      p.style.setProperty('--dx', dx);
      p.style.setProperty('--dy', dy);
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      var sz = Math.floor(Math.random() * 4 + 3) + 'px';
      p.style.width = sz;
      p.style.height = sz;
      p.style.left = (at.left + (Math.random() * 3.5 - 1.75)) + '%';
      p.style.top = (at.top + (Math.random() * 3.5 - 1.75)) + '%';
      scene.appendChild(p);
      setTimeout((function (el) {
        return function () {
          if (el && el.parentNode) el.parentNode.removeChild(el);
        };
      })(p), 800);
    }
  }

  function spawnWaterParticles(at) {
    var scene = document.getElementById('fieldScene');
    if (!scene) return;
    for (var i = 0; i < 5; i++) {
      var p = document.createElement('div');
      p.className = 's2-water-particle';
      var dx = (Math.random() * 26 - 13) + 'px';
      var dy = (Math.random() * 24 + 6) + 'px';
      p.style.setProperty('--dx', dx);
      p.style.setProperty('--dy', dy);
      var sz = Math.floor(Math.random() * 4 + 4) + 'px';
      p.style.width = sz;
      p.style.height = sz;
      p.style.left = (at.left + (Math.random() * 3 - 1.5)) + '%';
      p.style.top = (at.top + (Math.random() * 2 - 1)) + '%';
      scene.appendChild(p);
      setTimeout((function (el) {
        return function () {
          if (el && el.parentNode) el.parentNode.removeChild(el);
        };
      })(p), 700);
    }
  }

  function spawnSeedParticles(at) {
    var scene = document.getElementById('fieldScene');
    if (!scene) return;
    for (var i = 0; i < 6; i++) {
      var p = document.createElement('div');
      p.className = 's2-seed-particle';
      var dx = (Math.random() * 28 - 14) + 'px';
      var dy = (Math.random() * 20 + 8) + 'px';
      p.style.setProperty('--dx', dx);
      p.style.setProperty('--dy', dy);
      var sz = Math.floor(Math.random() * 3 + 3) + 'px';
      p.style.width = sz;
      p.style.height = sz;
      p.style.left = (at.left + (Math.random() * 3 - 1.5)) + '%';
      p.style.top = (at.top + (Math.random() * 2 - 1)) + '%';
      scene.appendChild(p);
      setTimeout((function (el) {
        return function () {
          if (el && el.parentNode) el.parentNode.removeChild(el);
        };
      })(p), 750);
    }
  }

  function spawnHarvestParticles(at) {
    var scene = document.getElementById('fieldScene');
    if (!scene) return;
    var icons = ['🍎', '🌾', '🥕', '🍇', '✨', '⭐'];
    for (var i = 0; i < 4; i++) {
      var p = document.createElement('div');
      p.className = 's2-harvest-particle';
      p.textContent = icons[Math.floor(Math.random() * icons.length)];
      var dx = (Math.random() * 34 - 17) + 'px';
      var dy = -(Math.random() * 28 + 12) + 'px';
      p.style.setProperty('--dx', dx);
      p.style.setProperty('--dy', dy);
      p.style.left = (at.left + (Math.random() * 3 - 1.5)) + '%';
      p.style.top = (at.top + (Math.random() * 2 - 1)) + '%';
      scene.appendChild(p);
      setTimeout((function (el) {
        return function () {
          if (el && el.parentNode) el.parentNode.removeChild(el);
        };
      })(p), 900);
    }
  }

  // ---------------------------------------------------------------------------
  // 3D Soil Digging & Jute Tarpaulin Tool Equipment Sequence
  // ---------------------------------------------------------------------------
  function triggerJuteTarpDiggingSequence(onComplete) {
    var scene = document.getElementById('fieldScene');
    if (!scene) return;

    // 1. Remove all star icons from field scene
    var stars = document.querySelectorAll('.chapter-explore-tick, .s2-field-survey-tick, .tick-star');
    stars.forEach(function (s) {
      if (s && s.parentNode) s.parentNode.removeChild(s);
    });

    // 2. Hide any leftover tour modals or floaters
    clearScoutCooldown();
    hideScoutCountdownFloater();
    var modal = document.getElementById('s2TourModal');
    if (modal) modal.classList.add('hidden');
    var progress = document.getElementById('s2TourProgress');
    if (progress) progress.style.display = 'none';

    // 3. Locate or spawn avatar
    var el = tourState.walkerEl || document.getElementById('s2PlayerAvatar');
    if (!el) {
      var av = loadPersistedAvatar() || AVATAR_ROSTER[0];
      el = spawnWalker(av, meadowEntryPoint());
    }
    if (!el) return;

    var currentLeft = parseFloat(el.style.left) || 28;
    var currentTop = parseFloat(el.style.top) || 25;
    var tarpSpot = { left: 14.2, top: 78.5 };

    showSkyHeading('Walking to Jute Tarpaulin to equip hand tools...', tarpSpot, '⛏️');

    // Step A: Natural biological walk to Jute Tarpaulin Cache
    var distToTarp = Math.hypot(tarpSpot.left - currentLeft, tarpSpot.top - currentTop);
    var walkDurToTarp = Math.max(2800, Math.min(4200, Math.round(distToTarp * 105)));

    walkPath(el, [{ left: currentLeft, top: currentTop }, tarpSpot], walkDurToTarp, function () {
      el.classList.remove('walking');
      el.classList.add('idle-standing');

      // Step B: Uncover Jute Tarpaulin & Equip Hand Instrument
      if (typeof state !== 'undefined' && state) {
        state.juteTarpUncovered = true;
        state.basicToolsDiscovered = true;
        state.equipment = state.equipment || { owned: {}, leased: {} };
        state.equipment.owned = state.equipment.owned || {};
        state.equipment.owned['spade'] = true;
      }
      if (typeof render === 'function') render();

      // Avatar physically equips 3D hand instrument
      el.classList.add('has-instrument', 'has-tool-spade');
      spawnTouchRipple(tarpSpot);
      showSkyHeading('Equipped Hand-Forged Spade & Broadfork!', tarpSpot, '✨');
      if (typeof showNotification === 'function') {
        showNotification('⛏️', 'Equipped Traditional Hand Spade! Walking to Plot 1...', 'achievement');
      }

      // Step C: Realistic biological walk with spade squarely to Plot 0 soil terrace
      setTimeout(function () {
        var plotTarget = getPlotWorkSpot(0);
        showSkyHeading('Heading to Plot 1 to aerate bedrock and dig soil...', plotTarget, '🌱');
        var distToPlot = Math.hypot(plotTarget.left - tarpSpot.left, plotTarget.top - tarpSpot.top);
        var walkDurToPlot = Math.max(3000, Math.min(4500, Math.round(distToPlot * 105)));

        walkPath(el, [tarpSpot, plotTarget], walkDurToPlot, function () {
          el.classList.remove('walking');
          el.classList.remove('facing-south', 'facing-west');
          el.classList.add('facing-north', 'facing-east');
          el.style.transform = 'translate(-50%, -85%) scaleX(1)';

          // Step D: 3D Visual Digging Animation squarely on soil bed
          el.classList.add('is-digging');

          var bursts = 0;
          var dirtTimer = setInterval(function () {
            if (!el || !el.classList.contains('is-digging')) {
              clearInterval(dirtTimer);
              return;
            }
            spawnDirtParticles(plotTarget);
            bursts++;
            if (bursts >= 10) {
              clearInterval(dirtTimer);
            }
          }, 350);

          // Step E: Update Task State to Digging / Soil Preparation
          if (typeof state !== 'undefined' && state && state.plots && state.plots[0]) {
            state.plots[0].status = 'preparing';
            state.plots[0].taskHours = 0.5;
          }
          if (typeof updateTaskCarouselDOM === 'function') updateTaskCarouselDOM();
          if (typeof render === 'function') render();
          if (typeof requestSave === 'function') requestSave();

          showSkyHeading('Plot 1 Tillage Underway · Hand Spade Aeration', plotTarget, '🌱');
          if (typeof showNotification === 'function') {
            showNotification('🌱', 'Avatar started manual digging on Plot 1! Bedrock aerated.', 'plot', 0);
          }

          if (onComplete) onComplete();
        });
      }, 900);
    });
  }

  // ---------------------------------------------------------------------------
  // Top-Layer Avatar Farm Task Operations (Farmer & Labourer Tasks)
  // ---------------------------------------------------------------------------
  var currentAvatarTask = null;
  var avatarTaskInterval = null;

  function clearAvatarTask() {
    if (avatarTaskInterval) {
      clearInterval(avatarTaskInterval);
      avatarTaskInterval = null;
    }
    currentAvatarTask = null;
    var el = tourState.walkerEl || document.getElementById('s2PlayerAvatar');
    if (el) {
      el.classList.remove(
        'is-digging', 'is-watering', 'is-planting', 'is-harvesting', 'is-clearing',
        'has-tool-spade', 'has-tool-watercan', 'has-tool-basket', 'has-tool-scythe', 'has-tool-seedbag', 'has-instrument'
      );
      el.classList.add('idle-standing');
    }
  }

  function joinPlotTask(plotId, taskKind, onDone) {
    plotId = parseInt(plotId, 10) || 0;
    var el = tourState.walkerEl || document.getElementById('s2PlayerAvatar');
    if (!el) {
      var av = loadPersistedAvatar() || AVATAR_ROSTER[0];
      el = spawnWalker(av, meadowEntryPoint());
    }
    if (!el) return;

    clearAvatarTask();

    var spot = getPlotWorkSpot(plotId);
    var from = {
      left: parseFloat(el.style.left) || 28,
      top: parseFloat(el.style.top) || 25
    };

    var dist = Math.hypot(spot.left - from.left, spot.top - from.top);
    var dur = Math.max(2200, Math.min(4200, Math.round(dist * 105)));

    var av = tourState.avatar || loadPersistedAvatar() || AVATAR_ROSTER[0];
    showSkyHeading(av.name + ' walking to Plot ' + (plotId + 1) + '...', spot, '🥾');

    walkPath(el, [from, spot], dur, function () {
      el.classList.remove('walking', 'idle-standing');
      currentAvatarTask = { plotId: plotId, taskKind: taskKind };

      var toolClass = 'has-tool-spade';
      var actionClass = 'is-digging';
      var headingText = av.name + ' · Tilling Soil';
      var icon = '⛏️';

      if (taskKind === 'watering' || taskKind === 'water') {
        toolClass = 'has-tool-watercan';
        actionClass = 'is-watering';
        headingText = av.name + ' · Irrigating Bed';
        icon = '💧';
      } else if (taskKind === 'planting' || taskKind === 'plant') {
        toolClass = 'has-tool-seedbag';
        actionClass = 'is-planting';
        headingText = av.name + ' · Sowing Seeds';
        icon = '🌱';
      } else if (taskKind === 'harvesting' || taskKind === 'harvest') {
        toolClass = 'has-tool-basket';
        actionClass = 'is-harvesting';
        headingText = av.name + ' · Harvesting Produce';
        icon = '🧺';
      } else if (taskKind === 'clearing' || taskKind === 'clear') {
        toolClass = 'has-tool-scythe';
        actionClass = 'is-clearing';
        headingText = av.name + ' · Clearing Brush';
        icon = '🌾';
      }

      el.classList.add(toolClass, actionClass);
      showSkyHeading(headingText, spot, icon);

      // Continuous rhythmic particle emitter while working
      function emitParticles() {
        if (!currentAvatarTask || !el) {
          if (avatarTaskInterval) clearInterval(avatarTaskInterval);
          return;
        }
        if (actionClass === 'is-digging') spawnDirtParticles(spot);
        else if (actionClass === 'is-watering') spawnWaterParticles(spot);
        else if (actionClass === 'is-planting') spawnSeedParticles(spot);
        else if (actionClass === 'is-harvesting') spawnHarvestParticles(spot);
        else if (actionClass === 'is-clearing') spawnDirtParticles(spot);
      }
      emitParticles();
      avatarTaskInterval = setInterval(emitParticles, 750);

      if (onDone) onDone();
    });
  }

  function leavePlotTask() {
    clearAvatarTask();
    var meadow = meadowEntryPoint();
    var el = tourState.walkerEl || document.getElementById('s2PlayerAvatar');
    if (el) {
      var from = { left: parseFloat(el.style.left) || 28, top: parseFloat(el.style.top) || 25 };
      walkPath(el, [from, meadow], 2200, function () {
        el.classList.add('idle-standing');
      });
    }
  }

  function getActiveAvatarTask() {
    return currentAvatarTask;
  }

  // ---------------------------------------------------------------------------
  // Step-by-Step Chapter Exploration Loop (1 through 8)
  // ---------------------------------------------------------------------------
  function runChapterStep(ch) {
    if (!tourState.active || tourState.skipped) return;
    if (ch > 8) {
      endTour(false);
      return;
    }

    tourState.currentChapter = ch;
    updateTourProgress(ch);

    var av = tourState.avatar;
    var el = tourState.walkerEl;
    if (!el || !av) {
      endTour(true);
      return;
    }

    var def = (typeof CHAPTER_DEFINITIONS !== 'undefined' && CHAPTER_DEFINITIONS[ch - 1])
      ? CHAPTER_DEFINITIONS[ch - 1]
      : { icon: '🧭', title: 'Chapter ' + ch };

    var keyMap = { 1: 'plot', 2: 'crew_shed', 3: 'garden', 4: 'pond', 5: 'energy_storage', 6: 'juice_bar', 7: 'eco_passport', 8: 'space_mission' };
    var primaryKey = keyMap[ch] || 'plot';
    var isMobile = isMobileViewport();

    // 0. Purge all previous chapter scout locators, guide boxes, tick stars
    document.querySelectorAll('.chapter-explore-hand, .chapter-explore-locator, .scout-chapter-guide-msg-box, .chapter-explore-tick, .s2-field-survey-tick').forEach(function (node) {
      node.remove();
    });

    // Ensure active chapter locator beacon is attached to the target facility
    var targetEl = null;
    if (primaryKey === 'plot') {
      targetEl = isMobile
        ? (document.querySelector('[data-plot="1"]') || document.querySelector('[data-plot="0"]') || document.querySelector('.plot-spot'))
        : (document.querySelector('[data-plot="0"]') || document.querySelector('.plot-spot'));
    } else if (primaryKey === 'eco_passport') {
      targetEl = document.querySelector('[data-building="eco_passport"]') || document.querySelector('[data-building-key="eco_passport"]');
    } else if (primaryKey === 'space_mission') {
      targetEl = document.querySelector('[data-building="space_mission"]') || document.querySelector('[data-building-key="space_mission"]');
    } else {
      targetEl = document.querySelector('[data-building="' + primaryKey + '"]');
    }

    if (targetEl && !targetEl.querySelector('.chapter-explore-locator')) {
      var locWrap = document.createElement('div');
      locWrap.className = 'chapter-explore-hand chapter-explore-locator active-scout-beacon';
      locWrap.style.cssText = 'position:absolute;top:' + (isMobile ? '-46px' : '-78px') + ';left:50%;transform:translateX(-50%);z-index:45;display:flex;flex-direction:column;align-items:center;pointer-events:auto;touch-action:manipulation;white-space:nowrap;';
      locWrap.title = 'Scout Chapter ' + ch + ': ' + (def.title || '') + ' (Tap to survey +5 XP)';
      locWrap.onclick = function (e) {
        e.stopPropagation();
        if (typeof exploreChapterObject === 'function') exploreChapterObject(primaryKey);
      };
      locWrap.ontouchend = function (e) {
        e.stopPropagation();
        if (typeof exploreChapterObject === 'function') exploreChapterObject(primaryKey);
      };

      var guideHtml = '';
      if (!isMobile) {
        guideHtml =
          '<div class="scout-chapter-guide-msg-box" style="touch-action:manipulation;">' +
            '<span style="font-size:1.15rem;line-height:1;">🧭</span>' +
            '<div style="text-align:left;line-height:1.2;">' +
              '<div style="font-size:0.62rem;font-weight:900;color:#2E7D32;text-transform:uppercase;letter-spacing:0.4px;">Next Scout: Ch. ' + ch + '</div>' +
              '<div style="font-size:0.75rem;font-weight:900;color:#1B5E20;">' + (def.title || '') + ' <span style="background:#C8E6C9;color:#1B5E20;font-size:0.62rem;padding:1px 5px;border-radius:6px;margin-left:2px;">+5 XP</span></div>' +
            '</div>' +
            '<span style="font-size:0.76rem;color:#2E7D32;font-weight:900;margin-left:2px;">➔</span>' +
          '</div>';
      }

      var svgHtml = (typeof getDirectionalLocatorSvg === 'function')
        ? getDirectionalLocatorSvg(ch, def.title || '')
        : '<span style="font-size:1.8rem;">🧭</span>';

      locWrap.innerHTML =
        guideHtml +
        '<div style="position:relative;display:flex;flex-direction:column;align-items:center;">' +
          '<div class="locator-pulse-ring"></div>' +
          '<span class="locator-pill-tag">Ch. ' + ch + '</span>' +
          svgHtml +
        '</div>';

      targetEl.appendChild(locWrap);
    }

    // 1. Calculate exact touch and standing target for this chapter's scout marker
    var targets = getScoutMarkerTouchTarget(ch);
    var from = {
      left: parseFloat(el.style.left) || 72,
      top: parseFloat(el.style.top) || 48
    };

    // Smooth midpoint along meadow
    var mid = {
      left: (from.left + targets.standPoint.left) / 2 + (Math.random() * 3 - 1.5),
      top: (from.top + targets.standPoint.top) / 2 + (Math.random() * 2 - 1)
    };

    // 2. Avatar walks directly to the scout marker position at natural human walking speed
    var dist = Math.hypot(targets.standPoint.left - from.left, targets.standPoint.top - from.top);
    var walkDuration = Math.max(3400, Math.min(5800, Math.round(dist * 105)));

    walkPath(el, [from, mid, targets.standPoint], walkDuration, function () {
      if (!tourState.active) return;

      // 3. WONDER TOUCH: Arm reaches up to contact the scout marker!
      el.classList.add('wonder-touching');
      spawnTouchRipple(targets.touchPoint);

      // Sky Heading appears glided into the sky
      showSkyHeading(
        'Wonder Touch: Ch. ' + ch + ' ' + (def.title || '') + ' · ' + av.name,
        targets.standPoint,
        def.icon || '✨'
      );

      if (typeof SoundTrackEngine !== 'undefined') {
        try {
          SoundTrackEngine.playSFX('task');
        } catch (e) {}
      }

      // 4. Sequential reveals of transparent locked 3D objects (cyan 3D blueprints)
      showChapterGhosts(ch, true);

      // 5. Automatic exploration milestone and reward
      if (primaryKey && typeof exploreChapterObject === 'function') {
        try { exploreChapterObject(primaryKey); } catch (e) {}
      }
      if (typeof state !== 'undefined' && state) {
        state.exploredChapters = state.exploredChapters || {};
        state.exploredChapters[ch] = true;
        state.exploredChapterObjects = state.exploredChapterObjects || {};
        if (primaryKey) state.exploredChapterObjects[primaryKey] = true;
        if (typeof state.xp === 'number' && state.xp === 0) state.xp = 5;
      }
      renderExploredFieldBadge(ch, primaryKey);

      // On mobile, ensure no intrusive popup modals cover the Next button
      if (isMobile && typeof closeModal === 'function') {
        closeModal();
      }

      // 6. Open merged scout modal laid bottom side beside marketplace
      openTourModal(ch, null);

      // 7. Automatic cooldown activation upon wonder touch
      setTimeout(function () {
        el.classList.remove('wonder-touching');

        if (ch >= 8) {
          clearGhosts(true);
          endTour(false);
        } else {
          // Cooldown timer automatically active and visual on current place
          startScoutCooldown(ch, ch + 1);
        }
      }, 700);
    });
  }

  function walkToChapter(targetCh) {
    targetCh = parseInt(targetCh, 10);
    if (!targetCh || targetCh < 1 || targetCh > 8) return;
    hideHomeOverlay();
    if (!tourState.active) {
      tourState.active = true;
      tourState.skipped = false;
      var av = tourState.avatar || (typeof state !== 'undefined' && state.playerAvatar) || AVATAR_ROSTER[0];
      tourState.avatar = av;
      tourState.avatarId = av.id;
      spawnWalker(av, getFacilitySpot(targetCh));
    } else if (tourState.currentChapter === targetCh && (tourState.cooldownActive || (tourState.walkerEl && tourState.walkerEl.classList.contains('walking')))) {
      // Already actively on this chapter — do not restart cooldown loop
      return;
    }
    clearScoutCooldown();
    clearGhosts(true);
    if (tourState.walkerEl) {
      tourState.walkerEl.classList.remove('wonder-touching');
    }
    runChapterStep(targetCh);
  }

  function isTourActive() {
    return !!(tourState && tourState.active && !tourState.skipped);
  }

  // ---------------------------------------------------------------------------
  // Start Chapter Tour
  // ---------------------------------------------------------------------------
  function startChapterTour(av) {
    if (!av) av = tourState.avatar || AVATAR_ROSTER[0];
    tourState.active = true;
    tourState.skipped = false;
    tourState.avatar = av;
    tourState.avatarId = av.id;
    tourState.currentChapter = 1;

    persistAvatar(av);
    hideHomeOverlay();

    if (typeof switchScreen === 'function') {
      try { switchScreen('farm'); } catch (e) {}
    } else if (typeof window !== 'undefined' && typeof window.switchScreen === 'function') {
      try { window.switchScreen('farm'); } catch (e) {}
    }

    var gate = gateEntryPoint();
    var meadow = meadowEntryPoint();

    var el = spawnWalker(av, gate);
    if (!el) {
      endTour(true);
      return;
    }

    updateTourProgress(1);
    showSkyHeading(
      av.adjective + ' ' + av.name + ' enters through the gate!',
      { left: gate.left, top: gate.top - 6 },
      '⛩️'
    );

    // 1. Walk through the gate onto the green meadow at human walking pace
    var gateMeadowDist = Math.hypot(meadow.left - gate.left, meadow.top - gate.top);
    var gateMeadowDur = Math.max(2600, Math.round(gateMeadowDist * 110));
    walkPath(el, [gate, meadow], gateMeadowDur, function () {
      if (!tourState.active) return;
      showSkyHeading('Green meadow · follow Chapter 1 scout marker', meadow, '🌱');
      setTimeout(function () {
        runChapterStep(1);
      }, 350);
    });
  }

  // ---------------------------------------------------------------------------
  // Boot & Initialization Hook
  // ---------------------------------------------------------------------------
  function shouldShowHomeOverlay() {
    try {
      if (localStorage.getItem('searchO2_avatar_skipped') === '1') return false;
      if (localStorage.getItem('searchO2_selected_avatar')) return false;
    } catch (e) {}
    if (typeof state !== 'undefined' && state && state.playerAvatar && state.playerAvatar.id) return false;
    return true;
  }

  function maybeResumeAvatarOnFarm() {
    var av = loadPersistedAvatar();
    if (!av) return;
    tourState.avatar = av;
    tourState.avatarId = av.id;
    var scene = document.getElementById('fieldScene');
    if (!scene) return;
    var meadow = meadowEntryPoint();
    spawnWalker(av, meadow);
  }

  function bindFarmObjectsHoverModal() {
    if (typeof document === 'undefined') return;
    var selector = '[data-building], [data-storage], [data-turbine], [data-plot], .jute-tarp-spot-card, .main-road-canvas-badge, .main-road-paved-link';
    var buildings = document.querySelectorAll(selector);
    buildings.forEach(function (el) {
      if (el._hoverModalWired) return;
      el._hoverModalWired = true;
      var key = el.getAttribute('data-building');
      if (!key) {
        if (el.hasAttribute('data-storage')) key = 'storage';
        else if (el.hasAttribute('data-turbine')) key = el.getAttribute('data-turbine') || 'wind_turbine';
        else if (el.hasAttribute('data-plot')) key = 'plot';
        else if (el.classList.contains('jute-tarp-spot-card')) key = 'jute_tarp';
        else if (el.classList.contains('main-road-canvas-badge') || el.classList.contains('main-road-paved-link')) key = 'road';
      }
      if (!key) return;
      var ch = (typeof OBJECT_TO_CHAPTER !== 'undefined' && OBJECT_TO_CHAPTER[key]) || 1;
      el.addEventListener('mouseenter', function (e) {
        showObjectHoverModal(e, key, { key: key }, ch, el, false);
      });
      el.addEventListener('mouseleave', function () {
        hideObjectHoverModal();
      });
    });
  }

  function bootIntegration() {
    setTimeout(function () {
      if (shouldShowHomeOverlay()) {
        showHomeOverlay();
      } else {
        maybeResumeAvatarOnFarm();
      }
      bindFarmObjectsHoverModal();
      setInterval(bindFarmObjectsHoverModal, 2500);
    }, 800);
  }

  // Public Global API
  global.SearchO2HomeAvatar = {
    AVATAR_ROSTER: AVATAR_ROSTER,
    OBJECT_UNLOCK_SPECS: OBJECT_UNLOCK_SPECS,
    CHAPTER_TOUR_OBJECTS: CHAPTER_TOUR_OBJECTS,
    showHomeOverlay: showHomeOverlay,
    hideHomeOverlay: hideHomeOverlay,
    startChapterTour: startChapterTour,
    endTour: endTour,
    boot: bootIntegration,
    walkToNextScoutNow: walkToNextScoutNow,
    skipScoutCooldown: walkToNextScoutNow,
    isCooldownActive: function () {
      return !!(tourState.active && tourState.cooldownActive && tourState.cooldownRemaining > 0);
    },
    getCooldownRemaining: function () {
      return tourState.cooldownRemaining;
    },
    getTourState: function () {
      return tourState;
    },
    selectAvatar: function (id) {
      tourState.avatarId = id;
      tourState.avatar = AVATAR_ROSTER.find(function (a) { return a.id === id; }) || null;
      renderAvatarGrid();
    },
    getSelected: function () {
      return tourState.avatar;
    },
    getActiveCheckpoint: function () {
      return tourState.activeCheckpoint || null;
    },
    advanceTourCheckpoint: advanceTourCheckpoint,
    openTourModal: openTourModal,
    renderScoutCountdownFloater: renderScoutCountdownFloater,
    renderExploredFieldBadge: renderExploredFieldBadge,
    showChapterGhosts: showChapterGhosts,
    showObjectHoverModal: showObjectHoverModal,
    hideObjectHoverModal: hideObjectHoverModal,
    bindFarmObjectsHoverModal: bindFarmObjectsHoverModal,
    getScoutMarkerTouchTarget: getScoutMarkerTouchTarget,
    getFacilitySpot: getFacilitySpot,
    spawnWalker: spawnWalker,
    initAvatar: function (id, ch) {
      tourState.avatarId = id;
      tourState.avatar = AVATAR_ROSTER.find(function (a) { return a.id === id; }) || AVATAR_ROSTER[0];
      return spawnWalker(tourState.avatar, getFacilitySpot('plot'));
    },
    dockTopCapsules: dockTopCapsules,
    walkToChapter: walkToChapter,
    isTourActive: isTourActive,
    triggerJuteTarpDiggingSequence: triggerJuteTarpDiggingSequence,
    updateTourProgress: updateTourProgress,
    setAvatarRegionFilter: setAvatarRegionFilter,
    getPlotWorkSpot: getPlotWorkSpot,
    joinPlotTask: joinPlotTask,
    leavePlotTask: leavePlotTask,
    getActiveAvatarTask: getActiveAvatarTask,
    clearAvatarTask: clearAvatarTask,
    startPostExploration20sCooldown: startPostExploration20sCooldown,
    showUnlockCelebrationModal: showUnlockCelebrationModal,
    dismissUnlockModal: dismissUnlockModal,
    spawnDirtParticles: spawnDirtParticles,
    spawnWaterParticles: spawnWaterParticles,
    spawnSeedParticles: spawnSeedParticles,
    spawnHarvestParticles: spawnHarvestParticles,
    Globe: HomeAvatarGlobe,
    REGIONS: REGIONS,
    AVATAR_ROSTER: AVATAR_ROSTER
  };

  global.HomeAvatarGlobe = HomeAvatarGlobe;
  global.SearchO2HomeAvatar = SearchO2HomeAvatar;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootIntegration);
  } else {
    bootIntegration();
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
