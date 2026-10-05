import stylelint from "stylelint";
import type { Config } from "stylelint";
import { afterEach, describe, expect, it, vi } from "vitest";

import base, { defineStylelint } from "./stylelint.ts";

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
    const config = defineStylelint(
      { rules: { "color-named": ["never", { ignore: ["inside-function"] }] } },
      { rules: { "color-named": ["never", {}] } },
    );
    expect(config.rules?.["color-named"]).toEqual(["never", {}]);
  });
});

describe("composed preset policy", () => {
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

  it("rejects id selectors and unknown animations", async () => {
    expect(await lintRules("#x-a { margin: 0; }")).toContain("selector-max-id");
    expect(await lintRules(".x-a { animation: nope 1s; }")).toContain(
      "no-unknown-animations",
    );
  });

  it("reports an unused disable instead of ignoring it", async () => {
    expect(
      await lintRules(
        ".x-a {\n  /* stylelint-disable-next-line declaration-no-important -- not needed */\n  margin: 0;\n}",
      ),
    ).toContain("--report-needless-disables");
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
