import { defineViteConfig } from "@wcmj/config-react/vite";
import tailwind from "@wcmj/config-tailwind/vite";

export default defineViteConfig({ addons: [tailwind] });
