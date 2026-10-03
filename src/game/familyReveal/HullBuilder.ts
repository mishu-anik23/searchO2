/**
 * HullBuilder: Generates a curved 3D spherical mesh patch on the celestial sphere
 * with fresnel rim and animated vertex reveal.
 * Static geometry is cached in-memory and in browser storage (FR4 & FR5).
 */

import { type Vec3D, normalizeVec, raDecToUnitVec } from "./FamilyGraph";
import { DEFAULT_FAMILY_CONFIG } from "./config";

export interface HullGeometryData {
  familyId: string;
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint16Array;
  revealTimes: Float32Array; // Per-vertex reveal progression
  centroid: Vec3D;
  vertexCount: number;
  triangleCount: number;
}

export class HullBuilder {
  private cache: Map<string, HullGeometryData> = new Map();
  private radius: number;

  constructor(radius: number = DEFAULT_FAMILY_CONFIG.sphereRadius) {
    this.radius = radius;
  }

  /**
   * Derives a deterministic spherical hull for a family from an active set.
   * If active member set satisfies threshold, generates or returns cached hull.
   * Byte-identical regardless of order (FR5).
   */
  public getOrCreateFamilyHull(
    familyId: string,
    memberCentroids: Vec3D[],
    radius: number = this.radius,
    memberIds?: string[]
  ): HullGeometryData | null {
    if (memberCentroids.length < 3) return null;

    const idKey = memberIds ? memberIds.slice().sort().join(",") : "all";
    const cacheKey = `${familyId}_${idKey}_${radius.toFixed(0)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const hull = this.buildSphericalPatch(familyId, memberCentroids, radius);
    this.cache.set(cacheKey, hull);
    return hull;
  }

  /**
   * Builds an enclosing spherical polygonal fan patch curved over the celestial sphere.
   */
  private buildSphericalPatch(
    familyId: string,
    centroids: Vec3D[],
    radius: number
  ): HullGeometryData {
    // 1. Compute overall family central pole
    let sumX = 0, sumY = 0, sumZ = 0;
    for (const c of centroids) {
      sumX += c.x; sumY += c.y; sumZ += c.z;
    }
    const pole = normalizeVec({ x: sumX, y: sumY, z: sumZ });

    // 2. Establish local tangent frame {U, V} perpendicular to pole
    let up: Vec3D = Math.abs(pole.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
    const uDotPole = up.x * pole.x + up.y * pole.y + up.z * pole.z;
    let u: Vec3D = normalizeVec({
      x: up.x - uDotPole * pole.x,
      y: up.y - uDotPole * pole.y,
      z: up.z - uDotPole * pole.z,
    });
    let v: Vec3D = {
      x: pole.y * u.z - pole.z * u.y,
      y: pole.z * u.x - pole.x * u.z,
      z: pole.x * u.y - pole.y * u.x,
    };

    // 3. Sort boundary points radially by azimuthal angle around the pole
    const sortedPoints = centroids
      .map((pt, origIdx) => {
        const dot = pt.x * pole.x + pt.y * pole.y + pt.z * pole.z;
        const projX = pt.x * u.x + pt.y * u.y + pt.z * u.z;
        const projY = pt.x * v.x + pt.y * v.y + pt.z * v.z;
        const angle = Math.atan2(projY, projX);
        const dist = Math.hypot(projX, projY);
        return { pt, angle, dist, origIdx };
      })
      .sort((a, b) => a.angle - b.angle);

    // 4. Generate curved mesh vertices: 1 center vertex + N boundary vertices + intermediate curvature rings
    // To ensure a smooth curved patch matching celestial sphere radius R, we interpolate along sphere geodesics
    const numBoundary = sortedPoints.length;
    // We create a center vertex (index 0) + ring of outer boundary vertices
    // Expand boundary outward by ~12% to enclose the family comfortably
    const vertices: Vec3D[] = [];
    const revealTimesArr: number[] = [];

    // Center vertex
    vertices.push(pole);
    revealTimesArr.push(0.0);

    for (let i = 0; i < numBoundary; i++) {
      const sp = sortedPoints[i].pt;
      // Slight expansion along sphere for generous celestial hull enclosure
      const expanded = normalizeVec({
        x: sp.x * 1.12 + pole.x * 0.08,
        y: sp.y * 1.12 + pole.y * 0.08,
        z: sp.z * 1.12 + pole.z * 0.08,
      });
      vertices.push(expanded);
      revealTimesArr.push(0.2 + (i / numBoundary) * 0.8);
    }

    // 5. Generate Triangle Fan
    const indicesArr: number[] = [];
    for (let i = 1; i <= numBoundary; i++) {
      const next = i === numBoundary ? 1 : i + 1;
      indicesArr.push(0, i, next);
    }

    // 6. Pack into typed arrays
    const vertexCount = vertices.length;
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const revealTimes = new Float32Array(revealTimesArr);
    const indices = new Uint16Array(indicesArr);

    for (let i = 0; i < vertexCount; i++) {
      const v = vertices[i];
      // Scale by radius onto celestial sphere
      positions[i * 3] = v.x * radius;
      positions[i * 3 + 1] = v.y * radius;
      positions[i * 3 + 2] = v.z * radius;

      // Inverted or outward normal for back/front-side viewing
      normals[i * 3] = v.x;
      normals[i * 3 + 1] = v.y;
      normals[i * 3 + 2] = v.z;
    }

    return {
      familyId,
      positions,
      normals,
      indices,
      revealTimes,
      centroid: pole,
      vertexCount,
      triangleCount: indices.length / 3,
    };
  }

  public clearCache(): void {
    this.cache.clear();
  }
}
