import { createRequire } from "node:module";

import typescriptEslint from "@typescript-eslint/eslint-plugin";
import unicornPlugin from "eslint-plugin-unicorn";
import type { OxlintConfig, OxlintOverride } from "oxlint";

import { buildOutputDirectories } from "./build-output.ts";
import { concat, merge } from "./merge.ts";
import { rulesFromConfig } from "./rules-from-config.ts";

type PluginName = NonNullable<OxlintConfig["plugins"]>[number];
type JsPlugin = NonNullable<OxlintConfig["jsPlugins"]>[number];
type BundledJsPlugin = Extract<JsPlugin, { specifier: string }>;
type Rules = NonNullable<OxlintConfig["rules"]>;
type Categories = NonNullable<OxlintConfig["categories"]>;
type Environment = NonNullable<OxlintConfig["env"]>;

/**
 * Build a jsPlugin entry factory for the plugins a layer package bundles. Each
 * entry resolves the plugin to an absolute path so oxlint can load it from the
 * consumer regardless of pnpm hoisting. Pass the layer's own `import.meta.url`:
 * under pnpm's isolated layout a plugin is only resolvable from the package
 * that declares it.
 */
export function bundledPlugins(
  importMetaUrl: string,
): (name: string, spec: string) => BundledJsPlugin {
  const require = createRequire(importMetaUrl);
  return (name, spec) => ({ name, specifier: require.resolve(spec) });
}

const plugin = bundledPlugins(import.meta.url);

/** The slice of an oxlint config an add-on package contributes. */
export interface OxlintAddon {
  plugins?: PluginName[];
  jsPlugins?: JsPlugin[];
  rules?: Rules;
  overrides?: OxlintOverride[];
  ignorePatterns?: string[];
  categories?: Categories;
  env?: Environment;
}

/**
 * typescript-eslint rules oxlint can only run as a jsPlugin, where they have no
 * type information. They are turned off rather than run blind.
 */
const typeInformationRules = ["no-unsafe-enum-assignment"];

// Turns off `prefix/name` for each name the plugin's rules map has.
export function offWhenPresent(
  prefix: string,
  names: readonly string[],
  pluginRules: Record<string, unknown>,
): Record<string, "off"> {
  return Object.fromEntries(
    names
      .filter((name) => name in pluginRules)
      .map((name) => [`${prefix}/${name}`, "off"]),
  );
}

/** Middle extensions any package's src files may carry (foo.test.ts). */
export const SRC_MIDDLE_EXTENSIONS = ["test", "test-d", "d"];

/** Middle extensions for package-root files (oxlint.config.ts). */
export const ROOT_MIDDLE_EXTENSIONS = ["config", "d"];

/**
 * Playwright end-to-end suites. Carved out of the vitest override here and of
 * vitest's `exclude` in vite.ts; the playwright layer scopes its rules to it.
 */
export const E2E_FILES = ["e2e/**"];

/**
 * Options for check-file/filename-naming-convention: the shared middle
 * extensions merged with a package's own (e.g. colocated `stories` files).
 */
export function filenameNamingConvention(
  extra: { root?: string[]; src?: string[] } = {},
): ["error", Record<string, string>, { ignoreMiddleExtensions: boolean }] {
  const sourceExtensions = [...SRC_MIDDLE_EXTENSIONS, ...(extra.src ?? [])];
  const rootExtensions = [...ROOT_MIDDLE_EXTENSIONS, ...(extra.root ?? [])];
  return [
    "error",
    {
      "src/**/*.{ts,tsx}": `+([^.])?(.@(${sourceExtensions.join("|")}))`,
      "*.{ts,tsx}": `+([^.])?(.@(${rootExtensions.join("|")}))`,
    },
    { ignoreMiddleExtensions: false },
  ];
}

/** Vanilla-TS base: type-safety, hygiene, filename and JSDoc discipline, vitest. */
export const base = {
  plugins: [
    "typescript",
    "unicorn",
    "oxc",
    "import",
    "promise",
    "jsdoc",
    "vitest",
  ],
  jsPlugins: [
    plugin("check-file", "eslint-plugin-check-file"),
    plugin("unicorn-x", "eslint-plugin-unicorn"),
    plugin(
      "eslint-comments",
      "@eslint-community/eslint-plugin-eslint-comments",
    ),
    plugin("ts-eslint-js", "@typescript-eslint/eslint-plugin"),
  ],
  categories: { correctness: "error" },
  env: { builtin: true },
  ignorePatterns: [...buildOutputDirectories, "node_modules"],
  rules: {
    ...rulesFromConfig({
      plugin: unicornPlugin,
      sourcePrefix: "unicorn",
      nativePrefix: "unicorn",
      jsPrefix: "unicorn-x",
      config: "recommended",
    }),
    "unicorn/no-null": "off",
    // vitest plugin is enabled globally; scope require-hook to the test override.
    "vitest/require-hook": "off",
    // Too noisy for idiomatic short names (`ctx`, `req`, `fn`); the recommended
    // set enables it, so it needs an explicit off.
    "unicorn-x/prevent-abbreviations": "off",
    // jsPlugin rules sit outside `categories`, so the eslint-comments rules
    // chosen here need enabling explicitly. no-unlimited-disable is covered by
    // the native no-abusive-eslint-disable, which also understands
    // `oxlint-disable` comments.
    "eslint-comments/require-description": "error",
    // allowWholeFile keeps top-of-file disables legal (scoped ones still pair).
    "eslint-comments/disable-enable-pair": ["error", { allowWholeFile: true }],
    "eslint-comments/no-aggregating-enable": "error",
    "eslint-comments/no-duplicate-disable": "error",
    "eslint-comments/no-unused-enable": "error",
    // typescript-eslint's strictTypeChecked set. Oxlint ports nearly all of it
    // natively (type-aware rules via tsgolint); the rest run as a jsPlugin.
    ...rulesFromConfig({
      plugin: typescriptEslint,
      sourcePrefix: "@typescript-eslint",
      nativePrefix: "typescript",
      jsPrefix: "ts-eslint-js",
      config: "flat/strict-type-checked",
    }),
    // Need type information, which the jsPlugin runtime cannot provide. Only
    // those the installed plugin has: oxlint rejects a rule it can't find, even
    // when off, and typescript-eslint adds rules between minors.
    ...offWhenPresent(
      "ts-eslint-js",
      typeInformationRules,
      typescriptEslint.rules,
    ),
    // The native core rule already covers it.
    "ts-eslint-js/no-unused-vars": "off",
    "typescript/switch-exhaustiveness-check": "error",
    "typescript/no-unnecessary-condition": "warn",
    // A concise arrow like `() => setOpen(true)` is idiomatic; braces add noise.
    "typescript/no-confusing-void-expression": [
      "error",
      { ignoreArrowShorthand: true },
    ],
    // Nullish and numbers allowed: index lookups (process.env, CSS module
    // classes) are `string | undefined` under noUncheckedIndexedAccess, and
    // numbers stringify predictably.
    "typescript/restrict-template-expressions": [
      "error",
      {
        allowAny: false,
        allowBoolean: false,
        allowNever: false,
        allowNullish: true,
        allowNumber: true,
        allowRegExp: false,
      },
    ],
    // eslint-recommended core rules that strictTypeChecked builds on; oxlint
    // puts them outside the correctness category.
    "no-var": "error",
    "prefer-const": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "import/no-cycle": "error",
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
    "check-file/filename-naming-convention": filenameNamingConvention(),
    "jsdoc/check-tag-names": "error",
    "jsdoc/check-property-names": "error",
    "jsdoc/check-access": "error",
    "jsdoc/empty-tags": "error",
    "jsdoc/implements-on-classes": "error",
  },
  overrides: [
    {
      files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
      excludeFiles: E2E_FILES,
      rules: {
        "vitest/require-top-level-describe": "error",
        // Flat suites stay scannable; group with sibling top-level describes
        // instead (https://kentcdodds.com/blog/avoid-nesting-when-youre-testing).
        "vitest/max-nested-describe": ["error", { max: 1 }],
        "vitest/consistent-test-it": [
          "error",
          { fn: "it", withinDescribe: "it" },
        ],
        "vitest/no-identical-title": "error",
        "vitest/expect-expect": "error",
        "vitest/no-commented-out-tests": "warn",
        "vitest/no-duplicate-hooks": "error",
        "vitest/prefer-hooks-in-order": "error",
        "vitest/prefer-hooks-on-top": "error",
        "vitest/require-hook": "error",
        // Fixtures have a known shape; asserting it beats optional chaining
        // that would let a missing fixture pass silently.
        "typescript/no-non-null-assertion": "off",
      },
    },
  ],
} satisfies OxlintConfig;

/**
 * Vanilla-TS preset: the base config with addon slices layered in argument
 * order (later wins). Preset packages (config-react) pass their addon followed
 * by the consumer's tweaks; package configs typically pass one tweaks object.
 */
export function defineOxlint(...addons: OxlintAddon[]): OxlintConfig {
  // Widen base's narrowed literal fields to the addon field types in one go.
  const seed: Required<OxlintAddon> = base;
  return {
    ...base,
    plugins: [...new Set(concat(seed.plugins, addons, (a) => a.plugins))],
    jsPlugins: concat(seed.jsPlugins, addons, (a) => a.jsPlugins),
    rules: merge(seed.rules, addons, (a) => a.rules),
    overrides: concat(seed.overrides, addons, (a) => a.overrides),
    ignorePatterns: concat(
      seed.ignorePatterns,
      addons,
      (a) => a.ignorePatterns,
    ),
    categories: merge(seed.categories, addons, (a) => a.categories),
    env: merge(seed.env, addons, (a) => a.env),
  };
}

export default base;
