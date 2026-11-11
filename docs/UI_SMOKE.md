# Chromium UI smoke test

Run `npm ci`, then `npx playwright install chromium` once and `npm run e2e`.
Playwright is pinned; browser installation is explicit, never a postinstall hook.
The command builds production assets, starts a private loopback preview, and closes it afterward.

A fresh browser uses the game's default seed 0. Both runs choose the first roster
card, first story approach, and accept the dice without Edge; only the final
keep/withdraw choice differs. All actions use the real UI. No test hook, injected
save or mocked game rules. External page requests are blocked and fail the test.
The seven-scene run crosses Board, Prepare, rolls, three upkeep summaries and
an ending, then verifies reload and a new run at 390px in both colour themes.

The separate CI `e2e` job is advisory. Do not make it required until a week of
stable runs. It has a three-minute budget and uploads screenshots and traces on
failure. Local diagnostics are in `node_modules/playwright-results/`; open a
trace with `npx playwright show-trace <path-to-trace.zip>`.
`npm run check` and its required CI jobs remain unchanged.
