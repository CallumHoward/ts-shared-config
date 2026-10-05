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

export const MESSAGES = {
  FORCED_COLOR_ADJUST:
    "forced-color-adjust opts an element out of forced-colors (high-contrast) mode. If a rare legitimate case exists, disable this rule inline with a justification.",
  FONT_GRID_SHORTHAND:
    "The font and grid shorthands are hard to read. Use longhand properties instead.",
};

/**
 * Addon: every `var(--…)` reference must resolve to a declaration in the linted
 * file or the given stylesheets — package specifiers (or absolute paths)
 * resolved through the caller's own dependencies, so pass the config's
 * `import.meta.url`. The plugin resolves relative paths from the process cwd
 * (editor or CLI), hence everything is kept absolute. Resolved dist/ files must
 * exist: consumers get published artifacts; workspace packages get them from
 * install's prepare hooks.
 *
 * Pnpm consumers: the plugin omits its postcss dependency, so isolated
 * node_modules needs a packageExtensions entry until upstream fixes it — see
 * this package README's consumer notes for the copyable form.
 */
export function knownCustomProperties(packageUrl: string, stylesheets: string[]): StylelintAddon {
  const resolve = createRequire(packageUrl).resolve;
  return {
    rules: {
      "csstools/value-no-unknown-custom-properties": [
        true,
        { importFrom: stylesheets.map((specifier) => resolve(specifier)) },
      ],
    },
  };
}

// Absolute paths load bundled plugins independently of consumer hoisting.
export const base = {
  // Workflow commands surface CSS problems as annotations on the diff, so every
  // package inherits CI reporting instead of opting in per lint script.
  ...(process.env["GITHUB_ACTIONS"] ? { formatter: githubFormatter } : {}),
  extends: [require.resolve("stylelint-config-standard")],
  ignoreFiles: [...buildOutputDirectories, "node_modules"].map((d) => `**/${d}/**`),
  plugins: [require.resolve("stylelint-value-no-unknown-custom-properties")],
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    "declaration-no-important": true,
    "max-nesting-depth": [2, { ignoreAtRules: ["media", "supports", "layer"] }],
    "no-unknown-animations": true,
    "property-disallowed-list": [
      ["forced-color-adjust", "font", "grid"],
      {
        message: (property: string) =>
          property === "forced-color-adjust"
            ? MESSAGES.FORCED_COLOR_ADJUST
            : MESSAGES.FONT_GRID_SHORTHAND,
      },
    ],
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
