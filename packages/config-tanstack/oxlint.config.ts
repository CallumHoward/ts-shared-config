import { defineOxlint } from "@wcmj/config-base/oxlint";
import {
  tanstackQuery,
  tanstackRouter,
} from "@wcmj/config-tanstack/oxlint";

// Lints itself with its own layers so CI proves oxlint can load the bundled
// jsPlugins; its src is Node tooling, hence the base preset rather than react.
export default defineOxlint(tanstackRouter, tanstackQuery, {
  env: { node: true },
});
