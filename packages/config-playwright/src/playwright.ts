import process from "node:process";

import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

export interface PlaywrightOptions {
  /** Base URL the tests and webServer use. Default "http://localhost:3000". */
  baseURL?: string;
  /** Directory holding the e2e specs. Default "./e2e". */
  testDir?: string;
  /** Local dev server command. Default "pnpm dev". */
  devCommand?: string;
  /** CI server command (built preview). Default "pnpm serve". */
  ciCommand?: string;
}

/**
 * Opinionated Playwright config: chromium, parallel, trace on first retry, and a
 * webServer that targets the dev server locally / the built preview in CI.
 */
export function definePlaywright(options: PlaywrightOptions = {}): PlaywrightTestConfig {
  const {
    baseURL = "http://localhost:3000",
    testDir = "./e2e",
    devCommand = "pnpm dev",
    ciCommand = "pnpm serve",
  } = options;
  const isCI = Boolean(process.env.CI);

  return defineConfig({
    testDir,
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 1 : 0,
    reporter: isCI ? [["list"], ["html", { open: "never" }]] : "list",
    use: {
      baseURL,
      trace: "on-first-retry",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
      command: isCI ? ciCommand : devCommand,
      url: baseURL,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  });
}

export default definePlaywright;
