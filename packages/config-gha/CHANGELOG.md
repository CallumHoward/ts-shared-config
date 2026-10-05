# @wcmj/config-gha

## 0.3.0

### Minor Changes

- 97121d5: Ban `@/` imports in oxlint so projects using the `#/` subpath alias get a clear lint message.

### Patch Changes

- 82d64e8: Turn off every type-aware typescript-eslint rule that oxlint routes to the jsPlugin, fixing a lint crash on oxlint versions that don't port `no-generated-empty-object-type` natively. `offWhenPresent` is replaced by `offWhenTypeAware`.

## 0.2.0

## 0.1.3

## 0.1.2

## 0.1.1

## 0.1.0

### Minor Changes

- a80ffd9: Initial release: tiered, TypeScript-first shared config — a vanilla-TS base
  (oxlint, oxfmt, stylelint, tsconfig, vite/vitest, templates) plus composable
  react, tanstack, tailwind, playwright, and gha add-ons.
