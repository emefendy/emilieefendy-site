import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { WORKS } from '../content';

type Props = { onOpen: (slug: string) => void };

const pad = (i: number) => String(i + 1).padStart(2, '0');

export function Works({ onOpen }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + WORKS.length) % WORKS.length;
    document.getElementById('b-' + WORKS[next]!.slug)?.focus();
  };

  return (
    <>
      <ol className={'wk' + (hover !== null ? ' hovering' : '')} onMouseLeave={() => setHover(null)}>
        {WORKS.map((w, i) => (
          <li key={w.slug} className={hover === i ? 'on' : undefined}>
            <button
              type="button"
              id={'b-' + w.slug}
              className="wk-row"
              data-cursor="open"
              onClick={() => onOpen(w.slug)}
              onMouseEnter={() => setHover(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span className="wk-n">{pad(i)}</span>
              <span className="wk-t">
                {w.title}
                {w.nonprofit && <span className="npo">501(c)(3)</span>}
              </span>
              <span className="wk-tags">{w.tags}</span>
              <span className="wk-go" aria-hidden="true">
                →
              </span>
            </button>
          </li>
        ))}
      </ol>
      <Follower index={hover} />
    </>
  );
}

/**
 * The preview card that trails the cursor over the index. Every cover is
 * mounted up front (so it's decoded before you hover) in one tall strip, and
 * the strip slides to whichever row you're on. It leans into the direction
 * you're moving.
 */
function Follower({ index }: { index: number | null }) {
  const el = useRef<HTMLDivElement>(null);
  const [fine] = useState(() => window.matchMedia('(pointer: fine)').matches);
  // keep showing the last cover while the card fades out
  const [last, setLast] = useState(0);
  if (index !== null && index !== last) setLast(index);
  // don't show the card until we know where the pointer is, or it appears in a corner
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    if (!fine) return;
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let first = true;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      setTracking(true);
      target.x = e.clientX;
      target.y = e.clientY;
      if (first) {
        pos.x = target.x + 56;
        pos.y = target.y;
        first = false;
      }
    };
    const loop = () => {
      // sit just right of the pointer so the title you're on stays readable,
      // but don't run off the edge of the screen
      const w = el.current?.firstElementChild?.clientWidth ?? 300;
      const tx = Math.min(target.x + 56, window.innerWidth - w - 24);
      const vx = tx - pos.x;
      pos.x += vx * 0.14;
      pos.y += (target.y - pos.y) * 0.14;
      const tilt = Math.max(-10, Math.min(10, vx * 0.06));
      if (el.current) el.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${tilt}deg)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, [fine]);

  if (!fine) return null;
  return (
    <div className={'wk-follow' + (index !== null && tracking ? ' show' : '')} ref={el} aria-hidden="true">
      <div className="wk-follow-in">
        <div
          className="wk-strip"
          style={{ height: `${WORKS.length * 100}%`, transform: `translateY(${(-last * 100) / WORKS.length}%)` }}
        >
          {WORKS.map((w) => (
            <div key={w.slug} className={'wk-cover ' + w.cover.kind} style={{ height: `${100 / WORKS.length}%` }}>
              <img src={w.cover.src} alt="" decoding="async" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
