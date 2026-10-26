# Content generation: rules for lower-cost models and coordinators

Read `WRITING.md` first (ink syntax, rolls, notes). This file adds the **contract** for generated scene text. The aim: a low-cost or local model fills fixed slots from a brief, and a checker, not a reviewer, catches most mistakes.

Why this exists: the first generated stubs (PRs #60 and #61) passed every structural check yet were weak as play. All four scenes were a clerk at a counter at an unnamed station. Outcomes differed in wording but not in what changed, and several clean outcomes gave the player nothing. The rules below target exactly those failures.

## 1. Division of labour

| Who | Decides |
|---|---|
| Coordinator (a person, or a stronger model) | The **brief**: archetype, location, stake, NPC, complication, the three approaches, and the effect table. |
| Scaffolder (`npm run new:scene`) | Files, knots, ids, titles, controls. Never edited by the writer model. |
| Writer model | The **eleven passages and the nine notes**, and nothing else: no knot names, roll lines, numbers or `add()` calls. |
| Checker (`npm run check`, plus the lint in section 8 once it exists) | Structure, word counts, banned phrases, notes matching effects. |
| Reviewer (`REVIEW_CHECKLIST.md`) | Voice, canon, whether the scene is worth playing. |

A model that is asked to make decisions it was not given a slot for will invent them. Give it fewer decisions.

## 2. The brief

The coordinator fills one brief per scene. The writer model sees only its brief, this file's sections 3 to 6, and the named location file. It must not read other canon.

```
id:           snake_case id (also the file name)
archetype:    trade_run | courier | salvage | scout | distress_call | standoff
layer:        commercial for trade_run, courier, salvage, scout; crisis for distress_call, standoff
location:     one file from docs/canon/locations/ (never reuse a location within one season config)
who:          one role from that file's "Who is usually there" (a role, not a canon name, unless the issue says so)
want:         what the player is trying to get, in one sentence, with one object or number
at_stake:     what is lost if it goes wrong, in one sentence
complication: one line from docs/canon/complications.md for this archetype
approaches:   three, each { label (player intent), skills (two skill names), npc_reaction (one phrase) }
effects:      the table in section 4, filled with numbers
```

`label` is the text of the button, written as intent: verb first, 3 to 8 words, specific to the scene. Good: "Haggle the berth fee down". Forbidden: "parley approach", "Coordinate", any archetype word.

## 3. The outcome contract

Every roll has three outcomes. Each outcome must change **something the player can point to**.

| Grade | Must do |
|---|---|
| **Clean** | The player gets what they wanted **and** one visible gain (an effect in section 4). |
| **Cost** | The player gets what they wanted, but pays a **named price**: a resource, a lasting fact, or a person's attitude. |
| **Fail** | The player does **not** get it, a **specific alternative route** is shown (a named desk, a day, a person), and there is a cost that stays inside the fail band in section 4. Failure moves the story on. |

Rules that apply to all nine outcomes in a scene:

1. **Distinct.** No two outcomes may share the same key noun for their result. If "the fee" is what changed in one, a different object changes in the others. The test: can a reader tell from the outcome alone which approach and which grade it was?
2. **Concrete.** Name a person, an object or a number from the brief. "Staff" and "personnel" are not people.
3. **State changes are shown, not announced.** Write "the tug swings in", not "the process concludes". Never name the menu or the roll ("the parley succeeds").
4. **Notes mirror effects exactly.** If an outcome calls `add("Credits", 1500)` the note says "Credits +1,500". A note that promises something with no effect is a bug (for example "priority berth slot" with no slot in the prose or effects).
5. **No hedging.** Do not write that nothing is decided, that nothing is implied, or that a thing "remains open" unless the brief says it does. A scene that ends with nothing changed fails the contract.
6. Marcus is never written for. Narrate the world. "You" is allowed only for what the player's ship or crew can plainly see or are handed.

## 4. Effects in stubs (owner ruling, 2026-10-24)

Stubs carry **placeholder effects** so a run can be tuned. The owner decided: clean outcomes carry a visible gain, and stubs may use small effects.

Effects are written by the coordinator in the brief and rendered by the scaffold or a person. The writer model never types `add(...)`. Each effect line is `[STUB]`-marked in the brief and kept in one table so the owner tunes them in one place.

Placeholder bands (not canon; replace when the economy is reconciled, issue #35):

| Grade | Allowed effects, at most two per outcome |
|---|---|
| Clean | Credits +1,000 to +3,000, or Renown +1, or Strain -1 |
| Cost | Credits +0 to +1,000 with Strain +1, or Credits -500 to -1,500 with something gained |
| Fail | Credits -500 to -1,500, or Strain +1 |

- Use `Pursuit` only for an explicitly loud (+1) or quiet (-1) choice, per `WRITING.md`.
- Use `Renown` rarely: it is both reward and risk (`game-design.md`).
- Never invent a new resource, flag or meter. Never use `trust` in stubs.

## 5. Prose rules

**Shape.** Each passage is 40 to 80 words and 3 to 6 sentences, with at least one sentence over 12 words and one under 9. Start every passage with `[STUB]`. The opening passage sets: where, who, what is wanted, what is at stake, and ends on pressure.

**Place.** The opening and at least four outcomes each use one sensory detail from the location file (sound, smell, light, temperature or texture). A category is not a detail: amber beacons and distant hab work lights are two different light details. Do not reuse a detail within a scene. Two scenes may not share a location.

**Show consequences through objects and people.** Good: "The chief draws a line through the fee and initials it." Bad: "The clerk grants a priority berth slot."

**Banned phrases** (fail the lint): the situation, the process, the interaction, next steps, the next decision, stable, smoothly, efficiently, precision, in unison, eyes narrowing, remains open, left open, without implying, nothing is decided, no decision, accepts the parley, approach, coordination succeeds, staff members, personnel, "her hands resting", "unyielding".

**Repetition limits.** No sentence opener repeated more than twice in a scene. No noun phrase of three or more words repeated more than twice across the nine outcomes. No outcome may open with the same four words as another.

**Shared ending.** The ending passage runs after all nine outcomes, so it must be true after every one. Rules: at most 40 words; no seals, fees, slots, windows, cargo state or anything an outcome can change; it says only where the player is and that the ledger card follows. If an outcome needs a closing line, put it in that outcome.

**Canon.** Use only the brief and the named location file. Never read `docs/canon-gm/`. Do not mention Ariadne, the pursuers, Marcus's past, powers, or children. A named canon person only if the brief names them, and then follow their voice card.

## 6. Making a roster feel different

A season config with six stubs must vary on every row of this table. The coordinator checks it before issuing briefs.

| Archetype | The scene is about | Must feel different by |
|---|---|---|
| Trade run | Goods moving to a buyer, and an interruption | a buyer's deadline, a physical object being moved |
| Courier | A person or cargo with a secret | a recipient, a hand-off, something wrong with the label |
| Salvage | A find that is wrong or odd | a physical wreck or cache, a risk to the crew's body |
| Scout | A lane that has gone dark | distance, an instrument reading, a gap in a record |
| Distress call | A signal: real, a trap, or neither | time pressure, a voice |
| Standoff | A dispute needing a ruling | two parties who both have a point |

No two stubs share a location, an NPC role or a key object. Counters and clerks are allowed in at most one scene.

## 7. Prompt for the writer model

Give the model the brief, sections 3 to 5 of this file, the location file, and ask for JSON only. The assembler or a person turns the JSON into ink. The model must never write ink syntax.

```
You write placeholder game text. Follow the brief exactly. Return only JSON:
{
  "open": "...",
  "outcomes": {
    "<approach_1>": { "clean": {"text": "...", "note": "..."}, "cost": {...}, "fail": {...} },
    "<approach_2>": { ... },
    "<approach_3>": { ... }
  },
  "ending": "..."
}
Every text starts with "[STUB] ". 40 to 80 words (ending at most 40). Follow the outcome contract:
clean = gain, cost = price paid, fail = a named alternative route plus a cost inside the fail band.
Each note repeats its effect exactly. Never write the player character's words, thoughts or actions.
Use no banned phrase. Use one sensory detail from the location per passage at most.
```

## 8. Checks to build (follow-up issue)

A lint in `tests/` (core zone) should fail on: word count outside 40 to 80; a missing `[STUB]`; any banned phrase; a repeated sentence opener or phrase over the limits; a note with a number that does not match its `add()`; an outcome with no effect when the grade requires one; a clean outcome with no gain; two stubs in one location; a shared ending over 40 words or containing a word from the brief's state-noun list; and a scout that is not `commercial`, or a distress call or standoff that is not `crisis`. The assembler (brief JSON plus passage JSON to ink and encounter JSON) belongs in the same issue.

## 9. Worked example

Two complete reference scenes, with a rubric and the improvement loop for the writer models, are in `targets/README.md`. This section is the short version.

Brief (abridged):

```
id: stub_trade_berth      archetype: trade_run     layer: commercial
location: hearthline-berths   who: chief of the berth crew
want: get forty crates of water filters through a berth to a waiting buyer's tug
at_stake: the buyer walks and the crates sit on the deck
complication: A filing is held for a second countersign; the hold posts an hour or two late.
approach 1: label "Haggle the berth fee down"   skills Persuade, Diplomat
effects (approach 1): clean Credits +1,500 | cost Credits +1,000 and Strain +1 | fail Credits -500
```

Good output for approach 1 (word counts 65, 62, 63; the opening is 75):

- **Open:** [STUB] Cold air rolls off the long bay, and the berth lights hum at a pitch that sets your teeth on edge. The chief of the berth crew holds a clipboard against her chest. Forty crates of water filters wait on the deck, and the buyer's tug idles at the gate. Her fee sheet has a line crossed out and rewritten. The loose third plate rattles under her boot as she waits for your answer.
- **Clean:** [STUB] The chief reads your offer twice, then draws a line through the fee and initials it. The tug at the gate swings in, and the third plate rattles under its tow-bar as the crates start to move. By the time the lights change to night setting, the buyer has signed for all forty and a clerk has counted the credits onto the sheet. Note: Credits +1,500.
- **Cost:** [STUB] The chief halves the fee but wants a countersign from the berth office before the crates move. Her runner goes off down the spoke with the sheet. The tug waits at the gate, its engine ticking. When the countersign comes back an hour late, the buyer pays, but takes a tenth off for the delay and tells the whole queue why. Note: Credits +1,000, Strain +1.
- **Fail:** [STUB] The chief shakes her head and writes the full fee back in. The crates stay on the deck, and the tug at the gate drifts out of its slot to make room for a hull with its paper in order. You are given a hold ticket for the next berth window, a day away, and a bill for the hours already used. Note: Credits -500.

What makes it pass: every outcome changes a different thing (a fee line, a countersign delay, a ticket), each names a person or object, each notes its effect, the failure gives a route (the hold ticket), and no sentence names the menu or the roll.

What failed in the first stubs, for contrast:

- Bad: "The routing coordination succeeds and the dispatch staff confirms the path." It names the menu and "dispatch staff" is nobody.
- Bad: "The exchange clarifies what a future decision would cover, while the inventory dispute itself remains unresolved." Nothing changes, and it hedges.

## 10. Content lint operations (issue #71)

`npm run lint:content` (also part of `npm run check`) checks every
`src/story/scenes/stub_*.ink` and its same-id encounter JSON. An optional repository
root can be passed with `npm run lint:content -- <root>`. A missing or malformed
association fails; an empty stub roster passes. Existing structural/schema tests
remain required.

Coordinator-owned Ink metadata records location without adding encounter fields:

```ink
// @content {"id":"stub_example","location":"docs/canon/locations/the-shoal.md","state_nouns":["citation"]}
```

The comment ID must match the file and encounter ID, and the encounter `knot` must
name the entry knot. Locations must be existing direct files in the public location
directory; paths and symlink escapes are rejected. The shared ending knot is
`<id>__after`. Exactly three distinct approach prefixes each have `_clean`, `_cost`, `_fail`
outcome knots, plus an entry, `<id>__menu` and the shared ending. Existing named
approaches and `a1`/`a2`/`a3` both work. Unsupported controls, extra knots, effects
outside outcomes, symlink path components and orphan stub encounter files fail. `state_nouns` is optional coordinator metadata; supply the scene's
additional mutable objects here. The fixed seal/fee/slot/window/cargo words are
always checked. Without an additional list, the checker cannot infer other mutable
objects from prose. It never reads the location file or any GM material.

Operational definitions are deterministic: words are Unicode letter/number tokens
with internal apostrophes; `[STUB]` and Ink tags do not count. Sentences split at
`.`, `!`, `?`; the opener is the first **two words**, counted across all eleven
passages. Outcome first-four-word uniqueness applies only to the nine outcomes.
Banned phrases match whole token sequences, ignoring case and punctuation.

These operational definitions are authoritative for the opener, noun-phrase and sensory rules in sections 5 and 8 (they were clarified on 2026-10-26 after the stub trial). Fail and cost are compared by band, not by size: a fail only has to stay inside the fail band, and a cost and a fail may lose the same amount.

The noun-phrase gate is a bounded heuristic: a determiner/possessive followed by at
least two words up to a configured verb, preposition, conjunction or other stop
word. It counts every prefix of three or more words across outcomes. This catches
`the convoy master` and `the battered copper plate`, while excluding functional
sequences such as `the chief reads`. It is not full grammatical analysis: unknown
verbs and ambiguous English still require review. Edit the single
`scripts/content-rules.json` for banned phrases, placeholder bands and lexical
stops. Sensory categories are not individual details and are not repetition gates.

Notes must contain exactly the same signed resource numbers as their outcome's
literal `add()` calls (commas in numbers are accepted); unrelated numbers fail.
Cost and fail need effects, clean needs a gain, and each outcome permits at most
two distinct effects inside the placeholder bands. Positive/zero Credits on cost
requires Strain +1; negative Credits cost is checked numerically, while “something
gained” remains a reviewer judgment. This lint does not certify voice, sensory
accuracy, canon, agency, specific fail-forward routes or semantic outcome quality.
Optional coordinator `loud_quiet` metadata maps outcome knot names to `loud` or
`quiet`, authorizing Pursuit +1 or -1 respectively. Unmarked Pursuit changes fail;
Pursuit does not replace the required grade-specific gain or cost.

## 11. Assemble coordinator briefs and writer JSON (issue #70)

```sh
npm run assemble:scene -- --brief path/to/brief.json --passages path/to/passages.json
# Optional: --root path/to/repository (defaults to the current directory)
```

The command reads JSON only and creates the scene and encounter together. Both
output directories must already exist. It refuses existing destinations, reserves
both exclusively before writing, and removes only files it created if either
reservation or write fails. Public location paths and output parents must have no
symlink components. Input validation and the full existing roster lint run before
reservation; the candidate must also use a location absent from that roster.

Use the brief shape in section 2, with `effects` under each approach as in the
reference `brief.json` files: each grade maps to arrays of `[resource, delta]`.
Exactly three distinct labels, each 3–8 words, and two distinct known skills per
label are required. Writer JSON has exactly `open`, `outcomes`, and `ending`;
`outcomes` has exactly the brief's label keys, each with `clean`, `cost`, `fail`,
and each grade has exactly `text` and `note`. Notes receive one deterministic
`[STUB]` prefix; signed amounts must match the coordinator effects exactly.
Optional `title`, `state_nouns`, `loud_quiet` (canonical outcome-knot keys), and
`sensory_details_used` remain coordinator metadata. No new IDs are required.

Assembler IDs must start `stub_` so directory lint covers every generated file.
The `target_*` reference IDs are deliberately rejected; do not rename references
or rewrite their labels automatically. The assembler generates only a1–a3 knots,
fixed scaffold metadata and coordinator effects. It rejects multiline strings,
control characters, backslashes, HTML angle brackets and Ink controls rather than escaping writer
prose into executable Ink. Ordinary quotes and curly dialogue are supported.
All visible generated strings carry `[STUB]`; no location field is added to the
encounter JSON. Voice, sensory-detail accuracy, mutable-noun selection, meaningful
outcomes and player agency still need the human review described above.
