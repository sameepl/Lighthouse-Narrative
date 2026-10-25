# Stub-quality loop results — issue #66

Initial Qwen/Luna outcome: neither writer qualified. No numeric rubric result was eligible because every candidate failed gates.
`NS` means rejected before scoring, not zero and not an estimated score. Targets retain their supplied 19/20.
The contract, rubric, reference targets and draft PRs #60/#61 were not changed. Nothing is merged by this task.

## Scores by round

Both judge columns are independent passes by `gpt-6.1-sol` and `gpt-6-sol`; neither wrote candidates.
They saw anonymous IDs, briefs, candidate prose, contract, rubric and checklist, never author/model metadata
or target scene text. Full quoted diagnoses per candidate/weak criterion remain in the evidence bundle.

| Model | Round | Level | Brief(s) | Judge A / B | Blocking gates |
|---|---|---|---|---|---|
| Qwen | 1 | 0 | trade, scout | NS / NS, both | Length, shape, repetition, copied runs; agency/canon and ending |
| Luna | 1 | 0 | trade, scout | NS / NS, both | Shape, repetition; trade copied runs; effect sign / ending |
| Qwen | 2 | 1, rhythm rule | trade, scout | NS / NS, both | Shape, repetition; trade copied runs and ending length |
| Luna | 2 | 1, rhythm rule | trade, scout | NS / NS, both | Repetition; trade copied run; positive effect narrated as charge |
| Qwen | 3 | 1, add sign rule | trade | NS / NS | Length, shape, repetition, banned word; agency/canon |
| Luna | 3 | 1, add sign rule | trade | NS / NS | Shape, repetition and copied runs; sign errors corrected |
| Qwen | 4 | 2, one clean example | scout | NS / NS | JSON prefix, length, shape, repetition; agency and ending |
| Luna | 4 | 2, same example | scout | NS / NS | Repeated openers and noun phrases |
| Qwen | 5 | 3, nine-change plan | trade | NS / NS | Length, shape, copied runs, repeated openers |
| Luna | 5 | 3, nine-change plan | trade | NS / NS | Shape, copied run, repeated openers / identical first four words |
| Qwen | held-out baseline | 0 | H1, H2, H3 | NS / NS, all | H1 incomplete output; other shape failures |
| Luna | held-out baseline | 0 | H1, H2, H3 | NS / NS, all | Sentence shape |
| Qwen | held-out final | 3 | H1, H2, H3 | NS / NS, all | Sentence shape / length; repetition |
| Luna | held-out final | 3 | H1, H2, H3 | NS / NS, all | Sentence shape; no gate-clean streak |

## Protocol and verification

Initial reading followed the requested order. Writer prompts contain only their brief, location,
contract sections 3–5 and 7, plus the stated ladder addition. Level 2 exposes exactly one clean target
outcome, never a full target scene. Level 3 preserves a separate nine-change plan before passages.
Raw outputs were never corrected or substituted for new attempts; no model wrote ink syntax or effects.
The coordinator assembled effects deterministically from briefs, not from writer descriptions.

Seven benchmark candidates per writer cover five tuning rounds (two briefs in rounds 1 and 2).
One short rule was added at round 2, one at round 3; then the example and planning steps were tested.
After five gate-rejected rounds, tuning stopped. The numeric “below 17” stop rule has no defined meaning
for NS; this report explicitly treats five rejected rounds as escalation, not as measured scores below 17.

A separate custodian froze three new briefs before tuning: H1 courier / Hearthline hall,
H2 salvage / traffic hab, H3 distress call / Psalter lamp field. Each uses a matching complication
from `canon/complications.md`, a different role and location, and placeholder effect bands.
The guidance author did not see held-out prompts/prose. Baseline and final bundled treatments ran only
after tuning froze; held-out failures were not used to patch guidance. Frozen hashes were checked unchanged.
No rule is promoted: improvements on selected mechanical measures do not establish no regression elsewhere.

Issue #63 remains unimplemented. A disposable coordinator script checked JSON, word/sentence counts,
markers, banned phrases, effect bands, note values, archetype/layer, opener collisions and target five-word runs.
Human-style review by both judges checked noun phrases, sensory use, agency/canon, consequences and ending.
This is not the proposed official content lint. The overlap detector compares narrative text, excluding
fixed choice labels, ink scaffolding and effect/ledger code; overlaps inherited from briefs are still failures.
An opener was operationalized as the first two normalized words; noun-phrase classification was manual.
Counts exclude `[STUB]`; apostrophes stay in a word and hyphenated components count separately.

Temporary scenes and encounter metadata were installed one at a time and removed in `finally` cleanup.
The original Qwen round-4 response has prose before JSON: embedded JSON was recovered solely for compile
diagnostics, while its raw JSON gate remained failed. H1 Qwen baseline had no complete candidate to assemble;
no missing passages were invented. Its check gate is not passed. All complete candidates received checks.
All 25 assemblable candidates passed `npm run check` (format, types, 230 tests including branch walk/canon
guard, and build). Passing those checks did not override the extra content gates. Windows checkout CRLF
was normalized to repository LF bytes for validation without tracked content or persistent config changes.
No content-zone PR was made; no season configuration or shipping source change is included.

## Representative diagnoses

These benchmark quotations illustrate the archived criterion-by-criterion diagnoses; they are not new scores.

| Criterion | Observed failure and quote |
|---|---|
| 1, distinct results | Luna round 1 repeats “the bonded cargo desk” across all three failed outcomes. |
| 2, fail-forward | Qwen round 1 seal failure ends “Renata logs the incident against your record” without a route. |
| 3 and 10, separation / stakes | Luna round 2 says “The chart copy costs 500 credits” against Credits +500. |
| 4, concrete / canon | Qwen makes “Renata, the chief of the berth crew” despite the brief authorizing only a role. |
| 5, show consequences | Qwen repeats “You gain Credits +1,000 and Strain +1” as meter announcements. |
| 6, place | Both judges recorded reused sensory details and unsupported additions in Qwen baseline scenes. |
| 7, rhythm | Luna's round-1 opening has no sentence under nine words; Qwen often writes too many short sentences. |
| 8, choice labels | The supplied scout button “Ask a passing salvage crew which beacon they avoid” has nine words. |
| 9, opening | Qwen's trade opening has seven sentences, outside the supplied 3–6 sentence shape. |

## Owner decisions needed before repeating

Do not change the rubric or targets in this results PR. Clarify these separately:

- The copying gate rejects shared five-word phrases supplied by the brief, including “forty crates of water
  filters” and “chief of the berth crew”. Separate input overlap from learned copying in a future ruling.
- Distinguish a sensory category from a detail: amber beacons and distant hab work lights are different
  details. Reusing the category light or sound is not, on its own, a no-reuse failure.
- The scout label above exceeds the contract's 3–8-word limit, and its first cost/fail both lose 500 Credits.
  “Smaller cost” cannot mean strictly smaller numerical loss for that fixed pair; cross-resource costs lack a scale.
- “Sentence opener” has no specified token length, and “noun phrase” needs a reproducible definition.
  Nine different result objects must coexist with naming the same desired object; that distinction needs examples.
- Both judges agree on rejection, but differed on whether Luna's initial scout ending and sensory reuse fail.
  Preserve those reports for calibration; there are no eligible numeric totals to compare for the >3-point flag.

## Sol drafting follow-up — 2026-10-25

Same frozen benchmark briefs and coordinator checker, writer `gpt-6.1-sol`, no full target exposure.
Independent blind judges were `gpt-6-sol` and `gpt-6-luna`, both different from the writer model.

| Scene | Contract-only first pass | Final judges A / B | Gates and checks | Feedback needed |
|---|---|---|---|---|
| Trade / Hearthline berths | NS / NS | 19 / 20 | All pass | Copying/repetition and payment clarification, then an opening-only sentence repair |
| Scout / the Shoal | NS / NS | 20 / 20 | All pass | Repeated noun phrases and sentence openers |

All five preserved Sol versions individually passed `npm run check` (230 tests, types, format, build).
Only the two final versions pass the additional content gates. Targeted revisions are not new independent
baseline samples, and two different briefs do not establish the required three-brief streak.
The trade's remaining one-point deduction is ambiguity about receipt versus payment of a handling bonus.
No content is shipped and no general guidance is promoted. Readable drafts and full raw/review evidence are
outside the checkout at `../../outputs/sol-stub-trial-2026-10-25/`, including `DRAFTS.md` and `REVIEW.md`.
One judge initially conflated categories with details and a shared goal with repeated result objects;
fact-checking withdrew those unsupported claims. Original and corrected verdicts remain preserved.
That calibration correction explains the sensory clarification above; the rubric itself is unchanged.

## Initial Qwen/Luna evidence

Local-only evidence is outside the Git checkout at `../../outputs/stub-loop/` relative to this worktree:
raw JSON/text, frozen prompts, Qwen native requests/responses/usage, plan passes, brief/location copies,
assembler/checker, per-candidate gates, full npm logs, anonymous mapping and both blind judge reports.
There are 26 raw candidate attempts and 52 independent judge reports, plus the two infrastructure failures.
It is not silently embedded in or shipped by this docs PR. See the PR description for bundle/hash references.
The held-out SHA256SUMS file hash is `885e37cf0be5fbc638e52219a768cbf036391dbe7e40e35be19ea5cbb33e1c32`.
Neither a qualifying streak nor a lowest sufficient guidance level is claimed.
