import { useWindowEvent } from './useWindowEvent';

type Combo = 'mod+k' | '/';

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

function comboOf(e: KeyboardEvent): Combo | null {
  const mod = e.metaKey || e.ctrlKey;
  if (e.altKey) return null;
  if (mod && !e.shiftKey && e.key.toLowerCase() === 'k') return 'mod+k';
  if (!mod && e.key === '/' && !isTyping(e.target)) return '/';
  return null;
}

/** "mod" is ⌘ on a Mac and Ctrl elsewhere. */
export function useHotkeys(bindings: Partial<Record<Combo, () => void>>) {
  useWindowEvent('keydown', (e) => {
    if (e.defaultPrevented || e.isComposing) return;
    const combo = comboOf(e);
    const run = combo && bindings[combo];
    if (!run) return;
    e.preventDefault();
    run();
  });
}
