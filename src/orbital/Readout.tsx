import { useEffect, useState } from 'react';
import { ORBITALS } from './orbitals';
import { measureEvents, useOrbital } from './store';

const INTERACTIVE = 'a, button, input, textarea, select, summary, label, dialog, [role="option"], [role="dialog"], .ch-card, .w-body';

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
 * The status pill at the bottom of the screen. Also owns the click-to-measure
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
    const id = setTimeout(() => setFresh(false), 2400);
    return () => clearTimeout(id);
  }, [measured]);

  return (
    <aside className={'readout' + (ready ? ' on' : '') + (fresh ? ' fresh' : '')} aria-label="Orbital status">
      <i className="ro-dot" aria-hidden="true" />
      <span aria-live="polite">
        {measured ? (
          <>
            Measured <b>r = {measured.r.toFixed(2)} a<sub>0</sub></b> in{' '}
            <span className="ro-name">
              <OrbitalName name={o.name} />
            </span>
            .
          </>
        ) : (
          <>
            <span className="ro-name">
              ψ <OrbitalName name={o.name} />
            </span>{' '}
            is live. <span className="ro-hint">Click anywhere to measure it.</span>
          </>
        )}
      </span>
      <span className="ro-q" aria-label={`n ${o.n}, l ${o.l}, m ${o.m}`}>
        n={o.n} l={o.l} m={o.m}
      </span>
    </aside>
  );
}
