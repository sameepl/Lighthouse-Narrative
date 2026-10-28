# Art plan for the slice

Status: proposal for the owner. Claude plans, Codex builds and iterates, the owner picks. Nothing here is built yet except `hall.svg`.

## How art is used today

- One backdrop sits behind the top of the page, selected by the `# bg:<name>` tag in ink (`src/ui/assets/hall.svg` is `# bg:hall`). It is an SVG with `viewBox="0 0 600 300"` and `preserveAspectRatio="xMidYMin slice"`.
- The UI masks it so only the top part shows and the bottom fades out, drifts it slowly, and crossfades it. In the light theme it is shown at 40 percent opacity (`--art: 0.4`).
- Text and buttons sit over the lower part. So the art is an atmospheric header, not a full screen illustration.
- Only `hall` exists, and `App.tsx` hardcodes it. A background registry is a UI task (below).

## Style

Match `hall.svg`: flat vector, three value layers at most (sky, mid structures, near silhouettes), a deep blue ground (`#070d1f` to `#14224a`), cool blue structures (`#5f74a8` to `#8a9ccb`), small white stars, and **amber** (`#f0b24a`) as the only warm light, used sparingly (a window, a lamp, a beacon). Mood: tired, practical, watched. No gradients that fight the text above them, no glow clutter.

**Never draw:** text or lettering, faces, Marcus, children, any named character, powers or lights that read as abilities, Ariadne as a figure (at most a small steady amber light on a console), or anything from `docs/canon-gm/`.

## Technical rules

- SVG only, `viewBox="0 0 600 300"`, `preserveAspectRatio="xMidYMin slice"`, no `<image>`, `<script>`, `<text>`, fonts or external references.
- At most 12 KB each (`hall.svg` is 9 KB); the whole set at most 150 KB.
- Unique ids per file (prefix with the image name) so gradients never collide.
- **Safe area:** the focal element sits inside x 150 to 450 and y 20 to 130. On a narrow phone the sides are cropped, and below about y 165 the mask fades the image out.
- Reads at 390 px wide and at 1200 px wide, in both themes.

## Images for the slice

| Id | Used by | Location file | Composition | Amber accent |
|---|---|---|---|---|
| `hall` | Hub | `hearthline-hall` | exists | exists |
| `berths` | trade run; K1 The Passenger | `hearthline-berths` | a long cold bay with berth lamps in a row, a gangway, one work-light clamped to a crate | work-light |
| `market` | standoff | `hearthline-market` | Ring Two stalls: lidded bowls, stall awnings, a loader and a scanner as silhouettes, onions-smoke haze above | a stall lamp |
| `basin` | courier | `faraday-basin` | a yard cradle and a hull under a gantry, garden world curve low on the horizon | gantry beacon |
| `shoal` | salvage | `the-shoal` | a belt of old hulks, beacon lights on their own rhythms, a drifting hauler | beacons |
| `gap` | scout | `fenrir-gap` | a corridor of drifting survey buoys, instrument spikes on a thin baseline | one buoy |
| `lamps` | distress call | `psalter-lamp-field` | lamps hanging like a slow constellation, a tender among them | the lamps |
| `hab` | K2 The Silent Hab | `traffic-hab` | a hab with most windows dark, a few lit, a short docking arm | two or three windows |
| `dark_lane` | K3 The Dark Lane | `the-shoal`, `fenrir-gap` | a sparse starfield with an unlit gridded segment and no chart marks | one distant light |
| `pawn` | K5 The Asking | `ships/errant-pawn` | the inside of a small ship: a console, a viewport, the turret folded into the spine | one small steady light on the console |
| `title` | title screen | none | the ring station seen from outside, small, with a long shadow | a few windows |
| `end_open` | ending (reaffirm) | none | a doorway of light on a corridor wall | the doorway |
| `end_closed` | ending (withdraw) | none | the same corridor, the door shut, one lamp left | the lamp |

Twelve new images. Ship silhouettes for Prepare and crew badges are stretch items, not slice items.

## How Codex iterates (loop)

1. **Build** one image from its row. Write the SVG, then render screenshots at 390 px and 1200 px, light and dark, with the real mask and a block of body text over it, using the existing browser tooling.
2. **Gate.** A small script fails on: wrong `viewBox` or aspect ratio, over 12 KB, a forbidden element, a colour outside the palette family, a missing `id` prefix, a focal element outside the safe area (a simple luminance test is enough).
3. **Contact sheet.** Put all current images on one page, with the screenshots, so the set can be judged for consistency.
4. **Self-score** each image 0 to 2 on: cohesion with the set, readability under text, a clear focal point, mood match, and restraint. Revise anything under 8 of 10.
5. **Review.** Claude reviews the contact sheet against this plan and the canon rules, and gives per-image notes. The owner picks or redirects. Repeat until the owner approves.

Work in small PRs (three or four images each, plus the gate), in the content zone for the assets and the core or feature zone for the gate and the registry.

## UI work that goes with it

- A background registry: `bg` name to asset, crossfade, unknown names fall back to the last background, and assets load lazily (feature zone).
- Title and ending screens that use `title`, `end_open` and `end_closed` (feature zone, with the slice's ending decision).
- A test that every `# bg:` tag in `src/story` has an asset.

## Decisions for the owner

- Is flat vector in the style of `hall.svg` the right direction, or do you want painterly raster art (heavier files, harder to keep consistent)?
- Is this set of twelve the right size for a slice, or should some share a backdrop?
- Do you want the two endings drawn differently, or one image with a different tint?
