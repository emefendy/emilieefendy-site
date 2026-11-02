import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

function useInView<T extends Element>(margin = '0px 0px -12% 0px') {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin, seen]);
  return [ref, seen] as const;
}

type SplitProps = {
  as?: 'h1' | 'h2' | 'p' | 'span';
  text: string;
  by?: 'word' | 'char';
  className?: string;
  id?: string;
  /** ms before the first piece moves */
  delay?: number;
  /** ms between pieces */
  stagger?: number;
};

/**
 * Text that rises into place piece by piece when it scrolls into view. Screen
 * readers get the plain string from aria-label; the pieces are hidden from them.
 */
export function SplitText({ as = 'span', text, by = 'word', className, id, delay = 0, stagger = by === 'char' ? 28 : 55 }: SplitProps) {
  const [ref, seen] = useInView<HTMLElement>();
  const pieces = by === 'char' ? [...text] : text.split(/(\s+)/);
  let n = 0;
  return createElement(
    as,
    { ref, id, className: ['split', seen && 'in', className].filter(Boolean).join(' '), 'aria-label': text },
    pieces.map((p, i) =>
      /^\s+$/.test(p) ? (
        ' '
      ) : (
        <span className="split-m" key={i} aria-hidden="true">
          <span className="split-p" style={{ '--d': `${delay + n++ * stagger}ms` } as CSSProperties}>
            {p === ' ' ? ' ' : p}
          </span>
        </span>
      ),
    ),
  );
}

/** Fades and lifts its children in once, the first time they're on screen. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={['reveal', seen && 'in', className].filter(Boolean).join(' ')} style={{ '--d': `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}
