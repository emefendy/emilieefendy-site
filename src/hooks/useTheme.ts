import { useCallback, useEffect, useState } from 'react';
import { read, write } from '../lib/storage';

export type Theme = 'light' | 'dark';

const KEY = 'theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (read(KEY) === 'light' ? 'light' : 'dark'));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    write(KEY, theme === 'light' ? 'light' : null);
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggle };
}
