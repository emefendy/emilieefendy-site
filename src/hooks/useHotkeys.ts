import { useEffect, useRef } from 'react';

type Combo = 'mod+k' | '/';

const typingIn = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/**
 * Tiny global shortcut handler. "mod" is ⌘ on a Mac and Ctrl everywhere else.
 * Plain keys like "/" are ignored while you're typing in a field.
 */
export function useHotkeys(map: Partial<Record<Combo, () => void>>) {
  // read the latest handlers without re-binding the listener every render
  const ref = useRef(map);
  ref.current = map;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return;
      const mod = e.metaKey || e.ctrlKey;
      let combo: Combo | null = null;
      if (mod && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') combo = 'mod+k';
      else if (!mod && !e.altKey && e.key === '/' && !typingIn(e.target)) combo = '/';
      const fn = combo && ref.current[combo];
      if (!fn) return;
      e.preventDefault();
      fn();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
