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

---

## 5. Verification & Testing Guide

All four prototype applications can be executed directly in any modern web browser without build steps or web servers:

```bash
# Direct local execution paths:
searchO2-prototype.html       # v1: Minimal 3-tree core loop & time compression
searchO2-prototype-v2.html    # v2: SVG landscape field, 18 tree types, workers
searchO2-prototype-v3.html    # v3: Full-screen UI, plot health decay, watering/pruning
searchO2-prototype-v4.html    # v4: Complete eco-village, storage pipeline, buildings, loans
```

### Recommended Gameplay Test Flows
1. **Clock Acceleration:** In any version, select **180x** or **600x** in the season dropdown to observe tree growth stages, season transitions, and payroll cycles within seconds.
2. **Storage Pipeline Test (v4):** Plant fruit trees or vegetables. Build the Storage Room (€550). When trees reach maturity, click them to harvest. Verify stored goods appear in storage rather than suffering the $50\%$ spoilage penalty.
3. **Village Revenue Loop (v4):** Build a Coffee Shop or Juice Bar. Observe stored harvest being automatically converted into visitor Euro revenue at a premium markup ($1.6\times - 1.8\times$).
4. **Credit & Bankruptcy Test (v4):** Hire all workers or spend cash until balance reaches $-€50$. Verify the emergency Bank modal triggers automatically with restructuring options.

---

## 6. Blueprint Gap Analysis & Phase 2 Engineering Roadmap

| Blueprint Section | Phase 1 Status (Prototypes v1–v4) | Phase 2 Implementation Target |
|---|---|---|
| **API Architecture** | Browser-only client logic | Node.js + Express + TypeScript REST API |
| **Database Model** | LocalStorage JSON blobs | PostgreSQL schema with Knex / Prisma migrations |
| **Server-Authoritative Anti-Cheat (§A1)** | Client calculates elapsed time & income | Server recomputes game time from timestamps on claim |
| **Authentication (§A2)** | Anonymous local guest profile | JWT access tokens (15 min) + HTTP-only refresh cookies |
| **Countdown Sync** | Client-side `setInterval` | WebSocket push notifications for task completions |
| **Global Leaderboards** | Local simulation stub | Redis cache with scheduled batch aggregation |
| **Regional Biomes** | Germany Grassland (6 plots) | 10 unlockable global biomes with climate modifiers |
| **Educational Quiz Engine** | Static hint toasts & facts | Interactive sustainability quizzes with coin/seed rewards |

---

*Generated and verified for branch `mvp-v1` — searchO2 Project Evolution.*
