# M1 slice: the 20-minute playtest

Status: proposal for the owner, revised 2026-10-28 after an independent Opus review. Goal: one complete, balanced run in about 20 minutes on a phone, playable from the public Pages URL, that a stranger can finish without help. A first-pass window of **18 to 24 minutes** is acceptable; the plan measures a length-correct grey-box before any prose is written (see the build list).

## What a player experiences

| Cycle | Hub | Action 1 | Action 2 |
|---|---|---|---|
| 1 | brief, board, meters learned by use | the tutorial scene `written_clause` (a social standoff) | **K1 The Passenger** |
| 2 | upkeep, first Pursuit tick, new board | one roster encounter | **K2 The Silent Hab** or **K3 The Dark Lane** (the lead and ship decide) |
| 3 | Pursuit pressure shows | the other of K2 and K3 | one roster encounter |
| 4 | the clock is nearly full | **K5 The Asking** (forced, whatever the clock says), then the ending | none: the run ends |

**Seven scenes:** the tutorial, four keystones (K1, K2, K3, K5) and two roster encounters. The player sees two of the six authored roster encounters per run (courier, distress call, scout, trade run, salvage, standoff), chosen by the board; the rest are for replay.

## Time budget (using `game-design.md` section 2 rates)

| Part | Minutes |
|---|---|
| Title and onboarding | 0.5 |
| Four hubs (about 45 seconds each, the first with teaching) | 3.5 |
| Tutorial scene | 1.5 |
| Four keystones at 2.5 minutes, plus 1 for K2's action beat | 11 |
| Two roster encounters at 1.75 | 3.5 |
| Ending and ledger | 1 |
| **Total** | **about 21** |

Keystone read length is therefore capped near 350 words each, not 450. Reading budget: about 3,300 words per run. First-time phone readers are slower than 250 words per minute, so the grey-box timing run decides whether to trim further.

## The action scene: ship versus ship

Every run has at least one, guaranteed by making it part of a keystone. **K2 The Silent Hab** gets a first beat on the lane: a hijack-crew cutter has come to strip the failing hab, and the player's ship meets it before it can dock. Then the rescue choice follows (people or records), shaped by how the beat went. Keystones are forced at their deadline, so the beat cannot be skipped.

- **Beat 1, the intercept.** Three approaches, each with three written outcomes: *Run the cutter down* (Pilot, Astrogation), *Open fire to drive it off* (Gunnery, Tactics), *Jam its sensors and talk it off* (Electronics, Diplomat). The ship's part shows in the Odds panel. Clean means the cutter breaks off and the player arrives with time in hand. Cost means it breaks off but the ship or the hab pays. Fail means the cutter docks first and the rescue starts under pressure. Failure still moves the story on.
- **Beat 2, the rescue.** The existing K2 choice: the people or the records. Keep the people off screen and adult, and leave the number of dead unstated.
- Only an **unnamed hijack-crew cutter** appears (a public, played kind of encounter). No Hunter craft and nothing from the sealed canon.
- Cost: about 350 more authored words and about one extra minute, already in the time budget above.
- Art: `skirmish` and `hab` in `art/ART_PLAN.md`.
- **Engineering (core zone, not free):** `ships.json` has only `fast`, `armoured`, `quiet`, `hub`, `workshop` and `sickbay`; there is no `armed` tag, and ship tags decide only which offers appear, never a roll. The beat needs (1) an `armed` tag on `errant_pawn` (it has a turret), (2) ship-tag modifiers on rolls, defined in `rules.json`, applied by the bridge and shown in the Odds panel (`armed` helps the second approach, `fast` the first), (3) a keystone that holds two rolls, which ink supports and the branch-walk should check, and (4) the Prepare screen warning when no armed ship is assigned.

## Rules for the slice

- **The clock (decided 2026-10-28, Option A).** The finale is on a fixed schedule: K5 always plays in cycle 4, and K2 and K3 are forced by their cycle 3 deadlines. A full Pursuit clock makes K5 harder (weaker options, a harder ending); it does not trigger K5 early. This needs a season-level policy in the engine (issue #113). Renown 3 or more, a loud choice or a channel-opening tick can still fill the clock, but can no longer skip K2 or K3.
- **K4 is out.** The slice `season.json` lists only K1, K2, K3 and K5, so K4 can never be forced.
- **The price of knowing** is a **+2 Pursuit tick only when a channel is opened**, per `canon/owner-decisions.md` section 7. Asking Ariadne a question does not tick the clock. (`game-design.md` is corrected to match.)
- **K5's reaffirm cost** cannot be Pursuit, because the clock is already nearly full when it plays. The cost is a ledger line and the ending it leads to.

## Content for the slice

| Item | Count | Notes |
|---|---|---|
| Keystones | 4 | K1, K2, K3, K5. Premises are proposals until the planner confirms them under the HELD rules (Contact 1, Tally's name and number, Helena's and Adrian's whereabouts stay unresolved). Placeholder facts stay `[STUB]` |
| Roster encounters | 6 authored, 2 seen per run | `CONTENT_GENERATION.md` briefs, one location each; `written_clause` is the separate tutorial |
| Endings | 2, each with its own backdrop, plus the foreclosure ending | Decided 2026-10-28; three stances are deferred to M2. Foreclosure reuses `end_closed` with a tint (about 150 words, #29) |
| Hub, downtime, crew lines, ledger | about 1,700 words | Hub 1,200 plus crew and ship text 500, as in `game-design.md` section 9 |

Authored budget: about 13,500 words for the slice proper (`game-design.md` section 9 adds to 13,600) plus about 350 for the action beat. No complication tables in M1: each archetype is seen once per run, so they only pay off in M2.

## Canon cautions for the keystones

- **K1.** The hunted passenger must not invent facts about the pursuers or Contact 1.
- **K2.** "The Six" stays as bare identifiers (a manifest of six, one matching no one). Do not state that they are children. Nothing implies harm to children.
- **K3.** Merrow's initials are authorised. "Jonah's report" and opening the sealed folder on screen need planner confirmation; use `[STUB]` until then.
- **K5.** Marcus's answer is an act (a console acknowledgement, a record kept or sealed), never speech or thought. "His old request" is not on the authorised list in `canon/owner-decisions.md` section 3: confirm it is player-safe before writing it.
- Keep a **flag register** against the cap of 25 (arrears, trust per crew, pieces, stance, leads).

## Build list, in dependency order

Issues: epic #105. Briefs #88, roster stubs #89, keystone stubs and season #90, armed tag #91, timing log #92, Playwright #93, downtime #94, title #95, ending #96, background registry #97, art gate #98, images #99 to #102, planner confirmation #103, voice bible #104.

1. **Finish the grey-box.**
   - Merge the Board (#83) and build Prepare (#7).
   - Add the leads field to the roster briefs.
   - 10a: six roster stubs from briefs, using the assembler with Sol and the lint loop.
   - 10b: four keystone stubs plus a slice `season.json` (no K4). Use target-length placeholder text, so timing is real.
   - Add a dev-only per-scene timestamp log, so timed testers give data, not only a stopwatch total.
   - Add a Playwright smoke test of a full run (a core-zone card: it adds a dependency). #26 and #27 are done and already cover the simulation and reachability.
2. **Timed grey-box run.** Time two or three runs in placeholder text before any prose is written. Trim the plan if it lands outside 18 to 24 minutes.
3. **Rules the slice needs.** The clock policy (#113); the `armed` tag and ship-tag roll modifiers (#91); two rolls in a keystone; #29 (arrears, harder rolls, Renown burn-down, and the foreclosure ending) in three PRs; #35 (ship and economy numbers); then a simulation tuning pass.
4. **Screens.** Title and onboarding (Board, Prepare, Odds, Edge); the downtime and ledger screen each cycle; the ending screen with a ledger summary; save and resume checks (autosave, survive a reload, a new run after an ending); accessibility (contrast over art in both themes, tap-target size, focus order, meter states that are not colour-only, reduced motion everywhere); a build stamp and a feedback link on the Pages build.
5. **Writing.** The voice bible, then K1, K2, K3 and K5 to this script, then the roster encounters rewritten from stub to M1 quality.
6. **Art.** The background registry, then the images in `art/ART_PLAN.md`.
7. **Playtest.** Three timed testers on a phone.

**Critical path:** Board, Prepare, keystone stubs plus the slice season, the timed grey-box run, then #29 and #35 with tuning, the action-beat engine work, keystone prose, and the timed playtests. Writing, art, the voice bible, the planner confirmation of HELD items (start now: an outside dependency with no date), and the title, ending and downtime screens run in parallel. #29 is serial work in the core and bridge lane and should not block the writing.

## Done when

- A first-time player finishes a run in 18 to 24 minutes, on a phone, with no help (three testers, timed).
- Every keystone order the scheduler allows reaches an ending (#26, #27 and the simulation cover this).
- Both K5 endings and the foreclosure ending are reachable and show a ledger summary.
- `npm run check` and the end-to-end smoke test pass in CI, and the Pages deploy serves the run.
- No `[GM-ONLY]` or HELD material in player-visible text (the canon guard and the owner's read).

## Not in the slice

K4, the other roster encounters, complication tables, audio, ship art beyond what Prepare needs, PWA install, three stances, and anything that makes a run longer than 20 minutes. "Several hours of play" is a later structure (many linked runs or one long campaign) and the owner has not chosen it. The save format should stay extensible for it.
