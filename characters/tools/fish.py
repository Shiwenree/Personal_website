# The goldfish's sprite sheets, from characters/Gold-Fish/Colored.png (a goldfish in a bowl with legs;
# colored, background removed; Line_art.png is the earlier uncolored version with the same layout).
# Usage: python fish.py <repo root> [preview folder]
import sys
from sprites import load, crop, mirror, build, VILLAGE_OUTLINE

root = sys.argv[1]
preview = sys.argv[2] if len(sys.argv) > 2 else None
sheet = load(f'{root}/characters/Gold-Fish/Colored.png')
# Erase handwritten labels that sit right next to drawings (made transparent)
sheet[0:64, 0:240] = 0  # "Stationary"
sheet[1150:1215, 100:230] = 0  # "Idle"

stationary = crop(sheet, 70, 60, 460, 400)
bubbles = [crop(sheet, 30, 650, 410, 990), crop(sheet, 530, 650, 910, 990)]  # hover
mouth_closed = crop(sheet, 45, 1200, 425, 1560)  # idle
mouth_o = crop(sheet, 530, 1200, 910, 1560)  # idle
sleepy = [crop(sheet, 1070, 1112, 1460, 1470), crop(sheet, 1520, 1112, 1910, 1470), crop(sheet, 1930, 1112, 2310, 1470)]  # click
walk = [crop(sheet, 1000, 120, 1420, 520), crop(sheet, 1440, 170, 1860, 505), crop(sheet, 1910, 70, 2320, 470)]  # waddling right

# Works page: 0 stationary, 1 mouth closed, 2 mouth "o", 3-4 bubbles (hover), 5-7 dozing (click)
build(
    [('stationary', stationary, 'feet'), ('mouth_closed', mouth_closed, 'feet'), ('mouth_o', mouth_o, 'feet')]
    + [(f'bubbles{i + 1}', f, 'feet') for i, f in enumerate(bubbles)]
    + [(f'sleepy{i + 1}', f, 'feet') for i, f in enumerate(sleepy)],
    f'{root}/public/villagers/fish.webp', preview and f'{preview}/fish-preview.png')

# Village: 0-2 waddle right (as drawn), 3-5 waddle left (mirrored), 6 stationary, 7 mouth closed, 8 mouth "o"
build(
    [(f'right{i + 1}', f, 'center') for i, f in enumerate(walk)]
    + [(f'left{i + 1}', mirror(f), 'center') for i, f in enumerate(walk)]
    + [('stationary', stationary, 'center'), ('mouth_closed', mouth_closed, 'center'), ('mouth_o', mouth_o, 'center')],
    f'{root}/public/villagers/fish-walk.webp', preview and f'{preview}/fish-walk-preview.png', outline=VILLAGE_OUTLINE)
