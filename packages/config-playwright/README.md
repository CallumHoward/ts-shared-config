# @callumhoward/config-playwright

Playwright add-on for [ts-shared-config](https://github.com/CallumHoward/ts-shared-config):
an opinionated `definePlaywright` config and an `e2e/**` oxlint override
(playwright ruleset + `*.spec` filename convention).

```sh
pnpm add -D @callumhoward/config-base @callumhoward/config-playwright @playwright/test
```

```ts
// playwright.config.ts
import { definePlaywright } from "@callumhoward/config-playwright/playwright";
export default definePlaywright();

// oxlint.config.ts
import { defineOxlint } from "@callumhoward/config-base/oxlint";
import playwright from "@callumhoward/config-playwright/oxlint";
export default defineOxlint(playwright);
```

`definePlaywright` accepts `{ baseURL, testDir, devCommand, ciCommand }`.
