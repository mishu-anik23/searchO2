/**
 * FamilyRevealController: Central reactive state manager for Menzel Family Reveal.
 * Implements FR1 through FR7, order-independence (FR5), browser caching, and navigation.
 */

import { DEFAULT_FAMILY_CONFIG, type FamilyRevealConfig } from "./config";
import { FamilyGraph, type FamilyGraphData, type ConstellationGraphNode } from "./FamilyGraph";
import { HullBuilder, type HullGeometryData } from "./HullBuilder";

export interface FamilyRevealState {
  activeFamilyId: string | null;
  selectedConstellationId: string | null;
  activeMemberSet: Set<string>;
  revealedCount: number;
  totalMembers: number;
  revealRatio: number;
  hullReady: boolean;
  hullData: HullGeometryData | null;
  activeEdges: [string, string][];
  familyColorStr: string;
  familyColorHex: number;
  familyName: string;
  mythTheme: string;
  allMembers: { id: string; name: string; isRevealed: boolean }[];
  hoveredInfo: { id: string; name: string; dist: string; constellation: string; family: string } | null;
}

export type FamilyRevealListener = (state: FamilyRevealState) => void;

export class FamilyRevealController {
  public config: FamilyRevealConfig;
  public graph: FamilyGraph;
  public hullBuilder: HullBuilder;
  private listeners: Set<FamilyRevealListener> = new Set();

  private activeFamilyId: string | null = null;
  private selectedConstellationId: string | null = null;
  private activeSets: Map<string, Set<string>> = new Map();
  private hoveredInfo: FamilyRevealState["hoveredInfo"] = null;

  constructor(config: FamilyRevealConfig = DEFAULT_FAMILY_CONFIG) {
    this.config = config;
    this.graph = new FamilyGraph(config);
    this.hullBuilder = new HullBuilder(config.sphereRadius);
    this.tryRestoreBrowserCache();
  }

  public init(rawConstellations: any[], rawFamilies: Record<string, any>): void {
    this.graph.initialize(rawConstellations, rawFamilies);
    this.emitChange();
  }

  public subscribe(listener: FamilyRevealListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private emitChange(): void {
    const st = this.getState();
    for (const listener of this.listeners) {
      listener(st);
    }
    this.persistBrowserCache();
  }

  /**
   * FR1, FR2, FR3 & FR5: Primary click selection. Order-independent!
   */
  public selectConstellation(constellationId: string): void {
    const node = this.graph.nodes.get(constellationId);
    if (!node) return;

    const targetFamilyId = node.familyId;

    // Cross-fade if different family and not in multi-family mode
    if (this.activeFamilyId && this.activeFamilyId !== targetFamilyId && !this.config.multiFamilyMode) {
      this.activeFamilyId = targetFamilyId;
    } else if (!this.activeFamilyId) {
      this.activeFamilyId = targetFamilyId;
    }

    if (!this.activeSets.has(targetFamilyId)) {
      this.activeSets.set(targetFamilyId, new Set());
    }

    const set = this.activeSets.get(targetFamilyId)!;
    set.add(constellationId);
    this.selectedConstellationId = constellationId;

    this.emitChange();
  }

  /**
   * Reveals all member constellations in the current family in one click.
   */
  public revealAllInFamily(familyId: string = this.activeFamilyId || "ursa_major"): void {
    const fam = this.graph.families.get(familyId);
    if (!fam) return;

    this.activeFamilyId = familyId;
    if (!this.activeSets.has(familyId)) {
      this.activeSets.set(familyId, new Set());
    }
    const set = this.activeSets.get(familyId)!;
    for (const mId of fam.memberIds) {
      set.add(mId);
    }
    if (fam.memberIds.length > 0) {
      this.selectedConstellationId = fam.memberIds[0];
    }
    this.emitChange();
  }

  /**
   * Navigation: cycle to next member in current family.
   */
  public nextMember(): void {
    if (!this.activeFamilyId) return;
    const fam = this.graph.families.get(this.activeFamilyId);
    if (!fam || fam.memberIds.length === 0) return;

    const curIdx = this.selectedConstellationId ? fam.memberIds.indexOf(this.selectedConstellationId) : -1;
    const nextIdx = (curIdx + 1) % fam.memberIds.length;
    this.selectConstellation(fam.memberIds[nextIdx]);
  }

  /**
   * Navigation: cycle to previous member in current family.
   */
  public prevMember(): void {
    if (!this.activeFamilyId) return;
    const fam = this.graph.families.get(this.activeFamilyId);
    if (!fam || fam.memberIds.length === 0) return;

    const curIdx = this.selectedConstellationId ? fam.memberIds.indexOf(this.selectedConstellationId) : 0;
    const prevIdx = (curIdx - 1 + fam.memberIds.length) % fam.memberIds.length;
    this.selectConstellation(fam.memberIds[prevIdx]);
  }

  /**
   * Hover tooltip setter.
   */
  public setHoveredInfo(info: FamilyRevealState["hoveredInfo"]): void {
    this.hoveredInfo = info;
    this.emitChange();
  }

  /**
   * FR7: Reset state on ESC / empty sky click / reset button.
   */
  public reset(): void {
    this.activeFamilyId = null;
    this.selectedConstellationId = null;
    this.activeSets.clear();
    this.hoveredInfo = null;
    this.emitChange();
  }

  /**
   * Sequence-independent state computation (FR5).
   */
  public getState(): FamilyRevealState {
    const famId = this.activeFamilyId;
    const fam = famId ? this.graph.families.get(famId) : null;
    const activeSet = famId && this.activeSets.has(famId)
      ? this.activeSets.get(famId)!
      : new Set<string>();

    const totalMembers = fam ? fam.memberIds.length : 0;
    const revealedCount = activeSet.size;
    const revealRatio = totalMembers > 0 ? revealedCount / totalMembers : 0;

    const hullReady =
      revealedCount >= this.config.revealThreshold ||
      revealRatio >= this.config.revealThresholdRatio;

    // Derive inter-edges deterministically from activation Set only
    const activeEdges = famId ? this.graph.getActiveInterEdges(famId, activeSet) : [];

    // Derive hull deterministically from member centroids
    let hullData: HullGeometryData | null = null;
    if (hullReady && fam) {
      const activeIds = fam.memberIds
        .filter((id) => activeSet.has(id))
        .sort();

      const activeCentroids = activeIds
        .map((id) => this.graph.nodes.get(id)!.centroid);

      hullData = this.hullBuilder.getOrCreateFamilyHull(
        fam.familyId,
        activeCentroids,
        this.config.sphereRadius,
        activeIds
      );
    }

    const allMembers = fam
      ? fam.memberIds.map((id) => ({
          id,
          name: this.graph.nodes.get(id)?.name || id,
          isRevealed: activeSet.has(id),
        }))
      : [];

    return {
      activeFamilyId: famId,
      selectedConstellationId: this.selectedConstellationId,
      activeMemberSet: activeSet,
      revealedCount,
      totalMembers,
      revealRatio,
      hullReady,
      hullData,
      activeEdges,
      familyColorStr: fam?.colorStr || "#00E5FF",
      familyColorHex: fam?.colorHex || 0x00e5ff,
      familyName: fam?.name || "Menzel Sky Path",
      mythTheme: fam?.myth || "Select any constellation to reveal its celestial family myth.",
      allMembers,
      hoveredInfo: this.hoveredInfo,
    };
  }

  // --- Browser Storage Caching for Reducing Server-Side Load ---
  private persistBrowserCache(): void {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      const serializable: Record<string, string[]> = {};
      for (const [k, v] of this.activeSets.entries()) {
        serializable[k] = Array.from(v).sort();
      }
      window.localStorage.setItem(
        this.config.storageCacheKey,
        JSON.stringify({
          activeFamilyId: this.activeFamilyId,
          selectedConstellationId: this.selectedConstellationId,
          activeSets: serializable,
        })
      );
    } catch {
      // Ignore localStorage restrictions
    }
  }

  private tryRestoreBrowserCache(): void {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      const raw = window.localStorage.getItem(this.config.storageCacheKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.activeFamilyId) this.activeFamilyId = parsed.activeFamilyId;
      if (parsed.selectedConstellationId) this.selectedConstellationId = parsed.selectedConstellationId;
      if (parsed.activeSets) {
        for (const [k, arr] of Object.entries(parsed.activeSets)) {
          this.activeSets.set(k, new Set(arr as string[]));
        }
      }
    } catch {
      // Ignore cache corruption
    }
  }
}

// Global Singleton for immediate consumption
export const globalFamilyRevealController = new FamilyRevealController();
