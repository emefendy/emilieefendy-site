import { useSyncExternalStore } from 'react';

/*
 * The canvas and the DOM readout both need to know which orbital we're in and
 * what the last "measurement" was. A whole context for two values felt like
 * a lot, so it's a tiny external store.
 */

export type Measurement = { r: number; at: number };
type State = {
  index: number;
  measured: Measurement | null;
  ready: boolean;
  /** which picture the status pill should talk about */
  scene: 'campus' | 'orbital';
};

let state: State = { index: 0, measured: null, ready: false, scene: 'orbital' };
const subs = new Set<() => void>();

export const orbitalStore = {
  get: () => state,
  set(patch: Partial<State>) {
    const next = { ...state, ...patch };
    if ((Object.keys(next) as (keyof State)[]).every((k) => next[k] === state[k])) return;
    state = next;
    subs.forEach((f) => f());
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => subs.delete(f);
  },
};

export const useOrbital = () => useSyncExternalStore(orbitalStore.subscribe, orbitalStore.get, orbitalStore.get);

/** Fired by a click on the page; the canvas listens and does the collapse. */
export const measureEvents = new EventTarget();
