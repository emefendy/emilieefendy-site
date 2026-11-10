import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { SCENES, type SceneId } from '../content';
import { cx } from '../lib/cx';
import { ordinal } from '../lib/format';
import { framing } from './framing';
import { ART_H, ART_W, BUILDINGS } from './map';
import { useCampus } from './useCampus';

type Props = { focus: SceneId | null; onOpen: (scene: SceneId) => void; reduced: boolean };

const labelOf = (id: SceneId) => SCENES.find((s) => s.id === id)?.label ?? id;

export function CampusScene({ focus, onOpen, reduced }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const ready = useCampus(canvas, reduced);
  const [camera, setCamera] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    const building = BUILDINGS.find((b) => b.scene === focus);
    const el = box.current;
    if (!building || !el) return setCamera({});
    const aim = () => setCamera(framing(el.getBoundingClientRect(), building.box));
    aim();
    window.addEventListener('resize', aim);
    return () => window.removeEventListener('resize', aim);
  }, [focus]);

  return (
    <div className={cx('campus', ready && 'on', focus && 'zoomed')} ref={box}>
      <div className="campus-cam" style={camera}>
        <canvas ref={canvas} className="campus-cv" role="img" aria-label="Campus map" />
        {ready &&
          BUILDINGS.map((b, i) => (
            <button
              key={b.scene}
              type="button"
              className="campus-tag"
              style={
                { left: `${(b.tag[0] / ART_W) * 100}%`, top: `${(b.tag[1] / ART_H) * 100}%`, '--i': i } as CSSProperties
              }
              onClick={() => onOpen(b.scene)}
              tabIndex={focus ? -1 : 0}
            >
              <span className="campus-tag-n">{ordinal(i)}</span>
              {labelOf(b.scene)}
            </button>
          ))}
      </div>
    </div>
  );
}
