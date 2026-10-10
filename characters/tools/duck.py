# The duck's sprite sheets, from characters/Duck/Colored.png
# (colored, background removed; Line_art.png is the earlier uncolored version with the same layout).
# Usage: python duck.py <repo root> [preview folder]
import sys
from sprites import load, crop, mirror, build, VILLAGE_OUTLINE

root = sys.argv[1]
preview = sys.argv[2] if len(sys.argv) > 2 else None
sheet = load(f'{root}/characters/Duck/Colored.png')
# Erase handwritten labels that sit right next to drawings (made transparent)
sheet[40:140, 1500:1760] = 0  # "Walking"
sheet[1110:1200, 360:500] = 0  # "Idle"
sheet[440:560, 120:445] = 0  # "Stationary"

walk = [crop(sheet, 380, 20, 800, 500), crop(sheet, 820, 15, 1170, 490), crop(sheet, 1180, 10, 1540, 480)]  # walking left
stationary = crop(sheet, 90, 598, 440, 1040)
idle1 = crop(sheet, 80, 1150, 420, 1635)  # sprout sways one way
idle2 = crop(sheet, 480, 1158, 820, 1635)  # and the other
click = [crop(sheet, 1150, 470, 1490, 950), crop(sheet, 1530, 430, 1870, 940), crop(sheet, 1890, 400, 2230, 935)]  # bud -> bloom
hover = [crop(sheet, 1290, 1180, 1635, 1635), crop(sheet, 1640, 1180, 1990, 1635)]  # flapping

# Works page: 0 stationary, 1-2 sprout sway, 3-5 flower blooms (click), 6-7 flap (hover)
build(
    [('stationary', stationary, 'feet'), ('idle1', idle1, 'feet'), ('idle2', idle2, 'feet')]
    + [(f'click{i + 1}', f, 'feet') for i, f in enumerate(click)]
    + [(f'hover{i + 1}', f, 'feet') for i, f in enumerate(hover)],
    f'{root}/public/villagers/duck.webp', preview and f'{preview}/duck-preview.png')

# Village: 0-2 walk left, 3-5 walk right (mirrored), 6 stationary, 7-8 sprout sway
build(
    [(f'left{i + 1}', f, 'head') for i, f in enumerate(walk)]
    + [(f'right{i + 1}', mirror(f), 'head') for i, f in enumerate(walk)]
    + [('stationary', stationary, 'head'), ('idle1', idle1, 'head'), ('idle2', idle2, 'head')],
    f'{root}/public/villagers/duck-walk.webp', preview and f'{preview}/duck-walk-preview.png', outline=VILLAGE_OUTLINE)
