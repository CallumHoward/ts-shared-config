import type { OxfmtAddon } from "@callumhoward/config-base/oxfmt";

/** Ignore the generated route tree. */
export const tanstackOxfmt: OxfmtAddon = {
  ignorePatterns: ["src/routeTree.gen.ts"],
};

export default tanstackOxfmt;
