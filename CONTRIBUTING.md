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

## Publish a release candidate

Steps:
1. Commit changes into some branch, let's say `rc/sdk-changes-1`
2. Push the branch to origin
3. Decide which package you want to publish, let's say `packages/subgraph`
4. Decide which version will the RC have, let's say `.1.2-rc.0`
5. Run the command in the repo root:
```shell
npx release-please release-pr \
  --path packages/subgraph \
  --release-as 0.1.2-rc.0 \
  --target-branch rc/sdk-changes-1 \
  --manifest-file .release-please-manifest.json \
  --config-file .release-please-config.json \
  --repo-url https://github.com/cowprotocol/cow-sdk \
  --token YOUR_GITHUB_TOKEN
```
6. Once the command is successfuly executed, you should see a new open PR in the repo. [Example](https://github.com/cowprotocol/cow-sdk/pull/608)
7. Option 1: You can merge the PR and it will automatically publish a version
8. Option 2: You can checkout the PR branch and publish the version manually:

```shell
pnpm --filter @cowprotocol/sdk-subgraph exec npm publish --tag rc
```
