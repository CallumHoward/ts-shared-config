# @callumhoward/config-base

Vanilla-TS base of [ts-shared-config](https://github.com/CallumHoward/ts-shared-config):
oxlint, oxfmt, stylelint, a shared `tsconfig`, vite/vitest (node env), and
copy-once templates (lefthook, pnpm-workspace, `.editorconfig`, `.nvmrc`, fallow,
`.vscode`).

```sh
pnpm add -D @callumhoward/config-base oxlint oxfmt stylelint vitest vite typescript
```

```ts
// oxlint.config.ts
import { defineOxlint } from "@callumhoward/config-base/oxlint";
export default defineOxlint();
```

Each tool has a composer (`defineOxlint`, `defineOxfmt`, `defineStylelint`,
`defineViteConfig`) that accepts add-on contributions. `tsconfig` is consumed via
`{ "extends": "@callumhoward/config-base/tsconfig" }`. Templates live in
[`templates/`](./templates). See the
[root README](https://github.com/CallumHoward/ts-shared-config) for full usage.
