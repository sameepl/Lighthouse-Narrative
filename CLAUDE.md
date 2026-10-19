@AGENTS.md

## Claude Code specifics

- The git proxy in cloud sessions rejects tag pushes; use branches (`archive/prototypes-v0` holds the old three-stack prototypes).
- GitHub GraphQL is blocked in cloud sessions: use `gh api` REST endpoints for issues, labels and pull requests.
- Pages deploys from `main` through `.github/workflows/pages.yml`; the Pages source must be "GitHub Actions".
