---
"@wcmj/config-base": patch
"@wcmj/config-react": patch
"@wcmj/config-tailwind": patch
---

Remove settings and claims inherited from a private project: the `^@/` import ban, the `assertNoFailures` assertion option, `storybook-static` ignores, the `json` coverage reporter and stories coverage exclude, and Tailwind's `@screen`/`@responsive` stylelint allowances. Comments and docs now describe only what this repo does.
