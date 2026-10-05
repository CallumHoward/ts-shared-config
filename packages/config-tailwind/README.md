# @wcmj/config-tailwind

Tailwind v4 add-on for [ts-shared-config](https://github.com/CallumHoward/ts-shared-config):
the `@tailwindcss/vite` plugin, stylelint allowances for Tailwind at-rules +
string `@import`, and oxfmt Tailwind class sorting.

```sh
pnpm add -D @wcmj/config-base @wcmj/config-tailwind tailwindcss
```

```ts
// vite.config.ts
import { defineViteConfig } from "@wcmj/config-base/vite";
import tailwind from "@wcmj/config-tailwind/vite";
export default defineViteConfig({ addons: [tailwind] });

// stylelint.config.ts
import { defineStylelint } from "@wcmj/config-base/stylelint";
import tailwind from "@wcmj/config-tailwind/stylelint";
export default defineStylelint(tailwind);

// oxfmt.config.ts
import { defineOxfmt } from "@wcmj/config-base/oxfmt";
import { tailwindOxfmt } from "@wcmj/config-tailwind/oxfmt";
export default defineOxfmt(tailwindOxfmt({ stylesheet: "src/styles.css" }));
```
