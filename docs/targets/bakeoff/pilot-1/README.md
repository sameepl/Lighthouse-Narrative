# Bake-off pilot 1

Pilot for the bake-off in `docs/proposals/model-routing.md` section 5b and 5c. One category (a roster stub), one fresh brief, six models, two samples each.

- **Brief:** `brief.json`. A standoff at the Hearthline market ("The Double Order"), crisis layer, placeholder effects inside the bands. Written by Claude; **needs a Codex co-sign** before the result is relied on. It was not shown to any writer model before the pilot. Not a hold-out brief from the stub trial.
- **Writer prompt:** `writer-prompt.md`. Identical for every model. Give a model that text only: no repository access, no other candidates, no target scene text, no `docs/canon-gm/`.
- **Models and samples:** Sonnet, Opus, Sol, Astra, Luna and Qwen, two samples each (12 candidates). Use each model's normal settings and record them. Qwen: structured JSON output and a context of at least 16k if possible, with the settings recorded.
- **Output:** one JSON file per sample, exactly as returned.

## Process

1. **Generate.** Claude produced the Sonnet and Opus candidates in a session using one subagent per sample. Codex produces the Sol, Astra, Luna and Qwen candidates. Neither side looks at the other's output until both are done.
2. **Gates.** Run each candidate through `npm run assemble:scene` against a throwaway root, as `docs/CONTENT_GENERATION.md` section 11 describes, and record every lint message. Do not edit candidates.
3. **Anonymise.** The coordinator gives each candidate a random id and keeps the id-to-model key private. Judges never see the key, and candidate text is not edited.
4. **Judge.** Score every candidate on the 10-criterion rubric in `../README.md`. Claude-family candidates are scored by an OpenAI-family judge, OpenAI and Qwen candidates by a Claude judge, and Qwen by both. No judge scores its own family. Judges also record the lint result as context but score the prose.
5. **Owner.** Rates the finalists blind (top three or four).
6. **Report.** Per model: gate failures, rubric score, tokens, rounds, and the owner's rank.

Results go in `results.md` in this folder.

## Open questions for the Codex co-sign

- Are the effects, label lengths and state nouns in the brief correct for the lint? (The brief lists `bell` as a state noun, which may be wrong because the bell is the deadline, not something an outcome changes.)
- Is the Qwen configuration fair?
