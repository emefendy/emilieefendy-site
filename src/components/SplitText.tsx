import { createElement, type CSSProperties } from 'react';
import { useInView } from '../hooks/useInView';
import { cx } from '../lib/cx';

type SplitProps = {
  as?: 'h1' | 'h2' | 'p' | 'span';
  text: string;
  className?: string;
  id?: string;
  /** ms before the first word moves */
  delay?: number;
  /** ms between words */
  stagger?: number;
};

/** Text that rises into place word by word once it's on screen. */
export function SplitText({ as = 'span', text, className, id, delay = 0, stagger = 55 }: SplitProps) {
  const [ref, seen] = useInView<HTMLElement>();
  const pieces = text.split(/(\s+)/);
  let order = 0;
  const children = pieces.map((piece, i) => {
    if (/^\s+$/.test(piece)) return ' ';
    const style = { '--d': `${delay + order++ * stagger}ms` } as CSSProperties;
    return (
      <span className="split-m" key={i} aria-hidden="true">
        <span className="split-p" style={style}>
          {piece}
        </span>
      </span>
    );
  });
  return createElement(as, { ref, id, className: cx('split', seen && 'in', className), 'aria-label': text }, children);
}
