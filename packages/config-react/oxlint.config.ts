import { defineOxlint } from "@wcmj/config-react/oxlint";

// config-react lints itself with its own preset (Node env; its src is tooling).
export default defineOxlint({ env: { node: true } });
