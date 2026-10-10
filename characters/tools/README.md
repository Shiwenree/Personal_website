# Sprite tools

These scripts turn hand-drawn line-art sheets (blue ink on white) into the sprite sheets the site uses
in `public/villagers/`. For each frame they:

1. cut the frame out of the drawing,
2. fill the character's body white and make the background transparent,
3. line every frame up by the feet (and head, for walking) so the character doesn't jitter,
4. pack all frames side by side into one `.webp`.

- `sprites.py`: the shared cut-out / fill / align / pack code. New characters should use this.
- `foxy.py`, `duck.py`, `python.py`, `owl.py`, `sammy.py` (Village walk): one script per character; copy one for a new character
- `sammy-works.py` → `sammy.webp` (Works, from `Colored_1.png`); `sammy.py` → `sammy-walk.webp` (Village); `sammy-village.py` is an older standalone version

After making a sheet, add the villager to `src/data/villagers.ts` (which frames make up each animation)
and give a project `villager: '<key>'` in `src/pages/index.astro`.

Run (needs Python with Pillow, NumPy, SciPy):

    python3 -m venv .venv && .venv/bin/pip install pillow numpy scipy
    cd characters/tools && ../../.venv/bin/python foxy.py ../.. [preview-folder]

Colored sheets (background already removed, so the PNG has transparency) skip the white fill and keep
your colors as drawn. The Village sheets also get a solid outline around each character, in its own
line color, so they read when drawn small; change its thickness with `VILLAGE_OUTLINE` in `sprites.py`
and rerun the character scripts.
