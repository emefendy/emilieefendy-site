import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { EXPERIENCE, WORKS, type Chapter, type Slide } from './content';
import { useTheme } from './hooks/useTheme';
import { useHotkeys } from './hooks/useHotkeys';
import { reveal } from './lib/scroll';
import { slugify } from './lib/slug';
import { lockScroll, reducedMotion, scrollToEl, startSmoothScroll } from './lib/smoothScroll';
import { buildCommands } from './palette/commands';
import { CommandPalette } from './palette/CommandPalette';
import { Readout } from './orbital/Readout';
import { Nav } from './components/Nav';
import { Hero, Intro } from './components/Hero';
import { Chapters } from './components/Chapters';
import { Present } from './components/Present';
import { Past } from './components/Past';
import { Works } from './components/Works';
import { CaseStudy } from './components/CaseStudy';
import { Extras } from './components/Extras';
import { Footer } from './components/Footer';
import { Lightbox, type LightboxState } from './components/Lightbox';
import { Toast } from './components/Toast';

// three.js is most of the bundle; the text shouldn't wait on it
const OrbitalCanvas = lazy(() => import('./orbital/OrbitalCanvas'));

/** No WebGL (old hardware, blocked GPU) shouldn't take the page down with it. */
class Quiet extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** #works/412-food-rescue → '412-food-rescue' */
function workFromHash(): string | null {
  const m = /^#works\/(.+)$/.exec(location.hash);
  const slug = m ? decodeURIComponent(m[1]!) : null;
  return slug && WORKS.some((w) => w.slug === slug) ? slug : null;
}

export function App() {
  const { resolved: theme, toggle: toggleTheme } = useTheme();
  const [reduced] = useState(reducedMotion);
  const [work, setWork] = useState<string | null>(workFromHash);
  const [openXp, setOpenXp] = useState<ReadonlySet<string>>(() => new Set([EXPERIENCE[0]!.org]));
  const [slides, setSlides] = useState<LightboxState>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null);

  useEffect(startSmoothScroll, []);
  useEffect(() => lockScroll('palette', paletteOpen), [paletteOpen]);
  useEffect(() => lockScroll('slides', !!slides), [slides]);

  // replace rather than push: flipping through projects shouldn't fill up the back button
  const openWork = useCallback((slug: string) => {
    setWork(slug);
    history.replaceState(null, '', '#works/' + slug);
  }, []);
  const closeWork = useCallback(() => {
    setWork(null);
    history.replaceState(null, '', '#works');
  }, []);

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

  useEffect(() => {
    const onHash = () => setWork(workFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // modals live in the top layer; don't open the palette underneath one
  const modalOpen = !!slides || !!work;
  useHotkeys({
    'mod+k': () => !modalOpen && setPaletteOpen((o) => !o),
    '/': () => !modalOpen && setPaletteOpen(true),
  });

  // "Read more" from a chapter: projects open as case studies, roles open in the past section
  const onMore = useCallback(
    (more: Chapter['more']) => (more.kind === 'work' ? openWork(more.slug) : openExperience(more.org)),
    [openWork, openExperience],
  );

  // the campus tags jump to their chapter, landing a little past the marker so it's properly on
  const openChapter = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) scrollToEl(el, -window.innerHeight * 0.55);
  }, []);

  const commands = useMemo(
    () => buildCommands({ theme, toggleTheme, openWork, openExperience, openSlides, toast: showToast }),
    [theme, toggleTheme, openWork, openExperience, openSlides, showToast],
  );

  return (
    <>
      <Quiet>
        <Suspense fallback={null}>
          <OrbitalCanvas theme={theme} reduced={reduced} />
        </Suspense>
      </Quiet>
      <Nav theme={theme} onToggleTheme={toggleTheme} onOpenPalette={() => setPaletteOpen(true)} />
      <main>
        <Intro />
        <div className="wrap">
          <Hero onOpenChapter={openChapter} reduced={reduced} />
        </div>
        <Chapters onMore={onMore} />
        <div className="wrap">
          <Present />
          <Past open={openXp} onToggle={toggleXp} />
          <Works onOpen={openWork} />
          <Extras />
          <Footer />
        </div>
      </main>
      <Readout />
      <CaseStudy slug={work} onClose={closeWork} onNavigate={openWork} onOpenSlides={openSlides} />
      <Lightbox state={slides} onChange={setSlides} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
      {toast && <Toast key={toast.id} message={toast.msg} onDone={() => setToast(null)} />}
    </>
  );
}
