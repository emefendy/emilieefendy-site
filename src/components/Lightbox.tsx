import { useEffect, useRef } from 'react';
import type { Slide } from '../content';

export type LightboxState = { slides: Slide[]; index: number } | null;

type Props = { state: LightboxState; onChange: (s: LightboxState) => void };

export function Lightbox({ state, onChange }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (state && !d.open) d.showModal();
    if (!state && d.open) d.close();
  }, [state]);

  // warm the cache for the neighbours so prev/next feel instant
  useEffect(() => {
    if (!state) return;
    const n = state.slides.length;
    for (const k of [1, -1]) {
      const s = state.slides[(state.index + k + n) % n];
      if (s) new Image().src = s.full;
    }
  }, [state]);

  const step = (k: number) => {
    if (!state) return;
    const n = state.slides.length;
    onChange({ ...state, index: (state.index + k + n) % n });
  };
  const slide = state?.slides[state.index];

  return (
    <dialog
      className="lb"
      ref={ref}
      aria-label="Slide viewer"
      onClose={() => onChange(null)}
      onClick={(e) => e.target === e.currentTarget && onChange(null)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          step(1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          step(-1);
        }
      }}
    >
      {slide && (
        <figure>
          <img src={slide.full} alt={slide.label} />
          <figcaption>{slide.caption}</figcaption>
          <div className="lb-bar">
            <button type="button" onClick={() => step(-1)}>
              ← prev
            </button>
            <button type="button" onClick={() => onChange(null)}>
              close
            </button>
            <button type="button" onClick={() => step(1)}>
              next →
            </button>
          </div>
        </figure>
      )}
    </dialog>
  );
}
