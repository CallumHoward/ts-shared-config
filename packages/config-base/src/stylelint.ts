/**
 * Universal CSS policy: accessibility, logical properties, nesting, ordering,
 * and browser baseline. Stylelint replaces rule config wholesale, so layers
 * compose from the exported building blocks when widening rules.
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
  BOOLEAN_DATA_ATTRIBUTE:
    'Style a boolean data attribute by presence ([data-foo]), and render it only when on; never match ="true" or ="false".',
  BORDER_REMOVAL:
    "Removing a border deletes the boundary forced-colors (WHCM) mode keeps visible by recoloring real edges with system colors. Keep the edge and hide it (e.g. border: 1px solid transparent); if border-free geometry at rest is genuinely needed, restore the transparent border under @media (forced-colors: active) and disable this rule inline with a justification — the same escape hatch covers genuinely non-interactive edges.",
  FLOW_RELATIVE:
    "Use the flow-relative (logical) equivalent so layouts adapt to writing mode and direction.",
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
export function knownCustomProperties(
  packageUrl: string,
  stylesheets: string[],
): StylelintAddon {
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
  ignoreFiles: [...buildOutputDirectories, "node_modules"].map(
    (d) => `**/${d}/**`,
  ),
  // Autofix maps physical declarations from their presumed LTR intent.
  languageOptions: {
    directionality: {
      block: "top-to-bottom",
      inline: "left-to-right",
    },
  },
  plugins: [
    require.resolve("@double-great/stylelint-a11y"),
    require.resolve("stylelint-order"),
    require.resolve("stylelint-use-nesting"),
    require.resolve("stylelint-plugin-use-baseline"),
    require.resolve("stylelint-value-no-unknown-custom-properties"),
  ],
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    // The global reduced-motion reset replaces the plugin's per-rule media
    // requirement, so a11y rules are enabled individually.
    "a11y/no-obsolete-attribute": true,
    "a11y/no-obsolete-element": true,
    "a11y/no-outline-none": [
      true,
      {
        message:
          "Do not remove the focus outline without a visible :focus-visible replacement.",
      },
    ],
    "a11y/no-text-align-justify": true,
    // The plugin recognizes :focus-visible, but its fixer inserts banned
    // :focus selectors.
    "a11y/selector-pseudo-class-focus": [
      true,
      {
        disableFix: true,
        message:
          "Selectors with :hover must also style :focus-visible so the state is reachable by keyboard.",
      },
    ],
    "csstools/use-nesting": "always",
    "declaration-no-important": [
      true,
      {
        message:
          "Do not use !important; win by cascade position instead. Sole exception: re-enabling essential motion under a global reduced-motion reset (!important with a justified disable).",
      },
    ],
    "declaration-property-value-disallowed-list": [
      {
        background: [
          String.raw`/^(?:var\(--[\w-]+\)|oklch\([^)]*\)|transparent|currentcolor)$/`,
        ],
        // Exact `none`/`0` only — the common removal keywords. Identical
        // multi-token zeros (`border-width: 0 0`) already fail
        // shorthand-property-no-redundant-values; autofix collapses them
        // to `0`, which this rule then catches. Mixed encodings of "no
        // painted edge" (`border: 0 solid`, `hidden`, `calc(0)`) are out
        // of scope. Partial zeroing such as the reset's hr
        // `border-width: 1px 0 0` keeps a real edge for forced-colors to
        // recolor. -color and -radius stay out — the allowed-list above
        // polices their values.
        "/^border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-(?:style|width))?$/":
          ["none", "0"],
      },
      {
        message: (property: string) =>
          property === "background"
            ? "This background value only sets a color. Use background-color instead of the shorthand."
            : MESSAGES.BORDER_REMOVAL,
      },
    ],
    "import-notation": "string",
    "max-nesting-depth": [
      2,
      {
        ignore: ["pseudo-classes"],
        ignoreAtRules: ["media", "supports", "layer"],
      },
    ],
    // em over rem: interchangeable in Chrome/Firefox (both resolve against
    // the user's default font size, never authored CSS), but in Safari only
    // em tracks the minimum-font-size preference — the sole path by which any
    // font preference reaches breakpoints there (WebKit #156687, still open).
    "media-feature-name-unit-allowed-list": [
      { height: ["em"], width: ["em"] },
      {
        message:
          "Use em in media queries so breakpoints respond to the user's font-size preference (em also tracks Safari's minimum font size, where rem does not).",
      },
    ],
    "no-unknown-animations": true,
    "no-unknown-custom-media": true,
    "order/order": [
      [
        { name: "charset", type: "at-rule" },
        { name: "import", type: "at-rule" },
        "custom-properties",
        "declarations",
        { name: "media", type: "at-rule" },
        { name: "supports", type: "at-rule" },
        { name: "Pseudo class", selector: /^&:[\w-]+$/, type: "rule" },
        {
          name: "Functional pseudo class",
          selector: /^&:[\w-]+\(/,
          type: "rule",
        },
        { name: "Attribute selector", selector: /^&\[/, type: "rule" },
        { name: "Pseudo element", selector: /^&::[\w-]+/, type: "rule" },
        { name: "Child combinator", selector: /^& > [a-z]/, type: "rule" },
        { name: "Adjacent sibling", selector: /^& \+ [a-z]/, type: "rule" },
        { name: "General sibling", selector: /^& ~ [a-z]/, type: "rule" },
        { name: "Universal selector", selector: /^& \*$/, type: "rule" },
        {
          name: "Descendant type selector",
          selector: /^& [a-z][\w-]*$/,
          type: "rule",
        },
      ],
      { disableFix: true, unspecified: "bottom" },
    ],
    "order/properties-alphabetical-order": [true, { disableFix: true }],
    // Audited browser-support exceptions: transpiled, graceful enhancements,
    // or accepted gaps. Prefer @supports with a fallback. After plugin
    // updates, re-lint with this inventory empty and remove stale entries.
    // Enumerate audited values; [] ignores only the property check.
    "plugin/use-baseline": [
      true,
      {
        available: "widely",
        ignoreFunctions: [
          // Deliberately excluded from transpilation.
          "light-dark",
        ],
        ignoreProperties: {
          "accent-color": [],
          "hanging-punctuation": ["first", "allow-end", "last", "none"],
          "interpolate-size": ["allow-keywords"],
          "overflow-inline": [],
          resize: ["block"],
          "scrollbar-gutter": ["stable"],
          "text-size-adjust": ["none"],
          "text-wrap": ["balance", "pretty"],
        },
        ignoreSelectors: [
          // Drops its rule outside the target window; remove when Baseline.
          "has",
          "selection",
          "target-text",
          "/^view-transition-/",
        ],
      },
    ],
    "property-disallowed-list": [
      ["forced-color-adjust", "font", "grid"],
      {
        message: (property: string) =>
          property === "forced-color-adjust"
            ? MESSAGES.FORCED_COLOR_ADJUST
            : MESSAGES.FONT_GRID_SHORTHAND,
      },
    ],
    "property-layout-mappings": [
      "flow-relative",
      {
        message: MESSAGES.FLOW_RELATIVE,
      },
    ],
    // Boolean data-* attributes are absent when off; match by presence, and keep
    // value matching for enumerated axes.
    "selector-disallowed-list": [
      [
        String.raw`/\[\s*data-[\w-]+\s*=\s*["']?(?:true|false)["']?\s*(?:[is]\s*)?\]/i`,
      ],
      {
        message: MESSAGES.BOOLEAN_DATA_ATTRIBUTE,
        splitList: true,
      },
    ],
    "selector-max-id": 0,
    // Require explicit nesting semantics and prohibit nested class selectors;
    // model variants with pseudo-classes or attributes.
    "selector-nested-pattern": [
      /^&(::|:|\[|\s+(?:[>+~]\s*)?[^.#>+~\s])/,
      {
        message:
          "Nest with a leading `&`, refining the same element (&:hover, &[data-state]) or targeting descendant elements (& > p). Class selectors must not be nested — model state and variants with pseudo-classes or attributes, or as a separate single class at the root level.",
      },
    ],
    "selector-no-invalid": true,
    "selector-no-qualifying-type": [true, { ignore: ["attribute"] }],
    "selector-pseudo-class-disallowed-list": [
      ["focus"],
      {
        message:
          "Use :focus-visible instead of :focus to avoid focus rings on mouse clicks.",
      },
    ],
    "time-min-milliseconds": [
      100,
      {
        message:
          "Durations under 100ms are imperceptible for most users; use 0.1s or more (or remove the animation).",
      },
    ],
    "unit-layout-mappings": [
      "flow-relative",
      {
        message: MESSAGES.FLOW_RELATIVE,
      },
    ],
    "value-keyword-layout-mappings": [
      "flow-relative",
      {
        // caption-side is temporary until logical values reach Baseline;
        // offset properties have no logical position syntax.
        ignoreProperties: ["caption-side", "offset-anchor", "offset-position"],
        message: MESSAGES.FLOW_RELATIVE,
      },
    ],
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
