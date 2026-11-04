import { useCallback, useEffect, useMemo, useState } from 'react';
import { EXPERIENCE, SCENES, type SceneId, type Slide } from './content';
import { useTheme } from './hooks/useTheme';
import { useHotkeys } from './hooks/useHotkeys';
import { reducedMotion } from './lib/motion';
import { slugify } from './lib/slug';
import { buildCommands } from './palette/commands';
import { CommandPalette } from './palette/CommandPalette';
import { Hero } from './components/Hero';
import { Scene } from './components/Scene';
import { CaseStudy } from './components/CaseStudy';
import { Lightbox, type LightboxState } from './components/Lightbox';
import { Toast } from './components/Toast';
import { IntroDialog } from './me/IntroDialog';

const MET = 'met';
const hasMet = () => {
  try {
    return localStorage.getItem(MET) === '1';
  } catch {
    return false;
  }
};

/** #projects → 'projects' */
function sceneFromHash(): SceneId | null {
  const h = location.hash.slice(1);
  return SCENES.some((s) => s.id === h) ? (h as SceneId) : null;
}

export function App() {
  const { resolved: theme, toggle: toggleTheme } = useTheme();
  const [reduced] = useState(reducedMotion);
  const [scene, setScene] = useState<SceneId | null>(sceneFromHash);
  const [work, setWork] = useState<string | null>(null);
  const [openXp, setOpenXp] = useState<ReadonlySet<string>>(() => new Set([EXPERIENCE[0]!.org]));
  const [slides, setSlides] = useState<LightboxState>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null);
  // say hello on a first visit (straight into a building's link skips it)
  const [intro, setIntro] = useState(() => !hasMet() && !sceneFromHash());
  const finishIntro = useCallback(() => {
    setIntro(false);
    try {
      localStorage.setItem(MET, '1');
    } catch {
      /* fine, they'll get a hello next time too */
    }
  }, []);

  // Opening a building from the campus adds a history entry, so the browser's
  // back button walks you out again; hopping between buildings doesn't.
  const openScene = useCallback((id: SceneId) => {
    setScene((cur) => {
      if (cur) history.replaceState(null, '', '#' + id);
      else history.pushState(null, '', '#' + id);
      return id;
    });
  }, []);
  const goHome = useCallback(() => {
    setScene(null);
    history.replaceState(null, '', location.pathname + location.search);
  }, []);

  useEffect(() => {
    const sync = () => setScene(sceneFromHash());
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  // the campus is the page; while you're inside a building nothing behind it scrolls
  useEffect(() => {
    document.documentElement.classList.toggle('in-scene', !!scene);
  }, [scene]);

  const toggleXp = useCallback((org: string, open: boolean) => {
    setOpenXp((s) => {
      const next = new Set(s);
      if (open) next.add(org);
      else next.delete(org);
      return next;
    });
  }, []);

  const openExperience = useCallback(
    (org: string) => {
      openScene('experience');
      setOpenXp((s) => new Set(s).add(org));
      setTimeout(() => document.getElementById('xp-' + slugify(org))?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' }), 700);
    },
    [openScene, reduced],
  );

  const openSlides = useCallback((list: Slide[], index: number) => setSlides({ slides: list, index }), []);
  const showToast = useCallback((msg: string) => setToast({ msg, id: Date.now() }), []);

  const modalOpen = !!slides || !!work || intro;
  useHotkeys({
    'mod+k': () => !modalOpen && setPaletteOpen((o) => !o),
    '/': () => !modalOpen && setPaletteOpen(true),
  });

  // Escape walks back out of a building (the case study and slide viewer handle their own)
  useEffect(() => {
    if (!scene) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || modalOpen || paletteOpen) return;
      goHome();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scene, modalOpen, paletteOpen, goHome]);

  const commands = useMemo(
    () =>
      buildCommands({
        theme,
        toggleTheme,
        openScene,
        goHome,
        openWork: setWork,
        openExperience,
        openSlides,
        toast: showToast,
        replayIntro: () => setIntro(true),
      }),
    [theme, toggleTheme, openScene, goHome, openExperience, openSlides, showToast],
  );

  return (
    <>
      <Hero focus={scene} onOpen={openScene} onReplay={() => setIntro(true)} reduced={reduced} />
      <Scene
        scene={scene}
        onClose={goHome}
        onSwitch={openScene}
        openXp={openXp}
        onToggleXp={toggleXp}
        onOpenWork={setWork}
        onOpenSlides={openSlides}
      />
      <CaseStudy slug={work} onClose={() => setWork(null)} onNavigate={setWork} onOpenSlides={openSlides} />
      <Lightbox state={slides} onChange={setSlides} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
      <IntroDialog open={intro} onDone={finishIntro} />
      {toast && <Toast key={toast.id} message={toast.msg} onDone={() => setToast(null)} />}
    </>
  );
}
