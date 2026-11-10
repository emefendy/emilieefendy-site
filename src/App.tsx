import { useCallback, useEffect, useMemo, useState } from 'react';
import { CaseStudy } from './components/CaseStudy';
import { Hero } from './components/Hero';
import { Lightbox, type LightboxState } from './components/Lightbox';
import { Scene } from './components/Scene';
import { internshipId } from './components/sections/Internships';
import { Toast } from './components/Toast';
import type { Slide } from './content';
import { useHotkeys } from './hooks/useHotkeys';
import { useSceneRoute } from './hooks/useSceneRoute';
import { useTheme } from './hooks/useTheme';
import { useWindowEvent } from './hooks/useWindowEvent';
import { reducedMotion } from './lib/motion';
import { read, write } from './lib/storage';
import { IntroDialog } from './me/IntroDialog';
import { buildCommands } from './palette/commands';
import { CommandPalette } from './palette/CommandPalette';

const MET_KEY = 'met';
/** long enough for the zoom to land before scrolling inside the panel */
const SCROLL_AFTER_ZOOM_MS = 700;

export function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { scene, openScene, goHome } = useSceneRoute();
  const [reduced] = useState(reducedMotion);
  const [project, setProject] = useState<string | null>(null);
  const [openInternships, setOpenInternships] = useState<ReadonlySet<string>>(() => new Set());
  const [slides, setSlides] = useState<LightboxState>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);
  // first visit only, and not for someone arriving on a deep link
  const [intro, setIntro] = useState(() => read(MET_KEY) !== '1' && !scene);

  const finishIntro = useCallback(() => {
    setIntro(false);
    write(MET_KEY, '1');
  }, []);

  // the page behind a building doesn't scroll
  useEffect(() => {
    document.documentElement.classList.toggle('in-scene', !!scene);
  }, [scene]);

  const toggleInternship = useCallback((org: string, open: boolean) => {
    setOpenInternships((current) => {
      const next = new Set(current);
      if (open) next.add(org);
      else next.delete(org);
      return next;
    });
  }, []);

  const showInternship = useCallback(
    (org: string) => {
      openScene('internships');
      setOpenInternships((current) => new Set(current).add(org));
      setTimeout(() => {
        document
          .getElementById(internshipId(org))
          ?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
      }, SCROLL_AFTER_ZOOM_MS);
    },
    [openScene, reduced],
  );

  const openSlides = useCallback((list: Slide[], index: number) => setSlides({ slides: list, index }), []);
  const showToast = useCallback((message: string) => setToast({ message, id: Date.now() }), []);
  const hideToast = useCallback(() => setToast(null), []);

  const modalOpen = !!slides || !!project || intro;
  useHotkeys({
    'mod+k': () => !modalOpen && setPaletteOpen((open) => !open),
    '/': () => !modalOpen && setPaletteOpen(true),
  });

  // Escape walks out of a building; dialogs on top handle their own Escape first
  useWindowEvent(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && !e.defaultPrevented && !modalOpen && !paletteOpen) goHome();
    },
    !!scene,
  );

  const commands = useMemo(
    () =>
      buildCommands({
        theme,
        toggleTheme,
        openScene,
        goHome,
        openProject: setProject,
        showInternship,
        openSlides,
        toast: showToast,
        replayIntro: () => setIntro(true),
      }),
    [theme, toggleTheme, openScene, goHome, showInternship, openSlides, showToast],
  );

  return (
    <>
      <Hero focus={scene} onOpen={openScene} reduced={reduced} />
      <Scene
        scene={scene}
        onClose={goHome}
        onSwitch={openScene}
        openInternships={openInternships}
        onToggleInternship={toggleInternship}
        onOpenProject={setProject}
        onOpenSlides={openSlides}
      />
      <CaseStudy slug={project} onClose={() => setProject(null)} onNavigate={setProject} onOpenSlides={openSlides} />
      <Lightbox state={slides} onChange={setSlides} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
      <IntroDialog open={intro} onDone={finishIntro} />
      {toast && <Toast key={toast.id} message={toast.message} onDone={hideToast} />}
    </>
  );
}
