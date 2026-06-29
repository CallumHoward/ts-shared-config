# @callumhoward/config-tailwind

Tailwind v4 add-on for [ts-shared-config](https://github.com/CallumHoward/ts-shared-config):
the `@tailwindcss/vite` plugin, stylelint allowances for Tailwind at-rules +
string `@import`, and oxfmt Tailwind class sorting.

```sh
pnpm add -D @callumhoward/config-base @callumhoward/config-tailwind tailwindcss
```

```ts
// vite.config.ts
import { defineViteConfig } from "@callumhoward/config-base/vite";
import tailwind from "@callumhoward/config-tailwind/vite";
export default defineViteConfig({ addons: [tailwind] });

// stylelint.config.ts
import { defineStylelint } from "@callumhoward/config-base/stylelint";
import tailwind from "@callumhoward/config-tailwind/stylelint";
export default defineStylelint(tailwind);

// oxfmt.config.ts
import { defineOxfmt } from "@callumhoward/config-base/oxfmt";
import { tailwindOxfmt } from "@callumhoward/config-tailwind/oxfmt";
export default defineOxfmt(tailwindOxfmt({ stylesheet: "src/styles.css" }));
```
