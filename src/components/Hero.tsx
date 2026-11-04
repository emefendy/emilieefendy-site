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
            I love building things that real people end up using. I’ve worked with nonprofits from local food rescue teams and a
            group getting computers to families who need them, to international healthcare organizations and social legislators
            in Japan.
          </p>
          <p>
            I also love to teach. At Harvard Tech for Social Good, I lead two cohorts of students building apps for problems on
            our own campus, and every week I give a two-hour lecture on whatever they need next, from Git to JavaScript to AI
            research.
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
