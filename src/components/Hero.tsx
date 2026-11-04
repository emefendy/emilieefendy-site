import { EMAIL, SOCIALS, type SceneId } from '../content';
import { CampusScene } from '../campus/CampusScene';
import { GithubIcon, LinkedinIcon, MailIcon } from './Icons';

type HeroProps = { focus: SceneId | null; onOpen: (scene: SceneId) => void; reduced: boolean };

/** The whole front page: the campus, and a few lines about me beside it. */
export function Hero({ focus, onOpen, reduced }: HeroProps) {
  return (
    <main className={'hero' + (focus ? ' away' : '')} id="top">
      <div className="hero-copy">
        <p className="hero-eyebrow">CS &amp; Physics · Harvard</p>
        <h1 className="hero-h">Emilie Efendy</h1>
        <div className="hero-p">
          <p>
            Hi there! I’m Emilie, a Harvard student studying computer science and physics, with a concurrent master’s in CS.
          </p>
          <p>
            I love taking things from 0 → 1, especially with nonprofits, where what I build lands in front of real people the
            week it ships. I design around what users actually reach for, not what looks good in a demo, and I’m usually the
            first to pick up a new tool just to see how far it goes.
          </p>
          <p>
            I also love passing on what I learn: as a course assistant for theoretical physics, and as Director of Exploration
            at Harvard Tech for Social Good, where I lead two cohorts of students building apps for problems on Harvard’s
            campus and teach a two-hour weekly lecture on software engineering and UX.
          </p>
        </div>
        <ul className="links">
          <li>
            <a href={'mailto:' + EMAIL}>
              <MailIcon />
              {EMAIL}
            </a>
          </li>
          <li>
            <a href={SOCIALS.github} target="_blank" rel="noopener">
              <GithubIcon />
              github
            </a>
          </li>
          <li>
            <a href={SOCIALS.linkedin} target="_blank" rel="noopener">
              <LinkedinIcon />
              linkedin
            </a>
          </li>
        </ul>
      </div>
      <CampusScene focus={focus} onOpen={onOpen} reduced={reduced} />
    </main>
  );
}
