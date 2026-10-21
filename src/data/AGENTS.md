# src/data: validated JSON data

- Every file is validated by `schema.ts` in dev and in `npm test`. A bad entry fails with the field name.
- Content zone may edit entity files (crew, ships, encounters). The schemas and `rules.json` are core.
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
