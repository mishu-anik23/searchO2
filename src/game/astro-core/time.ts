/** Civil time → Julian Day and sidereal time. [GEOMETRY] / [EPHEMERIS] */

/** Julian Day from UTC Date (Gregorian). Meeus-style. */
export function julianDay(utc: Date): number {
  const Y = utc.getUTCFullYear();
  const M = utc.getUTCMonth() + 1;
  const D =
    utc.getUTCDate() +
    utc.getUTCHours() / 24 +
    utc.getUTCMinutes() / 1440 +
    utc.getUTCSeconds() / 86400 +
    utc.getUTCMilliseconds() / 86400000;
  let y = Y;
  let m = M;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + D + B - 1524.5;
}

/** Julian centuries from J2000.0 */
export function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525;
}

/** Rough ΔT seconds (Espenak–Meeus polynomial, educational). [EPHEMERIS] */
export function deltaTSeconds(year: number): number {
  const t = (year - 2000) / 100;
  return 62.92 + 0.32217 * (year - 2000) + 0.005589 * (year - 2000) ** 2 * 0.01;
}

/** Greenwich Mean Sidereal Time in degrees (IAU 1982 approx). [GEOMETRY] */
export function gmstDeg(jd: number): number {
  const T = julianCenturies(jd);
  let gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  gmst = ((gmst % 360) + 360) % 360;
  return gmst;
}

/** Local Sidereal Time degrees. lonEast positive. [GEOMETRY] */
export function lstDeg(jd: number, lonEastDeg: number): number {
  return (((gmstDeg(jd) + lonEastDeg) % 360) + 360) % 360;
}

export function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}
export function radToDeg(r: number): number {
  return (r * 180) / Math.PI;
}
export function norm360(d: number): number {
  return ((d % 360) + 360) % 360;
}
export function norm180(d: number): number {
  const x = norm360(d);
  return x > 180 ? x - 360 : x;
}
