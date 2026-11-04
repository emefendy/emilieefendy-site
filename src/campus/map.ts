/*
 * Everything placed on the campus, in the coordinates of the original
 * 1415×1111 art (art/campus-art/base/campus.png). The renderer scales by the
 * manifest's `scale`, so if the background is ever regenerated at another
 * size only these numbers move.
 */

import type { SceneId } from '../content';

export type Pt = readonly [number, number];

/** Walkable path junctions, traced off the stone paving. */
export const NODES = {
  lib: [505, 532], // library steps
  obs: [866, 528], // observatory steps
  pw: [650, 602], // statue plinth, west corner
  pe: [815, 600], // east corner
  ps: [735, 642], // south corner
  j: [692, 768], // the crossroads
  lab: [528, 790], // workshop door
  srv: [872, 758], // server hall
  b: [822, 834], // lower path
  se: [962, 856], // south-east gate
} as const satisfies Record<string, Pt>;

export type NodeId = keyof typeof NODES;

export const EDGES: readonly (readonly [NodeId, NodeId])[] = [
  ['lib', 'pw'],
  ['obs', 'pe'],
  ['pw', 'ps'],
  ['pe', 'ps'],
  ['ps', 'j'],
  ['j', 'lab'],
  ['j', 'srv'],
  ['j', 'b'],
  ['b', 'se'],
];

/** Tops of the chimneys, where smoke starts. */
export const CHIMNEYS: readonly Pt[] = [
  [312, 206],
  [437, 182],
  [955, 248],
  [197, 470],
  [995, 540],
];

/** Lamp heads that get a slow flicker. */
export const LAMPS: readonly Pt[] = [
  [465, 462],
  [541, 440],
  [677, 462],
  [536, 555],
  [913, 548],
  [849, 457],
  [767, 665],
  [611, 758],
  [855, 800],
  [665, 262],
  [717, 268],
  [777, 290],
];

/** Tree canopies that drop leaves: x0, y0, x1, y1. */
export const CANOPIES: readonly (readonly [number, number, number, number])[] = [
  [80, 300, 230, 480],
  [560, 560, 680, 650],
  [800, 590, 900, 690],
  [1250, 300, 1370, 460],
  [480, 180, 560, 240],
];

/** The sailboat drifts between these two points on the river. */
export const RIVER: readonly [Pt, Pt] = [
  [648, 392],
  [740, 372],
];

/** Lawns a squirrel can sit on. */
export const LAWNS: readonly Pt[] = [
  [610, 712],
  [585, 662],
  [930, 640],
  [640, 870],
];

export type Box = readonly [number, number, number, number];
export type Building = { scene: SceneId; label: string; tag: Pt; box: Box };

/**
 * The four buildings you can walk into: where each tag sits, and the box the
 * camera frames when you zoom in (x0, y0, x1, y1).
 */
export const BUILDINGS: readonly Building[] = [
  { scene: 'education', label: 'Education', tag: [400, 250], box: [190, 165, 615, 525] },
  { scene: 'experience', label: 'Experience', tag: [1130, 250], box: [845, 175, 1250, 525] },
  { scene: 'projects', label: 'Projects', tag: [300, 520], box: [105, 455, 560, 825] },
  { scene: 'extras', label: 'Extras', tag: [1110, 560], box: [880, 475, 1320, 835] },
];
