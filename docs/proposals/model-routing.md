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
| 3 | Sonnet writes five spine or roster scenes from briefs; Opus samples two | Owner and reviewers score them at or above the target |
| 4 | Tune: set the share of words per tier from measured scores and token costs | Written into `AGENT_WORKFLOW.md` |

Measures to record per phase: rubric score, gate failures, rounds, tokens per scene, reviewer time, rewrite rate.

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

**For both:**
- What is missing, wrong or too optimistic?
- What is the smallest first step you would take, and what would you measure?

## 8. Decision requested from the owner

Adopt, adopt with changes, or reject. If adopted, fold sections 3 and 4 into `docs/AGENT_WORKFLOW.md` and record the date. Until then, `docs/WORK_PLAN.md` routing stays in force.
