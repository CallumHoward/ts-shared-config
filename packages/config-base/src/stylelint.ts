import { createRequire } from "node:module";

import type { Config } from "stylelint";

const require = createRequire(import.meta.url);

/** The slice of a stylelint config an add-on package contributes. */
export interface StylelintAddon {
  extends?: string[];
  rules?: Config["rules"];
  ignoreFiles?: string[];
}

/**
 * Vanilla-TS base: stylelint-config-standard plus a few opinionated rules.
 * Tailwind's `at-rule-no-unknown` allowances are layered by the tailwind add-on.
 *
 * stylelint-config-standard is resolved to an absolute path (it is bundled here,
 * not in the consumer) so stylelint loads it regardless of pnpm hoisting — the
 * same technique used for oxlint jsPlugins (see docs/DESIGN.md).
 */
export const base = {
  extends: [require.resolve("stylelint-config-standard")],
  ignoreFiles: ["dist/**", ".output/**", "node_modules/**"],
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    "declaration-no-important": true,
    "max-nesting-depth": [2, { ignoreAtRules: ["media", "supports", "layer"] }],
    "no-unknown-animations": true,
    "selector-max-id": 0,
  },
} satisfies Config;

/** Compose the base stylelint config with any number of add-on contributions. */
export function defineStylelint(...addons: StylelintAddon[]): Config {
  const extendsList = [...base.extends];
  const ignoreFiles = [...base.ignoreFiles];
  const rules: NonNullable<Config["rules"]> = { ...base.rules };
  for (const addon of addons) {
    if (addon.extends) extendsList.push(...addon.extends);
    if (addon.ignoreFiles) ignoreFiles.push(...addon.ignoreFiles);
    if (addon.rules) Object.assign(rules, addon.rules);
  }
  return { ...base, extends: extendsList, ignoreFiles, rules };
}

export default base;
