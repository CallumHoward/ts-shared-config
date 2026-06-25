import process from "node:process";

import type { ConfigEnv, PluginOption } from "vite";
import { configDefaults, defineConfig, type ViteUserConfig } from "vitest/config";

type TestConfig = ViteUserConfig["test"];

/** The slice of a vite/vitest config a add-on package contributes. */
export interface ViteAddon {
  /** Plugins this add-on contributes (mode-aware: `test` mode skips dev plugins). */
  plugins?: (env: ConfigEnv) => PluginOption[];
  /** Vitest `test` config this add-on contributes (shallow-merged over the base). */
  test?: TestConfig;
  /** Plugin ordering hint; lower runs earlier (e.g. tailwind before react). Default 0. */
  order?: number;
}

export interface ViteOptions {
  addons?: ViteAddon[];
}

/** Vanilla-TS base: node-env vitest with v8 coverage. Add-ons layer plugins + test env. */
const baseTest = {
  environment: "node",
  reporters: process.env.GITHUB_ACTIONS ? ["default", "github-actions"] : ["default"],
  restoreMocks: true,
  exclude: [...configDefaults.exclude, "e2e/**"],
  typecheck: { enabled: true },
  coverage: {
    provider: "v8",
    reporter: ["text", "lcov"],
    include: ["src/**/*.{ts,tsx}"],
    exclude: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
} satisfies TestConfig;

/** Compose a vite config from add-on contributions (plugins + vitest test config). */
export function defineViteConfig(options: ViteOptions = {}) {
  const addons = [...(options.addons ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return defineConfig((env) => {
    const plugins = addons.flatMap((addon) => addon.plugins?.(env) ?? []);
    const test = addons.reduce<TestConfig>(
      (acc, addon) => ({ ...acc, ...addon.test }),
      { ...baseTest },
    );
    return {
      resolve: { tsconfigPaths: true },
      plugins,
      test,
    };
  });
}

export default defineViteConfig;
