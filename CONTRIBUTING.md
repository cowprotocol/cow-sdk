# Contributing

## Pull Request Guidelines

### 📏 **Keep PRs Small and Focused**

- **One feature per PR** - Each PR should focus on a single change or feature
- **Break large features** into multiple smaller PRs for easier review
- **Atomic changes** that can be reviewed and merged independently

### 📝 **Clear Descriptions**

- **Explain the changes** - What does your PR do and why?
- **Provide context** - Why is this change needed?
- **Include examples** - How should reviewers test your changes?
- **Link related issues** - Reference any GitHub issues this PR addresses

### 🧪 **Testing Requirements**

- **New code must be covered** by meaningful unit tests
- **Update tests** when modifying existing functionality
- **Ensure all tests pass** before creating the PR

### 🧹 **Code Quality**

- **Remove dead code** - Delete unused functions, variables, and imports
- **No debugging code** - Remove console.log, debugger statements, and temporary code
- **Professional appearance** - Code should be clean, readable, and production-ready

## Publishing to npm

In this project packages we use `workspace:*` as version for local packages in `package.json` dependencies.

You must not manually publish with `npm` (like npm publish) — it won't rewrite `workspace:*` before publishing.

**→ Always publish with `pnpm publish` (or `changeset publish`, or a release pipeline that uses pnpm).**
