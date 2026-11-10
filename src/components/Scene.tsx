import { useEffect, useRef } from 'react';
import { SCENES, type SceneId, type Slide } from '../content';
import { cx } from '../lib/cx';
import { ordinal } from '../lib/format';
import { Awards } from './sections/Awards';
import { Education } from './sections/Education';
import { Internships } from './sections/Internships';
import { Projects } from './sections/Projects';

type Props = {
  scene: SceneId | null;
  onClose: () => void;
  onSwitch: (scene: SceneId) => void;
  openInternships: ReadonlySet<string>;
  onToggleInternship: (org: string, open: boolean) => void;
  onOpenProject: (slug: string) => void;
  onOpenSlides: (slides: Slide[], index: number) => void;
};

/** matches the campus zoom transition in styles.css */
const ZOOM_MS = 650;

export function Scene({
  scene,
  onClose,
  onSwitch,
  openInternships,
  onToggleInternship,
  onOpenProject,
  onOpenSlides,
}: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const index = SCENES.findIndex((s) => s.id === scene);
  const current = SCENES[index];

  useEffect(() => {
    if (!scene) return;
    panel.current?.scrollTo({ top: 0 });
    const id = setTimeout(() => back.current?.focus({ preventScroll: true }), ZOOM_MS);
    return () => clearTimeout(id);
  }, [scene]);

  return (
    <div className={cx('scene', scene && 'on')} aria-hidden={!scene} inert={scene ? undefined : ''}>
      <div className="scene-shade" onClick={onClose} />
      <div className="scene-panel" ref={panel} role="dialog" aria-modal="false" aria-labelledby="scene-title">
        {current && (
          <div className="scene-in" key={current.id}>
            <div className="scene-top">
              <button type="button" className="scene-back" ref={back} onClick={onClose}>
                <span aria-hidden="true">←</span> Back to campus
              </button>
            </div>
            <p className="scene-n">{ordinal(index)}</p>
            <h2 className="scene-title" id="scene-title">
              {current.label}
            </h2>

            {current.id === 'education' && <Education />}
            {current.id === 'internships' && (
              <Internships open={openInternships} onToggle={onToggleInternship} onOpenSlides={onOpenSlides} />
            )}
            {current.id === 'projects' && <Projects onOpen={onOpenProject} />}
            {current.id === 'awards' && <Awards />}

            <nav className="scene-next" aria-label="Other buildings">
              {SCENES.filter((s) => s.id !== current.id).map((s) => (
                <button key={s.id} type="button" onClick={() => onSwitch(s.id)}>
                  {s.label} <span aria-hidden="true">→</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
