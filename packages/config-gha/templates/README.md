# config-gha templates

| Template | Copy to |
| --- | --- |
| `workflows/ci.yml` | `.github/workflows/ci.yml` |
| `workflows/update-pnpm.yml` | `.github/workflows/update-pnpm.yml` |

`ci.yml` is a **thin caller** for the shared reusable workflow
(`callumhoward/ts-shared-config/.github/workflows/ci-reusable.yml`), so CI logic
you don't re-copy CI logic. The template pins the commit a release tag points at,
with a `# v1` comment that Dependabot or Renovate keep current; the `v1` tag itself
is mutable, so don't reference it directly. Use `@main` only to try unreleased
changes. Toggle tiers via inputs:

| Input | Default | Use |
| --- | --- | --- |
| `node-version-file` | `.nvmrc` | file the Node version is read from |
| `run-css` | `true` | `pnpm lint:css` (stylelint / Tailwind) |
| `run-build` | `false` | `pnpm build` (app tiers — react / tanstack) |
| `run-e2e` | `false` | install Chromium + `pnpm test:e2e` (config-playwright) |
| `check-peers` | `false` | `pnpm peers check` (pnpm 11+) so unmet peers fail CI |
| `check-dedupe` | `false` | `pnpm dedupe --check` so avoidable duplicate resolutions fail CI |
| `check-pnpm-policy` | `true` | validate `pnpm-workspace.yaml` against config-base's supply-chain schema |
| `diff-coverage-threshold` | `80` | min % coverage on changed lines |

The reusable workflow expects these package.json scripts (config-base's
defaults): `check`, `lint:ci`, `lint:css`, `format:check`, `fallow`, `test:cov`,
and — per tier — `build` and `test:e2e`. `test:cov` must write
`coverage/lcov.info` at the repo root (config-base's vitest preset emits lcov
with repo-relative paths), which the diff-coverage step reads. `update-pnpm.yml`
is a standalone scheduled workflow (copy-once); see its header for the GitHub App it needs.
