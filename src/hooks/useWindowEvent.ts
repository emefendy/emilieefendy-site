import { useEffect } from 'react';
import { useLatest } from './useLatest';

export function useWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  handler: (e: WindowEventMap[K]) => void,
  enabled = true,
) {
  const latest = useLatest(handler);
  useEffect(() => {
    if (!enabled) return;
    const listener = (e: WindowEventMap[K]) => latest.current(e);
    window.addEventListener(type, listener);
    return () => window.removeEventListener(type, listener);
  }, [type, enabled, latest]);
}
