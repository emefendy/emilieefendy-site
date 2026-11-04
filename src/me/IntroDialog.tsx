import { useEffect, useRef, useState } from 'react';
import { INTRO } from '../content';
import { PixelMe, type Mood } from './PixelMe';
import { useTypewriter } from './useTypewriter';

type Props = { open: boolean; onDone: () => void };

/**
 * The game-style hello on a first visit: pixel me in the middle of a dialog
 * box, waving, then talking through a few boxes of text with Next ▸.
 */
export function IntroDialog({ open, onDone }: Props) {
  const [page, setPage] = useState(0);
  const next = useRef<HTMLButtonElement>(null);
  const text = INTRO[page] ?? '';
  const { shown, done, finish } = useTypewriter(open ? text : '');
  const last = page === INTRO.length - 1;

  useEffect(() => {
    if (open) setPage(0);
  }, [open]);

  useEffect(() => {
    if (open) next.current?.focus({ preventScroll: true });
  }, [open, page]);

  const advance = () => {
    if (!done) return finish();
    if (last) return onDone();
    setPage((p) => p + 1);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onDone();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // wave hello on the first and last boxes, talk while the words come out, then rest
  const mood: Mood = page === 0 || (last && done) ? 'wave' : done ? 'idle' : 'talk';

  return (
    <div className={'hello' + (open ? ' on' : '')} aria-hidden={!open} {...(!open ? { inert: '' } : {})}>
      <div className="hello-shade" />
      <div className="hello-box" role="dialog" aria-modal="true" aria-label="Hello from Emilie" onClick={advance}>
        <button
          type="button"
          className="hello-skip"
          onClick={(e) => {
            e.stopPropagation();
            onDone();
          }}
        >
          Skip
        </button>
        <div className="hello-me">
          <PixelMe mood={open ? mood : 'idle'} height={200} />
        </div>
        <p className="hello-name">Emilie</p>
        <p className="hello-text">
          <span aria-hidden="true">{shown}</span>
          <span className="sr-only" aria-live="polite">
            {text}
          </span>
        </p>
        <div className="hello-foot">
          <span className="hello-dots" aria-label={`${page + 1} of ${INTRO.length}`}>
            {INTRO.map((_, i) => (
              <i key={i} className={i === page ? 'on' : undefined} />
            ))}
          </span>
          <button
            type="button"
            ref={next}
            className={'hello-next' + (done ? ' ready' : '')}
            onClick={(e) => {
              e.stopPropagation();
              advance();
            }}
          >
            {last ? 'Let’s go' : 'Next'} <span aria-hidden="true">▸</span>
          </button>
        </div>
      </div>
    </div>
  );
}
