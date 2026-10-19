# M0-04: Keystone scheduler, leads and deadlines

- **Zone:** `zone:feature`
- **Suggested tier:** `tier:B`
- **Depends on:** M0-01, M0-02
- **Labels:** `task`, `zone:feature`, `tier:B`

## Goal
Decide when each keystone is available, due, or forced, including flexible order. See game-design.md section 6.

## Files you may change
- new: src/engine/keystones.ts
- tests/**

## Files you must not change
- src/engine/types.ts, src/engine/rules.ts, src/engine/cycle.ts, src/bridge/**, src/ui/**, src/data/schema.ts

## Acceptance criteria
- [ ] K1 is available first; K5 last. K2, K3, K4 in any order.
- [ ] A keystone becomes available when its lead is set or its available cycle arrives.
- [ ] A keystone not played by its deadline is forced, flagged as `weak` (fewer options).
- [ ] K5 requires at least two of K2 to K4 (or is forced when the Pursuit clock is full), and reports which pieces (where, who, why) the player holds.
- [ ] If K4's condition is not met, report that a commercial scene should take its place.
- [ ] Tests for ordering, deadlines, forced finale, and the pieces report.

## How to verify
```
npm run check
```

## Notes
Pure functions over plain data. Keystones are never random.
