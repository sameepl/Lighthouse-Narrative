# src/story: the writing (ink)

Zone `content` may edit `scenes/` only. `lib/` and `main.ink` are core.

- Read `docs/WRITING.md` first. Copy `scenes/written_clause.ink` for structure.
- One scene per file in `scenes/`. It is included automatically; do not edit `main.ink`.
- Every `roll(...)` has three outcome knots: clean, cost, fail. Failure must move the story on.
- Read `docs/canon/README.md`: never use `[GM-ONLY]` or HELD material unless the issue authorises that item; do not invent facts about Ariadne, the pursuers or Marcus's past (use `[STUB]`).
- Marcus is never written for. Narrate the world and the NPCs. Choices are intent, not dialogue.
- Consequences: `~ note("gain" | "cost" | "watch", "text")` after the text it relates to; `~ add("Strain", 1)`.
- Curly quotes for dialogue, `<i>` for ship names. No `|` or `{ }` in prose.
- Verify with `npm test`: the branch-walk test visits every choice and every roll outcome.
