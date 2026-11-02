import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CHAPTERS, type Chapter, type ChapterCard } from '../content';
import { scrollToY } from '../lib/smoothScroll';

type Props = { onMore: (more: Chapter['more']) => void };

const pad = (i: number) => String(i + 1).padStart(2, '0');
// how many screens of scrolling each chapter gets
const PER = 1;

/**
 * One sticky, full-screen stage inside a tall wrapper. Scrolling through the
 * wrapper doesn't move the stage, it advances the chapter, and the orbital
 * behind it follows the invisible markers below.
 */
export function Chapters({ onMore }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = run > 0 ? -r.top / run : 0;
      const i = Math.min(CHAPTERS.length - 1, Math.max(0, Math.floor(p * CHAPTERS.length)));
      setActive(i);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const goTo = (i: number) => {
    const el = wrap.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const run = el.offsetHeight - window.innerHeight;
    // aim for the middle of the chapter's slice so it's clearly "on"
    scrollToY(top + ((i + 0.5) / CHAPTERS.length) * run);
  };

  return (
    <div
      className="ch-wrap"
      id="chapters"
      ref={wrap}
      style={{ height: `${(CHAPTERS.length * PER + 1) * 100}svh` }}
    >
      {/* Where the orbital should be for each chapter. Anchors are read at the
          middle of the screen, and chapter i is up while that middle sits in
          [i + 0.5, i + 1.5) screens into the wrapper. Each anchor holds, then
          eases over the last 55% of the gap to the next, so 0.775 centres
          every change on a chapter boundary. */}
      {CHAPTERS.map((c, i) => (
        <div
          key={c.id}
          id={c.id}
          className="ch-marker"
          style={{ top: `${(i * PER + 0.775) * 100}svh` }}
          data-orbital={c.orbital}
          data-orbital-x="0.34"
          data-orbital-s="0.95"
          data-orbital-o="0.75"
          data-orbital-my="0.42"
          data-orbital-ms="0.55"
        />
      ))}

      <section className="ch-stage" aria-label="Selected work">
        <div className="ch-vignette" aria-hidden="true" />
        {CHAPTERS.map((c, i) => (
          <article
            key={c.id}
            className={'ch' + (i === active ? ' on' : i < active ? ' past' : '')}
            aria-hidden={i !== active}
            {...(i !== active ? { inert: '' } : {})}
          >
            <div className="ch-text">
              <p className="ch-num" aria-hidden="true">
                {pad(i)}
              </p>
              <p className="ch-org">{c.org}</p>
              <h2 className="ch-h">{c.headline}</h2>
              <p className="ch-copy">{c.copy}</p>
              <button type="button" className="ch-more" onClick={() => onMore(c.more)}>
                {c.more.kind === 'work' ? 'Read the case study' : 'See the role'} <span aria-hidden="true">→</span>
              </button>
            </div>
            <Card card={c.card} on={i === active} />
          </article>
        ))}

        <nav className="ch-nav" aria-label="Chapters">
          <ol>
            {CHAPTERS.map((c, i) => (
              <li key={c.id}>
                <button type="button" className={i === active ? 'on' : undefined} aria-current={i === active ? 'step' : undefined} onClick={() => goTo(i)}>
                  <i aria-hidden="true" />
                  {c.short}
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="ch-next"
            onClick={() => (active < CHAPTERS.length - 1 ? goTo(active + 1) : document.getElementById('present')?.scrollIntoView())}
          >
            Next <span aria-hidden="true">↓</span>
          </button>
        </nav>

        <div className="ch-dots" aria-hidden="true">
          {CHAPTERS.map((c, i) => (
            <i key={c.id} className={i === active ? 'on' : undefined} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------- the floating cards ---------- */

function Card({ card, on }: { card: ChapterCard; on: boolean }) {
  return (
    <div className={'ch-card k-' + card.kind}>
      <div className="ch-card-h">
        <span>{card.title}</span>
        <span className="ch-live">
          <i aria-hidden="true" /> live
        </span>
      </div>
      <CardBody card={card} on={on} />
      <dl className="ch-stats">
        {card.stats.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function CardBody({ card, on }: { card: ChapterCard; on: boolean }) {
  switch (card.kind) {
    case 'index':
      return (
        <div className="ch-search">
          <span aria-hidden="true">⌕</span>
          <Typed text={card.query} on={on} />
          <span className="ch-search-k">top 5 → cited answer</span>
        </div>
      );
    case 'hotkey':
      return (
        <div className="ch-hotkey">
          <div className="ch-keys">
            {card.keys.map((k) => (
              <kbd key={k}>{k}</kbd>
            ))}
          </div>
          <ol className="ch-steps">
            {card.steps.map((s, i) => (
              <li key={s} style={{ '--d': `${300 + i * 260}ms` } as CSSProperties}>
                {s}
              </li>
            ))}
          </ol>
        </div>
      );
    case 'pipeline':
      return (
        <ol className="ch-pipe">
          {card.nodes.map((n, i) => (
            <li key={n} style={{ '--d': `${200 + i * 220}ms` } as CSSProperties}>
              {n}
            </li>
          ))}
        </ol>
      );
    case 'bar':
      return (
        <div className="ch-bar">
          <div className="ch-bar-row">
            <span>{card.label}</span>
            <Counter from={card.from} to={card.to} on={on} suffix="%" />
          </div>
          <div className="ch-bar-track">
            <span className="ch-bar-was" style={{ width: card.from + '%' }} />
            <span className="ch-bar-now" style={{ width: (on ? card.to : card.from) + '%' }} />
          </div>
          <div className="ch-bar-legend">
            <span>before · {card.from}%</span>
            <span>after · {card.to}%</span>
          </div>
        </div>
      );
    case 'count':
      return (
        <div className="ch-count">
          <Counter from={0} to={card.value} on={on} className="ch-count-n" />
          <span className="ch-count-u">{card.unit}</span>
          <LangCycle langs={card.langs} on={on} />
        </div>
      );
    case 'finalist':
      return (
        <div className="ch-finalist" aria-label={`${card.place} of ${card.of} finalists`}>
          {Array.from({ length: card.of }, (_, i) => (
            <span key={i} className={i < card.place ? 'me' : undefined} style={{ '--d': `${150 + i * 120}ms` } as CSSProperties} />
          ))}
        </div>
      );
  }
}

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Counts from `from` to `to` each time the chapter comes on. */
function Counter({ from, to, on, suffix = '', className }: { from: number; to: number; on: boolean; suffix?: string; className?: string }) {
  const [v, setV] = useState(from);
  useEffect(() => {
    if (!on) return setV(from);
    if (reduce()) return setV(to);
    let raf = 0;
    const t0 = performance.now();
    const dur = 1100;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setV(Math.round(from + (to - from) * e));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [on, from, to]);
  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {v.toLocaleString()}
      {suffix}
    </span>
  );
}

/** Types the query out, like someone searching. */
function Typed({ text, on }: { text: string; on: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return setN(0);
    if (reduce()) return setN(text.length);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, 38);
    return () => clearInterval(id);
  }, [on, text]);
  return (
    <span className="ch-typed">
      {text.slice(0, n)}
      <i className="ch-caret" aria-hidden="true" />
    </span>
  );
}

function LangCycle({ langs, on }: { langs: string[]; on: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!on || reduce()) return;
    const id = setInterval(() => setI((x) => (x + 1) % langs.length), 1100);
    return () => clearInterval(id);
  }, [on, langs.length]);
  return (
    <div className="ch-langs" role="presentation">
      {langs.map((l, k) => (
        <span key={l} className={k === i ? 'on' : undefined}>
          {l}
        </span>
      ))}
    </div>
  );
}
