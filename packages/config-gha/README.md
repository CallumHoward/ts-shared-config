# @callumhoward/config-gha

GitHub Actions templates for
[ts-shared-config](https://github.com/CallumHoward/ts-shared-config).

CI logic lives in a **reusable workflow** in this repo
(`.github/workflows/ci-reusable.yml`), so the part you copy stays a thin caller
and updates flow by bumping the `@ref` — no re-copy. The scheduled pnpm-update
workflow is a standalone copy-once template.

| Template | Copy to |
| --- | --- |
| `workflows/ci.yml` | `.github/workflows/ci.yml` (thin caller — toggle tier inputs) |
| `workflows/update-pnpm.yml` | `.github/workflows/update-pnpm.yml` |

The caller toggles `run-css` / `run-build` / `run-e2e` / `check-pnpm-policy`
inputs for the add-ons you use. See [`templates/README.md`](./templates/README.md)
for the input table and the package.json scripts the reusable workflow expects.
