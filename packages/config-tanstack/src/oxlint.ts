import { createRequire } from "node:module";

import type { OxlintAddon } from "@callumhoward/config-base/oxlint";

const require = createRequire(import.meta.url);

const plugin = (name: string, spec: string) => ({ name, specifier: require.resolve(spec) });

/**
 * TanStack add-on (assumes the react add-on): the router lint plugin plus a
 * `src/routes/**` override that enforces route-property order / param names and
 * relaxes the filename + only-export-components rules that file-based routes
 * intentionally break. The generated route tree is ignored.
 */
export const tanstack: OxlintAddon = {
  jsPlugins: [plugin("router", "@tanstack/eslint-plugin-router")],
  ignorePatterns: ["src/routeTree.gen.ts"],
  overrides: [
    {
      files: ["src/routes/**/*.{ts,tsx}"],
      rules: {
        "react/only-export-components": "off",
        "router/create-route-property-order": "error",
        "router/route-param-names": "error",
        "unicorn/filename-case": "off",
        "check-file/filename-naming-convention": "off",
      },
    },
  ],
};

export default tanstack;
