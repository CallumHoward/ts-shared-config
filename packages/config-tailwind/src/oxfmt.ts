import type { OxfmtAddon } from "@callumhoward/config-base/oxfmt";

export interface TailwindOxfmtOptions {
  /** Stylesheet whose `@theme` drives Tailwind class sort order. Default "src/styles.css". */
  stylesheet?: string;
}

/** Enable oxfmt's Tailwind class sorting against your stylesheet. */
export function tailwindOxfmt(options: TailwindOxfmtOptions = {}): OxfmtAddon {
  const { stylesheet = "src/styles.css" } = options;
  return { sortTailwindcss: { stylesheet } };
}

export default tailwindOxfmt();
