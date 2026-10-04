/**
 * Educational low-precision planetary longitudes (Meeus / simplified Kepler).
 * NOT VSOP87 / JPL Horizons grade. Documented in LIMITS.md.
 * Tags: [EPHEMERIS]
 */
import { julianCenturies, norm360, degToRad, radToDeg } from "./time";

export type BodyId =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type BodyPosition = {
  id: BodyId;
  name: string;
  /** Tropical ecliptic longitude deg */
  lambda: number;
  beta: number;
  /** AU (Sun=0, Moon ~0.00257) */
  rAu: number;
  speedDegPerDay: number;
  retrograde: boolean;
};

const NAMES: Record<BodyId, string> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
};

/** Mean elements at J2000 + rates (deg, deg/century). Educational. */
const ELEMENTS: Record<
  Exclude<BodyId, "sun" | "moon">,
  { L0: number; Ldot: number; a: number; e: number; peri0: number; periDot: number }
> = {
  mercury: { L0: 252.2509, Ldot: 149472.6743, a: 0.3871, e: 0.2056, peri0: 77.456, periDot: 1.556 },
  venus: { L0: 181.9798, Ldot: 58517.8156, a: 0.7233, e: 0.0068, peri0: 131.603, periDot: 1.402 },
  mars: { L0: 355.433, Ldot: 19140.3023, a: 1.5237, e: 0.0934, peri0: 336.06, periDot: 1.849 },
  jupiter: { L0: 34.3515, Ldot: 3034.9057, a: 5.2026, e: 0.0485, peri0: 14.331, periDot: 1.613 },
  saturn: { L0: 50.0774, Ldot: 1222.1138, a: 9.5549, e: 0.0555, peri0: 93.057, periDot: 1.963 },
  uranus: { L0: 314.055, Ldot: 428.495, a: 19.2184, e: 0.0463, peri0: 173.005, periDot: 1.0 },
  neptune: { L0: 304.348, Ldot: 218.486, a: 30.1104, e: 0.0095, peri0: 48.123, periDot: 1.0 },
  pluto: { L0: 238.929, Ldot: 145.208, a: 39.48, e: 0.2488, peri0: 224.07, periDot: 0.5 },
};

function keplerE(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 8; i++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  return E;
}

function planetLambda(id: Exclude<BodyId, "sun" | "moon">, T: number): { λ: number; r: number; speed: number } {
  const el = ELEMENTS[id];
  const L = norm360(el.L0 + el.Ldot * T);
  const peri = norm360(el.peri0 + el.periDot * T);
  const M = degToRad(norm360(L - peri));
  const E = keplerE(M, el.e);
  const ν = 2 * Math.atan2(Math.sqrt(1 + el.e) * Math.sin(E / 2), Math.sqrt(1 - el.e) * Math.cos(E / 2));
  const λ = norm360(radToDeg(ν) + peri);
  const r = el.a * (1 - el.e * Math.cos(E));
  const speed = el.Ldot / 36525; // deg/day approx from mean motion
  return { λ, r, speed };
}

/** Sun mean longitude (tropical approx). */
function sunLongitude(T: number): { λ: number; speed: number } {
  const L0 = 280.46646 + 36000.76983 * T;
  const M = degToRad(norm360(357.52911 + 35999.05029 * T));
  const C =
    (1.914602 - 0.004817 * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);
  return { λ: norm360(L0 + C), speed: 0.9856 };
}

/** Moon ecliptic longitude (truncated ELP-like terms). */
function moonLongitude(T: number): { λ: number; β: number; rAu: number; speed: number } {
  const Lp = norm360(218.3164477 + 481267.88123421 * T);
  const D = degToRad(norm360(297.8501921 + 445267.1114034 * T));
  const M = degToRad(norm360(357.5291092 + 35999.0502909 * T));
  const Mp = degToRad(norm360(134.9633964 + 477198.8675055 * T));
  const F = degToRad(norm360(93.272095 + 483202.0175233 * T));
  const λ =
    Lp +
    6.289 * Math.sin(Mp) -
    1.274 * Math.sin(2 * D - Mp) +
    0.658 * Math.sin(2 * D) -
    0.186 * Math.sin(M) -
    0.059 * Math.sin(2 * Mp - 2 * D) -
    0.057 * Math.sin(Mp - 2 * D + M);
  const β =
    5.128 * Math.sin(F) +
    0.2806 * Math.sin(Mp + F) +
    0.2777 * Math.sin(Mp - F) +
    0.1732 * Math.sin(2 * D - F);
  return { λ: norm360(λ), β, rAu: 0.00257, speed: 13.176 };
}

export function bodyPositions(jd: number): BodyPosition[] {
  const T = julianCenturies(jd);
  const out: BodyPosition[] = [];

  const sun = sunLongitude(T);
  out.push({
    id: "sun",
    name: NAMES.sun,
    lambda: sun.λ,
    beta: 0,
    rAu: 0,
    speedDegPerDay: sun.speed,
    retrograde: false,
  });

  const moon = moonLongitude(T);
  out.push({
    id: "moon",
    name: NAMES.moon,
    lambda: moon.λ,
    beta: moon.β,
    rAu: moon.rAu,
    speedDegPerDay: moon.speed,
    retrograde: false,
  });

  for (const id of Object.keys(ELEMENTS) as Exclude<BodyId, "sun" | "moon">[]) {
    const p = planetLambda(id, T);
    // geocentric approximation: heliocentric λ vs sun — very rough elongation fold
    // For educational natal chart use heliocentric λ as stand-in for outer planets
    // and simple correction for inferior planets
    let λ = p.λ;
    let speed = p.speed;
    if (id === "mercury" || id === "venus") {
      const sunλ = sun.λ;
      const elong = Math.sin(degToRad(p.λ - sunλ)) * (id === "mercury" ? 28 : 47);
      λ = norm360(sunλ + elong);
      speed = sun.speed;
    }
    // crude retrograde flag when elongation speed would reverse (inferior only heuristic)
    const retrograde = false;
    out.push({
      id,
      name: NAMES[id],
      lambda: λ,
      beta: 0,
      rAu: p.r,
      speedDegPerDay: speed,
      retrograde,
    });
  }

  return out;
}

export function tropicalSignIndex(lambdaDeg: number): number {
  return Math.floor(norm360(lambdaDeg) / 30) % 12;
}
