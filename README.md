# PARADOX LAB

A research prototype for reproducible evaluation of large-language-model answers to formal Boolean constraint puzzles.

## Current version: V0.9

### Modules
- `engine-v06.js`: Boolean oracle, SAT/UNSAT response validation and conflict-core minimization.
- `engine-v07.js`: truth-table-verified equivalent rewrites and failure-case reduction.
- `engine-v08.js`: model fingerprints, repeated-failure detection and cross-model transfer summaries.
- `engine-v09.js`: budgeted research orchestration, fresh verification and JSON evidence reports.

### Load in browser or Node
Load scripts in this order: V0.6, V0.7, V0.8, V0.9. The modules expose `ParadoxLab06` through `ParadoxLab09` on the global object.

### Minimal use
```js
const seeds = ParadoxLab09.builtInSeeds();
const result = await ParadoxLab09.investigate(myModelAdapter, {
  modelId: "provider/model-version",
  items: seeds,
  perItemRepeats: 3,
  stableThreshold: 2,
  maxCandidates: 24,
  maxAdapterCalls: 300,
  minimize: true
});
const json = ParadoxLab09.exportReport(result);
```

The adapter contract is `async (prompt, context) => parsedObjectOrJsonString`. It must return either `{status:"SAT", assignment:{X0:0,...}}` or `{status:"UNSAT", core:[0,...]}`.

## Security
Do not put API keys in browser JavaScript or commit them to this repository. Use a local backend or trusted server-side adapter. This repository does not make provider network calls itself.

## Evidence limits
The bundled tests use deterministic mock adapters; no live model benchmark is claimed. A stable failure applies only to the tested model version, prompt and decoding configuration. A minimized case is 1-minimal under implemented operators, not globally minimum. Structured Boolean correctness does not establish broad reasoning ability.

## Roadmap
- Real provider adapters with secret-safe configuration.
- Browser experiment dashboard and export.
- More expressive formal logics and independently reviewed benchmark sets.
- Controlled, budget-matched cross-model studies.
