import { useEffect, type RefObject } from 'react';

type RGB = readonly [number, number, number];

const CELL = 38;
const REACH = 160; // px radius of the cursor bump
// Deeper hues read crisply on the light page; the paler set suits the dark page.
const LIGHT_STOPS: readonly RGB[] = [[58, 77, 184], [96, 80, 200], [132, 86, 204], [150, 104, 212], [110, 128, 214], [78, 98, 196], [58, 77, 184]];
const DARK_STOPS: readonly RGB[] = [[98, 118, 226], [134, 118, 236], [168, 128, 236], [190, 160, 242], [206, 190, 246], [150, 180, 236], [98, 118, 226]];

/**
 * The animated lattice behind the hero. Vivid at the top, veiled down to a
 * faint texture under the sections, and it stops animating once the hero is
 * off screen so it isn't burning frames while you read.
 */
export function useLattice(canvasRef: RefObject<HTMLCanvasElement>, heroRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const cv = canvasRef.current;
    const hero = heroRef.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !hero || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const darkMq = window.matchMedia('(prefers-color-scheme: dark)');

    let stops = LIGHT_STOPS;
    let W = 0, H = 0, cols = 0, rows = 0, t = 0, dpr = 1, lineW = 1, odd = true;
    let mx = -9999, my = -9999, tx = -9999, ty = -9999;
    let bg = 'rgb(250,249,255)';
    let bgRGB: RGB = [250, 249, 255];
    let amp = 1, heroBottom = 0, running = false, raf = 0;
    let Y = new Float32Array(0);

    const readTheme = () => {
      bg = getComputedStyle(document.body).backgroundColor || bg;
      const m = bg.match(/\d+(\.\d+)?/g);
      if (m && m.length >= 3) bgRGB = [+m[0]!, +m[1]!, +m[2]!];
      const lum = (0.299 * bgRGB[0] + 0.587 * bgRGB[1] + 0.114 * bgRGB[2]) / 255;
      stops = lum < 0.5 ? DARK_STOPS : LIGHT_STOPS;
      amp = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lattice')) || 1;
    };
    const veil = (a: number) => `rgba(${bgRGB[0]},${bgRGB[1]},${bgRGB[2]},${a})`;
    const measure = () => {
      heroBottom = hero.offsetTop + hero.offsetHeight;
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // a whole number of device pixels per line, so strokes land on the pixel grid
      const dev = Math.max(1, Math.round(dpr));
      lineW = dev / dpr;
      odd = dev % 2 === 1;
      cols = Math.ceil(W / CELL) + 2;
      rows = Math.ceil(H / CELL) + 2;
      Y = new Float32Array((rows + 2) * (cols + 2));
      measure();
    };
    const snap = (x: number) => (Math.round(x * dpr) + (odd ? 0.5 : 0)) / dpr;
    const color = (f: number) => {
      f = ((f % 1) + 1) % 1;
      const s = f * (stops.length - 1);
      const i = Math.min(Math.floor(s), stops.length - 2);
      const a = s - i;
      const p = stops[i]!, q = stops[i + 1]!;
      return `rgb(${(p[0] + (q[0] - p[0]) * a) | 0},${(p[1] + (q[1] - p[1]) * a) | 0},${(p[2] + (q[2] - p[2]) * a) | 0})`;
    };

    const draw = () => {
      const hb = heroBottom - window.scrollY;
      ctx.globalAlpha = 1;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      const C = cols + 1;
      const span = cols * CELL;

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          let y = r * CELL + Math.sin(c * 0.55 + t * 1.1) * CELL * 0.4 + Math.sin(c * 0.28 - t * 0.65 + r * 0.15) * CELL * 0.22;
          const d = Math.hypot(c * CELL - mx, r * CELL - my);
          if (d < REACH) y -= CELL * 0.6 * (0.5 + 0.5 * Math.cos((Math.PI * d) / REACH));
          Y[r * C + c] = y;
        }
      }
      ctx.lineWidth = lineW;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // rows: one continuous path each, shaded along its length
      for (let r = 0; r <= rows; r++) {
        const off = ((Math.sin(r * 0.45 + t * 0.5) + 1) / 2) * 0.4 + t * 0.1;
        const g = ctx.createLinearGradient(0, 0, span, 0);
        for (let k = 0; k <= 8; k++) g.addColorStop(k / 8, color(k / 8 + off));
        ctx.globalAlpha = (0.5 + 0.14 * Math.sin(r * 0.4 + t * 0.7)) * amp;
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, Y[r * C]!);
        for (let c = 1; c <= cols; c++) ctx.lineTo(c * CELL, Y[r * C + c]!);
        ctx.stroke();
      }

      // columns: straight verticals snapped to the pixel grid
      ctx.globalAlpha = 0.3 * amp;
      for (let c = 0; c <= cols; c++) {
        const x = snap(c * CELL);
        ctx.strokeStyle = color(c / cols);
        ctx.beginPath();
        ctx.moveTo(x, Y[c]!);
        for (let r = 1; r <= rows; r++) ctx.lineTo(x, Y[r * C + c]!);
        ctx.stroke();
      }

      // brighten the columns nearest the cursor
      if (mx > -1000) {
        const c0 = Math.max(0, Math.floor((mx - REACH) / CELL));
        const c1 = Math.min(cols, Math.ceil((mx + REACH) / CELL));
        for (let c = c0; c <= c1; c++) {
          const x = snap(c * CELL);
          ctx.strokeStyle = color(c / cols);
          for (let r = 0; r < rows; r++) {
            const y1 = Y[r * C + c]!, y2 = Y[(r + 1) * C + c]!;
            const prox = 1 - Math.hypot(x - mx, (y1 + y2) / 2 - my) / REACH;
            if (prox <= 0) continue;
            ctx.globalAlpha = prox * 0.55 * amp;
            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.stroke();
          }
        }
      }

      // below the hero, veil the lattice down to a faint texture
      const top = hb - 150, bot = hb + 30;
      if (top < H) {
        const v = ctx.createLinearGradient(0, top, 0, bot);
        v.addColorStop(0, veil(0));
        v.addColorStop(1, veil(0.9));
        ctx.globalAlpha = 1;
        ctx.fillStyle = v;
        ctx.fillRect(0, Math.max(0, top), W, H);
      }
      ctx.globalAlpha = 1;
    };

    const tick = () => {
      if (heroBottom - window.scrollY < -120) {
        running = false;
        draw();
        return;
      }
      t += 0.009;
      if (Math.abs(tx - mx) > 2000 || Math.abs(ty - my) > 2000) {
        mx = tx;
        my = ty;
      } else {
        mx += (tx - mx) * 0.22;
        my += (ty - my) * 0.22;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (reduce.matches) return draw();
      if (!running && heroBottom - window.scrollY >= -120) {
        running = true;
        raf = requestAnimationFrame(tick);
      } else if (!running) draw();
    };
    const retheme = () => {
      readTheme();
      draw();
    };
    const onResize = () => {
      resize();
      draw();
      wake();
    };
    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const onLeave = () => {
      tx = ty = -9999;
    };
    const remeasure = () => {
      measure();
      wake();
    };

    readTheme();
    resize();
    wake();

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    darkMq.addEventListener('change', retheme);
    reduce.addEventListener('change', wake);
    const mo = new MutationObserver(retheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    const ro = new ResizeObserver(remeasure);
    ro.observe(hero);
    document.fonts?.ready.then(remeasure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      darkMq.removeEventListener('change', retheme);
      reduce.removeEventListener('change', wake);
      mo.disconnect();
      ro.disconnect();
    };
  }, [canvasRef, heroRef]);
}
