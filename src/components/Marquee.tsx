const WORDS = [
  'computer science',
  'physics',
  'software for social good',
  'quantum',
  'agents & evals',
  'design',
  'cello',
  'physics puns',
];

/** Endless ticker. Two identical halves, slid by exactly one half, so the loop has no seam. */
export function Marquee() {
  const run = (
    <span className="mq-run">
      {WORDS.map((w) => (
        <span key={w}>
          {w}
          <i aria-hidden="true">✳</i>
        </span>
      ))}
    </span>
  );
  return (
    <div className="mq" aria-hidden="true">
      <div className="mq-track">
        {run}
        {run}
      </div>
    </div>
  );
}
