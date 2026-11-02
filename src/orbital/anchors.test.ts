import { describe, expect, it } from 'vitest';
import { poseAt, type Anchor, type Pose } from './anchors';

const pose = (p: Partial<Pose>): Pose => ({ k: 0, x: 0, y: 0, s: 1, o: 1, labels: 0, mx: 0, my: 0, ms: 0.62, ...p });
const anchors: Anchor[] = [
  { top: 0, pose: pose({ k: 0, s: 0.05 }) },
  { top: 1000, pose: pose({ k: 0, x: 0.4, labels: 1 }) },
  { top: 2000, pose: pose({ k: 2, x: 0.2, o: 0.5 }) },
];

describe('poseAt', () => {
  it('clamps before the first and after the last anchor', () => {
    expect(poseAt(-500, anchors)).toEqual(anchors[0]!.pose);
    expect(poseAt(9999, anchors)).toEqual(anchors[2]!.pose);
  });

  it('holds a pose for the first part of the gap', () => {
    expect(poseAt(1300, anchors)).toEqual(anchors[1]!.pose);
  });

  it('lands exactly on the next pose at the next anchor', () => {
    expect(poseAt(2000, anchors)).toEqual(anchors[2]!.pose);
  });

  it('eases through the middle, symmetrically', () => {
    const mid = poseAt(1725, anchors); // halfway through the moving part
    expect(mid.k).toBeCloseTo(1, 5);
    expect(mid.o).toBeCloseTo(0.75, 5);
    expect(mid.labels).toBeCloseTo(0.5, 5);
  });

  it('copes with no anchors and with two at the same spot', () => {
    expect(poseAt(10, []).s).toBe(1);
    const same: Anchor[] = [
      { top: 100, pose: pose({ k: 1 }) },
      { top: 100, pose: pose({ k: 3 }) },
    ];
    expect(poseAt(100, same).k).toBe(3);
  });
});
