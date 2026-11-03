# Slice readiness after the upkeep and art-tooling merges

Owner-approved batch, 2026-11-02. Baseline: main `ba937fe`. This is a dependency plan, not permission to invent canon or activate an incomplete season.

## Current batch

- #107 is complete through #124 and #125: v4 migration and upkeep settlement. Projection/penalties and the foreclosure story lifecycle remain separate.
- #98 is complete through #126 and #133: art lint and contact sheet. The existing hall still fails its ID-prefix and focal-position gates.
- Sol: #108, ledger/advance warning first, then ship-dependent target adjustment. Keep these as small stacked PRs if needed; use one independent Astra or Opus review.
- Luna: #109 neutral foreclosure text and #111 repeatable ship-free recovery job. Both remain draft content for owner voice review. #110 must prove actual terminal/recovery lifecycle behavior.
- Sol: #99 new berths, market and basin assets. Report their individual gate results and the existing hall baseline failure separately. A draft with a failing full-set art gate does not satisfy that acceptance box.

## Content gates before #89/#90

Planner answers, briefs and voice files have merged. Merge status alone is not a full brief co-sign.

- #103 still needs public sensory details for Faraday Basin and Fenrir Gap and another suitable location, or an explicit owner exception. Do not fill TBD source details as facts.
- #88 must resolve traffic-hab reuse by the roster distress call and K2, and Fenrir Gap reuse by the roster scout and K3. Keep a season-wide location allocation, including the recovery job reserved at Hearthline hall.
- Recheck labels, known skills, numeric bands, effect reasons and sourced roles against the final briefs. Strain represents the Compact relationship, not generic fatigue. Mark unapproved sample dialogue as proposals.
- Only then issue final writer prompts for #89. Preserve raw attempts and lint output. The non-`stub_` recovery ID needs explicit gate coverage; ordinary directory lint does not cover it.
- K2 is a two-roll hand-authored keystone design packet, not an input accepted by the current one-roll assembler. Keep that distinction explicit.

## Engineering follow-up proposals

Create separate core task cards with the exact implementation files after the current bridge lane settles. No shared bridge/schema implementation in parallel.

### Explicit slice launch and resume

Proposed files: `src/ui/persist.ts`, `src/bridge/types.ts`, `src/bridge/session.ts`, `src/bridge/save.ts`, `src/bridge/run.ts`, `tests/persist.test.ts`, and a named mode-resume test.

- The current UI starts full mode. Pass a deliberate mode for new runs and restore the same scheduling policy after reload, staged saves and restart.
- Decide how mode is represented before editing. Do not infer it from the current clock value; a save-format addition needs a version bump and validation-before-migration. Preserve valid legacy UI full runs and RNG/cached boards.
- If player selection needs a new UI control, name its files in the task card first. Never silently turn an existing full run into a slice run.
- Verify fresh, resumed and terminal runs in both modes, including full-clock `hardenFinale` behavior and legacy full-mode `forceFinale` behavior.

### Roster lead metadata

Proposed files: `scripts/assemble-scene.mjs`, `scripts/build-prompt.mjs`, `tests/assemble-scene.test.ts`, and the relevant content-generation operations documentation.

- The encounter schema already has singular `lead`; strict brief input currently has none. Agree on one optional coordinator field and its mapping before implementation; do not invent a plural encounter field.
- Keep numeric/effect metadata out of writer control. Validate IDs and test deterministic prompt/output behavior and absent-field compatibility. Coordinate producer IDs with atomic keystone activation.

### Keystone assembly and season reconciliation

- Prefer hand assembly under #90 for K2's two-roll structure unless repeated use justifies a separately scoped core tool change. Do not widen the one-roll contract incidentally in a content PR.
- Current configured seasons require four slice roles plus an additional conditional full-mode middle. #10 already records owner approval for five total placeholder keystones; #90 describes only four slice keystones and excludes K4 from the slice.
- Clarify whether #90 supplies the additional full-only stub under that existing approval or a core task introduces slice-only configuration. Do not activate four files against a five-role schema or force K4 into the slice to make validation pass.
- Keep shared opening/finale metadata compatible with the intended full-run pacing, and test both modes rather than assuming the slice proof covers six cycles.

### Foreclosure timing and economy

- The forced cycle-4 finale permits at most three ordinary end-cycle settlements. Current arrears failure needs four misses. Resolve this in #29/#35 with an explicit tuning decision before claiming slice foreclosure is reachable.
- Do not lower thresholds in #108 or add surprise charges in content to force that ending. Preserve advance warning and a genuine zero-buy-in recovery route.

## Acceptance order

Finish #108; review #109/#111; implement #110 against the merged contracts and authored content; reconcile #35 and slice timing. In parallel, finish source/brief approvals and art drafts. Land #89's roster pairs separately. Wire explicit slice mode before public slice availability, activate #90's keystones and season atomically, and prove real-catalog endings and save/resume. Follow with #92 timing instrumentation, #93 UI smoke coverage and the timed grey-box playtest. Synthetic fixtures and authored drafts are not a completed playable slice.
