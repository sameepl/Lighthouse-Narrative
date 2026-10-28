# M1 slice: the 20-minute playtest

Status: proposal for the owner. Goal: one complete, balanced run in about 20 minutes on a phone, playable from the public Pages URL, that a stranger can finish without help.

## What a player experiences

| Cycle | Hub (about 1 min) | Action 1 and 2 (about 2 min each) |
|---|---|---|
| 1 | Short brief, the board, meters explained by use | The tutorial scene `written_clause` (a standoff), then **K1 The Passenger** (courier keystone: a hunted passenger recognises Marcus) |
| 2 | Upkeep, the first Pursuit tick, new board | One roster encounter, then **K2 The Silent Hab** or **K3 The Dark Lane** (the player's lead and ship decide which) |
| 3 | Pursuit pressure shows on the clock | The other of K2 and K3, then one more roster encounter |
| 4 | The clock is nearly full | **K5 The Asking** (forced), then the ending |

Eight scenes: four keystones and four roster encounters out of six (courier, distress call, scout, trade run, salvage, standoff). The board shows two or three offers per cycle, at least one affordable and one a stretch, as in `game-design.md` section 3.

## Content for the slice

| Item | Count | Source | Notes |
|---|---|---|---|
| Keystones | 4 | K1, K2, K3, K5 in `game-design.md` section 6 | Premises are proposals until the planner confirms them under the HELD rules (Contact 1, Tally's name and number, Helena's and Adrian's whereabouts stay unresolved). Placeholder facts stay `[STUB]` |
| Roster encounters | 6 | `CONTENT_GENERATION.md` briefs, one location each | `written_clause` is the tutorial standoff |
| Endings | 2 | K5's stances (reaffirm, withdraw) with ledger lines | Needs the owner's decision: two endings or three stances |
| Failure ending | 1 | #29 foreclosure | Reached only when upkeep arrears hit the limit |
| Hub text, crew lines, ledger | about 1,500 words | Hub and crew voice cards | |

Word budget: about 13,500 authored, about 3,800 read per run (`game-design.md` section 9).

## Build list, in dependency order

1. **Finish the grey-box.** Merge the Board (#83), build Prepare (#7), then the six stub encounters (10a) and five keystone stubs with season activation (10b), using the brief and assembler pipeline. A complete run in placeholder text is the first working demo.
2. **Rules the slice needs.** #29 (arrears, harder rolls, Renown burn-down, foreclosure ending) in three PRs, then #35 (ship and economy numbers) and a simulation tuning pass so four cycles are neither trivial nor impossible.
3. **Writing.** The voice bible, then K1, K2, K3 and K5 written to the slice script, then the roster encounters rewritten from stub to M1 quality.
4. **Screens.** Title and onboarding, an ending screen with a ledger summary, and the art in `art/ART_PLAN.md`.
5. **Confidence.** A Playwright smoke test of a full run in CI, then a timed playtest.

## Done when

- A first-time player finishes a run in 18 to 22 minutes, on a phone, with no help (three testers, timed).
- Every keystone order the scheduler allows reaches an ending (the reachability audit and simulation cover this).
- Both endings and the foreclosure ending are reachable and show a ledger summary.
- `npm run check` and the end-to-end smoke test pass in CI, and the Pages deploy serves the run.
- No `[GM-ONLY]` or HELD material in player-visible text (the canon guard and the owner's read).

## Not in the slice

K4, the other roster encounters, audio, ship art beyond what Prepare needs, PWA install, and anything that makes a run longer than 20 minutes. "Several hours of play" is a later structure (many linked runs or one long campaign) and the owner has not chosen it. The save format should stay extensible for it.
