import { useEffect, useState } from 'react';
import { ORBITALS } from './orbitals';
import { measureEvents, useOrbital } from './store';

const INTERACTIVE = 'a, button, input, textarea, select, summary, label, dialog, [role="option"], [role="dialog"], .tl-panel, .w-body';

/** "3d_z²" → 3d with a subscript z² */
function OrbitalName({ name }: { name: string }) {
  const [main, sub] = name.split('_');
  return (
    <>
      {main}
      {sub && <sub>{sub}</sub>}
    </>
  );
}

/**
 * The little lab readout in the corner. Also owns the click-to-measure
 * gesture, since it's the thing that explains it.
 */
export function Readout() {
  const { index, measured, ready } = useOrbital();
  const o = ORBITALS[index] ?? ORBITALS[0]!;
  const [fresh, setFresh] = useState(false);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !e.isPrimary) return;
      const t = e.target as Element | null;
      if (t?.closest(INTERACTIVE)) return;
      // don't hijack someone selecting text
      if (getSelection()?.toString()) return;
      measureEvents.dispatchEvent(new Event('measure'));
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, []);

  useEffect(() => {
    if (!measured) return;
    setFresh(true);
    const id = setTimeout(() => setFresh(false), 2600);
    return () => clearTimeout(id);
  }, [measured]);

  return (
    <aside className={'readout' + (ready ? ' on' : '')} aria-label="Orbital readout">
      <p className="ro-psi">
        ψ <span className="ro-name">
          <OrbitalName name={o.name} />
        </span>
      </p>
      <p className="ro-q">
        n={o.n} · l={o.l} · m={o.m}
      </p>
      <p className={'ro-m' + (fresh ? ' fresh' : '')} aria-live="polite">
        {measured ? (
          <>
            measured r = {measured.r.toFixed(2)} a<sub>0</sub>
          </>
        ) : (
          <>click anywhere to measure</>
        )}
      </p>
    </aside>
  );
}
