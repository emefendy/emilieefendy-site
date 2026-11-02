import { describe, expect, it } from 'vitest';
import { ORBITALS, mulberry32, orderCloud, sampleCloud } from './orbitals';

const byKey = (k: string) => ORBITALS.find((o) => o.key === k)!;

// ⟨r⟩ for hydrogen is (a₀/2)·(3n² − l(l+1)), a nice check that the
// sampler is drawing from the right distribution and not just something
// orbital-shaped.
function meanRadius(key: string, count = 20000) {
  const o = byKey(key);
  const c = sampleCloud(o, count, mulberry32(7));
  let sum = 0;
  for (let i = 0; i < count; i++) {
    sum += Math.hypot(c.positions[i * 3]!, c.positions[i * 3 + 1]!, c.positions[i * 3 + 2]!) * c.scale;
  }
  return sum / count;
}

describe('sampleCloud', () => {
  it('matches ⟨r⟩ = 1.5 a₀ for 1s', () => {
    expect(meanRadius('1s')).toBeCloseTo(1.5, 1);
  });

  it('matches ⟨r⟩ = 5 a₀ for 2p', () => {
    expect(meanRadius('2pz')).toBeGreaterThan(4.85);
    expect(meanRadius('2pz')).toBeLessThan(5.15);
  });

  it('matches ⟨r⟩ = 10.5 a₀ for 3d', () => {
    expect(meanRadius('3dxy', 12000)).toBeGreaterThan(10.2);
    expect(meanRadius('3dxy', 12000)).toBeLessThan(10.8);
  });

  it('splits 2p_z evenly between its two phases, by height', () => {
    const c = sampleCloud(byKey('2pz'), 4000, mulberry32(1));
    let pos = 0;
    for (let i = 0; i < 4000; i++) {
      const up = c.positions[i * 3 + 1]! > 0;
      expect(c.phase[i]).toBe(up ? 1 : -1);
      if (up) pos++;
    }
    expect(pos / 4000).toBeGreaterThan(0.45);
    expect(pos / 4000).toBeLessThan(0.55);
  });

  it('is deterministic for a given seed', () => {
    const a = sampleCloud(byKey('3dz2'), 500, mulberry32(3));
    const b = sampleCloud(byKey('3dz2'), 500, mulberry32(3));
    expect(a.positions).toEqual(b.positions);
  });
});

describe('orderCloud', () => {
  it('reorders without losing or changing any particle', () => {
    const c = sampleCloud(byKey('4fxyz'), 800, mulberry32(9));
    const o = orderCloud(c);
    const key = (p: Float32Array, ph: Float32Array, i: number) => `${p[i * 3]},${p[i * 3 + 1]},${p[i * 3 + 2]},${ph[i]}`;
    const before = Array.from({ length: 800 }, (_, i) => key(c.positions, c.phase, i)).sort();
    const after = Array.from({ length: 800 }, (_, i) => key(o.positions, o.phase, i)).sort();
    expect(after).toEqual(before);
  });
});
