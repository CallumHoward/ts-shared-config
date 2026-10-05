import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import type { ConfigEnv, PluginOption } from "vite";
import {
  configDefaults,
  defineConfig,
  type ViteUserConfig,
} from "vitest/config";

type TestConfig = ViteUserConfig["test"];

/**
 * Nearest ancestor containing pnpm-workspace.yaml, or cwd outside a workspace.
 * Used as the lcov reporter's projectRoot so per-package runs emit
 * repo-relative SF: paths, which diff-cover can match against the git diff.
 */
function workspaceRoot(): string {
  let directory = process.cwd();
  while (!existsSync(path.join(directory, "pnpm-workspace.yaml"))) {
    const parent = path.dirname(directory);
    if (parent === directory) return process.cwd();
    directory = parent;
  }
  return directory;
}

/** The slice of a vite/vitest config an add-on package contributes. */
export interface ViteAddon {
  /** Plugins this add-on contributes; receives the vite config env. */
  plugins?: (env: ConfigEnv) => PluginOption[];
  /**
   * Vitest `test` config this add-on contributes (shallow-merged over the
   * base).
   */
  test?: TestConfig;
  /**
   * Plugin ordering hint; lower runs earlier (e.g. a transform before react).
   * Default 0.
   */
  order?: number;
}

export interface ViteOptions {
  addons?: ViteAddon[];
}

/**
 * Vanilla-TS base: node-env vitest with v8 coverage. Add-ons layer plugins +
 * test env. Exported for bespoke configs (e.g. vitest projects) that can't
 * compose through defineViteConfig but still want the global slice.
 */
export const baseTest = {
  environment: "node",
  // CI installs fresh every job, so writing the cache there is pure cost.
  fsModuleCache: !process.env["GITHUB_ACTIONS"],
  // Per package, resolved against each project root, so parallel package runs
  // never share one cache directory.
  fsModuleCachePath: "node_modules/.vitest-cache",
  reporters: process.env["GITHUB_ACTIONS"]
    ? ["default", "github-actions"]
    : ["default"],
  restoreMocks: true,
  unstubGlobals: true,
  exclude: [...configDefaults.exclude, "e2e/**"],
  typecheck: { enabled: true },
  coverage: {
    provider: "v8",
    reporter: [["lcov", { projectRoot: workspaceRoot() }]],
    include: ["src/**/*.{ts,tsx}"],
    // Generated files (e.g. a router's route tree) are not authored code, so
    // they don't count toward coverage.
    exclude: ["src/**/*.{test,test-d,spec}.{ts,tsx}", "src/**/*.gen.{ts,tsx}"],
  },
} satisfies TestConfig;

/**
 * Compose a vite config from add-on contributions (plugins + vitest test
 * config).
 */
export function defineViteConfig(options: ViteOptions = {}) {
  const addons = (options.addons ?? []).toSorted(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  return defineConfig((env) => {
    const plugins = addons.flatMap((addon) => addon.plugins?.(env) ?? []);
    let test: NonNullable<TestConfig> = { ...baseTest };
    for (const addon of addons) test = { ...test, ...addon.test };
    return {
      resolve: { tsconfigPaths: true },
      plugins,
      test,
    };
  });
}

export default defineViteConfig;
