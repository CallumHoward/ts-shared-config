# @wcmj/config-base

## 0.1.2

### Patch Changes

- eb655eb: Only turn off typescript-eslint rules the installed plugin has, so older 8.x releases no longer fail oxlint config parsing

## 0.1.1

### Patch Changes

- 68cfae6: Publish through npm trusted publishing so releases carry provenance attestations

## 0.1.0

### Minor Changes

- a80ffd9: Initial release: tiered, TypeScript-first shared config — a vanilla-TS base
  (oxlint, oxfmt, stylelint, tsconfig, vite/vitest, templates) plus composable
  react, tanstack, tailwind, playwright, and gha add-ons.
- 79a9d35: Larger, stricter presets: typescript-eslint
  `strict-type-checked` and unicorn `recommended` via `rulesFromConfig`
  (exported as `config-base/rules-from-config`), eslint-comments rules, a
  stricter `tsconfig` (ES2025, `noUncheckedIndexedAccess`, …), a larger stylelint
  policy (a11y, logical properties, Baseline), check-only lefthook with
  type-aware lint, vitest 5 with module cache and mock hygiene, a React preset
  (`config-react` exports `defineOxlint`/`defineViteConfig`) with compiler-aware
  hook rules and RTL rules, TanStack Query lint rules, and a shared axe config.

  Breaking: requires vitest 5, oxlint 1.79+, oxfmt 0.58+, stylelint 17.14+, and
  `oxlint-tsgolint`; `config-react/oxlint` and `/vite` now export composing
  presets instead of add-on objects; `config-tanstack/oxlint` exports
  `tanstackRouter` and `tanstackQuery`.
