# Narrative game prototypes: "The Written Clause"

One scene from the brief (`brief.md`), built three ways. `shared/` holds the content, rules engine, CSS and art placeholder.

| Folder | Stack | Where the story/rules live |
|---|---|---|
| `plain/` | HTML + ES modules, no build | `shared/story.js` (data) + `shared/engine.js` (rules) |
| `ink/`   | inkjs (compiled in-browser) + the shared DOM UI | `ink/story.ink` (story AND rules, written in ink) |
| `react/` | React + Vite + Framer Motion | `shared/story.js` + `shared/engine.js` |

## Run
- Everything: `npm run build` (needs Node 22), then `npm run serve` and open http://localhost:8801/
- Dev server for React only: `cd react && npm install && npm run dev`

## What's implemented (all three)
- Roll: 2d6 + skill + characteristic mod vs 8. Hidden behind "Try it"; "Odds" reveals target, modifier breakdown, success % and clean %.
- Three outcomes: Clean success (total >= target+2), Success with a cost (target..target+1), Failure (always moves the story).
- Edge pool of 3: re-roll a failure, or upgrade a cost-success to clean.
- Resources: Credits (green/amber vs the Cr40,000 reserve), Edge, Strain with the Compact. Crew help (Priya's reading, +1).
- Consequence notes after each outcome, a running Ledger in the Sheet, and an end-of-scene summary of what it bought and cost.
- Marcus is never written for: narration covers the world and NPCs; choices are the player's intents.
- Dark/light themes, small-caps labels, monospace numbers, slow background drift, save/restore in localStorage.

## Assumptions to confirm (invented for the slice)
- Marcus's six characteristics and skill levels; skill-to-characteristic pairings (Persuade/Diplomat/Leadership: SOC, Tactics: INT).
- The "success with a cost" trigger (margin band 0-1 over target), plus the Credits (-3,000) and Strain numbers.
- Starting Credits (52,000) and Strain max (5).
