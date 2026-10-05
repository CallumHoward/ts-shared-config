import { defineOxlint } from "@callumhoward/config-react/oxlint";
import { tanstackQuery, tanstackRouter } from "@callumhoward/config-tanstack/oxlint";

export default defineOxlint(tanstackRouter, tanstackQuery);
