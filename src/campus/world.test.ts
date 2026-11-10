import { describe, expect, it } from 'vitest';
import { seeded } from '../lib/random';
import { LAWNS } from './map';
import { position } from './walk';
import { birdY, createWorld, knockDown, pause, update } from './world';

const run = (seconds: number, w = createWorld(), rand = seeded(1)) => {
  for (let t = 0; t < seconds; t += 0.05) update(w, 0.05, rand);
  return w;
};

describe('campus world', () => {
  it('is deterministic for a given seed', () => {
    const a = run(10);
    const b = run(10);
    expect(a.people.map((p) => position(p.walk))).toEqual(b.people.map((p) => position(p.walk)));
  });

  it('holds a clicked person still for two seconds, then lets them walk on', () => {
    const w = run(1);
    const person = w.people[0]!;
    pause(person, w);
    const at = position(person.walk);
    run(1.9, w);
    expect(position(person.walk)).toEqual(at);
    run(0.5, w);
    expect(position(person.walk)).not.toEqual(at);
  });

  it('sends a flock over, and clears a knocked-down bird once it has fallen', () => {
    const rand = seeded(2);
    const w = run(3, createWorld(), rand);
    expect(w.birds.length).toBeGreaterThan(0);
    const bird = w.birds[0]!;
    const y = birdY(w, bird);
    knockDown(bird, w, rand);
    expect(bird.y).toBe(y);
    run(2.5, w, rand);
    expect(w.birds).not.toContain(bird);
  });

  it('makes the squirrel bolt when the pointer comes close', () => {
    const w = createWorld();
    const rand = seeded(3);
    w.pointer = LAWNS[0]!;
    update(w, 0.016, rand);
    expect(w.squirrel.at).not.toBe(LAWNS[0]);
    expect(w.squirrel.hop).toBe(1);
  });
});
