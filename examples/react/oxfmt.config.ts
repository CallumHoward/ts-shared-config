import { defineOxfmt } from "@wcmj/config-base/oxfmt";
import { tailwindOxfmt } from "@wcmj/config-tailwind/oxfmt";

export default defineOxfmt(tailwindOxfmt({ stylesheet: "src/styles.css" }));
