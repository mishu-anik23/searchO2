# OxyForge merge (main baseline + enhancements)

## Baseline
GitHub `main` / `oxyforge-v1` design standard kept:
- Mission HQ, 3D LaunchPad (Pad3D), FPVView, Landing with CosmosScene
- Constellation hover / pointer styling (cyan `#7eb8c9` labels — not replaced)
- Star catalog / constellations.ts (88 figures, named stars) — **not overwritten**
- SurfaceScene3D plant path, Moon/Mars explorers, ZodiacLab sky lab

## Added on top
- **Mars civ v2**: Why → Library exit ticket → Field task → Build + RXP (`civ-v2.ts`, `FieldTask`, `MarsCiv`, Habitat panel)
- **HQ**: sequential Moon → Mars why cards (does not replace roster / sky lab)
- **LaunchPad**: sticky Start countdown for small screens
- **Chrome**: RXP rank badge
- **Farm SPA** (`index.html`): chapter progression, plot unlocks, pond/café gates

## Shared deep sky
Landing and FPV already share CosmosScene / constellation data on main. Mars civ habitat uses the ochre site canvas for ISRU teaching; deep-sky remains on cruise/landing/FPV.

## Run
```bash
npm install
npm run dev          # OxyForge
npm run farm         # SearchO2 farm index.html
```
