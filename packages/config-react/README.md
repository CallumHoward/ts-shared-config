# @callumhoward/config-react

React add-on for [ts-shared-config](https://github.com/CallumHoward/ts-shared-config).
Layers on top of `config-base`: oxlint (react + hooks + jsx-a11y + RTL), vite
(`@vitejs/plugin-react` **+ React Compiler on by default**), a jsdom vitest
environment with a bundled setup (jest-dom + vitest-axe), and a `tsconfig` layer.

```sh
pnpm add -D @callumhoward/config-base @callumhoward/config-react react react-dom jsdom
```

```ts
// oxlint.config.ts
import { defineOxlint } from "@callumhoward/config-base/oxlint";
import react from "@callumhoward/config-react/oxlint";
export default defineOxlint(react);

// vite.config.ts
import { defineViteConfig } from "@callumhoward/config-base/vite";
import react from "@callumhoward/config-react/vite";
export default defineViteConfig({ addons: [react] });
```

```jsonc
// tsconfig.json
{ "extends": ["@callumhoward/config-base/tsconfig", "@callumhoward/config-react/tsconfig"] }
```

Opt out of the React Compiler with `reactVite({ reactCompiler: false })`.
