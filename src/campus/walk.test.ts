import { describe, expect, it } from 'vitest';
import { EDGES, NODES } from './map';
import { NEIGHBOURS, edgeLength, facing, nextNode, position, step, type Walker } from './walk';

const seq = (...xs: number[]) => {
  let i = 0;
  return () => xs[i++ % xs.length]!;
};

describe('facing', () => {
  it('uses the front sheet walking toward the viewer, mirrored for down-left', () => {
    expect(facing(10, 6)).toEqual({ sheet: 'front', flip: false });
    expect(facing(-10, 6)).toEqual({ sheet: 'front', flip: true });
  });

  it('uses the back sheet walking away, mirrored for up-right', () => {
    expect(facing(-10, -6)).toEqual({ sheet: 'back', flip: false });
    expect(facing(10, -6)).toEqual({ sheet: 'back', flip: true });
  });

  it('treats flat movement sensibly', () => {
    expect(facing(5, 0).sheet).toBe('front');
    expect(facing(-5, 0).sheet).toBe('back');
  });
});

describe('the path graph', () => {
  it('only connects nodes that exist, and every node can be reached', () => {
    for (const [a, b] of EDGES) {
      expect(NODES[a]).toBeDefined();
      expect(NODES[b]).toBeDefined();
    }
    const seen = new Set(['lib']);
    const queue = ['lib'] as (keyof typeof NODES)[];
    for (let at = queue.shift(); at; at = queue.shift()) {
      for (const n of NEIGHBOURS[at]) {
        if (seen.has(n)) continue;
        seen.add(n);
        queue.push(n);
      }
    }
    expect(seen.size).toBe(Object.keys(NODES).length);
  });
});

describe('nextNode', () => {
  it("doesn't turn straight back at a junction", () => {
    for (let r = 0; r < 1; r += 0.1) expect(nextNode('j', 'ps', () => r)).not.toBe('ps');
  });

  it('turns back at a dead end', () => {
    expect(nextNode('lab', 'j', Math.random)).toBe('j');
  });
});

describe('step', () => {
  it('moves along the edge at its speed', () => {
    const w: Walker = { from: 'ps', to: 'j', t: 0, speed: 10 };
    const len = edgeLength('ps', 'j');
    expect(step(w, 2, Math.random).t).toBeCloseTo(20 / len, 6);
  });

  it('rolls over onto the next edge, keeping the leftover distance', () => {
    const len = edgeLength('lab', 'j');
    const w: Walker = { from: 'j', to: 'lab', t: 0.5, speed: len }; // reaches lab in 0.5s
    const after = step(w, 0.75, seq(0));
    expect(after.from).toBe('lab');
    expect(after.to).toBe('j');
    expect(after.t).toBeCloseTo(0.25, 6);
  });

  it('keeps walkers on the path', () => {
    let w: Walker = { from: 'lib', to: 'pw', t: 0, speed: 40 };
    const rand = seq(0.13, 0.71, 0.42, 0.9, 0.05);
    for (let i = 0; i < 400; i++) {
      w = step(w, 0.05, rand);
      const [x, y] = position(w);
      const [ax, ay] = NODES[w.from];
      const [bx, by] = NODES[w.to];
      // on the segment between its two nodes
      expect(x).toBeGreaterThanOrEqual(Math.min(ax, bx) - 1e-6);
      expect(x).toBeLessThanOrEqual(Math.max(ax, bx) + 1e-6);
      expect(y).toBeGreaterThanOrEqual(Math.min(ay, by) - 1e-6);
      expect(y).toBeLessThanOrEqual(Math.max(ay, by) + 1e-6);
    }
  });
});
