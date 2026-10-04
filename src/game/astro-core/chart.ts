/**
 * On-demand natal chart — no precompute of chart space. [EPHEMERIS]/[GEOMETRY]
 * Symbolic digests are attached separately by the UI.
 */
import { julianDay } from "./time";
import { bodyPositions, tropicalSignIndex, type BodyPosition } from "./ephemeris";
import { ascendantMc, houseCusps, type HouseSystem } from "./houses";
import { findAspects, type AspectHit } from "./aspects";
import { precessionOffsetDeg } from "./frames";

export type ChartRequest = {
  utc: Date;
  latDeg: number;
  lonEastDeg: number;
  houseSystem?: HouseSystem;
};

export type Chart = {
  jd: number;
  ascendant: number;
  midheaven: number;
  obliquity: number;
  houseCusps: number[];
  houseSystem: HouseSystem;
  positions: BodyPosition[];
  aspects: AspectHit[];
  precessionOffsetDeg: number;
  meta: { algorithmVersion: string; computeMs: number; cacheHit: boolean };
};

const cache = new Map<string, Chart>();
const CACHE_MAX = 64;

function cacheKey(r: ChartRequest): string {
  const jd = Math.round(julianDay(r.utc) * 86400); // 1s bucket
  const lat = Math.round(r.latDeg * 100);
  const lon = Math.round(r.lonEastDeg * 100);
  return `${jd}|${lat}|${lon}|${r.houseSystem ?? "equal"}`;
}

export function computeChart(req: ChartRequest): Chart {
  const key = cacheKey(req);
  const hit = cache.get(key);
  if (hit) {
    return { ...hit, meta: { ...hit.meta, cacheHit: true } };
  }
  const t0 = performance.now();
  const jd = julianDay(req.utc);
  const system = req.houseSystem ?? "equal";
  const { asc, mc, obliquity } = ascendantMc(jd, req.latDeg, req.lonEastDeg);
  const cusps = houseCusps(system, asc, mc);
  const positions = bodyPositions(jd);
  const aspects = findAspects(positions);
  const year = req.utc.getUTCFullYear();
  const chart: Chart = {
    jd,
    ascendant: asc,
    midheaven: mc,
    obliquity,
    houseCusps: cusps,
    houseSystem: system,
    positions,
    aspects,
    precessionOffsetDeg: precessionOffsetDeg(year),
    meta: {
      algorithmVersion: "oxyforge-edu-0.1",
      computeMs: performance.now() - t0,
      cacheHit: false,
    },
  };
  cache.set(key, chart);
  if (cache.size > CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  return chart;
}

export function signName(lambda: number): string {
  const names = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];
  return names[tropicalSignIndex(lambda)];
}
