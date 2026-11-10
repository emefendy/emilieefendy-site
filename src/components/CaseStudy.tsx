import { useEffect, useRef, useState } from 'react';
import { PROJECTS, type Media, type Slide } from '../content';
import { cx } from '../lib/cx';
import { ordinal } from '../lib/format';
import { SlideStrip } from './SlideStrip';
import { SplitText } from './SplitText';

type Props = {
  slug: string | null;
  onClose: () => void;
  onNavigate: (slug: string) => void;
  onOpenSlides: (slides: Slide[], index: number) => void;
};

const LEAVE_MS = 380;

/**
 * A project write-up in a native <dialog> (focus trapping and Escape for
 * free). On close it keeps the last project mounted until the exit animation ends.
 */
export function CaseStudy({ slug, onClose, onNavigate, onOpenSlides }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<string | null>(slug);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (slug) {
      setShown(slug);
      setLeaving(false);
      if (!d.open) d.showModal();
      scroller.current?.scrollTo({ top: 0 });
      return;
    }
    if (!d.open) return;
    setLeaving(true);
    const id = setTimeout(() => {
      d.close();
      setLeaving(false);
      setShown(null);
    }, LEAVE_MS);
    return () => clearTimeout(id);
  }, [slug]);

  const i = PROJECTS.findIndex((p) => p.slug === shown);
  const project = PROJECTS[i];
  const next = PROJECTS[(i + 1) % PROJECTS.length]!;
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length]!;

  return (
    <dialog
      ref={ref}
      className={cx('cs', leaving && 'leaving')}
      aria-labelledby="cs-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {project && (
        <div className="cs-scroll" ref={scroller}>
          <header className="cs-bar">
            <span className="cs-count">
              {ordinal(i)} / {String(PROJECTS.length).padStart(2, '0')}
            </span>
            <button type="button" className="cs-close" onClick={onClose}>
              close <kbd>esc</kbd>
            </button>
          </header>

          <article className="cs-body" key={project.slug}>
            <p className="cs-tags">{project.tags}</p>
            <SplitText as="h2" id="cs-title" text={project.title} className="cs-title" delay={120} />
            {project.nonprofit && (
              <p className="cs-npo">
                <span className="npo">501(c)(3)</span>
              </p>
            )}
            {project.when && <p className="when">{project.when}</p>}

            <div className="cs-grid">
              <div className="cs-text">
                {project.body.map((b, k) =>
                  b.kind === 'p' ? (
                    <p className="x" key={k}>
                      {b.text}
                    </p>
                  ) : (
                    <ul className="x-list" key={k}>
                      {b.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  ),
                )}
                {project.links.length > 0 && (
                  <p className="w-links">
                    {project.links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noopener">
                        → {l.label}
                      </a>
                    ))}
                  </p>
                )}
              </div>
              <aside className="cs-side">
                {project.logo && (
                  <div className="logo-card">
                    <img src={project.logo.src} alt={project.logo.alt} />
                  </div>
                )}
              </aside>
            </div>

            {project.media && <CaseMedia media={project.media} onOpenSlides={onOpenSlides} />}
          </article>

          <nav className="cs-pn" aria-label="Other projects">
            <button type="button" className="cs-next cs-prev" onClick={() => onNavigate(prev.slug)}>
              <span aria-hidden="true">←</span>
              <span className="cs-next-l">previous</span>
              <span className="cs-next-t">{prev.title}</span>
            </button>
            <button type="button" className="cs-next" onClick={() => onNavigate(next.slug)}>
              <span className="cs-next-l">next</span>
              <span className="cs-next-t">{next.title}</span>
              <span aria-hidden="true">→</span>
            </button>
          </nav>
        </div>
      )}
    </dialog>
  );
}

function CaseMedia({ media, onOpenSlides }: { media: Media; onOpenSlides: Props['onOpenSlides'] }) {
  if (media.kind === 'preview') {
    return (
      <a className="preview-card cs-preview" href={media.href} target="_blank" rel="noopener">
        <img src={media.src} alt={media.alt} width={media.width} height={media.height} />
        <span>
          <span>{media.host}</span>
          <span aria-hidden="true">↗</span>
        </span>
      </a>
    );
  }
  return <SlideStrip deck={media} layout={media.layout} onOpen={onOpenSlides} />;
}
