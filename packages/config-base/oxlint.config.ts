import { defineOxlint } from "@callumhoward/config-base/oxlint";

// config-base lints itself with its own preset (Node env; its src is tooling).
export default defineOxlint({ env: { node: true } });
