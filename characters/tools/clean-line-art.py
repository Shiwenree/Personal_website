# Turns a phone photo of an ink drawing into clean black line art on white:
# removes the paper's color cast and uneven lighting, then pushes the paper to pure white and the ink to black.
# Usage: python clean-line-art.py <photo> <output .jpg>
import sys
import numpy as np
from PIL import Image, ImageOps
from scipy import ndimage as nd

src, out = sys.argv[1], sys.argv[2]
im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
im.thumbnail((2000, 2000), Image.LANCZOS)
gray = np.asarray(im.convert('L')).astype(float)
# The paper's brightness everywhere (a big blur ignores the thin ink lines), so shadows and tint cancel out
paper = nd.grey_closing(gray, size=(25, 25))
paper = nd.gaussian_filter(paper, 20)
flat = np.clip(gray / np.maximum(paper, 1) * 255, 0, 255)
# Levels: near-paper tones become white, ink becomes solid black, with a soft edge in between
lo, hi = 70, 215
clean = np.clip((flat - lo) / (hi - lo), 0, 1) ** 0.75 * 255
Image.fromarray(clean.astype(np.uint8)).save(out, 'JPEG', quality=90, optimize=True)
print(out, im.size)
