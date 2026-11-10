import type { Random } from '../lib/random';
import { ART_W, CANOPIES, CHIMNEYS, LAWNS, type Pt } from './map';
import { position, step, type Walker } from './walk';

/*
 * Everything that moves on the campus, in source-art coordinates. No canvas
 * here: render.ts draws a World, and this file only advances one.
 */

export type Person = {
  sprite: string;
  walk: Walker;
  /** the last couple of seconds of positions, so the dog can follow */
  trail: { t: number; x: number; y: number }[];
  /** clicked: stands still under a "?" until this time */
  pausedUntil: number;
};

export type Bird = {
  x: number;
  y: number;
  vx: number;
  phase: number;
  bob: number;
  falling?: { vy: number; spin: number; angle: number; age: number };
};

type Particle = { x: number; y: number; age: number; life: number; sway: number };

type Squirrel = { at: Pt; from: Pt; hop: number };

export type World = {
  time: number;
  people: Person[];
  /** the professor, who the dog follows */
  owner: Person;
  birds: Bird[];
  nextFlock: number;
  smoke: Particle[];
  smokeClocks: number[];
  leaves: Particle[];
  leafClock: number;
  squirrel: Squirrel;
  pointer: Pt | null;
};

export const PAUSE_S = 2;
const TRAIL_S = 2;
const BIRD_FALL_S = 2.2;
const SQUIRREL_RADIUS = 70;

const CAST: { sprite: string; walk: Walker }[] = [
  { sprite: 'student-a', walk: { from: 'lib', to: 'pw', t: 0.3, speed: 26 } },
  { sprite: 'professor', walk: { from: 'j', to: 'ps', t: 0.6, speed: 17 } },
  { sprite: 'student-b', walk: { from: 'pe', to: 'ps', t: 0.2, speed: 23 } },
  { sprite: 'jogger', walk: { from: 'b', to: 'j', t: 0.1, speed: 52 } },
  { sprite: 'cyclist', walk: { from: 'srv', to: 'j', t: 0.4, speed: 72 } },
];

export function createWorld(): World {
  const people = CAST.map((c) => ({ ...c, trail: [], pausedUntil: 0 }));
  const start = LAWNS[0]!;
  return {
    time: 0,
    people,
    owner: people[1]!,
    birds: [],
    nextFlock: 2,
    smoke: [],
    smokeClocks: CHIMNEYS.map((_, i) => i * 0.7),
    leaves: [],
    leafClock: 0,
    squirrel: { at: start, from: start, hop: 0 },
    pointer: null,
  };
}

export const isPaused = (w: World, p: Person) => w.time < p.pausedUntil;

/** Birds bob as they fly; a falling bird is wherever physics put it. */
export const birdY = (w: World, b: Bird) => (b.falling ? b.y : b.y + Math.sin(w.time * 2 + b.phase) * b.bob);

export function update(w: World, dt: number, rand: Random) {
  w.time += dt;
  movePeople(w, dt, rand);
  moveBirds(w, dt, rand);
  moveSmoke(w, dt, rand);
  moveLeaves(w, dt, rand);
  moveSquirrel(w, dt, rand);
}

function movePeople(w: World, dt: number, rand: Random) {
  for (const p of w.people) {
    if (!isPaused(w, p)) p.walk = step(p.walk, dt, rand);
    const [x, y] = position(p.walk);
    p.trail.push({ t: w.time, x, y });
    while (p.trail.length > 2 && p.trail[0]!.t < w.time - TRAIL_S) p.trail.shift();
  }
}

function moveBirds(w: World, dt: number, rand: Random) {
  w.nextFlock -= dt;
  if (w.nextFlock <= 0 && w.birds.length === 0) {
    w.birds.push(...flock(rand));
    w.nextFlock = 14 + rand() * 10;
  }
  for (const b of w.birds) {
    if (!b.falling) {
      b.x += b.vx * dt;
      continue;
    }
    const f = b.falling;
    f.age += dt;
    f.vy += 520 * dt;
    f.angle += f.spin * dt;
    b.y += f.vy * dt;
    b.x += b.vx * 0.25 * dt;
  }
  w.birds = w.birds.filter((b) => b.x > -120 && b.x < ART_W + 120 && !(b.falling && b.falling.age > BIRD_FALL_S));
}

function flock(rand: Random): Bird[] {
  const leftToRight = rand() < 0.6;
  const size = 3 + Math.floor(rand() * 3);
  const y = 40 + rand() * 120;
  return Array.from({ length: size }, (_, i) => {
    const offset = 40 + i * 28 + rand() * 20;
    return {
      x: leftToRight ? -offset : ART_W + offset,
      y: y + (rand() - 0.5) * 60,
      vx: (leftToRight ? 1 : -1) * (110 + rand() * 30),
      phase: rand() * 10,
      bob: 6 + rand() * 6,
    };
  });
}

function moveSmoke(w: World, dt: number, rand: Random) {
  CHIMNEYS.forEach(([x, y], i) => {
    w.smokeClocks[i]! -= dt;
    if (w.smokeClocks[i]! > 0) return;
    w.smoke.push({ x, y, age: 0, life: 3.4 + rand(), sway: 0 });
    w.smokeClocks[i] = 2 + rand() * 1.4;
  });
  for (const p of w.smoke) {
    p.age += dt;
    p.x += 6 * dt;
    p.y -= 14 * dt;
  }
  w.smoke = w.smoke.filter((p) => p.age <= p.life);
}

function moveLeaves(w: World, dt: number, rand: Random) {
  w.leafClock -= dt;
  if (w.leafClock <= 0) {
    const [x0, y0, x1, y1] = CANOPIES[Math.floor(rand() * CANOPIES.length)]!;
    w.leaves.push({
      x: x0 + rand() * (x1 - x0),
      y: y0 + rand() * (y1 - y0),
      age: 0,
      life: 3.5 + rand() * 2,
      sway: rand() * 6,
    });
    w.leafClock = 0.7 + rand() * 0.9;
  }
  for (const l of w.leaves) {
    l.age += dt;
    l.y += 16 * dt;
  }
  w.leaves = w.leaves.filter((l) => l.age <= l.life);
}

/** It bolts to another lawn when the cursor gets close. */
function moveSquirrel(w: World, dt: number, rand: Random) {
  const s = w.squirrel;
  if (s.hop > 0) {
    s.hop = Math.max(0, s.hop - dt / 0.7);
    return;
  }
  if (!w.pointer || Math.hypot(w.pointer[0] - s.at[0], w.pointer[1] - s.at[1]) >= SQUIRREL_RADIUS) return;
  const lawns = LAWNS.filter((l) => l !== s.at);
  w.squirrel = { from: s.at, at: lawns[Math.floor(rand() * lawns.length)]!, hop: 1 };
}

export function knockDown(b: Bird, w: World, rand: Random) {
  b.y = birdY(w, b);
  b.falling = { vy: -60, spin: Math.sign(b.vx) * (5 + rand() * 4), angle: 0, age: 0 };
}

export function pause(p: Person, w: World) {
  p.pausedUntil = w.time + PAUSE_S;
}
