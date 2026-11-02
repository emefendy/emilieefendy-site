import { useEffect, useState } from 'react';
import { SECTIONS, type Section } from '../content';
import type { Theme } from '../hooks/useTheme';
import { MoonIcon, SearchIcon, SunIcon } from './Icons';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
export const MOD_KEY = isMac ? '⌘' : 'Ctrl';

function useActiveSection() {
  const [active, setActive] = useState<Section['id'] | null>(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) setActive(en.target.id as Section['id']);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return active;
}

function useScrolled(px: number) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > px);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [px]);
  return scrolled;
}

type Props = { theme: Theme; onToggleTheme: () => void; onOpenPalette: () => void };

export function Nav({ theme, onToggleTheme, onOpenPalette }: Props) {
  const active = useActiveSection();
  const scrolled = useScrolled(40);

  return (
    <nav className={'top' + (scrolled ? ' scrolled' : '')} aria-label="Sections">
      <a className="logo" href="#top">
        emilie efendy
      </a>
      <div className="top-r">
        <ul>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={'#' + s.id} className={active === s.id ? 'on' : undefined} aria-current={active === s.id ? 'true' : undefined}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <button type="button" className="kbd-btn" onClick={onOpenPalette} aria-label="Search the site" aria-keyshortcuts="Meta+K Control+K">
          <SearchIcon />
          <kbd>{MOD_KEY === '⌘' ? '⌘K' : 'Ctrl K'}</kbd>
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </nav>
  );
}
