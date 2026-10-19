# src/data: validated JSON data

- Every file is validated by `schema.ts` in dev and in `npm test`. A bad entry fails with the field name.
- Content zone may edit entity files (crew, ships, encounters). The schemas and `rules.json` are core.
- One entity per file where a directory exists (for example `encounters/<id>.json`) so parallel work never collides.
- Ids are lowercase snake_case and unique. Do not rename an id that ink or saved games refer to.
- Placeholder numbers stay marked as placeholders (`"placeholder": true`).
