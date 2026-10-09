# Personal Portfolio Site: Project Brief

## About me and this project
I'm a software engineer who also makes art. This is my personal portfolio site for job hunting and for showing my creative work. I'm coding it myself with help, and I'm new to Astro, so explain what you're doing and why as we go, and keep changes small enough for me to follow.

## The concept
- Every project on the site has its own **original animal villager character**. The animal's design hints at what the project is (e.g. a fox for a backend project, an owl for ML work).
- Each project page is **visually themed around its animal**: its own colors, illustrations and small details.
- The **Village** is a cozy, explorable 2D village game (vibe: cute village games like Animal Jam or Stardew Valley, but with fully original characters and art). You walk around, and talking to a villager or entering their house opens that project's page. My art can hang in a gallery building.
- The village is a **bonus layer**. Recruiters must be able to reach every project quickly without playing, through the Works grid.

## Site structure (top-level tabs)
- **Works:** fast grid of SWE projects. Each card shows the project's villager sprite and links to its themed project page.
- **Village:** the game.
- **Art:** a plain, easy-to-browse gallery of my artwork.
- **About:** my story, résumé (PDF in `public/`), contact links (email, GitHub, LinkedIn, art Instagram).

Both the Works cards and the villagers link to the **same** project pages.

## Tech stack
- **Astro** for the site (pages, layouts, components, content collections)
- **Phaser** for the village game, loaded only on the Village page
- **Tiled** for building the village map (exported as JSON)
- **Aseprite or LibreSprite** for drawing sprites (placeholder tilesets from itch.io are fine until my art is ready)
- **Git + GitHub**, deployed on **Vercel or Netlify** with auto-deploy on push
- **Custom domain** connected through the host

## Data model
One shared source of truth for projects, read by both the Astro pages and the Phaser game, so adding a project updates the Works grid and the village at the same time. Each project entry includes roughly:
`slug, title, role, date, summary, tags, animal, sprite, theme colors, houseLocation (x, y on the map), links (GitHub, live demo)`

Use Astro content collections for projects (`src/content/projects/`) and art (`src/content/art/`).

## Build order
1. Set up the Astro project, base layout, nav with the four tabs, and deploy an early version.
2. Build the Works grid from the shared project data, plus 2–3 project pages.
3. Theme the first project pages around their animals.
4. Build the Art gallery and About page.
5. Village prototype: one Tiled map, a walkable player character, camera follow, collisions, and one villager you can talk to that links to a project page.
6. Expand the village: more villagers and houses, art gallery building, ambient details, day/night, music.
7. Polish: performance (optimized images via Astro's `<Image>`), mobile layout, accessibility, SEO/Open Graph tags.

## Guidelines
- Keep the site fast. The game's JavaScript should load only on the Village page.
- Make sure everything works on mobile. The village can offer a simpler fallback on small screens.
- All characters and art must be my own original designs.