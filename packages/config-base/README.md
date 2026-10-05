# @wcmj/config-base

Vanilla-TS base of [ts-shared-config](https://github.com/CallumHoward/ts-shared-config):
oxlint, oxfmt, stylelint, a shared `tsconfig`, vite/vitest (node env),
live-inherited `lefthook` + `fallow`, a `pnpm-workspace` policy schema, and
copy-once editor templates.

```sh
pnpm add -D @wcmj/config-base oxlint oxlint-tsgolint oxfmt stylelint vitest vite typescript lefthook fallow
```

```ts
// oxlint.config.ts
import { defineOxlint } from "@wcmj/config-base/oxlint";
export default defineOxlint();
```

Composers: `defineOxlint` / `defineOxfmt` / `defineStylelint` / `defineViteConfig`
(each accepts add-on contributions; React projects import the oxlint and vite
composers from `config-react`, which layers its add-on first). Add-on authors
get `bundledPlugins(import.meta.url)` (jsPlugins resolved to absolute paths)
and `@wcmj/config-base/rules-from-config`, which subscribes to an
upstream plugin's recommended set and routes each rule to oxlint's native
implementation or the bundled jsPlugin. `tsconfig` via
`{ "extends": "@wcmj/config-base/tsconfig" }`. Inherit `lefthook` and
`fallow` live:

```yaml
# lefthook.yml
extends: [node_modules/@wcmj/config-base/lefthook.yml]
```
```jsonc
// .fallowrc.json
{ "extends": ["./node_modules/@wcmj/config-base/fallow.json"] }
```

`schema/pnpm-workspace.json` asserts the supply-chain baseline
(`minimumReleaseAge`, `trustPolicy`) — validate your `pnpm-workspace.yaml` in CI
with `check-jsonschema`. Copy-once editor files (`.editorconfig`, `.vscode/*`,
`.nvmrc`, plus a `pnpm-workspace.yaml` starting point) live in
[`templates/`](./templates). See the
[root README](https://github.com/CallumHoward/ts-shared-config) for full usage.

Lint runs as `oxlint --type-aware`, which shells out to `oxlint-tsgolint`
(install it beside `oxlint`).

## What the presets enforce

- **oxlint**: typescript-eslint's `strict-type-checked` set (native where
  ported, bundled jsPlugin otherwise), unicorn `recommended`, eslint-comments
  hygiene, `import/no-cycle`, kebab-case filenames with co-located tests, JSDoc
  tag rules, and a vitest override for test files.
- **stylelint**: `stylelint-config-standard` plus no `!important`, no unknown
  animations, and no id selectors. Disables must carry a description and be
  needed.
- **vitest**: node env, v8 coverage (lcov + json), fs module cache locally, mocks
  restored after each test. Needs vitest 5.
- **lefthook**: check-only hooks except `oxfmt`, which writes and re-stages.
