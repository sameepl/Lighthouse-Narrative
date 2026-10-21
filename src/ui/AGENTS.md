# src/ui: React interface

- Read state from the session's zustand store (`session.store`) and call `session.act(...)`. Never import `inkjs` here.
- Mobile first: 390 px wide, 44 px minimum tap targets, no horizontal scroll, safe-area padding. Test at that width.
- Colours and spacing come from CSS variables in `theme.css` (dark and light). Do not hard-code colours.
- Respect `prefers-reduced-motion`. Animation is for clarity, not decoration.
- Put new components in `components/`, one per file. Keep text out of components: story text is ink, labels live next to the component.
- Do not edit `src/bridge/` from a UI task. If you need new data, ask for a `zone:core` change first.
- GM-only terms are blocked by `tests/canon-guard.test.ts` (list in `.github/canon-guard.json`), including UI labels.
