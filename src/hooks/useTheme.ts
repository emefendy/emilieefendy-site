import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';
export type Theme = Exclude<ThemeChoice, 'system'>;

const KEY = 'theme';
const dark = () => window.matchMedia('(prefers-color-scheme: dark)');

function subscribe(onChange: () => void) {
  const mq = dark();
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function readSaved(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(readSaved);
  const systemDark = useSyncExternalStore(subscribe, () => dark().matches, () => false);
  const resolved: Theme = choice === 'system' ? (systemDark ? 'dark' : 'light') : choice;

  useEffect(() => {
    const root = document.documentElement;
    if (choice === 'system') delete root.dataset.theme;
    else root.dataset.theme = choice;
    try {
      if (choice === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, choice);
    } catch {
      /* private mode, etc. – the theme just won't persist */
    }
  }, [choice]);

  // Flipping to the same thing the OS already prefers drops back to "system",
  // so the site keeps following the OS from then on.
  const toggle = useCallback(() => {
    const next: Theme = resolved === 'dark' ? 'light' : 'dark';
    setChoice(next === (systemDark ? 'dark' : 'light') ? 'system' : next);
  }, [resolved, systemDark]);

  return { choice, resolved, setChoice, toggle };
}
