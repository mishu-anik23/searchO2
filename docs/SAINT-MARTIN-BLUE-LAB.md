# Saint Martin's Island Blue Lab (`saint_martin`)

Integrated into the planetary biome globe (bottom-left / region screen).

## Navigation
1. Open **Select a Planetary Biome** (globe).
2. Select **🇧🇩 Saint Martin's Island · Blue Lab** chip or card.
3. **Enter Blue Lab** opens the zone dossier (orchards, species, coral, microgrid, export).
4. **🚀** fixed FAB (bottom-left, above music dock) opens **OxyForge Mission HQ** (`oxyforge.html` or set `window.OXYFORGE_HQ_URL`).

## Systems (v1)
- Twin decagonal orchards `dec1` / `dec2`
- Species: Coconut, Palmyra, Keya, Mangrove, Casuarina, seagrass, seaweed lines
- Coral education catalog (Acropora, Favites, Goniopora, Montipora, Turbinaria) — [marinebiodiversity.org.bd/coral-reefs](https://marinebiodiversity.org.bd/coral-reefs/)
- Wind / solar / BESS microgrid stats + aquaculture + German restaurant export pipeline

## OxyForge merge
- Farm game: root `index.html` (serve with `npm run farm` or static server)
- Full React OxyForge: `npm run dev` → Vite `GameApp` at `/`
- Static bridge: `public/oxyforge.html`

## Source repo
https://github.com/mishu-anik23/searchO2
