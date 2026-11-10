import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { EMAIL } from '../content';
import { highlight } from '../lib/fuzzy';
import { read, write } from '../lib/storage';
import { search } from './search';
import type { Command, Result } from './types';

const RECENT_KEY = 'palette:recent';
const MAX_RECENT = 3;

function loadRecent(): string[] {
  try {
    const saved: unknown = JSON.parse(read(RECENT_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function saveRecent(id: string) {
  const next = [id, ...loadRecent().filter((x) => x !== id)].slice(0, MAX_RECENT);
  write(RECENT_KEY, JSON.stringify(next));
}

type Props = { open: boolean; onClose: () => void; commands: readonly Command[] };

export function CommandPalette({ open, onClose, commands }: Props) {
  if (!open) return null;
  return createPortal(<Palette onClose={onClose} commands={commands} />, document.body);
}

function Palette({ onClose, commands }: Omit<Props, 'open'>) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [recent] = useState(loadRecent);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const listId = `${uid}-list`;
  const optionId = useCallback((i: number) => `${uid}-opt-${i}`, [uid]);

  const results = useMemo<Result[]>(() => {
    const found = search(commands, query, recent);
    if (found.length > 0 || !query.trim()) return found;
    // no match: offer to email the question instead
    const q = query.trim();
    const ask: Command = {
      id: 'ask',
      title: `Ask Emilie about “${q}”`,
      group: 'Actions',
      hint: 'opens your email',
      run: () => {
        location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(q)}`;
      },
    };
    return [{ command: ask, indices: [], group: 'Actions' }];
  }, [commands, query, recent]);

  const nothing = query.trim() !== '' && results[0]?.command.id === 'ask';

  // Focus the input on open, hand focus back to whatever had it on close,
  // and stop the page behind from scrolling.
  useLayoutEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const html = document.documentElement;
    const gutter = window.innerWidth - html.clientWidth;
    const { overflow, paddingRight } = html.style;
    html.style.overflow = 'hidden';
    if (gutter > 0) html.style.paddingRight = `${gutter}px`;
    inputRef.current?.focus();
    return () => {
      html.style.overflow = overflow;
      html.style.paddingRight = paddingRight;
      previous?.focus({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`#${CSS.escape(optionId(active))}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active, optionId]);

  const run = (r: Result | undefined) => {
    if (!r) return;
    if (r.command.id !== 'ask') saveRecent(r.command.id);
    onClose();
    // let the palette unmount and focus settle before scrolling anywhere
    requestAnimationFrame(() => r.command.run());
  };

  const move = (by: number) => {
    if (results.length === 0) return;
    setActive((a) => (a + by + results.length) % results.length);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const ctrl = e.ctrlKey && !e.metaKey && !e.altKey;
    if (e.key === 'ArrowDown' || (ctrl && e.key === 'n')) move(1);
    else if (e.key === 'ArrowUp' || (ctrl && e.key === 'p')) move(-1);
    else if (e.key === 'PageDown') move(5);
    else if (e.key === 'PageUp') move(-5);
    else if (e.key === 'Enter' && !e.nativeEvent.isComposing) run(results[active]);
    else if (e.key === 'Escape') {
      // the first Escape clears the query, the second closes
      if (query) {
        setQuery('');
        setActive(0);
      } else onClose();
    } else if (e.key !== 'Tab') {
      return; // Tab is swallowed: the input is the only focusable thing in here
    }
    e.preventDefault();
  };

  const searching = query.trim() !== '';

  return (
    <div className="pal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pal" role="dialog" aria-modal="true" aria-label="Search the site">
        <div className="pal-in">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search projects, jump to a section, or try “react”…"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results.length ? optionId(active) : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <kbd className="pal-esc" onClick={onClose}>
            esc
          </kbd>
        </div>

        <div className="pal-list" id={listId} role="listbox" ref={listRef} aria-label="Results">
          {nothing && <p className="pal-empty">Nothing on the site matches that.</p>}
          {results.map((r, i) => {
            const header = !searching && (i === 0 || results[i - 1]!.group !== r.group);
            return (
              <div key={r.group + r.command.id} role="presentation">
                {header && (
                  <p className="pal-group" role="presentation">
                    {r.group}
                  </p>
                )}
                <div
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  className="pal-opt"
                  onMouseMove={() => i !== active && setActive(i)}
                  onClick={() => run(r)}
                >
                  <span className="pal-t">
                    {highlight(r.command.title, r.indices).map((part, k) =>
                      part.hit ? <mark key={k}>{part.text}</mark> : part.text,
                    )}
                    {r.command.external && <span aria-hidden="true"> ↗</span>}
                  </span>
                  {r.command.hint && <span className="pal-h">{r.command.hint}</span>}
                  {searching && <span className="pal-tag">{r.group}</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pal-foot" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>esc</kbd> {query ? 'clear' : 'close'}
          </span>
        </div>
        <p className="sr-only" aria-live="polite">
          {searching ? (nothing ? 'No results' : `${results.length} result${results.length === 1 ? '' : 's'}`) : ''}
        </p>
      </div>
    </div>
  );
}
