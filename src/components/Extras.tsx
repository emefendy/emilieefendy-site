import { PROGRAMS, RECOGNITION } from '../content';
import { SectionHead } from './SectionHead';

export function Extras() {
  return (
    <section id="extras" data-orbital="4" data-orbital-x="0.55" data-orbital-s="1" data-orbital-o="0.35" aria-labelledby="h-extras">
      <SectionHead id="extras" title="the extras" />
      <div className="extras">
        <div>
          <p className="col-label">Recognition</p>
          <ul>
            {RECOGNITION.map((r) => (
              <li key={r.title}>
                <span className="e-t">{r.title}</span>
                <span className="e-s">{r.sub}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="col-label">Programs</p>
          <ul>
            {PROGRAMS.map((p) => (
              <li key={p}>
                <span className="e-t">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
