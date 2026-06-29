# @callumhoward/config-tanstack

TanStack Start add-on for [ts-shared-config](https://github.com/CallumHoward/ts-shared-config).
Assumes the react add-on. Adds the router lint plugin + a `src/routes/**`
override, and the TanStack Start vite plugins (devtools, nitro, start).

```sh
pnpm add -D @callumhoward/config-base @callumhoward/config-react @callumhoward/config-tanstack
```

```ts
// oxlint.config.ts
import { defineOxlint } from "@callumhoward/config-base/oxlint";
import react from "@callumhoward/config-react/oxlint";
import tanstack from "@callumhoward/config-tanstack/oxlint";
export default defineOxlint(react, tanstack);

// vite.config.ts
import { defineViteConfig } from "@callumhoward/config-base/vite";
import react from "@callumhoward/config-react/vite";
import tanstack from "@callumhoward/config-tanstack/vite";
export default defineViteConfig({ addons: [tanstack, react] });
```

`oxfmt` and the generated route tree: `defineOxfmt(tanstackOxfmt)` ignores
`src/routeTree.gen.ts`. `.vscode` settings for the generated file are in
[`templates/`](./templates).
