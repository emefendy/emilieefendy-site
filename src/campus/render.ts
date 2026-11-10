import type { Sheets } from './assets';
import { LAMPS, RIVER } from './map';
import { facing, heading, position } from './walk';
import { PAUSE_S, birdY, isPaused, type Bird, type World } from './world';

/*
 * Draws a World. The canvas is the art's own size (440px across) and CSS
 * scales it up with hard edges, so sprites land exactly on the art's pixel
 * grid. `scale` maps source-art coordinates down to canvas pixels.
 */

const QUESTION_MARK = ['01110', '10001', '00001', '00110', '00100', '00000', '00100'];

export class Renderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private background: HTMLImageElement,
    private sheets: Sheets,
    private scale: number,
  ) {
    ctx.canvas.width = background.width;
    ctx.canvas.height = background.height;
    ctx.imageSmoothingEnabled = false;
  }

  draw(w: World) {
    const { ctx } = this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(this.background, 0, 0);
    this.lamps(w.time);
    this.boat(w.time);
    for (const p of w.smoke) {
      const k = p.age / p.life;
      this.sprite('smoke', Math.min(2, Math.floor(k * 3)), p.x, p.y, { alpha: 0.85 * (1 - k * k) });
    }
    this.ground(w);
    for (const l of w.leaves) {
      const k = l.age / l.life;
      const x = l.x + Math.sin(l.age * 2.4 + l.sway) * 8;
      this.sprite('leaf', Math.floor(l.age * this.fps('leaf')), x, l.y, { alpha: 1 - k * k });
    }
    for (const b of w.birds) {
      if (b.falling) this.fallingBird(b);
      else this.sprite('bird', Math.floor(w.time * this.fps('bird') + b.phase), b.x, birdY(w, b), { flip: b.vx < 0 });
    }
  }

  /** People, the dog and the squirrel, sorted so whoever is lower on screen is drawn in front. */
  private ground(w: World) {
    const layers: { y: number; draw: () => void }[] = [];

    for (const p of w.people) {
      const [x, y] = position(p.walk);
      const dir = heading(p.walk);
      const name = `${p.sprite}-${dir.sheet}`;
      const paused = isPaused(w, p);
      layers.push({
        y,
        draw: () => {
          this.sprite(name, paused ? 0 : Math.floor(w.time * this.fps(name)), x, y, { flip: dir.flip });
          if (paused) this.question(x, y, this.sheets[name]?.info.h ?? 18, p.pausedUntil - w.time);
        },
      });
    }

    // the dog trails its owner by about a second
    const trail = w.owner.trail;
    const at = trail.find((q) => q.t >= w.time - 1.1) ?? trail[0];
    const before = trail.find((q) => q.t >= w.time - 1.3) ?? trail[0];
    if (at && before) {
      const dir = facing(at.x - before.x, at.y - before.y);
      const name = `dog-${dir.sheet}`;
      layers.push({
        y: at.y,
        draw: () =>
          this.sprite(name, Math.floor(w.time * this.fps(name)), at.x + 6 / this.scale, at.y, { flip: dir.flip }),
      });
    }

    const { at: to, from, hop } = w.squirrel;
    const sx = to[0] + (from[0] - to[0]) * hop;
    const sy = to[1] + (from[1] - to[1]) * hop - Math.sin(hop * Math.PI) * 18;
    const frame = hop > 0 ? 3 : Math.floor(w.time * 1.5) % 3;
    layers.push({ y: sy, draw: () => this.sprite('squirrel', frame, sx, sy, { flip: to[0] < from[0] }) });

    layers.sort((a, b) => a.y - b.y).forEach((l) => l.draw());
  }

  private lamps(time: number) {
    const { ctx, scale } = this;
    ctx.globalCompositeOperation = 'lighter';
    LAMPS.forEach(([x, y], i) => {
      const flicker = 0.16 + 0.05 * Math.sin(time * 2.1 + i * 1.7) + 0.03 * Math.sin(time * 7.3 + i);
      const cx = x * scale;
      const cy = y * scale;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 9);
      glow.addColorStop(0, `rgba(255,190,110,${flicker})`);
      glow.addColorStop(1, 'rgba(255,190,110,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(cx - 9, cy - 9, 18, 18);
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  /** Drifts back and forth along the river over 26s, easing at each end. */
  private boat(time: number) {
    const cycle = (time / 26) % 1;
    const u = cycle < 0.5 ? cycle * 2 : 2 - cycle * 2;
    const eased = u * u * (3 - 2 * u);
    const [[x0, y0], [x1, y1]] = RIVER;
    const x = x0 + (x1 - x0) * eased;
    const y = y0 + (y1 - y0) * eased + Math.sin(time * 2.2) * 1.5;
    this.sprite('boat', 0, x, y, { flip: cycle >= 0.5 });
  }

  /** One frame of a sheet, feet at (x, y) in source-art coordinates. */
  private sprite(name: string, frame: number, x: number, y: number, { flip = false, alpha = 1 } = {}) {
    const sheet = this.sheets[name];
    if (!sheet) return;
    const { ctx } = this;
    const { w, h, frames } = sheet.info;
    const f = ((frame % frames) + frames) % frames;
    const dx = Math.round(x * this.scale - w / 2);
    const dy = Math.round(y * this.scale - h);
    ctx.globalAlpha = alpha;
    if (flip) {
      ctx.save();
      ctx.translate(dx + w, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet.img, f * w, 0, w, h, 0, 0, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(sheet.img, f * w, 0, w, h, dx, dy, w, h);
    }
    ctx.globalAlpha = 1;
  }

  private fps(name: string) {
    return this.sheets[name]?.info.fps ?? 6;
  }

  /** Upside down and tumbling, with a few feathers on the first frames. */
  private fallingBird(b: Bird) {
    const sheet = this.sheets['bird'];
    const f = b.falling;
    if (!sheet || !f) return;
    const { ctx, scale } = this;
    const { w, h } = sheet.info;
    const cx = b.x * scale;
    const cy = b.y * scale - h / 2;

    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - Math.max(0, f.age - 1.2));
    ctx.translate(Math.round(cx), Math.round(cy));
    ctx.rotate(Math.PI + f.angle);
    if (b.vx < 0) ctx.scale(-1, 1);
    ctx.drawImage(sheet.img, w, 0, w, h, -w / 2, -h / 2, w, h);
    ctx.restore();

    if (f.age < 0.6) {
      ctx.globalAlpha = 1 - f.age / 0.6;
      ctx.fillStyle = '#e9dcc6';
      const r = 2 + f.age * 14;
      for (let i = 0; i < 4; i++) {
        const a = i * 1.7 + b.phase;
        ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r - f.age * 4), 1, 1);
      }
      ctx.globalAlpha = 1;
    }
  }

  /** A pixel speech bubble with a "?" over someone's head; pops in, fades out. */
  private question(x: number, y: number, spriteH: number, remaining: number) {
    const { ctx } = this;
    const pop = Math.min(1, (PAUSE_S - remaining) / 0.12);
    const bx = Math.round(x * this.scale - 4);
    const by = Math.round(y * this.scale - spriteH - 2 - 10 + (1 - pop) * 3);

    ctx.globalAlpha = Math.min(1, remaining / 0.25);
    ctx.fillStyle = '#2a1d12';
    ctx.fillRect(bx - 1, by - 1, 11, 11);
    ctx.fillRect(bx + 3, by + 10, 3, 2);
    ctx.fillStyle = '#f6ecda';
    ctx.fillRect(bx, by, 9, 9);
    ctx.fillRect(bx + 4, by + 9, 1, 2);
    ctx.fillStyle = '#c2551f';
    QUESTION_MARK.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        if (row[i] === '1') ctx.fillRect(bx + 2 + i, by + 1 + j, 1, 1);
      }
    });
    ctx.globalAlpha = 1;
  }
}
