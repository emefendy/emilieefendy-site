/*
 * Fuzzy subsequence matching, roughly in the spirit of fzf.
 *
 * Every query character has to appear in the text, in order. Among all the
 * ways to line them up we keep the best-scoring one, which rewards matches at
 * word starts and runs of consecutive characters and charges a little for
 * every character skipped in between. So "fr" prefers the F and R that start
 * words in "412 Food Rescue" over the ones buried in "Software". The cases I
 * actually care about are pinned down in fuzzy.test.ts.
 *
 * It's a DP over (query index, text index). The gap penalty is linear, so
 * instead of looking back over every earlier position we carry a running max,
 * which keeps it O(query × text).
 */

export type Match = { score: number; indices: number[] };

const SCORE_MATCH = 16;
const BONUS_START = 10;
const BONUS_BOUNDARY = 8;
const BONUS_CAMEL = 6;
const BONUS_CONSECUTIVE = 6;
const PENALTY_GAP = 1;
const PENALTY_LEADING = 0.5;

const SEPARATORS = new Set([' ', '-', '_', '/', '.', '·', '(', ')', ',', ':', '&', '@', '’', "'"]);

function boundaryBonus(text: string, j: number): number {
  if (j === 0) return BONUS_START;
  const prev = text[j - 1]!;
  const cur = text[j]!;
  if (SEPARATORS.has(prev)) return BONUS_BOUNDARY;
  if (prev >= 'a' && prev <= 'z' && cur >= 'A' && cur <= 'Z') return BONUS_CAMEL;
  if (/\D/.test(prev) && /\d/.test(cur)) return BONUS_CAMEL;
  return 0;
}

export function fuzzyMatch(query: string, text: string): Match | null {
  const q = query.toLowerCase().replace(/\s+/g, '');
  if (q.length === 0) return { score: 0, indices: [] };
  if (q.length > text.length) return null;

  const t = text.toLowerCase();
  const m = q.length;
  const n = t.length;

  // quick reject before allocating anything
  for (let i = 0, j = 0; i < m; i++, j++) {
    j = t.indexOf(q[i]!, j);
    if (j === -1) return null;
  }

  const NEG = -Infinity;
  const score = new Float64Array(m * n).fill(NEG);
  const from = new Int32Array(m * n).fill(-1);
  const bonus = new Float64Array(n);
  for (let j = 0; j < n; j++) bonus[j] = boundaryBonus(text, j);

  for (let j = 0; j < n; j++) {
    if (t[j] === q[0]) score[j] = SCORE_MATCH + bonus[j]! - PENALTY_LEADING * Math.min(j, 12);
  }

  for (let i = 1; i < m; i++) {
    const row = i * n;
    const prev = (i - 1) * n;
    // best of score[prev + k] + PENALTY_GAP * k over k < j - 1, and where it came from
    let runBest = NEG;
    let runAt = -1;
    for (let j = i; j < n; j++) {
      const k = j - 2;
      if (k >= 0 && score[prev + k]! > NEG) {
        const v = score[prev + k]! + PENALTY_GAP * k;
        if (v > runBest) {
          runBest = v;
          runAt = k;
        }
      }
      if (t[j] !== q[i]) continue;

      let best = NEG;
      let bestFrom = -1;
      const adj = score[prev + j - 1]!;
      if (adj > NEG) {
        best = adj + BONUS_CONSECUTIVE;
        bestFrom = j - 1;
      }
      if (runAt >= 0) {
        // skipped (j - runAt - 1) characters
        const v = runBest - PENALTY_GAP * (j - 1);
        if (v > best) {
          best = v;
          bestFrom = runAt;
        }
      }
      if (bestFrom < 0) continue;
      score[row + j] = best + SCORE_MATCH + bonus[j]!;
      from[row + j] = bestFrom;
    }
  }

  const last = (m - 1) * n;
  let end = -1;
  let top = NEG;
  for (let j = m - 1; j < n; j++) {
    if (score[last + j]! > top) {
      top = score[last + j]!;
      end = j;
    }
  }
  if (end < 0) return null;

  const indices = new Array<number>(m);
  for (let i = m - 1, j = end; i >= 0; i--) {
    indices[i] = j;
    j = from[i * n + j]!;
  }
  // shorter texts win ties: "Mercor" should beat "Harvard WECode x Build@HUB" for "mer"
  return { score: top - n * 0.01, indices };
}

/** Split text into runs so matched characters can be wrapped in <mark>. */
export function highlight(text: string, indices: readonly number[]): { text: string; hit: boolean }[] {
  if (indices.length === 0) return [{ text, hit: false }];
  const hits = new Set(indices);
  const out: { text: string; hit: boolean }[] = [];
  for (let j = 0; j < text.length; j++) {
    const ch = text.charAt(j);
    const hit = hits.has(j);
    const tail = out.at(-1);
    if (tail?.hit === hit) tail.text += ch;
    else out.push({ text: ch, hit });
  }
  return out;
}
