import { norm180 } from "./time";
import type { BodyPosition } from "./ephemeris";

export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export type AspectHit = {
  a: string;
  b: string;
  type: AspectType;
  exactDeg: number;
  orb: number;
  strength: number;
  applying: boolean;
};

const MAJORS: { type: AspectType; deg: number; defaultOrb: number }[] = [
  { type: "conjunction", deg: 0, defaultOrb: 8 },
  { type: "sextile", deg: 60, defaultOrb: 6 },
  { type: "square", deg: 90, defaultOrb: 7 },
  { type: "trine", deg: 120, defaultOrb: 7 },
  { type: "opposition", deg: 180, defaultOrb: 8 },
];

/** Angular separation on the ecliptic. [GEOMETRY] */
export function angularSep(λ1: number, λ2: number): number {
  return Math.abs(norm180(λ1 - λ2));
}

export function findAspects(bodies: BodyPosition[], orbScale = 1): AspectHit[] {
  const hits: AspectHit[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];
      const sep = angularSep(a.lambda, b.lambda);
      for (const m of MAJORS) {
        const orb = m.defaultOrb * orbScale;
        const delta = Math.abs(sep - m.deg);
        if (delta <= orb) {
          const strength = 1 - delta / orb;
          const relSpeed = a.speedDegPerDay - b.speedDegPerDay;
          // applying if separation moving toward exact
          const signed = norm180(a.lambda - b.lambda);
          const applying = signed * relSpeed < 0;
          hits.push({
            a: a.name,
            b: b.name,
            type: m.type,
            exactDeg: m.deg,
            orb: delta,
            strength,
            applying,
          });
        }
      }
    }
  }
  hits.sort((x, y) => y.strength - x.strength);
  return hits;
}
