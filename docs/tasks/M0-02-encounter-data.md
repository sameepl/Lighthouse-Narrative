# M0-02: Encounter and keystone data layout, schemas, loader, content tests

- **Zone:** `zone:core`
- **Suggested tier:** `tier:A`
- **Depends on:** M0-01
- **Labels:** `task`, `zone:core`, `tier:A`

## Goal
Give encounters and keystones one JSON file each so parallel work never collides, validate them, and prove every entry points at a real ink knot. See game-design.md sections 5 and 6.

## Files you may change
- src/data/schema.ts, src/data/validate.ts, src/data/index.ts
- new: src/data/encounters/*.json, src/data/keystones/*.json
- new: tests/content.test.ts
- .github/zones.json (deny list)
- src/data/AGENTS.md

## Files you must not change
- src/ui/**, src/story/lib/**

## Acceptance criteria
- [ ] `EncounterSchema` with: `id`, `knot`, `layer` (crisis|commercial), `archetype`, `tags`, `requires` (min Credits, ship tag, gear, crew, flags, cycle range), `repeat` (once | repeatable + `cooldown`), `weight`, `cost`, `risk`, optional `lead`.
- [ ] `KeystoneSchema` with: `id`, `knot`, `title`, `elevates`, `availableWhen` (lead or cycle), `deadline` (cycle), `piece` (where|who|why|none), `requires`.
- [ ] A loader using `import.meta.glob` over both folders. Validation runs in dev and tests only (as for the other data); production uses the raw data.
- [ ] Convert "The Written Clause" into `src/data/encounters/written_clause.json` (crisis, standoff).
- [ ] `tests/content.test.ts`: ids are unique; every `knot` exists in the compiled ink (`ChoosePathString`); every referenced ship tag, crew id, flag and lead exists.
- [ ] A bad file fails with the file name and field.

## How to verify
```
npm run check
```

## Notes
Do not change game behaviour. This task only defines and checks the data. Add the schema files to the `deny` lists in `.github/zones.json`.
