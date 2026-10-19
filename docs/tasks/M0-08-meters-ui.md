# M0-08: Meters and Pursuit clock UI

- **Zone:** `zone:feature`
- **Suggested tier:** `tier:B`
- **Depends on:** M0-01
- **Labels:** `task`, `zone:feature`, `tier:B`

## Goal
Show the four meters (Credits, Edge, Renown, Strain) and the Pursuit clock in the header and Hub. See game-design.md section 3.

## Files you may change
- src/ui/components/Hud.tsx and new files beside it
- src/ui/theme.css

## Files you must not change
- src/bridge/**, src/engine/**, src/story/**

## Acceptance criteria
- [ ] Header shows Credits (warning below the reserve), Edge pips (pool of 3), Renown (0 to 5), Strain (0 to 5).
- [ ] A Pursuit clock with one segment per cycle; filled segments are visible without colour alone (shape or label).
- [ ] Accessible labels for screen readers (for example "Pursuit 3 of 6").
- [ ] Fits 390 px without wrapping; dark and light. Screenshot in the PR.

## How to verify
```
npm run check
```

## Notes
Read values from the store; ranges and limits come from the data in `src/data/rules.json`.
