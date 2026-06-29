import { createRequire } from "node:module";

import type { OxlintConfig, OxlintOverride } from "oxlint";

const require = createRequire(import.meta.url);

type PluginName = NonNullable<OxlintConfig["plugins"]>[number];
type JsPlugin = NonNullable<OxlintConfig["jsPlugins"]>[number];
type Rules = NonNullable<OxlintConfig["rules"]>;
type Categories = NonNullable<OxlintConfig["categories"]>;
type Env = NonNullable<OxlintConfig["env"]>;

/**
 * Resolve a bundled jsPlugin to an absolute path so oxlint can load it from the
 * consumer regardless of pnpm hoisting (see docs/DESIGN.md — validated spike).
 */
const plugin = (name: string, spec: string): JsPlugin => ({
  name,
  specifier: require.resolve(spec),
});

/** The slice of an oxlint config an add-on package contributes. */
export interface OxlintAddon {
  plugins?: PluginName[];
  jsPlugins?: JsPlugin[];
  rules?: Rules;
  overrides?: OxlintOverride[];
  ignorePatterns?: string[];
  categories?: Categories;
  env?: Env;
}

/** Vanilla-TS base: type-safety, hygiene, filename and JSDoc discipline, vitest. */
export const base = {
  plugins: ["typescript", "unicorn", "oxc", "import", "promise", "jsdoc", "vitest"],
  jsPlugins: [plugin("check-file", "eslint-plugin-check-file")],
  categories: { correctness: "error" },
  env: { builtin: true },
  ignorePatterns: ["node_modules", "dist", ".output"],
  rules: {
    "unicorn/filename-case": ["error", { case: "kebabCase" }],
    "unicorn/no-null": "off",
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "typescript/await-thenable": "error",
    "typescript/switch-exhaustiveness-check": "error",
    "typescript/no-unnecessary-condition": "warn",
    "import/no-cycle": "error",
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            regex: "^@/",
            message: "Use the '#/' alias for src imports (the '@/' alias was removed).",
          },
        ],
      },
    ],
    "check-file/filename-blocklist": [
      "error",
      {
        "**/*.js": "*.ts",
        "**/*.jsx": "*.tsx",
        "**/*.mjs": "*.ts",
        "**/*.cjs": "*.ts",
        "**/__test*/**": "co-located *.test.ts (no __tests__ dirs)",
      },
    ],
    "check-file/filename-naming-convention": [
      "error",
      {
        "src/**/*.{ts,tsx}": "+([^.])?(.@(test|test-d|stories|d))",
        "*.{ts,tsx}": "+([^.])?(.@(config|d))",
      },
      { ignoreMiddleExtensions: false },
    ],
    "jsdoc/check-tag-names": "error",
    "jsdoc/check-property-names": "error",
    "jsdoc/check-access": "error",
    "jsdoc/empty-tags": "error",
    "jsdoc/implements-on-classes": "error",
  },
  overrides: [
    {
      files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "!e2e/**"],
      rules: {
        "vitest/require-top-level-describe": "error",
        "vitest/consistent-test-it": ["error", { fn: "it", withinDescribe: "it" }],
        "vitest/no-identical-title": "error",
        "vitest/no-commented-out-tests": "warn",
        "vitest/no-duplicate-hooks": "error",
        "vitest/prefer-hooks-in-order": "error",
        "vitest/prefer-hooks-on-top": "error",
        "vitest/require-hook": "error",
      },
    },
  ],
} satisfies OxlintConfig;

/** Compose the base oxlint config with any number of add-on contributions. */
export function defineOxlint(...addons: OxlintAddon[]): OxlintConfig {
  const plugins = new Set<PluginName>(base.plugins as PluginName[]);
  const jsPlugins: JsPlugin[] = [...base.jsPlugins];
  const rules: Rules = { ...(base.rules as Rules) };
  const overrides: OxlintOverride[] = [...(base.overrides as OxlintOverride[])];
  const ignorePatterns: string[] = [...base.ignorePatterns];
  let categories: Categories = { ...base.categories };
  let env: Env = { ...base.env };

  for (const addon of addons) {
    addon.plugins?.forEach((p) => plugins.add(p));
    if (addon.jsPlugins) jsPlugins.push(...addon.jsPlugins);
    if (addon.rules) Object.assign(rules, addon.rules);
    if (addon.overrides) overrides.push(...addon.overrides);
    if (addon.ignorePatterns) ignorePatterns.push(...addon.ignorePatterns);
    if (addon.categories) categories = { ...categories, ...addon.categories };
    if (addon.env) env = { ...env, ...addon.env };
  }

  return {
    ...base,
    plugins: [...plugins],
    jsPlugins,
    rules,
    overrides,
    ignorePatterns,
    categories,
    env,
  };
}

export default base;
