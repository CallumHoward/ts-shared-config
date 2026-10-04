import { defineOxlint } from "@callumhoward/config-base/oxlint";
import { playwright } from "@callumhoward/config-playwright/oxlint";

// Lints itself with its own add-on so CI proves oxlint resolves the bundled
// jsPlugin; the package's src is Node tooling, hence the node env.
export default defineOxlint(playwright, { env: { node: true } });
