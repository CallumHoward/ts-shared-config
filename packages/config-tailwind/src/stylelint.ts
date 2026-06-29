import type { StylelintAddon } from "@callumhoward/config-base/stylelint";

/**
 * Reconcile stylelint-config-standard with Tailwind v4: allow Tailwind's
 * at-rules (`@theme`, `@apply`, …) and its string `@import "tailwindcss"`
 * (standard otherwise enforces `url()` notation).
 */
export const tailwindStylelint: StylelintAddon = {
  rules: {
    "import-notation": "string",
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "apply",
          "custom-variant",
          "variant",
          "utility",
          "source",
          "plugin",
          "reference",
          "config",
          "tailwind",
          "screen",
          "responsive",
        ],
      },
    ],
  },
};

export default tailwindStylelint;
