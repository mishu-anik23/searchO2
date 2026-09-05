# searchO2 MVP v1 Branch — Design Blueprint Analysis & Prototype Evolution

> Branch: `mvp-v1`  
> Reference: [`searchO2_Game_Design_Blueprint_v2.md`](searchO2_Game_Design_Blueprint_v2.md)  
> Delivery phase: **Phase 1 — Playable core-loop prototype** (Blueprint Addendum, Delivery Phasing §1)

---

## 1. Blueprint Summary

searchO2 is an educational browser farming simulation where players restore barren land, grow trees, produce oxygen (O₂), earn virtual euros, and progress toward an eco-village. The v2 blueprint adds production/security hardening (server-authoritative state, auth, validation) and splits delivery into reviewable phases.

### Phase 1 scope (implemented in prototypes v1–v4)

| Blueprint section | v1 | v2 | v3 | v4 |
|---|---|---|---|---|
| Time compression (1:4, 15 min real = 1 game hour) | ✅ | ✅ | ✅ | ✅ |
| Starting economy (€10,000) | ✅ | ✅ | ✅ | ✅ |
| Land plots & preparation tasks | ✅ | ✅ | ✅ | ✅ |
| Tree categories (Oxygen, Fruit, Vegetable, Timber, Biodiversity) | 3 types | 18 types | 18 types | 18 types + icons |
| Oxygen → money economy | ✅ | ✅ | ✅ | ✅ rebalanced |
| Season system | ✅ | ✅ | ✅ | ✅ |
| Forest / diversity bonuses | ✅ | ✅ | ✅ | ✅ |
| Task queue (dig → plant → grow) | ✅ | ✅ | ✅ | ✅ |
| Offline progress catch-up | ✅ | ✅ | ✅ | ✅ |
| Achievements | 5 | 7 | 9 | 12 |
| Worker system | — | ✅ | ✅ | ✅ + wage rebalance |
| Accessories (irrigation, fertilizer) | — | ✅ | ✅ | ✅ |
| Session persistence (localStorage) | ✅ | ✅ | ✅ | ✅ debounced |
| Educational tree facts | ✅ | ✅ | ✅ | ✅ + hint queue |
| Buildings | — | — | — | ✅ Garden, Pond, Coffee Shop, Juice Bar |
| Storage / harvest pipeline | — | — | — | ✅ |
| Loans / bankruptcy recovery | — | — | — | ✅ |

### Phase 1 explicitly deferred (Blueprint Phase 2+)

- Express/Postgres/Redis backend
- Server-authoritative anti-cheat (A1)
- JWT / OAuth auth (A2)
- WebSocket countdown sync
- Leaderboard persistence (v2 had a client-side server-sim stub, removed in field-scene rewrite)
- Region unlocking, quiz engine, Azure deployment

---

## 2. Prototype File Map

| Version | File | Lines | Role |
|---|---|---|---|
| **v1** | `searchO2-prototype.html` | ~709 | Minimal playable core loop |
| **v2** | `searchO2-prototype-v2.html` | ~877 | Field-scene SVG farm with workers |
| **v3** | `searchO2-prototype-v3.html` | ~1,016 | Full-screen immersive UI + care mechanics |
| **v4** | `searchO2-prototype-v4.html` | ~1,620 | Economy depth, buildings, storage, loans |

All four files are standalone single-page HTML applications (SPA) using HTML5, CSS3, SVG, and vanilla JavaScript — matching Blueprint §Technical Architecture Frontend.

---

## 3. Version-by-Version Analysis

### v1 — Core Loop Foundation (`searchO2-prototype.html`)

**Blueprint traceability:** Milestone 3 (Tree Growth Engine, Time Compression, Oxygen Economy), Task Queue, Offline Progress Engine, Starting Economy.

**What it implements:**

- **Layout:** Scrollable page, 3×2 CSS grid of square plot cards, side-by-side panels (Tasks, Achievements, Facts).
- **Plots:** 6 barren plots; click to start "Dig Land" (€15, 3 game-hours) → ready → plant.
- **Trees:** Oak, Apple, Tomato — 3 of 18 blueprint tree types with staged growth and per-stage O₂ rates.
- **Economy:** O₂ × €0.05 = income; forest bonus +10%, diversity bonus +15%.
- **Time:** Configurable speed (1× spec-accurate through 600× demo); seasons cycle every 96 game-hours.
- **Persistence:** `localStorage` adapter (`window.storage` Promise API); offline catch-up capped at ~30 game-days.
- **Achievements:** First Tree, Green Starter (100 O₂), Eco Farmer (1k O₂), Forest Maker, Oxygen Hero (10k O₂).

**Key design decisions:**

- Client-only state (Phase 1 acceptable per Delivery Phasing).
- Single `advanceGame(dh)` function handles both live ticks and offline bulk simulation.
- Tree picker overlay on plot (no modal system yet).

---

### v2 — Field Scene & Workers (`searchO2-prototype-v2.html`)

**Blueprint traceability:** Worker System (§Workers), full Tree Categories (§Tree Categories), Visual Design (SVG field), Milestone 4 partial.

**Major changes from v1:**

| Area | v1 | v2 |
|---|---|---|
| Field layout | 3×2 grid cards | Single SVG landscape scene with 6 positioned plot spots |
| Tree catalog | 3 types | All 18 blueprint types across 5 categories |
| Workers | None | Laborer, Farmer, Botanist, Engineer — hire/fire/assign to plots |
| Plot accessories | None | Irrigation (€80), Fertilizer (€60) per plot |
| UI interaction | Inline picker overlay | Popovers for worker assign & accessories; tree picker popover |
| Animations | Basic progress bar | Swaying trees, worker SVGs with tools, O₂ particles, cloud drift |
| Worker economy | — | Daily payroll deducted; engineer +10% global income |
| Plot metadata | Badge only | Per-tree UID, type label on plot |
| Layout | Stacked panels below field | Side-by-side: field left, stacked panels right |

**Incremental fixes applied on v2 (commits f4f2bbc → 2da5f51):**

1. Per-tree IDs, O₂ display, top-left widget hints, task cleanup.
2. Side-by-side field + panels; accessories info panel.
3. Stats docked top-right; popovers relocated to viewport on resize/scroll.
4. Robust offline welcome-back modal (button, overlay click, delegated close).

**Note:** An earlier v2 commit (`c74319a`) introduced a server-simulated guest auth + leaderboard stub. The field-scene rewrite replaced that architecture with pure localStorage — aligning with Phase 1 "frontend only, in-memory/local persistence."

---

### v3 — Immersive Full-Screen Experience (`searchO2-prototype-v3.html`)

**Blueprint traceability:** Visual Design Requirements (full-screen responsive), Educational Components, Accessibility (tooltips), Tree Lifecycle care, Wildlife (educational).

**Major changes from v2:**

| Area | v2 | v3 |
|---|---|---|
| Layout paradigm | Scrollable page with panels | Fixed full-viewport `game-root`; field fills screen |
| Navigation | Always-visible panels | Icon dock (📋 Tasks, 👷 Workers, 🏆 Achievements, 📰 Reports) + floating panels |
| Tools | Popover icons on plots | Bottom tool strip with category-grouped plant options + care tools |
| Plot interaction | Popovers | Centralized modal system (`activeModal`) for plant, care, worker, animal |
| Plot health | None | 0–100% health with category-specific decay; affects growth & O₂ |
| Care actions | None | Water (💧) and prune (✂️) with category-based costs |
| Overgrowth | None | Neglected barren/ready plots require clearing (€25, 2 game-hours) |
| Wildlife | None | Random animal visits (🐇🦔🐦); scare (€10) or lose health |
| Reports | None | Botanist daily health reports in Reports panel |
| Hints | None | Rotating hint toast queue (generic tips + tree facts) |
| Achievements | 7 | +2: Pest Patrol, Well-Kept Farm |
| Render strategy | Full innerHTML replace each tick | Partial DOM updates for field bg, plots, dock, tool strip |

**New gameplay loop steps:**

1. Maintain plot health via watering/pruning.
2. Respond to wildlife alerts before timer expires.
3. Clear overgrown plots before digging.
4. Read botanist reports for plot-specific advice.

---

### v4 — Economy Depth & Village Expansion (`searchO2-prototype-v4.html`)

**Blueprint traceability:** Buildings (§Buildings partial), Farm Development Stages toward Eco Village, Achievement System expansion, Milestone 5 partial.

**Major changes from v3:**

| Area | v3 | v4 |
|---|---|---|
| O₂ rate | €0.05/unit | €0.03/unit (tighter economy) |
| Tree/plot costs | Lower | Raised ~20–40% across catalog |
| Worker wages | €20–150/day | €30–180/day |
| Harvest | Passive `lateBonus` income | Active harvest action → stored goods |
| Storage | None | Build Storage Room (€550), expand capacity, sell contents |
| Buildings | None | Garden, Pond (decorative); Coffee Shop, Juice Bar (revenue) |
| Village strip | None | Bottom village row with 4 buildable spots + storage spot |
| Revenue model | O₂ income only | Visitor sales from storage × conversion rate; building upkeep |
| Reputation | None | Farm reputation score from buildings; Visitor Magnet combo bonus |
| Banking | None | 3 loan tiers; auto bankruptcy modal at €−50; early repayment |
| Animations | Basic | Flying birds layer; harvest carry animation; care action animations |
| Tooltips | CSS `:hover::after` | Fixed-position floating tooltip (viewport-safe) |
| Save | Immediate on every action | Debounced `requestSave()` + 20s interval + quota recovery |
| Achievements | 9 | +3: First Harvest, First Building, Visitor Magnet |
| Render perf | Partial updates | `replacePreservingScroll` + build-once for static UI chrome |

**New systems detail:**

- **Storage pipeline:** Mature fruit/vegetable/timber plots produce harvestable goods → `processHarvests()` stores them → revenue buildings consume stored harvest at markup.
- **Buildings:** Decorative (reputation only) vs revenue (processRate, conversionRate, daily upkeep).
- **Loans:** Small (€2k), Medium (€5k), Farm Mortgage (€12k) with interest; missed payments add 5% penalty.
- **Bankruptcy:** At balance ≤ €−50, bank modal offers loan or farm reset.

---

## 4. Commit History (branch `mvp-v1`)

Reconstructed step-by-step history from initial repo through v4:

| # | Commit | Description | Files touched |
|---|---|---|---|
| 1 | `112e7f5` | Initial commit — MIT LICENSE | `LICENSE` |
| 2 | `9204e5f` | **v1:** Game Design Blueprint v2 + Phase-1 core prototype | `searchO2_Game_Design_Blueprint_v2.md`, `searchO2-prototype.html` |
| 3 | `c74319a` | **v2 base:** Server-sim scaffold with guest auth, leaderboard, export/import (superseded by field-scene rewrite) | `searchO2-prototype-v2.html` |
| 4 | `f4f2bbc` | **v2 rewrite:** SVG field scene, 18 tree types, worker system, plot popovers | `searchO2-prototype-v2.html` |
| 5 | `ec7e2bc` | **v2 layout:** Side-by-side field + panels; per-plot UID/type; accessories panel | `searchO2-prototype-v2.html` |
| 6 | `9d0dd2b` | **v2 UX:** Dock stats top-right; viewport-safe popover repositioning | `searchO2-prototype-v2.html` |
| 7 | `2da5f51` | **v2 fix:** Robust offline welcome-back modal close handlers | `searchO2-prototype-v2.html` |
| 8 | *(this branch)* | **v3:** Full-screen immersive UI, plot health, wildlife, care actions, botanist reports | `searchO2-prototype-v3.html` |
| 9 | *(this branch)* | **v4:** Economy rebalance, storage, buildings, loans, harvest pipeline, birds | `searchO2-prototype-v4.html` |
| 10 | *(this branch)* | **docs:** MVP v1 branch history and blueprint traceability | `searchO2-MVP-v1-Branch-History.md` |

---

## 5. Architecture Evolution Diagram

```
Blueprint v2 (Phase 1 scope)
        │
        ▼
┌───────────────────┐
│  v1: Core Loop    │  6 plots, 3 trees, localStorage, offline catch-up
│  searchO2-        │  Grid UI, task queue, 5 achievements
│  prototype.html   │
└────────┬──────────┘
         │ + SVG field scene, 18 trees, workers, accessories
         ▼
┌───────────────────┐
│  v2: Field Farm   │  Landscape scene, popovers, payroll, animations
│  searchO2-        │  Side-by-side layout, per-tree UIDs
│  prototype-v2.html│
└────────┬──────────┘
         │ + full-screen UI, health, wildlife, modals, reports
         ▼
┌───────────────────┐
│  v3: Immersive    │  Icon dock, tool strip, care system, hint toasts
│  searchO2-        │  Botanist reports, overgrowth clearing
│  prototype-v3.html│
└────────┬──────────┘
         │ + storage, buildings, loans, harvest pipeline, economy tighten
         ▼
┌───────────────────┐
│  v4: Eco Village  │  Village strip, reputation, revenue buildings
│  searchO2-        │  Bank/loans, flying birds, debounced persistence
│  prototype-v4.html│
└───────────────────┘
         │
         ▼ (future)
   Phase 2: Express API + Postgres + server-authoritative state
```

---

## 6. How to Run Each Prototype

Open any file directly in a modern browser (Chrome, Firefox, Edge):

```
searchO2-prototype.html       ← v1 core loop
searchO2-prototype-v2.html    ← v2 field scene
searchO2-prototype-v3.html    ← v3 immersive (recommended starting point)
searchO2-prototype-v4.html    ← v4 latest (full feature set)
```

**Demo tip:** Set clock speed to **180×** or **600×** in the season chip dropdown to see growth, seasons, and economy play out quickly.

**Save data:** Each version uses `localStorage` key prefix `searchO2:` — saves are version-specific; loading a v4 save in v1 will not work.

---

## 7. Blueprint Gap Analysis (remaining for Phase 2+)

| Feature | Status |
|---|---|
| Backend API (Express + TypeScript) | Not started |
| PostgreSQL schema / migrations | Not started |
| Redis cache layer | Not started |
| Server-authoritative economy (A1) | Not started |
| JWT + OAuth auth (A2) | Not started |
| WebSocket timer sync | Not started |
| Persistent leaderboards | Stub removed in v2 rewrite |
| Region unlocking (10 regions) | Not started |
| Quiz / educational rewards engine | Facts only (display) |
| All 10 building types | 4 of 10 in v4 |
| Daily events (Rain Bonus, etc.) | Not started |
| Colorblind mode / screen reader | Partial (tooltips, semantic buttons) |
| Azure deployment | Not started |

---

## 8. Recommended Next Steps

1. **Phase 2 scaffold:** Express + TypeScript + Postgres schema matching Blueprint Database Tables.
2. **Extract game engine:** Pull constants, `advanceGame`, and state shape from v4 into a shared module testable without DOM.
3. **Wire v4 frontend to API:** Replace `localStorage` with REST calls; server recomputes rewards on claim (A1).
4. **Add WebSocket:** Push countdown updates for active tasks.
5. **Restore leaderboards:** Server-side aggregates via scheduled jobs (A4).

---

*Generated for branch `mvp-v1` — documents the searchO2 Phase 1 prototype evolution from v1 through v4 against Game Design Blueprint v2.*
