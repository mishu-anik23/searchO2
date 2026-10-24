# searchO2 Learning Hub

Static site at `/hub/`, served next to `index.html`. No build step.

Open `hub/index.html` (or `npm run farm`, then `/hub/`).

## Pages
Home (growth demo + world map), Getting Started, Components, Plant Library (+ quiz),
Concepts, How-to Guides, Player Hub, Help & FAQ, Feedback, Report a Problem.

## Content stays in sync with the game
`scripts/build-hub-data.mjs` reads the data tables straight out of `index.html`
(trees, library, buildings, chapters, concepts, Why? topics, biomes, achievements, globe land dots)
and writes `hub/data/content.json` + `content.js`. Re-run after changing game data:

    npm run hub:data

## Navigate button
The gold button in the top bar goes to the player's selected map.
- The game stores the last map picked on the globe in `localStorage['searchO2_selected_region']`.
- The hub reads it, and the player can change it from the hub map or the ▾ picker.
- Destinations live in `DEST` in `hub.js`: Germany -> `../index.html?enter=farm`,
  Bavaria -> `bavaria/alpenhof.html`, Saint Martin -> `saint-martin/blue-lab.html`.
  Locked maps open the globe turned to that region (`?region=<id>`).
- To open a new map, add it to `DEST` and to the game's own routing.

## Feedback / Report forms
They POST JSON to `<API base>/feedback` (`backend/src/modules/feedback`).
- Table `feedback_submissions` (migration 006, run with the usual `npm run db:migrate`). RLS is on and
  anon/authenticated access is revoked, because migration 005 would otherwise expose new tables.
- Public `POST /api/feedback`, limited to 10 per hour per IP. Admins can read `GET /api/feedback/admin`
  (`?kind=feedback|problem&status=new|seen|resolved&limit=50`).
- If the server cannot be reached, the message is kept on the device ("Saved on this device")
  with Retry / Copy / Delete, so nothing is lost.
- Reports include technical details (browser, screen, map) only when the box is ticked, and never the save.
