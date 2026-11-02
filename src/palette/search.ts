import { fuzzyMatch } from '../lib/fuzzy';
import { GROUPS, type Command, type Result } from './types';

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9+#]+/).filter(Boolean);

/**
 * Titles get the fuzzy matcher. Everything else (hints, keywords, the body
 * text of a project) is long enough that a subsequence match would hit almost
 * anything, so there every query word has to be the start of a real word.
 * That way "rag" finds CHW Central and "swift" finds For Evergreen without
 * "rag" also matching "pRoGrAm".
 */
// Below this a title match is letters strewn across unrelated words ("fr" in
// "Department of Computer"), which reads as noise in the list.
const MIN_SCORE_PER_CHAR = 12;
// Two-letter prefixes hit half the dictionary.
const MIN_KEYWORD_LEN = 3;

function scoreCommand(c: Command, query: string): { score: number; indices: number[] } | null {
  const title = fuzzyMatch(query, c.title);
  if (title && title.score >= MIN_SCORE_PER_CHAR * title.indices.length) return title;

  const qs = words(query);
  if (qs.length === 0 || qs.some((q) => q.length < MIN_KEYWORD_LEN)) return null;
  const hay = words([c.title, c.hint, c.keywords].filter(Boolean).join(' '));
  let score = 0;
  for (const q of qs) {
    const hit = hay.find((w) => w.startsWith(q));
    if (!hit) return null;
    score += hit === q ? 4 : 2; // whole-word hits beat prefixes
  }
  // always below a decent title match
  return { score: score - 100, indices: [] };
}

export function search(commands: readonly Command[], query: string, recentIds: readonly string[] = []): Result[] {
  const q = query.trim();

  if (!q) {
    const byId = new Map(commands.map((c) => [c.id, c]));
    const recent: Result[] = recentIds
      .map((id) => byId.get(id))
      .filter((c): c is Command => !!c)
      .map((command) => ({ command, indices: [], group: 'Recent' }));
    const rest: Result[] = commands.map((command) => ({ command, indices: [], group: command.group }));
    const order = (r: Result) => GROUPS.indexOf(r.group);
    // stable sort keeps each group in the order the commands were defined
    return [...recent, ...rest.sort((a, b) => order(a) - order(b))];
  }

  const scored: { r: Result; score: number; i: number }[] = [];
  commands.forEach((command, i) => {
    const m = scoreCommand(command, q);
    if (m) scored.push({ r: { command, indices: m.indices, group: command.group }, score: m.score, i });
  });
  scored.sort((a, b) => b.score - a.score || a.i - b.i);
  return scored.map((s) => s.r);
}
