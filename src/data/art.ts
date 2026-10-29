// Everything on the Art page, in the order it appears.
// Images live in src/assets/art (Astro resizes them for each screen). Photos are prepared with
// characters/tools/art-photos.py, or the same steps with sharp (turn upright, shrink to 2000px, strip
// metadata including GPS location),
// ink drawings with characters/tools/clean-line-art.py (white paper, black lines).
// Videos live in public/art as .mp4 plus a .jpg poster frame shown before they play.
// `caption` is optional.
import type { ImageMetadata } from 'astro';
import foodJournal from '../assets/art/food-journal-ink.jpg';
import fanDance from '../assets/art/fan-dance.jpg';
import birdhouses from '../assets/art/birdhouses.jpg';
import gorge from '../assets/art/gorge.jpg';
import stringLights from '../assets/art/string-lights.jpg';
import gardenRooftops from '../assets/art/garden-rooftops.jpg';
import redHibiscus from '../assets/art/red-hibiscus.jpg';
import blueCeiling from '../assets/art/blue-ceiling.jpg';
import chicagoRiver from '../assets/art/chicago-river.jpg';
import cityNight from '../assets/art/city-night.jpg';
import lighthouse from '../assets/art/lighthouse.jpg';
import pavilion from '../assets/art/pavilion.jpg';
import quietStreet from '../assets/art/quiet-street.jpg';
import redLattice from '../assets/art/red-lattice.jpg';
import rockyShore from '../assets/art/rocky-shore.jpg';
import templeEaves from '../assets/art/temple-eaves.jpg';

type Common = { title: string; caption?: string; category: string; alt: string };
export type ArtPiece =
  | (Common & { kind: 'image'; image: ImageMetadata })
  | (Common & { kind: 'video'; src: string; poster: string; width: number; height: number });

const photo = (title: string, image: ImageMetadata, alt: string, caption?: string): ArtPiece => ({
  kind: 'image',
  title,
  caption,
  category: 'Photography',
  image,
  alt,
});

export const art: ArtPiece[] = [
  {
    kind: 'video',
    title: 'Meet the villagers',
    caption: 'Drawing the whole cast, from Sammy to Night Owl.',
    category: 'Characters',
    src: '/art/standing-characters.mp4',
    poster: '/art/standing-characters.jpg',
    width: 904,
    height: 960,
    alt: 'Time-lapse of blue line drawings of the villagers: an otter, python, deer, Sammy, a goldfish, fox, giraffe, and night owl.',
  },
  photo('Chicago River', chicagoRiver, 'The Chicago River at dusk, lined with skyscrapers, boats on the water.'),
  photo('Temple eaves', templeEaves, 'Looking up at an ornate red and gold temple roof against a blue sky.'),
  {
    kind: 'image',
    title: 'Food journal',
    caption: 'A sketchbook page of things I ate around Chicago.',
    category: 'Sketchbook',
    image: foodJournal,
    alt: 'Ink sketchbook page of labeled food doodles: steamed egg, soondubu, lamb and mantou, blueberries, gelato, a latte, and more.',
  },
  photo('Pavilion', pavilion, 'Two people sitting in a painted wooden pavilion, a lotus pond and a traditional hall beyond.'),
  photo('Evening glow', stringLights, 'A brick-walled patio at dusk under rows of glowing string lights, two people talking on a bench.'),
  photo('Birdhouses', birdhouses, 'A tall pole stacked with colorful painted birdhouses against the sky.'),
  photo('Lighthouse', lighthouse, 'A white lighthouse at the top of wooden stairs through beach grass.'),
  {
    kind: 'image',
    title: 'Fan dance',
    caption: 'Performing with silk fans.',
    category: 'Dance',
    image: fanDance,
    alt: 'Two dancers on stage against a green backdrop, each holding a blue and white silk fan.',
  },
  photo('Garden rooftops', gardenRooftops, 'Dark tiled roofs with sharply upswept eaves over a pavilion, reflected in a still garden pond.'),
  photo('City lights', cityNight, 'A city skyline at night with red-lit towers above glowing traditional rooftops by a river.'),
  photo('Quiet street', quietStreet, 'A narrow paved street between old wooden houses, flowers along the side, hills behind.'),
  photo('Gorge', gorge, 'Hikers on a path at the bottom of a narrow gorge, green cliffs rising on both sides toward a pale sky.'),
  photo('Red lattice', redLattice, 'Looking up at a building wrapped in a dense red wooden lattice.'),
  photo('Rocky shore', rockyShore, 'Dark rocky cliffs meeting white surf under a partly cloudy sky.'),
  photo('Red hibiscus', redHibiscus, 'A single frilly red hibiscus flower hanging on a long stem over a blurred greenhouse path.'),
  photo('Aquarium', blueCeiling, 'A glowing blue glass ceiling framed by tall white columns.'),
];
