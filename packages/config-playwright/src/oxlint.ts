import { createRequire } from "node:module";

import type { OxlintAddon } from "@callumhoward/config-base/oxlint";

const require = createRequire(import.meta.url);

const plugin = (name: string, spec: string) => ({ name, specifier: require.resolve(spec) });

/**
 * Playwright add-on: the playwright lint plugin plus an `e2e/**` override with
 * the e2e ruleset and a `*.spec` filename convention. (Base scopes its vitest
 * rules to `!e2e/**`, so the two test rulesets never overlap.)
 */
export const playwright: OxlintAddon = {
  jsPlugins: [plugin("playwright", "eslint-plugin-playwright")],
  overrides: [
    {
      files: ["e2e/**/*.{ts,tsx}"],
      rules: {
        "playwright/require-top-level-describe": "error",
        "playwright/no-skipped-test": "warn",
        "playwright/no-focused-test": "error",
        "playwright/no-conditional-in-test": "warn",
        "playwright/valid-expect": "error",
        "check-file/filename-naming-convention": [
          "error",
          { "e2e/**/*.{ts,tsx}": "+([^.])?(.@(spec))" },
          { ignoreMiddleExtensions: false },
        ],
      },
    },
  ],
};

export default playwright;
