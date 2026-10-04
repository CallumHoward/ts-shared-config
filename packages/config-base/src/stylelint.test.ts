import stylelint from "stylelint";
import type { Config } from "stylelint";
import { afterEach, describe, expect, it, vi } from "vitest";

import base, { MESSAGES, defineStylelint } from "./stylelint.ts";

/** Lint a CSS string through the composed preset and return its warnings. */
async function lintWarnings(
  code: string,
): Promise<{ line: number; rule: string; text: string }[]> {
  const result = await stylelint.lint({ code, config: defineStylelint() });
  return result.results.flatMap((r) =>
    r.warnings.map((w) => ({ line: w.line, rule: w.rule, text: w.text })),
  );
}

/**
 * Re-resolve the preset under a chosen GITHUB_ACTIONS value. The module reads
 * it once at import, and the ambient value differs between CI and a local run.
 */
async function presetForEnvironment(githubActions?: string): Promise<Config> {
  vi.stubEnv("GITHUB_ACTIONS", githubActions);
  vi.resetModules();
  const reimported = await import("./stylelint.ts");
  return reimported.defineStylelint();
}

/** Lint a CSS string through the composed preset and return rule ids. */
async function lintRules(code: string): Promise<string[]> {
  const warnings = await lintWarnings(code);
  return warnings.map((w) => w.rule);
}

describe("property-disallowed-list message", () => {
  const [, options] = base.rules["property-disallowed-list"];
  if (options === undefined || Array.isArray(options)) {
    throw new TypeError("expected secondary options with a message function");
  }

  it("branches between the forced-colors and shorthand bans", () => {
    expect(options.message("forced-color-adjust")).toBe(
      MESSAGES.FORCED_COLOR_ADJUST,
    );
    expect(options.message("font")).toBe(MESSAGES.FONT_GRID_SHORTHAND);
    expect(options.message("grid")).toBe(MESSAGES.FONT_GRID_SHORTHAND);
  });

  it("bans the font and grid shorthands but not their longhands", async () => {
    for (const code of [
      ".x-a { font: inherit; }",
      ".x-a { grid: auto-flow / 1fr; }",
    ]) {
      expect(await lintRules(code)).toContain("property-disallowed-list");
    }
    for (const code of [
      ".x-a { font-size: var(--font-size-body); }",
      ".x-a { grid-template-columns: 1fr; }",
    ]) {
      expect(await lintRules(code)).not.toContain("property-disallowed-list");
    }
  });
});

describe("declaration-property-value-disallowed-list message", () => {
  const [, options] = base.rules["declaration-property-value-disallowed-list"];
  const message = options?.message;
  if (typeof message !== "function") {
    throw new TypeError("expected secondary options with a message function");
  }

  it("branches between the background shorthand and border removal bans", () => {
    expect(message("background")).toMatch(/background-color instead/);
    expect(message("border")).toBe(MESSAGES.BORDER_REMOVAL);
    expect(message("border-inline-end-width")).toBe(MESSAGES.BORDER_REMOVAL);
  });
});

describe("defineStylelint", () => {
  it("returns the base config when called with no addons", () => {
    const config = defineStylelint();
    expect(config.rules).toEqual(base.rules);
    expect(config.extends).toEqual(base.extends);
  });

  it("concatenates array fields and last-wins-merges rules", () => {
    const config = defineStylelint(
      { ignoreFiles: ["**/a/**"], rules: { "color-named": null } },
      { rules: { "color-named": true, "selector-max-id": null } },
    );
    expect(config.ignoreFiles).toEqual([...base.ignoreFiles, "**/a/**"]);
    // Later addon wins over earlier; untouched base rules survive.
    expect(config.rules?.["color-named"]).toBe(true);
    expect(config.rules?.["selector-max-id"]).toBeNull();
    expect(config.rules?.["declaration-no-important"]).toEqual(
      base.rules["declaration-no-important"],
    );
  });

  it("replaces rule options wholesale rather than deep-merging", () => {
    const config = defineStylelint({
      rules: { "property-disallowed-list": [["forced-color-adjust"], {}] },
    });
    expect(config.rules?.["property-disallowed-list"]).toEqual([
      ["forced-color-adjust"],
      {},
    ]);
  });
});

describe("composed preset policy", () => {
  it("makes compound class selectors unwritable in both spellings", async () => {
    // use-nesting forces the flat compound inside .x-a, where the nested
    // pattern rule rejects it: jointly unwritable, per the config comment.
    expect(
      await lintRules(
        ".x-a {\n  margin: 0;\n}\n\n.x-a.x-b {\n  padding: 0;\n}",
      ),
    ).toContain("csstools/use-nesting");
    expect(
      await lintRules(".x-a {\n  &.x-b {\n    margin: 0;\n  }\n}"),
    ).toContain("selector-nested-pattern");
  });

  it("bans !important but honors a justified inline disable", async () => {
    expect(await lintRules(".x-a { margin: 0 !important; }")).toContain(
      "declaration-no-important",
    );
    expect(
      await lintRules(
        ".x-a {\n  /* stylelint-disable-next-line declaration-no-important -- essential motion */\n  margin: 0 !important;\n}",
      ),
    ).toEqual([]);
  });

  it("suppresses use-baseline inside a matching @supports guard only", async () => {
    // Bare non-baseline property flags; the same declaration inside a guard
    // for that exact feature does not; an unrelated guard gives no cover.
    // Also pins the unnecessary-guard check for already-baseline features.
    expect(await lintRules(".x-a {\n  field-sizing: content;\n}")).toContain(
      "plugin/use-baseline",
    );
    expect(
      await lintRules(
        "@supports (field-sizing: content) {\n  .x-a {\n    field-sizing: content;\n  }\n}",
      ),
    ).toEqual([]);
    expect(
      await lintRules(
        "@supports (anchor-name: --x) {\n  .x-a {\n    field-sizing: content;\n  }\n}",
      ),
    ).toContain("plugin/use-baseline");
    expect(
      await lintRules(
        "@supports (display: grid) {\n  .x-a {\n    margin: 0;\n  }\n}",
      ),
    ).toContain("plugin/use-baseline");
  });

  it("flags border removal with the forced-colors restore message", async () => {
    const warnings = await lintWarnings(".x-a { border: none; }");
    const warning = warnings.find(
      (w) => w.rule === "declaration-property-value-disallowed-list",
    );
    expect(warning?.text).toMatch(/forced-colors \(WHCM\)/);
    expect(warning?.text).toMatch(/@media \(forced-colors: active\)/);
    const removals = [
      ".x-a { border: 0; }",
      ".x-a { border-style: none; }",
      ".x-a { border-width: 0; }",
      ".x-a { border-inline-end: none; }",
      ".x-a { border-block-start-width: 0; }",
    ];
    for (const code of removals) {
      expect(await lintRules(code)).toContain(
        "declaration-property-value-disallowed-list",
      );
    }
  });

  it("keeps real borders, partial edge zeroing, and zero radius legal", async () => {
    const legal = [
      ".x-a { border: 1px solid transparent; }",
      // The reset's hr pattern: some edges zeroed, one real edge kept.
      ".x-a { border-width: 1px 0 0; }",
      ".x-a { border-radius: 0; }",
    ];
    for (const code of legal) {
      expect(await lintRules(code)).toEqual([]);
    }
  });

  it("preserves the background ban in the shared slot and honors a justified border disable", async () => {
    const warnings = await lintWarnings(".x-a { background: transparent; }");
    const background = warnings.find(
      (w) => w.rule === "declaration-property-value-disallowed-list",
    );
    expect(background?.text).toMatch(/background-color instead/);
    expect(
      await lintRules(
        ".x-a {\n  /* stylelint-disable-next-line declaration-property-value-disallowed-list -- decorative divider on a non-interactive edge */\n  border-block-start: none;\n}",
      ),
    ).toEqual([]);
  });
});

/** Warnings from the boolean data-attribute selector ban. */
async function disallowed(code: string) {
  const warnings = await lintWarnings(code);
  return warnings.filter((w) => w.rule === "selector-disallowed-list");
}

describe("boolean data attributes", () => {
  it.each([
    '.x-a {\n  &[data-truncate="true"] {\n    margin: 0;\n  }\n}',
    ".x-a[data-open='false'] {\n  margin: 0;\n}",
    '.x-a[data-open="TRUE" i] {\n  margin: 0;\n}',
    '.x-a[ data-open = "true" ] {\n  margin: 0;\n}',
  ])("rejects a boolean value match: %s", async (code) => {
    const [warning] = await disallowed(code);
    expect(warning?.text).toBe(
      `${MESSAGES.BOOLEAN_DATA_ATTRIBUTE} (selector-disallowed-list)`,
    );
  });

  it("reports only the offending member of a selector list", async () => {
    const warnings = await disallowed(
      '.x-a,\n.x-b[data-open="true" i] {\n  margin: 0;\n}',
    );
    expect(warnings.map((w) => w.line)).toEqual([2]);
  });

  it("allows presence, enumerated values, and aria values", async () => {
    expect(
      await disallowed(
        '.x-a[data-line-clamp],\n.x-a[data-variant="primary"],\n.x-a[aria-expanded="true"] {\n  margin: 0;\n}',
      ),
    ).toEqual([]);
  });
});

describe("GitHub annotation formatter", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should stay off outside GitHub Actions so local runs read as prose", async () => {
    const preset = await presetForEnvironment();
    expect(preset.formatter).toBeUndefined();
  });

  it("should report problems as workflow commands under GitHub Actions", async () => {
    const result = await stylelint.lint({
      code: "a { color: red !important; }",
      config: await presetForEnvironment("true"),
    });
    expect(result.report).toMatch(
      /^::error file=.+,line=1,col=\d+,.*\(declaration-no-important\)/m,
    );
  });
});
