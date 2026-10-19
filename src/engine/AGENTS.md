# src/engine: the rules (pure TypeScript)

- No imports from `bridge`, `ui`, `inkjs`, React or the DOM. Pure functions over plain data.
- `types.ts` and `rules.ts` are contracts (core). Add new behaviour in new files and test it in `tests/`.
- Randomness is injected (`rng` parameter), never `Math.random()` inside logic, so tests and the simulation are reproducible.
- Unknown names (skills, resources, bonuses) must throw with a message that lists the valid names.
- Add unit tests for every exported function. Keep the numbers in `src/data/rules.json`, not in code.
