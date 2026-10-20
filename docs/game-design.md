# Game design (living document)

Status: draft. Numbers are targets to calibrate in playtests, not hard limits.
The owner's campaign is source material and a theme guide, not a beat-for-beat adaptation.
Marcus Torin is never written for: the game never decides his speech, thoughts or actions.

## 1. Pillars

1. **Doing right costs something**, and the cost is visible (ledger, meters, "X remembers").
2. **Pressure, not punishment.** Money, Strain, Renown and a closing pursuit squeeze the player; failure always moves the story on.
3. **Short and legible on a phone.** A scene fits in about two minutes; a cycle in about five.
4. **State, not paths.** Variety comes from a few meters and flags, not from an exploding tree.
5. **The past is evidence, never interior.** Marcus's missing memories surface as things the world shows (recordings, manifests, a stranger who knows his face), never as his thoughts.

## 2. Scale targets

Target game: **one 30-minute run**. First playable: a 20-minute vertical slice (see section 9).

| Unit | Definition | 30-minute run | 20-minute slice | Time |
|---|---|---|---|---|
| **Run** | One playthrough, first scene to ending | 1 | 1 | 30 or 20 min |
| **Cycle** | One turn: Hub, then 2 actions, then Downtime | 6 | 4 | ~5 min |
| **Scene** | One encounter or keystone with a fork and an outcome | 12 (4 to 5 keystone, 7 to 8 encounter) | 8 (4 keystone, 4 encounter) | ~2 min (keystone ~3, encounter 1.5 to 2) |
| **Moment** | One player decision: a choice, an assignment, a roll or an Edge decision | 50 to 55 | ~35 | ~35 s each |

Time per cycle: Hub ~1 min (brief, board, assign) plus two scenes of ~2 min.

### Words

Assumption: ~250 words per minute of reading on a phone, with about a third of the time spent deciding, tapping and watching animations. That leaves ~20 minutes of reading, about 5,000 words, in a 30-minute run. Calibrate by timing "The Written Clause" (~430 words read).

| | Read per 30-min run | Authored: full roster | Authored: 30-min lean |
|---|---|---|---|
| Keystones (5 authored, 4 to 5 seen) | ~2,000 (about 450 each) | ~6,500 (about 1,300 each) | ~6,500 |
| Encounters (7 to 8 seen) | ~2,250 (about 300 each) | ~19,800 (22 x ~900) | ~12,600 (14 x ~900) |
| Hub: briefs, board, downtime, crew lines | ~900 | ~3,000 | ~3,000 |
| Crew, ship and gear text | n/a | ~2,500 | ~1,500 |
| Endings and epilogue variants | ~250 | ~2,000 | ~1,500 |
| **Total** | **~5,000 to 5,500** | **~34,000** | **~25,000** |

Authored-to-read is about 5:1 to 6:1, the price of replay value from the roster.

### Branches

- Outcome passages (3 approaches x 3 grades per scene): ~245 full, ~170 in the 30-minute lean build.
- Real forks per run: about one per scene, plus the Hub choices (which two actions, who goes, which ship).
- State budget for the whole season: at most **4 visible meters**, **1 clock**, and **25 narrative flags**.
- Endings: 3 to 4 distinct endings, plus epilogue lines driven by the ledger.

### Encounter template (authoring target)

| Part | Words |
|---|---|
| Setup (situation, NPC voice, the problem) | 150 to 250 |
| 3 approaches x 3 grades (clean, cost, fail), each outcome | 60 to 90 |
| Consequence notes and hooks | ~70 |
| **Authored per encounter** | **~900** (about 300 read in one run) |

Repeatable archetypes add a **complication table** (4 entries of about 100 words) so one authored scene plays as four different ones. Keystones use a longer setup (~300), outcomes of ~90 words and state-driven intro variants (about 450 read).

## 3. The game loop

### Three layers of play

Every cycle the Hub offers work from three layers. The player has **2 actions per cycle**.

1. **Immediate Crisis.** Social, tactical or mercantile problems with a deadline. Free to attempt; ignoring one has a cost (Strain, Renown or Credits). One per cycle.
2. **Commercial.** Opportunities that need money, a ship or gear and carry risk and reward: trade runs, couriers, salvage, scouting. Two or three offers per cycle, at least one affordable and one a stretch. Upkeep each cycle keeps Credits under pressure against the Cr40,000 reserve.
3. **Narrative.** Keystones that must happen. Their options depend on what layers 1 and 2 produced: money, ships, crew trust, Renown, Strain.

The layers feed each other: crises and jobs produce Credits, leads and trust; keystones spend them.

### The cycle

```
Hub: brief, news, upkeep -> board of offers -> Prepare (ship, crew) -> Action 1 -> Action 2 -> Downtime (ledger, crew moment) -> Pursuit ticks
```

### Meters and the clock

| | Range | What it does |
|---|---|---|
| **Credits** | 0 and up | Pays upkeep and buy-ins. Below the Cr40,000 reserve is a warning state. |
| **Edge** | pool of 3 per run | Re-roll a failure, or upgrade a success-with-a-cost to clean. **One pool for the whole run; no refresh.** Earned back only when a crew member reaches trust 3 (+1 each, never above 3). |
| **Renown** | 0 to 5 | How far your name carries. Raises the pay and quality of commercial offers. Also makes you easier to find (see Pursuit). |
| **Strain** | 0 to 5 | Strain with the Compact: how much of Renata's patience you have used. Pays off in keystones. |
| **Pursuit clock** | 6 segments (4 in the slice) | The narrative clock. Each cycle adds 1, plus 1 if Renown is 3 or more, plus 1 for a loud choice, minus 1 for a quiet choice. These modifiers add independently; Pursuit stays between 0 and the clock length. The story can also advance it directly (for example asking Ariadne for a truth: +2; planned for the bridge task #5). When it fills, the pursuers arrive and the finale is forced. |

Renown is both reward and risk: it makes money easier and trouble faster. That tension is the design.

## 4. Stats, assets, crew

- **Marcus** keeps the six characteristics and skills. NPCs do not get them.
- **Ships:** tags (fast, armoured, quiet, hub, workshop, sickbay), upkeep per cycle, one committed per job. The ship decides which options appear.
- **Gear:** about six items; each is a tag that unlocks options (a sealed data core, a long-range probe).
- **Ariadne (companion):** always aboard the _Errant Pawn_ and never "busy". INT 14 and EDU 13 (+2 each); suggested assist Electronics, Astrogation or Recon at +1 (placeholder). She informs and never instructs; see `canon/ariadne-voice.md`.
- **Crew (simple):**
  - **Assist:** one skill bonus when assigned (+1). Only the best assist applies to a roll; no stacking.
  - **Trait:** one tag that unlocks an option (Priya reads the fine print).
  - **Trust:** 0 to 3. At 3 the assist becomes +2, a personal scene unlocks, and the player earns +1 Edge.
  - **Busy:** an assigned crew member is unavailable for the other action that cycle. This is the real cost.
  - About 3 crew are fully active in a run; the rest are cameos.

## 5. Encounter roster (storylet deck)

Encounters are self-contained scenes (one ink knot each) described by metadata in `src/data/encounters.json`. The engine picks what appears on the board; ink never decides.

### Archetypes

Each archetype is a template with a complication table, so it can repeat.

| Archetype | Layer | Core situation | Complications (swap-ins) |
|---|---|---|---|
| **Trade run** | Commercial | Carry goods to a buyer; the run may be interrupted | shakedown by a hijack crew, customs hold, buyer defaults, spoilage and delay |
| **Courier** | Commercial | Deliver a person or cargo somewhere | passenger has a secret, cargo mislabelled, a ship is shadowing you, the recipient is gone |
| **Salvage** | Commercial | Strip a wreck or cache, and find something strange | claim jumpers, unstable hull, the find is wrong, the find is dangerous |
| **Scout** | Commercial | Chart a lane that has gone dark or is unknown | a dead beacon, a ghost signal, a blockade, a lane that is not where it was |
| **Distress call** | Crisis | A signal for help: real, a trap, or neither | genuine, ambush, a hab with a price on it, a recording from the past |
| **Standoff** | Crisis | A social, tactical or mercantile dispute needing a ruling | Compact petition, dockside brawl, price squeeze, a rival hull |

### Metadata per encounter

| Field | Meaning |
|---|---|
| `id`, `knot` | Identifier and the ink knot that plays it |
| `layer`, `archetype`, `tags` | For selection and for board-card icons |
| `requires` | Minimum Credits, ship tag, gear, crew, flags, cycle range |
| `repeat` | `once` or `repeatable` with a `cooldown` in cycles |
| `weight` | Likelihood relative to eligible others |
| `cost`, `risk` | Shown on the board card (buy-in, hint of danger) |
| `lead` | Optional: a keystone lead this encounter can drop (see section 6) |

### Selection rules

1. Build the eligible pool: requirements met, not already played (or cooled down).
2. **Guarantees:** one crisis, two to three commercial offers (one affordable, one a stretch), and a keystone lead when one is due.
3. Draw by weight with a **seeded RNG**. The seed is saved, so saves and replays are reproducible and testable.
4. Record played encounters in saved state. Repeatables get a cooldown and a different complication each time.
5. **Keystones are never random.**

### Why this works, and the caveats

This is the quality-based storylet model proven in Fallen London and Sunless Sea. Risks: random draws can break coherence, and it needs enough roster before it feels varied. Mitigations: tags and requirements keep draws plausible; guarantees prevent a lopsided board; a simulation test catches dead ends.

## 6. Keystones

### Principle: keystones are the elevated versions of roster archetypes

The player learns each archetype in small, low-stakes encounters, then meets the high-stakes version as a keystone. Same shape, much heavier stakes, state-sensitive options, and evidence from Marcus's past. Roster encounters can also drop **leads** that make a keystone available, so the order emerges from play.

### The thread: a missing past, a pursuit, and a companion

Marcus's missing memories link him to people, and some people want what he lost. **Ariadne is the anchor, and she is already aboard:** EID-0, recovered as an isolated core from Far Horizon, with Marcus since the start (see `canon/`). There is no reunion to reach. The story is about **what to ask her and what asking costs**, with a pursuing Section closing in. The season question: _who gets to decide what a person keeps, and what will you pay to protect that right?_ (Confirmed by the planner: it fits the files' own theme of custody against consent, with "doing right costs" as the other half.)

Revised after the planner's notes (`canon/design-impact.md`). Keystone titles, the pieces and K5's stances are proposals until the design PR is merged. `[GM-ONLY]` canon is usable in text only if it is on the authorised list (`canon/owner-decisions.md`).

Each of K2 to K4 yields one **piece** of the picture, delivered as evidence the world shows (never as Marcus's thoughts):

| Piece | What it is | Evidence the world shows |
|---|---|---|
| **Removed** | What Marcus took out, and who took it out later | the sealed folder, Merrow's initials, the number, Jonah's report |
| **The Six** | Who they were: the six children | the six-place table drawn three times; a manifest of six identifiers, one matching no one |
| **The Claim** | Who is pursuing him, and what they want | the cut mast and the old continuity signal; the Section's argument for custody |

**The price of knowing.** The canon facts are authorised (`canon/owner-decisions.md`): Ariadne tells Marcus things only if asked, and authenticating her on an open channel tells the Section where she is. So asking her for a truth is a choice with a cost: a Pursuit tick of +2.

### Keystones (working titles)

| # | Keystone | Elevates | Premise | The hard choice | Evidence of the past | Piece |
|---|---|---|---|---|---|---|
| **K1** | **The Passenger** | Courier | A routine courier booking: the passenger is being hunted, and recognises Marcus | Shelter them, hand them over, or smuggle them out, with the Compact watching | The passenger knows details no stranger should; a credential that still opens a terminal | opens the pursuit |
| **K2** | **The Silent Hab** | Distress call | A hab on a dark lane is failing, and nothing answers hails | Whom or what to save with limited time and air: the people or the records | A manifest of six identifiers, one of which matches no one | The Six |
| **K3** | **The Dark Lane** | Scout | Chart the lane that went dark, a segment with no chart | Publish what you find (Renown, but it exposes you) or keep it quiet | The sealed folder, opened on screen: its number matches the segment (placeholder "Segment SEG-0417, ship and leg (TBD)"), and Merrow's initials are on the second removal | Removed |
| **K4** | **The Cargo They Want** | Trade run | Armed crews try to take a sealed case wanted by a buyer with a Section seal | Defend it, sell it, or destroy it; the buyer offers "continuity care" | The seal matches the cut mast's old continuity signal | The Claim |
| **K5** | **The Asking** | (finale) | The Pursuit clock is nearly full. Ariadne gives her first honest "I am not able to say", then asks Marcus whether his old request (to tell him the truth if she found him) still stands. She holds the removal record | Reaffirm the request (learn everything, pay the Pursuit cost), withdraw it (honour what a younger Marcus chose and what Ariadne would rather not carry), or share the decision with Cass and the others | Everything gathered | resolves the pieces |

K5 is Ariadne asking, not Marcus finding. The relief is Ariadne answering, not being found; the guilt is stronger because Marcus asked her to do it, so there is a thread of unease under it. Ariadne can decline to show the record and says plainly which kind of "no" it is ("I do not know" or "I am not able to say"). The player never decides, for her, what to do with the image of her "before Marcus": that is her call.

### Order and flexibility

- **K1 first, K5 last.** K2, K3 and K4 can come in any order, set by which lead the player follows and what they can afford.
- A keystone not pursued forces itself at its deadline with weaker options.
- K5 needs at least two of K2 to K4. **Which pieces the player holds** changes K5's options and the ending.
- The Pursuit clock decides how much time there is. If it fills early, K5 triggers with whatever the player has.
- In a 20-minute slice: K1, then K2 and K3 in either order, then K5.

## 7. Branching policy (Medium)

- **Contained forks.** Each scene's fork resolves inside the scene and is recorded as state, not as a separate path.
- **Pieces and stance decide the ending.** Three pieces (Removed, The Six, The Claim) plus one stance flag set in K5 (open it, leave it closed, share the decision).
- **Cosmetic reactions are welcome**, but never offer options that all lead to the same result.
- **Roster for variety, spine for story.** Only keystones carry the mystery.

## 8. Engineering impact

- **New engine modules** (pure TypeScript, tested): cycle and clock, Pursuit, board builder and selector, keystone scheduler and leads, upkeep, crew assignment, Edge earning.
- **New data:** `encounters.json`, `keystones.json`, extended `crew.json` (assist, trait, trust) and `ships.json` (tags, upkeep), and complication tables.
- **Ink:** one knot per encounter and keystone, plus Hub briefs and downtime text. No scheduling logic in ink.
- **Bridge:** diverts to an encounter's knot with `ChoosePathString`, then returns to the Hub when it ends.
- **UI:** Board screen (offer cards with cost and risk), Prepare (ship and crew), cycle indicator, Pursuit clock.
- **Tests:** a simulation plays 1,000 seeded runs and asserts that K5 is always reachable, the board is never empty, no one-off encounter repeats, and keystone deadlines hold.

## 9. Production plan (leaner start)

| Milestone | Scope | Authored words | Done when |
|---|---|---|---|
| **M0 Grey-box loop** | Hub, board, Prepare, upkeep, Pursuit clock, selector. About 6 stub encounters and 2 stub keystones in placeholder text. | ~2,000 | A run is playable with fake text, and the loop feels right |
| **M1 20-minute slice** | 4 cycles. Keystones K1, K2, K3, K5. Roster of 6 encounters (Courier, Distress call, Scout, Trade run, Salvage, Standoff: one each, with complications). 2 endings. | ~13,500 | A complete, balanced 20-minute run |
| **M2 30-minute lean** | 6 cycles. Add K4 and about 8 more encounters. 3 endings. | ~25,000 | Complete 30-minute run |
| **M3 Full roster** | 22 encounters, art, audio, polish | ~34,000 | Replay variety |

M1 numbers: 4 keystones x ~1,300 = 5,200; 6 encounters x ~900 = 5,400; Hub ~1,200; endings ~1,000; crew and gear ~800. Read per run: about 3,800 words.

"The Written Clause" becomes a roster encounter (Standoff archetype, social) and the tutorial scene.

## 10. Open questions

Resolved: powers stay unexplained strangeness; no on-screen harm to children; the authorised `[GM-ONLY]` list; cryogenics explains the crew's ages; crew roles; which fixed points are evidence only and which are seen on screen (`canon/planner-followup-1.md`).

1. **Ariadne's address to Marcus** is `(TBD)` in the files; the planner recommends formal and precise.
2. **Her progression:** may the game use the Season 4 "ladder" (own core, shared weight, quiet board, with Cass able to end it) as her progression? It is a draft marked player-safe.
3. **The `[NEW]` sample lines** in `canon/ariadne-voice.md`: confirm which may be used.
4. **Open numbers:** Miri's present age; whether Halworth was 19 or 20 years before now; the real meaning of "SEG-0417" (a placeholder).
5. **Jonah's role** (a Lantern; nothing else on file).
6. **Edge:** is "earned only by crew trust 3, never refreshed" right?
7. **Ending count** (M1 has 2, M2 has 3) and how the K5 stance maps to them.
8. **Calibrate** the reading-speed assumption with a real playtest.
