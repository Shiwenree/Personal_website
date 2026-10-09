# Village sheet for Sammy: 3/4 walk left (3 frames), walk right (3), then the 3 front idle smiles.
import sys
from PIL import Image
import numpy as np
from scipy import ndimage as nd
src, out = sys.argv[1], sys.argv[2]
INK = np.array([50,120,240])
load = lambda f: np.array(Image.open(f'{src}/{f}').convert('RGB')).astype(float)

def process(a):
    ink = (765 - a.sum(-1)) > 60
    lab, n = nd.label(nd.binary_dilation(ink, iterations=3))
    sizes = nd.sum(ink, lab, range(1, n + 1))
    ink &= np.isin(lab, 1 + np.nonzero(sizes >= 40)[0])  # drop stray specks
    a = a.copy(); a[~nd.binary_dilation(ink, iterations=3)] = 255
    pad = 40; inkp = np.pad(ink, pad)
    ys, xs = np.nonzero(ink)
    boxarea = (ys.max() - ys.min()) * (xs.max() - xs.min())
    for r in (14, 18, 22, 26, 30):
        disk = np.hypot(*np.mgrid[-r:r+1, -r:r+1]) <= r
        sil = nd.binary_fill_holes(nd.binary_closing(inkp, structure=disk))[pad:-pad, pad:-pad]
        if sil.sum() > 0.55 * boxarea: break
    print('   closing radius', r, 'fill', round(sil.sum() / boxarea, 2))
    sil = nd.binary_erosion(sil, iterations=2) | ink
    cov = np.clip((255 - a[...,0]) / (255 - INK[0]), 0, 1)
    rgba = np.zeros(a.shape[:2] + (4,)); rgba[...,:3] = INK; rgba[...,3] = cov * 255
    rgba[sil, :3] = a[sil]; rgba[sil, 3] = 255
    # anchor: lowest point (the planted foot) vertically; the head's center horizontally,
    # since a lifted paw or the tail would pull a feet/body-based center around
    top = ys.min(); head = xs[ys < top + 130]
    return rgba, (head.min() + head.max()) / 2, ys.max()

walk = load('34_View_Sammy.png')
def crop(a, x0, y0, x1, y1): return a[y0:y1, x0:x1]
def tight(a):
    ink = (765 - a.sum(-1)) > 60; ys, xs = np.nonzero(ink)
    return a[ys.min()-10:ys.max()+10, xs.min()-10:xs.max()+10]
frames = {
  'left1': crop(walk, 420, 450, 833, 968), 'left2': crop(walk, 833, 450, 1215, 968), 'left3': crop(walk, 1215, 450, 1600, 968),
  'right1': crop(walk, 400, 968, 790, 1400), 'right2': crop(walk, 790, 968, 1171, 1400), 'right3': crop(walk, 1171, 968, 1580, 1400),
  'idle1': tight(load('Idle_Sammy_1.png')), 'idle2': tight(load('Idle_Sammy_2.png')), 'idle3': tight(load('Idle_Sammy_3.png')),
}
done = {}
for name, a in frames.items():
    rgba, cx, by = process(a)
    ys, xs = np.nonzero(rgba[...,3] > 8)
    done[name] = (rgba, cx, by, xs.min(), xs.max(), ys.min(), ys.max())
    print(name, rgba.shape[1], rgba.shape[0], 'anchor', round(cx), by)
half = int(np.ceil(max(max(cx - x0, x1 - cx) for _,cx,by,x0,x1,y0,y1 in done.values()))) + 6
up = max(by - y0 for _,cx,by,x0,x1,y0,y1 in done.values()); down = max(y1 - by for _,cx,by,x0,x1,y0,y1 in done.values())
W, H, base = 2 * half, int(np.ceil(up + down)) + 12, int(np.ceil(up)) + 6
print('canvas', W, H, 'feet at', half, base)
strip = Image.new('RGBA', (W * len(done), H), (0,0,0,0))
for i, (rgba, cx, by, *_) in enumerate(done.values()):
    strip.alpha_composite(Image.fromarray(rgba.astype(np.uint8), 'RGBA'), (int(round(i * W + half - cx)), int(round(base - by))))
strip.save(f'{out}/sammy-walk.webp', lossless=True)
bg = Image.new('RGBA', strip.size, (184,214,147,255)); bg.alpha_composite(strip)
for i in range(len(done)):  # guide line at the feet + center, to check alignment
    for x in range(i*W, (i+1)*W): bg.putpixel((x, base), (200,60,60,255))
    for y in range(H): bg.putpixel((i*W+half, y), (200,60,60,255))
bg.save(f'{out}/walk-preview.png')
print('order', list(done))
