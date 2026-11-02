import { describe, expect, it } from 'vitest';
import { fuzzyMatch, highlight } from './fuzzy';

const rank = (query: string, items: string[]) =>
  items
    .map((text) => ({ text, m: fuzzyMatch(query, text) }))
    .filter((x) => x.m !== null)
    .sort((a, b) => b.m!.score - a.m!.score)
    .map((x) => x.text);

describe('fuzzyMatch', () => {
  it('matches everything on an empty query', () => {
    expect(fuzzyMatch('', 'anything')).toEqual({ score: 0, indices: [] });
  });

  it('requires every character, in order', () => {
    expect(fuzzyMatch('xyz', 'Mercor')).toBeNull();
    expect(fuzzyMatch('mr', 'Mercor')).not.toBeNull();
    expect(fuzzyMatch('rm', 'Mercor')).toBeNull();
  });

  it('is case-insensitive and ignores spaces in the query', () => {
    expect(fuzzyMatch('FOOD resc', '412 Food Rescue')?.indices).toEqual([4, 5, 6, 7, 9, 10, 11, 12]);
  });

  it('prefers word starts over letters buried mid-word', () => {
    // greedy would grab the "f" and "r" inside "Software"; the DP shouldn't
    expect(fuzzyMatch('fr', 'Software for Food Rescue')?.indices).toEqual([13, 18]);
  });

  it('prefers consecutive runs', () => {
    expect(rank('chw', ['Computers 4 People', 'Central Healthcare Workers', 'Harvard WECode'])[0]).toBe(
      'Central Healthcare Workers',
    );
  });

  it('ranks acronyms of titles sensibly', () => {
    expect(rank('alsf', ['Alex’s Lemonade Stand Foundation', 'Algorithms & Limitations', 'First Racquet'])[0]).toBe(
      'Alex’s Lemonade Stand Foundation',
    );
  });

  it('breaks ties toward the shorter text', () => {
    expect(rank('quera', ['QuEra Quantum Computing', 'QuEra'])).toEqual(['QuEra', 'QuEra Quantum Computing']);
  });

  it('treats a letter→digit change as a boundary', () => {
    const m = fuzzyMatch('c4p', 'Computers 4 People')!;
    expect(m.indices).toEqual([0, 10, 12]);
  });
});

describe('highlight', () => {
  it('groups matched runs', () => {
    expect(highlight('Mercor', [0, 1, 2])).toEqual([
      { text: 'Mer', hit: true },
      { text: 'cor', hit: false },
    ]);
  });

  it('passes text through untouched with no indices', () => {
    expect(highlight('Mercor', [])).toEqual([{ text: 'Mercor', hit: false }]);
  });
});
