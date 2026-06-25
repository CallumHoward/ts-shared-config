// @callumhoward/config-base — oxlint
//
// SPIKE NOTE: authored in plain ESM JS (not TS) to isolate the question under
// test — can oxlint load jsPlugins that are *dependencies of this package*
// (not the consumer) under pnpm's strict node_modules? The real package will be
// TS-authored and built. The technique: resolve each bundled plugin to an
// absolute path with require.resolve so oxlint never depends on consumer
// hoisting.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Bundled jsPlugin → absolute path, resolvable from the consumer regardless of hoisting. */
const plugin = (name, spec) => ({ name, specifier: require.resolve(spec) });

export const base = {
  plugins: ["typescript", "unicorn", "oxc", "import", "promise", "jsdoc", "vitest"],
  jsPlugins: [plugin("check-file", "eslint-plugin-check-file")],
  categories: { correctness: "error" },
  env: { builtin: true },
  ignorePatterns: [".output", "dist"],
  rules: {
    "unicorn/filename-case": ["error", { case: "kebabCase" }],
    "check-file/filename-blocklist": [
      "error",
      { "**/*.js": "*.ts", "**/*.jsx": "*.tsx" },
    ],
  },
};

function merge(...configs) {
  const out = { plugins: [], jsPlugins: [], rules: {}, overrides: [], ignorePatterns: [] };
  let categories;
  let env;
  for (const c of configs) {
    if (!c) continue;
    if (c.plugins) out.plugins.push(...c.plugins);
    if (c.jsPlugins) out.jsPlugins.push(...c.jsPlugins);
    if (c.rules) Object.assign(out.rules, c.rules);
    if (c.overrides) out.overrides.push(...c.overrides);
    if (c.ignorePatterns) out.ignorePatterns.push(...c.ignorePatterns);
    if (c.categories) categories = { ...categories, ...c.categories };
    if (c.env) env = { ...env, ...c.env };
  }
  out.plugins = [...new Set(out.plugins)];
  if (categories) out.categories = categories;
  if (env) out.env = env;
  return out;
}

/** Compose the base config with any number of add-on contributions. */
export function defineOxlint(...addons) {
  return merge(base, ...addons);
}

export default base;
