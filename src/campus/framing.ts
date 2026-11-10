import type { CSSProperties } from 'react';
import { ART_H, ART_W, type Box } from './map';

const DESKTOP = 900;

/**
 * The transform that zooms the campus onto one building. On desktop the
 * building fills the screen and the section panel opens over it; on a phone
 * it sits in the top ~40% with the panel below.
 */
export function framing(campus: DOMRect, [x0, y0, x1, y1]: Box): CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const wide = vw > DESKTOP;

  const cx = (x0 + x1) / 2 / ART_W;
  const cy = (y0 + y1) / 2 / ART_H;
  const boxW = ((x1 - x0) / ART_W) * campus.width;
  const boxH = ((y1 - y0) / ART_H) * campus.height;

  const areaH = wide ? vh : vh * 0.42;
  const scale = wide
    ? Math.min((vw * 1.05) / boxW, (areaH * 1.05) / boxH)
    : Math.min((vw * 0.86) / boxW, (areaH * 0.84) / boxH);
  const tx = vw / 2 - (campus.left + cx * campus.width);
  const ty = (wide ? vh / 2 : areaH / 2 + 8) - (campus.top + cy * campus.height);

  return {
    transformOrigin: `${cx * 100}% ${cy * 100}%`,
    transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
  };
}
