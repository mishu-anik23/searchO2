import { degToRad, radToDeg, norm360 } from "./time";

/** Mean obliquity of the ecliptic, Laskar-style (arcsec poly → deg). [GEOMETRY] */
export function meanObliquityDeg(T: number): number {
  const eps0 =
    23 +
    26 / 60 +
    21.448 / 3600 -
    (46.815 / 3600) * T -
    (0.00059 / 3600) * T * T +
    (0.001813 / 3600) * T * T * T;
  return eps0;
}

/** Ecliptic (λ, β) → equatorial (α, δ) degrees. [GEOMETRY] */
export function eclipticToEquatorial(
  lambdaDeg: number,
  betaDeg: number,
  obliquityDeg: number,
): { ra: number; dec: number } {
  const λ = degToRad(lambdaDeg);
  const β = degToRad(betaDeg);
  const ε = degToRad(obliquityDeg);
  const ra = Math.atan2(Math.sin(λ) * Math.cos(ε) - Math.tan(β) * Math.sin(ε), Math.cos(λ));
  const dec = Math.asin(Math.sin(β) * Math.cos(ε) + Math.cos(β) * Math.sin(ε) * Math.sin(λ));
  return { ra: norm360(radToDeg(ra)), dec: radToDeg(dec) };
}

/** Approximate tropical → constellation longitude offset due to precession (~50.3"/yr from AD 150). [GEOMETRY] */
export function precessionOffsetDeg(year: number): number {
  return ((year - 150) * 50.3) / 3600;
}
