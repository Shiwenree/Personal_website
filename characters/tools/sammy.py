# Sammy's Village walk sheet, from characters/Sammy/Updated Middle walk.png (+ the front idle smiles).
# (His Works sheet is still made by sammy-works.py.)
# Usage: python sammy.py <repo root> [preview folder]
import sys
from sprites import load, crop, build

root = sys.argv[1]
preview = sys.argv[2] if len(sys.argv) > 2 else None
walk = load(f'{root}/characters/Sammy/Updated Middle walk.png')
idle = [load(f'{root}/characters/Sammy/Idle_Sammy_{i}.png') for i in (1, 2, 3)]

# Top row walks left, bottom row walks right: step, passing (arms mid-swing), other step
left = [crop(walk, 420, 520, 836, 980), crop(walk, 836, 520, 1224, 980), crop(walk, 1224, 520, 1600, 980)]
right = [crop(walk, 400, 975, 789, 1420), crop(walk, 789, 975, 1176, 1420), crop(walk, 1176, 975, 1600, 1420)]
# The idle drawings are full pages with Sammy somewhere on them; cut around him
idle = [crop(a, x0, 520, x1, 1000) for a, (x0, x1) in zip(idle, [(600, 1045), (1090, 1525), (1580, 2015)])]

# 0-2 walk left, 3-5 walk right, 6-8 smile (closed, half, open)
build(
    [(f'left{i + 1}', f, 'head') for i, f in enumerate(left)]
    + [(f'right{i + 1}', f, 'head') for i, f in enumerate(right)]
    + [(f'idle{i + 1}', f, 'head') for i, f in enumerate(idle)],
    f'{root}/public/villagers/sammy-walk.webp', preview and f'{preview}/sammy-walk-preview.png')
