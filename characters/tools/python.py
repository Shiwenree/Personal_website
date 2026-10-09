# The python's sprite sheets, from characters/Python/Snake.png.
# Usage: python python.py <repo root> [preview folder]
import sys
from sprites import load, crop, mirror, build

root = sys.argv[1]
preview = sys.argv[2] if len(sys.argv) > 2 else None
sheet = load(f'{root}/characters/Python/Snake.png')
sheet[30:92, 1388:1520] = 255  # "Hover" label, right next to the drawing

click = crop(sheet, 300, 128, 760, 545)
hover = crop(sheet, 1170, 75, 1600, 490)
stationary = crop(sheet, 905, 642, 1350, 1050)
# Idle column, top to bottom: big fangs, small fangs, smile
fangs = crop(sheet, 1800, 95, 2250, 505)
fangs_small = crop(sheet, 1800, 555, 2255, 975)
smile = crop(sheet, 1800, 1000, 2255, 1415)
# Walking right: three wiggles
walk = [crop(sheet, 95, 1110, 557, 1560), crop(sheet, 557, 1110, 1037, 1560), crop(sheet, 1037, 1110, 1500, 1560)]

# The python's body sits on the ground, so everything lines up on the bottom of its coil ('feet')
# Works page: 0 stationary, 1 smile, 2 small fangs, 3 big fangs, 4 hover, 5 click
build(
    [('stationary', stationary, 'feet'), ('smile', smile, 'feet'), ('fangs_small', fangs_small, 'feet'),
     ('fangs', fangs, 'feet'), ('hover', hover, 'feet'), ('click', click, 'feet')],
    f'{root}/public/villagers/python.webp', preview and f'{preview}/python-preview.png', fill=0.5, center=False)

# Village: 0-2 slither left (mirrored), 3-5 slither right, 6 resting facing left, 7 resting facing right (mirrored)
build(
    [(f'left{i + 1}', mirror(f), 'feet') for i, f in enumerate(walk)]
    + [(f'right{i + 1}', f, 'feet') for i, f in enumerate(walk)]
    + [('rest_left', stationary, 'feet'), ('rest_right', mirror(stationary), 'feet')],
    f'{root}/public/villagers/python-walk.webp', preview and f'{preview}/python-walk-preview.png', fill=0.5, center=False)
