import { EMAIL, SOCIALS, type SceneId } from '../content';
import { CampusScene } from '../campus/CampusScene';
import { MOD_KEY } from '../lib/keys';
import { GithubIcon, LinkedinIcon, MailIcon } from './Icons';

type HeroProps = { focus: SceneId | null; onOpen: (scene: SceneId) => void; reduced: boolean };

/** The whole front page: the campus, and a few lines about me beside it. */
export function Hero({ focus, onOpen, reduced }: HeroProps) {
  return (
    <main className={'hero' + (focus ? ' away' : '')} id="top">
      <div className="hero-copy">
        <p className="hero-eyebrow">CS &amp; Physics · Harvard</p>
        <h1 className="hero-h">Emilie Efendy</h1>
        <p className="hero-p">
          I’m a Harvard student studying computer science and physics, with a concurrent master’s in CS. I like hard problems,
          and I really care about building software for social good.
        </p>
        <p className="hero-hint">
          Click a building to walk in · <kbd>{MOD_KEY === '⌘' ? '⌘K' : 'Ctrl K'}</kbd> to search
        </p>
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
