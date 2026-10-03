/**
 * Family Reveal Configuration
 * Based on constellation_map_visual.md specifications.
 */

export interface FamilyRevealConfig {
  /** k-nearest neighbours for constellation centroid graph adjacency (default 3) */
  kNeighbors: number;
  /** Minimum revealed members in a family before triggering 3D spherical hull shape (default 3) */
  revealThreshold: number;
  /** Threshold ratio of active members (e.g. 0.35) to offer hull */
  revealThresholdRatio: number;
  /** Whether multi-family simultaneous reveal mode is enabled (default false: cross-fade) */
  multiFamilyMode: boolean;
  /** Colors per Menzel Family in 0xRRGGBB and hex string */
  colors: Record<string, { hex: number; str: string; glow: string }>;
  /** Animation durations in milliseconds */
  animDurations: {
    lineDrawOn: number;
    edgeStagger: number;
    hullFadeIn: number;
    crossFade: number;
    resetFadeOut: number;
  };
  /** Celestial sphere radius for projection and overlays */
  sphereRadius: number;
  /** Local storage caching key */
  storageCacheKey: string;
}

export const DEFAULT_FAMILY_CONFIG: FamilyRevealConfig = {
  kNeighbors: 3,
  revealThreshold: 3,
  revealThresholdRatio: 0.35,
  multiFamilyMode: false,
  colors: {
    ursa_major: { hex: 0x00e5ff, str: "#00E5FF", glow: "rgba(0, 229, 255, 0.45)" },
    zodiac: { hex: 0xffd54f, str: "#FFD54F", glow: "rgba(255, 213, 79, 0.45)" },
    perseus: { hex: 0xb388ff, str: "#B388FF", glow: "rgba(179, 136, 255, 0.45)" },
    hercules: { hex: 0x69f0ae, str: "#69F0AE", glow: "rgba(105, 240, 174, 0.45)" },
    orion: { hex: 0xff6e40, str: "#FF6E40", glow: "rgba(255, 110, 64, 0.45)" },
    heavenly_waters: { hex: 0x448aff, str: "#448AFF", glow: "rgba(68, 138, 255, 0.45)" },
    bayer: { hex: 0xff4081, str: "#FF4081", glow: "rgba(255, 64, 129, 0.45)" },
    lacaille: { hex: 0xeeff41, str: "#EEFF41", glow: "rgba(238, 255, 65, 0.45)" },
  },
  animDurations: {
    lineDrawOn: 480,
    edgeStagger: 180,
    hullFadeIn: 650,
    crossFade: 320,
    resetFadeOut: 350,
  },
  sphereRadius: 2340,
  storageCacheKey: "oxyforge_menzel_family_cache_v2",
};
