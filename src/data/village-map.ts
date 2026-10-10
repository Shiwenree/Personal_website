// The village layout, shared by the drawing (src/components/VillageScene.astro) and the walking
// code (src/pages/village.astro), so villagers know where the ground is and what to walk around.
// Everything is in "map units": the map is 1600 wide by 1000 tall, scaled to fit the page.

export const MAP = { width: 1600, height: 1000 };

// The clearing villagers can walk in (an oval). The forest fills everything outside a bigger oval.
export const WALKABLE = { cx: 800, cy: 565, rx: 585, ry: 315 };
export const FOREST_EDGE = { cx: 800, cy: 545, rx: 690, ry: 410 };

// Areas villagers can't walk through: [left, top, right, bottom]. The clearing is open for now;
// add boxes here if things get drawn into it.
export const OBSTACLES: [number, number, number, number][] = [];

// The middle of the clearing. If a villager's straight path is ever blocked, it walks via here instead.
export const HUB = { x: 800, y: 580 };
