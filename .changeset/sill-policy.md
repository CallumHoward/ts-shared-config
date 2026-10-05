---
"@wcmj/config-base": minor
"@wcmj/config-gha": minor
"@wcmj/config-react": minor
"@wcmj/config-tanstack": minor
"@wcmj/config-tailwind": minor
"@wcmj/config-playwright": minor
---

Validate `pnpm-workspace.yaml` against the supply-chain policy with `@wcmj/sill` instead of `check-jsonschema`, so CI no longer needs Python for it. `config-base` ships `schema/sill-policy.jsonc` and takes `@wcmj/sill` as a peer dependency. The reusable CI workflow gains a `check-schemas` input.
