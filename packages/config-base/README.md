# @callumhoward/config-base

Vanilla-TS base of [ts-shared-config](https://github.com/CallumHoward/ts-shared-config):
oxlint, oxfmt, stylelint, a shared `tsconfig`, vite/vitest (node env),
live-inherited `lefthook` + `fallow`, a `pnpm-workspace` policy schema, and
copy-once editor templates.

```sh
pnpm add -D @callumhoward/config-base oxlint oxfmt stylelint vitest vite typescript lefthook fallow
```

```ts
// oxlint.config.ts
import { defineOxlint } from "@callumhoward/config-base/oxlint";
export default defineOxlint();
```

Composers: `defineOxlint` / `defineOxfmt` / `defineStylelint` / `defineViteConfig`
(each accepts add-on contributions). `tsconfig` via
`{ "extends": "@callumhoward/config-base/tsconfig" }`. Inherit `lefthook` and
`fallow` live:

```yaml
# lefthook.yml
extends: [node_modules/@callumhoward/config-base/lefthook.yml]
```
```jsonc
// .fallowrc.json
{ "extends": ["./node_modules/@callumhoward/config-base/fallow.json"] }
```

`schema/pnpm-workspace.json` asserts the supply-chain baseline
(`minimumReleaseAge`, `trustPolicy`) — validate your `pnpm-workspace.yaml` in CI
with `check-jsonschema`. Copy-once editor files (`.editorconfig`, `.vscode/*`,
`.nvmrc`, plus a `pnpm-workspace.yaml` starting point) live in
[`templates/`](./templates). See the
[root README](https://github.com/CallumHoward/ts-shared-config) for full usage.
