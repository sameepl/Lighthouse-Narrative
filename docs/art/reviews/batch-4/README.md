# Batch four backdrop review

Candidate art: PR #155, commit `4b09a63d08e5344dce9ff7c3abbf62f4e446088c`, tree `37091001d55df2220217601b59d3baa5bfc794a7`. Registry integration: PR #156; test prerequisite: PR #153. These are review candidates, not merged art.

Captured from the repository's generated `npm run art:sheet` using installed Chromium, reduced motion, actual theme.css, header mask, art opacity and body typography. These are contact-sheet previews, not screenshots of played story states. At 1200px the app remains its real maximum 560px column. The sample prose and tall body area belong to the sheet. No pixels were retouched.

| Asset | 390 dark | 390 light | 1200 dark | 1200 light |
|---|---|---|---|---|
| hall | [view](hall-390-dark.png) | [view](hall-390-light.png) | [view](hall-1200-dark.png) | [view](hall-1200-light.png) |
| pawn | [view](pawn-390-dark.png) | [view](pawn-390-light.png) | [view](pawn-1200-dark.png) | [view](pawn-1200-light.png) |
| title | [view](title-390-dark.png) | [view](title-390-light.png) | [view](title-1200-dark.png) | [view](title-1200-light.png) |
| end_open | [view](end_open-390-dark.png) | [view](end_open-390-light.png) | [view](end_open-1200-dark.png) | [view](end_open-1200-light.png) |
| end_closed | [view](end_closed-390-dark.png) | [view](end_closed-390-light.png) | [view](end_closed-1200-dark.png) | [view](end_closed-1200-light.png) |

Validation: `npm run check` passed (571 tests, production build); full `npm run lint:art` passed (8 SVGs, 16,075 bytes); isolated content and feature zone checks passed. A fresh local browser loaded and decoded all eight registered SVGs through the real lazy imports. Published source trees match the checked local trees.

Independent local Claude visual review (actual `claude-sonnet-5-5`, 21 turns, zero permission denials) read all 20 PNGs. Verdict: approve for owner review, no concrete blockers. [Unedited saved verdict](claude-review.md). Codex also inspected representative mobile previews. No Astra usage was needed for this art-only review.

Nonblocking owner decisions: blue structure is faint at existing light-theme 40% opacity; the title station/ship is small on mobile; desktop column edges are visible. Opacity/layout changes are outside this batch. The current sheet describes header followed by body; it does not establish text-over-art readability or animated drift acceptance. No new SVG animation is present.

This evidence supersedes the earlier hall blocker for this candidate tree only. The old hall remains on main until the prerequisite and art PRs merge. Future art-plan status updates must account for the planner's separate proposal PR #151.
