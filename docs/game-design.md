# Game design (living document)

Status: draft for the 30-minute target. Numbers are targets to calibrate in playtests, not hard limits.
Source material is the owner's campaign, used as theme and tone, not adapted beat for beat. Marcus Torin is never written for.

## 1. Pillars

1. **Doing right costs something**, and the cost is visible (ledger, meters, "X remembers").
2. **Pressure, not punishment.** Money, Strain and time squeeze the player; failure always moves the story on.
3. **Short and legible on a phone.** A scene fits in about two minutes; a cycle in about five.
4. **State, not paths.** Variety comes from a small set of meters and flags, not from an exploding tree.

## 2. Scale targets (one 30-minute run)

| Unit | Definition | Target per run | Time |
|---|---|---|---|
| **Run** | One playthrough from first scene to ending | 1 | ~30 min |
| **Cycle** | One turn of the loop: Hub, then 2 actions, then Downtime | 6 | ~5 min |
| **Scene** | One encounter or keystone with a fork and an outcome | 12 (4 to 5 keystone, 7 to 8 encounter) | ~2 min (keystone ~3, encounter ~1.5 to 2) |
| **Moment** | One player decision: a choice, an assignment, a roll or an Edge decision | 50 to 55 | ~35 s |

Time budget per cycle: Hub ~1 min (brief, board, assign) + two scenes ~2 min each. Six cycles is about 30 minutes.

### Words

Assumption: ~250 words per minute of reading on a phone, with roughly a third of the 30 minutes spent deciding, tapping and watching animations. That leaves about 20 minutes of reading, or ~5,000 words. Calibrate by timing "The Written Clause" (~430 words read).

| | Read per run | Authored (full roster) | Authored (lean first pass) |
|---|---|---|---|
| Keystone scenes (5 authored, 4 to 5 seen) | ~2,000 (about 450 each) | ~6,500 (about 1,300 each) | ~6,500 |
| Encounters (seen: 7 to 8) | ~2,250 (about 300 each) | ~19,800 (22 x ~900) | ~12,600 (14 x ~900) |
| Hub: briefs, board, downtime, crew lines | ~900 (about 150 per cycle) | ~3,000 | ~3,000 |
| Crew, ship and gear text | n/a | ~2,500 | ~1,500 |
| Endings and epilogue variants | ~250 | ~2,000 | ~1,500 |
| **Total** | **~5,000 to 5,500** | **~34,000** | **~25,000** |

Authored-to-read ratio is about 5:1 to 6:1 (lean to full). That is the price of replay value from the roster. Two runs share about a third of their encounters.

### Branches

- **Outcome passages** (3 approaches x 3 grades per scene): about 245 in the full roster (27 scenes x 9), about 170 in the lean pass.
- **Real forks per run:** about 12 (one per scene), plus the Hub choices (which two actions, who goes, which ship).
- **Persistent state budget:** at most 4 visible meters and 25 narrative flags for the whole season.
- **Endings:** 3 to 4 distinct endings decided by 2 or 3 keystone flags, plus ledger-driven epilogue lines.

### Encounter template (authoring target)

| Part | Words |
|---|---|
| Setup (situation, NPC voice, the problem) | 150 to 250 |
| 3 approaches x 3 grades (clean, cost, fail), each outcome | 60 to 90 |
| Consequence notes and hooks | ~70 |
| **Authored per encounter** | **~900** (about 300 read in one run: setup, one outcome, notes) |

Keystones use the same template with a longer setup (~300), outcomes of ~90 words, and state-driven intro variants (about 450 read).

## 3. Three layers of play

Every cycle the Hub presents work from three layers. The player has **2 actions per cycle**.

1. **Immediate Crisis.** Social, tactical or mercantile problems with a deadline. Free to attempt. Ignoring one has a cost (Strain, trust or Credits). One is offered per cycle.
2. **Commercial.** Opportunities that need money, a ship or gear to take, and carry risk and reward. They keep Credits above the Cr40,000 reserve against upkeep. Two or three are offered per cycle; at least one is affordable and one is a stretch.
3. **Narrative.** Keystone scenes that must happen. Their options depend on what layers 1 and 2 produced: money, ships, crew, trust and Strain.

The layers feed each other: crises and jobs produce Credits, leads and trust; keystones spend them.

### The cycle

```
Hub: brief, news, upkeep -> board of offers -> Prepare (ship, crew) -> Action 1 -> Action 2 -> Downtime (ledger, crew moment)
```

- **Clock.** A narrative clock ticks each cycle. A keystone becomes available when its lead is found; if the player ignores it, it forces itself at its deadline with weaker options.
- **Upkeep.** Each cycle costs Credits per ship in service.
- **Edge.** Open question: refresh of +1 per cycle (cap 3), so spending Edge stays a real decision.

## 4. Stats, assets, money, crew

- **Marcus** keeps the six characteristics and skills. NPCs do not get them.
- **Meters** (visible): Credits, Edge, Strain with the Compact. A fourth, Renown (merchant trust), is optional.
- **Assets:**
  - *Ships:* tags such as fast, armoured, quiet, hub, workshop, sickbay; an upkeep cost; one is committed per job. The ship decides which options appear.
  - *Gear:* about six items. Each is a tag that unlocks options (for example a sealed data core).
- **Crew (simple, as proposed):**
  - **Assist:** one skill bonus when assigned (+1). Only the best assist applies to a roll, so there is no stacking.
  - **Trait:** one tag that unlocks an option (Priya "reads the fine print").
  - **Trust:** 0 to 3. At 3 the assist becomes +2 and a personal scene unlocks.
  - **Busy:** an assigned crew member is unavailable for the other action that cycle. This is the real cost.
  - In a 30-minute run, about 3 crew are fully active; the rest are cameos.

## 5. Encounter roster (storylet deck)

Encounters are small, self-contained scenes in the ink files, described by metadata in a data file (`src/data/encounters.json`). The engine picks which ones appear on the board; ink never decides.

### Metadata per encounter

| Field | Meaning |
|---|---|
| `id`, `knot` | Identifier and the ink knot that plays it |
| `layer` | `crisis` or `commercial` |
| `tags` | `social`, `tactical`, `mercantile`, location, and so on |
| `requires` | Minimum Credits, ship tag, gear, crew, flags, cycle range |
| `repeat` | `once` or `repeatable` with a `cooldown` in cycles |
| `weight` | Likelihood relative to eligible others |
| `cost`, `risk` | Shown on the board card (buy-in, hint of danger) |

### Selection rules

1. Build the eligible pool: requirements met, not already played (or cooled down).
2. **Guarantees:** one crisis, two to three commercial offers (one affordable, one a stretch), and the narrative lead when due.
3. Draw by weight with a **seeded RNG**. The seed is saved, so a save and a replay are reproducible and testable.
4. Mark each encounter played in saved state. Repeatables get a cooldown and can use varied complications so they feel different.
5. **Keystones are never random.** Their order is governed by the flexible-order rules below.

### Why this works, and the caveats

It is the quality-based, storylet model proven in Fallen London and Sunless Sea. Risks: random draws can break coherence, and it needs enough roster before it feels varied. Mitigations: tags and requirements keep draws plausible; guarantees prevent an empty or lopsided board; a simulation test (below) catches dead ends.

## 6. Keystones and flexible order

Working titles, mystery content to be confirmed by the owner.

| Keystone | Role | Available when | Deadline |
|---|---|---|---|
| **K1 The Written Clause** | Opens the season; the Compact charter | Cycle 1 | Cycle 1 |
| **K2 The Sealed Folder** | Mystery surfaces | A lead found, or cycle 2 | Cycle 4 |
| **K3 The Cut Mast** | Exploration; a number matching no chart | A lead found, or cycle 2 | Cycle 4 |
| **K4 Reckoning with the Compact** | Strain pays off | Strain at or above threshold, or cycle 4 | Cycle 5 |
| **K5 The Number** | Finale | K2 and K3 done | Cycle 6 |

- K1 first and K5 last are fixed. **K2 and K3 can come in either order**, set by which lead the player pursues and what they can afford.
- If K4's condition is not met, a commercial scene takes its place, so a run sees 4 or 5 keystones.
- Each keystone's options are shaped by state: ships, crew trust, gear, Credits, Strain, and earlier flags.

## 7. Branching policy (Medium)

- **Contained forks:** each scene's fork resolves inside the scene and is recorded as state, not as separate story paths.
- **Keystone divergence:** 3 to 5 flags set in keystones stay open until the finale and decide the ending.
- **Cosmetic reactions are cheap and welcome**, but a choice must never offer options that all lead to the same result.
- **Roster for variety, spine for story.** Only keystones carry the mystery.

## 8. Production plan

| Milestone | Content | Words authored | Done when |
|---|---|---|---|
| **M0 Grey-box loop** | Hub, board, Prepare, upkeep, clock, encounter selector with about 6 stub encounters and 2 stub keystones (placeholder text) | ~2,000 | A 30-minute run is playable with fake text, and the loop feels right |
| **M1 Lean 30-minute game** | 14 encounters, 5 keystones, 3 endings | ~25,000 | Complete run, balanced |
| **M2 Full roster** | 22 encounters, art, audio, polish | ~34,000 | Replay variety |

Prototype the loop with fake text before writing the real words.

## 9. Engineering impact

- **New engine modules** (pure TypeScript, tested): cycle and clock, board builder and selector, keystone scheduler, upkeep, crew assignment.
- **New data:** `encounters.json`, `keystones.json`, extended `crew.json` (assist, trait, trust) and `ships.json` (tags, upkeep).
- **Ink:** one knot per encounter and keystone, plus Hub briefs and downtime text. No scheduling logic in ink.
- **Bridge:** diverts to an encounter's knot with `ChoosePathString`, then returns to the Hub when it ends.
- **UI:** Board screen (offer cards with cost and risk), Prepare (ship and crew), cycle indicator.
- **Tests:** a simulation plays 1,000 seeded runs and asserts that a finale is always reachable, the board is never empty, no one-off encounter repeats, and keystone deadlines hold.

## 10. Open questions

1. Edge refresh rule (see section 3).
2. Which meters stay visible, and does Renown stay?
3. The true answer to the mystery (sealed folder, cut mast, the number) and Marcus's memory fragment.
4. Which campaign events are fixed points and which are free to change.
5. Ending count: 3 or 4.
6. Calibrate the reading-speed assumption against a real playtest.
