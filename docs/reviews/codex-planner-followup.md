# Codex review of the planner updates

Status: recommendations for owner review, not new canon or implementation approval.
Original review snapshot: planner branch `core/canon-ariadne` at `99197c1`; main at `65c9278`.
Tracked documentation task: [#30](https://github.com/sameepl/Lighthouse-Narrative/issues/30).

Current merge update: PRs #18 and #19 are merged; #24/PR #32 is merged with their fixtures reconciled. PR #13 remains pending. Historical status observations below describe the original review snapshot. Canon source links point to the reviewed planner branch, not merged main.

## Sources and authority

Read alongside the planner's [M0 review](https://github.com/sameepl/Lighthouse-Narrative/blob/99197c1f95dd8baa24332e047615c0712ab35c44/docs/reviews/2026-10-21-m0-review.md),
[design](../game-design.md), [canon index](https://github.com/sameepl/Lighthouse-Narrative/blob/99197c1f95dd8baa24332e047615c0712ab35c44/docs/canon/README.md),
[owner rulings](https://github.com/sameepl/Lighthouse-Narrative/blob/99197c1f95dd8baa24332e047615c0712ab35c44/docs/canon/owner-decisions.md), [voice guide](https://github.com/sameepl/Lighthouse-Narrative/blob/99197c1f95dd8baa24332e047615c0712ab35c44/docs/canon/ariadne-voice.md)
and [design-impact review](https://github.com/sameepl/Lighthouse-Narrative/blob/99197c1f95dd8baa24332e047615c0712ab35c44/docs/canon/design-impact.md).
The received source notes and owner rulings are unchanged by this review.
Owner rulings govern use of canon; a planner interpretation or new sample line is not an additional authorisation.
HELD and unauthorised material remain out of player-visible text, metadata and compiled ink.

PR #13 is still open at this snapshot. Its branch contains the latest planner material;
it is not yet the merged main baseline. PRs #18 and #19 are also open.
The planner reports independent checks and a 390 px browser pass for those implementations.
This documentation pass relies on that recorded evidence and the implementation checks already reported;
it does not claim a new browser playtest or approval of the pending PRs.

## What changes my earlier recommendations

- Ariadne is already aboard. The ending concerns the present request and its costs, not finding or rescuing her.
- The proposed evidence labels are Removed, The Six and The Claim; old where/who/why contracts should be renamed before content expands (#24).
- The planner has already created #20–#29. Reuse those issues instead of creating duplicate trust, configuration or simulation tasks.
- The immediate priority is contract hardening, not #6/#9 in isolation. UI work needs stable projections; scaffolding should emit the final metadata shape.
- #18 is useful engine coverage, but its synthetic orchestration is not proof that the actual session or authored roster cannot stall. #26 and #27 close different gaps.

## Design recommendations

1. Preserve consent in both directions. Reaffirm, Withdraw and Share should each have a legible consequence; do not make one the hidden correct answer. Ariadne's refusal remains her choice.
2. Preview information costs before commitment. The authorised authentication risk and the proposed truth-request price need a clear relationship: do not silently treat every private question as a public transmission. Confirm the intended fiction in the content task before writing it.
3. Make crew investment reachable through play. #20 must change run-owned trust and use its actual Edge delta in the ledger. At a full pool, record the consumed opportunity without claiming Edge increased.
4. Separate permission, capability and availability. #22 prevents inappropriate assignments; busy state remains a separate rule. Ariadne's proposed never-busy companion treatment is still an explicit follow-up decision, not a reason to bypass the current assignment contract silently.
5. Keep pressure readable. Distinguish no catalog candidate, unaffordable offer, busy required crew, blocked keystone and spent actions. A pass is a legitimate consequence of assignments; it must not cause a free redraw.
6. Keep successes varied. Include cooperation and relief as well as cost. Test whether players understand the tradeoff rather than merely whether they can click to an ending.
7. Validate a small complete M0 run before expanding prose volume. The real-catalog gate must include recovery options and the configured finale, not just synthetic fixtures.

## Corrections to planning and acceptance criteria

| Item | Recommendation before dispatch |
|---|---|
| #20 save-version bump | Permit the minimal `src/ui/persist.ts` version adapter, currently excluded by its UI prohibition. Keep UI components out. Ensure cached offers and snapshots cannot retain incompatible state. |
| #21 optional ship | Update both confirmation and the basic Prepare command readiness check. Test cancellation and required-ship failures without spending an action. |
| #22 assignment permission | Filter eligibility, command choices and confirmation consistently; keep non-assignable people in the Sheet. Resolve the companion availability policy separately. |
| #23 display title | Its acceptance mentions scaffolder documentation outside its listed files. Explicitly allow `docs/WRITING.md` and `docs/tasks/M0-09-scene-scaffolder.md`. Land before #9 to avoid generating obsolete metadata. |
| #24 piece rename | Update fixtures in both pending PRs once merged. Define rejection or rehydration for saved metadata carrying old piece values; do not reinterpret old identifiers silently. |
| #25 season configuration | Define the empty-catalog state, full/slice role subsets and thresholds. Specify how #10 activates configuration atomically with its content. No missing-ID placeholder should masquerade as a validated playable season. |
| #26 session simulation | Schedule after the trust/assignment/config contracts settle, then use public session actions and random save/reload. Keep engine-only tests where they cover independent rules. |
| #27 reachability | Requirements satisfied only at the start do not guarantee a finale later. For M0 prefer requirement-free opening/finale routes; test spent Credits, busy crew, missing gear and full Pursuit. Lead-only availability needs a real producer. |
| #28 structured status | Move command labels and explanatory strings as well as Hub sentences out of the bridge. Retain diagnostic fields, but keep implementation details out of product copy. |
| #8 task scope | It needs the bridge's Pursuit projection. Explicitly permit minimal `src/ui/App.tsx` prop wiring if required; do not make the HUD import the session singleton as a workaround. |
| #9 task scope | Its acceptance requests root `AGENTS.md` documentation, outside the current allowlist. Add that exact file permission before starting. |
| #10 zone/config | Content may edit keystone JSON in the card, but CI currently excludes that directory. Resolve in a core task and specify whether the validated `season.json` data file is content-editable. |

These are proposed amendments, not claims that the live issue bodies have already changed.
Use the [work plan](../WORK_PLAN.md) for sequencing, ownership and verification.

## Decisions still owned by the user

- #29: unpaid upkeep and ship service state. My preference is an explicit laid-up-ship consequence, with the player choosing priorities and a free recovery route; this is not an adopted rule.
- Ariadne's companion availability and permitted progression/sample dialogue: retain the planner's unanswered questions; no guessed answers in code or prose.
- Endings: resolve the two-ending M1 target versus three proposed stances before authoring final outcomes. Distinct choices can share an ending family only if their consequences remain visible.
- Whether the authentication cost applies to each truth request or only an explicitly opened channel. Do not infer new canon from a convenient mechanic.

No implementation issue is claimed by this review. No new story, game rule or canon fact is introduced.
