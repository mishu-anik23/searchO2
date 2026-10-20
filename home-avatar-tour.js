/**
 * SearchO2 — Pure Volumetric 3D Isometric VR Asset System
 * Diverse Avatar Picker, Biome Cards & Scout-Touching Chapter Walking Tour
 * Integrates directly with CHAPTER_PRIMARY_OBJECTS, exploreChapterObject, animateAlongWaypoints
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------------------
  // 12 Diverse Pure Volumetric 3D Isometric Avatars
  // Age bands: 8-10, 11-15, 16-25, 26-40, 41-60, 61-90
  // ---------------------------------------------------------------------------
  var AVATAR_ROSTER = [
    {
      id: 'av_rio_boy',
      name: 'Rio',
      adjective: 'Curious',
      ageBand: '8-10',
      gender: 'boy',
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
      { key: 'garden', name: 'Companion Pollinator Garden', icon: '🌸' },
      { key: 'crop_field', name: 'Rotational 3-Bed Crop Field', icon: '🌾' },
      { key: 'garden_walk', name: 'Heritage Garden Boardwalk', icon: '🪵' }
    ],
    4: [
      { key: 'pond', name: '2-Basin Living Waters Lake', icon: '🐟' },
      { key: 'cattle_farm', name: 'Simmental Pasture & Barn', icon: '🐄' }
    ],
    5: [
      { key: 'wind_turbine', name: 'Dual High-Ridge Wind Turbines', icon: '💨' },
      { key: 'energy_storage', name: 'BESS Microgrid Substation', icon: '🔋' }
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

  var tourState = {
    active: false,
    avatarId: null,
    avatar: null,
    currentChapter: 1,
    walkerEl: null,
    ghostLayer: null,
    skipped: false,
    ageFilter: 'all'
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
      // Lighting Gradients for 3D Volumetric Depth
      '<radialGradient id="avG_' + avUniqueId + '_skin" cx="35%" cy="30%" r="65%">' +
        '<stop offset="0%" stop-color="' + shade(skin, 25) + '"/>' +
        '<stop offset="70%" stop-color="' + skin + '"/>' +
        '<stop offset="100%" stop-color="' + shade(skin, -25) + '"/>' +
      '</radialGradient>' +
      '<linearGradient id="avG_' + avUniqueId + '_top" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="' + shade(top, 25) + '"/>' +
        '<stop offset="50%" stop-color="' + top + '"/>' +
        '<stop offset="100%" stop-color="' + shade(top, -30) + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="avG_' + avUniqueId + '_bot" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="' + shade(bottom, 15) + '"/>' +
        '<stop offset="70%" stop-color="' + bottom + '"/>' +
        '<stop offset="100%" stop-color="' + shade(bottom, -35) + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="avG_' + avUniqueId + '_hair" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="' + shade(hair, 30) + '"/>' +
        '<stop offset="100%" stop-color="' + hair + '"/>' +
      '</linearGradient>' +
      '</defs>' +

      // 1. Volumetric Elliptical Ground Shadow
      '<ellipse class="av-shadow" cx="36" cy="90" rx="17" ry="5.5" fill="rgba(0,0,0,0.32)"/>' +

      // 2. Left Leg & Foot
      '<g class="av-leg-left">' +
        '<rect x="25" y="' + legY + '" width="8.5" height="' + legH + '" rx="3" fill="url(#avG_' + avUniqueId + '_bot)"/>' +
        // Shaded side facet
        '<path d="M25 ' + legY + ' L27 ' + legY + ' L27 ' + (legY + legH) + ' L25 ' + (legY + legH) + ' Z" fill="' + shade(bottom, -40) + '" opacity="0.4"/>' +
        // Shoe
        '<ellipse cx="28" cy="' + (legY + legH) + '" rx="5.5" ry="3" fill="#2E1C14"/>' +
      '</g>' +

      // 3. Right Leg & Foot
      '<g class="av-leg-right">' +
        '<rect x="38.5" y="' + legY + '" width="8.5" height="' + legH + '" rx="3" fill="url(#avG_' + avUniqueId + '_bot)"/>' +
        '<path d="M45 ' + legY + ' L47 ' + legY + ' L47 ' + (legY + legH) + ' L45 ' + (legY + legH) + ' Z" fill="' + shade(bottom, -40) + '" opacity="0.4"/>' +
        '<ellipse cx="44" cy="' + (legY + legH) + '" rx="5.5" ry="3" fill="#2E1C14"/>' +
      '</g>' +

      // 4. Volumetric Torso Prism
      '<g class="av-torso">' +
        // Main chest block
        '<path d="M22 ' + (torsoY + 3) + ' L36 ' + torsoY + ' L50 ' + (torsoY + 3) + ' L47 ' + (torsoY + torsoH) + ' L25 ' + (torsoY + torsoH) + ' Z" fill="url(#avG_' + avUniqueId + '_top)" stroke="' + shade(top, -35) + '" stroke-width="0.75"/>' +
        // Front highlight crease
        '<line x1="36" y1="' + torsoY + '" x2="36" y2="' + (torsoY + torsoH) + '" stroke="rgba(255,255,255,0.22)" stroke-width="1.2"/>' +
        // Accent belt/sash
        '<rect x="24" y="' + (torsoY + torsoH - 5.5) + '" width="24" height="4" rx="1.5" fill="' + accent + '"/>' +
      '</g>' +

      // 5. Left Arm (Counter Swing)
      '<g class="av-arm-left">' +
        '<rect x="15" y="' + (torsoY + 2) + '" width="7" height="17" rx="3.5" fill="url(#avG_' + avUniqueId + '_skin)" transform="rotate(8 18.5 ' + (torsoY + 10) + ')"/>' +
        // Sleeve cap
        '<rect x="15" y="' + (torsoY + 1) + '" width="7.5" height="7" rx="2.5" fill="url(#avG_' + avUniqueId + '_top)"/>' +
      '</g>' +

      // 6. Right Arm (Articulated for Wonder Touch Upward Reach)
      '<g class="av-arm-right">' +
        '<rect x="50" y="' + (torsoY + 2) + '" width="7" height="17" rx="3.5" fill="url(#avG_' + avUniqueId + '_skin)" transform="rotate(-8 53.5 ' + (torsoY + 10) + ')"/>' +
        '<rect x="49.5" y="' + (torsoY + 1) + '" width="7.5" height="7" rx="2.5" fill="url(#avG_' + avUniqueId + '_top)"/>' +
        // Fingertip spark point for wonder touch
        '<circle cx="53.5" cy="' + (torsoY + 18) + '" r="2" fill="' + shade(skin, 20) + '"/>' +
      '</g>' +

      // 7. Elder Walking Staff (If Elder Haruto)
      (av.id === 'av_haruto_man' ? '<line x1="58" y1="28" x2="60" y2="92" stroke="#8D6E63" stroke-width="2.2" stroke-linecap="round"/>' : '') +

      // 8. Volumetric Head & Face
      '<g class="av-head">' +
        // Neck
        '<rect x="33" y="' + (headY + headR - 3) + '" width="6" height="5" fill="' + shade(skin, -15) + '"/>' +
        // Head sphere
        '<circle cx="36" cy="' + headY + '" r="' + headR + '" fill="url(#avG_' + avUniqueId + '_skin)" stroke="' + shade(skin, -30) + '" stroke-width="0.65"/>' +
        // Hair / Headwear
        '<path d="M' + (36 - headR) + ' ' + (headY - 1) + ' Q36 ' + (headY - headR - 4) + ' ' + (36 + headR) + ' ' + (headY - 1) + ' Q36 ' + (headY - headR + 2) + ' ' + (36 - headR) + ' ' + (headY - 1) + ' Z" fill="url(#avG_' + avUniqueId + '_hair)"/>' +
        // Eyes
        '<circle cx="32" cy="' + (headY + 0.5) + '" r="1.4" fill="#1A1A1A"/>' +
        '<circle cx="40" cy="' + (headY + 0.5) + '" r="1.4" fill="#1A1A1A"/>' +
        '<circle cx="32.4" cy="' + (headY + 0.1) + '" r="0.55" fill="#FFF"/>' +
        '<circle cx="40.4" cy="' + (headY + 0.1) + '" r="0.55" fill="#FFF"/>' +
        // Smile
        '<path d="M33 ' + (headY + 4.5) + ' Q36 ' + (headY + 7) + ' 39 ' + (headY + 4.5) + '" fill="none" stroke="#5D4037" stroke-width="1.15" stroke-linecap="round"/>' +
      '</g>' +
      '</svg>'
    );
  }

  // ---------------------------------------------------------------------------
  // Volumetric 3D World Map SVG with Realistic Ocean & Land Colormap
  // ---------------------------------------------------------------------------
  function worldMapSvg() {
    return (
      '<svg class="s2-world-map-svg" viewBox="0 0 640 125" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +
      '<defs>' +
        // Deep Realistic Bathymetric Ocean Depth Gradients
        '<linearGradient id="s2OceanGrad" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#01579B"/>' +
          '<stop offset="35%" stop-color="#0277BD"/>' +
          '<stop offset="70%" stop-color="#0288D1"/>' +
          '<stop offset="100%" stop-color="#00695C"/>' +
        '</linearGradient>' +
        // Continental Topographic Lowland & Alpine Colormap
        '<linearGradient id="s2LandGrad" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#66BB6A"/>' +
          '<stop offset="40%" stop-color="#43A047"/>' +
          '<stop offset="85%" stop-color="#2E7D32"/>' +
          '<stop offset="100%" stop-color="#1B5E20"/>' +
        '</linearGradient>' +
        '<linearGradient id="s2DesertGrad" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#FFE082"/>' +
          '<stop offset="60%" stop-color="#FFB74D"/>' +
          '<stop offset="100%" stop-color="#F57C00"/>' +
        '</linearGradient>' +
        '<linearGradient id="s2AlpineGrad" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#ECEFF1"/>' +
          '<stop offset="40%" stop-color="#90A4AE"/>' +
          '<stop offset="100%" stop-color="#546E7A"/>' +
        '</linearGradient>' +
      '</defs>' +

      // 1. Oceanic Abyssal Water Base with Shelf Contours
      '<rect width="640" height="125" rx="10" fill="url(#s2OceanGrad)"/>' +
      // Subsea bathymetric shelf contours
      '<path d="M0 65 Q160 85 320 60 T640 75 L640 125 L0 125 Z" fill="rgba(0, 229, 255, 0.08)"/>' +
      '<path d="M0 90 Q180 110 360 85 T640 100 L640 125 L0 125 Z" fill="rgba(0, 230, 118, 0.06)"/>' +

      // 2. Continents: Americas
      '<g class="s2-continents" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.4))">' +
        // North America
        '<path d="M50 25 Q95 10 145 28 Q175 42 160 65 Q135 60 105 75 Q75 65 55 45 Z" fill="url(#s2LandGrad)"/>' +
        // Rocky Mountains spine
        '<path d="M78 28 Q88 45 92 65" stroke="url(#s2AlpineGrad)" stroke-width="2.5" fill="none" opacity="0.8"/>' +
        // South America
        '<path d="M125 70 Q160 68 168 95 Q150 120 135 122 Q120 105 125 70 Z" fill="url(#s2LandGrad)"/>' +
        // Amazon Basin lush core
        '<circle cx="145" cy="88" r="14" fill="#1B5E20" opacity="0.7"/>' +

        // Eurasia & Africa
        '<path d="M260 22 Q340 10 460 18 Q510 35 480 65 Q410 70 330 55 Q280 62 260 22 Z" fill="url(#s2LandGrad)"/>' +
        // Alps ridge
        '<path d="M295 38 Q315 36 335 42" stroke="url(#s2AlpineGrad)" stroke-width="2.8" fill="none"/>' +
        // Africa continent
        '<path d="M275 58 Q345 52 355 85 Q335 120 305 122 Q275 95 275 58 Z" fill="url(#s2LandGrad)"/>' +
        // Sahara Desert
        '<ellipse cx="312" cy="74" rx="34" ry="14" fill="url(#s2DesertGrad)"/>' +

        // Asia East & Southeast Archipelagos
        '<path d="M460 28 Q540 32 555 60 Q520 80 470 65 Z" fill="url(#s2LandGrad)"/>' +
        '<ellipse cx="505" cy="78" rx="28" ry="10" fill="url(#s2LandGrad)"/>' +

        // Australia
        '<path d="M525 85 Q575 80 585 102 Q555 118 525 110 Z" fill="url(#s2DesertGrad)"/>' +
      '</g>' +

      // 3. Active Farm & Biome Pins with Pulsing Beacons
      // Germany Central Eco Farm (Active Beacon)
      '<g class="s2-pin-germany" transform="translate(308, 36)">' +
        '<circle cx="0" cy="0" r="11" fill="none" stroke="#FFD54F" stroke-width="1.2" opacity="0.6">' +
          '<animate attributeName="r" values="4;14;4" dur="2.4s" repeatCount="indefinite"/>' +
          '<animate attributeName="opacity" values="0.8;0.1;0.8" dur="2.4s" repeatCount="indefinite"/>' +
        '</circle>' +
        '<circle cx="0" cy="0" r="5" fill="#FFD54F" stroke="#FFF" stroke-width="1.5"/>' +
        '<text x="0" y="-8" font-size="8.5" font-weight="900" fill="#FFF9C4" text-anchor="middle" filter="drop-shadow(0 1px 2px #000)">🇩🇪 Home Farm</text>' +
      '</g>' +

      // Bavaria Alpenhof Beacon
      '<g class="s2-pin-bavaria" transform="translate(322, 45)">' +
        '<circle cx="0" cy="0" r="3.8" fill="#81C784" stroke="#FFF" stroke-width="1.2"/>' +
        '<text x="0" y="10" font-size="7.5" font-weight="800" fill="#C8E6C9" text-anchor="middle">Alpenhof</text>' +
      '</g>' +

      // Saint Martin Blue Lab Beacon
      '<g class="s2-pin-caribbean" transform="translate(182, 64)">' +
        '<circle cx="0" cy="0" r="4.2" fill="#00E5FF" stroke="#FFF" stroke-width="1.2"/>' +
        '<text x="0" y="-7" font-size="7.5" font-weight="800" fill="#E0F7FA" text-anchor="middle">Blue Lab</text>' +
      '</g>' +

      // Brazil Amazon Beacon
      '<g class="s2-pin-brazil" transform="translate(145, 92)">' +
        '<circle cx="0" cy="0" r="3.8" fill="#69F0AE" stroke="#FFF" stroke-width="1"/>' +
        '<text x="0" y="9" font-size="7" font-weight="700" fill="#B9F6CA" text-anchor="middle">Amazon</text>' +
      '</g>' +

      // Sweden Taiga Beacon
      '<g class="s2-pin-sweden" transform="translate(320, 18)">' +
        '<circle cx="0" cy="0" r="3.5" fill="#80D8FF" stroke="#FFF" stroke-width="1"/>' +
        '<text x="0" y="-5" font-size="7" font-weight="700" fill="#E1F5FE" text-anchor="middle">Taiga</text>' +
      '</g>' +

      '<text x="16" y="116" font-size="7.5" font-weight="800" fill="rgba(224,242,241,0.85)">🌍 Realistic Ocean Bathymetry &amp; Topographic Colormap · Pure 3D Isometric Projection</text>' +
      '</svg>'
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
          '<div class="s2-world-map-card">' +
            '<div class="s2-world-map-inner">' +
              '<div class="s2-world-map-title">' +
                '<span>🌍 Planetary Biome Network · Ocean &amp; Land Colormap</span>' +
                '<span style="font-size:0.75rem;color:#81C784;">3D Isometric Elevation</span>' +
              '</div>' +
              worldMapSvg() +
              '<div class="s2-world-map-hint">Germany Eco Farm is your home meadow · survey chapters to unlock tools and global biomes</div>' +
            '</div>' +
          '</div>' +
          '<div class="s2-biome-row" id="s2BiomeRow">' + biomeCards + '</div>' +
          '<div class="s2-avatar-section-title">👤 Select Your 3D Explorer Avatar</div>' +
          '<div class="s2-avatar-section-sub">12 diverse characters in boys, girls, men &amp; women · ages 8–90 · regional dress · matching adjectives</div>' +
          '<div class="s2-age-filters" id="s2AgeFilters">' + ageChips + '</div>' +
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
      '</div>'
    );
  }

  function renderAvatarGrid() {
    var grid = document.getElementById('s2AvatarGrid');
    if (!grid) return;
    var filter = tourState.ageFilter || 'all';
    var list = AVATAR_ROSTER.filter(function (a) {
      return filter === 'all' || a.ageBand === filter;
    });
    grid.innerHTML = list.map(function (av) {
      var sel = tourState.avatarId === av.id ? ' selected' : '';
      return (
        '<button type="button" class="s2-avatar-card' + sel + '" data-avatar="' + av.id + '" aria-pressed="' + (sel ? 'true' : 'false') + '">' +
          '<div class="s2-avatar-figure">' + avatarFigureSvg(av, { w: 72, h: 96 }) + '</div>' +
          '<div class="s2-avatar-name">' + av.name + '</div>' +
          '<div class="s2-avatar-adj">' + av.adjective + '</div>' +
          '<div class="s2-avatar-meta">' + av.gender + ' · ' + av.ageBand + '</div>' +
          '<div class="s2-avatar-dress">' + av.dress + '</div>' +
        '</button>'
      );
    }).join('');

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

  function showHomeOverlay() {
    var existing = document.getElementById('s2HomeOverlay');
    if (!existing) {
      var wrap = document.createElement('div');
      wrap.innerHTML = buildHomeOverlayHtml();
      while (wrap.firstChild) {
        document.body.appendChild(wrap.firstChild);
      }
    }
    var overlay = document.getElementById('s2HomeOverlay');
    if (overlay) overlay.classList.remove('hidden');
    sprinkleStars();
    renderAvatarGrid();

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
    if (key === 'plot' && typeof PLOT_LAYOUT !== 'undefined' && PLOT_LAYOUT[0]) return PLOT_LAYOUT[0];
    if (typeof VILLAGE_LAYOUT !== 'undefined' && VILLAGE_LAYOUT[key]) return VILLAGE_LAYOUT[key];
    if (key === 'gate' && typeof GATE_SPOT !== 'undefined') return GATE_SPOT;
    if (key === 'crew_shed' && typeof CREW_SHED_SPOT !== 'undefined') return CREW_SHED_SPOT;
    if (key === 'storage' && typeof STORAGE_SPOT !== 'undefined') return STORAGE_SPOT;
    if (key === 'garage' && typeof GARAGE_SPOT !== 'undefined') return GARAGE_SPOT;
    if (key === 'wind_turbine' && typeof WIND_TURBINE_SPOT !== 'undefined') return WIND_TURBINE_SPOT;
    if (key === 'energy_storage' && typeof ENERGY_STORAGE_SPOT !== 'undefined') return ENERGY_STORAGE_SPOT;
    if (key === 'jute_tarp' && typeof JUTE_TARP_SPOT !== 'undefined') return JUTE_TARP_SPOT;
    if (key === 'eco_passport') return { top: 12, left: 77.5, w: 10.5, h: 22 };
    if (key === 'space_mission') return { top: 66, left: 77.5, w: 10.5, h: 22 };

    var fallbacks = {
      1: { top: 28, left: 24, w: 12, h: 20 },
      2: { top: 54, left: 8.5, w: 9.5, h: 18 },
      3: { top: 66, left: 32, w: 12, h: 22 },
      4: { top: 12, left: 32, w: 12, h: 22 },
      5: { top: 2, left: 19.5, w: 9, h: 21 },
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

  /**
   * Calculates the exact coordinates for the avatar to stand and touch the active scout marker.
   * Finds the actual DOM element of the scout marker (.chapter-explore-hand.chapter-explore-locator).
   */
  function getScoutMarkerTouchTarget(ch) {
    var scene = document.getElementById('fieldScene');
    if (scene) {
      var sceneRect = scene.getBoundingClientRect();
      var locator = scene.querySelector('.chapter-explore-hand.chapter-explore-locator');
      if (locator) {
        var locRect = locator.getBoundingClientRect();
        var centerX = locRect.left + locRect.width / 2;
        var bottomY = locRect.bottom;
        var leftPct = ((centerX - sceneRect.left) / sceneRect.width) * 100;
        var topPct = ((bottomY - sceneRect.top) / sceneRect.height) * 100;
        return {
          touchPoint: { left: leftPct, top: Math.max(4, topPct - 3) },
          standPoint: { left: leftPct, top: Math.min(88, topPct + 4) }
        };
      }
    }

    // Calibrated spatial coordinates matching facility locations
    var keyMap = {
      1: 'plot',
      2: 'crew_shed',
      3: 'garden',
      4: 'pond',
      5: 'wind_turbine',
      6: 'juice_bar',
      7: 'eco_passport',
      8: 'space_mission'
    };
    var key = keyMap[ch] || 'plot';
    var spot = getFacilitySpot(key);
    var centerX = (spot.left || 0) + (spot.w || 10) / 2;
    var centerY = (spot.top || 0) + (spot.h || 16) * 0.45;

    return {
      touchPoint: { left: centerX, top: Math.max(4, spot.top - 4) },
      standPoint: { left: centerX, top: Math.min(88, centerY) }
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

  function walkPath(el, points, durationMs, onDone) {
    if (!el || !points || points.length < 2) {
      if (onDone) onDone();
      return;
    }
    el.classList.add('walking');
    el.classList.remove('wonder-touching');

    if (typeof animateAlongWaypoints === 'function') {
      var wps = points.map(function (p) {
        return { x: p.left, y: p.top };
      });
      animateAlongWaypoints(el, wps, durationMs || 2600, function () {
        el.classList.remove('walking');
        if (onDone) onDone();
      });
      return;
    }

    // Smooth fallback linear interpolation
    var i = 0;
    function step() {
      i++;
      if (i >= points.length) {
        el.classList.remove('walking');
        if (onDone) onDone();
        return;
      }
      var prev = points[i - 1];
      var curr = points[i];
      var dur = Math.max(350, (durationMs || 2600) / (points.length - 1));
      var t0 = performance.now();

      var dx = curr.left - prev.left;
      if (dx > 0.4) el.style.transform = 'translate(-50%, -85%) scaleX(1)';
      else if (dx < -0.4) el.style.transform = 'translate(-50%, -85%) scaleX(-1)';

      function frame(now) {
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
    el.style.left = at.left + '%';
    el.style.top = Math.max(8, at.top - 10) + '%';
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

  function showChapterGhosts(ch, sequential) {
    var layer = ensureGhostLayer();
    if (!layer) return;
    clearGhosts(false);

    var objs = CHAPTER_TOUR_OBJECTS[ch] || [];
    objs.forEach(function (obj, idx) {
      var spot = getFacilitySpot(obj.key);
      if (!spot) return;

      var el = document.createElement('div');
      el.className = 's2-ghost-obj';
      el.style.left = spot.left + '%';
      el.style.top = spot.top + '%';
      el.style.width = (spot.w || 10) + '%';
      el.style.height = (spot.h || 16) + '%';
      el.innerHTML =
        '<div class="s2-ghost-body">' +
          '<span>' + (obj.icon || '🏗️') + '</span>' +
          '<span class="s2-ghost-lock">🔒</span>' +
        '</div>' +
        '<div class="s2-ghost-label">Ch. ' + ch + ' · ' + obj.name + '</div>';

      layer.appendChild(el);
      var delay = sequential ? 200 + idx * 260 : 60 + idx * 60;
      setTimeout(function () {
        el.classList.add('visible');
      }, delay);
    });
  }

  // ---------------------------------------------------------------------------
  // Chapter Roadmap Modal & Survey Progression
  // ---------------------------------------------------------------------------
  function openTourModal(ch, onContinue) {
    var modal = document.getElementById('s2TourModal');
    var card = document.getElementById('s2TourModalCard');
    if (!modal || !card) {
      if (onContinue) onContinue();
      return;
    }

    var def = (typeof CHAPTER_DEFINITIONS !== 'undefined' && CHAPTER_DEFINITIONS[ch - 1])
      ? CHAPTER_DEFINITIONS[ch - 1]
      : { icon: '🧭', title: 'Chapter ' + ch, desc: 'Survey the farm masterplan.' };

    var objs = CHAPTER_TOUR_OBJECTS[ch] || [];
    var names = objs.map(function (o) { return o.name; }).join(' · ');

    card.innerHTML =
      '<div class="tm-icon">' + (def.icon || '🧭') + '</div>' +
      '<h3>Chapter ' + ch + ' · ' + (def.title || '') + '</h3>' +
      '<p>' + (def.desc || 'Explore this zone of the farm.') + '</p>' +
      '<div class="tm-ghosts-note">' +
        '🔒 <b>Transparent Blueprint Models:</b><br/>' +
        '<span>' + (names || 'Farm structures') + '</span>' +
      '</div>' +
      '<button type="button" class="s2-btn-primary" id="s2TourContinue">✓ I explored it · Next ➔</button>';

    modal.classList.remove('hidden');

    var btn = document.getElementById('s2TourContinue');
    if (btn) {
      btn.onclick = function () {
        modal.classList.add('hidden');

        var keyMap = {
          1: 'plot',
          2: 'crew_shed',
          3: 'garden',
          4: 'pond',
          5: 'wind_turbine',
          6: 'juice_bar',
          7: 'eco_passport',
          8: 'space_mission'
        };
        var primaryKey = keyMap[ch];

        // Drive the actual SearchO2 exploration mechanics
        var exploreFn = (typeof exploreChapterObject === 'function')
          ? exploreChapterObject
          : ((typeof window !== 'undefined' && typeof window.exploreChapterObject === 'function') ? window.exploreChapterObject : null);

        if (primaryKey && exploreFn) {
          try {
            exploreFn(primaryKey);
          } catch (e) {}
        }
        if (typeof state !== 'undefined' && state) {
          state.exploredChapters = state.exploredChapters || {};
          state.exploredChapters[ch] = true;
          state.exploredChapterObjects = state.exploredChapterObjects || {};
          if (primaryKey) state.exploredChapterObjects[primaryKey] = true;
          if (typeof state.xp === 'number' && state.xp === 0) state.xp = 5;
        }

        if (typeof render === 'function') render();

        if (onContinue) onContinue();
      };
    }
  }

  function updateTourProgress(ch) {
    var pill = document.getElementById('s2TourProgress');
    var txt = document.getElementById('s2TourProgressText');
    if (pill) pill.classList.add('visible');
    if (txt) {
      var avName = tourState.avatar ? (tourState.avatar.adjective + ' ' + tourState.avatar.name) : 'Explorer';
      txt.textContent = '🧭 Chapter ' + ch + ' / 8 · ' + avName;
    }
  }

  function endTour(skipped) {
    tourState.active = false;
    tourState.skipped = !!skipped;
    clearGhosts(true);

    var pill = document.getElementById('s2TourProgress');
    if (pill) pill.classList.remove('visible');

    var modal = document.getElementById('s2TourModal');
    if (modal) modal.classList.add('hidden');

    var heading = document.getElementById('s2SkyHeading');
    if (heading && heading.parentNode) heading.parentNode.removeChild(heading);

    if (tourState.walkerEl) {
      tourState.walkerEl.classList.remove('walking', 'wonder-touching');
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

    var def = (typeof CHAPTER_DEFINITIONS !== 'undefined' && CHAPTER_DEFINITIONS[ch - 1])
      ? CHAPTER_DEFINITIONS[ch - 1]
      : { icon: '🧭', title: 'Chapter ' + ch };

    // 2. Avatar walks directly to the scout marker position
    walkPath(el, [from, mid, targets.standPoint], 1400 + ch * 50, function () {
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

      // 4. Sequential reveals of transparent locked 3D objects
      showChapterGhosts(ch, true);

      // 5. Open educational chapter modal
      setTimeout(function () {
        openTourModal(ch, function () {
          // 6. Ghosts vanish with particle sparkle
          clearGhosts(true);
          el.classList.remove('wonder-touching');

          // 7. Avatar turns and proceeds to next chapter scout marker
          setTimeout(function () {
            runChapterStep(ch + 1);
          }, 450);
        });
      }, 400 + (CHAPTER_TOUR_OBJECTS[ch] || []).length * 100);
    });
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

    // 1. Walk through the gate onto the green meadow
    walkPath(el, [gate, meadow], 1200, function () {
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

  function bootIntegration() {
    setTimeout(function () {
      if (shouldShowHomeOverlay()) {
        showHomeOverlay();
      } else {
        maybeResumeAvatarOnFarm();
      }
    }, 800);
  }

  // Public Global API
  global.SearchO2HomeAvatar = {
    AVATAR_ROSTER: AVATAR_ROSTER,
    showHomeOverlay: showHomeOverlay,
    hideHomeOverlay: hideHomeOverlay,
    startChapterTour: startChapterTour,
    endTour: endTour,
    boot: bootIntegration,
    selectAvatar: function (id) {
      tourState.avatarId = id;
      tourState.avatar = AVATAR_ROSTER.find(function (a) { return a.id === id; }) || null;
      renderAvatarGrid();
    },
    getSelected: function () {
      return tourState.avatar;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootIntegration);
  } else {
    bootIntegration();
  }
})(typeof window !== 'undefined' ? window : this);
