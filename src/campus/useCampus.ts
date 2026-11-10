import { useEffect, useState, type RefObject } from 'react';
import { seeded } from '../lib/random';
import { loadImage, loadManifest, loadSheets, type Sheets } from './assets';
import { ART_H, ART_W, type Pt } from './map';
import { Renderer } from './render';
import { position } from './walk';
import { birdY, createWorld, knockDown, pause, update, type World } from './world';

/** Longest step the simulation takes, so a backgrounded tab doesn't teleport everyone. */
const MAX_DT = 0.05;

/**
 * Loads the art and runs the campus on `canvas` until unmount. With reduced
 * motion it draws a single still frame. Returns true once the first frame is up.
 */
export function useCampus(canvas: RefObject<HTMLCanvasElement>, reduced: boolean) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;

    let stop: (() => void) | undefined;
    const unmounted = new AbortController();

    (async () => {
      const manifest = await loadManifest();
      const [background, sheets] = await Promise.all([loadImage(manifest.campus.src), loadSheets(manifest.sprites)]);
      if (unmounted.signal.aborted) return;
      stop = run(
        cv,
        new Renderer(ctx, background, sheets, manifest.campus.scale),
        sheets,
        manifest.campus.scale,
        reduced,
      );
      setReady(true);
    })().catch((err: unknown) => console.error('campus failed to load', err));

    return () => {
      unmounted.abort();
      stop?.();
    };
  }, [canvas, reduced]);

  return ready;
}

function run(cv: HTMLCanvasElement, renderer: Renderer, sheets: Sheets, scale: number, reduced: boolean) {
  const world = createWorld();
  const rand = seeded(7);

  if (reduced) {
    update(world, 0.001, rand);
    renderer.draw(world);
    return () => {};
  }

  const toArt = (e: MouseEvent): Pt => {
    const r = cv.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * ART_W, ((e.clientY - r.top) / r.height) * ART_H];
  };
  const hit = (at: Pt) => personAt(world, sheets, scale, at) ?? birdAt(world, sheets, scale, at);

  const onMove = (e: PointerEvent) => {
    world.pointer = toArt(e);
    cv.style.cursor = hit(world.pointer) ? 'pointer' : '';
  };
  const onLeave = () => {
    world.pointer = null;
  };
  const onClick = (e: MouseEvent) => {
    const at = toArt(e);
    const bird = birdAt(world, sheets, scale, at);
    if (bird) return knockDown(bird, world, rand);
    const person = personAt(world, sheets, scale, at);
    if (person) pause(person, world);
  };

  // listen on the wrapper so the building tags on top don't hide the pointer from the squirrel
  const area = cv.parentElement ?? cv;
  area.addEventListener('pointermove', onMove);
  area.addEventListener('pointerleave', onLeave);
  cv.addEventListener('click', onClick);

  let visible = true;
  let last = performance.now();
  let raf = requestAnimationFrame(function tick(now) {
    const dt = Math.min(MAX_DT, (now - last) / 1000);
    last = now;
    if (visible) {
      update(world, dt, rand);
      renderer.draw(world);
    }
    raf = requestAnimationFrame(tick);
  });

  const io = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    last = performance.now();
  });
  io.observe(cv);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    area.removeEventListener('pointermove', onMove);
    area.removeEventListener('pointerleave', onLeave);
    cv.removeEventListener('click', onClick);
  };
}

/** The front-most walker under the pointer, with a few pixels of slack around each sprite. */
function personAt(w: World, sheets: Sheets, scale: number, [px, py]: Pt) {
  const slack = 3 / scale;
  let front = null;
  for (const p of w.people) {
    const size = sheets[`${p.sprite}-front`]?.info;
    if (!size) continue;
    const [x, y] = position(p.walk);
    const halfW = size.w / 2 / scale + slack;
    const h = size.h / scale + slack;
    const inside = Math.abs(px - x) <= halfW && py >= y - h && py <= y + slack;
    if (inside && (!front || y > position(front.walk)[1])) front = p;
  }
  return front;
}

function birdAt(w: World, sheets: Sheets, scale: number, [px, py]: Pt) {
  const size = sheets['bird']?.info;
  if (!size) return null;
  // birds are tiny, so be generous
  const r = (Math.max(size.w, size.h) / 2 + 5) / scale;
  const centreOffset = size.h / 2 / scale;
  return w.birds.find((b) => !b.falling && Math.hypot(px - b.x, py - (birdY(w, b) - centreOffset)) < r) ?? null;
}
