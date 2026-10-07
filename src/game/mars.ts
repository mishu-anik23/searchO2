/** Real Mars landing ellipses + ISRU notes, from published site science (Perseverance, Viking, Zhurong, ExoMars, polar ice papers). */

export type MarsSiteId = "jezero" | "utopia" | "hellas" | "oxia" | "arcadia" | "boreum";

export interface MarsSite {
  id: MarsSiteId;
  name: string;
  lat: string;
  lon: string;
  elev: string;
  region: string;
  geology: string;
  why: string;
  hazard: string;
  ice: string;
  air: string;
  civ: string;
  score: number;
  ref: string;
}

export const MARS_SITES: MarsSite[] = [
  {
    id: "jezero",
    name: "Jezero Crater",
    lat: "18.4°N",
    lon: "77.6°E",
    elev: "−2.6 km",
    region: "Isidis rim · Syrtis Major",
    geology:
      "A 49 km impact crater. A river once cut a breach in the rim and built a fan-delta of clay and carbonate into a lake that lasted millions of years. Perseverance landed on the floor in 2021.",
    why: "Ancient water + clay that can trap organics. Flat enough ellipse. Solar works at this latitude year-round.",
    hazard: "Delta scarps, blocky ejecta. Terrain-relative navigation is required — Perseverance used it.",
    ice: "No shallow ice. Water is locked in minerals. Drinkable water means shipping or deep drilling.",
    air: "Typical lowland density. Parachutes work, but not enough to land without engines.",
    civ: "Science town. Poor ice mine. Good rock for bricks once you have power.",
    score: 84,
    ref: "NASA Mars 2020 / Stack et al. 2020 landing-site selection",
  },
  {
    id: "utopia",
    name: "Utopia Planitia",
    lat: "47°N",
    lon: "117°E",
    elev: "−3.1 km",
    region: "Northern lowlands",
    geology:
      "One of the largest impact basins, later filled with smooth volcanic and sedimentary plains. Viking 2 (1976) and China’s Zhurong (2021) both landed here. Radar sees glacier-like ice tens of metres down.",
    why: "Huge, gentle ellipse. Mid-latitude ice is the cargo prize. Easy rover driving.",
    hazard: "Regional dust storms. Ice sits under a dry lag — you must dig. Winters are cold.",
    ice: "Subsurface excess ice, likely glacial. This is how a depot drinks and makes fuel.",
    air: "Slightly thicker than the highlands because the floor is low. Every extra pascal helps the chute.",
    civ: "Best first cargo city: ice + flat pads + known landing history.",
    score: 93,
    ref: "Viking 2, Tianwen-1; SHARAD mid-latitude ice (Bramson, Stuurman)",
  },
  {
    id: "hellas",
    name: "Hellas Planitia",
    lat: "42°S",
    lon: "70°E",
    elev: "−7.1 km",
    region: "Southern highlands basin",
    geology:
      "The deepest wide hole on Mars — a 2,300 km impact basin. Floor pressure is the highest on the planet. Frost and dust play across a cold desert sea of old lava and sediment.",
    why: "Thicker air means a parachute steals more speed. Lower Δv to the ground. A physics gift.",
    hazard: "Dust, cold, CO₂ frost. Harder solar in southern winter. Rim storms can spill in.",
    ice: "Seasonal frost; possible buried ice on the margins. Not as sure as Utopia or Arcadia.",
    air: "Peak surface pressure on Mars (~1.2 kPa vs ~0.6 kPa at mean). Chutes and balloons like this.",
    civ: "Entry-friendly outpost. Build here if your lander is heavy and your power is nuclear.",
    score: 80,
    ref: "MOLA topography; Mars Climate Database pressure vs elevation",
  },
  {
    id: "oxia",
    name: "Oxia Planum",
    lat: "18.2°N",
    lon: "24.3°W",
    elev: "−3.0 km",
    region: "Chryse / Arabia margin",
    geology:
      "Wide clay-bearing plains at the mouth of ancient channels that drained toward Chryse. ESA picked it for Rosalind Franklin. Layered iron-magnesium phyllosilicates — old, wet chemistry written in the dirt.",
    why: "Smooth ellipse, low elevation, clays for science, equatorial sun.",
    hazard: "Some scarps and craters. Dust. Clays are not ice — you still import water or drill.",
    ice: "Mineral-bound. Hydrated clays can yield water if you heat them hard.",
    air: "Lowland. Similar chute performance to Jezero.",
    civ: "Lab + brickworks. Heat clay for water and ceramics once power is up.",
    score: 86,
    ref: "ESA ExoMars landing-site selection (Oxia Planum)",
  },
  {
    id: "arcadia",
    name: "Arcadia Planitia",
    lat: "40°N",
    lon: "160°W",
    elev: "−3.0 km",
    region: "Amazonian volcanic plains",
    geology:
      "Young lava plains with a bumpy, ‘brain-terrain’ surface. SHARAD radar shows widespread dirty ice sheets a few metres down — leftover from a wetter climate. NASA has studied it as a human-mission ice mine.",
    why: "Shallow ice over thousands of kilometres. The civilization fuel tank.",
    hazard: "Hummocky ice-cored ground can collapse. Dust. You pick a smooth patch with radar first.",
    ice: "Excess ice starting a few metres down. Mine it for drink, air (via electrolysis), and methane.",
    air: "Typical northern-lowland pressure.",
    civ: "Fuel depot. Ice → water → O₂ + H₂ → CH₄ with the Sabatier reaction.",
    score: 91,
    ref: "Bramson et al. 2015; NASA human-landing ice maps (P-HLS)",
  },
  {
    id: "boreum",
    name: "Planum Boreum",
    lat: "87°N",
    lon: "0°",
    elev: "−2.0 km",
    region: "North polar cap",
    geology:
      "A stack of water-ice layers kilometres thick, dusted with summer sand, ringed by a steep scarp. In polar summer the Sun never sets. In winter it never rises, and CO₂ snow falls.",
    why: "The biggest water reservoir you can see from orbit. 24-hour summer solar.",
    hazard: "Six-month night. Steep scarps. CO₂ ice. You cannot live here without nuclear or huge storage.",
    ice: "Water ice at the surface. This is the well.",
    air: "Cold, sometimes CO₂ frost. Density varies with season.",
    civ: "Seasonal ice mine, not a hometown — unless you bring a reactor.",
    score: 72,
    ref: "MOLA / SHARAD polar cap; Phoenix 2008 ice (near the cap edge)",
  },
];

export function siteById(id: string | null | undefined): MarsSite {
  return MARS_SITES.find((s) => s.id === id) ?? MARS_SITES[1];
}

export function civHint(stepId: string, site: MarsSite): string {
  switch (stepId) {
    case "survey":
      return `${site.name}: ${site.geology.split(".")[0]}. Hazard — ${site.hazard}`;
    case "power":
      if (site.id === "boreum")
        return "Polar night lasts months. A reactor is not optional here. Summer sun never sets — bank that energy.";
      if (site.id === "hellas")
        return "Dust storms spill over the rim. Tilt arrays, keep a spare, and consider nuclear for winter.";
      return `${site.lat} sunlight is enough if you dust the panels. Score ${site.score} for a first town.`;
    case "ice":
      return site.ice;
    case "air":
      return `${site.air} MOXIE still works — density changes the pump, not the chemistry.`;
    case "pressure":
      return "Sieve argon and nitrogen from the local air. Dump CO₂ into Sabatier later.";
    case "shield":
      return "Two metres of this dirt. Free mass. Cover the windows in a solar storm.";
    case "green":
      return "Thin air is already 95% CO₂ — the greenhouse is overfed on carbon, starved on pressure.";
    case "loop":
      return "Twenty-six months between cargo windows. A leaky water loop is a planned drought.";
    case "brick":
      if (site.id === "oxia" || site.id === "jezero")
        return "Clays here sinter into ceramics. Heat is the factory. The second hall should not wait for Earth.";
      return "Sulfur concrete and sintered basalt. Local rock, local walls.";
    case "fuel":
      return site.score >= 90
        ? `${site.name} has the ice. Ice + CO₂ air = Sabatier feedstock on site. This is how you fly home.`
        : `${site.ice} Fuel is the return ticket — import hydrogen or drill deeper.`;
    default:
      return site.civ;
  }
}

export interface EdlHud {
  altKm: number;
  vKms: number;
  mach: number;
  rho: number;
  qPa: number;
  heat: string;
  gLoad: number;
  note: string;
}

/** Thin CO₂ column: ρ ≈ ρ0 exp(−h / H), H ≈ 11.1 km, ρ0 ≈ 0.020 kg/m³ at 0 km. */
export function marsRho(altKm: number): number {
  return 0.02 * Math.exp(-Math.max(0, altKm) / 11.1);
}

export function edlHud(stepId: string, altKm: number, vKms: number): EdlHud {
  const rho = marsRho(altKm);
  const v = vKms * 1000;
  const qPa = 0.5 * rho * v * v;
  const sound = 240;
  const mach = v / sound;
  const gLoad = qPa > 4000 ? 8 : qPa > 800 ? 3.5 : vKms > 1 ? 1.2 : 0.38;
  const heat = vKms > 4 ? "plasma sheath" : vKms > 1.5 ? "warm shock" : "engines";
  return {
    altKm,
    vKms,
    mach,
    rho,
    qPa,
    heat,
    gLoad,
    note: stepId,
  };
}

function rnd(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hash(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const MAP_W = 72;
export const MAP_D = 48;

/** 0–1 height field. Site recipes follow real geomorphology, not noise soup. */
export function buildHeight(site: MarsSiteId): Float32Array {
  const w = MAP_W;
  const d = MAP_D;
  const h = new Float32Array(w * d);
  const r = rnd(hash(site));
  const at = (x: number, y: number) => y * w + x;
  for (let y = 0; y < d; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / (w - 1);
      const v = y / (d - 1);
      let z = 0.42 + (r() - 0.5) * 0.04;
      if (site === "jezero") {
        const cx = 0.52;
        const cy = 0.5;
        const rr = Math.hypot(u - cx, v - cy);
        z = 0.28 + (rr - 0.34) * (rr - 0.34) * 4.2;
        if (rr < 0.32) z = 0.22 + (0.32 - rr) * 0.15;
        if (rr > 0.3 && rr < 0.4) z = 0.72 - Math.abs(rr - 0.35) * 2;
        if (u < 0.48 && Math.abs(v - 0.5) < 0.12 && rr < 0.38) z = 0.26 + (0.48 - u) * 0.2;
      } else if (site === "utopia") {
        z = 0.34 + Math.sin(u * 6) * 0.03 + Math.sin(v * 4.2) * 0.025;
        const cr = Math.hypot(u - 0.7, v - 0.35);
        if (cr < 0.1) z -= (0.1 - cr) * 1.4;
      } else if (site === "hellas") {
        z = 0.18 + Math.hypot(u - 0.5, v - 0.5) * 0.7;
        z += Math.sin(u * 9) * 0.02;
      } else if (site === "oxia") {
        z = 0.4 + (v - 0.4) * 0.18 + Math.sin(u * 10) * 0.03;
        if (Math.abs(u - 0.45) < 0.04) z -= 0.08;
      } else if (site === "arcadia") {
        z = 0.38 + Math.sin(u * 14) * Math.sin(v * 11) * 0.08;
        z += (r() - 0.5) * 0.05;
      } else {
        z = 0.62 - v * 0.2 + Math.sin(u * 18) * 0.04;
        if (v < 0.22) z = 0.78 + Math.sin(u * 22) * 0.05;
        if (v > 0.28 && v < 0.36) z = 0.22;
      }
      if (r() > 0.992) {
        const rad = 0.03 + r() * 0.04;
        const crx = u;
        const cry = v;
        for (let yy = 0; yy < d; yy++) {
          for (let xx = 0; xx < w; xx++) {
            const dd = Math.hypot(xx / (w - 1) - crx, yy / (d - 1) - cry);
            if (dd < rad) h[at(xx, yy)] -= (rad - dd) * 1.6;
          }
        }
      }
      h[at(x, y)] += z;
    }
  }
  let min = 1e9;
  let max = -1e9;
  for (const v of h) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = max - min || 1;
  for (let i = 0; i < h.length; i++) h[i] = (h[i] - min) / span;
  return h;
}

export function elevColor(site: MarsSiteId, t: number, ice: boolean): [number, number, number] {
  const low: [number, number, number] = site === "hellas" ? [72, 38, 28] : [96, 52, 36];
  const hi: [number, number, number] = [198, 142, 102];
  const r = low[0] + (hi[0] - low[0]) * t;
  const g = low[1] + (hi[1] - low[1]) * t;
  const b = low[2] + (hi[2] - low[2]) * t;
  if (ice && t > 0.62) {
    const k = (t - 0.62) / 0.38;
    return [r + (226 - r) * k, g + (214 - g) * k, b + (204 - b) * k];
  }
  return [r, g, b];
}
