# M0-03: Board builder and selector with a seeded RNG

- **Zone:** `zone:feature`
- **Suggested tier:** `tier:B`
- **Depends on:** M0-01, M0-02
- **Labels:** `task`, `zone:feature`, `tier:B`

## Goal
Pick which offers appear on the Hub board each cycle, deterministically from a saved seed. See game-design.md section 5 (Selection rules).

## Files you may change
- new: src/engine/rng.ts, src/engine/board.ts
- tests/**

## Files you must not change
- src/engine/types.ts, src/engine/rules.ts, src/engine/cycle.ts, src/bridge/**, src/ui/**, src/data/schema.ts

## Acceptance criteria
- [ ] `rng.ts`: a small seeded generator (for example mulberry32) whose state can be saved and restored as a plain number.
- [ ] `buildBoard(input, rng)` returns offers. Input: cycle, resources, ships, crew, flags, played ids with cooldowns, the encounter list.
- [ ] Eligibility: requirements met, once-only never repeated, repeatables respect `cooldown`.
- [ ] Guarantees: one crisis, two or three commercial offers (one affordable, one a stretch), and a keystone lead when one is due (take this from M0-04's output if available, otherwise accept it as an input).
- [ ] Weighted draw; the same seed and state always give the same board.
- [ ] If the eligible pool is too small, degrade gracefully (fewer offers, never an empty board).
- [ ] Tests for each rule above, including determinism and the small-pool case.

## How to verify
```
npm run check
```

## Notes
Pure functions only: no imports from bridge, ui or inkjs. Use the types from M0-01 and M0-02; do not invent fields.
