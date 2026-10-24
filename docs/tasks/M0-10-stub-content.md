# M0-10: Six stub encounters and five stub keystones

- **Zone:** `zone:content`
- **Suggested tier:** `tier:C`
- **Depends on:** M0-05, M0-09, and the M0 hardening issues #23 (titles), #24 (piece names), #25 (season config)
- **Labels:** `task`, `zone:content`, `tier:C`

## Goal
Fill the grey-box loop with placeholder scenes so a whole run can be played and tuned before real writing begins. Placeholder text only. See game-design.md sections 5, 6 and 9.

## Files you may change
- src/story/scenes/**
- src/data/encounters/**
- src/data/keystones/**
- src/data/season.json (only with the initial keystones, after #25 merges)

## Files you must not change
- everything else (code, contracts, ink lib, main.ink)

## Acceptance criteria
- [ ] Six encounters, one per archetype (Trade run, Courier, Salvage, Scout, Distress call, Standoff), created with `npm run new:scene`.
- [ ] Five placeholder keystones: K1 The Passenger, two slice middle keystones, one additional conditional middle for the full run, and K5 The Asking. Unapproved names and details remain `[STUB]`.
- [ ] Every roll has three written outcomes; every scene ends via `scene_end`.
- [ ] All text starts with `[STUB]`, so it is never mistaken for final writing. Short, 40 to 80 words per passage.
- [ ] Marcus is never written for. Nothing about Ariadne, the pursuers or Marcus's past is invented beyond placeholders, and no `[GM-ONLY]` or HELD canon is used (see `docs/canon/README.md`).
- [ ] `npm test` passes (the branch-walk and content tests).
- [ ] Initial keystone data, compiled scene knots and configured `season.json` land atomically. Slice uses opening, two middles and finale (both middles required); full adds the conditional middle and requires at least two middles. Follow the validated shape in `src/data/AGENTS.md`; no missing ID is silently accepted.
- [ ] A real-catalog run reaches a written placeholder ending. Isolated draft compilation is not this completion gate.

## How to verify
```
npm run check
```

## Notes
Copy `written_clause.ink` for tone and structure.

Owner approved expansion to five keystones on 2026-10-23 to match #25's slice/full contracts. The live issue body is authoritative for scope amendments. Qwen may prepare one scaffolded scene/data pair at a time outside the repository while dependencies settle; Codex checks exact paths, canon/agency, paragraph lengths, compilation and every outcome before any source acceptance. Content never edits schemas, loaders, tests or story libraries. Initial season activation still requires merged #25, full repository checks and real-catalog evidence.
