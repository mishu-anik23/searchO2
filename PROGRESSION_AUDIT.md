# CURRENT V2 PROGRESSION AUDIT (SearchO₂)

Generated from source inspection of `index.html` + `src/` (OxyForge).

## 1. Chapter source
- `CHAPTER_DEFINITIONS` (index.html) — 8 chapters with `isUnlocked` / `isComplete` / `getProgress`
- State: `state.currentChapter`, advanced by `updateChapterProgression()`

## 2. Mission source
- `CHAPTER_CHALLENGES[1..8]` — per-chapter task lists with `isUnlocked` / `isComplete` / `getActionHtml`
- HUD: `getFarmProgressionGuide()` + starting task capsule
- Masterplan modal: chapter tabs + challenge cards

## 3. Object source
- `BUILDING_TYPES`, `BUILDING_ORDER`, `state.buildings.*`
- Wind: `state.buildings.wind_turbines.wt_*`
- Storage: `state.storage` (+ buildings)
- Workers: `state.workers`

## 4. Unlock source (before enhancement)
- `OBJECT_CHAPTER_UNLOCKS` + `isObjectUnlockedByChapter(key)` → `currentChapter >= chapter`
- UI lock labels on canvas spots; **build path did not always re-check chapter**

## 5. Requirement source
- Existing: `requiresEngineer`, `requiresRoad`, money cost inside `startBuildBuilding`

## 6. Persistence
- `localStorage` / `requestSave()`; guest + backend session paths preserved

## 7. UI gating
- Spot cards, Masterplan, task capsule; chapter tab filter

## 8. Masterplan
- Existing modal remains; now reads same `currentChapter` + challenges

## 9. Knowledge / Library
- `DISCOVERY_CARDS`, `openWhyModal` (3 depths), Library encyclopedia — unchanged

## 10. Rewards
- Knowledge XP, player XP, money, O₂ tariffs — unchanged

## Gaps addressed (orchestrator)
| Mechanism | Gap | Change |
|-----------|-----|--------|
| Chapter ↔ Object | Chapter number only | Keep chapter floor; add mission-context gates for storage/BESS/garage |
| Build path | Could bypass chapter UI lock | `ProgressionEvaluator.canBuild` in `startBuildBuilding` |
| First harvest → storage story | Weak | `flags.firstHarvest` + `HARVEST_COMPLETED` event |
| Energy surplus → BESS | Partial (curtailment tip) | `ENERGY_SURPLUS_DETECTED` flag + gate |
| First O₂ → discovery | Optional | `FIRST_O2_GENERATED` → photosynthesis card |
| Existing saves | Risk of lock on built objects | `isObjectAlreadyBuilt` always unlocks |

## Architecture after change
```
Existing world / economy / buildings
        ↓
ProgressionEvaluator (adapter)
        ↓
isObjectUnlockedByChapter / canBuild
        ↓
Existing UI + Masterplan + startBuildBuilding
```

No second Masterplan, building system, or Library was created.

## Plot unlock (Chapter 1 focus) — 2026-10-06

- Only **Plot 1** (index 0) is open at the start of cultivation.
- Plots 2–6 stay locked until the **previous** plot has living plant (`treeType` / growing / harvest / O₂).
- Planting on Plot 1 unlocks Plot 2, marks Chapter 1 complete path, and opens **Storage** as the next necessity (chapter/mission gate + student messaging).
- Existing saves: any plot that already has life remains unlocked.
- Crew Shed still required before opening any plot (tools/workers) — unchanged.
