import { describe, expect, it } from 'vitest';
import { search } from './search';
import type { Command } from './types';

const noop = () => {};
const cmds: Command[] = [
  { id: 'go:past', title: 'Go to the past', group: 'Sections', run: noop },
  { id: 'w:chw', title: 'Central Healthcare Workers', group: 'Works', keywords: 'rag semantic search wordpress', run: noop },
  { id: 'w:evergreen', title: 'For Evergreen', group: 'Works', keywords: 'swiftui ios climate', run: noop },
  { id: 'x:mercor', title: 'Mercor', group: 'Internships', hint: 'Project Manager', keywords: 'evals react', run: noop },
  { id: 'a:theme', title: 'Switch to dark mode', group: 'Actions', run: noop },
];

const titles = (q: string, recent: string[] = []) => search(cmds, q, recent).map((r) => r.command.title);

describe('search', () => {
  it('lists everything grouped when the query is empty', () => {
    expect(search(cmds, '').map((r) => r.group)).toEqual(['Sections', 'Works', 'Works', 'Internships', 'Actions']);
  });

  it('puts recents first without dropping them from their own group', () => {
    const r = search(cmds, '', ['x:mercor', 'gone']);
    expect(r[0]).toMatchObject({ group: 'Recent', command: { id: 'x:mercor' } });
    expect(r.filter((x) => x.command.id === 'x:mercor')).toHaveLength(2);
  });

  it('fuzzy-matches titles', () => {
    expect(titles('chw')[0]).toBe('Central Healthcare Workers');
    expect(titles('dark')).toEqual(['Switch to dark mode']);
  });

  it('finds things by keyword, but only on word starts', () => {
    expect(titles('rag')).toEqual(['Central Healthcare Workers']);
    expect(titles('swift')).toEqual(['For Evergreen']);
    expect(titles('manager')).toEqual(['Mercor']);
  });

  it('needs every query word to land somewhere', () => {
    expect(titles('react evals')).toEqual(['Mercor']);
    expect(titles('react climate')).toEqual([]);
  });

  it('drops scattered matches and short keyword prefixes', () => {
    const extra: Command = { id: 'x:ncsu', title: 'NC State Department of Computer Science', group: 'Internships', keywords: 'french', run: noop };
    expect(search([...cmds, extra], 'fr').map((r) => r.command.id)).toEqual(['w:evergreen']);
  });

  it('ranks title matches above keyword matches', () => {
    const extra: Command = { id: 'w:react', title: 'React stuff', group: 'Works', run: noop };
    expect(search([...cmds, extra], 'react').map((r) => r.command.id)).toEqual(['w:react', 'x:mercor']);
  });
});
