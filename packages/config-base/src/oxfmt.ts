import type { OxfmtConfig } from "oxfmt";

import { buildOutputDirectories } from "./build-output.ts";

/** The slice of an oxfmt config an add-on package contributes. */
export type OxfmtAddon = Partial<OxfmtConfig>;

/** Vanilla-TS base: format JSDoc comment blocks and sort imports. */
export const base = {
  jsdoc: true,
  sortImports: true,
  ignorePatterns: [...buildOutputDirectories, "node_modules", "pnpm-lock.yaml"],
} satisfies OxfmtConfig;

/** Compose the base oxfmt config with any number of add-on contributions. */
export function defineOxfmt(...addons: OxfmtAddon[]): OxfmtConfig {
  const ignorePatterns = [...base.ignorePatterns];
  let merged: OxfmtConfig = { ...base };
  for (const addon of addons) {
    const { ignorePatterns: addonIgnores, ...rest } = addon;
    merged = { ...merged, ...rest };
    if (addonIgnores) ignorePatterns.push(...addonIgnores);
  }
  return { ...merged, ignorePatterns };
}

export default base;
