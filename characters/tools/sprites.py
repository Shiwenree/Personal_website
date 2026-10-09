# Shared helpers for turning hand-drawn line art (blue ink on white) into a sprite sheet.
# Each frame is cut out, the character's body is filled white, the background becomes transparent,
# and all frames are lined up on a shared anchor point so the character doesn't jitter.
from PIL import Image
import numpy as np
from scipy import ndimage as nd
from scipy.spatial import cKDTree
from skimage.draw import line
from skimage.morphology import skeletonize

INK = np.array([50, 120, 240])


def load(path):
    return np.array(Image.open(path).convert('RGB')).astype(float)


def crop(a, x0, y0, x1, y1):
    return a[y0:y1, x0:x1]


def mirror(a):
    return a[:, ::-1]


def bridge(ink, reach=70):
    """Close gaps in the outline by connecting each stroke's loose ends to the nearest other stroke.
    The drawings deliberately have little breaks in the lines; this joins them so the inside can be filled."""
    skel = skeletonize(ink)
    neighbors = nd.convolve(skel.astype(int), np.ones((3, 3), int), mode='constant') - 1
    ends = np.argwhere(skel & (neighbors == 1))
    strokes, _ = nd.label(nd.binary_dilation(ink, iterations=2))
    pts = np.argwhere(skel)
    owner = strokes[pts[:, 0], pts[:, 1]]
    tree = cKDTree(pts)
    out = ink.copy()
    for y, x in ends:
        me = strokes[y, x]
        # nearest skeleton point that belongs to a different stroke, within reach
        for d, i in zip(*tree.query((y, x), k=60, distance_upper_bound=reach)):
            if np.isinf(d):
                break
            if owner[i] != me:
                rr, cc = line(y, x, *pts[i])
                out[rr, cc] = True
                break
    return nd.binary_dilation(out, iterations=1)


def cutout(a, anchor='feet', fill=0.55, center=True):
    """Returns (rgba, anchor_x, anchor_y). anchor='feet' centers on the feet (good for front views);
    'head' centers on the head (good for walk cycles, where a lifted paw or tail would pull the center).
    fill / center tune the "is the body filled in yet?" check: lower fill and center=False for
    characters that don't fill much of their box, like a coiled snake."""
    ink = (765 - a.sum(-1)) > 60
    # Drop stray specks
    lab, n = nd.label(nd.binary_dilation(ink, iterations=3))
    sizes = nd.sum(ink, lab, range(1, n + 1))
    ink &= np.isin(lab, 1 + np.nonzero(sizes >= 40)[0])
    a = a.copy()
    a[~nd.binary_dilation(ink, iterations=3)] = 255

    # Silhouette: close the gaps between strokes, then fill the inside.
    # Some outlines have wider gaps, so grow the closing until the body actually fills in.
    ys, xs = np.nonzero(ink)
    body = ys > ys.max() - 380  # ignore anything floating high above (hearts etc.) when measuring
    boxarea = (ys.max() - ys[body].min()) * (xs[body].max() - xs[body].min())
    # "Filled in" = the middle of the body is covered and most of the body's box is filled
    cy = (ys.max() + ys[body].min()) // 2
    cx = (xs[body].max() + xs[body].min()) // 2
    pad = 80
    inkp = np.pad(ink, pad)
    # First try joining the loose ends of the strokes; if the body still doesn't fill, fall back to
    # closing the gaps with an ever bigger brush (which can leave white webbing in tight corners)
    bridged = np.pad(bridge(ink), pad)
    for r in (4, 8, 14, 18, 22, 26, 30, 36, 42, 50, 60):
        disk = np.hypot(*np.mgrid[-r:r + 1, -r:r + 1]) <= r
        sil = nd.binary_fill_holes(nd.binary_closing(bridged if r < 14 else inkp, structure=disk))[pad:-pad, pad:-pad]
        if sil.sum() > fill * boxarea and (not center or sil[cy - 20:cy + 20, cx - 20:cx + 20].all()):
            break
    sil = nd.binary_erosion(sil, iterations=2) | ink  # keep the white fill tucked inside the outline

    # Outside the body, keep the soft anti-aliased edge of the ink; inside, the original pixels
    cov = np.clip((255 - a[..., 0]) / (255 - INK[0]), 0, 1)
    rgba = np.zeros(a.shape[:2] + (4,))
    rgba[..., :3] = INK
    rgba[..., 3] = cov * 255
    rgba[sil, :3] = a[sil]
    rgba[sil, 3] = 255

    bottom = ys.max()
    if anchor == 'head':
        part = xs[ys < ys.min() + 130]
    elif anchor == 'center':  # middle of the whole drawing (for things that tilt, like a waddling bowl)
        part = xs
    else:
        part = xs[ys > bottom - 30]
    return rgba, (part.min() + part.max()) / 2, bottom, r


def build(frames, out_path, preview_path=None, **fill_check):
    """frames: list of (name, rgb_array, anchor). Packs them side by side into one sheet."""
    done = []
    for name, a, anchor in frames:
        rgba, cx, by, r = cutout(a, anchor, **fill_check)
        ys, xs = np.nonzero(rgba[..., 3] > 8)
        done.append((name, rgba, cx, by, xs.min(), xs.max(), ys.min(), ys.max()))
        print(f'{name:10} closing r={r:2}  size {rgba.shape[1]}x{rgba.shape[0]}')
    half = int(np.ceil(max(max(cx - x0, x1 - cx) for _, _, cx, by, x0, x1, y0, y1 in done))) + 6
    up = max(by - y0 for _, _, cx, by, x0, x1, y0, y1 in done)
    down = max(y1 - by for _, _, cx, by, x0, x1, y0, y1 in done)
    W, H, base = 2 * half, int(np.ceil(up + down)) + 12, int(np.ceil(up)) + 6
    sheet = Image.new('RGBA', (W * len(done), H), (0, 0, 0, 0))
    for i, (_, rgba, cx, by, *_rest) in enumerate(done):
        im = Image.fromarray(rgba.astype(np.uint8), 'RGBA')
        sheet.alpha_composite(im, (int(round(i * W + half - cx)), int(round(base - by))))
    sheet.save(out_path, lossless=True)
    print(f'{out_path}: {len(done)} frames of {W}x{H}, anchor at ({half}, {base})')
    print('order:', [d[0] for d in done])
    if preview_path:
        bg = Image.new('RGBA', sheet.size, (184, 214, 147, 255))
        bg.alpha_composite(sheet)
        bg.save(preview_path)
    return W, H
