import { globSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

import { afterEach, describe, expect, it, vi } from "vitest";

import { defineViteConfig } from "./vite.ts";

// The repo root: src -> config-base -> packages -> root.
const repoRoot = path.resolve(import.meta.dirname, "../../..");

interface Manifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  /** Absolute package directory; not part of package.json. */
  dir: string;
  name: string;
  scripts?: Record<string, string>;
}

// Mirrors pnpm-workspace.yaml's package globs. Depth-1 so the walk never
// descends into node_modules.
const manifests: Manifest[] = globSync(
  ["packages/*/package.json", "examples/*/package.json"],
  { cwd: repoRoot },
).map((relative) => {
  const file = path.join(repoRoot, relative);
  return {
    ...(JSON.parse(readFileSync(file, "utf8")) as Omit<Manifest, "dir">),
    dir: path.dirname(file),
  };
});

/** Workspace packages whose own scripts invoke the given command. */
function packagesRunning(command: RegExp): Manifest[] {
  return manifests.filter((manifest) =>
    Object.values(manifest.scripts ?? {}).some((script) =>
      command.test(script),
    ),
  );
}

function undeclared(packages: Manifest[], dependency: string): string[] {
  return packages
    .filter(
      (manifest) =>
        !(
          dependency in
          { ...manifest.dependencies, ...manifest.devDependencies }
        ),
    )
    .map((manifest) => manifest.name);
}

/** Real path of the vitest install that `file` resolves. */
function vitestFrom(file: string): string {
  return realpathSync(createRequire(file).resolve("vitest/package.json"));
}

type ConfigFactory = typeof defineViteConfig;

function reporters(factory: ConfigFactory): unknown[] {
  const config = factory()({ command: "serve", mode: "test" });
  // [] so a missing reporter config fails an assertion, not with a TypeError.
  return (config.test?.coverage?.reporter ?? []) as unknown[];
}

/** Resolve the preset and dig out the lcov reporter's options. */
function lcovOptions(factory: ConfigFactory): { projectRoot: string } {
  const tuple = reporters(factory).find(
    (entry) => Array.isArray(entry) && entry[0] === "lcov",
  ) as ["lcov", { projectRoot: string }] | undefined;
  expect(tuple).toBeDefined();
  return (tuple as ["lcov", { projectRoot: string }])[1];
}

describe("coverage reporters", () => {
  it("includes the json (Istanbul) reporter fallow's CRAP scoring reads", () => {
    // Without coverage-final.json the root merge has nothing to feed fallow,
    // and CRAP silently degrades to static estimates.
    expect(reporters(defineViteConfig)).toContain("json");
  });
});

describe("mock hygiene", () => {
  it("restores mocks and unstubs globals after every test", () => {
    const config = defineViteConfig()({ command: "serve", mode: "test" });
    expect(config.test?.restoreMocks).toBe(true);
    expect(config.test?.unstubGlobals).toBe(true);
  });
});

/** Resolve the preset under a given GITHUB_ACTIONS value. */
async function fsModuleCacheWhen(
  githubActions?: string,
): Promise<boolean | undefined> {
  vi.stubEnv("GITHUB_ACTIONS", githubActions);
  vi.resetModules();
  const reimported = await import("./vite.ts");
  const config = reimported.defineViteConfig()({
    command: "serve",
    mode: "test",
  });
  return config.test?.fsModuleCache;
}

describe("module cache", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("persists transformed modules across local reruns", async () => {
    // Saves the workspace suite ~16% on a warm rerun.
    expect(await fsModuleCacheWhen()).toBe(true);
  });

  it("stays off in CI, where every job installs fresh", async () => {
    // The cache never survives to be read there, so writing it is pure cost.
    expect(await fsModuleCacheWhen("true")).toBe(false);
  });

  it("keeps a cache per package, not one shared by parallel runs", () => {
    const config = defineViteConfig()({ command: "serve", mode: "test" });
    expect(config.test?.fsModuleCachePath).toBe("node_modules/.vitest-cache");
  });
});

describe("coverage lcov projectRoot", () => {
  it("points at the workspace root, so SF: paths are repo-relative", () => {
    // Guards the diff-coverage gate: with package-relative paths, diff-cover
    // finds "no lines with coverage information" and silently passes.
    expect(lcovOptions(defineViteConfig).projectRoot).toBe(repoRoot);
  });

  it("falls back to cwd outside a pnpm workspace", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("/no/workspace/here");
    vi.resetModules();
    const reimported = await import("./vite.ts");
    expect(lcovOptions(reimported.defineViteConfig).projectRoot).toBe(
      "/no/workspace/here",
    );
  });
});

describe("workspace test tooling", () => {
  it("is declared by every package whose scripts invoke vitest", () => {
    // An undeclared vitest resolves via the root manifest, so the gap only
    // shows when a stale .bin shim runs a second copy alongside it.
    expect(
      undeclared(packagesRunning(/\bvitest\b/), "vitest"),
    ).toEqual([]);
  });

  it("resolves one vitest install, the one jest-dom extends", () => {
    // Vitest bundles its own chai, so each install is a separate chai:
    // matchers jest-dom extends on one silently break assertions on another.
    const reactPackage = path.join(repoRoot, "packages/config-react");
    const jestDom = createRequire(
      path.join(reactPackage, "package.json"),
    ).resolve("@testing-library/jest-dom/vitest");
    const installs = new Set([
      vitestFrom(jestDom),
      ...packagesRunning(/\bvitest\b/).map((manifest) =>
        vitestFrom(path.join(manifest.dir, "package.json")),
      ),
    ]);
    expect([...installs]).toHaveLength(1);
  });

  it("pairs every --coverage run with the v8 provider", () => {
    // Same phantom resolution: a package that cannot load the provider
    // contributes no coverage-final.json to the root merge.
    expect(
      undeclared(
        packagesRunning(/vitest\b[^&|]*--coverage/),
        "@vitest/coverage-v8",
      ),
    ).toEqual([]);
  });
});
