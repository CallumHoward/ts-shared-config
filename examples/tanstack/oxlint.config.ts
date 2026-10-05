import { defineOxlint } from "@wcmj/config-react/oxlint";
import { tanstackQuery, tanstackRouter } from "@wcmj/config-tanstack/oxlint";

export default defineOxlint(tanstackRouter, tanstackQuery);
