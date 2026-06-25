import tailwindcss from "@tailwindcss/vite";

import type { ViteAddon } from "@callumhoward/config-base/vite";

/** Tailwind v4 vite plugin, ordered before framework plugins (matches the starter). */
export const tailwindVite: ViteAddon = {
  order: 0,
  plugins: () => [tailwindcss()],
};

export default tailwindVite;
