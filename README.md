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

- `src/content.ts` – everything the site says, including the six chapters
  (`CHAPTERS`). Edit this, not the components.
- `src/components/Chapters.tsx` – the pinned chapter stage: one sticky screen
  inside a tall wrapper, so scrolling advances the chapter instead of the page.
- `src/orbital/` – the particle cloud. ~34k points sampled from real hydrogen
  wavefunctions (|ψ|², in a Web Worker), morphing 3d_z² → 2p_z → 4f_xyz → 3d_xy → 1s
  as you scroll, colored by the sign of ψ. Click anywhere to measure: the cloud
  collapses onto one sampled position and the readout shows its r in Bohr radii.
  `orbitals.test.ts` checks the sampler against ⟨r⟩ = (3n² − l(l+1))/2.
  The page directs it: any element with `data-orbital` is an anchor saying which
  orbital to show and where (`src/orbital/anchors.ts`).
- `src/palette/` – the command palette. No library; the ranking is in `search.ts`
  and the fuzzy matcher it uses is `src/lib/fuzzy.ts`.
- `public/` – images, slide decks, `CNAME`.

Links into a project work: `emilieefendy.com/#works/412-food-rescue`.

Pushing to `main` runs the tests, builds, and deploys (`.github/workflows/deploy.yml`).

## Fonts

Self-hosted in `public/fonts/`: Overused Grotesk (SIL OFL) and Departure Mono
(MIT), licences alongside. IBM Plex Mono comes from `@fontsource`.
