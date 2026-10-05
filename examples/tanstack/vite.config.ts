import { defineViteConfig } from "@wcmj/config-react/vite";
import tanstack from "@wcmj/config-tanstack/vite";

export default defineViteConfig({ addons: [tanstack] });
