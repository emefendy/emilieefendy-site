"""Split the 2x4 sheet of me into one sheet per mood.

    python3 tools/split_me_sheet.py && python3 tools/build_sprites.py

art/campus-art/me/me-sheet.png is the generated sheet, read left to right:
  top row:    idle, blink, wave, wave
  bottom row: think, think (eyes closed), talk (mouth open), talk (closed)

me-surprised.png (when she's poked) is its own single image and needs no splitting.
"""
from pathlib import Path

from PIL import Image

ME = Path(__file__).resolve().parent.parent / "art" / "campus-art" / "me"
MOODS = {
    "me-idle": [(0, 0), (0, 1)],
    "me-wave": [(0, 2), (0, 3)],
    "me-think": [(1, 0), (1, 1)],
    "me-talk": [(1, 2), (1, 3)],
}
GAP = 60


def main() -> None:
    sheet = Image.open(ME / "me-sheet.png").convert("RGB")
    cw, ch = sheet.width // 4, sheet.height // 2
    for name, cells in MOODS.items():
        out = Image.new("RGB", (GAP + len(cells) * (cw + GAP), ch + 2 * GAP), (0, 255, 0))
        for i, (r, c) in enumerate(cells):
            out.paste(sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)), (GAP + i * (cw + GAP), GAP))
        out.save(ME / f"{name}.png")
        print("wrote", name)


if __name__ == "__main__":
    main()
