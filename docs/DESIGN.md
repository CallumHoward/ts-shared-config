# `@callumhoward/config-*` — Design

A tiered, publishable set of shared configs extracted from
[`tanstack-react-ts-starter`](https://github.com/CallumHoward/tanstack-react-ts-starter).
A `base` tier targets a vanilla-TS project; opinionated **add-ons** layer on the
tooling for React, TanStack, Tailwind, Playwright, and GitHub Actions.

## Principles (carried over from the starter)

- **TS-authored config wherever the tool allows it.** Only `lefthook.yml`,
  `pnpm-workspace.yaml`, and GHA workflows stay YAML (schema checks for those
  are a later, separate effort).
- **Opinionated and very modern**, LLM-legible: oxlint + oxfmt + `tsgo` +
  fallow, React 19 + Compiler, TanStack Start, Vite 8, pnpm 11.
- **Strict gates**: `correctness: error`, `no-floating-promises`, 80% diff
  coverage, kebab filenames, co-located tests.
- **Security-minded**: `minimumReleaseAge`, `trustPolicy: no-downgrade`.
- Swapping oxlint/oxfmt for eslint/prettier is explicitly **out of scope** for
  now (possible future toggle).

## Locked decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Package layout | **Monorepo** of per-tier packages, each with per-tool subpath exports |
| 2 | Sharing the non-importable files (`pnpm-workspace.yaml`, `lefthook.yml`, GHA) | **Static templates the consumer copies once** — no `extends`/reusable-workflow indirection and no sync CLI for now; consumers re-copy on upgrade (a CLI remains the future option if drift bites) |
| 3 | DOM/browser testing line | **Node** vitest env in base; `jsdom` + testing-library + jest-dom + vitest-axe live in the **React** add-on |
| 4 | Term for non-base pieces | **add-on** |
| 5 | Scope / naming | `@callumhoward/config-*` |
| 6 | Dependency ownership | **Hybrid**: consumer-invoked CLIs are `peerDependencies`; imported plugins/presets ship as `dependencies` of the add-on packages |

### Defaults (correct in review if wrong)

- `tanstack` add-on = the full TanStack **Start** stack (router + start + nitro +
  devtools), structured so a `router-only` split is easy later.
- The non-importable static files (`pnpm-workspace.yaml`, `lefthook.yml`, GHA
  workflows, plus `.editorconfig`, `.vscode/`, `.nvmrc`) ship as **copy-once
  templates** — no reusable workflows or `extends` linkage, no sync CLI for now
  (a future CLI is the upgrade path if drift becomes a pain).
- JSDoc handling (req. 9.1): there is **no prettier** in the stack. JSDoc *tag*
  correctness is enforced by oxlint's `jsdoc` plugin (in base). We are **not**
  adding `prettier-plugin-jsdoc` unless explicitly requested.

## Packages

```
packages/
  config-base/        @callumhoward/config-base
  config-react/       @callumhoward/config-react
  config-tanstack/    @callumhoward/config-tanstack
  config-tailwind/    @callumhoward/config-tailwind
  config-playwright/  @callumhoward/config-playwright
  config-gha/         @callumhoward/config-gha
```

| Package | Subpath exports | Bundled (`dependencies`) | Consumer-installed (`peerDependencies`) |
|---|---|---|---|
| `config-base` | `/oxlint` `/oxfmt` `/stylelint` `/tsconfig` `/vite` `/vitest` `/lefthook.yml` `/fallow` + `define*` helpers | check-file, stylelint-config-standard | oxlint, oxfmt, stylelint, vitest, lefthook, fallow, typescript |
| `config-react` | `/oxlint` `/vite` `/tsconfig` `/vitest` `/vitest-setup` | eslint-plugin-react-hooks, eslint-plugin-react-you-might-not-need-an-effect, eslint-plugin-testing-library, @vitejs/plugin-react, @rollup/plugin-babel, @babel/core, babel-plugin-react-compiler, @testing-library/jest-dom, vitest-axe, jsdom | react, react-dom, @types/react, @types/react-dom, @testing-library/react, @testing-library/user-event |
| `config-tanstack` | `/oxlint` `/vite` | @tanstack/eslint-plugin-router, @tanstack/devtools-vite | @tanstack/react-router, @tanstack/react-start, @tanstack/router-plugin, nitro |
| `config-tailwind` | `/vite` `/stylelint` | @tailwindcss/vite | tailwindcss |
| `config-playwright` | `/playwright` `/oxlint` | eslint-plugin-playwright | @playwright/test |
| `config-gha` | template workflows to copy (`ci.yml`, `update-pnpm.yml`) | — | — |

> Exact dep/peer classification is finalized per-file during implementation
> (rule of thumb: if a *shipped config/setup file imports it*, it's a `dependency`;
> if the *consumer's own code/scripts invoke it*, it's a `peerDependency`).

## Composition (per tool, native where possible)

```jsonc
// tsconfig.json — native extends array; order = precedence
{
  "extends": ["@callumhoward/config-base/tsconfig", "@callumhoward/config-react/tsconfig"],
  "include": ["**/*.ts", "**/*.tsx"],
  "compilerOptions": { "paths": { "#/*": ["./src/*"] } }
}
```

```ts
// oxlint.config.ts — base helper deep-merges add-on contributions; base is implicit
import { defineOxlint } from "@callumhoward/config-base/oxlint";
import react from "@callumhoward/config-react/oxlint";
import tanstack from "@callumhoward/config-tanstack/oxlint";
import playwright from "@callumhoward/config-playwright/oxlint";
export default defineOxlint(react, tanstack, playwright);
```

```ts
// vite.config.ts — helper enforces canonical plugin order regardless of arg order;
// React Compiler is on by default when the react add-on is present.
import { defineViteConfig } from "@callumhoward/config-base/vite";
import react from "@callumhoward/config-react/vite";
import tanstack from "@callumhoward/config-tanstack/vite";
import tailwind from "@callumhoward/config-tailwind/vite";
export default defineViteConfig({ addons: [react, tanstack, tailwind] });
```

`lefthook.yml`, `pnpm-workspace.yaml`, and `.github/workflows/*.yml` are **not**
linked at runtime — they are copied once from the package templates into the
consumer repo (re-copy to pick up upstream changes):

```sh
cp node_modules/@callumhoward/config-base/templates/lefthook.yml .
cp node_modules/@callumhoward/config-base/templates/pnpm-workspace.yaml .
cp node_modules/@callumhoward/config-gha/templates/ci.yml .github/workflows/
```

**Merge semantics for the JS `define*` helpers:** `plugins`/`jsPlugins`
concatenate + dedupe; `rules` shallow-merge (later add-on wins); `overrides`
concatenate (oxlint applies all matching overrides in order); `ignorePatterns`
concatenate.

## Tier breakdown (from the starter's actual configs)

### base — vanilla-TS
- **oxlint**: plugins `typescript`/`unicorn`/`oxc`/`import`/`promise`/`jsdoc`/`vitest`;
  jsPlugins `check-file`. `correctness: error`. Rules: TS-safety
  (`no-floating-promises`, `no-misused-promises`, `await-thenable`,
  `switch-exhaustiveness-check`, `no-unnecessary-condition`), `import/no-cycle`,
  `unicorn/filename-case` (kebab), `unicorn/no-null: off`, JSDoc tag rules,
  `check-file` blocklist (no `.js/.jsx/.mjs/.cjs`, no `__tests__` dirs) + naming
  (co-located tests, `*.config`/`*.d`), `no-restricted-imports` (`#/` alias
  convention). Test-file override: `vitest/*` rules.
- **oxfmt**, **stylelint** (+ `stylelint-config-standard`), **fallow**.
- **tsconfig**: `target ES2022`, `module ESNext`, `lib [ES2022]`, bundler
  resolution, `allowImportingTsExtensions`, `verbatimModuleSyntax`, `noEmit`,
  `skipLibCheck`, `strict`, `noUnusedLocals/Parameters`,
  `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`. (No DOM/JSX —
  those are in the React add-on.)
- **vite/vitest**: composable vite config whose `test` block uses **`node`** env,
  v8 coverage (text + lcov, `all`, `include: src/**`), GH-actions reporter under
  CI, `restoreMocks`. No `setupFiles`, no jsdom.
- **lefthook** pre-commit (parallel): oxlint `--fix`, stylelint `--fix` (css),
  oxfmt, `pnpm check` (`tsc`, TS7/Go), `pnpm fallow`.
- **pnpm-workspace** baseline snippet: `minimumReleaseAge: 10080`,
  `trustPolicy: no-downgrade` (+ `trustPolicyExclude`). `.nvmrc` Node pin.
- **`.editorconfig`** whose values mirror oxfmt (indent, line endings, final
  newline, etc.), finalized against `oxfmt.config.ts` so editors and oxfmt never
  contradict each other.
- **`.vscode/`** recommended `settings.json` (format-on-save with oxfmt as the
  default formatter) + `extensions.json` (oxc, stylelint). Editor-AI/LLM config
  deferred.
- **Type-check**: `tsc --noEmit` on **TypeScript 7** (Go). The starter's
  experimental `tsgo` / `@typescript/native-preview` is dropped — TS7 RC makes
  the Go compiler the standard `tsc`.

### react add-on
- **oxlint**: + `react`, `jsx-a11y` plugins; + `react-hooks` (`react-hooks-js`),
  `no-effect` jsPlugins; rules `react/only-export-components` (warn),
  `react/no-array-index-key`, full `react-hooks-js/*` + `no-effect/*` sets;
  test-file override + `testing-library/*` rules.
- **vite**: `viteReact()` + `babel({ presets: [reactCompilerPreset()] })` →
  **React Compiler on by default** (opt-out flag); `test` env → `jsdom`,
  `setupFiles: ["@callumhoward/config-react/vitest-setup"]`.
- **tsconfig**: `jsx: react-jsx`, `lib [ES2022, DOM, DOM.Iterable]`,
  `types ["vite/client"]`.
- ships **`vitest-setup`** (jest-dom matchers + vitest-axe).

### tanstack add-on (assumes react)
- **oxlint**: + `@tanstack/eslint-plugin-router` (`router`); `ignorePatterns` +
  `src/routeTree.gen.ts`; `src/routes/**` override
  (`router/create-route-property-order`, `router/route-param-names`; relax
  `react/only-export-components`, `unicorn/filename-case`, `check-file` naming).
- **vite**: `devtools()`, `nitro()`, `tanstackStart()` (dev/SSR plugins, skipped
  in `test` mode).

### tailwind add-on
- **vite**: `@tailwindcss/vite`.
- **stylelint**: Tailwind v4 at-rule allowances (if needed).

### playwright add-on
- **playwright.config.ts** (composable factory).
- **oxlint**: + `eslint-plugin-playwright`; `e2e/**` override (`playwright/*`
  rules) + the `e2e` spec-naming `check-file` rule.

### gha add-on
- Template `ci.yml` (install → `lint:ci` → `lint:css` → `check` → `test:cov` +
  diff-coverage gate) and scheduled `update-pnpm.yml`, copied into the consumer's
  `.github/workflows/`. Add-on-specific steps (e.g. Playwright → install browsers
  + `test:e2e`) are baked into the relevant template variant.

## Repo + release

- pnpm workspace; the repo **dogfoods its own configs** (its setup *is*
  `config-base` + the relevant add-ons).
- **changesets** with fixed/locked versioning (tiers publish together).
- Carry over the scheduled pnpm-update workflow.
- **Authoring & build**: configs are TS source in `packages/*/src`, built with
  `tsc` (TS7) to `dist` (`.js` + `.d.ts`); `exports` point at `dist`. Imports of
  peer tools (oxlint/oxfmt/vite/…) are *preserved, not bundled* — they resolve in
  the consumer at runtime. Bundled plugins are referenced via `require.resolve`.

## Validated: oxlint jsPlugins resolution (spike)

**Result: works.** Plugins bundled as `dependencies` of an add-on package are
loaded by oxlint from the consumer with **no hoisting and no `.npmrc`**, by
resolving each plugin to an absolute path inside the add-on and passing that as
the `jsPlugins` specifier:

```js
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const plugin = (name, spec) => ({ name, specifier: require.resolve(spec) });
// jsPlugins: [plugin("check-file", "eslint-plugin-check-file"), ...]
```

The `examples/` spike confirmed `check-file` (base) plus `react-hooks-js` /
`no-effect` / `testing-library` / `react` (react add-on) all resolve and run
from a consumer that lists only the config packages as deps.

**Caveat:** oxlint follows the pnpm workspace symlinks and will lint into
`node_modules`/package sources unless scoped. Configs keep `node_modules`
ignored and consumers lint `src/**` (or explicit globs), not the whole tree.

## Still to read verbatim during implementation

`oxfmt.config.ts`, `stylelint.config.ts`, `.fallowrc.json`,
`playwright.config.ts`, `.github/workflows/*.yml`, `.vscode/*`, `.nvmrc`,
`vitest-setup.ts`.

## Phased implementation plan

0. **Scaffold**: pnpm workspace, root config, changesets; dogfood lint/format.
1. **config-base**: all base exports + `define*` helpers; dogfood on the repo.
2. **config-react** (incl. `vitest-setup`).
3. **config-tanstack**.
4. **config-tailwind**.
5. **config-playwright**.
6. **config-gha** (template workflows to copy).
7. **Validation + docs**: example consumer(s) proving cross-package composition
   (esp. the oxlint jsPlugins risk); per-package + root READMEs; pnpm-workspace
   snippet; publish dry-run.
