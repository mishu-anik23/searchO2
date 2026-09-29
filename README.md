# OxyForge

**A 3D space mission simulator** — plan a Moon or Mars flight, run the launch checklist, fly the transfer, land, and make oxygen off Earth.

Built with React 19, React Three Fiber, Three.js, TanStack Router/Start, Zustand, and Tailwind CSS v4.

---

## Quick Start

```bash
npm install
npm run dev
```

Dev server runs at `http://localhost:8080`.

### Build

```bash
npm run build      # production build + DB migration
npm run preview    # preview the built output
```

---

## Game Flow Mechanics

OxyForge is a budget-driven mission simulator. The player acts as a flight director: they manage a program account, choose a rocket and destination, complete a launch checklist, fly the transfer corridor, land on the surface, and operate an oxygen plant. Every step teaches real orbital mechanics and ISRU (In-Situ Resource Utilization) science.

### Mission Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OXYFORGE MISSION FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ Briefing │───▶│   HQ     │───▶│ Planner  │───▶│ LaunchPad│
  │ (onboard)│    │ (budget) │    │ (rocket +│    │ (check-  │
  │          │    │          │    │  dest)   │    │  list)   │
  └──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                      │
                    ┌─────────────────────────────────┘
                    ▼
  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │  Launch  │───▶│  Cruise  │───▶│ Landing  │───▶│ Surface  │
  │ (3D pad  │    │ (Hohmann │    │ (3D Moon │    │ (3D ISRU │
  │  + rocket│    │  transfer│    │  descent │    │  plant:  │
  │  physics)│    │  + FPV   │    │  + hover)│    │  electro-│
  │          │    │  camera) │    │          │    │  lyzer)  │
  └──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                         │
                              ┌──────────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │     Debrief       │
                    │ (contract payout  │
                    │  + oxygen revenue)│
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────┐
                    │  Back to HQ       │
                    │  (next mission)   │
                    └───────────────────┘
```

### Screen-by-Screen Breakdown

#### 1. Briefing
- First-time onboarding screen
- Player enters their commander name
- Sets starting budget: $2,500,000

#### 2. HQ (Headquarters)
- Program overview: credits, oxygen stored, habitats built, missions completed
- Access to the Library (science notes unlocked during play)
- Button to start planning a new mission

#### 3. Planner
- Choose a rocket:
  - **Hauler-9** — Cargo only, cheaper, 8,200 kg payload
  - **Crewmark-3** — Crew + cargo, more expensive, 4,100 kg payload, carries 3 crew
- Choose a destination:
  - **Moon** — 3-day transfer, $185K–$465K, vacuum, ice at poles
  - **Mars** — 7-month transfer, $920K–$1.78M, thin CO₂, MOXIE-class ISRU
- Price is deducted from the program account

#### 4. Launch Pad
- Interactive pre-launch checklist (8 items):
  1. Launch window — confirm alignment
  2. Propellant load — pump LOX + methane to 100%
  3. Mass and balance — confirm cargo/crew mass
  4. Guidance align — spin up gyroscopes
  5. Range safety — arm range safety
  6. Winds and weather — poll until winds < 20 knots
  7. Cargo/crew secure — confirm payload secured
  8. Communications — run radio check
- 3D launch pad scene with gantry, towers, tanks, floodlights
- All items must be "GO" before launch

#### 5. Launch
- 3D rocket ascent with physics-based telemetry:
  - Altitude, velocity, dynamic pressure (Max-Q)
  - Stage separation
  - Atmospheric density → sky color transition (blue → black)
  - Earth limb appears at high altitude
- Phases: countdown → ignition → liftoff → Max-Q → stage sep → vacuum

#### 6. Cruise
- Transfer path visualization (Hohmann ellipse for Mars, translunar for Moon)
- **Flight Camera (FPV)**: optional real-time 3D cockpit over the compressed solar system
  - Planets render as real disks with textures
  - Reticle auto-locks celestial bodies on the path
  - Telemetry HUD: speed, distance, ETA, orbital lessons
  - Burns: W/S thrust, A/D yaw, drag to look, Z damp, X brake
  - Costs $180/sec while active
- Orbital mechanics lessons appear contextually:
  - Hohmann transfer, vis-viva equation, burn mechanics
  - Gravity as continuous fall, coast phase, launch windows

#### 7. Landing
- 3D Moon landing sequence (React Three Fiber):
  - Step-based descent: LOI → DOI → PDI → pitch program → hover → contact
  - Procedural lander mesh (descent stage, legs, engine plume)
  - Hover info hotspots on 3D objects (capture burn, weak gravity, lunar dust, etc.)
  - Earth visible in the black lunar sky
- Mars landing uses an SVG sequence (atmospheric entry, parachute, powered descent)
- Each step shows altitude, speed, and why it matters

#### 8. Surface (ISRU Plant)
- 3D surface scene with terrain, boulders, and equipment
- Step-by-step oxygen production:

**Moon (Polar Ice Electrolysis):**
1. Pick the south pole (ice in permanently shadowed craters)
2. Unfold solar arrays
3. Mine ice and regolith
4. Warm ice into water
5. Split water with electricity (electrolysis: 2 H₂O → 2 H₂ + O₂)
6. Store oxygen, recycle hydrogen
7. Squeeze oxygen from rock (ilmenite: FeTiO₃ + H₂ → Fe + TiO₂ + H₂O)

**Mars (MOXIE-class CO₂ Splitter):**
1. Deploy the compressor
2. Inhale carbon dioxide (95% CO₂ atmosphere)
3. Heat the ceramic cells (~800°C solid-oxide)
4. Split CO₂ into O₂ (2 CO₂ → 2 CO + O₂)
5. Tank the oxygen

- Each step yields oxygen (kg), which becomes revenue

#### 9. Habitat (Crew missions only)
- Crew habitat construction: pressure shell → shielding → plants → water loop
- 3D surface scene continues as backdrop

#### 10. Debrief
- Contract payout + oxygen revenue
- Summary: credits earned, oxygen produced, FPV spending
- Return to HQ for the next mission

---

## 3D Architecture

### Rendering Layers

| Layer | Technology | Components |
|-------|-----------|------------|
| Moon Surface | R3F `<Canvas>` | `MoonTerrain` (displaced mesh), `SurfaceBoulders` (instanced), `SurfaceEquipment`, `SurfaceHotspot` |
| Orbital System | R3F `<Canvas>` | `CelestialBody` (textured spheres), `OrbitSystem` (auto-motion), `OrbitPaths` (dashed rings) |
| Deep Sky | R3F `<Canvas>` | `StarField3D` (5,400 stars), `GalaxySprites` (17 DSOs), `ConstellationLines3D` |
| Camera Depth | R3F `<Canvas>` | `DepthCamera` (surface → orbital → deep space zoom) |
| Launch Pad | R3F `<Canvas>` | `Pad3D`, `RocketModel`, `PadEnvironment`, `CloudLayer`, `EnginePlume` |
| FPV Flight Camera | Canvas2D | `FPVView` (custom software 3D projector) |
| Transfer Map | SVG | `TransferMap` in `Cruise.tsx` |
| Mars Landing | SVG | `MarsScene` in `Landing.tsx` |

### Camera Depth Zones

The unified `CosmosScene` provides a continuous zoom from surface to deep space:

```
  Zoom 0.0          0.35          0.7          1.0
  ─────────────────────────────────────────────────▶
  │  SURFACE     │  ORBITAL    │   DEEP SPACE     │
  │              │             │                  │
  │ Terrain mesh │ Moon sphere │ Solar system     │
  │ Boulders     │ Earth disk  │ All planets      │
  │ Equipment    │ Sun visible │ Star field       │
  │ Lander       │             │ Galaxies         │
  │ Hotspots     │             │ Constellations   │
  │              │             │ Asteroid belt    │
  ─────────────────────────────────────────────────▶
  Scroll wheel to zoom · Drag to orbit · Hover for info
```

### Celestial Data

The `cosmos.ts` module provides all astronomical data:

| Dataset | Count | Description |
|---------|-------|-------------|
| `BODIES` | 10 | Sun, Mercury→Neptune, Moon (with orbital params) |
| `NAMED_STARS` | 25 | Bright stars with RA/Dec positions (Sirius, Vega, Betelgeuse...) |
| `GALAXIES` | 17 | Deep-sky objects (Andromeda, M51, M104, LMC, SMC...) |
| `FIELD` | 3,600 | Procedural background stars with spectral colors |
| `MILKY` | 1,800 | Milky Way band stars |
| `ASTEROIDS` | 160 | Asteroid belt rocks |
| `CONSTELLATIONS` | 5 | Named star patterns (Orion, Summer Triangle, etc.) |

### State Management

Zustand store (`store.ts`) manages all game state:

```
GameState
├── commander: string
├── credits: number (starts at $2,500,000)
├── oxygenKg: number
├── screen: Screen (briefing | hq | plan | pad | launch | cruise | landing | surface | habitat | debrief)
├── mission: { rocket, destination, paid } | null
├── checklist: Record<string, boolean>
├── fuelLox / fuelCh4: number (0–100)
├── gyro: number (0–100)
├── windKnots: number
├── plantStep / habitatStep / landingStep: number
├── fpvOpen: boolean
├── fpvSpent: number
├── orbitalSpeed: number (time multiplier for 3D orbital animation)
├── cameraDepth: "surface" | "orbital" | "deep"
├── cameraZoom: number (0–1)
├── unlockedTopics: string[]
└── reducedMotion: boolean
```

---

## Economics

| Item | Moon | Mars |
|------|------|------|
| Hauler-9 launch price | $185,000 | $920,000 |
| Crewmark-3 launch price | $465,000 | $1,780,000 |
| Hauler-9 contract pay | $280,000 | $1,350,000 |
| Crewmark-3 contract pay | $720,000 | $2,650,000 |
| Oxygen price | $40/kg | $40/kg |
| FPV camera rate | $180/sec | $180/sec |

Moon ISRU yields ~310 kg O₂ per mission. Mars ISRU yields ~210 kg O₂ per mission.

---

## Project Structure

```
OxyForge-merged/
├── public/
│   ├── cosmos/              # .webp textures (earth, moon, mars, jupiter, saturn, sun, venus, uranus, andromeda)
│   ├── moon-landing-preview.html  # Standalone 3D Moon landing demo
│   └── favicon.svg
├── scripts/                 # Build tooling (with-app-env, migrate, preview, browser-smoke)
├── server/                  # Server middleware (grok-pwa)
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── three/       # 3D R3F components
│   │   │   │   ├── CosmosScene.tsx       # Unified surface→space scene
│   │   │   │   ├── MoonTerrain.tsx       # 3D displaced terrain + boulders + equipment
│   │   │   │   ├── CelestialBody.tsx     # 3D planets with textures + rings + orbits
│   │   │   │   ├── StarField3D.tsx       # 5,400-star field + constellations
│   │   │   │   ├── GalaxySprite.tsx      # 17 deep-sky objects as billboards
│   │   │   │   ├── OrbitSystem.tsx       # Auto orbital motion + time control
│   │   │   │   ├── DepthCamera.tsx       # Surface→space camera transitions
│   │   │   │   ├── CelestialHover.tsx    # Reusable hover tooltip system
│   │   │   │   ├── SurfaceScene3D.tsx    # 3D ISRU plant view
│   │   │   │   ├── Pad3D.tsx             # 3D launch pad scene
│   │   │   │   ├── PadEnvironment.tsx    # Launch complex geometry
│   │   │   │   ├── RocketModel.tsx       # Procedural rocket mesh
│   │   │   │   ├── CloudLayer.tsx        # Instanced cloud puffs
│   │   │   │   └── EnginePlume.tsx       # Animated engine plume
│   │   │   ├── GameApp.tsx              # Root component — screen router
│   │   │   ├── Briefing.tsx             # Onboarding
│   │   │   ├── HQ.tsx                   # Headquarters
│   │   │   ├── Planner.tsx              # Mission planning
│   │   │   ├── LaunchPad.tsx            # Checklist + 3D launch
│   │   │   ├── LaunchScene.tsx          # Launch phase wrapper
│   │   │   ├── Cruise.tsx               # Transfer + FPV entry
│   │   │   ├── Landing.tsx              # 3D Moon landing + Mars SVG
│   │   │   ├── Surface.tsx              # 3D ISRU plant + habitat
│   │   │   ├── Debrief.tsx              # Mission summary
│   │   │   ├── FPVView.tsx              # 2D canvas flight camera
│   │   │   ├── Chrome.tsx               # Top navigation bar
│   │   │   ├── LibraryPanel.tsx         # Science library drawer
│   │   │   └── Briefing.tsx
│   │   └── ui/                          # Radix UI primitives (button, dialog, tooltip, etc.)
│   ├── game/
│   │   ├── store.ts                     # Zustand game state
│   │   ├── data.ts                      # Rockets, destinations, checklist, plant steps
│   │   ├── cosmos.ts                    # Celestial data (bodies, stars, galaxies, orbits)
│   │   ├── audio.ts                     # Sound effects
│   │   └── launch/
│   │       └── launchPhysics.ts         # Rocket ascent simulation
│   ├── lib/
│   │   ├── auth/                        # Authentication (better-auth)
│   │   ├── app-data/                    # App data layer
│   │   ├── multiplayer/                 # P2P multiplayer
│   │   ├── db.ts                        # PGLite database
│   │   ├── env.server.ts                # Environment config
│   │   └── utils.ts                     # Shared utilities
│   ├── routes/                          # TanStack Router routes
│   └── styles.css                       # Tailwind v4 + design tokens
├── migrations/                          # SQL migrations
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#090c12` | Page background (deep space) |
| `--color-surface` | `#131820` | Card/panel background |
| `--color-raised` | `#1a222e` | Elevated surfaces |
| `--color-fg` | `#e8edf4` | Primary text |
| `--color-muted` | `#8b97a8` | Secondary text |
| `--color-accent` | `#7eb8c9` | Accent links, active states |
| `--color-go` | `#6fbf9a` | Success/complete |
| `--color-nogo` | `#c97a6a` | Error/danger |
| `--color-warn` | `#c9a86f` | Warning |
| `--color-moon` | `#c5d4e3` | Moon surfaces |
| `--color-mars` | `#c4896a` | Mars surfaces |
| `--font-display` | `Outfit` | Headings |
| `--font-sans` | `Atkinson Hyperlegible` | Body text |
| `--font-mono` | `IBM Plex Mono` | Telemetry/code |

---

## Key Controls

### FPV Flight Camera
| Key | Action |
|-----|--------|
| W / S | Thrust forward / reverse |
| A / D | Yaw left / right |
| R / F | Pitch up / down |
| Q / E | Roll left / right |
| Space | Thrust up |
| Ctrl / C | Thrust down |
| Shift | Boost (2.4× thrust) |
| X | Brake (damp velocity) |
| Z | Damp spin (auto-level) |
| Drag | Look around |
| Click | Pointer lock |

### 3D Scenes
| Input | Action |
|-------|--------|
| Drag | Orbit camera |
| Scroll | Zoom (surface → deep space in Landing scene) |
| Hover markers | Science info tooltips |

---

## Science Topics (Library)

Topics unlock as the player encounters them during missions:

| ID | Topic |
|----|-------|
| `why-oxygen` | Why we need to make oxygen off Earth |
| `oxidizer` | Liquid oxygen as rocket oxidizer |
| `equation` | The rocket equation |
| `windows` | Launch windows and planetary alignment |
| `orbits` | Orbital mechanics (Hohmann, vis-viva) |
| `hohmann` | Hohmann transfer orbits |
| `distance` | How far is the Moon / Mars |
| `moon-ice` | Lunar polar ice and ISRU |
| `electrolysis` | Water electrolysis for oxygen |
| `moxie` | MOXIE: making O₂ from CO₂ on Mars |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19.2 + TypeScript 5.7 |
| 3D Engine | Three.js 0.186 + React Three Fiber 9.8 + drei 10.7 |
| State | Zustand 5 (with persist middleware) |
| Routing | TanStack Router 1.170 + TanStack Start 1.168 |
| Styling | Tailwind CSS v4 + tw-animate-css |
| Auth | better-auth 1.6 |
| Database | PGLite 0.5 (PostgreSQL in WASM) |
| Build | Vite 8 + Nitro 3 |
| Testing | Node built-in test runner |
| E2E | Playwright 1.62 |

---

## Development

```bash
npm run dev          # Start dev server (0.0.0.0:8080)
npm run build        # Production build + DB migration
npm run preview      # Preview built output
npm run typecheck    # TypeScript check
npm run test         # Run unit tests
npm run lint         # ESLint
npm run format       # Prettier format
```

---

## License

Private project.
