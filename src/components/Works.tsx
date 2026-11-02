import type { CSSProperties, KeyboardEvent } from 'react';
import { WORKS, type Media, type Slide, type Work } from '../content';
import { SectionHead } from './SectionHead';

type Props = {
  selected: string;
  onSelect: (slug: string) => void;
  onOpenSlides: (slides: Slide[], index: number) => void;
};

const NPO = <span className="npo">501(c)(3)</span>;

export function Works({ selected, onSelect, onOpenSlides }: Props) {
  // up/down walks the list like a listbox: move focus and open as you go
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const step = e.key === 'ArrowDown' ? 1 : -1;
    const next = WORKS[(i + step + WORKS.length) % WORKS.length]!;
    document.getElementById('b-' + next.slug)?.focus();
    onSelect(next.slug);
  };

  return (
    <section id="works" aria-labelledby="h-works">
      <SectionHead id="works" title="the works" />
      <div className="tl" style={{ '--n': WORKS.length } as CSSProperties}>
        {WORKS.map((w, i) => {
          const on = w.slug === selected;
          return [
            <button
              key={'b' + w.slug}
              className="tl-btn"
              id={'b-' + w.slug}
              aria-expanded={on}
              aria-controls={'p-' + w.slug}
              onClick={() => onSelect(w.slug)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span className="o">
                {w.title} {w.nonprofit && NPO}
              </span>
            </button>,
            <WorkPanel key={'p' + w.slug} work={w} hidden={!on} onOpenSlides={onOpenSlides} />,
          ];
        })}
      </div>
    </section>
  );
}

function WorkPanel({ work: w, hidden, onOpenSlides }: { work: Work; hidden: boolean; onOpenSlides: Props['onOpenSlides'] }) {
  return (
    <div className="tl-panel" id={'p-' + w.slug} role="region" aria-labelledby={'b-' + w.slug} hidden={hidden}>
      {w.logo && (
        <div className="logo-card">
          <img src={w.logo.src} alt={w.logo.alt} loading="lazy" />
        </div>
      )}
      <h3>
        {w.title} {w.nonprofit && NPO}
      </h3>
      {w.when && <p className="when">{w.when}</p>}
      {w.body.map((b, i) =>
        b.kind === 'p' ? (
          <p className="x" key={i}>
            {b.text}
          </p>
        ) : (
          <ul className="x-list" key={i}>
            {b.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        ),
      )}
      {w.media && <WorkMedia media={w.media} onOpenSlides={onOpenSlides} />}
      {w.links.length > 0 && (
        <p className="w-links">
          {w.links.map((l, i) => (
            <span key={l.href}>
              {i > 0 && '  '}
              <a href={l.href} target="_blank" rel="noopener">
                → {l.label}
              </a>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

function WorkMedia({ media, onOpenSlides }: { media: Media; onOpenSlides: Props['onOpenSlides'] }) {
  switch (media.kind) {
    case 'deck':
      return (
        <div className={'deck deck-' + media.layout}>
          <p className="deck-label">{media.label}</p>
          <div className="deck-strip">
            {media.slides.map((s, i) => (
              <button
                key={s.full}
                className="deck-thumb"
                type="button"
                aria-label={'Open ' + s.label}
                onClick={() => onOpenSlides(media.slides, i)}
              >
                <img src={s.thumb} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      );
    case 'preview':
      return (
        <a className="preview-card" href={media.href} target="_blank" rel="noopener">
          <img src={media.src} alt={media.alt} loading="lazy" width={media.width} height={media.height} />
          <span>
            <span>{media.host}</span>
            <span aria-hidden="true">↗</span>
          </span>
        </a>
      );
  }
}
