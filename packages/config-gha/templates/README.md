# config-gha templates

GitHub Actions can't be `import`/`extends`-ed, so these ship as copy-once
templates (re-copy to pick up updates).

| Template | Copy to |
| --- | --- |
| `workflows/ci.yml` | `.github/workflows/ci.yml` |
| `workflows/update-pnpm.yml` | `.github/workflows/update-pnpm.yml` |

`ci.yml` is the full pipeline; each step is tagged `[base]` / `[stylelint]` /
`[app]` / `[playwright]`. Delete the steps for add-ons you don't use — a
vanilla-TS consumer keeps the `[base]` (+ `[stylelint]`) steps and drops
`[app]`/`[playwright]`.

It expects these package.json scripts (config-base's defaults): `check`,
`lint:ci`, `lint:css`, `format:check`, `fallow`, `test:cov`, and — for the app
tiers — `build`, plus `test:e2e` for Playwright.
