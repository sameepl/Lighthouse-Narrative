# Stub guidance: trial status

No model-qualified guidance is active. Do not load this file as a production writer prompt.
The five-round trial did not produce a gate-clean candidate at any tested level (0–3).
The rows below are retired experiments, not approved rules; see [results](stub-loop-results.md).

| Failure observed | Example from a benchmark output | Tested rule | Model |
|---|---|---|---|
| No short sentence in a passage | “The buyer's tug noses through the gate, and all forty filter crates roll aboard before the window closes.” | Include one standalone 4–8-word sentence and one 13–25-word sentence within each non-ending passage's 3–6 sentences. | Luna: shape improved in round 2; Qwen: inconsistent. Not qualified. |
| A positive effect becomes a charge | “The chart copy costs 500 credits.” with Credits +500 | Show positive Credits as money received or a rebate; describe an expense only for negative Credits. | Luna: benchmark sign errors corrected in round 3; Qwen: inconsistent. Not qualified. |

Held-out tests compared contract-only output with the final guidance/example/plan bundle.
They did not isolate individual rules, so they cannot establish that either rule causes no regressions.
No rule is retained on the strength of that bundled comparison.
Do not add further rules from held-out failures: those briefs are now evaluation-used.
Prepare fresh hold-outs before another tuning cycle. Keep full targets out of all writer contexts.
