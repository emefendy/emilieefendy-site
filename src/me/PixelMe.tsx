import { useEffect, useState, type CSSProperties } from 'react';
import { reducedMotion } from '../lib/motion';

type SpriteInfo = { src: string; frames: number; w: number; h: number; fps: number };
type Manifest = { sprites: Record<string, SpriteInfo> };

let manifest: Promise<Manifest> | null = null;
/** campus.json, fetched once and shared with whoever asks. */
export function loadManifest() {
  manifest ??= fetch('campus/campus.json').then((r) => r.json() as Promise<Manifest>);
  return manifest;
}

export type Mood = 'idle' | 'wave' | 'talk';

type Props = { mood: Mood; scale?: number; className?: string };

/**
 * Pixel me. Every sheet is anchored at the feet in the middle of its frame,
 * so swapping moods (or an arm swinging out to wave) never moves her.
 */
export function PixelMe({ mood, scale = 5, className }: Props) {
  const [sheets, setSheets] = useState<Record<Mood, SpriteInfo> | null>(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let live = true;
    loadManifest()
      .then((m) => {
        const s = m.sprites;
        if (live && s['me-idle'] && s['me-wave'] && s['me-talk']) {
          setSheets({ idle: s['me-idle'], wave: s['me-wave'], talk: s['me-talk'] });
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    setFrame(0);
    if (!sheets || reducedMotion()) return;
    if (mood === 'idle') {
      // stand still, blink now and then
      let t: ReturnType<typeof setTimeout>;
      const blink = () => {
        setFrame(1);
        t = setTimeout(() => {
          setFrame(0);
          t = setTimeout(blink, 2400 + Math.random() * 2400);
        }, 140);
      };
      t = setTimeout(blink, 1600);
      return () => clearTimeout(t);
    }
    const s = sheets[mood];
    const id = setInterval(() => setFrame((f) => (f + 1) % s.frames), 1000 / s.fps);
    return () => clearInterval(id);
  }, [mood, sheets]);

  if (!sheets) return <span className={'pxme ' + (className ?? '')} aria-hidden="true" />;
  const s = sheets[mood];
  const boxW = Math.max(...Object.values(sheets).map((x) => x.w));
  return (
    <span
      className={'pxme ' + (className ?? '')}
      aria-hidden="true"
      style={{ width: boxW * scale, height: s.h * scale } as CSSProperties}
    >
      <span
        className="pxme-img"
        style={{
          width: s.w * scale,
          height: s.h * scale,
          backgroundImage: `url(${s.src})`,
          backgroundSize: `${s.w * s.frames * scale}px ${s.h * scale}px`,
          backgroundPosition: `${-(frame % s.frames) * s.w * scale}px 0`,
        }}
      />
    </span>
  );
}
