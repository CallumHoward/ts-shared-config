import { fileURLToPath } from "node:url";

import babel from "@rolldown/plugin-babel";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";

import type { ViteAddon } from "@callumhoward/config-base/vite";

export interface ReactViteOptions {
  /** Enable the React Compiler (via babel) by default. Set false to opt out. */
  reactCompiler?: boolean;
}

/**
 * React add-on for vite: @vitejs/plugin-react plus the React Compiler (on by
 * default), and a jsdom vitest environment wired to the bundled vitest-setup
 * (jest-dom matchers + vitest-axe).
 */
export function reactVite(options: ReactViteOptions = {}): ViteAddon {
  const { reactCompiler = true } = options;
  const setupFile = fileURLToPath(new URL("./vitest-setup.js", import.meta.url));
  return {
    order: 10,
    plugins: () => [
      viteReact(),
      ...(reactCompiler ? [babel({ presets: [reactCompilerPreset()] })] : []),
    ],
    test: {
      environment: "jsdom",
      setupFiles: [setupFile],
    },
  };
}

export default reactVite();
