import { useCallback, useEffect, useRef, useState } from 'react';
import { reducedMotion } from '../lib/motion';

/**
 * Types `text` out a character at a time, like a game's dialog box. Pauses a
 * little longer after punctuation so it reads like speech. `finish()` jumps
 * to the end (a click on the box does this before it moves on).
 */
export function useTypewriter(text: string, cps = 48) {
  const [n, setN] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timer.current);
    if (reducedMotion()) return setN(text.length);
    setN(0);
    let i = 0;
    const tick = () => {
      i++;
      setN(i);
      if (i >= text.length) return;
      const ch = text[i - 1];
      const pause = ch === '.' || ch === '!' || ch === '?' ? 260 : ch === ',' || ch === ':' ? 120 : 0;
      timer.current = setTimeout(tick, 1000 / cps + pause);
    };
    timer.current = setTimeout(tick, 180);
    return () => clearTimeout(timer.current);
  }, [text, cps]);

  // stop the clock too, or the next tick would take the text back
  const finish = useCallback(() => {
    clearTimeout(timer.current);
    setN(text.length);
  }, [text]);

  return { shown: text.slice(0, n), done: n >= text.length, finish };
}
