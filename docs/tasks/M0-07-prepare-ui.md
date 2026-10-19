# M0-07: Prepare screen: ship and crew assignment

- **Zone:** `zone:feature`
- **Suggested tier:** `tier:B`
- **Depends on:** M0-05
- **Labels:** `task`, `zone:feature`, `tier:B`

## Goal
Let the player choose which ship and crew take a job, with the cost of crew being busy visible. See game-design.md section 4.

## Files you may change
- src/ui/components/Prepare.tsx and new files beside it
- src/ui/App.tsx, src/ui/theme.css

## Files you must not change
- src/bridge/**, src/engine/**, src/story/**

## Acceptance criteria
- [ ] Lists ships (tags, upkeep) and crew (assist, trait, trust, busy).
- [ ] Shows the effect of an assignment (for example +1 Diplomat from Priya) before confirming.
- [ ] A crew member assigned to one action is shown as busy for the other that cycle.
- [ ] Uses the session actions from M0-05; never imports `inkjs`.
- [ ] 390 px wide, 44 px tap targets, dark and light, reduced motion. Screenshot in the PR.

## How to verify
```
npm run check
```

## Notes
Do not compute rules in the component; display what the session provides.
