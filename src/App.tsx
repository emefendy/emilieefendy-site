import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EXPERIENCE, WORKS, type Slide } from './content';
import { useLattice } from './hooks/useLattice';
import { useTheme } from './hooks/useTheme';
import { useHotkeys } from './hooks/useHotkeys';
import { reveal } from './lib/scroll';
import { slugify } from './lib/slug';
import { buildCommands } from './palette/commands';
import { CommandPalette } from './palette/CommandPalette';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Present } from './components/Present';
import { Past } from './components/Past';
import { Works } from './components/Works';
import { Extras } from './components/Extras';
import { Footer } from './components/Footer';
import { Lightbox, type LightboxState } from './components/Lightbox';
import { Toast } from './components/Toast';

const DEFAULT_WORK = WORKS[0]!.slug;

// Two columns on wide screens: the panel starts at the top of the section, so
// scroll there or you land halfway down the write-up. Stacked on phones: the
// panel opens right under its button, so scroll to the button.
function revealWork(slug: string, flash = true) {
  const btn = document.getElementById('b-' + slug);
  const stacked = window.matchMedia('(max-width: 680px)').matches;
  reveal(btn, { flash, scrollTo: stacked ? btn : document.getElementById('works') });
}

/** #works/412-food-rescue → '412-food-rescue' */
function workFromHash(): string | null {
  const m = /^#works\/(.+)$/.exec(location.hash);
  const slug = m ? decodeURIComponent(m[1]!) : null;
  return slug && WORKS.some((w) => w.slug === slug) ? slug : null;
}

export function App() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const hero = useRef<HTMLElement>(null);
  useLattice(canvas, hero);

  const { resolved: theme, toggle: toggleTheme } = useTheme();
  const [work, setWork] = useState(() => workFromHash() ?? DEFAULT_WORK);
  const [openXp, setOpenXp] = useState<ReadonlySet<string>>(() => new Set([EXPERIENCE[0]!.org]));
  const [slides, setSlides] = useState<LightboxState>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null);

  const selectWork = useCallback((slug: string) => {
    setWork(slug);
    // replace rather than push: clicking through projects shouldn't fill up the back button
    history.replaceState(null, '', '#works/' + slug);
  }, []);

  const openWork = useCallback(
    (slug: string) => {
      selectWork(slug);
      requestAnimationFrame(() => revealWork(slug));
    },
    [selectWork],
  );

  const openExperience = useCallback((org: string) => {
    setOpenXp((s) => new Set(s).add(org));
    requestAnimationFrame(() => reveal(document.getElementById('xp-' + slugify(org))));
  }, []);

  const toggleXp = useCallback((org: string, open: boolean) => {
    setOpenXp((s) => {
      const next = new Set(s);
      if (open) next.add(org);
      else next.delete(org);
      return next;
    });
  }, []);

  const openSlides = useCallback((list: Slide[], index: number) => setSlides({ slides: list, index }), []);
  const showToast = useCallback((msg: string) => setToast({ msg, id: Date.now() }), []);

  // deep link on first load, and keep up with back/forward
  useEffect(() => {
    const fromHash = workFromHash();
    if (fromHash) {
      // wait a frame for layout (and the fonts) before scrolling
      requestAnimationFrame(() => revealWork(fromHash, false));
    }
    const onHash = () => {
      const s = workFromHash();
      if (s) setWork(s);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // the slide viewer is a modal <dialog> in the top layer; don't open on top of it
  useHotkeys({
    'mod+k': () => !slides && setPaletteOpen((o) => !o),
    '/': () => !slides && setPaletteOpen(true),
  });

  const commands = useMemo(
    () => buildCommands({ theme, toggleTheme, openWork, openExperience, openSlides, toast: showToast }),
    [theme, toggleTheme, openWork, openExperience, openSlides, showToast],
  );

  return (
    <>
      <canvas id="field" ref={canvas} aria-hidden="true" />
      <Nav theme={theme} onToggleTheme={toggleTheme} onOpenPalette={() => setPaletteOpen(true)} />
      <main className="wrap">
        <Hero ref={hero} />
        <Present />
        <Past open={openXp} onToggle={toggleXp} />
        <Works selected={work} onSelect={selectWork} onOpenSlides={openSlides} />
        <Extras />
        <Footer />
      </main>
      <Lightbox state={slides} onChange={setSlides} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
      {toast && <Toast key={toast.id} message={toast.msg} onDone={() => setToast(null)} />}
    </>
  );
}
