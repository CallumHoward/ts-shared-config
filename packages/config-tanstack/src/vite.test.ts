import { defineViteConfig } from "@callumhoward/config-base/vite";
import { describe, expect, it } from "vitest";

import { tanstackRouterVite } from "./vite.ts";

const environment = { command: "build", mode: "production" } as const;

/** Flatten a resolved plugin list to its names. */
function pluginNames(plugins: unknown): string[] {
  return (plugins as Array<{ name?: string } | Array<{ name?: string }>>)
    .flat()
    .map((plugin) => plugin.name ?? "");
}

describe("tanstackRouterVite", () => {
  it("should contribute the router plugin", () => {
    const config = defineViteConfig({ addons: [tanstackRouterVite()] })(
      environment,
    );
    expect(
      pluginNames(config.plugins).some((name) =>
        name.startsWith("tanstack-router"),
      ),
    ).toBe(true);
  });

  it("should run before a JSX transform ordered like config-react's", () => {
    // The router plugin refuses to start when it follows the JSX transform.
    const jsx = { order: 10, plugins: () => [{ name: "jsx" }] };
    const config = defineViteConfig({
      addons: [jsx, tanstackRouterVite()],
    })(environment);
    const names = pluginNames(config.plugins);
    expect(names.indexOf("jsx")).toBeGreaterThan(
      names.findIndex((name) => name.startsWith("tanstack-router")),
    );
  });
});
