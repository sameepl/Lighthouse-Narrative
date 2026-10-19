# 0006. Ariadne is aboard, not a destination; canon has status tags

Status: accepted (design items marked "needs OK" in `docs/canon/design-impact.md` still await the owner)

## Context
Our earlier design assumed Marcus would reach Ariadne as a person to find. The planner's notes corrected this: she has been aboard the _Errant Pawn_ since Session 0 (EID-0, recovered from Far Horizon). The notes also separate material that has been played from private GM canon and from items a source file says not to decide.

## Decision
- Ariadne is a companion asset with a past other people want. The finale (K5, "The Asking") is about whether to ask her for the removal record and what asking costs, not about finding her.
- Keystone "pieces" are Removed, The Six and The Claim.
- Canon carries status tags: `[PLAYED]` (usable), `[GM-ONLY]` (needs authorisation), `HELD` (never decided), `(TBD)`. Player-visible text (ink, encounter data, UI) never contains `[GM-ONLY]` or `HELD` material without an issue that authorises that exact item.
- Standing guardrails bind all writing: the discontinuities stay unresolved; no alien or Ancient reveal; Hunters stay rare; Miri is never operational.
- Child-welfare themes are handled through records, evidence and aftermath only (owner to confirm).

## Consequences
- The compiled ink is public on GitHub Pages, so anything in a scene is public; spoiler discipline is a build-time concern, enforced by the PR checklist and `AGENTS.md`.
- Story agents need the authorisation checklist before writing anything that touches the Section, Ariadne's record or the removal.
- Pursuit gains story-driven ticks (asking Ariadne for a truth: +2).
