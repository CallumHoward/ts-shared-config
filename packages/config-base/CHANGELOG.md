# @wcmj/config-base

## 0.4.0

### Minor Changes

- 603c1f5: Add `check-peers` and `check-dedupe` inputs to the reusable CI workflow, stop persisting checkout credentials, and bump the pinned actions.

### Patch Changes

- 1901cf2: Make the tailwind fallow preset carry config-react's `ignoreDependencies`, since extending several presets keeps only the last one's list.

## 0.3.0

### Minor Changes

- 97121d5: Ban `@/` imports in oxlint so projects using the `#/` subpath alias get a clear lint message.

### Patch Changes

- 82d64e8: Turn off every type-aware typescript-eslint rule that oxlint routes to the jsPlugin, fixing a lint crash on oxlint versions that don't port `no-generated-empty-object-type` natively. `offWhenPresent` is replaced by `offWhenTypeAware`.

## 0.2.0

### Minor Changes

- 74be1c4: Make peer dependencies match what the presets use: `@vitest/coverage-v8` (the base config sets the v8 provider) and `@testing-library/dom` (required by React Testing Library) are now peers, `oxlint-tsgolint` needs `^7.0.2003` as oxlint requires, and `typescript` is capped below 6.1 to match typescript-eslint
- 6e1c687: Slim the stylelint preset to stylelint-config-standard plus no `!important`, no unknown animations, and no id selectors. Drops the a11y, ordering, nesting, Baseline, logical-property and unknown-custom-property plugins and rules, the nesting-depth, forced-color-adjust and font/grid rules, the `knownCustomProperties` add-on, the `MESSAGES` export, and the postcss `packageExtensions` entries from the pnpm-workspace template.

### Patch Changes

- facfad3: Remove settings and claims inherited from a private project: the `^@/` import ban, the `assertNoFailures` assertion option, `storybook-static` ignores, the `json` coverage reporter and stories coverage exclude, and Tailwind's `@screen`/`@responsive` stylelint allowances. Comments and docs now describe only what this repo does.
- 12085d0: Drop `noPropertyAccessFromIndexSignature` from the base tsconfig so index-signature properties (e.g. `process.env.CI`) can be read with dot notation
- 38417a5: Drop `exactOptionalPropertyTypes` from the base tsconfig so an optional property accepts an explicit `undefined`

## 0.1.3

### Patch Changes

- 6855583: Turn off unicorn's prevent-abbreviations rule; it flagged idiomatic names like `ServerFn`
- 566c3d1: Widen peer ranges to the releases the presets work with: oxfmt 0.x up to 1.0, fallow 3, and jest-dom 7

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
