import { useEffect, useRef, type ReactNode } from 'react';
import {
  EXPERIENCE,
  HARVARD_COURSES,
  HS_COURSES,
  ORGS,
  PROGRAMS,
  RECOGNITION,
  SCENES,
  type SceneId,
} from '../content';
import { slugify } from '../lib/slug';
import { Works } from './Works';

type Props = {
  scene: SceneId | null;
  onClose: () => void;
  onSwitch: (scene: SceneId) => void;
  openXp: ReadonlySet<string>;
  onToggleXp: (org: string, open: boolean) => void;
  onOpenWork: (slug: string) => void;
};

/**
 * The panel that slides in once the camera has zoomed into a building. The
 * campus stays alive behind it; this is just the words.
 */
export function Scene({ scene, onClose, onSwitch, openXp, onToggleXp, onOpenWork }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const i = SCENES.findIndex((s) => s.id === scene);
  const s = SCENES[i];

  // move focus in once the zoom has landed, and start each scene at its top
  useEffect(() => {
    if (!scene) return;
    panel.current?.scrollTo({ top: 0 });
    const id = setTimeout(() => back.current?.focus({ preventScroll: true }), 650);
    return () => clearTimeout(id);
  }, [scene]);

  return (
    <div className={'scene' + (scene ? ' on' : '')} aria-hidden={!scene} {...(!scene ? { inert: '' } : {})}>
      <div className="scene-shade" onClick={onClose} />
      <div className="scene-panel" ref={panel} role="dialog" aria-modal="false" aria-labelledby="scene-title">
        {s && (
          <div className="scene-in" key={s.id}>
            <div className="scene-top">
              <button type="button" className="scene-back" ref={back} onClick={onClose}>
                <span aria-hidden="true">←</span> Back to campus
              </button>
            </div>
            <p className="scene-n">{String(i + 1).padStart(2, '0')}</p>
            <h2 className="scene-title" id="scene-title">
              {s.title}
            </h2>
            {s.id === 'education' && <Education />}
            {s.id === 'experience' && <Experience open={openXp} onToggle={onToggleXp} />}
            {s.id === 'projects' && <Works onOpen={onOpenWork} />}
            {s.id === 'extras' && <Extras />}
            <nav className="scene-next" aria-label="Other buildings">
              {SCENES.filter((x) => x.id !== s.id).map((x) => (
                <button key={x.id} type="button" onClick={() => onSwitch(x.id)}>
                  {x.label} <span aria-hidden="true">→</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="col-label">{children}</p>;
}

function Education() {
  return (
    <>
      <div className="edu">
        <div className="edu-row">
          <div>
            <p className="edu-school edu-main">Harvard University</p>
            <p className="edu-deg">A.B. in Computer Science &amp; Physics, concurrent S.M. in Computer Science</p>
            <p className="edu-note">Cambridge, MA</p>
            <div className="edu-cols">
              <div>
                <Label>Coursework</Label>
                <ul>
                  {HARVARD_COURSES.map((c) => (
                    <li key={c}>
                      <span className="e-t">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Label>Organizations</Label>
                <ul>
                  {ORGS.map((o) => (
                    <li key={o.name}>
                      <span className="e-t">{o.name}</span>
                      {o.role && <span className="e-s">{o.role}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="edu-row">
          <div>
            <p className="edu-school">William P. Clements High School</p>
            <p className="edu-deg">Salutatorian · 2/676 · 17 APs</p>
            <p className="edu-note">Sugar Land, TX</p>
            <p className="edu-link">
              <a href="https://chsroundup.com/21825/features/driven-by-wonder/" target="_blank" rel="noopener">
                → Emilie Efendy: Driven by Wonder
              </a>
            </p>
            <p className="edu-note">Featured in The RoundUp. Awarded Best of SNO (top 10% of student journalism submissions nationwide).</p>
            <div className="edu-courses">
              <Label>Coursework</Label>
              <ul>
                {HS_COURSES.map((c) => (
                  <li key={c}>
                    <span className="e-t">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Experience({ open, onToggle }: { open: ReadonlySet<string>; onToggle: (org: string, open: boolean) => void }) {
  return (
    <ul className="link-list">
      {EXPERIENCE.map((x) => (
        <li key={x.org}>
          <details
            id={'xp-' + slugify(x.org)}
            open={open.has(x.org)}
            onToggle={(e) => {
              const now = e.currentTarget.open;
              if (now !== open.has(x.org)) onToggle(x.org, now);
            }}
          >
            <summary>
              <span className="t">{x.org}</span>
            </summary>
            <div className="w-body">
              <p className="x-role">{x.role}</p>
              <p className="w-meta">{x.meta}</p>
              {x.desc.map((d, k) => (
                <p className="w-desc" key={k}>
                  {d}
                </p>
              ))}
              <p className="stack">{x.stack.join(' · ')}</p>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

function Extras() {
  return (
    <div className="extras">
      <div>
        <Label>Recognition</Label>
        <ul>
          {RECOGNITION.map((r) => (
            <li key={r.title}>
              <span className="e-t">{r.title}</span>
              <span className="e-s">{r.sub}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <Label>Programs</Label>
        <ul>
          {PROGRAMS.map((p) => (
            <li key={p}>
              <span className="e-t">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
