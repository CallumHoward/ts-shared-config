import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("has a title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/./);
  });
});
