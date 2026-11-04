import { useState, type KeyboardEvent } from 'react';
import { WORKS, type Work } from '../content';

type Props = { onOpen: (slug: string) => void };

const pad = (i: number) => String(i + 1).padStart(2, '0');

export function Works({ onOpen }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + WORKS.length) % WORKS.length;
    document.getElementById('b-' + WORKS[next]!.slug)?.focus();
  };

  return (
    <>
      <ol className={'wk' + (hover !== null ? ' hovering' : '')} onMouseLeave={() => setHover(null)}>
        {WORKS.map((w, i) => (
          <li key={w.slug} className={hover === i ? 'on' : undefined}>
            <button
              type="button"
              id={'b-' + w.slug}
              className="wk-row"
              data-cursor="open"
              onClick={() => onOpen(w.slug)}
              onMouseEnter={() => setHover(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span className="wk-n">{pad(i)}</span>
              <Badge work={w} />
              <span className="wk-t">
                {w.title}
                {w.nonprofit && <span className="npo">501(c)(3)</span>}
              </span>
              <span className="wk-tags">{w.tags}</span>
              <span className="wk-go" aria-hidden="true">
                →
              </span>
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}

// square marks for the list: cropped from the wide wordmarks, or each site's own icon
const SQUARE: Record<string, string> = {
  'chw-central': 'logos/badge/chw-central.png',
  'computers-4-people': 'logos/badge/computers-4-people.png',
  'first-racquet': 'logos/first-racquet.png',
  breakthrough: 'logos/breakthrough.png',
  evergreen: 'logos/evergreen.png',
  wecode: 'logos/wecode.png',
};

/** A uniform square before each title: the logo, or a monogram for anything without one. */
function Badge({ work: w }: { work: Work }) {
  const src = SQUARE[w.slug] ?? w.logo?.src;
  if (src) {
    return (
      <span className="wk-badge">
        <img src={src} alt="" loading="lazy" />
      </span>
    );
  }
  const initials = w.title
    .replace(/[^A-Za-z0-9 ]/g, '')
    .split(' ')
    .filter((x) => /^[A-Z0-9]/.test(x))
    .slice(0, 2)
    .map((x) => x[0])
    .join('');
  return (
    <span className="wk-badge wk-badge-mono" aria-hidden="true">
      {initials}
    </span>
  );
}
