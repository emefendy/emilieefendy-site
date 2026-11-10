/** One sprite sheet: `frames` cells of w×h laid out left to right. */
export type SpriteInfo = { src: string; frames: number; w: number; h: number; fps: number };

/** public/campus/campus.json, written by tools/build_sprites.py */
export type Manifest = {
  campus: { src: string; w: number; h: number; scale: number };
  sprites: Record<string, SpriteInfo>;
};

type Sheet = { img: HTMLImageElement; info: SpriteInfo };
export type Sheets = Record<string, Sheet>;

let manifest: Promise<Manifest> | undefined;

export function loadManifest() {
  manifest ??= fetch('campus/campus.json').then((r) => {
    if (!r.ok) throw new Error(`campus.json: ${r.status}`);
    return r.json() as Promise<Manifest>;
  });
  return manifest;
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function loadSheets(sprites: Manifest['sprites']): Promise<Sheets> {
  const entries = await Promise.all(
    Object.entries(sprites).map(async ([name, info]) => [name, { img: await loadImage(info.src), info }] as const),
  );
  return Object.fromEntries(entries);
}
