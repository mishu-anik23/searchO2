# How to run SearchO₂ + OxyForge

## A) Farm simulation (vanilla SPA — no build step)

```bash
# From the searcho2-pkg folder:
npx --yes serve -l 5173 .
# or double-click index.html in a browser
```

Open http://localhost:5173/index.html

Or:

```bash
npm run farm
```

## B) OxyForge (React / Vite — Moon, Mars, Sky lab)

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:8080).

From HQ you can open:
- **Sky lab** (zodiac / natal)
- **Plan Moon / Mars** missions
- Pad checklist → sticky **Start countdown**

## Why `npm run dev` failed before

The zip briefly had a minimal `package.json` without a `dev` script. This package restores the full Vite scripts (`dev`, `build`, `preview`, …).
