import { fileURLToPath } from "node:url";

import {
  defineViteConfig as defineBaseViteConfig,
  type ViteAddon,
} from "@wcmj/config-base/vite";
import viteReact from "@vitejs/plugin-react";
import type { PluginOption } from "vite";

export interface ReactViteOptions {
  /** Enable the React Compiler by default. Set false to opt out. */
  reactCompiler?: boolean;
  /** Further add-ons (config-tanstack's router, a consumer's own) layered in. */
  addons?: ViteAddon[];
}

/**
 * The vitest slice a React test environment needs: jsdom plus the bundled setup
 * (jest-dom matchers, vitest-axe, and the afterEach that cleans React Testing
 * Library up — RTL only self-registers that under `globals: true`). Exported
 * for bespoke configs (e.g. vitest projects) that can't compose through
 * defineViteConfig.
 */
export const reactTest = {
  environment: "jsdom",
  setupFiles: [fileURLToPath(new URL("vitest-setup.js", import.meta.url))],
  // Inlined so jest-dom extends the same expect instance the tests assert
  // against, not a separate externalized copy.
  server: { deps: { inline: ["@testing-library/jest-dom"] } },
};

/**
 * The react plugins, React Compiler on by default. Exported for builders that
 * own their vite config rather than composing through the preset.
 */
export function reactPlugins(options: ReactViteOptions = {}): PluginOption[] {
  const { reactCompiler = true } = options;
  return [viteReact({ compiler: reactCompiler })];
}

/**
 * React add-on for vite: the plugins above plus a jsdom vitest environment
 * wired to the bundled vitest-setup (jest-dom matchers + vitest-axe).
 */
function reactVite(options: ReactViteOptions): ViteAddon {
  return {
    order: 10,
    plugins: () => reactPlugins(options),
    test: reactTest,
  };
}

/**
 * React preset for vite/vitest: the base config plus the react add-on above and
 * any `addons` the consumer passes, sorted by their `order`. Per-package tweaks
 * go in the consumer's own config on top of the returned value.
 */
export function defineViteConfig(
  options: ReactViteOptions = {},
): ReturnType<typeof defineBaseViteConfig> {
  return defineBaseViteConfig({
    addons: [reactVite(options), ...(options.addons ?? [])],
  });
}

export default defineViteConfig;
