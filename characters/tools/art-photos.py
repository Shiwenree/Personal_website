# Prepares photos for the Art page: turns them the right way up (phones store rotation separately),
# shrinks them to at most 2000px, and saves them WITHOUT their metadata, which includes the GPS
# location the photo was taken at.
# Usage: python art-photos.py <source image> <output .jpg>   (HEIC: convert to JPG with `sips` first)
import sys
from PIL import Image, ImageOps

src, out = sys.argv[1], sys.argv[2]
im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
im.thumbnail((2000, 2000), Image.LANCZOS)
im.save(out, 'JPEG', quality=85, optimize=True)  # no exif= argument, so no metadata is written
print(out, im.size)
