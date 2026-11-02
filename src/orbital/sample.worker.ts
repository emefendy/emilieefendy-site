import { ORBITALS, mulberry32, orderCloud, sampleCloud } from './orbitals';

export type SampleRequest = { count: number };
export type SampleResponse = { positions: Float32Array[]; phase: Float32Array[]; scale: number[] };

self.onmessage = (e: MessageEvent<SampleRequest>) => {
  const rand = mulberry32(20260);
  const clouds = ORBITALS.map((o) => orderCloud(sampleCloud(o, e.data.count, rand)));
  const res: SampleResponse = {
    positions: clouds.map((c) => c.positions),
    phase: clouds.map((c) => c.phase),
    scale: clouds.map((c) => c.scale),
  };
  // hand the buffers over instead of copying them
  (self as unknown as Worker).postMessage(res, [...res.positions.map((p) => p.buffer), ...res.phase.map((p) => p.buffer)]);
};
