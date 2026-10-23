# Writing guide (ink)

All story text lives in `src/story/` and is written in [ink](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md).
Rules, numbers and character data live elsewhere (`src/engine`, `src/data`), so writers only touch `.ink` files.
Run `npm test`: it walks **every** branch of the story and fails on a broken divert, a typo'd skill, or a dead end.

## Layout

```
src/story/main.ink            entry point: INCLUDEs; the bridge chooses each scene
src/story/lib/world.ink       functions the engine provides (res, add, note)
src/story/lib/roll.ink        the roll() check
src/story/scenes/*.ink        one file per scene
```

New scene: create `scenes/my_scene.ink`. Every file in `scenes/` is included automatically (the `// @include-scenes` line in `main.ink`), so you never edit `main.ink`. Divert to it with `-> my_scene`.

## Voice rules

- **Marcus is never written for.** Narrate the world and the NPCs. Never put words, thoughts or actions in his mouth.
  Choices are the player's intent ("Press for parity"), not a line of dialogue.
- Dialogue uses curly quotes: `“like this,”` (a paragraph that starts with one gets the speech styling).
- Ships are italic: `<i>Errant Pawn</i>`. Light HTML (`<i>`, `<b>`) is fine.
- Doing right should cost something. Every outcome, including success, can carry a consequence line.

## A scene's shape

```ink
=== my_scene ===
Opening line. # bg:hall
More narration.
-> menu

=== menu ===
+ [Press for parity #hint:Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "priya_read", -> win, -> win_cost, -> lose)
+ [Ask politely]
    -> polite
```

- `# bg:hall` sets the background (art lives in `src/ui/assets`).
- `#hint:...` inside a choice's brackets adds the small caption under the button. It must be inside the `[ ]`.
- Use `+` (sticky) for menu choices so "Back" never makes an option vanish.
- A scene ends with `-> scene_end`, the bridge-owned sentinel in `lib/world.ink`. Never divert a playable scene directly to `END`. Put `# summary` on the last line to show the "what it bought, and what it cost" card.

## Rolls

```ink
-> roll("Persuade,Diplomat", 8, "priya_read", -> win, -> win_cost, -> lose)
```

| Argument | Meaning |
|---|---|
| skills | Comma-separated. The best one is used. Names must exist in `src/data/rules.json` (`skillChar`). |
| target | Number to meet on 2d6 + modifier. |
| bonus | Comma-separated names of ink flags (`VAR priya_read = false`). Each one that is `true` adds its bonus from `rules.json`. Use `""` for none. |
| the three diverts | Clean success, success with a cost, failure. |

The game runs the roll (Try it, Odds, Edge), then continues into one of the three knots.
**Failure must still move the story**: write what it costs, never a dead end. Write all three outcomes.

## Consequences and resources

```ink
~ note("gain", "The clause is written for every hull.")   // gain | cost | watch
~ add("Strain", 1)                                         // Credits, Edge, Strain, Renown; clamped to their limits
{ res("Credits") < 40000: The reserve is thin. }          // read a resource
```

Put `note()` calls **after** the text they relate to. Resource names are checked: `add("Straine", 1)` is an error.

## Flags

Narrative facts are ink variables: `VAR priya_read = false`, then `~ priya_read = true`.
To make a flag boost rolls, add it to `bonuses` in `src/data/rules.json`:
`"priya_read": { "label": "Priya’s reading", "n": 1 }` and pass its name to `roll()`.

## Canon and voice

- Read `docs/canon/README.md` before writing anything about Ariadne, the Section, or Marcus's past. Unauthorised `[GM-ONLY]` and HELD material never appears in text; use `[STUB]` and ask.
- Ariadne: `docs/canon/ariadne-voice.md`. She is exact, never claims certainty, and distinguishes "I do not know" from "I am not able to say".
- Strangeness around Marcus is evidence (a count that matches, a voice that is recognised), and its cost is headaches and exhaustion. No lights, no named powers.
- Miri is never in danger scenes. No on-screen harm to children.

## Ink traps

- `|` and `{ }` are special inside text; avoid them in prose.
- A line starting with `*`, `+`, `-` or `=` is code. Don't start a sentence with one.
- `->` in prose is a divert. Write "to" instead of an arrow.
- Tags (`# ...`) go at the end of a line. A tag on a line of its own attaches to the next line.
- The free [Inky editor](https://github.com/inkle/inky) highlights these mistakes as you type.

## Adding data (not ink)

People, ships and skills are JSON in `src/data/` and are validated on every test run. Add a crew member by adding an
entry to `crew.json`; a malformed entry fails `npm test` with the field name.

Every encounter file (`src/data/encounters/<id>.json`) requires a nonempty string `title`, the player-facing display name (for example, `"title": "The Written Clause"`). The title is separate from the stable snake_case `id` and ink `knot`; offer commands forward it unchanged for both encounters and keystones. Scene scaffolds must include this required field.


## Hub and persistence contract

The session starts at the Hub. The engine selects offers; ink never schedules or starts another encounter. The encounter board is drawn once per cycle and saved: finishing an action rechecks remaining offers against current requirements and busy crew without drawing new encounters or advancing the RNG. A new cycle draws a new board. On confirmation the bridge diverts to the offer's `knot`. `scene_end` contains the internal `__scene_end__` choice: the bridge consumes it, records completion and returns to the Hub. Do not use that sentinel text elsewhere. An encounter's metadata `lead`, if present, is awarded on completion; keystone evidence is likewise awarded only on completion.

`GameView.phase` is `hub`, `prepare`, `scene` or `ended`. `offers` contains the metadata plus encounter/keystone kind and forced/weak flags. `cycle` holds the cycle number, actions left, and the single Pursuit clock. `assignments` holds the selected ship ID and crew IDs, and `busyCrewIds` remains unavailable until the next cycle. `boardStatus`, `unmetGuarantees`, `blockedDue` and `commercialReplacement` describe unavailable content honestly. `schedulerStatus` remains `unconfigured` until the caller supplies both keystone metadata and explicit role configuration; no story IDs or fallback scenes are invented.

Use `pickOffer(id)`, `assign({ shipId, crewIds })`, `confirm()`, `cancelPrepare()` and `endCycle()`. The existing choice dock has equivalent string commands via `act()`. Scheduling and roll controls carry a `command` (code plus parameters) and an empty `text`; `src/ui/strings.ts` turns them into words, and `GameView.hub` carries the hub status as data. Upkeep notes carry typed command metadata; odds parts carry raw labels, numbers and optional crew-assist metadata. The UI formats these for the dock, feed, summaries and ledger. Plain notes from ink and older version 2 saves keep their original text. The bridge authors no player-visible prose; it forwards ink text and engine roll results. Preparing or cancelling spends nothing. Confirming charges the encounter cost and reserves one action, the played encounter and assigned crew exactly once. A ship is required only when the offer specifies `requires.shipTag`, and it must have that tag. Offers without a ship requirement may use no ship or an assigned ship. All required crew must be assigned. Only the best matching assigned crew assist applies to a roll, including its trust bonus. Finishing a scene does not refund its action. Ending a cycle explicitly forfeits unused actions, pays upkeep for the catalog's ships in service, resets busy crew and advances Pursuit. Forced keystones must be resolved before ending a cycle; depleted actions require a cycle transition before another scene.

Ink may read `res("Pursuit")` or call `add("Pursuit", n)` with an integer delta. This changes `GameView.cycle.pursuit.value`, clamped between zero and that clock's length. Pursuit is never a fifth resource or an ink variable. Apply a direct loud/quiet consequence once; the bridge's cycle tick does not apply it again. Loud and quiet choices are written exactly this way: `add("Pursuit", 1)` for a loud choice and `add("Pursuit", -1)` for a quiet one (a positive or negative n), because `endCycle` does not take loud or quiet flags from the bridge. Unknown resource names are errors.

Save version 2 contains ink, resources, ledger/feed, background and the full run state: cycle/reward history, numeric RNG state, selected board, assignments/busy crew, completed keystones, leads and played IDs with cycles. It resumes Hub, Prepare and committed scenes without another draw or charge. During a pending roll it saves the full pre-choice snapshot, as Back does, including any inline Pursuit changes. Default dice use the saved random stream; injected test dice remain caller-owned. Version 1 saves are discarded. No trust progression is invented; initially trusted crew consume their one-time Edge reward even at the cap.

Cached entries in version 2 `run.offers`, `run.active` and `run.encounterBoard` must also have nonempty string titles. Saves missing those titles are rejected and browser startup discards them, starting a fresh Hub. Valid version 2 saves retain their cached titles and roundtrip unchanged; the save version stays 2.
