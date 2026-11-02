import { EMAIL } from '../content';
import { scrollToEl } from '../lib/smoothScroll';
import { MOD_KEY } from './Nav';

/** Black screen, one line, one point of light. Scrolling lets it bloom. */
export function Intro() {
  return (
    <section className="opening" aria-label="Intro">
      {/* placed partway down so the very top of the page holds the point of light */}
      <div className="anchor" style={{ top: '60%' }} data-orbital="0" data-orbital-s="0.035" data-orbital-y="-0.3" data-orbital-o="1" />
      <p className="opening-q">
        What I cannot create,
        <br />I do not understand.
      </p>
      <p className="opening-a">from Richard Feynman’s last blackboard, 1988</p>
      <a className="opening-cue" href="#top" aria-label="Skip to the top of the page">
        <span>scroll</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}

export function Hero() {
  return (
    <header className="hero" id="top">
      <div className="anchor" style={{ top: '30%' }} data-orbital="0" data-orbital-x="0.44" data-orbital-labels="1" data-orbital-my="0.5" data-orbital-ms="0.5" />
      <div className="hero-copy">
        <p className="hero-eyebrow">CS &amp; physics · Harvard</p>
        <h1 className="hero-h">
          Emilie
          <br />
          Efendy.
        </h1>
        <p className="hero-p">
          I study computer science and physics, and build software for nonprofits. That cloud is a real hydrogen orbital,
          sampled from |ψ|². Scroll to change its state. Click anywhere to measure it.
        </p>
        <div className="hero-ctas">
          <button type="button" className="btn btn-solid" onClick={() => scrollToEl(document.getElementById('chapters')!, 0)}>
            See the work
          </button>
          <a className="btn btn-ghost" href={'mailto:' + EMAIL}>
            Say hi
          </a>
        </div>
        <p className="hero-small">
          Concurrent S.M. in CS · press <kbd>{MOD_KEY === '⌘' ? '⌘K' : 'Ctrl K'}</kbd> to search
        </p>
      </div>
    </header>
  );
}
