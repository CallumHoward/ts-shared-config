import { defineOxlint } from "@callumhoward/config-base/oxlint";
import react from "@callumhoward/config-react/oxlint";
import tanstack from "@callumhoward/config-tanstack/oxlint";

export default defineOxlint(react, tanstack);
