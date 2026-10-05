import type { OxlintAddon } from "@wcmj/config-base/oxlint";
import { oxlintNativeRuleNames } from "@wcmj/config-base/rules-from-config";
import { describe, expect, it } from "vitest";

import { defineOxlint } from "./oxlint.ts";

/** Which prefix a rule landed under in the composed rules, if any. */
function where(rules: Record<string, unknown>, rule: string): string {
  for (const prefix of ["react", "react-hooks-js"]) {
    if (rules[`${prefix}/${rule}`] !== undefined) return `${prefix}/${rule}`;
  }
  return `absent: ${rule}`;
}

// Smoke test the shipped preset against the real plugins + oxlint's schema.
// react-hooks routes through a nativePrefix (`react`) that differs from its
// source namespace (`react-hooks`); a mismatch drops the rules silently
// (oxlint ignores an unknown rule under a valid plugin), so assert they land.
describe("react preset routing", () => {
  const rules = defineOxlint().rules ?? {};

  it("routes react-hooks rules-of-hooks/exhaustive-deps to native react/", () => {
    expect(rules["react/rules-of-hooks"]).toBeDefined();
    expect(rules["react/exhaustive-deps"]).toBeDefined();
  });

  it("routes unported react-hooks compiler rules to the react-hooks-js jsPlugin", () => {
    const js = Object.keys(rules).filter((k) =>
      k.startsWith("react-hooks-js/"),
    );
    expect(js.length).toBeGreaterThan(0);
  });

  // Accepting either prefix would pass with every rule on the jsPlugin, the
  // fallback this routing exists to avoid, so the schema picks the prefix.
  it("keeps every hand-picked compiler rule under the prefix the schema implies", () => {
    const compilerRules = [
      "hooks",
      "capitalized-calls",
      "component-hook-factories",
      "no-deriving-state-in-effects",
      "memo-dependencies",
      "memoized-effect-dependencies",
      "exhaustive-effect-dependencies",
      "void-use-memo",
    ];
    const native = oxlintNativeRuleNames();
    expect(compilerRules.map((rule) => where(rules, rule))).toEqual(
      compilerRules.map((rule) =>
        native.has(`react/${rule}`)
          ? `react/${rule}`
          : `react-hooks-js/${rule}`,
      ),
    );
  });
});

describe("react preset conventions", () => {
  const config = defineOxlint();

  it("assumes a browser environment", () => {
    expect(config.env?.["browser"]).toBe(true);
  });

  it("keeps the @/ alias ban and the default React import ban", () => {
    expect(config.rules?.["no-restricted-imports"]).toEqual([
      "error",
      {
        patterns: [expect.objectContaining({ regex: "^@/" })],
        paths: [expect.objectContaining({ name: "react" })],
      },
    ]);
  });

  it("requires hook modules to carry the hook's camelCase name", () => {
    const hooks = config.overrides?.find((override) =>
      override.files.includes("**/use[A-Z]*.{ts,tsx}"),
    );
    expect(hooks?.rules?.["unicorn/filename-case"]).toEqual([
      "error",
      { cases: { camelCase: true } },
    ]);
  });
});

describe("react preset layering", () => {
  const routerLayer: OxlintAddon = {
    jsPlugins: [{ name: "router", specifier: "/abs/router.js" }],
    rules: { "react/only-export-components": "off", "router/x": "error" },
    overrides: [{ files: ["src/routes/**"], rules: {} }],
  };
  const tweaks: OxlintAddon = {
    rules: { "router/x": "warn" },
    env: { browser: true },
  };
  const config = defineOxlint(routerLayer, tweaks);

  it("lets later addons override earlier rules", () => {
    expect(config.rules?.["react/only-export-components"]).toBe("off");
    expect(config.rules?.["router/x"]).toBe("warn");
  });

  it("appends addon jsPlugins and overrides after the react layer's own", () => {
    expect(config.jsPlugins?.at(-1)).toEqual(routerLayer.jsPlugins?.[0]);
    expect(config.overrides?.at(-1)).toEqual(routerLayer.overrides?.[0]);
    expect(
      config.jsPlugins?.some(
        (entry) => typeof entry === "object" && entry.name === "react-hooks-js",
      ),
    ).toBe(true);
  });

  it("still accepts a single tweaks object", () => {
    expect(defineOxlint({ env: { node: true } }).env?.["node"]).toBe(true);
  });
});
