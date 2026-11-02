/*
 * The page tells the orbital what to do. Any element with data-orbital is an
 * anchor: "when this reaches the middle of the screen, be orbital k, here,
 * this big, this bright". Between two anchors everything blends. That keeps
 * the choreography in the markup next to the content it belongs to, instead
 * of a table of magic scroll offsets in here.
 *
 *   <div data-orbital="2" data-orbital-x="0.3" data-orbital-s="0.9" data-orbital-o="0.6" />
 *
 * On phones x/y/s are replaced by data-orbital-mx/-my/-ms when given;
 * otherwise the cloud stays centred and a bit smaller.
 */

export type Pose = {
  /** which orbital, 0..4; fractional means mid-morph */
  k: number;
  /** horizontal offset, as a fraction of half the viewport width (wide screens) */
  x: number;
  /** vertical offset, as a fraction of half the viewport height */
  y: number;
  /** scale */
  s: number;
  /** opacity */
  o: number;
  /** how visible the hero labels are */
  labels: number;
  /** the same three for narrow screens, where there's no room beside the text */
  mx: number;
  my: number;
  ms: number;
};

export type Anchor = { top: number; pose: Pose };

const DEFAULT: Pose = { k: 0, x: 0, y: 0, s: 1, o: 1, labels: 0, mx: 0, my: 0, ms: 0.62 };

const num = (v: string | undefined, fallback: number) => {
  const n = v === undefined ? NaN : parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

export function readAnchors(root: ParentNode = document): Anchor[] {
  return [...root.querySelectorAll<HTMLElement>('[data-orbital]')]
    .map((el) => {
      const d = el.dataset;
      const x = num(d.orbitalX, DEFAULT.x);
      const y = num(d.orbitalY, DEFAULT.y);
      const s = num(d.orbitalS, DEFAULT.s);
      return {
        top: el.getBoundingClientRect().top + window.scrollY,
        pose: {
          k: num(d.orbital, DEFAULT.k),
          x,
          y,
          s,
          o: num(d.orbitalO, DEFAULT.o),
          labels: num(d.orbitalLabels, DEFAULT.labels),
          mx: num(d.orbitalMx, x * 0.25),
          my: num(d.orbitalMy, y),
          ms: num(d.orbitalMs, s * 0.62),
        },
      };
    })
    .sort((a, b) => a.top - b.top);
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Pose for a given scroll position (measured at the middle of the screen).
 * Each anchor's pose holds for the first `hold` of the gap to the next one,
 * then eases over the rest, so shapes settle while you read and change as
 * you move on.
 */
export function poseAt(y: number, anchors: readonly Anchor[], hold = 0.45): Pose {
  if (anchors.length === 0) return DEFAULT;
  const first = anchors[0]!;
  if (y < first.top) return first.pose;
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]!, b = anchors[i + 1]!;
    if (y >= b.top) continue;
    const span = b.top - a.top;
    const raw = span > 0 ? (y - a.top) / span : 1;
    const t = smooth(Math.min(1, Math.max(0, (raw - hold) / (1 - hold))));
    const p = a.pose, q = b.pose;
    return {
      k: lerp(p.k, q.k, t),
      x: lerp(p.x, q.x, t),
      y: lerp(p.y, q.y, t),
      s: lerp(p.s, q.s, t),
      o: lerp(p.o, q.o, t),
      labels: lerp(p.labels, q.labels, t),
      mx: lerp(p.mx, q.mx, t),
      my: lerp(p.my, q.my, t),
      ms: lerp(p.ms, q.ms, t),
    };
  }
  return anchors[anchors.length - 1]!.pose;
}
