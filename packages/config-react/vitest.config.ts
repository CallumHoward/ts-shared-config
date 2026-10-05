// The base (node-env) preset, not our own react preset: these are node unit
// tests of the config sources, not component tests needing jsdom.
import { defineViteConfig } from "@wcmj/config-base/vite";

export default defineViteConfig();
