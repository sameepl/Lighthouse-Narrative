# AGENTS.md

Instructions for any coding agent (Codex, Claude Code, Copilot, local or open-weight models) and for people.
Folders under `src/` have their own short `AGENTS.md`; when you work in a folder, the closest one wins.
Workflow details: `docs/AGENT_WORKFLOW.md`. Game design: `docs/game-design.md`. Plan: `docs/ROADMAP.md`.

## What this is

A mobile-first narrative game. Writing is in **ink**, rules are in a pure **TypeScript** engine, the UI is **React**, built with Vite.
Marcus Torin, the player character, is never written for.

## Commands (run from the repo root, Node 22+)

| Command | Use |
|---|---|
| `npm ci` | Install exactly what the lockfile says (do this first) |
| `npm run dev` | Dev server |
| `npm run check` | **Run before every commit and PR.** Format check, typecheck, tests, build |
| `npm test` | Rules tests, data validation, scripted playthroughs and an exhaustive walk of every story branch |
| `npm run format` | Fix formatting (Prettier). Do not hand-format or reformat unrelated files |

## Architecture boundaries (do not blur these)

- `src/story/`: **ink only** (the writing). No numbers or rules in ink beyond calling `roll`, `res`, `add`, `note`. See `docs/WRITING.md`.
- `src/engine/`: pure TypeScript rules (rolls, odds, grading, Edge, resources). No ink, no React, no DOM. Unit-tested.
- `src/data/`: JSON data validated by zod (`schema.ts`, `validate.ts`). Validation runs in dev and tests, never in the production bundle.
- `src/bridge/session.ts`: the only place ink, engine and UI meet. Ink owns narrative flags; the engine owns numbers.
- `src/ui/`: React. Reads the session's zustand store. Never touches ink directly.
- `plugins/vite-plugin-ink.ts`: compiles `.ink` at build time. Adding a file to `src/story/scenes/` needs no other edit.

## How to work here (many agents, one repo)

1. **Work from an issue** (a task card). If there is none, ask for one. One issue is one PR, under about 300 changed lines.
2. **Branch** as `<zone>/<topic>` (`core/`, `feature/`, `content/`, `docs/`), and label the PR `zone:<zone>`. Tools that pick their own branch names are fine if the PR carries the label.
3. **Stay inside your zone.** The rules are in `.github/zones.json` and are enforced by CI. If the task needs a file outside your zone, **stop**, say so in the issue, and do not edit it.
4. **Open a PR to `main`.** Never push to `main`. CI runs `check` and `zones`; both must pass.
5. **Do not** edit `package.json`, `package-lock.json`, `.github/`, `vite.config.ts` or `tsconfig.json` unless your zone is `core`.

### Definition of done

- `npm run check` passes locally.
- New behaviour has tests. New story content passes the branch-walk test.
- No unrelated changes, no reformatting of files you did not need to touch.
- The PR description says what changed and links the issue (`Closes #N`).

## Conventions

- Marcus Torin is never written for: no speech, thoughts or actions for him in prose. The past surfaces as evidence the world shows (a recording, a manifest, a stranger who knows his face).
- Do not reproduce published tabletop rulebook text or trademarked setting material (see `NOTICE`).
- Character stats and some Credits and Strain numbers are placeholders. Do not present them as canon.
- **Story canon:** read `docs/canon/README.md`. Never put `[GM-ONLY]` or `HELD` material in player-visible text (ink, encounter data, UI) unless the item is on the authorised list in `docs/canon/owner-decisions.md` (section 3) or the issue names that exact item and authorises it. Coherence and Lantern powers are never named or shown as powers; no on-screen harm to children. The compiled game is public. Do not invent facts about Ariadne, the pursuers or Marcus's past; use a `[STUB]` placeholder and ask.
- Failure always moves the story on. Every roll has three written outcomes: clean, cost, fail.
- Keep persistent state small: at most 4 visible meters, 1 clock and about 25 narrative flags.

## Tips for small-context and local models

- Read only the files the task lists, plus the one you are told to copy. Do not scan the whole repo.
- Copy an existing pattern instead of inventing one. For scenes, copy `src/story/scenes/written_clause.ink`.
- Types are the source of truth: `src/engine/types.ts` and `src/bridge/types.ts`. Do not invent fields or functions.
- Make the smallest change that satisfies the acceptance criteria. No refactors, no renames, no new dependencies.
- Run `npm run check` after each step. If the same error persists after three attempts, stop and report the exact output instead of guessing.
- Ink traps: `|` and `{ }` are special in prose; do not start a line with `*`, `+`, `-` or `=`; tags go at the end of a line. Choice hints go inside the brackets: `+ [Press for parity #hint:Persuade / Diplomat]`.

## Environment gotchas

- Cloud sessions may reject tag pushes and block GitHub GraphQL; use branches and the REST API (`gh api repos/{owner}/{repo}/...`).
- Vitest's module cache is disabled on purpose, because edits to included ink files were being missed.
