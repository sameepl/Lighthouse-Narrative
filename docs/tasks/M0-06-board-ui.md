# M0-06: Board screen UI

- **Zone:** `zone:feature`
- **Suggested tier:** `tier:B`
- **Depends on:** M0-05
- **Labels:** `task`, `zone:feature`, `tier:B`

## Goal
Show the offers for the cycle as cards the player can choose between. See game-design.md section 3.

## Files you may change
- src/ui/components/Board.tsx and new files beside it
- src/ui/App.tsx, src/ui/theme.css
- src/ui/assets/**

## Files you must not change
- src/bridge/**, src/engine/**, src/story/**

## Acceptance criteria
- [ ] A card per offer: layer icon (crisis, commercial), title, cost, risk hint, and why it is locked when it is.
- [ ] Shows actions left this cycle and the cycle number.
- [ ] Tapping a card calls the session action from M0-05; it never imports `inkjs`.
- [ ] 390 px wide, 44 px minimum tap targets, dark and light themes, respects reduced motion.
- [ ] Include a screenshot at 390 px in the PR.

## How to verify
```
npm run check
```

## Notes
Use only what `GameView` provides. If you need data it lacks, stop and request a `zone:core` change.
