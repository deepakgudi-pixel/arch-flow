# Eval Harness

This folder holds the lightweight architecture eval harness for Archflow.

The eval harness is one part of the quality system. It complements the deterministic generation review gate, backend tests, CI audit gates, and Playwright smoke tests described in the main README.

## Why this exists

You should not have to hand-write 25-50 full prompts to test output quality.
Instead, the harness:

- generates prompt specs from a small matrix in `matrix.json`
- optionally pulls real prompt text from `diagram_versions`
- runs the same prompt multiple times
- scores each result with deterministic architecture checks
- measures run-to-run stability
- produces JSON and Markdown artifacts that make model/prompt regressions easier to review

## Quick usage

From `/Users/deepak/Downloads/arch/backend`:

```bash
npm run eval:harness -- --generate-only
```

That only builds the prompt set and writes:

- `evals/generated-prompts.json`
- `evals/latest-report.json`
- `evals/latest-report.md`

To run real evaluations:

```bash
npm run eval:harness
```

Useful flags:

```bash
npm run eval:harness -- --max-prompts 12 --runs 2
npm run eval:harness -- --no-history
npm run eval:harness -- --history-limit 5
npm run eval:harness -- --markdown-output evals/custom-scoreboard.md
```

## What gets scored

The harness currently checks:

- required layers are present
- invalid connection rules are absent
- frontend/mobile do not connect directly to databases
- auth exists when security-sensitive prompts ask for it
- queue/event layers exist for scale-sensitive prompts
- devops/observability exists for large or AI-heavy prompts
- expected layers are connected to the graph

It also computes a stability score by comparing node and edge similarity across repeated runs.

## Related quality checks

For the broader project quality loop, use:

```bash
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run typecheck
npm --prefix frontend run build
npm --prefix backend audit --omit=dev --audit-level=high
npm --prefix frontend audit --omit=dev --audit-level=high
```

GitHub Actions runs the main verification path on Ubuntu and macOS. The eval harness is intentionally separate because real AI evaluation can be slower, cost-bearing, and environment-dependent.

## First practical workflow

1. Tune `matrix.json` until the generated prompts feel representative.
2. Run `npm run eval:harness -- --generate-only` and inspect the prompt set.
3. Run the full harness once your AI env vars are available.
4. Watch `averageScore`, `averageStability`, and the repeated failed checks.
5. Add real prompts from usage over time instead of inventing them manually.
