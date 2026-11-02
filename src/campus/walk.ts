import { EDGES, NODES, type NodeId } from './map';

/*
 * Walking rules, kept free of canvas code so they can be tested.
 *
 * Every character has two drawings: `front` walking toward the bottom-right
 * of the screen and `back` walking away toward the top-left. Mirroring each
 * covers the other two diagonals, so four directions from two sheets.
 */

export type Facing = { sheet: 'front' | 'back'; flip: boolean };

export function facing(dx: number, dy: number): Facing {
  // screen y grows downward: moving down the screen is toward the viewer
  if (dy > 0 || (dy === 0 && dx > 0)) return { sheet: 'front', flip: dx < 0 };
  return { sheet: 'back', flip: dx > 0 };
}

export const NEIGHBOURS: Readonly<Record<NodeId, NodeId[]>> = (() => {
  const n = Object.fromEntries(Object.keys(NODES).map((k) => [k, [] as NodeId[]])) as Record<NodeId, NodeId[]>;
  for (const [a, b] of EDGES) {
    n[a].push(b);
    n[b].push(a);
  }
  return n;
})();

/** Where to go from `at`: anywhere but straight back, unless it's a dead end. */
export function nextNode(at: NodeId, cameFrom: NodeId | null, rand: () => number): NodeId {
  const all = NEIGHBOURS[at];
  const options = all.length > 1 && cameFrom ? all.filter((n) => n !== cameFrom) : all;
  return options[Math.floor(rand() * options.length)] ?? at;
}

export type Walker = {
  from: NodeId;
  to: NodeId;
  /** 0..1 along the current edge */
  t: number;
  /** source-art pixels per second */
  speed: number;
};

/** Advance a walker by dt seconds, rolling over onto new edges as it arrives. */
export function step(w: Walker, dt: number, rand: () => number): Walker {
  let { from, to, t } = w;
  let left = dt * w.speed;
  for (let guard = 0; guard < 8 && left > 0; guard++) {
    const len = edgeLength(from, to);
    const remaining = (1 - t) * len;
    if (left < remaining) {
      t += left / len;
      left = 0;
    } else {
      left -= remaining;
      const next = nextNode(to, from, rand);
      from = to;
      to = next;
      t = 0;
    }
  }
  return { ...w, from, to, t };
}

export function edgeLength(a: NodeId, b: NodeId) {
  const [ax, ay] = NODES[a];
  const [bx, by] = NODES[b];
  return Math.max(1e-6, Math.hypot(bx - ax, by - ay));
}

export function position(w: Walker): [number, number] {
  const [ax, ay] = NODES[w.from];
  const [bx, by] = NODES[w.to];
  return [ax + (bx - ax) * w.t, ay + (by - ay) * w.t];
}

export function heading(w: Walker): Facing {
  const [ax, ay] = NODES[w.from];
  const [bx, by] = NODES[w.to];
  return facing(bx - ax, by - ay);
}
