import { defineOxlint, E2E_FILES } from "@wcmj/config-base/oxlint";
import { lintFixturesByFile } from "@wcmj/config-utilities/oxlint-fixtures";
import { beforeAll, describe, expect, it } from "vitest";

import { playwright } from "./oxlint.ts";

const validSuite = `import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("renders the heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("x");
  });
});
`;

const focusedSuite = validSuite.replace("  test(", "  test.only(");

describe("playwright add-on scoping", () => {
  it("should carry no rules outside the e2e override", () => {
    expect(playwright.rules).toBeUndefined();
    expect(playwright.overrides).toHaveLength(1);
  });

  it("should reuse the e2e glob base carves out of its vitest override", () => {
    expect(playwright.overrides?.[0]?.files).toEqual(E2E_FILES);
  });

  it("should enable the recommended rules alongside the vitest mirrors", () => {
    const rules = playwright.overrides?.[0]?.rules ?? {};
    expect(rules["playwright/no-focused-test"]).toBe("error");
    expect(rules["playwright/prefer-web-first-assertions"]).toBe("error");
    expect(rules["playwright/require-top-level-describe"]).toBe("error");
    expect(rules["playwright/max-nested-describe"]).toEqual([
      "error",
      { max: 1 },
    ]);
    expect(rules["playwright/no-commented-out-tests"]).toBe("warn");
  });

  it("should turn off no-empty-pattern for fixture destructuring", () => {
    expect(playwright.overrides?.[0]?.rules?.["no-empty-pattern"]).toBe("off");
  });
});

describe("playwright add-on under oxlint", () => {
  // One oxlint run for both specs: loading the base jsPlugins dominates.
  let codes: Record<string, string[]>;
  beforeAll(() => {
    codes = lintFixturesByFile(defineOxlint(playwright), {
      "e2e/focused.spec.ts": focusedSuite,
      "e2e/valid.spec.ts": validSuite,
      "e2e/home.test.ts": validSuite,
      "e2e/helpers.ts": "export const base = 1;\n",
    });
  });

  it("should report a focused test in an e2e spec", () => {
    expect(codes["e2e/focused.spec.ts"]).toContain(
      "playwright/no-focused-test",
    );
  });

  it("should report nothing for a valid playwright suite", () => {
    expect(codes["e2e/valid.spec.ts"]).toEqual([]);
  });

  it("should require the spec middle extension on e2e suites", () => {
    expect(codes["e2e/home.test.ts"]).toContain(
      "check-file/filename-naming-convention",
    );
  });

  it("should allow plain helper modules in e2e", () => {
    expect(codes["e2e/helpers.ts"]).toEqual([]);
  });
});
