"""Turn the generated campus art into pixel-exact sprites for the site.

    python3 tools/build_sprites.py

Reads art/campus-art/ (straight out of the image generator: big, smooth, on
#00FF00) and writes public/campus/: every image shrunk onto one shared pixel
grid, cut down to a small palette, with hard-edged transparency. Each
animated sprite becomes a single strip of equal-width frames, feet on the
bottom row, plus campus.json describing all of it for the renderer.

Because every asset goes through the same steps at the same scale, they all
look like they belong to one picture, whatever the generator did.
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageChops, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art" / "campus-art"
OUT = ROOT / "public" / "campus"

# the campus is ART_W pixels across; everything else is sized against it
ART_W = 440

# target heights in art pixels. People are drawn larger than true scale
# (like most games do): at real scale they'd be ~10px and vanish into the
# paving.
SPRITES = {
    # name: (file, height, frames per second, kind)
    "student-a-front": ("people/student-a-front.png", 18, 7, "figure"),
    "student-a-back": ("people/student-a-back.png", 18, 7, "figure"),
    "student-b-front": ("people/student-b-front.png", 18, 7, "figure"),
    "student-b-back": ("people/student-b-back.png", 18, 7, "figure"),
    "professor-front": ("people/professor-front.png", 18, 6, "figure"),
    "professor-back": ("people/professor-back.png", 18, 6, "figure"),
    "jogger-front": ("people/jogger-front.png", 18, 10, "figure"),
    "jogger-back": ("people/jogger-back.png", 18, 10, "figure"),
    "cyclist-front": ("props/cyclist-front.png", 20, 9, "figure"),
    "cyclist-back": ("props/cyclist-back.png", 20, 9, "figure"),
    "dog-front": ("props/dog-front.png", 9, 10, "figure"),
    "dog-back": ("props/dog-back.png", 9, 10, "figure"),
    "squirrel": ("props/squirrel.png", 7, 3, "figure"),
    "bird": ("sky/bird.png", 7, 8, "figure"),
    "leaf": ("fx/leaf.png", 5, 6, "figure"),
    "boat": ("props/boat.png", 13, 0, "figure"),
    "smoke": ("fx/smoke.png", 14, 3, "smoke"),
    # me, for the intro dialog and the landing page; drawn bigger by CSS.
    # "keep" = already drawn as pixel art, but its pixels don't sit on an even
    # grid, so snapping to one smears the face. Keep the detail at half size
    # and let the browser scale it.
    "me-idle": ("me/me-idle.png", 195, 2, "keep"),
    "me-wave": ("me/me-wave.png", 195, 4, "keep"),
    "me-talk": ("me/me-talk.png", 195, 6, "keep"),
    "me-think": ("me/me-think.png", 195, 2, "keep"),
    "me-surprised": ("me/me-surprised.png", 195, 0, "keep"),
}


# ---------- colour ----------

def tone(rgb: Image.Image, saturation: float, contrast: float) -> Image.Image:
    rgb = ImageEnhance.Color(rgb).enhance(saturation)
    return ImageEnhance.Contrast(rgb).enhance(contrast)


def quantize(rgb: Image.Image, colors: int) -> Image.Image:
    return rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


# ---------- keying ----------

def greenness(r: int, g: int, b: int) -> int:
    return g - max(r, b)


def key_hard(im: Image.Image) -> Image.Image:
    """Solid sprites: green (and the darker green generators drift into) -> transparent."""
    rgba = im.convert("RGBA")
    px = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = px[x, y]
            k = greenness(r, g, b)
            if k > 40 and g > 80:
                px[x, y] = (0, 0, 0, 0)
            elif k > 0:
                # green spill on edge pixels
                px[x, y] = (r, max(r, b), b, 255)
    return rgba


def key_soft(im: Image.Image) -> Image.Image:
    """Smoke: alpha from how not-green a pixel is, colour forced to warm grey."""
    rgba = im.convert("RGBA")
    px = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = px[x, y]
            k = greenness(r, g, b)
            a = max(0.0, min(1.0, 1 - k / 150))
            v = int(min(255, (r + b) / 2 * 1.05 + 30))
            px[x, y] = (v, v, int(v * 0.97), int(a * 255))
    return rgba


# ---------- frames ----------

def frame_boxes(rgba: Image.Image, min_gap: int = 8) -> list[tuple[int, int, int, int]]:
    """Frames are runs of occupied columns separated by empty ones."""
    alpha = rgba.getchannel("A").point(lambda a: 255 if a > 60 else 0)
    w, h = alpha.size
    data = alpha.load()
    occupied = [any(data[x, y] for y in range(0, h, 2)) for x in range(w)]
    runs, start, gap = [], None, 0
    for x, on in enumerate(occupied + [False] * min_gap):
        if on:
            start = x if start is None else start
            gap = 0
        elif start is not None:
            gap += 1
            if gap >= min_gap:
                runs.append((start, x - gap + 1))
                start, gap = None, 0
    boxes = []
    for x0, x1 in runs:
        bb = alpha.crop((x0, 0, x1, h)).getbbox()
        if bb and (bb[2] - bb[0]) * (bb[3] - bb[1]) > 400:  # ignore specks
            boxes.append((x0 + bb[0], bb[1], x0 + bb[2], bb[3]))
    return boxes


def shrink_frame(rgba: Image.Image, scale: float, soft: bool, exact: bool | str = False) -> Image.Image:
    w = max(1, round(rgba.width * scale))
    h = max(1, round(rgba.height * scale))
    if exact == "box":
        small = rgba.resize((w, h), Image.Resampling.LANCZOS)
        small.putalpha(small.getchannel("A").point(lambda v: 255 if v > 110 else 0))
        return small
    if exact:
        small = rgba.resize((w, h), Image.Resampling.NEAREST)
        small.putalpha(small.getchannel("A").point(lambda v: 255 if v > 120 else 0))
        return small
    if not soft:
        rgba = rgba.filter(ImageFilter.UnsharpMask(radius=3, percent=120, threshold=2))
    small = rgba.resize((w, h), Image.Resampling.BOX)
    if soft:
        # three alpha levels keeps smoke soft but still pixel art
        a = small.getchannel("A").point(lambda v: 0 if v < 40 else 110 if v < 120 else 190)
        rgb = small.convert("RGB")
    else:
        a = small.getchannel("A").point(lambda v: 255 if v > 120 else 0)
        # a touch brighter and punchier than the background so they read on top of it
        rgb = ImageEnhance.Brightness(tone(small.convert("RGB"), 1.12, 1.12)).enhance(1.12)
    out = rgb.convert("RGBA")
    out.putalpha(a)
    return out


def darken_edges(rgba: Image.Image) -> Image.Image:
    """Selective outline: the figure's own outermost pixels, a shade darker."""
    a = rgba.getchannel("A")
    edge = ImageChops.subtract(a, a.filter(ImageFilter.MinFilter(3)))
    dark = ImageEnhance.Brightness(rgba.convert("RGB")).enhance(0.62)
    rgb = rgba.convert("RGB")
    rgb.paste(dark, (0, 0), edge)
    out = rgb.convert("RGBA")
    out.putalpha(a)
    return out


def feet_x(rgba: Image.Image) -> int:
    """Middle of the opaque pixels in the bottom third: where the figure stands."""
    a = rgba.getchannel("A")
    w, h = a.size
    data = a.load()
    xs = [x for y in range(h - max(1, h // 3), h) for x in range(w) if data[x, y]]
    return round(sum(xs) / len(xs)) if xs else w // 2


def build_sprite(name: str, file: str, height: int, fps: int, kind: str) -> dict:
    src = Image.open(SRC / file).convert("RGB")
    soft = kind == "smoke"
    exact: bool | str = "box" if kind == "keep" else kind == "pixel"
    keyed = key_soft(src) if soft else key_hard(src)
    boxes = frame_boxes(keyed)
    if not boxes:
        raise SystemExit(f"{file}: found no frames")
    # one scale for the whole sheet, from the tallest frame, so frames stay consistent
    tallest = max(b[3] - b[1] for b in boxes)
    scale = height / tallest
    frames = [shrink_frame(keyed.crop(b), scale, soft, exact) for b in boxes]
    if not soft and not exact:
        frames = [darken_edges(f) for f in frames]
    # Line frames up by the feet, not the bounding box, so an arm that swings
    # out (a wave, a stride) doesn't shove the whole body sideways.
    anchors = [feet_x(f) for f in frames]
    half = max(max(a, f.width - a) for a, f in zip(anchors, frames))
    fw = 2 * half
    fh = max(f.height for f in frames)
    strip = Image.new("RGBA", (fw * len(frames), fh), (0, 0, 0, 0))
    for i, (f, a) in enumerate(zip(frames, anchors)):
        strip.alpha_composite(f, (i * fw + half - a, fh - f.height))
    if exact:
        strip.save(OUT / f"{name}.png", optimize=True)
    else:
        colors = 40 if not soft else 6
        rgb = quantize(strip.convert("RGB"), colors).convert("RGBA")
        rgb.putalpha(strip.getchannel("A"))
        rgb.save(OUT / f"{name}.png", optimize=True)
    return {"src": f"campus/{name}.png", "frames": len(frames), "w": fw, "h": fh, "fps": fps}


def clear_backdrop(rgb: Image.Image, limit: int = 34) -> Image.Image:
    """The generator paints the island on near-black. Flood-fill that from the
    edges to transparent so the island floats on whatever the page colour is,
    without eating dark pixels inside the scene (roofs, windows, the river)."""
    w, h = rgb.size
    px = rgb.load()
    alpha = Image.new("L", (w, h), 255)
    a = alpha.load()
    stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    while stack:
        x, y = stack.pop()
        if not (0 <= x < w and 0 <= y < h) or a[x, y] == 0 or max(px[x, y]) > limit:
            continue
        a[x, y] = 0
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


def build_campus() -> dict:
    src = Image.open(SRC / "base" / "campus.png").convert("RGB")
    h = round(src.height * ART_W / src.width)
    small = tone(src, 0.92, 1.08).resize((ART_W, h), Image.Resampling.BOX)
    clear_backdrop(quantize(small, 64)).save(OUT / "campus.png", optimize=True)
    return {"src": "campus/campus.png", "w": ART_W, "h": h, "scale": ART_W / src.width}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {"campus": build_campus(), "sprites": {}}
    for name, (file, height, fps, kind) in SPRITES.items():
        manifest["sprites"][name] = build_sprite(name, file, height, fps, kind)
        s = manifest["sprites"][name]
        print(f"{name:16} {s['frames']} frames  {s['w']}x{s['h']}")
    (OUT / "campus.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print("campus", manifest["campus"])


if __name__ == "__main__":
    main()
