# Per-package test coverage badges, updated in CI

**Date:** 2026-06-05
**Status:** Approved

## Problem

The "Test coverage" section in the root `README.md` shows static shields.io badges
hardcoded to stale numbers. The same stale table is duplicated in
`packages/sdk/README.md`. Nothing in CI updates them. There is no per-package
coverage visibility.

## Goals

1. Every package with tests displays its own coverage badges in its README.
2. Badges are regenerated automatically in CI.
3. The root `README.md` displays only the coverage of `packages/trading`.

## Approach

Use [`istanbul-badges-readme`](https://www.npmjs.com/package/istanbul-badges-readme)
— the tool that produced the current badge format. It reads
`coverage/coverage-summary.json` and rewrites the badge URLs in a README in place.

### Scope: packages getting badges (12)

app-data, bridging, common, composable, contracts-ts, cow-shed, flash-loans,
order-book, order-signing, subgraph, trading, weiroll.

- `common`, `contracts-ts`, `weiroll` currently lack a `test:coverage` script — add it.
- `config`, `providers`, `sdk`, `typescript-config` have no tests — no badges.
- The stale coverage table in `packages/sdk/README.md` is **removed** (sdk has no tests).

### Changes per package

1. **jest config:** add `coverageReporters: ['json-summary', 'lcov', 'text']`
   (jest's default set omits `json-summary`, which the badge tool requires).
2. **package.json scripts:**
   - `test:coverage`: pure `jest --coverage` — **drop the `npx coveralls` pipe**
     (nothing in CI runs it today; Coveralls data is dead).
   - `coverage:badges`: `istanbul-badges-readme` (run after `test:coverage`).
3. **README.md:** add a `## Test coverage` section with the 4-badge table
   (Statements / Branches / Functions / Lines) seeded with placeholder values that
   the tool overwrites.

### Root README

Root `## Test coverage` section keeps the existing 4-badge table but is updated
from `packages/trading/coverage/coverage-summary.json`:

```
istanbul-badges-readme --coverageDir=packages/trading/coverage --readmeDir=.
```

A note under the heading clarifies the numbers are for `@cowprotocol/sdk-trading`
and links to per-package READMEs for the rest.

### Root orchestration

- `istanbul-badges-readme` added as a root devDependency (single version for all packages).
- Root script `coverage:badges`: runs `turbo run coverage:badges` for packages, then the
  trading→root invocation.
- `turbo.json`: `coverage:badges` task depends on `test:coverage`; outputs: the package README.

### CI

Extend `.github/workflows/test.yml`:

- **Existing PR job:** unchanged (`pnpm test`).
- **New job/trigger on push to `main`:**
  1. checkout (with a token allowed to push), install, codegen
  2. `pnpm test:coverage`
  3. `pnpm coverage:badges`
  4. commit & push README changes as `github-actions[bot]` with message
     `chore: update coverage badges [skip ci]` — skipped when nothing changed.
- `COVERALLS_REPO_TOKEN` env and references removed (no longer used).

## Error handling

- A package whose tests fail makes `test:coverage` fail → CI job fails, no badge commit.
- `istanbul-badges-readme` exits non-zero if `coverage-summary.json` is missing —
  surfaces misconfiguration instead of silently keeping stale badges.
- The auto-commit step uses `git diff --quiet` (or equivalent action) to no-op cleanly.

## Testing

- Locally run `pnpm test:coverage && pnpm coverage:badges` and verify all 12 package
  READMEs plus the root README get fresh numbers.
- Verify badge percentages match `coverage-summary.json` totals.
- CI workflow verified on the PR (test job) and after merge (badge-update job).

## Out of scope

- Coverage thresholds / failing CI on coverage drops.
- Coveralls or any external coverage service.
- Adding tests to untested packages.
