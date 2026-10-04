import { defineViteConfig } from "@callumhoward/config-react/vite";
import tailwind from "@callumhoward/config-tailwind/vite";

export default defineViteConfig({ addons: [tailwind] });
