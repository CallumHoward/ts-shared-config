# @callumhoward/config-gha

Copy-once GitHub Actions templates for
[ts-shared-config](https://github.com/CallumHoward/ts-shared-config): a CI
pipeline and a scheduled pnpm-update PR workflow.

GitHub Actions can't be `import`/`extends`-ed, so these ship as templates under
[`templates/workflows/`](./templates/workflows) — copy them into
`.github/workflows/` (re-copy to pick up updates).

`ci.yml` tags each step `[base]` / `[stylelint]` / `[app]` / `[playwright]`;
delete the steps for add-ons you don't use. See
[`templates/README.md`](./templates/README.md).
