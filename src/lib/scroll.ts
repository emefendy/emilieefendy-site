const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Scroll something into view and give it a brief glow so the eye can find it. */
export function reveal(el: Element | null, { flash = true, scrollTo = el }: { flash?: boolean; scrollTo?: Element | null } = {}) {
  if (!el) return;
  (scrollTo ?? el).scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  if (!flash) return;
  el.classList.remove('flash');
  // restart the animation if it's already running
  void (el as HTMLElement).offsetWidth;
  el.classList.add('flash');
  el.addEventListener('animationend', () => el.classList.remove('flash'), { once: true });
}
