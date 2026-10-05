import type { StylelintAddon } from "@wcmj/config-base/stylelint";

const tailwindAtRules = [
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
];

/**
 * Reconcile stylelint-config-standard with Tailwind v4: allow Tailwind's
 * at-rules (`@theme`, `@apply`, …) and its string `@import "tailwindcss"`
 * (standard otherwise enforces `url()` notation).
 */
export const tailwindStylelint: StylelintAddon = {
  rules: {
    "import-notation": "string",
    "at-rule-no-unknown": [true, { ignoreAtRules: tailwindAtRules }],
    // csstree validates `@apply` against the CSS Mixins draft, not Tailwind's syntax.
    "at-rule-prelude-no-invalid": [true, { ignoreAtRules: tailwindAtRules }],
  },
};

export default tailwindStylelint;
