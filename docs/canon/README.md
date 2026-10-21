# Canon

Source material from the campaign-planning thread. It is **reference for designers and story agents**, not a spec to copy.
The game uses the campaign as source material and a theme guide, not as a literal adaptation (`../brief.md`).

## Files

| File | What it is |
|---|---|
| [`ariadne-and-backstory.md`](ariadne-and-backstory.md) | The planner's notes, as received: Ariadne, Marcus's missing memories, the pursuers, other people, the truth, fixed points, tone |
| [`owner-decisions.md`](owner-decisions.md) | **Authoritative** owner rulings: what may be used, content lines, the cryogenics explanation |
| [`planner-followup-1.md`](planner-followup-1.md) | The planner's answers on Ariadne's wants and voice, crew roles, fixed points, the authorised list, tone |
| [`ariadne-voice.md`](ariadne-voice.md) | Writer's guide to Ariadne: what to use, how she speaks and behaves, sample lines |
| [`mining-request.md`](mining-request.md) | A shareable request to the planner for voice cards, locations, ships, economy numbers and more, with the filing layout |
| [`design-impact.md`](design-impact.md) | Our review of those notes: what they settle, what they correct, how the game design changes, and open questions |

## Status tags (used in the notes and in our docs)

| Tag | Meaning | May it appear in player-visible text? |
|---|---|---|
| `[OWNER]` | A ruling or canon addition from the owner (`owner-decisions.md`) | Yes, as stated there |
| `[PLAYED]` | Already shown on screen in the campaign; a **fixed point** | Yes, if the story needs it |
| `[GM-ONLY]` | Private campaign canon; **not canon until played**. Spoiler material | **No**, unless it is on the authorised list in `owner-decisions.md` section 3 (or an issue authorises that exact item) |
| `HELD` | A source file says "do not decide" | **No**. Never write it, never imply an answer |
| `(TBD)` | Unknown or undecided | No. Do not invent it; mark placeholders as placeholders |
| `[NEW]` or "proposal" | New design, not on file | Only once the owner approves it |

## Rules for anyone writing story text (people and agents)

1. **Never put `[GM-ONLY]` or `HELD` material in player-visible text** (ink scenes, encounter data, UI labels, notes) unless the item is on the **authorised list** in `owner-decisions.md` section 3, or the task's issue names that exact item and says it is authorised. The built game, including the compiled ink, is public on GitHub Pages.
2. **HELD items stay unresolved** through Season 1: Contact 1's identity, Tally's name and number, Helena Voss's whereabouts, Adrian Vale's whereabouts.
3. **Standing guardrails** (all `[GM-ONLY]`, so they bind the writing but are not themselves revealed): the nature of the discontinuities stays unresolved; no alien or Ancient reveal; Hunters stay rare; Miri is never operational and is kept out of danger scenes.
4. **Marcus is never written for.** The past appears as evidence the world shows, never as his thoughts.
5. **Child-welfare themes are handled with restraint** (owner ruling): records, evidence and aftermath only; no on-screen harm to children.
6. **Strangeness is evidence, not power.** Show effects as evidence (a count that matches, a voice that is recognised) and costs as headaches and exhaustion. No lights, no named powers.
7. **Ariadne** follows `ariadne-voice.md`: she informs and never instructs, and she says whether it is "I do not know" or "I am not able to say".
8. When a canon fact is needed and is missing, **do not invent it**; use a placeholder marked `[STUB]` and ask in the issue.

## Where mined data is filed

Answers to `mining-request.md` are filed in these places (one file per person, place or ship, so an agent can read only what a task names):

- `voices/<name>.md`, `locations/<name>.md`, `ships/<name>.md`
- `economy.md`, `scene-seeds.md`, `documents.md`, `complications.md`, `glossary.md`, `factions.md`, `tone.md`

Each file starts with a `STATUS`/`SOURCE` header and keeps the planner's status tags. Numbers then flow into `src/data/` (ships, rules, encounter costs) through a normal task, never by hand-editing data from a canon file.

## Updating canon

Only the owner (via the planning thread) changes what is canon. Paste new notes into a new file here and update `design-impact.md`; do not edit `ariadne-and-backstory.md`, which records what was received.
