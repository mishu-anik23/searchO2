# OxyForge — Merged Complete Build

This package combines:

## From uploaded `so2-space-full-project` (advanced systems)
- **3D Launch pad** — `src/components/game/three/`  
  Pad3D, RocketModel, EnginePlume, CloudLayer, PadEnvironment
- **Launch physics** — `src/game/launch/launchPhysics.ts`
- **Advanced LaunchPad + LaunchScene** wiring telemetry, gantry, wind, clouds
- **Richer FPV / cosmos** — larger `FPVView.tsx` and `cosmos.ts` (planets, lessons, textures under `public/cosmos/`)

## From OxyForge enhanced Moon landing work
- **3D Moon landing sequence** — `src/components/game/Landing.tsx`  
  React Three Fiber scene, step-based poses, orbit → descent → surface, engine plume, learning hotspots on hover
- **Tooltip UI** — `src/components/ui/tooltip.tsx`
- **Standalone preview** — `public/moon-landing-preview.html`  
  Open in any browser (no build required) to walk the six Moon landing steps with 3D + science popups

## How to run
```bash
cd OxyForge-merged
npm install
npm run dev
```
Dev server targets `0.0.0.0:8080`.

Quick Moon landing demo without install:
open `public/moon-landing-preview.html` in Chrome/Firefox.

## Mission flow (unchanged)
Briefing → HQ → Plan → Pad checklist → Launch → Cruise (optional FPV) → Landing → Surface ISRU → Habitat (crew) → Debrief
