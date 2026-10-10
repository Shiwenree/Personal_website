# Foxy's (Blossom's) sprite sheets, from characters/Foxy/Colored.png
# (colored, background removed; Line_art.png is the earlier uncolored version with the same layout).
# Usage: python foxy.py <repo root> [preview folder]
import sys
from sprites import load, crop, mirror, build, VILLAGE_OUTLINE

root = sys.argv[1]
preview = sys.argv[2] if len(sys.argv) > 2 else None
sheet = load(f'{root}/characters/Foxy/Colored.png')
sheet[960:1055, 1490:1720] = 0  # "Hover" label, right above the drawing (made transparent)

# Frame boxes on the drawing (x0, y0, x1, y1), below the handwritten labels
stationary = crop(sheet, 150, 205, 520, 680)
idle1 = crop(sheet, 620, 205, 990, 680)
idle2 = crop(sheet, 1020, 205, 1400, 680)
click = crop(sheet, 1880, 195, 2260, 680)
# Walking right (step, passing, other step)
walk1 = crop(sheet, 20, 1040, 394, 1495)
walk2 = crop(sheet, 394, 1040, 786, 1495)
walk3 = crop(sheet, 786, 1040, 1180, 1495)
tongue_small = crop(sheet, 1360, 1020, 1780, 1520)  # hover: tongue a little out
tongue = crop(sheet, 1860, 1030, 2260, 1520)  # hover: tongue all the way out

# Works page (front facing): 0 stationary, 1 idle 1, 2 idle 2, 3 click, 4 tongue out, 5 tongue a little out
build(
    [('stationary', stationary, 'feet'), ('idle1', idle1, 'feet'), ('idle2', idle2, 'feet'),
     ('click', click, 'feet'), ('tongue', tongue, 'feet'), ('tongue_small', tongue_small, 'feet')],
    f'{root}/public/villagers/foxy.webp', preview and f'{preview}/foxy-preview.png')

# Village: 0-2 walking left (mirrored), 3-5 walking right, 6 stationary, 7 idle 1, 8 idle 2
build(
    [('left1', mirror(walk1), 'head'), ('left2', mirror(walk2), 'head'), ('left3', mirror(walk3), 'head'),
     ('right1', walk1, 'head'), ('right2', walk2, 'head'), ('right3', walk3, 'head'),
     ('stationary', stationary, 'head'), ('idle1', idle1, 'head'), ('idle2', idle2, 'head')],
    f'{root}/public/villagers/foxy-walk.webp', preview and f'{preview}/foxy-walk-preview.png', outline=VILLAGE_OUTLINE)
