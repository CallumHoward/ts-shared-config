/**
 * Light CSS policy on top of stylelint-config-standard. Stylelint replaces rule
 * config wholesale, so layers compose from the exported building blocks when
 * widening rules.
 */
import { createRequire } from "node:module";

import githubFormatter from "@csstools/stylelint-formatter-github";
import type { Config } from "stylelint";

import { buildOutputDirectories } from "./build-output.ts";
import { concat, merge } from "./merge.ts";

const require = createRequire(import.meta.url);

export interface StylelintAddon {
  extends?: string[];
  ignoreFiles?: string[];
  overrides?: NonNullable<Config["overrides"]>;
  rules?: NonNullable<Config["rules"]>;
}

// Absolute paths load bundled configs independently of consumer hoisting.
export const base = {
  // Workflow commands surface CSS problems as annotations on the diff, so every
  // package inherits CI reporting instead of opting in per lint script.
  ...(process.env["GITHUB_ACTIONS"] ? { formatter: githubFormatter } : {}),
  extends: [require.resolve("stylelint-config-standard")],
  ignoreFiles: [...buildOutputDirectories, "node_modules"].map((d) => `**/${d}/**`),
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    "declaration-no-important": true,
    "no-unknown-animations": true,
    "selector-max-id": 0,
  },
} satisfies Config;

/** The base stylelint config with addon slices layered in argument order. */
export function defineStylelint(...addons: StylelintAddon[]): Config {
  // Widen base's narrowed literal fields to the addon field types in one go.
  const seed: Required<StylelintAddon> = { ...base, overrides: [] };
  return {
    ...base,
    extends: concat(seed.extends, addons, (a) => a.extends),
    ignoreFiles: concat(seed.ignoreFiles, addons, (a) => a.ignoreFiles),
    overrides: concat(seed.overrides, addons, (a) => a.overrides),
    rules: merge(seed.rules, addons, (a) => a.rules),
  };
}

export default base;
