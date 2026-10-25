# Writer model profiles: issue #66

Exploratory trial on base `e16bd22`; [results and protocol](stub-loop-results.md).
Neither model meets the qualification of three different briefs in succession at >=18/20 with no gates.
No lowest working guidance level was found. No shipping content was regenerated.

| Model | Guidance needed | Rounds / candidates | Qualification pass rate | Approximate output tokens per candidate | Common failures |
|---|---|---|---|---|---|
| `qwen/qwen3.8-27b`, Q4_K_M | Levels 0, 1, 2 and 3 all insufficient | 5 tuning rounds / 7 benchmark candidates; 6 confirmatory candidates | 0/13 | 316–1,212; median 897, native API counts; plans extra | Short passages, sentence shape, repeated openers, player actions, invented named roles, branch-dependent endings, malformed JSON |
| `gpt-6-luna` | Levels 0, 1, 2 and 3 all insufficient | 5 tuning rounds / 7 benchmark candidates; 6 confirmatory candidates | 0/13 | About 907–1,037; median 950, JSON characters / 4; plans extra | Repetition, short-sentence requirement, repeated result objects, positive Credits described as charges, ending consistency |

Qwen used localhost-only LM Studio native `/api/v1/chat`, reasoning off, temperature 0.6,
maximum output 4,000 tokens, loaded context 8,192. No persistent server/model configuration changed.
Two preliminary OpenAI-compatible requests consumed 4,000 reasoning tokens each with no passage output;
their raw responses are preserved as infrastructure failures, excluded from the 13-candidate denominator.
Qwen requests were stateless. Native request/response usage is preserved, including separate plan passes.

Luna was invoked as a Codex subagent with fresh history at round 1, round 4, round 5,
and each held-out treatment batch. Its round 1–3 writer session was reused; feedback was limited
to the frozen prompts, but conversational carryover is a limitation. Three briefs shared each held-out batch.
Luna's figures estimate generated JSON only, not billed agent/tool/reasoning or conversation tokens.
Typical prompt payloads were roughly 2,000–2,500 tokens; level 3 also needs a separate planning pass.
Do not compare these token estimates as a cost or speed benchmark.

Luna followed length bands more reliably in the benchmarks; that does not establish production reliability.
All seven Luna benchmark candidates met the 40–80-word non-ending bands; only two of seven Qwen
benchmark candidates met all ten bands. Gate-clean rate stayed zero for both.
Keep Qwen exploratory and Luna supervised; do not route these archetypes to either for acceptance without review.
For accepted prose now, route to a stronger writer and owner review. Implement #63 before another loop.
Use new held-outs, isolated single-rule ablations and fresh writer sessions before promoting guidance.
