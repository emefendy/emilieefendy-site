import Lenis from 'lenis';

let lenis: Lenis | null = null;

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Wheel smoothing. Skipped entirely for reduced motion and for touch, which is already smooth. */
export function startSmoothScroll() {
  if (lenis || reducedMotion() || window.matchMedia('(pointer: coarse)').matches) return () => {};
  lenis = new Lenis({ autoRaf: true, anchors: { offset: -64 }, lerp: 0.11 });
  return () => {
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToEl(el: Element, offset = -88) {
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset, duration: 1.2 });
  else {
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }
}

// Modals stack (slides open from inside a case study), so keep track of who
// asked for the lock and only let go once nobody holds it.
const holders = new Set<string>();

/** Freeze the page behind a modal. */
export function lockScroll(who: string, locked: boolean) {
  if (locked) holders.add(who);
  else holders.delete(who);
  if (holders.size) lenis?.stop();
  else lenis?.start();
}
