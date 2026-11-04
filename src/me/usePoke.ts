import { useCallback, useEffect, useRef, useState } from 'react';

/** Poke her: true for a moment, then back to whatever she was doing. */
export function usePoke(ms = 900) {
  const [poked, setPoked] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>();
  const poke = useCallback(() => {
    clearTimeout(t.current);
    setPoked(false);
    // a frame off first so a second poke restarts the hop
    requestAnimationFrame(() => {
      setPoked(true);
      t.current = setTimeout(() => setPoked(false), ms);
    });
  }, [ms]);
  useEffect(() => () => clearTimeout(t.current), []);
  return [poked, poke] as const;
}
