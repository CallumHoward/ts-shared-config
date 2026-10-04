import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
import { configureAxe } from "vitest-axe";
import * as matchers from "vitest-axe/matchers";

import { axeChecks, axeRules } from "./axe-config.ts";

declare module "vitest" {
  // Type parameters must mirror vitest's own Matchers declaration exactly, or
  // the merge fails; T is unused here.
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > {
    toHaveNoViolations(): R;
  }
}

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

export const axe: ReturnType<typeof configureAxe> = configureAxe({
  globalOptions: { checks: axeChecks },
  rules: axeRules,
});
