import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

function ignoreDependencies(pkg: string): string[] {
  const path = new URL(`../../${pkg}/fallow.json`, import.meta.url);
  const json = readFileSync(path, "utf8").replaceAll(/^\s*\/\/.*$/gm, "");
  return (JSON.parse(json) as { ignoreDependencies: string[] })
    .ignoreDependencies;
}

// fallow merges `extends` per key with the last file winning, so each preset
// must repeat everything the one before it ignores.
describe("fallow presets", () => {
  it("carry the previous preset's ignoreDependencies forward", () => {
    const base = ignoreDependencies("config-base");
    const react = ignoreDependencies("config-react");
    const tailwind = ignoreDependencies("config-tailwind");
    expect(react).toEqual(expect.arrayContaining(base));
    expect(tailwind).toEqual(expect.arrayContaining(react));
  });
});
