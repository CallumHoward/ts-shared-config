import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  base,
  bundledPlugins,
  defineOxlint,
  E2E_FILES,
  filenameNamingConvention,
  type OxlintAddon,
  offWhenPresent,
  ROOT_MIDDLE_EXTENSIONS,
  SRC_MIDDLE_EXTENSIONS,
} from "./oxlint.ts";

describe("filenameNamingConvention", () => {
  it("builds the shared patterns by default", () => {
    const [severity, patterns, options] = filenameNamingConvention();
    expect(severity).toBe("error");
    expect(patterns).toEqual({
      "src/**/*.{ts,tsx}": `+([^.])?(.@(${SRC_MIDDLE_EXTENSIONS.join("|")}))`,
      "*.{ts,tsx}": `+([^.])?(.@(${ROOT_MIDDLE_EXTENSIONS.join("|")}))`,
    });
    expect(options).toEqual({ ignoreMiddleExtensions: false });
  });

  it("merges a package's extensions after the shared ones", () => {
    const [, patterns] = filenameNamingConvention({
      root: ["setup"],
      src: ["mock", "stories"],
    });
    expect(patterns).toEqual({
      "src/**/*.{ts,tsx}": "+([^.])?(.@(test|test-d|d|mock|stories))",
      "*.{ts,tsx}": "+([^.])?(.@(config|d|setup))",
    });
  });
});

describe("offWhenPresent", () => {
  it("turns off the rules the plugin has", () => {
    const rules = { "no-unsafe-enum-assignment": {}, "no-generated-empty-object-type": {} };
    expect(
      offWhenPresent("ts-eslint-js", ["no-unsafe-enum-assignment", "no-generated-empty-object-type"], rules),
    ).toEqual({
      "ts-eslint-js/no-unsafe-enum-assignment": "off",
      "ts-eslint-js/no-generated-empty-object-type": "off",
    });
  });

  it("omits a rule an older plugin release lacks", () => {
    const rules = { "no-generated-empty-object-type": {} };
    expect(
      offWhenPresent("ts-eslint-js", ["no-unsafe-enum-assignment", "no-generated-empty-object-type"], rules),
    ).toEqual({ "ts-eslint-js/no-generated-empty-object-type": "off" });
  });
});

describe("bundledPlugins", () => {
  it("resolves a plugin relative to the given module to an absolute specifier", () => {
    const plugin = bundledPlugins(import.meta.url);
    const entry = plugin("check-file", "eslint-plugin-check-file");
    expect(entry.name).toBe("check-file");
    expect(path.isAbsolute(entry.specifier)).toBe(true);
    expect(entry.specifier).toContain("eslint-plugin-check-file");
  });

  it("throws for a plugin the module cannot resolve", () => {
    const plugin = bundledPlugins(import.meta.url);
    expect(() => plugin("nope", "eslint-plugin-does-not-exist")).toThrow(
      /Cannot find/,
    );
  });
});

// Smoke test the strictTypeChecked subscription against the real plugin +
// oxlint's schema: a routing mismatch drops rules silently.
describe("strictTypeChecked routing", () => {
  const rules: Record<string, unknown> = base.rules;

  it("routes type-aware rules oxlint ports to native typescript/", () => {
    expect(rules["typescript/no-floating-promises"]).toBe("error");
    expect(rules["typescript/restrict-template-expressions"]).toEqual([
      "error",
      expect.objectContaining({ allowNullish: true, allowNumber: true }),
    ]);
  });

  it("routes the unported rules to the ts-eslint-js jsPlugin", () => {
    expect(rules["ts-eslint-js/no-useless-constructor"]).toBe("error");
    // Type-aware, so it cannot run in the plugin runtime.
    expect(rules["ts-eslint-js/no-generated-empty-object-type"]).toBe("off");
  });

  it("keeps the preset's own severity for no-unnecessary-condition", () => {
    expect(rules["typescript/no-unnecessary-condition"]).toBe("warn");
  });

  it("allows void-returning arrow shorthand in no-confusing-void-expression", () => {
    expect(rules["typescript/no-confusing-void-expression"]).toEqual([
      "error",
      { ignoreArrowShorthand: true },
    ]);
  });
});

describe("defineOxlint", () => {
  it("returns the base config when called with no addons", () => {
    expect(defineOxlint()).toEqual({ ...base });
  });

  it("dedupes plugins and concatenates the list-shaped fields in order", () => {
    const first: OxlintAddon = {
      plugins: ["typescript", "react"],
      jsPlugins: [{ name: "a", specifier: "/abs/a.js" }],
      overrides: [{ files: ["a/**"], rules: {} }],
      ignorePatterns: ["a/"],
    };
    const second: OxlintAddon = {
      plugins: ["react"],
      jsPlugins: [{ name: "b", specifier: "/abs/b.js" }],
      ignorePatterns: ["b/"],
    };
    const config = defineOxlint(first, second);
    expect(config.plugins).toEqual([...base.plugins, "react"]);
    expect(config.jsPlugins).toEqual([
      ...base.jsPlugins,
      ...(first.jsPlugins ?? []),
      ...(second.jsPlugins ?? []),
    ]);
    expect(config.overrides).toEqual([
      ...base.overrides,
      ...(first.overrides ?? []),
    ]);
    expect(config.ignorePatterns).toEqual([...base.ignorePatterns, "a/", "b/"]);
  });

  it("merges the record-shaped fields with later addons winning", () => {
    const config = defineOxlint(
      { rules: { "no-var": "off", "a/x": "error" }, env: { node: true } },
      { rules: { "a/x": "warn" }, categories: { pedantic: "warn" } },
    );
    expect(config.rules?.["no-var"]).toBe("off");
    expect(config.rules?.["a/x"]).toBe("warn");
    // Untouched base rules survive.
    expect(config.rules?.["unicorn/filename-case"]).toEqual(
      base.rules["unicorn/filename-case"],
    );
    expect(config.env).toEqual({ ...base.env, node: true });
    expect(config.categories).toEqual({ ...base.categories, pedantic: "warn" });
  });

  it("leaves the exported base untouched", () => {
    const before = structuredClone(base);
    defineOxlint({ plugins: ["react"], rules: { "no-var": "off" } });
    expect(base).toEqual(before);
  });
});

describe("E2E_FILES", () => {
  it("is the glob the vitest override excludes", () => {
    const vitestOverride = base.overrides.find((override) =>
      override.files.includes("**/*.test.{ts,tsx}"),
    );
    expect(vitestOverride?.excludeFiles).toBe(E2E_FILES);
  });
});
