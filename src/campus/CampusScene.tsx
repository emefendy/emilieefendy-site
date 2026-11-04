import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { BUILDINGS, CANOPIES, CHIMNEYS, LAMPS, LAWNS, RIVER, type Pt } from './map';
import { facing, heading, position, step, type Walker } from './walk';
import type { SceneId } from '../content';

type SpriteInfo = { src: string; frames: number; w: number; h: number; fps: number };
type Manifest = {
  campus: { src: string; w: number; h: number; scale: number };
  sprites: Record<string, SpriteInfo>;
};
type Sheets = Record<string, { img: HTMLImageElement; info: SpriteInfo }>;

const SRC_W = 1415;
const SRC_H = 1111;

function load(src: string) {
  return new Promise<HTMLImageElement>((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = fail;
    img.src = src;
  });
}

// a small seeded random so every visit starts with the same layout
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Person = {
  base: string;
  walk: Walker;
  trail: { t: number; x: number; y: number }[];
  /** clicked: stands still with a ? over their head until this time */
  pausedUntil: number;
};

// a 5x7 pixel question mark for the bubble over someone you've clicked
const QUESTION = ['01110', '10001', '00001', '00110', '00100', '00000', '00100'];
type Bird = { x: number; y: number; vx: number; phase: number; wob: number };
type Puff = { x: number; y: number; age: number; life: number };
type Leaf = { x: number; y: number; age: number; life: number; sway: number };

type Props = { focus: SceneId | null; onOpen: (scene: SceneId) => void; reduced: boolean };

/**
 * Where to put the camera so a building fills the space beside the scene
 * panel. Returns a CSS transform for the campus, which scales about the
 * building's centre and then slides that centre into place.
 */
function framing(outer: DOMRect, box: readonly [number, number, number, number]) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const [x0, y0, x1, y1] = box;
  const cx = (x0 + x1) / 2 / SRC_W;
  const cy = (y0 + y1) / 2 / SRC_H;
  const bw = ((x1 - x0) / SRC_W) * outer.width;
  const bh = ((y1 - y0) / SRC_H) * outer.height;
  const wide = vw > 900;
  // desktop: fly straight in to fill the screen, then the section opens over it;
  // phone: building stays on top, section below
  const areaH = wide ? vh : vh * 0.42;
  const scale = Math.min((vw * (wide ? 1.05 : 0.86)) / bw, (areaH * (wide ? 1.05 : 0.84)) / bh);
  const tx = vw / 2 - (outer.left + cx * outer.width);
  const ty = (wide ? vh / 2 : areaH / 2 + 8) - (outer.top + cy * outer.height);
  return {
    transformOrigin: `${cx * 100}% ${cy * 100}%`,
    transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
  };
}

/**
 * The campus: a painted background with the people, birds, smoke, leaves
 * and the boat drawn on top every frame. The canvas is the art's own size
 * (440 pixels across) and CSS scales it up with hard pixel edges, so every
 * sprite lands exactly on the art's pixel grid.
 */
export function CampusScene({ focus, onOpen, reduced }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [ready, setReady] = useState(false);
  const [cam, setCam] = useState<CSSProperties>({});

  // point the camera at the focused building, and keep it there through resizes
  useLayoutEffect(() => {
    const b = BUILDINGS.find((x) => x.scene === focus);
    const el = box.current;
    if (!b || !el) return setCam({});
    const aim = () => setCam(framing(el.getBoundingClientRect(), b.box));
    aim();
    window.addEventListener('resize', aim);
    return () => window.removeEventListener('resize', aim);
  }, [focus]);

  useEffect(() => {
    let live = true;
    fetch('campus/campus.json')
      .then((r) => r.json() as Promise<Manifest>)
      .then((m) => live && setManifest(m))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!manifest) return;
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    let alive = true;
    let raf = 0;
    let visible = true;
    let cleanup = () => {};

    (async () => {
      const bg = await load(manifest.campus.src);
      const sheets: Sheets = {};
      await Promise.all(
        Object.entries(manifest.sprites).map(async ([k, info]) => {
          sheets[k] = { img: await load(info.src), info };
        }),
      );
      if (!alive) return;

      const S = manifest.campus.scale; // source pixels -> art pixels
      const W = manifest.campus.w;
      const H = manifest.campus.h;
      cv.width = W;
      cv.height = H;
      ctx.imageSmoothingEnabled = false;
      const rand = rng(7);

      const people: Person[] = [
        { base: 'student-a', walk: { from: 'lib', to: 'pw', t: 0.3, speed: 26 } },
        { base: 'professor', walk: { from: 'j', to: 'ps', t: 0.6, speed: 17 } },
        { base: 'student-b', walk: { from: 'pe', to: 'ps', t: 0.2, speed: 23 } },
        { base: 'jogger', walk: { from: 'b', to: 'j', t: 0.1, speed: 52 } },
        { base: 'cyclist', walk: { from: 'srv', to: 'j', t: 0.4, speed: 72 } },
      ].map((p) => ({ ...p, walk: p.walk as Walker, trail: [] as Person['trail'], pausedUntil: 0 }));
      const professor = people[1]!;

      const birds: Bird[] = [];
      let nextFlock = 2;
      const puffs: Puff[] = [];
      const puffClock = CHIMNEYS.map((_, i) => i * 0.7);
      const leaves: Leaf[] = [];
      let leafClock = 0;
      let squirrel: { at: Pt; from: Pt; hop: number } = { at: LAWNS[0]!, from: LAWNS[0]!, hop: 0 };
      let pointer: [number, number] | null = null;

      const toSrc = (e: PointerEvent | MouseEvent): [number, number] => {
        const r = cv.getBoundingClientRect();
        return [((e.clientX - r.left) / r.width) * SRC_W, ((e.clientY - r.top) / r.height) * SRC_H];
      };
      // who's under the pointer: a box around each walker's sprite, a little generous so they're easy to hit
      const personAt = ([px, py]: [number, number]) => {
        let hit: Person | null = null;
        let best = Infinity;
        for (const p of people) {
          const [x, y] = position(p.walk);
          const s = sheets[`${p.base}-front`]?.info;
          if (!s) continue;
          const halfW = (s.w / 2 + 3) / S;
          const h = (s.h + 3) / S;
          if (Math.abs(px - x) <= halfW && py <= y + 3 / S && py >= y - h && y < best) {
            hit = p;
            best = y;
          }
        }
        return hit;
      };
      const onMove = (e: PointerEvent) => {
        pointer = toSrc(e);
        cv.style.cursor = personAt(pointer) ? 'pointer' : '';
      };
      const onLeave = () => (pointer = null);
      const onClick = (e: MouseEvent) => {
        const p = personAt(toSrc(e));
        if (p) p.pausedUntil = time + 2;
      };
      cv.parentElement?.addEventListener('pointermove', onMove);
      cv.parentElement?.addEventListener('pointerleave', onLeave);
      cv.addEventListener('click', onClick);

      // draw one frame of a sheet with its feet at (x, y) in art pixels
      const sprite = (name: string, frame: number, x: number, y: number, flip = false, alpha = 1) => {
        const s = sheets[name];
        if (!s) return;
        const { w, h, frames } = s.info;
        const f = ((frame % frames) + frames) % frames;
        const dx = Math.round(x - w / 2);
        const dy = Math.round(y - h);
        ctx.globalAlpha = alpha;
        if (flip) {
          ctx.save();
          ctx.translate(dx + w, dy);
          ctx.scale(-1, 1);
          ctx.drawImage(s.img, f * w, 0, w, h, 0, 0, w, h);
          ctx.restore();
        } else ctx.drawImage(s.img, f * w, 0, w, h, dx, dy, w, h);
        ctx.globalAlpha = 1;
      };
      const fpsOf = (name: string) => sheets[name]?.info.fps ?? 6;

      // a little speech bubble with a pixel ? in it, its tail at (x, y); pops in, then fades at the end
      const question = (x: number, y: number, left: number) => {
        const pop = Math.min(1, (2 - left) / 0.12);
        const alpha = Math.min(1, left / 0.25);
        const bx = Math.round(x - 4);
        const by = Math.round(y - 10 + (1 - pop) * 3);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#2a1d12';
        ctx.fillRect(bx - 1, by - 1, 11, 11);
        ctx.fillRect(bx + 3, by + 10, 3, 2);
        ctx.fillStyle = '#f6ecda';
        ctx.fillRect(bx, by, 9, 9);
        ctx.fillRect(bx + 4, by + 9, 1, 2);
        ctx.fillStyle = '#c2551f';
        QUESTION.forEach((row, j) =>
          [...row].forEach((c, i) => {
            if (c === '1') ctx.fillRect(bx + 2 + i, by + 1 + j, 1, 1);
          }),
        );
        ctx.globalAlpha = 1;
      };

      let time = 0;
      let last = performance.now();

      const update = (dt: number) => {
        time += dt;
        for (const p of people) {
          if (time >= p.pausedUntil) p.walk = step(p.walk, dt, rand);
          const [x, y] = position(p.walk);
          p.trail.push({ t: time, x, y });
          while (p.trail.length > 2 && p.trail[0]!.t < time - 2) p.trail.shift();
        }

        // a loose flock every 14–24 seconds, alternating direction
        nextFlock -= dt;
        if (nextFlock <= 0 && birds.length === 0) {
          const ltr = rand() < 0.6;
          const n = 3 + Math.floor(rand() * 3);
          const baseY = 40 + rand() * 120;
          for (let i = 0; i < n; i++) {
            birds.push({
              x: ltr ? -40 - i * 28 - rand() * 20 : SRC_W + 40 + i * 28 + rand() * 20,
              y: baseY + (rand() - 0.5) * 60,
              vx: (ltr ? 1 : -1) * (110 + rand() * 30),
              phase: rand() * 10,
              wob: 6 + rand() * 6,
            });
          }
          nextFlock = 14 + rand() * 10;
        }
        for (const b of birds) b.x += b.vx * dt;
        for (let i = birds.length - 1; i >= 0; i--) if (birds[i]!.x < -120 || birds[i]!.x > SRC_W + 120) birds.splice(i, 1);

        // chimney smoke, staggered
        CHIMNEYS.forEach(([x, y], i) => {
          puffClock[i]! -= dt;
          if (puffClock[i]! <= 0) {
            puffs.push({ x, y, age: 0, life: 3.4 + rand() });
            puffClock[i] = 2 + rand() * 1.4;
          }
        });
        for (const p of puffs) {
          p.age += dt;
          p.y -= 14 * dt;
          p.x += 6 * dt;
        }
        for (let i = puffs.length - 1; i >= 0; i--) if (puffs[i]!.age > puffs[i]!.life) puffs.splice(i, 1);

        // leaves drift out of the trees
        leafClock -= dt;
        if (leafClock <= 0) {
          const [x0, y0, x1, y1] = CANOPIES[Math.floor(rand() * CANOPIES.length)]!;
          leaves.push({ x: x0 + rand() * (x1 - x0), y: y0 + rand() * (y1 - y0), age: 0, life: 3.5 + rand() * 2, sway: rand() * 6 });
          leafClock = 0.7 + rand() * 0.9;
        }
        for (const l of leaves) {
          l.age += dt;
          l.y += 16 * dt;
        }
        for (let i = leaves.length - 1; i >= 0; i--) if (leaves[i]!.age > leaves[i]!.life) leaves.splice(i, 1);

        // the squirrel bolts when the cursor gets close
        if (squirrel.hop > 0) squirrel.hop = Math.max(0, squirrel.hop - dt / 0.7);
        else if (pointer && Math.hypot(pointer[0] - squirrel.at[0], pointer[1] - squirrel.at[1]) < 70) {
          const options = LAWNS.filter((l) => l !== squirrel.at);
          squirrel = { from: squirrel.at, at: options[Math.floor(rand() * options.length)]!, hop: 1 };
        }
      };

      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(bg, 0, 0);

        // lamp glow, a slow uneven flicker
        ctx.globalCompositeOperation = 'lighter';
        LAMPS.forEach(([x, y], i) => {
          const f = 0.16 + 0.05 * Math.sin(time * 2.1 + i * 1.7) + 0.03 * Math.sin(time * 7.3 + i);
          const g = ctx.createRadialGradient(x * S, y * S, 0, x * S, y * S, 9);
          g.addColorStop(0, `rgba(255,190,110,${f})`);
          g.addColorStop(1, 'rgba(255,190,110,0)');
          ctx.fillStyle = g;
          ctx.fillRect(x * S - 9, y * S - 9, 18, 18);
        });
        ctx.globalCompositeOperation = 'source-over';

        // the boat drifts back and forth across the river and bobs
        const cycle = (time / 26) % 1;
        const u = cycle < 0.5 ? cycle * 2 : 2 - cycle * 2;
        const e = u * u * (3 - 2 * u);
        const bx = RIVER[0][0] + (RIVER[1][0] - RIVER[0][0]) * e;
        const by = RIVER[0][1] + (RIVER[1][1] - RIVER[0][1]) * e + Math.sin(time * 2.2) * 1.5;
        sprite('boat', 0, bx * S, by * S, cycle >= 0.5);

        // smoke above the roofs
        for (const p of puffs) {
          const k = p.age / p.life;
          sprite('smoke', Math.min(2, Math.floor(k * 3)), p.x * S, p.y * S, false, 0.85 * (1 - k * k));
        }

        // everything standing on the ground, back to front
        type Thing = { y: number; draw: () => void };
        const ground: Thing[] = [];
        for (const p of people) {
          const [x, y] = position(p.walk);
          const f = heading(p.walk);
          const name = `${p.base}-${f.sheet}`;
          const paused = time < p.pausedUntil;
          ground.push({
            y,
            draw: () => {
              // standing still on a paused frame, otherwise mid-stride
              sprite(name, paused ? 0 : Math.floor(time * fpsOf(name)), x * S, y * S, f.flip);
              if (paused) question(x * S, y * S - (sheets[name]?.info.h ?? 18) - 2, p.pausedUntil - time);
            },
          });
        }
        // the dog trails the professor by about a second
        const trail = professor.trail;
        const lag = trail.find((q) => q.t >= time - 1.1) ?? trail[0];
        const prev = trail.find((q) => q.t >= time - 1.3) ?? trail[0];
        if (lag && prev) {
          const f = facing(lag.x - prev.x, lag.y - prev.y);
          const name = `dog-${f.sheet}`;
          ground.push({ y: lag.y, draw: () => sprite(name, Math.floor(time * fpsOf(name)), lag.x * S + 6, lag.y * S, f.flip) });
        }
        {
          const k = squirrel.hop;
          const sx = squirrel.at[0] + (squirrel.from[0] - squirrel.at[0]) * k;
          const sy = squirrel.at[1] + (squirrel.from[1] - squirrel.at[1]) * k - Math.sin(k * Math.PI) * 18;
          const frame = k > 0 ? 3 : Math.floor(time * 1.5) % 3;
          ground.push({ y: sy, draw: () => sprite('squirrel', frame, sx * S, sy * S, squirrel.at[0] < squirrel.from[0]) });
        }
        ground.sort((a, b) => a.y - b.y).forEach((g) => g.draw());

        for (const l of leaves) {
          const k = l.age / l.life;
          sprite('leaf', Math.floor(l.age * fpsOf('leaf')), (l.x + Math.sin(l.age * 2.4 + l.sway) * 8) * S, l.y * S, false, 1 - k * k);
        }
        for (const b of birds) {
          const y = b.y + Math.sin(time * 2 + b.phase) * b.wob;
          sprite('bird', Math.floor(time * fpsOf('bird') + b.phase), b.x * S, y * S, b.vx < 0);
        }
      };

      const tick = (now: number) => {
        if (!alive) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (visible) {
          update(dt);
          draw();
        }
        raf = requestAnimationFrame(tick);
      };

      if (reduced) {
        // a still frame: everyone placed, nothing moving
        update(0.001);
        draw();
      } else raf = requestAnimationFrame(tick);
      setReady(true);

      const io = new IntersectionObserver(([e]) => {
        visible = !!e?.isIntersecting;
        last = performance.now();
      });
      io.observe(cv);
      cleanup = () => {
        io.disconnect();
        cv.parentElement?.removeEventListener('pointermove', onMove);
        cv.removeEventListener('click', onClick);
        cv.parentElement?.removeEventListener('pointerleave', onLeave);
      };
    })().catch(() => {});

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, [manifest, reduced]);

  return (
    <div className={'campus' + (ready ? ' on' : '') + (focus ? ' zoomed' : '')} ref={box}>
      <div className="campus-cam" style={cam}>
      <canvas ref={canvas} className="campus-cv" role="img" aria-label="A pixel-art college campus at dusk: libraries, a workshop, an observatory and a server hall around a statue, with people walking the paths" />
      {ready &&
        BUILDINGS.map((b, i) => (
          <button
            key={b.scene}
            type="button"
            className="campus-tag"
            style={{ left: `${(b.tag[0] / SRC_W) * 100}%`, top: `${(b.tag[1] / SRC_H) * 100}%`, '--i': i } as CSSProperties}
            onClick={() => onOpen(b.scene)}
            tabIndex={focus ? -1 : 0}
          >
            <span className="campus-tag-n">{String(i + 1).padStart(2, '0')}</span>
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
