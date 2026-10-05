# ts-shared-config

Opinionated, modern, **TypeScript-first** shared configuration, published as a
tiered set of packages: a vanilla-TS **base** plus composable **add-ons** you
layer on for the bits a given project actually needs.

Extracted from [tanstack-react-ts-starter](https://github.com/CallumHoward/tanstack-react-ts-starter),
whose principles it follows: as much config in TypeScript as practical;
opinionated and very modern (oxlint + oxfmt + `tsc`/TS7 + fallow, vitest,
React 19 + Compiler, Vite 8, pnpm 11); strict quality gates; supply-chain-aware;
LLM-ready.

## Packages

| Package | Provides |
| --- | --- |
| **`@wcmj/config-base`** | oxlint, oxfmt, stylelint, `tsconfig`, vite/vitest (node); live-inherited `lefthook` + `fallow`; `pnpm-workspace` policy schema; copy-once editor templates (`.editorconfig`, `.vscode`, `.nvmrc`) |
| `@wcmj/config-react` | oxlint (react + hooks + a11y + RTL), vite (React plugins **+ React Compiler**), jsdom vitest + setup, `tsconfig` layer |
| `@wcmj/config-tanstack` | oxlint router rules + `src/routes` override, TanStack Start vite plugins (assumes react) |
| `@wcmj/config-tailwind` | `@tailwindcss/vite`, stylelint at-rules, oxfmt class sorting |
| `@wcmj/config-playwright` | `definePlaywright` config + e2e oxlint override |
| `@wcmj/config-gha` | reusable CI workflow + thin caller template; scheduled pnpm-update template |

## Base usage

```sh
pnpm add -D @wcmj/config-base oxlint oxlint-tsgolint oxfmt stylelint vitest vite typescript lefthook fallow
```

```ts
// oxlint.config.ts
import { defineOxlint } from "@wcmj/config-base/oxlint";
export default defineOxlint();

// oxfmt.config.ts
import { defineOxfmt } from "@wcmj/config-base/oxfmt";
export default defineOxfmt();

// stylelint.config.ts
import { defineStylelint } from "@wcmj/config-base/stylelint";
export default defineStylelint();

// vite.config.ts
import { defineViteConfig } from "@wcmj/config-base/vite";
export default defineViteConfig();
```

```jsonc
// tsconfig.json
{ "extends": "@wcmj/config-base/tsconfig" }
```

## Adding an add-on

React projects import the composers from `config-react`, which layers its own
rules and plugins first; further add-ons are extra arguments — e.g. react +
tailwind:

```ts
// oxlint.config.ts
import { defineOxlint } from "@wcmj/config-react/oxlint";
export default defineOxlint();

// vite.config.ts
import { defineViteConfig } from "@wcmj/config-react/vite";
import tailwind from "@wcmj/config-tailwind/vite";
export default defineViteConfig({ addons: [tailwind] });
```

The React preset needs `@testing-library/jest-dom` and `@testing-library/react`
installed, since its vitest setup imports both.

```jsonc
// tsconfig.json — extends takes an array
{ "extends": ["@wcmj/config-base/tsconfig", "@wcmj/config-react/tsconfig"] }
```

React Compiler is on by default; opt out with `defineViteConfig({ reactCompiler: false })` from `config-react/vite`.

See [`examples/`](./examples) for working consumers of each tier (`vanilla`,
`react`, `tanstack`, `playwright`).

## Inheriting the non-TS config

`lefthook` and `fallow` are inherited **live** via their own `extends` (a path
into `node_modules`), so updates flow with the package version:

```yaml
# lefthook.yml
extends: [node_modules/@wcmj/config-base/lefthook.yml]
```
```jsonc
// .fallowrc.json
{ "extends": ["./node_modules/@wcmj/config-base/fallow.json"] }
```

CI is a **reusable workflow**: your `.github/workflows/ci.yml` calls
`callumhoward/ts-shared-config/.github/workflows/ci-reusable.yml@v1` (see
[`config-gha`](./packages/config-gha)). It includes a CI-only check that your
`pnpm-workspace.yaml` meets the supply-chain policy
(`@wcmj/config-base/schema/pnpm-workspace.json`).

The only true **copy-once** files (no inheritance mechanism) are
`pnpm-workspace.yaml`, `.editorconfig`, `.vscode/*`, and `.nvmrc` — copy them
from [`config-base/templates`](./packages/config-base/templates).

## How it works

Configs are authored in TypeScript and built with `tsc` to `dist` (`.js` +
`.d.ts`); `exports` point at `dist`. Imports of peer tools (oxlint/oxfmt/vite/…)
are preserved, not bundled — they resolve in the consumer. Any package a config
references *by name* (oxlint jsPlugins, stylelint `extends`) is resolved to an
absolute path via `require.resolve`, so it loads from the consumer regardless of
pnpm hoisting. See [`docs/DESIGN.md`](./docs/DESIGN.md).

## Develop

```sh
pnpm install
pnpm build       # build all packages
pnpm validate    # build + lint + lint:css + format:check + check + test across examples
pnpm changeset   # record a version bump (config-* packages are version-locked)
```
