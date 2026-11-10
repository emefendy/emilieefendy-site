import type { Slide } from './types';

/** Slides saved as decks/<dir>/01.jpg with thumbnails at decks/<dir>/t01.jpg. */
export function deck(dir: string, n: number, caption: (i: number) => string, label: (i: number) => string): Slide[] {
  return Array.from({ length: n }, (_, k) => {
    const i = k + 1;
    const nn = String(i).padStart(2, '0');
    return { full: `decks/${dir}/${nn}.jpg`, thumb: `decks/${dir}/t${nn}.jpg`, caption: caption(i), label: label(i) };
  });
}
