import { mkdtempSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { createServer, type Plugin } from "vite";
import { describe, expect, it } from "vitest";

import { defineViteConfig, type ReactViteOptions } from "./vite.ts";

const COMPONENT = [
  "export function Greeting({ name }: { name: string }) {",
  "  return <div>{name.trim()}</div>;",
  "}",
].join("\n");

/**
 * The fixture sits outside any node_modules, so the runtimes the transform
 * imports resolve to empty modules rather than the real react.
 */
const stubReactRuntimes: Plugin = {
  name: "stub-react-runtimes",
  enforce: "pre",
  resolveId: (id) => (id.startsWith("react/") ? `\0${id}` : undefined),
  load: (id) => (id.startsWith("\0react/") ? "export const c = 0;" : undefined),
};

/** Run a component through a real vite pipeline built from the preset. */
async function transformComponent(options?: ReactViteOptions): Promise<string> {
  // realpath: macOS hands out /var/folders/... for a /private/var real path,
  // and vite resolves against the real one, so the fixture goes unfound.
  const root = realpathSync(
    mkdtempSync(path.join(tmpdir(), "react-vite-")),
  );
  writeFileSync(path.join(root, "Greeting.tsx"), COMPONENT);
  const preset = defineViteConfig(options)({ command: "serve", mode: "test" });
  const server = await createServer({
    root,
    configFile: false,
    logLevel: "silent",
    optimizeDeps: { noDiscovery: true },
    plugins: [stubReactRuntimes, ...(preset.plugins ?? [])],
  });
  try {
    const result = await server.transformRequest("/Greeting.tsx");
    return result?.code ?? "";
  } finally {
    await server.close();
  }
}

// Nothing in the config shape says whether the compiler ran, so a silent
// no-op would ship unmemoized components with every check green.
describe("react compiler", () => {
  it("memoizes a component", async () => {
    expect(await transformComponent()).toContain("react/compiler-runtime");
  });

  it("leaves a component alone when opted out", async () => {
    expect(await transformComponent({ reactCompiler: false })).not.toContain(
      "react/compiler-runtime",
    );
  });
});

function pluginNames(plugins: unknown): string[] {
  return (plugins as Array<{ name?: string } | Array<{ name?: string }>>)
    .flat()
    .map((plugin) => plugin.name ?? "");
}

describe("addons", () => {
  it("layer around the react add-on by order", () => {
    const config = defineViteConfig({
      addons: [
        { order: 20, plugins: () => [{ name: "after" }] },
        { order: 0, plugins: () => [{ name: "before" }] },
      ],
    })({ command: "serve", mode: "test" });
    const names = pluginNames(config.plugins);
    const react = names.findIndex((name) => name.startsWith("vite:react"));
    expect(names.indexOf("before")).toBeLessThan(react);
    expect(names.indexOf("after")).toBeGreaterThan(react);
  });
});
