# 0002. State ownership: ink owns flags, the engine owns numbers

Status: accepted

## Context
Duplicated state between the story and the code drifts apart. The story needs to branch on facts; the rules need to clamp, validate and test numbers.

## Decision
- Narrative flags (what happened) are ink variables.
- Numbers (Credits, Edge, Strain, Renown, the Pursuit clock) are engine state. Ink reads them with `res()` and changes them with `add()`; it never stores them.
- Rolls are requested by ink with `roll()`; the bridge runs the interactive roll and tells ink the grade.
- Unknown names (skills, resources, bonuses) throw with the list of valid names.

## Consequences
- A save is the ink state plus the engine state plus the feed.
- Scheduling (which encounter appears, keystone order, deadlines) lives in the engine, never in ink.
