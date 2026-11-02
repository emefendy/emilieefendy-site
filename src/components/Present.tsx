import { HARVARD_COURSES, ORGS } from '../content';
import { SectionHead } from './SectionHead';

export function Present() {
  return (
    <section id="present" data-orbital="1" data-orbital-x="0.62" data-orbital-s="1.1" data-orbital-o="0.22" aria-labelledby="h-present">
      <SectionHead id="present" title="the present" />
      <div className="lede">
        <p>
          Hi, I’m Emilie. I’m a Harvard student studying <em>computer science and physics</em>, with a{' '}
          <em>concurrent master’s in CS</em>.
        </p>
        <p>
          I like working on hard problems, and I think it’s cool when agents can, too. I also really, really care about{' '}
          <a className="to-works" href="#works">
            building software for social good
          </a>
          .
        </p>
      </div>

      <p className="sub-label">Education</p>
      <div className="edu">
        <div className="edu-row">
          <div>
            <p className="edu-school">Harvard University</p>
            <p className="edu-deg">A.B. in Computer Science &amp; Physics, concurrent S.M. in Computer Science</p>
            <p className="edu-note">Cambridge, MA</p>
            <div className="edu-cols">
              <div>
                <p className="col-label">Coursework</p>
                <ul>
                  {HARVARD_COURSES.map((c) => (
                    <li key={c}>
                      <span className="e-t">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="col-label">Organizations</p>
                <ul>
                  {ORGS.map((o) => (
                    <li key={o.name}>
                      <span className="e-t">{o.name}</span>
                      {o.role && <span className="e-s">{o.role}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
