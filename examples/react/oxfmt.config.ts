import { defineOxfmt } from "@callumhoward/config-base/oxfmt";
import { tailwindOxfmt } from "@callumhoward/config-tailwind/oxfmt";

export default defineOxfmt(tailwindOxfmt({ stylesheet: "src/styles.css" }));
