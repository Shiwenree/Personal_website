// The village layout, shared by the drawing (src/components/VillageScene.astro) and the walking
// code (src/pages/village.astro), so villagers know where the ground is and what to walk around.
// Everything is in "map units": the map is 1600 wide by 1000 tall, scaled to fit the page.

export const MAP = { width: 1600, height: 1000 };

// The clearing villagers can walk in (an oval). The forest fills everything outside a bigger oval.
export const WALKABLE = { cx: 800, cy: 565, rx: 585, ry: 315 };
export const FOREST_EDGE = { cx: 800, cy: 545, rx: 690, ry: 410 };

// A spot in the middle of the clearing. If a villager's straight path is ever blocked, it walks via here instead.
export const HUB = { x: 790, y: 600 };

// The main road: in from the forest at the bottom and up the middle to the flower cart. The buildings'
// own paths branch off it (or off each other).
const ROAD: Pt[] = [[720, 1010], [775, 780], [800, 560], [799, 362]];

type Pt = [number, number];
type Box = [number, number, number, number]; // [left, top, right, bottom]

// The buildings, cut out of the drawing (Backgrounds/Untitled_Artwork.png) by
// scripts/build-village-buildings.mjs. Spots marked "picture px" are measured in the cut-out picture.
export interface Building {
  name: string;
  about: string; // shown in the little card when you hover over (or tap) the building
  src: string;
  size: Pt; // the cut-out's size in picture px (that script prints them)
  // Map units per picture px. Each building gets its own so they look right next to each other: every
  // door is a bit shorter than a villager (villagers are about 72 map units tall, doors about 64).
  scale: number;
  x: number; // map: where the picture's bottom middle goes
  bottom: number;
  base?: number; // picture px: where the front wall meets the ground. Villagers below it walk in front.
  flat?: boolean; // lies on the ground (the garden): villagers are always drawn on top of it
  door: Pt; // picture px: where its path starts
  path?: Pt[]; // map: the rest of its path after the door; the last point is where it joins another path
  // picture px: the area villagers can't walk through. For standing buildings this also reaches up over
  // the whole picture, so villagers never walk behind a building and disappear.
  blocks: Box;
  // The windmill's sails, cut off into their own picture (centered on the hub) so they can turn.
  // `hub` is where they're pinned, in picture px; `size` is the sails picture's width and height.
  sails?: { src: string; size: number; hub: Pt };
}

export const BUILDINGS: Building[] = [
  // Door 125 px tall
  { name: 'Bakery', about: 'Something is always in the oven. Follow the smell of fresh bread.', src: '/village/bakery.webp', size: [374, 374], scale: 0.52, x: 470, bottom: 400, base: 340,
    door: [287, 300], path: [[560, 450], [680, 500], [797, 522]], blocks: [10, 240, 365, 360] },
  // No door: the main road ends at the front of the cart. The awning comes up to about 1.2 villagers.
  { name: 'Flower cart', about: 'At the top of the main road, with fresh flowers from the garden every morning.', src: '/village/cart.webp', size: [385, 346], scale: 0.36, x: 800, bottom: 365, base: 335,
    door: [190, 340], blocks: [20, 250, 370, 340] },
  // Door 123 px tall; the path starts at the bottom of the steps
  { name: 'Windmill', about: 'It grinds flour for the bakery whenever the breeze picks up.', src: '/village/windmill.webp', size: [422, 624], scale: 0.53, x: 1200, bottom: 500, base: 590,
    door: [213, 615], path: [[1110, 590], [950, 640], [792, 650]], blocks: [50, 470, 390, 600],
    sails: { src: '/village/windmill-sails.webp', size: 484, hub: [211, 198] } },
  // Fences about half a villager tall; the path comes in through the gap between them, off the bakery's
  { name: 'Garden', about: 'Where the vegetables grow, tended a little every day.', src: '/village/garden.webp', size: [576, 378], scale: 0.34, x: 440, bottom: 740, flat: true,
    door: [290, 90], path: [[452, 575], [520, 500], [605, 468]], blocks: [0, 0, 576, 378] },
  // Door 103 px tall; the path starts at the end of the stepping stones and joins the road out of the village
  { name: 'Bookshop', about: 'Quiet, cozy, and stacked to the ceiling.', src: '/village/bookshop.webp', size: [399, 412], scale: 0.64, x: 1080, bottom: 870, base: 345,
    door: [205, 405], path: [[930, 858], [770, 808]], blocks: [20, 270, 380, 350] },
];

const SIDE_ROOM = 14;

// A building's picture, door, ground line and blocked area in map units
export const placed = (b: Building) => {
  const w = b.size[0] * b.scale, h = b.size[1] * b.scale;
  const left = b.x - w / 2, top = b.bottom - h;
  const at = ([px, py]: Pt): Pt => [left + px * b.scale, top + py * b.scale];
  const [l, t] = at(b.flat ? [b.blocks[0], b.blocks[1]] : [Math.min(b.blocks[0], 0), 0]);
  const [r, bt] = at(b.flat ? [b.blocks[2], b.blocks[3]] : [Math.max(b.blocks[2], b.size[0]), b.blocks[3]]);
  return {
    left, top, w, h,
    at,
    ground: top + (b.base ?? b.size[1]) * b.scale,
    door: at(b.door),
    // Standing buildings get a little extra room at the sides too, so a villager standing right beside
    // one isn't half tucked behind its edge
    blocks: (b.flat ? [l, t, r, bt] : [l - SIDE_ROOM, t, r + SIDE_ROOM, bt]) as Box,
  };
};

// The walking paths: the main road, and each building's path from its door to where it joins
export const PATHS: Pt[][] = [ROAD, ...BUILDINGS.filter((b) => b.path).map((b) => [placed(b).door, ...b.path!])];

// Areas villagers can't walk through: [left, top, right, bottom]
export const OBSTACLES = BUILDINGS.map((b) => placed(b).blocks);
