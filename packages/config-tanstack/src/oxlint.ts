import {
  bundledPlugins,
  type OxlintAddon,
} from "@callumhoward/config-base/oxlint";
import { rulesFromConfig } from "@callumhoward/config-base/rules-from-config";
import queryPlugin from "@tanstack/eslint-plugin-query";
import routerPlugin from "@tanstack/eslint-plugin-router";

const plugin = bundledPlugins(import.meta.url);

/**
 * TanStack Router add-on: the recommended router rules plus the file-based
 * routing conventions (generated route tree ignored, `src/routes/**` naming and
 * `Route` export allowed). Stacks on `config-react`, whose `react` plugin the
 * routes override tunes.
 */
export const tanstackRouter: OxlintAddon = {
  jsPlugins: [plugin("tanstack-router", "@tanstack/eslint-plugin-router")],
  rules: {
    // Oxlint ports no router rules, so every rule lands on the jsPlugin.
    ...rulesFromConfig({
      plugin: routerPlugin,
      sourcePrefix: "@tanstack/router",
      nativePrefix: "tanstack-router",
      jsPrefix: "tanstack-router",
      config: "recommended",
    }),
    // `throw redirect(...)` is the router's documented control flow;
    // redirect() returns a Redirect (a Response), not an Error.
    "typescript/only-throw-error": [
      "error",
      {
        allow: [
          {
            from: "package",
            name: "Redirect",
            package: "@tanstack/router-core",
          },
        ],
      },
    ],
  },
  ignorePatterns: ["src/routeTree.gen.ts"],
  overrides: [
    {
      files: ["src/routes/**/*.{ts,tsx}"],
      rules: {
        // Route file names encode the route tree (`$postId`, `_layout`,
        // `__root`, dotted nesting), so case and middle-extension checks misfire.
        "unicorn/filename-case": "off",
        "check-file/filename-naming-convention": "off",
        // Route files export `Route` beside a local component by design, and
        // allowExportNames does not cover the local component.
        "react/only-export-components": "off",
      },
    },
  ],
};

/** TanStack Query add-on: the plugin's recommended query rules. */
export const tanstackQuery: OxlintAddon = {
  jsPlugins: [plugin("tanstack-query", "@tanstack/eslint-plugin-query")],
  rules: {
    ...rulesFromConfig({
      plugin: queryPlugin,
      sourcePrefix: "@tanstack/query",
      nativePrefix: "tanstack-query",
      jsPrefix: "tanstack-query",
      config: "recommended",
    }),
  },
};
