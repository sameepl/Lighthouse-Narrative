# 0003. Multi-agent workflow: zones, PRs and CI

Status: accepted

## Context
The owner will use several coding agents (Codex with OpenAI and local open-weight models, Claude Code) at different cost levels, working in one repository.

## Decision
- Everything goes through pull requests; nobody pushes to `main` after the bootstrap.
- Each PR declares a **zone** (`core`, `feature`, `content`, `docs`) by label or branch prefix. CI fails if the PR touches files outside the zone (`.github/zones.json`).
- Work is split by task type and suggested **tier** (A strongest, B mid, C cheap or local). Contracts are frozen and change only in `zone:core` PRs.
- One issue is one PR, under about 300 changed lines, from a task template with an explicit file list and acceptance criteria.
- `AGENTS.md` is the shared instruction file; nested `AGENTS.md` files in `src/` add folder rules. `CLAUDE.md` imports it.

## Consequences
- Cheap and local models can do content and mechanical work safely because the branch-walk test and zone check catch most mistakes.
- Core and contract changes are slower on purpose.
- If agents push as the owner, GitHub will not let the owner approve their own PRs; rely on required status checks instead of required reviews.
