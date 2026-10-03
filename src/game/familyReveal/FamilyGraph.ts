/**
 * FamilyGraph: Precomputes centroids, spherical k-NN adjacency, and deterministic edge sets.
 * Conforms strictly to FR2, FR3, and FR5 from constellation_map_visual.md.
 */

import { DEFAULT_FAMILY_CONFIG, type FamilyRevealConfig } from "./config";

export interface Vec3D {
  x: number;
  y: number;
  z: number;
}

export interface ConstellationGraphNode {
  id: string;
  name: string;
  familyId: string;
  secondaryFamilies: string[];
  centroid: Vec3D;
  starPositions: Vec3D[];
  asterismEdges: [number, number][];
}

export interface FamilyGraphData {
  familyId: string;
  name: string;
  myth: string;
  colorHex: number;
  colorStr: string;
  memberIds: string[];
  /** Deterministic adjacency edges between member constellation centroids [idA, idB] where idA < idB */
  adjacency: [string, string][];
}

/** Converts RA (0-24h) and Dec (-90 to +90 deg) to unit sphere vector */
export function raDecToUnitVec(raHours: number, decDeg: number): Vec3D {
  const raRad = (raHours * 15 * Math.PI) / 180;
  const decRad = (decDeg * Math.PI) / 180;
  return {
    x: Math.cos(decRad) * Math.cos(raRad),
    y: Math.sin(decRad),
    z: Math.cos(decRad) * Math.sin(raRad),
  };
}

/** Normalize 3D vector to unit length */
export function normalizeVec(v: Vec3D): Vec3D {
  const len = Math.hypot(v.x, v.y, v.z) || 1.0;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/** Compute angular distance (radians) between two unit vectors */
export function angularDistance(a: Vec3D, b: Vec3D): number {
  const dot = Math.min(1.0, Math.max(-1.0, a.x * b.x + a.y * b.y + a.z * b.z));
  return Math.acos(dot);
}

export class FamilyGraph {
  public config: FamilyRevealConfig;
  public nodes: Map<string, ConstellationGraphNode> = new Map();
  public families: Map<string, FamilyGraphData> = new Map();
  private isInitialized = false;

  constructor(config: FamilyRevealConfig = DEFAULT_FAMILY_CONFIG) {
    this.config = config;
  }

  /**
   * Initializes graph from raw JSON data. Normalizes secondary families and precomputes k-NN.
   * Cached deterministically.
   */
  public initialize(rawConstellations: any[], rawFamilies: Record<string, any>): void {
    if (this.isInitialized) return;

    // 1. Process Constellation Nodes
    for (const c of rawConstellations) {
      // Normalization per spec caveats
      let primaryFamily = c.familyId;
      const secondary: string[] = [];

      if (c.id === "hydrus") {
        primaryFamily = "bayer";
        secondary.push("heavenly_waters");
      } else if (c.id === "triangulum_australe") {
        primaryFamily = "hercules";
        secondary.push("bayer");
      } else if (c.id === "volans") {
        primaryFamily = "bayer";
        secondary.push("lacaille");
      }

      // Convert stars to 3D unit positions on sphere
      const starPositions: Vec3D[] = (c.stars || []).map((s: any) =>
        raDecToUnitVec(s.ra, s.dec)
      );

      // Compute centroid
      let cx = 0, cy = 0, cz = 0;
      if (starPositions.length > 0) {
        for (const p of starPositions) {
          cx += p.x; cy += p.y; cz += p.z;
        }
      } else {
        const center = raDecToUnitVec(c.centerRa ?? 0, c.centerDec ?? 0);
        cx = center.x; cy = center.y; cz = center.z;
      }
      const centroid = normalizeVec({ x: cx, y: cy, z: cz });

      this.nodes.set(c.id, {
        id: c.id,
        name: c.name,
        familyId: primaryFamily,
        secondaryFamilies: secondary,
        centroid,
        starPositions,
        asterismEdges: (c.lines || []).map((edge: [number, number]) =>
          edge[0] < edge[1] ? [edge[0], edge[1]] : [edge[1], edge[0]]
        ),
      });
    }

    // 2. Build Families and k-NN Adjacency
    for (const [famId, fData] of Object.entries(rawFamilies)) {
      const color = this.config.colors[famId] || { hex: 0x00e5ff, str: "#00E5FF" };
      
      // Get member constellations belonging primarily to this family
      const memberIds = Array.from(this.nodes.values())
        .filter((node) => node.familyId === famId)
        .map((n) => n.id)
        .sort(); // Deterministic sorting

      // Build k-NN adjacency graph (k = config.kNeighbors)
      const edgeSet = new Set<string>();
      const k = Math.min(this.config.kNeighbors, Math.max(1, memberIds.length - 1));

      for (let i = 0; i < memberIds.length; i++) {
        const idA = memberIds[i];
        const nodeA = this.nodes.get(idA)!;

        // Distances to all other members in family
        const neighbors: { id: string; dist: number }[] = [];
        for (let j = 0; j < memberIds.length; j++) {
          if (i === j) continue;
          const idB = memberIds[j];
          const nodeB = this.nodes.get(idB)!;
          const dist = angularDistance(nodeA.centroid, nodeB.centroid);
          neighbors.push({ id: idB, dist });
        }

        neighbors.sort((a, b) => a.dist - b.dist);
        for (let nIdx = 0; nIdx < k && nIdx < neighbors.length; nIdx++) {
          const idB = neighbors[nIdx].id;
          const edgeKey = idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
          edgeSet.add(edgeKey);
        }
      }

      // Convert edge set to sorted deterministic array
      const sortedEdges = Array.from(edgeSet)
        .map((k) => k.split("|") as [string, string])
        .sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])));

      this.families.set(famId, {
        familyId: famId,
        name: fData.name || famId,
        myth: fData.mythologicalTheme || fData.description || "",
        colorHex: color.hex,
        colorStr: color.str,
        memberIds,
        adjacency: sortedEdges,
      });
    }

    this.isInitialized = true;
  }

  /**
   * FR5 (Hard Requirement): Deterministically derive active inter-constellation edges
   * from active member Set. Must be byte-identical regardless of click sequence!
   */
  public getActiveInterEdges(familyId: string, activeMemberSet: Set<string>): [string, string][] {
    const family = this.families.get(familyId);
    if (!family || activeMemberSet.size < 2) return [];

    // Filter adjacency edges where BOTH members are active
    const activeEdges: [string, string][] = [];
    for (const [idA, idB] of family.adjacency) {
      if (activeMemberSet.has(idA) && activeMemberSet.has(idB)) {
        // Enforce deterministic ordering
        if (idA < idB) {
          activeEdges.push([idA, idB]);
        } else {
          activeEdges.push([idB, idA]);
        }
      }
    }

    // Sort deterministically
    return activeEdges.sort((a, b) =>
      a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])
    );
  }
}
