# M0-05: Bridge: Hub flow, divert to encounter knots and back

- **Zone:** `zone:core`
- **Suggested tier:** `tier:A`
- **Depends on:** M0-03, M0-04
- **Labels:** `task`, `zone:core`, `tier:A`

## Goal
Make the session run the cycle loop: Hub, board, Prepare, two actions, Downtime, Pursuit tick; send the story to an encounter's knot and return to the Hub when the scene ends. See game-design.md section 3 and ADR 0002.

## Files you may change
- src/bridge/**
- src/story/lib/**, src/story/main.ink
- src/ui/persist.ts (save version)
- tests/**
- docs/WRITING.md

## Files you must not change
- src/ui/components/**

## Acceptance criteria
- [ ] A new ink contract: a `scene_end` knot in `src/story/lib/` that tells the bridge the scene is over; document it in WRITING.md.
- [ ] Session phases for hub, prepare and scene; `GameView` gains the board offers, cycle info and assignments (document the fields in `types.ts`).
- [ ] Actions on the session: pick an offer, assign crew and ship, confirm, end cycle.
- [ ] The bridge diverts with `ChoosePathString(knot)` and returns to the Hub on `scene_end`.
- [ ] Save format version 2 includes engine cycle state, RNG state and played ids; version 1 saves are discarded cleanly.
- [ ] Tests: a scripted multi-cycle run with fixed dice and seed; save and load in the Hub and mid-scene.
- [ ] The story can advance the Pursuit clock directly (for example asking Ariadne for a truth: +2). Route it through the existing ink function `add("Pursuit", n)` (the name maps to the clock, clamped at its length) or a new documented function; update `src/story/lib/world.ink` and `docs/WRITING.md`.
- [ ] Integrate and persist the engine cycle state and the one-time crew Edge reward state from #1 (they are deliberately separate from the bridge's existing `GameState` until this task).
- [ ] Update `written_clause.ink` so it ends via `scene_end`.

## How to verify
```
npm run check
```

## Notes
Ink must never decide scheduling. Keep `session.ts` readable; split into modules if it grows past about 400 lines.
