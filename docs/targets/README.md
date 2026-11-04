# Targets: what good stub content looks like

Two reference scenes, written to the contract in `../CONTENT_GENERATION.md`. They are **not shipped**: they live in `docs/targets/` so they never enter the build. Both were copied into the real tree and passed `npm test` (schema, compile, and the walk of every branch), then removed. Revised 2026-10-26: the first versions did **not** pass the content gates they were meant to set the bar for (no sentence under nine words in several passages, and one two-word opener five times). They were rewritten, and both now pass the full lint when assembled with `npm run assemble:scene`. Also changed: the scout button label is now within the 3 to 8 word limit.

| Target | Archetype and location | Files |
|---|---|---|
| `trade_berth/` "The Fee Sheet" | Trade run, `canon/locations/hearthline-berths.md` | `brief.json`, `scene.ink`, `encounter.json` |
| `scout_shoal/` "The Wrong Lamp" | Scout, `canon/locations/the-shoal.md` | same |

Each `brief.json` is the input a coordinator gives a writer model. Each `scene.ink` is the output the model's text is judged against. A model is judged on its own text for the **same brief**; it is never shown the target.

## What makes them good (read this before the rubric)

- **Nine outcomes, nine different changes.** In The Fee Sheet the fee line, a countersign, a hold ticket, two cracked crates, a spilled stack, a repair bay, a bad bead, a patch kit and a citation each carry a different grade. No outcome uses another's key noun.
- **The player can say what happened and what it cost** without reading the note. The note then repeats the effect in numbers.
- **Fail moves on.** Every fail names a route: a hold ticket for the next window, the repair bay, a salvage tender's hail words, a hab desk. No dead ends.
- **Clean gives a gain** and **cost gives the thing with a price**: the two differ in what the player keeps.
- **The world acts.** A chief strikes a line; a tug swings in; a skipper passes a flask. No sentence names the menu ("the parley succeeds") or says nothing was decided.
- **One sense per passage**, taken from the location file and used once: the cold bay, the loose third plate, the hum of berth lights, the clamped work-light, fresh sealant; the looping voices, amber lights, a warm flask, hab work lights.
- **Rhythm varies.** Short sentences next to long ones; the shape is not a fixed list of five.
- **Different from each other.** Two places, two NPC roles, two key objects, two complications.
- **Placeholders are honest.** Everything starts `[STUB]`, effects sit in the placeholder bands, and nothing invents canon about Ariadne, the pursuers or Marcus's past.

## The rubric

**Gates** (automatic; any failure rejects the candidate, no score):

1. `npm run check` passes with the scene in place.
2. The content lint passes: `npm run lint:content`, or `npm run assemble:scene` for a candidate that is not yet in the tree.
3. No `[GM-ONLY]` or HELD material; `tests/canon-guard.test.ts` passes.
4. Effects are inside the bands in `CONTENT_GENERATION.md` section 4, and every note matches its effect.
5. No 5-word sequence from the target scene text appears in the candidate (copying is not learning). Words and phrases that the brief itself supplies (its `want`, `at_stake`, `who`, labels and the location file) are exempt: a model must be able to name the object it was asked about.

**Scored criteria**, each 0 (missing), 1 (partial) or 2 (clear), judged blind by a reviewer model with the checklist (`REVIEW_CHECKLIST.md`) and these anchors:

| # | Criterion | 2 means |
|---|---|---|
| 1 | Distinct results | Nine outcomes change nine different things |
| 2 | Fail-forward | Every fail shows a named route and a cost inside the fail band |
| 3 | Clean/cost/fail separation | A reader can tell the grade from the outcome alone |
| 4 | Concrete people and objects | Each outcome names a person or object from the brief |
| 5 | Show, don't announce | No menu or roll words; no "nothing is decided" hedging |
| 6 | Place | Each passage that should use a sensory detail does, once, without reuse |
| 7 | Voice and rhythm | Sentence lengths vary; passages do not share one template |
| 8 | Choice labels | Button text is specific intent, verb first |
| 9 | Opening | Sets where, who, want, stake and pressure in 40 to 80 words |
| 10 | Stakes legibility | The cost is clear in the prose, not only in the note |

Total out of 20. My own scoring of the two targets is 19 and 19 (voice and rhythm lose a point: they are good, not distinctive). For calibration, my uncalibrated estimates for the first drafts, scored the same way, are:

| Draft | Estimate | Main losses |
|---|---|---|
| Qwen trade run (#60) | 11 | filler detail, ending contradicts branches |
| Qwen courier (#60) | 7 | meta wording, near-identical fails |
| Luna salvage (#61) | 9 | outcomes change nothing; hedging |
| Luna scout (#61) | 9 | same, plus the wrong `layer` (a gate failure) |

These are one reviewer's numbers. The first job of the loop below is to check them against an independent judge.

## The loop (for Codex to coordinate)

Goal: the writer models reach the target's score on **briefs they have not seen**, with the least guidance that works, and the guidance is kept for later.

1. **Benchmark.** Give each writer model (Qwen, Luna, any other) the target briefs plus `CONTENT_GENERATION.md` only (guidance level 0). Collect JSON per section 7 of that file.
2. **Gates.** Run the gates. Record which fail and why.
3. **Judge.** A reviewer model that did not write the candidate scores it on the rubric, blind to the author and to the target. A second judge scores the same candidate; if the totals differ by more than 3, a person looks.
4. **Diagnose.** For each criterion scored under 2, write the failure in one line with a quote.
5. **Patch the guidance.** Add one rule to `GUIDANCE.md` (create it with the first rule): `failure observed | example from the output | rule | model`. A rule must be short, positive and checkable. Keep the file under 40 lines; small models lose long prompts. Retire a rule that does not help.
6. **Re-run on new briefs.** Keep a held-out set of briefs the writer models and the guidance author never see. Hold-out briefs are written by the coordinator from other archetypes, locations and complications in `canon/`. A rule is kept only if it helps on the benchmark briefs **and** does not hurt on the held-out set.
7. **Climb the guidance ladder per model.** Level 0: `CONTENT_GENERATION.md`. Level 1: plus `GUIDANCE.md`. Level 2: plus one good outcome as a few-shot example (taken from a target, one grade only). Level 3: a two-pass flow, a plan (the nine changed things listed) and then the passages. Stop at the lowest level that reaches the bar.
8. **Record.** In `model-profiles.md`: model, guidance level, rounds needed, pass rate, token cost per scene, the common failures.

**Done** for a model: score at or above the target's score minus 1, zero gate failures, on three different briefs in a row, at one guidance level. **Escalate** an archetype to a stronger model if a model has not reached target minus 2 after five rounds.

## Rules for the loop

- Writer models never read `docs/canon-gm/`, other scenes' text, or the target scene text (only its brief).
- Judges never see which model wrote a candidate.
- Do not tune the rubric to flatter a model. Change it only with an owner-approved edit to this file.
- Effects stay placeholders until issue #35 reconciles the economy.
- This is a workflow for stubs. Real M1 prose is written by a stronger model against the voice cards, and reviewed by the owner.
