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
| [ ] [M0-01](tasks/M0-01-cycle-contracts.md) | Cycle, meters and Pursuit clock: contracts and engine | core | A | none |
| [ ] [M0-02](tasks/M0-02-encounter-data.md) | Encounter and keystone data layout, schemas, loader, content tests | core | A | M0-01 |
| [ ] [M0-03](tasks/M0-03-board-selector.md) | Board builder and selector with seeded RNG | feature | B | M0-01, M0-02 |
| [ ] [M0-04](tasks/M0-04-keystone-scheduler.md) | Keystone scheduler, leads and deadlines | feature | B | M0-01, M0-02 |
| [ ] [M0-05](tasks/M0-05-bridge-hub.md) | Bridge: Hub flow, divert to encounter knots and back | core | A | M0-03, M0-04 |
| [ ] [M0-06](tasks/M0-06-board-ui.md) | Board screen UI | feature | B | M0-05 |
| [ ] [M0-07](tasks/M0-07-prepare-ui.md) | Prepare screen: ship and crew assignment | feature | B | M0-05 |
| [ ] [M0-08](tasks/M0-08-meters-ui.md) | Meters and Pursuit clock UI (Renown, Edge pool) | feature | B | M0-01 |
| [ ] [M0-09](tasks/M0-09-scene-scaffolder.md) | `npm run new:scene` scaffolder | core | B | M0-02, M0-05 |
| [ ] [M0-10](tasks/M0-10-stub-content.md) | 6 stub encounters and 2 stub keystones (placeholder text) | content | C | M0-05, M0-09 |
| [ ] [M0-11](tasks/M0-11-simulation.md) | Simulation test: 1,000 seeded runs | feature | B | M0-03, M0-04 |

Order: M0-01, then M0-02, then M0-03 and M0-04 in parallel, then M0-05, then M0-06 to M0-09 in parallel, then M0-10; M0-11 can start once 03 and 04 merge. M0-08 only needs M0-01.

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
