---
"@wcmj/config-base": minor
"@wcmj/config-react": minor
---

Make peer dependencies match what the presets use: `@vitest/coverage-v8` (the base config sets the v8 provider) and `@testing-library/dom` (required by React Testing Library) are now peers, `oxlint-tsgolint` needs `^7.0.2003` as oxlint requires, and `typescript` is capped below 6.1 to match typescript-eslint
