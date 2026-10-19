# M0-11: Simulation test: 1,000 seeded runs

- **Zone:** `zone:feature`
- **Suggested tier:** `tier:B`
- **Depends on:** M0-03, M0-04
- **Labels:** `task`, `zone:feature`, `tier:B`

## Goal
Prove the cycle loop cannot dead-end. See game-design.md section 8 (Tests).

## Files you may change
- new: tests/simulation.test.ts and helpers beside it

## Files you must not change
- src/**

## Acceptance criteria
- [ ] Plays 1,000 runs with different seeds and a random policy (random offers, assignments and rolls) using only engine functions.
- [ ] Asserts: the finale is always reachable; the board is never empty; once-only encounters never repeat; keystone deadlines hold.
- [ ] On failure, prints the seed and the sequence so the run can be reproduced.
- [ ] Runs in under 30 seconds in CI.

## How to verify
```
npm run check
```

## Notes
If you find a bug in engine code, do not fix it here: report it in the issue with the seed.
