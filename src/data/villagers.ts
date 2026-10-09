// Every villager's sprite sheets and animations, shared by the Works page and the Village.
// Sheets live in public/villagers and are made from the drawings in characters/ (see characters/tools).
// A sheet is all of a villager's frames side by side, each the same size, lined up at the feet.

// One step of an animation: [frame number in the sheet, milliseconds to hold it]
export type Step = [number, number];

export interface Villager {
  name: string;
  // Works page: front-facing, stands on the project's spot
  works: {
    sheet: string;
    frames: number; // how many frames are in the sheet
    width: number; // size of one frame in px
    height: number;
    rest: number; // frame shown while doing nothing
    idle: Step[]; // played every few seconds
    hover: Step[]; // played when the mouse moves onto them
    click: Step[]; // played on click / tap
  };
  // Village: walks around
  village: {
    sheet: string;
    frames: number;
    width: number;
    height: number;
    left: number[]; // walk cycle frames heading left
    right: number[]; // walk cycle frames heading right
    rest: number; // frame shown while standing still
    restRight?: number; // for villagers whose resting pose faces sideways: the pose after walking right
    idle: Step[]; // sometimes played while resting
    speed?: number; // walking speed in px per second (default 70)
    stepMs?: number; // time per walk frame (default 170)
  };
}

export const villagers: Record<string, Villager> = {
  sammy: {
    name: 'Sammy',
    // Frames: 0-2 smile (closed, half, open), 3-5 wave (paw by cheek, up, out), 6 wink (unused), 7-8 hearts (low, high)
    works: {
      sheet: '/villagers/sammy.webp',
      frames: 9,
      width: 440,
      height: 498,
      rest: 0,
      idle: [[1, 110], [2, 900], [1, 110], [0, 110]],
      // Wave hello twice, then settle back down
      hover: [
        [2, 90], [3, 130], [4, 130], [5, 170], [4, 130], [5, 170],
        [4, 130], [3, 130], [2, 300], [1, 110], [0, 110],
      ],
      // Hearts float up
      click: [[2, 90], [7, 300], [8, 700], [2, 300], [1, 110], [0, 110]],
    },
    // Frames: 0-2 walk left (step, passing, other step), 3-5 walk right, 6-8 smile
    village: {
      sheet: '/villagers/sammy-walk.webp',
      frames: 9,
      width: 450,
      height: 379,
      left: [0, 1, 2, 1],
      right: [3, 4, 5, 4],
      rest: 6,
      idle: [[7, 110], [8, 900], [7, 110], [6, 0]],
    },
  },

  foxy: {
    name: 'Blossom',
    // Frames: 0 stationary, 1 eyes half closed, 2 eyes closed, 3 fangs (click), 4 tongue out, 5 tongue a little out
    works: {
      sheet: '/villagers/foxy.webp',
      frames: 6,
      width: 456,
      height: 436,
      rest: 0,
      // Sleepy slow blink
      idle: [[1, 160], [2, 1100], [1, 160], [0, 160]],
      // Tongue pokes out a little, then all the way, then back in
      hover: [[5, 160], [4, 1000], [5, 160], [0, 150]],
      click: [[3, 900], [0, 150]],
    },
    // Frames: 0-2 walk left (mirrored from the right-facing drawings), 3-5 walk right, 6 stationary, 7-8 sleepy blink
    village: {
      sheet: '/villagers/foxy-walk.webp',
      frames: 9,
      width: 386,
      height: 440,
      left: [0, 1, 2, 1],
      right: [3, 4, 5, 4],
      rest: 6,
      idle: [[7, 160], [8, 1100], [7, 160], [6, 0]],
    },
  },

  duck: {
    name: 'Rubber Debuggy',
    // Frames: 0 stationary, 1-2 sprout sways one way then the other, 3-5 flower blooms (click), 6-8 flapping (hover)
    works: {
      sheet: '/villagers/duck.webp',
      frames: 9,
      width: 330,
      height: 507,
      rest: 0,
      // The sprout on its head sways back and forth twice, passing through upright (stationary) in between
      idle: [[1, 450], [0, 220], [2, 450], [0, 220], [1, 450], [0, 220], [2, 450], [0, 220]],
      // Flap flap
      hover: [[6, 120], [7, 120], [8, 140], [7, 120], [6, 120], [7, 120], [8, 140], [7, 120], [0, 150]],
      // The sprout blooms into a flower, then closes back up
      click: [[3, 180], [4, 180], [5, 1200], [4, 150], [3, 150], [0, 150]],
    },
    // Frames: 0-2 walk left (step, passing, other step), 3-5 walk right (mirrored), 6 stationary, 7-8 sprout sway
    village: {
      sheet: '/villagers/duck-walk.webp',
      frames: 9,
      width: 364,
      height: 474,
      left: [0, 1, 2, 1],
      right: [3, 4, 5, 4],
      rest: 6,
      idle: [[7, 450], [6, 220], [8, 450], [6, 220], [7, 450], [6, 220], [8, 450], [6, 0]],
    },
  },

  python: {
    name: 'Python',
    // Frames: 0 stationary, 1 smile, 2 small fangs, 3 big fangs, 4 happy squint (hover), 5 unimpressed (click)
    works: {
      sheet: '/villagers/python.webp',
      frames: 6,
      width: 442,
      height: 407,
      rest: 0,
      // Smile, then show the fangs and tuck them away again
      idle: [[1, 200], [2, 200], [3, 1000], [2, 200], [1, 200], [0, 200]],
      hover: [[4, 1100], [0, 150]],
      click: [[5, 1100], [0, 150]],
    },
    // Frames: 0-2 slither left (mirrored), 3-5 slither right, 6 resting facing left, 7 resting facing right
    village: {
      sheet: '/villagers/python-walk.webp',
      frames: 8,
      width: 474,
      height: 409,
      left: [0, 1, 2, 1],
      right: [3, 4, 5, 4],
      rest: 6,
      restRight: 7,
      idle: [],
      // A slow, lazy slither
      speed: 35,
      stepMs: 260,
    },
  },

  owl: {
    name: 'Night Owl',
    // Frames: 0 stationary, 1 eyes half closed, 2 eyes closed, 3 nervous (hover), 4 grumpy (click)
    works: {
      sheet: '/villagers/owl.webp',
      frames: 5,
      width: 358,
      height: 397,
      rest: 0,
      // Dozing off
      idle: [[1, 220], [2, 1300], [1, 220], [0, 200]],
      hover: [[3, 1200], [0, 150]],
      click: [[4, 1100], [0, 150]],
    },
    // Frames: 0-2 walk right (as drawn, looking slightly right), 3-5 walk left (mirrored), 6 stationary, 7-8 dozing
    village: {
      sheet: '/villagers/owl-walk.webp',
      frames: 9,
      width: 358,
      height: 397,
      left: [3, 4, 5, 4],
      right: [0, 1, 2, 1],
      rest: 6,
      idle: [[7, 220], [8, 1300], [7, 220], [6, 0]],
    },
  },

  fish: {
    name: 'Lucky',
    // Frames: 0 stationary, 1 mouth closed, 2 mouth "o", 3-4 bubbles rising (hover), 5-7 dozing with Z's (click)
    works: {
      sheet: '/villagers/fish.webp',
      frames: 8,
      width: 360,
      height: 341,
      rest: 0,
      // Blub
      idle: [[1, 250], [2, 700], [1, 250], [0, 200]],
      // Bubbles
      hover: [[3, 350], [4, 450], [3, 350], [4, 450], [0, 150]],
      // Dozes off, Z's drifting up
      click: [[5, 450], [6, 450], [7, 450], [5, 450], [6, 450], [7, 450], [0, 150]],
    },
    // Frames: 0-2 waddle right (as drawn), 3-5 waddle left (mirrored), 6 stationary, 7-8 blub
    village: {
      sheet: '/villagers/fish-walk.webp',
      frames: 9,
      width: 362,
      height: 370,
      left: [3, 4, 5, 4],
      right: [0, 1, 2, 1],
      rest: 6,
      idle: [[7, 250], [8, 700], [7, 250], [6, 0]],
    },
  },
};
