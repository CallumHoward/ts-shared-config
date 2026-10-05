import { defineViteConfig } from "@callumhoward/config-react/vite";
import tanstack from "@callumhoward/config-tanstack/vite";

export default defineViteConfig({ addons: [tanstack] });
