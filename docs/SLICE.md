# M1 slice: the 20-minute playtest

Status: proposal for the owner. Goal: one complete, balanced run in about 20 minutes on a phone, playable from the public Pages URL, that a stranger can finish without help.

## What a player experiences

| Cycle | Hub (about 1 min) | Action 1 and 2 (about 2 min each) |
|---|---|---|
| 1 | Short brief, the board, meters explained by use | The tutorial scene `written_clause` (a standoff), then **K1 The Passenger** (courier keystone: a hunted passenger recognises Marcus) |
| 2 | Upkeep, the first Pursuit tick, new board | One roster encounter, then **K2 The Silent Hab** (with the ship-versus-ship beat below) or **K3 The Dark Lane** (the player's lead and ship decide which) |
| 3 | Pursuit pressure shows on the clock | The other of K2 and K3, then one more roster encounter |
| 4 | The clock is nearly full | **K5 The Asking** (forced), then the ending |

Eight scenes, one of them an action scene (see below): four keystones and four roster encounters out of six (courier, distress call, scout, trade run, salvage, standoff). The board shows two or three offers per cycle, at least one affordable and one a stretch, as in `game-design.md` section 3.

## The action scene: ship versus ship

Every run has at least one, guaranteed by making it part of a keystone. **K2 The Silent Hab** gets a first beat on the lane: a hijack-crew cutter has come to strip the failing hab, and the player's ship meets it before it can dock. Then the rescue choice follows (people or records), shaped by how the beat went. Keystones are forced at their deadline, so the beat cannot be skipped.

- **Beat 1, the intercept.** Three approaches, each with three written outcomes like any scene, and each roll shows the ship's part in the Odds panel: *Run the cutter down* (Pilot, Astrogation), *Open fire to drive it off* (Gunnery, Tactics), *Jam its sensors and talk it off* (Electronics, Diplomat). An armed ship (`armed` tag) improves the odds of the second; a fast ship (`fast`) the first. Clean means the cutter breaks off and the player arrives with time in hand. Cost means it breaks off but the ship or the hab pays for it. Fail means the cutter docks first and the rescue starts under pressure. Failure still moves the story on.
- **Beat 2, the rescue.** The existing K2 choice. The cutter crew's presence, or absence, changes what is left to save.
- Only an **unnamed hijack-crew cutter** appears (a public, played kind of encounter). No Hunter craft and nothing from the sealed canon.
- Cost: about 350 more words authored, about 150 read, and about one extra minute per run. The slice still lands at 20 minutes by the timing target below.
- Art: the `skirmish` image in `art/ART_PLAN.md`, plus the `hab` image for the second beat.
- Engineering: nothing new in the engine. It uses two rolls in one keystone, ship tags already in `ships.json`, and the odds panel. Check that a keystone can hold two rolls and that the Prepare screen filters or warns when no armed ship is assigned.

An optional roster action encounter (an armed intercept standoff) can follow in M2.

## Content for the slice

| Item | Count | Source | Notes |
|---|---|---|---|
| Keystones | 4 | K1, K2, K3, K5 in `game-design.md` section 6 | Premises are proposals until the planner confirms them under the HELD rules (Contact 1, Tally's name and number, Helena's and Adrian's whereabouts stay unresolved). Placeholder facts stay `[STUB]` |
| Roster encounters | 6 | `CONTENT_GENERATION.md` briefs, one location each | `written_clause` is the tutorial standoff |
| Endings | 2 | K5's stances (reaffirm, withdraw) with ledger lines | Decided 2026-10-28: two endings; three stances are deferred to M2 |
| Failure ending | 1 | #29 foreclosure | Reached only when upkeep arrears hit the limit |
| Hub text, crew lines, ledger | about 1,500 words | Hub and crew voice cards | |

Word budget: about 13,850 authored, about 3,800 read per run (`game-design.md` section 9).

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
