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
- `src/palette/` – the command palette. No library; the ranking is in `search.ts`
  and the fuzzy matcher it uses is `src/lib/fuzzy.ts`.
- `src/hooks/useLattice.ts` – the canvas grid behind the hero.
- `public/` – images, slide decks, `CNAME`.

Links into a project work: `emilieefendy.com/#works/412-food-rescue`.

Pushing to `main` runs the tests, builds, and deploys (`.github/workflows/deploy.yml`).
