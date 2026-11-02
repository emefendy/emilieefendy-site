import { EMAIL, SOCIALS } from '../content';
import { GithubIcon, LinkedinIcon, MailIcon } from './Icons';
import { SplitText } from './Reveal';

export function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero-top">
        <img className="avatar" src="img/avatar.jpg" alt="Emilie Efendy" width={156} height={156} fetchPriority="high" />
        <p className="hero-note">
          CS &amp; physics at Harvard, building software for social good. Currently between orbitals.
        </p>
      </div>

      <h1 className="name" aria-label="Emilie Efendy">
        <SplitText text="Emilie" by="char" delay={150} />
        <SplitText text="Efendy" by="char" delay={330} className="name-2" />
      </h1>

      <div className="hero-bottom">
        <p className="kicker">
          <span className="nw">Computer Science &amp; Physics</span> &nbsp;·&nbsp; <span className="nw">Harvard</span>
        </p>
        <ul className="links">
          <li>
            <a href={'mailto:' + EMAIL}>
              <MailIcon />
              email
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

      <a className="scroll-cue" href="#present" aria-label="Scroll to the present">
        <span>scroll</span>
        <i aria-hidden="true" />
      </a>
    </header>
  );
}
