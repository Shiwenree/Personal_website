// Cuts the village buildings out of the drawing (Backgrounds/Untitled_Artwork.png) into one image each,
// so the Village page can place them separately and villagers can walk in front of and behind them.
// Run it again after changing the drawing:  node scripts/build-village-buildings.mjs
//
// Writes public/village/<name>.webp, trimmed to the drawn pixels. Prints each one's size, which
// src/data/village-map.ts needs (BUILDINGS: `size`, and the door/base/blocks spots are measured in
// these trimmed pictures' pixels, so recheck them if a building changes size).
//
// The areas below are in the drawing's own pixels (2360 x 1640). Each just needs to contain one
// building and nothing else; the exact edges get found from the drawing itself.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'Backgrounds/Untitled_Artwork.png';
const OUT = 'public/village';
mkdirSync(OUT, { recursive: true });

// [left, top, right, bottom], whether to remove the painted grass around it, and see-through spots
// inside the line art to color in (in the trimmed picture's px: spots inside, one per area between the
// lines, a box the fill stays in, and the color)
const AREAS = {
  garden: { area: [0, 620, 820, 1200], clearGrass: true },
  bakery: { area: [460, 160, 940, 640] },
  cart: { area: [960, 236, 1450, 640] },
  windmill: { area: [1780, 150, 2340, 900], fills: [{ seeds: [[213, 560], [213, 572], [213, 584], [205, 600]], box: [153, 548, 273, 614], color: [169, 167, 162] }] },
  bookshop: { area: [1120, 940, 1620, 1470] },
};

for (const [name, { area, clearGrass, fills = [] }] of Object.entries(AREAS)) {
  const [l, t, r, b] = area;
  const { data, info } = await sharp(SRC)
    .extract({ left: l, top: t, width: r - l, height: b - t })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;

  // The garden sits on a patch of soft painted grass; the village already has grass, so remove it.
  // Spread in from the edges over anything see-through or green (but not the dark ink outlines), so
  // it stops at the fences and the beds and leaves the vegetables inside them alone.
  if (clearGrass) {
    const isGrass = (i) => {
      const [r, g, bl, a] = data.subarray(i * 4, i * 4 + 4);
      return a < 40 || (g > r + 6 && g > bl + 6 && 0.3 * r + 0.59 * g + 0.11 * bl > 70);
    };
    const seen = new Uint8Array(W * H);
    const stack = [];
    for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
    for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
    while (stack.length) {
      const i = stack.pop();
      if (seen[i] || !isGrass(i)) continue;
      seen[i] = 1;
      data[i * 4 + 3] = 0;
      const x = i % W;
      if (x > 0) stack.push(i - 1);
      if (x < W - 1) stack.push(i + 1);
      if (i >= W) stack.push(i - W);
      if (i < W * (H - 1)) stack.push(i + W);
    }
  }

  // The drawn pixels' bounding box (ignoring nearly see-through specks)
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (data[(y * W + x) * 4 + 3] > 24) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  const width = x1 - x0 + 1, height = y1 - y0 + 1;
  const { data: pic, info: picInfo } = await sharp(data, { raw: info })
    .extract({ left: x0, top: y0, width, height })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Color in see-through spots (the windmill's steps): spread from the seeds over see-through pixels,
  // staying in the box, then lay the color underneath so the ink lines' soft edges blend into it
  for (const { seeds, box, color } of fills) {
    const [bl, bt, br, bb] = box;
    const inside = new Uint8Array(width * height);
    const stack = seeds.map(([x, y]) => y * width + x);
    while (stack.length) {
      const i = stack.pop();
      const x = i % width, y = (i / width) | 0;
      if (y < Math.max(bt, 0) || y > Math.min(bb, height - 1) || x < Math.max(bl, 0) || x > Math.min(br, width - 1)) continue;
      if (inside[i] || pic[i * 4 + 3] > 200) continue;
      inside[i] = 1;
      stack.push(i - 1, i + 1, i - width, i + width);
    }
    for (let i = 0; i < width * height; i++) {
      if (!inside[i]) continue;
      const a = pic[i * 4 + 3] / 255;
      for (let c = 0; c < 3; c++) pic[i * 4 + c] = Math.round(pic[i * 4 + c] * a + color[c] * (1 - a));
      pic[i * 4 + 3] = 255;
    }
  }

  await sharp(pic, { raw: picInfo }).webp({ quality: 90, alphaQuality: 100 }).toFile(`${OUT}/${name}.webp`);
  console.log(`${name}: ${width} x ${height}`);
}
