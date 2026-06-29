import { defineViteConfig } from "@callumhoward/config-base/vite";
import react from "@callumhoward/config-react/vite";
import tanstack from "@callumhoward/config-tanstack/vite";

export default defineViteConfig({ addons: [tanstack, react] });
