/*
 * Real hydrogen orbitals, in atomic units (a₀ = 1), unnormalized.
 *
 * ψ is real for these (they're the usual real combinations of the complex
 * Y_lm), so its sign is the phase, and |ψ|² is the probability density we
 * sample particles from. For the radius cutoffs, ⟨r⟩ = (3n² − l(l+1))/2. Normalization constants don't matter for rejection
 * sampling, so they're left out.
 */

export type Orbital = {
  key: string;
  /** subscript label, e.g. "3d_z²" */
  name: string;
  n: number;
  l: number;
  /** m for the real orbital, or the pair it's built from */
  m: string;
  /** essentially all of the density sits inside this radius (in a₀) */
  extent: number;
  /** ψ = radial(r) · angular(unit vector). Every orbital here has l = n − 1, so radial has no nodes. */
  radial: (r: number) => number;
  angular: (x: number, y: number, z: number) => number;
};

export const ORBITALS: readonly Orbital[] = [
  {
    key: '3dz2',
    name: '3d_z²',
    n: 3,
    l: 2,
    m: '0',
    extent: 26,
    radial: (r) => r * r * Math.exp(-r / 3),
    angular: (_x, _y, z) => 3 * z * z - 1,
  },
  {
    key: '2pz',
    name: '2p_z',
    n: 2,
    l: 1,
    m: '0',
    extent: 15,
    radial: (r) => r * Math.exp(-r / 2),
    angular: (_x, _y, z) => z,
  },
  {
    key: '4fxyz',
    name: '4f_xyz',
    n: 4,
    l: 3,
    m: '±2',
    extent: 42,
    radial: (r) => r * r * r * Math.exp(-r / 4),
    angular: (x, y, z) => x * y * z,
  },
  {
    key: '3dxy',
    name: '3d_xy',
    n: 3,
    l: 2,
    m: '±2',
    extent: 26,
    radial: (r) => r * r * Math.exp(-r / 3),
    angular: (x, y) => x * y,
  },
  {
    key: '1s',
    name: '1s',
    n: 1,
    l: 0,
    m: '0',
    extent: 7,
    radial: (r) => Math.exp(-r),
    angular: () => 1,
  },
];

/** Tiny seeded PRNG so the cloud looks the same on every visit. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Cloud = {
  /** xyz per particle, scaled so the cloud's 95th-percentile radius is 1 */
  positions: Float32Array;
  /** +1 / -1 per particle: the sign of ψ where it landed */
  phase: Float32Array;
  /** how many a₀ one scene unit is, to turn a click back into a radius */
  scale: number;
};

/** Largest value of f over a scan, padded a little since the true peak can fall between samples. */
function ceiling(f: () => number, tries: number) {
  let m = 0;
  for (let i = 0; i < tries; i++) m = Math.max(m, f());
  return m * 1.15;
}

/**
 * Sample `count` points from |ψ|². Because ψ = R(r)·Y(direction), radius and
 * direction can be drawn separately: r from r²R(r)² (the r² is the volume of
 * the shell), direction uniformly on the sphere and then kept with
 * probability Y²/max. Rejection sampling the whole box at once works too but
 * wastes >99% of draws on the sharply peaked ones like 1s.
 */
export function sampleCloud(o: Orbital, count: number, rand: () => number): Cloud {
  const L = o.extent;
  const radialPdf = (r: number) => {
    const R = o.radial(r);
    return r * r * R * R;
  };
  let k = 0;
  const rMax = ceiling(() => radialPdf((k++ / 4000) * L), 4001);

  const dir = new Float64Array(3);
  const randomDir = () => {
    // Marsaglia: uniform on the sphere without trig
    let a: number, b: number, s: number;
    do {
      a = rand() * 2 - 1;
      b = rand() * 2 - 1;
      s = a * a + b * b;
    } while (s >= 1);
    const t = 2 * Math.sqrt(1 - s);
    dir[0] = a * t;
    dir[1] = b * t;
    dir[2] = 1 - 2 * s;
  };
  const aMax = ceiling(() => {
    randomDir();
    const A = o.angular(dir[0]!, dir[1]!, dir[2]!);
    return A * A;
  }, 20000);

  const positions = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const radii = new Float32Array(count);
  for (let n = 0; n < count; n++) {
    let r: number;
    do r = rand() * L;
    while (rand() * rMax > radialPdf(r));

    let A: number;
    do {
      randomDir();
      A = o.angular(dir[0]!, dir[1]!, dir[2]!);
    } while (rand() * aMax > A * A);

    positions[n * 3] = dir[0]! * r;
    positions[n * 3 + 1] = dir[2]! * r; // ψ's z axis points up the screen
    positions[n * 3 + 2] = dir[1]! * r;
    phase[n] = A >= 0 ? 1 : -1;
    radii[n] = r;
  }

  const sorted = Float32Array.from(radii).sort();
  const scale = sorted[Math.floor(count * 0.95)] || 1;
  for (let i = 0; i < positions.length; i++) positions[i]! /= scale;

  return { positions, phase, scale };
}

/**
 * Particle i in one orbital turns into particle i in the next. If the pairing
 * is random every particle flies through the middle at once and it reads as
 * an explosion. Ordering every cloud the same way (by angle around the
 * vertical axis, then height) makes neighbours stay neighbours, so the morph
 * reads as the cloud reshaping itself.
 */
export function orderCloud(c: Cloud): Cloud {
  const n = c.phase.length;
  const idx = Array.from({ length: n }, (_, i) => i);
  const key = new Float64Array(n);
  const BANDS = 24;
  for (let i = 0; i < n; i++) {
    const x = c.positions[i * 3]!, y = c.positions[i * 3 + 1]!, z = c.positions[i * 3 + 2]!;
    const band = Math.floor(((Math.atan2(z, x) + Math.PI) / (2 * Math.PI)) * BANDS);
    key[i] = band * 1000 + Math.max(-499, Math.min(499, y * 100));
  }
  idx.sort((a, b) => key[a]! - key[b]!);
  const positions = new Float32Array(n * 3);
  const phase = new Float32Array(n);
  idx.forEach((from, to) => {
    positions[to * 3] = c.positions[from * 3]!;
    positions[to * 3 + 1] = c.positions[from * 3 + 1]!;
    positions[to * 3 + 2] = c.positions[from * 3 + 2]!;
    phase[to] = c.phase[from]!;
  });
  return { positions, phase, scale: c.scale };
}
