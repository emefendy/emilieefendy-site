import { EMAIL, SOCIALS, type SceneId } from '../content';
import { CampusScene } from '../campus/CampusScene';
import { AskMe } from '../me/AskMe';
import { GithubIcon, LinkedinIcon, MailIcon } from './Icons';

type HeroProps = { focus: SceneId | null; onOpen: (scene: SceneId) => void; onReplay: () => void; reduced: boolean };

/** The whole front page: the campus, and my name with pixel me beside it. */
export function Hero({ focus, onOpen, onReplay, reduced }: HeroProps) {
  return (
    <main className={'hero' + (focus ? ' away' : '')} id="top">
      <div className="hero-copy">
        <p className="hero-eyebrow">CS &amp; Physics · Harvard</p>
        <h1 className="hero-h">Emilie Efendy</h1>
        <AskMe onGo={onOpen} onReplay={onReplay} />
      </div>
      <CampusScene focus={focus} onOpen={onOpen} reduced={reduced} />
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
    </main>
  );
}
