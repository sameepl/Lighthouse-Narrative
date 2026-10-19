# 0004. Medium branching: spine, contained forks, keystones, roster

Status: accepted

## Context
Full trees explode; pure quality-based sandboxes need a lot of content before they feel good. Target is a 30-minute run for a small team.

## Decision
- **Medium** branching: each scene's fork resolves inside the scene and is recorded as state, not as a separate path.
- Keystones are never random; their order is flexible (K1 first, K5 last, K2 to K4 in any order), driven by leads and the Pursuit clock.
- A roster of encounters (once-only or repeatable, with complication tables) is drawn by the engine with guarantees and a seeded RNG.
- Keystones are the elevated versions of roster archetypes (courier, distress call, scout, trade run).
- State budget: at most 4 visible meters, 1 clock, about 25 narrative flags.

## Consequences
- Authored words are about 5 to 6 times the words a player reads in one run; this is the price of replay value.
- A simulation test must prove the finale is always reachable and the board is never empty.
