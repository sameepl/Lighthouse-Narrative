# Writing guide (ink)

All story text lives in `src/story/` and is written in [ink](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md).
Rules, numbers and character data live elsewhere (`src/engine`, `src/data`), so writers only touch `.ink` files.
Run `npm test`: it walks **every** branch of the story and fails on a broken divert, a typo'd skill, or a dead end.

## Layout

```
src/story/main.ink            entry point: INCLUDEs, then starts the first scene
src/story/lib/world.ink       functions the engine provides (res, add, note)
src/story/lib/roll.ink        the roll() check
src/story/scenes/*.ink        one file per scene
```

New scene: create `scenes/my_scene.ink`, add `INCLUDE scenes/my_scene.ink` to `main.ink`, and divert to it (`-> my_scene`).

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
- A scene ends with `-> END`. Put `# summary` on the last line to show the "what it bought, and what it cost" card.

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
~ add("Strain", 1)                                         // Credits, Edge, Strain; clamped to their limits
{ res("Credits") < 40000: The reserve is thin. }          // read a resource
```

Put `note()` calls **after** the text they relate to. Resource names are checked: `add("Straine", 1)` is an error.

## Flags

Narrative facts are ink variables: `VAR priya_read = false`, then `~ priya_read = true`.
To make a flag boost rolls, add it to `bonuses` in `src/data/rules.json`:
`"priya_read": { "label": "Priya’s reading", "n": 1 }` and pass its name to `roll()`.

## Ink traps

- `|` and `{ }` are special inside text; avoid them in prose.
- A line starting with `*`, `+`, `-` or `=` is code. Don't start a sentence with one.
- `->` in prose is a divert. Write "to" instead of an arrow.
- Tags (`# ...`) go at the end of a line. A tag on a line of its own attaches to the next line.
- The free [Inky editor](https://github.com/inkle/inky) highlights these mistakes as you type.

## Adding data (not ink)

People, ships and skills are JSON in `src/data/` and are validated on every test run. Add a crew member by adding an
entry to `crew.json`; a malformed entry fails `npm test` with the field name.
