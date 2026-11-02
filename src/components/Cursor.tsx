import { useEffect, useRef, useState } from 'react';

/*
 * A dot that sits exactly on the pointer and a ring that trails it. Over
 * anything clickable the ring grows; elements can put a word in it with
 * data-cursor="open". Fine pointers only; on touch this renders nothing.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [enabled] = useState(
    () => window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('has-cursor');
    const p = { x: -100, y: -100 };
    const r = { x: -100, y: -100 };
    let raf = 0;
    let state = '';

    const setState = (s: string) => {
      if (s === state) return;
      state = s;
      ring.current!.dataset.state = s;
    };

    const onMove = (e: PointerEvent) => {
      p.x = e.clientX;
      p.y = e.clientY;
      dot.current!.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      const t = (e.target as Element | null)?.closest<HTMLElement>('[data-cursor], a, button, summary, [role="option"], input');
      const word = t?.dataset.cursor ?? '';
      setLabel(word);
      setState(!t ? '' : word ? 'label' : t.matches('input') ? 'text' : 'link');
    };
    const onDown = () => ring.current?.classList.add('down');
    const onUp = () => ring.current?.classList.remove('down');
    const onLeave = () => setState('gone');

    const loop = () => {
      r.x += (p.x - r.x) * 0.2;
      r.y += (p.y - r.y) * 0.2;
      ring.current!.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div aria-hidden="true">
      <div className="cur-ring" ref={ring}>
        <span>{label}</span>
      </div>
      <div className="cur-dot" ref={dot} />
    </div>
  );
}
