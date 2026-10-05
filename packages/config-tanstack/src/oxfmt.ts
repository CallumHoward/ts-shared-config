import type { OxfmtAddon } from "@wcmj/config-base/oxfmt";

/** Ignore the generated route tree. */
export const tanstackOxfmt: OxfmtAddon = {
  ignorePatterns: ["src/routeTree.gen.ts"],
};

export default tanstackOxfmt;
