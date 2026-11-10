import { useEffect, useState } from 'react';
import { loadManifest, type SpriteInfo } from '../campus/assets';
import { cx } from '../lib/cx';
import { reducedMotion } from '../lib/motion';

export type Mood = 'idle' | 'wave' | 'talk' | 'think' | 'surprised';

type Props = {
  mood: Mood;
  /** drawn height in CSS pixels */
  height?: number;
  className?: string;
};

const BLINK_MS = 140;

/**
 * Every sheet is anchored at the feet in the middle of its frame, so swapping
 * moods (or an arm swinging out to wave) never shifts her.
 */
export function PixelMe({ mood, height = 160, className }: Props) {
  const [sheets, setSheets] = useState<Record<Mood, SpriteInfo> | null>(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let live = true;
    loadManifest()
      .then((m) => {
        const s = m.sprites;
        const [idle, wave, talk] = [s['me-idle'], s['me-wave'], s['me-talk']];
        if (live && idle && wave && talk) {
          setSheets({ idle, wave, talk, think: s['me-think'] ?? idle, surprised: s['me-surprised'] ?? idle });
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    setFrame(0);
    if (!sheets || reducedMotion() || mood === 'surprised') return;
    if (mood === 'idle' || mood === 'think') {
      let t: ReturnType<typeof setTimeout>;
      const blink = () => {
        setFrame(1);
        t = setTimeout(() => {
          setFrame(0);
          t = setTimeout(blink, 2400 + Math.random() * 2400);
        }, BLINK_MS);
      };
      t = setTimeout(blink, 1600);
      return () => clearTimeout(t);
    }
    const s = sheets[mood];
    const id = setInterval(() => setFrame((f) => (f + 1) % s.frames), 1000 / s.fps);
    return () => clearInterval(id);
  }, [mood, sheets]);

  if (!sheets) return <span className={cx('pxme', className)} aria-hidden="true" />;
  const s = sheets[mood];
  const scale = height / s.h;
  const boxW = Math.max(...Object.values(sheets).map((x) => x.w));
  return (
    <span className={cx('pxme', className)} aria-hidden="true" style={{ width: boxW * scale, height: s.h * scale }}>
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
