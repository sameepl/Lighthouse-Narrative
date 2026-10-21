# Roadmap

Plan for the first playable. Scale and design are in [`game-design.md`](game-design.md); working rules in [`AGENT_WORKFLOW.md`](AGENT_WORKFLOW.md).
Status: `[ ]` not started, `[~]` in progress, `[x]` done. Update the box when a PR merges.

## Done

- [x] Three-stack prototype comparison (`archive/prototypes-v0`)
- [x] Rebuild on ink + TypeScript + React with "The Written Clause" (branch-walk tested)
- [x] Game design: scale targets, loop, keystones, roster (`game-design.md`)
- [x] Multi-agent scaffolding: AGENTS.md, zones, CI, templates, decisions, task cards
- [x] Planner notes filed as canon, with a design review (`docs/canon/`)

## M0: Grey-box loop (about 2,000 words of placeholder text)

Goal: a full run is playable with fake text, and the loop feels right. See `game-design.md` sections 3 to 9.

| # | Task | Zone | Tier | Depends on |
|---|---|---|---|---|
| [x] [M0-01](tasks/M0-01-cycle-contracts.md) (#1, PR #14) | Cycle, meters and Pursuit clock: contracts and engine | core | A | none |
| [x] [M0-02](tasks/M0-02-encounter-data.md) (#2, PR #15) | Encounter and keystone data layout, schemas, loader, content tests | core | A | M0-01 |
| [x] [M0-03](tasks/M0-03-board-selector.md) (#3, PR #17) | Board builder and selector with seeded RNG | feature | B | M0-01, M0-02 |
| [x] [M0-04](tasks/M0-04-keystone-scheduler.md) (#4, PR #16) | Keystone scheduler, leads and deadlines | feature | B | M0-01, M0-02 |
| [x] [M0-05](tasks/M0-05-bridge-hub.md) (#5, PR #19) | Bridge: Hub flow, divert to encounter knots and back | core | A | M0-03, M0-04 |
| [ ] [M0-06](tasks/M0-06-board-ui.md) (#6) | Board screen UI | feature | B | M0-05 |
| [ ] [M0-07](tasks/M0-07-prepare-ui.md) (#7) | Prepare screen: ship and crew assignment | feature | B | M0-05 |
| [ ] [M0-08](tasks/M0-08-meters-ui.md) (#8) | Meters and Pursuit clock UI (Renown, Edge pool) | feature | B | M0-01 |
| [ ] [M0-09](tasks/M0-09-scene-scaffolder.md) (#9) | `npm run new:scene` scaffolder | core | B | M0-02, M0-05 |
| [ ] [M0-10](tasks/M0-10-stub-content.md) (#10) | 6 stub encounters and 2 stub keystones (placeholder text) | content | C | M0-05, M0-09, and now #23, #25 |
| [x] [M0-11](tasks/M0-11-simulation.md) (#11, PR #18) | Simulation test: 1,000 seeded runs | feature | B | M0-03, M0-04 |

Order: M0-01, then M0-02, then M0-03 and M0-04 in parallel, then M0-05, then M0-06 to M0-09 in parallel, then M0-10; M0-11 can start once 03 and 04 merge. M0-08 only needs M0-01.

### M0 hardening (from the 2026-10-21 review)

Small fixes to do before real content is written. Source: [`reviews/2026-10-21-m0-review.md`](reviews/2026-10-21-m0-review.md). Milestone "M0 hardening". These are GitHub issues only (no task cards); each issue is the source of truth.

| Issue | Task | Zone | Tier | Depends on |
|---|---|---|---|---|
| [ ] #20 | Crew trust: per-run state, engine function and ink function | core | A | #21 (bridge lane) |
| [ ] #21 | Require a ship only when an offer needs one | core | B | #28 (bridge lane) |
| [ ] #22 | Crew `assignable` flag (keep Compact officials, Cass and Miri out of Prepare) | core | B | #20 (bridge lane), #13 |
| [ ] #23 | Display titles for encounters | core | B | none (before #9) |
| [x] #24 | Rename keystone piece values to removed, six, claim (PR #32) | core | B | none |
| [ ] #25 | Season config: keystone roles in a validated data file | core | B | #22 (bridge lane) |
| [ ] #26 | Simulation drives the real RunController and session | feature | B | #20, #21, #22, #25 |
| [ ] #27 | Content test: first and final keystones always reachable | feature | B | #25 |
| [ ] #28 | Hub status as structured data, not prose in the bridge | core | B | none (first in the bridge lane) |
| #29 | Decision: what happens when upkeep cannot be paid? (owner) | n/a | n/a | n/a |

Bridge lane (one at a time, in this order): #28, #21, #20, #22, #25. Schema and data tasks are serial too (#23, #22, #25). #6 (Board) waits for #23 and #28; #7 (Prepare) waits for #20, #21 and #22; #9 (scaffolder) waits for #23; #10 (stubs) waits for #23, #25 and #9; #26 waits for #20, #21, #22 and #25; #27 waits for #25. Amended scopes are on the issues themselves (milestone "M0 hardening"); see also [`WORK_PLAN.md`](WORK_PLAN.md).

## M1: 20-minute slice (about 13,500 authored words)

4 cycles. Keystones K1, K2, K3, K5. Six encounters (Courier, Distress call, Scout, Trade run, Salvage, Standoff, one each, with complications). Two endings. Planner follow-up 1 is in (`canon/planner-followup-1.md`); a few gaps remain (`planner-prompts.md`, prompt 4).

## M2: 30-minute lean (about 25,000 words)

6 cycles. Add K4 and about 8 more encounters. Three endings.

## M3: Full roster (about 34,000 words)

22 encounters, art, audio, polish. Possible add-ons: PWA install, Playwright end-to-end tests, Capacitor wrapper.

## Parking lot

- Rename "Edge"? (open question in `game-design.md`)
- PWA support (offline, install prompt)
- Playwright end-to-end tests in CI
- Parallax and jump-shimmer animation

## Codex planning follow-up

The [work plan](WORK_PLAN.md) and [planner follow-up review](reviews/codex-planner-followup.md) record proposed scope corrections and worker routing. Hub/Prepare (#5, PR #19) and the seeded simulation (#11, PR #18) are merged. The piece-name update (#24, PR #32) is reconciled with both. The planner and canon documents are indexed in `canon/README.md`; owner rulings there govern what may be used, and these notes adopt none of the planner's proposals as rulings. Continue with #28 structured status and #23 encounter titles after verifying their task scopes against the merged bridge.
