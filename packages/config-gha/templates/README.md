# config-gha templates

| Template | Copy to |
| --- | --- |
| `workflows/ci.yml` | `.github/workflows/ci.yml` |
| `workflows/update-pnpm.yml` | `.github/workflows/update-pnpm.yml` |

`ci.yml` is a **thin caller** for the shared reusable workflow
(`callumhoward/ts-shared-config/.github/workflows/ci-reusable.yml`), so CI logic
updates flow by bumping the `@ref` — you don't re-copy it. Pin to a release tag
(`@v1`) for stability or track `@main`. Toggle tiers via inputs:

| Input | Default | Use |
| --- | --- | --- |
| `run-css` | `true` | `pnpm lint:css` (stylelint / Tailwind) |
| `run-build` | `false` | `pnpm build` (app tiers — react / tanstack) |
| `run-e2e` | `false` | install Chromium + `pnpm test:e2e` (config-playwright) |
| `check-pnpm-policy` | `true` | validate `pnpm-workspace.yaml` against config-base's supply-chain schema |
| `diff-coverage-threshold` | `80` | min % coverage on changed lines |

The reusable workflow expects these package.json scripts (config-base's
defaults): `check`, `lint:ci`, `lint:css`, `format:check`, `fallow`, `test:cov`,
and — per tier — `build` and `test:e2e`. `update-pnpm.yml` is a standalone
scheduled workflow (copy-once).
