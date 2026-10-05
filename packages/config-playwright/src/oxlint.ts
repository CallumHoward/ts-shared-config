import {
  bundledPlugins,
  E2E_FILES,
  type OxlintAddon,
} from "@wcmj/config-base/oxlint";
import { rulesFromConfig } from "@wcmj/config-base/rules-from-config";
import playwrightPlugin from "eslint-plugin-playwright";

const plugin = bundledPlugins(import.meta.url);

/**
 * Playwright add-on: the plugin's recommended rules, scoped to the `e2e/**`
 * suites base carves out of its vitest override. Nothing applies outside them,
 * so the add-on contributes no top-level rules.
 */
export const playwright: OxlintAddon = {
  jsPlugins: [plugin("playwright", "eslint-plugin-playwright")],
  overrides: [
    {
      files: E2E_FILES,
      rules: {
        ...rulesFromConfig({
          plugin: playwrightPlugin,
          sourcePrefix: "playwright",
          nativePrefix: "playwright",
          jsPrefix: "playwright",
          config: "recommended",
        }),
        // Playwright fixtures destructure `{}`; rulesFromConfig keeps only
        // prefixed rules, so recommended's own entry for this never arrives.
        "no-empty-pattern": "off",
        // Mirrors of base's vitest override, at the same severities.
        "playwright/require-top-level-describe": "error",
        "playwright/max-nested-describe": ["error", { max: 1 }],
        "playwright/no-commented-out-tests": "warn",
      },
    },
  ],
};

export default playwright;
