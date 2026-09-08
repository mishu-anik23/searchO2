# searchO2 MVP v1 Branch — Design Blueprint Analysis & Prototype Evolution

> **Branch:** `mvp-v1`  
> **Reference Blueprint:** [`searchO2_Game_Design_Blueprint_v2.md`](searchO2_Game_Design_Blueprint_v2.md)  
> **Delivery Scope:** **Phase 1 — Playable Core-Loop Prototype** (Blueprint Addendum, Delivery Phasing §1)  
> **Branch Status:** Fully Implemented (v1 → v2 → v3 → v4), Committed on `mvp-v1`, and Pushed to Remote.

---

## 1. Executive Blueprint Analysis (searchO2 Game Design Blueprint v2)

The `searchO2_Game_Design_Blueprint_v2.md` document serves as the architectural foundation and game design document (GDD) for searchO2. It specifies an educational single-page browser farming simulation that transforms infertile land into a self-sustaining eco-community through tree cultivation, oxygen production, and virtual Euro economics.

### 1.1 Core Game Objectives
1. **Restore Barren Land:** Prepare uncultivated soil into fertile agricultural ground.
2. **Maximize Oxygen Production:** Plant high-yield tree species and maintain high health to optimize O2 output.
3. **Virtual Euro Economy:** Monetize O2 production, fruit harvests, and visitor commercial services.
4. **Regional Progression:** Unlock up to 10 international regional biomes based on farm milestones.
5. **Eco-Settlement Construction:** Progress from a single plot to an independent green city.
6. **Environmental Education:** Real-world biological facts, CO2 sequestration data, and sustainability quizzes.
7. **Global Leaderboards:** Competitive player rankings across O2, wealth, eco score, and regional performance.

### 1.2 Mathematical Foundations & Time Compression
- **Time Ratio:** Fixed 1:4 compression ratio:
  $$\text{GameHours} = \text{RealHours} \times 4$$
  $$24\text{ Real Hours} = 96\text{ Game Hours} \quad (1\text{ Real Hour} = 4\text{ Game Hours}, \; 15\text{ Real Minutes} = 1\text{ Game Hour})$$
- **Base Oxygen Revenue Formula:**
  $$\text{DailyIncome} = \text{OxygenProducedPerDay} \times \text{O2Rate} \times (1 + \sum \text{Bonuses})$$
- **System Bonuses:**
  - **Forest Bonus:** $+10\%$ when all starting plots are actively cultivated.
  - **Diverse Species Bonus:** $+15\%$ when 2 or more distinct tree species are present.
  - **Soil Health Bonus:** Up to $+20\%$ based on plot fertilization and condition.
  - **Worker/Engineering Efficiency:** $+10\%$ passive income when an Engineer is hired.

### 1.3 Tree Species Taxonomy (18 Species across 5 Categories)
1. **Oxygen Trees (High O2 output):** Oak, Pine, Maple, Poplar.
2. **Fruit Trees (O2 + Periodic Edible Harvest):** Apple, Orange, Mango, Lemon.
3. **Vegetables (Fast Growth & Rapid Cash Turnaround):** Tomato, Potato, Carrot, Onion.
4. **Timber Trees (Slow Growth & High Capital Payoff):** Teak, Cedar, Eucalyptus.
5. **Biodiversity Trees (Eco Score Boosters & Pollinator Support):** Cherry Blossom, Acacia, Birch.

### 1.4 Human Resource Management (Worker System)
- **Laborer (€20–€30/day):** Accelerates soil excavation and overgrowth clearing ($+50\%$ task speed).
- **Farmer (€50–€70/day):** Accelerates tree/crop vegetative growth ($+40\%$ growth speed) and manages harvesting.
- **Specialist Botanist (€100–€130/day):** Enhances biological vigor ($+60\%$ growth speed) and files diagnostic health logs.
- **Engineer (€150–€180/day):** Deploys automated irrigation and grants a $+10\%$ global revenue multiplier.

### 1.5 Addendum (v2): Production & Security Hardening
- **§A1 Server-Authoritative State:** Clients emit player intentions/actions (`plantTree`, `claimTask`, `harvest`), never raw resource values. The server independently verifies elapsed game time and computes rewards.
- **§A2 Authentication & Session Security:** Short-lived in-memory JWTs (15 min) paired with `httpOnly`, `Secure`, `SameSite=Strict` refresh cookies. Bcrypt password hashing (cost factor $\ge 12$). Signed anonymous guest tokens for frictionless classroom adoption.
- **§A3 Input Validation:** Parameterized queries and strict schema validation (Zod/Joi) across all API endpoints with rate limiting on economy mutations.
- **§A4 Scalable Data Model:** Append-only `EconomyTransactions` ledger; Redis strictly as an accelerator in front of PostgreSQL.
- **§A5 Child-Directed Product Safeguards:** Minimal personal data collection (COPPA/GDPR-K compliance), no open player-to-player text chat surfaces, and strictly cosmetic monetization.

### 1.6 Phased Delivery Strategy
- **Phase 1 (This Branch):** Playable core-loop prototype (frontend-only SPA, local state persistence, game feel validation).
- **Phase 2:** Node.js + Express + TypeScript backend scaffold, PostgreSQL migrations, Redis cache, JWT auth.
- **Phase 3:** Full integration of Phase 1 frontend with Phase 2 API; WebSocket countdown sync.
- **Phase 4+:** Advanced regions, quiz engine, analytics, and Azure multi-service deployment.

---

## 2. Step-by-Step Prototype Analysis & Modification Evolution (v1 to v4)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Prototype Architectural Evolution                   │
├───────────────────┬───────────────────┬───────────────────┬─────────────┤
│   Prototype v1    │   Prototype v2    │   Prototype v3    │Prototype v4 │
│  Core Loop MVP    │  SVG Field Farm   │ Immersive Care UI │ Eco-Village │
│                   │                   │                   │             │
│ • 6 CSS Grid Plots│ • SVG Farm Scene  │ • Fixed Viewport  │ • Village   │
│ • 3 Tree Types    │ • 18 Tree Species │ • Icon Dock & Strip│ • Storage  │
│ • €0.05 O2 Rate   │ • 4 Worker Classes│ • Plot Health Bar │ • 4 Bldgs   │
│ • LocalStorage    │ • Plot Accessories│ • Water & Prune   │ • 3 Loans   │
│ • Offline Modal   │ • Relocated UI    │ • Wildlife Visits │ • Rebalance │
│ • 5 Achievements  │ • 7 Achievements  │ • 9 Achievements  │ • 12 Achs   │
└─────────┬─────────┴─────────┬─────────┴─────────┬─────────┴──────┬──────┘
          │                   │                   │                │
          ▼                   ▼                   ▼                ▼
     Commit 9204e5f     Commits c74319a     Commit 5c3bb95   Commit 7fc4ae8
                        through 2da5f51
```

---

### Step 1: Prototype v1 — Playable Core Loop Foundation (`searchO2-prototype.html`)

**Implemented in Commit:** `9204e5f` (`feat: prototype persistence adapter + include blueprint`)  
**File Size:** 27.2 KB | 710 lines  
**Blueprint Traceability:** Milestones 1–3, Time Compression, Starting Economy, Basic Task Queue, Offline Engine.

#### Architectural Design & UI Paradigm
- **Layout:** Standard document flow with a responsive 3×2 CSS grid (`.field-grid`) of square card elements representing the 6 barren plots.
- **Side Panels:** Stacked card panels underneath the field for Task management, Achievements, and Tree facts.
- **Tree Selector:** Simple overlay (`.picker`) directly rendered on top of the clicked plot card.

#### Implemented Game Mechanics
- **Soil Excavation:** Barren plots require an initial "Dig Land" action (€15 cost, 3 game-hours) to transition from `barren` to `preparing` to `ready`.
- **Tree Catalog:** Implemented 3 initial benchmark species:
  - `oak` (Oxygen Tree): Cost €120, produces up to 6 O2/h at mature stage.
  - `apple` (Fruit Tree): Cost €90, produces up to 3.5 O2/h + €0.90/h fruiting bonus.
  - `tomato` (Vegetable): Cost €35, produces up to 1 O2/h + €0.60/h quick cash bonus.
- **Time Engine:** Clock speed dropdown supporting 1x (spec accurate), 60x, 180x, and 600x multipliers. Seasons cycle every 96 game-hours.
- **Offline Catch-Up Engine:** On game boot, detects real-time delta between `Date.now()` and stored `lastSaveReal`. If $\Delta t > 5\text{s}$, fast-forwards game state (capped at 30 game days) and renders a summary modal.
- **Persistence Adapter:** Window-level Promise adapter (`window.storage`) saving to `localStorage` under `searchO2:searchO2-save`.

---

### Step 2: Prototype v2 — SVG Field Scene & Worker System (`searchO2-prototype-v2.html`)

**Implemented in Commits:** `c74319a`, `f4f2bbc`, `ec7e2bc`, `9d0dd2b`, `2da5f51`  
**File Size:** 80.5 KB | 1,263 lines  
**Blueprint Traceability:** Worker System (§Workers), Full Tree Categories (§Tree Categories), Visual Design Requirements (SVG landscape).

#### Key Modifications from v1
1. **SVG Landscape Scene:** Replaced the grid-based card layout with a cohesive 16:10 aspect ratio SVG illustration featuring textured terrain, animated swaying tree canopies, particle bubbles, drifting clouds, and digging dust.
2. **Complete 18-Tree Catalog:** Implemented all 18 species from the blueprint across Oxygen, Fruit, Vegetable, Timber, and Biodiversity categories.
3. **Worker Management:**
   - Introduced hiring, firing, and per-plot assignment for 4 worker types (Laborer €20, Farmer €50, Botanist €100, Engineer €150).
   - Automated daily payroll deduction every 24 game-hours.
   - Engineer provides a passive $+10\%$ global revenue multiplier.
4. **Plot Accessories:** Added Irrigation (€80, $+15\%$ growth speed) and Fertilizer (€60, $+20\%$ O2 output) slots per plot.
5. **Interactive Floating Popovers:** Replaced in-plot button overlays with dynamic floating popovers that auto-flip when colliding with viewport boundaries (`9d0dd2b`).
6. **Side-by-Side Layout Refactor:** Positioned field scene on the left (1fr) with a dedicated control and stats sidebar on the right (`ec7e2bc`).
7. **Offline Modal Hardening:** Implemented multi-layer event delegation for the welcome-back modal overlay (`2da5f51`).

---

### Step 3: Prototype v3 — Immersive Full-Screen UI & Plot Care System (`searchO2-prototype-v3.html`)

**Implemented in Commit:** `5c3bb95` (`feat(prototype-v3): immersive full-screen farm UI with plot health and care system`)  
**File Size:** 67.7 KB | 1,017 lines  
**Blueprint Traceability:** Visual Design (Full-screen SPA), Educational Components, Tree Lifecycle Care, Wildlife Encounters.

#### Key Modifications from v2
1. **Fixed Full-Viewport Layout:** Replaced document-level scrolling with a fixed full-screen layout (`.game-root`) that scales fluidly across desktop and mobile screens.
2. **Navigation Dock & Tool Strip:**
   - **Left Icon Dock:** Quick modal toggles for Tasks (📋), Workers (👷), Achievements (🏆), and Botanist Reports (📰).
   - **Bottom Tool Strip:** Category-grouped planting tray with real-time costs and stat previews.
3. **Centralized Modal Architecture:** Unified all interactions (planting, care, workers, wildlife) into a structured `activeModal` overlay system.
4. **Dynamic Plot Health & Care Engine:**
   - Plots track a living health score ($0\% - 100\%$) that decays every game-hour:
     - Oxygen Trees: $-0.5\%/\text{h}$
     - Fruit Trees: $-0.8\%/\text{h}$
     - Vegetables: $-1.2\%/\text{h}$
     - Timber Trees: $-0.4\%/\text{h}$
     - Biodiversity Trees: $-0.6\%/\text{h}$
   - Low health diminishes growth and O2 output: $\text{mult} = 0.5 + 0.5 \times (\text{health}/100)$. At $0\%$, tree enters downtime and halts production.
   - **Active Care:** Players can water (💧) or prune (✂️) trees with category-scaled costs.
5. **Overgrowth & Weeding:** Neglected barren or ready plots accumulate weed hours. Exceeding 144 game-hours triggers an `overgrown` state requiring a €25 clearing action (2 game-hours).
6. **Wildlife Encounters:** Spawns random animals (🐇 Rabbit, 🦔 Hedgehog, 🐦 Bird) on uncultivated plots. Players must scare them away (€10) within 2 game-hours to avoid progress penalties.
7. **Botanist Diagnostic Reports:** Logs periodic automated health evaluations into the Reports panel.

---

### Step 4: Prototype v4 — Eco-Village Expansion, Storage Pipeline & Banking (`searchO2-prototype-v4.html`)

**Implemented in Commit:** `7fc4ae8` (`feat(prototype-v4): economy rebalance, storage, buildings, loans, and harvest pipeline`)  
**File Size:** 108.5 KB | 1,621 lines  
**Blueprint Traceability:** Buildings (§Buildings), Farm Development Stages, Banking & Loans, Storage Pipeline, Macro-Economy Balancing.

#### Key Modifications from v3
1. **Macro-Economic Rebalancing:**
   - Tightened baseline O2 conversion rate from €0.05 to **€0.03/unit** to prevent early-game hyperinflation.
   - Tree purchase prices increased by $+20\% - 40\%$ across all categories.
   - Rebalanced worker wages: Laborer €30, Farmer €70, Botanist €130, Engineer €180.
   - Land preparation costs increased: Dig Land €25, Weeding/Clearing €35.
2. **Storage Room & Active Harvest Pipeline:**
   - Construct a dedicated Storage Room (€550, 10 game-hours) at the top of the farm (`STORAGE_SPOT`).
   - Mature crops accumulate `pendingHarvest`. Players perform an active harvest action to transfer goods into storage.
   - Harvesting without a Storage Room incurs a **$50\%$ spoilage penalty**.
   - Storage capacity starts at €200 and expands in $+€150$ increments for €500 base cost.
3. **Village Strip & Commercial Buildings:**
   - Added a 4-spot village zone along the bottom boundary (`VILLAGE_LAYOUT`):
     - **Garden** (€300, 4h, decorative): $+8$ Farm Reputation.
     - **Pond** (€400, 5h, decorative): $+10$ Farm Reputation.
     - **Coffee Shop** (€800, 8h, revenue): €15/day upkeep; processes stored crops at $1.8\times$ retail markup.
     - **Juice Bar** (€700, 7h, revenue): €12/day upkeep; processes stored fruit at $1.6\times$ retail markup.
4. **Farm Reputation & Visitor Magnet Synergy:**
   - Reputation calculated from buildings, crop health, biodiversity, and demerits.
   - **Visitor Magnet Combo:** Owning Garden + Pond + (Coffee Shop or Juice Bar) activates an extra $+20\%$ commercial revenue boost.
5. **Banking, Loans & Bankruptcy Recovery:**
   - 3 loan packages: Small (€2,000 / $5\%$, 10 days), Medium (€5,000 / $8\%$, 20 days), Farm Mortgage (€12,000 / $12\%$, 40 days).
   - Daily amortized installments deducted automatically. Missed installments incur a $5\%$ penalty.
   - **Bankruptcy Protocol:** Dropping below $-€50$ triggers an emergency Bank dialog offering loan refinancing or farm restructuring.
6. **Atmospheric Sky Layer:** Animated SVG birds flying across the sky with synchronized wing flaps.
7. **Performance & Persistence Hardening:**
   - Replaced unthrottled writes with a 3-second debounced mutex save engine (`doSave`, `requestSave`) with retry on failure, preventing browser storage rate-limiting errors.
8. **Tree Death & Salvage Removal Pipeline:**
   - Neglecting plot health at 0% for `TREE_DRY_THRESHOLD_HOURS` (20 game-hours) kills the tree (`status: 'dead'`).
   - Dead trees produce zero O2/harvest and must be felled (`status: 'removing'`).
   - Category-specific removal profiles (`REMOVE_CONFIG`) require dedicated tools (`chainsaw`, `saw`, `hand`), labor hours (1–7h), vehicle hauling (`truck` animation), and grant wood salvage refunds (up to 50%). Laborer speeds up removal.
9. **Garden Flower Variety & Freshness Decay:**
   - Completed Gardens allow planting Tulips, Roses, Sunflowers, or Daisies.
   - Freshness decays at 0.8%/h; tending (€20) restores freshness to maintain full farm reputation bonus.
10. **Pond Specialization & Physical Product Storage:**
    - Built Ponds can be specialized into a Fish Farm or Duck Farm.
    - Freshness decays at 0.7%/h; feeding (€8–€10) restores vitality.
    - Operating ponds continuously stream physical goods directly into the Storage Room.
11. **Actionable Notification Toasts & Task Counter Badges:**
    - Toasts alert players to dead trees, overgrowth, hungry ponds, wilting gardens, and storage overflow with direct action shortcuts.
    - Dynamic badge counter on the Tasks dock icon displays pending actionable tasks.

---

## 3. Comparative State Schema Matrix (v1 through v4)

| State Property | Type | v1 | v2 | v3 | v4 | Functional Role |
|---|---|:---:|:---:|:---:|:---:|---|
| `money` | Number | €10,000 | €10,000 | €10,000 | €10,000 | Liquid virtual currency balance |
| `totalO2` | Number | 0 | 0 | 0 | 0 | Current oxygen balance |
| `totalO2AllTime` | Number | 0 | 0 | 0 | 0 | Cumulative lifetime oxygen (achievements) |
| `treesRemoved` | Number | ❌ | ❌ | ❌ | ✅ | Lifetime counter for felled/cleared dead trees |
| `gameHour` | Number | 0 | 0 | 0 | 0 | Total compressed game time |
| `plots[i].status` | String | 4 states | 4 states | 6 states | 8 states | `barren`, `preparing`, `ready`, `growing`, `overgrown`, `clearing`, `dead`, `removing` |
| `plots[i].treeId` | String/Number | ❌ | `treeUid` | `treeId` | `treeId` | Unique ID for individual tree tracking |
| `plots[i].health` | Number (0–100) | ❌ | ❌ | ✅ | ✅ | Biological vigor; modulates growth and O2 output |
| `plots[i].zeroHealthStreakHours` | Number | ❌ | ❌ | ❌ | ✅ | Consecutive hours at 0% health triggering tree death |
| `plots[i].weedHours` | Number | ❌ | ❌ | ✅ | ✅ | Neglect timer tracking overgrowth threshold |
| `plots[i].pendingHarvest` | Number | ❌ | ❌ | ❌ | ✅ | Accumulated crop yield awaiting harvest |
| `plots[i].accessories` | Object | ❌ | Irrigation, Fert | Irrigation, Fert | Irrigation, Fert | Per-plot hardware upgrades |
| `plots[i].assignedWorker` | Number | ❌ | ❌ | Worker ID | Worker ID | Assigned dedicated labor ID |
| `plots[i].animal` | Object | ❌ | ❌ | Encounter object | Extended encounter | Active wildlife visitor |
| `workers` | Array<Worker> | ❌ | ✅ | ✅ | ✅ | Hired labor roster and wages |
| `storage` | Object | ❌ | ❌ | ❌ | ✅ | Storage Room capacity, level, and stored value |
| `buildings.garden` | Object | ❌ | ❌ | ❌ | Built, flowers, freshness | Garden state, active flower type, and freshness score |
| `buildings.pond` | Object | ❌ | ❌ | ❌ | Built, spec, freshness | Pond state, fish/duck specialization, and feeding status |
| `buildings.commercial`| Object | ❌ | ❌ | ❌ | Built, building | Coffee Shop and Juice Bar processing states |
| `loan` | Object | ❌ | ❌ | ❌ | ✅ | Active loan balance, terms, installments |
| `reports` | Array<Report> | ❌ | ❌ | ✅ | ✅ | Historical diagnostic logs from Botanist |
| `achUnlocked` | Object | 5 flags | 7 flags | 9 flags | 13 flags | Unlocked achievement milestones |

---

## 4. Concrete Git Commit History on Branch `mvp-v1`

The complete chronological commit tree on `mvp-v1` starting from repository initialization through Phase 1 completion:

| # | Commit Hash | Author | Timestamp | Commit Message & Description | Files Modified |
|---|---|---|---|---|---|
| **1** | `112e7f5` | mishu-anik23 | 2026-09-03 | `Initial commit`<br>Adds initial MIT license. | `LICENSE` |
| **2** | `9204e5f` | mishu-anik3 | 2026-09-03 | `feat: prototype persistence adapter + include blueprint`<br>Introduces `searchO2_Game_Design_Blueprint_v2.md` and `searchO2-prototype.html` (v1 core loop). | `searchO2_Game_Design_Blueprint_v2.md`<br>`searchO2-prototype.html` |
| **3** | `c74319a` | mishu-anik3 | 2026-09-03 | `feat: add prototype v2 with server-sim, guest auth, leaderboard, export/import`<br>Adds base prototype v2 with client-side server simulation and export/import. | `searchO2-prototype-v2.html` |
| **4** | `f4f2bbc` | mishu-anik3 | 2026-09-03 | `fix: UI popovers, per-tree IDs/O2, top-left widgets, hints, cleanup tasks`<br>Implements SVG field scene, full 18-tree catalog, and worker hire roster. | `searchO2-prototype-v2.html` |
| **5** | `ec7e2bc` | mishu-anik3 | 2026-09-03 | `fix(layout): side-by-side field + panels; show per-plot UID/type; add accessories panel`<br>Refactors layout to side-by-side field and stacked panels. | `searchO2-prototype-v2.html` |
| **6** | `9d0dd2b` | mishu-anik3 | 2026-09-03 | `fix(ui): dock widgets right; relocate plot popovers into viewport on resize/scroll`<br>Docks widgets right and adds collision-safe popover positioning. | `searchO2-prototype-v2.html` |
| **7** | `2da5f51` | mishu-anik3 | 2026-09-03 | `fix(ui): robust offline modal close (button, overlay, delegated fallback)`<br>Hardens offline modal close handlers with delegated fallback listeners. | `searchO2-prototype-v2.html` |
| **8** | `5c3bb95` | mishu-anik3 | 2026-09-06 | `feat(prototype-v3): immersive full-screen farm UI with plot health and care system`<br>Introduces fixed full-screen viewport, icon dock, tool strip, plot health decay, water/prune care, overgrowth clearing, and wildlife alerts. | `searchO2-prototype-v3.html` |
| **9** | `7fc4ae8` | mishu-anik3 | 2026-09-06 | `feat(prototype-v4): economy rebalance, storage, buildings, loans, and harvest pipeline`<br>Tightens economy (O2 rate €0.03), adds Storage Room, active harvesting, village commercial buildings, banking/loans, flying birds, and debounced save engine. | `searchO2-prototype-v4.html` |
| **10** | `6b59f84` | mishu-anik3 | 2026-09-06 | `docs(mvp-v1): add branch history, blueprint traceability, and v1-v4 evolution guide`<br>Initial documentation of MVP v1 branch history and blueprint alignment. | `searchO2-MVP-v1-Branch-History.md` |
| **11** | `4d3e7cf` | mishu-anik23 | 2026-09-07 | `docs: analyze and document prototype v4 modifications (tree lifecycle, garden/pond decay, notification system)`<br>Updates branch history with v4 modifications and expanded 8-plot comparative schema matrix. | `searchO2-MVP-v1-Branch-History.md`<br>`searchO2-prototype-v4.html` |
| **12** | `bb4d814` | mishu-anik23 | 2026-09-07 | `feat(backend): implement production-grade Node.js/TypeScript backend, PostgreSQL 18 DB, auth, anti-cheat engine, and frontend bridge`<br>Delivers complete Express.js backend with PostgreSQL migrations, Bcrypt/JWT/cookie auth, Google OAuth2, authoritative game engine, ledger audit, WebSockets, 14/14 Jest tests, and v4 ApiClient bridge. | `backend/*`<br>`searchO2-prototype-v4.html`<br>`searchO2-MVP-v1-Branch-History.md` |
| **13** | `24a4411` | mishu-anik23 | 2026-09-07 | `feat(ui): implement Regional Biome Selection screen, blurred initial auth flow, and German farm navigation`<br>Adds 8 global biomes with country flags, initial blurred background preview, 1-click guest start, and dual world map navigation. | `searchO2-prototype-v4.html`<br>`searchO2-MVP-v1-Branch-History.md` |
| **14** | `9852cb7` | mishu-anik23 | 2026-09-07 | `feat(ui): add interactive 3D World Globe with draggable rotation, regional beacons, and flora tooltips`<br>Adds zero-dependency HTML5 2D Canvas 3D spherical projection engine, interactive rotation drag with momentum physics and idle auto-spin, regional beacons with pulsing concentric rings for Germany, dynamic hover billboards with native flora and tree emoji icons, 3 view modes (3D Globe, Split View, Biome Cards), and quick-center region chips. | `searchO2-prototype-v4.html` |
| **15** | `03a9851` | mishu-anik3 | 2026-09-07 | `feat(audio): add procedural regional soundtrack engine, activity SFX, and music player dock`<br>Synthesizes zero-dependency Web Audio API regional soundtracks for Germany, Kenya, Brazil, Japan, and Arctic biomes, along with activity SFX for planting, harvesting, watering, pruning, achievements, and seasons, backed by a collapsible floating music player dock. | `searchO2-prototype-v4.html` |
| **16** | `8885476` | mishu-anik3 | 2026-09-07 | `fix(tasks): fix ReferenceError in advanceGame, restore multi-plot digging progression, and enhance seeding/task completion feedback`<br>Fixes unhandled season reference error, restores percentage progress and laborer assignment in plot digging modal, adds distinct tilled seedling mound visuals, and enhances task panel rows. | `searchO2-prototype-v4.html` |
| **17** | `41bbb81` | mishu-anik3 | 2026-09-08 | `feat(prototype-v5): realistic village architecture, non-overlapping promenade, and full v4 audio/task integration`<br>Eliminates stretched cards and overlapping road line with an elegant pedestrian promenade; delivers detailed architectural SVG illustrations for the Coffee House, Juice Bar, Road Gateway, and Storage Barn; integrates procedural audio engine with dedicated village SFX; and achieves full v4 feature parity. | `searchO2-prototype-v5.html`<br>`searchO2-MVP-v1-Branch-History.md` |

---

## 5. Verification & Testing Guide

All four prototype applications can be executed directly in any modern web browser without build steps or web servers:

```bash
# Direct local execution paths:
searchO2-prototype.html       # v1: Minimal 3-tree core loop & time compression
searchO2-prototype-v2.html    # v2: SVG landscape field, 18 tree types, workers
searchO2-prototype-v3.html    # v3: Full-screen UI, plot health decay, watering/pruning
searchO2-prototype-v4.html    # v4: Complete eco-village, storage pipeline, buildings, loans, and backend auth integration
```

### Backend Execution & Automated Tests
```bash
# Start backend in development mode (port 5000):
cd backend
npm run dev

# Run automated test suite (14/14 Jest test specs):
npm test

# Build production bundle:
npm run build
```

### Recommended Gameplay Test Flows
1. **Clock Acceleration:** In any version, select **180x** or **600x** in the season dropdown to observe tree growth stages, season transitions, and payroll cycles within seconds.
2. **Storage Pipeline Test (v4):** Plant fruit trees or vegetables. Build the Storage Room (€550). When trees reach maturity, click them to harvest. Verify stored goods appear in storage rather than suffering the $50\%$ spoilage penalty.
3. **Village Revenue Loop (v4):** Build a Coffee Shop or Juice Bar. Observe stored harvest being automatically converted into visitor Euro revenue at a premium markup ($1.6\times - 1.8\times$).
4. **Credit & Bankruptcy Test (v4):** Hire all workers or spend cash until balance reaches $-€50$. Verify the emergency Bank modal triggers automatically with restructuring options.
5. **Backend Authentication & Server Synchronization (v4):** Click `👤 Sign In` on the topbar dock. Play as Guest, register an account, or log in with Google OAuth. Your farm state automatically syncs to PostgreSQL 18 with authoritative server validation.

---

## 6. Blueprint Gap Analysis & Phase 2 Delivery Status

| Blueprint Section | Phase 1 Status (Prototypes v1–v4) | Phase 2 Implementation Status | Delivery Details |
|---|---|---|---|
| **API Architecture** | Browser-only client logic | ✅ **Delivered** | Node.js (v24) + Express.js + TypeScript REST API with modular controllers, services, and Zod validation |
| **Database Model** | LocalStorage JSON blobs | ✅ **Delivered** | PostgreSQL 18 with 8 normalized tables (`users`, `farms`, `plots`, `workers`, `economy_transactions`, `achievements`, `reports`, `refresh_tokens`) and automatic migration runner |
| **Server-Authoritative Anti-Cheat (§A1)** | Client calculates elapsed time & income | ✅ **Delivered** | Authoritative game engine: validates timestamps, enforces 1:4 time ratio, calculates biological health decay, tree death trigger at 20h streak, wood salvage, and rejects client time warp attempts |
| **Authentication (§A2)** | Anonymous local guest profile | ✅ **Delivered** | Bcrypt (cost 12), short-lived JWTs (15m), secure HTTP-only SameSite=Strict refresh cookies, Google OAuth2 token verification with dev/test sandbox, and seamless guest $\to$ registered account upgrade |
| **Countdown Sync** | Client-side `setInterval` | ✅ **Delivered** | WebSocket server (`ws`) mounted on `/ws` with token authentication, heartbeat keep-alive, and broadcast notifications |
| **Global Leaderboards** | Local simulation stub | ✅ **Delivered** | Ranked leaderboard endpoints (Oxygen, Net Worth, Eco Score) backed by Redis caching with transparent in-memory fallback |
| **Audit Ledger** | None | ✅ **Delivered** | Append-only `economy_transactions` double-entry ledger tracking all currency and O2 movements with running balances |
| **Regional Biomes** | Germany Grassland (6 plots) | ✅ **Delivered** | Interactive 3D World Globe + 8 regional biomes with country flags, lock/unlock mechanics, native flora tooltips, and 3 view modes (`searchO2-prototype-v4.html`) |
| **Regional Soundscapes & Music** | None (Silent prototype) | ✅ **Delivered** | Zero-dependency procedural Web Audio API engine (`SoundTrackEngine`): 9 regional instrumental compositions (60s/70s/80s folk, bossa nova, pastoral lullabies) + activity SFX & collapsible music player dock |
| **Educational Quiz Engine** | Static hint toasts & facts | ⏳ *Phase 3 Backlog* | Interactive sustainability quizzes with coin/seed rewards |

---

## 7. Procedural Regional Soundtrack & SFX Engine (searchO2 v4 Addendum)

To fulfill the vision of an emotionally immersive, peaceful eco-simulation, a zero-dependency, procedural Web Audio API audio subsystem (`SoundTrackEngine`) was designed and integrated directly into `searchO2-prototype-v4.html`.

### 7.1 Musical Design & Zero-Dependency Architecture
- **100% Procedural Synthesis:** No external `.mp3` or `.wav` assets, streaming audio files, or third-party audio frameworks. Everything is synthesized in real time from mathematical waveforms using `AudioContext`, custom Biquad filters, and multi-node envelopes.
- **Tonal Flavors:** Classic 60s, 70s, and 80s love songs and children's song structures ($I - vi - IV - V$ doo-wop/ballad warmth, $I - V - vi - IV$ 70s acoustic folk-pop, 60s Bossa Nova, Andalusian romance, and pentatonic children's folk songs).
- **Procedural Physical Instruments:**
  1. **Acoustic Pluck (Folk Guitar / Balafon):** Triangle oscillator fed into a dynamically sweeping low-pass filter with exponential decay envelope.
  2. **Rhodes Electric Piano:** Dual-sine oscillators with slight detune and harmonic second-order ring, creating vintage warm 70s bell-like keys.
  3. **Wooden Marimba:** Frequency-tuned sine/triangle strike with high initial transient punch and rapid wooden body dampening.
  4. **Pastoral Flute:** Gentle sine wave with subtle vibrato LFO and soft attack envelope.
  5. **Acoustic Bass:** Warm fundamental sine/triangle with tight low-pass filtering.
  6. **Music Box / Celestial Chimes:** High-register harmonic sine pairs with long metallic reverb resonance.

### 7.2 The 9 Regional Instrumental Compositions
1. 🇩🇪 **Germany — "Schwarzwald Lullaby" (Pastoral Folk Waltz):**
   - *Key:* C Major, $3/4$ waltz meter, 92 BPM.
   - *Progression:* $I - vi - IV - V$ ($C - Am - F - G$).
   - *Instrumentation:* Warm fingerpicked acoustic guitar, Rhodes piano, flute, and woody bass.
2. 🌍 **Global Earth — "Blue Marble Serenade" (70s Acoustic Earth Ballad):**
   - *Key:* C Major, $4/4$ ballad meter, 80 BPM.
   - *Progression:* $I - V - vi - IV$ ($C - G - Am - F$).
   - *Instrumentation:* Nostalgic acoustic plucks, Rhodes accompaniment, and soothing flutes.
3. 🇧🇷 **Brazil — "Bossa das Árvores" (60s Tropical Bossa Nova):**
   - *Key:* C Major / D Dorian, $4/4$ syncopated bossa, 115 BPM.
   - *Progression:* $Cmaj7 - A7 - Dm7 - G7$.
   - *Instrumentation:* Syncopated nylon guitar, warm acoustic bass, and wooden marimba.
4. 🇪🇸 **Spain — "Brisa del Sol" (70s Spanish Romance Ballad):**
   - *Key:* A Minor, $3/4$ romance meter, 88 BPM.
   - *Progression:* $Am - G - F - E7$ (Andalusian Cadence).
   - *Instrumentation:* Spanish acoustic guitar arpeggios, expressive pastoral flute, and deep bass.
5. 🇯🇵 **Japan — "Sakura Nostalgia" (70s Showa Folk Lullaby):**
   - *Key:* C Major Yo-Pentatonic ($C, D, F, G, A$), 72 BPM.
   - *Instrumentation:* Music box bells, wooden koto/marimba, and warm pastoral flute.
6. 🇺🇸 **USA — "Redwood Sunrise" (70s Americana Folk Fingerpicking):**
   - *Key:* G Major, $4/4$ country-folk meter, 96 BPM.
   - *Progression:* $G - D - Em - C$.
   - *Instrumentation:* Travis-style fingerpicking guitar, walking acoustic bass, and Rhodes counterpoint.
7. 🇸🇳 **Senegal — "Kora Dawn" (West African Pastoral Lullaby):**
   - *Key:* F Major pentatonic, 100 BPM.
   - *Instrumentation:* Fast cascading Kora-style plucks, rhythmic wooden balafon, and marimba.
8. 🇸🇪 **Sweden — "Nordic Solstice" (Scandinavian Folk Song):**
   - *Key:* D Minor / F Major, $3/4$ folk meter, 78 BPM.
   - *Progression:* $Dm - Bb - C - F$.
   - *Instrumentation:* Clear pastoral flute melody, wooden marimba, and celestial chimes.
9. 🇲🇬 **Madagascar — "Baobab Joy" (Island Children's Melody):**
   - *Key:* G Major, $4/4$ upbeat rhythm, 108 BPM.
   - *Progression:* $G - C - D - G$.
   - *Instrumentation:* Valiha-inspired zither plucks, wooden marimba, and bouncy bass.

### 7.3 Synthesized Activity SFX & Event Jingles
- 🌱 **Tree Planting (`plant`):** 3-note rising acoustic arpeggio ($C4 \to E4 \to G4$).
- 📋 **Task / Dig / Clear (`task`):** Crisp marimba confirmation chime ($G4 \to C5$).
- 🧺 **Harvest & Sales (`harvest`):** Bright Rhodes & metallic coin chimes ($E5 \to G5 \to C6$).
- 💧 **Plot Watering (`water`):** Ascending gentle liquid water drops.
- ✂️ **Plot Pruning (`prune`):** Double wooden click with crisp resonance.
- 🍂 **Season Change (`season`):** Slow 4-note pastoral transition chord.
- 🏆 **Achievement Unlocked (`achieve`):** Victorious 4-note brassy Rhodes & bell jingle ($C5 \to E5 \to G5 \to C6$).

### 7.4 Floating Music Player Dock
- Rendered in bottom-left corner with glassmorphic styling, collapsed/expanded mode toggle.
- Track information display with country flag, title, and musical genre.
- Standard media controls: Play / Pause, Previous Track, Next Track, Track Select dropdown.
- Volume slider with mute toggle icon, and dedicated Sound Effects (SFX) toggle button.
- Autonomous reactive switching: Automatically syncs to Germany theme on farm screen, Earth theme on 3D globe view, and previews regional tracks on country beacon or chip selection.

---

## 8. Prototype v5 — Village Commons, Realistic Architectural SVGs & Audio Integration (`searchO2-prototype-v5.html`)

**Implemented in Commit:** `41bbb81` (`feat(prototype-v5): realistic village architecture, non-overlapping promenade, and full v4 audio/task integration`)  
**File Size:** ~294 KB | ~5,300 lines  
**Blueprint Traceability:** Village Expansion (§Delivery Phasing §1), Commercial Revenue Loop, Infrastructure Prerequisites, Audio-Visual Polish.

### 8.1 Village Layout & Promenade Architecture
- **Elimination of Card Stretching:** Replaced raw percentage translucent rectangles with cohesive `.village-building-card` styling featuring subtle timber/flagstone borders, soft depth elevation shadows, hover micro-interactions, and standardized `viewBox="0 0 160 120"` SVG aspect ratios with `preserveAspectRatio="xMidYMid meet"`.
- **Pedestrian Flagstone Promenade (`roadPromenadeHtml`):** Removed the conflicting straight line at `top: 48%` that previously overlapped the flower garden and duck pond. Introduced a continuous cobblestone promenade running along the base of the village structures (`top: 56.6%`, `height: 3.8%`, `left: 17%` to `98%`), connecting the Road Gateway past the flower beds and duck pond to the storefronts with glowing bollard lanterns and zero visual clipping.

### 8.2 Architectural SVG Illustrations
- **Coffee House (`drawCoffeeShopScene`):** European timber-framed café with terracotta tiled roof, brick chimney, animated drifting steam curls, burgundy-and-cream scalloped awning, warm glowing bay window with flower planters, espresso barista bar, outdoor patio with bistro table, checkered tablecloth, and café parasol.
- **Juice & Ice Bar (`drawJuiceBarScene`):** Tropical eco-timber pavilion with bamboo posts, citrus lemon/lime canopy, hanging colorful bunting flags, refrigerated counter with stacked fresh fruits (apples, oranges, lemons, berries), twin transparent smoothie dispensers with rising bubbles, iced tumbler with straw and citrus garnish, and wooden bar stools.
- **Village Road Gateway (`drawRoadScene`):** Paved entrance avenue with interlocking cobblestones, dual Victorian cast-iron streetlamps with amber lanterns, wooden fingerpost pointing to Farm and Shops, and stone milestone (`KM 0 · VILLAGE`).
- **Storage Barn Depot (`drawStorageScene`):** Red timber barn with gambrel roof, hayloft pulley, white trim, sliding doors with "X" braces, and stacked harvest crates and barrels.

### 8.3 Infrastructure Prerequisite & Audio-Visual Stitching
- **Road Construction Prerequisite UX:** If the player inspects the Coffee House or Juice Bar before the Road is paved, a clear guidance card explains the requirement and provides a 1-click **"Pave Road Now (€250 · 4h)"** action.
- **Dedicated Village SFX:**
  - `pave`: Crisp stone mallet taps and stone block seating.
  - `brew`: Warm espresso extraction and frothy steam hiss.
  - `pour`: High-speed blender whirl and refreshing juice splash.
  - `tend`: Light botanical chime.
  - `feed`: Water droplet splash.
- **Complete v4 Feature Parity:** Merged the full procedural Web Audio soundtrack engine (`SoundTrackEngine`), floating music dock (`#musicPlayerDock`), interactive 3D globe with rotation physics, and task/digging progression bugfixes from commit `8885476`.

---

## 9. Prototype v5 Modernization — Main Gate, Block-Wise Roads, Itemized Storage & Truck Logistics

**Implemented in Commit:** (Current)  
**File Modified:** `searchO2-prototype-v5.html`  
**File Size:** ~337 KB | ~6,150 lines  
**Focus Areas:** Organic Terraced Layout, Grand Farm Main Entry Gate, Multi-Segment Block Roads, Cold Cellar Climate & Itemized Storage, Animated Freight Logistics (Food Container Van & Timber Truck), Laborer Operations.

### 9.1 Organic Terraced Village Layout & Grand Farm Main Entry Gate
- **Break the Flat Line:** Re-aligned all village structures from a flat horizontal row (`top: 36.5%`) into an organic terraced landscape with natural elevation and depth:
  - **Farm Main Entry Gate (`GATE_SPOT`):** `{top:32, left:1, w:11.5, h:24}`
  - **Storage Barn & Loading Bay (`STORAGE_SPOT`):** `{top:34, left:13.5, w:13.5, h:22}`
  - **Botanical Flower Garden (`garden`):** `{top:30, left:28, w:15, h:22}` (Elevated floral terrace)
  - **Duck & Fish Pond (`pond`):** `{top:37, left:44.5, w:16.5, h:23}` (Sunken water hollow)
  - **The Coffee House (`coffee_shop`):** `{top:31, left:62.5, w:16.5, h:23}` (Stone café terrace)
  - **The Juice & Ice Bar (`juice_bar`):** `{top:36, left:80.5, w:16.5, h:23}` (Promenade pavilion deck)
- **Grand Farm Main Entry Gate (`drawMainGateScene`):**
  - Ashlar stone masonry pillars with carved stone capstones and iron reinforcement brackets.
  - Carved timber archway with gold-embossed lettering: `"🌿 searchO2 ECO-FARM 🌿 SANCTUARY & BIO-GROUNDS"`.
  - Brass coach carriage lanterns mounted on pillars casting golden light (`#FFE082`).
  - Open rustic timber and iron gates welcoming visitors and transport trucks.
  - Colorful flower planter boxes at pillar bases.

### 9.2 Road Modernization & Block-Wise Walking Paths
- **Multi-Segment Road Network (`state.roads`):**
  - **Main Arterial Road (`main`):** Paved highway connecting Main Gate past Storage to the Village. Enables motorized heavy freight trucks and unlocks visitor shops.
  - **Garden Nature Walkway (`garden_walk`):** Cobblestone path with flower borders linking Storage to the Botanical Garden and Duck Pond (+4 Reputation, +25% flower freshness retention).
  - **Marketplace Plaza Promenade (`market_promenade`):** Lamp-lit flagstone boulevard linking Pond, Coffee House, and Juice Bar (+6 Reputation, +15% visitor sales bonus).
- **Dynamic Promenade Visuals (`roadPromenadeHtml`):**
  - Spans across the entire village front (`top: 57.5%`, `left: 0%`, `width: 100%`) without clipping or plot overlap.
  - Renders dashed arterial road markings, garden cobblestones, plaza flagstones, and animated strolling visitor silhouettes.

### 9.3 Itemized Storage Condition & Crop Preservation
- **Zero Passive Auto-Drain:** Eliminated passive continuous draining of storage by Coffee House and Juice Bar. Stored harvest is 100% preserved for manual player dispatch. Shops earn visitor foot-traffic revenue when open.
- **Climate-Controlled Cold Cellar Panel (`storageModalHtml`):**
  - Temperature: 4.2°C (optimal cold storage).
  - Relative Humidity: 85% (produce freshness preservation).
  - Dynamic preservation status and capacity utilization meter.
- **Itemized Crop Batches (`state.storage.items`):**
  - Discrete batches created upon tree harvest and pond yield:
    `{ id, cropKey, name, category, icon, source, value, qty, freshness, harvestedHour }`.
  - Filter pills: `[All Items]`, `[🍏 Produce]`, `[🪵 Timber]`, `[🐟 Pond Yield]`.
  - Checkboxes and quick `Select All` / `Clear` controls for selective selling.

### 9.4 Animated Manual Selling Logistics Simulation
- **Assigned Laborer Requirement:** Requires an assigned or available Laborer (`state.workers.find(w => w.type === 'laborer')`) to operate the loading dock and load crates. 1-click hire/assign buttons guide the player if unassigned.
- **Specialized Transport Vehicle SVGs:**
  - **Refrigerated Food Container Van (`drawFoodContainerTruckSvg`):** Aerodynamic cab, insulated white box with Thermo-King cooling unit, and `"searchO2 Fresh Foods 🍏"` livery for produce and pond harvests.
  - **Heavy Timber Logging Truck (`drawTimberTruckSvg`):** Rugged industrial truck with protective steel headache rack, vertical diesel stacks, and bolstered flatbed carrying strapped tree logs (`🪵`).
  - **Multi-Cargo Farm Hauler (`drawMixedHaulerSvg`):** Covered canvas curtainsider hauler for mixed goods.
- **4-Step Real-Time Road Animation Sequence (`animateTransportLogistics`):**
  1. *Arrival:* Truck enters from off-screen left along the Main Road through the Farm Main Gate and pulls into the Storage loading bay (`left: 14%`).
  2. *Loading:* Assigned Laborer sprite animates back and forth between Storage doors and truck bed carrying crates/timber logs with thud sounds and dust particles.
  3. *Departure:* Laborer waves goodbye (`👋`), truck accelerates along the paved road, and exits through the Farm Gate.
  4. *Settlement:* Revenue credited to player balance, coin SFX plays (`'coin'`), floating `🪙 +€XX.XX` cash burst appears, and shipment report is logged.

---

*Generated and verified for branch `mvp-v1` — searchO2 Project Evolution.*

