# M0 implementation plan after planner review

Status: proposed execution order for review. Source: [Codex follow-up](reviews/codex-planner-followup.md)
and the [planner review](https://github.com/sameepl/Lighthouse-Narrative/blob/99197c1f95dd8baa24332e047615c0712ab35c44/docs/reviews/2026-10-21-m0-review.md). No task below is started by this document.
GitHub issue bodies remain the implementation source of truth; agree their scope corrections before dispatch.

## Baseline and release gate

At the original review snapshot, #1–#4 were merged. Since then, #5/PR #19 and #11/PR #18 have merged. #24/PR #32 is also merged after reconciliation with their fixtures.
PR #13 still holds the pending planner/canon updates and hardening roadmap. Review it separately;
recheck their exact heads, reconcile overlaps and run checks on the resulting main before dependent work.
Do not describe pending work or this proposed plan as merged.

This documentation change is based on main and contains only Codex review/planning notes. It does not merge #13 or promote its canon sources. Reconcile overlapping roadmap and index additions when #13 lands.

## Work batches and routing

| Batch | Work | Suggested implementer | Reviewer / gate |
|---|---|---|---|
| 0 | Review #13, #18, #19; align task scopes below | Codex + owner | Owner merge decision; full check and zones |
| 1A complete | #24 piece names (PR #32 merged) | Sol | Codex review and checks passed |
| 1B | #28 structured Hub status and UI strings | Codex | Owner or independent tier-A/B review |
| 2A | #23 encounter titles, then #9 scaffolder | Sol | Contract review for #23; generated scene compile/content tests for #9 |
| 2B | #21 optional ship, then #20 persistent trust | Sol for #21; Astra/Codex for #20 | Review action atomicity, trust/Edge and save boundaries |
| 3 | #22 assignment permission, then #25 season config | Sol, with tier-A review | Wait for both schema and bridge lanes; #22 also needs #13 |
| 4 | Proposed UI projection card below | Astra/Codex | Freeze before #6/#7 |
| 5 | #6 Board, then #7 Prepare and #8 meters | Sol | Screenshots and keyboard/mobile review; serialize shared App/theme edits |
| 5 parallel | #26 session simulation; #27 reachability tests | Sol / bounded test worker | Distinct test files; do not edit engine bugs from tests-only issues |
| 6 | #10 stub content and season activation | Qwen or Luna, one scene/data pair per worker | Codex checks + owner voice/canon read-through |
| 7 | Proposed mobile playtest card below | Codex + owner | Timed real-catalog run; decide whether to expand to M1 |

Batches express dependencies, not a promise of unrestricted parallelism. #24 and #28 may overlap in test files:
reserve exact file ownership first, and serialize them if either needs the other's files.
All schema-editing tasks (#24, #23, #22, #25) are serial within their lane.
All bridge-editing tasks (#28, #21, #20, #22, #25) are serial within their lane.
Batch 2 starts only after the relevant batch-1 PRs merge; tests must use the merged contract, not a private branch.
Worker names are preferred roles, not availability guarantees; do not claim a worker ran or reviewed work until it did.

## Existing issue amendments to make first

- #20: allow only the save-version wiring in `src/ui/persist.ts` alongside the existing engine/bridge/ink-library scope. Show actual Edge gained at cap; test full snapshot rollback with trust changes.
- #23: allow the writing/scaffolder documentation named by its acceptance. Include cached-offer save compatibility in review.
- #24: include all now-merged fixtures and metadata compatibility checks. If rejecting old cached metadata needs `src/bridge/save.ts`, amend that exact allowance or schedule a separate core compatibility task before release. Keep the same logical pieces; change identifiers consistently.
- #25: allow `.github/zones.json` and its existing zone tests for the content-path correction. Protect schema/loader contracts while permitting `src/data/keystones/**`. Decide and document content permission for `src/data/season.json`.
- #25/#10: choose one atomic activation path. Recommended: core #25 supports an explicit unconfigured value; #10 may edit only validated season data with its initial keystones, under an amended allowlist. Content never edits the schema or loader.
- #6: wait for #23, #28 and the UI projection card. #7: wait for #20–#22 and that projection. #8: wait for #19 and allow minimal App wiring when needed.
- #9: wait for #23 as well as #5; explicitly allow the required root AGENTS documentation. Generate titles and the current `scene_end` contract.
- #10: retain #9/#23/#24/#25 dependencies; use The Asking and the planner's current authority rules. Use placeholders, not unapproved sample dialogue or backstory.
- #26: wait for #20/#21/#22/#25 to avoid testing an immediately obsolete session contract. Add regression seeds for any genuine source bug on a separate core issue.
- #27: tests can land with explicit unconfigured coverage, but real-catalog reachability is not complete until #10 activates the season. Starting-state checks alone are insufficient.

Do not create replacements for #20–#29. These amendments are proposed here for review;
update each live issue when scheduling it. Do not quietly enlarge a worker's scope.

## Proposed additional task: UI preparation projection

Create a small `zone:core`, tier-A/B issue after owner review; no GitHub issue number yet.

- **Depends on:** #19, #20, #21, #22, #23, #28.
- **Editable:** `src/bridge/types.ts`, `src/bridge/session.ts`, a new `src/bridge/view.ts` if useful, related bridge command projection, and task-specific tests. List exact helper paths in the final issue.
- **Forbidden:** UI components, engine/data contracts, ink scenes, dependencies/build configuration.
- **Goal:** UI displays bridge-computed facts rather than recalculating rules or importing a singleton session.
- **Acceptance:** selected offer is exposed; lock/confirmation reasons are structured codes with parameters; crew choices expose effective assist, current trust and busy/assignable status; optional/required ship state is explicit; snapshots stay detached. Do not invent odds for an approach the player has not selected.
- **Verification:** `npm run check`; projection tests for busy/protected crew, trust-3 bonuses, insufficient Credits, optional ship and cancellation. Owner reviews the final fields before UI work fans out.

#23/#28 already cover titles and strings: this card adds only missing preparation/view facts.
If those tasks provide all of these fields, close the proposed card as unnecessary instead of duplicating work.

## Proposed additional task: real mobile playtest

Create a `zone:feature` QA task after the playable catalog is in place; no GitHub issue number yet.

- **Depends on:** #6–#10, #20–#28 as applicable, and the resolution/implementation of #29 before economy-balance claims.
- **Editable:** a named `docs/reviews/` report, task-specific browser tests if the agreed test tooling supports them, and evidence assets in an approved path. Source fixes require separate zone-scoped tasks.
- **Acceptance:** play from a fresh save to an actual configured ending at 390 px in dark/light themes; verify 44 px targets, no horizontal overflow, keyboard focus, reduced motion, cost/lock explanations and save/resume. Record duration, choices that confused the player and defects with reproduction steps.
- **Verification:** `npm run check` plus the agreed browser checks; attach screenshots. Distinguish a real-catalog run from synthetic fixtures. Do not add a browser-test dependency without a separately scoped approval.

## Decision gate: #29 upkeep

Owner decision, not an implementation assignment. Record what happens to unpaid amounts,
how ships enter/leave service, who chooses payment priority and whether recovery consumes an action.
A laid-up-ship proposal must preserve a ship-free recovery route and must not silently choose a ship for the player.
Then create a bounded core task with data/save/UI implications listed explicitly.
UI scaffolding can proceed before this decision; economic balance cannot be signed off before it.

## Every worker handoff

Record issue, merged dependency SHAs, zone, branch and absolute worktree directory.
List exact editable files, read-only contract/pattern files, forbidden paths, acceptance checklist and commands.
One worker per branch/worktree; no concurrent edits to shared schemas, App, theme or shared tests.
Keep Qwen tasks to one scene/data pair or a similarly bounded mechanical edit with supplied context.
Qwen's plain local API has no filesystem/tools; native MCP permission was previously denied and is not assumed enabled.
Codex reviews output before accepting it and never treats a completion message as validation.

Run `npm ci`, then `npm run check` and the zone check against the actual PR base before commit/PR.
Use Prettier only on task files. On Windows, normalise checkout line endings without unrelated Git content changes;
do not commit a repo-wide formatting repair for a CRLF-only checkout problem.
If temporary-file permissions require it, set process-local TEMP/TMP to a writable workspace test directory.
Stop before an out-of-zone edit, or after three attempts at the same failure, and report exact output.
Core changes need owner review; content needs a voice/canon pass as well as CI.

## M0 completion evidence

- Main contains the reviewed contract and flow PRs; roadmap and issue status agree.
- The actual season is configured and its opening/finale remain reachable with depleted resources.
- Real authored encounters provide recovery; a `no-eligible-offers` diagnostic is not called a completed run.
- Session-based seeded simulation, content validation and the real mobile run pass.
- Costs and obligations are previewed; Marcus's decisions and speech remain the player's.
- Existing canon authority boundaries remain intact; no unresolved planner question is silently answered.

Only after this gate should the project commit to the larger M1 word target or commission a broad content batch.
