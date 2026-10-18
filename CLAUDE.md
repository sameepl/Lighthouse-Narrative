# Lighthouse Narrative

Mobile-first narrative game. Stack: **ink** (writing) + **TypeScript** rules engine + **React** UI, built with Vite.

## Commands
- `npm run dev`: dev server. `npm test`: rules, data validation and a walk of every story branch. `npm run build`: typecheck + production build to `dist/`.
- Always run `npm test` and `npm run typecheck` before committing.

## Architecture (keep these boundaries)
- `src/story/`: ink only (the writing). No numbers or rules in ink beyond calling `roll`, `res`, `add`, `note`. See `docs/WRITING.md`.
- `src/engine/`: pure TypeScript rules (rolls, odds, grading, Edge, resources). No ink, no React. Unit-tested.
- `src/data/`: JSON data (rules, character, crew, ships) validated by zod (`schema.ts`, `validate.ts`). Validation is dev/test only.
- `src/bridge/session.ts`: the only place ink, engine and UI meet. Ink owns narrative flags; the engine owns resources.
- `src/ui/`: React components, theme, animation. Reads the session's zustand store; never touches ink directly.
- `plugins/vite-plugin-ink.ts` compiles `.ink` to JSON at build time (the browser ships only the inkjs runtime).

## Conventions
- Marcus Torin is never written for: no speech, thoughts or actions for him in prose.
- Don't reproduce published tabletop rulebook text or trademarked setting material (see `NOTICE`).
- Character stats and some Credits/Strain numbers are placeholders; confirm with the owner before treating them as canon.
- Deploys: pushes to `main` run `.github/workflows/pages.yml` (test, build, GitHub Pages). Pages source must be "GitHub Actions".
- The git proxy in cloud sessions rejects tag pushes; use branches (e.g. `archive/prototypes-v0` holds the old three-stack prototypes).
