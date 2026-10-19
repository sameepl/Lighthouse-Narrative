# M0-01: Cycle, meters and Pursuit clock (contracts and engine)

- **Zone:** `zone:core`
- **Suggested tier:** `tier:A`
- **Depends on:** none
- **Labels:** `task`, `zone:core`, `tier:A`

## Goal
Add the cycle layer to the rules engine and data, as pure tested TypeScript: the cycle state, the Renown meter, the Pursuit clock, upkeep, and the new Edge rules. Everything later builds on these contracts. See game-design.md sections 3 and 4.

## Files you may change
- src/engine/types.ts, src/engine/rules.ts
- new: src/engine/cycle.ts
- src/data/rules.json, src/data/schema.ts, src/data/validate.ts
- src/data/ships.json (add `tags`, `upkeep`), src/data/crew.json (add `assist`, `trait`, `trust`)
- tests/**
- docs/game-design.md (only to fix numbers you change)

## Files you must not change
- src/bridge/**, src/ui/**, src/story/**

## Acceptance criteria
- [ ] `CycleState` type: cycle number, actions left (2 per cycle), Pursuit value and length (6; 4 in the slice).
- [ ] `Renown` resource 0 to 5 in `rules.json`. Strain 0 to 5, Credits, and Edge (pool of 3) stay.
- [ ] Pursuit rules in `rules.json`: base +1 per cycle, +1 if Renown >= 3, +1 for a loud choice, -1 for a quiet choice; never below 0. When it reaches its length it is `full`.
- [ ] `endCycle(...)` pays upkeep per ship in service, ticks the Pursuit clock, and returns a report (`upkeep`, `pursuitDelta`, `full`).
- [ ] Edge is a pool of 3 for the whole run. `earnEdge` adds +1 (cap 3) and is meant to be called when a crew member reaches trust 3 (once per crew member).
- [ ] Crew schema: `assist {skill, n}`, `trait` (a tag), `trust` 0 to 3. Ship schema: `tags`, `upkeep`.
- [ ] The story can advance the Pursuit clock directly (for example asking Ariadne for a truth: +2). Route it through the existing ink function `add("Pursuit", n)` (the name maps to the clock, clamped at its length) or a new documented function; update `src/story/lib/world.ink` and `docs/WRITING.md`.
- [ ] Unit tests for every new function, including boundaries (Renown 2 and 3, Pursuit full, Edge cap, upkeep with zero ships).

## How to verify
```
npm run check
```

## Notes
Contracts are the point: keep the API small and named clearly; later tasks code against it. Numbers live in `rules.json`, not in code. After merging, add the new contract files to the `deny` lists in `.github/zones.json`.
