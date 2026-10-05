---
"@wcmj/config-base": patch
"@wcmj/config-react": patch
"@wcmj/config-tanstack": patch
"@wcmj/config-tailwind": patch
"@wcmj/config-playwright": patch
"@wcmj/config-gha": patch
---

Turn off every type-aware typescript-eslint rule that oxlint routes to the jsPlugin, fixing a lint crash on oxlint versions that don't port `no-generated-empty-object-type` natively. `offWhenPresent` is replaced by `offWhenTypeAware`.
