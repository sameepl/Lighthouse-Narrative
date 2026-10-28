# Art plan for the slice

Status: proposal for the owner. Claude plans, Codex builds and iterates, the owner picks. Nothing here is built yet except `hall.svg`.

## How art is used today

- One backdrop sits behind the top of the page, selected by the `# bg:<name>` tag in ink (`src/ui/assets/hall.svg` is `# bg:hall`; it predates the sci-fi direction below and will be redone last). It is an SVG with `viewBox="0 0 600 300"` and `preserveAspectRatio="xMidYMin slice"`.
- The UI masks it so only the top part shows and the bottom fades out, drifts it slowly, and crossfades it. In the light theme it is shown at 40 percent opacity (`--art: 0.4`).
- Text and buttons sit over the lower part. So the art is an atmospheric header, not a full screen illustration.
- Only `hall` exists, and `App.tsx` hardcodes it. A background registry is a UI task (below).

## Style: hard sci-fi, quiet and used

Direction (revised 2026-10-28 at the owner's request: more sci-fi than the current `hall.svg`).

- **Look:** hard-surface silhouettes with thin panel lines, docking clamps, gantry trusses, antenna masts, engine plumes, planet limbs with a rim of atmosphere, ring arcs, and instrument overlays (corner brackets, range rings, tick marks, reticles) drawn as abstract line work with no letters or numbers. Think a working frontier port seen through a ship's sensors, not a poster.
- **Palette:** the deep blue ground stays (`#070d1f` to `#14224a`), with cool structure blues (`#5f74a8` to `#8a9ccb`), white stars, **amber** (`#f0b24a`) for human warm light (windows, work-lights), and a new **electric cyan** (`#4fd8f0`) for instruments, engines and sensor overlays. A **hazard orange** (`#ff6a3d`) is allowed only for weapon fire and damage in the ship-versus-ship image. Cyan and amber together, never in the same size of shape.
- **Depth:** three value layers (sky, mid structures, near silhouettes), and one thin HUD layer on top at low opacity. Use gradients, never blur filters (they are slow on phones).
- **Motion (optional):** a CSS animation inside the SVG for one element, such as a slow engine pulse, a beacon blink or a range ring, under 2 seconds and switched off for `prefers-reduced-motion`. No scripts.
- **Avoid:** chrome and lens flares, glowing clutter, purple-to-blue gradient skies, anything that reads as a stock "space" wallpaper, and anything that fights the text over it.

**Never draw:** letters, numbers, faces, Marcus, children, any named character, powers or lights that read as abilities, Ariadne as a figure (at most a small steady amber light on a console), or anything from `docs/canon-gm/`. Hostile ships are hijack-crew cutters only: no Hunter craft, no Section hulls.

## Technical rules

- SVG only, `viewBox="0 0 600 300"`, `preserveAspectRatio="xMidYMin slice"`, no `<image>`, `<script>`, `<text>`, fonts, filters or external references.
- At most 14 KB each (`hall.svg` is 9 KB); the whole set at most 180 KB.
- Unique ids per file (prefix with the image name) so gradients never collide.
- **Safe area:** the focal element sits inside x 150 to 450 and y 20 to 130. On a narrow phone the sides are cropped, and below about y 165 the mask fades the image out.
- Reads at 390 px wide and at 1200 px wide, in both themes (in the light theme the art is shown at 40 percent, so the shapes must carry without the glow).

## Images for the slice

| Id | Used by | Location file | Composition | Light accents |
|---|---|---|---|---|
| `hall` | Hub | `hearthline-hall` | exists; redo in the new style last, so the set matches | amber windows |
| `berths` | trade run; K1 The Passenger | `hearthline-berths` | a long cold docking bay seen at an angle: clamp arms, berth lamps in a row, a gangway, one clamped work-light | amber lamps, a cyan guide strip |
| `market` | standoff | `hearthline-market` | Ring Two: stacked stall modules, lidded-bowl racks, a loader and a scanner as silhouettes, a smoke haze above | amber stall lamps, one cyan scanner line |
| `basin` | courier | `faraday-basin` | a yard cradle with a jump-capable hull under a gantry, the curve of a garden world low on the horizon | cyan gantry beacon, amber work lights |
| `shoal` | salvage | `the-shoal` | a belt of old hulks with hull plating exposed, wreck beacons, a drifting hauler turning slowly | amber beacons on their own rhythms |
| `gap` | scout | `fenrir-gap` | a corridor of survey buoys on a thin baseline, instrument spikes and a faint range ring | one cyan buoy |
| `lamps` | distress call | `psalter-lamp-field` | kept lamps hanging like a slow constellation, a small tender threading them | amber lamps, a faint cyan trace |
| `hab` | K2 The Silent Hab | `traffic-hab` | a hab ring with most windows dark, a few lit, a short docking arm, a small cutter silhouette approaching from the edge | two or three amber windows |
| `skirmish` | K2 (ship-versus-ship beat); any armed intercept | none | the player's ship and a hijack-crew cutter on a lane at long range: a thin cyan sensor lock arc between them, one hazard-orange tracer, engine plumes pointing away from a planet limb | cyan lock, one orange tracer |
| `dark_lane` | K3 The Dark Lane | `the-shoal`, `fenrir-gap` | a sparse starfield with an unlit gridded segment and no chart marks, a few sensor tick marks fading out | one distant cyan light |
| `pawn` | K5 The Asking | `ships/errant-pawn` | the inside of a small ship: a console, a viewport, the turret folded into the spine, sensor overlays on the glass | one small steady amber light on the console |
| `title` | title screen | none | the ring station seen from outside, small, with a long shadow and a ship leaving its berth | a few amber windows, cyan engine |
| `end_open` | ending (reaffirm) | none | a corridor wall with a doorway of light | the doorway, amber |
| `end_closed` | ending (withdraw) | none | the same corridor, the door shut, one lamp left | one amber lamp |

Thirteen new images. Ship silhouettes for Prepare and crew badges are stretch items, not slice items.

## How Codex iterates (loop)

1. **Build** one image from its row. Write the SVG, then render screenshots at 390 px and 1200 px, light and dark, with the real mask and a block of body text over it, using the existing browser tooling.
2. **Gate.** A small script fails on: wrong `viewBox` or aspect ratio, over 14 KB, a forbidden element (including `<filter>`), a colour outside the palette family (blues, white, amber, cyan, and hazard orange only in `skirmish`), a missing `id` prefix, a focal element outside the safe area (a simple luminance test is enough).
3. **Contact sheet.** Put all current images on one page, with the screenshots, so the set can be judged for consistency.
4. **Self-score** each image 0 to 2 on: cohesion with the set, readability under text, a clear focal point, mood match, and restraint. Revise anything under 8 of 10.
5. **Review.** Claude reviews the contact sheet against this plan and the canon rules, and gives per-image notes. The owner picks or redirects. Repeat until the owner approves.

Work in small PRs (three or four images each, plus the gate), in the content zone for the assets and the core or feature zone for the gate and the registry.

## UI work that goes with it

- A background registry: `bg` name to asset, crossfade, unknown names fall back to the last background, and assets load lazily (feature zone).
- Title and ending screens that use `title`, `end_open` and `end_closed` (feature zone, with the slice's ending decision).
- A test that every `# bg:` tag in `src/story` has an asset.

## Decisions (owner, 2026-10-28)

- Hard-surface vector sci-fi, not painterly raster.
- The two endings have their own backdrops (`end_open`, `end_closed`).
- Still open: whether some of the other twelve backdrops should be shared to cut the count.
