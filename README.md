# Lighthouse Narrative

## ▶ Play it (no install, works on your phone)
**https://sameepl.github.io/Lighthouse-Narrative/**

A mobile-first narrative game: space opera with dark shades, where doing right costs something.
The first playable scene is "The Written Clause". Updates deploy automatically from `main`.

## How it is built
| Layer | Tech | Where |
|---|---|---|
| Writing | [ink](https://www.inklestudios.com/ink/) | `src/story/` |
| Rules | TypeScript (pure functions, unit-tested) | `src/engine/` |
| Data | JSON, validated with zod | `src/data/` |
| Bridge | inkjs + zustand | `src/bridge/` |
| UI | React + Framer Motion + Vite | `src/ui/` |

Writers only touch `.ink` files: see [`docs/WRITING.md`](docs/WRITING.md).

## Develop
```bash
npm install
npm run dev        # dev server
npm test           # rules, data validation, and a walk of every story branch
npm run build      # typecheck + production build into dist/
```
Requires Node 22+.

## Rules in brief
2d6 + skill + characteristic modifier against a target (usually 8+), hidden behind a **Try it** button; **Odds** reveals the maths.
Three results: **Clean success**, **Success with a cost**, **Failure** (which always moves the story on).
**Edge** (3 per episode) re-rolls a failure or upgrades a cost-success to clean. Tracked: Credits (reserve Cr40,000), Edge, Strain with the Compact.

## Placeholders to confirm
Marcus's characteristics and skill levels, the skill-to-characteristic pairings, the margin that triggers "success with a cost",
the Credits/Strain numbers, and the starting Credits and Strain limit are invented for the prototype. They live in `src/data/`.

## History
`archive/prototypes-v0` branch: the original three-stack comparison (plain JS, ink, React) this project grew from.
Design brief: [`docs/brief.md`](docs/brief.md).
