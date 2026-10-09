# Cut Sammy's frames out of the drawings, give him a white fill, align by feet, and pack into one strip.
import sys
from PIL import Image
import numpy as np
from scipy import ndimage as nd
src, out = sys.argv[1], sys.argv[2]
INK = np.array([50,120,240])

def load(f):
    return np.array(Image.open(f'{src}/{f}').convert('RGB')).astype(float)

def cut(a, box):
    x0,y0,x1,y1 = box
    return a[y0:y1, x0:x1]

def process(a):
    dark = 765 - a.sum(-1)
    ink = dark > 60
    # silhouette: close the gaps between strokes, then fill the inside
    # (some outlines have wider gaps, so grow the closing until the body actually fills in)
    pad = 40
    inkp = np.pad(ink, pad)
    ys, xs = np.nonzero(ink)
    body = ys > ys.max() - 380  # ignore the floating hearts when measuring the body
    boxarea = (ys.max() - ys[body].min()) * (xs[body].max() - xs[body].min())
    for r in (14, 18, 22, 26, 30):
        disk = np.hypot(*np.mgrid[-r:r+1, -r:r+1]) <= r
        sil = nd.binary_fill_holes(nd.binary_closing(inkp, structure=disk))[pad:-pad, pad:-pad]
        if sil.sum() > 0.55 * boxarea: break
    print('   closing radius', r, 'fill', round(sil.sum() / boxarea, 2))
    sil = nd.binary_erosion(sil, iterations=2) | ink  # keep the white fill tucked inside the outline
    cov = np.clip((255 - a[...,0]) / (255 - INK[0]), 0, 1)
    rgba = np.zeros(a.shape[:2] + (4,))
    rgba[...,:3] = INK
    rgba[...,3] = cov * 255
    rgba[sil, :3] = a[sil]
    rgba[sil, 3] = 255
    # anchor: bottom of the feet, centered between them
    ys, xs = np.nonzero(ink)
    bottom = ys.max()
    feet = xs[ys > bottom - 30]
    return rgba, (feet.min() + feet.max()) / 2, bottom

sheet = load('Interaction(wave:hello)_and_idle_sammy.png')
frames = {
  'idle1': (load('Idle_Sammy_1.png'), None),
  'idle2': (load('Idle_Sammy_2.png'), None),
  'idle3': (load('Idle_Sammy_3.png'), None),
  'wave1': (sheet, (380,1000,772,1420)),
  'wave2': (sheet, (772,1000,1162,1420)),
  'wave3': (sheet, (1162,1000,1580,1420)),
  'wink':  (sheet, (1165,420,1580,1000)),
  'heartsA': (sheet, (786,420,1165,1000)),
  'heartsB': (sheet, (380,420,786,1000)),
}
done = {}
for name,(a,box) in frames.items():
    if box: a = cut(a, box)
    else:
        ink = (765 - a.sum(-1)) > 60
        ys, xs = np.nonzero(ink)
        a = a[ys.min()-10:ys.max()+10, xs.min()-10:xs.max()+10]
    rgba, cx, by = process(a)
    al = rgba[...,3] > 8
    ys, xs = np.nonzero(al)
    done[name] = (rgba, cx, by, xs.min(), xs.max(), ys.min(), ys.max())
    print(name, 'size', rgba.shape[1], rgba.shape[0], 'anchor', round(cx), by)

# Common canvas around the anchor (feet), big enough for every frame
left = max(cx - x0 for _,cx,by,x0,x1,y0,y1 in done.values())
right = max(x1 - cx for _,cx,by,x0,x1,y0,y1 in done.values())
up = max(by - y0 for _,cx,by,x0,x1,y0,y1 in done.values())
down = max(y1 - by for _,cx,by,x0,x1,y0,y1 in done.values())
half = int(np.ceil(max(left, right))) + 6
W, H = 2 * half, int(np.ceil(up + down)) + 12
baseline = int(np.ceil(up)) + 6
print('canvas', W, H, 'feet at', half, baseline)
order = list(done)
strip = Image.new('RGBA', (W * len(order), H), (0,0,0,0))
for i, name in enumerate(order):
    rgba, cx, by = done[name][:3]
    im = Image.fromarray(rgba.astype(np.uint8), 'RGBA')
    strip.alpha_composite(im, (int(round(i * W + half - cx)), int(round(baseline - by))))
strip.save(f'{out}/sammy.png')
strip.save(f'{out}/sammy.webp', lossless=True)
bg = Image.new('RGBA', strip.size, (184,214,147,255)); bg.alpha_composite(strip)
bg.save(f'{out}/preview.png')
print('order', order)
