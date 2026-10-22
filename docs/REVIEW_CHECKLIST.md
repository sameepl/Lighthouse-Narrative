# Review checklist

One reviewer reads every PR, whoever wrote it (Codex, a local model, Claude Code or a person). CI already runs format, types, tests, the branch walk, `zones` and the canon guard, so the reviewer spends its effort on judgment. The reviewer **comments and never pushes to the PR branch**. The owner merges.

Model: Sonnet by default; consult Opus on the triggers below. See `REVIEWER_PROMPT.md` for the brief.

## 1. Before reading code

- [ ] `check` and `zones` are green on the PR's latest commit. If not, stop and say so.
- [ ] The PR links an issue (`Closes #N`) and carries exactly one `zone:*` label.
- [ ] Size is under about 300 changed lines. If over, ask for a split unless the issue allowed it.
- [ ] The issue's "Files you may change" and "must not change" lists are respected, including amendments in the issue comments.

## 2. Acceptance criteria

- [ ] Walk every acceptance box in the issue and mark it met or not met, with the file and line that proves it.
- [ ] Nothing extra: no refactors, renames, new dependencies or reformatting of untouched files.
- [ ] New behaviour has tests that would fail without the change. Tests assert behaviour, not just that code runs.
- [ ] The issue's "How to verify" steps pass.

## 3. Architecture boundaries (`AGENTS.md`)

- [ ] `src/story`: ink only. No numbers or rules beyond `roll`, `res`, `add`, `note`.
- [ ] `src/engine`: pure TypeScript, no ink, React or DOM, RNG injected.
- [ ] `src/data`: JSON validated by zod; validation stays out of the production bundle.
- [ ] `src/bridge`: the only place ink, engine and UI meet; no player-visible prose except text from ink.
- [ ] `src/ui`: reads the store and never touches ink.
- [ ] Persistent state stays small (at most 4 meters, 1 clock, about 25 flags). Save format changes bump the version and migrate.

## 4. Story and canon (content and anything player-visible)

- [ ] **Marcus is never written for:** no speech, thoughts or actions for him in prose. Choices are intent, not dialogue.
- [ ] **No `[GM-ONLY]` or HELD material** in ink, encounter data, UI text or notes, unless it is on the authorised list in `docs/canon/owner-decisions.md` section 3 or the issue names that exact item. The canon guard catches listed terms only, so read for spoilers it cannot match (paraphrase, implication).
- [ ] No named powers; strangeness is evidence (a count that matches, a voice recognised). Costs are headaches and exhaustion, not lights.
- [ ] No on-screen harm to children. Miri is never operational and never a clue dispenser.
- [ ] Ariadne follows `docs/canon/ariadne-voice.md`: she informs and never instructs, and she says "I do not know" or "I am not able to say" correctly.
- [ ] Voices match the cards in `docs/canon/voices/`. Missing facts are marked `[STUB]` and asked about in the issue, not invented.
- [ ] Every roll has three written outcomes (clean, cost, fail), and failure moves the story on.
- [ ] No reproduced tabletop rulebook text or trademarked setting terms. Numbers that are placeholders are not presented as canon.
- [ ] Ink traps: no `|` or `{ }` in prose, no line starting with `*`, `+`, `-` or `=` by accident, tags at line end.

## 5. Game rules

- [ ] Changes to rolls, odds, Edge, Pursuit, upkeep or arrears are intended by the issue and listed in the Odds panel, so the cost is said before it is paid.
- [ ] Targets and grades stay: 2d6 + skill + characteristic vs target 8; clean at target+2, cost at target..target+1, fail below.

## 6. Verdict

Post one comment:

```
Verdict: approve | approve with nits | changes requested | needs owner
Acceptance: <each box: met / not met, with file:line>
Problems: <numbered, most serious first, each with file:line and a concrete fix>
Canon/tone: <anything borderline; quote the line>
Escalated to Opus: <yes/no, and why>
```

Use "needs owner" for a design question the issue does not answer.

## When to consult Opus

Ask an Opus subagent for a second opinion, giving it the diff and the one question, when any of these is true:

- The PR touches core files: engine rules, bridge, save format, schema, `.github`, `package.json`, `vite.config.ts`.
- A content PR changes how a scene ends, adds a keystone, or shows anything about Ariadne, the Section, the Lanterns or the past.
- The PR changes a rule of the game rather than just using one.
- The PR is over about 250 changed lines or crosses more than one subsystem.
- The reviewer cannot tell whether an acceptance box is met, or finds something it is not confident is real.

**Every core-zone PR gets an Opus review before the owner merges**, whatever the first reviewer thinks. If the two reviews disagree, post both and mark the verdict "needs owner".

## Tuning

The owner reads the first five reviews. If the reviewer misses real problems, widen the Opus triggers (all of core, then anything over 150 lines).
