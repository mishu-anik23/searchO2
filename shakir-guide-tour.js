/**
 * SearchO2 — Shakir (OxyEco Forger) & Pip Squeak-a-Link Farm Exploration Tour
 *
 * Implements Shakir (SearchO2 OxyEco Forger, 18+ practical explainer) and
 * Pip Squeak-a-Link (Alpine Harvest Field Mouse, Micromys minutus, Apprentice Mason & Safety Scout)
 * as an interactive pair-explorer companion system across all 8 central European farm landmarks
 * and their respective sub-challenges.
 *
 * Visual & Behavioral Standard:
 * - Shakir: 3D anime messy spiky hair, layered white adventure jacket, SearchO2 CEO badge,
 *   cyan scanning PDA & forging wonder stick.
 * - Pip (Alpenhof Lab Standard):
 *   * Alpine Harvest Field Mouse (Micromys minutus)
 *   * Headwear: None (oversized rose-pink auricles: #F472B6, #FBCFE8, #9C744A)
 *   * Clothing: Cyan-blue tropical Hawaiian floral shirt (#06B6D4) over hi-vis orange twill shorts (#EA580C)
 *   * Footwear: Bright lime-green field sneakers (#84CC16) with high-traction waffle soles (#E2E8F0, #64748B)
 *   * Signature tools: Twin high-candela green LED marshaling wands (#22C55E), yellow torque wrench (#FACC15)
 *   * Posture: Strictly upright spine, straight stance, rigidly unified head root node.
 *   * Diverse funny animations: Marshaling wand wave, excited toddler hop, ear twitch & sniff, torque wrench inspect.
 * - Chapter-wise Sub-Challenges Journey:
 *   * Ch. 1: Plot 1 Living Soil & Jute Tarpaulin Hidden Cache
 *   * Ch. 2: Crew Craftsman Shed, Granary Storage Barn & Tractor Garage
 *   * Ch. 3: Biodiversity Pollinator Garden, 3-Bed Rotational Crop Field & Boardwalk
 *   * Ch. 4: Hydrological Retention Pond & Simmental Cattle Farm Pasture
 *   * Ch. 5: BESS Clean Energy Microgrid Substation & Ridge Wind Turbines
 *   * Ch. 6: Organic Grove Press Juice Bar & Alpenhof Gasthof Stube
 *   * Ch. 7: Global Biome Gateway & Eco-Passport Expeditions
 *   * Ch. 8: Orbital Oxygen Shuttle Launchpad & Space Greenhouses
 * - Optimized Overlap & View Dynamics:
 *   * Speech bubbles and subtitle dock dynamically position to avoid blocking Shakir or Pip.
 *   * Smooth parametric multi-waypoint walking dynamics.
 * - Celebratory Victory Modal:
 *   * Awards prestigious title "Grand Planetary Eco-Forger", +500 XP, +1,000 Gold Coins, and +500 O2.
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
  // Chapter & Sub-Challenge Spatial Journey Definitions
  // Every chapter consists of sequential landmark spots visited and explained interactively!
  // ---------------------------------------------------------------------------
  var CHAPTER_JOURNEY = {
    1: {
      chapter: 1,
      title: 'The Living Soil & Hidden Cache',
      spots: [
        {
          key: 'plot',
          landmark: 'Plot 1 Soil Bed',
          icon: '🌱',
          standPoint: { left: 24.5, top: 38.0 },
          touchPoint: { left: 24.5, top: 28.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '🌱 Look down at Plot 1, Pip! Living soil awaits!',
            text: 'Look right here at Plot 1, Pip! Beneath our feet, this virgin soil is teeming with billions of microscopic helpers. When we aerate the ground and plant our first sapling, its roots lock carbon deep underground while its leaves forge the first fresh oxygen for our atmosphere!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'ear_sniff',
            bubble: '🐭 Wait Shakir! Won\'t my waffle sneakers tickle them?!',
            text: 'Wait Shakir! If billions of microscopic bugs live down in the dirt, won\'t my high-traction waffle sneakers tickle their little bug tummies when I marshaling-waddle across Plot 1?!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ Aerating gives them fresh air pockets! Plot 1 forged!',
            text: 'Haha, not at all, Pip! Aerating the soil actually opens gentle air pockets so microbes can breathe, break down nutrients, and nourish our roots. Let\'s till this bed together!'
          }
        },
        {
          key: 'jute_tarp',
          landmark: 'Jute Tarpaulin Tool Cache',
          icon: '📦',
          standPoint: { left: 14.5, top: 73.5 },
          touchPoint: { left: 10.5, top: 72.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '📦 Beside the Farm Shed boundary sits our sealed Jute Tarpaulin!',
            text: 'Look here, Pip! Right beside our Farm Shed boundary sits a heavy, weatherproof jute tarpaulin protecting our foundational heritage tools. It stays firmly sealed under breathable woven hemp while we survey our estate masterplan!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'wrench',
            bubble: '🔧 Chief Safety Scout Pip confirms: ropes are sealed tight!',
            text: 'Aha! Chief Safety Scout Pip reporting! All weatherproof hemp ropes are tied snug and double-checked! So our young eco-explorer will unlock and uncover this cache with their own hands once our whole survey walk is finished?!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ Exactly, Pip! Our founder will uncover it after our tour!',
            text: 'Spot on, Pip! We only explain where the cache sits. Once our journey across all 8 chapters is complete and we step out through the farm gate, our founder will pull back these ropes themselves to equip their trenching spade and broadfork!'
          }
        }
      ]
    },
    2: {
      chapter: 2,
      title: 'Crew Headquarters, Storage & Mechanization',
      spots: [
        {
          key: 'crew_shed',
          landmark: 'Crew Craftsman Shed',
          icon: '🏡',
          standPoint: { left: 14.0, top: 68.0 },
          touchPoint: { left: 13.2, top: 58.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '🏡 Look Pip! Our {farmName} Shield is mounted right here!',
            text: 'Here\'s our Craftsman Crew Shed, Pip! Look above the heavy oak lintel—our proud farm emblem shield for {farmName} is mounted right here, just like I promised at the entrance gate! In this workshop, dedicated field laborers rest, sharpen tools, and coordinate automated weeding, watering, and harvesting!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'wrench',
            bubble: '🔧 Chief Mason Pip reporting! The {farmName} shield shines!',
            text: 'Aha! Chief Mason Pip reporting for duty! The {farmName} shield shines brighter than a fresh polished copper kettle! Does that mean I can assign five helper field mice to turn the compost while I take an afternoon chamomile cocoa break by the workshop hearth?!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ Teamwork makes tree planting 3x faster!',
            text: 'You bet, little buddy! Working together in eco-crews multiplies planting speed by three, giving everyone time to build, learn, and keep our {farmName} estate thriving!'
          }
        },
        {
          key: 'storage',
          landmark: 'Granary Storage Barn',
          icon: '🌾',
          standPoint: { left: 52.0, top: 22.0 },
          touchPoint: { left: 52.0, top: 12.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '🌾 Behold our Granary Storage Barn, Pip!',
            text: 'Behold our Granary Storage Barn, Pip! Elevated timber footings and natural louvered airflow keep our harvested grains, rye sheaves, and botanical tree seeds dry and safe without dampness, mold, or spoilage!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'hop',
            bubble: '🧺 Can field mice get their own miniature acorn silo?!',
            text: 'Dry seed storage! That\'s music to my mouse ears! Can harvest field mice get their own certified miniature acorn silo right next to the wheat sacks?!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ Every grain preserved supports zero food waste!',
            text: 'Every seed is precious, Pip! Storing food cleanly and locally ensures we never waste a single harvest and keeps our community resilient throughout winter!'
          }
        },
        {
          key: 'garage',
          landmark: 'Tractor Garage & Maintenance',
          icon: '🚜',
          standPoint: { left: 88.0, top: 34.0 },
          touchPoint: { left: 91.0, top: 22.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '🚜 Our Clean Mechanization Garage, Pip!',
            text: 'And over here is our Agricultural Mechanization Garage! We house 100% electric tractors and bio-lubricated implements so heavy soil aeration runs with pure kinetic torque and zero diesel smoke!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'wand_wave',
            bubble: '🚦 Green marshaling wands up! Tractor bay clear for parking!',
            text: 'Wands up! Pip\'s high-candela green LEDs will marshal the Fendt electric tractor right into stall number one! Clear the driveway, big wheels incoming!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ Clean machinery protects our pristine alpine air!',
            text: 'Flawless marshaling, Pip! Electric mechanization saves thousands of hours of manual labor while keeping our meadow air crisp, fresh, and smoke-free!'
          }
        }
      ]
    },
    3: {
      chapter: 3,
      title: 'Biodiversity Sanctuary & Rotational Crops',
      spots: [
        {
          key: 'garden',
          landmark: 'Biodiversity Pollinator Sanctuary',
          icon: '🌸',
          standPoint: { left: 38.0, top: 84.0 },
          touchPoint: { left: 38.0, top: 72.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '🌸 Listen to the gentle hum of pollinators, Pip!',
            text: 'Listen closely, Pip! Hear that busy hum? This is our Biodiversity Sanctuary. We plant vibrant lavender, coneflowers, and berry hedgerows so native bumblebees and butterflies feast on sweet nectar and cross-pollinate our fruit orchards!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'wand_wave',
            bubble: '🚦 Look at the busy bees! Runway 3 open for incoming pollinators!',
            text: 'Look at the busy bees! Look Shakir, I can marshal incoming bumblebees with my high-candela green LED wands! Runway 3 open on the lavender petals for heavy nectar cargo landing!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ 1 in 3 bites of food depends on pollinators!',
            text: 'Outstanding marshaling, Pip! One out of every three bites of food we eat depends directly on those winged friends. Flowering corridors ensure our whole estate flourishes!'
          }
        },
        {
          key: 'crop_field',
          landmark: 'Rotational 3-Bed Crop Field',
          icon: '🌾',
          standPoint: { left: 52.0, top: 92.0 },
          touchPoint: { left: 52.0, top: 82.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '🌾 Cycling legumes, root crops & brassicas, Pip!',
            text: 'Look across our Rotational 3-Bed Crop Field, Pip! By alternating nitrogen-fixing legumes, root vegetables, and leafy brassicas, we naturally enrich the soil without synthetic chemicals or soil exhaustion!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'ear_sniff',
            bubble: '🥕 Mmm! Does nitrogen-fixing make sweet carrots crunchier?!',
            text: 'Mmm, sweet clover and baby carrots! Does natural nitrogen-fixing make organic field carrots extra crunchy for toddler scouts?!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ Crop rotation stops pests and supercharges soil nutrition!',
            text: 'Infinitely crunchier, Pip! Crop rotation breaks pest lifecycles naturally, producing nutrient-dense food that strengthens both humans and the living earth!'
          }
        },
        {
          key: 'garden_walk',
          landmark: 'Heritage Timber Boardwalk',
          icon: '🪵',
          standPoint: { left: 32.0, top: 66.0 },
          touchPoint: { left: 32.0, top: 59.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '🪵 Permeable timber boardwalk protects soil mycelium!',
            text: 'And step onto our Heritage Garden Boardwalk, Pip! Raised larch-wood decking lets visitors and gardeners walk through the blooming sanctuary without crushing delicate fungal mycelium networks in the humus below!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'hop',
            bubble: '👟 Waffle sneakers love the wooden boardwalk planks!',
            text: 'My lime-green waffle sneakers love this smooth larch wood! Zero mud, maximum traction, and all the underground mushroom threads stay happy and safe!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ Low-impact infrastructure preserves living soil integrity!',
            text: 'Spot on, Pip! Low-impact infrastructure allows humans to observe and care for nature without disrupting the delicate ecological web underneath!'
          }
        }
      ]
    },
    4: {
      chapter: 4,
      title: 'Hydrological Living Waters & Pasture',
      spots: [
        {
          key: 'pond',
          landmark: 'Hydrological Living Waters Eco-Pond',
          icon: '💧',
          standPoint: { left: 38.0, top: 32.0 },
          touchPoint: { left: 38.0, top: 20.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '💧 Mountain water is pure life, Pip!',
            text: 'Behold our Hydrological Eco-Pond, Pip! Every drop of alpine rain and snowmelt runoff collects here. Layered gravel beds and natural aquatic reeds filter the water, storing drought-proof hydration for all our botanical plots!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'hop',
            bubble: '🫖 Can I fill my vintage copper alpine kettle here?!',
            text: 'Ooh! Crisp mountain water! Can I fill my vintage copper alpine kettle right here to brew a big batch of wild mint tea for our thirsty planting crew?!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ Natural reeds purify water and cool the microclimate!',
            text: 'Go right ahead, Pip! Natural reed beds cleanse runoff so thoroughly it revitalizes our trees, cools the local microclimate, and quenches every seedling throughout the dry summer!'
          }
        },
        {
          key: 'cattle_farm',
          landmark: 'Simmental Cow Shed & Pasture',
          icon: '🐄',
          standPoint: { left: 8.0, top: 40.0 },
          touchPoint: { left: 5.5, top: 28.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '🐄 Closed-loop rotational pasture grazing, Pip!',
            text: 'Here is our Simmental Cow Shed & Pasture! Heritage alpine cattle graze on native clover and rye grass, naturally aerating the pasture with their hooves while their aged manure enriches our bio-compost with active enzymes!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'hop',
            bubble: '🐮 Hello friendly alpine cows! Safety scout Pip certified this fence!',
            text: 'Hello gentle giant cows! Safety scout Pip personally inspected every timber fence post with his torque wrench — zero squeaks, certified safe!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ Circular bio-compost closes the nutrient loop!',
            text: 'Wonderful work, Pip! Combining livestock rotation with organic farming closes our nutrient loop so nothing is imported and nothing is wasted!'
          }
        }
      ]
    },
    5: {
      chapter: 5,
      title: 'Clean Energy Storage & Renewables',
      spots: [
        {
          key: 'energy_storage',
          landmark: 'BESS Microgrid Substation',
          icon: '⚡',
          standPoint: { left: 7.0, top: 68.0 },
          touchPoint: { left: 4.5, top: 58.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '⚡ Silent wind turbines & clean batteries, Pip!',
            text: 'Look up at our silent aero-turbines and solar bio-storage banks, Pip! All our irrigation pumps and estate lights run on 100% clean kinetic power — zero smoke, zero greenhouse emissions!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'wrench',
            bubble: '🔧 Zero smoke?! No coughing for little field mice!',
            text: 'Zero smoke?! That means no coughing for field mice and no smudgy soot on my Hawaiian floral shirt! Can I tighten the battery terminal bolts with my torque wrench?!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ 60 min of sunshine powers Earth for a whole year!',
            text: 'Safety first, Apprentice Mason Pip! Just one hour of sunshine provides enough clean energy to power our entire world for a full year. Storing it in smart batteries keeps our alpine air crystal clear!'
          }
        },
        {
          key: 'wt_nw',
          landmark: 'Ridge Aero-Turbines',
          icon: '💨',
          standPoint: { left: 24.0, top: 22.0 },
          touchPoint: { left: 24.0, top: 10.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '💨 Silent mountain breezes generate kinetic electricity!',
            text: 'Look up at our NW Ridge Wind Turbines, Pip! High-altitude alpine gusts turn these gearless aerodynamic composite blades, feeding continuous kinetic power straight into our microgrid day and night!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'wand_wave',
            bubble: '🌪️ Clean wind power! Wands up for clean mountain breezes!',
            text: 'Look at those sleek blades spin so quietly! Green marshaling wands up for clean mountain breezes!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ 100% Renewable energy powers all estate water pumps!',
            text: 'Pure kinetic power, Pip! Harnessing natural wind allows our irrigation pumps and estate workshops to run with complete self-sufficiency!'
          }
        }
      ]
    },
    6: {
      chapter: 6,
      title: 'Organic Grove Press & Gasthof Stube',
      spots: [
        {
          key: 'juice_bar',
          landmark: 'Organic Grove Press & Juice Bar',
          icon: '🍎',
          standPoint: { left: 67.0, top: 84.0 },
          touchPoint: { left: 67.0, top: 72.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '🍎 Crisp, sweet heritage abundance, Pip!',
            text: 'Take a deep breath, Pip! Smell that fresh aroma? Our Organic Grove Press crushes heritage apples and berries into vitamin-rich artisan juices. Friendly eco-tourists stop by our kiosk, supporting our farm treasury with golden coins!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'ear_sniff',
            bubble: '🍎 Do safety scouts get a free splash in our willow basket?!',
            text: 'Mmm! Sweet apple cider! Do safety scouts with high-traction sneakers get a free splash in their willow baskets after inspecting the fruit crates?!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ Local fruit press cuts food transport emissions to zero!',
            text: 'You definitely earned a generous glass, Pip! Crushing and enjoying organic fruit right on the farm cuts food transportation emissions to nearly zero and funds our next planting expansions!'
          }
        },
        {
          key: 'coffee_shop',
          landmark: 'Alpenhof Gasthof Stuben & Terrace',
          icon: '🍽️',
          standPoint: { left: 67.0, top: 32.0 },
          touchPoint: { left: 67.0, top: 20.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '🍽️ Stone-pine Zirbe timber & farm-to-table hospitality!',
            text: 'And here is our Alpenhof Gasthof Stube & Terrace, Pip! Crafted from aromatic Bavarian Zirbe stone-pine, its natural pinosylvin terpenes calm the heart rate while visitors enjoy farm-to-table organic meals!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'hop',
            bubble: '🥣 Can I sit at the corner table by the warm stove?!',
            text: 'Ahhh! Warm stone-pine aroma and hot veggie soup! Can Pip reserve a corner table right by the serpentine soapstone stove?!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ Psychophysical wellness and community connection in harmony!',
            text: 'Of course, Pip! Regenerative farming isn\'t just about soil — it\'s about community wellness, gathering together, and restoring our relationship with the land!'
          }
        }
      ]
    },
    7: {
      chapter: 7,
      title: 'Global Biome Gateway & Eco-Passport',
      spots: [
        {
          key: 'eco_passport',
          landmark: 'Global Biome Gateway & Eco-Passport',
          icon: '🌍',
          standPoint: { left: 79.0, top: 25.0 },
          touchPoint: { left: 79.0, top: 12.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '🌍 Behold our Global Eco-Passport Gateway, Pip!',
            text: 'Behold our Global Eco-Passport, Pip! Our Central European farm is just the threshold. As our estate flourishes, our passport unlocks planetary conservation journeys — from Caribbean coral reefs in Saint Martin to tropical mangrove restoration!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'wand_wave',
            bubble: '🧳 Pack my basket! Global Scout Pip is ready!',
            text: 'Pack my willow basket and alpine kettle! Global Scout Pip is ready to stamp passports from the Bavarian Alps all the way to coral barrier reefs!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '✨ Earth has 14 biomes, and every restored acre matters!',
            text: 'That\'s the true planetary spirit, Pip! Earth has fourteen distinct biomes, and every single restored ecosystem strengthens the global atmospheric web that sustains all living things!'
          }
        }
      ]
    },
    8: {
      chapter: 8,
      title: 'Orbital Oxygen Shuttle & Biosphere',
      spots: [
        {
          key: 'space_mission',
          landmark: 'Orbital Oxygen Shuttle Launchpad',
          icon: '🚀',
          standPoint: { left: 83.0, top: 84.0 },
          touchPoint: { left: 83.0, top: 72.0 },
          turn1: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '🚀 3... 2... 1... Atmospheric liftoff, Pip!',
            text: 'Look at the Orbital Oxygen Shuttle Launchpad, Pip! When our flourishing canopies forge surplus pure oxygen, we compress breathable air canisters aboard ecological transports to supply orbital stations and seed living green biodomes across the cosmos!'
          },
          turn2: {
            speaker: 'pip', name: 'Pip', role: 'Toddler Safety Scout', avatar: '🐭', anim: 'wand_wave',
            bubble: '🚀 Shuttle cleared for liftoff! Pure oxygen canisters secured!',
            text: 'Rocket clear for atmospheric liftoff! Pip to Mission Control: pure Bavarian oxygen canisters secured for space greenhouse domes!'
          },
          turn3: {
            speaker: 'shakir', name: 'Shakir', role: '18+ Eco Forger', avatar: '🧑‍🌾',
            bubble: '🎉 From living soil to the stars — our masterplan is forged!',
            text: 'Liftoff achieved! From humble microbes in living soil all the way to orbital biospheres, we are forging an oxygen-rich future together! Outstanding scouting, Pip!'
          }
        }
      ]
    }
  };

  // ---------------------------------------------------------------------------
  // Guide State
  // ---------------------------------------------------------------------------
  var guideState = {
    active: false,
    currentChapter: 1,
    currentSpotIdx: 0,
    currentDialogueTurn: 1,
    isWalking: false,
    walkerEl: null,
    pipEl: null,
    speechBubbleEl: null,
    pipBubbleEl: null,
    cooldownTimer: null,
    cooldownRemaining: 0,
    cooldownActive: false,
    dialogueTimer: null,
    voiceEnabled: true,
    subtitlesVisible: true,
    currentWalkToken: 0,
    sequenceTimers: [],
    suppressAutoBoot: false
  };

  try {
    var storedVoice = localStorage.getItem('searchO2_tour_voice_enabled');
    if (storedVoice !== null) {
      guideState.voiceEnabled = (storedVoice === '1' || storedVoice === 'true');
    }
  } catch (e) {}

  function clearSequenceTimers() {
    for (var i = 0; i < guideState.sequenceTimers.length; i++) {
      clearTimeout(guideState.sequenceTimers[i]);
    }
    guideState.sequenceTimers = [];
  }

  function addSequenceTimer(fn, delayMs) {
    var t = setTimeout(function () {
      fn();
    }, delayMs);
    guideState.sequenceTimers.push(t);
    return t;
  }

  // ---------------------------------------------------------------------------
  // SVG Renderers: Shakir & Pip
  // ---------------------------------------------------------------------------
  function renderShakirFigureSvg(opts) {
    opts = opts || {};
    var w = opts.w || 56;
    var h = opts.h || 104;
    var uid = opts.unique || 'shakir_' + Math.floor(Math.random() * 100000);

    return (
      '<svg class="walker-svg shakir-walker-svg" viewBox="0 0 72 108" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Shakir - SearchO2 OxyEco Forger">' +
        '<defs>' +
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
          '<linearGradient id="shG_' + uid + '_hair" x1="0" y1="0" x2="0.8" y2="1">' +
            '<stop offset="0%" stop-color="#5A3622"/>' +
            '<stop offset="45%" stop-color="#3D2314"/>' +
            '<stop offset="100%" stop-color="#1E1008"/>' +
          '</linearGradient>' +
          '<linearGradient id="shG_' + uid + '_hairSpike" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#78472E"/>' +
            '<stop offset="50%" stop-color="#4A2B18"/>' +
            '<stop offset="100%" stop-color="#241309"/>' +
          '</linearGradient>' +
          '<linearGradient id="shG_' + uid + '_shirtWhite" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#FFFFFF"/>' +
            '<stop offset="60%" stop-color="#F1F5F9"/>' +
            '<stop offset="100%" stop-color="#CBD5E1"/>' +
          '</linearGradient>' +
          '<linearGradient id="shG_' + uid + '_shirtGray" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#94A3B8"/>' +
            '<stop offset="100%" stop-color="#64748B"/>' +
          '</linearGradient>' +
          '<linearGradient id="shG_' + uid + '_shorts" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#9A4D1C"/>' +
            '<stop offset="50%" stop-color="#78350F"/>' +
            '<stop offset="100%" stop-color="#451A03"/>' +
          '</linearGradient>' +
          '<linearGradient id="shG_' + uid + '_bootGreen" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#166534"/>' +
            '<stop offset="50%" stop-color="#14532D"/>' +
            '<stop offset="100%" stop-color="#052E16"/>' +
          '</linearGradient>' +
          '<linearGradient id="shG_' + uid + '_bootSole" x1="0" y1="0" x2="1" y2="0">' +
            '<stop offset="0%" stop-color="#3B2314"/>' +
            '<stop offset="50%" stop-color="#22140A"/>' +
            '<stop offset="100%" stop-color="#0F0904"/>' +
          '</linearGradient>' +
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
          '<linearGradient id="shG_' + uid + '_glove" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#475569"/>' +
            '<stop offset="50%" stop-color="#334155"/>' +
            '<stop offset="100%" stop-color="#1E293B"/>' +
          '</linearGradient>' +
          '<linearGradient id="shG_' + uid + '_stickShaft" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#FDE047"/>' +
            '<stop offset="35%" stop-color="#F59E0B"/>' +
            '<stop offset="85%" stop-color="#D97706"/>' +
            '<stop offset="100%" stop-color="#92400E"/>' +
          '</linearGradient>' +
          '<radialGradient id="shG_' + uid + '_stickOrb" cx="40%" cy="40%" r="65%">' +
            '<stop offset="0%" stop-color="#A7F3D0"/>' +
            '<stop offset="40%" stop-color="#34D399"/>' +
            '<stop offset="85%" stop-color="#059669"/>' +
            '<stop offset="100%" stop-color="#064E3B"/>' +
          '</radialGradient>' +
        '</defs>' +
        // Ground Shadow
        '<ellipse class="av-shadow" cx="36" cy="94" rx="19" ry="6" fill="rgba(15,23,42,0.32)"/>' +
        // Legs & Boots
        '<g class="av-leg-left">' +
          '<rect x="23" y="58" width="9.5" height="13" rx="3.5" fill="url(#shG_' + uid + '_shorts)"/>' +
          '<rect x="24.5" y="69" width="7" height="9" rx="2" fill="url(#shG_' + uid + '_skin)"/>' +
          '<rect x="24" y="76" width="7.8" height="5.5" rx="1.5" fill="#1F2937"/>' +
          '<path d="M22.5 80 L33.5 80 L34.5 88 L21.5 88 Z" fill="url(#shG_' + uid + '_bootGreen)" stroke="#052E16" stroke-width="0.6"/>' +
          '<path d="M20.5 89 L35.5 89 L35 92.5 L21 92.5 Z" fill="url(#shG_' + uid + '_bootSole)"/>' +
        '</g>' +
        '<g class="av-leg-right">' +
          '<rect x="39" y="58" width="9.5" height="13" rx="3.5" fill="url(#shG_' + uid + '_shorts)"/>' +
          '<rect x="40.5" y="69" width="7" height="9" rx="2" fill="url(#shG_' + uid + '_skin)"/>' +
          '<rect x="40" y="76" width="7.8" height="5.5" rx="1.5" fill="#1F2937"/>' +
          '<path d="M38.5 80 L49.5 80 L50.5 88 L37.5 88 Z" fill="url(#shG_' + uid + '_bootGreen)" stroke="#052E16" stroke-width="0.6"/>' +
          '<path d="M36.5 89 L51.5 89 L51 92.5 L37 92.5 Z" fill="url(#shG_' + uid + '_bootSole)"/>' +
        '</g>' +
        // Torso
        '<g class="av-torso">' +
          '<g class="av-torso-front">' +
            '<path d="M30 33 L36 38 L42 33 Z" fill="url(#shG_' + uid + '_shirtGray)"/>' +
            '<path d="M21 34 L36 31 L51 34 L48 59 L24 59 Z" fill="url(#shG_' + uid + '_shirtWhite)" stroke="#CBD5E1" stroke-width="0.8"/>' +
            '<line x1="36" y1="31" x2="36" y2="54" stroke="#94A3B8" stroke-width="1.1"/>' +
            '<line x1="27" y1="34" x2="27" y2="56" stroke="#475569" stroke-width="2.2"/>' +
            '<line x1="45" y1="34" x2="45" y2="56" stroke="#475569" stroke-width="2.2"/>' +
            '<g class="shakir-ceo-badge" transform="translate(42, 40)">' +
              '<circle cx="4" cy="4" r="4.2" fill="url(#shG_' + uid + '_badgeGold)" stroke="#78350F" stroke-width="0.5"/>' +
              '<circle cx="4" cy="4" r="3.1" fill="url(#shG_' + uid + '_badgeGreen)"/>' +
            '</g>' +
            '<rect x="23" y="55" width="26" height="5" rx="1.5" fill="url(#shG_' + uid + '_shorts)"/>' +
            '<rect x="33.5" y="54.5" width="5" height="5.5" rx="1.2" fill="#EAB308" stroke="#CA8A04" stroke-width="0.6"/>' +
          '</g>' +
        '</g>' +
        // Arms
        '<g class="av-arm-left">' +
          '<rect x="13.5" y="33" width="8" height="9" rx="3" fill="url(#shG_' + uid + '_shirtWhite)" stroke="#CBD5E1" stroke-width="0.6"/>' +
          '<rect x="14" y="41" width="7" height="12" rx="2.5" fill="url(#shG_' + uid + '_shirtGray)"/>' +
          '<rect x="13.5" y="52" width="8" height="7.5" rx="2.8" fill="url(#shG_' + uid + '_glove)" stroke="#1E293B" stroke-width="0.5"/>' +
        '</g>' +
        '<g class="av-arm-right shakir-scanner-arm">' +
          '<rect x="50.5" y="33" width="8" height="9" rx="3" fill="url(#shG_' + uid + '_shirtWhite)" stroke="#CBD5E1" stroke-width="0.6"/>' +
          '<rect x="51" y="41" width="7" height="11" rx="2.5" fill="url(#shG_' + uid + '_shirtGray)"/>' +
          '<rect x="50.5" y="50" width="8" height="7.5" rx="2.8" fill="url(#shG_' + uid + '_glove)" stroke="#1E293B" stroke-width="0.5"/>' +
          '<g class="shakir-device" transform="translate(48, 52)">' +
            '<rect x="0" y="2" width="12" height="16" rx="2.8" fill="url(#shG_' + uid + '_device)" stroke="#0284C7" stroke-width="0.7"/>' +
            '<rect x="1.5" y="3.5" width="9" height="10" rx="1.5" fill="url(#shG_' + uid + '_screen)" stroke="#0369A1" stroke-width="0.5"/>' +
          '</g>' +
          '<g class="shakir-wonder-stick" transform="translate(54, 46)">' +
            '<rect x="-1.8" y="-24" width="3.6" height="34" rx="1.8" fill="url(#shG_' + uid + '_stickShaft)" stroke="#B45309" stroke-width="0.6"/>' +
            '<path d="M-1.8 -20 Q1.8 -16 -1.8 -12 Q1.8 -8 -1.8 -4 Q1.8 0 -1.8 4" fill="none" stroke="#10B981" stroke-width="1.1" stroke-linecap="round"/>' +
            '<circle cx="0" cy="-30" r="5" fill="url(#shG_' + uid + '_stickOrb)" stroke="#34D399" stroke-width="1.2"/>' +
          '</g>' +
        '</g>' +
        // Head
        '<g class="av-head">' +
          '<g class="av-head-front">' +
            '<path d="M32 28 L40 28 L40 33 L32 33 Z" fill="url(#shG_' + uid + '_skin)"/>' +
            '<path class="av-ear-left" d="M22 18.5 Q17 21.5 22 25 Z" fill="#DFA07A" stroke="#A86B49" stroke-width="0.7"/>' +
            '<path class="av-ear-right" d="M50 18.5 Q55 21.5 50 25 Z" fill="#E8B494" stroke="#C58562" stroke-width="0.7"/>' +
            '<circle cx="36" cy="20" r="12.5" fill="url(#shG_' + uid + '_skin)" stroke="#C58562" stroke-width="0.6"/>' +
            '<g class="av-face-features">' +
              '<ellipse cx="31.5" cy="20.5" rx="2.3" ry="2.7" fill="#1E293B"/>' +
              '<circle cx="31" cy="19.5" r="1" fill="#FFFFFF"/>' +
              '<ellipse cx="40.5" cy="20.5" rx="2.3" ry="2.7" fill="#1E293B"/>' +
              '<circle cx="40" cy="19.5" r="1" fill="#FFFFFF"/>' +
              '<path d="M35 21.5 Q36 23.5 37 21.5" fill="none" stroke="#C58562" stroke-width="1.1" stroke-linecap="round"/>' +
              '<path d="M32 24.5 Q36 27.5 40 24.5" fill="none" stroke="#5A3622" stroke-width="1.5" stroke-linecap="round"/>' +
              '<circle cx="28.5" cy="23.5" r="2.4" fill="url(#shG_' + uid + '_cheeks)"/>' +
              '<circle cx="43.5" cy="23.5" r="2.4" fill="url(#shG_' + uid + '_cheeks)"/>' +
            '</g>' +
            '<g class="shakir-hair-front">' +
              '<path d="M23 18 Q36 7 49 18 Q47 13 41 12 Q36 8 30 11 Q25 14 23 18 Z" fill="url(#shG_' + uid + '_hair)"/>' +
              '<polygon points="26,14 21,5 29,10" fill="url(#shG_' + uid + '_hairSpike)"/>' +
              '<polygon points="29,11 31,3 36,9" fill="url(#shG_' + uid + '_hairSpike)"/>' +
              '<polygon points="35,9 40,3 42,10" fill="url(#shG_' + uid + '_hairSpike)"/>' +
              '<polygon points="42,10 49,6 45,15" fill="url(#shG_' + uid + '_hairSpike)"/>' +
            '</g>' +
          '</g>' +
        '</g>' +
      '</svg>'
    );
  }

  function renderPipFigureSvg(opts) {
    opts = opts || {};
    var w = opts.w || 44;
    var h = opts.h || 56;
    var uid = opts.unique || 'pip_' + Math.floor(Math.random() * 100000);

    return (
      '<svg class="walker-svg pip-mouse-svg" viewBox="0 0 140 170" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pip Squeak-a-Link - Safety Scout Mouse">' +
        '<defs>' +
          '<radialGradient id="pipG_' + uid + '_wand" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#4ADE80"/>' +
            '<stop offset="70%" stop-color="#22C55E"/>' +
            '<stop offset="100%" stop-color="#15803D"/>' +
          '</radialGradient>' +
          '<linearGradient id="pipG_' + uid + '_shirt" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#22D3EE"/>' +
            '<stop offset="100%" stop-color="#0891B2"/>' +
          '</linearGradient>' +
          '<linearGradient id="pipG_' + uid + '_shorts" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#FB923C"/>' +
            '<stop offset="100%" stop-color="#EA580C"/>' +
          '</linearGradient>' +
        '</defs>' +
        // Ground shadow
        '<ellipse cx="70" cy="164" rx="40" ry="6" fill="rgba(0,0,0,0.32)"/>' +
        // Tail
        '<g class="pip-tail">' +
          '<path d="M 68 144 C 94 144, 118 135, 124 112 C 128 92, 114 78, 106 82 C 98 86, 104 98, 112 102 Z" fill="#F9A8D4" stroke="#F472B6" stroke-width="0.8"/>' +
        '</g>' +
        // Left Foot & Sneaker (Lime Green with Waffle Soles)
        '<path d="M 50 148 L 62 148 L 64 160 L 44 160 Z" fill="#84CC16"/>' +
        '<rect x="42" y="158" width="24" height="4" rx="1.5" fill="#E2E8F0" stroke="#94A3B8" stroke-width="0.8"/>' +
        '<line x1="48" y1="160" x2="48" y2="162" stroke="#64748B" stroke-width="1.2"/>' +
        '<line x1="54" y1="160" x2="54" y2="162" stroke="#64748B" stroke-width="1.2"/>' +
        '<line x1="60" y1="160" x2="60" y2="162" stroke="#64748B" stroke-width="1.2"/>' +
        // Right Foot & Sneaker (Lime Green with Waffle Soles)
        '<path d="M 76 148 L 88 148 L 94 160 L 74 160 Z" fill="#84CC16"/>' +
        '<rect x="72" y="158" width="24" height="4" rx="1.5" fill="#E2E8F0" stroke="#94A3B8" stroke-width="0.8"/>' +
        '<line x1="78" y1="160" x2="78" y2="162" stroke="#64748B" stroke-width="1.2"/>' +
        '<line x1="84" y1="160" x2="84" y2="162" stroke="#64748B" stroke-width="1.2"/>' +
        '<line x1="90" y1="160" x2="90" y2="162" stroke="#64748B" stroke-width="1.2"/>' +
        // Hi-Vis Orange Twill Shorts
        '<path d="M 50 128 L 90 128 L 94 150 L 76 150 L 74 142 L 72 142 L 70 150 L 46 150 Z" fill="url(#pipG_' + uid + '_shorts)"/>' +
        '<line x1="70" y1="128" x2="70" y2="142" stroke="#C2410C" stroke-width="1.5"/>' +
        // Cyan Tropical Hawaiian Floral Shirt
        '<path d="M 46 94 L 94 94 L 92 130 L 48 130 Z" fill="url(#pipG_' + uid + '_shirt)"/>' +
        // Floral blossoms
        '<circle cx="56" cy="104" r="2.5" fill="#FDE047"/>' +
        '<circle cx="54" cy="102" r="1.5" fill="#FFFFFF"/>' +
        '<circle cx="58" cy="102" r="1.5" fill="#FFFFFF"/>' +
        '<circle cx="56" cy="106" r="1.5" fill="#FFFFFF"/>' +
        '<circle cx="82" cy="108" r="2.5" fill="#FDE047"/>' +
        '<circle cx="80" cy="106" r="1.5" fill="#FFFFFF"/>' +
        '<circle cx="84" cy="106" r="1.5" fill="#FFFFFF"/>' +
        '<circle cx="82" cy="110" r="1.5" fill="#FFFFFF"/>' +
        '<circle cx="68" cy="118" r="2.5" fill="#FDE047"/>' +
        '<circle cx="66" cy="116" r="1.5" fill="#FFFFFF"/>' +
        '<circle cx="70" cy="116" r="1.5" fill="#FFFFFF"/>' +
        '<ellipse cx="70" cy="104" rx="8" ry="10" fill="#F3E8D6"/>' +
        // Insulated Yellow Electrical Torque Wrench on Hip
        '<g class="pip-wrench-arm" transform="translate(42, 122)">' +
          '<rect x="-2" y="0" width="5" height="18" rx="1.5" fill="#EAB308" stroke="#CA8A04" stroke-width="0.7"/>' +
          '<path d="M -5 18 L 1 18 L 1 23 L -2 23 L -2 20 L -5 20 Z" fill="#94A3B8"/>' +
        '</g>' +
        // Unified Head Root Node
        '<g class="pip-head-root">' +
          '<g class="pip-ears">' +
            '<circle cx="44" cy="46" r="18" fill="#9C744A"/>' +
            '<circle cx="44" cy="46" r="12" fill="#F472B6"/>' +
            '<circle cx="44" cy="46" r="7" fill="#FBCFE8"/>' +
            '<circle cx="96" cy="46" r="18" fill="#9C744A"/>' +
            '<circle cx="96" cy="46" r="12" fill="#F472B6"/>' +
            '<circle cx="96" cy="46" r="7" fill="#FBCFE8"/>' +
          '</g>' +
          '<ellipse cx="70" cy="68" rx="22" ry="24" fill="#9C744A"/>' +
          '<ellipse cx="70" cy="74" rx="14" ry="16" fill="#F3E8D6"/>' +
          '<ellipse cx="70" cy="84" rx="4" ry="3.5" fill="#F472B6"/>' +
          '<line x1="56" y1="83" x2="40" y2="80" stroke="#9C744A" stroke-width="1.2"/>' +
          '<line x1="56" y1="86" x2="40" y2="87" stroke="#9C744A" stroke-width="1.2"/>' +
          '<line x1="84" y1="83" x2="100" y2="80" stroke="#9C744A" stroke-width="1.2"/>' +
          '<line x1="84" y1="86" x2="100" y2="87" stroke="#9C744A" stroke-width="1.2"/>' +
          '<ellipse cx="61" cy="66" rx="4.5" ry="5.5" fill="#0F172A"/>' +
          '<circle cx="62.5" cy="64.5" r="1.5" fill="#FFFFFF"/>' +
          '<circle cx="59.5" cy="67.5" r="0.8" fill="#FFFFFF"/>' +
          '<ellipse cx="79" cy="66" rx="4.5" ry="5.5" fill="#0F172A"/>' +
          '<circle cx="80.5" cy="64.5" r="1.5" fill="#FFFFFF"/>' +
          '<circle cx="77.5" cy="67.5" r="0.8" fill="#FFFFFF"/>' +
        '</g>' +
        // Marshaling Wands
        '<g class="pip-wand-left">' +
          '<rect x="22" y="80" width="8" height="36" rx="4" fill="url(#pipG_' + uid + '_wand)"/>' +
          '<rect x="23" y="112" width="6" height="12" rx="2" fill="#EAB308"/>' +
          '<circle cx="26" cy="80" r="6" fill="#4ADE80" opacity="0.65"/>' +
          '<ellipse cx="28" cy="112" rx="5" ry="5" fill="#F3E8D6"/>' +
        '</g>' +
        '<g class="pip-wand-right">' +
          '<rect x="108" y="80" width="8" height="36" rx="4" fill="url(#pipG_' + uid + '_wand)"/>' +
          '<rect x="109" y="112" width="6" height="12" rx="2" fill="#EAB308"/>' +
          '<circle cx="112" cy="80" r="6" fill="#4ADE80" opacity="0.65"/>' +
          '<ellipse cx="110" cy="112" rx="5" ry="5" fill="#F3E8D6"/>' +
        '</g>' +
      '</svg>'
    );
  }

  // ---------------------------------------------------------------------------
  // CSS Styles: Shakir, Pip, Non-Overlapping Bubbles, Dynamic Subtitle Dock & Victory Modal
  // ---------------------------------------------------------------------------
  function ensureShakirStyles() {
    if (document.getElementById('s2ShakirGuideStyles')) return;
    var style = document.createElement('style');
    style.id = 's2ShakirGuideStyles';
    style.textContent = [
      // Shakir Sprite
      '.s2-shakir-guide {',
      '  position: absolute;',
      '  width: 56px;',
      '  height: 104px;',
      '  transform: translate(-50%, -85%);',
      '  cursor: pointer;',
      '  pointer-events: auto;',
      '  z-index: 52;',
      '  transition: filter 0.2s ease;',
      '  will-change: left, top, transform;',
      '  user-select: none;',
      '}',
      '.s2-shakir-guide .shakir-walker-svg {',
      '  width: 56px !important;',
      '  height: 104px !important;',
      '  display: block !important;',
      '  overflow: visible !important;',
      '  flex-shrink: 0 !important;',
      '  transform-origin: 36px 90px;',
      '}',
      '.s2-shakir-guide:hover {',
      '  filter: drop-shadow(0 6px 16px rgba(14, 165, 233, 0.55)) brightness(1.05);',
      '}',

      // Pip Companion Sprite
      '.s2-pip-companion {',
      '  position: absolute;',
      '  width: 44px;',
      '  height: 56px;',
      '  transform: translate(-50%, -85%);',
      '  cursor: pointer;',
      '  pointer-events: auto;',
      '  z-index: 51;',
      '  transition: filter 0.2s ease;',
      '  will-change: left, top, transform;',
      '  user-select: none;',
      '}',
      '.s2-pip-companion .pip-mouse-svg {',
      '  width: 44px !important;',
      '  height: 56px !important;',
      '  display: block !important;',
      '  overflow: visible !important;',
      '  flex-shrink: 0 !important;',
      '  transform-origin: 70px 145px;',
      '}',
      '.s2-pip-companion:hover {',
      '  filter: drop-shadow(0 4px 14px rgba(245, 158, 11, 0.55)) brightness(1.06);',
      '}',

      // Head Tags
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
      '  pointer-events: none;',
      '}',
      '.pip-head-tag {',
      '  position: absolute;',
      '  top: -22px;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);',
      '  color: #FFFFFF;',
      '  border: 1px solid #FDE047;',
      '  border-radius: 999px;',
      '  padding: 2px 7px;',
      '  font-size: 0.58rem;',
      '  font-weight: 900;',
      '  font-family: Nunito, system-ui, sans-serif;',
      '  white-space: nowrap;',
      '  box-shadow: 0 3px 8px rgba(217, 119, 6, 0.35);',
      '  pointer-events: none;',
      '}',

      // Non-Overlapping In-World Speech Bubbles
      '.shakir-speech-bubble {',
      '  position: absolute;',
      '  bottom: 115%;',
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
      '  z-index: 65;',
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

      // Pip's speech bubble is offset cleanly to Pip's side so it NEVER covers Shakir's view
      '.pip-speech-bubble {',
      '  position: absolute;',
      '  bottom: 112%;',
      '  left: 50%;',
      '  transform: translateX(-20%) scale(1);',
      '  background: #FFFFFF;',
      '  color: #0F172A;',
      '  border: 2px solid #F59E0B;',
      '  border-radius: 14px;',
      '  padding: 6px 11px;',
      '  font-size: 0.72rem;',
      '  font-weight: 800;',
      '  font-family: Nunito, system-ui, sans-serif;',
      '  line-height: 1.3;',
      '  box-shadow: 0 6px 18px rgba(245, 158, 11, 0.28);',
      '  width: max-content;',
      '  max-width: 210px;',
      '  text-align: center;',
      '  z-index: 65;',
      '  pointer-events: auto;',
      '  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1);',
      '}',
      '.pip-speech-bubble:after {',
      '  content: "";',
      '  position: absolute;',
      '  top: 100%;',
      '  left: 28%;',
      '  transform: translateX(-50%);',
      '  border-width: 6px;',
      '  border-style: solid;',
      '  border-color: #F59E0B transparent transparent transparent;',
      '}',
      '.pip-speech-bubble.hidden {',
      '  opacity: 0;',
      '  transform: translateX(-20%) scale(0.85);',
      '  pointer-events: none;',
      '}',

      // Facing Directions
      '.s2-shakir-guide.facing-east .walker-svg { transform: scaleX(-1); }',
      '.s2-shakir-guide.facing-west .walker-svg { transform: scaleX(1); }',
      '.s2-pip-companion.facing-east .pip-mouse-svg { transform: scaleX(-1); }',
      '.s2-pip-companion.facing-west .pip-mouse-svg { transform: scaleX(1); }',

      // Smooth Human Strolling Dynamic
      '.s2-shakir-guide.walking .shakir-walker-svg {',
      '  animation: shakirWalkBob 0.60s ease-in-out infinite alternate;',
      '}',
      '@keyframes shakirWalkBob {',
      '  0% { transform: translateY(0); }',
      '  100% { transform: translateY(-4px); }',
      '}',
      '.s2-shakir-guide.walking .av-leg-left {',
      '  transform-origin: 27px 58px;',
      '  animation: shakirLegSwingLeft 0.60s ease-in-out infinite alternate;',
      '}',
      '.s2-shakir-guide.walking .av-leg-right {',
      '  transform-origin: 43px 58px;',
      '  animation: shakirLegSwingRight 0.60s ease-in-out infinite alternate;',
      '}',
      '@keyframes shakirLegSwingLeft {',
      '  0% { transform: rotate(-16deg); }',
      '  100% { transform: rotate(16deg); }',
      '}',
      '@keyframes shakirLegSwingRight {',
      '  0% { transform: rotate(16deg); }',
      '  100% { transform: rotate(-16deg); }',
      '}',
      '.s2-shakir-guide.walking .av-arm-left {',
      '  transform-origin: 17px 34px;',
      '  animation: shakirArmSwingLeft 0.60s ease-in-out infinite alternate;',
      '}',
      '@keyframes shakirArmSwingLeft {',
      '  0% { transform: rotate(16deg); }',
      '  100% { transform: rotate(-16deg); }',
      '}',

      // Pip Toddler Waddle Bobbing
      '.s2-pip-companion.walking .pip-mouse-svg {',
      '  animation: pipWaddleBob 0.42s ease-in-out infinite alternate;',
      '}',
      '@keyframes pipWaddleBob {',
      '  0% { transform: translateY(0) rotate(-4deg); }',
      '  100% { transform: translateY(-4px) rotate(4deg); }',
      '}',

      // Pip Diverse Animations
      '.s2-pip-companion.pip-anim-wand-wave .pip-wand-left {',
      '  transform-origin: 26px 112px;',
      '  animation: pipWandSignalLeft 0.65s ease-in-out infinite alternate;',
      '}',
      '.s2-pip-companion.pip-anim-wand-wave .pip-wand-right {',
      '  transform-origin: 110px 112px;',
      '  animation: pipWandSignalRight 0.65s ease-in-out infinite alternate;',
      '}',
      '@keyframes pipWandSignalLeft {',
      '  0% { transform: rotate(-18deg) translateY(0); }',
      '  100% { transform: rotate(38deg) translateY(-8px); }',
      '}',
      '@keyframes pipWandSignalRight {',
      '  0% { transform: rotate(38deg) translateY(-8px); }',
      '  100% { transform: rotate(-18deg) translateY(0); }',
      '}',
      '.s2-pip-companion.pip-anim-hop .pip-mouse-svg {',
      '  animation: pipHopBounce 0.55s cubic-bezier(0.2, 0.9, 0.3, 1) infinite;',
      '}',
      '@keyframes pipHopBounce {',
      '  0%, 100% { transform: translateY(0) scaleY(1); }',
      '  40% { transform: translateY(-14px) scaleY(1.08); }',
      '  70% { transform: translateY(0) scaleY(0.92); }',
      '}',
      '.s2-pip-companion.pip-anim-whirl .pip-mouse-svg {',
      '  animation: pipWhirlJump 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;',
      '}',
      '@keyframes pipWhirlJump {',
      '  0% { transform: translateY(0) rotate(0deg) scale(1); }',
      '  25% { transform: translateY(-16px) rotate(14deg) scale(1.12); }',
      '  50% { transform: translateY(-24px) rotate(-14deg) scale(1.16); }',
      '  75% { transform: translateY(-6px) rotate(6deg) scale(0.96); }',
      '  100% { transform: translateY(0) rotate(0deg) scale(1); }',
      '}',
      '.s2-pip-companion.pip-anim-ear-sniff .pip-ears {',
      '  transform-origin: 70px 46px;',
      '  animation: pipEarFlutter 0.4s ease-in-out infinite alternate;',
      '}',
      '@keyframes pipEarFlutter {',
      '  0% { transform: rotate(-6deg) scale(0.98); }',
      '  100% { transform: rotate(6deg) scale(1.04); }',
      '}',
      '.s2-pip-companion.pip-anim-wrench .pip-wrench-arm {',
      '  transform-origin: 42px 122px;',
      '  animation: pipWrenchTinker 0.7s ease-in-out infinite alternate;',
      '}',
      '@keyframes pipWrenchTinker {',
      '  0% { transform: rotate(0deg); }',
      '  100% { transform: rotate(-40deg) translateY(-4px); }',
      '}',

      // Wonder Touch & Directing Beam
      '.s2-shakir-guide.wonder-touching .shakir-scanner-arm {',
      '  transform-origin: 54px 34px;',
      '  animation: shakirWonderReach 0.9s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;',
      '}',
      '@keyframes shakirWonderReach {',
      '  0% { transform: rotate(0); }',
      '  50% { transform: rotate(-105deg) translateY(-8px) scale(1.08); }',
      '  100% { transform: rotate(-95deg) translateY(-6px) scale(1.05); }',
      '}',
      '.s2-shakir-guide.wonder-touching .shakir-device {',
      '  filter: drop-shadow(0 0 10px #38BDF8) drop-shadow(0 0 20px #67E8F9);',
      '}',
      '.shakir-wonder-beam {',
      '  position: absolute;',
      '  height: 3px;',
      '  background: linear-gradient(90deg, #38BDF8 0%, #22C55E 70%, #FDE047 100%);',
      '  transform-origin: 0 50%;',
      '  pointer-events: none;',
      '  z-index: 55;',
      '  box-shadow: 0 0 12px #38BDF8, 0 0 20px #22C55E;',
      '  animation: wonderBeamFlash 0.65s ease-out forwards;',
      '}',
      '@keyframes wonderBeamFlash {',
      '  0% { opacity: 0; transform: scaleY(0.4); }',
      '  40% { opacity: 1; transform: scaleY(1.4); }',
      '  100% { opacity: 0; transform: scaleY(0.2); }',
      '}',
      '.s2-touch-ripple {',
      '  position: absolute;',
      '  width: 64px;',
      '  height: 64px;',
      '  transform: translate(-50%, -50%);',
      '  pointer-events: none;',
      '  z-index: 54;',
      '  animation: touchRipplePop 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;',
      '}',
      '@keyframes touchRipplePop {',
      '  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }',
      '  100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }',
      '}',
      '.s2-sky-heading {',
      '  position: absolute;',
      '  transform: translate(-50%, -50%);',
      '  background: rgba(15, 23, 42, 0.92);',
      '  color: #F8FAFC;',
      '  border: 1.5px solid #38BDF8;',
      '  border-radius: 999px;',
      '  padding: 6px 16px;',
      '  font-size: 0.82rem;',
      '  font-weight: 800;',
      '  font-family: Nunito, system-ui, sans-serif;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  z-index: 65;',
      '  pointer-events: none;',
      '  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 14px rgba(56, 189, 248, 0.35);',
      '  animation: skyHeadFade 3.2s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;',
      '}',
      '@keyframes skyHeadFade {',
      '  0% { opacity: 0; transform: translate(-50%, -35%); }',
      '  12% { opacity: 1; transform: translate(-50%, -50%); }',
      '  80% { opacity: 1; transform: translate(-50%, -50%); }',
      '  100% { opacity: 0; transform: translate(-50%, -65%); }',
      '}',

      // =========================================================================
      // DYNAMICALLY POSITIONED SUBTITLE DOCK (NEVER BLOCKS SHAKIR OR PIP!)
      // =========================================================================
      '#shakirPipSubtitleDock,',
      '#shakirPipSubtitleDock.dock-left,',
      '#shakirPipSubtitleDock.dock-right {',
      '  position: fixed;',
      '  bottom: 18px;',
      '  left: 88px !important;',
      '  right: auto !important;',
      '  z-index: 9250;',
      '  width: min(620px, calc(100vw - 260px));',
      '  max-width: 640px;',
      '  background: linear-gradient(135deg, rgba(6, 36, 23, 0.96) 0%, rgba(3, 20, 13, 0.98) 100%);',
      '  border: 1.5px solid rgba(52, 211, 153, 0.55);',
      '  border-radius: 18px;',
      '  padding: 10px 16px;',
      '  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5), 0 0 18px rgba(52, 211, 153, 0.25);',
      '  backdrop-filter: blur(12px);',
      '  -webkit-backdrop-filter: blur(12px);',
      '  font-family: Nunito, system-ui, -apple-system, sans-serif;',
      '  color: #F8FAFC;',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 6px;',
      '  transition: opacity 0.25s ease, transform 0.25s ease;',
      '  box-sizing: border-box;',
      '  pointer-events: auto;',
      '}',
      '#shakirPipSubtitleDock.minimized {',
      '  display: none !important;',
      '}',
      '.sub-header-row {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 10px;',
      '  border-bottom: 1px solid rgba(52, 211, 153, 0.25);',
      '  padding-bottom: 5px;',
      '}',
      '.sub-speaker-info {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  min-width: 0;',
      '  flex: 1;',
      '}',
      '.sub-speaker-avatar {',
      '  width: 32px;',
      '  height: 32px;',
      '  border-radius: 50%;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: 1.15rem;',
      '  background: rgba(15, 23, 42, 0.85);',
      '  border: 1.5px solid #34D399;',
      '  flex-shrink: 0;',
      '  box-shadow: 0 0 10px rgba(52, 211, 153, 0.4);',
      '}',
      '.sub-speaker-avatar.shakir {',
      '  border-color: #38BDF8;',
      '  box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);',
      '}',
      '.sub-speaker-avatar.pip {',
      '  border-color: #F59E0B;',
      '  box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);',
      '}',
      '.sub-speaker-meta {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '  min-width: 0;',
      '  flex-wrap: wrap;',
      '}',
      '.sub-speaker-name {',
      '  font-size: 0.82rem;',
      '  font-weight: 900;',
      '  white-space: nowrap;',
      '}',
      '.sub-speaker-name.shakir { color: #38BDF8; }',
      '.sub-speaker-name.pip { color: #FDE047; }',
      '.sub-speaker-role {',
      '  font-size: 0.60rem;',
      '  font-weight: 800;',
      '  padding: 1px 6px;',
      '  border-radius: 999px;',
      '  white-space: nowrap;',
      '  letter-spacing: 0.3px;',
      '}',
      '.sub-speaker-role.shakir {',
      '  background: rgba(56, 189, 248, 0.2);',
      '  color: #BAE6FD;',
      '  border: 1px solid rgba(56, 189, 248, 0.4);',
      '}',
      '.sub-speaker-role.pip {',
      '  background: rgba(245, 158, 11, 0.2);',
      '  color: #FDE68A;',
      '  border: 1px solid rgba(245, 158, 11, 0.4);',
      '}',
      '.sub-chapter-chip {',
      '  font-size: 0.60rem;',
      '  font-weight: 700;',
      '  color: #A7F3D0;',
      '  background: rgba(52, 211, 153, 0.15);',
      '  padding: 1px 6px;',
      '  border-radius: 6px;',
      '  white-space: nowrap;',
      '}',
      '.sub-controls-group {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '  flex-shrink: 0;',
      '}',
      '.sub-ctrl-btn {',
      '  background: rgba(15, 23, 42, 0.7);',
      '  border: 1px solid rgba(52, 211, 153, 0.4);',
      '  color: #E2E8F0;',
      '  border-radius: 8px;',
      '  width: 26px;',
      '  height: 26px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: 0.76rem;',
      '  cursor: pointer;',
      '  transition: all 0.15s ease;',
      '}',
      '.sub-ctrl-btn:hover {',
      '  background: rgba(52, 211, 153, 0.25);',
      '  border-color: #34D399;',
      '  color: #FFF;',
      '}',
      '.sub-next-btn {',
      '  width: auto !important;',
      '  padding: 0 9px !important;',
      '  font-weight: 800 !important;',
      '  font-size: 0.72rem !important;',
      '  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;',
      '  border: 1px solid #34D399 !important;',
      '  color: #FFFFFF !important;',
      '}',
      '.sub-next-btn:hover {',
      '  background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;',
      '  box-shadow: 0 0 10px rgba(52, 211, 153, 0.5) !important;',
      '}',
      '.sub-text-row {',
      '  font-size: 0.78rem;',
      '  line-height: 1.45;',
      '  color: #F1F5F9;',
      '  font-weight: 600;',
      '  min-height: 38px;',
      '}',
      '.sub-progress-dots {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 4px;',
      '  margin-top: 2px;',
      '}',
      '.sub-dot {',
      '  width: 6px;',
      '  height: 6px;',
      '  border-radius: 50%;',
      '  background: rgba(255, 255, 255, 0.25);',
      '  transition: all 0.2s ease;',
      '}',
      '.sub-dot.active {',
      '  background: #34D399;',
      '  box-shadow: 0 0 6px #34D399;',
      '  width: 14px;',
      '  border-radius: 999px;',
      '}',
      '.sub-dot.done {',
      '  background: #10B981;',
      '}',

      '@media (max-width: 768px) {',
      '  #shakirPipSubtitleDock {',
      '    bottom: 68px !important;',
      '    left: 8px !important;',
      '    right: 8px !important;',
      '    width: auto !important;',
      '    max-width: calc(100vw - 16px) !important;',
      '    padding: 8px 12px !important;',
      '  }',
      '}',
      '#modalLayer {',
      '  position: relative;',
      '  z-index: 100010 !important;',
      '}',
      '#modalOverlay.overlay,',
      '.overlay#modalOverlay,',
      '.overlay {',
      '  position: fixed !important;',
      '  inset: 0 !important;',
      '  z-index: 100010 !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  pointer-events: auto !important;',
      '}',
      '.cartoon-roadmap-modal {',
      '  position: relative;',
      '  z-index: 100011 !important;',
      '  pointer-events: auto !important;',
      '}',
      '.jute-tarp-spot-card.is-ready-uncover,',
      '.jute-tarp-spot-card.pulse-glow {',
      '  animation: tarpPulseGlow 1.8s infinite ease-in-out;',
      '}',
      '@keyframes tarpPulseGlow {',
      '  0% { filter: drop-shadow(0 0 4px rgba(76, 175, 80, 0.4)); transform: scale(1); }',
      '  50% { filter: drop-shadow(0 0 16px rgba(76, 175, 80, 0.9)); transform: scale(1.05); }',
      '  100% { filter: drop-shadow(0 0 4px rgba(76, 175, 80, 0.4)); transform: scale(1); }',
      '}',

      // =========================================================================
      // CELEBRATORY VICTORY REWARD MODAL (FULL MASTERPLAN REWARDS)
      // =========================================================================
      '.shakir-victory-backdrop {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 100015;',
      '  background: rgba(3, 18, 12, 0.82);',
      '  backdrop-filter: blur(8px);',
      '  -webkit-backdrop-filter: blur(8px);',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 16px;',
      '  box-sizing: border-box;',
      '  animation: vicFadeIn 0.3s ease;',
      '}',
      '@keyframes vicFadeIn {',
      '  from { opacity: 0; }',
      '  to { opacity: 1; }',
      '}',
      '.shakir-victory-card {',
      '  background: radial-gradient(ellipse at 50% 0%, #0E3E28 0%, #062316 65%, #02120B 100%);',
      '  border: 2px solid #34D399;',
      '  border-radius: 26px;',
      '  max-width: 480px;',
      '  width: 100%;',
      '  padding: 24px;',
      '  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6), 0 0 32px rgba(52, 211, 153, 0.4);',
      '  text-align: center;',
      '  color: #F8FAFC;',
      '  font-family: Nunito, system-ui, sans-serif;',
      '  position: relative;',
      '  animation: vicCardPop 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28);',
      '}',
      '@keyframes vicCardPop {',
      '  from { transform: scale(0.9) translateY(20px); opacity: 0; }',
      '  to { transform: scale(1) translateY(0); opacity: 1; }',
      '}',
      '.vic-banner-pill {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '  background: rgba(253, 224, 71, 0.15);',
      '  border: 1px solid #FDE047;',
      '  color: #FDE047;',
      '  font-size: 0.72rem;',
      '  font-weight: 900;',
      '  padding: 4px 12px;',
      '  border-radius: 999px;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.5px;',
      '  margin-bottom: 12px;',
      '}',
      '.vic-title {',
      '  font-size: 1.35rem;',
      '  font-weight: 900;',
      '  color: #6EE7B7;',
      '  line-height: 1.25;',
      '  margin-bottom: 6px;',
      '}',
      '.vic-subtitle {',
      '  font-size: 0.80rem;',
      '  color: #CBD5E1;',
      '  line-height: 1.4;',
      '  margin-bottom: 18px;',
      '}',
      '.vic-avatars-row {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 16px;',
      '  margin-bottom: 18px;',
      '}',
      '.vic-avatar-box {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  gap: 4px;',
      '}',
      '.vic-avatar-circle {',
      '  width: 56px;',
      '  height: 56px;',
      '  border-radius: 50%;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: 1.8rem;',
      '  background: rgba(15, 23, 42, 0.9);',
      '  border: 2px solid #38BDF8;',
      '  box-shadow: 0 0 16px rgba(56, 189, 248, 0.4);',
      '}',
      '.vic-avatar-circle.pip {',
      '  border-color: #F59E0B;',
      '  box-shadow: 0 0 16px rgba(245, 158, 11, 0.4);',
      '}',
      '.vic-avatar-tag {',
      '  font-size: 0.68rem;',
      '  font-weight: 800;',
      '  color: #E2E8F0;',
      '}',
      '.vic-rewards-grid {',
      '  display: grid;',
      '  grid-template-columns: repeat(3, 1fr);',
      '  gap: 8px;',
      '  margin-bottom: 20px;',
      '}',
      '.vic-reward-item {',
      '  background: rgba(15, 23, 42, 0.7);',
      '  border: 1px solid rgba(52, 211, 153, 0.35);',
      '  border-radius: 14px;',
      '  padding: 10px 6px;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  gap: 3px;',
      '}',
      '.vic-reward-val {',
      '  font-size: 1.05rem;',
      '  font-weight: 900;',
      '  color: #FDE047;',
      '}',
      '.vic-reward-lbl {',
      '  font-size: 0.64rem;',
      '  font-weight: 800;',
      '  color: #94A3B8;',
      '  text-transform: uppercase;',
      '}',
      '.vic-title-badge-box {',
      '  background: linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.25) 100%);',
      '  border: 1.5px solid #FACC15;',
      '  border-radius: 16px;',
      '  padding: 10px 14px;',
      '  margin-bottom: 20px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 8px;',
      '}',
      '.vic-title-badge-text {',
      '  font-size: 0.88rem;',
      '  font-weight: 900;',
      '  color: #FEF08A;',
      '}',
      '.vic-claim-btn {',
      '  width: 100%;',
      '  background: linear-gradient(135deg, #059669 0%, #047857 100%);',
      '  border: 2px solid #34D399;',
      '  color: #FFFFFF;',
      '  border-radius: 14px;',
      '  padding: 12px 18px;',
      '  font-weight: 900;',
      '  font-size: 0.95rem;',
      '  cursor: pointer;',
      '  box-shadow: 0 8px 24px rgba(5, 150, 105, 0.45);',
      '  transition: transform 0.15s ease, box-shadow 0.15s ease;',
      '}',
      '.vic-claim-btn:hover {',
      '  transform: translateY(-2px);',
      '  box-shadow: 0 12px 32px rgba(5, 150, 105, 0.6);',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Layer & Walker Entity Spawning
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
    ensureShakirStyles();
    var layer = ensureWalkerLayer();
    if (!layer) return null;

    var oldPlayer = document.getElementById('s2PlayerAvatar');
    if (oldPlayer && oldPlayer.parentNode) oldPlayer.parentNode.removeChild(oldPlayer);

    var oldShakir = document.getElementById('s2ShakirGuide');
    if (oldShakir && oldShakir.parentNode) oldShakir.parentNode.removeChild(oldShakir);

    var el = document.createElement('div');
    el.className = 's2-shakir-guide human-walker-sprite facing-south';
    el.id = 's2ShakirGuide';
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Shakir - SearchO2 OxyEco Forger (CEO Guide)');

    var posLeft = (at && typeof at.left === 'number') ? at.left : 48;
    var posTop = (at && typeof at.top === 'number') ? at.top : 42;
    el.style.left = posLeft + '%';
    el.style.top = posTop + '%';

    el.innerHTML =
      '<div class="shakir-head-tag"><span>🧑‍🌾 Shakir (OxyEco Forger)</span></div>' +
      '<div class="shakir-speech-bubble" id="s2ShakirBubble">👋 Greetings Explorer! I\'m Shakir! Let\'s scout with Pip!</div>' +
      renderShakirFigureSvg({ w: 56, h: 104, unique: 'shakir_farm' });

    layer.appendChild(el);
    guideState.walkerEl = el;
    guideState.speechBubbleEl = el.querySelector('#s2ShakirBubble');

    el.onclick = function (e) {
      e.stopPropagation();
      openShakirDialogue();
    };

    spawnPipCompanion({ left: posLeft, top: posTop });
    return el;
  }

  function spawnPipCompanion(at) {
    var layer = ensureWalkerLayer();
    if (!layer) return null;

    var oldPip = document.getElementById('s2PipCompanion');
    if (oldPip && oldPip.parentNode) oldPip.parentNode.removeChild(oldPip);

    var baseLeft = (at && typeof at.left === 'number') ? at.left : 48;
    var baseTop = (at && typeof at.top === 'number') ? at.top : 42;

    var pipEl = document.createElement('div');
    pipEl.className = 's2-pip-companion mouse-walker-sprite facing-south';
    pipEl.id = 's2PipCompanion';
    pipEl.setAttribute('tabindex', '0');
    pipEl.setAttribute('role', 'button');
    pipEl.setAttribute('aria-label', 'Pip Squeak-a-Link - Alpine Harvest Field Mouse & Safety Scout');

    pipEl.style.left = (baseLeft + 3.2) + '%';
    pipEl.style.top = (baseTop + 1.2) + '%';

    pipEl.innerHTML =
      '<div class="pip-head-tag"><span>🐭 Pip (Safety Scout)</span></div>' +
      '<div class="pip-speech-bubble hidden" id="s2PipBubble">👋 Hi Shakir! Ready for fieldwork!</div>' +
      renderPipFigureSvg({ w: 44, h: 56, unique: 'pip_farm' });

    layer.appendChild(pipEl);
    guideState.pipEl = pipEl;
    guideState.pipBubbleEl = pipEl.querySelector('#s2PipBubble');

    pipEl.onclick = function (e) {
      e.stopPropagation();
      toggleSubtitles(true);
    };

    return pipEl;
  }

  function removePipCompanion() {
    var pip = guideState.pipEl || document.getElementById('s2PipCompanion');
    if (pip && pip.parentNode) pip.parentNode.removeChild(pip);
    guideState.pipEl = null;
    guideState.pipBubbleEl = null;
  }

  function playPipAnimation(animName, durationMs) {
    var pip = guideState.pipEl || document.getElementById('s2PipCompanion');
    if (!pip) return;

    var valid = ['pip-anim-wand-wave', 'pip-anim-hop', 'pip-anim-whirl', 'pip-anim-ear-sniff', 'pip-anim-wrench'];
    valid.forEach(function (c) { pip.classList.remove(c); });

    var targetClass = 'pip-anim-' + animName.replace(/^pip-anim-/, '').replace('_', '-');
    pip.classList.add(targetClass);

    if (durationMs) {
      setTimeout(function () {
        if (pip) pip.classList.remove(targetClass);
      }, durationMs);
    }
  }

  // ---------------------------------------------------------------------------
  // Speech Bubbles Controller (Only 1 Active at a Time to Prevent Any Overlap)
  // ---------------------------------------------------------------------------
  var bubbleTimeout = null;
  function showShakirSpeechBubble(text, durationMs) {
    hidePipSpeechBubble();
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

  var pipBubbleTimeout = null;
  function showPipSpeechBubble(text, durationMs) {
    hideShakirSpeechBubble();
    var bubble = guideState.pipBubbleEl || document.getElementById('s2PipBubble');
    if (!bubble) return;
    bubble.innerHTML = text;
    bubble.classList.remove('hidden');

    if (pipBubbleTimeout) clearTimeout(pipBubbleTimeout);
    if (durationMs) {
      pipBubbleTimeout = setTimeout(function () {
        if (bubble) bubble.classList.add('hidden');
      }, durationMs);
    }
  }

  function hidePipSpeechBubble() {
    var bubble = guideState.pipBubbleEl || document.getElementById('s2PipBubble');
    if (bubble) bubble.classList.add('hidden');
  }

  // ---------------------------------------------------------------------------
  // Continuous Parametric Smooth Walking Engine
  // ---------------------------------------------------------------------------
  function adjustSubtitleDockPlacement(characterLeft) {
    var dock = document.getElementById('shakirPipSubtitleDock');
    if (!dock) return;
    // Always keep subtitle dock cleanly stretched at bottom-left to avoid right modals/HUD overlap
    dock.classList.remove('dock-right');
    dock.classList.add('dock-left');
  }

  function walkPathSmooth(el, points, durationMs, onDone) {
    if (!el || !points || points.length < 2) {
      if (onDone) onDone();
      return;
    }
    var pipEl = guideState.pipEl || document.getElementById('s2PipCompanion');
    var myWalkToken = ++guideState.currentWalkToken;
    el.__walkToken = myWalkToken;
    guideState.isWalking = true;
    el.classList.add('walking');
    el.classList.remove('wonder-touching');
    if (pipEl) {
      pipEl.classList.add('walking');
      pipEl.classList.remove('pip-anim-wand-wave', 'pip-anim-hop', 'pip-anim-ear-sniff', 'pip-anim-wrench');
    }

    var segDistances = [];
    var totalDist = 0;
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i];
      var p1 = points[i + 1];
      var d = Math.hypot(p1.left - p0.left, p1.top - p0.top);
      segDistances.push(d);
      totalDist += d;
    }
    if (totalDist === 0) totalDist = 1;

    var startTime = performance.now();

    function frame(now) {
      if (el.__walkToken !== myWalkToken) return;
      var elapsed = now - startTime;
      var globalT = Math.min(1, elapsed / durationMs);

      // Smooth cubic ease-in-out curve
      var eased = (globalT < 0.5)
        ? (4 * globalT * globalT * globalT)
        : (1 - Math.pow(-2 * globalT + 2, 3) / 2);

      var targetDist = eased * totalDist;

      var accumulated = 0;
      var segIdx = 0;
      while (segIdx < segDistances.length - 1 && accumulated + segDistances[segIdx] < targetDist) {
        accumulated += segDistances[segIdx];
        segIdx++;
      }

      var segLen = segDistances[segIdx];
      var segFraction = (segLen > 0) ? Math.min(1, Math.max(0, (targetDist - accumulated) / segLen)) : 1;
      var sp0 = points[segIdx];
      var sp1 = points[segIdx + 1];

      var curX = sp0.left + (sp1.left - sp0.left) * segFraction;
      var curY = sp0.top + (sp1.top - sp0.top) * segFraction;

      var dx = sp1.left - sp0.left;

      el.classList.add('facing-south');
      el.classList.remove('facing-north');
      if (pipEl) {
        pipEl.classList.add('facing-south');
        pipEl.classList.remove('facing-north');
      }

      var pipOffsetX = 3.2;
      var pipOffsetY = 1.0;

      if (dx > 0.15) {
        el.classList.add('facing-east');
        el.classList.remove('facing-west');
        if (pipEl) {
          pipEl.classList.add('facing-east');
          pipEl.classList.remove('facing-west');
        }
        pipOffsetX = -3.2;
        pipOffsetY = 1.2;
      } else if (dx < -0.15) {
        el.classList.add('facing-west');
        el.classList.remove('facing-east');
        if (pipEl) {
          pipEl.classList.add('facing-west');
          pipEl.classList.remove('facing-east');
        }
        pipOffsetX = 3.2;
        pipOffsetY = 1.2;
      }

      el.style.left = curX.toFixed(2) + '%';
      el.style.top = curY.toFixed(2) + '%';

      if (pipEl) {
        pipEl.style.left = (curX + pipOffsetX).toFixed(2) + '%';
        pipEl.style.top = (curY + pipOffsetY).toFixed(2) + '%';
      }

      adjustSubtitleDockPlacement(curX);

      if (globalT < 1) {
        requestAnimationFrame(frame);
      } else {
        el.classList.remove('walking');
        el.style.transform = 'translate(-50%, -85%)';
        guideState.isWalking = false;

        if (pipEl) {
          pipEl.classList.remove('walking');
          pipEl.style.transform = 'translate(-50%, -85%)';
        }
        if (onDone) onDone();
      }
    }

    requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------------------
  // FX Helpers
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

  function spawnDirectingBeam(from, to) {
    var scene = document.getElementById('fieldScene');
    if (!scene) return;
    var beam = document.createElement('div');
    beam.className = 'shakir-wonder-beam';
    var dx = (to.left - from.left);
    var dy = (to.top - from.top);
    var dist = Math.hypot(dx, dy);
    var angle = Math.atan2(dy, dx) * (180 / Math.PI);
    beam.style.left = from.left + '%';
    beam.style.top = from.top + '%';
    beam.style.width = dist + '%';
    beam.style.transform = 'rotate(' + angle + 'deg)';
    scene.appendChild(beam);
    setTimeout(function () {
      if (beam && beam.parentNode) beam.parentNode.removeChild(beam);
    }, 700);
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
  // Voice Synthesis Engine (Web Speech API)
  // ---------------------------------------------------------------------------
  var _activeUtterance = null;
  var _speechFallbackTimer = null;
  var _cachedVoices = [];

  function getSpeechVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      var v = window.speechSynthesis.getVoices() || [];
      if (v.length > 0) _cachedVoices = v;
    }
    return _cachedVoices;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = function () {
      getSpeechVoices();
    };
    getSpeechVoices();
  }

  function stopDialogueVoice() {
    if (_speechFallbackTimer) {
      clearTimeout(_speechFallbackTimer);
      _speechFallbackTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    _activeUtterance = null;
  }

  function speakDialogueVoice(speaker, text, onEnd) {
    stopDialogueVoice();

    if (!guideState.voiceEnabled) {
      _speechFallbackTimer = setTimeout(function () {
        if (typeof onEnd === 'function') onEnd();
      }, 3400);
      return;
    }

    if (speaker === 'pip') {
      if (global.KidsSustainabilityAcademy && typeof global.KidsSustainabilityAcademy.playPipMouseSFX === 'function') {
        try { global.KidsSustainabilityAcademy.playPipMouseSFX(); } catch (e) {}
      }
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      _speechFallbackTimer = setTimeout(function () {
        if (typeof onEnd === 'function') onEnd();
      }, 3600);
      return;
    }

    var clean = text
      .replace(/\b(slurp|byzzz|bzzzz|bzzz|whoosh|zoom|moo)\b/gi, '')
      .replace(/squeak tastic/gi, 'fantastic')
      .replace(/["“”*()]/g, '')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    var utter = new SpeechSynthesisUtterance(clean);
    _activeUtterance = utter;

    var voices = getSpeechVoices();
    if (!voices || voices.length === 0) {
      voices = window.speechSynthesis.getVoices() || [];
    }

    if (speaker === 'shakir') {
      utter.pitch = 0.98;
      utter.rate = 1.02;
      var maleVoices = voices.filter(function (v) {
        if (!v.lang || v.lang.indexOf('en') !== 0) return false;
        var name = (v.name || '').toLowerCase();
        return name.includes('male') || name.includes('david') || name.includes('mark') ||
               name.includes('guy') || name.includes('george') || name.includes('google us english') ||
               name.includes('natural');
      });
      var shakirVoice = maleVoices[0] || voices[0];
      if (shakirVoice) utter.voice = shakirVoice;
    } else {
      utter.pitch = 1.80;
      utter.rate = 1.12;
      var boyVoices = voices.filter(function (v) {
        if (!v.lang || v.lang.indexOf('en') !== 0) return false;
        var name = (v.name || '').toLowerCase();
        return name.includes('child') || name.includes('junior') || name.includes('guy') ||
               name.includes('david') || name.includes('mark') || name.includes('male');
      });
      var pipVoice = boyVoices[0] || voices[0];
      if (pipVoice) utter.voice = pipVoice;
    }

    var hasEnded = false;
    function finish() {
      if (hasEnded) return;
      hasEnded = true;
      if (_speechFallbackTimer) {
        clearTimeout(_speechFallbackTimer);
        _speechFallbackTimer = null;
      }
      if (typeof onEnd === 'function') onEnd();
    }

    utter.onend = finish;
    utter.onerror = finish;

    var estMs = Math.max(2800, (clean.length / 14) * 1000);
    _speechFallbackTimer = setTimeout(finish, estMs + 1800);

    try {
      window.speechSynthesis.speak(utter);
    } catch (e) {
      finish();
    }
  }

  // ---------------------------------------------------------------------------
  // Subtitle Dock UI Controller
  // ---------------------------------------------------------------------------
  function ensureSubtitleDock() {
    ensureShakirStyles();
    var dock = document.getElementById('shakirPipSubtitleDock');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'shakirPipSubtitleDock';
      dock.className = 'dock-right';
      dock.setAttribute('role', 'region');
      dock.setAttribute('aria-label', 'Shakir and Pip Tour Subtitles');

      dock.innerHTML =
        '<div class="sub-header-row">' +
          '<div class="sub-speaker-info">' +
            '<div class="sub-speaker-avatar" id="subAvatar">🧑‍🌾</div>' +
            '<div class="sub-speaker-meta">' +
              '<span class="sub-speaker-name" id="subName">Shakir</span>' +
              '<span class="sub-speaker-role" id="subRole">18+ Eco Forger</span>' +
              '<span class="sub-chapter-chip" id="subChChip">Ch. 1 · Spot 1</span>' +
            '</div>' +
          '</div>' +
          '<div class="sub-controls-group">' +
            '<button type="button" class="sub-ctrl-btn" id="btnSubVoiceToggle" title="Toggle Spoken Voice">🔊</button>' +
            '<button type="button" class="sub-ctrl-btn sub-next-btn" id="btnSubNextTurn" title="Next dialogue turn">Next ➔</button>' +
            '<button type="button" class="sub-ctrl-btn" id="btnSubLeaveFarm" title="Conclude Tour &amp; Leave Farm through Gate" style="background:rgba(239,68,68,0.22);border:1px solid rgba(239,68,68,0.5);color:#FCA5A5;font-weight:700;">🚪 Exit</button>' +
            '<button type="button" class="sub-ctrl-btn" id="btnSubMinimize" title="Minimize Subtitles to 💬">✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="sub-text-row" id="subDialogueText">Welcome to our farm tour!</div>' +
        '<div class="sub-progress-dots" id="subDots">' +
          '<div class="sub-dot active" id="subDot1"></div>' +
          '<div class="sub-dot" id="subDot2"></div>' +
          '<div class="sub-dot" id="subDot3"></div>' +
        '</div>';

      document.body.appendChild(dock);

      document.getElementById('btnSubVoiceToggle').onclick = function (e) {
        e.stopPropagation();
        toggleVoice();
      };
      document.getElementById('btnSubNextTurn').onclick = function (e) {
        e.stopPropagation();
        advanceDialogueTurn();
      };
      var leaveBtn = document.getElementById('btnSubLeaveFarm');
      if (leaveBtn) {
        leaveBtn.onclick = function (e) {
          e.stopPropagation();
          walkOutThroughGate();
        };
      }
      document.getElementById('btnSubMinimize').onclick = function (e) {
        e.stopPropagation();
        toggleSubtitles(false);
      };
    }
    ensureToolbarButton();
    return dock;
  }

  function ensureToolbarButton() {
    var btn = document.getElementById('btnToggleTourSubtitles');
    if (!btn) {
      var stack = document.querySelector('.bottom-buttons-stack');
      var mpBtn = document.getElementById('btnToggleMarketplace');
      if (stack) {
        btn = document.createElement('button');
        btn.id = 'btnToggleTourSubtitles';
        btn.className = 'corner-toggle-btn corner-subtitles-btn';
        btn.setAttribute('title', 'Toggle Tour Dialogue Subtitles (💬)');
        btn.setAttribute('aria-label', 'Toggle Tour Subtitles');
        btn.innerHTML = '<span class="corner-btn-icon">💬</span>';
        if (mpBtn && mpBtn.parentNode === stack) {
          stack.insertBefore(btn, mpBtn);
        } else {
          stack.appendChild(btn);
        }
      }
    }
    if (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        toggleSubtitles();
      };
      if (guideState.subtitlesVisible) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  }

  function toggleSubtitles(forceVisible) {
    var dock = ensureSubtitleDock();
    if (typeof forceVisible === 'boolean') {
      guideState.subtitlesVisible = forceVisible;
    } else {
      guideState.subtitlesVisible = !guideState.subtitlesVisible;
    }
    if (guideState.subtitlesVisible) {
      dock.classList.remove('minimized');
    } else {
      dock.classList.add('minimized');
    }
    var btn = document.getElementById('btnToggleTourSubtitles');
    if (btn) {
      if (guideState.subtitlesVisible) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  }

  function toggleVoice() {
    guideState.voiceEnabled = !guideState.voiceEnabled;
    try {
      localStorage.setItem('searchO2_tour_voice_enabled', guideState.voiceEnabled ? '1' : '0');
    } catch (e) {}

    var btn = document.getElementById('btnSubVoiceToggle');
    if (btn) {
      btn.textContent = guideState.voiceEnabled ? '🔊' : '🔇';
      btn.title = guideState.voiceEnabled ? 'Spoken Voice: On' : 'Spoken Voice: Off (Muted)';
    }
    if (!guideState.voiceEnabled) stopDialogueVoice();
  }

  function getActiveFarmName() {
    try {
      var raw = localStorage.getItem('searchO2_guest_farm_profile');
      if (raw) {
        var p = JSON.parse(raw);
        if (p && p.name && p.name.trim()) return p.name.trim();
      }
    } catch (e) {}
    if (typeof global.apiUser !== 'undefined' && global.apiUser && global.apiUser.farmName) {
      return global.apiUser.farmName.trim();
    }
    if (typeof global.state !== 'undefined' && global.state && global.state.farmName) {
      return global.state.farmName.trim();
    }
    return 'SearchO2';
  }

  function closeAllConflictingModals() {
    if (typeof global.closeModal === 'function') {
      try { global.closeModal(); } catch (e) {}
    } else if (typeof window !== 'undefined' && typeof window.closeModal === 'function') {
      try { window.closeModal(); } catch (e) {}
    }
    var overlay = document.getElementById('modalOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }
    var chapModal = document.getElementById('chapterExploreModal');
    if (chapModal) { chapModal.classList.add('hidden'); chapModal.style.display = 'none'; }
    var tourModal = document.getElementById('s2TourModal');
    if (tourModal) { tourModal.classList.add('hidden'); }
    var homeOverlay = document.getElementById('s2HomeOverlay');
    if (homeOverlay) { homeOverlay.classList.add('hidden'); homeOverlay.style.display = 'none'; }
    var hoverModal = document.getElementById('s2ObjectHoverModal');
    if (hoverModal) { hoverModal.classList.add('hidden'); }
    var lockedPopup = document.getElementById('stepInstructionPopupWrapper');
    if (lockedPopup) { lockedPopup.classList.add('hidden'); }
    var handover = document.getElementById('kidsAcademyHandoverModal');
    if (handover && handover.parentNode) { handover.parentNode.removeChild(handover); }
    var academy = document.getElementById('kidsAcademyModal');
    if (academy) { academy.classList.remove('visible'); if (academy.parentNode) academy.parentNode.removeChild(academy); }
    var rModal = document.getElementById('kidsAcademyRewardModal');
    if (rModal && rModal.parentNode) { rModal.parentNode.removeChild(rModal); }
    if (document.body) {
      document.body.classList.remove('modal-open');
    }
  }

  function updateSubtitleContent(ch, spotIdx, turnNum, turnData, totalSpots) {
    var dock = ensureSubtitleDock();
    if (guideState.subtitlesVisible) dock.classList.remove('minimized');

    // Support single config object: updateSubtitleContent({ avatar, name, role, chip, text, currentTurn })
    if (typeof ch === 'object' && ch !== null) {
      var cfg = ch;
      var aEl = document.getElementById('subAvatar');
      var nEl = document.getElementById('subName');
      var rEl = document.getElementById('subRole');
      var cEl = document.getElementById('subChChip');
      var tEl = document.getElementById('subDialogueText');
      var nBtn = document.getElementById('btnSubNextTurn');
      var isPipSub = (cfg.avatar === '🐭' || (cfg.name && cfg.name.includes('Pip')));

      if (aEl) {
        aEl.textContent = cfg.avatar || (isPipSub ? '🐭' : '🧑‍🌾');
        aEl.className = 'sub-speaker-avatar ' + (isPipSub ? 'pip' : 'shakir');
      }
      if (nEl) {
        nEl.textContent = cfg.name || (isPipSub ? 'Pip Squeak-a-Link' : 'Shakir');
        nEl.className = 'sub-speaker-name ' + (isPipSub ? 'pip' : 'shakir');
      }
      if (rEl) {
        rEl.textContent = cfg.role || (isPipSub ? 'Chief Safety Scout' : '18+ Eco Forger');
        rEl.className = 'sub-speaker-role ' + (isPipSub ? 'pip' : 'shakir');
      }
      if (cEl) cEl.textContent = cfg.chip || 'Farm Gate · Completion';
      if (tEl) tEl.innerHTML = cfg.text || '';
      if (nBtn) nBtn.textContent = 'Next ➔';

      var cTurn = cfg.currentTurn || 1;
      for (var d0 = 1; d0 <= 3; d0++) {
        var dot0 = document.getElementById('subDot' + d0);
        if (dot0) {
          dot0.className = 'sub-dot' + (d0 === cTurn ? ' active' : (d0 < cTurn ? ' done' : ''));
        }
      }
      return;
    }

    var avatarEl = document.getElementById('subAvatar');
    var nameEl = document.getElementById('subName');
    var roleEl = document.getElementById('subRole');
    var chipEl = document.getElementById('subChChip');
    var textEl = document.getElementById('subDialogueText');
    var nextBtn = document.getElementById('btnSubNextTurn');
    var voiceBtn = document.getElementById('btnSubVoiceToggle');

    if (voiceBtn) voiceBtn.textContent = guideState.voiceEnabled ? '🔊' : '🔇';

    var farmName = getActiveFarmName();
    var processedText = (turnData.text || '').replace(/\{farmName\}/g, '“' + farmName + '”');

    var isPip = (turnData.speaker === 'pip');
    if (avatarEl) {
      avatarEl.textContent = turnData.avatar || (isPip ? '🐭' : '🧑‍🌾');
      avatarEl.className = 'sub-speaker-avatar ' + (isPip ? 'pip' : 'shakir');
    }
    if (nameEl) {
      nameEl.textContent = turnData.name || (isPip ? 'Pip Squeak-a-Link' : 'Shakir');
      nameEl.className = 'sub-speaker-name ' + (isPip ? 'pip' : 'shakir');
    }
    if (roleEl) {
      roleEl.textContent = turnData.role || (isPip ? 'Toddler Safety Scout' : '18+ Eco Forger');
      roleEl.className = 'sub-speaker-role ' + (isPip ? 'pip' : 'shakir');
    }
    if (chipEl) {
      chipEl.textContent = 'Ch. ' + ch + ' (' + (spotIdx + 1) + '/' + totalSpots + ') · Turn ' + turnNum + '/3';
    }
    if (textEl) textEl.innerHTML = processedText;
    if (nextBtn) nextBtn.textContent = (turnNum < 3) ? 'Next ➔' : 'Complete ✨';

    for (var d = 1; d <= 3; d++) {
      var dot = document.getElementById('subDot' + d);
      if (dot) {
        dot.className = 'sub-dot' + (d === turnNum ? ' active' : (d < turnNum ? ' done' : ''));
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Chapter Journey Progression: Visiting Every Sub-Challenge
  // ---------------------------------------------------------------------------
  function playCurrentSpotDialogue(ch, spotIdx, turnNum) {
    turnNum = turnNum || 1;
    guideState.currentChapter = ch;
    guideState.currentSpotIdx = spotIdx;
    guideState.currentDialogueTurn = turnNum;

    var chapterData = CHAPTER_JOURNEY[ch] || CHAPTER_JOURNEY[1];
    var spots = chapterData.spots || [];
    var currentSpot = spots[spotIdx] || spots[0];
    var turnData = currentSpot['turn' + turnNum];
    if (!turnData) return;

    adjustSubtitleDockPlacement(currentSpot.standPoint.left);
    updateSubtitleContent(ch, spotIdx, turnNum, turnData, spots.length);

    var farmName = getActiveFarmName();
    var bubbleText = (turnData.bubble || '').replace(/\{farmName\}/g, farmName);
    var spokenText = (turnData.text || '').replace(/\{farmName\}/g, farmName);

    if (turnData.speaker === 'shakir') {
      showShakirSpeechBubble(bubbleText, 5000);
      hidePipSpeechBubble();
    } else {
      showPipSpeechBubble(bubbleText, 5000);
      hideShakirSpeechBubble();
      if (turnData.anim) playPipAnimation(turnData.anim, 4000);
    }

    speakDialogueVoice(turnData.speaker, spokenText, function () {
      if (!guideState.active || guideState.currentChapter !== ch || guideState.currentSpotIdx !== spotIdx || guideState.currentDialogueTurn !== turnNum) {
        return;
      }
      guideState.dialogueTimer = setTimeout(function () {
        advanceDialogueTurn();
      }, 1400);
    });
  }

  function advanceDialogueTurn() {
    if (guideState.dialogueTimer) {
      clearTimeout(guideState.dialogueTimer);
      guideState.dialogueTimer = null;
    }
    stopDialogueVoice();

    if (guideState.isExitingGate) {
      if (guideState.exitTurn < 2) {
        playGateFarewellTurn(2);
      } else {
        performFinalExitWalk();
      }
      return;
    }

    if (guideState.isGateEncounter) {
      if (guideState.gateTurn < 3) {
        playGateEncounterTurn(guideState.gateTurn + 1);
      } else {
        walkFromGateToPlot1();
      }
      return;
    }

    var ch = guideState.currentChapter || 1;
    var spotIdx = guideState.currentSpotIdx || 0;
    var turn = guideState.currentDialogueTurn || 1;
    var chapterData = CHAPTER_JOURNEY[ch] || CHAPTER_JOURNEY[1];
    var spots = chapterData.spots || [];
    var currentSpot = spots[spotIdx] || spots[0];

    if (guideState.isWalking) {
      guideState.currentWalkToken++;
      if (guideState.walkerEl) {
        guideState.walkerEl.__walkToken = guideState.currentWalkToken;
      }
      if (guideState.isWalkingFromGateToPlot1) {
        guideState.isWalkingFromGateToPlot1 = false;
        guideState.isWalking = false;
        var firstSpot = CHAPTER_JOURNEY[1].spots[0];
        var el1 = guideState.walkerEl;
        if (el1) {
          el1.style.left = firstSpot.standPoint.left + '%';
          el1.style.top = firstSpot.standPoint.top + '%';
          el1.classList.remove('walking');
        }
        if (guideState.pipEl) {
          guideState.pipEl.style.left = (firstSpot.standPoint.left + 3.2) + '%';
          guideState.pipEl.style.top = (firstSpot.standPoint.top + 1.2) + '%';
          guideState.pipEl.classList.remove('walking');
        }
        playCurrentSpotDialogue(1, 0, 1);
        return;
      }

      var el = guideState.walkerEl;
      if (el) {
        el.style.left = currentSpot.standPoint.left + '%';
        el.style.top = currentSpot.standPoint.top + '%';
        el.classList.remove('walking');
      }
      if (guideState.pipEl) {
        guideState.pipEl.style.left = (currentSpot.standPoint.left + 3.2) + '%';
        guideState.pipEl.style.top = (currentSpot.standPoint.top + 1.2) + '%';
        guideState.pipEl.classList.remove('walking');
      }
      guideState.isWalking = false;
      playCurrentSpotDialogue(ch, spotIdx, 1);
      return;
    }

    if (turn < 3) {
      playCurrentSpotDialogue(ch, spotIdx, turn + 1);
    } else {
      // Turn 3 Finished for this spot!
      // Trigger blueprint reveal & award XP
      if (typeof global.exploreChapterObject === 'function') {
        try { global.exploreChapterObject(currentSpot.key, true); } catch (e) {}
      }
      if (typeof global.state !== 'undefined' && global.state) {
        global.state.exploredChapters = global.state.exploredChapters || {};
        global.state.exploredChapters[ch] = true;
        global.state.exploredChapterObjects = global.state.exploredChapterObjects || {};
        global.state.exploredChapterObjects[currentSpot.key] = true;
        global.state.xp = (global.state.xp || 0) + 15;
      }
      if (typeof global.SoundTrackEngine !== 'undefined') {
        try { global.SoundTrackEngine.playSFX('achieve'); } catch (e) {}
      }

      // If chapter has more sub-challenges to visit, walk to the next one!
      if (spotIdx + 1 < spots.length) {
        walkToNextSubSpot(ch, spotIdx + 1);
      } else {
        // All sub-challenges in this chapter completed!
        if (ch >= 8) {
          showVictoryCelebration();
        } else {
          var nextCh = ch + 1;
          startCooldown(ch, nextCh);
          updateChapterCompletionSubtitle(ch, nextCh);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Farm Gate Entrance Encounter (Introductory Discussion at Gate)
  // ---------------------------------------------------------------------------
  function startFarmGateEncounter() {
    guideState.isGateEncounter = true;
    guideState.gateTurn = 1;
    guideState.isWalking = false;
    guideState.isWalkingFromGateToPlot1 = false;

    var gatePos = { left: 91.5, top: 52.0 };
    var el = guideState.walkerEl;
    var pipEl = guideState.pipEl;

    if (el) {
      el.style.left = gatePos.left + '%';
      el.style.top = gatePos.top + '%';
      el.classList.remove('walking');
      el.classList.add('facing-south', 'facing-west');
    }
    if (pipEl) {
      pipEl.style.left = (gatePos.left + 3.4) + '%';
      pipEl.style.top = (gatePos.top + 1.2) + '%';
      pipEl.classList.remove('walking');
      pipEl.classList.remove('pip-anim-wand-wave', 'pip-anim-hop', 'pip-anim-whirl', 'pip-anim-ear-sniff', 'pip-anim-wrench');
    }

    renderTourNavDock(1);
    adjustSubtitleDockPlacement(gatePos.left);
    showSkyHeading('Farm Gate: Welcome & Estate Identity ⛩️', { left: 91.5, top: 44.0 }, '⛩️');

    playGateEncounterTurn(1);
  }

  function playGateEncounterTurn(turn) {
    guideState.gateTurn = turn;
    var farmName = getActiveFarmName();
    var gatePos = { left: 91.5, top: 52.0 };
    adjustSubtitleDockPlacement(gatePos.left);

    var dock = ensureSubtitleDock();
    dock.classList.remove('hidden');

    var avatarEl = document.getElementById('subAvatar');
    var nameEl = document.getElementById('subName');
    var roleEl = document.getElementById('subRole');
    var chipEl = document.getElementById('subChChip');
    var textEl = document.getElementById('subDialogueText');
    var nextBtn = document.getElementById('btnSubNextTurn');
    var voiceBtn = document.getElementById('btnSubVoiceToggle');

    if (voiceBtn) voiceBtn.textContent = guideState.voiceEnabled ? '🔊' : '🔇';

    if (turn === 1) {
      hidePipSpeechBubble();
      if (guideState.pipEl) guideState.pipEl.classList.remove('pip-anim-whirl', 'pip-anim-hop', 'pip-anim-wand-wave');

      var bubble1 = '⛩️ Welcome to the Farm Gate, Pip! 🌾';
      var text1 = 'Halt here, Pip! Right on this threshold is where our grand ceremonial Farm Gate will be built! In an upcoming chapter, I\'ll teach you the architectural craft of erecting timber beams and stone pillars.' +
        ' And here is the most wonderful part: every aspiring farmer—whether exploring as an adventurous guest or logged in as an estate steward—can bestow their own graceful, unique farm name like our proud “' + farmName + '”! Whatever name you choose will be proudly forged onto our Chapter 2 sub-challenge gate shield and banner!';

      showShakirSpeechBubble(bubble1, 6000);
      if (avatarEl) { avatarEl.textContent = '🧑‍🌾'; avatarEl.className = 'sub-speaker-avatar shakir'; }
      if (nameEl) { nameEl.textContent = 'Shakir'; nameEl.className = 'sub-speaker-name shakir'; }
      if (roleEl) { roleEl.textContent = '18+ Eco Forger'; roleEl.className = 'sub-speaker-role shakir'; }
      if (chipEl) chipEl.textContent = 'Farm Gate · Turn 1/3';
      if (textEl) textEl.innerHTML = text1;
      if (nextBtn) nextBtn.textContent = 'Next ➔';

      for (var d1 = 1; d1 <= 3; d1++) {
        var dot1 = document.getElementById('subDot' + d1);
        if (dot1) dot1.className = 'sub-dot' + (d1 === 1 ? ' active' : '');
      }

      speakDialogueVoice('shakir', text1, function () {
        if (!guideState.active || !guideState.isGateEncounter || guideState.gateTurn !== 1) return;
        guideState.dialogueTimer = setTimeout(function () {
          advanceDialogueTurn();
        }, 1200);
      });

    } else if (turn === 2) {
      hideShakirSpeechBubble();
      playPipAnimation('whirl');

      var bubble2 = '⭐ JUMPING JELLYBEANS! Our very own farm shield?! 🤩';
      var text2 = 'JUMPING JELLYBEANS! Our very own estate name “' + farmName + '” shining on the gate shield?! *hops and whirls with glee* Oh boy, Shakir, will my harvest field mouse friends see our glorious banner from all the way across the alpine valley?!';

      showPipSpeechBubble(bubble2, 5500);
      if (avatarEl) { avatarEl.textContent = '🐭'; avatarEl.className = 'sub-speaker-avatar pip'; }
      if (nameEl) { nameEl.textContent = 'Pip Squeak-a-Link'; nameEl.className = 'sub-speaker-name pip'; }
      if (roleEl) { roleEl.textContent = 'Toddler Safety Scout'; roleEl.className = 'sub-speaker-role pip'; }
      if (chipEl) chipEl.textContent = 'Farm Gate · Turn 2/3';
      if (textEl) textEl.innerHTML = text2;
      if (nextBtn) nextBtn.textContent = 'Next ➔';

      for (var d2 = 1; d2 <= 3; d2++) {
        var dot2 = document.getElementById('subDot' + d2);
        if (dot2) dot2.className = 'sub-dot' + (d2 === 2 ? ' active' : (d2 < 2 ? ' done' : ''));
      }

      speakDialogueVoice('pip', text2, function () {
        if (!guideState.active || !guideState.isGateEncounter || guideState.gateTurn !== 2) return;
        guideState.dialogueTimer = setTimeout(function () {
          advanceDialogueTurn();
        }, 1200);
      });

    } else if (turn === 3) {
      hidePipSpeechBubble();
      if (guideState.pipEl) guideState.pipEl.classList.remove('pip-anim-whirl');

      var bubble3 = '😄 Haha Pip, you are so cute and full of energy!';
      var text3 = 'Haha, oh Pip, you are so cute and full of boundless energy! They certainly will, little buddy! Now that we\'ve greeted our future gate, come along—let\'s walk down the pathway to our very first chapter challenges at Plot 1!';

      showShakirSpeechBubble(bubble3, 5000);
      if (avatarEl) { avatarEl.textContent = '🧑‍🌾'; avatarEl.className = 'sub-speaker-avatar shakir'; }
      if (nameEl) { nameEl.textContent = 'Shakir'; nameEl.className = 'sub-speaker-name shakir'; }
      if (roleEl) { roleEl.textContent = '18+ Eco Forger'; roleEl.className = 'sub-speaker-role shakir'; }
      if (chipEl) chipEl.textContent = 'Farm Gate · Turn 3/3';
      if (textEl) textEl.innerHTML = text3;
      if (nextBtn) nextBtn.textContent = 'Walk to Plot 1 ➔';

      for (var d3 = 1; d3 <= 3; d3++) {
        var dot3 = document.getElementById('subDot' + d3);
        if (dot3) dot3.className = 'sub-dot' + (d3 === 3 ? ' active' : ' done');
      }

      speakDialogueVoice('shakir', text3, function () {
        if (!guideState.active || !guideState.isGateEncounter || guideState.gateTurn !== 3) return;
        guideState.dialogueTimer = setTimeout(function () {
          advanceDialogueTurn();
        }, 1500);
      });
    }
  }

  function walkFromGateToPlot1() {
    guideState.isGateEncounter = false;
    guideState.isWalkingFromGateToPlot1 = true;
    hideShakirSpeechBubble();
    hidePipSpeechBubble();
    if (guideState.pipEl) guideState.pipEl.classList.remove('pip-anim-whirl', 'pip-anim-hop', 'pip-anim-wand-wave');

    var el = guideState.walkerEl;
    if (!el) return;

    var firstSpot = CHAPTER_JOURNEY[1].spots[0];
    var gatePos = { left: 91.5, top: 52.0 };

    var waypoints = [
      gatePos,
      { left: 78.0, top: 51.0 },
      { left: 62.0, top: 48.0 },
      { left: 45.0, top: 40.0 },
      firstSpot.standPoint
    ];
    var walkDuration = 6500;

    showSkyHeading('Walking to Chapter 1: Pioneer Plot 1 🚶', firstSpot.standPoint, firstSpot.icon);
    showShakirSpeechBubble('Come along Pip! To Plot 1! 🚶', 3500);

    walkPathSmooth(el, waypoints, walkDuration, function () {
      guideState.isWalkingFromGateToPlot1 = false;
      if (!guideState.active) return;

      el.classList.add('wonder-touching');
      spawnTouchRipple(firstSpot.touchPoint);

      if (typeof global.SoundTrackEngine !== 'undefined') {
        try { global.SoundTrackEngine.playSFX('task'); } catch (e) {}
      }

      showSkyHeading('Wonder Stick: Ch. 1 ' + firstSpot.landmark, firstSpot.standPoint, firstSpot.icon);

      addSequenceTimer(function () {
        if (!guideState.active) return;
        spawnDirectingBeam(firstSpot.standPoint, firstSpot.touchPoint);

        addSequenceTimer(function () {
          if (!guideState.active) return;

          if (global.SearchO2HomeAvatar && typeof global.SearchO2HomeAvatar.showChapterGhosts === 'function') {
            try { global.SearchO2HomeAvatar.showChapterGhosts(1, true); } catch (e) {}
          }

          if (el) el.classList.remove('wonder-touching');
          playCurrentSpotDialogue(1, 0, 1);

        }, 300);
      }, 300);
    });
  }

  function walkToNextSubSpot(ch, nextSpotIdx) {
    guideState.currentSpotIdx = nextSpotIdx;
    var chapterData = CHAPTER_JOURNEY[ch] || CHAPTER_JOURNEY[1];
    var nextSpot = chapterData.spots[nextSpotIdx];
    if (!nextSpot) return;

    var el = guideState.walkerEl;
    if (!el) return;

    var from = {
      left: parseFloat(el.style.left) || 48,
      top: parseFloat(el.style.top) || 42
    };
    var to = nextSpot.standPoint;

    var dist = Math.hypot(to.left - from.left, to.top - from.top);
    var walkDuration = Math.max(3000, Math.min(5000, Math.round(dist * 110)));

    showSkyHeading('Walking to ' + nextSpot.landmark + '... 🚶', to, nextSpot.icon);
    showShakirSpeechBubble('Come along Pip! Let\'s inspect ' + nextSpot.landmark + '! 🚶', 3000);

    walkPathSmooth(el, [from, to], walkDuration, function () {
      if (!guideState.active) return;
      el.classList.add('wonder-touching');
      spawnTouchRipple(nextSpot.touchPoint);
      spawnDirectingBeam(nextSpot.standPoint, nextSpot.touchPoint);

      if (global.SearchO2HomeAvatar && typeof global.SearchO2HomeAvatar.showChapterGhosts === 'function') {
        try { global.SearchO2HomeAvatar.showChapterGhosts(ch, true); } catch (e) {}
      }

      setTimeout(function () {
        if (el) el.classList.remove('wonder-touching');
        playCurrentSpotDialogue(ch, nextSpotIdx, 1);
      }, 600);
    });
  }

  function updateChapterCompletionSubtitle(ch, nextCh) {
    var dock = ensureSubtitleDock();
    var avatarEl = document.getElementById('subAvatar');
    var nameEl = document.getElementById('subName');
    var roleEl = document.getElementById('subRole');
    var chipEl = document.getElementById('subChChip');
    var textEl = document.getElementById('subDialogueText');
    var nextBtn = document.getElementById('btnSubNextTurn');

    var nextData = CHAPTER_JOURNEY[nextCh] || CHAPTER_JOURNEY[1];

    if (avatarEl) {
      avatarEl.textContent = '🌟';
      avatarEl.className = 'sub-speaker-avatar shakir';
    }
    if (nameEl) {
      nameEl.textContent = 'Chapter ' + ch + ' Fully Explored!';
      nameEl.className = 'sub-speaker-name shakir';
    }
    if (roleEl) {
      roleEl.textContent = 'All Sub-Challenges Mastered!';
      roleEl.className = 'sub-speaker-role shakir';
    }
    if (chipEl) chipEl.textContent = 'Ch. ' + ch + ' Complete';
    if (textEl) {
      textEl.innerHTML = (ch < 8) ?
        '✨ All landmarks in this chapter surveyed! Next chapter: <b>' + nextData.title + '</b>. Tap Next to stride forward!' :
        '🎉 All 8 Chapters Mastered! Tap Next to claim your Grand Planetary Forger Victory!';
    }
    if (nextBtn) {
      nextBtn.textContent = (ch < 8) ? ('Next: Ch. ' + nextCh + ' ➔') : 'Claim Victory 🏆';
    }

    for (var d = 1; d <= 3; d++) {
      var dot = document.getElementById('subDot' + d);
      if (dot) dot.className = 'sub-dot done';
    }
  }

  // ---------------------------------------------------------------------------
  // Cooldown Controller
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
    var roadmapBtnTimer = document.getElementById('s2RoadmapGotItTimer');
    if (roadmapBtnTimer) roadmapBtnTimer.textContent = '';
  }

  var CHAPTER_PRIMARY_KEY = {
    1: 'plot',
    2: 'crew_shed',
    3: 'crop_field',
    4: 'cattle_farm',
    5: 'wind_turbine',
    6: 'coffee_shop',
    7: 'eco_passport',
    8: 'space_mission'
  };

  function startCooldown(fromCh, nextCh) {
    clearCooldown();
    guideState.cooldownActive = true;
    guideState.cooldownRemaining = 20;

    // Minimize subtitle dock so the green chapter explore roadmap modal is clearly visible and uncluttered
    toggleSubtitles(false);

    // Open the green chapter explore roadmap modal for this chapter
    var primaryKey = CHAPTER_PRIMARY_KEY[fromCh] || 'plot';
    if (typeof global.openChapterRoadmapForObject === 'function') {
      try {
        global.openChapterRoadmapForObject(primaryKey);
      } catch (e) {
        console.warn('Failed to open chapter roadmap modal:', e);
      }
    } else if (typeof window !== 'undefined' && typeof window.openChapterRoadmapForObject === 'function') {
      try {
        window.openChapterRoadmapForObject(primaryKey);
      } catch (e) {
        console.warn('Failed to open chapter roadmap modal:', e);
      }
    }

    // Ensure the modal overlay has top z-index and displays immediately with initial timer
    setTimeout(function () {
      var overlay = document.getElementById('modalOverlay');
      if (overlay) {
        overlay.style.zIndex = '100010';
        overlay.style.display = 'flex';
      }
      var roadmapBtnTimer = document.getElementById('s2RoadmapGotItTimer');
      if (roadmapBtnTimer) roadmapBtnTimer.textContent = '(20s)';
    }, 10);

    if (global.SearchO2HomeAvatar && typeof global.SearchO2HomeAvatar.renderScoutCountdownFloater === 'function') {
      try { global.SearchO2HomeAvatar.renderScoutCountdownFloater(20, nextCh); } catch (e) {}
    }

    renderShakirCooldownPill(fromCh, nextCh);

    guideState.cooldownTimer = setInterval(function () {
      guideState.cooldownRemaining--;
      var rem = guideState.cooldownRemaining;
      updateShakirCooldownDisplay(rem, nextCh);

      // If user dismissed modal early, restore subtitle dock
      if (!document.getElementById('modalOverlay') && !guideState.subtitlesVisible) {
        toggleSubtitles(true);
      }

      if (rem <= 0) {
        clearCooldown();
        clearSequenceTimers();
        if (typeof global.closeModal === 'function') {
          try { global.closeModal(); } catch (e) {}
        } else if (typeof window !== 'undefined' && typeof window.closeModal === 'function') {
          try { window.closeModal(); } catch (e) {}
        }
        walkToNextChapter();
      }
    }, 1000);
  }

  function renderShakirCooldownPill(fromCh, nextCh) {
    var pill = document.getElementById('s2CooldownIconPill');
    if (!pill) {
      if (global.SearchO2HomeAvatar && typeof global.SearchO2HomeAvatar.renderScoutCountdownFloater === 'function') {
        global.SearchO2HomeAvatar.renderScoutCountdownFloater(20, nextCh);
        pill = document.getElementById('s2CooldownIconPill');
      }
    }
    if (pill) {
      pill.classList.remove('hidden');
      var tag = pill.querySelector('.scf-time-tag') || pill.querySelector('.scf-desc');
      if (tag) tag.textContent = '20s · Ch. ' + (nextCh <= 8 ? nextCh : 1);
      var title = pill.querySelector('.scf-title');
      if (title) title.textContent = '🧑‍🌾 Shakir & Pip Tour';

      pill.onclick = function (e) {
        e.stopPropagation();
        onGotItClicked();
      };
    }
  }

  function updateShakirCooldownDisplay(rem, nextCh) {
    var pill = document.getElementById('s2CooldownIconPill');
    if (pill) {
      var tag = pill.querySelector('.scf-time-tag') || pill.querySelector('.scf-desc');
      if (tag) tag.textContent = rem + 's · Ch. ' + (nextCh <= 8 ? nextCh : 1);
    }
    var roadmapBtnTimer = document.getElementById('s2RoadmapGotItTimer');
    if (roadmapBtnTimer) roadmapBtnTimer.textContent = '(' + rem + 's)';
  }

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

  // ---------------------------------------------------------------------------
  // Tour Walking Orchestration
  // ---------------------------------------------------------------------------
  function startGuidedTour(targetCh) {
    ensureShakirStyles();
    targetCh = parseInt(targetCh, 10);
    if (!targetCh || targetCh < 1 || targetCh > 8) targetCh = 1;

    try {
      sessionStorage.setItem('searchO2_shakir_welcomed', '1');
      sessionStorage.setItem('searchO2_academy_video_played', '1');
    } catch (e) {}

    guideState.active = true;
    guideState.suppressAutoBoot = true;
    ensureFarmScreenActive();
    closeAllConflictingModals();

    setTimeout(function () {
      walkToChapter(targetCh);
    }, 60);
  }

  function walkToChapter(targetCh) {
    ensureShakirStyles();
    targetCh = parseInt(targetCh, 10);
    if (!targetCh || targetCh < 1 || targetCh > 8) targetCh = 1;

    try {
      sessionStorage.setItem('searchO2_shakir_welcomed', '1');
      sessionStorage.setItem('searchO2_academy_video_played', '1');
    } catch (e) {}

    guideState.active = true;
    guideState.suppressAutoBoot = true;
    ensureFarmScreenActive();
    closeAllConflictingModals();
    ensureSubtitleDock();
    toggleSubtitles(true);
    clearSequenceTimers();
    clearCooldown();
    clearChapterGhosts();

    guideState.currentChapter = targetCh;
    guideState.currentSpotIdx = 0;
    hideShakirSpeechBubble();
    hidePipSpeechBubble();

    var chapterData = CHAPTER_JOURNEY[targetCh] || CHAPTER_JOURNEY[1];
    var firstSpot = chapterData.spots[0];

    var gatePos = { left: 91.5, top: 52.0 };
    var el = guideState.walkerEl;
    var waypoints = [];
    var walkDuration = 4500;

    if (targetCh === 1) {
      if (!el || !el.parentNode) {
        el = spawnShakirWalker(gatePos);
      } else {
        el.style.left = gatePos.left + '%';
        el.style.top = gatePos.top + '%';
        if (guideState.pipEl) {
          guideState.pipEl.style.left = (gatePos.left + 3.4) + '%';
          guideState.pipEl.style.top = (gatePos.top + 1.2) + '%';
        }
      }
      el.classList.add('facing-south', 'facing-west');

      // Stop at the farm gate and begin the interactive entrance dialogue discussion!
      startFarmGateEncounter();
      return;
    } else {
      if (!el || !el.parentNode) {
        el = spawnShakirWalker(gatePos);
        waypoints = [gatePos, { left: 60.0, top: 48.0 }, firstSpot.standPoint];
        walkDuration = 5200;
      } else {
        var from = {
          left: parseFloat(el.style.left) || 48,
          top: parseFloat(el.style.top) || 42
        };
        var mid = {
          left: (from.left + firstSpot.standPoint.left) / 2 + (Math.random() * 2 - 1),
          top: (from.top + firstSpot.standPoint.top) / 2 + (Math.random() * 2 - 1)
        };
        var dist = Math.hypot(firstSpot.standPoint.left - from.left, firstSpot.standPoint.top - from.top);
        walkDuration = Math.max(3800, Math.min(6200, Math.round(dist * 120)));
        waypoints = [from, mid, firstSpot.standPoint];
      }
      showShakirSpeechBubble('Walking to ' + firstSpot.landmark + '... 🏃', 2400);
    }

    renderTourNavDock(targetCh);

    walkPathSmooth(el, waypoints, walkDuration, function () {
      if (!guideState.active) return;

      el.classList.add('wonder-touching');
      spawnTouchRipple(firstSpot.touchPoint);

      if (typeof global.SoundTrackEngine !== 'undefined') {
        try { global.SoundTrackEngine.playSFX('task'); } catch (e) {}
      }

      showSkyHeading('Wonder Stick: Ch. ' + targetCh + ' ' + firstSpot.landmark, firstSpot.standPoint, firstSpot.icon);

      addSequenceTimer(function () {
        if (!guideState.active) return;
        spawnDirectingBeam(firstSpot.standPoint, firstSpot.touchPoint);

        addSequenceTimer(function () {
          if (!guideState.active) return;

          if (global.SearchO2HomeAvatar && typeof global.SearchO2HomeAvatar.showChapterGhosts === 'function') {
            try { global.SearchO2HomeAvatar.showChapterGhosts(targetCh, true); } catch (e) {}
          }

          if (el) el.classList.remove('wonder-touching');

          // Start interactive dialogue for Spot 1 of this chapter
          playCurrentSpotDialogue(targetCh, 0, 1);

        }, 300);
      }, 300);
    });
  }

  function walkToNextChapter() {
    var cur = guideState.currentChapter || 1;
    clearSequenceTimers();
    clearCooldown();
    clearChapterGhosts();

    if (cur >= 8) {
      showVictoryCelebration();
    } else {
      walkToChapter(cur + 1);
    }
  }

  function onGotItClicked() {
    clearSequenceTimers();
    clearCooldown();
    clearChapterGhosts();
    if (typeof global.closeModal === 'function') {
      try { global.closeModal(); } catch (e) {}
    } else if (typeof window !== 'undefined' && typeof window.closeModal === 'function') {
      try { window.closeModal(); } catch (e) {}
    }
    walkToNextChapter();
  }

  // ---------------------------------------------------------------------------
  // Celebratory Victory Reward Modal (Award Title, XP & Gold Coins)
  // ---------------------------------------------------------------------------
  function showVictoryCelebration() {
    ensureShakirStyles();
    stopDialogueVoice();
    clearCooldown();

    var existingVic = document.getElementById('s2VictoryModal');
    if (existingVic && existingVic.parentNode) {
      existingVic.parentNode.removeChild(existingVic);
    }
    var existingAcademyR = document.getElementById('kidsAcademyRewardModal');
    if (existingAcademyR) {
      existingAcademyR.classList.remove('visible');
    }

    var titleAwarded = 'Grand Planetary Eco-Forger';
    var xpAwarded = 500;
    var goldAwarded = 1000;
    var o2Awarded = 500;

    var modal = document.createElement('div');
    modal.className = 'shakir-victory-backdrop';
    modal.id = 's2VictoryModal';

    modal.innerHTML =
      '<div class="shakir-victory-card" role="dialog" aria-modal="true">' +
        '<div class="vic-banner-pill">🏆 SEARCHO2 MASTERPLAN MASTERED</div>' +
        '<div class="vic-title">Grand Planetary Eco-Forger!</div>' +
        '<div class="vic-subtitle">All 8 Chapters & Sub-Challenges Successfully Explored with Shakir & Pip!</div>' +
        '<div class="vic-avatars-row">' +
          '<div class="vic-avatar-box">' +
            '<div class="vic-avatar-circle">🧑‍🌾</div>' +
            '<span class="vic-avatar-tag">Shakir (Master Forger)</span>' +
          '</div>' +
          '<div style="font-size:1.8rem;color:#FDE047;">★ ★ ★</div>' +
          '<div class="vic-avatar-box">' +
            '<div class="vic-avatar-circle pip">🐭</div>' +
            '<span class="vic-avatar-tag">Pip (Chief AgTech Ranger)</span>' +
          '</div>' +
        '</div>' +
        '<div class="vic-title-badge-box">' +
          '<span style="font-size:1.2rem;">🏅</span>' +
          '<span class="vic-title-badge-text">New Title: ' + titleAwarded + '</span>' +
        '</div>' +
        '<div class="vic-rewards-grid">' +
          '<div class="vic-reward-item">' +
            '<span class="vic-reward-val">+' + xpAwarded + '</span>' +
            '<span class="vic-reward-lbl">Mastery XP</span>' +
          '</div>' +
          '<div class="vic-reward-item">' +
            '<span class="vic-reward-val">+' + goldAwarded + ' 🪙</span>' +
            '<span class="vic-reward-lbl">Gold Coins</span>' +
          '</div>' +
          '<div class="vic-reward-item">' +
            '<span class="vic-reward-val">+' + o2Awarded + ' 🫧</span>' +
            '<span class="vic-reward-lbl">Clean O₂</span>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="vic-claim-btn" id="btnClaimVictoryRewards">' +
          '🎁 Claim All Rewards & Celebrate ➔' +
        '</button>' +
      '</div>';

    document.body.appendChild(modal);

    if (typeof global.SoundTrackEngine !== 'undefined') {
      try { global.SoundTrackEngine.playSFX('achieve'); } catch (e) {}
    }

    document.getElementById('btnClaimVictoryRewards').onclick = function () {
      // Award to game state
      if (typeof global.state !== 'undefined' && global.state) {
        global.state.money = (global.state.money || 0) + goldAwarded;
        global.state.xp = (global.state.xp || 0) + xpAwarded;
        global.state.playerTitle = titleAwarded;
        global.state.allChaptersExplored = true;
      }
      try {
        localStorage.setItem('searchO2_player_title', titleAwarded);
      } catch (e) {}

      if (typeof global.render === 'function') global.render();
      if (typeof global.requestSave === 'function') global.requestSave();
      if (typeof global.SoundTrackEngine !== 'undefined') {
        try { global.SoundTrackEngine.playSFX('coin'); } catch (e) {}
      }
      if (typeof global.showNotification === 'function') {
        global.showNotification('🏆', 'Title Unlocked: ' + titleAwarded + ' (+1,000 Coins & +500 XP)!', 'achievement');
      }

      if (modal.parentNode) modal.parentNode.removeChild(modal);
      walkOutThroughGate();
    };
  }

  // ---------------------------------------------------------------------------
  // Farm Gate Farewell & Exit Sequence (Shakir & Pip Depart Through Gate)
  // ---------------------------------------------------------------------------
  function walkOutThroughGate(onComplete) {
    ensureFarmScreenActive();
    clearSequenceTimers();
    clearCooldown();
    clearChapterGhosts();
    hideTourNavDock();

    guideState.isExitingGate = true;
    guideState.exitTurn = 1;
    guideState.exitOnComplete = onComplete;

    var gatePos = { left: 92.5, top: 52.0 };
    var el = guideState.walkerEl;
    var from = {
      left: el ? (parseFloat(el.style.left) || 80) : 80,
      top: el ? (parseFloat(el.style.top) || 72) : 72
    };

    if (!el) {
      el = spawnShakirWalker(from);
    }

    if (Math.abs(from.left - gatePos.left) < 1 && Math.abs(from.top - gatePos.top) < 1) {
      from = { left: gatePos.left - 4, top: gatePos.top };
    }

    showSkyHeading('Walking to Farm Gate · Completion & Farewell ⛩️', gatePos, '⛩️');

    // Walk both avatars smoothly to the main farm gate
    walkPathSmooth(el, [from, gatePos], 2400, function () {
      el.classList.remove('walking');
      el.classList.add('facing-south');
      if (guideState.pipEl) {
        guideState.pipEl.classList.remove('walking');
        guideState.pipEl.classList.add('facing-south');
        guideState.pipEl.style.left = (gatePos.left + 3.2) + '%';
        guideState.pipEl.style.top = (gatePos.top + 1.0) + '%';
      }

      // Start the Farewell Dialogue Interaction at the Main Gate
      playGateFarewellTurn(1);
    });
  }

  function playGateFarewellTurn(turnIdx) {
    guideState.exitTurn = turnIdx;
    ensureSubtitleDock();
    toggleSubtitles(true);

    var el = guideState.walkerEl;
    var pipEl = guideState.pipEl;

    if (turnIdx === 1) {
      // Turn 1: Shakir speaks to Pip and explorer
      var shakirLine = 'Ok Pip, our job is done! Now you know where, what, why, and how, and our each valued explorer knows as well! Now let us leave the grounds and let them build their own regenerative farm!';
      var bubbleShakir = '⛩️ Our job is done, Pip! Now let each valued explorer build their own farm!';

      updateSubtitleContent({
        avatar: '🧑‍🌾',
        name: 'Shakir',
        role: '18+ Eco Forger',
        chip: 'Farm Gate · Completion',
        text: '“Ok Pip, our job is done! Now you know where, what, why, and how — and our valued explorer knows as well! Now let us leave the grounds and let them build their own regenerative farm!”',
        currentTurn: 1
      });

      showShakirSpeechBubble(bubbleShakir, 6000);
      if (pipEl) pipEl.classList.remove('pip-anim-hop', 'pip-anim-wand-wave');

      speakDialogueVoice('shakir', shakirLine, function () {
        setTimeout(function () {
          if (!guideState.isExitingGate || guideState.exitTurn !== 1) return;
          playGateFarewellTurn(2);
        }, 500);
      });
    } else if (turnIdx === 2) {
      // Turn 2: Pip replies with celebration & agreement
      var pipLine = 'Aye aye, Shakir! Every blueprint, water trench, and soil bed is crystal clear! Over to our grand explorer to forge their haven! Let us head out through the gate!';
      var bubblePip = '✨ All blueprints locked in, Shakir! Over to our explorer! Let\'s head out!';

      updateSubtitleContent({
        avatar: '🐭',
        name: 'Pip Squeak-a-Link',
        role: 'Chief Safety Scout',
        chip: 'Farm Gate · Farewell',
        text: '“Aye aye, Shakir! Every blueprint, water trench, and soil bed is crystal clear! Over to our grand explorer to forge their haven! Let\'s head out through the gate!”',
        currentTurn: 2
      });

      showPipSpeechBubble(bubblePip, 6000);
      if (pipEl) pipEl.classList.add('pip-anim-hop');

      speakDialogueVoice('pip', pipLine, function () {
        setTimeout(function () {
          if (!guideState.isExitingGate || guideState.exitTurn !== 2) return;
          performFinalExitWalk();
        }, 600);
      });
    }
  }

  function performFinalExitWalk() {
    clearSequenceTimers();
    stopDialogueVoice();

    var el = guideState.walkerEl;
    var pipEl = guideState.pipEl;
    var gatePos = { left: 92.5, top: 52.0 };
    var outsidePos = { left: 104.0, top: 52.0 };

    if (!el) {
      finalizeTourDeparture();
      return;
    }

    var bubble = document.getElementById('shakirSpeechBubble');
    if (bubble) bubble.classList.add('hidden');
    var pipBubble = document.getElementById('pipSpeechBubble');
    if (pipBubble) pipBubble.classList.add('hidden');

    showSkyHeading('Leaving Farm · Handover Complete ⛩️', gatePos, '⛩️');

    // Walk outward past gate arch and smoothly fade out
    walkPathSmooth(el, [gatePos, outsidePos], 2200, function () {
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      el.style.opacity = '0';
      el.style.transform = 'translate(-50%, -85%) scale(0.5)';

      if (pipEl) {
        pipEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        pipEl.style.opacity = '0';
        pipEl.style.transform = 'translate(-50%, -85%) scale(0.5)';
      }

      setTimeout(function () {
        finalizeTourDeparture();
      }, 600);
    });
  }

  function finalizeTourDeparture() {
    // 1. Remove walker avatars
    var el = guideState.walkerEl || document.getElementById('s2ShakirGuide');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    removePipCompanion();
    guideState.walkerEl = null;
    guideState.pipEl = null;
    guideState.active = false;
    guideState.isExitingGate = false;
    guideState.cooldownActive = false;
    guideState.cooldownRemaining = 0;

    // 2. Smoothly vanish all sticky cooldown timer floaters, pills, and modals
    clearCooldown();
    var floater = document.getElementById('s2ScoutCountdownFloater');
    if (floater && floater.parentNode) floater.parentNode.removeChild(floater);
    var pill = document.getElementById('s2CooldownIconPill');
    if (pill && pill.parentNode) pill.parentNode.removeChild(pill);
    var popModal = document.getElementById('s2CooldownPopModal');
    if (popModal && popModal.parentNode) popModal.parentNode.removeChild(popModal);
    var navDock = document.getElementById('s2TourNavDock');
    if (navDock && navDock.parentNode) navDock.parentNode.removeChild(navDock);

    if (global.SearchO2HomeAvatar) {
      try {
        if (typeof global.SearchO2HomeAvatar.clearScoutCooldown === 'function') global.SearchO2HomeAvatar.clearScoutCooldown();
        if (typeof global.SearchO2HomeAvatar.hideScoutCountdownFloater === 'function') global.SearchO2HomeAvatar.hideScoutCountdownFloater();
        if (typeof global.SearchO2HomeAvatar.clearGhosts === 'function') global.SearchO2HomeAvatar.clearGhosts();
      } catch (e) {}
    }

    // 3. Smoothly vanish the subtitle dock and subtitle icon button
    var dock = document.getElementById('shakirPipSubtitleDock');
    if (dock) {
      dock.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      dock.style.opacity = '0';
      dock.style.transform = 'translateY(16px)';
      setTimeout(function () {
        if (dock && dock.parentNode) dock.parentNode.removeChild(dock);
      }, 420);
    }
    var subBtn = document.getElementById('btnToggleTourSubtitles');
    if (subBtn) {
      subBtn.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      subBtn.style.opacity = '0';
      subBtn.style.transform = 'scale(0.8)';
      setTimeout(function () {
        if (subBtn && subBtn.parentNode) subBtn.parentNode.removeChild(subBtn);
      }, 420);
    }

    // 4. Vanish any remaining bubbles, heading banners, or victory modals
    var bubble = document.getElementById('shakirSpeechBubble');
    if (bubble && bubble.parentNode) bubble.parentNode.removeChild(bubble);
    var pipBubble = document.getElementById('pipSpeechBubble');
    if (pipBubble && pipBubble.parentNode) pipBubble.parentNode.removeChild(pipBubble);
    var vic = document.getElementById('s2VictoryModal');
    if (vic && vic.parentNode) vic.parentNode.removeChild(vic);
    var skyHead = document.querySelector('.shakir-sky-heading');
    if (skyHead && skyHead.parentNode) skyHead.parentNode.removeChild(skyHead);

    clearChapterGhosts();

    // 5. Award full exploration state now that Shakir & Pip have officially left through the gate
    if (typeof global.state !== 'undefined' && global.state) {
      global.state.allChaptersExplored = true;
    }

    // 6. Notify user that the Jute Tarpaulin is now ready to uncover manually by clicking it
    if (typeof global.showNotification === 'function') {
      global.showNotification('⛏️', 'Shakir & Pip have departed! Tap the Jute Tarpaulin beside the Farm Shed to uncover your tools!', 'achievement');
    }

    // 7. Re-render farm canvas so the Jute Tarpaulin spot transitions to ✨ Uncover Cache!
    if (typeof global.render === 'function') {
      try { global.render(); } catch (e) {}
    }
    if (typeof global.requestSave === 'function') {
      try { global.requestSave(); } catch (e) {}
    }

    // 8. Add gentle pulse animation to the jute tarpaulin spot to guide the user
    setTimeout(function () {
      var tarpEl = document.querySelector('[data-building="jute_tarp"]') || document.querySelector('.jute-tarp-spot-card');
      if (tarpEl) {
        tarpEl.classList.add('pulse-glow');
      }
    }, 150);

    if (typeof guideState.exitOnComplete === 'function') {
      guideState.exitOnComplete();
      guideState.exitOnComplete = null;
    }
  }

  function clearChapterGhosts() {
    if (global.SearchO2HomeAvatar && typeof global.SearchO2HomeAvatar.clearGhosts === 'function') {
      try { global.SearchO2HomeAvatar.clearGhosts(); } catch (e) {}
    }
  }

  function openGuideDialog(ch) {
    ch = parseInt(ch, 10) || guideState.currentChapter || 1;
    toggleSubtitles(true);
    playCurrentSpotDialogue(ch, 0, 1);
  }

  function openShakirDialogue() {
    toggleSubtitles(true);
    var ch = guideState.currentChapter || 1;
    var spotIdx = guideState.currentSpotIdx || 0;
    playCurrentSpotDialogue(ch, spotIdx, guideState.currentDialogueTurn || 1);
  }

  // ---------------------------------------------------------------------------
  // Top HUD Navigation Dock
  // ---------------------------------------------------------------------------
  function hideTourNavDock() {
    var nav = document.getElementById('s2ShakirTourNav');
    if (nav && nav.parentNode) nav.parentNode.removeChild(nav);
  }

  function renderTourNavDock(targetCh) {
    var chapterData = CHAPTER_JOURNEY[targetCh] || CHAPTER_JOURNEY[1];
    var nav = document.getElementById('s2ShakirTourNav');
    if (!nav) {
      nav = document.createElement('div');
      nav.id = 's2ShakirTourNav';
      nav.className = 'shakir-tour-nav-dock';
      document.body.appendChild(nav);
    }

    nav.innerHTML =
      '<div class="shakir-nav-info">' +
        '<span class="shakir-nav-tag">Scouting Masterplan</span>' +
        '<span class="shakir-nav-landmark">Ch. ' + targetCh + ': ' + chapterData.title + '</span>' +
      '</div>' +
      '<div class="shakir-nav-btn-group">' +
        '<span class="shakir-nav-ch-badge">' + targetCh + '/8</span>' +
        (targetCh > 1 ? '<button type="button" class="shakir-nav-btn" id="btnTourPrev">◀ <span class="nav-text">Prev</span></button>' : '') +
        '<button type="button" class="shakir-nav-btn" id="btnTourNext" style="background:#0284C7;border-color:#38BDF8;font-weight:900;">' +
          (targetCh < 8 ? '<span class="nav-text">Next</span> ▶' : 'Finish 🏆') +
        '</button>' +
        '<button type="button" class="shakir-nav-btn" id="btnTourExit" title="Exit Tour">✕</button>' +
      '</div>';

    var prevBtn = nav.querySelector('#btnTourPrev');
    if (prevBtn) {
      prevBtn.onclick = function (e) {
        e.stopPropagation();
        if (targetCh > 1) walkToChapter(targetCh - 1);
      };
    }
    var nextBtn = nav.querySelector('#btnTourNext');
    if (nextBtn) {
      nextBtn.onclick = function (e) {
        e.stopPropagation();
        onGotItClicked();
      };
    }
    var exitBtn = nav.querySelector('#btnTourExit');
    if (exitBtn) {
      exitBtn.onclick = function (e) {
        e.stopPropagation();
        removeGuide();
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Boot & Remove Handlers
  // ---------------------------------------------------------------------------
  function bootGuideOnFarm() {
    if (guideState.active || guideState.isWalking || guideState.suppressAutoBoot) return;
    if (global.KidsSustainabilityAcademy && typeof global.KidsSustainabilityAcademy.isOpen === 'function' && global.KidsSustainabilityAcademy.isOpen()) {
      return;
    }
    if (document.getElementById('kidsAcademyModal') || document.getElementById('kidsAcademyHandoverModal')) {
      return;
    }

    ensureShakirStyles();
    ensureSubtitleDock();

    if (global.SearchO2HomeAvatar && typeof global.SearchO2HomeAvatar.hideHomeOverlay === 'function') {
      try { global.SearchO2HomeAvatar.hideHomeOverlay(); } catch (e) {}
    }

    var scene = document.getElementById('fieldScene');
    if (!scene) return;

    var firstSpot = CHAPTER_JOURNEY[1].spots[0];
    spawnShakirWalker(firstSpot.standPoint);

    var greeted = sessionStorage.getItem('searchO2_shakir_welcomed');
    if (!greeted) {
      sessionStorage.setItem('searchO2_shakir_welcomed', '1');
      if (global.KidsSustainabilityAcademy && typeof global.KidsSustainabilityAcademy.triggerOnFarmStart === 'function') {
        var triggered = global.KidsSustainabilityAcademy.triggerOnFarmStart(function () {
          startGuidedTour(1);
        });
        if (!triggered) {
          setTimeout(function () { startGuidedTour(1); }, 600);
        }
      } else {
        setTimeout(function () { startGuidedTour(1); }, 600);
      }
    } else {
      showShakirSpeechBubble('👋 Welcome back! Tap me or 💬 to explore!', 4000);
    }
  }

  function removeGuide() {
    clearSequenceTimers();
    clearCooldown();
    stopDialogueVoice();
    hideTourNavDock();
    clearChapterGhosts();

    var el = guideState.walkerEl || document.getElementById('s2ShakirGuide');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    removePipCompanion();

    var floater = document.getElementById('s2ScoutCountdownFloater');
    if (floater && floater.parentNode) floater.parentNode.removeChild(floater);
    var pill = document.getElementById('s2CooldownIconPill');
    if (pill && pill.parentNode) pill.parentNode.removeChild(pill);
    var popModal = document.getElementById('s2CooldownPopModal');
    if (popModal && popModal.parentNode) popModal.parentNode.removeChild(popModal);

    var dock = document.getElementById('shakirPipSubtitleDock');
    if (dock && dock.parentNode) dock.parentNode.removeChild(dock);

    var subBtn = document.getElementById('btnToggleTourSubtitles');
    if (subBtn && subBtn.parentNode) subBtn.parentNode.removeChild(subBtn);

    var bubble = document.getElementById('shakirSpeechBubble');
    if (bubble && bubble.parentNode) bubble.parentNode.removeChild(bubble);
    var pipBubble = document.getElementById('pipSpeechBubble');
    if (pipBubble && pipBubble.parentNode) pipBubble.parentNode.removeChild(pipBubble);

    var vic = document.getElementById('s2VictoryModal');
    if (vic && vic.parentNode) vic.parentNode.removeChild(vic);

    if (global.SearchO2HomeAvatar) {
      try {
        if (typeof global.SearchO2HomeAvatar.clearScoutCooldown === 'function') global.SearchO2HomeAvatar.clearScoutCooldown();
        if (typeof global.SearchO2HomeAvatar.hideScoutCountdownFloater === 'function') global.SearchO2HomeAvatar.hideScoutCountdownFloater();
        if (typeof global.SearchO2HomeAvatar.clearGhosts === 'function') global.SearchO2HomeAvatar.clearGhosts();
      } catch (e) {}
    }

    guideState.active = false;
    guideState.walkerEl = null;
    guideState.pipEl = null;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  var SearchO2ShakirGuide = {
    isGuestMode: isGuestMode,
    bootGuideOnFarm: bootGuideOnFarm,
    removeGuide: removeGuide,
    startGuidedTour: startGuidedTour,
    walkToChapter: walkToChapter,
    walkToNextChapter: walkToNextChapter,
    onGotItClicked: onGotItClicked,
    clearChapterGhosts: clearChapterGhosts,
    walkOutThroughGate: walkOutThroughGate,
    finalizeTourDeparture: finalizeTourDeparture,
    openGuideDialog: openGuideDialog,
    openShakirDialogue: openShakirDialogue,
    playCurrentSpotDialogue: playCurrentSpotDialogue,
    advanceDialogueTurn: advanceDialogueTurn,
    toggleSubtitles: toggleSubtitles,
    toggleVoice: toggleVoice,
    showVictoryCelebration: showVictoryCelebration,
    renderShakirFigureSvg: renderShakirFigureSvg,
    renderPipFigureSvg: renderPipFigureSvg,
    playPipAnimation: playPipAnimation,
    showShakirSpeechBubble: showShakirSpeechBubble,
    showPipSpeechBubble: showPipSpeechBubble,
    getGuideState: function () { return guideState; },
    isTourActive: function () { return guideState.active; },
    isCooldownActive: function () {
      return guideState.cooldownActive && guideState.cooldownRemaining > 0;
    },
    getCooldownRemaining: function () { return guideState.cooldownRemaining; }
  };

  global.SearchO2ShakirGuide = SearchO2ShakirGuide;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      ensureToolbarButton();
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
    ensureToolbarButton();
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
