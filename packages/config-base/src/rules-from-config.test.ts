import unicorn from "eslint-plugin-unicorn";
import { describe, expect, it } from "vitest";

import {
  oxlintNativeRuleNames,
  routeRules,
  rulesFromConfig,
  rulesFromNames,
} from "./rules-from-config.ts";

// Fixture: pretend oxlint implements prefer-at natively but not no-for-loop.
const opts = {
  sourcePrefix: "unicorn",
  nativePrefix: "unicorn",
  jsPrefix: "unicorn-x",
  nativeRuleNames: new Set(["unicorn/prefer-at", "unicorn/no-null"]),
};

describe("routeRules", () => {
  it("routes an object-shaped config: native under nativePrefix, rest under jsPrefix", () => {
    expect(
      routeRules(
        {
          rules: {
            "unicorn/prefer-at": "error",
            "unicorn/no-for-loop": "error",
          },
        },
        opts,
      ),
    ).toEqual({
      "unicorn/prefer-at": "error",
      "unicorn-x/no-for-loop": "error",
    });
  });

  it("merges an array-shaped (flat) config", () => {
    expect(
      routeRules(
        [
          { rules: { "unicorn/prefer-at": "warn" } },
          { rules: { "unicorn/no-for-loop": "error" } },
        ],
        opts,
      ),
    ).toEqual({
      "unicorn/prefer-at": "warn",
      "unicorn-x/no-for-loop": "error",
    });
  });

  it("drops off entries in both string and array forms", () => {
    expect(
      routeRules(
        {
          rules: { "unicorn/prefer-at": "off", "unicorn/no-null": ["off", {}] },
        },
        opts,
      ),
    ).toEqual({});
  });

  it("preserves rule options", () => {
    expect(
      routeRules(
        { rules: { "unicorn/prefer-at": ["error", { checkExistence: true }] } },
        opts,
      ),
    ).toEqual({ "unicorn/prefer-at": ["error", { checkExistence: true }] });
  });

  it("ignores rules outside the source prefix", () => {
    expect(
      routeRules(
        { rules: { "react/no-danger": "error", "unicorn/prefer-at": "error" } },
        opts,
      ),
    ).toEqual({ "unicorn/prefer-at": "error" });
  });

  it("returns an empty object for a missing config", () => {
    expect(routeRules(undefined, opts)).toEqual({});
  });

  it("normalizes numeric severities (0 dropped, 1→warn, 2→error)", () => {
    expect(
      routeRules(
        {
          rules: {
            "unicorn/prefer-at": 2,
            "unicorn/no-null": 1,
            "unicorn/no-for-loop": 0,
          },
        },
        opts,
      ),
    ).toEqual({ "unicorn/prefer-at": "error", "unicorn/no-null": "warn" });
  });

  it("normalizes numeric severity with options", () => {
    expect(
      routeRules(
        { rules: { "unicorn/prefer-at": [2, { checkExistence: true }] } },
        opts,
      ),
    ).toEqual({ "unicorn/prefer-at": ["error", { checkExistence: true }] });
  });

  it("drops unsupported level shapes", () => {
    expect(
      routeRules({ rules: { "unicorn/prefer-at": { weird: true } } }, opts),
    ).toEqual({});
  });
});

// Smoke test against the real unicorn plugin + oxlint's shipped schema. Guards
// the assumptions the fixtures can't: that the schema read works, that the
// chosen prefixes match reality, and that a missing config fails loud.
describe("rulesFromConfig (real unicorn plugin + oxlint schema)", () => {
  const unicornOptions = {
    plugin: unicorn,
    sourcePrefix: "unicorn",
    nativePrefix: "unicorn",
    jsPrefix: "unicorn-x",
  };

  it("routes unicorn recommended across both native and jsPlugin buckets", () => {
    const routed = rulesFromConfig({
      ...unicornOptions,
      config: "recommended",
    });
    const keys = Object.keys(routed);
    expect(keys.length).toBeGreaterThan(0);
    expect(
      keys.every((k) => k.startsWith("unicorn/") || k.startsWith("unicorn-x/")),
    ).toBe(true);
    expect(keys.some((k) => k.startsWith("unicorn/"))).toBe(true);
    expect(keys.some((k) => k.startsWith("unicorn-x/"))).toBe(true);
  });

  it("throws when the named config is absent", () => {
    expect(() =>
      rulesFromConfig({ ...unicornOptions, config: "does-not-exist" }),
    ).toThrow(/does-not-exist/);
  });
});

// Smoke test against oxlint's shipped schema. The unported case uses a name
// oxlint will never ship, so a later port cannot turn correct routing red.
describe("rulesFromNames (real oxlint schema)", () => {
  it("keys ported rules natively and unported ones under the jsPlugin", () => {
    const native = "rules-of-hooks";
    const unported = "not-a-rule-oxlint-will-ever-ship";
    expect(oxlintNativeRuleNames().has(`react/${native}`)).toBe(true);
    expect(oxlintNativeRuleNames().has(`react/${unported}`)).toBe(false);

    expect(
      rulesFromNames({
        nativePrefix: "react",
        jsPrefix: "react-hooks-js",
        rules: { [native]: "error", [unported]: "warn" },
      }),
    ).toEqual({
      [`react/${native}`]: "error",
      [`react-hooks-js/${unported}`]: "warn",
    });
  });
});
