import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { fragment, vertex } from './shaders';
import { measureEvents, orbitalStore } from './store';
import type { SampleResponse } from './sample.worker';
import type { Theme } from '../hooks/useTheme';

const FOV = 38;
const SECTION_IDS = ['top', 'present', 'past', 'works', 'extras'] as const;

const PALETTE = {
  light: { pos: '#5548c0', neg: '#cf4f86', opacity: 0.62, blending: THREE.NormalBlending, dim: 0.26 },
  dark: { pos: '#b3a6ff', neg: '#62d4e6', opacity: 0.85, blending: THREE.AdditiveBlending, dim: 0.34 },
} as const;

function particleCount() {
  const small = window.innerWidth < 700 || (navigator.hardwareConcurrency ?? 8) <= 4;
  return small ? 14000 : 34000;
}

/** Where each section starts, as a fraction of the way through the orbitals. */
function sectionTops() {
  return SECTION_IDS.map((id) => {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  });
}

function morphFor(scrollMid: number, tops: number[]) {
  for (let i = tops.length - 1; i >= 0; i--) {
    if (scrollMid >= tops[i]!) {
      const next = tops[i + 1];
      if (next === undefined) return i;
      // hold each shape for most of its section, then morph over the last stretch
      const t = (scrollMid - tops[i]!) / (next - tops[i]!);
      return i + THREE.MathUtils.smoothstep(t, 0.55, 1);
    }
  }
  return 0;
}

const damp = (a: number, b: number, rate: number, dt: number) => a + (b - a) * (1 - Math.exp(-rate * dt));

function Cloud({ data, theme, reduced }: { data: SampleResponse; theme: Theme; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { size, camera, viewport, invalidate } = useThree();
  const pal = PALETTE[theme];

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = data.phase[0]!.length;
    data.positions.forEach((p, i) => g.setAttribute('p' + i, new THREE.BufferAttribute(p, 3)));
    // three wants a "position" to compute bounds from; the shader never reads it
    g.setAttribute('position', new THREE.BufferAttribute(data.positions[0]!, 3));
    const ph = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) ph[i * 4 + k] = data.phase[k]![i]!;
    g.setAttribute('ph', new THREE.BufferAttribute(ph, 4));
    g.setAttribute('ph4', new THREE.BufferAttribute(data.phase[4]!, 1));
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) seed[i] = Math.random();
    g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3);
    return g;
  }, [data]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uMorph: { value: 0 },
          uTime: { value: 0 },
          uJitter: { value: 1 },
          uCollapse: { value: 1 }, // start collapsed at the origin, then let go
          uCollapseAt: { value: new THREE.Vector3() },
          uMouse: { value: new THREE.Vector2(9, 9) },
          uMouseForce: { value: 0 },
          uSize: { value: 0 },
          uPixelRatio: { value: 1 },
          uPos: { value: new THREE.Color() },
          uNeg: { value: new THREE.Color() },
          uOpacity: { value: 1 },
        },
      }),
    [],
  );

  useEffect(() => {
    material.uniforms.uPos!.value.set(pal.pos);
    material.uniforms.uNeg!.value.set(pal.neg);
    material.blending = pal.blending;
    material.needsUpdate = true;
  }, [material, pal]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  // everything the frame loop reads but React doesn't need to re-render for
  const live = useRef({
    tops: [] as number[],
    morph: 0,
    mouse: new THREE.Vector2(9, 9),
    force: 0,
    lastMove: -1,
    collapseStart: -10,
    intro: true,
    parallax: new THREE.Vector2(),
  });

  useEffect(() => {
    const l = live.current;
    const measure = () => (l.tops = sectionTops());
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    const tanHalf = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      l.mouse.set(nx * tanHalf * (window.innerWidth / window.innerHeight), ny * tanHalf);
      l.parallax.set(nx, ny);
      l.lastMove = performance.now();
    };
    const onLeave = () => l.mouse.set(9, 9);

    // Pick one particle and collapse onto it. Choosing a particle (rather than
    // the spot you clicked) is the honest version: where it lands is a draw
    // from |ψ|², which is the whole point.
    const onMeasure = () => {
      const g = geometry;
      const n = data.phase[0]!.length;
      const i = Math.floor(Math.random() * n);
      const m = l.morph;
      const k = Math.min(Math.floor(m), 3);
      const t = THREE.MathUtils.smoothstep(m - k, 0, 1);
      const a = g.getAttribute('p' + k) as THREE.BufferAttribute;
      const b = g.getAttribute('p' + Math.min(k + 1, 4)) as THREE.BufferAttribute;
      const at = new THREE.Vector3(
        THREE.MathUtils.lerp(a.getX(i), b.getX(i), t),
        THREE.MathUtils.lerp(a.getY(i), b.getY(i), t),
        THREE.MathUtils.lerp(a.getZ(i), b.getZ(i), t),
      );
      material.uniforms.uCollapseAt!.value.copy(at);
      l.collapseStart = performance.now();
      const scale = THREE.MathUtils.lerp(data.scale[k]!, data.scale[Math.min(k + 1, 4)]!, t);
      orbitalStore.set({ measured: { r: at.length() * scale, at: Date.now() } });
    };

    // with reduced motion the loop only runs on demand, so scrolling has to ask for frames
    const onScroll = () => invalidate();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    measureEvents.addEventListener('measure', onMeasure);
    // let the intro collapse release once we're on screen
    const t = setTimeout(() => (l.intro = false), 250);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      measureEvents.removeEventListener('measure', onMeasure);
      clearTimeout(t);
    };
  }, [data, geometry, material, invalidate]);

  useFrame((state, dt) => {
    const l = live.current;
    const u = material.uniforms;
    const now = performance.now();
    dt = Math.min(dt, 1 / 20);

    // which orbital: driven by where the middle of the screen is
    const target = morphFor(window.scrollY + window.innerHeight * 0.5, l.tops);
    l.morph = reduced ? target : damp(l.morph, target, 2.6, dt);
    u.uMorph!.value = l.morph;
    const index = Math.round(l.morph);
    // a measurement belongs to the state it was taken in
    if (orbitalStore.get().index !== index) orbitalStore.set({ index, measured: null });

    u.uTime!.value = state.clock.elapsedTime;
    u.uJitter!.value = reduced ? 0 : 1;

    // collapse envelope: snap in, hold, then spread back out slowly
    let collapse = 0;
    if (l.intro) collapse = 1;
    else {
      const s = (now - l.collapseStart) / 1000;
      if (s < 0.45) collapse = THREE.MathUtils.smoothstep(s, 0, 0.45);
      else if (s < 0.9) collapse = 1;
      else collapse = 1 - THREE.MathUtils.smoothstep(s, 0.9, 2.6);
    }
    u.uCollapse!.value = reduced ? 0 : damp(u.uCollapse!.value, collapse, l.intro ? 30 : 14, dt);
    if (!l.intro && u.uCollapse!.value < 0.001 && orbitalStore.get().ready === false) orbitalStore.set({ ready: true });

    // the cursor only pushes while it's actually moving
    const moving = now - l.lastMove < 140 ? 1 : 0;
    l.force = damp(l.force, reduced ? 0 : moving, moving ? 6 : 1.6, dt);
    u.uMouse!.value.lerp(l.mouse, 1 - Math.exp(-12 * dt));
    u.uMouseForce!.value = l.force;

    // big in the hero, then off to the side and faded behind the reading column
    const heroH = l.tops[1] ?? size.height;
    const past = THREE.MathUtils.smoothstep(window.scrollY, heroH * 0.25, heroH * 0.85);
    const wide = size.width / size.height > 1.15;
    const g = group.current!;
    const xHero = wide ? viewport.width * 0.2 : 0;
    const yHero = wide ? 0 : viewport.height * 0.02;
    const xRest = wide ? viewport.width * 0.32 : viewport.width * 0.18;
    g.position.x = THREE.MathUtils.lerp(xHero, xRest, past);
    g.position.y = THREE.MathUtils.lerp(yHero, 0, past);
    const s = (wide ? 1 : 0.62) * THREE.MathUtils.lerp(1, 1.12, past);
    g.scale.setScalar(s);

    if (!reduced) {
      g.rotation.y += dt * 0.12;
      g.rotation.x = damp(g.rotation.x, 0.28 - l.parallax.y * 0.18, 2, dt);
      g.rotation.z = damp(g.rotation.z, l.parallax.x * -0.08, 2, dt);
    } else g.rotation.x = 0.28;

    u.uOpacity!.value = pal.opacity * THREE.MathUtils.lerp(1, pal.dim, past);
    u.uPixelRatio!.value = state.gl.getPixelRatio();
    u.uSize!.value = (size.width < 700 ? 13 : 11) * (camera.position.z / 4.2);
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

export default function OrbitalCanvas({ theme, reduced }: { theme: Theme; reduced: boolean }) {
  const [data, setData] = useState<SampleResponse | null>(null);

  useEffect(() => {
    const w = new Worker(new URL('./sample.worker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (e: MessageEvent<SampleResponse>) => {
      setData(e.data);
      w.terminate();
    };
    w.postMessage({ count: particleCount() });
    return () => w.terminate();
  }, []);

  return (
    <div className={'orbital' + (data ? ' on' : '')} aria-hidden="true">
      {data && (
        <Canvas
          dpr={[1, 1.75]}
          camera={{ fov: FOV, position: [0, 0, 4.2], near: 0.1, far: 20 }}
          gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
          frameloop={reduced ? 'demand' : 'always'}
        >
          <Cloud data={data} theme={theme} reduced={reduced} />
        </Canvas>
      )}
    </div>
  );
}
