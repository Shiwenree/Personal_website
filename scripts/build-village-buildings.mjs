// Cuts the village buildings out of the drawing (Backgrounds/Untitled_Artwork.png) into one image each,
// so the Village page can place them separately and villagers can walk in front of and behind them.
// Run it again after changing the drawing:  node scripts/build-village-buildings.mjs
//
// Writes public/village/<name>.webp, trimmed to the drawn pixels (and the windmill's sails separately, as
// windmill-sails.webp, so they can turn). Prints each one's size, which
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
  windmill: { area: [1780, 150, 2340, 900], fills: [{ seeds: [[213, 560], [213, 572], [213, 584], [205, 600]], box: [153, 548, 273, 614], color: [169, 167, 162] }], sails: { hub: [211, 198] } },
  bookshop: { area: [1120, 940, 1620, 1470] },
};

for (const [name, { area, clearGrass, fills = [], sails }] of Object.entries(AREAS)) {
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

  if (sails) {
    const size = await splitSails(pic, width, height, sails.hub, `${OUT}/${name}-sails.webp`);
    console.log(`${name} sails: ${size} x ${size}, centered on the hub`);
  }

  await sharp(pic, { raw: picInfo }).webp({ quality: 90, alphaQuality: 100 }).toFile(`${OUT}/${name}.webp`);
  console.log(`${name}: ${width} x ${height}`);
}

// Takes the windmill's four sails off the picture, so the page can turn them. The sails are found from
// their pale yellow cloth: grouped into four blades by which way they point from the hub, and each blade
// boxed along its own slant (the cloth panel, plus the pole from the hub out to it). Everything in those
// boxes goes into a square picture centered on the hub (written to `file`); where they were, the tower
// and roof are filled back in from the colors around them, and the tower's outline is drawn back across.
async function splitSails(pic, W, H, hub, file) {
  const [hx, hy] = hub;
  const px = (i) => [pic[i * 4], pic[i * 4 + 1], pic[i * 4 + 2], pic[i * 4 + 3]];
  const isCloth = (i) => {
    const [r, g, b, a] = px(i);
    return a > 200 && r > 215 && g > 208 && b < 205 && r - b > 35;
  };
  const near = (i) => {
    const x = i % W, y = (i / W) | 0;
    return [x > 0 ? i - 1 : i, x < W - 1 ? i + 1 : i, y > 0 ? i - W : i, y < H - 1 ? i + W : i];
  };

  // The cloth, in patches (the grid lines split each panel into little squares), sorted into blades
  const seen = new Uint8Array(W * H);
  const blades = {};
  for (let s = 0; s < W * H; s++) {
    if (seen[s] || !isCloth(s)) continue;
    const patch = [], stack = [s];
    seen[s] = 1;
    while (stack.length) {
      const i = stack.pop();
      patch.push(i);
      for (const j of near(i)) if (!seen[j] && isCloth(j)) (seen[j] = 1), stack.push(j);
    }
    if (patch.length < 30) continue; // specks
    let sx = 0, sy = 0;
    for (const i of patch) (sx += i % W), (sy += (i / W) | 0);
    const which = (sy / patch.length < hy ? 't' : 'b') + (sx / patch.length < hx ? 'l' : 'r');
    (blades[which] ??= []).push(...patch);
  }

  // Each blade's slant (the long way of its cloth) and the cloth's extent along it (u, out from the
  // hub) and across it (v)
  const boxes = Object.values(blades).map((cloth) => {
    let mx = 0, my = 0;
    for (const i of cloth) (mx += i % W), (my += (i / W) | 0);
    (mx /= cloth.length), (my /= cloth.length);
    let xx = 0, yy = 0, xy = 0;
    for (const i of cloth) {
      const dx = (i % W) - mx, dy = ((i / W) | 0) - my;
      (xx += dx * dx), (yy += dy * dy), (xy += dx * dy);
    }
    const a = 0.5 * Math.atan2(2 * xy, xx - yy);
    let ux = Math.cos(a), uy = Math.sin(a);
    if ((mx - hx) * ux + (my - hy) * uy < 0) (ux = -ux), (uy = -uy);
    const box = { ux, uy, u0: Infinity, u1: -Infinity, v0: Infinity, v1: -Infinity };
    for (const i of cloth) {
      const dx = (i % W) - hx, dy = ((i / W) | 0) - hy;
      const u = dx * ux + dy * uy, v = -dx * uy + dy * ux;
      (box.u0 = Math.min(box.u0, u)), (box.u1 = Math.max(box.u1, u)), (box.v0 = Math.min(box.v0, v)), (box.v1 = Math.max(box.v1, v));
    }
    return box;
  });
  // Is (x, y) on a sail, give or take `m` px? (The cloth, its pole, and the round hub.)
  const onSail = (x, y, m) =>
    Math.hypot(x - hx, y - hy) <= 5 + m ||
    boxes.some(({ ux, uy, u0, u1, v0, v1 }) => {
      const dx = x - hx, dy = y - hy;
      const u = dx * ux + dy * uy, v = -dx * uy + dy * ux;
      return (u >= u0 - m && u <= u1 + m && v >= v0 - m && v <= v1 + m) || (u >= 0 && u <= u1 + m && v >= -m && v <= 2 + m);
    });

  // The sails: what's in the boxes, minus the roof and wall showing at their edges
  const showsBehind = (i) => {
    const [r, g, b] = px(i);
    return (r > 160 && g < 115 && b > 70) || (r > 190 && g > 130 && g < 205 && b < 135);
  };
  let reach = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (onSail(x, y, 4)) reach = Math.max(reach, Math.hypot(x - hx, y - hy));
  const half = Math.ceil(reach) + 2, size = half * 2;
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!onSail(x, y, 4) || (!onSail(x, y, 1) && showsBehind(i))) continue;
      pic.copy(out, ((y - hy + half) * size + (x - hx + half)) * 4, i * 4, i * 4 + 4);
    }
  await sharp(out, { raw: { width: size, height: size, channels: 4 } }).webp({ quality: 90, alphaQuality: 100 }).toFile(file);

  // Fill in behind them. Ink lines that ran up to a sail (stone outlines, the edge of the roof) are
  // cleared back a little too, so they end cleanly instead of smearing into the fill.
  const hole = new Uint8Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const [r, g, b] = px(y * W + x);
      if (onSail(x, y, 5) || (onSail(x, y, 9) && 0.3 * r + 0.59 * g + 0.11 * b < 110)) hole[y * W + x] = 1;
    }
  // Colors premultiplied by how see-through they are, so the fill fades out to nothing past the tower's
  // sides instead of picking up the see-through pixels' leftover colors. First copy in from the nearest
  // pixels around, then smooth it out.
  const P = new Float32Array(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const a = pic[i * 4 + 3] / 255;
    for (let c = 0; c < 3; c++) P[i * 4 + c] = pic[i * 4 + c] * a;
    P[i * 4 + 3] = a * 255;
  }
  const known = hole.map((h) => 1 - h);
  let edge = [];
  for (let i = 0; i < W * H; i++) if (hole[i] && near(i).some((j) => known[j])) edge.push(i);
  while (edge.length) {
    const filled = edge.filter((i) => !known[i]).map((i) => {
      const from = near(i).filter((j) => known[j]);
      return [i, [0, 1, 2, 3].map((c) => from.reduce((s, j) => s + P[j * 4 + c], 0) / from.length)];
    });
    for (const [i, color] of filled) known[i] = 1, color.forEach((v, c) => (P[i * 4 + c] = v));
    edge = [...new Set(filled.flatMap(([i]) => near(i).filter((j) => !known[j])))];
  }
  const holes = [];
  for (let i = 0; i < W * H; i++) if (hole[i]) holes.push(i);
  for (let pass = 0; pass < 400; pass++)
    for (const i of holes) {
      const [a, b, c, d] = near(i);
      for (let k = 0; k < 4; k++) P[i * 4 + k] = (P[a * 4 + k] + P[b * 4 + k] + P[c * 4 + k] + P[d * 4 + k]) / 4;
    }

  // Below the roof the tower's sides are straight, so there its outline is ruled across the gaps in line
  // with the parts that show; up in the roof, whatever the fill made of it is kept
  const EAVES = hy + 42;
  const side = (pick) => {
    const pts = [];
    for (let y = EAVES; y < H * 0.82; y++) {
      const row = [];
      for (let x = 0; x < W; x++) if (pic[(y * W + x) * 4 + 3] > 128) row.push(x);
      if (!row.length) continue;
      const x = pick(row);
      if (!hole[y * W + x] && !hole[y * W + x + (pick === Math.min ? -1 : 1)]) pts.push([y, x]);
    }
    // straight line x = a + b*y through them
    const n = pts.length, sy = pts.reduce((s, p) => s + p[0], 0), sx = pts.reduce((s, p) => s + p[1], 0);
    const syy = pts.reduce((s, p) => s + p[0] * p[0], 0), sxy = pts.reduce((s, p) => s + p[0] * p[1], 0);
    const b = (n * sxy - sy * sx) / (n * syy - sy * sy);
    return (y) => (sx - b * sy) / n + b * y;
  };
  const left = side((row) => Math.min(...row)), right = side((row) => Math.max(...row));

  for (const i of holes) {
    const x = i % W, y = (i / W) | 0;
    const alpha = P[i * 4 + 3];
    const inside = y >= EAVES ? x >= left(y) && x <= right(y) : alpha > 127;
    for (let c = 0; c < 3; c++) pic[i * 4 + c] = alpha > 1 ? Math.min(255, (P[i * 4 + c] / alpha) * 255) : 0;
    pic[i * 4 + 3] = inside ? 255 : 0;
  }
  // The outline, where the filled-in part meets the outside
  const INK = [40, 32, 24];
  for (const i of holes) {
    if (!pic[i * 4 + 3]) continue;
    const x = i % W, y = (i / W) | 0;
    let outer = false;
    for (let dy = -2; dy <= 2 && !outer; dy++)
      for (let dx = -2; dx <= 2 && !outer; dx++) {
        const X = x + dx, Y = y + dy;
        outer = dx * dx + dy * dy <= 5 && X >= 0 && X < W && Y >= 0 && Y < H && pic[(Y * W + X) * 4 + 3] < 128;
      }
    if (outer) INK.forEach((v, c) => (pic[i * 4 + c] = v));
  }
  redrawRoof(pic, W, H, hub, hole);
  return size;
}

// The roof's outline is straight too (two slopes up to the peak), and its bottom edge, where it meets the
// tower, a shallow curve. Smoothing over where the sails were leaves those lines broken and smudged, so
// each is measured from the parts that still show and drawn back across the gaps at the drawing's own
// thickness. The roof and wall either side of the bottom edge are filled in from their own colors along
// the same row, so the red and the yellow don't blur into each other.
function redrawRoof(pic, W, H, [hx, hy], hole) {
  const at = (x, y) => (y * W + x) * 4;
  const lum = (i) => 0.3 * pic[i] + 0.59 * pic[i + 1] + 0.11 * pic[i + 2];
  const shows = (x, y) => x >= 0 && x < W && y >= 0 && y < H && !hole[y * W + x];
  const opaque = (x, y) => pic[at(x, y) + 3] > 128;
  const isInk = (x, y) => opaque(x, y) && lum(at(x, y)) < 75;
  // (the roof's red, including the darker shading down its right side)
  const isRoof = (x, y) => {
    const i = at(x, y);
    return opaque(x, y) && pic[i] > 140 && pic[i + 1] < 120 && lum(i) >= 75;
  };
  const isWall = (x, y) => {
    const i = at(x, y);
    return opaque(x, y) && pic[i] > 180 && pic[i + 1] > 125 && pic[i + 2] < 140;
  };
  // Least-squares fit of v = a + b*u (+ c*u² when `curve`)
  const fit = (pts, curve) => {
    const n = curve ? 3 : 2;
    const A = Array.from({ length: n }, () => new Array(n + 1).fill(0));
    for (const [u, v] of pts) {
      const t = [1, u, u * u].slice(0, n);
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) A[r][c] += t[r] * t[c];
        A[r][n] += t[r] * v;
      }
    }
    for (let c = 0; c < n; c++)
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = A[r][c] / A[c][c];
        for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k];
      }
    const k = A.map((row, r) => row[n] / row[r]);
    return (u) => k[0] + k[1] * u + (curve ? k[2] * u * u : 0);
  };

  // The peak: the highest bit of roof showing straight above the hub
  let peak = hy;
  for (let y = 0; y < hy && peak === hy; y++) for (let x = hx - 20; x <= hx + 20; x++) if (shows(x, y) && opaque(x, y)) (peak = y), (x = hx + 21);

  // The bottom edge: in each column, the first line under the red
  const edgePts = [];
  for (let x = 0; x < W; x++)
    for (let y = hy + 10; y < hy + 55; y++) {
      if (!shows(x, y) || !isInk(x, y)) continue;
      if (shows(x, y - 3) && isRoof(x, y - 3)) {
        let y2 = y;
        while (y2 + 1 < H && shows(x, y2 + 1) && isInk(x, y2 + 1)) y2++;
        edgePts.push([x, y, y2]);
      }
      break;
    }
  // (fitted twice: the second time without the stray bits of line the first fit missed by a lot)
  const mid = edgePts.map(([x, y, y2]) => [x, (y + y2) / 2]);
  const rough = fit(mid, true);
  const bottom = fit(mid.filter(([x, y]) => Math.abs(y - rough(x)) < 3), true);
  // (a px thicker than measured, since the ends of the line that show wander a little off the fit)
  const bottomInk = median(edgePts.map(([, y, y2]) => y2 - y + 1)) + 1;

  // The slopes: the outermost drawn pixel in each row, from just under the peak to about where the
  // corners start (rows where that pixel is next to a gap don't count)
  const slope = (dir) => {
    const pts = [], widths = [];
    for (let y = peak + 6; y < peak + (hy - peak) * 1.15; y++) {
      let x = dir < 0 ? 0 : W - 1;
      while (x >= 0 && x < W && !opaque(x, y)) x -= dir;
      if (x < 0 || x >= W || !shows(x, y) || !shows(x + dir, y) || !shows(x - dir * 8, y)) continue;
      let w = 0;
      while (isInk(x - dir * w, y)) w++;
      pts.push([y, x]);
      widths.push(w);
    }
    const line = fit(pts, false);
    const cos = 1 / Math.hypot(1, line(1) - line(0));
    return { line, ink: median(widths) * cos, cos };
  };
  const L = slope(-1), R = slope(1);

  // How far inside the roof (x, y) is from each edge, in px (negative: outside it)
  const inside = (x, y) => [(x - L.line(y)) * L.cos, (R.line(y) - x) * R.cos, bottom(x) - y];
  // The nearest roof (or wall) pixel showing on each side along (dx, dy), mixed by how close each is
  const between = (x, y, [dx, dy], ok) => {
    const look = (s) => {
      for (let d = 1; d < W; d++) {
        const X = Math.round(x + s * d * dx), Y = Math.round(y + s * d * dy);
        if (X < 0 || X >= W || Y < 0 || Y >= H) return null;
        if (shows(X, Y) && ok(X, Y)) return [d, at(X, Y)];
      }
      return null;
    };
    const a = look(-1), b = look(1);
    if (!a || !b) return (a ?? b) && [0, 1, 2].map((c) => pic[(a ?? b)[1] + c]);
    return [0, 1, 2].map((c) => (pic[a[1] + c] * b[0] + pic[b[1] + c] * a[0]) / (a[0] + b[0]));
  };
  // Near a slope the roof is shaded along it (darker down the right side), so there the colors are
  // taken from along the slope; elsewhere from along the row
  const along = (line) => {
    const b = line(1) - line(0), len = Math.hypot(1, b);
    return [b / len, 1 / len];
  };
  const ROW = [1, 0];

  const INK = [56, 24, 6];
  const set = (i, rgb, alpha) => {
    for (let c = 0; c < 3; c++) pic[i + c] = Math.round(rgb[c]);
    pic[i + 3] = Math.round(alpha);
  };
  const fills = [];
  for (let y = Math.max(peak - 4, 0); y < Math.min(hy + 60, H); y++)
    for (let x = 0; x < W; x++) {
      if (!hole[y * W + x]) continue;
      const [dl, dr, db] = inside(x, y);
      const i = at(x, y);
      const side = Math.min(dl, dr);
      if (db < -bottomInk / 2) {
        // Under the bottom edge: the tower's wall, if this was filled in as part of it
        if (pic[i + 3] > 128) fills.push([i, between(x, y, ROW, isWall), 255]);
        continue;
      }
      if (side < -0.5) {
        set(i, [0, 0, 0], 0);
        continue;
      }
      const onSlope = dl < L.ink || dr < R.ink;
      if (onSlope || Math.abs(db) <= bottomInk / 2) {
        set(i, INK, side < 0.5 ? 255 * (side + 0.5) : 255);
        continue;
      }
      const dir = dl < 20 ? along(L.line) : dr < 20 ? along(R.line) : ROW;
      fills.push([i, between(x, y, dir, isRoof), 255]);
    }
  // (filled in after, so each fill reads only the drawing's own pixels, not ones just drawn)
  for (const [i, rgb, a] of fills) if (rgb) set(i, rgb, a);
}

function median(v) {
  return [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)];
}
