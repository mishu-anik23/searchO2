/**
 * SearchO2 — Shakir (Co-Founder & CEO) Tour for Guest Users
 * Implements Shakir, SearchO2 Co-Founder & CEO, as an interactive 3D Isometric Farm Guide.
 * 
 * Visuals grounded in C:\Users\AM\PycharmProjects\searchO2\shakir.html and shakir-img.jpg:
 * - 3D Anime messy spiky hair (#3D2314 with dimensional highlights)
 * - Layered explorer attire: Crisp white jacket (#F8FAFC) over grey undershirt (#9CA3AF)
 * - Signature SearchO2 CEO badge on chest strap: Golden ring (#EAB308) with emerald core (#22C55E)
 * - Royal navy blue backpack (#1E3A8A) with slate grey flap and straps
 * - Handheld high-tech cyan holographic scanner (#0EA5E9, screen #67E8F9)
 * - Farm cargo brown shorts (#78350F) with utility pocket
 * - Two-tone hiking boots: Dark brown lug sole (#3B2314) and forest green upper leather (#14532D)
 * - 4-way Isometric walking dynamics towards farm objects
 * - Wonder Touch with cyan scanner reach and contact ripple
 * - Cyan 3D blueprint reveals WITHOUT blueprint text
 * - Active scout cooldown with countdown floater & click-to-walk
 * - Warm, child-friendly CEO welcoming manner & educational dialogue
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------------------
  // Guest Detection Helper
  // ---------------------------------------------------------------------------
  function isGuestMode() {
    var u = (typeof global.apiUser !== 'undefined' && global.apiUser) ||
            (typeof global.window !== 'undefined' && global.window.apiUser);
    if (u) {
      if (u.role && u.role !== 'guest') return false;
      if (u.isGuest === false) return false;
    }
    try {
      var saved = JSON.parse(localStorage.getItem('searchO2_user') || 'null');
      if (saved && saved.role && saved.role !== 'guest') return false;
      if (saved && saved.isGuest === false) return false;
    } catch (e) {}
    try {
      var tok = localStorage.getItem('searchO2_token');
      if (tok && tok.length > 20) return false;
    } catch (e) {}
    return true;
  }

  // ---------------------------------------------------------------------------
  // Chapter Guide Definitions & Children-Friendly CEO Dialogue
  // ---------------------------------------------------------------------------
  var SHAKIR_CHAPTERS = {
    1: {
      chapter: 1,
      key: 'plot',
      title: 'The Living Soil & Seed Planting',
      landmark: 'Plot 1',
      icon: '🌱',
      skyIcon: '🌱',
      ceoGreeting: "👋 Hi there, Eco-Explorer! I'm Shakir, Co-Founder & CEO of SearchO2! Welcome to our green farm! Look right here at Plot 1 — healthy living soil is full of microscopic helpers. When we loosen the earth and plant our first tree, it drinks in fresh rainwater and pumps pure oxygen into our atmosphere! Tap Plot 1 to till the soil and sow your first seedling!",
      dialogSummary: "Plot 1 is your farm's starting soil bed. Till the soil to clear weeds and plant oxygen-giving trees!",
      funFact: "A single spoonful of healthy organic soil contains more helpful microbes than all humans on planet Earth!",
      actionTip: "Tap Plot 1 on the field to till the ground and plant a tree!"
    },
    2: {
      chapter: 2,
      key: 'crew_shed',
      title: 'Crew Headquarters & Teamwork',
      landmark: 'Crew Shed',
      icon: '🏡',
      skyIcon: '🏡',
      ceoGreeting: "🏡 Welcome to our Crew Headquarters! Growing an entire green forest takes wonderful teamwork! Here, caring eco-workers join our mission. When you hire workers, they help weed, water seedlings, and harvest produce while you take a break!",
      dialogSummary: "The Crew Shed houses your farming crew. Hired workers automate weeding, watering, and harvesting!",
      funFact: "Working together in eco-teams makes tree planting 3x faster and keeps our community thriving!",
      actionTip: "Visit the Crew Shed to hire eco-caretakers and automate your farm!"
    },
    3: {
      chapter: 3,
      key: 'garden',
      title: 'Biodiversity Garden & Pollinator Friends',
      landmark: 'Bio-Garden',
      icon: '🌸',
      skyIcon: '🌸',
      ceoGreeting: "🌸 Bzzz! Can you hear our friendly bees? This is our Biodiversity Garden! Blooming roses and nectar flowers attract gentle bees and colorful butterflies. They pollinate our orchard so our trees grow bigger, stronger, and full of sweet fruit!",
      dialogSummary: "The Bio-Garden attracts pollinators that boost fruit yield and improve farm reputation!",
      funFact: "One out of every three bites of food we eat depends directly on pollinating bees and butterflies!",
      actionTip: "Keep the garden blooming to attract pollinators and boost farm stars!"
    },
    4: {
      chapter: 4,
      key: 'pond',
      title: 'Crystal Eco-Pond & Fresh Water',
      landmark: 'Eco-Pond',
      icon: '💧',
      skyIcon: '💧',
      ceoGreeting: "💧 Splash! Water is pure magic for growing trees! Our eco-pond collects clean rainwater runoff from the meadows. With fresh water always ready, our seedlings will never get thirsty, even on the hottest summer afternoons!",
      dialogSummary: "The Eco-Pond stores fresh rainwater to irrigate all 6 farm plots throughout the seasons.",
      funFact: "Trees drink water from underground and gently evaporate moisture from their leaves to help create fresh rain clouds!",
      actionTip: "Build irrigation channels from the pond to automatically water your plots!"
    },
    5: {
      chapter: 5,
      key: 'energy_storage',
      title: 'Clean Energy Storage & Renewables',
      landmark: 'Solar & Wind BESS',
      icon: '⚡',
      skyIcon: '⚡',
      ceoGreeting: "⚡ High-tech green energy! Look at our battery storage and solar panels! All our water pumps and farm equipment run on 100% clean solar and wind energy. Zero smoke, zero pollution — pure green power for a brighter future!",
      dialogSummary: "The BESS (Battery Energy Storage System) stores clean solar and wind power for zero-emission farming.",
      funFact: "In just 60 minutes, the sun provides enough clean solar energy to power our entire world for a full year!",
      actionTip: "Store daylight solar energy in your battery to power night operations without brownouts!"
    },
    6: {
      chapter: 6,
      key: 'juice_bar',
      title: 'Organic Juice Bar & Healthy Harvest',
      landmark: 'Juice Bar',
      icon: '🍎',
      skyIcon: '🍎',
      ceoGreeting: "🍎 Yum! Cheers to healthy eating! When our fruit trees ripen, our organic juice bar turns sweet apples and berries into nutritious juices. Friendly villagers come by to enjoy healthy treats and support your farm with golden coins!",
      dialogSummary: "The Juice Bar transforms farm produce into artisan recipes, attracting eco-tourists and earning treasury income.",
      funFact: "Eating fresh locally grown organic fruit reduces food transportation carbon emissions to nearly zero!",
      actionTip: "Harvest ripe fruit from your trees to mix delicious artisan juice recipes!"
    },
    7: {
      chapter: 7,
      key: 'eco_passport',
      title: 'Global Eco-Passport & Planetary Biomes',
      landmark: 'Eco-Passport',
      icon: '🌍',
      skyIcon: '🌍',
      ceoGreeting: "🌍 Behold your official SearchO2 Eco-Passport! Our German farm is just the start of your global journey. As your farm thrives, you'll stamp your passport and unlock breathtaking biomes — from snowy Bavarian mountain meadows to tropical coral reefs in Saint Martin!",
      dialogSummary: "Your Eco-Passport tracks global restoration milestones and unlocks new planetary biomes across the globe.",
      funFact: "Earth has 14 diverse biomes, and every single one plays a vital role in balancing planetary climate!",
      actionTip: "Earn oxygen and reputation to unlock flights to Bavaria and Saint Martin!"
    },
    8: {
      chapter: 8,
      key: 'space_mission',
      title: 'Orbital Oxygen Shuttle & Terraforming',
      landmark: 'Space Shuttle',
      icon: '🚀',
      skyIcon: '🚀',
      ceoGreeting: "🚀 3... 2... 1... Liftoff! When our farm generates surplus clean oxygen, we compress canisters of pure atmospheric air onto orbital shuttles to supply space stations and help build green biodomes on the Moon and Mars! You are officially an Honorary Biosphere Custodian!",
      dialogSummary: "The Orbital Shuttle exports compressed oxygen canisters to space habitats, contributing to interplanetary terraforming.",
      funFact: "Scientists study closed-loop plant biospheres right now to prepare for human missions to Mars!",
      actionTip: "Maximize clean oxygen production to launch high-altitude eco-shuttle missions!"
    }
  };

  // ---------------------------------------------------------------------------
  // Shakir 3D Isometric SVG Generator (Matching shakir.html & shakir-img.jpg)
  // ---------------------------------------------------------------------------
  function renderShakirFigureSvg(opts) {
    opts = opts || {};
    var w = opts.w || 56;
    var h = opts.h || 104;
    var uid = opts.unique || 'shakir_' + Math.floor(Math.random() * 100000);

    return (
      '<svg class="walker-svg shakir-walker-svg" viewBox="0 0 72 108" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Shakir - SearchO2 CEO & Farm Guide">' +
        '<defs>' +
          // 1. Skin Gradients
          '<linearGradient id="shG_' + uid + '_skin" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#F5C7A9"/>' +
            '<stop offset="40%" stop-color="#DFA07A"/>' +
            '<stop offset="85%" stop-color="#C58562"/>' +
            '<stop offset="100%" stop-color="#A86B49"/>' +
          '</linearGradient>' +
          '<radialGradient id="shG_' + uid + '_cheeks" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#FF8A80" stop-opacity="0.55"/>' +
            '<stop offset="100%" stop-color="#FF8A80" stop-opacity="0"/>' +
          '</radialGradient>' +

          // 2. Hair Gradients (Textured Dark Chocolate with Anime Highlights)
          '<radialGradient id="shG_' + uid + '_hair" cx="35%" cy="25%" r="75%">' +
            '<stop offset="0%" stop-color="#5A3622"/>' +
            '<stop offset="45%" stop-color="#3D2314"/>' +
            '<stop offset="85%" stop-color="#24140A"/>' +
            '<stop offset="100%" stop-color="#140A05"/>' +
          '</radialGradient>' +
          '<linearGradient id="shG_' + uid + '_hairSpike" x1="0" y1="0" x2="0.8" y2="1">' +
            '<stop offset="0%" stop-color="#6B422B"/>' +
            '<stop offset="60%" stop-color="#3D2314"/>' +
            '<stop offset="100%" stop-color="#1E1008"/>' +
          '</linearGradient>' +

          // 3. Shirt Gradients (Crisp White Jacket over Slate Undershirt)
          '<linearGradient id="shG_' + uid + '_shirtWhite" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#FFFFFF"/>' +
            '<stop offset="60%" stop-color="#F1F5F9"/>' +
            '<stop offset="85%" stop-color="#E2E8F0"/>' +
            '<stop offset="100%" stop-color="#CBD5E1"/>' +
          '</linearGradient>' +
          '<linearGradient id="shG_' + uid + '_shirtGray" x1="0" y1="0" x2="0.8" y2="1">' +
            '<stop offset="0%" stop-color="#CBD5E1"/>' +
            '<stop offset="50%" stop-color="#94A3B8"/>' +
            '<stop offset="100%" stop-color="#64748B"/>' +
          '</linearGradient>' +

          // 4. Shorts Gradients (Farm Cargo Brown)
          '<linearGradient id="shG_' + uid + '_shorts" x1="0" y1="0" x2="0.7" y2="1">' +
            '<stop offset="0%" stop-color="#92400E"/>' +
            '<stop offset="45%" stop-color="#78350F"/>' +
            '<stop offset="85%" stop-color="#582408"/>' +
            '<stop offset="100%" stop-color="#3C1704"/>' +
          '</linearGradient>' +

          // 5. Boots Gradients (Two-Tone: Forest Green Upper & Dark Brown Lug Sole)
          '<linearGradient id="shG_' + uid + '_bootGreen" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#22C55E"/>' +
            '<stop offset="40%" stop-color="#166534"/>' +
            '<stop offset="85%" stop-color="#14532D"/>' +
            '<stop offset="100%" stop-color="#052E16"/>' +
          '</linearGradient>' +
          '<linearGradient id="shG_' + uid + '_bootSole" x1="0" y1="0" x2="0.6" y2="1">' +
            '<stop offset="0%" stop-color="#5D4037"/>' +
            '<stop offset="50%" stop-color="#3B2314"/>' +
            '<stop offset="100%" stop-color="#1B0F08"/>' +
          '</linearGradient>' +

          // 6. Backpack Gradients (Royal Navy Blue with Slate Flap)
          '<linearGradient id="shG_' + uid + '_bagBlue" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#2563EB"/>' +
            '<stop offset="50%" stop-color="#1E3A8A"/>' +
            '<stop offset="100%" stop-color="#0F172A"/>' +
          '</linearGradient>' +
          '<linearGradient id="shG_' + uid + '_bagFlap" x1="0" y1="0" x2="0.7" y2="1">' +
            '<stop offset="0%" stop-color="#64748B"/>' +
            '<stop offset="50%" stop-color="#475569"/>' +
            '<stop offset="100%" stop-color="#1E293B"/>' +
          '</linearGradient>' +

          // 7. High-Tech Cyan Gadget / Scanner
          '<linearGradient id="shG_' + uid + '_device" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#38BDF8"/>' +
            '<stop offset="50%" stop-color="#0EA5E9"/>' +
            '<stop offset="100%" stop-color="#0284C7"/>' +
          '</linearGradient>' +
          '<linearGradient id="shG_' + uid + '_screen" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#A5F3FC"/>' +
            '<stop offset="50%" stop-color="#67E8F9"/>' +
            '<stop offset="100%" stop-color="#22D3EE"/>' +
          '</linearGradient>' +

          // 8. SearchO2 CEO Badge (Gold Rim & Emerald Center)
          '<linearGradient id="shG_' + uid + '_badgeGold" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#FDE047"/>' +
            '<stop offset="50%" stop-color="#EAB308"/>' +
            '<stop offset="100%" stop-color="#A16207"/>' +
          '</linearGradient>' +
          '<radialGradient id="shG_' + uid + '_badgeGreen" cx="40%" cy="40%" r="65%">' +
            '<stop offset="0%" stop-color="#86EFAC"/>' +
            '<stop offset="50%" stop-color="#22C55E"/>' +
            '<stop offset="100%" stop-color="#15803D"/>' +
          '</radialGradient>' +

          // 9. Charcoal Technical Gloves
          '<linearGradient id="shG_' + uid + '_glove" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#475569"/>' +
            '<stop offset="50%" stop-color="#334155"/>' +
            '<stop offset="100%" stop-color="#1E293B"/>' +
          '</linearGradient>' +
        '</defs>' +

        // 1. Soft Volumetric Ground Shadow
        '<ellipse class="av-shadow" cx="36" cy="94" rx="19" ry="6" fill="rgba(15,23,42,0.32)"/>' +
        '<ellipse class="av-shadow-core" cx="36" cy="94.5" rx="11" ry="3.5" fill="rgba(15,23,42,0.22)"/>' +

        // 2. Left Leg & Forest Green Hiking Boot
        '<g class="av-leg-left">' +
          // Brown Cargo Shorts Leg
          '<rect x="23" y="58" width="9.5" height="13" rx="3.5" fill="url(#shG_' + uid + '_shorts)"/>' +
          // Skin Knee
          '<rect x="24.5" y="69" width="7" height="9" rx="2" fill="url(#shG_' + uid + '_skin)"/>' +
          // Dark Charcoal Ribbed Sock
          '<rect x="24" y="76" width="7.8" height="5.5" rx="1.5" fill="#1F2937"/>' +
          '<line x1="24.5" y1="78" x2="31.5" y2="78" stroke="#374151" stroke-width="0.75"/>' +
          // 3D Forest Green Boot Upper
          '<path d="M22.5 80 L33.5 80 L34.5 88 L21.5 88 Z" fill="url(#shG_' + uid + '_bootGreen)" stroke="#052E16" stroke-width="0.6"/>' +
          // Boot Toe Cap
          '<path d="M21 86 Q28 89.5 35 86 L35 89 Q28 92.5 21 89 Z" fill="#14532D" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>' +
          // Lug Sole (Dark Brown Rubber)
          '<path d="M20.5 89 L35.5 89 L35 92.5 L21 92.5 Z" fill="url(#shG_' + uid + '_bootSole)"/>' +
        '</g>' +

        // 3. Right Leg & Forest Green Hiking Boot (Slightly Forward Stride)
        '<g class="av-leg-right">' +
          // Brown Cargo Shorts Leg
          '<rect x="39" y="58" width="9.5" height="13" rx="3.5" fill="url(#shG_' + uid + '_shorts)"/>' +
          // Cargo Pocket Detail on Right Hip
          '<rect x="46" y="61" width="3.2" height="6" rx="1.2" fill="#582408" stroke="#3C1704" stroke-width="0.5"/>' +
          // Skin Knee
          '<rect x="40.5" y="69" width="7" height="9" rx="2" fill="url(#shG_' + uid + '_skin)"/>' +
          // Dark Charcoal Ribbed Sock
          '<rect x="40" y="76" width="7.8" height="5.5" rx="1.5" fill="#1F2937"/>' +
          '<line x1="40.5" y1="78" x2="47.5" y2="78" stroke="#374151" stroke-width="0.75"/>' +
          // 3D Forest Green Boot Upper
          '<path d="M38.5 80 L49.5 80 L50.5 88 L37.5 88 Z" fill="url(#shG_' + uid + '_bootGreen)" stroke="#052E16" stroke-width="0.6"/>' +
          // Boot Toe Cap
          '<path d="M37 86 Q44 89.5 51 86 L51 89 Q44 92.5 37 89 Z" fill="#14532D" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>' +
          // Lug Sole (Dark Brown Rubber)
          '<path d="M36.5 89 L51.5 89 L51 92.5 L37 92.5 Z" fill="url(#shG_' + uid + '_bootSole)"/>' +
        '</g>' +

        // 4. Volumetric Torso Prism (Supports Front & Back 2.5D Isometric 360°)
        '<g class="av-torso">' +
          // --- Back View (Facing North / Facing Away) ---
          '<g class="av-torso-back">' +
            // Base White Jacket Back
            '<path d="M21 34 L36 31 L51 34 L48 59 L24 59 Z" fill="url(#shG_' + uid + '_shirtWhite)" stroke="#CBD5E1" stroke-width="0.75"/>' +
            // Full Royal Navy Blue Backpack
            '<g class="av-backpack">' +
              // Backpack Drop Shadow
              '<rect x="23" y="33" width="26" height="23" rx="4.5" fill="rgba(15,23,42,0.35)"/>' +
              // Main Blue Body
              '<rect x="24" y="32" width="24" height="22" rx="4" fill="url(#shG_' + uid + '_bagBlue)" stroke="#0F172A" stroke-width="0.8"/>' +
              // Top Slate Flap
              '<path d="M23.5 32 Q36 30 48.5 32 L47.5 38.5 Q36 36.5 24.5 38.5 Z" fill="url(#shG_' + uid + '_bagFlap)" stroke="#1E293B" stroke-width="0.6"/>' +
              // Outer Pocket
              '<rect x="27.5" y="42" width="17" height="10" rx="2.5" fill="url(#shG_' + uid + '_bagBlue)" stroke="#1E293B" stroke-width="0.6"/>' +
              // Dual Shoulder Straps
              '<line x1="28" y1="32" x2="28" y2="54" stroke="#475569" stroke-width="1.8"/>' +
              '<line x1="44" y1="32" x2="44" y2="54" stroke="#475569" stroke-width="1.8"/>' +
              // Rolled Explorer Bedroll below pack
              '<rect x="23.5" y="53" width="25" height="4.5" rx="2.2" fill="#14532D" stroke="#052E16" stroke-width="0.6"/>' +
            '</g>' +
          '</g>' +

          // --- Front View (Facing South / Facing Camera) ---
          '<g class="av-torso-front">' +
            // Inner Grey Undershirt Collar
            '<path d="M30 33 L36 38 L42 33 Z" fill="url(#shG_' + uid + '_shirtGray)"/>' +
            // Main White Adventure Jacket
            '<path d="M21 34 L36 31 L51 34 L48 59 L24 59 Z" fill="url(#shG_' + uid + '_shirtWhite)" stroke="#CBD5E1" stroke-width="0.8"/>' +
            // Lit Shoulder Yoke Facets
            '<polygon class="av-torso-yoke" points="22,34 36,31 50,34 46,38 26,38" fill="#FFFFFF" opacity="0.65"/>' +
            // Left Shaded Flank / Right Lit Flank
            '<polygon class="av-torso-flank-left" points="21,34 26,38 28,59 24,59" fill="#CBD5E1" opacity="0.55"/>' +
            '<polygon class="av-torso-flank-right" points="51,34 46,38 44,59 48,59" fill="#FFFFFF" opacity="0.45"/>' +
            // Center Zip Seam
            '<line x1="36" y1="31" x2="36" y2="54" stroke="#94A3B8" stroke-width="1.1"/>' +

            // Backpack Straps on Chest
            '<line x1="27" y1="34" x2="27" y2="56" stroke="#475569" stroke-width="2.2"/>' +
            '<line x1="45" y1="34" x2="45" y2="56" stroke="#475569" stroke-width="2.2"/>' +

            // Signature SearchO2 CEO Badge (Gold rim + Emerald core with clean eco leaf)
            '<g class="shakir-ceo-badge" transform="translate(42, 40)">' +
              '<circle cx="4" cy="4" r="4.2" fill="url(#shG_' + uid + '_badgeGold)" stroke="#78350F" stroke-width="0.5"/>' +
              '<circle cx="4" cy="4" r="3.1" fill="url(#shG_' + uid + '_badgeGreen)"/>' +
              '<circle cx="3.2" cy="3.2" r="1.1" fill="#FFFFFF" opacity="0.6"/>' +
            '</g>' +

            // Cargo Shorts Waistband & Gold Buckle
            '<rect x="23" y="55" width="26" height="5" rx="1.5" fill="url(#shG_' + uid + '_shorts)"/>' +
            '<rect x="33.5" y="54.5" width="5" height="5.5" rx="1.2" fill="#EAB308" stroke="#CA8A04" stroke-width="0.6"/>' +
          '</g>' +
        '</g>' +

        // 5. Left Arm (Relaxed Counter-Swing with Charcoal Technical Glove)
        '<g class="av-arm-left">' +
          // White Sleeve
          '<rect x="13.5" y="33" width="8" height="9" rx="3" fill="url(#shG_' + uid + '_shirtWhite)" stroke="#CBD5E1" stroke-width="0.6"/>' +
          // Grey Undershirt Forearm
          '<rect x="14" y="41" width="7" height="12" rx="2.5" fill="url(#shG_' + uid + '_shirtGray)"/>' +
          // Charcoal Technical Glove
          '<rect x="13.5" y="52" width="8" height="7.5" rx="2.8" fill="url(#shG_' + uid + '_glove)" stroke="#1E293B" stroke-width="0.5"/>' +
          '<circle cx="15.5" cy="54" r="0.8" fill="#64748B"/>' +
        '</g>' +

        // 6. Right Arm (Holding High-Tech Cyan Scanning PDA / Gadget)
        '<g class="av-arm-right shakir-scanner-arm">' +
          // White Sleeve
          '<rect x="50.5" y="33" width="8" height="9" rx="3" fill="url(#shG_' + uid + '_shirtWhite)" stroke="#CBD5E1" stroke-width="0.6"/>' +
          // Grey Undershirt Forearm
          '<rect x="51" y="41" width="7" height="11" rx="2.5" fill="url(#shG_' + uid + '_shirtGray)"/>' +
          // Charcoal Technical Glove
          '<rect x="50.5" y="50" width="8" height="7.5" rx="2.8" fill="url(#shG_' + uid + '_glove)" stroke="#1E293B" stroke-width="0.5"/>' +

          // High-Tech Handheld Cyan Scanner / Tracker (from shakir.html lines 322-328)
          '<g class="shakir-device" transform="translate(48, 52)">' +
            // Chassis Box
            '<rect x="0" y="2" width="12" height="16" rx="2.8" fill="url(#shG_' + uid + '_device)" stroke="#0284C7" stroke-width="0.7"/>' +
            // Holographic Screen
            '<rect x="1.5" y="3.5" width="9" height="10" rx="1.5" fill="url(#shG_' + uid + '_screen)" stroke="#0369A1" stroke-width="0.5"/>' +
            // Holographic Scan Grid & Data Blips
            '<line x1="2" y1="6.5" x2="9.5" y2="6.5" stroke="#FFFFFF" stroke-width="0.6" opacity="0.8"/>' +
            '<line x1="2" y1="9.5" x2="9.5" y2="9.5" stroke="#FFFFFF" stroke-width="0.6" opacity="0.6"/>' +
            '<circle cx="4" cy="5" r="0.8" fill="#16A34A"/>' +
            '<circle cx="7.5" cy="5" r="0.8" fill="#22C55E"/>' +
            // Antenna / Sensor Lens
            '<rect x="4.5" y="0" width="3" height="2.5" rx="1" fill="#38BDF8"/>' +
            '<circle cx="6" cy="1" r="0.75" fill="#67E8F9"/>' +
          '</g>' +
        '</g>' +

        // 7. Volumetric Head, Messy Anime Hair Spikes & Welcoming Face
        '<g class="av-head">' +
          // --- Back View (Facing North) ---
          '<g class="av-head-back">' +
            // Neck nape
            '<path d="M32 28 L40 28 L40 33 L32 33 Z" fill="#C58562"/>' +
            // Base Hair Dome
            '<circle cx="36" cy="20" r="13" fill="url(#shG_' + uid + '_hair)" stroke="#1E1008" stroke-width="0.7"/>' +
            // Rear Anime Hair Spikes
            '<polygon points="26,16 23,8 30,12" fill="url(#shG_' + uid + '_hairSpike)"/>' +
            '<polygon points="32,13 36,5 40,13" fill="url(#shG_' + uid + '_hairSpike)"/>' +
            '<polygon points="42,14 48,8 45,17" fill="url(#shG_' + uid + '_hairSpike)"/>' +
            '<polygon points="23,22 17,16 25,18" fill="url(#shG_' + uid + '_hairSpike)"/>' +
            '<polygon points="47,20 54,16 47,24" fill="url(#shG_' + uid + '_hairSpike)"/>' +
          '</g>' +

          // --- Front View (Facing South / Facing Camera) ---
          '<g class="av-head-front">' +
            // Neck
            '<path d="M32 28 L40 28 L40 33 L32 33 Z" fill="url(#shG_' + uid + '_skin)"/>' +
            // 3D Isometric Ears
            '<path class="av-ear-left" d="M22 19 Q18 21.5 22 24.5 Z" fill="#C58562" stroke="#A86B49" stroke-width="0.5"/>' +
            '<path class="av-ear-right" d="M50 19 Q54 21.5 50 24.5 Z" fill="#DFA07A" stroke="#C58562" stroke-width="0.5"/>' +

            // Main Head Dome
            '<circle cx="36" cy="20" r="12.5" fill="url(#shG_' + uid + '_skin)" stroke="#C58562" stroke-width="0.6"/>' +

            // Cheerful CEO Eyes (Big, friendly anime style with double specular catches)
            '<g class="av-face-features">' +
              // Left Eye
              '<ellipse cx="31.5" cy="20.5" rx="2.3" ry="2.7" fill="#1E293B"/>' +
              '<circle cx="31" cy="19.5" r="1" fill="#FFFFFF"/>' +
              '<circle cx="32.5" cy="21.5" r="0.5" fill="#FFFFFF"/>' +
              '<path d="M29.5 16.5 Q32 15 34.5 17" fill="none" stroke="#3D2314" stroke-width="1.1" stroke-linecap="round"/>' +

              // Right Eye
              '<ellipse cx="40.5" cy="20.5" rx="2.3" ry="2.7" fill="#1E293B"/>' +
              '<circle cx="40" cy="19.5" r="1" fill="#FFFFFF"/>' +
              '<circle cx="41.5" cy="21.5" r="0.5" fill="#FFFFFF"/>' +
              '<path d="M37.5 17 Q40 15 42.5 16.5" fill="none" stroke="#3D2314" stroke-width="1.1" stroke-linecap="round"/>' +

              // Cute Rounded Nose
              '<path d="M35 21.5 Q36 23.5 37 21.5" fill="none" stroke="#C58562" stroke-width="1.1" stroke-linecap="round"/>' +

              // Cheerful Welcoming CEO Smile
              '<path d="M32 24.5 Q36 27.5 40 24.5" fill="none" stroke="#5A3622" stroke-width="1.5" stroke-linecap="round"/>' +

              // Rosy Friendly Cheeks
              '<circle cx="28.5" cy="23.5" r="2.4" fill="url(#shG_' + uid + '_cheeks)"/>' +
              '<circle cx="43.5" cy="23.5" r="2.4" fill="url(#shG_' + uid + '_cheeks)"/>' +
            '</g>' +

            // Iconic Messy Spiky Hair Structure (Front Volume & Dimensional Spikes from shakir.html)
            '<g class="shakir-hair-front">' +
              // Hair Cap
              '<path d="M23 18 Q36 7 49 18 Q47 13 41 12 Q36 8 30 11 Q25 14 23 18 Z" fill="url(#shG_' + uid + '_hair)"/>' +

              // Dimensional Spikes pointing outward and upward
              // Left top spike
              '<polygon points="26,14 21,5 29,10" fill="url(#shG_' + uid + '_hairSpike)"/>' +
              // Center-left high spike
              '<polygon points="29,11 31,3 36,9" fill="url(#shG_' + uid + '_hairSpike)"/>' +
              // Center-right high spike
              '<polygon points="35,9 40,3 42,10" fill="url(#shG_' + uid + '_hairSpike)"/>' +
              // Right top spike
              '<polygon points="42,10 49,6 45,15" fill="url(#shG_' + uid + '_hairSpike)"/>' +
              // Left side spike framing face
              '<polygon points="23,17 18,13 24,20" fill="url(#shG_' + uid + '_hairSpike)"/>' +
              // Right side spike framing face
              '<polygon points="48,17 53,13 47,21" fill="url(#shG_' + uid + '_hairSpike)"/>' +

              // Front Messy Bangs curling over forehead
              '<path d="M24 16 Q28 20 31 16 Q35 22 39 16 Q43 21 47 16" fill="none" stroke="url(#shG_' + uid + '_hairSpike)" stroke-width="3" stroke-linecap="round"/>' +
            '</g>' +
          '</g>' +
        '</g>' +
      '</svg>'
    );
  }

  // ---------------------------------------------------------------------------
  // Shakir Guide State Management
  // ---------------------------------------------------------------------------
  var guideState = {
    active: false,
    currentChapter: 1,
    cooldownActive: false,
    cooldownRemaining: 0,
    cooldownTimer: null,
    experienceUpdateTimer: null,
    walkerEl: null,
    speechBubbleEl: null,
    currentWalkToken: 0,
    dialogOpen: false
  };

  // ---------------------------------------------------------------------------
  // Ensure DOM Styles for Shakir & CEO Dialogs
  // ---------------------------------------------------------------------------
  function ensureShakirStyles() {
    if (document.getElementById('s2ShakirGuideStyles')) return;
    var style = document.createElement('style');
    style.id = 's2ShakirGuideStyles';
    style.textContent = [
      // Shakir Walker Container
      '.s2-shakir-guide {',
      '  position: absolute;',
      '  z-index: 50;',
      '  pointer-events: auto;',
      '  cursor: pointer;',
      '  transform: translate(-50%, -85%);',
      '  transition: filter 0.25s cubic-bezier(0.2, 0.9, 0.3, 1);',
      '  will-change: left, top, transform;',
      '  user-select: none;',
      '}',
      '.s2-shakir-guide:hover {',
      '  filter: drop-shadow(0 6px 16px rgba(14, 165, 233, 0.55)) brightness(1.05);',
      '}',

      // Shakir Head Badge
      '.shakir-head-tag {',
      '  position: absolute;',
      '  top: -30px;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '  background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);',
      '  color: #FFFFFF;',
      '  border: 1.5px solid #7DD3FC;',
      '  border-radius: 999px;',
      '  padding: 3px 10px;',
      '  font-size: 0.68rem;',
      '  font-weight: 900;',
      '  font-family: Nunito, system-ui, sans-serif;',
      '  white-space: nowrap;',
      '  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 5px;',
      '  pointer-events: none;',
      '  animation: shakirTagFloat 2.6s ease-in-out infinite;',
      '}',
      '@keyframes shakirTagFloat {',
      '  0%, 100% { transform: translateX(-50%) translateY(0); }',
      '  50% { transform: translateX(-50%) translateY(-3px); }',
      '}',

      // Floating Speech Bubble
      '.shakir-speech-bubble {',
      '  position: absolute;',
      '  bottom: 105%;',
      '  left: 50%;',
      '  transform: translateX(-50%) scale(1);',
      '  background: #FFFFFF;',
      '  color: #0F172A;',
      '  border: 2px solid #38BDF8;',
      '  border-radius: 16px;',
      '  padding: 8px 14px;',
      '  font-size: 0.76rem;',
      '  font-weight: 800;',
      '  font-family: Nunito, system-ui, sans-serif;',
      '  line-height: 1.35;',
      '  box-shadow: 0 8px 24px rgba(14, 165, 233, 0.28);',
      '  width: max-content;',
      '  max-width: 250px;',
      '  text-align: center;',
      '  z-index: 60;',
      '  pointer-events: auto;',
      '  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1);',
      '}',
      '.shakir-speech-bubble:after {',
      '  content: "";',
      '  position: absolute;',
      '  top: 100%;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '  border-width: 7px;',
      '  border-style: solid;',
      '  border-color: #38BDF8 transparent transparent transparent;',
      '}',
      '.shakir-speech-bubble.hidden {',
      '  opacity: 0;',
      '  transform: translateX(-50%) scale(0.85);',
      '  pointer-events: none;',
      '}',

      // Directional Headings (360° Isometric Visual Perspective)
      '.s2-shakir-guide.facing-north .av-torso-front,',
      '.s2-shakir-guide.facing-north .av-head-front { display: none !important; }',
      '.s2-shakir-guide.facing-north .av-torso-back,',
      '.s2-shakir-guide.facing-north .av-head-back { display: block !important; }',
      '.s2-shakir-guide.facing-south .av-torso-back,',
      '.s2-shakir-guide.facing-south .av-head-back { display: none !important; }',
      '.s2-shakir-guide.facing-south .av-torso-front,',
      '.s2-shakir-guide.facing-south .av-head-front { display: block !important; }',
      '.s2-shakir-guide:not(.facing-north) .av-torso-back,',
      '.s2-shakir-guide:not(.facing-north) .av-head-back { display: none; }',
      '.s2-shakir-guide:not(.facing-north) .av-torso-front,',
      '.s2-shakir-guide:not(.facing-north) .av-head-front { display: block; }',

      '.s2-shakir-guide.facing-east .walker-svg { transform: scaleX(-1); }',
      '.s2-shakir-guide.facing-west .walker-svg { transform: scaleX(1); }',

      // Natural Human Walking Animation Dynamics
      '.s2-shakir-guide.walking .shakir-walker-svg {',
      '  animation: shakirWalkBob 0.6s ease-in-out infinite alternate;',
      '}',
      '@keyframes shakirWalkBob {',
      '  0% { transform: translateY(0); }',
      '  100% { transform: translateY(-5px); }',
      '}',
      '.s2-shakir-guide.walking .av-leg-left {',
      '  transform-origin: 27px 58px;',
      '  animation: shakirLegSwingLeft 0.6s ease-in-out infinite alternate;',
      '}',
      '.s2-shakir-guide.walking .av-leg-right {',
      '  transform-origin: 43px 58px;',
      '  animation: shakirLegSwingRight 0.6s ease-in-out infinite alternate;',
      '}',
      '@keyframes shakirLegSwingLeft {',
      '  0% { transform: rotate(-18deg) translateY(-2px); }',
      '  100% { transform: rotate(18deg) translateY(2px); }',
      '}',
      '@keyframes shakirLegSwingRight {',
      '  0% { transform: rotate(18deg) translateY(2px); }',
      '  100% { transform: rotate(-18deg) translateY(-2px); }',
      '}',
      '.s2-shakir-guide.walking .av-arm-left {',
      '  transform-origin: 17px 34px;',
      '  animation: shakirArmSwingLeft 0.6s ease-in-out infinite alternate;',
      '}',
      '@keyframes shakirArmSwingLeft {',
      '  0% { transform: rotate(20deg); }',
      '  100% { transform: rotate(-20deg); }',
      '}',
      '.s2-shakir-guide.walking .shakir-scanner-arm {',
      '  transform-origin: 54px 34px;',
      '  animation: shakirArmSwingRight 0.6s ease-in-out infinite alternate;',
      '}',
      '@keyframes shakirArmSwingRight {',
      '  0% { transform: rotate(-15deg) translateY(-1px); }',
      '  100% { transform: rotate(10deg) translateY(1px); }',
      '}',

      // Wonder Touch Animation (Articulated Arm reaches upward with glowing cyan scanner)
      '.s2-shakir-guide.wonder-touching .shakir-scanner-arm {',
      '  transform-origin: 54px 34px;',
      '  animation: shakirWonderReach 0.9s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;',
      '}',
      '@keyframes shakirWonderReach {',
      '  0% { transform: rotate(0); }',
      '  50% { transform: rotate(-110deg) translateY(-8px) scale(1.08); }',
      '  100% { transform: rotate(-100deg) translateY(-6px) scale(1.05); }',
      '}',
      '.s2-shakir-guide.wonder-touching .shakir-device {',
      '  filter: drop-shadow(0 0 10px #38BDF8) drop-shadow(0 0 20px #67E8F9);',
      '}',
      '.s2-shakir-guide.wonder-touching .av-head {',
      '  transform-origin: 36px 28px;',
      '  transform: rotate(8deg) translateY(-2px);',
      '  transition: transform 0.4s ease;',
      '}',

      // Hide blueprint text everywhere for guest mode
      '.s2-ghost-obj .s2-ghost-blueprint-tag {',
      '  display: none !important;',
      '}',

      // Shakir CEO Welcoming Dialog Modal
      '.shakir-modal-backdrop {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 99990;',
      '  background: rgba(11, 31, 42, 0.68);',
      '  backdrop-filter: blur(4px);',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 16px;',
      '  overflow-y: auto;',
      '  -webkit-overflow-scrolling: touch;',
      '  box-sizing: border-box;',
      '  animation: shakirFadeIn 0.25s ease;',
      '}',
      '@keyframes shakirFadeIn {',
      '  from { opacity: 0; }',
      '  to { opacity: 1; }',
      '}',
      '.shakir-modal-card {',
      '  background: linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%);',
      '  border: 2.5px solid #38BDF8;',
      '  border-radius: 24px;',
      '  max-width: 480px;',
      '  width: 100%;',
      '  max-height: calc(100dvh - 32px);',
      '  overflow-y: auto;',
      '  -webkit-overflow-scrolling: touch;',
      '  overscroll-behavior: contain;',
      '  box-sizing: border-box;',
      '  padding: 24px;',
      '  box-shadow: 0 20px 48px rgba(14, 165, 233, 0.25), 0 8px 16px rgba(0, 0, 0, 0.12);',
      '  color: #1E293B;',
      '  font-family: Nunito, system-ui, sans-serif;',
      '  position: relative;',
      '  animation: shakirCardPop 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);',
      '}',
      '@keyframes shakirCardPop {',
      '  from { transform: scale(0.92) translateY(12px); opacity: 0; }',
      '  to { transform: scale(1) translateY(0); opacity: 1; }',
      '}',
      '.shakir-modal-header {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 14px;',
      '  margin-bottom: 16px;',
      '}',
      '.shakir-avatar-preview {',
      '  width: 58px;',
      '  height: 58px;',
      '  border-radius: 50%;',
      '  background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%);',
      '  border: 2px solid #0EA5E9;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);',
      '  flex-shrink: 0;',
      '  overflow: hidden;',
      '}',
      '.shakir-modal-title {',
      '  font-size: 1.15rem;',
      '  font-weight: 900;',
      '  color: #0369A1;',
      '  line-height: 1.2;',
      '}',
      '.shakir-modal-subtitle {',
      '  font-size: 0.74rem;',
      '  font-weight: 800;',
      '  color: #0284C7;',
      '  letter-spacing: 0.3px;',
      '}',
      '.shakir-modal-body {',
      '  font-size: 0.88rem;',
      '  line-height: 1.5;',
      '  color: #334155;',
      '  margin-bottom: 18px;',
      '  background: #FFFFFF;',
      '  border: 1.5px solid #E2E8F0;',
      '  border-radius: 16px;',
      '  padding: 14px 16px;',
      '}',
      '.shakir-fun-fact-box {',
      '  background: #FEF3C7;',
      '  border: 1.5px solid #FCD34D;',
      '  border-radius: 14px;',
      '  padding: 10px 12px;',
      '  font-size: 0.78rem;',
      '  color: #92400E;',
      '  margin-bottom: 18px;',
      '  display: flex;',
      '  align-items: flex-start;',
      '  gap: 8px;',
      '  line-height: 1.4;',
      '}',
      '.shakir-modal-actions {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: 10px;',
      '}',
      '.shakir-btn-primary {',
      '  flex: 1;',
      '  min-width: 140px;',
      '  background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);',
      '  color: #FFFFFF;',
      '  border: none;',
      '  border-radius: 14px;',
      '  padding: 12px 18px;',
      '  font-weight: 900;',
      '  font-size: 0.86rem;',
      '  cursor: pointer;',
      '  box-shadow: 0 6px 18px rgba(2, 132, 199, 0.35);',
      '  transition: transform 0.15s ease, box-shadow 0.15s ease;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 6px;',
      '}',
      '.shakir-btn-primary:hover {',
      '  transform: translateY(-2px);',
      '  box-shadow: 0 8px 24px rgba(2, 132, 199, 0.45);',
      '}',
      '.shakir-btn-secondary {',
      '  background: #F1F5F9;',
      '  color: #475569;',
      '  border: 1.5px solid #CBD5E1;',
      '  border-radius: 14px;',
      '  padding: 10px 14px;',
      '  font-weight: 800;',
      '  font-size: 0.82rem;',
      '  cursor: pointer;',
      '  transition: all 0.15s ease;',
      '}',
      '.shakir-btn-secondary:hover {',
      '  background: #E2E8F0;',
      '  color: #1E293B;',
      '}',
      // Tour Navigation HUD Dock (Meaningful Navigation)
      '.shakir-tour-nav-dock {',
      '  position: fixed;',
      '  top: 72px;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '  z-index: 9200;',
      '  background: rgba(15, 23, 42, 0.92);',
      '  backdrop-filter: blur(8px);',
      '  border: 1.5px solid #38BDF8;',
      '  border-radius: 16px;',
      '  padding: 8px 14px;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 12px;',
      '  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35), 0 0 12px rgba(56, 189, 248, 0.3);',
      '  color: #FFF;',
      '  font-family: Nunito, system-ui, sans-serif;',
      '  animation: shakirNavSlide 0.3s ease;',
      '}',
      '@keyframes shakirNavSlide {',
      '  from { transform: translate(-50%, -15px); opacity: 0; }',
      '  to { transform: translate(-50%, 0); opacity: 1; }',
      '}',
      '.shakir-nav-info {',
      '  display: flex;',
      '  flex-direction: column;',
      '  min-width: 130px;',
      '}',
      '.shakir-nav-tag {',
      '  font-size: 0.65rem;',
      '  font-weight: 800;',
      '  color: #38BDF8;',
      '  letter-spacing: 0.5px;',
      '  text-transform: uppercase;',
      '}',
      '.shakir-nav-landmark {',
      '  font-size: 0.84rem;',
      '  font-weight: 900;',
      '  color: #F8FAFC;',
      '}',
      '.shakir-nav-btn-group {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '}',
      '.shakir-nav-btn {',
      '  background: #1E293B;',
      '  color: #E2E8F0;',
      '  border: 1px solid #475569;',
      '  border-radius: 8px;',
      '  padding: 6px 10px;',
      '  font-size: 0.78rem;',
      '  font-weight: 800;',
      '  cursor: pointer;',
      '  transition: all 0.2s;',
      '  white-space: nowrap;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 4px;',
      '}',
      '.shakir-nav-btn:hover {',
      '  background: #0284C7;',
      '  color: #FFF;',
      '  border-color: #38BDF8;',
      '}',
      '.shakir-nav-btn.primary {',
      '  background: #0284C7;',
      '  color: #FFF;',
      '  border-color: #38BDF8;',
      '}',
      '.shakir-nav-btn.danger {',
      '  background: #7F1D1D;',
      '  color: #FECACA;',
      '  border-color: #EF4444;',
      '}',
      '.shakir-nav-btn.danger:hover {',
      '  background: #DC2626;',
      '  color: #FFF;',
      '}',
      '.shakir-nav-ch-badge {',
      '  display: none;',
      '}',
      '.shakir-retrigger-pill {',
      '  display: none !important;',
      '}',
      '.shakir-roadmap-list {',
      '  display: grid;',
      '  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));',
      '  gap: 8px;',
      '  max-height: 240px;',
      '  overflow-y: auto;',
      '  -webkit-overflow-scrolling: touch;',
      '  touch-action: pan-y;',
      '  padding: 6px 2px;',
      '  margin: 10px 0;',
      '}',
      '.shakir-roadmap-item {',
      '  background: #F8FAFC;',
      '  border: 1.5px solid #E2E8F0;',
      '  border-radius: 10px;',
      '  padding: 8px 10px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  cursor: pointer;',
      '  transition: all 0.18s;',
      '}',
      '.shakir-roadmap-item:hover {',
      '  background: #F0F9FF;',
      '  border-color: #38BDF8;',
      '  transform: translateY(-1px);',
      '}',
      '.shakir-roadmap-item.active {',
      '  background: #E0F2FE;',
      '  border-color: #0284C7;',
      '}',
      '.shakir-modal-close {',
      '  position: absolute;',
      '  top: 14px;',
      '  right: 14px;',
      '  background: #F1F5F9;',
      '  border: none;',
      '  color: #64748B;',
      '  width: 32px;',
      '  height: 32px;',
      '  border-radius: 50%;',
      '  cursor: pointer;',
      '  font-size: 1rem;',
      '  font-weight: 800;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '}',
      '@media (max-width: 640px), (max-height: 520px) {',
      '  .shakir-modal-backdrop {',
      '    padding: 6px 8px !important;',
      '    align-items: center !important;',
      '    justify-content: center !important;',
      '    overflow-y: auto !important;',
      '    -webkit-overflow-scrolling: touch !important;',
      '  }',
      '  .shakir-modal-card {',
      '    padding: 12px 14px 16px !important;',
      '    border-radius: 16px !important;',
      '    max-width: min(94vw, 420px) !important;',
      '    max-height: calc(100dvh - 20px) !important;',
      '    margin: auto !important;',
      '    overflow-y: auto !important;',
      '    -webkit-overflow-scrolling: touch !important;',
      '    overscroll-behavior: contain !important;',
      '    box-sizing: border-box !important;',
      '    width: 100% !important;',
      '  }',
      '  .shakir-modal-header {',
      '    margin-bottom: 8px !important;',
      '    gap: 8px !important;',
      '  }',
      '  .shakir-avatar-preview {',
      '    width: 36px !important;',
      '    height: 36px !important;',
      '  }',
      '  .shakir-avatar-preview svg {',
      '    width: 30px !important;',
      '    height: 54px !important;',
      '  }',
      '  .shakir-modal-title {',
      '    font-size: 0.88rem !important;',
      '    line-height: 1.2 !important;',
      '  }',
      '  .shakir-modal-subtitle {',
      '    font-size: 0.65rem !important;',
      '  }',
      '  .shakir-modal-body {',
      '    padding: 8px 10px !important;',
      '    margin-bottom: 8px !important;',
      '    font-size: 0.74rem !important;',
      '    line-height: 1.35 !important;',
      '    border-radius: 12px !important;',
      '  }',
      '  .shakir-modal-body p {',
      '    font-size: 0.78rem !important;',
      '    margin: 0 0 4px 0 !important;',
      '  }',
      '  .shakir-fun-fact-box {',
      '    padding: 6px 8px !important;',
      '    margin-bottom: 8px !important;',
      '    font-size: 0.70rem !important;',
      '    line-height: 1.3 !important;',
      '    border-radius: 10px !important;',
      '    gap: 6px !important;',
      '  }',
      '  .shakir-roadmap-list {',
      '    grid-template-columns: 1fr !important;',
      '    gap: 5px !important;',
      '    max-height: 180px !important;',
      '    margin: 6px 0 !important;',
      '    padding: 2px !important;',
      '    overflow-y: auto !important;',
      '    -webkit-overflow-scrolling: touch !important;',
      '    touch-action: pan-y !important;',
      '  }',
      '  .shakir-roadmap-item {',
      '    padding: 6px 8px !important;',
      '    border-radius: 8px !important;',
      '    gap: 6px !important;',
      '    display: flex !important;',
      '    align-items: center !important;',
      '    justify-content: space-between !important;',
      '  }',
      '  .shakir-roadmap-item .roadmap-item-title {',
      '    font-size: 0.74rem !important;',
      '    font-weight: 800 !important;',
      '    line-height: 1.2 !important;',
      '    word-break: break-word !important;',
      '  }',
      '  .shakir-roadmap-item .roadmap-item-desc {',
      '    font-size: 0.64rem !important;',
      '    line-height: 1.25 !important;',
      '    display: -webkit-box !important;',
      '    -webkit-line-clamp: 2 !important;',
      '    -webkit-box-orient: vertical !important;',
      '    overflow: hidden !important;',
      '  }',
      '  .shakir-roadmap-item .roadmap-item-action {',
      '    font-size: 0.66rem !important;',
      '    white-space: nowrap !important;',
      '    flex-shrink: 0 !important;',
      '  }',
      '  .shakir-modal-actions {',
      '    display: flex !important;',
      '    flex-wrap: wrap !important;',
      '    gap: 6px !important;',
      '    margin-top: 8px !important;',
      '  }',
      '  .shakir-btn-primary {',
      '    padding: 8px 12px !important;',
      '    font-size: 0.76rem !important;',
      '    border-radius: 10px !important;',
      '    min-width: 110px !important;',
      '    flex: 1 !important;',
      '  }',
      '  .shakir-btn-secondary {',
      '    padding: 7px 10px !important;',
      '    font-size: 0.74rem !important;',
      '    border-radius: 10px !important;',
      '  }',
      '  .shakir-modal-close {',
      '    width: 28px !important;',
      '    height: 28px !important;',
      '    font-size: 0.85rem !important;',
      '    top: 8px !important;',
      '    right: 8px !important;',
      '  }',
      '  /* Mobile tour navigation: Icon-based horizontal bar right on top of cooldown icon floater */',
      '  .shakir-tour-nav-dock {',
      '    position: fixed !important;',
      '    top: auto !important;',
      '    left: auto !important;',
      '    right: 12px !important;',
      '    bottom: 146px !important;',
      '    transform: none !important;',
      '    width: auto !important;',
      '    max-width: calc(100vw - 24px) !important;',
      '    padding: 3px 6px !important;',
      '    gap: 4px !important;',
      '    border-radius: 9999px !important;',
      '    background: rgba(15, 23, 42, 0.94) !important;',
      '    border: 1.5px solid #38BDF8 !important;',
      '    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 10px rgba(56, 189, 248, 0.3) !important;',
      '    z-index: 99998 !important;',
      '    animation: none !important;',
      '    display: flex !important;',
      '    align-items: center !important;',
      '  }',
      '  .shakir-nav-info {',
      '    display: none !important;',
      '  }',
      '  .shakir-tour-nav-dock .nav-text {',
      '    display: none !important;',
      '  }',
      '  .shakir-nav-btn-group {',
      '    display: flex !important;',
      '    align-items: center !important;',
      '    gap: 3px !important;',
      '  }',
      '  .shakir-nav-btn {',
      '    padding: 4px 6px !important;',
      '    font-size: 0.76rem !important;',
      '    min-width: 28px !important;',
      '    height: 28px !important;',
      '    border-radius: 8px !important;',
      '    display: inline-flex !important;',
      '    align-items: center !important;',
      '    justify-content: center !important;',
      '  }',
      '  .shakir-nav-ch-badge {',
      '    display: inline-flex !important;',
      '    align-items: center !important;',
      '    justify-content: center !important;',
      '    background: rgba(56, 189, 248, 0.2) !important;',
      '    border: 1px solid rgba(56, 189, 248, 0.4) !important;',
      '    border-radius: 6px !important;',
      '    padding: 2px 5px !important;',
      '    font-size: 0.68rem !important;',
      '    font-weight: 900 !important;',
      '    color: #38BDF8 !important;',
      '    white-space: nowrap !important;',
      '    height: 24px !important;',
      '  }',
      '  .s2-shakir-guide {',
      '    transform: translate(-50%, -85%) scale(0.88);',
      '  }',
      '  .shakir-head-tag {',
      '    top: -22px;',
      '    font-size: 0.60rem;',
      '    padding: 2px 7px;',
      '  }',
      '  .shakir-speech-bubble {',
      '    font-size: 0.70rem;',
      '    padding: 6px 10px;',
      '    max-width: 210px;',
      '    bottom: 102%;',
      '  }',
      '  .shakir-retrigger-pill {',
      '    display: none !important;',
      '  }',
      '}',
      '@media (max-height: 520px) and (orientation: landscape) {',
      '  .shakir-tour-nav-dock {',
      '    bottom: 82px !important;',
      '    right: 10px !important;',
      '  }',
      '  .shakir-modal-card {',
      '    max-height: calc(100dvh - 12px) !important;',
      '    padding: 8px 12px 12px !important;',
      '  }',
      '  .shakir-roadmap-list {',
      '    grid-template-columns: repeat(2, 1fr) !important;',
      '    max-height: 105px !important;',
      '    gap: 4px !important;',
      '  }',
      '  .shakir-modal-body {',
      '    padding: 6px 8px !important;',
      '    margin-bottom: 6px !important;',
      '    font-size: 0.70rem !important;',
      '  }',
      '  .shakir-fun-fact-box {',
      '    padding: 4px 6px !important;',
      '    margin-bottom: 6px !important;',
      '    font-size: 0.66rem !important;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Layer & Spawn Helpers
  // ---------------------------------------------------------------------------
  function ensureWalkerLayer() {
    var scene = document.getElementById('fieldScene');
    if (!scene) return null;
    var layer = document.getElementById('s2WalkerLayer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 's2WalkerLayer';
      layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:48;';
      scene.appendChild(layer);
    }
    return layer;
  }

  function spawnShakirWalker(at) {
    var layer = ensureWalkerLayer();
    if (!layer) return null;

    // Remove existing old player avatar if any exists
    var oldPlayer = document.getElementById('s2PlayerAvatar');
    if (oldPlayer && oldPlayer.parentNode) {
      oldPlayer.parentNode.removeChild(oldPlayer);
    }

    // Remove existing Shakir if present
    var oldShakir = document.getElementById('s2ShakirGuide');
    if (oldShakir && oldShakir.parentNode) {
      oldShakir.parentNode.removeChild(oldShakir);
    }

    var el = document.createElement('div');
    el.className = 's2-shakir-guide human-walker-sprite facing-south';
    el.id = 's2ShakirGuide';
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Shakir - SearchO2 Co-Founder & CEO');

    var posLeft = (at && typeof at.left === 'number') ? at.left : 48;
    var posTop = (at && typeof at.top === 'number') ? at.top : 42;
    el.style.left = posLeft + '%';
    el.style.top = posTop + '%';

    el.innerHTML =
      '<div class="shakir-head-tag"><span>🧑‍💼 Shakir (Co-Founder & CEO)</span></div>' +
      '<div class="shakir-speech-bubble" id="s2ShakirBubble">👋 Hi Explorer! I\'m Shakir, SearchO2 CEO! Let\'s tour our farm!</div>' +
      renderShakirFigureSvg({ w: 56, h: 104, unique: 'shakir_farm' });

    layer.appendChild(el);
    guideState.walkerEl = el;
    guideState.speechBubbleEl = el.querySelector('#s2ShakirBubble');

    // Clicking Shakir opens his friendly CEO Dialogue
    el.onclick = function (e) {
      e.stopPropagation();
      openShakirDialogue();
    };

    return el;
  }

  // ---------------------------------------------------------------------------
  // Speech Bubble Controller
  // ---------------------------------------------------------------------------
  var bubbleTimeout = null;
  function showShakirSpeechBubble(text, durationMs) {
    var bubble = guideState.speechBubbleEl || document.getElementById('s2ShakirBubble');
    if (!bubble) return;
    bubble.innerHTML = text;
    bubble.classList.remove('hidden');

    if (bubbleTimeout) clearTimeout(bubbleTimeout);
    if (durationMs) {
      bubbleTimeout = setTimeout(function () {
        if (bubble) bubble.classList.add('hidden');
      }, durationMs);
    }
  }

  function hideShakirSpeechBubble() {
    var bubble = guideState.speechBubbleEl || document.getElementById('s2ShakirBubble');
    if (bubble) bubble.classList.add('hidden');
  }

  // ---------------------------------------------------------------------------
  // Path Animation & Waypoint Navigation
  // ---------------------------------------------------------------------------
  function walkPath(el, points, durationMs, onDone) {
    if (!el || !points || points.length < 2) {
      if (onDone) onDone();
      return;
    }
    var myWalkToken = ++guideState.currentWalkToken;
    el.__walkToken = myWalkToken;
    el.classList.add('walking');
    el.classList.remove('wonder-touching');
    guideState.isWalking = true;

    if (typeof global.animateAlongWaypoints === 'function') {
      var wps = points.map(function (p) {
        return { x: p.left, y: p.top };
      });
      global.animateAlongWaypoints(el, wps, durationMs || 3600, function () {
        if (el.__walkToken !== myWalkToken) return;
        el.classList.remove('walking');
        el.style.transform = 'translate(-50%, -85%)';
        guideState.isWalking = false;
        if (onDone) onDone();
      });
      return;
    }

    // Smooth fallback linear interpolation with heading dynamics
    var i = 0;
    function step() {
      if (el.__walkToken !== myWalkToken) return;
      i++;
      if (i >= points.length) {
        el.classList.remove('walking');
        el.style.transform = 'translate(-50%, -85%)';
        guideState.isWalking = false;
        if (onDone) onDone();
        return;
      }
      var prev = points[i - 1];
      var curr = points[i];
      var dur = Math.max(350, (durationMs || 3600) / (points.length - 1));
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
      if (dx > 0.25) {
        el.classList.add('facing-east');
        el.classList.remove('facing-west');
      } else if (dx < -0.25) {
        el.classList.add('facing-west');
        el.classList.remove('facing-east');
      }

      function tickAnim(t) {
        if (el.__walkToken !== myWalkToken) return;
        var p = Math.min(1, (t - t0) / dur);
        var curX = prev.left + dx * p;
        var curY = prev.top + dy * p;
        el.style.left = curX + '%';
        el.style.top = curY + '%';
        if (p < 1) {
          requestAnimationFrame(tickAnim);
        } else {
          step();
        }
      }
      requestAnimationFrame(tickAnim);
    }
    step();
  }

  // ---------------------------------------------------------------------------
  // Wonder Touch & Touch Ripple
  // ---------------------------------------------------------------------------
  function spawnTouchRipple(at) {
    if (global.SearchO2HomeAvatar && typeof global.SearchO2HomeAvatar.spawnTouchRipple === 'function') {
      try {
        global.SearchO2HomeAvatar.spawnTouchRipple(at);
        return;
      } catch (e) {}
    }
    var scene = document.getElementById('fieldScene');
    if (!scene) return;
    var ripple = document.createElement('div');
    ripple.className = 's2-touch-ripple';
    ripple.style.left = at.left + '%';
    ripple.style.top = at.top + '%';
    ripple.innerHTML =
      '<svg viewBox="0 0 64 64" width="64" height="64">' +
        '<circle cx="32" cy="32" r="16" fill="none" stroke="#38BDF8" stroke-width="3" opacity="0.9"/>' +
        '<circle cx="32" cy="32" r="26" fill="none" stroke="#22C55E" stroke-width="2" stroke-dasharray="4 3"/>' +
        '<polygon points="32,12 36,26 50,32 36,38 32,52 28,38 14,32 28,26" fill="#A5F3FC"/>' +
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
  // Cooldown System (Same Cooldown as Avatar Tour)
  // ---------------------------------------------------------------------------
  function clearCooldown() {
    if (guideState.cooldownTimer) {
      clearInterval(guideState.cooldownTimer);
      guideState.cooldownTimer = null;
    }
    guideState.cooldownActive = false;
    guideState.cooldownRemaining = 0;

    var pill = document.getElementById('s2CooldownIconPill');
    if (pill) pill.classList.add('hidden');
    var popModal = document.getElementById('s2CooldownPopModal');
    if (popModal) popModal.classList.add('hidden');
  }

  function startCooldown(fromCh, nextCh) {
    clearCooldown();
    guideState.cooldownActive = true;
    guideState.cooldownRemaining = 45;

    // Use or build floater pill
    if (global.SearchO2HomeAvatar && typeof global.SearchO2HomeAvatar.renderScoutCountdownFloater === 'function') {
      try {
        global.SearchO2HomeAvatar.renderScoutCountdownFloater(fromCh, nextCh, 45);
      } catch (e) {}
    }

    renderShakirCooldownPill(fromCh, nextCh);

    guideState.cooldownTimer = setInterval(function () {
      guideState.cooldownRemaining--;
      var rem = guideState.cooldownRemaining;
      updateShakirCooldownDisplay(rem, nextCh);

      if (rem <= 0) {
        clearCooldown();
        showShakirSpeechBubble('Ready for our next adventure! Tap to walk! ➔', 4000);
      }
    }, 1000);
  }

  function renderShakirCooldownPill(fromCh, nextCh) {
    var pill = document.getElementById('s2CooldownIconPill');
    if (!pill) {
      if (global.SearchO2HomeAvatar && typeof global.SearchO2HomeAvatar.renderScoutCountdownFloater === 'function') {
        global.SearchO2HomeAvatar.renderScoutCountdownFloater(fromCh, nextCh, 45);
        pill = document.getElementById('s2CooldownIconPill');
      }
    }
    if (pill) {
      pill.classList.remove('hidden');
      var tag = pill.querySelector('.scf-time-tag') || pill.querySelector('.scf-desc');
      if (tag) tag.textContent = '45s · Next Landmark';
      var title = pill.querySelector('.scf-title');
      if (title) title.textContent = '🧑‍💼 Shakir (Co-Founder & CEO)';

      pill.onclick = function (e) {
        e.stopPropagation();
        walkToNextChapter();
      };
    }
  }

  function updateShakirCooldownDisplay(rem, nextCh) {
    var pill = document.getElementById('s2CooldownIconPill');
    if (pill) {
      var tag = pill.querySelector('.scf-time-tag') || pill.querySelector('.scf-desc');
      if (tag) tag.textContent = rem + 's · Ch. ' + (nextCh <= 8 ? nextCh : 1);
    }
    var popModal = document.getElementById('s2CooldownPopModal');
    if (popModal) {
      var timerVal = popModal.querySelector('#s2CooldownTimerVal');
      if (timerVal) timerVal.textContent = rem + 's';
    }
  }

  // ---------------------------------------------------------------------------
  // Ensure Farm Screen is Active & Visible (Immediate transition from Guest Mode)
  // ---------------------------------------------------------------------------
  function ensureFarmScreenActive() {
    if (typeof global.switchScreen === 'function') {
      try { global.switchScreen('farm'); } catch (e) {}
    } else if (typeof window !== 'undefined' && typeof window.switchScreen === 'function') {
      try { window.switchScreen('farm'); } catch (e) {}
    }
    var fScreen = document.getElementById('farmScreen');
    var rScreen = document.getElementById('regionScreen');
    if (rScreen) rScreen.style.display = 'none';
    if (fScreen) fScreen.style.display = 'block';
    if (typeof global.currentScreen !== 'undefined') global.currentScreen = 'farm';
  }

  function isMobileViewport() {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 860 || window.innerHeight <= 520 ||
      (window.matchMedia && window.matchMedia('(max-width: 860px), (max-height: 520px), (pointer: coarse)').matches);
  }

  // ---------------------------------------------------------------------------
  // Walk to Chapter Guided Tour
  // ---------------------------------------------------------------------------
  function walkToChapter(targetCh) {
    targetCh = parseInt(targetCh, 10);
    if (!targetCh || targetCh < 1 || targetCh > 8) targetCh = 1;

    ensureFarmScreenActive();
    renderShakirReTriggerPill();
    if (guideState.experienceUpdateTimer) {
      clearTimeout(guideState.experienceUpdateTimer);
      guideState.experienceUpdateTimer = null;
    }
    if (typeof global.closeModal === 'function') {
      try { global.closeModal(); } catch (e) {}
    }
    closeGuideModal();
    guideState.active = true;
    guideState.currentChapter = targetCh;
    clearCooldown();
    hideShakirSpeechBubble();

    // Target coordinates & Waypoints
    var targets = getTargetCoordinates(targetCh);
    var gatePos = { left: 92.5, top: 52.0 };
    var meadowPos = { left: 70.0, top: 48.0 };

    var el = guideState.walkerEl;
    var waypoints = [];
    var walkDuration = 3600;

    if (targetCh === 1) {
      // Start Chapter 1: visually spawn outside Main Gate, walk into Plot 1!
      if (!el || !el.parentNode) {
        el = spawnShakirWalker(gatePos);
      } else {
        el.style.left = gatePos.left + '%';
        el.style.top = gatePos.top + '%';
      }
      waypoints = [gatePos, meadowPos, targets.standPoint];
      walkDuration = 3800;
      showSkyHeading('Shakir enters through Main Gate ⛩️', { left: 92.5, top: 45.0 }, '⛩️');
      showShakirSpeechBubble('👋 Welcome to our farm! Walking through the main gate to Plot 1! ⛩️', 3400);
    } else {
      if (!el || !el.parentNode) {
        el = spawnShakirWalker(gatePos);
        waypoints = [gatePos, meadowPos, targets.standPoint];
        walkDuration = 4200;
      } else {
        var from = {
          left: parseFloat(el.style.left) || 48,
          top: parseFloat(el.style.top) || 42
        };
        var mid = {
          left: (from.left + targets.standPoint.left) / 2 + (Math.random() * 2 - 1),
          top: (from.top + targets.standPoint.top) / 2 + (Math.random() * 2 - 1)
        };
        var dist = Math.hypot(targets.standPoint.left - from.left, targets.standPoint.top - from.top);
        walkDuration = Math.max(3000, Math.min(5200, Math.round(dist * 95)));
        waypoints = [from, mid, targets.standPoint];
      }
      var chDataInit = SHAKIR_CHAPTERS[targetCh] || SHAKIR_CHAPTERS[1];
      showShakirSpeechBubble('Walking to ' + chDataInit.landmark + '... 🏃', 2400);
    }

    var chData = SHAKIR_CHAPTERS[targetCh] || SHAKIR_CHAPTERS[1];
    renderTourNavDock(targetCh);

    walkPath(el, waypoints, walkDuration, function () {
      if (!guideState.active) return;

      // 1. Wonder Touch: Arm reaches up with cyan scanning device!
      el.classList.add('wonder-touching');
      spawnTouchRipple(targets.touchPoint);

      // 2. Sky Heading celebration
      showSkyHeading(
        'Wonder Touch: Ch. ' + targetCh + ' ' + chData.title + ' · Shakir (Co-Founder & CEO)',
        targets.standPoint,
        chData.icon
      );

      // Play Sound Effect
      if (typeof global.SoundTrackEngine !== 'undefined') {
        try { global.SoundTrackEngine.playSFX('task'); } catch (e) {}
      }

      // 3. Reveal Cyan 3D Blueprints WITHOUT BLUEPRINT TEXT
      if (global.SearchO2HomeAvatar && typeof global.SearchO2HomeAvatar.showChapterGhosts === 'function') {
        try {
          global.SearchO2HomeAvatar.showChapterGhosts(targetCh, true);
        } catch (e) {}
      }

      // 4. Mark Chapter Exploration & Award XP (pass skipRoadmapModal=true so CEO modal opens first)
      if (typeof global.exploreChapterObject === 'function') {
        try { global.exploreChapterObject(chData.key, true); } catch (e) {}
      }
      if (typeof global.state !== 'undefined' && global.state) {
        global.state.exploredChapters = global.state.exploredChapters || {};
        global.state.exploredChapters[targetCh] = true;
        global.state.exploredChapterObjects = global.state.exploredChapterObjects || {};
        global.state.exploredChapterObjects[chData.key] = true;
        if (typeof global.state.xp === 'number' && global.state.xp === 0) global.state.xp = 5;
      }

      // 5. Open Shakir's Welcoming CEO Dialogue for this landmark first
      setTimeout(function () {
        openGuideDialog(targetCh);

        // 6. Sequential Modals: After 10s, smoothly close CEO modal and pop up green modal as experience update
        if (guideState.experienceUpdateTimer) {
          clearTimeout(guideState.experienceUpdateTimer);
          guideState.experienceUpdateTimer = null;
        }
        guideState.experienceUpdateTimer = setTimeout(function () {
          closeGuideModal();
          if (typeof global.openChapterRoadmapForObject === 'function') {
            try {
              global.openChapterRoadmapForObject(chData.key, true);
            } catch (err) {}
          }
        }, 10000);
      }, 400);

      // 6. Complete Wonder Touch and start Cooldown
      setTimeout(function () {
        if (el) el.classList.remove('wonder-touching');

        if (targetCh >= 8) {
          showShakirSpeechBubble('🎉 Full farm surveyed! You are an honorary Custodian!', 6000);
        } else {
          startCooldown(targetCh, targetCh + 1);
        }
      }, 750);
    });
  }

  function walkToNextChapter() {
    var nextCh = (guideState.currentChapter >= 8) ? 1 : (guideState.currentChapter + 1);
    closeGuideModal();
    walkToChapter(nextCh);
  }

  // ---------------------------------------------------------------------------
  // Target Coordinate Calculations
  // ---------------------------------------------------------------------------
  function getTargetCoordinates(ch) {
    if (global.SearchO2HomeAvatar && typeof global.SearchO2HomeAvatar.getScoutMarkerTouchTarget === 'function') {
      try {
        var res = global.SearchO2HomeAvatar.getScoutMarkerTouchTarget(ch);
        if (res && res.standPoint && res.touchPoint) return res;
      } catch (e) {}
    }

    if (isMobileViewport()) {
      var mobileCalibrated = {
        1: { standPoint: { left: 42.0, top: 38.0 }, touchPoint: { left: 42.0, top: 30.0 } },
        2: { standPoint: { left: 18.0, top: 72.0 }, touchPoint: { left: 16.0, top: 64.0 } },
        3: { standPoint: { left: 40.0, top: 82.0 }, touchPoint: { left: 40.0, top: 72.0 } },
        4: { standPoint: { left: 42.0, top: 40.0 }, touchPoint: { left: 42.0, top: 32.0 } },
        5: { standPoint: { left: 10.0, top: 74.0 }, touchPoint: { left: 8.0, top: 66.0 } },
        6: { standPoint: { left: 66.0, top: 82.0 }, touchPoint: { left: 66.0, top: 72.0 } },
        7: { standPoint: { left: 80.0, top: 40.0 }, touchPoint: { left: 80.0, top: 32.0 } },
        8: { standPoint: { left: 80.0, top: 82.0 }, touchPoint: { left: 80.0, top: 72.0 } }
      };
      if (mobileCalibrated[ch]) return mobileCalibrated[ch];
    }

    var calibrated = {
      1: { standPoint: { left: 40.5, top: 28.6 }, touchPoint: { left: 40.5, top: 21.6 } },
      2: { standPoint: { left: 13.2, top: 74.0 }, touchPoint: { left: 13.2, top: 70.0 } },
      3: { standPoint: { left: 38.0, top: 88.0 }, touchPoint: { left: 38.0, top: 86.0 } },
      4: { standPoint: { left: 38.0, top: 36.0 }, touchPoint: { left: 38.0, top: 32.0 } },
      5: { standPoint: { left: 4.6, top: 74.0 }, touchPoint: { left: 4.6, top: 70.0 } },
      6: { standPoint: { left: 67.0, top: 88.0 }, touchPoint: { left: 67.0, top: 86.0 } },
      7: { standPoint: { left: 82.7, top: 36.0 }, touchPoint: { left: 82.7, top: 32.0 } },
      8: { standPoint: { left: 82.7, top: 88.0 }, touchPoint: { left: 82.7, top: 86.0 } }
    };
    return calibrated[ch] || { standPoint: { left: 48, top: 42 }, touchPoint: { left: 48, top: 36 } };
  }

  function getInitialCoordinates(ch) {
    var coords = getTargetCoordinates(ch);
    return {
      left: Math.max(15, coords.standPoint.left - 12),
      top: Math.min(80, coords.standPoint.top + 6)
    };
  }

  // ---------------------------------------------------------------------------
  // Children-Friendly CEO Modals & Dialogue Windows
  // ---------------------------------------------------------------------------
  function closeGuideModal() {
    var modal = document.getElementById('s2ShakirModal');
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
    guideState.dialogOpen = false;
  }

  function openGuideDialog(ch) {
    if (!isGuestMode()) return;
    ensureShakirStyles();
    closeGuideModal();

    var chData = SHAKIR_CHAPTERS[ch] || SHAKIR_CHAPTERS[1];
    var nextCh = (ch >= 8) ? 1 : (ch + 1);
    var nextData = SHAKIR_CHAPTERS[nextCh];

    var modal = document.createElement('div');
    modal.className = 'shakir-modal-backdrop';
    modal.id = 's2ShakirModal';

    modal.innerHTML =
      '<div class="shakir-modal-card" role="dialog" aria-modal="true">' +
        '<button type="button" class="shakir-modal-close" id="btnShakirClose" title="Close">✕</button>' +
        '<div class="shakir-modal-header">' +
          '<div class="shakir-avatar-preview">' +
            renderShakirFigureSvg({ w: 48, h: 88, unique: 'shakir_head_preview' }) +
          '</div>' +
          '<div>' +
            '<div class="shakir-modal-title">Shakir · Co-Founder & CEO of SearchO2</div>' +
            '<div class="shakir-modal-subtitle">CH. ' + ch + ': ' + chData.title.toUpperCase() + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="shakir-modal-body">' +
          '<p style="margin:0 0 10px 0;font-size:0.92rem;font-weight:700;color:#0F172A;">' + chData.ceoGreeting + '</p>' +
          '<div style="font-size:0.80rem;color:#0284C7;font-weight:800;display:flex;align-items:center;gap:6px;">' +
            '<span>💡 CEO Tip:</span> <span>' + chData.actionTip + '</span>' +
          '</div>' +
        '</div>' +

        '<div class="shakir-fun-fact-box">' +
          '<span style="font-size:1.2rem;line-height:1;">🌟</span>' +
          '<div><b>Eco Fun Fact:</b> ' + chData.funFact + '</div>' +
        '</div>' +

        '<div class="shakir-modal-actions">' +
          (ch < 8 ?
            '<button type="button" class="shakir-btn-primary" id="btnShakirWalkNext"><span>Walk to Next Landmark (' + nextData.landmark + ') ➔</span></button>' :
            '<button type="button" class="shakir-btn-primary" id="btnShakirRestartTour"><span>Restart Farm Tour (Ch. 1) ➔</span></button>'
          ) +
          '<button type="button" class="shakir-btn-secondary" id="btnShakirExploreArea">Explore Here</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    guideState.dialogOpen = true;

    modal.onclick = function (e) {
      if (e.target === modal) closeGuideModal();
    };
    document.getElementById('btnShakirClose').onclick = closeGuideModal;

    var walkBtn = document.getElementById('btnShakirWalkNext') || document.getElementById('btnShakirRestartTour');
    if (walkBtn) {
      walkBtn.onclick = function () {
        walkToNextChapter();
      };
    }

    var exploreBtn = document.getElementById('btnShakirExploreArea');
    if (exploreBtn) {
      exploreBtn.onclick = function () {
        closeGuideModal();
        showShakirSpeechBubble('Go ahead and explore! I\'m right here whenever you need me! 😊', 4000);
      };
    }
  }

  function openWelcomeModal() {
    if (!isGuestMode()) {
      removeGuide();
      return;
    }
    ensureShakirStyles();
    closeGuideModal();

    var currentCh = guideState.currentChapter || 1;

    // Generate 8-chapter landmark roadmap
    var roadmapHtml = '<div class="shakir-roadmap-list">';
    for (var i = 1; i <= 8; i++) {
      var item = SHAKIR_CHAPTERS[i];
      var isActive = (i === currentCh);
      roadmapHtml +=
        '<div class="shakir-roadmap-item' + (isActive ? ' active' : '') + '" data-goto-ch="' + i + '">' +
          '<div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;">' +
            '<span style="font-size:1.1rem;flex-shrink:0;">' + item.icon + '</span>' +
            '<div style="min-width:0;flex:1;">' +
              '<div class="roadmap-item-title" style="font-size:0.76rem;font-weight:900;color:#0F172A;word-break:break-word;">Ch. ' + i + ': ' + item.landmark + '</div>' +
              '<div class="roadmap-item-desc" style="font-size:0.66rem;color:#64748B;line-height:1.2;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">' + item.title + '</div>' +
            '</div>' +
          '</div>' +
          '<span class="roadmap-item-action" style="font-size:0.70rem;font-weight:800;color:' + (isActive ? '#0284C7' : '#94A3B8') + ';flex-shrink:0;white-space:nowrap;">' + (isActive ? '● Here' : 'Visit ➔') + '</span>' +
        '</div>';
    }
    roadmapHtml += '</div>';

    var modal = document.createElement('div');
    modal.className = 'shakir-modal-backdrop';
    modal.id = 's2ShakirModal';

    modal.innerHTML =
      '<div class="shakir-modal-card" style="max-width:540px;" role="dialog" aria-modal="true">' +
        '<button type="button" class="shakir-modal-close" id="btnShakirClose" title="Close">✕</button>' +
        '<div class="shakir-modal-header">' +
          '<div class="shakir-avatar-preview">' +
            renderShakirFigureSvg({ w: 48, h: 88, unique: 'shakir_welcome' }) +
          '</div>' +
          '<div>' +
            '<div class="shakir-modal-title">Shakir · Co-Founder & CEO Guide</div>' +
            '<div class="shakir-modal-subtitle">EXPLORE ALL 8 CENTRAL EUROPEAN FARM LANDMARKS</div>' +
          '</div>' +
        '</div>' +

        '<div class="shakir-modal-body" style="padding:10px 14px;margin-bottom:12px;">' +
          '<p style="margin:0 0 6px 0;font-size:0.90rem;font-weight:800;color:#0F172A;">' +
            '👋 Welcome to SearchO2! Choose any landmark on the roadmap below or start a step-by-step tour:' +
          '</p>' +
          '<div style="font-size:0.75rem;color:#64748B;line-height:1.4;">' +
            'Each chapter introduces vital regenerative ecology, clean microgrid technology, and our closed-loop oxygen economy.' +
          '</div>' +
        '</div>' +

        '<div style="font-size:0.72rem;font-weight:800;color:#0284C7;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Landmark Roadmap (Select to Tour)</div>' +
        roadmapHtml +

        '<div class="shakir-modal-actions" style="margin-top:14px;">' +
          '<button type="button" class="shakir-btn-primary" id="btnShakirStartTour"><span>🧭 Start Guided Tour (Ch. ' + currentCh + ') ➔</span></button>' +
          '<button type="button" class="shakir-btn-secondary" id="btnShakirLookAround">👀 Free Roam (Explore on My Own)</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    guideState.dialogOpen = true;

    modal.onclick = function (e) {
      if (e.target === modal) closeGuideModal();
    };
    document.getElementById('btnShakirClose').onclick = closeGuideModal;

    modal.querySelectorAll('[data-goto-ch]').forEach(function (btn) {
      btn.onclick = function () {
        var ch = parseInt(btn.getAttribute('data-goto-ch'), 10);
        closeGuideModal();
        walkToChapter(ch);
      };
    });

    document.getElementById('btnShakirStartTour').onclick = function () {
      closeGuideModal();
      walkToChapter(currentCh);
    };

    document.getElementById('btnShakirLookAround').onclick = function () {
      closeGuideModal();
      hideTourNavDock();
      renderShakirReTriggerPill();
      showShakirSpeechBubble('Enjoy exploring the farm! Tap on me or the CEO Tour button anytime! 🧑‍💼', 4500);
    };
  }

  function openShakirDialogue() {
    if (!isGuestMode()) return;
    openGuideDialog(guideState.currentChapter);
  }

  // ---------------------------------------------------------------------------
  // Floating CEO Tour Re-Trigger Pill & Return Modal
  // ---------------------------------------------------------------------------
  function renderShakirReTriggerPill() {
    // As per user specification: CEO tour guide will ONLY be visible in guest mode login home globe page.
    // Completely remove sticky pill from the farm and from mobile view.
    var old = document.getElementById('s2ShakirReTriggerBtn');
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  function openReTriggerModal() {
    if (!isGuestMode()) return;
    ensureShakirStyles();
    closeGuideModal();

    var currentCh = guideState.currentChapter || 1;

    // Generate 8-chapter landmark roadmap
    var roadmapHtml = '<div class="shakir-roadmap-list">';
    for (var i = 1; i <= 8; i++) {
      var item = SHAKIR_CHAPTERS[i];
      var isActive = (i === currentCh);
      roadmapHtml +=
        '<div class="shakir-roadmap-item' + (isActive ? ' active' : '') + '" data-retrigger-ch="' + i + '">' +
          '<div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;">' +
            '<span style="font-size:1.1rem;flex-shrink:0;">' + item.icon + '</span>' +
            '<div style="min-width:0;flex:1;">' +
              '<div class="roadmap-item-title" style="font-size:0.76rem;font-weight:900;color:#0F172A;word-break:break-word;">Ch. ' + i + ': ' + item.landmark + '</div>' +
              '<div class="roadmap-item-desc" style="font-size:0.66rem;color:#64748B;line-height:1.2;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">' + item.title + '</div>' +
            '</div>' +
          '</div>' +
          '<span class="roadmap-item-action" style="font-size:0.70rem;font-weight:800;color:' + (isActive ? '#0284C7' : '#94A3B8') + ';flex-shrink:0;white-space:nowrap;">' + (isActive ? '● Current' : 'Walk Here ➔') + '</span>' +
        '</div>';
    }
    roadmapHtml += '</div>';

    var modal = document.createElement('div');
    modal.className = 'shakir-modal-backdrop';
    modal.id = 's2ShakirModal';

    modal.innerHTML =
      '<div class="shakir-modal-card" style="max-width:540px;" role="dialog" aria-modal="true">' +
        '<button type="button" class="shakir-modal-close" id="btnShakirClose" title="Close">✕</button>' +
        '<div class="shakir-modal-header">' +
          '<div class="shakir-avatar-preview">' +
            renderShakirFigureSvg({ w: 48, h: 88, unique: 'shakir_retrigger' }) +
          '</div>' +
          '<div>' +
            '<div class="shakir-modal-title">Shakir · Co-Founder & CEO Guide</div>' +
            '<div class="shakir-modal-subtitle">GERMAN FARM EXPLORATION ROADMAP</div>' +
          '</div>' +
        '</div>' +

        '<div class="shakir-modal-body" style="padding:12px 14px;margin-bottom:12px;background:#F0F9FF;border:1.5px solid #BAE6FD;border-radius:14px;">' +
          '<p style="margin:0 0 6px 0;font-size:0.92rem;font-weight:800;color:#0369A1;">' +
            '👋 Welcome back! Thanks for choosing to explore our farm together again!' +
          '</p>' +
          '<div style="font-size:0.76rem;color:#475569;line-height:1.45;">' +
            'Where would you like to visit next? Choose any landmark on the roadmap below to start a direct guided walk, or restart the tour from the beginning:' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
          '<span style="font-size:0.72rem;font-weight:800;color:#0284C7;text-transform:uppercase;letter-spacing:0.5px;">Landmark Roadmap (Select to Walk)</span>' +
        '</div>' +
        roadmapHtml +

        '<div class="shakir-modal-actions" style="margin-top:14px;">' +
          '<button type="button" class="shakir-btn-primary" id="btnShakirRestartBeginning">' +
            '<span>🔄 Restart from Beginning (Chapter 1) ➔</span>' +
          '</button>' +
          (currentCh > 1 && currentCh <= 8 ?
            '<button type="button" class="shakir-btn-secondary" id="btnShakirContinueCurrent">' +
              'Continue Tour (Ch. ' + currentCh + ') ➔' +
            '</button>' : '') +
          '<button type="button" class="shakir-btn-secondary" id="btnShakirCloseRetrigger">Close</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    guideState.dialogOpen = true;

    modal.onclick = function (e) {
      if (e.target === modal) closeGuideModal();
    };
    document.getElementById('btnShakirClose').onclick = closeGuideModal;
    var btnCloseRetrigger = document.getElementById('btnShakirCloseRetrigger');
    if (btnCloseRetrigger) btnCloseRetrigger.onclick = closeGuideModal;

    modal.querySelectorAll('[data-retrigger-ch]').forEach(function (btn) {
      btn.onclick = function () {
        var ch = parseInt(btn.getAttribute('data-retrigger-ch'), 10);
        closeGuideModal();
        walkToChapter(ch);
      };
    });

    document.getElementById('btnShakirRestartBeginning').onclick = function () {
      closeGuideModal();
      walkToChapter(1);
    };

    var btnContinue = document.getElementById('btnShakirContinueCurrent');
    if (btnContinue) {
      btnContinue.onclick = function () {
        closeGuideModal();
        walkToChapter(currentCh);
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Boot & Lifecycle Integrations
  // ---------------------------------------------------------------------------
  function bootGuideOnFarm() {
    if (!isGuestMode()) {
      removeGuide();
      return;
    }
    ensureShakirStyles();
    renderShakirReTriggerPill();

    // Prevent regular avatar system from launching avatar selection overlay
    if (global.SearchO2HomeAvatar) {
      if (typeof global.SearchO2HomeAvatar.hideHomeOverlay === 'function') {
        global.SearchO2HomeAvatar.hideHomeOverlay();
      }
    }

    var scene = document.getElementById('fieldScene');
    if (!scene) return;

    var curCoords = getInitialCoordinates(guideState.currentChapter || 1);
    spawnShakirWalker(curCoords);

    // If first entry as guest, welcome with cheerful greeting
    var greeted = sessionStorage.getItem('searchO2_shakir_welcomed');
    if (!greeted) {
      sessionStorage.setItem('searchO2_shakir_welcomed', '1');
      setTimeout(function () {
        openWelcomeModal();
      }, 700);
    } else {
      showShakirSpeechBubble('👋 Welcome back! Click me to continue our tour!', 4000);
    }
  }

  function hideTourNavDock() {
    var nav = document.getElementById('s2ShakirTourNav');
    if (nav && nav.parentNode) {
      nav.parentNode.removeChild(nav);
    }
  }

  function renderTourNavDock(targetCh) {
    if (!isGuestMode()) {
      hideTourNavDock();
      return;
    }
    var chData = SHAKIR_CHAPTERS[targetCh] || SHAKIR_CHAPTERS[1];
    var nav = document.getElementById('s2ShakirTourNav');
    if (!nav) {
      nav = document.createElement('div');
      nav.id = 's2ShakirTourNav';
      nav.className = 'shakir-tour-nav-dock';
      document.body.appendChild(nav);
    }
    nav.innerHTML =
      '<div class="shakir-nav-info">' +
        '<span class="shakir-nav-tag">🧭 Shakir CEO Tour</span>' +
        '<span class="shakir-nav-landmark">' + chData.icon + ' Ch. ' + targetCh + ': ' + chData.landmark + '</span>' +
      '</div>' +
      '<div class="shakir-nav-btn-group">' +
        '<button type="button" class="shakir-nav-btn" id="s2NavPrev" title="Walk to Previous Landmark"><span class="nav-icon">⏮️</span><span class="nav-text"> Prev</span></button>' +
        '<span class="shakir-nav-ch-badge" id="s2NavChBadge" title="Current Landmark: ' + chData.landmark + '">' + chData.icon + ' Ch. ' + targetCh + '</span>' +
        '<button type="button" class="shakir-nav-btn" id="s2NavNext" title="Walk to Next Landmark"><span class="nav-text">Next </span><span class="nav-icon">⏭️</span></button>' +
        '<button type="button" class="shakir-nav-btn primary" id="s2NavRoadmap" title="View Landmark Roadmap"><span class="nav-icon">📜</span><span class="nav-text"> Roadmap</span></button>' +
        '<button type="button" class="shakir-nav-btn danger" id="s2NavStop" title="Exit Tour and Free Roam"><span class="nav-icon">✕</span><span class="nav-text"> Free Roam</span></button>' +
      '</div>';

    document.getElementById('s2NavPrev').onclick = function () {
      var prev = (targetCh <= 1) ? 8 : (targetCh - 1);
      walkToChapter(prev);
    };
    document.getElementById('s2NavNext').onclick = function () {
      var next = (targetCh >= 8) ? 1 : (targetCh + 1);
      walkToChapter(next);
    };
    document.getElementById('s2NavRoadmap').onclick = function () {
      openWelcomeModal();
    };
    document.getElementById('s2NavStop').onclick = function () {
      hideTourNavDock();
      renderShakirReTriggerPill();
      showShakirSpeechBubble('Free Roam mode active! Tap on Shakir or visit the home globe anytime to resume! 😊', 4000);
    };
  }

  function removeGuide() {
    clearCooldown();
    closeGuideModal();
    hideTourNavDock();
    var walker = document.getElementById('s2ShakirGuide');
    if (walker && walker.parentNode) {
      walker.parentNode.removeChild(walker);
    }
    var pill = document.getElementById('s2ShakirReTriggerBtn');
    if (pill && pill.parentNode) {
      pill.parentNode.removeChild(pill);
    }
    guideState.active = false;
    guideState.walkerEl = null;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  var SearchO2ShakirGuide = {
    isGuestMode: isGuestMode,
    bootGuideOnFarm: bootGuideOnFarm,
    removeGuide: removeGuide,
    walkToChapter: walkToChapter,
    walkToNextChapter: walkToNextChapter,
    openWelcomeModal: openWelcomeModal,
    openReTriggerModal: openReTriggerModal,
    renderShakirReTriggerPill: renderShakirReTriggerPill,
    openGuideDialog: openGuideDialog,
    openWelcomeOrProgressModal: function () {
      if (guideState.currentChapter && guideState.currentChapter > 1) {
        openReTriggerModal();
      } else {
        openWelcomeModal();
      }
    },
    openShakirDialogue: openShakirDialogue,
    renderShakirFigureSvg: renderShakirFigureSvg,
    getGuideState: function () {
      return guideState;
    },
    isTourActive: function () {
      return guideState.active;
    },
    isCooldownActive: function () {
      return guideState.cooldownActive && guideState.cooldownRemaining > 0;
    },
    getCooldownRemaining: function () {
      return guideState.cooldownRemaining;
    }
  };

  global.SearchO2ShakirGuide = SearchO2ShakirGuide;

  // Auto-boot if already on farm and user is a guest
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () {
        if (isGuestMode()) {
          var farmScreen = document.getElementById('farmScreen');
          if (farmScreen && farmScreen.style.display !== 'none') {
            bootGuideOnFarm();
          }
        }
      }, 900);
    });
  } else {
    setTimeout(function () {
      if (isGuestMode()) {
        var farmScreen = document.getElementById('farmScreen');
        if (farmScreen && farmScreen.style.display !== 'none') {
          bootGuideOnFarm();
        }
      }
    }, 900);
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
