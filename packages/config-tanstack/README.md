# @callumhoward/config-tanstack

TanStack add-on for [ts-shared-config](https://github.com/CallumHoward/ts-shared-config).
Assumes the react add-on. Adds the router and query lint plugins (recommended
sets, plus a `src/routes/**` override) and the vite plugins: TanStack Start
(devtools, nitro, start) or, for apps not on Start, file-based router
generation.

```sh
pnpm add -D @callumhoward/config-base @callumhoward/config-react @callumhoward/config-tanstack
```

```ts
// oxlint.config.ts
import { defineOxlint } from "@callumhoward/config-react/oxlint";
import { tanstackQuery, tanstackRouter } from "@callumhoward/config-tanstack/oxlint";
export default defineOxlint(tanstackRouter, tanstackQuery);

// vite.config.ts
import { defineViteConfig } from "@callumhoward/config-react/vite";
import tanstackVite from "@callumhoward/config-tanstack/vite";
export default defineViteConfig({ addons: [tanstackVite] });
```

Use `tanstackRouterVite()` (a factory taking the router plugin's options)
instead of `tanstackVite` when not on Start. Drop `tanstackQuery` if the app
doesn't use TanStack Query.

`oxfmt` and the generated route tree: `defineOxfmt(tanstackOxfmt)` ignores
`src/routeTree.gen.ts`. `.vscode` settings for the generated file are in
[`templates/`](./templates).
