import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

/** A rule severity, optionally with options — oxlint accepts this shape. */
export type RuleLevel =
  | "error"
  | "warn"
  | "off"
  | ["error" | "warn" | "off", ...unknown[]];

/** A flat/eslintrc config: an object carrying `rules`, or an array of them. */
export type NamedConfig =
  | { rules?: Record<string, unknown> }
  | Array<{ rules?: Record<string, unknown> }>;

/**
 * The slice of an eslint plugin this utility reads. `configs` is left loose
 * (plugins type their configs with their own rule records); the selected entry
 * is narrowed to NamedConfig internally.
 */
interface EslintPlugin {
  configs?: Record<string, unknown>;
}

export interface RouteRulesOptions {
  /** The plugin's eslint rule namespace, e.g. `"unicorn"`. */
  sourcePrefix: string;
  /** Oxlint's native prefix for rules it implements, e.g. `"unicorn"`. */
  nativePrefix: string;
  /** JsPlugin alias for rules oxlint hasn't ported, e.g. `"unicorn-x"`. */
  jsPrefix: string;
  /** Fully-qualified rule names oxlint implements natively (e.g. `unicorn/x`). */
  nativeRuleNames: ReadonlySet<string>;
}

const SEVERITY: Record<string, "off" | "warn" | "error" | undefined> = {
  "0": "off",
  "1": "warn",
  "2": "error",
  off: "off",
  warn: "warn",
  error: "error",
};

/**
 * Normalize an eslint level (string `"off"|"warn"|"error"` or numeric `0|1|2`,
 * with or without options) to an oxlint level. Returns `undefined` for `off` or
 * an unsupported shape, meaning the rule is dropped.
 */
function normalizeLevel(level: unknown): RuleLevel | undefined {
  const entry: unknown[] = Array.isArray(level)
    ? (level as unknown[])
    : [level];
  const severity = SEVERITY[String(entry[0])];
  if (!severity || severity === "off") return undefined;
  const options = entry.slice(1);
  return options.length > 0 ? [severity, ...options] : severity;
}

/**
 * Pure routing core (no I/O): given a named config's rules and which rules
 * oxlint implements natively, key each enabled rule for oxlint — native ones
 * under `nativePrefix`, the rest under `jsPrefix`. Handles both flat-array and
 * single-object config shapes, normalizes string/numeric severities, drops
 * `off`/unsupported entries, and preserves options.
 */
export function routeRules(
  named: NamedConfig | undefined,
  { sourcePrefix, nativePrefix, jsPrefix, nativeRuleNames }: RouteRulesOptions,
): Record<string, RuleLevel> {
  const rules: Record<string, unknown> = Array.isArray(named)
    ? (Object.assign({}, ...named.map((c) => c.rules ?? {})) as Record<
        string,
        unknown
      >)
    : (named?.rules ?? {});
  return Object.fromEntries(
    Object.entries(rules)
      .filter(([name]) => name.startsWith(`${sourcePrefix}/`))
      .flatMap(([name, level]) => {
        const normalized = normalizeLevel(level);
        if (normalized === undefined) return [];
        const rule = name.slice(sourcePrefix.length + 1);
        const prefix = nativeRuleNames.has(`${nativePrefix}/${rule}`)
          ? nativePrefix
          : jsPrefix;
        return [[`${prefix}/${rule}`, normalized] as const];
      }),
  );
}

/** Oxlint's native rule names, read once (lazily) from its shipped schema. */
let nativeRuleNamesCache: ReadonlySet<string> | undefined;

/**
 * Fully-qualified rule names oxlint implements natively, e.g. `react/hooks`.
 * Exported so callers and their guards read coverage from this same source.
 */
export function oxlintNativeRuleNames(): ReadonlySet<string> {
  nativeRuleNamesCache ??= new Set(
    Object.keys(
      (
        JSON.parse(
          readFileSync(
            path.join(
              path.dirname(require.resolve("oxlint/package.json")),
              "configuration_schema.json",
            ),
            "utf8",
          ),
        ) as {
          definitions: {
            DummyRuleMap: { properties: Record<string, unknown> };
          };
        }
      ).definitions.DummyRuleMap.properties,
    ),
  );
  return nativeRuleNamesCache;
}

export interface RulesFromConfigOptions {
  /** The eslint plugin (its default export). */
  plugin: EslintPlugin;
  /** The plugin's eslint rule namespace, e.g. `"unicorn"`. */
  sourcePrefix: string;
  /** Oxlint's native prefix for rules it implements, e.g. `"unicorn"`. */
  nativePrefix: string;
  /** JsPlugin alias for rules oxlint hasn't ported, e.g. `"unicorn-x"`. */
  jsPrefix: string;
  /** Named config to pull rules from, e.g. `"recommended"` or `"flat/react"`. */
  config: string;
}

/**
 * Pull a plugin's named config (e.g. `recommended`) and route its enabled rules
 * for oxlint via {@link routeRules}. Native coverage is read from oxlint's
 * shipped schema, so new/unported rules default to the jsPlugin — which
 * implements the whole set — rather than an unknown native rule. Spread the
 * result into a preset's rules, placing explicit tweaks after so they win.
 */
export function rulesFromConfig({
  plugin,
  sourcePrefix,
  nativePrefix,
  jsPrefix,
  config,
}: RulesFromConfigOptions): Record<string, RuleLevel> {
  const named = plugin.configs?.[config];
  // A named config is a deliberate subscription; its absence (typo, or an
  // upstream rename) would otherwise drop the whole preset silently.
  if (named == null) {
    const available = Object.keys(plugin.configs ?? {}).join(", ") || "none";
    throw new Error(
      `rulesFromConfig: plugin has no "${config}" config (available: ${available}).`,
    );
  }
  return routeRules(named, {
    sourcePrefix,
    nativePrefix,
    jsPrefix,
    nativeRuleNames: oxlintNativeRuleNames(),
  });
}

export interface RulesFromNamesOptions {
  /** Oxlint's native prefix for rules it implements, e.g. `"react"`. */
  nativePrefix: string;
  /** JsPlugin alias for rules oxlint hasn't ported, e.g. `"react-hooks-js"`. */
  jsPrefix: string;
  /** Unprefixed rule names and their levels, e.g. `{ hooks: "error" }`. */
  rules: Record<string, RuleLevel>;
}

/**
 * Route hand-picked rules (unprefixed names) the way {@link rulesFromConfig}
 * routes a plugin's named config: native where oxlint's schema has the rule,
 * jsPlugin otherwise. Use for rules outside a plugin's named config, so they
 * move to the native implementation as soon as oxlint ports them.
 */
export function rulesFromNames({
  nativePrefix,
  jsPrefix,
  rules,
}: RulesFromNamesOptions): Record<string, RuleLevel> {
  const native = oxlintNativeRuleNames();
  return Object.fromEntries(
    Object.entries(rules).map(([name, level]) => [
      `${native.has(`${nativePrefix}/${name}`) ? nativePrefix : jsPrefix}/${name}`,
      level,
    ]),
  );
}
