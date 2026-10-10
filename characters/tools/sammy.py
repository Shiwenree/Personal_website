# Sammy's Village walk sheet, from characters/Sammy/Colored_2.png (3/4 walk, facing right) plus the
# front smiles from Colored_1.png. Both are colored with the background removed; the earlier blue line
# art is in Updated Middle walk.png and Idle_Sammy_1-3.png. (His Works sheet is made by sammy-works.py.)
# Usage: python sammy.py <repo root> [preview folder]
import sys
from sprites import load, crop, mirror, build, VILLAGE_OUTLINE

root = sys.argv[1]
preview = sys.argv[2] if len(sys.argv) > 2 else None
walk = load(f'{root}/characters/Sammy/Colored_2.png')
front = load(f'{root}/characters/Sammy/Colored_1.png')

# Walking right: step, passing (arms mid-swing), other step. Walking left is the same, mirrored.
right = [crop(walk, 400, 975, 789, 1420), crop(walk, 789, 975, 1176, 1420), crop(walk, 1176, 975, 1600, 1420)]
# Front smiles (small, bigger, biggest), same spots as in sammy-works.py
smile = [crop(front, 2005, 975, 2360, 1380), crop(front, 1645, 975, 2005, 1380), crop(front, 1615, 555, 1985, 950)]

# 0-2 walk left, 3-5 walk right, 6-8 smile
build(
    [(f'left{i + 1}', mirror(f), 'head') for i, f in enumerate(right)]
    + [(f'right{i + 1}', f, 'head') for i, f in enumerate(right)]
    + [(f'smile{i + 1}', f, 'head') for i, f in enumerate(smile)],
    f'{root}/public/villagers/sammy-walk.webp', preview and f'{preview}/sammy-walk-preview.png', outline=VILLAGE_OUTLINE)
