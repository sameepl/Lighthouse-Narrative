# Proposal: model routing for a multi-hour game

Status: **draft for review** by Codex and Claude. Not adopted. The owner decides.
Author: Claude Code. Date: 2026-10-26.

## 1. Why now

The game is planned to run for several hours, not 30 minutes. A rough estimate: the 20-minute slice reads at about 13,500 words, so several hours is 8 to 10 times that, roughly 100,000 words read and 150,000 to 250,000 authored. Most of those are repeatable encounters, variants and small text. A smaller share is the keystones and the spine, and that share carries the story.

At that scale the scarce resource is **consistency of voice and canon**, not code. The routing in `docs/WORK_PLAN.md` (2026-10-23) covers M0 well. This proposal extends it to content at volume and to the models not yet placed: Sonnet, Opus and the writer models.

## 2. Principle

Route by **cost of a mistake and player attention**, not by a model's general quality.

- Spend the strongest models where the player looks hardest: scene openings, endings, keystones, anything about Ariadne or the Lanterns.
- Spend the cheapest where the player skims: variants, barks, ledger notes, board-card text.
- Automate every check that does not need judgment, so reviewers judge only voice, canon and whether a scene is worth playing.

## 3. Proposed roles

| Role | Model | Notes |
|---|---|---|
| Canon steward: voice bible, season arcs, keystone and finale prose, final voice polish | Opus | Few tokens, highest consequence. Also converts GM-only material into player-safe briefs, so no other model reads `docs/canon-gm/`. |
| Spine and fork scenes, most roster encounters, continuity review against canon | Sonnet | Opus samples its output. |
| Roster variants, complication swap-ins, barks, ledger notes, board-card text | Qwen and Luna (or equivalents) via the loop in `docs/targets/README.md` | The loop decides who qualifies per archetype. |
| Code: default implementer and reviewer | Sol | Unchanged from `WORK_PLAN.md`. |
| High-risk contract and state-ownership reviews | Astra | Unchanged: short, focused reviews only. |
| Bounded mechanical work: fixtures, scaffolds, data entry from canon files, docs | Luna | Unchanged. |
| Reviewer of every PR | Sonnet in the GitHub Action, Opus second opinion on core PRs | Already wired (`.github/workflows/review.yml`). |

Not decided by this proposal: prices, rate limits and the exact capability of each model. Those are inputs the owner and Codex hold.

## 4. Rules

1. **Cross-review.** A model family does not review its own output as the only check. Claude reviews OpenAI-written code; Sol or Astra reviews Claude-written code. A content judge is never the writer's model.
2. **Escalate by archetype.** If a writer model cannot reach the bar on a scene type after five rounds, that type moves up a tier. The pipeline stays the same.
3. **Automation first.** The content lint (issue #63), the canon guard and the zone check carry the volume. Model review is for what they cannot see.
4. **Canon access by role.** Only the canon steward reads `docs/canon-gm/`. Writer models get briefs and player-safe location files only.
5. **Playtest-driven rewrites.** After each build, the lowest-rated or most-skipped scenes are rewritten one tier up.
6. **Hold-out briefs.** Unseen briefs measure whether writer models generalise, as in `docs/targets/README.md`.

## 5. Trial plan

| Phase | What | Pass condition |
|---|---|---|
| 1 | Run the Qwen and Luna loop on the four stub archetypes using the two targets | Each model reaches target minus 1 on three briefs in a row, or the archetype is escalated |
| 2 | Opus writes the voice bible and the M1 keystones K1 and K5 | Owner approves the voice and the keystones |
| 3 | Run the bake-off in section 5b: Sonnet and Opus alongside Luna, Qwen, Sol and Astra | Decision rule in section 5b met per category |
| 4 | Tune: set the share of words per tier from measured scores and token costs | Written into `AGENT_WORKFLOW.md` |

Measures to record per phase: rubric score, gate failures, rounds, tokens per scene, reviewer time, rewrite rate.

## 5b. Quality bake-off (all six models, including Sonnet and Opus)

Sonnet and Opus are proposed as writers in section 3 but have **not been tested as writers** in this repo. The targets in `docs/targets/` were written by a Claude model, so a rubric built on them can favour Claude's style. A fair comparison needs to be designed, not assumed.

**Design**

- **Same inputs.** Every model gets the same brief and the same context bundle (contract, location file, voice cards). No model sees the targets or another model's output.
- **Four test categories**, three briefs each, written by the coordinator:
  1. *Roster stub*: a brief like the targets (the cheap, high-volume work).
  2. *Spine scene*: two or three voices from `docs/canon/voices/`, a choice with consequences.
  3. *Emotional keystone*: a placeholder keystone (for example the opening K1) where tone matters. Stays inside canon: no `[GM-ONLY]` material.
  4. *Short text batch*: twenty barks, ledger notes and board-card lines.
  Plus one *revision* task per model: given the owner's notes, revise a scene without losing what worked.
- **Samples.** Two per model per brief, so one lucky draw does not decide it. About 6 models x 4 categories x 3 briefs x 2 samples = 144 candidates.
- **Blind and randomised.** Candidates are labelled with random ids, formatting is normalised, and length is held inside the word bounds so verbosity does not win.
- **Judges.**
  - The **owner** rates the voice-heavy categories (2 and 3) blind. This is the primary judgment for voice.
  - **Two model judges from different families**, neither judging its own family's output, run pairwise comparisons on the rubric.
  - **Automated gates and metrics**: the gates in `docs/targets/README.md`, plus repetition, sentence-length variety and canon-guard hits.
- **Traps.** Include at least one brief that invites a violation (it tempts the model to write Marcus's thoughts, or offers a spoiler-sounding detail). Count violations. A model that falls for a trap is penalised regardless of prose quality.
- **Cost measures**, per accepted scene, not per attempt: rounds to pass, tokens, owner edit burden (how much the owner changes), and reviewer time.

**Decision rule.** Per category, pick the cheapest model whose blind pairwise win rate against the best model is at least 40 percent with zero trap failures. If no cheap model qualifies, the category goes to the next tier. Re-run when a model is replaced or a new one is considered.

**Known biases to control**: judges prefer their own family and longer text; the targets came from one family; the owner's taste is the final standard but a sample of one. Keep the owner's blind ratings separate from model scores and report both.

**Scope.** Codex coordinates runs and gates, the owner rates, Claude supplies the briefs and the Sonnet and Opus candidates. The benchmark briefs and results live in `docs/targets/` once approved.

## 5c. How to run the bake-off

**Pilot first.** One category (a roster stub), one brief, all six models, two samples each: 12 candidates. Check that the pipeline runs, that the two model judges agree (totals within 3), and what each candidate costs. Fix the rubric, gates and judge prompts before scaling. Then run the categories cheapest first (roster stubs, short-text batch, spine scene, keystone), stopping early on a category if one cheap model clearly wins.

**Who does what**

- *Briefs*: written jointly by Claude and Codex, or split half and half, so no family sets the test. Hold-out briefs stay out of every model's context.
- *Candidates*: Claude generates the Sonnet and Opus candidates in a session by launching one subagent per brief on a stated model, given only the brief bundle (no API key needed on a subscription plan). Codex generates the Sol, Astra, Luna and Qwen candidates.
- *Anonymising*: the coordinator assigns random ids and keeps the id-to-model key private. Judges and the owner never see it.
- *Gates*: automated checks run first (issue #63; by hand until it exists).
- *Judges*: Opus and Astra, each skipping their own family's candidates; Qwen candidates go to both. Each scores candidates on the rubric rather than comparing every pair.
- *Owner*: rates blind, only voice-heavy categories, only finalists (the top three or four per brief).

**The blind rating page (build task)**

A small web page the owner uses to rate candidates. Requirements:

1. Input: a JSON file of anonymous candidates (`id`, `brief_id`, `text` blocks). No model names or metadata that identify a model. Formatting is normalised.
2. Shows two candidates side by side (stacked on a phone) in random order, with the brief above them.
3. Controls: pick one (or "tie"), a 1 to 5 voice score for each, and an optional note. Keyboard shortcuts on desktop.
4. Saves each rating immediately and can resume; exports a JSON file of ratings. No server-side data beyond what the owner exports.
5. Works on mobile and desktop, light and dark, no external requests except fonts and libraries.
6. Does not ship in the game build: it lives outside `src/` (for example `tools/bakeoff/`) or is a hosted page, and is never imported by the game.
7. Test with a fixture of four fake candidates.

Either Codex builds it as a `zone:core` task (new tools folder, no change to `src/`), or Claude publishes it as a private hosted page with a shared database. The hosted page is quicker for the owner; the repo version is easier for other agents to reuse. The owner chooses.

## 6. Risks

- **Voice drift** across hundreds of scenes. Mitigation: the voice bible, voice cards, and a periodic whole-season read by Opus.
- **Rubric gaming.** Models learn the two targets. Mitigation: held-out briefs, a 5-gram copy gate, blind judges.
- **Reviewer fatigue.** One reviewer comment per PR is easy to skim. Mitigation: a short verdict format and a hard "needs owner" for canon doubts.
- **Cost surprises.** A cheap model that needs five rounds can cost more than a better model once. Mitigation: record tokens per accepted scene, not per attempt.
- **Single points of failure.** Opus as the only canon steward. Mitigation: its briefs and the voice bible live in the repo, not in a session.

## 7. Questions for review

Please answer in the PR comments. Short answers are fine.

**For Codex (Sol, Astra, Luna, Qwen routing):**
1. Are the Sol, Astra and Luna roles in section 3 accurate, or does your experience change them?
2. What would you change in the Qwen and Luna loop to make a fair comparison, given their different tools and context?
3. Is "Claude reviews OpenAI-written code, Sol or Astra reviews Claude-written code" workable in the current review flow?
4. What does the content lint (#63) need beyond `docs/CONTENT_GENERATION.md` section 8?
5. Where would you set the escalation threshold for a writer model?

**For Claude (Sonnet, Opus):**
1. Is Sonnet the right default for spine and roster scenes, and where would you hand to Opus sooner?
2. What should the voice bible contain so a smaller model can use it within a small context?
3. What should the canon steward produce so the briefs stay player-safe?
4. Which review checks in `REVIEW_CHECKLIST.md` should become lint rules?

**On the bake-off (section 5b), both:** Is the design fair? Which categories or traps are missing? Who should author the briefs so no family is favoured?

**For both:**
- What is missing, wrong or too optimistic?
- What is the smallest first step you would take, and what would you measure?

## 8. Decision requested from the owner

Adopt, adopt with changes, or reject. If adopted, fold sections 3 and 4 into `docs/AGENT_WORKFLOW.md` and record the date. Until then, `docs/WORK_PLAN.md` routing stays in force.
