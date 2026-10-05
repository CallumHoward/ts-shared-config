# @callumhoward/config-react

React add-on for [ts-shared-config](https://github.com/CallumHoward/ts-shared-config).
Layers on top of `config-base`: oxlint (react + hooks + jsx-a11y + RTL), vite
(`@vitejs/plugin-react` **+ React Compiler on by default**), a jsdom vitest
environment with a bundled setup (jest-dom + vitest-axe), and a `tsconfig` layer.

```sh
pnpm add -D @callumhoward/config-base @callumhoward/config-react oxlint oxlint-tsgolint vitest vite typescript react react-dom jsdom @testing-library/jest-dom @testing-library/react
```

```ts
// oxlint.config.ts
import { defineOxlint } from "@callumhoward/config-react/oxlint";
export default defineOxlint();

// vite.config.ts
import { defineViteConfig } from "@callumhoward/config-react/vite";
export default defineViteConfig();
```

```jsonc
// tsconfig.json
{ "extends": ["@callumhoward/config-base/tsconfig", "@callumhoward/config-react/tsconfig"] }
```

Both presets wrap the base ones: `defineOxlint(...addons)` and
`defineViteConfig({ addons })` layer further add-ons (tanstack, tailwind, your
own) in argument order. Opt out of the React Compiler with
`defineViteConfig({ reactCompiler: false })`.

`reactPlugins()` and `reactTest` are exported for builders that own their vite
config (e.g. Storybook, vitest projects), and `axeRules`/`axeChecks` from
`@callumhoward/config-react/axe-config` share the jsdom axe setup with browser
a11y tests.
