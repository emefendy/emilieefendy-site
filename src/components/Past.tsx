import { EXPERIENCE, HS_COURSES } from '../content';
import { slugify } from '../lib/slug';
import { SectionHead } from './SectionHead';

type Props = {
  open: ReadonlySet<string>;
  onToggle: (org: string, open: boolean) => void;
};

export function Past({ open, onToggle }: Props) {
  return (
    <section id="past" data-orbital="2" data-orbital-x="0.62" data-orbital-s="1.1" data-orbital-o="0.22" aria-labelledby="h-past">
      <SectionHead id="past" title="the past" />
      <p className="sub-label">Experience</p>
      <ul className="link-list">
        {EXPERIENCE.map((x) => (
          <li key={x.org}>
            <details
              id={'xp-' + slugify(x.org)}
              open={open.has(x.org)}
              onToggle={(e) => {
                const now = e.currentTarget.open;
                if (now !== open.has(x.org)) onToggle(x.org, now);
              }}
            >
              <summary>
                <span className="t">{x.org}</span>
              </summary>
              <div className="w-body">
                <p className="x-role">{x.role}</p>
                <p className="w-meta">{x.meta}</p>
                {x.desc.map((d, i) => (
                  <p className="w-desc" key={i}>
                    {d}
                  </p>
                ))}
                <p className="stack">{x.stack.join(' · ')}</p>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <p className="sub-label">Education</p>
      <div className="edu">
        <div className="edu-row">
          <div>
            <p className="edu-school">William P. Clements High School</p>
            <p className="edu-deg">Salutatorian · 2/676 · 17 APs</p>
            <p className="edu-note">Sugar Land, TX</p>
            <p className="edu-link">
              <a href="https://chsroundup.com/21825/features/driven-by-wonder/" target="_blank" rel="noopener">
                → Emilie Efendy: Driven by Wonder
              </a>
            </p>
            <p className="edu-note">
              Featured in The RoundUp. Awarded Best of SNO (top 10% of student journalism submissions nationwide).
            </p>
            <div className="edu-courses">
              <p className="col-label">Coursework</p>
              <ul>
                {HS_COURSES.map((c) => (
                  <li key={c}>
                    <span className="e-t">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
