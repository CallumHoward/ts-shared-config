import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { nitro } from "nitro/vite";

import type { ViteAddon } from "@callumhoward/config-base/vite";

/**
 * TanStack Start dev/build plugins (devtools, nitro, start). Skipped under
 * vitest (`mode === "test"`), matching the starter. Ordered after tailwind and
 * before the react plugins.
 */
export const tanstackVite: ViteAddon = {
  order: 5,
  plugins: (env) => (env.mode === "test" ? [] : [devtools(), nitro(), tanstackStart()]),
};

/**
 * TanStack Router file-based routing for vite, for apps not on Start (Start
 * bundles its own router plugin). The router plugin must run before the JSX
 * transform, so this sorts ahead of config-react's add-on.
 */
export function tanstackRouterVite(
  options: Parameters<typeof tanstackRouter>[0] = {},
): ViteAddon {
  return {
    order: 0,
    plugins: () => [tanstackRouter({ target: "react", ...options })],
  };
}

export default tanstackVite;
