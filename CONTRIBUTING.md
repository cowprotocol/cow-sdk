# Contributing

## Publishing to npm

In this project packages we use `workspace:*` as version for local packages in `package.json` dependencies.

You must not manually publish with `npm` (like npm publish) — it won’t rewrite `workspace:*` before publishing.

**→ Always publish with `pnpm publish` (or `changeset publish`, or a release pipeline that uses pnpm).**
