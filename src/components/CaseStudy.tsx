import { useEffect, useRef, useState } from 'react';
import { WORKS, type Media, type Slide } from '../content';
import { lockScroll } from '../lib/smoothScroll';
import { SplitText } from './Reveal';

type Props = {
  slug: string | null;
  onClose: () => void;
  onNavigate: (slug: string) => void;
  onOpenSlides: (slides: Slide[], index: number) => void;
};

const LEAVE_MS = 380;

/**
 * Full-screen write-up for one project. It's a real <dialog>, so focus is
 * trapped and Escape works for free; the only custom part is holding the
 * last project on screen long enough to animate it out.
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
      if (!d.open) {
        d.showModal();
        lockScroll('case', true);
      }
      scroller.current?.scrollTo({ top: 0 });
      return;
    }
    if (!d.open) return;
    setLeaving(true);
    const id = setTimeout(() => {
      d.close();
      lockScroll('case', false);
      setLeaving(false);
      setShown(null);
    }, LEAVE_MS);
    return () => clearTimeout(id);
  }, [slug]);

  const i = WORKS.findIndex((w) => w.slug === shown);
  const w = WORKS[i];
  const next = WORKS[(i + 1) % WORKS.length]!;

  return (
    <dialog
      ref={ref}
      className={'cs' + (leaving ? ' leaving' : '')}
      aria-labelledby="cs-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {w && (
        <div className="cs-scroll" ref={scroller} data-lenis-prevent>
          <header className="cs-bar">
            <span className="cs-count">
              {String(i + 1).padStart(2, '0')} / {String(WORKS.length).padStart(2, '0')}
            </span>
            <button type="button" className="cs-close" onClick={onClose} data-cursor="close" autoFocus>
              close <kbd>esc</kbd>
            </button>
          </header>

          <article className="cs-body" key={w.slug}>
            <p className="cs-tags">{w.tags}</p>
            <SplitText as="h2" id="cs-title" text={w.title} className="cs-title" delay={120} />
            {w.nonprofit && <p className="cs-npo"><span className="npo">501(c)(3)</span></p>}
            {w.when && <p className="when">{w.when}</p>}

            <div className="cs-grid">
              <div className="cs-text">
                {w.body.map((b, k) =>
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
                {w.links.length > 0 && (
                  <p className="w-links">
                    {w.links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noopener">
                        → {l.label}
                      </a>
                    ))}
                  </p>
                )}
              </div>
              <aside className="cs-side">
                {w.logo && (
                  <div className="logo-card">
                    <img src={w.logo.src} alt={w.logo.alt} />
                  </div>
                )}
              </aside>
            </div>

            {w.media && <CaseMedia media={w.media} onOpenSlides={onOpenSlides} />}
          </article>

          <button type="button" className="cs-next" onClick={() => onNavigate(next.slug)} data-cursor="next">
            <span className="cs-next-l">next</span>
            <span className="cs-next-t">{next.title}</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </dialog>
  );
}

function CaseMedia({ media, onOpenSlides }: { media: Media; onOpenSlides: Props['onOpenSlides'] }) {
  if (media.kind === 'preview') {
    return (
      <a className="preview-card cs-preview" href={media.href} target="_blank" rel="noopener" data-cursor="visit">
        <img src={media.src} alt={media.alt} width={media.width} height={media.height} />
        <span>
          <span>{media.host}</span>
          <span aria-hidden="true">↗</span>
        </span>
      </a>
    );
  }
  return (
    <div className={'deck deck-' + media.layout}>
      <p className="deck-label">{media.label}</p>
      <div className="deck-strip" data-lenis-prevent>
        {media.slides.map((s, k) => (
          <button
            key={s.full}
            className="deck-thumb"
            type="button"
            aria-label={'Open ' + s.label}
            data-cursor="view"
            onClick={() => onOpenSlides(media.slides, k)}
          >
            <img src={s.thumb} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
