import { createRequire } from "node:module";

import type { OxlintAddon } from "@callumhoward/config-base/oxlint";

const require = createRequire(import.meta.url);

const plugin = (name: string, spec: string) => ({ name, specifier: require.resolve(spec) });

const testFiles = ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "!e2e/**"];

/**
 * React add-on: react + jsx-a11y, the React Compiler hooks ruleset
 * (eslint-plugin-react-hooks), the you-might-not-need-an-effect rules, and
 * React Testing Library rules scoped to test files. Bundled jsPlugins are
 * resolved to absolute paths (see docs/DESIGN.md).
 */
export const react: OxlintAddon = {
  plugins: ["react", "jsx-a11y"],
  jsPlugins: [
    plugin("react-hooks-js", "eslint-plugin-react-hooks"),
    plugin("no-effect", "eslint-plugin-react-you-might-not-need-an-effect"),
    plugin("testing-library", "eslint-plugin-testing-library"),
  ],
  rules: {
    "react/only-export-components": "warn",
    "react/no-array-index-key": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks-js/hooks": "error",
    "react-hooks-js/capitalized-calls": "error",
    "react-hooks-js/component-hook-factories": "error",
    "react-hooks-js/no-deriving-state-in-effects": "error",
    "react-hooks-js/memo-dependencies": "error",
    "react-hooks-js/memoized-effect-dependencies": "warn",
    "react-hooks-js/exhaustive-effect-dependencies": "warn",
    "react-hooks-js/static-components": "error",
    "react-hooks-js/use-memo": "error",
    "react-hooks-js/void-use-memo": "error",
    "react-hooks-js/preserve-manual-memoization": "error",
    "react-hooks-js/incompatible-library": "warn",
    "react-hooks-js/immutability": "error",
    "react-hooks-js/globals": "error",
    "react-hooks-js/refs": "error",
    "react-hooks-js/set-state-in-effect": "error",
    "react-hooks-js/error-boundaries": "error",
    "react-hooks-js/purity": "error",
    "react-hooks-js/set-state-in-render": "error",
    "react-hooks-js/unsupported-syntax": "warn",
    "react-hooks-js/config": "error",
    "react-hooks-js/gating": "error",
    "no-effect/no-chain-state-updates": "warn",
    "no-effect/no-event-handler": "warn",
    "no-effect/no-adjust-state-on-prop-change": "warn",
    "no-effect/no-reset-all-state-on-prop-change": "warn",
    "no-effect/no-pass-live-state-to-parent": "warn",
    "no-effect/no-pass-data-to-parent": "warn",
    "no-effect/no-external-store-subscription": "warn",
    "no-effect/no-initialize-state": "warn",
  },
  overrides: [
    {
      files: testFiles,
      rules: {
        "testing-library/await-async-queries": "error",
        "testing-library/await-async-utils": "error",
        "testing-library/no-await-sync-queries": "error",
        "testing-library/no-debugging-utils": "warn",
        "testing-library/no-dom-import": ["error", "react"],
        "testing-library/no-node-access": "error",
        "testing-library/no-promise-in-fire-event": "error",
        "testing-library/no-unnecessary-act": "error",
        "testing-library/no-wait-for-multiple-assertions": "error",
        "testing-library/no-wait-for-side-effects": "error",
        "testing-library/prefer-find-by": "error",
        "testing-library/prefer-presence-queries": "error",
        "testing-library/prefer-query-by-disappearance": "error",
        "testing-library/prefer-screen-queries": "error",
        "testing-library/prefer-user-event": "error",
        "testing-library/render-result-naming-convention": "error",
      },
    },
  ],
};

export default react;
