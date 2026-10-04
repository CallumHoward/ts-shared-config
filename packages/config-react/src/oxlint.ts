import {
  bundledPlugins,
  defineOxlint as defineBaseOxlint,
  E2E_FILES,
  type OxlintAddon,
} from "@callumhoward/config-base/oxlint";
import {
  rulesFromConfig,
  rulesFromNames,
} from "@callumhoward/config-base/rules-from-config";
import reactHooks from "eslint-plugin-react-hooks";
import noEffect from "eslint-plugin-react-you-might-not-need-an-effect";
import testingLibrary from "eslint-plugin-testing-library";
import type { OxlintConfig } from "oxlint";

const plugin = bundledPlugins(import.meta.url);

const testFiles = ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"];

/**
 * React add-on: react + jsx-a11y, the React Compiler hooks ruleset
 * (eslint-plugin-react-hooks), the you-might-not-need-an-effect rules, and
 * React Testing Library rules scoped to test files.
 */
const react: OxlintAddon = {
  plugins: ["react", "jsx-a11y"],
  env: { browser: true },
  jsPlugins: [
    plugin("react-hooks-js", "eslint-plugin-react-hooks"),
    plugin("no-effect", "eslint-plugin-react-you-might-not-need-an-effect"),
    plugin("testing-library", "eslint-plugin-testing-library"),
  ],
  rules: {
    "react/only-export-components": "warn",
    "react/no-array-index-key": "error",
    // Bans `import React` and `import * as React` in one stroke (a namespace
    // import grants the restricted default). Automatic JSX needs no React
    // binding; classic-transform entry points opt out with an inline disable.
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "react",
            importNames: ["default"],
            message:
              "Import the specific APIs by name; automatic JSX needs no React import.",
          },
        ],
      },
    ],
    ...rulesFromConfig({
      plugin: reactHooks,
      sourcePrefix: "react-hooks",
      nativePrefix: "react",
      jsPrefix: "react-hooks-js",
      config: "recommended",
    }),
    ...rulesFromConfig({
      plugin: noEffect,
      sourcePrefix: "react-you-might-not-need-an-effect",
      nativePrefix: "no-effect",
      jsPrefix: "no-effect",
      config: "recommended",
    }),
    // Compiler rules the recommended config leaves off. Routed, not hardcoded
    // to the jsPlugin, so each switches to oxlint's native rule once ported.
    ...rulesFromNames({
      nativePrefix: "react",
      jsPrefix: "react-hooks-js",
      rules: {
        hooks: "error",
        "capitalized-calls": "error",
        "component-hook-factories": "error",
        "no-deriving-state-in-effects": "error",
        "memo-dependencies": "error",
        "memoized-effect-dependencies": "warn",
        "exhaustive-effect-dependencies": "warn",
        "void-use-memo": "error",
      },
    }),
  },
  overrides: [
    {
      // React component files are PascalCase by convention; base allows only
      // kebab-case, so widen it for every .tsx across React consumers.
      files: ["**/*.tsx"],
      rules: {
        "unicorn/filename-case": [
          "error",
          { cases: { kebabCase: true, pascalCase: true } },
        ],
      },
    },
    {
      // Hook modules are named after the hook they export (useBoard.ts); the
      // capital keeps user-settings.ts and users.ts on the kebab-case rule.
      files: ["**/use[A-Z]*.{ts,tsx}"],
      rules: {
        "unicorn/filename-case": ["error", { cases: { camelCase: true } }],
      },
    },
    {
      files: testFiles,
      excludeFiles: E2E_FILES,
      rules: {
        ...rulesFromConfig({
          plugin: testingLibrary,
          sourcePrefix: "testing-library",
          nativePrefix: "testing-library",
          jsPrefix: "testing-library",
          config: "flat/react",
        }),
        "testing-library/prefer-user-event": "error",
      },
    },
  ],
};

/**
 * React preset: base + react rules, then further layers and per-package tweaks
 * in argument order (later wins), e.g. `defineOxlint(tanstackRouter,
 * playwright, { env: { browser: true } })`.
 */
export function defineOxlint(...addons: OxlintAddon[]): OxlintConfig {
  return defineBaseOxlint(react, ...addons);
}

export default defineOxlint;
