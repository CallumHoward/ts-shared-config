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
| **`@callumhoward/config-base`** | oxlint, oxfmt, stylelint, `tsconfig`, vite/vitest (node), + copy-once templates (lefthook, pnpm-workspace, `.editorconfig`, `.nvmrc`, fallow, `.vscode`) |
| `@callumhoward/config-react` | oxlint (react + hooks + a11y + RTL), vite (React plugins **+ React Compiler**), jsdom vitest + setup, `tsconfig` layer |
| `@callumhoward/config-tanstack` | oxlint router rules + `src/routes` override, TanStack Start vite plugins (assumes react) |
| `@callumhoward/config-tailwind` | `@tailwindcss/vite`, stylelint at-rules, oxfmt class sorting |
| `@callumhoward/config-playwright` | `definePlaywright` config + e2e oxlint override |
| `@callumhoward/config-gha` | copy-once CI + scheduled pnpm-update workflow templates |

## Base usage

```sh
pnpm add -D @callumhoward/config-base oxlint oxfmt stylelint vitest vite typescript
```

```ts
// oxlint.config.ts
import { defineOxlint } from "@callumhoward/config-base/oxlint";
export default defineOxlint();

// oxfmt.config.ts
import { defineOxfmt } from "@callumhoward/config-base/oxfmt";
export default defineOxfmt();

// stylelint.config.ts
import { defineStylelint } from "@callumhoward/config-base/stylelint";
export default defineStylelint();

// vite.config.ts
import { defineViteConfig } from "@callumhoward/config-base/vite";
export default defineViteConfig();
```

```jsonc
// tsconfig.json
{ "extends": "@callumhoward/config-base/tsconfig" }
```

## Adding an add-on

Add-ons are extra arguments to the same composers — e.g. base + react + tailwind:

```ts
// oxlint.config.ts
import { defineOxlint } from "@callumhoward/config-base/oxlint";
import react from "@callumhoward/config-react/oxlint";
export default defineOxlint(react);

// vite.config.ts
import { defineViteConfig } from "@callumhoward/config-base/vite";
import react from "@callumhoward/config-react/vite";
import tailwind from "@callumhoward/config-tailwind/vite";
export default defineViteConfig({ addons: [tailwind, react] });
```

```jsonc
// tsconfig.json — extends takes an array
{ "extends": ["@callumhoward/config-base/tsconfig", "@callumhoward/config-react/tsconfig"] }
```

React Compiler is on by default; opt out with `reactVite({ reactCompiler: false })`.

See [`examples/`](./examples) for working consumers of each tier (`vanilla`,
`react`, `tanstack`, `playwright`).

## Copy-once templates

Files that pnpm, lefthook, editors, and CI read but cannot `import`/`extends`
(no sync CLI yet) ship under each package's `templates/`. Copy them into your
repo once, re-copy to pick up updates. See `templates/README.md` in
[`config-base`](./packages/config-base/templates) and
[`config-gha`](./packages/config-gha/templates).

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
