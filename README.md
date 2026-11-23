# PARADOX LAB

A research prototype for reproducible evaluation of large-language-model answers to formal Boolean constraint puzzles.

## Current milestone: V1.0 provider integration

### Core modules
- `engine-v06.js`: Boolean oracle, SAT/UNSAT response validation and conflict-core minimization.
- `engine-v07.js`: truth-table-verified equivalent rewrites and failure-case reduction.
- `engine-v08.js`: model fingerprints, repeated-failure detection and cross-model transfer summaries.
- `engine-v09.js`: budgeted research orchestration, fresh verification and JSON evidence reports.
- `adapters/openai-compatible.cjs`: server-side OpenAI-compatible Chat Completions adapter.
- `scripts/run-model-evaluation.cjs`: local runner that writes JSON reports.

### Configure and run
Set `PARADOX_API_BASE_URL`, `PARADOX_API_KEY`, and `PARADOX_MODEL` in the local environment. See `config/.env.example` for the variable names. Then run with Node.js 18+:

```sh
node scripts/run-model-evaluation.cjs
```

The adapter contract is `async (prompt, context) => parsedObjectOrJsonString`. A model must return either `{status:"SAT", assignment:{X0:0,...}}` or `{status:"UNSAT", core:[0,...]}`.

### Security
Keep API keys in environment variables or a secret manager. Do not commit real credentials or expose the adapter to an untrusted browser. The repository contains no real API keys. The adapter targets OpenAI-compatible Chat Completions endpoints; provider-specific endpoints or authentication may need adjustments.

### Tests
The adapter tests use mocked HTTP responses and do not make network calls. The core evaluation tests use mock model adapters. Run the test files with Node.js:

```sh
node tests/v08.test.cjs
node tests/v09.test.cjs
node tests/v10-adapter.test.cjs
```

### Evidence limits
No live model benchmark is claimed until an operator configures a real provider and runs the evaluation. A stable failure applies only to the tested model version, prompt and decoding configuration. A minimized case is 1-minimal under implemented operators, not globally minimum. Structured Boolean correctness does not establish broad reasoning ability.
