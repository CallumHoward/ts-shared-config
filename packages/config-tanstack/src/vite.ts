import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
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

export default tanstackVite;
