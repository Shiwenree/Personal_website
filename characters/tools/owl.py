# The night owl's sprite sheets, from characters/Night-Owl/Owl.png.
# Usage: python owl.py <repo root> [preview folder]
import sys
from sprites import load, crop, mirror, build

root = sys.argv[1]
preview = sys.argv[2] if len(sys.argv) > 2 else None
sheet = load(f'{root}/characters/Night-Owl/Owl.png')

stationary = crop(sheet, 70, 62, 440, 470)
hover = crop(sheet, 780, 95, 1145, 500)
click = crop(sheet, 1625, 200, 1990, 610)
walk = [crop(sheet, 20, 1190, 370, 1615), crop(sheet, 370, 1190, 732, 1615), crop(sheet, 732, 1190, 1090, 1615)]
eyes_closed = crop(sheet, 1500, 1180, 1875, 1590)
eyes_half = crop(sheet, 1875, 1180, 2255, 1590)

# Works page: 0 stationary, 1 eyes half closed, 2 eyes closed, 3 hover, 4 click
build(
    [('stationary', stationary, 'feet'), ('eyes_half', eyes_half, 'feet'), ('eyes_closed', eyes_closed, 'feet'),
     ('hover', hover, 'feet'), ('click', click, 'feet')],
    f'{root}/public/villagers/owl.webp', preview and f'{preview}/owl-preview.png')

# Village: 0-2 walk (as drawn, facing front), 3-5 walk mirrored, 6 stationary, 7 eyes half, 8 eyes closed
build(
    [(f'walk{i + 1}', f, 'head') for i, f in enumerate(walk)]
    + [(f'walk_mirror{i + 1}', mirror(f), 'head') for i, f in enumerate(walk)]
    + [('stationary', stationary, 'head'), ('eyes_half', eyes_half, 'head'), ('eyes_closed', eyes_closed, 'head')],
    f'{root}/public/villagers/owl-walk.webp', preview and f'{preview}/owl-walk-preview.png')
