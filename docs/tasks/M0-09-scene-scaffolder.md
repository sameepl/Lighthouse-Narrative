# M0-09: `npm run new:scene` scaffolder

- **Zone:** `zone:core`
- **Suggested tier:** `tier:B`
- **Depends on:** M0-02, M0-05, M0-23 (required encounter display titles)
- **Labels:** `task`, `zone:core`, `tier:B`

## Goal
One command creates a correct scene skeleton and its data file, so cheap and local models start from a valid shape.

## Files you may change
- new: scripts/new-scene.mjs
- package.json (add the script)
- tests/**
- docs/WRITING.md

## Files you must not change
- src/ui/**, src/engine/**, src/bridge/**

## Acceptance criteria
- [ ] `npm run new:scene -- --id <id> --archetype <a> --layer <crisis|commercial>` writes `src/story/scenes/<id>.ink` and `src/data/encounters/<id>.json`.
- [ ] Generated encounter JSON includes a nonempty string `title` for display, separate from `id` and `knot`; any unfinished title is marked `[STUB]`.
- [ ] The ink skeleton has the setup, a three-approach menu with hints, a `roll()` per approach with three outcome knots each, consequence notes, and the `scene_end` divert; every placeholder is marked `[STUB]`.
- [ ] Refuses to overwrite existing files; validates the id (lowercase snake_case) and archetype.
- [ ] A test generates a scene in a temp folder and checks it compiles and passes the content test.
- [ ] Documented in WRITING.md and AGENTS.md.

## How to verify
```
npm run check
```

## Notes
The skeleton must pass `npm test` untouched.
