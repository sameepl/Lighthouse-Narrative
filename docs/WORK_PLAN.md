# M0 implementation plan after planner review

Status refreshed 2026-10-23 against GitHub. Source: [Codex follow-up](reviews/codex-planner-followup.md)
and the [planner review](reviews/2026-10-21-m0-review.md).
GitHub issue bodies remain the implementation source of truth; agree scope corrections before dispatch. Pending rows are plans, not completion claims.

## Baseline and release gate

Merged: #1–#5, #11, #24/PR #32, planner PR #13, #8/PR #41, #28/PR #37 with completion PR #47, #21/PR #48, #23/PR #49, #20/PR #50, #9/PR #52, #22/PR #54 and #25/PR #56. Main through PR #56 includes current trust, once-only Edge rewards, version-3 saves, the scene scaffolder, assignment permissions and validated slice/full season contracts. Old v1/v2 saves are discarded.

#9/PR #52 passed 185 tests, a real generated-scene trial, CI and automated review before merging. Existing seeded simulation remains synthetic: #26 still needs to drive actual sessions. The real season is still unconfigured; a complete playable run is not claimed.

The planner merge does not turn every proposal into a ruling. Existing owner decisions and public/private canon boundaries remain authoritative.

## Work batches and routing

| Batch | Work | Suggested implementer | Reviewer / gate |
|---|---|---|---|
| 0 complete | Planner and baseline reconciliation (#13, #18, #19) | Codex + owner | Merged; no pending planner merge gate |
| 1A complete | #24 piece names (PR #32 merged) | Sol | Codex review and checks passed |
| 1B complete | #28 structured Hub status and UI strings (PR #37, #47) | Codex; Astra reviewed | Typed command/note/assist metadata; UI owns wording |
| 2A complete | #23 titles (PR #49); #9 scaffolder (PR #52) | Sol; Codex review | Generated scene compile/content/outcome and overwrite tests passed |
| 2B complete | #21 optional ship (PR #48), #20 persistent trust (PR #50) | Sol for #21; Astra for #20 | Codex review, rollback/save tests and browser checks passed |
| 3 complete | #22 assignment permission (PR #54); #25 season configuration (PR #56) | Sol | Codex review; 231 tests and disposable configured-catalog trial passed |
| 4 | Proposed UI projection card below | Sol; targeted high-risk review | Freeze before #6/#7 |
| 5 | #6 Board, then #7 Prepare; #8 meters already merged | Sol | Screenshots and keyboard/mobile review; serialize shared App/theme edits |
| 5 parallel | #26 session simulation; #27 reachability tests | Sol; Luna for bounded fixtures | Distinct test files; source bugs require separate core issues |
| 6 | #10 stub content and season activation | Luna for reliable bounded work; Qwen for exploratory variants | One scene/data pair per worker; Codex checks + owner voice/canon review |
| 7 | Proposed mobile playtest card below | Codex + owner | Timed real-catalog run; decide whether to expand to M1 |

Batches express dependencies, not a promise of unrestricted parallelism. Reserve exact file ownership and use separate branches/worktrees; reconcile shared documentation/tests before publication.
All schema-editing tasks (#24, #23, #22, #25) are serial within their lane.
All bridge-editing tasks (#28, #21, #20, #22, #25) are serial within their lane.
Downstream work uses merged contracts, not a worker's private branch.
Worker names are preferred roles, not availability guarantees; do not claim a worker ran or reviewed work until it did.

Owner routing preference (2026-10-23): Sol is the default implementer and reviewer. Reserve Astra for short, focused reviews of high-risk contracts/state ownership or unresolved edge cases; do not routinely assign it implementation or duplicate reviews. Luna handles bounded docs/mechanical tasks when confidence matters. Qwen supplies exploratory drafts or variety; Codex reviews every accepted result and runs repository checks.

## Remaining scope gates

- Completed scope amendments are recorded on #20/#21/#23/#24/#28. For #20, the owner additionally approved `src/ui/strings.ts` only for typed trust/Edge note rendering; component changes remained forbidden. Save and snapshot rollback tests passed.
- #25 completed: content may edit `src/data/keystones/**` and `src/data/season.json`; schema/loader contracts remain protected. Exact slice/full shape is documented in `src/data/AGENTS.md`.
- #25/#10 activation is atomic: core supports explicit unconfigured state; #10 adds its initial keystones, compiled knots and validated season data together. Content never edits the schema or loader.
- #6/#7 still need the UI projection card; their other listed bridge dependencies are merged. #8 is complete.
- #9: completed in PR #52 with root AGENTS documentation, titles and the current `scene_end` contract. Checks and review passed.
- #10: retain #9/#23/#24/#25 dependencies; use The Asking and the planner's current authority rules. Use placeholders, not unapproved sample dialogue or backstory.
- #10 owner amendment (2026-10-23): five placeholder keystones, matching opening + two middle + finale in slice and the additional conditional middle in full mode. Initial keystones and validated season configuration still activate atomically.
- #26: wait for #20/#21/#22/#25 to avoid testing an immediately obsolete session contract. Add regression seeds for any genuine source bug on a separate core issue.
- #27: tests can land with explicit unconfigured coverage, but real-catalog reachability is not complete until #10 activates the season. Starting-state checks alone are insufficient.

Do not create replacements for #20–#29. Verify each live issue when scheduling it; record any further scope amendment before dispatch. Do not quietly enlarge a worker's scope.

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

## Implementation gate: #29 upkeep

The owner ruled on 2026-10-21: unpaid upkeep increases an arrears counter, makes affected rolls harder, burns Renown (and Strain at higher steps), and eventually reaches a foreclosure ending with advance warning. Numeric thresholds remain placeholders in `rules.json`; the live #29 issue is authoritative.

Wait for #22/#25 and split implementation into engine/data, bridge/UI/save wiring, then a separate content issue for the foreclosure scene. Preserve a ship-free recovery route and player control over material commitments. Economic balance cannot be signed off before this behavior and its playthrough tests exist.

## Every worker handoff

Record issue, merged dependency SHAs, zone, branch and absolute worktree directory.
List exact editable files, read-only contract/pattern files, forbidden paths, acceptance checklist and commands.
One worker per branch/worktree; no concurrent edits to shared schemas, App, theme or shared tests.
Keep Qwen tasks to one scene/data pair or a similarly bounded mechanical edit with supplied context.
Qwen's plain local API has no filesystem/tools; native MCP permission was previously denied and is not assumed enabled.
Codex reviews output before accepting it and never treats a completion message as validation.

Qwen preparation for #10: two scene/data draft pairs (trade run and courier) are held outside the checkout, not merged. Schema, compile, all nine outcome paths and 40–80-word passage checks pass after review/revision; Codex corrected trade-run continuity/agency text. Four encounter pairs, five keystones, final repository checks and real-catalog activation evidence remain. This draft progress does not mark #10 complete.

A disposable public-source copy with five configured synthetic keys and both reviewed pairs passed all 231 tests and build after the #25 fixture correction. No test edits were needed in the copy. This demonstrates content-only activation compatibility, not five authored keystones or #10's ending gate. No Astra calls were used for this batch.

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
