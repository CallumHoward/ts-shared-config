import { defineViteConfig } from "@callumhoward/config-base/vite";
import react from "@callumhoward/config-react/vite";
import tailwind from "@callumhoward/config-tailwind/vite";

export default defineViteConfig({ addons: [tailwind, react] });
