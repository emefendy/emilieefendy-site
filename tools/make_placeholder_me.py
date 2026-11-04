"""A stand-in pixel me, until the real sprite comes back from the image generator.

    python3 tools/make_placeholder_me.py && python3 tools/build_sprites.py

Draws three small sheets (idle, wave, talk) pixel by pixel, then blows them up
onto #00FF00 like a generated sheet, so they go through build_sprites.py the
same way the real ones will. Replace the files in art/campus-art/me/ with
generated ones and this script isn't needed any more.
"""
from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "art" / "campus-art" / "me"
W, H = 20, 31
BLOWUP = 12
GAP = 60

HAIR = (74, 44, 28)
HAIR_HI = (107, 65, 40)
SKIN = (236, 196, 160)
SKIN_SH = (206, 160, 126)
EYE = (40, 26, 18)
BLUSH = (232, 150, 132)
MOUTH = (168, 87, 74)
MOUTH_OPEN = (110, 50, 42)
SWEATER = (239, 227, 200)
SWEATER_SH = (203, 185, 149)
PANTS = (58, 51, 64)
BOOT = (107, 63, 34)


def base() -> dict[tuple[int, int], tuple[int, int, int]]:
    px: dict[tuple[int, int], tuple[int, int, int]] = {}

    def rect(x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                px[(x, y)] = c

    # hair behind, falling to the shoulders
    rect(4, 2, 15, 14, HAIR)
    rect(6, 0, 13, 1, HAIR)
    rect(5, 1, 14, 1, HAIR)
    # face
    rect(6, 5, 13, 10, SKIN)
    rect(7, 11, 12, 11, SKIN)
    rect(6, 10, 6, 10, SKIN_SH)
    rect(13, 10, 13, 10, SKIN_SH)
    # bangs
    rect(6, 4, 13, 4, HAIR)
    for x in (6, 7, 12, 13):
        px[(x, 5)] = HAIR
    px[(9, 1)] = HAIR_HI
    px[(10, 1)] = HAIR_HI
    px[(8, 2)] = HAIR_HI
    # eyes, cheeks, mouth
    for y in (7, 8):
        px[(8, y)] = EYE
        px[(11, y)] = EYE
    px[(7, 9)] = BLUSH
    px[(12, 9)] = BLUSH
    px[(9, 10)] = MOUTH
    px[(10, 10)] = MOUTH
    # neck, sweater, arms
    rect(9, 12, 10, 12, SKIN_SH)
    rect(5, 13, 14, 13, SWEATER)
    rect(6, 14, 13, 22, SWEATER)
    rect(6, 22, 13, 22, SWEATER_SH)
    rect(9, 13, 10, 13, SWEATER_SH)  # collar
    rect(4, 14, 5, 20, SWEATER)
    rect(14, 14, 15, 20, SWEATER)
    rect(4, 21, 5, 21, SKIN)
    rect(14, 21, 15, 21, SKIN)
    # trousers and boots
    rect(6, 23, 13, 25, PANTS)
    rect(6, 26, 8, 28, PANTS)
    rect(11, 26, 13, 28, PANTS)
    rect(6, 29, 8, 30, BOOT)
    rect(11, 29, 13, 30, BOOT)
    return px


def without_right_arm(px):
    out = dict(px)
    for y in range(14, 22):
        for x in (14, 15):
            out.pop((x, y), None)
    # hair still falls over the shoulder there
    for y in range(14, 15):
        out[(14, y)] = HAIR
    return out


# the waving arm, frame by frame: (sleeve pixels, hand pixels)
WAVE = [
    ([(15, 14), (16, 13), (17, 12), (17, 11)], [(17, 10), (18, 10), (18, 9)]),
    ([(15, 14), (16, 13), (16, 12), (16, 11)], [(16, 10), (17, 10), (16, 9), (17, 9)]),
    ([(15, 14), (16, 13), (16, 12), (16, 11)], [(15, 10), (16, 10), (15, 9), (16, 9)]),
    ([(15, 14), (16, 13), (16, 12), (16, 11)], [(16, 10), (17, 10), (16, 9), (17, 9)]),
]


def frame(px) -> Image.Image:
    im = Image.new("RGB", (W, H), (0, 255, 0))
    for (x, y), c in px.items():
        im.putpixel((x, y), c)
    return im


def sheet(frames: list[Image.Image], name: str) -> None:
    big = [f.resize((W * BLOWUP, H * BLOWUP), Image.Resampling.NEAREST) for f in frames]
    out = Image.new("RGB", (GAP + len(big) * (W * BLOWUP + GAP), H * BLOWUP + 2 * GAP), (0, 255, 0))
    for i, f in enumerate(big):
        out.paste(f, (GAP + i * (W * BLOWUP + GAP), GAP))
    out.save(OUT / f"{name}.png")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    b = base()

    blink = dict(b)
    for x in (8, 11):
        blink[(x, 7)] = SKIN
    sheet([frame(b), frame(blink)], "me-idle")

    talk = dict(b)
    talk[(9, 10)] = MOUTH_OPEN
    talk[(10, 10)] = MOUTH_OPEN
    talk[(9, 11)] = MOUTH_OPEN
    talk[(10, 11)] = MOUTH_OPEN
    sheet([frame(b), frame(talk)], "me-talk")

    waves = []
    for sleeve, hand in WAVE:
        f = without_right_arm(b)
        for p in sleeve:
            f[p] = SWEATER
        for p in hand:
            f[p] = SKIN
        waves.append(frame(f))
    sheet(waves, "me-wave")
    print("wrote", sorted(p.name for p in OUT.iterdir()))


if __name__ == "__main__":
    main()
