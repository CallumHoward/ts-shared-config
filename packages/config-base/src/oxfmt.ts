import type { OxfmtConfig } from "oxfmt";

/** The slice of an oxfmt config an add-on package contributes. */
export type OxfmtAddon = Partial<OxfmtConfig>;

/**
 * Vanilla-TS base: format JSDoc comment blocks and sort imports. Tailwind class
 * sorting (`sortTailwindcss`) is layered by the tailwind add-on.
 */
export const base = {
  jsdoc: true,
  sortImports: true,
  ignorePatterns: ["dist", ".output", "node_modules", "pnpm-lock.yaml"],
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
