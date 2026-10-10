# Sammy's Works sheet (front facing), from characters/Sammy/Colored_1.png
# (colored, background removed; the earlier blue line art was split across
# Interaction(wave:hello)_and_idle_sammy.png and Idle_Sammy_1-3.png, in the same spots).
# Usage: python sammy-works.py <repo root> [preview folder]
import sys
from sprites import load, crop, build

root = sys.argv[1]
preview = sys.argv[2] if len(sys.argv) > 2 else None
sheet = load(f'{root}/characters/Sammy/Colored_1.png')

# Smile, right side: small smile (bottom right), bigger (bottom left), biggest (top right)
smile = [crop(sheet, 2005, 975, 2360, 1380), crop(sheet, 1645, 975, 2005, 1380), crop(sheet, 1615, 555, 1985, 950)]
wave = [crop(sheet, 380, 1000, 772, 1420), crop(sheet, 772, 1000, 1162, 1420), crop(sheet, 1162, 1000, 1580, 1420)]
wink = crop(sheet, 1165, 420, 1580, 1000)
hearts = [crop(sheet, 786, 420, 1165, 1000), crop(sheet, 380, 420, 786, 1000)]  # low, then high

# 0-2 smile (small, bigger, biggest), 3-5 wave (paw by cheek, up, out), 6 wink (unused), 7-8 hearts (low, high)
build(
    [(f'smile{i + 1}', f, 'feet') for i, f in enumerate(smile)]
    + [(f'wave{i + 1}', f, 'feet') for i, f in enumerate(wave)]
    + [('wink', wink, 'feet')]
    + [(f'hearts{i + 1}', f, 'feet') for i, f in enumerate(hearts)],
    f'{root}/public/villagers/sammy.webp', preview and f'{preview}/sammy-preview.png')
