// Turns the Works painting (Backgrounds/Works_background.png) into the layers the page animates.
// Run it again after changing the painting:  node scripts/build-works-scene.mjs
//
// Writes to public/works/:
//   painting.webp  the painting as-is (shown until the animation is ready, and when motion is reduced)
//   land.webp      everything below the sky, with the sky see-through (hills, lake, trees, meadow)
//   sky.webp       just the sky and clouds, birds removed, carried on down behind the hills so the
//                  clouds can drift without leaving gaps
//   motion.png     where things move. Red: how far each spot sways in the breeze. Green: lake water.
//
// The numbers below (tree areas, the meadow line) are in the painting's own pixels (2360 x 1640).
// If you redraw the scene with things in different places, update them to match.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'Backgrounds/Works_background.png';
const OUT = 'public/works';
mkdirSync(OUT, { recursive: true });

const { data: src, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const N = W * H;
const rgb = (i) => [src[i * 3], src[i * 3 + 1], src[i * 3 + 2]];
const lum = (i) => 0.3 * src[i * 3] + 0.59 * src[i * 3 + 1] + 0.11 * src[i * 3 + 2];
// Green beats blue: hills, trees, grass (and their dark green outlines). Sky and clouds are blue or white.
const isGreen = (i) => src[i * 3 + 1] > src[i * 3 + 2] + 6;

// ---------- Sky line ----------
// For each column, the sky ends where a solid run of green starts (a run, so the little moon doesn't count).
const skyEnd = new Int32Array(W);
for (let x = 0; x < W; x++) {
  let run = 0;
  let y = 0;
  for (; y < H; y++) {
    run = isGreen(y * W + x) ? run + 1 : 0;
    if (run === 60) break;
  }
  skyEnd[x] = y - 59;
}

// The moon: the green-ish (cream) pixels up in the sky. It stays put, as part of the land layer.
let mx0 = W, my0 = H, mx1 = 0, my1 = 0;
for (let y = 0; y < H * 0.2; y++)
  for (let x = 0; x < W; x++)
    if (y < skyEnd[x] - 10 && isGreen(y * W + x) && lum(y * W + x) > 200) {
      mx0 = Math.min(mx0, x); mx1 = Math.max(mx1, x); my0 = Math.min(my0, y); my1 = Math.max(my1, y);
    }
const moon = { x: (mx0 + mx1) / 2, y: (my0 + my1) / 2, r: Math.max(mx1 - mx0, my1 - my0) / 2 + 5 };
const inMoon = (x, y) => mx1 > 0 && Math.hypot(x - moon.x, y - moon.y) < moon.r;

// Birds: small dark marks out in open sky (well away from any cloud outline). The page draws its own.
const birds = [];
{
  const seen = new Uint8Array(N);
  const dark = (i) => lum(i) < 175;
  for (let y = 0; y < H * 0.3; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (seen[i] || !dark(i) || y >= skyEnd[x]) continue;
      const stack = [i];
      seen[i] = 1;
      let x0 = x, x1 = x, y0 = y, y1 = y, count = 0;
      while (stack.length) {
        const j = stack.pop();
        const jx = j % W, jy = (j / W) | 0;
        count++;
        x0 = Math.min(x0, jx); x1 = Math.max(x1, jx); y0 = Math.min(y0, jy); y1 = Math.max(y1, jy);
        for (const k of [j - 1, j + 1, j - W, j + W]) if (k >= 0 && k < N && !seen[k] && dark(k)) { seen[k] = 1; stack.push(k); }
      }
      // A bird is a small, wide mark high in the open sky (not the moon's outline, not a bit of cloud outline)
      const nearMoon = mx1 > 0 && Math.hypot((x0 + x1) / 2 - moon.x, (y0 + y1) / 2 - moon.y) < moon.r + 20;
      if (count > 40 && x1 - x0 < 90 && y1 - y0 < 40 && y1 < H * 0.12 && !nearMoon) birds.push({ x0: x0 - 4, x1: x1 + 4, y0: y0 - 4, y1: y1 + 4 });
    }
}
const inBird = (x, y) => birds.some((b) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1);

// Plain sky color for each row: the median of the clear blue pixels on that row
const skyRow = [];
let last = [205, 233, 248];
for (let y = 0; y < H; y++) {
  const rs = [], gs = [], bs = [];
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const [r, g, b] = rgb(i);
    if (y < skyEnd[x] && b > r + 25 && b > g + 5 && r > 150) { rs.push(r); gs.push(g); bs.push(b); }
  }
  if (rs.length > 20) {
    const med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
    last = [med(rs), med(gs), med(bs)];
  }
  skyRow.push(last);
}

// ---------- land.webp and sky.webp ----------
const SKY_H = Math.min(H, Math.max(...skyEnd) + 80); // the sky image only needs to reach a little past the lowest hill
const land = Buffer.alloc(N * 4);
const sky = Buffer.alloc(W * SKY_H * 3);
for (let x = 0; x < W; x++)
  for (let y = 0; y < H; y++) {
    const i = y * W + x;
    land[i * 4] = src[i * 3];
    land[i * 4 + 1] = src[i * 3 + 1];
    land[i * 4 + 2] = src[i * 3 + 2];
    land[i * 4 + 3] = y >= skyEnd[x] || inMoon(x, y) ? 255 : 0;
  }
// Behind the hills, each row of the sky image carries on the cloud colors from either side of the hill
// (skipping ink lines), so a cloud sliding out from behind a hill just looks like more cloud.
for (let y = 0; y < SKY_H; y++) {
  const clean = [];
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (y < skyEnd[x] - 6 && lum(i) > 215 && !isGreen(i) && !inMoon(x, y) && !inBird(x, y)) clean.push(x);
  }
  let k = 0;
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    let c;
    if (y < skyEnd[x]) c = inMoon(x, y) || inBird(x, y) ? skyRow[y] : rgb(i);
    else if (!clean.length) c = skyRow[y];
    else {
      while (k < clean.length - 1 && clean[k + 1] < x) k++;
      const left = clean[k] < x ? clean[k] : null;
      const right = clean.find((cx) => cx > x) ?? null;
      if (left === null) c = rgb(y * W + right);
      else if (right === null) c = rgb(y * W + left);
      else {
        const t = (x - left) / (right - left);
        const a = rgb(y * W + left), b = rgb(y * W + right);
        c = a.map((v, j) => Math.round(v + (b[j] - v) * t));
      }
    }
    sky.set(c, (y * W + x) * 3);
  }
}

// ---------- motion.png ----------
// Red = sway amount: 255 means the spot moves the full distance the page allows (see MAX_SWAY in index.astro).
// Green = lake water, which ripples.
const sway = new Float32Array(N);
const water = new Float32Array(N);

// Trees are painted in a few flat colors, so a pixel belongs to a tree when its color is closer to one
// of those than to the hill, bank, lake and sky colors around them.
const treeColors = [[148, 180, 100], [148, 176, 116], [228, 212, 136], [160, 196, 144], [172, 215, 157]];
const otherColors = [
  [189, 225, 176], [197, 229, 184], [200, 232, 188], [184, 220, 168], [184, 212, 152], [196, 224, 148],
  [211, 226, 156], [178, 215, 238], [164, 204, 216], [150, 185, 200], [232, 247, 255],
];
const dist = (i, c) => (src[i * 3] - c[0]) ** 2 + (src[i * 3 + 1] - c[1]) ** 2 + (src[i * 3 + 2] - c[2]) ** 2;
const isTree = (i) => Math.min(...treeColors.map((c) => dist(i, c))) < Math.min(...otherColors.map((c) => dist(i, c)));

// Tree areas: [left, right, top edge at this x, the ground they stand on, how far their tops sway in pixels].
// The top edge keeps hill outlines out of the area, so the hills don't wobble.
const treeAreas = [
  [0, 790, (x) => (x < 420 ? 690 : 815), 925, 4], // far shore, left
  [1420, 2040, (x) => (x < 1730 ? 690 : 845), 960, 4], // far shore, right
  [0, 390, (x) => (x < 110 ? 880 : 935), 1150, 7], // tall trees at the left of the lake
  [2010, 2360, () => 980, 1290, 8], // tall trees at the right of the lake
];
// Meadow: everything below this line (it slopes down to the right, like the near bank)
const meadowTop = (x) => 1080 + (x / W) * 140;
const MAX_SWAY = 14;
const isBlue = (i) => src[i * 3 + 2] > src[i * 3] + 30 && src[i * 3 + 2] > src[i * 3 + 1] + 8;

const shore = new Int32Array(W).fill(-1); // the far shoreline: the first lake pixel in each column
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    // Lake: blue pixels between the far shore and the near bank. The ripple fades in below the far
    // shoreline, so its ink line stays steady.
    if (y > 930 && y < 1240 && isBlue(i)) {
      if (shore[x] < 0) shore[x] = y;
      water[i] = Math.min(1, Math.max(0, (y - shore[x] - 8) / 30));
    }
    for (const [x0, x1, top, ground, amp] of treeAreas)
      if (x >= x0 && x < x1 && y >= top(x) && y < ground && isTree(i))
        // Bends like a stem: barely at the base, most at the top
        sway[i] = Math.max(sway[i], (amp * Math.min(1, (ground - y) / (ground - top(x))) ** 1.6) / MAX_SWAY);
    // Flower heads and the dotted wildflowers (anything not green) move most, more the nearer they are
    if (y > meadowTop(x) + 25 && !isBlue(i)) {
      const [r, g, b] = rgb(i);
      if (r >= g - 4 || b > g) {
        const near = (y - meadowTop(x)) / (H - meadowTop(x));
        sway[i] = Math.max(sway[i], (3 + 8 * near) / MAX_SWAY);
      }
    }
  }

// Little painted details in the grass (dotted wildflowers, grass strokes) sway too: find spots that differ
// from the blurred grass around them
const blurred = await sharp(src, { raw: { width: W, height: H, channels: 3 } }).blur(18).raw().toBuffer();
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (y < meadowTop(x) || isBlue(i)) continue;
    const d = Math.abs(src[i * 3] - blurred[i * 3]) + Math.abs(src[i * 3 + 1] - blurred[i * 3 + 1]) + Math.abs(src[i * 3 + 2] - blurred[i * 3 + 2]);
    if (d > 45) {
      const near = (y - meadowTop(x)) / (H - meadowTop(x));
      sway[i] = Math.max(sway[i], (3 + 6 * near) / MAX_SWAY);
    }
  }

// Spread each value over the ink lines next to it (so outlines move with their shapes), then soften
// everything so the bending is smooth and never tears the picture.
function grow(a, r) {
  const tmp = new Float32Array(N);
  const out = new Float32Array(N);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let m = 0;
      for (let k = -r; k <= r; k++) { const xx = x + k; if (xx >= 0 && xx < W) m = Math.max(m, a[y * W + xx]); }
      tmp[y * W + x] = m;
    }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let m = 0;
      for (let k = -r; k <= r; k++) { const yy = y + k; if (yy >= 0 && yy < H) m = Math.max(m, tmp[yy * W + x]); }
      out[y * W + x] = m;
    }
  return out;
}
const swayGrown = grow(sway, 6);
const motion = Buffer.alloc(N * 3);
for (let i = 0; i < N; i++) {
  motion[i * 3] = Math.round(Math.min(1, swayGrown[i]) * 255);
  motion[i * 3 + 1] = Math.round(water[i] * 255);
}
// Smooth, then store at half size (it only holds soft gradients)
await sharp(motion, { raw: { width: W, height: H, channels: 3 } })
  .blur(10)
  .resize(Math.round(W / 2), Math.round(H / 2))
  .png()
  .toFile(`${OUT}/motion.png`);

await sharp(land, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 88, alphaQuality: 100 }).toFile(`${OUT}/land.webp`);
await sharp(sky, { raw: { width: W, height: SKY_H, channels: 3 } }).webp({ quality: 88 }).toFile(`${OUT}/sky.webp`);
await sharp(SRC).webp({ quality: 88 }).toFile(`${OUT}/painting.webp`);

console.log(`painting ${W}x${H}, sky image ${W}x${SKY_H}`);
console.log(`moon at ${moon.x.toFixed(0)},${moon.y.toFixed(0)} r${moon.r.toFixed(0)}; birds removed: ${birds.length}`, birds);
