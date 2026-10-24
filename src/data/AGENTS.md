# src/data: validated JSON data

- Every file is validated by `schema.ts` in dev and in `npm test`. A bad entry fails with the field name.
- Content zone may edit entity files (crew, ships, encounters, keystones) and `season.json`. The schemas and `rules.json` are core.
- One entity per file where a directory exists (for example `encounters/<id>.json`) so parallel work never collides.
- Ids are lowercase snake_case and unique. Do not rename an id that ink or saved games refer to.
- Placeholder numbers stay marked as placeholders (`"placeholder": true`).

## Storylet contracts

- Encounters: `encounters/<id>.json`; keystones: `keystones/<id>.json`. The eager glob loader discovers both; an empty keystone catalog is valid. IDs match filenames and are globally unique across both catalogs. `knot` names a top-level compiled ink knot.
- Requirements are all-of: optional `minCredits`, `shipTag`, `gear` (tag array), `crew` (ID array), `flags` (boolean ink variable names), and inclusive `cycle: { min?, max? }`. Absent requirements impose no restriction. Gear tags receive syntax checks only until a gear registry exists.
- Encounter `repeat` is `{ "kind": "once" }` or `{ "kind": "repeatable", "cooldown": 1 }` (nonnegative cycles). Archetypes use snake_case: `trade_run`, `courier`, `salvage`, `scout`, `distress_call`, `standoff`. `weight` is positive; `cost` is nonnegative Credits; `risk` is a short player-facing hint.
- Leads are keyed by declared keystone IDs. Encounter `lead` emits that key. Keystone `availableWhen` accepts `lead` and/or `cycle`, with OR semantics; deadline cannot precede its availability cycle. A lead need not yet have a producer. Do not invent keystones merely to satisfy a reference.
- Schemas are strict, with no defaults or transforms: production uses raw JSON, while development/tests validate it. `tests/content.test.ts` additionally checks knots and boolean flags against compiled ink. Bad metadata reports its source filename and field.
- GM-only terms are blocked by `tests/canon-guard.test.ts` (list in `.github/canon-guard.json`), including in JSON strings.

## Season activation

`season.json` is required. Keep `{ "status": "unconfigured" }` while the catalog is incomplete; this leaves scheduling unconfigured. Do not invent keystone IDs to activate it. Activation is one atomic content PR adding the keystone JSON files and their compiled scene knots, then replacing the file with this shape (example IDs below are placeholders, not canon):

```json
{
  "status": "configured",
  "slice": {
    "firstId": "opening",
    "middleIds": ["middle_a", "middle_b"],
    "finaleId": "finale",
    "minCompletedMiddle": 2
  },
  "full": {
    "firstId": "opening",
    "middleIds": ["middle_a", "middle_b", "conditional_middle"],
    "conditionalId": "conditional_middle",
    "finaleId": "finale",
    "minCompletedMiddle": 2
  }
}
```

Both modes share opening/finale IDs. Slice has exactly two middle roles and requires both; full adds one conditional middle and requires at least two (threshold 2 or 3). First, middle and finale IDs must be distinct within each mode and resolve in `keystones/`. `conditionalId` is membership in the full middle list, not a separate role; it must be the additional middle absent from slice. Extra fields are rejected. `RunOptions.slice` selects the mode; `keystoneRoles` remains an explicit test override. Run `npm run check` before activation.
