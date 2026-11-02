# emilieefendy.com

My personal site. React + TypeScript, built with Vite, deployed to GitHub Pages.

Press <kbd>⌘K</kbd> (or <kbd>Ctrl K</kbd>, or <kbd>/</kbd>) anywhere on the site.

```sh
npm install
npm run dev      # localhost:5173
npm test
npm run build    # → dist/
```

## Where things are

- `src/content.ts` – everything the site says. Edit this, not the components.
- `src/components/Scene.tsx` – what you see inside each building. Clicking a
  tag zooms the campus onto that building (`framing()` in `CampusScene.tsx`)
  and slides this panel in; Esc or the browser's back button walks you out.
- `src/palette/` – the command palette. No library; the ranking is in `search.ts`
  and the fuzzy matcher it uses is `src/lib/fuzzy.ts`.
- `public/` – images, slide decks, `CNAME`.

Links into a project work: `emilieefendy.com/#works/412-food-rescue`.

Pushing to `main` runs the tests, builds, and deploys (`.github/workflows/deploy.yml`).

## The campus

The whole page is a pixel-art campus with people, birds, smoke, leaves and a boat
moving on top (`src/campus/`). The art itself was generated, then normalised:

```sh
python3 tools/build_sprites.py   # art/campus-art/ -> public/campus/
```

That keys out the green, slices each sheet into frames, shrinks everything
onto one shared pixel grid and palette, and writes `campus.json`. Replace a
file in `art/campus-art/` and rerun it. Paths, chimneys and lamps are traced
in `src/campus/map.ts`; the walking rules are in `walk.ts` (tested).

## Fonts

Self-hosted in `public/fonts/`: Overused Grotesk (SIL OFL) and Departure Mono
(MIT), licences alongside. IBM Plex Mono comes from `@fontsource`.
