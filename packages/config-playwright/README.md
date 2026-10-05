# @wcmj/config-playwright

Playwright add-on for [ts-shared-config](https://github.com/CallumHoward/ts-shared-config):
an opinionated `definePlaywright` config and an `e2e/**` oxlint override
(playwright ruleset + `*.spec` filename convention).

```sh
pnpm add -D @wcmj/config-base @wcmj/config-playwright @playwright/test
```

```ts
// playwright.config.ts
import { definePlaywright } from "@wcmj/config-playwright/playwright";
export default definePlaywright();

// oxlint.config.ts
import { defineOxlint } from "@wcmj/config-base/oxlint";
import playwright from "@wcmj/config-playwright/oxlint";
export default defineOxlint(playwright);
```

The oxlint add-on scopes the plugin's recommended rules to `e2e/**`, which the
base vitest rules and `vitest` itself exclude.

`definePlaywright` accepts `{ baseURL, testDir, devCommand, ciCommand }`.
