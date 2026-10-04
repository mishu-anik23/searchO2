import { degToRad, radToDeg, norm360, lstDeg, julianCenturies as jc } from "./time";
import { meanObliquityDeg } from "./frames";

export type HouseSystem = "whole" | "equal" | "placidus";

/** Ascendant & MC from LST and latitude. [GEOMETRY] */
export function ascendantMc(
  jd: number,
  latDeg: number,
  lonEastDeg: number,
): { asc: number; mc: number; ramc: number; obliquity: number } {
  const T = jc(jd);
  const ε = meanObliquityDeg(T);
  const lst = lstDeg(jd, lonEastDeg);
  const ramc = lst;
  const φ = degToRad(latDeg);
  const εr = degToRad(ε);
  const ramcR = degToRad(ramc);

  const y = Math.cos(ramcR);
  const x = -(Math.sin(ramcR) * Math.cos(εr) + Math.tan(φ) * Math.sin(εr));
  const asc = norm360(radToDeg(Math.atan2(y, x)));
  const mc = norm360(radToDeg(Math.atan2(Math.sin(ramcR), Math.cos(ramcR) * Math.cos(εr))));
  return { asc, mc, ramc, obliquity: ε };
}

/** House cusps. [GEOMETRY] */
export function houseCusps(system: HouseSystem, asc: number, mc: number): number[] {
  const cusps = new Array(12).fill(0);
  if (system === "whole") {
    const start = Math.floor(asc / 30) * 30;
    for (let i = 0; i < 12; i++) cusps[i] = norm360(start + i * 30);
    return cusps;
  }
  for (let i = 0; i < 12; i++) cusps[i] = norm360(asc + i * 30);
  if (system === "placidus") {
    cusps[9] = mc;
    cusps[3] = norm360(mc + 180);
  }
  return cusps;
}
