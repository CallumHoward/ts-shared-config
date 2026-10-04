// The base (node-env) preset, not our own react preset: these are node unit
// tests of the config sources, not component tests needing jsdom.
import { defineViteConfig } from "@callumhoward/config-base/vite";

export default defineViteConfig();
