# Menzel Constellation Family Reveal Engine — Integration Guide

## Overview
This engine delivers an interactive **Family Reveal** mode across all 88 modern IAU constellations partitioned into **Donald H. Menzel's 8 Sky Path Families**.
Clicking a constellation draws and animates its asterism, and progressively — in **ANY** click order — builds the underlying Menzel family as a glowing 3D form overlaid on the deep sky.

---

## 1. Modular Architecture

The engine is located under `src/game/familyReveal/`:

| File | Purpose |
|------|---------|
| `config.ts` | Central configuration: `kNeighbors` (3), `revealThreshold` (3), `multiFamilyMode`, colors, animation durations, caching keys. |
| `FamilyGraph.ts` | Constellation centroid calculation, spherical $k\text{-NN}$ ($k=3$) adjacency graph, deterministic inter-constellation edge sets. |
| `HullBuilder.ts` | Generates curved spherical polygonal mesh patch on celestial sphere radius ($R=2340$) with radial sorting, cached in-memory and in browser storage. |
| `LineBatch.ts` | Single batched `LineSegments` GPU geometry for ghost asterisms, active asterisms, and inter-constellation bonds with draw-on shader. Zero per-frame allocations. |
| `FamilyRevealController.ts` | Central reactive state machine maintaining `Set<constellationId>`, order-independent state derivation (FR5), browser `localStorage` persistence, and event emitter. |
| `FamilyShapeOverlay.tsx` | Three.js / R3F component rendering the `LineBatch`, spherical Fresnel hull patch with rim glow, and pooled star halo instances. |
| `FamilyRevealHud.tsx` | Cockpit HUD overlay with active family badge, progress meter, `[◀ Prev]` / `[Next ▶]` navigation, clickable member pills dock, and expandable myth lore. |

---

## 2. Integration Points

### A. R3F Cockpit / Deep Sky Scene (`CockpitScene.tsx`)
1. **Overlay Mount**:
   ```tsx
   import { FamilyShapeOverlay } from "./FamilyShapeOverlay";
   import { FamilyRevealHud } from "../FamilyRevealHud";
   import { globalFamilyRevealController } from "@/game/familyReveal/FamilyRevealController";

   // Inside <Canvas>:
   <FamilyShapeOverlay radius={2340} />

   // Inside Cockpit UI:
   <FamilyRevealHud />
   ```

2. **Picker / Click Hooks** (in `StarField3D.tsx`):
   ```tsx
   onClick={() => {
     globalFamilyRevealController.selectConstellation(c.id);
   }}
   onPointerOver={() => {
     globalFamilyRevealController.setHoveredInfo({ ... });
   }}
   onPointerOut={() => {
     globalFamilyRevealController.setHoveredInfo(null);
   }}
   ```

3. **Empty Sky / Reset Hook**:
   ```tsx
   <Canvas onPointerMissed={() => globalFamilyRevealController.reset()}>
   ```

### B. Standalone Browser Preview (`public/transfer-cruise-preview.html`)
- Features the complete 88 constellations dataset embedded directly.
- Renders:
  1. Ghost guide lines for all unrevealed members of active family.
  2. Glowing active member asterisms.
  3. Inter-constellation dashed family bonds.
  4. Spherical hull translucent curved mesh patch with glowing rim ($N \ge 3$).
  5. Top navigation HUD deck with progress bar, pills dock, and arrow navigation.

---

## 3. Data Caveats Handled

Per specification:
1. **Hydrus**: Primary `familyId: "bayer"`, `secondaryFamilies: ["heavenly_waters"]`.
2. **Triangulum Australe**: Primary `familyId: "hercules"`, `secondaryFamilies: ["bayer"]`.
3. **Volans**: Primary `familyId: "bayer"`, `secondaryFamilies: ["lacaille"]`.
4. Partition sum across the 8 Menzel families equals **exactly 88 unique constellations**.

---

## 4. Verification

Run the test suite:
```bash
npx tsx tests/test_family_reveal.ts
```
- **FR5 Validated**: 100/100 randomized click order shuffles produced byte-identical active edges and hull buffers.
- **Hull Caching**: Verified zero-allocation caching.
