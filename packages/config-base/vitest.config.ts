// Self-reference: consume our own built preset exactly as consumers do (the
// exports map resolves it), so test:cov emits the repo-relative lcov that
// the root coverage merge expects.
import { defineViteConfig } from "@wcmj/config-base/vite";

export default defineViteConfig();
