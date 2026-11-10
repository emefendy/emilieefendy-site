import { useEffect, useRef, useState } from 'react';
import { INTRO } from '../content';
import { useWindowEvent } from '../hooks/useWindowEvent';
import { cx } from '../lib/cx';
import { PixelMe, type Mood } from './PixelMe';
import { usePoke } from './usePoke';
import { useTypewriter } from './useTypewriter';

type Props = { open: boolean; onDone: () => void };

/** The game-style hello on a first visit: a few boxes of text, one per Next. */
export function IntroDialog({ open, onDone }: Props) {
  const [page, setPage] = useState(0);
  const next = useRef<HTMLButtonElement>(null);
  const text = INTRO[page] ?? '';
  const { shown, done, finish } = useTypewriter(open ? text : '');
  const last = page === INTRO.length - 1;
  const [poked, poke] = usePoke();

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

  useWindowEvent(
    'keydown',
    (e) => {
      if (e.key === 'Escape') onDone();
      else if (e.key === 'ArrowRight') advance();
      else return;
      e.preventDefault();
    },
    open,
  );

  // wave on the first and last boxes, talk while the text types out
  const mood: Mood = page === 0 || (last && done) ? 'wave' : done ? 'idle' : 'talk';

  return (
    <div className={cx('hello', open && 'on')} aria-hidden={!open} inert={open ? undefined : ''}>
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
        <div
          className={cx('hello-me', poked && 'poked')}
          onClick={(e) => {
            e.stopPropagation(); // a poke, not a click through to the next box
            poke();
          }}
        >
          <PixelMe mood={!open ? 'idle' : poked ? 'surprised' : mood} height={200} />
        </div>
        <p className="hello-name">Emilie</p>
        <div className="hello-say">
          <p className="hello-text">
            <span aria-hidden="true">{shown}</span>
            <span className="sr-only" aria-live="polite">
              {text}
            </span>
          </p>
          <button
            type="button"
            className={cx('bubble-ff', 'hello-ff', done && 'ready')}
            onClick={(e) => {
              e.stopPropagation();
              advance();
            }}
            aria-label={done ? (last ? 'Close' : 'Next box') : 'Skip to the end'}
          >
            »
          </button>
        </div>
        <div className="hello-foot">
          <span className="hello-dots" aria-label={`${page + 1} of ${INTRO.length}`}>
            {INTRO.map((_, i) => (
              <i key={i} className={i === page ? 'on' : undefined} />
            ))}
          </span>
          <button
            type="button"
            ref={next}
            className={cx('hello-next', done && 'ready')}
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
