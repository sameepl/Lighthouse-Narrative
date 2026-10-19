# Working with multiple agents

How people and coding agents (Codex, Claude Code, others; frontier and local models) share this repository.
Decision record: [`decisions/0003-multi-agent-workflow.md`](decisions/0003-multi-agent-workflow.md).

## Principles

1. **Contracts first, then fan out.** Types, schemas and the ink function contract are frozen; a core PR changes them, then everything else builds against them.
2. **Small tasks, explicit files.** One issue is one PR, under about 300 changed lines, with the files listed.
3. **Everything through PRs and CI.** The same checks apply to every agent, whatever it costs.
4. **Spend model cost where mistakes are expensive.** Strong models for contracts and tricky logic; cheap or local models for content and mechanical work, fenced by tests and zones.

## Zones

A PR declares one zone with a label (`zone:core`, `zone:feature`, `zone:content`, `zone:docs`) or a branch prefix (`core/`, `feature/`, `content/`, `docs/`). CI (`zones` job, `scripts/zone-check.mjs`, rules in `.github/zones.json`) fails if a PR touches files outside its zone.

| Zone | May change | Must not change |
|---|---|---|
| **core** | anything | (owner review expected on `CODEOWNERS` paths) |
| **feature** | `src/ui/**`, new files in `src/engine/**`, `tests/**`, scenes, encounter and crew/ship data, task docs | `src/engine/types.ts`, `src/engine/rules.ts`, `src/bridge/**`, `src/story/lib/**`, `src/data` schemas and `rules.json`, build and CI files |
| **content** | `src/story/scenes/**`, `src/data/encounters/**`, `src/data/crew.json`, `src/data/ships.json`, `src/ui/assets/**` | all code, contracts, and ink `lib/` and `main.ink` |
| **docs** | `docs/**` (not `docs/decisions/**`), `README.md` | code |

When a core PR adds a contract file, it also adds it to the `deny` lists in `.github/zones.json`.

## Tiers and routing

| Tier | Typical model | Use for | Safety net |
|---|---|---|---|
| **A** | strongest available (frontier OpenAI or Claude) | contracts, engine and bridge design, tricky logic, anything touching state ownership | owner review on every PR |
| **B** | mid-tier | well-specified features, UI screens, tests, simulation | zones, tests, a review pass by tier A or the owner |
| **C** | cheap or local open-weight | ink scenes, JSON data, mechanical edits, docs | zones, branch-walk test, content checklist |

| Task type | Zone | Tier |
|---|---|---|
| New types, schemas, ink functions, bridge changes | core | A |
| Engine modules against existing contracts (selector, scheduler) | core or feature | B (A if novel) |
| New screens and components | feature | B |
| Scenes, encounters, complication tables, crew and ship data | content | C |
| Simulation and QA tests | feature | B or C |
| Docs, status updates | docs | C |

Escalation rule: if a tier C agent needs a contract or core file, it stops and comments on the issue; the task is re-scoped as a `zone:core` task for tier A.

### Codex, OpenAI models and local models

- Codex reads `AGENTS.md` (root and nested; the closest file to the files you edit wins). That is why the instructions live there and why `src/*/AGENTS.md` are short.
- Point Codex at the model for the tier. For local or open-weight models, use Codex's model-provider configuration; check the current Codex documentation for the exact settings, because they change.
- Local models usually have smaller context and weaker tool use. Help them: list the exact files, name one file to copy, keep tasks to 1 to 3 files, paste the acceptance criteria into the prompt, and let `npm run check` be the judge.
- Tell any agent to stop and report after three failed attempts at the same error, with the exact output.
- No agent needs network access at runtime. Dependencies come from `npm ci`.

## Task lifecycle

1. **Issue.** Open an "Agent task" issue (template in `.github/ISSUE_TEMPLATE`). Add the labels `task`, `zone:*`, `tier:*`. The cards in [`tasks/`](tasks/) are ready to paste.
2. **Branch.** `<zone>/<topic>` from the latest `main`. One agent per branch.
3. **Work.** Follow `AGENTS.md`. Run `npm run check` before pushing.
4. **PR.** Fill the PR template, label it `zone:*`, link the issue (`Closes #N`).
5. **CI.** `check` (format, typecheck, tests, build) and `zones` must pass.
6. **Review.** See the ladder below.
7. **Merge.** Squash merge, delete the branch. The Pages deploy runs from `main`.

## Review ladder

| PR | Reviewer |
|---|---|
| core | owner, or a tier A agent plus owner |
| feature | tier A or B agent using the `code-review` skill, or the owner |
| content | CI plus a read-through by the owner for voice and the Marcus rule |
| docs | owner skims |

## Writing a good task

- Goal in one or two sentences, with a link to the design doc section.
- Files you may change (exact paths) and files you must not.
- A file to copy the pattern from.
- Acceptance criteria as a checklist, including the tests to add.
- Commands to verify (`npm run check`).
- Dependencies (which tasks must merge first).

## Prompts to paste into an agent

**Any tier**

```
Read AGENTS.md and the nested AGENTS.md for the folders you will edit. Work on GitHub issue #N (task below).
Branch: <zone>/<topic>. Stay inside the zone. Make the smallest change that meets the acceptance criteria.
Run `npm run check` and fix failures. If you need a file outside your zone, stop and say which and why.
After three failed attempts at the same error, stop and report the exact output. Open a PR, label it zone:<zone>.

<paste the issue>
```

**Content agent (tier C) addition**

```
Copy the structure of src/story/scenes/written_clause.ink. Write all three outcomes for every roll.
Never write speech, thoughts or actions for Marcus. Narrate the world and NPCs. Verify with `npm test`.
```

**Reviewer agent**

```
Review this PR against AGENTS.md and the issue's acceptance criteria. Check: stays in zone, no contract
changes, tests cover new behaviour, the Marcus rule, no invented fields, no reformatting noise.
List problems by severity. Do not rewrite the PR.
```

## Avoiding conflicts

- One file per scene, per encounter, per keystone. Never add to a shared list by editing a shared file.
- Scenes are included automatically; do not edit `main.ink`.
- Rebase on `main` before opening the PR. If a PR conflicts in a core file, the author re-does it on the new `main`; do not hand-merge contracts.
- Contract change protocol: a `zone:core` PR changes the contract and updates dependent code and tests; downstream tasks start after it merges.

## Owner setup checklist (GitHub settings, once)

- [ ] **Settings, Branches, add rule for `main`:** require a pull request; require status checks `check` and `zones`; block force pushes; require branches to be up to date.
- [ ] **Settings, General:** allow squash merging only; automatically delete head branches.
- [ ] **Settings, Pages:** source "GitHub Actions" (already set).
- [ ] **Code owners:** only turn on "Require review from Code Owners" if PRs are opened by an account other than yours. If agents push as you, GitHub will not let you approve your own PR; rely on the required checks and your own merge decision instead.
- [ ] **Codex:** connect it to this repository and confirm it picks up `AGENTS.md`; set the model per tier.
- [ ] Labels exist (`zone:*`, `tier:*`, `task`, `blocked`); the repo already has them.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `zones` fails: "No zone declared" | Add one `zone:*` label to the PR (or rename the branch `<zone>/...`) |
| `zones` fails: files outside the zone | Split the PR, or ask the owner to relabel it `zone:core` if the change is truly core |
| `check` fails on format | `npm run format`, commit only the files you changed |
| Story test fails after a scene edit | Read the failing branch path in the test output; fix the divert or missing outcome |
| An agent edited `package-lock.json` | Revert it unless the task is core and adds a dependency |
