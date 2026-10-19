# 0001. Stack: ink for writing, TypeScript for rules, React for UI

Status: accepted

## Context
Three prototypes (plain JS, ink, React) played the same scene. The game is mechanics-heavy (Edge, crew assists, strain, ship-dependent options), has about 40 characters, and needs scene writing that non-programmers and cheaper models can do safely.

## Decision
- **ink** holds only the writing (`src/story/`).
- A pure **TypeScript** engine owns rules and numbers (`src/engine/`).
- JSON data files, validated with zod, hold characters, crew, ships and encounters (`src/data/`).
- **React + Framer Motion + Vite** is the UI. A thin bridge (`src/bridge/`) connects them.

## Consequences
- Writers touch only `.ink` files; rules are unit-tested; the UI can change without touching story or rules.
- Ink is compiled at build time, so the browser ships only the small runtime.
- The three-stack prototypes live on the `archive/prototypes-v0` branch.
