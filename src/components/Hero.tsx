import { forwardRef } from 'react';
import { EMAIL, SOCIALS } from '../content';
import { GithubIcon, LinkedinIcon, MailIcon } from './Icons';

export const Hero = forwardRef<HTMLElement>(function Hero(_, ref) {
  return (
    <header className="hero" id="top" ref={ref}>
      <img className="avatar" src="img/avatar.jpg" alt="Emilie Efendy" width={156} height={156} fetchPriority="high" />
      <h1 className="name">Emilie Efendy</h1>
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
    </header>
  );
});
