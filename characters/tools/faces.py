# Square face icons for the Works page project buttons, cropped from each villager's resting frame.
# Usage: python faces.py <repo root> [preview folder]
import sys
from PIL import Image
import numpy as np

root = sys.argv[1]
preview = sys.argv[2] if len(sys.argv) > 2 else None
# villager: (frame width in the Works sheet, face center as a fraction of the drawing's box (x, y), size as a fraction of its width)
FACES = {
    'sammy': (432, (0.4, 0.32), 0.9),  # his tail sticks out to the right, so the face is left of center
    'foxy': (456, (0.42, 0.3), 0.86),
    'duck': (338, (0.5, 0.4), 0.95),
    'python': (448, (0.24, 0.24), 0.56),
    'owl': (358, (0.5, 0.3), 0.88),
    'fish': (360, (0.4, 0.48), 0.5),  # just the fish's face, inside the bowl
}
SIZE = 160  # px; shown at up to ~52px, so this stays sharp on high-res screens
tiles = []
for key, (fw, (fx, fy), fsize) in FACES.items():
    sheet = Image.open(f'{root}/public/villagers/{key}.webp').convert('RGBA')
    frame = np.array(sheet.crop((0, 0, fw, sheet.height)))
    ys, xs = np.nonzero(frame[..., 3] > 8)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    w = x1 - x0
    side = fsize * w
    cx, cy = x0 + fx * w, y0 + fy * (y1 - y0)
    box = tuple(int(round(v)) for v in (cx - side / 2, cy - side / 2, cx + side / 2, cy + side / 2))
    face = Image.fromarray(frame).crop(box).resize((SIZE, SIZE), Image.LANCZOS)
    face.save(f'{root}/public/villagers/{key}-face.webp', lossless=True)
    tiles.append(face)
    print(key, box)
if preview:
    out = Image.new('RGBA', (SIZE * len(tiles) + 10 * len(tiles), SIZE), (233, 180, 154, 255))
    for i, t in enumerate(tiles):
        out.alpha_composite(t, (i * (SIZE + 10), 0))
    out.save(f'{preview}/faces.png')
