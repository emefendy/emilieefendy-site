# emilieefendy.com

My personal site. React + TypeScript, built with Vite, deployed to GitHub Pages.

Press <kbd>⌘K</kbd> (or <kbd>Ctrl K</kbd>, or <kbd>/</kbd>) anywhere on the site.

```sh
npm install
npm run dev      # localhost:5173
npm test
npm run lint     # eslint + prettier
npm run build    # → dist/
```

## Where things are

- `src/content/` – everything the site says, as typed data. Edit this, not the components.
- `src/components/Scene.tsx` – the panel inside each building; the four sections are in
  `components/sections/`. The open building lives in the URL hash (`useSceneRoute`), so
  Back walks you out.
- `src/campus/` – the animated campus. `world.ts` is the simulation (plain TS, tested),
  `render.ts` draws it to a canvas, `useCampus.ts` wires up loading, input and the frame loop,
  and `framing.ts` works out the camera zoom onto a building.
- `src/me/` – pixel me: the sprite, the first-visit dialog and the Ask me bubble.
- `src/palette/` – the ⌘K command palette. No library; ranking is in `search.ts` and the
  fuzzy matcher is `src/lib/fuzzy.ts`.
- `public/` – images, slide decks, `CNAME`.

Pushing to `main` lints, tests, builds and deploys (`.github/workflows/deploy.yml`).

## The campus

The whole page is a pixel-art campus with people, birds, smoke, leaves and a boat
moving on top. The art itself was generated, then normalised:

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
