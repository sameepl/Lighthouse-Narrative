# M0-10: Six stub encounters and two stub keystones

- **Zone:** `zone:content`
- **Suggested tier:** `tier:C`
- **Depends on:** M0-05, M0-09
- **Labels:** `task`, `zone:content`, `tier:C`

## Goal
Fill the grey-box loop with placeholder scenes so a whole run can be played and tuned before real writing begins. Placeholder text only. See game-design.md sections 5, 6 and 9.

## Files you may change
- src/story/scenes/**
- src/data/encounters/**
- src/data/keystones/**

## Files you must not change
- everything else (code, contracts, ink lib, main.ink)

## Acceptance criteria
- [ ] Six encounters, one per archetype (Trade run, Courier, Salvage, Scout, Distress call, Standoff), created with `npm run new:scene`.
- [ ] Two keystones: K1 The Passenger and K5 Ariadne (working titles), as stubs.
- [ ] Every roll has three written outcomes; every scene ends via `scene_end`.
- [ ] All text starts with `[STUB]`, so it is never mistaken for final writing. Short, 40 to 80 words per passage.
- [ ] Marcus is never written for. Nothing about Ariadne or the pursuers is invented beyond placeholders.
- [ ] `npm test` passes (the branch-walk and content tests).

## How to verify
```
npm run check
```

## Notes
Copy `written_clause.ink` for tone and structure.
